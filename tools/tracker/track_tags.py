"""Azustock 標籤追蹤管理員 (tags, status_flags & markdown highlights) U1.1.0

互動選單：python track_tags.py
直接查詢：python track_tags.py --query WIP --no-html
查詢位置：python track_tags.py --file 02_mind --kind markdown --no-html
查詢過期：python track_tags.py --category expired --no-html
查詢未設：python track_tags.py --unset --no-html
新增標籤：python track_tags.py --add OC --file my_project --no-html
移除標籤：python track_tags.py --remove WIP --file my_article --no-html
批次替換：python track_tags.py --replace OLD_TAG NEW_TAG --no-html
產生面板：python track_tags.py --scan
開啟面板：python track_tags.py --open
自訂目錄：python track_tags.py --projects ./projects --output ./tools/tracker/reports/tag_dashboard.html
"""

import json
import os
import re
import sys
import urllib.parse
from datetime import datetime
from pathlib import Path


# Preserve direct script execution as well as python -m.
if not __package__:
    import sys as _sys
    from pathlib import Path as _Path
    _sys.path.insert(0, str(_Path(__file__).resolve().parents[2]))
from tools.tracker.tracker_common import (TrackerApp, styled, classify_detail_path, json_field_spans, apply_changes, source_path)

from tools.common.paths import ROOT_DIR
PROJECTS_DIR = str(ROOT_DIR / "projects")
OUTPUT_FILE = str(ROOT_DIR / "tools/tracker/reports/tag_dashboard.html")

from tools.config.site_config import CONFIG, TAG_EXPIRE_DAYS, config_for_projects


def apply_status_config(config):
    global STATUS_GROUPS, STATUS_TAGS, STATUS_FIELD_MAP, EXPIRABLE_TAGS, METADATA_FLAG_TAGS
    STATUS_GROUPS = config['status']['groups']
    STATUS_TAGS = {tag for group in STATUS_GROUPS for tag in group}
    EXPIRABLE_TAGS = set(config['status']['expirable_tags'])
    METADATA_FLAG_TAGS = set(config['status']['metadata_flag_tags'])
    # Keep unsupported legacy fields visible to the tracker for cleanup.
    STATUS_FIELD_MAP = {key: tag for tag in STATUS_TAGS for key in (tag.lower(), f'is_{tag.lower()}')}


apply_status_config(CONFIG)

# Markdown 高光語法正規表達式 (對應 main.js highlightExtension & highlightBlockExtension)
RE_FENCED_CODE = re.compile(r'```[\s\S]*?```|~~~[\s\S]*?~~~')
RE_MD_INLINE_HL = re.compile(r'\+\+\[([^\]]+?)\]([\s\S]*?)\+\+')
RE_MD_BLOCK_HL = re.compile(r'^:::[ \t]*highlight(?:\[([^\]]*?)\])?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*:::', re.IGNORECASE | re.MULTILINE)

results = {}
all_targets = []
scan_info = {}
scanned = False
USE_COLOR = sys.stdout.isatty() and 'NO_COLOR' not in os.environ


def detect_tag_expire_days():
    return config_for_projects(PROJECTS_DIR)["status"]["expire_days"]


def json_array_item_spans(text, val_start, val_end):
    """解析 JSON 陣列欄位內部每個元素的精確索引、行號與欄位 (detail.json:line:col)。"""
    decoder = json.JSONDecoder()
    idx = val_start
    while idx < val_end and text[idx].isspace():
        idx += 1
    if idx >= val_end or text[idx] != '[':
        return []
    idx += 1
    items = []
    while idx < val_end:
        while idx < val_end and text[idx].isspace():
            idx += 1
        if idx >= val_end or text[idx] == ']':
            break
        item_start = idx
        val, idx = decoder.raw_decode(text, idx)
        item_end = idx
        line = text.count('\n', 0, item_start) + 1
        col = item_start - text.rfind('\n', 0, item_start)
        while idx < val_end and text[idx].isspace():
            idx += 1
        comma_idx = None
        if idx < val_end and text[idx] == ',':
            comma_idx = idx
            idx += 1
        items.append({
            'value': val,
            'start': item_start,
            'end': item_end,
            'comma_idx': comma_idx,
            'line': line,
            'column': col,
        })
    return items


def check_date_expired(date_str, expire_days):
    """比照 main.js 計算日期標籤是否已超過 TAG_EXPIRE_DAYS。"""
    try:
        clean = str(date_str).strip().replace('-', '/')
        parts = [int(p) for p in clean.split('/')]
        if len(parts) == 3:
            target_dt = datetime(parts[0], parts[1], parts[2])
            diff_days = (datetime.now() - target_dt).total_seconds() / 86400.0
            return diff_days > expire_days
    except (ValueError, TypeError):
        pass
    return False


def normalize_tag(raw_tag, expire_days=None):
    """分離時效性標籤（如 'NEW: 2026-10-10' -> base_tag='NEW', expire_date='2026-10-10', is_expired）。"""
    if expire_days is None:
        expire_days = detect_tag_expire_days()
    s = str(raw_tag).strip()
    match = re.match(r'^([A-Za-z0-9_-]+):\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})$', s)
    if match:
        candidate = match.group(1).upper()
        if candidate in EXPIRABLE_TAGS:
            date_str = match.group(2)
            return candidate, s, date_str, check_date_expired(date_str, expire_days)
    if s.upper() in STATUS_TAGS:
        return s.upper(), s, None, False
    return s, s, None, False


RE_INLINE_CODE = re.compile(r'(`+)[^\n]*?\1')
RE_HL_PURE_DATE = re.compile(r'^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$')
RE_HL_SUFFIX_DATE = re.compile(r'^(.*?):\s*(\d{4})[-/](\d{1,2})[-/](\d{1,2})$')
RE_HL_HIDE_FLAG = re.compile(r'^EXPIRED?$', re.IGNORECASE)


def mask_fenced_code(md_text):
    """將程式碼區塊與行內程式碼替換為空白（保留換行符號），確保行號與欄位精準且不誤判範例語法。"""
    masked = RE_FENCED_CODE.sub(
        lambda m: ''.join('\n' if ch == '\n' else ' ' for ch in m.group(0)),
        md_text
    )
    return RE_INLINE_CODE.sub(lambda m: ' ' * len(m.group(0)), masked)


def parse_highlight_badge(raw_badge, expire_days=None):
    """解析高光標籤中的文字、日期與 |EXPIRE / |EXPIRED 隱藏旗標，回傳 (tag_key, expire_date, is_expired, hide_on_expire)。"""
    if expire_days is None:
        expire_days = detect_tag_expire_days()
    trimmed = str(raw_badge or '').strip()
    hide_on_expire = False
    kept = []
    for seg in trimmed.split('|'):
        clean = seg.strip()
        if not clean:
            continue
        if RE_HL_HIDE_FLAG.fullmatch(clean):
            hide_on_expire = True
        else:
            kept.append(clean)
    core = '|'.join(kept).strip()
    expire_date = None
    badge = core

    pure_m = RE_HL_PURE_DATE.match(core)
    if pure_m:
        badge = ''
        expire_date = pure_m.group(0)
    else:
        suf_m = RE_HL_SUFFIX_DATE.match(core)
        if suf_m:
            badge = suf_m.group(1).strip()
            expire_date = f'{suf_m.group(2)}-{suf_m.group(3)}-{suf_m.group(4)}'

    is_expired = check_date_expired(expire_date, expire_days) if expire_date else False
    if not badge:
        tag_key = 'HIGHLIGHT'
    else:
        tag_key = badge.upper() if badge.upper() in STATUS_TAGS else badge
    return tag_key, expire_date, is_expired, hide_on_expire


def add_record(tag_name, record_type, detail_path, line_num, column, raw_str,
               context, title, target_id, source_type='tags_array',
               raw_tag_val='', is_expired=False, md_file=None, md_line=None, md_col=None):
    entry = results.setdefault(tag_name, {'projects': [], 'articles': [], 'markdown': []})
    abs_detail = os.path.abspath(detail_path)
    rel_detail = os.path.relpath(abs_detail).replace('\\', '/')
    context = context.strip()

    item = {
        'file': rel_detail,
        'line': line_num,
        'column': column,
        'raw': raw_str,
        'context': context[:240] + ('…' if len(context) > 240 else ''),
        'abs_path': urllib.parse.quote(abs_detail.replace('\\', '/'), safe='/:'),
        'raw_abs': abs_detail,
        'kind': record_type,
        'title': title,
        'target_id': target_id,
        'tag': tag_name,
        'raw_tag': raw_tag_val or tag_name,
        'source_type': source_type,
        'is_status': tag_name.upper() in STATUS_TAGS,
        'is_expired': is_expired,
    }
    if md_file:
        abs_md = os.path.abspath(md_file)
        item['md_file'] = os.path.relpath(abs_md).replace('\\', '/')
        item['md_raw_abs'] = abs_md
        item['md_abs_path'] = urllib.parse.quote(abs_md.replace('\\', '/'), safe='/:')
        item['md_line'] = md_line or 1
        item['md_column'] = md_col or 1

    entry[record_type].append(item)


def scan_markdown_highlights_in_dir(dir_path, detail_path, title, target_id, expire_days=None):
    """掃描該目錄下的 .md 檔案，找出 ++[TAG]文字++ 與 :::highlight[TAG]（含日期與 |EXPIRE 過期判斷）。"""
    found_tags = []
    md_files_scanned = 0
    for md_path in sorted(Path(dir_path).glob('*.md')):
        if not md_path.is_file():
            continue
        md_files_scanned += 1
        try:
            md_text = md_path.read_text(encoding='utf-8-sig')
        except (OSError, UnicodeError):
            continue

        masked = mask_fenced_code(md_text)
        lines = md_text.splitlines()
        rel_md = os.path.relpath(md_path).replace('\\', '/')

        def format_date_note(expire_date, is_exp, hide_on_exp):
            if not expire_date:
                return ''
            if is_exp:
                return f' (時效: {expire_date} · {"已過期·隱藏" if hide_on_exp else "已過期·降級"})'
            return f' (時效: {expire_date} · {"有效·到期隱藏" if hide_on_exp else "有效"})'

        # 1. 行內高光 ++[TAG]文字++
        for m in RE_MD_INLINE_HL.finditer(masked):
            raw_badge = m.group(1).strip()
            if not raw_badge or raw_badge.upper().startswith('KEY:'):
                continue
            tag_key, expire_date, is_exp, hide_on_exp = parse_highlight_badge(raw_badge, expire_days)
            tag_start = m.start(1)
            md_line = md_text.count('\n', 0, tag_start) + 1
            md_col = tag_start - md_text.rfind('\n', 0, tag_start)
            line_text = lines[md_line - 1] if 1 <= md_line <= len(lines) else m.group(0)
            snippet = re.sub(r'\s+', ' ', m.group(2).strip())[:45]
            date_note = format_date_note(expire_date, is_exp, hide_on_exp)
            raw_display = f'[Markdown ++[{raw_badge}]++]{date_note} "{snippet}" · {rel_md}:{md_line}:{md_col}'

            add_record(
                tag_key, 'markdown', detail_path, 1, 1,
                raw_display, line_text, title, target_id,
                source_type='md_inline', raw_tag_val=f'++[{raw_badge}]++',
                is_expired=is_exp, md_file=str(md_path), md_line=md_line, md_col=md_col
            )
            found_tags.append(tag_key)

        # 2. 區塊高光 :::highlight[TAG]
        for m in RE_MD_BLOCK_HL.finditer(masked):
            raw_badge = (m.group(1) or '').strip()
            if raw_badge.upper().startswith('KEY:'):
                continue
            tag_key, expire_date, is_exp, hide_on_exp = parse_highlight_badge(raw_badge, expire_days)
            tag_start = m.start(1) if m.group(1) is not None else m.start(0)
            md_line = md_text.count('\n', 0, tag_start) + 1
            md_col = tag_start - md_text.rfind('\n', 0, tag_start)
            line_text = lines[md_line - 1] if 1 <= md_line <= len(lines) else m.group(0).splitlines()[0]
            snippet = re.sub(r'\s+', ' ', m.group(2).strip())[:45]
            date_note = format_date_note(expire_date, is_exp, hide_on_exp)
            badge_label = f'[{raw_badge}]' if raw_badge else ''
            raw_display = f'[Markdown :::highlight{badge_label}]{date_note} "{snippet}" · {rel_md}:{md_line}:{md_col}'

            add_record(
                tag_key, 'markdown', detail_path, 1, 1,
                raw_display, line_text, title, target_id,
                source_type='md_block', raw_tag_val=f':::highlight{badge_label}',
                is_expired=is_exp, md_file=str(md_path), md_line=md_line, md_col=md_col
            )
            found_tags.append(tag_key)

    return found_tags, md_files_scanned


def collect_tags():
    global results, all_targets, scan_info, scanned
    root_path = Path(PROJECTS_DIR)
    if not root_path.is_dir():
        raise FileNotFoundError('找不到專案目錄：' + os.path.abspath(PROJECTS_DIR))
    results = {}
    all_targets = []
    scanned = False
    total_files, total_md_files, errors = 0, 0, []
    cfg = config_for_projects(PROJECTS_DIR)
    apply_status_config(cfg)
    expire_days = cfg["status"]["expire_days"]
    scan_info = {
        'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'files': 0,
        'md_files': 0,
        'errors': errors,
        'root': os.path.abspath(PROJECTS_DIR),
        'expire_days': expire_days,
        'unset_projects': 0,
        'unset_articles': 0,
    }

    for root, dirs, files in os.walk(PROJECTS_DIR,
                                     onerror=lambda error: errors.append(str(error))):
        dirs.sort()
        for name in sorted(files):
            if name != 'detail.json':
                continue
            path = os.path.join(root, name)
            path_obj = Path(path)
            kind, proj_id, art_id = classify_detail_path(path_obj, root_path)
            if kind == 'category':
                continue
            total_files += 1
            try:
                text = path_obj.read_text(encoding='utf-8-sig')
                data = json.loads(text)
                if not isinstance(data, dict):
                    raise ValueError('detail.json 的頂層必須是物件')
                _, fields = json_field_spans(text)
                field_map = {f['name']: f for f in fields}
                lines = text.splitlines()
                title = str(data.get('title') or (art_id if kind == 'articles' else proj_id))
                target_id = f'{proj_id} / {art_id}' if kind == 'articles' else str(proj_id)

                collected_for_target = []

                # 1. 解析 tags 陣列中的每個獨立標籤與其所在 detail.json 行／欄
                tags_field = field_map.get('tags')
                if tags_field and isinstance(tags_field['value'], list):
                    item_spans = json_array_item_spans(text, tags_field['val_start'], tags_field['val_end'])
                    for item_span in item_spans:
                        raw_val = item_span['value']
                        if raw_val is None or str(raw_val).strip() == '':
                            continue
                        base_tag, raw_tag_str, expire_date, is_exp = normalize_tag(raw_val, expire_days)
                        line_num = item_span['line']
                        col_num = item_span['column']
                        line_text = lines[line_num - 1] if 1 <= line_num <= len(lines) else ''
                        label = 'Project tags[]' if kind == 'projects' else 'Article tags[]'
                        date_note = f' (時效: {expire_date} · {"已過期" if is_exp else "有效"})' if expire_date else ''
                        raw_display = f'[{label}] "{raw_tag_str}"{date_note} · {target_id} ({title})'

                        add_record(
                            base_tag, kind, path, line_num, col_num,
                            raw_display, line_text, title, target_id,
                            source_type='tags_array', raw_tag_val=raw_tag_str,
                            is_expired=is_exp
                        )
                        collected_for_target.append(base_tag)

                # 2. 解析狀態欄位：同時支援 "is_new" 與簡寫 "new": "2026-10-10" / true
                for f in fields:
                    f_name_lower = f['name'].lower()
                    if f_name_lower not in STATUS_FIELD_MAP:
                        continue
                    mapped_tag = STATUS_FIELD_MAP[f_name_lower]
                    b_val = f['value']
                    is_active = False
                    is_exp = False
                    date_note = ''
                    if b_val is True:
                        is_active = True
                    elif isinstance(b_val, str):
                        clean_b = b_val.strip()
                        if clean_b.lower() == 'true':
                            is_active = True
                        elif re.match(r'^\d{4}[-/]\d{1,2}[-/]\d{1,2}$', clean_b):
                            is_active = True
                            is_exp = check_date_expired(clean_b, expire_days)
                            date_note = f' (時效: {clean_b} · {"已過期" if is_exp else "有效"})'

                    if is_active:
                        line_num = f['line']
                        col_num = f['column']
                        line_text = lines[line_num - 1] if 1 <= line_num <= len(lines) else ''
                        label = f'Project "{f["name"]}"' if kind == 'projects' else f'Article "{f["name"]}"'
                        raw_display = (
                            f'[{label}: {json.dumps(b_val, ensure_ascii=False)}]{date_note} '
                            f'→ {mapped_tag} · {target_id} ({title})'
                            + (' [非網站支援的狀態欄位；建議改用 tags[]]' if mapped_tag not in METADATA_FLAG_TAGS else '')
                        )

                        add_record(
                            mapped_tag, kind, path, line_num, col_num,
                            raw_display, line_text, title, target_id,
                            source_type='bool_flag', raw_tag_val=f'{f["name"]}={b_val}',
                            is_expired=is_exp
                        )
                        collected_for_target.append(mapped_tag)

                # 3. 掃描同目錄下 Markdown 檔案中的 ++[TAG]文字++ 與 :::highlight[TAG]
                md_tags, md_cnt = scan_markdown_highlights_in_dir(
                    path_obj.parent, path, title, target_id, expire_days
                )
                total_md_files += md_cnt

                abs_path = os.path.abspath(path)
                rel_norm = os.path.relpath(abs_path).replace('\\', '/')
                all_targets.append({
                    'file': rel_norm,
                    'raw_abs': abs_path,
                    'abs_path': urllib.parse.quote(abs_path.replace('\\', '/'), safe='/:'),
                    'kind': kind,
                    'proj_id': proj_id,
                    'art_id': art_id,
                    'target_id': target_id,
                    'title': title,
                    'tags': collected_for_target,
                    'md_tags': md_tags,
                    'line': tags_field['line'] if tags_field else 1,
                    'column': tags_field['column'] if tags_field else 1,
                })

                if not collected_for_target:
                    if kind == 'projects':
                        scan_info['unset_projects'] += 1
                    else:
                        scan_info['unset_articles'] += 1

            except (OSError, UnicodeError, ValueError) as error:
                errors.append(path + ': ' + str(error))

    scan_info['files'] = total_files
    scan_info['md_files'] = total_md_files
    scanned = True
    return results


def tag_category(tag_name):
    return 'status' if tag_name.upper() in STATUS_TAGS else 'custom'


def tag_sort_key(tag_name):
    entry = results.get(tag_name, {'projects': [], 'articles': [], 'markdown': []})
    total = len(entry['projects']) + len(entry['articles']) + len(entry['markdown'])
    is_status = 0 if tag_name.upper() in STATUS_TAGS else 1
    return (-total, is_status, tag_name.casefold())


def search_records(query='', file_filter='', kind='all', exact=False, category_filter='all'):
    """標籤名稱符合時顯示該標籤全部 detail.json 位置；否則顯示位置／標題／內文符合的紀錄。"""
    query_cf, file_cf = query.casefold(), file_filter.casefold()
    found = {}
    for tag in sorted(results, key=tag_sort_key):
        cat = tag_category(tag)
        if category_filter == 'status' and cat != 'status':
            continue
        if category_filter == 'custom' and cat != 'custom':
            continue
        if category_filter == 'markdown' and not results[tag]['markdown']:
            continue
        tag_match = (tag.casefold() == query_cf) if exact else (query_cf in tag.casefold())
        if exact and not tag_match:
            continue
        matches = {'projects': [], 'articles': [], 'markdown': []}
        for record_type in ('projects', 'articles', 'markdown'):
            if kind != 'all' and record_type != kind:
                continue
            if category_filter == 'markdown' and record_type != 'markdown':
                continue
            for item in results[tag][record_type]:
                if category_filter == 'expired' and not item.get('is_expired'):
                    continue
                if file_cf and not any(file_cf in str(item.get(f, '')).casefold()
                                       for f in ('file', 'raw_abs', 'target_id', 'title', 'md_file')):
                    continue
                if tag_match or any(query_cf in str(item.get(field, '')).casefold()
                                    for field in ('file', 'raw', 'context', 'title', 'target_id', 'raw_tag', 'md_file')):
                    matches[record_type].append(item)
        if matches['projects'] or matches['articles'] or matches['markdown']:
            found[tag] = matches
    return found


def print_query(query='', file_filter='', kind='all', exact=False, summary_only=False, category_filter='all'):
    if not scanned:
        scan_tags(generate_html=False)
    found = search_records(query, file_filter, kind, exact, category_filter)
    print(styled(f'\n查詢結果 · 共 {len(found)} 種標籤', 'bold'))
    if not found:
        print('沒有符合條件的標籤或 detail.json 位置。')
        return found
    for tag, matches in found.items():
        entry = results[tag]
        is_st = tag.upper() in STATUS_TAGS
        type_label = '系統狀態 (STATUS)' if is_st else '自訂標籤 (CUSTOM)'
        type_color = 'cyan' if is_st else 'green'
        exp_count = sum(1 for r in entry['projects'] + entry['articles'] if r.get('is_expired'))
        exp_str = f' · 已過期 {exp_count} 筆' if exp_count else ''
        print(styled(tag, 'yellow') + '  [' + styled(type_label, type_color) + ']  專案 {} / 文章 {} / 內文高光 {}{}'.format(
            len(entry['projects']), len(entry['articles']), len(entry['markdown']), exp_str))
        if summary_only:
            continue
        sections = [
            ('projects', '專案層級', 'green'),
            ('articles', '文章層級', 'cyan'),
            ('markdown', '內文高光', 'yellow'),
        ]
        for record_type, label, color in sections:
            for item in matches[record_type]:
                exp_badge = styled(' [已過期]', 'red') if item.get('is_expired') else ''
                print('  ' + styled(label, color) + '{}{}  {}'.format(
                    exp_badge,
                    '  ' + styled(f"[{item['target_id']}] {item['title']}", 'bold'),
                    styled(f"{item['file']}:{item['line']}:{item['column']}")))
                print('    資訊：' + styled(item['raw']))
                print('    內文：' + styled(item['context']))
                print('    detail.json 位置：' + styled('{}:{}:{}'.format(
                    item['raw_abs'], item['line'], item['column'])))
                if item.get('md_raw_abs'):
                    print('    Markdown 位置：   ' + styled('{}:{}:{}'.format(
                        item['md_raw_abs'], item['md_line'], item['md_column'])))
    return found


def print_unset_targets(query='', kind='all'):
    """列出尚未設定任何標籤的專案或文章 detail.json。"""
    if not scanned:
        scan_tags(generate_html=False)
    q = query.casefold()
    items = [
        t for t in all_targets
        if not t['tags']
        and (kind == 'all' or t['kind'] == kind)
        and (not q or any(q in str(t[f]).casefold() for f in ('file', 'title', 'target_id')))
    ]
    print(styled(f'\n未設定任何 detail.json 標籤的目標 · 共 {len(items)} 筆', 'bold'))
    if not items:
        print('沒有符合條件的未設定項目。')
        return items
    for t in items:
        label = '專案' if t['kind'] == 'projects' else '文章'
        color = 'green' if t['kind'] == 'projects' else 'cyan'
        md_note = f" (內文高光: {', '.join(t['md_tags'])})" if t.get('md_tags') else ''
        print(f"  [{styled(label, color)}] {styled(t['target_id'], 'yellow')} ({t['title']}){md_note}")
        print(f"    detail.json 位置：{styled(t['raw_abs'] + ':' + str(t['line']) + ':' + str(t['column']))}")
    return items


def query_tags_interactive():
    if not scanned:
        scan_tags(generate_html=False)
    category_filter = 'all'
    while True:
        print('\n搜尋標籤名稱、專案／文章標題、detail.json 路徑或內文；空白列出全部，:unset 列出未設定項目，q 返回。')
        print('類型篩選：:status 系統狀態／:custom 自訂標籤／:md 內文高光／:expired 已過期時效／:all 全部；目前：' +
              {'all': '全部', 'status': '系統狀態', 'custom': '自訂標籤', 'markdown': '內文高光', 'expired': '已過期時效'}[category_filter])
        query = input('搜尋 > ').strip()
        if query.lower() == 'q':
            return
        if query.lower() == ':unset':
            sub = input('篩選未設定項目（關鍵字，空白全部） > ').strip()
            print_unset_targets(sub)
            continue
        if query.lower() in (':status', ':custom', ':md', ':expired', ':all'):
            category_filter = {
                ':status': 'status',
                ':custom': 'custom',
                ':md': 'markdown',
                ':expired': 'expired',
                ':all': 'all',
            }[query.lower()]
            print_query(category_filter=category_filter)
            continue
        print_query(query, category_filter=category_filter)


def format_tags_array_like_original(new_list, orig_slice, field_indent, nl):
    """根據原本 tags 欄位的單行或多行風格，序列化更新後的 tags 陣列。"""
    if not new_list:
        return '[]'
    if '\n' in orig_slice:
        m = re.search(r'\n([ \t]+)"', orig_slice)
        item_indent = m.group(1) if m else (field_indent + '  ')
        items_str = f',{nl}'.join(f'{item_indent}{json.dumps(x, ensure_ascii=False)}' for x in new_list)
        return f'[{nl}{items_str}{nl}{field_indent}]'
    return '[' + ', '.join(json.dumps(x, ensure_ascii=False) for x in new_list) + ']'


def mutate_json_tags(text, action, target_tag=None, new_tag=None):
    """在不動到其他欄位排版與順序的前提下，對 detail.json 的 tags 陣列執行 add / remove / replace。"""
    open_brace_idx, fields = json_field_spans(text)
    nl = '\r\n' if '\r\n' in text else '\n'
    target_idx = next((i for i, f in enumerate(fields) if f['name'] == 'tags'), None)

    def matches_tag(raw_item, needle):
        if needle is None:
            return False
        base, raw_s, _, _ = normalize_tag(raw_item)
        return raw_s.casefold() == needle.casefold() or base.casefold() == needle.casefold()

    if target_idx is not None:
        f = fields[target_idx]
        if not isinstance(f['value'], list):
            return text, None
        cur_list = list(f['value'])
        orig_slice = text[f['val_start']:f['val_end']]
        line_start = text.rfind('\n', 0, f['key_start']) + 1
        indent_match = re.match(r'[ \t]*', text[line_start:f['key_start']])
        field_indent = indent_match.group(0) if indent_match else '  '

        if action == 'add':
            if any(matches_tag(x, new_tag) for x in cur_list):
                return text, None
            updated_list = cur_list + [str(new_tag)]
        elif action == 'remove':
            updated_list = [x for x in cur_list if not matches_tag(x, target_tag)]
            if len(updated_list) == len(cur_list):
                return text, None
        elif action == 'replace':
            changed = False
            updated_list = []
            for x in cur_list:
                if matches_tag(x, target_tag):
                    changed = True
                    if not any(matches_tag(existing, new_tag) for existing in updated_list):
                        updated_list.append(str(new_tag))
                else:
                    if not any(matches_tag(existing, x) for existing in updated_list):
                        updated_list.append(x)
            if not changed:
                return text, None
        else:
            return text, None

        encoded_arr = format_tags_array_like_original(updated_list, orig_slice, field_indent, nl)
        modified = text[:f['val_start']] + encoded_arr + text[f['val_end']:]
        json.loads(modified)
        before_preview = json.dumps(cur_list, ensure_ascii=False)
        after_preview = json.dumps(updated_list, ensure_ascii=False)
        return modified, {
            'line': f['line'],
            'column': f['column'],
            'before': f'"tags": {before_preview}',
            'after': f'"tags": {after_preview}',
        }
    else:
        if action != 'add' or not new_tag:
            return text, None
        updated_list = [str(new_tag)]
        encoded_arr = json.dumps(updated_list, ensure_ascii=False)
        if fields:
            anchor = next((f for f in fields if f['name'] in ('description', 'meta', 'title')), fields[-1])
            line_start = text.rfind('\n', 0, anchor['key_start']) + 1
            indent_match = re.match(r'[ \t]*', text[line_start:anchor['key_start']])
            indent = indent_match.group(0) if indent_match else '  '
            insert_str = f',{nl}{indent}"tags": {encoded_arr}'
            modified = text[:anchor['val_end']] + insert_str + text[anchor['val_end']:]
            inserted_line = text.count('\n', 0, anchor['val_end']) + 2
            json.loads(modified)
            return modified, {
                'line': inserted_line,
                'column': len(indent) + 1,
                'before': '(未設定 tags 欄位)',
                'after': f'"tags": {encoded_arr}',
            }
        else:
            close_brace_idx = text.rfind('}')
            modified = (
                text[:open_brace_idx + 1]
                + f'{nl}  "tags": {encoded_arr}{nl}'
                + text[close_brace_idx:]
            )
            json.loads(modified)
            return modified, {
                'line': 2,
                'column': 3,
                'before': '(未設定 tags 欄位)',
                'after': f'"tags": {encoded_arr}',
            }


def mutate_markdown_highlights(md_text, target_tag, new_tag):
    """安全替換 Markdown 內文中的 ++[OLD]++ 與 :::highlight[OLD]（避開程式碼區塊與 KEY:）。"""
    if not target_tag or not new_tag:
        return md_text, None
    masked = mask_fenced_code(md_text)
    replacements = []

    for m in RE_MD_INLINE_HL.finditer(masked):
        badge = m.group(1).strip()
        if not badge.upper().startswith('KEY:') and badge.casefold() == target_tag.casefold():
            replacements.append((m.start(1), m.end(1)))

    for m in RE_MD_BLOCK_HL.finditer(masked):
        badge = (m.group(1) or '').strip()
        if badge and not badge.upper().startswith('KEY:') and badge.casefold() == target_tag.casefold():
            replacements.append((m.start(1), m.end(1)))

    if not replacements:
        return md_text, None

    replacements.sort(key=lambda pair: pair[0], reverse=True)
    modified = md_text
    for start_idx, end_idx in replacements:
        modified = modified[:start_idx] + str(new_tag) + modified[end_idx:]

    first_start = replacements[-1][0]
    first_line = md_text.count('\n', 0, first_start) + 1
    first_col = first_start - md_text.rfind('\n', 0, first_start)
    return modified, {
        'line': first_line,
        'column': first_col,
        'before': f'++[{target_tag}]++ / :::highlight[{target_tag}] (共 {len(replacements)} 處)',
        'after': f'++[{new_tag}]++ / :::highlight[{new_tag}]',
    }


def plan_tag_changes(action, target_tag=None, new_tag=None, file_filter='', kind='all'):
    """規劃 detail.json 與 Markdown 高光標籤的變更，保留 UTF-8 BOM 與原本排版。"""
    root_path = Path(PROJECTS_DIR)
    if not root_path.is_dir():
        raise FileNotFoundError('找不到專案目錄：' + str(root_path.resolve()))
    file_cf = file_filter.casefold()
    plans = []

    for root, dirs, files in os.walk(root_path):
        dirs.sort()
        for name in sorted(files):
            if name != 'detail.json':
                continue
            path = Path(root) / name
            if path.is_symlink():
                continue
            item_kind, proj_id, art_id = classify_detail_path(path, root_path)
            if item_kind == 'category':
                continue
            target_id = f'{proj_id} / {art_id}' if item_kind == 'articles' else str(proj_id)
            path_str = str(path).replace('\\', '/')

            original = path.read_bytes()
            text = original.decode('utf-8-sig')
            data = json.loads(text)
            if not isinstance(data, dict):
                continue
            title = str(data.get('title') or (art_id if item_kind == 'articles' else proj_id))
            if file_cf and not any(file_cf in s.casefold() for s in (path_str, target_id, title)):
                continue

            # 1. detail.json 變更
            if kind in ('all', 'projects', 'articles') and (kind == 'all' or item_kind == kind):
                modified, change = mutate_json_tags(text, action, target_tag=target_tag, new_tag=new_tag)
                if change:
                    bom = b'\xef\xbb\xbf' if original.startswith(b'\xef\xbb\xbf') else b''
                    plans.append({
                        'path': path,
                        'detail_path': path,
                        'target_id': target_id,
                        'title': title,
                        'kind': item_kind,
                        'before': original,
                        'after': bom + modified.encode('utf-8'),
                        'change': change,
                    })

            # 2. Markdown 高光標籤替換 (當執行 replace 且包含 markdown 或 all 時)
            if action == 'replace' and kind in ('all', 'markdown'):
                for md_path in sorted(path.parent.glob('*.md')):
                    if not md_path.is_file() or md_path.is_symlink():
                        continue
                    md_orig = md_path.read_bytes()
                    md_text = md_orig.decode('utf-8-sig')
                    md_mod, md_change = mutate_markdown_highlights(md_text, target_tag, new_tag)
                    if md_change:
                        md_bom = b'\xef\xbb\xbf' if md_orig.startswith(b'\xef\xbb\xbf') else b''
                        plans.append({
                            'path': md_path,
                            'detail_path': path,
                            'target_id': target_id,
                            'title': title,
                            'kind': 'markdown',
                            'before': md_orig,
                            'after': md_bom + md_mod.encode('utf-8'),
                            'change': md_change,
                        })
    return plans


def replace_tag_interactive(generate_html=True):
    """將特定的舊標籤批次替換為新標籤（含 detail.json 與 Markdown 內文高光）。"""
    if not scanned:
        scan_tags(generate_html=False)
    print(styled('\n批次標籤替換引擎 · 安全替換 detail.json 與 Markdown 內文高光 Tag', 'bold'))
    if results:
        existing_list = ', '.join(sorted(results.keys(), key=tag_sort_key))
        print('目前使用中的標籤：' + styled(existing_list, 'yellow'))
    old_tag = input('請輸入要替換的【舊】標籤名稱（空白返回） > ').strip()
    if not old_tag:
        return
    new_tag = input('請輸入要替換為【新】的標籤名稱（空白返回） > ').strip()
    if not new_tag or old_tag == new_tag:
        return
    file_filter = input('限定 detail.json 路徑／專案 ID／標題（空白處理全部符合項目） > ').strip()

    plans = plan_tag_changes('replace', target_tag=old_tag, new_tag=new_tag, file_filter=file_filter)
    if not plans:
        print(f'沒有在任何 detail.json 或 Markdown 高光語法中找到 [{old_tag}]。')
        return
    for plan in plans:
        c = plan['change']
        print('  ' + styled(plan['path'].resolve()) + f":{c['line']}:{c['column']}  [{plan['target_id']} · {plan['title']}]")
        print('    ' + styled(c['before'], 'yellow') + ' → ' + styled(c['after'], 'green'))
    print(f'共 {len(plans)} 個檔案將被更新；寫入前會保留 .tag.bak 備份。')
    if input('套用以上修改？[y/N] > ').strip().lower() not in ('y', 'yes'):
        print('已取消，檔案未修改。')
        return
    files, errors = apply_tag_changes(plans)
    print(f'完成：成功修改 {files} 個檔案。')
    for error in errors:
        print(styled('更新失敗：' + error, 'red'))
    if files:
        scan_tags(generate_html=generate_html)


def manage_target_tags(generate_html=True):
    """針對特定專案或文章 detail.json 新增或移除標籤。"""
    if not scanned:
        scan_tags(generate_html=False)
    print(styled('\n管理標籤 (tags) · 新增／移除指定 detail.json 標籤', 'bold'))
    action_in = input('[1] 新增標籤 (Add)  [2] 移除標籤 (Remove)（空白返回） > ').strip()
    if action_in not in ('1', '2'):
        return

    kind_input = input('限定層級 [all: 全部 / p: 僅專案 / a: 僅文章]（預設 all） > ').strip().lower()
    kind = {'p': 'projects', 'projects': 'projects', 'a': 'articles', 'articles': 'articles'}.get(kind_input, 'all')

    file_filter = input('輸入目標 detail.json 路徑、專案／文章 ID 或標題關鍵字（輸入 * 選擇全部，空白返回） > ').strip()
    if not file_filter:
        return
    if file_filter == '*':
        file_filter = ''

    if action_in == '1':
        tag_val = input('輸入要新增的標籤（例如 OC 或 NEW: 2026-10-26） > ').strip()
        if not tag_val:
            print('未輸入標籤，已取消。')
            return
        plans = plan_tag_changes('add', new_tag=tag_val, file_filter=file_filter, kind=kind)
    else:
        tag_val = input('輸入要從 tags 陣列移除的標籤名稱 > ').strip()
        if not tag_val:
            print('未輸入標籤，已取消。')
            return
        plans = plan_tag_changes('remove', target_tag=tag_val, file_filter=file_filter, kind=kind)

    if not plans:
        print('沒有需要變更的 detail.json：可能已包含／不包含該標籤，或沒有符合關鍵字的檔案。')
        return

    print(styled(f'\n預覽變更 · 共 {len(plans)} 個 detail.json：', 'bold'))
    for plan in plans:
        c = plan['change']
        label = '專案' if plan['kind'] == 'projects' else '文章'
        print(f"  [{label}] " + styled(plan['path'].resolve()) + f":{c['line']}:{c['column']} ({plan['target_id']} · {plan['title']})")
        print('    ' + styled(c['before'], 'yellow') + ' → ' + styled(c['after'], 'green'))
    print(f'共 {len(plans)} 個 detail.json；寫入前會保留 .tag.bak 備份。')
    if input('套用以上修改？[y/N] > ').strip().lower() not in ('y', 'yes'):
        print('已取消，檔案未修改。')
        return
    files, errors = apply_tag_changes(plans)
    print(f'完成：修改 {files} 個 detail.json。')
    for error in errors:
        print(styled('更新失敗：' + error, 'red'))
    if files:
        scan_tags(generate_html=generate_html)


class TagsTracker(TrackerApp):
    slug = 'tags'
    title = '標籤追蹤管理員'
    description = '追蹤 tags、系統狀態、時效與 Markdown 高光。'
    kinds = ('projects','articles','markdown')
    backup_tag = 'tag'
    mutation_label = '批次替換標籤（含 detail.json 與 Markdown）'
    manage_label = '管理 detail.json 標籤（新增／移除）'
    filters = (dict(key='category', label='標籤分類', options=[['all','全部分類'],['status','系統狀態'],['custom','自訂標籤'],['markdown','內文高光'],['expired','已過期']]),)

    def add_arguments(self, parser):
        parser.add_argument('--category', choices=['all','status','custom','markdown','expired'], default='all')
        parser.add_argument('--add', metavar='TAG')
        parser.add_argument('--remove', metavar='TAG')
        parser.add_argument('--replace', nargs=2, metavar=('OLD_TAG','NEW_TAG'))

    def validate(self, args, parser):
        if sum(x is not None for x in (args.add,args.remove,args.replace))>1:
            parser.error('--add、--remove 與 --replace 每次只能擇一')
        if (args.add is not None or args.remove is not None) and not args.file:
            parser.error('修改請搭配 --file；套用全部請使用 --file "*"')
        if (args.add is not None or args.remove is not None) and args.kind=='markdown':
            parser.error('--add／--remove 操作 detail.json；Markdown 請使用 --replace')

    def collect(self):
        collect_tags()

    def report(self):
        groups=[]
        for name,entry in sorted(results.items(),key=lambda p:tag_sort_key(p[0])):
            records=[]
            for kind,items in entry.items():
                for item in items:
                    categories = ['status' if name.upper() in STATUS_TAGS else 'custom']
                    if kind=='markdown': categories.append('markdown')
                    if item.get('is_expired'): categories.append('expired')
                    # 一筆紀錄可同時是系統狀態與過期；HTML 使用 categories 集合篩選。
                    records.append(dict(item, category=categories[0], categories=categories, badges=categories,
                                        meta={'來源':item.get('source_type',''), '原始標籤':item.get('raw_tag',''),
                                              '目標':item.get('target_id','')}))
            groups.append(dict(name=name, records=records))
        unset=[dict(t, raw='(未設定 detail.json 標籤)', badges=['未設定']) for t in all_targets if not t.get('tags')]
        return dict(groups=groups, unset=unset)

    def query(self,args):
        print_query(args.query or '',args.file,args.kind,args.exact,args.list,args.category)

    def unset(self,args):
        return super().unset(args)

    def mutate_cli(self,args):
        if args.add is None and args.remove is None and args.replace is None:
            return None
        file_filter='' if args.file=='*' else args.file
        if args.replace:
            plans=plan_tag_changes('replace',target_tag=args.replace[0],new_tag=args.replace[1],file_filter=file_filter,kind=args.kind)
        elif args.add is not None:
            plans=plan_tag_changes('add',new_tag=args.add,file_filter=file_filter,kind=args.kind)
        else:
            plans=plan_tag_changes('remove',target_tag=args.remove,file_filter=file_filter,kind=args.kind)
        return self.apply(plans,args.yes,not args.no_html)

    def interactive_query(self):
        query_tags_interactive()

    def interactive_mutate(self):
        replace_tag_interactive(generate_html=not self.no_html)

    def interactive_manage(self):
        manage_target_tags(generate_html=not self.no_html)


APP=TagsTracker(globals())


def scan_tags(generate_html=True):
    return APP.scan(generate_html)


def write_dashboard():
    return APP.write_dashboard()


def open_dashboard():
    return APP.open_dashboard()


def apply_tag_changes(plans):
    global scanned
    count,_,errors=apply_changes(plans,'tag')
    if count:
        scanned=False
    return count,errors


def main(argv=None):
    return APP.run(argv)


if __name__ == "__main__":
    sys.exit(main())

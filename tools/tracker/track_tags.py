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

import argparse
import json
import os
import re
import sys
import tempfile
import urllib.parse
import webbrowser
from datetime import datetime
from pathlib import Path

PROJECTS_DIR = 'projects'
OUTPUT_FILE = './tools/tracker/reports/tag_dashboard.html'

# 與 main.js STATUS_LIST 同步的狀態群組
STATUS_GROUPS = [
    ['MAJOR', 'HOTFIX', 'LATEST', 'FEATURE', 'NEW', 'UPDATED', 'REFACTOR', 'PATCH', 'STABLE', 'ARCHIVED'],
    ['WIP'],
    ['OC'],
    ['FANART'],
    ['DEV'],
]
STATUS_TAGS = {tag for group in STATUS_GROUPS for tag in group}

# 同時支援 "is_new": "2026-10-10" 與簡寫 "new": "2026-10-10"
STATUS_FIELD_MAP = {}
for _tag in STATUS_TAGS:
    STATUS_FIELD_MAP[f'is_{_tag.lower()}'] = _tag
    STATUS_FIELD_MAP[_tag.lower()] = _tag

# Markdown 高光語法正規表達式 (對應 main.js highlightExtension & highlightBlockExtension)
RE_FENCED_CODE = re.compile(r'```[\s\S]*?```|~~~[\s\S]*?~~~')
RE_MD_INLINE_HL = re.compile(r'\+\+\[([^\]]+?)\]([\s\S]*?)\+\+')
RE_MD_BLOCK_HL = re.compile(r'^:::[ \t]*highlight(?:\[([^\]]*?)\])?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*:::', re.IGNORECASE | re.MULTILINE)

results = {}
all_targets = []
scan_info = {}
scanned = False
USE_COLOR = sys.stdout.isatty() and 'NO_COLOR' not in os.environ


def styled(value, color='cyan'):
    codes = {'cyan': '36', 'green': '32', 'yellow': '33', 'red': '31', 'bold': '1'}
    value = re.sub(r'[\x00-\x08\x0b-\x1f\x7f-\x9f]', '', str(value))
    return '\033[' + codes[color] + 'm' + value + '\033[0m' if USE_COLOR else value


def detect_tag_expire_days():
    """從 main.js 讀取 CONFIG.TAG_EXPIRE_DAYS，預設為 14 天。"""
    main_js = Path('main.js')
    if main_js.is_file():
        try:
            text = main_js.read_text(encoding='utf-8-sig')
            match = re.search(r'TAG_EXPIRE_DAYS:\s*(\d+)', text)
            if match:
                return int(match.group(1))
        except (OSError, UnicodeError, ValueError):
            pass
    return 14


def parse_folder_id(folder_name):
    match = re.match(r'^(-?\d+)_+(.*)$', folder_name)
    return match.group(2) if match else folder_name


def classify_detail_path(path_obj, root_path):
    """區分 detail.json 為 category (略過)、projects (專案層級) 或 articles (文章層級)。"""
    rel_parts = path_obj.parent.relative_to(root_path).parts
    if len(rel_parts) <= 1:
        return 'category', None, None
    if 'articles' in rel_parts:
        art_idx = rel_parts.index('articles')
        proj_folder = rel_parts[art_idx - 1] if art_idx >= 1 else rel_parts[1]
        art_folder = rel_parts[-1]
        return 'articles', parse_folder_id(proj_folder), parse_folder_id(art_folder)
    return 'projects', parse_folder_id(rel_parts[-1]), None


def json_field_spans(text):
    """以 JSON 解碼器逐一走過頂層欄位，記錄各欄位的起訖索引與行號。"""
    decoder = json.JSONDecoder()
    stripped = text.lstrip()
    if not stripped.startswith('{'):
        raise ValueError('detail.json 的頂層必須是物件')
    open_brace_idx = len(text) - len(stripped)
    index = open_brace_idx + 1
    fields = []
    while index < len(text):
        while index < len(text) and text[index].isspace():
            index += 1
        if index >= len(text) or text[index] == '}':
            break
        key_start = index
        name, index = decoder.raw_decode(text, index)
        key_end = index
        while index < len(text) and text[index].isspace():
            index += 1
        if index >= len(text) or text[index] != ':':
            raise ValueError('JSON 欄位語法錯誤')
        colon_idx = index
        index += 1
        while index < len(text) and text[index].isspace():
            index += 1
        val_start = index
        value, index = decoder.raw_decode(text, index)
        val_end = index
        while index < len(text) and text[index].isspace():
            index += 1
        comma_idx = None
        if index < len(text) and text[index] == ',':
            comma_idx = index
            index += 1
        line = text.count('\n', 0, key_start) + 1
        column = key_start - text.rfind('\n', 0, key_start)
        val_line = text.count('\n', 0, val_start) + 1
        val_column = val_start - text.rfind('\n', 0, val_start)
        fields.append({
            'name': name,
            'value': value,
            'key_start': key_start,
            'key_end': key_end,
            'colon_idx': colon_idx,
            'val_start': val_start,
            'val_end': val_end,
            'comma_idx': comma_idx,
            'line': line,
            'column': column,
            'val_line': val_line,
            'val_column': val_column,
        })
    return open_brace_idx, fields


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


def normalize_tag(raw_tag, expire_days=14):
    """分離時效性標籤（如 'NEW: 2026-10-10' -> base_tag='NEW', expire_date='2026-10-10', is_expired）。"""
    s = str(raw_tag).strip()
    match = re.match(r'^([A-Za-z0-9_-]+):\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})$', s)
    if match:
        candidate = match.group(1).upper()
        if candidate in STATUS_TAGS:
            date_str = match.group(2)
            return candidate, s, date_str, check_date_expired(date_str, expire_days)
    if s.upper() in STATUS_TAGS:
        return s.upper(), s, None, False
    return s, s, None, False


def mask_fenced_code(md_text):
    """將 ```...``` 程式碼區塊內的字元替換為空白（保留換行符號），確保行號與欄位計算完全精準且不誤判。"""
    return RE_FENCED_CODE.sub(
        lambda m: ''.join('\n' if ch == '\n' else ' ' for ch in m.group(0)),
        md_text
    )


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


def scan_markdown_highlights_in_dir(dir_path, detail_path, title, target_id):
    """掃描該目錄下的 .md 檔案，找出 ++[TAG]文字++ 與 :::highlight[TAG] 並綁定至所屬的 detail.json。"""
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

        # 1. 行內高光 ++[TAG]文字++
        for m in RE_MD_INLINE_HL.finditer(masked):
            raw_badge = m.group(1).strip()
            if not raw_badge or raw_badge.upper().startswith('KEY:'):
                continue
            tag_key = raw_badge.upper() if raw_badge.upper() in STATUS_TAGS else raw_badge
            tag_start = m.start(1)
            md_line = md_text.count('\n', 0, tag_start) + 1
            md_col = tag_start - md_text.rfind('\n', 0, tag_start)
            line_text = lines[md_line - 1] if 1 <= md_line <= len(lines) else m.group(0)
            snippet = re.sub(r'\s+', ' ', m.group(2).strip())[:45]
            raw_display = f'[Markdown ++[{raw_badge}]++] "{snippet}" · {rel_md}:{md_line}:{md_col}'

            # 路徑指向該文章／專案所在的 detail.json (line 1, col 1)，並額外附帶 md_file 座標
            add_record(
                tag_key, 'markdown', detail_path, 1, 1,
                raw_display, line_text, title, target_id,
                source_type='md_inline', raw_tag_val=f'++[{raw_badge}]++',
                is_expired=False, md_file=str(md_path), md_line=md_line, md_col=md_col
            )
            found_tags.append(tag_key)

        # 2. 區塊高光 :::highlight[TAG]
        for m in RE_MD_BLOCK_HL.finditer(masked):
            raw_badge = (m.group(1) or '').strip()
            if not raw_badge or raw_badge.upper().startswith('KEY:'):
                continue
            tag_key = raw_badge.upper() if raw_badge.upper() in STATUS_TAGS else raw_badge
            tag_start = m.start(1) if m.group(1) is not None else m.start(0)
            md_line = md_text.count('\n', 0, tag_start) + 1
            md_col = tag_start - md_text.rfind('\n', 0, tag_start)
            line_text = lines[md_line - 1] if 1 <= md_line <= len(lines) else m.group(0).splitlines()[0]
            snippet = re.sub(r'\s+', ' ', m.group(2).strip())[:45]
            raw_display = f'[Markdown :::highlight[{raw_badge}]] "{snippet}" · {rel_md}:{md_line}:{md_col}'

            add_record(
                tag_key, 'markdown', detail_path, 1, 1,
                raw_display, line_text, title, target_id,
                source_type='md_block', raw_tag_val=f':::highlight[{raw_badge}]',
                is_expired=False, md_file=str(md_path), md_line=md_line, md_col=md_col
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
    expire_days = detect_tag_expire_days()
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
                    path_obj.parent, path, title, target_id
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


def scan_tags(generate_html=True):
    print(styled('\n標籤雷達 · 掃描 ' + os.path.abspath(PROJECTS_DIR), 'bold'))
    collect_tags()
    proj_count = sum(len(v['projects']) for v in results.values())
    art_count = sum(len(v['articles']) for v in results.values())
    md_count = sum(len(v['markdown']) for v in results.values())
    exp_days = scan_info.get('expire_days', 14)
    print(styled('完成', 'green') + '  狀態時效：{} 天 / {} 個 detail.json ({} 篇 .md) / {} 種標籤 / 專案 {} 筆 / 文章 {} 筆 / 內文高光 {} 筆'.format(
        styled(str(exp_days), 'cyan'), scan_info['files'], scan_info['md_files'],
        len(results), proj_count, art_count, md_count))
    print('未設定 detail.json 標籤：專案 {} 個 / 文章 {} 篇'.format(
        scan_info['unset_projects'], scan_info['unset_articles']))
    for error in scan_info['errors']:
        print(styled('略過：' + error, 'yellow'))
    if generate_html:
        write_dashboard()
        print('HTML：' + styled(os.path.abspath(OUTPUT_FILE)))
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


def apply_tag_changes(plans):
    """先檢查檔案有無變動，再逐檔建立 .tag.bak 備份並以原子替換寫回。"""
    global scanned
    for plan in plans:
        if plan['path'].read_bytes() != plan['before']:
            raise ValueError('檔案已變動，請重新預覽：' + str(plan['path']))
    changed_files = 0
    errors = []
    for plan in plans:
        path = plan['path']
        temporary = None
        try:
            if path.read_bytes() != plan['before']:
                raise ValueError('預覽後檔案已變動')
            backup = Path(str(path) + '.tag.bak')
            index = 1
            while True:
                try:
                    with backup.open('xb') as stream:
                        stream.write(plan['before'])
                    break
                except FileExistsError:
                    backup = Path(str(path) + f'.tag.{index}.bak')
                    index += 1
            with tempfile.NamedTemporaryFile(mode='wb', dir=path.parent, delete=False) as stream:
                temporary = Path(stream.name)
                stream.write(plan['after'])
            temporary.chmod(path.stat().st_mode)
            os.replace(temporary, path)
            scanned = False
            changed_files += 1
            print('  已更新：' + styled(path.resolve()) + f" [{plan['target_id']}]（備份：" + styled(backup) + '）')
        except (OSError, UnicodeError, ValueError) as error:
            errors.append(str(path) + ': ' + str(error))
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
    return changed_files, errors


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


def write_dashboard():
    out_path = Path(OUTPUT_FILE)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps({
        'tags': results,
        'targets': all_targets,
        'scan': scan_info,
        'status_tags': sorted(STATUS_TAGS),
    }, ensure_ascii=False)
    payload = payload.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    out_path.write_text(HTML_TEMPLATE.replace('@@PAYLOAD@@', payload), encoding='utf-8')


HTML_TEMPLATE = r'''<!DOCTYPE html>
<html lang="zh-Hant" data-theme="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Azustock · 標籤追蹤管理員</title>
<style>
:root{color-scheme:dark;--bg:#111716;--panel:#19211f;--card:#1f2926;--text:#e9eee9;--muted:#9aa9a1;--line:#32413a;--accent:#b5d99a;--soft:#2c3e2e;--gold:#edc887;--bad:#e9a39c;--shadow:0 12px 36px #0002}
[data-theme=light]{color-scheme:light;--bg:#f4f5ef;--panel:#fafbf6;--card:#fff;--text:#26332c;--muted:#64736a;--line:#dce3d7;--accent:#436c37;--soft:#e8f0df;--gold:#8c6223;--bad:#a0493e;--shadow:0 12px 36px #2b42200a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}button,input,select{font:inherit}button,a,input,select{-webkit-tap-highlight-color:transparent}button{cursor:pointer}a{color:var(--accent);text-decoration:none}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:3px}button:disabled{opacity:.4;cursor:default}
.shell{display:grid;grid-template-columns:300px minmax(0,1fr);height:100vh;height:100dvh}.sidebar{background:var(--panel);border-right:1px solid var(--line);display:flex;flex-direction:column;min-height:0}.brand{padding:30px 24px 22px;border-bottom:1px solid var(--line)}.eyebrow{font-size:10px;letter-spacing:2.5px;color:var(--accent);font-weight:700}.brand h1{font-size:22px;letter-spacing:-.7px;margin:6px 0 0}.brand p{margin:3px 0;color:var(--muted);font-size:12px}.search-area{padding:20px 18px 12px}.search-area label{display:block;color:var(--muted);font-size:12px;margin-bottom:8px}input,select{background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:9px;padding:10px 12px;width:100%;min-width:0}input::placeholder{color:var(--muted)}.search-area select{margin-top:10px}.list-label{display:flex;justify-content:space-between;padding:8px 24px;color:var(--muted);font-size:11px}.key-list{overflow-y:auto;padding:0 12px 18px;flex:1;min-height:100px}.key-item{display:block;width:100%;text-align:left;padding:13px 14px;margin:3px 0;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--text)}.key-item:hover{background:var(--card)}.key-item.active{background:var(--soft);border-color:var(--line)}.key-name{display:block;font-weight:650;overflow-wrap:anywhere}.key-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--muted);margin-top:4px}.dot{color:var(--bad)}.status-pill{color:var(--gold);font-size:10px;border:1px solid var(--line);border-radius:4px;padding:1px 5px;margin-left:6px}.side-footer{padding:15px 24px;border-top:1px solid var(--line);color:var(--muted);font-size:11px;overflow-wrap:anywhere;white-space:pre-line}.main{overflow-y:auto;padding:32px 40px 48px;min-width:0}.topbar{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:24px}.topbar h2{font-size:24px;font-weight:600;margin:0;letter-spacing:-.6px}.topbar p{font-size:12px;color:var(--muted);margin:3px 0 0}.button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--line);border-radius:8px;padding:7px 11px;color:var(--text);background:var(--panel);font-size:12px;white-space:nowrap}.button:hover{background:var(--soft);border-color:var(--accent)}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:30px}.stat{padding:16px 20px;background:var(--panel);border:1px solid var(--line);border-radius:12px}.stat span{font-size:11px;color:var(--muted)}.stat strong{display:block;font-size:28px;line-height:1.5;font-weight:550}.stat small{font-size:11px;color:var(--muted)}.stat.warning strong{color:var(--bad)}.detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}.detail-head h3{font-size:25px;margin:0;letter-spacing:-.7px;overflow-wrap:anywhere}.detail-head p{color:var(--muted);font-size:12px;margin:6px 0}.badge{display:inline-flex;border:1px solid var(--line);border-radius:30px;padding:3px 10px;font-size:11px;color:var(--accent);white-space:nowrap;margin-right:6px}.badge.warn{color:var(--bad);border-color:var(--bad)}.badge.gold{color:var(--gold);border-color:var(--gold)}.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding-bottom:20px;border-bottom:1px solid var(--line)}.tab{border:1px solid var(--line);border-radius:8px;padding:7px 14px;color:var(--muted);background:transparent;font-size:12px}.tab.active{background:var(--soft);color:var(--accent);border-color:var(--accent)}.toolbar input{margin-left:auto;width:min(100%,280px);font-size:12px;padding:8px 12px}.section-title{display:flex;gap:10px;align-items:center;margin:24px 0 12px;font-size:14px;font-weight:600}.section-title span{font-size:11px;font-weight:400;color:var(--muted)}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr));gap:12px}.card{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:18px;box-shadow:var(--shadow);min-width:0}.card-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.path{font:12px/1.7 ui-monospace,Consolas,monospace;overflow-wrap:anywhere;color:var(--accent)}.line{font-size:10px;color:var(--muted);white-space:nowrap;background:var(--bg);border-radius:5px;padding:3px 7px}.raw{font:12px/1.7 ui-monospace,Consolas,monospace;color:var(--gold);margin:10px 0 8px;overflow-wrap:anywhere}.context{background:var(--bg);border-radius:7px;padding:12px;margin:8px 0 0;color:var(--muted);white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.8 ui-monospace,Consolas,monospace}.actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.actions .button{font-size:11px}.notice{border:1px dashed var(--line);border-radius:10px;padding:16px;color:var(--muted);font-size:12px}.notice.warn{color:var(--gold)}.empty{padding:60px 20px;text-align:center;color:var(--muted)}.empty strong{display:block;font-size:20px;color:var(--text);margin-bottom:8px}.navigation{display:flex;gap:6px}#toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text);color:var(--bg);padding:10px 18px;border-radius:10px;box-shadow:var(--shadow);z-index:10;max-width:90%;font-size:12px}.errors{margin-bottom:20px;color:var(--gold);font-size:12px}.errors pre{white-space:pre-wrap;overflow-wrap:anywhere}.tip{font-size:11px;color:var(--muted);margin-top:24px}#count{font-variant-numeric:tabular-nums}
@media(min-width:1500px){.main{padding-left:64px;padding-right:64px}.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:900px){.shell{grid-template-columns:245px minmax(0,1fr)}.main{padding:24px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.stat{padding:12px 16px}}
@media(max-width:640px){.shell{display:block;height:auto}.sidebar{border-right:0;border-bottom:1px solid var(--line)}.brand{padding:18px 20px 12px}.search-area{padding:14px 18px 8px}.key-list{max-height:220px;flex:auto}.side-footer{display:none}.main{overflow:visible;padding:22px 18px 40px}.topbar{align-items:flex-start}.topbar h2{font-size:22px}.stats{gap:8px;margin-bottom:24px}.stat strong{font-size:24px}.toolbar input{width:100%;margin-left:0}.detail-head h3{font-size:22px}}
</style>
</head>
<body>
<div class="shell">
<aside class="sidebar">
 <header class="brand"><div class="eyebrow">AZUSTOCK / TAG RADAR</div><h1>標籤追蹤管理員</h1><p>追蹤 detail.json 標籤、狀態時效與 Markdown 內文高光語法。</p></header>
 <div class="search-area"><label for="search">搜尋標籤、標題與 detail.json 位置</label><input id="search" type="search" placeholder="標籤、專案、文章或 detail.json…"><select id="category" aria-label="標籤分類"><option value="all">全部標籤類型</option><option value="status">系統狀態標籤 (STATUS)</option><option value="custom">自訂主題標籤 (CUSTOM)</option><option value="markdown">含 Markdown 內文高光</option><option value="expired">含有已過期時效設定</option></select><select id="level" aria-label="設定層級"><option value="all">全部來源層級</option><option value="projects">僅專案層級 (Project)</option><option value="articles">僅文章層級 (Article)</option><option value="markdown">僅內文高光 (Markdown)</option></select></div>
 <div class="list-label"><span>標籤索引</span><span id="count"></span></div><nav class="key-list" id="tagList" aria-label="標籤索引"></nav>
 <footer class="side-footer" id="scanMeta"></footer>
</aside>
<main class="main">
 <header class="topbar"><div><h2>Tags, Status & Highlights 總覽</h2><p id="bannerText">檢視各專案與文章 detail.json 定義的標籤、狀態欄位與內文高光。</p></div><button id="theme" class="button" type="button">切換主題</button></header>
 <div class="stats" id="stats"></div><details id="errors" class="errors" hidden><summary></summary><pre></pre></details>
 <div id="detail"></div><p class="tip">本頁為掃描時的快照；使用 track_tags.py 修改 detail.json 後請重新掃描。VS Code / Cursor 連結會直接開啟該項目所屬的 detail.json 或 Markdown 檔案。</p>
</main></div><div id="toast" role="status" hidden></div>
<script id="scanData" type="application/json">@@PAYLOAD@@</script>
<script>
'use strict';
const payload=JSON.parse(document.getElementById('scanData').textContent),db=payload.tags,scan=payload.scan,statusSet=new Set((payload.status_tags||[]).map(s=>s.toUpperCase()));
const records=tag=>[...db[tag].projects,...db[tag].articles,...(db[tag].markdown||[])];
const isStatus=tag=>statusSet.has(String(tag).toUpperCase());
const hasExpired=tag=>records(tag).some(r=>r.is_expired);
const tags=Object.keys(db).sort((a,b)=>{const diff=records(b).length-records(a).length;if(diff!==0)return diff;if(isStatus(a)!==isStatus(b))return isStatus(a)?-1:1;return a.localeCompare(b);});
const list=document.getElementById('tagList'),detail=document.getElementById('detail');
let active=null,visible=[],kind='all',locationQuery='',toastTimer;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const matches=(item,q)=>[item.file,item.raw_abs,item.raw,item.context,item.title,item.target_id,item.raw_tag,item.md_file].some(value=>String(value||'').toLowerCase().includes(q));
const total=type=>tags.reduce((sum,t)=>sum+(db[t][type]?db[t][type].length:0),0);
const expiredTotal=()=>tags.reduce((sum,t)=>sum+records(t).filter(r=>r.is_expired).length,0);
const levelMatches=item=>{const lv=document.getElementById('level').value;return lv==='all'||item.kind===lv;};
document.getElementById('bannerText').textContent=`狀態標籤時效 (TAG_EXPIRE_DAYS)：${scan.expire_days} 天 · 未設定 detail.json 標籤：專案 ${scan.unset_projects} 個 / 文章 ${scan.unset_articles} 篇`;
document.getElementById('stats').innerHTML=[['標籤種類總數',tags.length,`系統狀態 ${tags.filter(isStatus).length} 種 · 自訂 ${tags.filter(t=>!isStatus(t)).length} 種`],['detail.json 標記',total('projects')+total('articles'),`專案 ${total('projects')} 筆 · 文章 ${total('articles')} 筆`],['Markdown 內文高光',total('markdown'),`掃描 ${scan.md_files||0} 篇 .md 檔案`],['已過期時效標籤',expiredTotal(),`超過 ${scan.expire_days} 天將自動隱藏`]].map((s,i)=>`<div class="stat ${i===3&&s[1]>0?'warning':''}"><span>${s[0]}</span><strong>${s[1]}</strong><small>${s[2]}</small></div>`).join('');
document.getElementById('scanMeta').textContent=`掃描 ${scan.files} 個 detail.json (${scan.md_files||0} 篇 .md) · ${scan.time}\n${scan.root}`;
if(scan.errors.length){const el=document.getElementById('errors');el.hidden=false;el.querySelector('summary').textContent=`有 ${scan.errors.length} 項掃描失敗（點擊查看）`;el.querySelector('pre').textContent=scan.errors.join('\n');}
function renderList(){
 const q=document.getElementById('search').value.trim().toLowerCase(),cat=document.getElementById('category').value;
 visible=tags.filter(tag=>{
  if(cat==='status'&&!isStatus(tag))return false;
  if(cat==='custom'&&isStatus(tag))return false;
  if(cat==='markdown'&&!(db[tag].markdown&&db[tag].markdown.length))return false;
  if(cat==='expired'&&!hasExpired(tag))return false;
  const eligible=records(tag).filter(item=>levelMatches(item)&&(cat!=='expired'||item.is_expired)&&(cat!=='markdown'||item.kind==='markdown'));
  return eligible.length>0&&(!q||tag.toLowerCase().includes(q)||eligible.some(item=>matches(item,q)));
 });
 if(!visible.includes(active)){active=visible[0]||null;kind='all';locationQuery='';}
 document.getElementById('count').textContent=`${visible.length} / ${tags.length}`;
 list.replaceChildren();
 for(const tag of visible){
  const button=document.createElement('button');button.type='button';button.className='key-item'+(tag===active?' active':'');button.setAttribute('aria-current',tag===active?'true':'false');
  const pill=isStatus(tag)?'<span class="status-pill">STATUS</span>':'';
  const expDot=hasExpired(tag)?' <span class="dot" title="含有已過期項目">●</span>':'';
  const mdCount=db[tag].markdown?db[tag].markdown.length:0;
  button.innerHTML=`<span class="key-name">${esc(tag)}${pill}${expDot}</span><span class="key-meta"><span>專案 ${db[tag].projects.length}</span><span>文章 ${db[tag].articles.length}</span>${mdCount?`<span>高光 ${mdCount}</span>`:''}</span>`;
  button.addEventListener('click',()=>{active=tag;kind='all';locationQuery='';renderList();});
  list.append(button);
 }
 if(!visible.length)list.innerHTML='<div class="notice">沒有符合條件的標籤紀錄。</div>';
 renderDetail();
}
function createCard(item){
 const line=item.line,column=item.column||1,path=`${item.raw_abs}:${line}:${column}`;
 const badgeLabel=item.kind==='projects'?'專案層級 (Project)':item.kind==='articles'?'文章層級 (Article)':'內文高光 (Markdown)';
 const srcBadge=item.source_type==='bool_flag'?`<span class="badge gold">狀態欄位 (${esc(item.raw_tag)})</span>`:item.source_type==='tags_array'?`<span class="badge">tags 陣列元素</span>`:`<span class="badge gold">${esc(item.raw_tag)}</span>`;
 const expBadge=item.is_expired?`<span class="badge warn">已超過 ${scan.expire_days} 天時效</span>`:'';
 const mdActions=item.md_abs_path?`<a class="button" href="${esc('vscode://file/'+item.md_abs_path+':'+item.md_line+':'+item.md_column)}">開啟 .md (L${item.md_line}) ↗</a>`:'';
 return `<article class="card"><div class="card-header"><div class="path">${esc(item.file)}</div><span class="line">${item.md_line?`MD L${item.md_line}:${item.md_column}`:`L${line} : ${column}`}</span></div><div class="raw">${esc(item.target_id)} · ${esc(item.title)}</div><div><span class="badge">${badgeLabel}</span>${srcBadge}${expBadge}</div><pre class="context">${esc(item.context)}</pre><div class="actions"><a class="button" href="${esc('vscode://file/'+item.abs_path+':'+line+':'+column)}">detail.json (VS Code) ↗</a><a class="button" href="${esc('cursor://file/'+item.abs_path+':'+line+':'+column)}">detail.json (Cursor) ↗</a>${mdActions}<button class="button" type="button" data-copy="${esc(path)}">複製 detail.json 位置</button></div></article>`;
}
function renderDetail(){
 if(!active){detail.innerHTML=`<div class="empty"><strong>${tags.length?'沒有符合條件的標籤':'尚未發現任何標籤設定'}</strong>${tags.length?'試著縮短搜尋文字，或切換篩選條件。':'可使用 python track_tags.py 選單 [6] 為專案或文章 detail.json 新增標籤。'}</div>`;return;}
 const entry=db[active],index=visible.indexOf(active);
 const typeBadge=isStatus(active)?'<span class="badge gold">系統狀態徽章 (STATUS_LIST)</span>':'<span class="badge">自訂主題標籤 (CUSTOM)</span>';
 const expCount=records(active).filter(r=>r.is_expired).length;
 const expBadge=expCount?`<span class="badge warn">含 ${expCount} 筆已過期時效設定</span>`:'';
 const mdLen=entry.markdown?entry.markdown.length:0;
 detail.innerHTML=`<div class="detail-head"><div><div class="eyebrow">TAG RADAR / ${index+1} OF ${visible.length}</div><h3>${esc(active)}</h3><p>專案層級 ${entry.projects.length} 筆 · 文章層級 ${entry.articles.length} 筆 · 內文高光 ${mdLen} 筆 · 共 ${records(active).length} 處引用</p>${typeBadge}${expBadge}</div><div class="navigation"><button type="button" class="button" id="previous" aria-label="上一個標籤" ${index===0?'disabled':''}>←</button><button type="button" class="button" id="next" aria-label="下一個標籤" ${index===visible.length-1?'disabled':''}>→</button></div></div><div class="toolbar"><button type="button" data-kind="all" class="tab">全部來源</button><button type="button" data-kind="projects" class="tab">專案層級</button><button type="button" data-kind="articles" class="tab">文章層級</button><button type="button" data-kind="markdown" class="tab">內文高光</button><input id="location" type="search" aria-label="篩選這個標籤的位置" placeholder="篩選標題、ID 或 detail.json 路徑…" value="${esc(locationQuery)}"></div><div id="recordSections"></div>`;
 detail.querySelectorAll('[data-kind]').forEach(button=>{const lv=document.getElementById('level').value;button.disabled=lv!=='all'&&button.dataset.kind!=='all'&&button.dataset.kind!==lv;button.classList.toggle('active',button.dataset.kind===kind);button.setAttribute('aria-pressed',String(button.dataset.kind===kind));button.addEventListener('click',()=>{kind=button.dataset.kind;detail.querySelectorAll('[data-kind]').forEach(b=>{b.classList.toggle('active',b.dataset.kind===kind);b.setAttribute('aria-pressed',String(b.dataset.kind===kind));});renderRecords();});});
 document.getElementById('location').addEventListener('input',event=>{locationQuery=event.target.value;renderRecords();});
 for(const [id,offset] of [['previous',-1],['next',1]])document.getElementById(id).addEventListener('click',()=>{active=visible[index+offset];locationQuery='';renderList();});
 renderRecords();
}
function renderRecords(){
 const entry=db[active],q=locationQuery.trim().toLowerCase(),search=document.getElementById('search').value.trim().toLowerCase(),cat=document.getElementById('category').value;
 const limitGlobal=search&&!active.toLowerCase().includes(search);
 let html='';
 const sections=[
  ['projects','專案層級 (Projects detail.json)','定義於專案目錄下的 detail.json，顯示於首頁卡片與跑馬燈'],
  ['articles','文章層級 (Articles detail.json)','定義於文章目錄下的 detail.json，顯示於系列目錄與文章標題旁並向上冒泡'],
  ['markdown','內文高光 (Markdown ++[TAG]++ / :::highlight[TAG])','定義於文章或專案的 .md 內文中，路徑綁定至所屬的 detail.json']
 ];
 for(const [type,title,explanation] of sections){
  if(kind!=='all'&&kind!==type)continue;
  const lv=document.getElementById('level').value;
  if(lv!=='all'&&lv!==type)continue;
  if(cat==='markdown'&&type!=='markdown')continue;
  const listArr=entry[type]||[];
  const items=listArr.filter(item=>levelMatches(item)&&(cat!=='expired'||item.is_expired)&&(!q||matches(item,q))&&(!limitGlobal||matches(item,search)));
  html+=`<div class="section-title">${title}<span>${items.length} / ${listArr.length} 筆 · ${explanation}</span></div>`;
  if(items.length)html+=`<div class="cards">${items.map(createCard).join('')}</div>`;
  else if(listArr.length)html+='<div class="notice">沒有符合篩選條件的 detail.json 位置。</div>';
  else html+=`<div class="notice">此標籤目前沒有在${type==='projects'?'專案 detail.json':type==='articles'?'文章 detail.json':' Markdown 內文高光'}中使用。</div>`;
 }
 const el=document.getElementById('recordSections');el.innerHTML=html;
 el.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',()=>copyText(button.dataset.copy)));
}
async function copyText(value){
 try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);else{const input=document.createElement('textarea');input.value=value;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();let ok;try{ok=document.execCommand('copy');}finally{input.remove();}if(!ok)throw new Error('copy unavailable');}toast('已複製 detail.json 位置與行號');}
 catch(error){window.prompt('請手動複製位置：',value);}
}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,2300);}
function setTheme(theme){document.documentElement.dataset.theme=theme;document.getElementById('theme').textContent=theme==='dark'?'☀ 淺色模式':'☾ 深色模式';try{localStorage.setItem('tag-radar-theme',theme);}catch(error){}}
let theme='dark';try{theme=localStorage.getItem('tag-radar-theme')||theme;}catch(error){}setTheme(theme==='light'?'light':'dark');
document.getElementById('theme').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
document.getElementById('search').addEventListener('input',renderList);document.getElementById('category').addEventListener('change',renderList);document.getElementById('level').addEventListener('change',()=>{kind='all';locationQuery='';renderList();});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();document.getElementById('search').focus();}});
renderList();
</script></body></html>'''


def open_dashboard():
    """用系統預設瀏覽器開啟面板；尚未生成時先掃描生成。"""
    dashboard = Path(OUTPUT_FILE).resolve()
    if not dashboard.is_file():
        print('尚未生成 HTML 儀表板，先掃描並生成…')
        scan_tags(generate_html=True)
    if not dashboard.is_file():
        print(styled('HTML 儀表板未成功生成：' + str(dashboard), 'red'))
        return False
    try:
        opened = webbrowser.open(dashboard.as_uri(), new=2)
    except (webbrowser.Error, OSError) as error:
        print(styled('無法自動開啟瀏覽器：' + str(error), 'yellow'))
        opened = False
    if opened:
        print(styled('已請求預設瀏覽器開啟：' + str(dashboard), 'green'))
    else:
        print('請手動在瀏覽器開啟：' + str(dashboard))
    return opened


def main(argv=None):
    global PROJECTS_DIR, OUTPUT_FILE, USE_COLOR
    parser = argparse.ArgumentParser(description='Azustock 標籤 (tags & Markdown 高光) 掃描、detail.json 定位、修改與 HTML 儀表板')
    parser.add_argument('--projects', default=PROJECTS_DIR, help='專案目錄（預設 projects）')
    parser.add_argument('--output', default=OUTPUT_FILE, help='HTML 輸出位置（預設 ./tools/tracker/reports/tag_dashboard.html）')
    parser.add_argument('--scan', action='store_true', help='掃描並結束，不進入選單')
    parser.add_argument('--open', action='store_true', help='使用預設瀏覽器開啟 HTML；檔案不存在時先生成')
    parser.add_argument('--query', help='搜尋標籤名稱、標題、detail.json 路徑或內文（不分大小寫）')
    parser.add_argument('--file', default='', help='只顯示或修改 detail.json 路徑／ID／標題含此文字的位置')
    parser.add_argument('--kind', choices=['all', 'projects', 'articles', 'markdown'], default='all',
                        help='顯示或修改全部／專案層級(projects)／文章層級(articles)／內文高光(markdown)')
    parser.add_argument('--category', choices=['all', 'status', 'custom', 'markdown', 'expired'], default='all',
                        help='all 全部／status 系統狀態／custom 自訂標籤／markdown 內文高光／expired 已過期時效')
    parser.add_argument('--exact', action='store_true', help='只查詢完整標籤名稱')
    parser.add_argument('--list', action='store_true', help='只列出標籤與關聯 detail.json 數量摘要')
    parser.add_argument('--unset', action='store_true', help='列出未設定任何標籤的專案與文章 detail.json')
    parser.add_argument('--add', metavar='TAG', help='將指定標籤新增至符合 --file 與 --kind 的 detail.json tags 陣列')
    parser.add_argument('--remove', metavar='TAG', help='從符合 --file 與 --kind 的 detail.json tags 陣列移除指定標籤')
    parser.add_argument('--replace', nargs=2, metavar=('OLD_TAG', 'NEW_TAG'),
                        help='將 detail.json 與 Markdown 內文高光中的舊標籤批次替換為新標籤')
    parser.add_argument('--yes', '-y', action='store_true', help='搭配 --add / --remove / --replace 時略過確認提示')
    parser.add_argument('--no-html', action='store_true', help='不產生 HTML')
    parser.add_argument('--plain', action='store_true', help='關閉終端機色彩')
    args = parser.parse_args(argv)

    if args.exact and args.query is None:
        parser.error('--exact 需搭配 --query')
    if args.open and args.no_html:
        parser.error('--open 不能搭配 --no-html')
    if sum(bool(x) for x in (args.add, args.remove, args.replace)) > 1:
        parser.error('--add、--remove 與 --replace 每次只能擇一使用')
    if (args.add or args.remove) and not args.file:
        parser.error('使用 --add 或 --remove 時請搭配 --file 指定目標（若要套用全部請傳入 --file *）')

    PROJECTS_DIR, OUTPUT_FILE = args.projects, args.output
    USE_COLOR = USE_COLOR and not args.plain
    if USE_COLOR and os.name == 'nt':
        try:
            import ctypes
            handle = ctypes.windll.kernel32.GetStdHandle(-11)
            mode = ctypes.c_ulong()
            USE_COLOR = bool(ctypes.windll.kernel32.GetConsoleMode(handle, ctypes.byref(mode))
                             and ctypes.windll.kernel32.SetConsoleMode(handle, mode.value | 4))
        except (AttributeError, OSError):
            USE_COLOR = False

    try:
        # CLI 直接修改模式 (--add / --remove / --replace)
        if args.add or args.remove or args.replace:
            target_filter = '' if args.file == '*' else args.file
            if args.replace:
                old_t, new_t = args.replace
                plans = plan_tag_changes('replace', target_tag=old_t, new_tag=new_t,
                                         file_filter=target_filter, kind=args.kind)
            elif args.add:
                plans = plan_tag_changes('add', new_tag=args.add,
                                         file_filter=target_filter, kind=args.kind)
            else:
                plans = plan_tag_changes('remove', target_tag=args.remove,
                                         file_filter=target_filter, kind=args.kind)
            if not plans:
                print('沒有需要修改的檔案。')
                return 0
            for plan in plans:
                c = plan['change']
                print('  ' + styled(plan['path'].resolve()) + f":{c['line']}:{c['column']} ({plan['target_id']} · {plan['title']})")
                print('    ' + styled(c['before'], 'yellow') + ' → ' + styled(c['after'], 'green'))
            if not args.yes:
                if input(f'共 {len(plans)} 個檔案，套用以上修改？[y/N] > ').strip().lower() not in ('y', 'yes'):
                    print('已取消，檔案未修改。')
                    return 0
            files, errors = apply_tag_changes(plans)
            print(f'完成：修改 {files} 個檔案。')
            for err in errors:
                print(styled('更新失敗：' + err, 'red'))
            scan_tags(generate_html=not args.no_html)
            if args.open:
                return 0 if open_dashboard() else 1
            return 0 if not errors else 1

        # CLI 直接查詢／掃描模式
        direct_query = (
            args.query is not None or bool(args.file) or args.kind != 'all'
            or args.list or args.category != 'all' or args.unset
        )
        if args.scan or direct_query:
            scan_tags(generate_html=not args.no_html)
            if args.unset:
                print_unset_targets(args.query or args.file, args.kind)
            elif direct_query:
                print_query(args.query or '', args.file, args.kind, args.exact, args.list, args.category)
            if args.open:
                return 0 if open_dashboard() else 1
            return 0
        if args.open:
            return 0 if open_dashboard() else 1

        # 互動式選單模式
        while True:
            exp_days = detect_tag_expire_days()
            print(styled('\n─────────────────────────────────────\n'
                         f'  AZUSTOCK · 標籤追蹤管理員 (時效: {exp_days} 天)\n'
                         '─────────────────────────────────────', 'bold'))
            print('  [0] 離開')
            print('  [1] 掃描 detail.json 標籤與 .md 高光並生成 HTML（預設）')
            print('  [2] 列出標籤數量統計摘要')
            print('  [3] 批次替換標籤 (舊 Tag → 新 Tag，含 detail.json 與 .md 高光)')
            print('  [4] 查詢標籤與所在 detail.json 位置 (含內文高光、未設定與過期查詢)')
            print('  [5] 開啟 HTML 儀表板')
            print('  [6] 管理 detail.json 標籤（新增／移除指定目標 Tag）')
            choice = input('\n操作 [0/1/2/3/4/5/6] > ').strip().lower()
            try:
                match choice:
                    case '0' | 'q':
                        return 0
                    case '' | '1':
                        scan_tags(generate_html=not args.no_html)
                    case '2':
                        if not scanned:
                            scan_tags(generate_html=False)
                        print_query(summary_only=True)
                    case '3':
                        replace_tag_interactive(generate_html=not args.no_html)
                    case '4':
                        query_tags_interactive()
                    case '5':
                        open_dashboard()
                    case '6':
                        manage_target_tags(generate_html=not args.no_html)
                    case _:
                        print('請輸入 0～6，或 q 離開。')
            except (OSError, UnicodeError, ValueError) as error:
                print(styled('操作失敗：' + str(error), 'red'))
    except (OSError, UnicodeError, ValueError) as error:
        print(styled('操作失敗：' + str(error), 'red'), file=sys.stderr)
        return 1
    except (EOFError, KeyboardInterrupt):
        print('\n已離開標籤追蹤管理員。')
        return 0


if __name__ == '__main__':
    sys.exit(main())
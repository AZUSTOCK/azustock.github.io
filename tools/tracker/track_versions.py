"""Azustock 版本相容管理員 (min_sys_version) U0.0.1

互動選單：python track_versions.py
直接查詢：python track_versions.py --query U1.6.1 --no-html
查詢位置：python track_versions.py --file 02_mind --kind articles --no-html
查詢未設：python track_versions.py --unset --no-html
設定版本：python track_versions.py --set U1.6.1 --file my_article --no-html
移除版本：python track_versions.py --remove --file my_article --no-html
批次替換：python track_versions.py --replace U1.6.0 U1.6.1 --no-html
產生面板：python track_versions.py --scan
開啟面板：python track_versions.py --open
自訂目錄：python track_versions.py --projects ./projects --output ./private/version_dashboard.html
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
from tools.tracker.tracker_common import (TrackerApp, styled, classify_detail_path, json_field_spans, apply_changes, location, print_unset_targets_list, source_path)

from tools.common.paths import ROOT_DIR
PROJECTS_DIR = str(ROOT_DIR / "projects")
OUTPUT_FILE = str(ROOT_DIR / "tools/tracker/reports/version_dashboard.html")

results = {}
all_targets = []
scan_info = {}
scanned = False
USE_COLOR = sys.stdout.isatty() and 'NO_COLOR' not in os.environ


def parse_version_tuple(version_str):
    """與 main.js compareVersions 一致：取出數字序列進行 SemVer 比較。"""
    cleaned = re.sub(r'[^0-9.]', '', str(version_str or ''))
    parts = [int(x) for x in cleaned.split('.') if x.isdigit()]
    return parts or [0]


def compare_versions(v1, v2):
    """回傳 1 (v1 > v2)、-1 (v1 < v2) 或 0 (相等)。"""
    p1 = parse_version_tuple(v1)
    p2 = parse_version_tuple(v2)
    length = max(len(p1), len(p2))
    for i in range(length):
        n1 = p1[i] if i < len(p1) else 0
        n2 = p2[i] if i < len(p2) else 0
        if n1 > n2:
            return 1
        if n1 < n2:
            return -1
    return 0


def version_sort_key(version_str):
    return (parse_version_tuple(version_str), str(version_str).casefold())


def detect_current_sys_version():
    """優先從 version.json 讀取目前系統版本，次之從 main.js 的 CONFIG.VERSION 讀取。"""
    ver_file = source_path(PROJECTS_DIR, 'version.json')
    if ver_file.is_file():
        try:
            data = json.loads(ver_file.read_text(encoding='utf-8-sig'))
            if isinstance(data, dict) and data.get('version'):
                return str(data['version']).strip()
        except (OSError, UnicodeError, ValueError):
            pass
    main_js = source_path(PROJECTS_DIR, 'main.js')
    if main_js.is_file():
        try:
            text = main_js.read_text(encoding='utf-8-sig')
            match = re.search(r'VERSION:\s*["\']([^"\']+)["\']', text)
            if match:
                return match.group(1).strip()
        except (OSError, UnicodeError):
            pass
    return 'UNKNOWN'


def add_record(version_str, record_type, file_path, line_num, column, raw_str,
               context, title, target_id, proj_version=None, effective_version=None):
    entry = results.setdefault(version_str, {'projects': [], 'articles': []})
    abs_path = os.path.abspath(file_path)
    context = context.strip()
    sys_ver = scan_info.get('sys_version', 'UNKNOWN')
    higher_than_sys = (
        compare_versions(version_str, sys_ver) > 0
        if sys_ver != 'UNKNOWN' else False
    )
    entry[record_type].append({
        'file': str(file_path).replace('\\', '/'),
        'line': line_num,
        'column': column,
        'raw': raw_str,
        'context': context[:240] + ('…' if len(context) > 240 else ''),
        'abs_path': urllib.parse.quote(abs_path.replace('\\', '/'), safe='/:'),
        'raw_abs': abs_path,
        'kind': record_type,
        'title': title,
        'target_id': target_id,
        'version': version_str,
        'proj_version': proj_version,
        'effective_version': effective_version or version_str,
        'higher_than_sys': higher_than_sys,
    })


def collect_versions():
    global results, all_targets, scan_info, scanned
    root_path = Path(PROJECTS_DIR)
    if not root_path.is_dir():
        raise FileNotFoundError('找不到專案目錄：' + os.path.abspath(PROJECTS_DIR))
    results = {}
    all_targets = []
    scanned = False
    total_files, errors = 0, []
    sys_ver = detect_current_sys_version()
    scan_info = {
        'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'files': 0,
        'errors': errors,
        'root': os.path.abspath(PROJECTS_DIR),
        'sys_version': sys_ver,
        'unset_projects': 0,
        'unset_articles': 0,
    }

    raw_items = []
    proj_version_map = {}

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
                title = str(data.get('title') or (art_id if kind == 'articles' else proj_id))
                target_id = f'{proj_id} / {art_id}' if kind == 'articles' else str(proj_id)

                raw_val = data.get('min_sys_version')
                has_ver = raw_val is not None and not isinstance(raw_val, bool) and str(raw_val).strip() != ''
                ver_str = str(raw_val).strip() if has_ver else None

                if kind == 'projects' and ver_str:
                    proj_version_map[proj_id] = ver_str

                raw_items.append({
                    'path': path,
                    'text': text,
                    'kind': kind,
                    'proj_id': proj_id,
                    'art_id': art_id,
                    'target_id': target_id,
                    'title': title,
                    'version': ver_str,
                    'field': field_map.get('min_sys_version'),
                })
            except (OSError, UnicodeError, ValueError) as error:
                errors.append(path + ': ' + str(error))

    for item in raw_items:
        kind = item['kind']
        ver_str = item['version']
        proj_ver = proj_version_map.get(item['proj_id'])
        eff_ver = ver_str
        if kind == 'articles':
            if ver_str and proj_ver:
                eff_ver = ver_str if compare_versions(ver_str, proj_ver) >= 0 else proj_ver
            elif not ver_str and proj_ver:
                eff_ver = proj_ver

        all_targets.append({
            'file': str(item['path']).replace('\\', '/'),
            'raw_abs': os.path.abspath(item['path']),
            'abs_path': urllib.parse.quote(os.path.abspath(item['path']).replace('\\', '/'), safe='/:'),
            'kind': kind,
            'proj_id': item['proj_id'],
            'art_id': item['art_id'],
            'target_id': item['target_id'],
            'title': item['title'],
            'version': ver_str,
            'proj_version': proj_ver if kind == 'articles' else None,
            'effective_version': eff_ver,
            'line': item['field']['line'] if item['field'] else 1,
            'column': item['field']['column'] if item['field'] else 1,
        })

        if not ver_str:
            if kind == 'projects':
                scan_info['unset_projects'] += 1
            else:
                scan_info['unset_articles'] += 1
            continue

        lines = item['text'].splitlines()
        field_info = item['field']
        line_num = field_info['line'] if field_info else 1
        col_num = field_info['column'] if field_info else 1
        line_text = lines[line_num - 1] if 1 <= line_num <= len(lines) else ''
        label = 'Project min_sys_version' if kind == 'projects' else 'Article min_sys_version'
        extra = ''
        if kind == 'articles' and proj_ver:
            extra = f' (專案要求: {proj_ver} → 生效: {eff_ver})'
        raw_display = f'[{label}] {ver_str} · {item["target_id"]} ({item["title"]}){extra}'

        add_record(
            ver_str, kind, item['path'], line_num, col_num,
            raw_display, line_text, item['title'], item['target_id'],
            proj_version=proj_ver if kind == 'articles' else None,
            effective_version=eff_ver
        )

    scan_info['files'] = total_files
    scanned = True
    return results


def version_state(ver_str):
    sys_ver = scan_info.get('sys_version', 'UNKNOWN')
    if sys_ver != 'UNKNOWN' and compare_versions(ver_str, sys_ver) > 0:
        return 'higher'
    return 'compatible'


def search_records(query='', file_filter='', kind='all', exact=False, status_filter='all'):
    """版本名稱符合時顯示全部位置；否則僅顯示位置／標題／語法／內文符合的紀錄。"""
    query_cf, file_cf = query.casefold(), file_filter.casefold()
    found = {}
    for ver in sorted(results, key=version_sort_key, reverse=True):
        state = version_state(ver)
        if status_filter != 'all' and state != status_filter:
            continue
        ver_match = ver.casefold() == query_cf if exact else query_cf in ver.casefold()
        if exact and not ver_match:
            continue
        matches = {'projects': [], 'articles': []}
        for record_type in ('projects', 'articles'):
            if kind != 'all' and record_type != kind:
                continue
            for item in results[ver][record_type]:
                if file_cf and file_cf not in item['file'].casefold() and file_cf not in item['target_id'].casefold():
                    continue
                if ver_match or any(query_cf in str(item[field]).casefold()
                                    for field in ('file', 'raw', 'context', 'title', 'target_id')):
                    matches[record_type].append(item)
        if matches['projects'] or matches['articles']:
            found[ver] = matches
    return found


def print_query(query='', file_filter='', kind='all', exact=False, summary_only=False, status_filter='all'):
    found = search_records(query, file_filter, kind, exact, status_filter)
    sys_ver = scan_info.get('sys_version', 'UNKNOWN')
    print(styled(f'\n查詢結果 · {len(found)} 種 min_sys_version（目前系統：{sys_ver}）', 'bold'))
    if not found:
        print('沒有符合條件的 min_sys_version 或位置。')
        return found
    for ver, matches in found.items():
        entry = results[ver]
        state = version_state(ver)
        status_label = '高於系統版本 (觸發重啟)' if state == 'higher' else '相容於目前系統'
        status_color = 'red' if state == 'higher' else 'green'
        print(styled(ver, 'yellow') + '  [' + styled(status_label, status_color) + ']  專案 {} / 文章 {}'.format(
            len(entry['projects']), len(entry['articles'])))
        if summary_only:
            continue
        for record_type, label, color in [('projects', '專案層級', 'green'), ('articles', '文章層級', 'cyan')]:
            for item in matches[record_type]:
                print('  ' + styled(label, color) + '  {}  {}:{}:{}'.format(
                    styled(f"[{item['target_id']}] {item['title']}", 'bold'),
                    styled(item['file']), item['line'], item['column']))
                print('    資訊：' + styled(item['raw']))
                print('    內文：' + styled(item['context']))
                print('    位置：' + styled('{}:{}:{}'.format(
                    item['raw_abs'], item['line'], item['column'])))
    return found


def print_unset_targets(query='', kind='all'):
    """列出尚未設定 min_sys_version 的專案或文章 detail.json。"""
    if not scanned:
        scan_versions(generate_html=False)
    return print_unset_targets_list(
        all_targets,
        is_unset=lambda t: not t['version'],
        heading='未設定 min_sys_version 的目標',
        query=query,
        kind=kind,
        note_fn=lambda t: f" (繼承專案版本: {t['proj_version']})" if t.get('proj_version') else '',
        location_fn=lambda t: f"    位置：{t['raw_abs']}:1:1",
    )


def query_versions():
    if not scanned:
        scan_versions(generate_html=False)
    status_filter = 'all'
    while True:
        print('\n搜尋版本號、專案／文章標題、檔案路徑或內文；空白列出全部，:unset 列出未設定項目，q 返回。')
        print('狀態篩選：:higher 高於系統／:compat 相容／:all 全部；目前：' +
              {'all': '全部', 'higher': '高於系統', 'compatible': '相容'}[status_filter])
        query = input('搜尋 > ').strip()
        if query.lower() == 'q':
            return
        if query.lower() == ':unset':
            sub = input('篩選未設定項目（關鍵字，空白全部） > ').strip()
            print_unset_targets(sub)
            continue
        if query.lower() in (':higher', ':compat', ':all'):
            status_filter = {':higher': 'higher', ':compat': 'compatible', ':all': 'all'}[query.lower()]
            print_query(status_filter=status_filter)
            continue
        print_query(query, status_filter=status_filter)


def mutate_json_min_sys_version(text, new_version):
    """在不動到其他欄位排版與順序的前提下，新增、修改或移除(new_version=None) min_sys_version。"""
    open_brace_idx, fields = json_field_spans(text)
    nl = '\r\n' if '\r\n' in text else '\n'
    target_idx = next((i for i, f in enumerate(fields) if f['name'] == 'min_sys_version'), None)

    if new_version is not None:
        encoded_val = json.dumps(str(new_version), ensure_ascii=False)
        if target_idx is not None:
            f = fields[target_idx]
            if str(f['value']) == str(new_version):
                return text, None
            before_line = text.splitlines()[f['line'] - 1].strip()
            modified = text[:f['val_start']] + encoded_val + text[f['val_end']:]
            after_line = modified.splitlines()[f['line'] - 1].strip()
            json.loads(modified)
            return modified, {'line': f['line'], 'before': before_line, 'after': after_line}
        else:
            # 尚未存在 min_sys_version：優先插在 version 或 title 欄位之後，否則插在第一個欄位後
            if fields:
                anchor = next((f for f in fields if f['name'] in ('version', 'title')), fields[0])
                line_start = text.rfind('\n', 0, anchor['key_start']) + 1
                indent_match = re.match(r'[ \t]*', text[line_start:anchor['key_start']])
                indent = indent_match.group(0) if indent_match else '  '
                insert_str = f',{nl}{indent}"min_sys_version": {encoded_val}'
                modified = text[:anchor['val_end']] + insert_str + text[anchor['val_end']:]
                inserted_line = text.count('\n', 0, anchor['val_end']) + 2
                json.loads(modified)
                return modified, {
                    'line': inserted_line,
                    'before': '(未設定 min_sys_version)',
                    'after': f'"min_sys_version": {encoded_val}',
                }
            else:
                close_brace_idx = text.rfind('}')
                modified = (
                    text[:open_brace_idx + 1]
                    + f'{nl}  "min_sys_version": {encoded_val}{nl}'
                    + text[close_brace_idx:]
                )
                json.loads(modified)
                return modified, {
                    'line': 2,
                    'before': '(未設定 min_sys_version)',
                    'after': f'"min_sys_version": {encoded_val}',
                }
    else:
        # 移除 min_sys_version
        if target_idx is None:
            return text, None
        f = fields[target_idx]
        before_line = text.splitlines()[f['line'] - 1].strip()
        if f['comma_idx'] is not None:
            # 後方有逗號：連同該行縮排與後方換行一併移除
            line_start = text.rfind('\n', 0, f['key_start']) + 1
            if text[line_start:f['key_start']].strip() == '':
                remove_start = line_start
            else:
                remove_start = f['key_start']
            remove_end = f['comma_idx'] + 1
            while remove_end < len(text) and text[remove_end] in (' ', '\t'):
                remove_end += 1
            if remove_end < len(text) and text[remove_end:remove_end + 2] == '\r\n':
                remove_end += 2
            elif remove_end < len(text) and text[remove_end] == '\n':
                remove_end += 1
            modified = text[:remove_start] + text[remove_end:]
        elif target_idx > 0:
            # 是最後一個欄位且前方有欄位：從前一個欄位的逗號移除到自身結尾
            prev_f = fields[target_idx - 1]
            remove_start = prev_f['comma_idx'] if prev_f['comma_idx'] is not None else prev_f['val_end']
            modified = text[:remove_start] + text[f['val_end']:]
        else:
            # 物件中唯一欄位
            modified = text[:f['key_start']] + text[f['val_end']:]
        json.loads(modified)
        return modified, {'line': f['line'], 'before': before_line, 'after': '(已移除 min_sys_version)'}


def plan_version_changes(new_version, file_filter='', kind='all', only_existing=False, old_version_filter=None):
    """規劃 detail.json 的 min_sys_version 變更，保留 UTF-8 BOM 與原本排版。"""
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
            if kind != 'all' and item_kind != kind:
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

            cur_val = data.get('min_sys_version')
            has_cur = cur_val is not None and not isinstance(cur_val, bool) and str(cur_val).strip() != ''
            cur_str = str(cur_val).strip() if has_cur else None

            if only_existing and not has_cur:
                continue
            if old_version_filter is not None and cur_str != old_version_filter:
                continue

            modified, change = mutate_json_min_sys_version(text, new_version)
            if change:
                bom = b'\xef\xbb\xbf' if original.startswith(b'\xef\xbb\xbf') else b''
                plans.append({
                    'path': path,
                    'target_id': target_id,
                    'title': title,
                    'kind': item_kind,
                    'before': original,
                    'after': bom + modified.encode('utf-8'),
                    'change': change,
                })
    return plans


def replace_version_interactive(generate_html=True):
    """將特定的舊 min_sys_version 批次替換為新版本號。"""
    if not scanned:
        scan_versions(generate_html=False)
    print(styled('\n批次版本替換引擎 · 安全替換指定 min_sys_version', 'bold'))
    if results:
        existing_list = ', '.join(sorted(results.keys(), key=version_sort_key, reverse=True))
        print('目前使用中的版本號：' + styled(existing_list, 'yellow'))
    old_ver = input('請輸入要替換的【舊】版本號（空白返回） > ').strip()
    if not old_ver:
        return
    new_ver = input('請輸入要替換為【新】的版本號（空白返回） > ').strip()
    if not new_ver or old_ver == new_ver:
        return
    file_filter = input('限定檔案路徑／專案 ID／標題（空白處理全部符合項目） > ').strip()

    plans = plan_version_changes(new_ver, file_filter=file_filter, only_existing=True, old_version_filter=old_ver)
    if not plans:
        print(f'沒有找到 min_sys_version 為 [{old_ver}] 的符合項目。')
        return
    for plan in plans:
        c = plan['change']
        print('  ' + styled(plan['path']) + ':' + str(c['line']) + f"  [{plan['target_id']} · {plan['title']}]")
        print('    ' + styled(c['before'], 'yellow') + ' → ' + styled(c['after'], 'green'))
    print(f'共 {len(plans)} 個 detail.json 將被更新；寫入前會保留 .version.bak 備份。')
    if input('套用以上修改？[y/N] > ').strip().lower() not in ('y', 'yes'):
        print('已取消，檔案未修改。')
        return
    files, errors = apply_version_changes(plans)
    print(f'完成：成功修改 {files} 個 detail.json。')
    for error in errors:
        print(styled('更新失敗：' + error, 'red'))
    if files:
        scan_versions(generate_html=generate_html)


def manage_target_version(generate_html=True):
    """針對特定專案或文章新增、修改或移除 min_sys_version。"""
    if not scanned:
        scan_versions(generate_html=False)
    sys_ver = scan_info.get('sys_version', 'UNKNOWN')
    print(styled(f'\n管理 min_sys_version · 新增／修改／移除（目前系統版本：{sys_ver}）', 'bold'))
    action = input('[1] 設定／修改 min_sys_version  [2] 移除 min_sys_version（空白返回） > ').strip()
    if action not in ('1', '2'):
        return

    kind_input = input('限定層級 [all: 全部 / p: 僅專案 / a: 僅文章]（預設 all） > ').strip().lower()
    kind = {'p': 'projects', 'projects': 'projects', 'a': 'articles', 'articles': 'articles'}.get(kind_input, 'all')

    file_filter = input('輸入目標路徑、專案／文章 ID 或標題關鍵字（輸入 * 選擇全部，空白返回） > ').strip()
    if not file_filter:
        return
    if file_filter == '*':
        file_filter = ''

    if action == '1':
        default_hint = f'（直接按 Enter 套用目前系統版本 {sys_ver}）' if sys_ver != 'UNKNOWN' else ''
        new_ver = input(f'輸入要設定的 min_sys_version 版號 {default_hint} > ').strip()
        if not new_ver and sys_ver != 'UNKNOWN':
            new_ver = sys_ver
        if not new_ver:
            print('未輸入版本號，已取消。')
            return
        plans = plan_version_changes(new_ver, file_filter=file_filter, kind=kind, only_existing=False)
    else:
        plans = plan_version_changes(None, file_filter=file_filter, kind=kind, only_existing=True)

    if not plans:
        print('沒有需要變更的 detail.json：可能已是指定狀態，或沒有符合關鍵字的檔案。')
        return

    print(styled(f'\n預覽變更 · 共 {len(plans)} 個檔案：', 'bold'))
    for plan in plans:
        c = plan['change']
        label = '專案' if plan['kind'] == 'projects' else '文章'
        print(f"  [{label}] " + styled(plan['path']) + ':' + str(c['line']) + f" ({plan['target_id']} · {plan['title']})")
        print('    ' + styled(c['before'], 'yellow') + ' → ' + styled(c['after'], 'green'))
    print(f'共 {len(plans)} 個 detail.json；寫入前會保留 .version.bak 備份。')
    if input('套用以上修改？[y/N] > ').strip().lower() not in ('y', 'yes'):
        print('已取消，檔案未修改。')
        return
    files, errors = apply_version_changes(plans)
    print(f'完成：修改 {files} 個 detail.json。')
    for error in errors:
        print(styled('更新失敗：' + error, 'red'))
    if files:
        scan_versions(generate_html=generate_html)


class VersionsTracker(TrackerApp):
    slug = 'versions'
    title = '版本相容管理員'
    description = '追蹤 min_sys_version 與專案、文章的有效版本要求。'
    backup_tag = 'version'
    mutation_label = '批次替換版本號（舊版號 → 新版號）'
    manage_label = '管理 min_sys_version（新增／修改／移除）'
    filters = (dict(key='status', label='相容狀態', options=[['all','全部狀態'],['compatible','相容'],['higher','高於系統版本'],['unknown','系統版本未知']]),)

    def add_arguments(self, parser):
        parser.add_argument('--status', choices=['all','compatible','higher','unknown'], default='all')
        parser.add_argument('--set', metavar='VERSION')
        parser.add_argument('--remove', action='store_true')
        parser.add_argument('--replace', nargs=2, metavar=('OLD_VER','NEW_VER'))

    def validate(self, args, parser):
        if sum(x is not None and x is not False for x in (args.set,args.remove,args.replace)) > 1:
            parser.error('--set、--remove 與 --replace 每次只能擇一')
        if (args.set is not None or args.remove) and not args.file:
            parser.error('修改請搭配 --file；套用全部請使用 --file "*"')
        if args.set is not None and not args.set.strip():
            parser.error('--set 不可為空白')

    def collect(self):
        collect_versions()

    def report(self):
        def enrich(item):
            effective = item.get('effective_version')
            current = scan_info.get('sys_version','UNKNOWN')
            status = 'unknown' if current=='UNKNOWN' else 'higher' if effective and compare_versions(effective,current)>0 else 'compatible'
            return dict(item, **location(item), raw=item.get('raw', '(未設定 min_sys_version)'), status=status,
                        badges=[status], meta={'自身版本':item.get('version') or '(未設定)',
                                             '專案要求':item.get('proj_version') or '—',
                                             '有效最低版本':effective or '—'})
        groups = [dict(name=name, records=[enrich(item) for items in entry.values() for item in items])
                  for name,entry in sorted(results.items(),key=lambda p:version_sort_key(p[0]), reverse=True)]
        return dict(groups=groups, unset=[enrich(t) for t in all_targets if not t.get('version')])

    def query(self, args):
        # 以有效最低版本判斷相容性，包含文章繼承的專案要求。
        return super().query(args)

    def unset(self, args):
        return super().unset(args)

    def mutate_cli(self, args):
        if args.set is None and not args.remove and args.replace is None:
            return None
        file_filter = '' if args.file=='*' else args.file
        if args.replace:
            plans = plan_version_changes(args.replace[1], file_filter, args.kind, True, args.replace[0])
        else:
            plans = plan_version_changes(args.set, file_filter, args.kind, args.remove)
        return self.apply(plans, args.yes, not args.no_html)

    def interactive_query(self):
        # 統一查詢入口亦支援 :unset；保留原查詢函式供外部呼叫。
        return super().interactive_query()

    def interactive_mutate(self):
        replace_version_interactive(generate_html=not self.no_html)

    def interactive_manage(self):
        manage_target_version(generate_html=not self.no_html)


APP = VersionsTracker(globals())


def scan_versions(generate_html=True):
    return APP.scan(generate_html)


def write_dashboard():
    return APP.write_dashboard()


def open_dashboard():
    return APP.open_dashboard()


def apply_version_changes(plans):
    global scanned
    count, _, errors = apply_changes(plans, 'version')
    if count:
        scanned = False
    return count, errors


def main(argv=None):
    return APP.run(argv)


if __name__ == "__main__":
    sys.exit(main())

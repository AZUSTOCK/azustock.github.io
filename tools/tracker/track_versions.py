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
OUTPUT_FILE = './tools/tracker/reports/version_dashboard.html'

results = {}
all_targets = []
scan_info = {}
scanned = False
USE_COLOR = sys.stdout.isatty() and 'NO_COLOR' not in os.environ


def styled(value, color='cyan'):
    codes = {'cyan': '36', 'green': '32', 'yellow': '33', 'red': '31', 'bold': '1'}
    value = re.sub(r'[\x00-\x08\x0b-\x1f\x7f-\x9f]', '', str(value))
    return '\033[' + codes[color] + 'm' + value + '\033[0m' if USE_COLOR else value


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
    ver_file = Path('version.json')
    if ver_file.is_file():
        try:
            data = json.loads(ver_file.read_text(encoding='utf-8-sig'))
            if isinstance(data, dict) and data.get('version'):
                return str(data['version']).strip()
        except (OSError, UnicodeError, ValueError):
            pass
    main_js = Path('main.js')
    if main_js.is_file():
        try:
            text = main_js.read_text(encoding='utf-8-sig')
            match = re.search(r'VERSION:\s*["\']([^"\']+)["\']', text)
            if match:
                return match.group(1).strip()
        except (OSError, UnicodeError):
            pass
    return 'UNKNOWN'


def parse_folder_id(folder_name):
    match = re.match(r'^(-?\d+)_+(.*)$', folder_name)
    return match.group(2) if match else folder_name


def json_field_spans(text):
    """以 JSON 解碼器逐一走過頂層欄位，記錄各欄位的起訖索引與行號，避開巢狀同名欄位。"""
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


def scan_versions(generate_html=True):
    print(styled('\n版本雷達 · 掃描 ' + os.path.abspath(PROJECTS_DIR), 'bold'))
    collect_versions()
    proj_count = sum(len(v['projects']) for v in results.values())
    art_count = sum(len(v['articles']) for v in results.values())
    sys_ver = scan_info.get('sys_version', 'UNKNOWN')
    print(styled('完成', 'green') + '  目前系統版本：{} / {} 個 detail.json / {} 種版本號 / 專案設定 {} 筆 / 文章設定 {} 筆'.format(
        styled(sys_ver, 'cyan'), scan_info['files'], len(results), proj_count, art_count))
    print('未設定 min_sys_version：專案 {} 個 / 文章 {} 篇'.format(
        scan_info['unset_projects'], scan_info['unset_articles']))
    for error in scan_info['errors']:
        print(styled('略過：' + error, 'yellow'))
    if generate_html:
        write_dashboard()
        print('HTML：' + styled(os.path.abspath(OUTPUT_FILE)))
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
    q = query.casefold()
    items = [
        t for t in all_targets
        if not t['version']
        and (kind == 'all' or t['kind'] == kind)
        and (not q or any(q in str(t[f]).casefold() for f in ('file', 'title', 'target_id')))
    ]
    print(styled(f'\n未設定 min_sys_version 的目標 · 共 {len(items)} 筆', 'bold'))
    if not items:
        print('沒有符合條件的未設定項目。')
        return items
    for t in items:
        label = '專案' if t['kind'] == 'projects' else '文章'
        color = 'green' if t['kind'] == 'projects' else 'cyan'
        inherited = f" (繼承專案版本: {t['proj_version']})" if t.get('proj_version') else ''
        print(f"  [{styled(label, color)}] {styled(t['target_id'], 'yellow')} ({t['title']}){inherited}")
        print(f"    位置：{t['raw_abs']}:1:1")
    return items


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


def apply_version_changes(plans):
    """先檢查檔案有無變動，再逐檔建立 .version.bak 備份並以原子替換寫回。"""
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
            backup = Path(str(path) + '.version.bak')
            index = 1
            while True:
                try:
                    with backup.open('xb') as stream:
                        stream.write(plan['before'])
                    break
                except FileExistsError:
                    backup = Path(str(path) + f'.version.{index}.bak')
                    index += 1
            with tempfile.NamedTemporaryFile(mode='wb', dir=path.parent, delete=False) as stream:
                temporary = Path(stream.name)
                stream.write(plan['after'])
            temporary.chmod(path.stat().st_mode)
            os.replace(temporary, path)
            scanned = False
            changed_files += 1
            print('  已更新：' + styled(path) + f" [{plan['target_id']}]（備份：" + styled(backup) + '）')
        except (OSError, UnicodeError, ValueError) as error:
            errors.append(str(path) + ': ' + str(error))
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
    return changed_files, errors


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


def write_dashboard():
    payload = json.dumps({
        'versions': results,
        'targets': all_targets,
        'scan': scan_info,
    }, ensure_ascii=False)
    payload = payload.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    Path(OUTPUT_FILE).write_text(HTML_TEMPLATE.replace('@@PAYLOAD@@', payload), encoding='utf-8')


HTML_TEMPLATE = r'''<!DOCTYPE html>
<html lang="zh-Hant" data-theme="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Azustock · 版本相容管理員</title>
<style>
:root{color-scheme:dark;--bg:#111716;--panel:#19211f;--card:#1f2926;--text:#e9eee9;--muted:#9aa9a1;--line:#32413a;--accent:#b5d99a;--soft:#2c3e2e;--gold:#edc887;--bad:#e9a39c;--shadow:0 12px 36px #0002}
[data-theme=light]{color-scheme:light;--bg:#f4f5ef;--panel:#fafbf6;--card:#fff;--text:#26332c;--muted:#64736a;--line:#dce3d7;--accent:#436c37;--soft:#e8f0df;--gold:#8c6223;--bad:#a0493e;--shadow:0 12px 36px #2b42200a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}button,input,select{font:inherit}button,a,input,select{-webkit-tap-highlight-color:transparent}button{cursor:pointer}a{color:var(--accent);text-decoration:none}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:3px}button:disabled{opacity:.4;cursor:default}
.shell{display:grid;grid-template-columns:300px minmax(0,1fr);height:100vh;height:100dvh}.sidebar{background:var(--panel);border-right:1px solid var(--line);display:flex;flex-direction:column;min-height:0}.brand{padding:30px 24px 22px;border-bottom:1px solid var(--line)}.eyebrow{font-size:10px;letter-spacing:2.5px;color:var(--accent);font-weight:700}.brand h1{font-size:22px;letter-spacing:-.7px;margin:6px 0 0}.brand p{margin:3px 0;color:var(--muted);font-size:12px}.search-area{padding:20px 18px 12px}.search-area label{display:block;color:var(--muted);font-size:12px;margin-bottom:8px}input,select{background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:9px;padding:10px 12px;width:100%;min-width:0}input::placeholder{color:var(--muted)}.search-area select{margin-top:10px}.list-label{display:flex;justify-content:space-between;padding:8px 24px;color:var(--muted);font-size:11px}.key-list{overflow-y:auto;padding:0 12px 18px;flex:1;min-height:100px}.key-item{display:block;width:100%;text-align:left;padding:13px 14px;margin:3px 0;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--text)}.key-item:hover{background:var(--card)}.key-item.active{background:var(--soft);border-color:var(--line)}.key-name{display:block;font-weight:650;overflow-wrap:anywhere}.key-meta{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--muted);margin-top:4px}.dot{color:var(--bad)}.side-footer{padding:15px 24px;border-top:1px solid var(--line);color:var(--muted);font-size:11px;overflow-wrap:anywhere;white-space:pre-line}.main{overflow-y:auto;padding:32px 40px 48px;min-width:0}.topbar{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:24px}.topbar h2{font-size:24px;font-weight:600;margin:0;letter-spacing:-.6px}.topbar p{font-size:12px;color:var(--muted);margin:3px 0 0}.button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--line);border-radius:8px;padding:7px 11px;color:var(--text);background:var(--panel);font-size:12px;white-space:nowrap}.button:hover{background:var(--soft);border-color:var(--accent)}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:30px}.stat{padding:16px 20px;background:var(--panel);border:1px solid var(--line);border-radius:12px}.stat span{font-size:11px;color:var(--muted)}.stat strong{display:block;font-size:28px;line-height:1.5;font-weight:550}.stat small{font-size:11px;color:var(--muted)}.stat.warning strong{color:var(--bad)}.detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}.detail-head h3{font-size:25px;margin:0;letter-spacing:-.7px;overflow-wrap:anywhere}.detail-head p{color:var(--muted);font-size:12px;margin:6px 0}.badge{display:inline-flex;border:1px solid var(--line);border-radius:30px;padding:3px 10px;font-size:11px;color:var(--accent);white-space:nowrap;margin-right:6px}.badge.warn{color:var(--bad);border-color:var(--bad)}.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding-bottom:20px;border-bottom:1px solid var(--line)}.tab{border:1px solid var(--line);border-radius:8px;padding:7px 14px;color:var(--muted);background:transparent;font-size:12px}.tab.active{background:var(--soft);color:var(--accent);border-color:var(--accent)}.toolbar input{margin-left:auto;width:min(100%,280px);font-size:12px;padding:8px 12px}.section-title{display:flex;gap:10px;align-items:center;margin:24px 0 12px;font-size:14px;font-weight:600}.section-title span{font-size:11px;font-weight:400;color:var(--muted)}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr));gap:12px}.card{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:18px;box-shadow:var(--shadow);min-width:0}.card-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.path{font:12px/1.7 ui-monospace,Consolas,monospace;overflow-wrap:anywhere;color:var(--accent)}.line{font-size:10px;color:var(--muted);white-space:nowrap;background:var(--bg);border-radius:5px;padding:3px 7px}.raw{font:12px/1.7 ui-monospace,Consolas,monospace;color:var(--gold);margin:10px 0 8px;overflow-wrap:anywhere}.context{background:var(--bg);border-radius:7px;padding:12px;margin:8px 0 0;color:var(--muted);white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.8 ui-monospace,Consolas,monospace}.actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.actions .button{font-size:11px}.notice{border:1px dashed var(--line);border-radius:10px;padding:16px;color:var(--muted);font-size:12px}.notice.warn{color:var(--gold)}.empty{padding:60px 20px;text-align:center;color:var(--muted)}.empty strong{display:block;font-size:20px;color:var(--text);margin-bottom:8px}.navigation{display:flex;gap:6px}#toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text);color:var(--bg);padding:10px 18px;border-radius:10px;box-shadow:var(--shadow);z-index:10;max-width:90%;font-size:12px}.errors{margin-bottom:20px;color:var(--gold);font-size:12px}.errors pre{white-space:pre-wrap;overflow-wrap:anywhere}.tip{font-size:11px;color:var(--muted);margin-top:24px}#count{font-variant-numeric:tabular-nums}
@media(min-width:1500px){.main{padding-left:64px;padding-right:64px}.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:900px){.shell{grid-template-columns:245px minmax(0,1fr)}.main{padding:24px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.stat{padding:12px 16px}}
@media(max-width:640px){.shell{display:block;height:auto}.sidebar{border-right:0;border-bottom:1px solid var(--line)}.brand{padding:18px 20px 12px}.search-area{padding:14px 18px 8px}.key-list{max-height:220px;flex:auto}.side-footer{display:none}.main{overflow:visible;padding:22px 18px 40px}.topbar{align-items:flex-start}.topbar h2{font-size:22px}.stats{gap:8px;margin-bottom:24px}.stat strong{font-size:24px}.toolbar input{width:100%;margin-left:0}.detail-head h3{font-size:22px}}
</style>
</head>
<body>
<div class="shell">
<aside class="sidebar">
 <header class="brand"><div class="eyebrow">AZUSTOCK / VERSION RADAR</div><h1>版本相容管理員</h1><p>追蹤 min_sys_version 的分佈與相容狀態。</p></header>
 <div class="search-area"><label for="search">搜尋版本號、標題與檔案位置</label><input id="search" type="search" placeholder="版本號、專案、文章或路徑…"><select id="status" aria-label="相容狀態"><option value="all">全部狀態</option><option value="compatible">相容於目前系統</option><option value="higher">高於系統版本 (觸發重啟)</option></select><select id="level" aria-label="設定層級"><option value="all">全部設定層級</option><option value="projects">僅專案層級 (Project)</option><option value="articles">僅文章層級 (Article)</option></select></div>
 <div class="list-label"><span>版本索引</span><span id="count"></span></div><nav class="key-list" id="versionList" aria-label="版本索引"></nav>
 <footer class="side-footer" id="scanMeta"></footer>
</aside>
<main class="main">
 <header class="topbar"><div><h2>min_sys_version 總覽</h2><p id="sysVerBanner">檢視各專案與文章要求的最低系統版本。</p></div><button id="theme" class="button" type="button">切換主題</button></header>
 <div class="stats" id="stats"></div><details id="errors" class="errors" hidden><summary></summary><pre></pre></details>
 <div id="detail"></div><p class="tip">本頁為掃描時的快照；使用 track_versions.py 修改 detail.json 後請重新掃描。VS Code / Cursor 連結需在本機安裝對應編輯器。</p>
</main></div><div id="toast" role="status" hidden></div>
<script id="scanData" type="application/json">@@PAYLOAD@@</script>
<script>
'use strict';
const payload=JSON.parse(document.getElementById('scanData').textContent),db=payload.versions,scan=payload.scan;
const parseVer=v=>String(v||'').replace(/[^0-9.]/g,'').split('.').filter(Boolean).map(Number);
const cmpVer=(a,b)=>{const p1=parseVer(a),p2=parseVer(b),len=Math.max(p1.length,p2.length);for(let i=0;i<len;i++){const n1=p1[i]||0,n2=p2[i]||0;if(n1!==n2)return n2-n1;}return b.localeCompare(a);};
const versions=Object.keys(db).sort(cmpVer),list=document.getElementById('versionList'),detail=document.getElementById('detail');
let active=null,visible=[],kind='all',locationQuery='',toastTimer;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const records=ver=>[...db[ver].projects,...db[ver].articles];
const state=ver=>records(ver).some(item=>item.higher_than_sys)?'higher':'compatible';
const stateName={higher:'高於目前系統版本 (將觸發 CORE_UPDATE)',compatible:'相容於目前系統版本'};
const matches=(item,q)=>[item.file,item.raw,item.context,item.title,item.target_id].some(value=>String(value||'').toLowerCase().includes(q));
const total=type=>versions.reduce((sum,ver)=>sum+db[ver][type].length,0);
const levelMatches=item=>{const lv=document.getElementById('level').value;return lv==='all'||item.kind===lv;};
document.getElementById('sysVerBanner').textContent=`目前系統版本 (CONFIG.VERSION)：${scan.sys_version} · 未設定項目：專案 ${scan.unset_projects} 個 / 文章 ${scan.unset_articles} 篇`;
document.getElementById('stats').innerHTML=[['版本號總數',versions.length,`目前系統：${scan.sys_version}`],['專案層級設定',total('projects'),`未設定專案：${scan.unset_projects} 個`],['文章層級設定',total('articles'),`未設定文章：${scan.unset_articles} 篇`],['高於系統版本',versions.filter(v=>state(v)==='higher').length,'會觸發前端強制更新重啟']].map((s,i)=>`<div class="stat ${i===3&&s[1]>0?'warning':''}"><span>${s[0]}</span><strong>${s[1]}</strong><small>${s[2]}</small></div>`).join('');
document.getElementById('scanMeta').textContent=`掃描 ${scan.files} 個 detail.json · ${scan.time}\n${scan.root}`;
if(scan.errors.length){const el=document.getElementById('errors');el.hidden=false;el.querySelector('summary').textContent=`有 ${scan.errors.length} 項掃描失敗（點擊查看）`;el.querySelector('pre').textContent=scan.errors.join('\n');}
function renderList(){
 const q=document.getElementById('search').value.trim().toLowerCase(),status=document.getElementById('status').value;
 visible=versions.filter(ver=>{const eligible=records(ver).filter(levelMatches);return (status==='all'||state(ver)===status)&&eligible.length>0&&(!q||ver.toLowerCase().includes(q)||eligible.some(item=>matches(item,q)));});
 if(!visible.includes(active)){active=visible[0]||null;kind='all';locationQuery='';}
 document.getElementById('count').textContent=`${visible.length} / ${versions.length}`;
 list.replaceChildren();
 for(const ver of visible){const button=document.createElement('button');button.type='button';button.className='key-item'+(ver===active?' active':'');button.setAttribute('aria-current',ver===active?'true':'false');button.innerHTML=`<span class="key-name">${esc(ver)} ${state(ver)==='higher'?'<span class="dot">▲</span>':''}</span><span class="key-meta"><span>專案 ${db[ver].projects.length}</span><span>文章 ${db[ver].articles.length}</span></span>`;button.addEventListener('click',()=>{active=ver;kind='all';locationQuery='';renderList();});list.append(button);}
 if(!visible.length)list.innerHTML='<div class="notice">沒有符合條件的版本紀錄。</div>';
 renderDetail();
}
function createCard(item){
 const line=item.line,column=item.column||1,path=`${item.raw_abs}:${line}:${column}`;
 const badgeLabel=item.kind==='projects'?'專案層級 (Project)':'文章層級 (Article)';
 const inheritBadge=item.proj_version?`<span class="badge">所屬專案要求：${esc(item.proj_version)} · 實際生效：${esc(item.effective_version)}</span>`:'';
 return `<article class="card"><div class="card-header"><div class="path">${esc(item.file)}</div><span class="line">L${line} : ${column}</span></div><div class="raw">${esc(item.target_id)} · ${esc(item.title)}</div><div><span class="badge">${badgeLabel}</span>${inheritBadge}</div><pre class="context">${esc(item.context)}</pre><div class="actions"><a class="button" href="${esc('vscode://file/'+item.abs_path+':'+line+':'+column)}">VS Code ↗</a><a class="button" href="${esc('cursor://file/'+item.abs_path+':'+line+':'+column)}">Cursor ↗</a><button class="button" type="button" data-copy="${esc(path)}">複製位置</button></div></article>`;
}
function renderDetail(){
 if(!active){detail.innerHTML=`<div class="empty"><strong>${versions.length?'沒有符合條件的版本':'尚未發現 min_sys_version 設定'}</strong>${versions.length?'試著縮短搜尋文字，或切換篩選條件。':'可使用 python track_versions.py 選單 [6] 為專案或文章新增 min_sys_version。'}</div>`;return;}
 const entry=db[active],index=visible.indexOf(active);
 detail.innerHTML=`<div class="detail-head"><div><div class="eyebrow">MIN_SYS_VERSION / ${index+1} OF ${visible.length}</div><h3>${esc(active)}</h3><p>專案層級 ${entry.projects.length} 筆 · 文章層級 ${entry.articles.length} 筆 · 共 ${records(active).length} 個 detail.json</p><span class="badge ${state(active)==='higher'?'warn':''}">${stateName[state(active)]}</span></div><div class="navigation"><button type="button" class="button" id="previous" aria-label="上一個版本" ${index===0?'disabled':''}>←</button><button type="button" class="button" id="next" aria-label="下一個版本" ${index===visible.length-1?'disabled':''}>→</button></div></div><div class="toolbar"><button type="button" data-kind="all" class="tab">全部位置</button><button type="button" data-kind="projects" class="tab">專案層級</button><button type="button" data-kind="articles" class="tab">文章層級</button><input id="location" type="search" aria-label="篩選這個版本的位置" placeholder="篩選標題、ID 或路徑…" value="${esc(locationQuery)}"></div><div id="recordSections"></div>`;
 detail.querySelectorAll('[data-kind]').forEach(button=>{const lv=document.getElementById('level').value;button.disabled=lv!=='all'&&button.dataset.kind!=='all'&&button.dataset.kind!==lv;button.classList.toggle('active',button.dataset.kind===kind);button.setAttribute('aria-pressed',String(button.dataset.kind===kind));button.addEventListener('click',()=>{kind=button.dataset.kind;detail.querySelectorAll('[data-kind]').forEach(b=>{b.classList.toggle('active',b.dataset.kind===kind);b.setAttribute('aria-pressed',String(b.dataset.kind===kind));});renderRecords();});});
 document.getElementById('location').addEventListener('input',event=>{locationQuery=event.target.value;renderRecords();});
 for(const [id,offset] of [['previous',-1],['next',1]])document.getElementById(id).addEventListener('click',()=>{active=visible[index+offset];locationQuery='';renderList();});
 renderRecords();
}
function renderRecords(){
 const entry=db[active],q=locationQuery.trim().toLowerCase(),search=document.getElementById('search').value.trim().toLowerCase();
 const limitGlobal=search&&!active.toLowerCase().includes(search);
 let html='';
 for(const [type,title,explanation] of [['projects','專案層級 (Projects)','於專案 detail.json 定義，進入專案目錄或旗下文章時皆會檢查'],['articles','文章層級 (Articles)','於文章 detail.json 定義，與專案版本取較高者進行檢查']]){
  if(kind!=='all'&&kind!==type)continue;
  const lv=document.getElementById('level').value;
  if(lv!=='all'&&lv!==type)continue;
  const items=entry[type].filter(item=>levelMatches(item)&&(!q||matches(item,q))&&(!limitGlobal||matches(item,search)));
  html+=`<div class="section-title">${title}<span>${items.length} / ${entry[type].length} 筆 · ${explanation}</span></div>`;
  if(items.length)html+=`<div class="cards">${items.map(createCard).join('')}</div>`;
  else if(entry[type].length)html+='<div class="notice">沒有符合搜尋條件的位置。</div>';
  else html+=`<div class="notice">此版本號目前沒有設定在${type==='projects'?'專案':'文章'}層級。</div>`;
 }
 const el=document.getElementById('recordSections');el.innerHTML=html;
 el.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',()=>copyText(button.dataset.copy)));
}
async function copyText(value){
 try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);else{const input=document.createElement('textarea');input.value=value;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();let ok;try{ok=document.execCommand('copy');}finally{input.remove();}if(!ok)throw new Error('copy unavailable');}toast('已複製檔案位置與行號');}
 catch(error){window.prompt('請手動複製位置：',value);}
}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,2300);}
function setTheme(theme){document.documentElement.dataset.theme=theme;document.getElementById('theme').textContent=theme==='dark'?'☀ 淺色模式':'☾ 深色模式';try{localStorage.setItem('version-radar-theme',theme);}catch(error){}}
let theme='dark';try{theme=localStorage.getItem('version-radar-theme')||theme;}catch(error){}setTheme(theme==='light'?'light':'dark');
document.getElementById('theme').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
document.getElementById('search').addEventListener('input',renderList);document.getElementById('status').addEventListener('change',renderList);document.getElementById('level').addEventListener('change',()=>{kind='all';locationQuery='';renderList();});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();document.getElementById('search').focus();}});
renderList();
</script></body></html>'''


def open_dashboard():
    """用系統預設瀏覽器開啟面板；尚未生成時先掃描生成。"""
    dashboard = Path(OUTPUT_FILE).resolve()
    if not dashboard.is_file():
        print('尚未生成 HTML 儀表板，先掃描並生成…')
        scan_versions(generate_html=True)
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
    parser = argparse.ArgumentParser(description='Azustock min_sys_version 掃描、查詢、修改與 HTML 儀表板')
    parser.add_argument('--projects', default=PROJECTS_DIR, help='專案目錄（預設 projects）')
    parser.add_argument('--output', default=OUTPUT_FILE, help='HTML 輸出位置（預設 version_dashboard.html）')
    parser.add_argument('--scan', action='store_true', help='掃描並結束，不進入選單')
    parser.add_argument('--open', action='store_true', help='使用預設瀏覽器開啟 HTML；檔案不存在時先生成')
    parser.add_argument('--query', help='搜尋版本號、標題、路徑或內文（不分大小寫）')
    parser.add_argument('--file', default='', help='只顯示或修改路徑／ID／標題含此文字的位置')
    parser.add_argument('--kind', choices=['all', 'projects', 'articles'], default='all',
                        help='顯示或修改全部／專案層級(projects)／文章層級(articles)')
    parser.add_argument('--status', choices=['all', 'compatible', 'higher'], default='all',
                        help='all 全部／compatible 相容於目前系統／higher 高於目前系統版本')
    parser.add_argument('--exact', action='store_true', help='只查詢完整版本號名稱')
    parser.add_argument('--list', action='store_true', help='只列出版本號與關聯數量摘要')
    parser.add_argument('--unset', action='store_true', help='列出尚未設定 min_sys_version 的專案與文章')
    parser.add_argument('--set', metavar='VERSION', help='將符合 --file 與 --kind 的目標設定 min_sys_version')
    parser.add_argument('--remove', action='store_true', help='移除符合 --file 與 --kind 目標的 min_sys_version')
    parser.add_argument('--replace', nargs=2, metavar=('OLD_VER', 'NEW_VER'),
                        help='將指定的舊 min_sys_version 批次替換為新版本號')
    parser.add_argument('--yes', '-y', action='store_true', help='搭配 --set / --remove / --replace 時略過確認提示')
    parser.add_argument('--no-html', action='store_true', help='不產生 HTML')
    parser.add_argument('--plain', action='store_true', help='關閉終端機色彩')
    args = parser.parse_args(argv)

    if args.exact and args.query is None:
        parser.error('--exact 需搭配 --query')
    if args.open and args.no_html:
        parser.error('--open 不能搭配 --no-html')
    if sum(bool(x) for x in (args.set, args.remove, args.replace)) > 1:
        parser.error('--set、--remove 與 --replace 每次只能擇一使用')
    if (args.set or args.remove) and not args.file:
        parser.error('使用 --set 或 --remove 時請搭配 --file 指定目標（若要套用全部請傳入 --file *）')

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
        # CLI 直接修改模式 (--set / --remove / --replace)
        if args.set or args.remove or args.replace:
            target_filter = '' if args.file == '*' else args.file
            if args.replace:
                old_v, new_v = args.replace
                plans = plan_version_changes(new_v, file_filter=target_filter, kind=args.kind,
                                             only_existing=True, old_version_filter=old_v)
            elif args.set:
                plans = plan_version_changes(args.set, file_filter=target_filter, kind=args.kind,
                                             only_existing=False)
            else:
                plans = plan_version_changes(None, file_filter=target_filter, kind=args.kind,
                                             only_existing=True)
            if not plans:
                print('沒有需要修改的 detail.json。')
                return 0
            for plan in plans:
                c = plan['change']
                print('  ' + styled(plan['path']) + ':' + str(c['line']) + f" ({plan['target_id']} · {plan['title']})")
                print('    ' + styled(c['before'], 'yellow') + ' → ' + styled(c['after'], 'green'))
            if not args.yes:
                if input(f'共 {len(plans)} 個檔案，套用以上修改？[y/N] > ').strip().lower() not in ('y', 'yes'):
                    print('已取消，檔案未修改。')
                    return 0
            files, errors = apply_version_changes(plans)
            print(f'完成：修改 {files} 個檔案。')
            for err in errors:
                print(styled('更新失敗：' + err, 'red'))
            scan_versions(generate_html=not args.no_html)
            if args.open:
                return 0 if open_dashboard() else 1
            return 0 if not errors else 1

        # CLI 直接查詢／掃描模式
        direct_query = (
            args.query is not None or bool(args.file) or args.kind != 'all'
            or args.list or args.status != 'all' or args.unset
        )
        if args.scan or direct_query:
            scan_versions(generate_html=not args.no_html)
            if args.unset:
                print_unset_targets(args.query or args.file, args.kind)
            elif direct_query:
                print_query(args.query or '', args.file, args.kind, args.exact, args.list, args.status)
            if args.open:
                return 0 if open_dashboard() else 1
            return 0
        if args.open:
            return 0 if open_dashboard() else 1

        # 互動式選單模式
        while True:
            sys_ver = detect_current_sys_version()
            print(styled('\n─────────────────────────────────────\n'
                         f'  AZUSTOCK · 版本相容管理員 (系統: {sys_ver})\n'
                         '─────────────────────────────────────', 'bold'))
            print('  [0] 離開')
            print('  [1] 掃描 min_sys_version 並生成 HTML（預設）')
            print('  [2] 列出版本摘要')
            print('  [3] 批次替換版本號 (舊版號 → 新版號)')
            print('  [4] 查詢版本與相關位置 (含未設定項目查詢)')
            print('  [5] 開啟 HTML 儀表板')
            print('  [6] 管理 min_sys_version（新增／修改／移除指定目標）')
            choice = input('\n操作 [0/1/2/3/4/5/6] > ').strip().lower()
            try:
                match choice:
                    case '0' | 'q':
                        return 0
                    case '' | '1':
                        scan_versions(generate_html=not args.no_html)
                    case '2':
                        if not scanned:
                            scan_versions(generate_html=False)
                        print_query(summary_only=True)
                    case '3':
                        replace_version_interactive(generate_html=not args.no_html)
                    case '4':
                        query_versions()
                    case '5':
                        open_dashboard()
                    case '6':
                        manage_target_version(generate_html=not args.no_html)
                    case _:
                        print('請輸入 0～6，或 q 離開。')
            except (OSError, UnicodeError, ValueError) as error:
                print(styled('操作失敗：' + str(error), 'red'))
    except (OSError, UnicodeError, ValueError) as error:
        print(styled('操作失敗：' + str(error), 'red'), file=sys.stderr)
        return 1
    except (EOFError, KeyboardInterrupt):
        print('\n已離開版本相容管理員。')
        return 0


if __name__ == '__main__':
    sys.exit(main())
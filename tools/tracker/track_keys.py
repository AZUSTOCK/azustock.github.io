"""Azustock 金鑰管理員 U0.0.1

互動選單：python track_keys.py
直接查詢：python track_keys.py --query StoryODiary --no-html
查詢位置：python track_keys.py --file chapter.md --kind locks --no-html
靜默查詢：python track_keys.py --silent on --no-html
產生面板：python track_keys.py --scan
開啟面板：python track_keys.py --open
自訂目錄：python track_keys.py --projects ./projects --output key_dashboard.html
"""

import bisect
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
from tools.tracker.tracker_common import (TrackerApp, styled, apply_changes, make_plan)
from tools.tracker.tracker_sensitive_rules import sensitive_bypass, valid_sensitive_condition, discover_sensitive_templates

from tools.common.paths import ROOT_DIR
PROJECTS_DIR = str(ROOT_DIR / "projects")
OUTPUT_FILE = str(ROOT_DIR / "tools/tracker/reports/key_dashboard.html")
RE_SILENT = re.compile(r'\|SILENT', re.IGNORECASE)
RE_DETAIL_SILENT = re.compile(r'\|\s*SILENT\s*$', re.IGNORECASE)
RE_HIGHLIGHT = re.compile(r'\+\+(?:\[([^\]\n]*)\])?((?:(?!\r?\n[ \t]*\r?\n)[\s\S])*?)\+\+')
RE_INLINE = [
    (re.compile(r'!!\[([^\]\n]*)\](?:[ \t]*"[^"\n]+")?\s*((?:(?!\n[ \t]*\n)[\s\S])*?)!!'), 'Secret Inline'),
    (re.compile(r'\?\?\[([^\]\n]*)\](?:[ \t]*"[^"\n]+")?\s*((?:(?!\n[ \t]*\n)[\s\S])*?)\?\?'), 'Stealth Inline'),
]
RE_BLOCK = re.compile(r'^[ \t]*(?:>[ \t]*)*(?:(?:[-+*]|\d+[.)])[ \t]+)?:::[ \t]*(secret|stealth)(?:\[([^\]\n]*)\])?([^\n]*)$', re.IGNORECASE | re.MULTILINE)
RE_BLOCK_CLOSE = re.compile(r'^[ \t]*(?:>[ \t]*)*:::[ \t]*$', re.MULTILINE)
RE_BLOCK_CLOSE_TOP = re.compile(r'^:::[ \t]*$', re.MULTILINE)
results = {}
scan_info = {}
scanned = False
USE_COLOR = sys.stdout.isatty() and 'NO_COLOR' not in os.environ


def extract_single_condition(raw):
    """依前端 isSingleKeyUnlocked 取得條件使用的基礎名稱。"""
    if not isinstance(raw, str):
        return None
    base = raw.split('|', 1)[0].strip()
    if '#' in base:
        base = base.split('#', 1)[0].strip()
    return base or None


def extract_bases(raw_str):
    """依前端字串條件語法解析 OR/AND，保留 Unicode、符號及數字金鑰。"""
    if not isinstance(raw_str, str):
        return []
    found = []
    for group in raw_str.split('||'):
        group = group.strip()
        if group.startswith('(') and group.endswith(')'):
            group = group[1:-1].strip()
        for part in group.split('&&'):
            base = extract_single_condition(part.strip())
            if base and base not in found:
                found.append(base)
    return found


def parse_grant(raw, detail=False):
    """回傳單一發放語法的基礎金鑰與靜音狀態；依來源採用對應前端規則。"""
    if not isinstance(raw, str) or not raw.strip():
        return None
    if detail:
        silent = bool(RE_DETAIL_SILENT.search(raw))
        key = RE_DETAIL_SILENT.sub('', raw, count=1).strip()
        match = re.fullmatch(r'([^#|]+)(?:#([^/#|]+)(?:/(\d+))?)?', key)
        if not match or not match.group(1).strip() or (match.group(2) and not match.group(2).strip()):
            return None
        if match.group(3) and int(match.group(3)) < 1:
            return None
    else:
        silent = bool(RE_SILENT.search(raw))
        key = RE_SILENT.sub('', raw, count=1).strip()
        if not key:
            return None
        match = re.fullmatch(r'([^#]+)(?:#([^/]+)(?:/(\d+))?)?', key)
    base = match.group(1).strip() if match else key
    return (base, silent) if base else None


def add_record(base_key, record_type, file_path, line_num, raw_str, context, column=1, silent=None):
    entry = results.setdefault(base_key, {'getters': [], 'locks': []})
    abs_path = os.path.abspath(file_path)
    context = context.strip()
    entry[record_type].append({
        'file': str(file_path).replace('\\', '/'), 'line': line_num, 'column': column,
        'raw': raw_str, 'context': context[:240] + ('…' if len(context) > 240 else ''),
        'abs_path': urllib.parse.quote(abs_path.replace('\\', '/'), safe='/:'),
        'raw_abs': abs_path, 'kind': record_type,
        'silent': bool(silent) if record_type == 'getters' else None,
    })


def json_field_positions(text, start=0):
    """讀取 JSON 物件的直接欄位及值的位置；重複欄位保留最後一個。"""
    decoder = json.JSONDecoder()
    index = start
    while index < len(text) and text[index].isspace():
        index += 1
    if index >= len(text) or text[index] != '{':
        return {}
    index += 1
    positions = {}
    while index < len(text):
        while index < len(text) and text[index].isspace():
            index += 1
        if index >= len(text) or text[index] == '}':
            break
        field_start = index
        name, index = decoder.raw_decode(text, index)
        while text[index].isspace():
            index += 1
        index += 1
        while text[index].isspace():
            index += 1
        value_start = index
        value, index = decoder.raw_decode(text, index)
        positions[name] = {'field_start': field_start, 'value_start': value_start, 'value': value}
        while index < len(text) and text[index].isspace():
            index += 1
        if index < len(text) and text[index] == ',':
            index += 1
    return positions


def json_string_leaves(text, start, max_depth=2):
    """取得字串及精確的引號位置；不把物件裡的其他字串視為金鑰。"""
    decoder = json.JSONDecoder()
    def walk(index, depth):
        while index < len(text) and text[index].isspace():
            index += 1
        if text[index] != '[':
            value, end = decoder.raw_decode(text, index)
            if isinstance(value, str):
                yield value, index, depth
            return end
        index += 1
        while True:
            while index < len(text) and text[index].isspace():
                index += 1
            if text[index] == ']':
                return index + 1
            if depth < max_depth:
                index = yield from walk(index, depth + 1)
            else:
                _, index = decoder.raw_decode(text, index)
            while index < len(text) and text[index].isspace():
                index += 1
            if text[index] == ',':
                index += 1
    yield from walk(start, 0)


def _escaped(text, pos):
    count = 0
    pos -= 1
    while pos >= 0 and text[pos] == '\\':
        count += 1
        pos -= 1
    return bool(count % 2)


def mask_markdown_code(text):
    """遮蔽程式碼與註解，保留每個字元的位置和換行供定位。"""
    chars = list(text)
    def hide(start, end):
        for i in range(start, end):
            if chars[i] not in '\r\n':
                chars[i] = ' '

    fence = None
    fence_re = re.compile(r'^[ \t]*(?:>[ \t]*)*(?:(?:[-+*]|\d+[.)])[ \t]+)?(`{3,}|~{3,})([^\n]*)$')
    offset = 0
    for line in text.splitlines(keepends=True):
        body = line.rstrip('\r\n')
        match = fence_re.match(body)
        if fence:
            hide(offset, offset + len(line))
            if match and match.group(1)[0] == fence[0] and len(match.group(1)) >= fence[1] and not match.group(2).strip():
                fence = None
        elif match:
            fence = (match.group(1)[0], len(match.group(1)))
            hide(offset, offset + len(line))
        offset += len(line)

    masked = ''.join(chars)
    html_code = re.compile(r'<!--[\s\S]*?(?:-->|$)|<(pre|script|style)\b[^>]*>[\s\S]*?(?:</\1\s*>|$)', re.IGNORECASE)
    for match in html_code.finditer(masked):
        hide(match.start(), match.end())

    # 常見 HTML 區塊連續行由 Marked 原樣輸出；空行後的 Markdown 才重新解析。
    html_block = re.compile(r'^[ \t]*(?:>[ \t]*)*</?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?=[\s/>])', re.IGNORECASE)
    in_html, offset = False, 0
    for line in ''.join(chars).splitlines(keepends=True):
        if in_html and not line.strip():
            in_html = False
        elif in_html or html_block.match(line):
            in_html = True
            hide(offset, offset + len(line))
        offset += len(line)

    masked = ''.join(chars)
    paragraph_breaks = [match.start() for match in re.finditer(r'\r?\n[ \t]*\r?\n', masked)]
    index = 0
    while index < len(masked):
        if masked[index] != '`' or _escaped(masked, index):
            index += 1
            continue
        end_run = index
        while end_run < len(masked) and masked[end_run] == '`':
            end_run += 1
        size = end_run - index
        break_index = bisect.bisect_left(paragraph_breaks, end_run)
        limit = paragraph_breaks[break_index] if break_index < len(paragraph_breaks) else len(masked)
        cursor, closing = end_run, None
        while cursor < limit:
            candidate = masked.find('`', cursor, limit)
            if candidate < 0:
                break
            run_end = candidate
            while run_end < limit and masked[run_end] == '`':
                run_end += 1
            if run_end - candidate == size:
                closing = run_end
                break
            cursor = run_end
        if closing is None:
            index = end_run
        else:
            hide(index, closing)
            index = closing
    return ''.join(chars)


def markdown_grants(text, masked=None):
    """提供有效 KEY 高光的原始內容與精確範圍，也供 SILENT 預覽使用。"""
    masked = mask_markdown_code(text) if masked is None else masked
    for match in RE_HIGHLIGHT.finditer(masked):
        if _escaped(masked, match.start()) or match.group(1) is None:
            continue
        badge = match.group(1)
        prefix = re.match(r'\s*KEY:', badge)
        if not prefix:
            continue
        start, end = match.start(1) + prefix.end(), match.end(1)
        raw = text[start:end]
        parsed = parse_grant(raw)
        if parsed:
            yield {'start': start, 'end': end, 'token_start': match.start(), 'raw': raw,
                   'base': parsed[0], 'silent': parsed[1]}


def markdown_block_context(text, match):
    """辨識一般區塊、引言及清單縮排，排除未被 Markdown 解析的縮排範例。"""
    header = match.group(0)
    prefix = header[:header.find(':::')]
    if '>' in prefix or re.search(r'(?:[-+*]|\d+[.)])[ \t]+$', prefix):
        return True
    indent = len(prefix.expandtabs(4))
    def previous_line(end):
        if end <= 0:
            return None, 0
        if text[end - 1] == '\n':
            end -= 1
        start = text.rfind('\n', 0, end) + 1
        return text[start:end].rstrip('\r'), start
    line, cursor = previous_line(match.start())
    if indent:
        while line is not None:
            if not line.strip():
                line, cursor = previous_line(cursor)
                continue
            line_indent = len(line) - len(line.lstrip(' '))
            if line_indent < indent:
                return bool(re.match(r'^[ \t]*(?:[-+*]|\d+[.)])[ \t]+', line))
            line, cursor = previous_line(cursor)
        return False
    if line is None or not line.strip():
        return True
    return bool(re.match(r'^[ \t]*(?:#{1,6}[ \t]|(?:[-+*]|\d+[.)])[ \t]+|(?:---+|\*\*\*+|___+)[ \t]*$)', line))


def collect_keys():
    global results, scan_info, scanned
    if not Path(PROJECTS_DIR).is_dir():
        raise FileNotFoundError('找不到專案目錄：' + os.path.abspath(PROJECTS_DIR))
    results = {}
    scanned = False
    total_files, errors = 0, []
    templates = discover_sensitive_templates(PROJECTS_DIR)
    for root, dirs, files in os.walk(PROJECTS_DIR, onerror=lambda error: errors.append(str(error))):
        dirs.sort()
        for name in sorted(files):
            if not (name.lower().endswith('.md') or name == 'detail.json'):
                continue
            path = os.path.join(root, name)
            total_files += 1
            try:
                text = Path(path).read_text(encoding='utf-8-sig')
                lines = text.splitlines()
                starts = [0] + [match.end() for match in re.finditer('\n', text)]
                def record(base, kind, raw, offset, silent=None):
                    line = bisect.bisect_right(starts, offset)
                    column = offset - starts[line - 1] + 1
                    context = lines[line - 1] if line <= len(lines) else ''
                    add_record(base, kind, path, line, raw, context, column, silent)

                if name.lower().endswith('.md'):
                    masked = mask_markdown_code(text)
                    for item in markdown_grants(text, masked):
                        record(item['base'], 'getters', item['raw'], item['token_start'], item['silent'])
                    for pattern, label in RE_INLINE:
                        for match in pattern.finditer(masked):
                            if _escaped(masked, match.start()):
                                continue
                            raw = text[match.start(1):match.end(1)] or 'DEFAULT_KEY'
                            for base in extract_bases(raw):
                                record(base, 'locks', '[' + label + '] ' + raw, match.start())
                    for match in RE_BLOCK.finditer(masked):
                        if not markdown_block_context(masked, match):
                            continue
                        prefix = match.group(0)[:match.group(0).find(':::')]
                        close_pattern = RE_BLOCK_CLOSE if prefix else RE_BLOCK_CLOSE_TOP
                        if not close_pattern.search(masked, match.end()):
                            continue
                        kind = match.group(1).lower()
                        tail = match.group(3)
                        if tail and (kind != 'secret' or not re.fullmatch(r'[ \t]*"[^"\n]+"', tail)):
                            continue
                        raw = text[match.start(2):match.end(2)] if match.group(2) is not None else ''
                        raw = raw or 'DEFAULT_KEY'
                        for base in extract_bases(raw):
                            record(base, 'locks', '[' + kind.title() + ' Block] ' + raw,
                                   match.start() + match.group(0).find(':::'))
                else:
                    data = json.loads(text)
                    if not isinstance(data, dict):
                        raise ValueError('detail.json 的頂層必須是物件')
                    fields = json_field_positions(text)
                    for field in ('key', 'required_key', 'sensitive'):
                        name_used = field if data.get(field) else field.upper()
                        item = fields.get(name_used)
                        if not item or not item['value'] or isinstance(item['value'], bool):
                            continue
                        value, start = item['value'], item['value_start']
                        if field == 'key' and isinstance(value, (str, list)):
                            for raw, offset, _ in json_string_leaves(text, start, max_depth=1):
                                parsed = parse_grant(raw, detail=True)
                                if parsed:
                                    record(parsed[0], 'getters', '[JSON key] ' + raw, offset, parsed[1])
                        elif field == 'required_key' and isinstance(value, (str, list)):
                            for raw, offset, depth in json_string_leaves(text, start):
                                bases = extract_bases(raw) if depth == 0 else [extract_single_condition(raw)]
                                for base in bases:
                                    if base:
                                        record(base, 'locks', '[JSON required_key] ' + raw, offset)
                        elif field == 'sensitive':
                            if isinstance(value, dict):
                                rules = {}
                                for raw_type, rule in json_field_positions(text, start).items():
                                    condition = rule['value']
                                    if condition is False:
                                        continue
                                    name = raw_type.strip().upper()
                                    known = name in templates
                                    warning_type = name if known else 'DEFAULT'
                                    if not known:
                                        errors.append(path + ': 未知的 sensitive 類型 ' + raw_type + '；將顯示 DEFAULT。')
                                    if warning_type in rules:
                                        rules[warning_type] = None
                                        errors.append(path + ': sensitive 類型 ' + warning_type + ' 重複；其略過條件無效。')
                                        continue
                                    rules[warning_type] = rule if known else None
                                    if known and condition is not True and not valid_sensitive_condition(condition):
                                        rules[warning_type] = None
                                        errors.append(path + ': sensitive 類型 ' + warning_type + ' 的略過條件無效；將顯示警告。')
                                for warning_type, rule in rules.items():
                                    if not rule or rule['value'] is True:
                                        continue
                                    for raw, offset, depth in json_string_leaves(text, rule['value_start']):
                                        bases = extract_bases(raw) if depth == 0 else [extract_single_condition(raw)]
                                        for base in bases:
                                            if base:
                                                record(base, 'locks', '[JSON sensitive ' + warning_type + ' bypass] ' + raw, offset)
                            else:
                                bypass = sensitive_bypass(value, templates)
                                for base in extract_bases(bypass):
                                    record(base, 'locks', '[JSON sensitive Bypass] ' + str(value), start)

                    # 前端會解析專案／文章標題、簡介和群組文字中的 ??[key] 偽裝。
                    dynamic_fields = []
                    for field in ('title', 'description'):
                        if field in fields:
                            dynamic_fields.append(fields[field])
                    groups = fields.get('groups')
                    if groups and isinstance(groups['value'], dict):
                        for group in json_field_positions(text, groups['value_start']).values():
                            if isinstance(group['value'], dict):
                                inner = json_field_positions(text, group['value_start'])
                                dynamic_fields.extend(inner[field] for field in ('title', 'description') if field in inner)
                    for item in dynamic_fields:
                        if not isinstance(item['value'], str):
                            continue
                        for match in RE_INLINE[1][0].finditer(item['value']):
                            raw = match.group(1) or 'DEFAULT_KEY'
                            for base in extract_bases(raw):
                                record(base, 'locks', '[JSON dynamic text] ' + raw, item['value_start'])
            except (OSError, UnicodeError, ValueError, TypeError) as error:
                errors.append(path + ': ' + str(error))
    scan_info = {'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                 'files': total_files, 'errors': errors,
                 'root': os.path.abspath(PROJECTS_DIR), 'sensitive_templates': sorted(templates)}
    scanned = True
    return results


def search_records(query='', file_filter='', kind='all', exact=False, silent_filter='all'):
    """金鑰名稱符合時顯示全部位置；否則僅顯示位置／語法／內文符合的紀錄。"""
    query, file_filter = query.casefold(), file_filter.casefold()
    found = {}
    for key in sorted(results, key=str.casefold):
        key_match = key.casefold() == query if exact else query in key.casefold()
        if exact and not key_match:
            continue
        matches = {'getters': [], 'locks': []}
        for record_type in ('getters', 'locks'):
            if kind != 'all' and record_type != kind:
                continue
            for item in results[key][record_type]:
                if silent_filter != 'all' and (record_type != 'getters' or
                        bool(item.get('silent')) != (silent_filter == 'on')):
                    continue
                if file_filter and file_filter not in item['file'].casefold():
                    continue
                if key_match or any(query in item[field].casefold()
                                    for field in ('file', 'raw', 'context')):
                    matches[record_type].append(item)
        if matches['getters'] or matches['locks']:
            found[key] = matches
    return found


def print_query(query='', file_filter='', kind='all', exact=False, summary_only=False, silent_filter='all'):
    found = search_records(query, file_filter, kind, exact, silent_filter)
    print(styled('\n查詢結果 · {} 把金鑰'.format(len(found)), 'bold'))
    if not found:
        print('沒有符合條件的金鑰或位置。')
        return found
    for key, matches in found.items():
        entry = results[key]
        status = '缺少發放點' if not entry['getters'] else (
            '尚未使用' if not entry['locks'] else '已連結')
        silent_count = sum(bool(item.get('silent')) for item in entry['getters'])
        print(styled(key, 'yellow') + '  [{}]  發放 {} / 上鎖 {} / 靜默 {}'.format(
            status, len(entry['getters']), len(entry['locks']), silent_count))
        if summary_only:
            continue
        for record_type, label, color in [('getters', '發放點', 'green'), ('locks', '上鎖點', 'cyan')]:
            for item in matches[record_type]:
                mode = ' [SILENT]' if item.get('silent') else (' [一般]' if record_type == 'getters' else '')
                print('  ' + styled(label, color) + mode + '  {}:{}:{}'.format(
                    styled(item['file']), item['line'], item['column']))
                print('    語法：' + styled(item['raw']))
                print('    內文：' + styled(item['context']))
                print('    位置：' + styled('{}:{}:{}'.format(
                    item['raw_abs'], item['line'], item['column'])))
    return found


def query_keys():
    if not scanned:
        scan_keys(generate_html=False)
    silent_filter = 'all'
    while True:
        print('\n搜尋金鑰、檔案路徑、原始語法或內文；空白列出全部，q 返回。')
        print('發放篩選：:silent 靜默／:normal 一般／:all 全部；目前：' +
              {'all': '全部', 'on': '靜默', 'off': '一般'}[silent_filter])
        query = input('搜尋 > ').strip()
        if query.lower() == 'q':
            return
        if query.lower() in (':silent', ':normal', ':all'):
            silent_filter = {':silent': 'on', ':normal': 'off', ':all': 'all'}[query.lower()]
            print_query(silent_filter=silent_filter)
            continue
        print_query(query, silent_filter=silent_filter)


def plan_silent_changes(key, enabled, file_filter=''):
    """只修改實際 Markdown 發放點，保留其他內容、換行及 BOM。"""
    if not isinstance(key, str) or not key.strip() or key != key.strip() or any(mark in key for mark in ('#', '|', '&&')):
        raise ValueError('請輸入基礎金鑰名稱，不含 #碎片、條件運算子或 |SILENT。')
    root_path = Path(PROJECTS_DIR)
    if not root_path.is_dir():
        raise FileNotFoundError('找不到專案目錄：' + str(root_path.resolve()))
    plans = []
    for root, dirs, files in os.walk(root_path):
        dirs.sort()
        for name in sorted(files):
            path = Path(root) / name
            if not name.lower().endswith('.md') or path.is_symlink():
                continue
            if file_filter and file_filter.casefold() not in str(path).replace('\\', '/').casefold():
                continue
            original = path.read_bytes()
            text = original.decode('utf-8-sig')
            changes, edits = [], []
            for item in markdown_grants(text):
                if item['base'] != key or item['silent'] == enabled:
                    continue
                raw = item['raw']
                if enabled:
                    content = raw.rstrip()
                    new_raw = content + '|SILENT' + raw[len(content):]
                else:
                    new_raw = RE_SILENT.sub('', raw, count=1)
                changes.append({'line': text.count('\n', 0, item['token_start']) + 1,
                                'before': raw, 'after': new_raw})
                edits.append((item['start'], item['end'], new_raw))
            if changes:
                modified = text
                for start, end, new_raw in reversed(edits):
                    modified = modified[:start] + new_raw + modified[end:]
                bom = b'\xef\xbb\xbf' if original.startswith(b'\xef\xbb\xbf') else b''
                plans.append({'path': path, 'before': original,
                              'after': bom + modified.encode('utf-8'), 'changes': changes})
    return plans


def manage_silent(generate_html=True):
    print(styled('\nSILENT 管理 · 僅修改 Markdown 發放點；detail.json 的 key 請手動修改。', 'bold'))
    key = input('基礎金鑰名稱（空白返回） > ').strip()
    if not key:
        return
    action = input('[1] 加上 SILENT / [2] 移除 SILENT（空白返回） > ').strip()
    if action not in ('1', '2'):
        return
    file_filter = input('限定檔案路徑（可輸入部分路徑；空白處理全部發放點） > ').strip()
    plans = plan_silent_changes(key, action == '1', file_filter)
    if not plans:
        print('沒有需要修改的發放點：可能已是指定狀態，或沒有符合的金鑰／檔案。')
        return
    for plan in plans:
        for change in plan['changes']:
            print('  ' + styled(plan['path']) + ':' + str(change['line']))
            print('    ' + styled(change['before']) + ' → ' + styled(change['after']))
    count = sum(len(plan['changes']) for plan in plans)
    print(f'共 {len(plans)} 個檔案、{count} 處發放點；寫入前會保留備份。')
    if input('套用以上修改？[y/N] > ').strip().lower() not in ('y', 'yes'):
        print('已取消，檔案未修改。')
        return
    files, records, errors = apply_silent_changes(plans)
    print(f'完成：修改 {files} 個檔案、{records} 處發放點。')
    for error in errors:
        print(styled('更新失敗：' + error, 'red'))
    if files:
        scan_keys(generate_html=generate_html)


def plan_key_rename(old_key, new_key, file_filter=''):
    if not old_key or not new_key or old_key == new_key:
        raise ValueError('請輸入不同且非空白的新舊名稱。')
    root = Path(PROJECTS_DIR)
    if not root.is_dir():
        raise FileNotFoundError('找不到專案目錄：' + str(root.resolve()))
    pattern = re.compile(r'(?<![A-Za-z0-9_])' + re.escape(old_key) + r'(?![A-Za-z0-9_])')
    plans = []
    for path in sorted(root.rglob('*')):
        if not path.is_file() or path.is_symlink() or not (path.suffix.lower() == '.md' or path.name == 'detail.json'):
            continue
        if file_filter and file_filter.casefold() not in str(path).casefold():
            continue
        original = path.read_bytes()
        text = original.decode('utf-8-sig')
        modified, count = pattern.subn(lambda match: new_key, text)
        if not count:
            continue
        if path.name == 'detail.json':
            json.loads(modified)
        change = dict(line=text.count('\n', 0, pattern.search(text).start()) + 1,
                      column=1, before=old_key, after=f'{new_key}（{count} 處）')
        item = dict(path=path, before=original, title=path.name, target_id='', kind='text')
        plans.append(make_plan(item, modified, change))
    return plans


def rename_key():
    print('全文替換獨立名稱，包含內文與範例；每個修改檔案會先備份。')
    old = input('舊金鑰（空白返回） > ').strip()
    if not old:
        return
    new = input('新金鑰 > ').strip()
    APP.apply(plan_key_rename(old, new), generate_html=not APP.no_html)


class KeysTracker(TrackerApp):
    slug = 'keys'
    title = '金鑰管理員'
    description = '追蹤發放點、上鎖點、SILENT 與警告略過條件。'
    kinds = ('getters', 'locks')
    backup_tag = 'key'
    mutation_label = '重新命名金鑰（全文替換、先預覽與備份）'
    manage_label = '管理 SILENT（加上／移除靜默發放）'
    filters = (
        dict(key='status', label='金鑰狀態', options=[['all','全部狀態'],['linked','已連結'],['missing','缺少發放點'],['unused','尚未使用']]),
        dict(key='silent', label='發放模式', options=[['all','全部發放模式'],['on','SILENT'],['off','一般發放']]),
    )

    def add_arguments(self, parser):
        parser.add_argument('--silent', choices=['all','on','off'], default='all')
        parser.add_argument('--rename', nargs=2, metavar=('OLD_KEY','NEW_KEY'), help='全文替換獨立名稱，包含內文與範例')

    def validate(self, args, parser):
        if args.silent != 'all' and args.kind == 'locks':
            parser.error('--silent on/off 僅適用發放點')
        if args.unset:
            parser.error('金鑰沒有未設定目標；請使用 --kind locks 查詢上鎖點')
        if args.rename and args.kind != 'all':
            parser.error('--rename 為全文替換，請以 --file 限定範圍，不搭配 --kind')

    def collect(self):
        collect_keys()

    def report(self):
        groups = []
        for name, entry in sorted(results.items(), key=lambda p:p[0].casefold()):
            state = 'linked' if entry['getters'] and entry['locks'] else 'missing' if entry['locks'] else 'unused'
            records = []
            for kind, items in entry.items():
                for item in items:
                    record = dict(item, **{'status':state, 'silent':('on' if item.get('silent') else 'off') if kind=='getters' else '',
                                          'badges':[state] + (['SILENT' if item.get('silent') else '一般發放'] if kind=='getters' else [])})
                    records.append(record)
            groups.append(dict(name=name, records=records))
        return dict(groups=groups, unset=[])

    def query(self, args):
        print_query(args.query or '', args.file, args.kind, args.exact, args.list, args.silent)

    def mutate_cli(self, args):
        if args.rename:
            return self.apply(plan_key_rename(*args.rename, file_filter='' if args.file=='*' else args.file), args.yes, not args.no_html)

    def interactive_query(self):
        query_keys()

    def interactive_mutate(self):
        rename_key()

    def interactive_manage(self):
        manage_silent(generate_html=not self.no_html)


APP = KeysTracker(globals())


def scan_keys(generate_html=True):
    return APP.scan(generate_html)


def write_dashboard():
    return APP.write_dashboard()


def open_dashboard():
    return APP.open_dashboard()


def apply_silent_changes(plans):
    global scanned
    result = apply_changes(plans, 'silent')
    if result[0]:
        scanned = False
    return result


def main(argv=None):
    return APP.run(argv)


if __name__ == "__main__":
    sys.exit(main())

"""與 main.js parseSensitiveSetting 對應的警告規則；供 keys 與 sensitive 共用。"""
import re
from pathlib import Path
DEFAULT_SENSITIVE_TEMPLATES = {'DEFAULT', 'MAIN', 'INSIDE'}


def js_string(value):
    if value is None:
        return 'null'
    if value is True:
        return 'true'
    if value is False:
        return 'false'
    if isinstance(value, dict):
        return '[object Object]'
    if isinstance(value, list):
        return ','.join('' if v is None else js_string(v) for v in value)
    return str(value)


def parse_sensitive_setting(setting, templates=None):
    """靜態還原 main.js 的有效警告與 bypass；不模擬訪客金鑰或同意紀錄。

    回傳有效警告（false 項目不列入）。issues 用於追蹤未知／重複／無效條件。
    舊字串的 bypass 不額外套用新版字典的驗證，與網站相同。
    """
    templates = set(templates if templates is not None else DEFAULT_SENSITIVE_TEMPLATES)
    if setting is None or setting is False or setting == '' or (isinstance(setting, (int, float)) and setting == 0):
        return []
    if isinstance(setting, dict):
        rules = {}
        for raw_type, condition in setting.items():
            if condition is False:
                continue
            name = raw_type.strip().upper()
            known = name in templates
            warning = name if known else 'DEFAULT'
            issues = [] if known else ['未知類型 ' + raw_type + '；網站改顯示 DEFAULT']
            if warning in rules:
                rules[warning]['bypass'] = None
                rules[warning]['raw_types'].append(raw_type)
                rules[warning]['issues'] += issues + ['類型 ' + warning + ' 重複；停用略過條件']
                continue
            bypass = None
            if known and condition is not True:
                if valid_sensitive_condition(condition):
                    bypass = condition
                else:
                    issues.append('類型 ' + warning + ' 的略過條件無效；仍顯示警告')
            rules[warning] = dict(name=warning, bypass=bypass, issues=issues, raw_types=[raw_type])
        return list(rules.values())
    bypass = None
    if isinstance(setting, list):
        values = [part for value in setting for part in re.split(r'\|\||[,+&]', js_string(value))]
    elif isinstance(setting, str):
        value = setting.strip()
        match = re.match(r'^(.*?)\s+\|\s+(.*)$', value)
        if match:
            value, bypass = match.group(1).strip(), match.group(2).strip()
        values = re.split(r'\|\||[,+&]', value)
        if not match and not any(part.strip().upper() in templates for part in values):
            bypass, values = value, ['DEFAULT']
    else:
        values = ['DEFAULT']
    normalized = []
    for value in values:
        name = value.strip().upper()
        if not name:
            continue
        name = name if name in templates else 'DEFAULT'
        if name not in normalized:
            normalized.append(name)
    return [dict(name=name, bypass=bypass, issues=[], raw_types=[]) for name in normalized or ['DEFAULT']]

def sensitive_bypass(value, templates):
    """對照前端的單一 | 分隔與多模板判斷。"""
    if not isinstance(value, str) or not value.strip():
        return None
    value = value.strip()
    match = re.match(r'^(.*?)\s+\|\s+(.*)$', value)
    if match:
        return match.group(2).strip() or None
    types = [part.strip().upper() for part in re.split(r'\|\||[,+&]', value)]
    return None if any(part in templates for part in types) else value


def valid_sensitive_condition(value):
    """對照新版前端驗證；空條件不會意外略過警告。"""
    def valid_atom(atom):
        if not isinstance(atom, str) or not atom.strip():
            return False
        parts = atom.strip().split('|')
        if len(parts) > 2 or not parts[0].strip():
            return False
        if len(parts) == 1:
            return True
        count = parts[1].strip()
        return bool(re.fullmatch(r'[0-9]+', count) and any(char != '0' for char in count))

    if isinstance(value, str):
        if not value.strip():
            return False
        for raw_group in value.split('||'):
            group = raw_group.strip()
            if not group:
                return False
            if group.startswith('(') and group.endswith(')'):
                group = group[1:-1].strip()
            if not group or '(' in group or ')' in group:
                return False
            if not all(valid_atom(atom) for atom in group.split('&&')):
                return False
        return True
    if not isinstance(value, list) or not value:
        return False
    if all(isinstance(item, str) for item in value):
        return all(valid_atom(item) for item in value)
    return all(isinstance(group, list) and group and all(valid_atom(atom) for atom in group)
               for group in value)


def discover_sensitive_templates(projects_dir="projects"):
    """優先讀取主站 SENSITIVE_TEMPLATES 頂層名稱；找不到時使用現有內建值。"""
    parents = [Path(projects_dir).resolve().parent, Path.cwd()]
    seen = set()
    for parent in parents:
        for filename in ('main.js', 'main.min.js'):
            path = parent / filename
            if path in seen or not path.is_file():
                continue
            seen.add(path)
            try:
                text = path.read_text(encoding='utf-8-sig')
            except (OSError, UnicodeError):
                continue
            match = re.search(r'window\.SENSITIVE_TEMPLATES\s*=\s*\{', text)
            if not match:
                continue
            index, depth, expect_key, names = match.end(), 1, True, set()
            while index < len(text) and depth:
                if text.startswith('//', index):
                    end = text.find('\n', index + 2)
                    index = len(text) if end < 0 else end + 1
                    continue
                if text.startswith('/*', index):
                    end = text.find('*/', index + 2)
                    index = len(text) if end < 0 else end + 2
                    continue
                char = text[index]
                if depth == 1 and expect_key and not char.isspace():
                    key_match = re.match(r'''(?:"([^"\\]*)"|'([^'\\]*)'|([A-Za-z_$][\w$]*))\s*:''', text[index:])
                    if key_match:
                        names.add(next(part for part in key_match.groups() if part is not None).upper())
                        index += key_match.end()
                        expect_key = False
                        continue
                if char in "\"'`":
                    quote = char
                    index += 1
                    while index < len(text):
                        if text[index] == '\\':
                            index += 2
                        elif text[index] == quote:
                            index += 1
                            break
                        else:
                            index += 1
                    continue
                if char == '{':
                    depth += 1
                elif char == '}':
                    depth -= 1
                elif char == ',' and depth == 1:
                    expect_key = True
                index += 1
            if names:
                return names
    return set(DEFAULT_SENSITIVE_TEMPLATES)



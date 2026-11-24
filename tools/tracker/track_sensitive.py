"""AZUSTOCK sensitive 追蹤管理員。與目前 main.js 的警告規則同步。

python track_sensitive.py --scan
python track_sensitive.py --query MAIN --no-html
python track_sensitive.py --status invalid --no-html
python track_sensitive.py --set '{"MAIN":["StoryOFDiary#1","sara"],"INSIDE":true}' --file my_article
python track_sensitive.py --replace MAIN INSIDE --file my_article
python track_sensitive.py --remove --file my_article
"""
import json
import re
import sys
from pathlib import Path

from tracker_common import JsonFieldTracker, json_field_spans
from tracker_sensitive_rules import discover_sensitive_templates, parse_sensitive_setting

PROJECTS_DIR = 'projects'
OUTPUT_FILE = './tools/tracker/reports/sensitive_dashboard.html'
results = {}
all_targets = []
unset_targets = []
scan_info = {}
scanned = False


class SensitiveTracker(JsonFieldTracker):
    slug = 'sensitive'
    field_name = 'sensitive'
    title = '內容警告追蹤管理員'
    description = '追蹤警告類型、舊版／字典格式及金鑰略過條件。'
    backup_tag = 'sensitive'
    mutation_label = '批次替換警告類型（保留略過條件）'
    manage_label = '管理 sensitive（設定／移除整個欄位）'
    filters = (
        dict(key='status', label='設定狀態', options=[['all','全部狀態'],['active','已啟用'],['disabled','已停用／無警告'],['invalid','需檢查']]),
        dict(key='format', label='設定格式', options=[['all','全部格式'],['dictionary','字典'],['legacy','舊版']]),
        dict(key='bypass', label='略過條件', options=[['all','全部'],['on','有略過條件'],['off','無略過條件']]),
    )

    def collect(self):
        self.templates = discover_sensitive_templates(PROJECTS_DIR)
        super().collect()
        scan_info['sensitive_templates'] = sorted(self.templates)

    def select_field_name(self, data):
        # 對齊 generate_projects.py：小寫有值時優先，否則讀取大寫。
        if data.get('sensitive'):
            return 'sensitive'
        if 'SENSITIVE' in data:
            return 'SENSITIVE'
        return 'sensitive'

    def validate_target(self, item):
        if 'sensitive' in item['data'] and 'SENSITIVE' in item['data']:
            raise ValueError(str(item['path']) + ': 同時存在 sensitive 與 SENSITIVE，請先保留單一欄位再修改。')

    def entries(self, value):
        templates = getattr(self, 'templates', discover_sensitive_templates(PROJECTS_DIR))
        format_name = 'dictionary' if isinstance(value, dict) else 'legacy'
        parsed = parse_sensitive_setting(value, templates)
        encoded = json.dumps(value, ensure_ascii=False)
        rows = []
        for rule in parsed:
            bypass = rule['bypass']
            has_bypass = bypass is not None and bypass != ''
            status = 'invalid' if rule['issues'] else 'active'
            rows.append(dict(name=rule['name'], raw=encoded, status=status, format=format_name,
                             bypass='on' if has_bypass else 'off', issues=rule['issues'],
                             _source_type=rule['raw_types'][0] if rule['raw_types'] else None,
                             badges=[status, format_name],
                             meta={'警告類型':rule['name'],
                                   '原始類型':', '.join(rule['raw_types']) or rule['name'],
                                   '有效略過條件':json.dumps(bypass, ensure_ascii=False) if has_bypass else '(無)',
                                   '檢查提示':'；'.join(rule['issues']) or '—'}))
        if isinstance(value, dict):
            for name, condition in value.items():
                if condition is False:
                    rows.append(dict(name=name.strip().upper(), raw=json.dumps({name:False}, ensure_ascii=False),
                                     status='disabled', format=format_name, bypass='off',
                                     _source_type=name,
                                     badges=['停用'], meta={'原始類型':name, '有效略過條件':'(無)'}))
        if not rows:
            rows.append(dict(name='(無警告)', raw=encoded, status='disabled', format=format_name,
                             bypass='off', badges=['無警告'], meta={}))
        return rows

    def entry_offset(self, entry, field, text):
        source_type = entry.pop('_source_type', None)
        if source_type is not None:
            nested = text[field['val_start']:field['val_end']]
            _, fields = json_field_spans(nested)
            match = next((f for f in fields if f['name'] == source_type), None)
            if match:
                return field['val_start'] + match['key_start']
        return field['val_start']

    def validate_value(self, value):
        if not isinstance(value, (str, list, dict, bool)) and value is not None:
            raise ValueError('sensitive 請使用字串、陣列、字典、布林值或 null。')
        templates = discover_sensitive_templates(PROJECTS_DIR)
        issues = [issue for rule in parse_sensitive_setting(value, templates) for issue in rule['issues']]
        if issues:
            raise ValueError('新設定無效：' + '；'.join(issues))

    def replace_value(self, value, old, new):
        old, new = old.strip().upper(), new.strip().upper()
        if not old or new not in discover_sensitive_templates(PROJECTS_DIR):
            raise ValueError('新類型必須是 main.js 已定義的警告模板。')
        if isinstance(value, dict):
            # 未變更的其他設定完全保留，不把替換後的重複類型悄悄覆蓋。
            targets = [k for k in value if k.strip().upper() == old]
            if not targets:
                return value
            if len(targets) > 1 or (old != new and any(k.strip().upper() == new for k in value)):
                raise ValueError('替換會產生重複類型，請先手動整理 sensitive 字典。')
            return {new if k in targets else k:v for k,v in value.items()}
        def replace_types(text):
            def token(match):
                value = match.group()
                if value.strip().upper() != old:
                    return value
                left, right = len(value) - len(value.lstrip()), len(value.rstrip())
                return value[:left] + new + value[right:]
            return re.sub(r'[^|,+&]+', token, text)
        if isinstance(value, list):
            return [replace_types(v) if isinstance(v,str) else v for v in value]
        if isinstance(value,str):
            match=re.match(r'^(.*?)\s+\|\s+(.*)$',value)
            # 無明確模板的舊字串為金鑰條件，不能把同名金鑰改成模板。
            templates=discover_sensitive_templates(PROJECTS_DIR)
            if match:
                prefix=value[:match.end(1)]
                return replace_types(prefix)+value[len(prefix):]
            if any(t.strip().upper() in templates for t in re.split(r'\|\||[,+&]',value)):
                return replace_types(value)
        return value


APP = SensitiveTracker(globals())


def collect_sensitive():
    APP.collect()
    return results


def scan_sensitive(generate_html=True):
    return APP.scan(generate_html)


def write_dashboard():
    return APP.write_dashboard()


def open_dashboard():
    return APP.open_dashboard()


def main(argv=None):
    return APP.run(argv)


if __name__ == '__main__':
    sys.exit(main())

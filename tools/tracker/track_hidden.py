"""AZUSTOCK hidden 限時隱藏追蹤管理員。對應 main.js evaluateExpiration(val, 'hidden')。

python track_hidden.py --scan
python track_hidden.py --status scheduled --no-html
python track_hidden.py --status expired --no-html
python track_hidden.py --set '"2026-12-31"' --file my_article
python track_hidden.py --set true --file my_article
python track_hidden.py --remove --file my_article
"""
import json
import sys
from datetime import datetime

# Preserve direct script execution as well as python -m.
if not __package__:
    import sys as _sys
    from pathlib import Path as _Path
    _sys.path.insert(0, str(_Path(__file__).resolve().parents[2]))
from tools.tracker.tracker_common import JsonFieldTracker, parse_valid_date

from tools.common.paths import ROOT_DIR
PROJECTS_DIR = str(ROOT_DIR / "projects")
OUTPUT_FILE = str(ROOT_DIR / "tools/tracker/reports/hidden_dashboard.html")
HIDDEN_ALIASES = ('hidden', 'HIDDEN', 'is_hidden')

results = {}
all_targets = []
unset_targets = []
scan_info = {}
scanned = False


class HiddenTracker(JsonFieldTracker):
    slug = 'hidden'
    field_name = 'hidden'
    title = '限時隱藏管理員'
    description = '追蹤 detail.json 的 hidden（永久隱藏、定時公開排程與已解封待清理項目）。'
    backup_tag = 'hidden'
    mutation_label = '批次替換 hidden 值'
    manage_label = '管理 hidden（設定永久隱藏／解封日期／移除）'
    filters = (
        dict(key='status', label='隱藏狀態', options=[
            ['all', '全部狀態'],
            ['active', '永久隱藏'],
            ['scheduled', '定時隱藏中'],
            ['expired', '已解封（可清理）'],
            ['disabled', '已停用'],
            ['invalid', '格式無效'],
        ]),
    )

    def select_field_name(self, data):
        for key in HIDDEN_ALIASES:
            if key in data:
                return key
        return 'hidden'

    def validate_target(self, item):
        found = [k for k in HIDDEN_ALIASES if k in item['data']]
        if len(found) > 1:
            raise ValueError(f"{item['path']}: 同時存在 {', '.join(found)}，請先保留單一欄位再修改。")

    def entries(self, value):
        encoded = json.dumps(value, ensure_ascii=False)
        if value is True or (isinstance(value, str) and value.strip().lower() == 'true'):
            return [dict(
                name='永久隱藏', raw=encoded, status='active',
                badges=['active'], meta={'模式': '永久隱藏', '原始值': encoded},
            )]
        if value is False or (isinstance(value, str) and value.strip().lower() == 'false'):
            return [dict(
                name='已停用', raw=encoded, status='disabled',
                badges=['disabled'], meta={'模式': '停用 (公開)', '原始值': encoded},
            )]
        if isinstance(value, str):
            dt = parse_valid_date(value)
            if dt is not None:
                date_str = dt.strftime('%Y-%m-%d')
                now = datetime.now()
                if now < dt:
                    days_left = max(1, int((dt - now).total_seconds() // 86400) + 1)
                    return [dict(
                        name=f'定時公開 ({date_str})', raw=encoded, status='scheduled',
                        badges=['scheduled'],
                        meta={'模式': '限時隱藏', '解封日期': date_str, '剩餘天數': f'約 {days_left} 天'},
                    )]
                return [dict(
                    name=f'已解封 ({date_str})', raw=encoded, status='expired',
                    badges=['expired'],
                    meta={'模式': '已過解封日', '解封日期': date_str, '建議': '已公開，可移除 hidden 欄位'},
                )]
        return [dict(
            name='格式無效', raw=encoded, status='invalid',
            issues=[f'hidden 值 {encoded} 不是布林值或有效 YYYY-MM-DD 日期'],
            badges=['invalid'], meta={'原始值': encoded},
        )]

    def validate_value(self, value):
        if isinstance(value, bool):
            return
        if isinstance(value, str):
            clean = value.strip()
            if clean.lower() in ('true', 'false') or parse_valid_date(clean) is not None:
                return
        raise ValueError('hidden 請輸入 true、false 或有效日期字串（如 "2026-12-31"）。')


APP = HiddenTracker(globals())


def collect_hidden():
    APP.collect()
    return results


def scan_hidden(generate_html=True):
    return APP.scan(generate_html)


def write_dashboard():
    return APP.write_dashboard()


def open_dashboard():
    return APP.open_dashboard()


def main(argv=None):
    return APP.run(argv)


if __name__ == '__main__':
    sys.exit(main())

"""AZUSTOCK pinned 置頂追蹤管理員。對應 main.js evaluateExpiration(val, 'status')。

python track_pinned.py --scan
python track_pinned.py --status active --no-html
python track_pinned.py --status expired --no-html
python track_pinned.py --set true --file my_article
python track_pinned.py --set '"2026-11-26"' --file my_article
python track_pinned.py --remove --file my_article
"""
import json
import re
import sys
from datetime import datetime

from tracker_common import JsonFieldTracker, source_path

PROJECTS_DIR = 'projects'
OUTPUT_FILE = './tools/tracker/reports/pinned_dashboard.html'
RE_DATE = re.compile(r'^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$')
PINNED_ALIASES = ('pinned', 'PINNED')

results = {}
all_targets = []
unset_targets = []
scan_info = {}
scanned = False


def detect_expire_days():
    main_js = source_path(PROJECTS_DIR, 'main.js')
    if main_js.is_file():
        try:
            text = main_js.read_text(encoding='utf-8-sig')
            match = re.search(r'TAG_EXPIRE_DAYS:\s*(\d+)', text)
            if match:
                return int(match.group(1))
        except (OSError, UnicodeError, ValueError):
            pass
    return 14


def parse_valid_date(text):
    match = RE_DATE.match(str(text).strip())
    if not match:
        return None
    y, m, d = int(match.group(1)), int(match.group(2)), int(match.group(3))
    try:
        return datetime(y, m, d)
    except ValueError:
        return None


class PinnedTracker(JsonFieldTracker):
    slug = 'pinned'
    field_name = 'pinned'
    title = '置頂項目管理員'
    description = '追蹤 detail.json 的 pinned（永久置頂與限時日期置頂）。'
    backup_tag = 'pinned'
    mutation_label = '批次替換 pinned 值'
    manage_label = '管理 pinned（設定永久置頂／限時日期／移除）'
    filters = (
        dict(key='status', label='置頂狀態', options=[
            ['all', '全部狀態'],
            ['active', '置頂中'],
            ['expired', '已過期'],
            ['disabled', '已停用'],
            ['invalid', '格式無效'],
        ]),
    )

    def collect(self):
        self.expire_days = detect_expire_days()
        super().collect()
        scan_info['expire_days'] = self.expire_days

    def select_field_name(self, data):
        for key in PINNED_ALIASES:
            if key in data:
                return key
        return 'pinned'

    def validate_target(self, item):
        found = [k for k in PINNED_ALIASES if k in item['data']]
        if len(found) > 1:
            raise ValueError(f"{item['path']}: 同時存在 {', '.join(found)}，請先保留單一欄位再修改。")

    def entries(self, value):
        expire_days = getattr(self, 'expire_days', detect_expire_days())
        encoded = json.dumps(value, ensure_ascii=False)
        if value is True or (isinstance(value, str) and value.strip().lower() == 'true'):
            return [dict(
                name='永久置頂', raw=encoded, status='active',
                badges=['active'], meta={'模式': '永久置頂', '原始值': encoded},
            )]
        if value is False or (isinstance(value, str) and value.strip().lower() == 'false'):
            return [dict(
                name='已停用', raw=encoded, status='disabled',
                badges=['disabled'], meta={'模式': '停用', '原始值': encoded},
            )]
        if isinstance(value, str):
            dt = parse_valid_date(value)
            if dt is not None:
                date_str = dt.strftime('%Y-%m-%d')
                diff_days = (datetime.now() - dt).total_seconds() / 86400.0
                if diff_days > expire_days:
                    return [dict(
                        name=f'置頂已過期 ({date_str})', raw=encoded, status='expired',
                        badges=['expired'],
                        meta={'模式': '限時置頂', '標記日期': date_str, '效期': f'{expire_days} 天（已過期）'},
                    )]
                return [dict(
                    name=f'限時置頂 ({date_str})', raw=encoded, status='active',
                    badges=['active'],
                    meta={'模式': '限時置頂', '標記日期': date_str, '效期': f'{expire_days} 天（有效）'},
                )]
        return [dict(
            name='格式無效', raw=encoded, status='invalid',
            issues=[f'pinned 值 {encoded} 不是布林值或有效 YYYY-MM-DD 日期'],
            badges=['invalid'], meta={'原始值': encoded},
        )]

    def validate_value(self, value):
        if isinstance(value, bool):
            return
        if isinstance(value, str):
            clean = value.strip()
            if clean.lower() in ('true', 'false') or parse_valid_date(clean) is not None:
                return
        raise ValueError('pinned 請輸入 true、false 或有效日期字串（如 "2026-11-26"）。')


APP = PinnedTracker(globals())


def collect_pinned():
    APP.collect()
    return results


def scan_pinned(generate_html=True):
    return APP.scan(generate_html)


def write_dashboard():
    return APP.write_dashboard()


def open_dashboard():
    return APP.open_dashboard()


def main(argv=None):
    return APP.run(argv)


if __name__ == '__main__':
    sys.exit(main())

"""可直接執行的通用 tracker 模板。

複製成 track_your_field.py，修改下方 5 個設定與 App 的名稱即可。
預設掃描 detail.json 的 example 欄位；自訂語法則覆寫 entries()、
validate_value()、replace_value()；非 JSON 工具可直接繼承 TrackerApp。
"""
import sys
# Preserve direct script execution as well as python -m.
if not __package__:
    import sys as _sys
    from pathlib import Path as _Path
    _sys.path.insert(0, str(_Path(__file__).resolve().parents[2]))
from tools.tracker.tracker_common import JsonFieldTracker

from tools.common.paths import ROOT_DIR
PROJECTS_DIR = str(ROOT_DIR / "projects")
OUTPUT_FILE = str(ROOT_DIR / "tools/tracker/reports/example_dashboard.html")
results = {}
scan_info = {}
scanned = False


class ExampleTracker(JsonFieldTracker):
    slug = 'example'
    field_name = 'example'
    title = '自訂欄位管理員'
    description = '追蹤 detail.json 的 example 欄位。'
    backup_tag = 'example'


APP = ExampleTracker(globals())


def main(argv=None):
    return APP.run(argv)


if __name__ == '__main__':
    sys.exit(main())

"""統一 Tracker 網頁入口；原本四支 tracker 的 CLI 仍可獨立使用。"""
import argparse
from pathlib import Path
# Preserve direct script execution as well as python -m.
if not __package__:
    import sys as _sys
    from pathlib import Path as _Path
    _sys.path.insert(0, str(_Path(__file__).resolve().parents[2]))
from tools.common.paths import ROOT_DIR


def main(argv=None):
    parser = argparse.ArgumentParser(description='AZUSTOCK Tracker 本機管理介面')
    parser.add_argument('--web', action='store_true', help='啟動 HTML 介面（預設）')
    parser.add_argument('--root', type=Path, default=ROOT_DIR, help='網站根目錄')
    parser.add_argument('--port', type=int, default=8766)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args(argv)
    if not 0 <= args.port <= 65535:
        parser.error('--port 必須介於 0～65535')
    from tools.tracker.tracker_web import serve
    return serve(args.root, args.port, not args.no_browser)


if __name__ == '__main__':
    raise SystemExit(main())

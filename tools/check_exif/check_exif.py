import argparse
import json
import os
from pathlib import Path
import re
import sys
from typing import Literal
import unicodedata
from PIL import Image

from tools.common.cout import cout
from tools.common.paths import ROOT_DIR

def _root(root_dir=None):
    if root_dir is not None:
        return Path(root_dir).expanduser().resolve()
    return ROOT_DIR


def head_dir(source_dir: Literal['projects', 'api'] | str | os.PathLike | None = 'projects', *, root_dir=None):
    """取得來源目錄；root_dir 可指定儲存庫根目錄。"""
    base = _root(root_dir)
    return str((base / source_dir).resolve() if source_dir else base)


DEFAULT_DIR = head_dir()

def verify_signature(image_path):
    # 搜尋選單選擇跳過時會回傳 None，舊版 tup 迴圈可以直接沿用。
    if image_path is None:
        return
    # 如果檔案不存在就跳過，避免報錯
    if not os.path.exists(image_path):
        cout.warn(f"檔案不存在，跳過測試: {image_path}")
        return
        
    try:
        with Image.open(image_path) as img:
            exif = img.getexif()
            
            # 讀取 Unicode 專用欄位 (40093, 40092)
            artist_raw = exif.get(40093)
            copyright_raw = exif.get(40092)
            
            # 如果有讀到資料，就用 utf-16le 解碼，並把結尾的空字元去掉
            artist = artist_raw.decode('utf-16le').rstrip('\x00') if artist_raw else "未找到作者資訊"
            copyright_info = copyright_raw.decode('utf-16le').rstrip('\x00') if copyright_raw else "未找到版權資訊"
            
            artist_color = 'green' if artist_raw else 'yellow'
            copy_color = 'green' if copyright_raw else 'yellow'

            cout.info(f"正在檢查: {cout.styled(os.path.basename(image_path), 'bold', 'cyan')}", icon_key='search')
            with cout.indent():
                cout.action("作者", artist, color=artist_color, tree=True, indent=-1)
                cout.action("版權", copyright_info, color=copy_color, tree=True, indent=-1)
            print()
            
    except Exception as e:
        cout.error(f"讀取失敗 {image_path}: {e}")

def _norm(value):
    return unicodedata.normalize('NFKC', str(value)).strip().casefold()


def _aliases(name):
    """01_alpha、[01_alpha] 標題：保留全名、代號、數字與文字。"""
    name = _norm(name)
    aliases = {name}
    bracket = re.match(r'^\[([^\]]+)\]\s*(.*)$', name)
    code = bracket[1] if bracket else name
    aliases.add(code)
    if bracket and bracket[2]:
        aliases.add(bracket[2])
    numbered = re.match(r'^(-?\d+)_+(.*)$', code)
    if numbered:
        aliases.update((numbered[1], str(int(numbered[1])), numbered[2]))
    return aliases - {''}


def _parts(value):
    value = os.fspath(value).replace('\\', '/')
    if Path(value).is_absolute() or re.match(r'^[A-Za-z]:', value):
        raise ValueError('完整路徑請使用 image_path(path=...)。')
    parts = [part for part in value.split('/') if part not in ('', '.')]
    if not parts or '..' in parts:
        raise ValueError(f'無效的搜尋條件: {value!r}；完整路徑請使用 path=。')
    return parts


class _SelectionSkipped(Exception):
    """僅用來中止本次搜尋；公開入口會處理，不會顯示 traceback。"""


def _candidate_label(path, scope):
    try:
        display = str(path.relative_to(scope))
    except ValueError:
        display = str(path)
    if path.is_dir():
        return f'資料夾 | {display}'
    details = [path.suffix.lstrip('.').upper() or '檔案']
    try:
        details.append(f'{path.stat().st_size / 1024:.1f} KiB')
        with Image.open(path) as image:
            details.append(f'{image.width} × {image.height}')
    except (OSError, ValueError):
        pass
    return f'{display}  [{", ".join(details)}]'


def _choose(scored, query, scope, interactive=True):
    if not scored:
        raise FileNotFoundError(f'找不到 {query!r}；搜尋範圍: {scope}')
    best = min(score for score, _ in scored)
    matches = sorted({path for score, path in scored if score == best}, key=str)
    if len(matches) != 1:
        if not interactive:
            raise _SelectionSkipped(f'{query!r} 有 {len(matches)} 個符合項目；非互動模式跳過。')
        options = [(str(i), _candidate_label(path, scope))
                   for i, path in enumerate(matches, 1)]
        options.append(('0', '跳過這次搜尋，繼續其他圖片'))
        while True:
            try:
                choice = cout.menu(
                    f'找到多個 {query!r}，請選擇：\n搜尋範圍：{scope}', options,
                    prompt_text='輸入編號（Enter／0／q 跳過）', default='0')
            except (EOFError, KeyboardInterrupt, OSError):
                raise _SelectionSkipped(f'已取消或無法讀取選擇，跳過 {query!r}。') from None
            choice = str(choice).strip().casefold()
            if choice in ('', '0', 'q', 'quit', 'skip'):
                raise _SelectionSkipped(f'已跳過 {query!r}。')
            if choice in {str(i) for i in range(1, len(matches) + 1)}:
                return matches[int(choice) - 1]
            cout.warn(f'請輸入 1～{len(matches)}，或輸入 0 跳過。')
    return matches[0]


def _directories(scope, recursive):
    if not scope.is_dir():
        return
    if not recursive:
        yield from (p for p in scope.iterdir() if p.is_dir())
        return
    for current, dirs, _ in os.walk(scope):
        # 專案搜尋不進文章與縮圖；文章搜尋仍可穿過群組目錄。
        dirs[:] = sorted(d for d in dirs if d not in ('articles', 'thumbnails'))
        for name in dirs:
            yield Path(current) / name


def _find_directory(scope, query, recursive=False, interactive=True):
    parts = _parts(query)
    if len(parts) > 1:
        for part in parts:
            scope = _find_directory(scope, part, interactive=interactive)
        return scope
    query = parts[0]
    normalized = _norm(query)
    queries = {normalized}
    bracket = re.match(r'^\[([^\]]+)\]', normalized)
    if bracket:
        queries.add(bracket[1])
    scored = []
    for path in _directories(scope, recursive):
        aliases = _aliases(path.name)
        # 顯示標題也可搜尋；不影響精確資料夾名稱的優先序。
        try:
            metadata = json.loads((path / 'detail.json').read_text(encoding='utf-8-sig'))
            if isinstance(metadata, dict) and isinstance(metadata.get('title'), str):
                aliases.add(_norm(metadata['title']))
        except (OSError, ValueError):
            pass
        if normalized == _norm(path.name):
            score = 0
        elif queries & aliases:
            score = 1
        elif not re.fullmatch(r'-?\d+', normalized) and any(normalized in a for a in aliases):
            score = 2
        else:
            continue
        scored.append((score, path))
    return _choose(scored, query, scope, interactive)


def _api_id(value):
    value = os.fspath(value)
    bracket = re.match(r'^\[([^\]]+)\]', value)
    if bracket:
        value = bracket[1]
    # 僅剝除開頭的排序編號，保留 alpha_beta 這類完整代號。
    return re.sub(r'^-?\d+_+', '', value)


IMAGE_EXTENSIONS = frozenset(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp',
                              '.tif', '.tiff', '.svg', '.ico', '.avif', '.heic',
                              '.heif', '.apng', '.jfif', '.jxl'))


def _image_name_score(name, query):
    if _norm(name) == _norm(query):
        return 0
    # 未指定已知圖片副檔名時，將整個查詢視為檔名主體；也支援 basic.v2。
    if (Path(query).suffix.lower() not in IMAGE_EXTENSIONS
            and Path(name).suffix.lower() in IMAGE_EXTENSIONS
            and _norm(Path(name).stem) == _norm(query)):
        return 1
    return None


def _find_image(scope, filename, api_auto=False, recursive=True, interactive=True):
    parts = _parts(filename)
    candidates = [parts]
    if api_auto:
        flattened = '_'.join(parts)
        if _norm(flattened) not in ('og', 'og.webp', 'cover_thumb', 'cover_thumb.webp'):
            thumb = flattened if flattened.startswith('thumb_') else 'thumb_' + flattened
            if Path(thumb).suffix.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tif', '.tiff', '.webp', '.svg'):
                thumb = str(Path(thumb).with_suffix('.webp'))
            if [thumb] not in candidates:
                candidates.append([thumb])
    for candidate in candidates:
        directory = scope
        try:
            for segment in candidate[:-1]:
                directory = _find_directory(directory, segment, interactive=interactive)
        except FileNotFoundError:
            continue
        direct = directory / candidate[-1]
        if direct.is_file():
            return direct
        if len(candidate) > 1 or not recursive:
            files = (p for p in directory.iterdir() if p.is_file())
        else:
            files = (Path(current) / name for current, _, names in os.walk(scope) for name in names)
        matches = []
        for path in files:
            score = _image_name_score(path.name, candidate[-1])
            if score is not None:
                matches.append((score, path))
        if matches:
            return _choose(matches, filename, scope, interactive)
    raise FileNotFoundError(f'找不到圖片 {filename!r}；搜尋範圍: {scope}')


def _resolve_image_path(category=None, project=None, article=None, filename=None,
               batch_name='articles', inner_batch_name=None,
               source_dir='projects', auto=True, *, path=None, root_dir=None, interactive=True):
    """搜尋存在的圖片並回傳絕對路徑；找不到或有歧義時拋出例外。

    image_path(project='alpha', article='beta', filename='basic.webp')
    image_path('art', '01_alpha', '01_beta', 'basic.webp')
    image_path(project='[01_alpha]', article='beta', filename='og.webp', source_dir='api')
    image_path(path='/完整路徑/image.webp')  # 也可只傳一個位置參數

    優先序：完整資料夾名稱 > 代號／數字／顯示標題 > 部分文字。
    filename 可省略副檔名；同名不同格式會顯示選單。
    相對 path 從 root_dir（預設為儲存庫根目錄）開始，不受工作目錄影響。
    auto=False 僅關閉 API 路徑轉換；仍會搜尋並檢查檔案是否存在。
    """
    if path is None and category is not None and all(
            value is None for value in (project, article, filename)):
        path, category = category, None
    if path is not None:
        if any(value is not None for value in (category, project, article, filename, inner_batch_name)):
            raise ValueError('path 與分類／專案／文章搜尋參數請擇一使用。')
        direct = Path(path).expanduser()
        if not direct.is_absolute():
            direct = _root(root_dir) / direct
        if direct.is_file():
            return str(direct.resolve())
        if direct.is_dir() or not direct.parent.is_dir():
            raise FileNotFoundError(f'圖片不存在或不是檔案: {direct}')
        # 完整路徑也可省略圖片副檔名，但不擴大至其他子資料夾。
        return str(_find_image(direct.parent, direct.name, recursive=False, interactive=interactive).resolve())
    if not filename:
        raise ValueError('請提供 filename，或使用 image_path(path=完整路徑)。')
    scope = Path(head_dir(source_dir, root_dir=root_dir))
    if not scope.is_dir():
        raise FileNotFoundError(f'來源目錄不存在: {scope}')
    api_auto = auto and source_dir == 'api'
    if category is not None and not api_auto:
        scope = _find_directory(scope, category, interactive=interactive)
    if project is not None:
        scope = _find_directory(scope, _api_id(project) if api_auto else project,
                                recursive=not api_auto, interactive=interactive)
    if article is not None:
        if project is None:
            raise ValueError('指定 article 時也需要 project。')
        if batch_name and not api_auto:
            scope = _find_directory(scope, batch_name, interactive=interactive)
        scope = _find_directory(scope, _api_id(article) if api_auto else article,
                                recursive=True, interactive=interactive)
    if inner_batch_name:
        for segment in _parts(inner_batch_name):
            scope = _find_directory(scope, segment, interactive=interactive)
    return str(_find_image(scope, filename, api_auto, interactive=interactive).resolve())


def image_path(category=None, project=None, article=None, filename=None,
               batch_name='articles', inner_batch_name=None,
               source_dir='projects', auto=True, *, path=None, root_dir=None, interactive=True):
    """搜尋圖片；重名時顯示選單，選擇跳過時回傳 None，否則回傳絕對路徑。

    支援資料夾代號／文字／全名、圖片省略副檔名及 path=完整路徑。
    interactive=False 供批次執行使用，重名時直接跳過，不顯示選單。
    找不到檔案仍拋出 FileNotFoundError；錯誤參數仍拋出 ValueError。
    """
    try:
        return _resolve_image_path(category, project, article, filename, batch_name,
                                   inner_batch_name, source_dir, auto, path=path,
                                   root_dir=root_dir, interactive=interactive)
    except _SelectionSkipped as exc:
        cout.skip(str(exc), indent=0)
        return None


def picture_path(category=None, project=None, article=None, filename=None,
                 batch_name='articles', inner_batch_name=None,
                 source_dir='projects', auto=True, **kwargs):
    """舊名稱相容入口；參數順序維持不變，現在會搜尋並驗證實際檔案。"""
    return image_path(category, project, article, filename, batch_name,
                      inner_batch_name, source_dir, auto, **kwargs)


def _load_web_serve():
    from tools.check_exif.check_exif_web import serve
    return serve


def main(argv=None):
    parser = argparse.ArgumentParser(description='搜尋專案圖片並檢查 EXIF 版權資訊。')
    parser.add_argument('paths', nargs='*', help='完整路徑，或相對於儲存庫根目錄的路徑')
    parser.add_argument('--category', help='分類代號、文字或資料夾全名')
    parser.add_argument('--project', help='專案代號、文字或資料夾全名')
    parser.add_argument('--article', help='文章代號、文字或資料夾全名')
    parser.add_argument('--filename', help='圖片檔名，或文章內的相對路徑')
    parser.add_argument('--inner-dir', help='限定文章內的子資料夾')
    parser.add_argument('--source', choices=('projects', 'api'), default='projects')
    parser.add_argument('--root', help='儲存庫根目錄；預設由腳本位置判斷')
    parser.add_argument('--batch', default='articles', help='文章上層資料夾；空字串表示無')
    parser.add_argument('--no-auto', action='store_true', help='停用 API 路徑轉換')
    parser.add_argument('--no-interactive', action='store_true', help='重名時直接跳過，不詢問')
    parser.add_argument('--web', action='store_true', help='啟動本機 HTML 圖片搜尋與版權檢視介面')
    parser.add_argument('--port', type=int, default=8765, help='HTML 介面的連接埠；0 表示自動選擇')
    parser.add_argument('--no-browser', action='store_true', help='啟動 HTML 介面時不自動開啟瀏覽器')
    args = parser.parse_args(argv)
    if args.web:
        if args.paths or any(value is not None for value in
                             (args.category, args.project, args.article, args.filename, args.inner_dir)):
            parser.error('--web 的搜尋條件請在 HTML 介面輸入；可搭配 --root。')
        if not 0 <= args.port <= 65535:
            parser.error('--port 必須介於 0～65535。')
        try:
            serve = _load_web_serve()
        except (OSError, ImportError) as exc:
            parser.error(str(exc))
        return serve(_root(args.root), port=args.port, open_browser=not args.no_browser,
                     folder_aliases=_aliases)
    selectors = (args.category, args.project, args.article, args.filename, args.inner_dir)
    if args.paths and any(value is not None for value in selectors):
        parser.error('直接路徑與 --project 等搜尋參數請擇一使用。')
    if not args.paths and not args.filename:
        if any(value is not None for value in selectors):
            parser.error('使用搜尋參數時需要 --filename。')
        parser.print_help()
        return 0
    cout.stage('數位簽章檢測', '啟動 EXIF 版權資訊驗證...', icon_key='search')
    requests = [dict(path=p) for p in args.paths] if args.paths else [dict(
        category=args.category, project=args.project, article=args.article,
        filename=args.filename, inner_batch_name=args.inner_dir,
        batch_name=args.batch, source_dir=args.source, auto=not args.no_auto)]
    status = 0
    for request in requests:
        try:
            resolved = image_path(**request, root_dir=args.root, interactive=not args.no_interactive)
            if resolved is not None:
                verify_signature(resolved)
        except (OSError, ValueError) as exc:
            cout.error(str(exc))
            status = 1
    return status


if __name__ == '__main__':
    # 有命令列參數時走 CLI；直接執行／IDE Run 則使用下方可編輯的舊版清單。
    if len(sys.argv) > 1:
        raise SystemExit(main())

    # 自動組合路徑測試：可以保留 os.path.join、完整路徑和 picture_path 混用。
    tup = ()
    tup += (os.path.join(DEFAULT_DIR, 'art', '01_azu5atellite', 'articles', '01_palindrome', 'basic.webp'),)
    tup += (os.path.join(head_dir('api'), 'azu5atellite', 'palindrome', 'og.webp'),)
    tup += (os.path.join(head_dir('api'), 'azu5atellite', 'palindrome', 'cover_thumb.webp'),)
    tup += (os.path.join(head_dir('api'), 'azu5atellite', 'palindrome', 'thumbnails', 'thumb_basic.webp'),)
    # 搜尋型呼叫若缺圖或有重名，提示後繼續處理其他圖片。
    try:
        tup += (picture_path('art', '01_azu5atellite', '01_palindrome', 'basic.webp'),)
    except (OSError, ValueError) as exc:
        cout.warn(str(exc))
    tup += (os.path.join(DEFAULT_DIR, 'art', '01_azu5atellite', 'articles', '01_palindrome', 'clothing', 'normal.webp'),)

    # 智慧搜尋範例：先取消註解，再換成你的專案名稱；同樣可加進 tup。
    try:
        tup += (image_path('art', '1', 'palindrome', 'basic'),)
    except (OSError, ValueError) as exc:
        cout.warn(str(exc))
    try:
        tup += (image_path(project='azu5atellite', article='palindrome', filename='normal'),)
    except (OSError, ValueError) as exc:
        cout.warn(str(exc))

    cout.stage('數位簽章檢測', '啟動 EXIF 版權資訊驗證...', icon_key='search')
    for path in tup:
        verify_signature(path)
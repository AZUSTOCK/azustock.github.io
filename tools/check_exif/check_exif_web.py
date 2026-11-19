"""本機唯讀圖片目錄、版權資訊與 HTML 介面，使用 Python 標準 HTTP server。"""
from datetime import datetime, timezone
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
import json
from pathlib import Path
import re
import threading
import unicodedata
from urllib.parse import parse_qs, urlsplit
import webbrowser
import xml.etree.ElementTree as ET

from PIL import ExifTags, Image, ImageOps

IMAGE_EXTENSIONS = frozenset(('.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp',
                              '.tif', '.tiff', '.svg', '.ico', '.avif', '.heic',
                              '.heif', '.apng', '.jfif', '.jxl'))


def normalize(value):
    return unicodedata.normalize('NFKC', str(value)).strip().casefold()


def folder_terms(name):
    name = normalize(name)
    terms = {name}
    bracket = re.match(r'^\[([^\]]+)\]\s*(.*)$', name)
    code = bracket[1] if bracket else name
    terms.add(code)
    if bracket and bracket[2]:
        terms.add(bracket[2])
    numbered = re.match(r'^(-?\d+)_+(.*)$', code)
    if numbered:
        terms.update((numbered[1], str(int(numbered[1])), numbered[2]))
    return terms - {''}


def match_term(query, terms):
    text = normalize(query)
    bracket = re.match(r'^\[([^\]]+)\]', text)
    if text in terms or (bracket and bracket[1] in terms):
        return True
    return not re.fullmatch(r'-?\d+', text) and any(text in term for term in terms)


def decode_text(value, utf16=False):
    if isinstance(value, (tuple, list)) and all(isinstance(v, int) and 0 <= v <= 255 for v in value):
        value = bytes(value)
    if isinstance(value, bytes):
        encoding = ('utf-16' if value.startswith((b'\xff\xfe', b'\xfe\xff')) else
                    'utf-16le' if utf16 else 'utf-8')
        value = value.decode(encoding, errors='replace')
    return str(value).rstrip('\x00').replace('\x00', ' / ').strip()[:8192] if value is not None else ''


def read_dc_fields(tree, result, source):
    ns = {'dc': 'http://purl.org/dc/elements/1.1/'}
    for field, name in (('author', 'creator'), ('copyright', 'rights')):
        element = tree.find(f'.//dc:{name}', ns)
        if element is not None and not result[field]:
            result[field] = ' / '.join(t.strip() for t in element.itertext() if t.strip())[:8192]
            if result[field]:
                result[field + '_source'] = f'{source} dc:{name}'


def read_metadata(path):
    """讀取 metadata，不呼叫 save，也不修改原檔。"""
    path = Path(path)
    result = dict(author='', copyright='', author_source='', copyright_source='',
                  width=None, height=None, format=path.suffix.lstrip('.').upper(),
                  exif=[], text_fields=[], error='')
    try:
        if path.suffix.lower() == '.svg':
            if path.stat().st_size > 10 * 1024 * 1024:
                raise ValueError('SVG 超過 10 MiB，略過解析與預覽。')
            svg = ET.fromstring(path.read_bytes())
            if svg.tag.split('}')[-1] != 'svg':
                raise ValueError('檔案不是 SVG 圖片。')
            viewbox = re.split(r'[\s,]+', svg.get('viewBox', '').strip())
            for key, index in (('width', 2), ('height', 3)):
                raw = svg.get(key, '')
                match = re.fullmatch(r'([\d.]+)(?:px)?', raw)
                if match:
                    result[key] = float(match[1])
                elif len(viewbox) == 4:
                    result[key] = float(viewbox[index])
            result['format'] = 'SVG'
            read_dc_fields(svg, result, 'SVG metadata')
            return result
        with Image.open(path) as image:
            result.update(width=image.width, height=image.height, format=image.format or result['format'])
            info = image.info
            exif = image.getexif()
            for tag, value in exif.items():
                if isinstance(value, bytes) and tag not in range(40091, 40096):
                    text = f'二進位資料（{len(value)} bytes）'
                else:
                    text = decode_text(value, utf16=tag in range(40091, 40096))
                result['exif'].append(dict(tag=tag, name=ExifTags.TAGS.get(tag, str(tag)), value=text))
            for field, tags in (('author', (40093, 315)), ('copyright', (33432, 40092))):
                for tag in tags:
                    text = decode_text(exif.get(tag), utf16=tag in range(40091, 40096))
                    if text:
                        result[field] = text
                        result[field + '_source'] = f'EXIF {ExifTags.TAGS.get(tag, tag)} ({tag})'
                        break
            for key, value in info.items():
                if normalize(key) not in ('author', 'artist', 'creator', 'copyright', 'rights',
                                          'description', 'title', 'comment', 'software'):
                    continue
                text = decode_text(value)
                result['text_fields'].append(dict(name=key, value=text))
                field = ('author' if normalize(key) in ('author', 'artist', 'creator') else
                         'copyright' if normalize(key) in ('copyright', 'rights') else None)
                if field and text and not result[field]:
                    result[field] = text
                    result[field + '_source'] = f'圖片文字欄位 {key}'
            xmp = info.get('xmp') or info.get('XML:com.adobe.xmp')
            if isinstance(xmp, (str, bytes)) and len(xmp) <= 1024 * 1024:
                try:
                    tree = ET.fromstring(xmp)
                    read_dc_fields(tree, result, 'XMP')
                except ET.ParseError:
                    pass
    except (OSError, ValueError, SyntaxError, Image.DecompressionBombError, ET.ParseError) as exc:
        result['error'] = f'無法讀取圖片資訊：{exc}'
    return result


class ImageCatalog:
    def __init__(self, root, aliases=folder_terms):
        self.root = Path(root).expanduser().resolve()
        self.aliases = aliases
        self.lock = threading.RLock()
        self.entries = {}
        self._folders = None
        self.metadata_titles = {}
        self.source_project_fields = {}
        self.source_article_fields = {}
        self.scanned_at = ''
        self.scan_warnings = []
        self.scan()

    def _title(self, directory):
        if directory not in self.metadata_titles:
            try:
                data = json.loads((directory / 'detail.json').read_text(encoding='utf-8-sig'))
                title = data.get('title', '') if isinstance(data, dict) else ''
                self.metadata_titles[directory] = title if isinstance(title, str) else ''
            except (OSError, ValueError):
                self.metadata_titles[directory] = ''
        return self.metadata_titles[directory]

    def _folder(self, path):
        if path is None:
            return '', set()
        title = self._title(path)
        return title or path.name, self.aliases(path.name) | ({normalize(title)} if title else set())

    def _entry(self, path):
        path = path.resolve()
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            raise ValueError('請指定支援的圖片檔案。')
        stat = path.stat()
        try:
            parts = path.relative_to(self.root).parts
        except ValueError:
            parts = ()
        source = parts[0] if parts and parts[0] in ('projects', 'api') else 'external'
        relative = str(path.relative_to(self.root)) if parts else str(path)
        category = project = article = None
        if source == 'projects':
            base = self.root / 'projects'
            if len(parts) > 2:
                category = base / parts[1]
            if 'articles' in parts[1:-1]:
                index = parts.index('articles')
                project = self.root.joinpath(*parts[:index])
                articles_root = project / 'articles'
                if index + 1 < len(parts) - 1:
                    choices = []
                    parent = path.parent
                    while parent != articles_root:
                        choices.append(parent)
                        parent = parent.parent
                    article = next((p for p in choices if (p / 'detail.json').is_file()), None)
                    if article is None:
                        article = next((p for p in choices if re.match(r'^(?:\[)?-?\d+_', p.name)),
                                       articles_root / parts[index + 1])
            else:
                parent = path.parent
                while parent != base and parent != parent.parent:
                    if (parent / 'articles').is_dir() or ((parent / 'detail.json').is_file() and parent != category):
                        project = parent
                        break
                    parent = parent.parent
        elif source == 'api':
            if len(parts) > 2:
                project = self.root / 'api' / parts[1]
            if len(parts) > 3 and parts[2] != 'thumbnails':
                article = self.root / 'api' / parts[1] / parts[2]
        fields = {}
        for name, directory in (('category', category), ('project', project), ('article', article)):
            label, terms = self._folder(directory)
            fields[name] = directory.name if directory else ''
            fields[name + '_title'] = label
            fields['_' + name] = terms
        def api_key(name):
            bracket = re.match(r'^\[([^\]]+)\]', name)
            return re.sub(r'^-?\d+_+', '', bracket[1] if bracket else name)
        if source == 'projects' and project:
            key = api_key(project.name)
            self.source_project_fields[key] = {name: value for name, value in fields.items()
                                               if 'article' not in name}
            if article:
                self.source_article_fields[(key, api_key(article.name))] = {
                    name: value for name, value in fields.items() if 'article' in name}
        elif source == 'api' and project:
            fields.update(self.source_project_fields.get(project.name, {}))
            if article:
                fields.update(self.source_article_fields.get((project.name, article.name), {}))
        tokens = set()
        for part in path.parts:
            tokens.update(self.aliases(part))
        tokens.update(term for name in ('category', 'project', 'article') for term in fields['_' + name])
        return dict(id=hashlib.sha256(str(path).encode('utf-8')).hexdigest()[:24],
                    name=path.name, stem=path.stem, path=str(path), relative_path=relative,
                    source=source, extension=path.suffix[1:].upper(), size=stat.st_size,
                    modified_ns=stat.st_mtime_ns, _tokens=tokens,
                    _search=normalize(relative.replace('\\', '/')), **fields)

    @staticmethod
    def public(entry):
        return {key: value for key, value in entry.items() if not key.startswith('_')}

    def scan(self):
        import os
        with self.lock:
            self.metadata_titles = {}
            self.source_project_fields = {}
            self.source_article_fields = {}
            entries = {}
            warnings = []
            for entry in self.entries.values():
                if entry['source'] == 'external':
                    try:
                        updated = self._entry(Path(entry['path']))
                        entries[updated['id']] = updated
                    except (OSError, ValueError):
                        pass
            for source in ('projects', 'api'):
                directory = self.root / source
                if not directory.is_dir():
                    continue
                for current, dirs, files in os.walk(directory, onerror=lambda exc: warnings.append(str(exc))):
                    dirs[:] = sorted(d for d in dirs if not d.startswith('.') and d not in ('node_modules', '__pycache__'))
                    for name in files:
                        if Path(name).suffix.lower() not in IMAGE_EXTENSIONS:
                            continue
                        path = Path(current) / name
                        try:
                            path.resolve().relative_to(self.root)
                            entry = self._entry(path)
                            entries[entry['id']] = entry
                        except (OSError, ValueError) as exc:
                            warnings.append(f'{path}: {exc}')
            self.entries = entries
            self._folders = None
            self.scan_warnings = warnings
            self.scanned_at = datetime.now(timezone.utc).isoformat()
            return self.status()

    def status(self):
        with self.lock:
            return dict(root=str(self.root), total=len(self.entries), scanned_at=self.scanned_at,
                        warning_count=len(self.scan_warnings),
                        sources={source: sum(e['source'] == source for e in self.entries.values())
                                 for source in ('projects', 'api', 'external')})

    def _folder_index(self):
        if self._folders is not None:
            return self._folders
        folders = {}
        for entry in self.entries.values():
            parent = Path(entry['path']).parent
            chain = []
            if parent.is_relative_to(self.root):
                while parent != self.root:
                    chain.append(parent)
                    parent = parent.parent
            else:
                chain = [parent]
            for directory in chain:
                key = hashlib.sha256(str(directory).encode('utf-8')).hexdigest()[:24]
                if key not in folders:
                    within = directory.is_relative_to(self.root)
                    label = self._title(directory)
                    top_level = not within or directory.parent == self.root
                    folders[key] = dict(
                        id=key, name=directory.name, title=label or directory.name,
                        path=str(directory), relative_path=str(directory.relative_to(self.root)) if within else str(directory),
                        parent_id='' if top_level else hashlib.sha256(str(directory.parent).encode('utf-8')).hexdigest()[:24],
                        source=entry['source'], image_count=0,
                        _terms=self.aliases(directory.name) | ({normalize(label)} if label else set()))
                folders[key]['image_count'] += 1
        self._folders = folders
        return folders

    def folders(self, query='', parent='', source='all', page=1, page_size=60):
        """列出含已索引圖片的資料夾；空查詢逐層瀏覽，有文字時搜尋全部層級。"""
        if source not in ('all', 'projects', 'api', 'external'):
            raise ValueError('無效的來源選項。')
        page, page_size = max(1, int(page)), min(200, max(1, int(page_size)))
        with self.lock:
            index = self._folder_index()
            if parent and parent not in index:
                raise FileNotFoundError('資料夾已移動或不在索引中，請返回最上層。')
            terms = normalize(query.replace('\\', '/')).split()
            items = []
            for item in index.values():
                if source != 'all' and item['source'] != source:
                    continue
                if terms:
                    path_text = normalize(item['relative_path'].replace('\\', '/'))
                    if not all(match_term(term, item['_terms']) or
                               (not re.fullmatch(r'-?\d+', term) and term in path_text) for term in terms):
                        continue
                elif item['parent_id'] != parent:
                    continue
                items.append(item)
            items.sort(key=lambda item: (normalize(item['relative_path']), item['path']))
            breadcrumbs = []
            current = parent
            while current:
                item = index[current]
                breadcrumbs.append(dict(id=current, name=item['name']))
                current = item['parent_id']
            total = len(items)
            pages = max(1, (total + page_size - 1) // page_size)
            page = min(page, pages)
            start = (page - 1) * page_size
            return dict(items=[self.public(item) for item in items[start:start + page_size]],
                        total=total, page=page, pages=pages, parent=parent,
                        current=self.public(index[parent]) if parent else None,
                        breadcrumbs=list(reversed(breadcrumbs)))

    def search(self, query='', source='all', category='', project='', article='',
               filename='', extension='', folder='', page=1, page_size=48):
        if source not in ('all', 'projects', 'api', 'external'):
            raise ValueError('無效的來源選項。')
        page, page_size = max(1, int(page)), min(100, max(1, int(page_size)))
        query_terms = normalize(query.replace('\\', '/')).split()
        matches = []
        with self.lock:
            scope = None
            if folder:
                scope = self._folder_index().get(folder)
                if scope is None:
                    raise FileNotFoundError('選定的資料夾已不在索引中，請重新選擇。')
                scope = Path(scope['path'])
            for entry in self.entries.values():
                if scope is not None and not Path(entry['path']).is_relative_to(scope):
                    continue
                if source != 'all' and entry['source'] != source:
                    continue
                if extension and normalize(entry['extension']) != normalize(extension).lstrip('.'):
                    continue
                if filename and normalize(filename) not in (normalize(entry['name']), normalize(entry['stem'])):
                    continue
                accepted = True
                for name, value in (('category', category), ('project', project), ('article', article)):
                    text = normalize(value)
                    terms = entry['_' + name]
                    if text and not match_term(text, terms):
                        accepted = False
                        break
                if not accepted:
                    continue
                if not all((match_term(term, entry['_tokens']) or
                            (not re.fullmatch(r'-?\d+', term) and term in entry['_search']))
                           for term in query_terms):
                    continue
                matches.append(entry)
            matches.sort(key=lambda e: (normalize(e['relative_path']), e['path']))
            total = len(matches)
            pages = max(1, (total + page_size - 1) // page_size)
            page = min(page, pages)
            start = (page - 1) * page_size
            return dict(items=[self.public(e) for e in matches[start:start + page_size]],
                        total=total, page=page, pages=pages, page_size=page_size)

    def get(self, image_id):
        with self.lock:
            entry = self.entries.get(image_id)
            if entry is None:
                raise FileNotFoundError('圖片不在目前索引中，請重新搜尋或掃描。')
            path = Path(entry['path'])
            if not path.is_file():
                raise FileNotFoundError('圖片已移動或刪除，請重新掃描。')
            stat = path.stat()
            return {**self.public(entry), 'size': stat.st_size, 'modified_ns': stat.st_mtime_ns}

    def open_path(self, value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError('請輸入圖片完整路徑。')
        value = value.strip().strip('"').strip("'")
        path = Path(value).expanduser()
        if not path.is_absolute():
            path = self.root / path
        if path.is_file():
            paths = [path]
        elif path.is_dir() or not path.parent.is_dir():
            raise FileNotFoundError('找不到這個圖片路徑。')
        else:
            paths = [p for p in path.parent.iterdir() if p.is_file()
                     and p.suffix.lower() in IMAGE_EXTENSIONS and normalize(p.stem) == normalize(path.name)]
        if not paths:
            raise FileNotFoundError('找不到這張圖片；可確認路徑或補上副檔名。')
        with self.lock:
            entries = [self._entry(p) for p in sorted(paths)]
            self.entries.update((e['id'], e) for e in entries)
            self._folders = None
            return dict(items=[self.public(e) for e in entries], total=len(entries), page=1, pages=1)


def preview_image(path, large=False):
    path = Path(path)
    if path.suffix.lower() == '.svg':
        metadata = read_metadata(path)
        if metadata['error']:
            raise ValueError(metadata['error'])
        return path.read_bytes(), 'image/svg+xml'
    output = BytesIO()
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source)
        image.thumbnail((1600, 1600) if large else (480, 360))
        if image.mode not in ('RGB', 'RGBA'):
            image = image.convert('RGBA')
        image.save(output, format='PNG')
    return output.getvalue(), 'image/png'


class CatalogServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, root, port=0, aliases=folder_terms):
        self.catalog = ImageCatalog(root, aliases)
        self.html = Path(__file__).with_name('check_exif.html').read_bytes()
        super().__init__(('127.0.0.1', port), CatalogHandler)


class CatalogHandler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def _reply(self, data, content_type, status=200):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        policy = ("sandbox; default-src 'none'; img-src data:; style-src 'unsafe-inline'" if content_type == 'image/svg+xml' else
                  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; "
                  "img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'")
        self.send_header('Content-Security-Policy', policy)
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _json(self, value, status=200):
        self._reply(json.dumps(value, ensure_ascii=False).encode('utf-8'), 'application/json; charset=utf-8', status)

    def _local_request(self):
        port = self.server.server_port
        hosts = (f'127.0.0.1:{port}', f'localhost:{port}')
        origin = self.headers.get('Origin')
        if self.headers.get('Host', '') not in hosts or (origin and origin not in tuple('http://' + h for h in hosts)):
            self._json({'error': '只接受本機介面的請求。'}, 403)
            return False
        return True

    def do_GET(self):
        if not self._local_request():
            return
        route = urlsplit(self.path)
        try:
            if route.path == '/':
                self._reply(self.server.html, 'text/html; charset=utf-8')
            elif route.path == '/api/status':
                self._json(self.server.catalog.status())
            elif route.path == '/api/search':
                params = parse_qs(route.query)
                allowed = ('query', 'source', 'category', 'project', 'article', 'filename', 'extension', 'folder', 'page', 'page_size')
                self._json(self.server.catalog.search(**{k: params[k][0] for k in allowed if k in params}))
            elif route.path == '/api/folders':
                params = parse_qs(route.query)
                allowed = ('query', 'parent', 'source', 'page', 'page_size')
                self._json(self.server.catalog.folders(**{k: params[k][0] for k in allowed if k in params}))
            elif route.path.startswith('/api/metadata/'):
                entry = self.server.catalog.get(route.path.rsplit('/', 1)[-1])
                self._json({**entry, **read_metadata(entry['path'])})
            elif route.path.startswith('/api/image/'):
                entry = self.server.catalog.get(route.path.rsplit('/', 1)[-1])
                image, mime = preview_image(entry['path'], large=parse_qs(route.query).get('large') == ['1'])
                self._reply(image, mime)
            else:
                self._json({'error': '找不到這個頁面。'}, 404)
        except FileNotFoundError as exc:
            self._json({'error': str(exc)}, 404)
        except (OSError, ValueError, SyntaxError, Image.DecompressionBombError) as exc:
            self._json({'error': str(exc)}, 400)

    def do_POST(self):
        if not self._local_request():
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 16384:
                raise ValueError('無效的請求大小。')
            if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
                raise ValueError('請使用 JSON 請求。')
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError('無效的請求內容。')
            route = urlsplit(self.path).path
            if route == '/api/refresh':
                self._json(self.server.catalog.scan())
            elif route == '/api/open':
                self._json(self.server.catalog.open_path(data.get('path')))
            else:
                self._json({'error': '找不到這個操作。'}, 404)
        except FileNotFoundError as exc:
            self._json({'error': str(exc)}, 404)
        except (OSError, ValueError) as exc:
            self._json({'error': str(exc)}, 400)


def serve(root, port=8765, open_browser=True, folder_aliases=folder_terms):
    try:
        server = CatalogServer(root, port, aliases=folder_aliases)
    except OSError:
        if not port:
            raise
        print(f'連接埠 {port} 無法使用，改用可用連接埠。')
        server = CatalogServer(root, 0, aliases=folder_aliases)
    url = f'http://127.0.0.1:{server.server_port}/'
    print(f'圖片與版權檢視：{url}\n專案根目錄：{server.catalog.root}\n按 Ctrl+C 關閉。', flush=True)
    if open_browser:
        threading.Timer(0.3, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n已關閉圖片檢視介面。')
    finally:
        server.server_close()
    return 0

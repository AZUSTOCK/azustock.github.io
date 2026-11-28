"""Tracker 本機服務：沿用領域掃描、固定 Inspector、預覽後套用與可還原檔案操作。"""
from copy import deepcopy
from datetime import datetime, timezone
import difflib
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib
import json
import os
from pathlib import Path
import re
import secrets
import sys
import tempfile
import threading
import time
from urllib.parse import parse_qs, urlsplit
import uuid
import webbrowser

HERE = Path(__file__).resolve().parent
# Preserve direct script execution as well as python -m.
if not __package__:
    import sys as _sys
    from pathlib import Path as _Path
    _sys.path.insert(0, str(_Path(__file__).resolve().parents[2]))
from tools.tracker import tracker_common as common

ENGINE_LOCK = threading.RLock()
EDITABLE = {'.json', '.md', '.markdown', '.txt'}
MAX_FILE_SIZE = 2 * 1024 * 1024
MAX_PREVIEW_AGE = 15 * 60


def now():
    return datetime.now(timezone.utc).isoformat()


def digest(data):
    return hashlib.sha256(data).hexdigest() if data is not None else None


def normalize(text):
    import unicodedata
    return unicodedata.normalize('NFKC', str(text)).strip().casefold()


def aliases(name):
    text = normalize(name)
    values = {text}
    bracket = re.match(r'^\[([^\]]+)\]\s*(.*)$', text)
    code = bracket[1] if bracket else text
    values.add(code)
    if bracket and bracket[2]:
        values.add(bracket[2])
    match = re.match(r'^(-?\d+)_+(.*)$', code)
    if match:
        values.update((match[1], str(int(match[1])), match[2]))
    return values - {''}


def strict_json(text):
    def reject(value):
        raise ValueError('JSON 不接受 ' + value)
    return json.loads(text, parse_constant=reject)


class ConflictError(ValueError):
    pass


class TrackerEngine:
    def __init__(self, root):
        self.root = Path(root).expanduser().resolve()
        self.projects = self.root / 'projects'
        self.history_dir = self.root / 'tools' / 'tracker' / 'backups' / 'web'
        self.lock = ENGINE_LOCK
        self.tool_specs = (
            dict(slug='keys', default_field='key'),
            dict(slug='versions', default_field='min_sys_version'),
            dict(slug='tags', default_field='tags'),
            dict(slug='sensitive', default_field='sensitive'),
            dict(slug='hidden', default_field='hidden'),
            dict(slug='pinned', default_field='pinned'),
        )
        self.field_specs = (
            dict(name='key', label='key · 發放金鑰', default_value=''),
            dict(name='required_key', label='required_key · 上鎖條件', default_value=''),
            dict(name='min_sys_version', label='min_sys_version · 最低版本', default_value=''),
            dict(name='tags', label='tags · 標籤', default_value=[]),
            dict(name='sensitive', label='sensitive · 內容警告', default_value={'MAIN': True}),
            dict(name='hidden', label='hidden · 限時隱藏', default_value=True),
            dict(name='pinned', label='pinned · 置頂項目', default_value=True),
        )
        self.modules = {spec['slug']: importlib.import_module('tools.tracker.track_' + spec['slug'])
                        for spec in self.tool_specs}
        self.reports = {}
        self.pending = {}
        self.scan()

    def safe_path(self, value):
        if not isinstance(value, str) or not value.strip() or '\x00' in value:
            raise ValueError('請指定專案內的檔案路徑。')
        raw = value.replace('\\', '/')
        if '..' in Path(raw).parts:
            raise ValueError('路徑不能包含 ..。')
        path = Path(raw).expanduser()
        if not path.is_absolute():
            if raw.startswith('projects/'):
                path = self.root / path
            else:
                path = self.projects / path
        absolute = Path(os.path.abspath(path))
        if not absolute.is_relative_to(self.projects):
            raise ValueError('只能操作目前網站 projects 內的檔案。')
        current = absolute
        while current != self.projects.parent:
            if current.is_symlink():
                raise ValueError('不操作符號連結：' + str(current))
            current = current.parent
        if not absolute.resolve().is_relative_to(self.projects.resolve()):
            raise ValueError('路徑超出 projects。')
        if absolute.suffix.lower() not in EDITABLE:
            raise ValueError('可操作 JSON、Markdown 與 TXT 文字檔案。')
        return absolute

    def relative(self, path):
        return Path(path).relative_to(self.projects).as_posix()

    def snapshot(self, path):
        if not path.exists():
            return None
        if not path.is_file():
            raise ValueError('這個位置不是一般檔案。')
        if path.stat().st_size > MAX_FILE_SIZE:
            raise ValueError('檔案超過 2 MiB，請使用外部編輯器處理。')
        return path.read_bytes()

    def safe_history(self, operation_id=None):
        directory = self.history_dir
        if operation_id is not None:
            if not re.fullmatch(r'[0-9a-f]{32}', str(operation_id)):
                raise ValueError('無效的操作編號。')
            directory = directory / operation_id
        current = directory
        while current != self.root.parent:
            if current.is_symlink():
                raise ValueError('備份目錄不可使用符號連結。')
            current = current.parent
        if not directory.resolve().is_relative_to(self.root):
            raise ValueError('備份目錄超出網站範圍。')
        return directory

    def scan(self):
        with self.lock:
            reports = {}
            for name, module in self.modules.items():
                module.PROJECTS_DIR = str(self.projects)
                module.OUTPUT_FILE = str(self.root / 'tools/tracker/reports' / (name + '_dashboard.html'))
                try:
                    module.APP.collect()
                    report = deepcopy(module.APP.report())
                    report.update(title=module.APP.title, slug=name, filters=deepcopy(module.APP.filters),
                                  scan=deepcopy(module.scan_info))
                    for group in report['groups']:
                        safe_records = []
                        for record in group['records']:
                            try:
                                source = record.get('md_raw_abs') or record.get('raw_abs') or record.get('file')
                                path = self.safe_path(str(source))
                                record.update(edit_path=self.relative(path), group=group['name'],
                                              edit_line=record.get('md_line') or record.get('line', 1))
                                safe_records.append(record)
                            except (OSError, ValueError):
                                continue
                        group['records'] = safe_records
                    report['groups'] = [g for g in report['groups'] if g['records']]
                    for record in report.get('unset', []):
                        path = self.safe_path(record.get('raw_abs') or record['file'])
                        record.update(edit_path=self.relative(path), group='未設定', edit_line=record.get('line', 1))
                except (OSError, UnicodeError, ValueError) as exc:
                    report = dict(title=module.APP.title, slug=name, groups=[], unset=[], filters=deepcopy(module.APP.filters),
                                  scan=dict(time=now(), errors=[str(exc)], root=str(self.projects), files=0))
                reports[name] = report
            self.reports = reports
            self.scanned_at = now()
            return self.status()

    def status(self):
        with self.lock:
            default_fields = {spec['slug']: spec['default_field'] for spec in self.tool_specs}
            return dict(root=str(self.root), projects=str(self.projects), scanned_at=self.scanned_at,
                        fields=list(self.field_specs),
                        tools=[dict(slug=name, title=report['title'], default_field=default_fields.get(name, ''),
                                    groups=len(report['groups']),
                                    records=sum(len(g['records']) for g in report['groups']))
                               for name, report in self.reports.items()])

    def folder_matches(self, path, query):
        if not query:
            return True
        query = normalize(query.replace('\\', '/'))
        terms = set()
        parts = Path(path).parts
        for part in parts:
            terms.update(aliases(part))
        full_path = normalize(str(path).replace('\\', '/'))
        def matches(term):
            bracket = re.fullmatch(r'\[([^\]]+)\]', term)
            if bracket:
                term = bracket[1]
            return term in terms if re.fullmatch(r'-?\d+', term) else term in full_path or any(term in value for value in terms)
        return all(matches(term) for term in query.split())

    def folders(self, query=''):
        result = [dict(path='', name='全部專案', title='全部專案')]
        if self.projects.is_dir():
            for current, dirs, _ in os.walk(self.projects, followlinks=False):
                dirs[:] = sorted(d for d in dirs if not d.startswith('.') and not (Path(current) / d).is_symlink())
                path = Path(current)
                if path == self.projects:
                    continue
                relative = self.relative(path)
                title = path.name
                try:
                    value = strict_json((path / 'detail.json').read_text(encoding='utf-8-sig'))
                    if isinstance(value, dict) and isinstance(value.get('title'), str):
                        title = value['title']
                except (OSError, UnicodeError, ValueError):
                    pass
                if self.folder_matches(relative, query) or (not re.fullmatch(r'-?\d+', normalize(query)) and normalize(query) in normalize(title)):
                    result.append(dict(path=relative, name=path.name, title=title))
        return result

    def in_scope(self, relative, folder):
        return not folder or relative == folder or relative.startswith(folder.rstrip('/') + '/')

    def report(self, tool='keys', query='', folder='', group='', groups=None, badges=None,
               filter_key='', filter_value='all', unset=False, page=1):
        if tool not in self.reports:
            raise ValueError('未知的 tracker。')
        with self.lock:
            report = deepcopy(self.reports[tool])
        records = report.get('unset', []) if unset else [r for g in report['groups'] for r in g['records']]
        selected_groups = [g for g in (groups if groups is not None else ([group] if group else [])) if g]
        selected_badges = [b for b in (badges or []) if b]
        matched = []
        for record in records:
            if not self.in_scope(record['edit_path'], folder):
                continue
            if query and normalize(query) not in normalize(json.dumps(record, ensure_ascii=False)):
                continue
            if filter_key and filter_value != 'all':
                if filter_key == 'category' and record.get('categories'):
                    if filter_value not in record['categories']:
                        continue
                elif str(record.get(filter_key, '')) != filter_value:
                    continue
            if selected_badges:
                rec_badges = {str(x) for x in (record.get('group'), record.get('kind'), *(record.get('badges') or [])) if x}
                if not all(b in rec_badges for b in selected_badges):
                    continue
            matched.append(record)
        group_counts = {}
        for record in matched:
            group_counts[record['group']] = group_counts.get(record['group'], 0) + 1
        if selected_groups:
            group_set = set(selected_groups)
            matched = [r for r in matched if r['group'] in group_set]
        total = len(matched)
        pages = max(1, (total + 49) // 50)
        page = min(max(1, int(page)), pages)
        return dict(items=matched[(page - 1) * 50:page * 50], total=total, page=page, pages=pages,
                    groups=[dict(name=name, count=count) for name, count in group_counts.items()],
                    filters=report['filters'], scan=report['scan'], title=report['title'])

    def files(self, query='', folder='', page=1):
        result = []
        if self.projects.is_dir():
            for current, dirs, files in os.walk(self.projects, followlinks=False):
                dirs[:] = sorted(d for d in dirs if not d.startswith('.') and not (Path(current) / d).is_symlink())
                for name in sorted(files):
                    path = Path(current) / name
                    if path.suffix.lower() not in EDITABLE or path.is_symlink():
                        continue
                    relative = self.relative(path)
                    if not self.in_scope(relative, folder) or (query and not self.folder_matches(relative, query)):
                        continue
                    stat = path.stat()
                    result.append(dict(path=relative, name=name, size=stat.st_size))
        pages = max(1, (len(result) + 49) // 50)
        page = min(max(1, int(page)), pages)
        return dict(items=result[(page - 1) * 50:page * 50], total=len(result), page=page, pages=pages)

    def file(self, value):
        path = self.safe_path(value)
        data = self.snapshot(path)
        if data is None:
            raise FileNotFoundError('檔案不存在。')
        return dict(path=self.relative(path), absolute=str(path), content=data.decode('utf-8-sig'),
                    hash=digest(data), size=len(data), bom=data.startswith(b'\xef\xbb\xbf'),
                    newline='CRLF' if b'\r\n' in data else 'LF')

    def validate_content(self, path, data):
        if data is None:
            return
        if len(data) > MAX_FILE_SIZE:
            raise ValueError('文字檔案上限為 2 MiB。')
        text = data.decode('utf-8-sig')
        if '\x00' in text:
            raise ValueError('不支援含 NUL 字元的二進位內容。')
        if path.suffix.lower() == '.json':
            value = strict_json(text)
            if path.name == 'detail.json' and not isinstance(value, dict):
                raise ValueError('detail.json 必須是 JSON 物件。')

    def encode_content(self, content, before=None):
        if not isinstance(content, str):
            raise ValueError('請輸入文字內容。')
        text = content.replace('\r\n', '\n')
        if before is not None and b'\r\n' in before and b'\n' not in before.replace(b'\r\n', b''):
            text = text.replace('\n', '\r\n')
        return (b'\xef\xbb\xbf' if before and before.startswith(b'\xef\xbb\xbf') else b'') + text.encode('utf-8')

    def preview(self, request):
        with self.lock:
            action = request.get('action')
            path = self.safe_path(request.get('path'))
            before = self.snapshot(path)
            if action != 'create':
                if before is None:
                    raise FileNotFoundError('找不到檔案。')
                if request.get('expected_hash') != digest(before):
                    raise ConflictError('檔案已變動，請重新載入後再預覽。')
            changes = []
            label = dict(create='新增檔案', edit='修改檔案', delete='刪除檔案', rename='移動／更名', field='修改欄位').get(action)
            if label is None:
                raise ValueError('未知的操作。')
            if action == 'create':
                if before is not None:
                    raise ConflictError('同名檔案已存在，請更換路徑。')
                changes.append((path, None, self.encode_content(request.get('content'))))
            elif action == 'edit':
                changes.append((path, before, self.encode_content(request.get('content'), before)))
            elif action == 'delete':
                changes.append((path, before, None))
            elif action == 'rename':
                destination = self.safe_path(request.get('destination'))
                if destination == path:
                    raise ValueError('新舊路徑相同。')
                if destination.exists():
                    raise ConflictError('目標路徑已存在，不會覆蓋。')
                changes.extend(((path, before, None), (destination, None, before)))
            elif action == 'field':
                if path.name != 'detail.json':
                    raise ValueError('欄位操作只適用 detail.json。')
                allowed = {spec['name'] for spec in self.field_specs}
                field = request.get('field')
                if field not in allowed:
                    raise ValueError('請選擇支援的設定欄位。')
                value = common.REMOVE if request.get('remove') is True else request.get('value')
                data = strict_json(before.decode('utf-8-sig'))
                if field in ('sensitive', 'hidden', 'pinned'):
                    module = self.modules[field]
                    module.PROJECTS_DIR = str(self.projects)
                    module.APP.validate_target({'data': data, 'path': path})
                    field = module.APP.select_field_name(data)
                    if value is not common.REMOVE:
                        module.APP.validate_value(value)
                elif value is not common.REMOVE:
                    if field == 'min_sys_version' and (not isinstance(value, str) or not value.strip()):
                        raise ValueError('最低版本請輸入非空白字串。')
                    if field == 'tags' and (not isinstance(value, list) or not all(isinstance(v, str) for v in value)):
                        raise ValueError('tags 請使用字串陣列。')
                    if field == 'key' and not (isinstance(value, str) or
                                               isinstance(value, list) and all(isinstance(v, str) for v in value)):
                        raise ValueError('key 請使用字串或字串陣列。')
                    if field == 'required_key' and not (isinstance(value, str) or isinstance(value, list)):
                        raise ValueError('金鑰設定請使用字串或陣列。')
                text, _ = common.mutate_json_field(before.decode('utf-8-sig'), field, value)
                after = (b'\xef\xbb\xbf' if before.startswith(b'\xef\xbb\xbf') else b'') + text.encode('utf-8')
                changes.append((path, before, after))
            return self.store_plan(label, changes, note='更名不會自動更新其他檔案中的路徑引用。' if action == 'rename' else '')

    def store_plan(self, label, changes, note=''):
        changes = [(p, before, after) for p, before, after in changes if before != after]
        if not changes:
            raise ValueError('內容沒有變更。')
        public = []
        for path, before, after in changes:
            self.validate_content(path, after)
            before_text = before.decode('utf-8-sig').splitlines() if before is not None else []
            after_text = after.decode('utf-8-sig').splitlines() if after is not None else []
            diff = '\n'.join(difflib.unified_diff(before_text, after_text, fromfile=self.relative(path) + '（原本）',
                                                 tofile=self.relative(path) + '（套用後）', lineterm=''))
            if not diff:
                diff = '文字行內容相同；變更了檔尾換行或檔案狀態。'
            public.append(dict(path=self.relative(path), before_exists=before is not None, after_exists=after is not None,
                               diff=diff, creates_parent=after is not None and not path.parent.exists()))
        token = secrets.token_urlsafe(24)
        self.pending = {key: value for key, value in self.pending.items() if time.monotonic() - value['created'] < MAX_PREVIEW_AGE}
        if len(self.pending) >= 30:
            self.pending.pop(next(iter(self.pending)))
        self.pending[token] = dict(label=label, changes=changes, created=time.monotonic())
        return dict(token=token, label=label, changes=public, note=note)

    def atomic_write(self, path, content):
        if content is None:
            path.unlink()
            return
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as output:
                temporary = Path(output.name)
                output.write(content)
            if path.exists():
                temporary.chmod(path.stat().st_mode)
            os.replace(temporary, path)
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)

    def apply(self, token):
        with self.lock:
            plan = self.pending.pop(token, None)
            if plan is None or time.monotonic() - plan['created'] > MAX_PREVIEW_AGE:
                raise ConflictError('預覽已過期或已使用，請重新預覽。')
            for path, before, _ in plan['changes']:
                self.safe_path(str(path))
                if self.snapshot(path) != before:
                    raise ConflictError('預覽後檔案已變動，請重新預覽：' + self.relative(path))
            operation_id = uuid.uuid4().hex
            directory = self.safe_history(operation_id)
            directory.mkdir(parents=True)
            metadata = dict(id=operation_id, time=now(), label=plan['label'], status='pending', files=[])
            for index, (path, before, after) in enumerate(plan['changes']):
                backup = str(index) + '.before'
                if before is not None:
                    (directory / backup).write_bytes(before)
                metadata['files'].append(dict(path=self.relative(path), backup=backup if before is not None else None,
                                              after_hash=digest(after), before_hash=digest(before)))
            meta_path = directory / 'operation.json'
            self.atomic_write(meta_path, json.dumps(metadata, ensure_ascii=False, indent=2).encode('utf-8'))
            written = []
            try:
                for path, before, after in plan['changes']:
                    self.safe_path(str(path))
                    if self.snapshot(path) != before:
                        raise ConflictError('套用期間檔案已變動：' + self.relative(path))
                    self.atomic_write(path, after)
                    written.append((path, before, after))
                metadata['status'] = 'applied'
                self.atomic_write(meta_path, json.dumps(metadata, ensure_ascii=False, indent=2).encode('utf-8'))
            except Exception as exc:
                rollback_errors = []
                for path, before, after in reversed(written):
                    try:
                        self.safe_path(str(path))
                        if self.snapshot(path) != after:
                            raise ConflictError('套用後又被其他程式修改')
                        self.atomic_write(path, before)
                    except (OSError, ValueError) as error:
                        rollback_errors.append(self.relative(path) + ': ' + str(error))
                metadata.update(status='failed', error=str(exc), rollback_errors=rollback_errors)
                self.atomic_write(meta_path, json.dumps(metadata, ensure_ascii=False, indent=2).encode('utf-8'))
                raise ConflictError('套用失敗：' + str(exc) + ('；部分還原失敗，請查看操作紀錄。' if rollback_errors else '；已還原本次已寫入的檔案。')) from exc
            self.scan()
            return dict(id=operation_id, message='已套用修改並重新掃描。', files=metadata['files'])

    def history(self):
        result = []
        self.safe_history()
        if self.history_dir.is_dir():
            for directory in self.history_dir.iterdir():
                if not directory.is_dir() or directory.is_symlink():
                    continue
                try:
                    meta_path = directory / 'operation.json'
                    if meta_path.is_symlink():
                        continue
                    data = strict_json(meta_path.read_text(encoding='utf-8'))
                    result.append(dict(id=data['id'], time=data['time'], label=data['label'], status=data['status'],
                                       paths=[item['path'] for item in data['files']], error=data.get('error', ''),
                                       rollback_errors=data.get('rollback_errors', [])))
                except (OSError, ValueError, KeyError):
                    continue
        return sorted(result, key=lambda item:item['time'], reverse=True)[:100]

    def preview_restore(self, operation_id):
        with self.lock:
            directory = self.safe_history(operation_id)
            meta_path = directory / 'operation.json'
            if meta_path.is_symlink():
                raise ValueError('操作紀錄不可使用符號連結。')
            metadata = strict_json(meta_path.read_text(encoding='utf-8'))
            if metadata['status'] not in ('applied', 'pending', 'failed'):
                raise ValueError('無效的操作狀態。')
            changes = []
            for item in metadata['files']:
                path = self.safe_path(item['path'])
                current = self.snapshot(path)
                current_hash = digest(current)
                if current_hash == item['before_hash']:
                    continue
                if current_hash != item['after_hash']:
                    raise ConflictError('檔案在該次操作後已有其他變更，請先查看內容：' + item['path'])
                if item['backup'] and not re.fullmatch(r'\d+\.before', item['backup']):
                    raise ValueError('備份檔案名稱不正確。')
                backup = directory / item['backup'] if item['backup'] else None
                if backup is not None and backup.is_symlink():
                    raise ValueError('備份檔案不可使用符號連結。')
                before = backup.read_bytes() if backup else None
                if digest(before) != item['before_hash']:
                    raise ConflictError('備份內容不完整，無法自動還原。')
                changes.append((path, current, before))
            if not changes:
                raise ValueError('檔案已在該次操作前的狀態，無需還原。')
            return self.store_plan('還原：' + metadata['label'], changes)


class TrackerServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, root, port=0):
        self.engine = TrackerEngine(root)
        self.csrf = secrets.token_urlsafe(32)
        self.html = (HERE / 'tracker.html').read_bytes()
        super().__init__(('127.0.0.1', port), TrackerHandler)


class TrackerHandler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def reply(self, value, status=200, html=False):
        body = value if html else json.dumps(value, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8' if html else 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'none'")
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def allowed(self, write=False):
        host = self.headers.get('Host')
        allowed = (f'127.0.0.1:{self.server.server_port}', f'localhost:{self.server.server_port}')
        origin = self.headers.get('Origin')
        if host not in allowed or (origin and origin not in ('http://' + item for item in allowed)):
            self.reply({'error':'只接受本機介面的請求。'}, 403)
            return False
        if write and not secrets.compare_digest(self.headers.get('X-Tracker-Token', ''), self.server.csrf):
            self.reply({'error':'連線已更新，請重新整理介面。'}, 403)
            return False
        return True

    def do_GET(self):
        if not self.allowed():
            return
        route = urlsplit(self.path)
        params = {key:value[0] for key,value in parse_qs(route.query).items()}
        engine = self.server.engine
        try:
            if route.path == '/':
                return self.reply(self.server.html, html=True)
            if route.path == '/api/status':
                return self.reply({**engine.status(), 'token':self.server.csrf})
            if route.path == '/api/report':
                raw_qs = parse_qs(route.query)
                keys = ('tool','query','folder','filter_key','filter_value','page')
                return self.reply(engine.report(
                    **{k:params[k] for k in keys if k in params},
                    groups=raw_qs.get('group'),
                    badges=raw_qs.get('badge'),
                    unset=params.get('unset') == '1',
                ))
            if route.path == '/api/folders':
                return self.reply({'items':engine.folders(params.get('query',''))})
            if route.path == '/api/files':
                return self.reply(engine.files(**{k:params[k] for k in ('query','folder','page') if k in params}))
            if route.path == '/api/file':
                return self.reply(engine.file(params.get('path')))
            if route.path == '/api/history':
                return self.reply({'items':engine.history()})
            self.reply({'error':'找不到頁面。'}, 404)
        except FileNotFoundError as exc:
            self.reply({'error':str(exc)}, 404)
        except (OSError, UnicodeError, ValueError, TypeError) as exc:
            self.reply({'error':str(exc)}, 400)

    def do_POST(self):
        if not self.allowed(write=True):
            return
        try:
            size = int(self.headers.get('Content-Length','0'))
            if not 0 < size <= 8 * 1024 * 1024 or self.headers.get('Content-Type','').split(';')[0] != 'application/json':
                raise ValueError('請使用大小不超過 8 MiB 的 JSON 請求。')
            data = strict_json(self.rfile.read(size).decode('utf-8'))
            if not isinstance(data, dict):
                raise ValueError('請求內容必須是 JSON 物件。')
            route = urlsplit(self.path).path
            engine = self.server.engine
            if route == '/api/scan':
                return self.reply(engine.scan())
            if route == '/api/preview':
                return self.reply(engine.preview(data))
            if route == '/api/apply':
                return self.reply(engine.apply(data.get('token')))
            if route == '/api/restore-preview':
                return self.reply(engine.preview_restore(data.get('id')))
            self.reply({'error':'找不到操作。'},404)
        except ConflictError as exc:
            self.reply({'error':str(exc)},409)
        except FileNotFoundError as exc:
            self.reply({'error':str(exc)},404)
        except (OSError, UnicodeError, ValueError, TypeError) as exc:
            self.reply({'error':str(exc)},400)


def serve(root, port=8766, open_browser=True):
    try:
        server = TrackerServer(root, port)
    except OSError:
        if not port:
            raise
        print(f'連接埠 {port} 無法使用，改用可用連接埠。')
        server = TrackerServer(root, 0)
    url = f'http://127.0.0.1:{server.server_port}/'
    print(f'Tracker 管理介面：{url}\n網站根目錄：{server.engine.root}\n按 Ctrl+C 關閉。', flush=True)
    if open_browser:
        timer = threading.Timer(.3,lambda:webbrowser.open(url))
        timer.daemon = True
        timer.start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n已關閉 Tracker 管理介面。')
    finally:
        server.server_close()
    return 0
"""AZUSTOCK Tracker 共用核心。Python 3.10+，僅使用標準函式庫。

所有 tracker 共用 CLI、選單、HTML、JSON 定位與有備份的原子寫入。
領域規則留在各自的 App 子類；新增工具可複製 tracker_template.py。
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import urllib.parse
import webbrowser
from datetime import datetime
from pathlib import Path

USE_COLOR = False
REMOVE = object()
RE_DATE = re.compile(r'^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$')


def parse_valid_date(text):
    match = RE_DATE.match(str(text).strip())
    if not match:
        return None
    y, m, d = int(match.group(1)), int(match.group(2)), int(match.group(3))
    try:
        return datetime(y, m, d)
    except ValueError:
        return None


def print_unset_targets_list(targets, *, is_unset, heading, query='', kind='all', note_fn=None, location_fn=None):
    q = query.casefold()
    items = [
        t for t in targets
        if is_unset(t)
        and (kind == 'all' or t['kind'] == kind)
        and (not q or any(q in str(t[f]).casefold() for f in ('file', 'title', 'target_id')))
    ]
    print(styled(f'\n{heading} · 共 {len(items)} 筆', 'bold'))
    if not items:
        print('沒有符合條件的未設定項目。')
        return items
    for t in items:
        label = '專案' if t['kind'] == 'projects' else '文章'
        color = 'green' if t['kind'] == 'projects' else 'cyan'
        note = note_fn(t) if note_fn else ''
        print(f"  [{styled(label, color)}] {styled(t['target_id'], 'yellow')} ({t['title']}){note}")
        if location_fn:
            print(location_fn(t))
    return items


def styled(value, color='cyan'):
    codes = {'cyan': '36', 'green': '32', 'yellow': '33', 'red': '31', 'bold': '1'}
    value = re.sub(r'[\x00-\x08\x0b-\x1f\x7f-\x9f]', '', str(value))
    return '\033[' + codes[color] + 'm' + value + '\033[0m' if USE_COLOR else value


def configure_color(plain=False):
    global USE_COLOR
    USE_COLOR = sys.stdout.isatty() and 'NO_COLOR' not in os.environ and not plain
    if USE_COLOR and os.name == 'nt':
        try:
            import ctypes
            mode = ctypes.c_ulong()
            handle = ctypes.windll.kernel32.GetStdHandle(-11)
            USE_COLOR = bool(ctypes.windll.kernel32.GetConsoleMode(handle, ctypes.byref(mode))
                             and ctypes.windll.kernel32.SetConsoleMode(handle, mode.value | 4))
        except (AttributeError, OSError):
            USE_COLOR = False
    return USE_COLOR


def source_path(projects, name):
    """網站設定優先使用 projects 同層檔案，才回退至目前工作目錄。"""
    root = Path(projects).resolve().parent
    path = root / name
    return path if path.is_file() else Path.cwd() / name


def parse_folder_id(folder_name):
    match = re.match(r'^(-?\d+)_+(.*)$', folder_name)
    return match.group(2) if match else folder_name


def classify_detail_path(path_obj, root_path):
    parts = path_obj.parent.relative_to(root_path).parts
    if len(parts) <= 1:
        return 'category', None, None
    if 'articles' in parts:
        i = parts.index('articles')
        return 'articles', parse_folder_id(parts[i - 1]), parse_folder_id(parts[-1])
    return 'projects', parse_folder_id(parts[-1]), None


def json_field_spans(text):
    """驗證完整 JSON，回傳頂層欄位的字元範圍、行、欄；不改寫原排版。"""
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError('detail.json 的頂層必須是物件')
    decoder = json.JSONDecoder()
    opening = len(text) - len(text.lstrip())
    index, fields = opening + 1, []
    while index < len(text):
        while text[index].isspace():
            index += 1
        if text[index] == '}':
            break
        start = index
        name, index = decoder.raw_decode(text, index)
        key_end = index
        while text[index].isspace():
            index += 1
        colon = index
        index += 1
        while text[index].isspace():
            index += 1
        val_start = index
        value, index = decoder.raw_decode(text, index)
        val_end = index
        while text[index].isspace():
            index += 1
        comma = index if text[index] == ',' else None
        if comma is not None:
            index += 1
        fields.append(dict(name=name, value=value, key_start=start, key_end=key_end,
                           colon_idx=colon, val_start=val_start, val_end=val_end,
                           comma_idx=comma, line=text.count('\n', 0, start) + 1,
                           column=start - text.rfind('\n', 0, start),
                           val_line=text.count('\n', 0, val_start) + 1,
                           val_column=val_start - text.rfind('\n', 0, val_start)))
    return opening, fields


def mutate_json_field(text, field_name, value=REMOVE):
    """只編輯單一頂層欄位。REMOVE 與 JSON null 分開；保留其他欄位原文字。"""
    opening, fields = json_field_spans(text)
    found = [f for f in fields if f['name'] == field_name]
    if len(found) > 1:
        raise ValueError('欄位重複，請先修正：' + field_name)
    field = found[0] if found else None
    if value is REMOVE:
        if field is None:
            return text, None
        i = fields.index(field)
        if field['comma_idx'] is not None:
            modified = text[:field['key_start']] + text[field['comma_idx'] + 1:]
        elif i:
            modified = text[:fields[i - 1]['comma_idx']] + text[field['val_end']:]
        else:
            modified = text[:field['key_start']] + text[field['val_end']:]
    else:
        encoded = json.dumps(value, ensure_ascii=False, allow_nan=False)
        if field:
            # bool 與數字不可因 Python 的 True == 1 而被誤判為同值。
            if json.dumps(field['value'], ensure_ascii=False, allow_nan=False) == encoded:
                return text, None
            modified = text[:field['val_start']] + encoded + text[field['val_end']:]
        else:
            nl = '\r\n' if '\r\n' in text else '\n'
            if fields:
                anchor = fields[-1]
                indent = re.match(r'[ \t]*', text[text.rfind('\n', 0, anchor['key_start']) + 1:]).group()
                addition = ',' + nl + indent + json.dumps(field_name) + ': ' + encoded
                modified = text[:anchor['val_end']] + addition + text[anchor['val_end']:]
            else:
                modified = text[:opening + 1] + nl + '  ' + json.dumps(field_name) + ': ' + encoded + nl + text[opening + 1:]
    json.loads(modified)
    line = field['line'] if field else 1
    return modified, dict(line=line, column=field['column'] if field else 1,
                         before=json.dumps(field['value'], ensure_ascii=False) if field else '(未設定)',
                         after='(移除欄位)' if value is REMOVE else json.dumps(value, ensure_ascii=False))


def detail_targets(projects, errors=None):
    root = Path(projects)
    if not root.is_dir():
        raise FileNotFoundError('找不到專案目錄：' + str(root.resolve()))
    def onerror(error):
        if errors is None:
            raise error
        errors.append(str(error))
    for directory, dirs, files in os.walk(root, onerror=onerror):
        dirs.sort()
        if 'detail.json' not in files:
            continue
        path = Path(directory) / 'detail.json'
        kind, project, article = classify_detail_path(path, root)
        if kind == 'category':
            continue
        try:
            before = path.read_bytes()
            text = before.decode('utf-8-sig')
            data = json.loads(text)
            if not isinstance(data, dict):
                raise ValueError('detail.json 的頂層必須是物件')
            yield dict(path=path, before=before, text=text, data=data, kind=kind,
                       target_id=f'{project} / {article}' if article is not None else str(project),
                       title=str(data.get('title') or article or project))
        except (OSError, UnicodeError, ValueError) as error:
            if errors is None:
                raise
            errors.append(str(path) + ': ' + str(error))


def target_matches(item, file_filter='', kind='all'):
    return (kind == 'all' or item['kind'] == kind) and (not file_filter or any(
        file_filter.casefold() in str(item.get(k, '')).casefold()
        for k in ('path', 'file', 'raw_abs', 'title', 'target_id')))


def make_plan(item, modified, change):
    bom = b'\xef\xbb\xbf' if item['before'].startswith(b'\xef\xbb\xbf') else b''
    return dict(path=item['path'], before=item['before'], after=bom + modified.encode('utf-8'),
                change=change, title=item['title'], target_id=item['target_id'], kind=item['kind'])


def apply_changes(plans, backup_tag):
    """全批先比對預覽快照；逐檔備份、同目錄原子替換。非跨檔案交易。"""
    for plan in plans:
        path = Path(plan['path'])
        if path.is_symlink():
            raise ValueError('不修改符號連結：' + str(path))
        if path.read_bytes() != plan['before']:
            raise ValueError('檔案已變動，請重新預覽：' + str(path))
    changed_files = changed_records = 0
    errors = []
    for plan in plans:
        path = Path(plan['path'])
        temporary = None
        try:
            if path.is_symlink() or path.read_bytes() != plan['before']:
                raise ValueError('預覽後檔案已變動')
            index = 0
            while True:
                suffix = f'.{index}' if index else ''
                backup = Path(str(path) + f'.{backup_tag}{suffix}.bak')
                try:
                    with backup.open('xb') as stream:
                        stream.write(plan['before'])
                    break
                except FileExistsError:
                    index += 1
            with tempfile.NamedTemporaryFile(mode='wb', dir=path.parent, delete=False) as stream:
                temporary = Path(stream.name)
                stream.write(plan['after'])
            temporary.chmod(path.stat().st_mode)
            os.replace(temporary, path)
            changed_files += 1
            changed_records += len(plan.get('changes', [plan.get('change')]))
            print('  已更新：' + styled(path.resolve()) + '（備份：' + styled(backup) + '）')
        except (OSError, UnicodeError, ValueError) as error:
            errors.append(str(path) + ': ' + str(error))
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
    return changed_files, changed_records, errors


def location(item):
    path = Path(item.get('raw_abs') or item.get('file') or item.get('path')).resolve()
    return dict(file=str(item.get('file', path)).replace('\\', '/'), raw_abs=str(path),
                abs_path=urllib.parse.quote(path.as_posix(), safe='/:'),
                line=item.get('line', 1), column=item.get('column', 1))


class TrackerApp:
    """各工具繼承此類，提供 collect/report/query 以及額外參數與修改動作。"""
    slug = 'template'
    title = '通用 Tracker'
    description = '追蹤專案設定與相關位置。'
    kinds = ('projects', 'articles')
    backup_tag = 'tracker'
    filters = ()
    mutation_label = '批次修改'
    manage_label = '管理指定目標'

    def __init__(self, namespace):
        self.ns = namespace
        self.no_html = False

    def add_arguments(self, parser):
        pass

    def validate(self, args, parser):
        pass

    def mutate_cli(self, args):
        """未請求修改時回傳 None；否則回傳 exit code。"""
        return None

    def collect(self):
        raise NotImplementedError

    def report(self):
        """回傳 groups，每組包含 name 與 records；另可回傳 unset。"""
        raise NotImplementedError

    def query(self, args):
        groups = self.report()['groups']
        total = 0
        for group in groups:
            name_match = (group['name'].casefold() == (args.query or '').casefold() if args.exact
                          else (args.query or '').casefold() in group['name'].casefold())
            records = [r for r in group['records'] if self.record_matches(r, args)
                       and (name_match or (not args.exact and (args.query or '').casefold()
                                          in json.dumps(r, ensure_ascii=False).casefold()))]
            if not records:
                continue
            total += len(records)
            print(styled(group['name'], 'yellow') + f' · {len(records)} 筆')
            if not args.list:
                for item in records:
                    print('  ' + styled(f"{item['file']}:{item['line']}:{item['column']}"))
                    print('    ' + styled(item.get('raw', '')))
                    for label, value in item.get('meta', {}).items():
                        print('    ' + label + '：' + styled(value))
        print(f'共 {total} 筆符合紀錄。')

    def record_matches(self, record, args):
        return target_matches(record, args.file, args.kind) and all(
            getattr(args, f['key'], 'all') in ('all', str(record.get(f['key'], '')))
            for f in self.filters if f['key'] != 'kind')

    def unset(self, args):
        for item in self.report().get('unset', []):
            if target_matches(item, args.file or args.query or '', args.kind):
                print(styled(f"{item['file']}:{item['line']}:{item['column']}")
                      + '  ' + styled(item.get('title', '')))

    def direct_query(self, args):
        return (args.query is not None or bool(args.file) or args.kind != 'all'
                or args.list or args.unset or any(getattr(args, f['key'], 'all') != 'all'
                                                for f in self.filters if f['key'] != 'kind'))

    def scan(self, generate_html=True):
        print(styled('\n' + self.title + ' · 掃描 ' + str(Path(self.ns['PROJECTS_DIR']).resolve()), 'bold'))
        self.collect()
        report = self.report()
        count = sum(len(g['records']) for g in report['groups'])
        print(f"完成：{self.ns['scan_info'].get('files', 0)} 個檔案 / {len(report['groups'])} 種項目 / {count} 筆關聯")
        for error in self.ns['scan_info'].get('errors', []):
            print(styled('略過／提示：' + error, 'yellow'))
        if generate_html:
            self.write_dashboard()
            print('HTML：' + styled(Path(self.ns['OUTPUT_FILE']).resolve()))

    def write_dashboard(self):
        payload = dict(self.report(), scan=self.ns['scan_info'], title=self.title,
                       slug=self.slug, description=self.description,
                       filters=[dict(key='kind', label='設定層級／來源', options=[['all', '全部來源']]
                                     + [[k, k] for k in self.kinds]), *self.filters])
        encoded = json.dumps(payload, ensure_ascii=False, allow_nan=False)
        encoded = encoded.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
        path = Path(self.ns['OUTPUT_FILE'])
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(HTML_TEMPLATE.replace('@@PAYLOAD@@', encoded), encoding='utf-8')

    def open_dashboard(self):
        path = Path(self.ns['OUTPUT_FILE']).resolve()
        if not path.is_file():
            self.scan()
        print('HTML：' + styled(path))
        try:
            opened = webbrowser.open(path.as_uri())
        except (OSError, webbrowser.Error) as error:
            print(styled('無法自動開啟：' + str(error), 'yellow'))
            return False
        if not opened:
            print(styled('無法自動開啟，請以瀏覽器開啟上述檔案。', 'yellow'))
        return bool(opened)

    def apply(self, plans, yes=False, generate_html=True):
        if not plans:
            print('沒有需要修改的檔案。')
            return 0
        for plan in plans:
            change = plan.get('change') or (plan.get('changes') or [{}])[0]
            print('  ' + styled(plan['path']) + ':' + str(change.get('line', 1)))
            print('    ' + styled(change.get('before', ''), 'yellow') + ' → '
                  + styled(change.get('after', ''), 'green'))
        if not yes and input(f'共 {len(plans)} 個檔案，套用以上修改？[y/N] > ').strip().lower() not in ('y', 'yes'):
            print('已取消，檔案未修改。')
            return 0
        count, _, errors = apply_changes(plans, self.backup_tag)
        if count:
            self.ns['scanned'] = False
        print(f'完成：修改 {count} 個檔案。')
        for error in errors:
            print(styled('更新失敗：' + error, 'red'))
        self.scan(generate_html)
        return 1 if errors else 0

    def interactive_query(self):
        if not self.ns.get('scanned'):
            self.scan(False)
        args = self.parser().parse_args([])
        commands = {':' + value:(spec['key'], value) for spec in self.filters
                    for value, _ in spec['options'] if value != 'all' and hasattr(args, spec['key'])}
        if ':compatible' in commands:
            commands[':compat'] = commands[':compatible']
        while True:
            print('搜尋：空白列出全部、q 返回、:unset 未設定、:all 清除篩選。'
                  + (' 篩選：' + ' / '.join(commands) if commands else ''))
            query = input('搜尋 > ').strip()
            command = query.lower()
            if command == 'q':
                return
            if command == ':unset':
                scope = input('篩選未設定項目（空白全部） > ').strip()
                self.unset(self.parser().parse_args(['--file', scope]))
                continue
            if command == ':all':
                for spec in self.filters:
                    if hasattr(args, spec['key']):
                        setattr(args, spec['key'], 'all')
                args.query = ''
            elif command in commands:
                key, value = commands[command]
                setattr(args, key, value)
                args.query = ''
            else:
                args.query = query
            self.query(args)

    def interactive_mutate(self):
        print('此工具未提供批次修改。')

    def interactive_manage(self):
        print('此工具未提供指定目標管理。')

    def parser(self):
        parser = argparse.ArgumentParser(description='AZUSTOCK · ' + self.title)
        parser.add_argument('--projects', default=self.ns['PROJECTS_DIR'], help='專案目錄（預設 projects）')
        parser.add_argument('--output', default=self.ns['OUTPUT_FILE'], help='HTML 輸出位置')
        parser.add_argument('--scan', action='store_true', help='掃描並結束')
        parser.add_argument('--open', action='store_true', help='開啟 HTML；不存在時先生成')
        parser.add_argument('--query', help='搜尋項目、標題、路徑或內文')
        parser.add_argument('--file', default='', help='指定路徑、ID 或標題篩選；修改全部請使用 "*"')
        parser.add_argument('--kind', choices=['all', *self.kinds], default='all')
        parser.add_argument('--exact', action='store_true', help='只查詢完整項目名稱')
        parser.add_argument('--list', action='store_true', help='只列摘要')
        parser.add_argument('--unset', action='store_true', help='列出未設定的目標（支援此概念的工具）')
        parser.add_argument('--no-html', action='store_true', help='不生成 HTML')
        parser.add_argument('--plain', action='store_true', help='關閉終端機色彩')
        parser.add_argument('--yes', '-y', action='store_true', help='修改時略過確認')
        self.add_arguments(parser)
        return parser

    def run(self, argv=None):
        parser = self.parser()
        args = parser.parse_args(argv)
        if args.exact and args.query is None:
            parser.error('--exact 需搭配 --query')
        if args.open and args.no_html:
            parser.error('--open 不能搭配 --no-html')
        self.validate(args, parser)
        self.ns.update(PROJECTS_DIR=args.projects, OUTPUT_FILE=args.output,
                       USE_COLOR=configure_color(args.plain), scanned=False)
        self.no_html = args.no_html
        try:
            changed = self.mutate_cli(args)
            if changed is not None:
                opened = self.open_dashboard() if args.open else True
                return changed or (0 if opened else 1)
            direct = self.direct_query(args)
            if args.scan or direct:
                self.scan(not args.no_html)
                if direct:
                    self.unset(args) if args.unset else self.query(args)
                return (0 if self.open_dashboard() else 1) if args.open else 0
            if args.open:
                return 0 if self.open_dashboard() else 1
            return self.menu()
        except (OSError, UnicodeError, ValueError) as error:
            print(styled('操作失敗：' + str(error), 'red'), file=sys.stderr)
            return 1
        except (EOFError, KeyboardInterrupt):
            print('\n已離開' + self.title + '。')
            return 0

    def menu(self):
        while True:
            print(styled('\n─────────────────────────────────────\n  AZUSTOCK · ' + self.title
                         + '\n─────────────────────────────────────', 'bold'))
            for number, label in enumerate(['離開', '掃描並生成 HTML（預設）', '列出摘要',
                                            self.mutation_label, '查詢項目與相關位置',
                                            '開啟 HTML 儀表板', self.manage_label]):
                print(f'  [{number}] {label}')
            choice = input('\n操作 [0/1/2/3/4/5/6] > ').strip().lower()
            try:
                match choice:
                    case '0' | 'q':
                        return 0
                    case '' | '1':
                        self.scan(not self.no_html)
                    case '2':
                        if not self.ns.get('scanned'):
                            self.scan(False)
                        self.query(self.parser().parse_args(['--list']))
                    case '3':
                        self.interactive_mutate()
                    case '4':
                        self.interactive_query()
                    case '5':
                        self.open_dashboard()
                    case '6':
                        self.interactive_manage()
                    case _:
                        print('請輸入 0～6，或 q 離開。')
            except (OSError, UnicodeError, ValueError) as error:
                print(styled('操作失敗：' + str(error), 'red'))


class JsonFieldTracker(TrackerApp):
    """頂層 JSON 欄位 tracker 模板：覆寫 entries() 即可增加領域資訊。"""
    field_name = 'example'

    def select_field_name(self, data):
        return self.field_name

    def validate_target(self, item):
        pass

    def entries(self, value):
        values = value if isinstance(value, list) else [value]
        return [dict(name=str(v) if isinstance(v, str) else json.dumps(v, ensure_ascii=False),
                     raw=json.dumps(v, ensure_ascii=False)) for v in values]

    def entry_offset(self, entry, field, text):
        return field['val_start'] + entry.pop('offset', 0)

    def collect(self):
        errors, groups, targets, unset = [], {}, [], []
        files = 0
        self.ns['scanned'] = False
        for item in detail_targets(self.ns['PROJECTS_DIR'], errors):
            files += 1
            _, fields = json_field_spans(item['text'])
            selected_name = self.select_field_name(item['data'])
            selected = [f for f in fields if f['name'] == selected_name]
            if len(selected) > 1:
                errors.append(str(item['path']) + ': ' + self.field_name + ' 欄位重複；掃描採 JSON 最後值，修改時會拒絕。')
            field = selected[-1] if selected else None
            base = dict(**location(dict(path=item['path'])), kind=item['kind'],
                        target_id=item['target_id'], title=item['title'])
            targets.append(base)
            if field is None:
                unset.append(dict(base, raw='(未設定 ' + self.field_name + ')'))
                continue
            for entry in self.entries(field['value']):
                name = entry.pop('name')
                offset = self.entry_offset(entry, field, item['text'])
                line = item['text'].count('\n', 0, offset) + 1
                column = offset - item['text'].rfind('\n', 0, offset)
                row = dict(base, **entry, line=line, column=column,
                           context=item['text'].splitlines()[line - 1])
                groups.setdefault(name, []).append(row)
                for issue in row.get('issues', []):
                    errors.append(f"{item['path']}:{line}: {issue}")
        self.ns.update(results=groups, all_targets=targets, unset_targets=unset,
                       scan_info=dict(time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                      files=files, root=str(Path(self.ns['PROJECTS_DIR']).resolve()), errors=errors),
                       scanned=True)

    def report(self):
        return dict(groups=[dict(name=k, records=v) for k, v in sorted(self.ns.get('results', {}).items(), key=lambda p:p[0].casefold())],
                    unset=self.ns.get('unset_targets', []))

    def add_arguments(self, parser):
        parser.add_argument('--set', metavar='VALUE', help='設定欄位；可輸入 JSON 或一般字串')
        parser.add_argument('--remove', action='store_true', help='移除整個欄位')
        parser.add_argument('--replace', nargs=2, metavar=('OLD', 'NEW'), help='批次替換項目')
        for spec in self.filters:
            parser.add_argument('--' + spec['key'].replace('_', '-'), choices=[v for v, _ in spec['options']], default='all')

    def parse_value(self, text):
        def reject(value):
            raise ValueError('不接受非標準 JSON 常數：' + value)
        try:
            return json.loads(text, parse_constant=reject)
        except json.JSONDecodeError:
            if not text.strip() or text.lstrip()[0] in '{["':
                raise ValueError('VALUE 的 JSON 語法無效')
            return text

    def validate(self, args, parser):
        if sum(x is not None and x is not False for x in (args.set, args.remove, args.replace)) > 1:
            parser.error('--set、--remove 與 --replace 每次只能擇一')
        if (args.set is not None or args.remove) and not args.file:
            parser.error('修改請搭配 --file；套用全部請使用 --file "*"')

    def validate_value(self, value):
        pass

    def replace_value(self, value, old, new):
        if isinstance(value, list):
            return [new if v == old else v for v in value]
        return new if value == old else value

    def plan_changes(self, mode, value=REMOVE, old=None, new=None, file_filter='', kind='all'):
        if mode == 'set':
            self.validate_value(value)
        plans = []
        for item in detail_targets(self.ns['PROJECTS_DIR']):
            if item['path'].is_symlink() or not target_matches(item, file_filter, kind):
                continue
            self.validate_target(item)
            field_name = self.select_field_name(item['data'])
            replacement = value
            if mode == 'replace':
                if field_name not in item['data']:
                    continue
                replacement = self.replace_value(item['data'][field_name], old, new)
            modified, change = mutate_json_field(item['text'], field_name, replacement)
            if change:
                plans.append(make_plan(item, modified, change))
        return plans

    def mutate_cli(self, args):
        if args.set is None and not args.remove and args.replace is None:
            return None
        scope = '' if args.file == '*' else args.file
        if args.replace:
            plans = self.plan_changes('replace', old=args.replace[0], new=args.replace[1], file_filter=scope, kind=args.kind)
        else:
            value = REMOVE if args.remove else self.parse_value(args.set)
            plans = self.plan_changes('remove' if args.remove else 'set', value, file_filter=scope, kind=args.kind)
        return self.apply(plans, args.yes, not args.no_html)

    def interactive_mutate(self):
        old = input('舊項目（空白返回） > ').strip()
        if not old:
            return
        new = input('新項目 > ').strip()
        scope = input('檔案／ID／標題範圍（全部請輸入 *） > ').strip()
        if not scope:
            return
        plans = self.plan_changes('replace', old=old, new=new, file_filter='' if scope == '*' else scope)
        self.apply(plans, generate_html=not self.no_html)

    def interactive_manage(self):
        action = input('[1] 設定／修改整個欄位 [2] 移除整個欄位（空白返回） > ').strip()
        if action not in ('1', '2'):
            return
        scope = input('檔案／ID／標題範圍（全部請輸入 *） > ').strip()
        if not scope:
            return
        value = self.parse_value(input('新值（JSON 或一般字串） > ').strip()) if action == '1' else REMOVE
        plans = self.plan_changes('set' if action == '1' else 'remove', value, file_filter='' if scope == '*' else scope)
        self.apply(plans, generate_html=not self.no_html)


HTML_TEMPLATE = r'''<!DOCTYPE html>
<html lang="zh-Hant" data-theme="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AZUSTOCK Tracker</title>
<style>
:root{color-scheme:dark;--bg:#111716;--panel:#19211f;--card:#1f2926;--text:#e9eee9;--muted:#a4b4aa;--line:#35473c;--accent:#b5d99a;--soft:#2c3e2e;--gold:#edc887}
[data-theme=light]{color-scheme:light;--bg:#f4f5ef;--panel:#fafbf6;--card:#fff;--text:#26332c;--muted:#617368;--line:#d6e0d2;--accent:#436c37;--soft:#e8f0df;--gold:#885f20}
*{box-sizing:border-box}body{margin:0;color:var(--text);background:var(--bg);font:14px/1.65 system-ui,sans-serif}button,input,select{font:inherit;color:inherit}button,a{cursor:pointer}a{color:var(--accent);text-decoration:none}button,input,select,.button{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:8px 12px}button:hover,.button:hover{border-color:var(--accent)}:focus-visible{outline:2px solid var(--accent);outline-offset:2px}.shell{display:grid;grid-template-columns:300px minmax(0,1fr);height:100dvh}.sidebar{background:var(--panel);border-right:1px solid var(--line);display:flex;flex-direction:column;min-height:0}.brand{padding:28px 22px 18px}.eyebrow{font-size:10px;letter-spacing:2px;color:var(--accent);font-weight:700}h1{font-size:22px;margin:8px 0}h2{font-size:24px;margin:0}h3{font-size:23px;overflow-wrap:anywhere;margin:0 0 12px}.muted,.brand p{color:var(--muted);font-size:12px}.search-area{padding:0 18px 16px;display:grid;gap:9px}.search-area label{font-size:12px;color:var(--muted)}input,select{width:100%;min-width:0}.index{padding:0 12px 20px;overflow:auto;flex:1}.index button{display:block;width:100%;text-align:left;margin:4px 0;padding:12px;overflow-wrap:anywhere;background:transparent;border-color:transparent}.index button.active{background:var(--soft);border-color:var(--line)}.index small{display:block;color:var(--muted)}.footer{padding:16px 22px;border-top:1px solid var(--line);color:var(--muted);font-size:11px;white-space:pre-line;overflow-wrap:anywhere}.main{overflow:auto;padding:30px 38px;min-width:0}.topbar{display:flex;gap:15px;justify-content:space-between;align-items:center;margin-bottom:22px}.topbar button{white-space:nowrap}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:24px}.stat{padding:16px;background:var(--panel);border:1px solid var(--line);border-radius:12px}.stat span{font-size:12px;color:var(--muted)}.stat strong{display:block;font-size:28px;font-weight:550}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr));gap:12px}.card{padding:18px;background:var(--card);border:1px solid var(--line);border-radius:12px;min-width:0}.path{color:var(--accent);font:12px/1.7 ui-monospace,monospace;overflow-wrap:anywhere}.raw{color:var(--gold);white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.8 ui-monospace,monospace}pre{background:var(--bg);padding:12px;border-radius:7px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}dl{font-size:12px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px}dt{color:var(--muted)}dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.button,.actions button{font-size:11px;display:inline-block}.badge{font-size:11px;border:1px solid var(--line);border-radius:25px;padding:2px 9px;display:inline-block;margin:7px 6px 7px 0}.toolbar{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:18px}.toolbar input{flex:1;min-width:160px}.empty{padding:40px 10px;text-align:center;color:var(--muted)}.errors{color:var(--gold);margin:15px 0}.errors pre{max-height:220px;overflow:auto}#toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--text);color:var(--bg);padding:10px 18px;border-radius:9px;max-width:90vw}button:disabled{opacity:.4;cursor:default}
@media(max-width:900px){.shell{grid-template-columns:245px minmax(0,1fr)}.main{padding:24px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.shell{display:block;height:auto}.sidebar{border-right:0;border-bottom:1px solid var(--line)}.index{max-height:210px}.footer{display:none}.brand{padding:18px}.main{padding:22px 18px}.topbar{align-items:flex-start}.cards{grid-template-columns:minmax(0,1fr)}}
</style></head><body><div class="shell"><aside class="sidebar"><header class="brand"><div class="eyebrow">AZUSTOCK / TRACKER</div><h1 id="brand"></h1><p id="description"></p></header><div class="search-area"><label for="search">搜尋項目與相關位置</label><input id="search" type="search" placeholder="名稱、標題、檔案或語法…"><div id="filters"></div><label><input type="checkbox" id="unset" style="width:auto"> 僅顯示未設定目標</label></div><nav class="index" id="index" aria-label="項目索引"></nav><footer class="footer" id="scanMeta"></footer></aside><main class="main"><header class="topbar"><div><h2>追蹤總覽</h2><p class="muted" id="subtitle"></p></div><button id="theme">切換主題</button></header><div class="stats" id="stats"></div><details class="errors" id="errors" hidden><summary></summary><pre></pre></details><div id="detail"></div><p class="muted">本頁為掃描快照；修改內容後請重新掃描。編輯器連結需在本機安裝 VS Code／Cursor。</p></main></div><div id="toast" role="status" hidden></div><script type="application/json" id="payload">@@PAYLOAD@@</script><script>
'use strict';
const DATA=JSON.parse(document.getElementById('payload').textContent),$=id=>document.getElementById(id),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active=null,page=0,localQuery='',lastNames='';const PAGE_SIZE=60;
try{document.documentElement.dataset.theme=localStorage.getItem('azustock-tracker-theme')||'dark'}catch{}
$('theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('azustock-tracker-theme',t)}catch{}};
document.title='AZUSTOCK · '+DATA.title;$('brand').textContent=DATA.title;$('description').textContent=DATA.description;
$('subtitle').textContent=DATA.scan.sys_version?'目前系統：'+DATA.scan.sys_version:DATA.scan.expire_days!==undefined?'標籤時效：'+DATA.scan.expire_days+' 天':'檢視紀錄、來源與原始設定';
$('scanMeta').textContent=DATA.scan.time+'\n'+DATA.scan.root;
$('filters').innerHTML=DATA.filters.map(f=>`<label>${esc(f.label)}<select data-filter="${esc(f.key)}">${f.options.map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select></label>`).join('');
if(DATA.scan.errors?.length){$('errors').hidden=false;$('errors').querySelector('summary').textContent=DATA.scan.errors.length+' 筆提示／讀取錯誤';$('errors').querySelector('pre').textContent=DATA.scan.errors.join('\n')}
const allRecords=DATA.groups.flatMap(g=>g.records);
$('stats').innerHTML=[['項目種類',DATA.groups.length],['關聯紀錄',allRecords.length],['未設定目標',(DATA.unset||[]).length],['讀取提示',(DATA.scan.errors||[]).length]].map(([a,b])=>`<div class="stat"><span>${a}</span><strong>${b}</strong></div>`).join('');
function matches(r){return [...document.querySelectorAll('[data-filter]')].every(s=>s.value==='all'||(s.dataset.filter==='category'&&r.categories?r.categories.includes(s.value):String(r[s.dataset.filter]??'')===s.value))}
function groups(){const q=$('search').value.toLocaleLowerCase();const source=$('unset').checked?[{name:'未設定',records:DATA.unset||[]}]:DATA.groups;return source.map(g=>({name:g.name,records:g.records.filter(r=>matches(r)&&(g.name.toLocaleLowerCase().includes(q)||JSON.stringify(r).toLocaleLowerCase().includes(q)))})).filter(g=>g.records.length)}
function card(r){const line=Number(r.line)||1,col=Number(r.column)||1,path=(r.raw_abs||r.file)+':'+line+':'+col;const uri=r.abs_path||'';return `<article class="card"><div class="path">${esc(r.file)} · L${line}:${col}</div>${r.title?`<strong>${esc(r.title)}</strong>`:''}<div><span class="badge">${esc(r.kind)}</span>${(r.badges||[]).map(b=>`<span class="badge">${esc(b)}</span>`).join('')}</div><div class="raw">${esc(r.raw)}</div><dl>${Object.entries(r.meta||{}).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>${r.context?`<pre>${esc(r.context)}</pre>`:''}<div class="actions"><a class="button" href="${esc('vscode://file/'+uri+':'+line+':'+col)}">VS Code ↗</a><a class="button" href="${esc('cursor://file/'+uri+':'+line+':'+col)}">Cursor ↗</a><button data-copy="${esc(path)}">複製位置</button>${r.md_raw_abs?`<a class="button" href="${esc('vscode://file/'+r.md_abs_path+':'+r.md_line+':'+r.md_column)}">Markdown ↗</a>`:''}</div></article>`}
function render(){const list=groups();if(!list.some(g=>g.name===active)){active=list[0]?.name??null;page=0;localQuery=''}const names=JSON.stringify(list.map(g=>[g.name,g.records.length]));if(names!==lastNames){page=0;lastNames=names}$('index').innerHTML=list.map(g=>`<button data-name="${esc(g.name)}" class="${g.name===active?'active':''}">${esc(g.name)}<small>${g.records.length} 筆位置</small></button>`).join('');const group=list.find(g=>g.name===active);if(!group){$('detail').innerHTML='<div class="empty">沒有符合條件的紀錄。</div>';return}const rs=group.records.filter(r=>JSON.stringify(r).toLocaleLowerCase().includes(localQuery.toLocaleLowerCase()));const pages=Math.max(1,Math.ceil(rs.length/PAGE_SIZE));page=Math.min(page,pages-1);$('detail').innerHTML=`<h3>${esc(group.name)}</h3><div class="toolbar"><input id="localSearch" type="search" aria-label="篩選目前項目位置" placeholder="篩選目前項目位置…" value="${esc(localQuery)}"><span>${rs.length} 筆 · ${page+1}/${pages}</span><button id="prev" ${page===0?'disabled':''}>上一頁</button><button id="next" ${page>=pages-1?'disabled':''}>下一頁</button></div><div class="cards">${rs.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE).map(card).join('')}</div>`;$('prev').onclick=()=>{page--;render()};$('next').onclick=()=>{page++;render()};$('localSearch').oninput=e=>{const p=e.target.selectionStart;localQuery=e.target.value;page=0;render();$('localSearch').focus();$('localSearch').setSelectionRange(p,p)}}
$('index').onclick=e=>{const b=e.target.closest('[data-name]');if(b){active=b.dataset.name;page=0;localQuery='';render()}};
$('search').oninput=render;$('unset').onchange=()=>{page=0;localQuery='';render()};document.querySelectorAll('[data-filter]').forEach(s=>s.onchange=render);
let toastTimer;function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,2500)}
$('detail').onclick=async e=>{const b=e.target.closest('[data-copy]');if(!b)return;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(b.dataset.copy)}else{const t=document.createElement('textarea');t.value=b.dataset.copy;document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();if(!ok)throw Error('copy')}toast('已複製位置')}catch{toast('無法自動複製，請直接複製卡片中的檔案位置。')}};
render();
</script></body></html>'''

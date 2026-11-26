"""Shared release metadata and staged-site validation (Python 3.10+, stdlib)."""
import hashlib
import json
import os
import re
from html import unescape
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import parse_qs, quote, unquote, urljoin, urlsplit

SITE_URL = "https://azustock.com/"
HASH_HEX_LENGTH = 16
CORE_FILES = (
    "index.html", "main.min.js", "style.min.css", "all_projects.json",
    "version.json", "data_version.json", "changelogs.json", "assets/site.webmanifest",
)
OPTIONAL_FILES = ("kotoba.md", "quotes.md", "credits.md", "COPYRIGHT.md", "mermaid_styles.txt")
DATA_VERSION_FILES = {
    "projects": "all_projects.json",
    **{name: name for name in (*OPTIONAL_FILES, "changelogs.json", "main.min.js", "style.min.css")},
}
# VERSION is the first CONFIG property in the source and compressed JS.
CONFIG_VERSION_RE = re.compile(
    r'\bconst\s+CONFIG\s*=\s*\{(?:\s|//[^\n]*(?:\n|$)|/\*[\s\S]*?\*/)*'
    r'VERSION\s*:\s*(?P<value>"(?:\\.|[^"\\\r\n])*")'
)


def read_json(path, expected_type):
    def reject_constant(value):
        raise ValueError(f"Non-JSON numeric constant: {value}")
    try:
        value = json.loads(path.read_text(encoding="utf-8"), parse_constant=reject_constant)
    except (OSError, ValueError) as exc:
        raise ValueError(f"Cannot read JSON {path}: {exc}") from exc
    if not isinstance(value, expected_type):
        raise ValueError(f"Invalid JSON structure in {path}: expected {expected_type.__name__}")
    return value


def validate_version(value, context):
    # The system version is compared as a string in the browser; numeric JSON
    # values would cause a reboot even when the printed version looks identical.
    if not isinstance(value, str) or not value.strip() or value != value.strip() or any(c.isspace() or ord(c) < 32 or c in '<>"\'&\\' for c in value):
        raise ValueError(f"Invalid system version in {context}: {value!r}")
    return value


def parse_version(v_str):
    """Preserve the site's existing numeric sorting (including internal versions)."""
    return [int(x) for x in re.findall(r'\d+', str(v_str))]


def collect_log_entries(base_dir='logs'):
    entries = []
    def onerror(error):
        raise error
    for folder, dirs, files in os.walk(base_dir, onerror=onerror):
        dirs.sort()  # stable ordering for equal numeric versions
        if 'detail.json' in files:
            path = Path(folder) / 'detail.json'
            detail = read_json(path, dict)
            version = validate_version(detail.get('version', os.path.basename(folder)), path)
            entries.append((folder, version, detail))
    entries.sort(key=lambda entry: parse_version(entry[1]), reverse=True)
    latest = next((version for _, version, detail in entries if not detail.get('no_track')), None)
    return entries, latest


def is_public_log(folder, version, detail):
    return str(version).count('.') < 3 and os.path.basename(folder).count('.') < 3 and not detail.get('hidden', False)


def public_log_record(folder, version, detail):
    """Same publication rule for the generator and the validator; no_track only affects tracking."""
    if not is_public_log(folder, version, detail):
        return None
    content = ""
    for name in sorted(os.listdir(folder)):
        if name.endswith('.md'):
            content = (Path(folder) / name).read_text(encoding='utf-8')
            break
    if not content:
        return None
    return {
        "id": os.path.basename(folder), "version": version,
        "date": detail.get('date', '2026-01-01'), "status": detail.get('status', 'UPDATE'),
        "description": detail.get('description', '系統更新與優化記錄。'), "content": content,
    }


def config_version(text):
    match = CONFIG_VERSION_RE.search(text)
    if not match:
        raise ValueError("Missing CONFIG.VERSION in JavaScript")
    return validate_version(json.loads(match['value']), 'CONFIG.VERSION')


def replace_config_version(text, version):
    validate_version(version, 'latest tracked version')
    match = CONFIG_VERSION_RE.search(text)
    if not match:
        raise ValueError("Missing CONFIG.VERSION in JavaScript")
    start, end = match.span('value')
    return text[:start] + json.dumps(version, ensure_ascii=False) + text[end:]


class Validator:
    def __init__(self, stage, source_root, *, file_hashes=None):
        self.stage = Path(stage)
        self.source_root = Path(source_root)
        self.warnings = []
        self.hashes = file_hashes if file_hashes is not None else {}
        self.checked_articles = set()
        self._changelogs = None

    def warn(self, message):
        if message not in self.warnings:
            self.warnings.append(message)

    def hash16(self, relative):
        if relative not in self.hashes:
            digest = hashlib.sha256()
            with (self.stage / relative).open('rb') as stream:
                for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                    digest.update(chunk)
            self.hashes[relative] = digest.hexdigest()
        return self.hashes[relative][:HASH_HEX_LENGTH]

    def resolve_url(self, value, context, *, base=SITE_URL, local_only=False):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"Invalid resource URL in {context}: {value!r}")
        value = unescape(value.strip())
        if '\\' in value or '\x00' in value:
            raise ValueError(f"Invalid resource path in {context}: {value}")
        url = urlsplit(urljoin(base, value))
        origin = urlsplit(SITE_URL)
        if url.scheme != 'https' or url.netloc.lower() != origin.netloc.lower():
            # HTTP to our own site is a broken/mixed-content reference.
            if local_only or (url.scheme in ('http', 'https') and url.hostname == origin.hostname):
                raise ValueError(f"Invalid icon/manifest or same-origin URL in {context}: {value}")
            return None
        path = unquote(url.path)
        if '\\' in path or '\x00' in path or '..' in PurePosixPath(path).parts or re.match(r'^/+[A-Za-z]:', path):
            raise ValueError(f"Invalid resource path in {context}: {value}")
        return url, path.lstrip('/')

    def _check_resolved(self, url, relative, value, context, *, allow_index=False, check_hash=False):
        if allow_index and (not relative or (self.stage / relative).is_dir()):
            relative = str(PurePosixPath(relative) / 'index.html')
        target = self.stage / relative
        if not target.is_file() or not target.stat().st_size:
            raise ValueError(f"Missing or empty resource {relative!r} referenced by {context}: {value}")
        if check_hash:
            stamp = parse_qs(url.query).get('v', [''])[0]
            if re.fullmatch(r'[0-9a-f]{16}', stamp) and stamp != self.hash16(relative):
                raise ValueError(f"Resource hash mismatch in {context}: {relative}")
        return relative

    def resource(self, value, context, *, base=SITE_URL, local_only=False, allow_index=False, check_hash=False):
        resolved = self.resolve_url(value, context, base=base, local_only=local_only)
        if resolved is None:
            return None  # external / data / blob URLs are not fetched by the validator
        url, relative = resolved
        return self._check_resolved(url, relative, value, context, allow_index=allow_index, check_hash=check_hash)

    def verify_data_versions(self):
        data = read_json(self.stage / 'data_version.json', dict)
        for key, relative in DATA_VERSION_FILES.items():
            expected = data.get(key)
            optional = relative in OPTIONAL_FILES
            if not isinstance(expected, str) or (expected and not re.fullmatch(r'[0-9a-f]{16}', expected)):
                raise ValueError(f"Invalid or missing data_version.json hash for {key}")
            path = self.stage / relative
            if not path.is_file() or not path.stat().st_size:
                if optional:
                    self.warn(f"Optional feature file missing or empty: {relative}")
                    continue
                raise ValueError(f"Missing or empty {relative}")
            if expected != self.hash16(relative):
                raise ValueError(f"data_version.json hash mismatch: {relative}")

    def verify_versions(self, html_version):
        info = read_json(self.stage / 'version.json', dict)
        version = validate_version(info.get('version'), 'version.json')
        js_version = config_version((self.stage / 'main.min.js').read_text(encoding='utf-8'))
        if version != js_version or version != html_version:
            raise ValueError(f"System version mismatch: version.json={version!r}, CONFIG.VERSION={js_version!r}, sys-version={html_version!r}")
        entries, latest = collect_log_entries(self.source_root / 'logs')
        if version != latest:
            raise ValueError(f"System version mismatch: version.json={version!r}, latest tracked log={latest!r}")
        actual = read_json(self.stage / 'changelogs.json', list)
        self._changelogs = actual
        expected = [record for folder, v, detail in entries if (record := public_log_record(folder, v, detail)) is not None]
        if actual != expected:
            raise ValueError("changelogs.json differs from source logs (including tracking and visibility rules)")
        if not any(row['version'] == version for row in expected):
            self.warn(f"Tracked version {version} has no public changelog entry (internal/hidden or no Markdown content)")
        return version

    def verify_manifest(self, relative):
        manifest = read_json(self.stage / relative, dict)
        base = urljoin(SITE_URL, relative)
        icons = manifest.get('icons')
        if not isinstance(icons, list) or not icons:
            raise ValueError(f"Missing manifest icons: {relative}")
        for index, icon in enumerate(icons):
            if not isinstance(icon, dict):
                raise ValueError(f"Invalid manifest icon: {index}")
            self.resource(icon.get('src'), f'{relative} icons[{index}]', base=base, local_only=True)
        start = manifest.get('start_url')
        scope = manifest.get('scope')
        start_url, start_rel = self.resolve_url(start, f'{relative} start_url', base=base, local_only=True)
        scope_url, _ = self.resolve_url(scope, f'{relative} scope', base=base, local_only=True)
        if not unquote(start_url.path).startswith(unquote(scope_url.path)):
            raise ValueError(f"Manifest start_url outside scope: {start!r}, {scope!r}")
        self._check_resolved(start_url, start_rel, start, f'{relative} start_url', allow_index=True)
        if 'id' in manifest:
            self.resolve_url(manifest['id'], f'{relative} id', base=SITE_URL, local_only=True)

    def verify_homepage(self):
        parser = HomepageCheck(self)
        parser.feed((self.stage / 'index.html').read_text(encoding='utf-8'))
        parser.close()
        if not parser.manifests:
            raise ValueError('Missing manifest link')
        if len(parser.manifests) != 1 or parser.manifests[0] != 'assets/site.webmanifest':
            raise ValueError('Homepage must reference assets/site.webmanifest exactly once')
        if parser.versions != 1 or parser.version_depth:
            raise ValueError('Missing, duplicate or unclosed sys-version element')
        if parser.core_assets != {'main.min.js', 'style.min.css'}:
            raise ValueError('Homepage must reference main.min.js and style.min.css')
        self.verify_manifest(parser.manifests[0])
        return ''.join(parser.version_text).strip()

    def verify_projects(self):
        database = read_json(self.stage / 'all_projects.json', dict)
        def records(values, context):
            if not isinstance(values, list):
                raise ValueError(f'Invalid {context}: expected array')
            seen = set()
            for entry in values:
                if not isinstance(entry, dict) or not isinstance(entry.get('id'), str) or not entry['id'] or entry['id'] in seen:
                    raise ValueError(f'Invalid or duplicate id in {context}: {entry!r}')
                if entry['id'] in ('.', '..') or '/' in entry['id'] or '\\' in entry['id']:
                    raise ValueError(f'Invalid path identifier in {context}: {entry["id"]!r}')
                seen.add(entry['id'])
                yield entry
        categories = list(records(database.get('categories'), 'categories'))
        category_ids = {cat['id'] for cat in categories}
        for cat in categories:
            self.verify_asset_fields(cat, f"category {cat['id']}")
        for project in records(database.get('projects'), 'projects'):
            context = f"project {project['id']}"
            if project.get('category') not in category_ids:
                raise ValueError(f'Unknown category in {context}: {project.get("category")!r}')
            self.verify_asset_fields(project, context)
            project_api = 'api/' + quote(project['id'], safe='')
            self.verify_share_page(project_api + '/index.html', context)
            groups = project.get('groups', {})
            if not isinstance(groups, dict):
                raise ValueError(f'Invalid groups in {context}')
            for group, info in groups.items():
                if not isinstance(info, dict):
                    raise ValueError(f'Invalid group in {context}: {group}')
                self.verify_asset_fields(info, f'{context}, group {group}')
            for article in records(project.get('articles', []), f'{context} articles'):
                where = f"{context}, article {article['id']}"
                self.verify_asset_fields(article, where)
                path = self.resource(article.get('content_path'), where, local_only=True, check_hash=True)
                article_api = project_api + '/' + quote(article['id'], safe='')
                if path != unquote(article_api + '/contents.json'):
                    raise ValueError(f'Invalid article content_path in {where}: {path}')
                self.verify_share_page(article_api + '/index.html', where)
                if path not in self.checked_articles:
                    content = read_json(self.stage / path, dict).get('content')
                    if not isinstance(content, str):
                        raise ValueError(f'Invalid content field in {path} ({where})')
                    self.verify_markdown_media(content, f'{path} ({where})')
                    self.checked_articles.add(path)
        # The public changelog contains Markdown too, rendered on the homepage.
        changelogs = self._changelogs if self._changelogs is not None else read_json(self.stage / 'changelogs.json', list)
        for record in changelogs:
            self.verify_markdown_media(record['content'], f"changelog {record['version']}")

    def verify_share_page(self, url, context):
        path = self.resource(url, f'{context} share page', local_only=True)
        parser = SharePageCheck(self, path)
        parser.feed((self.stage / path).read_text(encoding='utf-8'))
        parser.close()
        if not parser.og_image or not parser.og_url:
            raise ValueError(f'Missing Open Graph image or URL in {path} ({context})')

    def verify_asset_fields(self, obj, context):
        # `cover` in groups is source-relative metadata, not a frontend URL.
        for field in ('cover_image', 'watermark_url', 'og_image', 'thumbnail'):
            if obj.get(field) not in (None, ''):
                self.resource(obj[field], f'{context}.{field}', check_hash=True)

    def verify_markdown_media(self, markdown, context):
        # Best-effort for the generator's inline ![]() and raw HTML media.
        # Do not treat code examples, external URLs or normal hyperlinks as assets.
        markdown = strip_markdown_code(markdown)
        for match in re.finditer(r'(?<!\\)!\[[^\]\n]*\]\(\s*(?:<([^>\n]+)>|((?:[^\s()]|\([^()\n]*\))+))(?:\s+["\'][^\n]*?["\'])?\s*\)', markdown):
            self.media_url(match.group(1) or match.group(2), context)
        parser = MediaCheck(self, context)
        parser.feed(markdown)
        parser.close()

    def media_url(self, value, context):
        # The JS image renderer understands custom #full= / #poster= and
        # width/height/aspect-ratio suffixes. The primary and auxiliary files
        # are independent URLs, each may have its own cache query.
        value = re.sub(r'%23(?=(?:full|poster)=)', '#', unescape(value), flags=re.I)
        value = re.sub(r'&(?:w|h)=\d+|&ar=[0-9.]+', '', value)
        for url in re.split(r'#(?:full|poster)=', value):
            self.resource(url, context, check_hash=True)


def strip_markdown_code(text):
    text = re.sub(r'<!--[\s\S]*?-->', '', text)
    lines = []
    fence = None
    for line in text.splitlines():
        stripped = re.sub(r'^\s*(?:>\s*)*', '', line)
        marker = re.match(r'(`{3,}|~{3,})(.*)$', stripped)
        if fence:
            if marker and marker[1][0] == fence[0] and len(marker[1]) >= len(fence) and not marker[2].strip():
                fence = None
            continue
        if marker and not (marker[1][0] == '`' and '`' in marker[2]):
            fence = marker[1]
            continue
        lines.append(line)
    return re.sub(r'(`+)[^\n]*?\1', '', '\n'.join(lines))


class HomepageCheck(HTMLParser):
    def __init__(self, validator):
        super().__init__()
        self.validator = validator
        self.manifests = []
        self.core_assets = set()
        self.versions = 0
        self.version_depth = 0
        self.version_text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if self.version_depth:
            self.version_depth += 1
        if attrs.get('id') == 'sys-version':
            self.versions += 1
            self.version_depth = 1
        rel = (attrs.get('rel') or '').lower().split()
        if tag == 'link' and any(r == 'manifest' or 'icon' in r for r in rel):
            resource = self.validator.resource(attrs.get('href'), 'homepage icon/manifest', local_only=True)
            if 'manifest' in rel:
                self.manifests.append(resource)
        value = attrs.get('src') if tag == 'script' else attrs.get('href') if tag == 'link' and 'stylesheet' in rel else None
        if value:
            resolved = self.validator.resolve_url(value, 'homepage script/stylesheet')
            expected = 'main.min.js' if tag == 'script' else 'style.min.css'
            if resolved and resolved[1] == expected:
                self.core_assets.add(
                    self.validator._check_resolved(resolved[0], resolved[1], value, 'homepage script/stylesheet', check_hash=True)
                )

    def handle_endtag(self, tag):
        if self.version_depth:
            self.version_depth -= 1

    def handle_data(self, data):
        if self.version_depth:
            self.version_text.append(data)


class SharePageCheck(HTMLParser):
    def __init__(self, validator, path):
        super().__init__()
        self.validator = validator
        self.path = path
        self.og_image = False
        self.og_url = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag != 'meta':
            return
        key = attrs.get('property') or attrs.get('name')
        if key in ('og:image', 'twitter:image'):
            self.validator.resource(attrs.get('content'), f'{self.path} {key}', local_only=True, check_hash=True)
            if key == 'og:image':
                self.og_image = True
        elif key == 'og:url':
            path = self.validator.resource(attrs.get('content'), f'{self.path} og:url', local_only=True)
            if path != self.path:
                raise ValueError(f'Incorrect og:url in {self.path}: {path}')
            self.og_url = True


class MediaCheck(HTMLParser):
    def __init__(self, validator, context):
        super().__init__()
        self.validator = validator
        self.context = context

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        fields = {'img': ('src', 'data-full'), 'video': ('src', 'poster'), 'audio': ('src',), 'source': ('src',), 'track': ('src',), 'iframe': ('src',)}
        for field in fields.get(tag, ()):
            value = attrs.get(field)
            if value:
                if tag == 'iframe':
                    self.validator.resource(value, f'{self.context} <iframe>', allow_index=True)
                else:
                    self.validator.media_url(value, f'{self.context} <{tag} {field}>')


def validate_release(stage, source_root, *, file_hashes=None):
    validator = Validator(stage, source_root, file_hashes=file_hashes)
    html_version = validator.verify_homepage()
    version = validator.verify_versions(html_version)
    validator.verify_data_versions()
    validator.verify_projects()
    return {"version": version, "articles_checked": len(validator.checked_articles), "warnings": validator.warnings}

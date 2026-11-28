"""Canonical site configuration and deterministic build-time injection (stdlib only)."""
import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

from tools.common.paths import ROOT_DIR, CONFIG_DIR
from tools.common.build_cache import atomic_write, file_lock

CONFIG_PATH = CONFIG_DIR / 'site_config.json'
HEX = re.compile(r'#[0-9a-fA-F]{6}\Z')
VAR = re.compile(r'var\((--[\w-]+)\)\Z')
NAME = re.compile(r'[A-Z][A-Z0-9_-]*\Z')
RGBA = re.compile(r'rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:\d+(?:\.\d+)?|\.\d+))?\s*\)\Z')
VERSION = re.compile(r'\bconst\s+CONFIG\s*=\s*\{\s*VERSION\s*:\s*("[^"\n]+")')


# Compatibility identifiers are fixed historical filenames, not current resource paths.
LEGACY_RESOURCE_PATHS = {
    'kotoba': 'kotoba.md', 'quotes': 'quotes.md', 'credits': 'credits.md',
    'copyright': 'COPYRIGHT.md', 'mermaid_styles': 'mermaid_styles.txt',
}
LEGACY_HASH_KEYS = {**LEGACY_RESOURCE_PATHS, 'changelogs': 'changelogs.json'}

# Historical disk paths are independent of the stable/legacy cache IDs.
PREVIOUS_RESOURCE_PATHS = {'mermaid_styles': ('assets/styles/mermaid_styles.txt',)}

def legacy_resource_locations(key):
    return (LEGACY_RESOURCE_PATHS[key], *PREVIOUS_RESOURCE_PATHS.get(key, ()))


def unique_object(pairs):
    result = {}
    for k, v in pairs:
        if k in result:
            raise ValueError(f'Duplicate config key: {k}')
        result[k] = v
    return result


def valid_css_color(value):
    if HEX.fullmatch(value) or value == 'transparent':
        return True
    if not RGBA.fullmatch(value):
        return False
    values = [float(part.strip()) for part in value[value.index('(')+1:-1].split(',')]
    return len(values) == (4 if value.startswith('rgba') else 3) and all(0 <= v <= 255 for v in values[:3]) and (len(values) == 3 or 0 <= values[3] <= 1)


def resolve_value(value, theme, seen=()):
    if not isinstance(value, str):
        raise ValueError('Color must be a string')
    m = VAR.fullmatch(value)
    if not m:
        return value
    key = m[1]
    if key in seen or key not in theme:
        raise ValueError(f'Undefined or circular theme variable: {key}')
    return resolve_value(theme[key], theme, (*seen, key))


def tag_definition(config, tag):
    status = config['status']
    seen = set()
    while tag in status['color_aliases']:
        if tag in seen:
            raise ValueError(f'Circular status alias: {tag}')
        seen.add(tag)
        tag = status['color_aliases'][tag]
    if tag not in status['tags']:
        raise ValueError(f'Undefined status color: {tag}')
    return status['tags'][tag]


def resolve_status_color(tag, theme='dark', config=None):
    config = CONFIG if config is None else config
    tag = tag.upper()
    tag = config['status']['discord_aliases'].get(tag, tag)
    return resolve_value(tag_definition(config, tag)['color'], config['themes'][theme])


def status_colors(config=None, theme='dark'):
    config = CONFIG if config is None else config
    status = config['status']
    names = [*status['tags'], *status['color_aliases'], *status['discord_aliases']]
    return {tag: int(resolve_status_color(tag, theme, config)[1:], 16) for tag in names}


def validate_config(config):
    site = config['site']; frontend = config['frontend']; status = config['status']
    url = urlsplit(site['url'])
    if url.scheme != 'https' or not url.hostname or url.path or url.query or url.fragment or url.username or url.password:
        raise ValueError('site.url must be an HTTPS origin without trailing slash')
    banner = site['banner']
    if not isinstance(banner, str) or not banner.startswith('assets/') or any(p in ('', '.', '..') for p in banner.split('/')) or any(c in banner for c in '\\?#'):
        raise ValueError('site.banner must be a relative assets path')
    resources = config.get('resources')
    if not isinstance(resources, dict) or set(resources) != set(LEGACY_RESOURCE_PATHS):
        raise ValueError('Unknown or missing resource identifiers')
    for key, value in resources.items():
        prefix = 'config/' if key == 'mermaid_styles' else 'content/'
        suffix = '.txt' if key == 'mermaid_styles' else '.md'
        if (not isinstance(value, str) or not value.startswith(prefix) or not value.endswith(suffix)
                or any(not re.fullmatch(r'[A-Za-z0-9_][A-Za-z0-9_.-]*', part)
                       or part.lower() in {'private', 'node_modules', '__pycache__'}
                       for part in value.split('/'))):
            raise ValueError(f'Invalid public resource path: {key}')
    if len({v.lower() for v in resources.values()}) != len(resources):
        raise ValueError('Duplicate public resource path')
    if site['default_theme'] not in ('dark', 'light'):
        raise ValueError('Invalid default theme')
    for name in ('MARQUEE_SPEED', 'DEBUG_FETCH_DELAY'):
        n = frontend[name]
        if type(n) is not int or n < (1 if name == 'MARQUEE_SPEED' else 0):
            raise ValueError(f'Invalid {name}')
    for name in ('FAVICON_LIGHT', 'FAVICON_DARK', 'DATA_SOURCE'):
        if not isinstance(frontend[name], str) or not frontend[name].startswith('./'):
            raise ValueError(f'Invalid {name}')
    if frontend['DATA_SOURCE'] != './all_projects.json':
        raise ValueError('DATA_SOURCE must match the current generated all_projects.json contract')
    if set(frontend) != {'MARQUEE_SPEED','DEBUG_FETCH_DELAY','FAVICON_LIGHT','FAVICON_DARK','DATA_SOURCE'}:
        raise ValueError('Unknown or missing frontend configuration')
    if type(status['expire_days']) is not int or status['expire_days'] <= 0:
        raise ValueError('Invalid expire_days')
    groups = status['groups']
    if not isinstance(groups, list) or not groups or any(not isinstance(g,list) or not g for g in groups):
        raise ValueError('Invalid status groups')
    names = [tag for group in groups for tag in group]
    if any(not isinstance(n,str) or not NAME.fullmatch(n) for n in names) or len(names) != len(set(names)):
        raise ValueError('Invalid or duplicate status group member')
    tags = status['tags']; aliases = status['color_aliases']; discord = status['discord_aliases']
    overlap = sorted(set(tags) & set(aliases))
    if overlap:
        raise ValueError(f"Status groups and color definitions differ (defined in both tags and color_aliases: {', '.join(overlap)})")
    defined = set(tags) | set(aliases)
    if set(names) != defined:
        parts = []
        missing_defs = sorted(set(names) - defined)
        extra_defs = sorted(defined - set(names))
        if missing_defs:
            parts.append('missing color/alias: ' + ', '.join(missing_defs))
        if extra_defs:
            parts.append('not in status.groups: ' + ', '.join(extra_defs))
        raise ValueError(f"Status groups and color definitions differ ({'; '.join(parts)})")
    if set(discord) & set(names) or any(not NAME.fullmatch(k) or v not in names for k,v in discord.items()):
        raise ValueError('Invalid Discord-only alias')
    expiry = status['expirable_tags']
    if not isinstance(expiry,list) or len(expiry) != len(set(expiry)) or not set(expiry) <= set(names):
        raise ValueError('Invalid expirable tags')
    flags = status['metadata_flag_tags']
    if not isinstance(flags,list) or len(flags) != len(set(flags)) or not set(flags) <= set(names):
        raise ValueError('Invalid metadata flag tags')
    if not HEX.fullmatch(status['discord_default_color']):
        raise ValueError('Invalid Discord default color')
    themes = config['themes']
    if set(themes) != {'dark', 'light'}:
        raise ValueError(f"Theme variables must match (expected themes 'dark' and 'light', got: {', '.join(sorted(themes))})")
    dark_only = sorted(set(themes['dark']) - set(themes['light']))
    light_only = sorted(set(themes['light']) - set(themes['dark']))
    if dark_only or light_only:
        parts = []
        if dark_only:
            parts.append('light 缺少: ' + ', '.join(dark_only))
        if light_only:
            parts.append('dark 缺少: ' + ', '.join(light_only))
        raise ValueError(f"Theme variables must match ({'; '.join(parts)})")
    for mode, theme in themes.items():
        if theme.get('color-scheme') != mode:
            raise ValueError(f"Theme color-scheme mismatch (theme={mode}, got={theme.get('color-scheme')!r})")
        for key, value in theme.items():
            if not isinstance(value,str) or not (key == 'color-scheme' or re.fullmatch(r'--[\w-]+',key)) or any(c in value for c in '\r\n{}') or '/*' in value:
                raise ValueError(f'Invalid theme declaration [{mode}] {key}')
            if key not in ('color-scheme','--cursor-link'):
                resolved = resolve_value(value,theme)
                if not valid_css_color(resolved):
                    raise ValueError(f'Invalid theme color [{mode}] {key}: {value} (resolved: {resolved})')
        if not HEX.fullmatch(resolve_value(theme['--error-color'],theme)):
            raise ValueError(f"Cursor error color must resolve to RGB hex ([{mode}] --error-color={theme['--error-color']!r})")
        for tag in names:
            spec = tag_definition(config,tag)
            if set(spec) != {'color','shadow'}:
                raise ValueError(f'Invalid tag definition: {tag}')
            if not HEX.fullmatch(resolve_status_color(tag,mode,config)):
                raise ValueError(f"Invalid tag color: {tag} (theme={mode}, value={spec['color']!r})")
            shadow = resolve_value(spec['shadow'],theme)
            if not valid_css_color(shadow):
                raise ValueError(f"Invalid tag shadow: {tag} (theme={mode}, value={spec['shadow']!r})")
    templates = config['sensitive_templates']
    missing_tpl = sorted({'DEFAULT', 'MAIN', 'INSIDE'} - set(templates))
    if missing_tpl:
        raise ValueError(f"Required sensitive template missing: {', '.join(missing_tpl)}")
    for name, template in templates.items():
        if not NAME.fullmatch(name) or set(template) != {'title','desc','btn_text','color'} or any(not isinstance(v,str) for v in template.values()):
            raise ValueError(f'Invalid sensitive template {name}')
        for mode, theme in themes.items():
            if not HEX.fullmatch(resolve_value(template['color'],theme)):
                raise ValueError(f"Invalid sensitive template color {name} (theme={mode}, value={template['color']!r})")
    for idx, link in enumerate(config['social_links'], 1):
        label = link.get('name') or f'#{idx}'
        if not isinstance(link.get('name'),str) or not isinstance(link.get('icon'),str) or sum(k in link for k in ('url','copyUrl','copy_site_url')) != 1:
            raise ValueError(f'Invalid social link ({label})')
        for key in ('url','copyUrl'):
            if key in link and (not isinstance(link[key],str) or (link[key] and urlsplit(link[key]).scheme not in ('https','http'))):
                raise ValueError(f'Invalid social URL ({label}.{key}: {link[key]!r})')
        if 'copy_site_url' in link and link['copy_site_url'] is not True:
            raise ValueError(f'copy_site_url must be true ({label})')
    return config


def load_config(path=CONFIG_PATH):
    return validate_config(json.loads(Path(path).read_text(encoding='utf-8-sig'),object_pairs_hook=unique_object))


CONFIG = load_config()
SITE_URL = CONFIG['site']['url']
BANNER_PATH = CONFIG['site']['banner']
RESOURCE_PATHS = CONFIG['resources']
BANNER_URL = SITE_URL + '/' + BANNER_PATH
STATUS_GROUPS = CONFIG['status']['groups']
SYS_TAGS = frozenset(tag for group in STATUS_GROUPS for tag in group)
EXPIRABLE_TAGS = frozenset(CONFIG['status']['expirable_tags'])
TAG_EXPIRE_DAYS = CONFIG['status']['expire_days']
METADATA_FLAG_TAGS = tuple(tag.lower() for tag in CONFIG['status']['metadata_flag_tags'])


def config_for_projects(projects_dir):
    """Custom Tracker roots may contain their own shared configuration."""
    path = Path(projects_dir).resolve().parent / 'tools/config/site_config.json'
    return load_config(path) if path.is_file() else CONFIG


def js_json(value):
    return json.dumps(value,ensure_ascii=False,indent=4,allow_nan=False)


def render_js_config(config, version, ci=False):
    site = config['site']; status = config['status']
    links = []
    for item in config['social_links']:
        item = dict(item)
        if item.pop('copy_site_url',False):
            item['copyUrl'] = site['url'] + '/'
        links.append(item)
    fields = {'VERSION':version,'DEFAULT_THEME':site['default_theme'],**config['frontend'],
              'TAG_EXPIRE_DAYS':status['expire_days'],'EXPIRABLE_TAGS':status['expirable_tags'],
              'STATUS_FLAG_KEYS':['is_'+tag.lower() for tag in status['metadata_flag_tags']], 'SOCIAL_LINKS':links,
              'RESOURCES':config['resources'], 'LEGACY_HASH_KEYS':LEGACY_HASH_KEYS}
    if ci:
        fields['DEBUG_FETCH_DELAY'] = 0
    # Keep unquoted VERSION first for release validation and version tools.
    return 'const CONFIG = {\n' + ',\n'.join(f'    {key}: '+js_json(value).replace('\n','\n    ') for key,value in fields.items()) + '\n};'


def render_theme(config, mode):
    theme = config['themes'][mode]
    stroke = resolve_value(theme['--error-color'],theme)[1:]
    return f'[data-theme="{mode}"] {{\n' + '\n'.join(f'    {key}: {value.replace("@error-color-hex@",stroke)};' for key,value in theme.items()) + '\n}'


def render_palette(config):
    status = config['status']
    return '\n'.join(f'[data-status="{tag}"] {{ --s-color: {tag_definition(config,tag)["color"]}; --s-shadow: {tag_definition(config,tag)["shadow"]}; }}' for tag in [*status['tags'],*status['color_aliases']])


def replace_region(text, name, replacement, css=False):
    begin,end = ((f'/* BEGIN GENERATED {name} */',f'/* END GENERATED {name} */') if css else (f'// BEGIN GENERATED {name}',f'// END GENERATED {name}'))
    if text.count(begin) != 1 or text.count(end) != 1 or text.index(begin) >= text.index(end):
        raise ValueError(f'Missing or duplicate generated markers: {name}')
    start = text.index(begin)+len(begin)
    return text[:start]+'\n'+replacement+'\n'+text[text.index(end):]


def inject(root=ROOT_DIR, *, version=None, ci=False, check=False, config=None):
    root=Path(root); config=CONFIG if config is None else validate_config(config)
    jp,cp=root/'main.js',root/'style.css'
    js,css=jp.read_text(encoding='utf-8'),cp.read_text(encoding='utf-8')
    if version is None:
        m=VERSION.search(js)
        if not m:
            # Legacy source still contains comments before VERSION.
            m=re.search(r'\bVERSION\s*:\s*("[^"\n]+")',js)
        if not m: raise ValueError('Missing CONFIG.VERSION')
        version=json.loads(m[1])
    if not isinstance(version,str) or not version or any(c.isspace() or c in '<>"\'&\\' for c in version):
        raise ValueError('Invalid system version')
    generated_js=replace_region(js,'SITE CONFIG',render_js_config(config,version,ci))
    generated_js=replace_region(generated_js,'SENSITIVE TEMPLATES','window.SENSITIVE_TEMPLATES = '+js_json(config['sensitive_templates'])+';')
    generated_js=replace_region(generated_js,'STATUS GROUPS','window.STATUS_LIST = '+js_json(config['status']['groups'])+';')
    generated_css=replace_region(css,'DARK THEME',render_theme(config,'dark'),True)
    generated_css=replace_region(generated_css,'LIGHT THEME',render_theme(config,'light'),True)
    generated_css=replace_region(generated_css,'STATUS PALETTE',render_palette(config),True)
    changes=[(p,new) for p,old,new in [(jp,js,generated_js),(cp,css,generated_css)] if new!=old]
    if check:
        if changes: raise ValueError('Stale generated configuration: '+', '.join(p.name for p,_ in changes))
    else:
        for p,new in changes: atomic_write(p,new)
    return [p.name for p,_ in changes]


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true',help='Check generated configuration without modifying files')
    args=parser.parse_args(argv)
    from tools.common.cout import cout
    try:
        with file_lock(ROOT_DIR/'tools/.cache/site_build.lock'):
            changed=inject(check=args.check)
    except Exception as exc:
        cout.error(f'設定檢查或注入失敗：{exc}')
        return 1
    if changed:
        cout.success('已同步更新設定區塊：' + ', '.join(changed))
    else:
        cout.skip('main.js 與 style.css 設定區塊已是最新，無須更新。', indent=0)
    return 0


if __name__=='__main__':
    raise SystemExit(main())
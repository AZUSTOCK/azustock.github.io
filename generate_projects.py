import os
import json
import re
import time
import hashlib
import tempfile
import posixpath
import threading
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode, unquote, quote
from tools.build_cache import stat_key, invalidate, atomic_write, signature, file_lock
from PIL import Image
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from tools.convert_webp import (convert_to_webp_with_protection, generate_cover_thumbnail,
                               get_copyright_exif, MAX_SIZE, RATIO)
from tools.update_paths import update_extensions_to_webp
from tools.cout import cout  # ✨ 引入 Cout 全域實例
import rjsmin  # type: ignore
import rcssmin  # type: ignore

# ✨ 若想切換為純文字標籤模式 (如 [STAGE], [WARN], [IMG])，取消註解下面這行即可：
# cout.set_icon_mode('text')

# ==========================================
# 🧠 細項 Hash 快取與版本控制引擎 (Fine-Grained State Cache)
# ==========================================
API_LOGIC_VERSION = "U2026-11-18-meta-v2"    # ✨ 修改 Markdown 解析、contents.json 結構時改這個
HTML_LOGIC_VERSION = "U2026-09-24"   # ✨ 修改 index.html 跳轉模板時改這個
IMAGE_LOGIC_VERSION = "U2026-09-24"  # ✨ 修改 OG圖合成、圖片轉檔品質時改這個

# 本地原圖轉檔設定：改動這些值會由本地 manifest 判斷是否重建。
# 不自動以套件版本或年份觸發重建；演算法有改動時手動調整此版號。
WEBP_LOGIC_VERSION = "1"
WEBP_QUALITY = 90
WEBP_MAX_SIZE = MAX_SIZE
WEBP_RATIO = RATIO

CACHE_FILE = '.build_cache.json'

# 實際生成參數與更新簽章共用同一份設定。
IMAGE_PROFILES = {
    'group_thumb': (200, 85),
    'project_thumb': (180, 90),
    'article_thumb': (160, 90),
    'inline_thumb': (800, 85),
    'pdf_thumb': (800, 85),
}
OG_OUTPUT_SIZE = (1200, 630)
OG_CONTENT_SIZE = (1100, 600)
OG_QUALITY = 90
PDF_RENDER_SCALE = 4
PDF_RENDER_OVERSAMPLE = 2
PDF_RENDER_STRATEGY = 'target-width-2x-v1'
HASH_CHUNK_SIZE = 1024 * 1024
JS_SOURCE_PATH = 'main.js'
_UNSET_LATEST = object()

# 預編譯常用 Regex，避免在迴圈中反覆編譯
RE_LANG_CODE = re.compile(r'[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*')
RE_DYNAMIC_TEXT = re.compile(r'\?\?\[(.*?)\](?:[ \t]*"([^"]+)")?\s*([\s\S]*?)\s*\?\?')
RE_FOLDER_META = re.compile(r'^(-?\d+)_+(.*)$')
RE_TAG_EXPIRE = re.compile(r'^(NEW|UPDATED|LATEST|FEATURE):(\d{4}[-/]\d{2}[-/]\d{2})$', re.IGNORECASE)
RE_DATE_STR = re.compile(r'^\d{4}[-/]\d{2}[-/]\d{2}$')
RE_MD_IMG = re.compile(r'!\[([^\]]*)\]\(([^)]+)\)')
RE_HTML_IMG = re.compile(r'(<img[^>]+src=["\'])([^"\']+)(["\'][^>]*>)')
RE_IMG_TITLE = re.compile(r'(.*?)\s+(["\'])(.*?)\2$')
RE_CLEAN_TAG = re.compile(r'^.*?\[(.*?)\]$')

# 同一次建置的內容／寬高／OG底圖 memo；寫回產物後依路徑清除。
_FILE_HASH_MEMO = {}  # key: (abs_path, dev, ino, size, mtime_ns, ctime_ns, logic) -> sha256[:16]
_IMG_DIM_MEMO = {}    # key: (abs_path, dev, ino, size, mtime_ns, ctime_ns) -> (width, height)
_OG_BG_MEMO = {}      # key: (abs_path, *stat_key, size) 或 (None, size) -> 不變底圖
_OG_BG_LOCK = threading.Lock()

# 準備一個 Set 來記錄所有合法的 API 檔案絕對路徑，用於最後的清理階段
valid_api_files = set()
protected_api_dirs = set()

# 全域統計數據
stats = {
    "proj_total": 0, "proj_new": 0, "proj_updated": 0, "proj_skipped": 0,
    "art_total": 0,  "art_new": 0,  "art_updated": 0,  "art_skipped": 0,
    "json_total": 0, "json_new": 0, "json_updated": 0, "json_skipped": 0,
    "og_total": 0,   "og_new": 0,   "og_updated": 0,   "og_skipped": 0,
    "thumb_total": 0, "thumb_new": 0, "thumb_updated": 0, "thumb_skipped": 0,
    "group_og_total": 0, "group_og_new": 0, "group_og_updated": 0, "group_og_skipped": 0,
    "group_thumb_total": 0, "group_thumb_new": 0, "group_thumb_updated": 0, "group_thumb_skipped": 0,
    "inline_thumb_total": 0, "inline_thumb_new": 0, "inline_thumb_updated": 0, "inline_thumb_skipped": 0,
    "pdf_thumb_total": 0, "pdf_thumb_new": 0, "pdf_thumb_updated": 0, "pdf_thumb_skipped": 0
}

SYS_TAGS = {'MAJOR', 'HOTFIX', 'LATEST', 'FEATURE', 'NEW', 'UPDATED', 'REFACTOR', 'PATCH', 'STABLE', 'ARCHIVED', 'WIP', 'OC', 'FANART'}
META_FLAG_KEYS = ('pinned', 'new', 'updated', 'wip', 'archived', 'hidden', 'sensitive', 'required_key', 'lock_mode', 'key')


def convert_project_images(is_github_actions, overwrite_webp=False, target_folders=None):
    if is_github_actions:
        # CI 沿用原版轉檔器，不讀寫本地 manifest。
        return convert_to_webp_with_protection(directory="projects", quality=90, auto_mode=overwrite_webp)
    from tools.webp_manifest import convert_local_webp
    report = convert_local_webp(
        directory="projects", quality=WEBP_QUALITY, max_size=WEBP_MAX_SIZE,
        ratio=WEBP_RATIO, logic_version=WEBP_LOGIC_VERSION,
        force_overwrite=overwrite_webp, target_folders=target_folders,
    )
    if report['errors']:
        raise RuntimeError("本地 WebP 處理失敗，已停止後續生成；請修正錯誤後重試。")
    return report


# ==========================================
# 🛠️ 通用輔助與快取系統 (Helper & Memoization Functions)
# ==========================================
def parse_version(v_str):
    """將版本字串拆解為整數列表以供排序 (例如 'v1.10.2' -> [1, 10, 2])"""
    return [int(x) for x in re.findall(r'\d+', str(v_str))]


def safe_int(val, default=999):
    """安全轉換整數（支援負數字串如 '-1'）"""
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def parse_folder_meta(folder_name):
    match = RE_FOLDER_META.match(folder_name)
    if match:
        return int(match.group(1)), match.group(2)
    return 999, folder_name


def load_detail_json(json_path):
    if os.path.isfile(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            cout.warn(f"Error reading {json_path}: {e}")
    return {}


def get_content_language(data, context):
    """專案可指定文章的預設語言，文章可個別覆寫；無設定時保留原本顯示方式。"""
    value = data.get('lang')
    if value is None or value == '':
        return None
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return None
        if RE_LANG_CODE.fullmatch(value):
            return value
    cout.warn(f"{context} 的 lang 語言代碼無效，已略過：{value!r}")
    return None


def apply_normalized_meta(src_data, target_dict):
    """統一正規化專案與文章的 tags 及狀態旗標 (pinned, new, sensitive, lock 等)"""
    if src_data.get('tags'):
        target_dict['tags'] = [
            str(t).upper() if str(t).split(':')[0].upper() in SYS_TAGS else t
            for t in src_data['tags']
        ]
    for key in META_FLAG_KEYS:
        val = src_data.get(key)
        if val is None:
            val = src_data.get(key.upper())
        if val is not None:
            if key in ('required_key', 'lock_mode', 'key'):
                target_dict[key] = val
            elif key == 'sensitive':
                target_dict['is_sensitive'] = val
            else:
                target_dict[f'is_{key}' if key != 'pinned' else 'pinned'] = val


def clean_dynamic_text(text):
    """清除動態字串語法，僅保留偽裝文字，用於安全的靜態 HTML 輸出與 SEO 防劇透"""
    if not text or not isinstance(text, str):
        return text
    return RE_DYNAMIC_TEXT.sub(lambda m: m.group(2).strip() if m.group(2) else '***', text)


def get_image_dimensions(img_path):
    if not img_path or not os.path.isfile(img_path):
        return None
    absolute = os.path.abspath(img_path)
    key = (absolute, *stat_key(absolute))
    if key not in _IMG_DIM_MEMO:
        with Image.open(absolute) as image:
            _IMG_DIM_MEMO[key] = (image.width, image.height)
    return _IMG_DIM_MEMO[key]


def print_conversion(tag, src_path, dest_path, context=""):
    """輔助函式：透過 Cout 印出圖片轉換前後的檔案大小、壓縮率與所屬專案/文章"""
    clean_tag = RE_CLEAN_TAG.sub(r'\1', tag)
    icon_key = 'pdf' if 'PDF' in tag else 'image'
    cout.file_size_action(clean_tag, src_path, dest_path, context=context, icon_key=icon_key)


def _get_og_background(bg_path, og_size):
    """只初始化一次底圖；複製後交給各工作者，避免共享可變圖片。"""
    abs_bg = os.path.abspath(bg_path) if bg_path and os.path.isfile(bg_path) else None
    key = (abs_bg, *stat_key(abs_bg), og_size) if abs_bg else (None, og_size)
    with _OG_BG_LOCK:
        if key not in _OG_BG_MEMO:
            if abs_bg:
                with Image.open(abs_bg) as raw:
                    _OG_BG_MEMO[key] = raw.convert('RGBA').resize(og_size, Image.Resampling.LANCZOS)
            else:
                _OG_BG_MEMO[key] = Image.new('RGBA', og_size, (30, 41, 59, 255))
        return _OG_BG_MEMO[key].copy()


def create_og_image(original_path, output_path, bg_path=None):
    """將任意尺寸的圖片疊加到 1200x630 的背景圖中央，生成完美的 OG 分享圖"""
    try:
        OG_SIZE = OG_OUTPUT_SIZE
        bg = _get_og_background(bg_path, OG_SIZE)

        with Image.open(original_path) as raw_img:
            img = raw_img.convert("RGBA")

        max_w, max_h = OG_CONTENT_SIZE
        ratio = min(max_w / img.width, max_h / img.height)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

        x = (OG_SIZE[0] - new_size[0]) // 2
        y = (OG_SIZE[1] - new_size[1]) // 2
        bg.paste(img, (x, y), img)

        final_img = bg.convert("RGB")
        exif_bytes = get_copyright_exif(final_img)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        final_img.save(output_path, "WEBP", quality=OG_QUALITY, exif=exif_bytes)
        return True
    except Exception as e:
        cout.warn(f"生成 OG 圖片失敗 {original_path}: {e}")
        return False


def generate_pdf_thumbnail(pdf_path, output_path, max_width=1600, quality=90):
    """依目標寬度以 2 倍取樣渲染第一頁；PyMuPDF 僅由主執行緒呼叫。"""
    try:
        import pymupdf  # type: ignore
    except ImportError:
        cout.warn("未安裝 PyMuPDF，無法自動生成 PDF 縮圖。請執行: pip install PyMuPDF")
        return False
    try:
        with pymupdf.open(pdf_path) as doc:
            if not len(doc):
                return False
            page = doc.load_page(0)
            scale = min(PDF_RENDER_SCALE, max_width * PDF_RENDER_OVERSAMPLE / max(page.rect.width, 1))
            pix = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        del pix
        with img:
            if img.width > max_width:
                new_size = (max_width, max(1, round(img.height * max_width / img.width)))
                resized = img.resize(new_size, Image.Resampling.LANCZOS)
            else:
                resized = img.copy()
        with resized:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            resized.save(output_path, "WEBP", quality=quality, exif=get_copyright_exif(resized))
        return True
    except Exception as e:
        cout.warn(f"PDF 縮圖生成失敗 {pdf_path}: {e}")
        return False


# ==========================================
# ✨ 動態讀取前端設定 (Sync with main.js)
# ==========================================
def get_tag_expire_days():
    """從 main.js 的 CONFIG 中動態抓取 TAG_EXPIRE_DAYS"""
    try:
        js_file = JS_SOURCE_PATH
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'TAG_EXPIRE_DAYS:\s*(\d+)', content)
            if match:
                return int(match.group(1))
    except Exception as e:
        cout.warn(f"無法讀取 TAG_EXPIRE_DAYS，將使用預設值 14: {e}")
    return 14


GLOBAL_EXPIRE_DAYS = get_tag_expire_days()


# ==========================================
# 🗜️ 自動化壓縮引擎 (Minification Engine)
# ==========================================
def minify_assets():
    cout.stage("壓縮階段", "開始壓縮 JS 與 CSS 檔案...", icon_key='compress')

    try:
        with open('main.js', 'r', encoding='utf-8') as f:
            js_content = f.read()
        with open('style.css', 'r', encoding='utf-8') as f:
            css_content = f.read()

        min_js = rjsmin.jsmin(js_content)
        min_css = rcssmin.cssmin(css_content)

        atomic_write('main.min.js', min_js, _FILE_HASH_MEMO)
        atomic_write('style.min.css', min_css, _FILE_HASH_MEMO)

        cout.size_action("JS 壓縮成功", "main.min.js", len(js_content) / 1024, len(min_js) / 1024, icon_key='stage')
        cout.size_action("CSS 壓縮成功", "style.min.css", len(css_content) / 1024, len(min_css) / 1024, icon_key='stage')

        if os.path.exists('index.html'):
            with open('index.html', 'r', encoding='utf-8') as f:
                html = f.read()

            html = re.sub(r'src="(\./)?main\.js([?"#])', r'src="\g<1>main.min.js\g<2>', html)
            html = re.sub(r'href="(\./)?style\.css([?"#])', r'href="\g<1>style.min.css\g<2>', html)

            for resource in ('main.min.js', 'style.min.css'):
                pattern = r'((?:src|href)=")((?:\./)?' + re.escape(resource) + r'(?:\?[^"#]*)?(?:#[^"]*)?)(")'
                html = re.sub(pattern, lambda match: match.group(1) + get_hash_url(resource, match.group(2)) + match.group(3), html)
            atomic_write('index.html', html, _FILE_HASH_MEMO)
            cout.action("網頁掛載成功", "index.html 已切換為帶內容 Hash 的壓縮資源。", color='green')

    except Exception as e:
        cout.warn(f"壓縮失敗: {e}")
        raise RuntimeError("資源壓縮失敗，停止發布版本清單。") from e


# ==========================================
# Hash 運作引擎 (含記憶體快取加速)
# ==========================================
def get_file_hash(filepath, logic_version=""):
    if not filepath or not os.path.isfile(filepath):
        return ""
    absolute = os.path.abspath(filepath)
    before = stat_key(absolute)
    key = (absolute, *before, logic_version)
    if key in _FILE_HASH_MEMO:
        return _FILE_HASH_MEMO[key]
    digest = hashlib.sha256()
    with open(absolute, 'rb') as stream:
        for chunk in iter(lambda: stream.read(HASH_CHUNK_SIZE), b''):
            digest.update(chunk)
    if before != stat_key(absolute):
        raise OSError('計算 Hash 時檔案變動：' + absolute)
    if logic_version:
        digest.update(b'\0' + logic_version.encode('utf-8'))
    result = digest.hexdigest()[:16]
    _FILE_HASH_MEMO[key] = result
    return result


def get_hash_url(local_path, base_url):
    clean_path = local_path.split('?')[0].split('#')[0]
    version = get_file_hash(clean_path)
    if not version:
        return base_url
    parts = urlsplit(base_url)
    query = [(key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True) if key != 'v']
    query.append(('v', version))
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def source_identity(path):
    """保存完整來源資料夾，使用跨 Windows／CI 一致的專案根目錄相對路徑。"""
    try:
        return os.path.relpath(os.path.abspath(path), os.getcwd()).replace('\\', '/')
    except ValueError:  # Windows 的跨磁碟來源。
        return os.path.abspath(path).replace('\\', '/')

def thumbnail_name(source, base_dir, prefix='thumb'):
    """回傳縮圖相對路徑；資料夾區分來源，實體檔名保持 XXX.webp。"""
    relative = os.path.relpath(os.path.abspath(source), os.path.abspath(base_dir)).replace('\\', '/')
    if relative == '..' or relative.startswith('../'):
        identity = source_identity(source)
        if identity == '..' or identity.startswith('../') or os.path.isabs(identity):
            absolute = os.path.abspath(source).replace('\\', '/').replace(':', '')
            relative = '_external/' + absolute.lstrip('/')
        else:
            relative = '_shared/' + identity
    parent, filename = posixpath.split(relative)
    stem, extension = posixpath.splitext(filename)
    # 格式放在資料夾層，讓同層 foo.png / foo.webp / foo.pdf 都可保留 foo.webp。
    parts = [extension.lstrip('.').lower() or 'file', parent, stem + '.webp']
    if prefix == 'group_og':
        parts.insert(0, 'group_og')
    return posixpath.join(*parts)

def resolve_media_reference(url, base_dir):
    """分開解析 URL 與磁碟路徑，保留 query / 自訂媒體 fragment。"""
    parts = urlsplit(url)
    if parts.scheme or parts.netloc or not parts.path:
        return None, url
    raw_path = unquote(parts.path).replace('\\', '/')
    if raw_path.startswith('/'):
        clean_path = posixpath.normpath(raw_path)
        local_path = clean_path.lstrip('/')
        web_path = quote(clean_path, safe='/')
    elif raw_path.startswith(('projects/', './projects/')):
        clean_path = posixpath.normpath(raw_path)
        local_path = clean_path
        web_path = ('./' if raw_path.startswith('./') else '') + quote(clean_path, safe='/')
    else:
        joined = posixpath.normpath(posixpath.join(str(base_dir).replace('\\', '/'), raw_path))
        local_path = joined
        clean_joined = joined[2:] if joined.startswith('./') else joined.lstrip('/')
        web_path = './' + quote(clean_joined, safe='/')
    return os.path.normpath(local_path), urlunsplit(('', '', web_path, parts.query, parts.fragment))

def resolve_content_tokens(content, replacements):
    if not replacements:
        return content
    values = {token: resolver() for token, resolver in replacements}
    pattern = re.compile('|'.join(re.escape(token) for token in values))
    return pattern.sub(lambda match: values[match.group(0)], content)


def resolve_hashed_asset(primary_local, primary_url, fallback_local=None, fallback_url=None):
    """優先回傳主資產 (縮圖/OG圖) 的帶 Hash URL；若不存在則退回原圖或預設 URL"""
    if primary_local and os.path.exists(primary_local):
        return get_hash_url(primary_local, primary_url)
    if fallback_local and os.path.exists(fallback_local):
        return get_hash_url(fallback_local, fallback_url or fallback_local)
    return fallback_url or primary_url


def check_hash_status(source_path, target_path, old_hash_dict, key, force_overwrite,
                      dependencies=None, settings=None):
    logic = (API_LOGIC_VERSION if target_path.endswith('contents.json') else
             HTML_LOGIC_VERSION if target_path.endswith('index.html') else IMAGE_LOGIC_VERSION)
    current_hash = signature(source_path, dependencies, settings, logic, get_file_hash)
    if not os.path.isfile(target_path):
        return 'NEW', current_hash
    if force_overwrite or old_hash_dict.get(key) != current_hash:
        return 'UPDATED', current_hash
    return 'SKIPPED', current_hash


# ==========================================
# ⏰ 時間戳過期偵測引擎 (Expiration Checker)
# ==========================================
def check_expiration_reminders(item_title, item_type, data_dict, detail_path, days=None):
    """檢查 JSON 內的日期標籤或屬性是否過期，並交由 Cout 收集提醒"""
    if days is None:
        days = GLOBAL_EXPIRE_DAYS

    now = datetime.now()
    expire_delta = timedelta(days=days)

    tags = data_dict.get('tags') or data_dict.get('TAGS')
    if tags:
        for t in tags:
            match = RE_TAG_EXPIRE.match(str(t))
            if match:
                try:
                    dt = datetime.strptime(match.group(2).replace('-', '/'), "%Y/%m/%d")
                    if now - dt > expire_delta:
                        cout.collect_reminder(
                            "標籤過期", f"{item_type} '{item_title}' 的 '{t}' 已過 {days} 天。",
                            filepath=detail_path, color='yellow', icon_key='expired'
                        )
                except Exception:
                    pass

    for key in ('new', 'updated', 'wip', 'archived', 'hidden'):
        val = data_dict.get(key) or data_dict.get(key.upper())
        if isinstance(val, str) and RE_DATE_STR.match(val):
            try:
                dt = datetime.strptime(val.replace('-', '/'), "%Y/%m/%d")
                if key == 'hidden':
                    if now >= dt:
                        cout.collect_reminder(
                            "解封提醒", f"{item_type} '{item_title}' 的隱藏期限 '{val}' 已到期(現已公開)。",
                            filepath=detail_path, color='green', icon_key='unlock'
                        )
                else:
                    if now - dt > expire_delta:
                        cout.collect_reminder(
                            "狀態過期", f"{item_type} '{item_title}' 的 '{key}: {val}' 已過 {days} 天。",
                            filepath=detail_path, color='yellow', icon_key='expired'
                        )
            except Exception:
                pass


def update_data_version():
    """計算各獨立項目的 Hash，並寫入 data_version.json 與狀態快取"""
    cout.stage("快取引擎", "開始計算細項 Hash 值...", icon_key='cache')

    items = {
        "projects": get_file_hash("all_projects.json"),
        "kotoba.md": get_file_hash("kotoba.md"),
        "quotes.md": get_file_hash("quotes.md"),
        "COPYRIGHT.md": get_file_hash("COPYRIGHT.md"),
        "credits.md": get_file_hash("credits.md"),
        "changelogs.json": get_file_hash("changelogs.json"),
        "mermaid_styles.txt": get_file_hash("mermaid_styles.txt"),
        "main.min.js": get_file_hash("main.min.js"),
        "style.min.css": get_file_hash("style.min.css")
    }

    changed_items = []
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                old_cache = json.load(f)
                for k, v in items.items():
                    if old_cache.get(k) != v:
                        changed_items.append(k)
        except Exception:
            changed_items = list(items.keys())
    else:
        changed_items = list(items.keys())

    if changed_items:
        cout.info(f"偵測到以下項目內容變更: {cout.styled(', '.join(changed_items), 'bold', 'yellow')}", icon_key='refresh')
    else:
        cout.skip("內容無任何變更，維持現有快取。", indent=0)

    if not items['projects']:
        raise FileNotFoundError('all_projects.json 尚未成功生成，停止發布版本清單。')
    encoded = json.dumps(items, ensure_ascii=False, sort_keys=True, indent=2)
    atomic_write('data_version.json', encoded, _FILE_HASH_MEMO)
    atomic_write(CACHE_FILE, encoded, _FILE_HASH_MEMO)

    return changed_items


# ==========================================
# 📝 升級版系統日誌與版本同步器 (Changelog & Version Sync)
# ==========================================
def generate_changelogs_json():
    """打包系統日誌 (changelogs.json)，並一併回傳最新追蹤版號供 generate_version_json 使用"""
    cout.stage("版本紀錄", "開始打包系統日誌 (Changelog)...", icon_key='stage')

    base_dir = 'logs'
    output_data = []
    tracked_versions = []

    if not os.path.exists(base_dir):
        os.makedirs(base_dir, exist_ok=True)
        cout.info(f"已自動建立 '{base_dir}' 資料夾。", icon_key='folder')
        return None

    entries = [(folder, load_detail_json(os.path.join(folder, 'detail.json')))
               for folder, _, files in os.walk(base_dir) if 'detail.json' in files]
    entries.sort(key=lambda entry: parse_version(entry[1].get('version', os.path.basename(entry[0]))), reverse=True)
    for folder_path, detail in entries:
        version_folder = os.path.basename(folder_path)
        version = detail.get('version', version_folder)
        date = detail.get('date', "2026-01-01")
        status = detail.get('status', "UPDATE")
        description = detail.get('description', "系統更新與優化記錄。")
        is_hidden = detail.get('hidden', False)
        no_track = detail.get('no_track', False)

        if 'version' in detail and detail['version'] != version_folder:
            cout.action(
                "版本覆寫提示", f"日誌目錄 '{version_folder}' 與內部版號 (同對外版號) '{detail['version']}' 不一致。",
                icon_key='pin', color='yellow', tree=False, indent=1
            )

        if not no_track:
            tracked_versions.append(version)
        else:
            cout.skip(f"略過不追蹤版本: {version}", indent=1)

        if str(version).count('.') >= 3 or str(version_folder).count('.') >= 3 or is_hidden:
            cout.skip(f"隱藏內部紀錄: 目錄 {version_folder} (對外版號: {version})", indent=1)
            continue

        content = ""
        for file in os.listdir(folder_path):
            if file.endswith('.md'):
                with open(os.path.join(folder_path, file), 'r', encoding='utf-8') as f:
                    content = f.read()
                break

        if content:
            output_data.append({
                "id": version_folder, "version": version, "date": date,
                "status": status, "description": description, "content": content
            })

    atomic_write('changelogs.json', json.dumps(output_data, ensure_ascii=False, indent=2), _FILE_HASH_MEMO)
    cout.success(f"升級版版本日誌 (Changelog) 打包完成，共發布 {len(output_data)} 筆紀錄。")

    if not tracked_versions:
        return None
    return max(tracked_versions, key=parse_version)


def generate_version_json(is_github_actions=False, precomputed_latest=_UNSET_LATEST):
    """同步最新版本號至 version.json、main.js 與 index.html"""
    cout.stage("系統設定", "開始同步全站版號...", icon_key='config')
    try:
        latest_version = precomputed_latest
        if precomputed_latest is _UNSET_LATEST:
            base_dir = 'logs'
            if not os.path.exists(base_dir) or not os.listdir(base_dir):
                cout.warn("找不到 logs 資料夾，無法同步版本號！")
                return
            versions_found = []
            for root, _, files in os.walk(base_dir):
                if 'detail.json' not in files:
                    continue
                detail = load_detail_json(os.path.join(root, 'detail.json'))
                if detail.get('no_track', False):
                    continue
                versions_found.append(detail.get('version', os.path.basename(root)))
            if not versions_found:
                cout.warn("找不到任何有效的版號！")
                return
            latest_version = max(versions_found, key=parse_version)

        if not latest_version:
            cout.warn('找不到任何有效的版號！')
            return

        atomic_write('version.json', json.dumps({"version": latest_version}, indent=2), _FILE_HASH_MEMO)
        cout.success(f"成功提取最新系統版號 ({latest_version}) 並寫入 version.json")

        js_file = JS_SOURCE_PATH if os.path.isfile(JS_SOURCE_PATH) else None
        if js_file:
            with open(js_file, 'r', encoding='utf-8') as f:
                js_content = f.read()

            new_js_content = re.sub(r'(VERSION:\s*")[^"]+(")', rf'\g<1>{latest_version}\g<2>', js_content, count=1)

            if is_github_actions:
                new_js_content = re.sub(r'(DEBUG_FETCH_DELAY:\s*)\d+', r'\g<1>0', new_js_content, count=1)

            if js_content != new_js_content:
                atomic_write(js_file, new_js_content, _FILE_HASH_MEMO)
                if is_github_actions:
                    cout.success(f"成功將 {js_file} 同步更新為 {latest_version}，並自動關閉 DEBUG_FETCH_DELAY")
                else:
                    cout.success(f"成功將 {js_file} 同步更新為 {latest_version} (本地開發模式，保留 DEBUG 設定)")
            else:
                cout.skip(f"{js_file} 設定已是最新，無須修改。", indent=0)
        else:
            cout.warn("找不到 main.js 檔案，無法更新前端系統版本！")

        local_html = 'index_local.html'
        output_html = 'index.html'

        if os.path.exists(local_html):
            with open(local_html, 'r', encoding='utf-8') as f:
                html_content = f.read()

            new_html = re.sub(r'(\.(?:css|js)\?u=)[^"]+(")', rf'\g<1>{latest_version}\g<2>', html_content)
            new_html = re.sub(r'(<span id="sys-version"[^>]*>)[^<]+(</span>)', rf'\g<1>{latest_version}\g<2>', new_html)
            new_html = re.sub(r'<!--[\s\S]*?-->', '', new_html)
            new_html = re.sub(r'/\*[\s\S]*?\*/', '', new_html)
            new_html = re.sub(r'^\s*//.*$', '', new_html, flags=re.MULTILINE)
            new_html = re.sub(r'\n\s*\n', '\n', new_html)

            atomic_write(output_html, new_html, _FILE_HASH_MEMO)
            cout.success(f"成功從 {local_html} 生成正式版 {output_html} (版號 {latest_version})")
        else:
            cout.warn(f"找不到 {local_html} 檔案，跳過 HTML 版號與生成處理。")

    except Exception as e:
        cout.warn(f"系統版本號同步失敗: {e}")


# ==========================================
# 🚀 主生成器邏輯 (支援多核心平行處理圖片與縮圖)
# ==========================================
def _execute_img_task(task):
    fn, args, tag, src, dest, ctx, stat_prefix, status = task
    temporary = None
    try:
        directory = os.path.dirname(os.path.abspath(dest))
        os.makedirs(directory, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=directory, prefix='.image-build-', suffix='.webp', delete=False) as stream:
            temporary = stream.name
        staged_args = list(args)
        staged_args[1] = temporary
        ok = fn(*staged_args)
        if not ok or not os.path.isfile(temporary) or not os.path.getsize(temporary):
            raise OSError('影像任務未成功生成檔案')
        with Image.open(temporary) as image:
            image.verify()
        os.chmod(temporary, os.stat(dest).st_mode & 0o777 if os.path.isfile(dest) else 0o644)
        os.replace(temporary, dest)
        temporary = None
        invalidate(dest, _FILE_HASH_MEMO, _IMG_DIM_MEMO)
        return (True, tag, src, dest, ctx, stat_prefix, status)
    except Exception as error:
        cout.warn(f'影像任務失敗 {src} → {dest}: {error}')
        return (False, tag, src, dest, ctx, stat_prefix, status)
    finally:
        if temporary is not None and os.path.exists(temporary):
            os.unlink(temporary)


def generate_projects_json(overwrite_json=False, overwrite_og=False, overwrite_thumb=False, overwrite_pdf_thumb=False, target_folders=None):
    if target_folders is None:
        target_folders = set()
    _FILE_HASH_MEMO.clear()
    _IMG_DIM_MEMO.clear()
    with _OG_BG_LOCK:
        for image in _OG_BG_MEMO.values():
            image.close()
        _OG_BG_MEMO.clear()
    for key in stats:
        stats[key] = 0
    valid_api_files.clear()
    protected_api_dirs.clear()

    base_dir = 'projects'
    output_data = {"categories": [], "projects": []}
    BASE_URL = "https://azustock.github.io"

    API_DIR = os.path.join("api")
    os.makedirs(API_DIR, exist_ok=True)

    # 🔥 平行任務佇列與延遲寫入清單
    img_tasks = []
    scheduled_dests = set()
    scheduled_recipes = {}
    deferred_meta_writes = []
    scan_failures = []
    deferred_html_writes = []      # (html_path, format_kwargs_callable)
    deferred_content_writes = []   # (content_filepath, content_str_callable, previous_document)

    def schedule_image_task(fn, args, tag, src, dest, ctx, stat_prefix, status):
        abs_dest = os.path.abspath(dest)
        recipe = (fn, repr((args[0], args[2:])))
        if abs_dest in scheduled_recipes and scheduled_recipes[abs_dest] != recipe:
            raise ValueError('不同來源或設定會覆寫同一產物：' + dest)
        scheduled_recipes[abs_dest] = recipe
        if abs_dest not in scheduled_dests:
            scheduled_dests.add(abs_dest)
            img_tasks.append((fn, args, tag, src, dest, ctx, stat_prefix, status))

    def register_image_asset(*, stat_prefix, fn, args, tag, src_path, dest_path, context,
                             cache_dict, current_hashes, cache_key, force_overwrite,
                             dependencies=None, settings=None):
        """通用影像資產檢查、統計、排程與白名單註冊器"""
        stats[f"{stat_prefix}_total"] += 1
        source_id, output_id = source_identity(src_path), source_identity(dest_path)
        asset_key = f'asset:{source_id}->{output_id}'
        current_hashes.setdefault('_sources', {})[output_id] = {
            'source': source_id, 'folder': posixpath.dirname(source_id),
            'output': output_id, 'kind': stat_prefix,
        }
        # 舊簽章本身已包含來源與設定，可安全沿用；新紀錄一律使用完整路徑鍵。
        cache_view = cache_dict
        if asset_key not in cache_dict and cache_key in cache_dict:
            cache_view = {asset_key: cache_dict[cache_key]}
        status, file_hash = check_hash_status(
            src_path, dest_path, cache_view, asset_key, force_overwrite,
            dependencies=dependencies, settings=settings
        )
        current_hashes[asset_key] = file_hash
        needs_update = status in ('NEW', 'UPDATED')
        if needs_update:
            schedule_image_task(fn, args, tag, src_path, dest_path, context, stat_prefix, status)
        else:
            stats[f"{stat_prefix}_skipped"] += 1
        valid_api_files.add(os.path.abspath(dest_path))
        return needs_update

    html_template = """<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta property="og:type" content="article">
    <meta property="og:url" content="{share_url}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="{image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image}">
    <script>window.location.replace("{target_url}");</script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; padding-top: 15vh; background: #f4f4f5; color: #3f3f46; margin: 0;">
    <div style="max-width: 500px; margin: 0 auto; padding: 2.5rem 2rem; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <h1 style="font-size: 1.25rem; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 1.5rem; color: #18181b;">梓本投資控股</h1>
        <p style="font-size: 0.95rem; margin-bottom: 0.5rem;">System is routing to:</p>
        <p style="font-size: 1.1rem; font-weight: 600; color: #000; margin-top: 0;">{title}</p>
        <div style="margin: 2.5rem 0 1.5rem 0; width: 100%; height: 1px; background: #e4e4e7;"></div>
        <p style="color: #71717a; font-size: 0.85rem; line-height: 1.6;">
            若系統未自動跳轉，請 <a href="{target_url}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">點擊此處前往</a>。<br>
            If not redirected, click the link above.
        </p>
        <p style="font-family: monospace; font-size: 0.75rem; color: #a1a1aa; margin-top: 1.5rem;">— 風川梓 | Azustock —</p>
    </div>
</body>
</html>"""

    if not os.path.exists(base_dir):
        cout.error(f"Directory '{base_dir}' not found.")
        return

    og_settings = {'size': OG_OUTPUT_SIZE, 'content_size': OG_CONTENT_SIZE, 'quality': OG_QUALITY}
    seen_proj_ids = set()

    # 1. 掃描大分類 (Categories)
    for cat_folder in sorted(os.listdir(base_dir)):
        cat_path = os.path.join(base_dir, cat_folder)
        if not os.path.isdir(cat_path):
            continue

        default_order, clean_title = parse_folder_meta(cat_folder)
        cat_data = load_detail_json(os.path.join(cat_path, 'detail.json'))
        cat_cover = cat_data.get('cover')

        cat_cover_url = None
        if cat_cover:
            cat_cover_path = os.path.join(cat_path, cat_cover)
            cat_cover_url = get_hash_url(cat_cover_path, quote(f"{base_dir}/{cat_folder}/{cat_cover}", safe='/'))

        output_data["categories"].append({
            "order": cat_data.get('order', default_order),
            "id": cat_folder,
            "title": cat_data.get('title', clean_title),
            "meta": cat_data.get('meta', ''),
            "description": cat_data.get('description', ''),
            "watermark_url": cat_data.get('watermark_url', ''),
            "cover_image": cat_cover_url
        })

        # 2. 掃描分類底下的專案 (Projects)
        proj_folders = []
        for root, dirs, files in os.walk(cat_path):
            if 'articles' in dirs:
                dirs.remove('articles')
            if 'detail.json' in files and root != cat_path:
                proj_folders.append(root)

        for proj_path in sorted(proj_folders):
            proj_folder = os.path.basename(proj_path)

            stats["proj_total"] += 1
            proj_detail_path = os.path.join(proj_path, 'detail.json')
            proj_data = load_detail_json(proj_detail_path)
            default_proj_order, clean_proj_title = parse_folder_meta(proj_folder)

            is_proj_targeted = bool(target_folders and (proj_folder in target_folders or clean_proj_title in target_folders))

            p_overwrite_json = overwrite_json or is_proj_targeted
            p_overwrite_og = overwrite_og or is_proj_targeted
            p_overwrite_thumb = overwrite_thumb or is_proj_targeted

            check_expiration_reminders(proj_data.get('title', clean_proj_title), "專案", proj_data, proj_detail_path)

            clean_proj_data = {
                'id': clean_proj_title,
                'category': cat_folder,
                'title': proj_data.get('title', clean_proj_title),
                'order': proj_data.get('order', default_proj_order),
                'default_sort': proj_data.get('default_sort', 'desc')
            }

            project_lang = get_content_language(proj_data, f"專案 {proj_folder}")
            if project_lang:
                clean_proj_data['lang'] = project_lang
            if proj_data.get('min_sys_version'):
                clean_proj_data['min_sys_version'] = str(proj_data['min_sys_version'])
            if proj_data.get('description'):
                clean_proj_data['description'] = proj_data['description']
            if proj_data.get('date'):
                clean_proj_data['date'] = proj_data['date']
            if proj_data.get('version'):
                clean_proj_data['version'] = str(proj_data['version'])
            if proj_data.get('link'):
                clean_proj_data['link'] = proj_data['link']

            apply_normalized_meta(proj_data, clean_proj_data)

            proj_id = clean_proj_title
            if proj_id in seen_proj_ids:
                raise ValueError(f"偵測到重複的專案 ID '{proj_id}' (路徑: {proj_path})，這會導致 API 產物互相覆寫！")
            seen_proj_ids.add(proj_id)
            proj_title = clean_proj_data['title']
            proj_desc = proj_data.get('description', '查看專案內容')

            proj_api_dir = os.path.join(API_DIR, str(proj_id))
            os.makedirs(proj_api_dir, exist_ok=True)

            bg_image_path = os.path.join("assets", "og_base.png")
            proj_meta_path = os.path.join(proj_api_dir, "meta.json")

            proj_cache = load_detail_json(proj_meta_path) if os.path.exists(proj_meta_path) else {}
            if not isinstance(proj_cache, dict):
                proj_cache = {}
            current_proj_hashes = {'_source_dir': source_identity(proj_path)}
            proj_needs_update = False

            # 處理群組縮圖與群組 OG 圖
            if proj_data.get('groups'):
                processed_groups = {}
                for g_id, g_info in proj_data['groups'].items():
                    group_obj = dict(g_info)
                    g_cover = g_info.get('cover')
                    if g_cover:
                        g_cover_local_path = os.path.normpath(os.path.join(proj_path, g_cover))
                        if os.path.exists(g_cover_local_path):
                            thumb_dir = os.path.join(API_DIR, proj_id, "thumbnails")
                            os.makedirs(thumb_dir, exist_ok=True)


                            # (A) 群組縮圖
                            thumb_filename = thumbnail_name(g_cover_local_path, proj_path, 'group_thumb')
                            thumb_local_path = os.path.join(thumb_dir, thumb_filename)
                            if register_image_asset(
                                stat_prefix="group_thumb", fn=generate_cover_thumbnail,
                                args=(g_cover_local_path, thumb_local_path, *IMAGE_PROFILES['group_thumb']),
                                tag="🖼️ [群組縮圖]", src_path=g_cover_local_path, dest_path=thumb_local_path,
                                context=f"{proj_id} / {g_id}", cache_dict=proj_cache, current_hashes=current_proj_hashes,
                                cache_key=f'g_thumb_{g_id}', force_overwrite=p_overwrite_thumb,
                                settings={'profile': IMAGE_PROFILES['group_thumb']}
                            ):
                                proj_needs_update = True
                            group_obj['_cover_meta'] = (thumb_local_path, f"./api/{proj_id}/thumbnails/{quote(thumb_filename, safe='/')}")

                            # (B) 群組 OG 分享圖
                            og_filename = thumbnail_name(g_cover_local_path, proj_path, 'group_og')
                            og_local_path = os.path.join(proj_api_dir, og_filename)
                            if register_image_asset(
                                stat_prefix="group_og", fn=create_og_image,
                                args=(g_cover_local_path, og_local_path, bg_image_path),
                                tag="🖼️ [群組OG圖]", src_path=g_cover_local_path, dest_path=og_local_path,
                                context=f"{proj_id} / {g_id}", cache_dict=proj_cache, current_hashes=current_proj_hashes,
                                cache_key=f'g_og_{g_id}', force_overwrite=p_overwrite_og,
                                dependencies=[bg_image_path], settings=og_settings
                            ):
                                proj_needs_update = True
                            group_obj['_og_meta'] = (og_local_path, f"{BASE_URL}/api/{proj_id}/{quote(og_filename, safe='/')}")

                    processed_groups[g_id] = group_obj
                clean_proj_data['groups'] = processed_groups

            proj_cover = proj_data.get('cover')
            if proj_cover:
                clean_proj_data['cover_image'] = f"{proj_path.replace(os.sep, '/')}/{proj_cover}"

            proj_data = clean_proj_data
            articles = []

            proj_og_filename = "og.webp"
            proj_og_local_path = os.path.join(proj_api_dir, proj_og_filename)
            local_proj_cover = clean_proj_data.get('cover_image')

            if local_proj_cover:
                if register_image_asset(
                    stat_prefix="og", fn=create_og_image,
                    args=(local_proj_cover, proj_og_local_path, bg_image_path),
                    tag="🖼️ [專案OG圖]", src_path=local_proj_cover, dest_path=proj_og_local_path,
                    context=proj_title, cache_dict=proj_cache, current_hashes=current_proj_hashes,
                    cache_key='og_cover', force_overwrite=p_overwrite_og,
                    dependencies=[bg_image_path], settings=og_settings
                ):
                    proj_needs_update = True
                proj_img_base = f"{BASE_URL}/api/{proj_id}/{proj_og_filename}"

                proj_thumb_filename = "cover_thumb.webp"
                proj_thumb_local_path = os.path.join(proj_api_dir, proj_thumb_filename)
                if register_image_asset(
                    stat_prefix="thumb", fn=generate_cover_thumbnail,
                    args=(local_proj_cover, proj_thumb_local_path, *IMAGE_PROFILES['project_thumb']),
                    tag="🖼️ [專案縮圖]", src_path=local_proj_cover, dest_path=proj_thumb_local_path,
                    context=proj_title, cache_dict=proj_cache, current_hashes=current_proj_hashes,
                    cache_key='thumb_cover', force_overwrite=p_overwrite_thumb,
                    settings={'profile': IMAGE_PROFILES['project_thumb']}
                ):
                    proj_needs_update = True
                proj_data['_cover_meta'] = (proj_thumb_local_path, f"./api/{proj_id}/{proj_thumb_filename}", local_proj_cover)
            else:
                proj_img_base = f"{BASE_URL}/assets/og.png"

            proj_target_url = f"/?p={proj_id}"
            proj_share_url = f"{BASE_URL}/api/{proj_id}/index.html"
            proj_html_path = os.path.join(proj_api_dir, "index.html")

            proj_html_status, detail_hash = check_hash_status(
                proj_detail_path, proj_html_path, proj_cache, 'detail', p_overwrite_json,
                dependencies=[local_proj_cover, bg_image_path, 'assets/og.png'],
                settings={'template': html_template, 'base_url': BASE_URL}
            )
            current_proj_hashes['detail'] = detail_hash

            if proj_html_status in ('NEW', 'UPDATED') or proj_needs_update:
                proj_needs_update = True
                def _make_proj_html_updater(p_title=proj_title, p_desc=proj_desc, p_og_local=proj_og_local_path,
                                            p_cov=local_proj_cover, p_img_b=proj_img_base, p_t_url=proj_target_url, p_s_url=proj_share_url):
                    if p_cov:
                        hashed = resolve_hashed_asset(p_og_local, p_img_b, p_cov, f"{BASE_URL}/{quote(p_cov, safe='/')}")
                    else:
                        hashed = resolve_hashed_asset("assets/og.png", p_img_b)
                    return html_template.format(
                        title=clean_dynamic_text(p_title), description=clean_dynamic_text(p_desc),
                        image=hashed, target_url=p_t_url, share_url=p_s_url
                    )
                deferred_html_writes.append((proj_html_path, _make_proj_html_updater))
                if proj_html_status == 'NEW':
                    stats["proj_new"] += 1
                else:
                    stats["proj_updated"] += 1
            else:
                stats["proj_skipped"] += 1

            valid_api_files.add(os.path.abspath(proj_html_path))

            if proj_needs_update or current_proj_hashes != proj_cache or not os.path.exists(proj_meta_path):
                deferred_meta_writes.append((proj_meta_path, current_proj_hashes))
            valid_api_files.add(os.path.abspath(proj_meta_path))

            # 3. 掃描專案底下的文章 (Articles)
            articles_dir = os.path.join(proj_path, 'articles')
            if os.path.isdir(articles_dir):
                seen_art_ids = set()
                art_folders = [
                    root for root, _, files in os.walk(articles_dir)
                    if 'detail.json' in files
                ]

                for item_path in sorted(art_folders):
                    item = os.path.basename(item_path)
                    art_detail_path = os.path.join(item_path, 'detail.json')
                    sub_data = load_detail_json(art_detail_path)
                    default_art_order, clean_art_title = parse_folder_meta(item)

                    is_art_targeted = bool(target_folders and (item in target_folders or clean_art_title in target_folders))

                    a_overwrite_json = p_overwrite_json or is_art_targeted
                    a_overwrite_og = p_overwrite_og or is_art_targeted
                    a_overwrite_thumb = p_overwrite_thumb or is_art_targeted
                    a_overwrite_pdf = overwrite_pdf_thumb or is_proj_targeted or is_art_targeted

                    meta_title = sub_data.get('title', clean_art_title)
                    meta_desc = sub_data.get('description')
                    meta_order = sub_data.get('order', default_art_order)

                    has_explicit_cover = 'cover' in sub_data
                    meta_cover = sub_data.get('cover')

                    check_expiration_reminders(meta_title, "文章", sub_data, art_detail_path)

                    md_file_path = None
                    rel_base = item_path.replace(os.sep, '/')
                    for sub_item in os.listdir(item_path):
                        if sub_item.endswith('.md'):
                            md_file_path = os.path.join(item_path, sub_item)
                        elif not has_explicit_cover and sub_item.lower() in ('basic.webp', 'architecture.webp'):
                            meta_cover = sub_item

                    if not md_file_path:
                        continue

                    try:
                        stats["art_total"] += 1
                        art_id = clean_art_title
                        if art_id in seen_art_ids:
                            raise ValueError(f"專案 '{proj_id}' 內偵測到重複的文章 ID '{art_id}' (路徑: {item_path})")
                        seen_art_ids.add(art_id)
                        art_dir = os.path.join("api", proj_id, art_id)
                        os.makedirs(art_dir, exist_ok=True)

                        content_filename = "contents.json"
                        content_filepath = os.path.join(art_dir, content_filename)
                        article_meta_path = os.path.join(art_dir, 'meta.json')
                        previous_document = load_detail_json(content_filepath)
                        if not isinstance(previous_document, dict):
                            previous_document = {}
                        art_cache = load_detail_json(article_meta_path) if os.path.isfile(article_meta_path) else previous_document.get('hashes', {})
                        if not isinstance(art_cache, dict):
                            art_cache = {}
                        current_hashes = {'_source_dir': source_identity(item_path)}
                        art_needs_update = False

                        with open(md_file_path, 'r', encoding='utf-8') as md_file:
                            raw_md_content = md_file.read()

                        if sub_data.get('title') is None and raw_md_content.startswith('# '):
                            meta_title = raw_md_content.split('\n', 1)[0].replace('# ', '').strip()

                        content = raw_md_content
                        real_path = f"./{rel_base}/"

                        # 記錄此文章內需要等平行縮圖完成後回填 Hash 或寬高的佔位符
                        pending_replacements = []  # (token, resolver_callable)

                        def replace_md_img(match):
                            nonlocal art_needs_update
                            alt_text, url_part = match.group(1), match.group(2).strip()
                            title_match = RE_IMG_TITLE.search(url_part)
                            if title_match:
                                url = title_match.group(1)
                                title_str = f' {title_match.group(2)}{title_match.group(3)}{title_match.group(2)}'
                            else:
                                url = url_part
                                title_str = ""

                            local_main_path, fixed_url = resolve_media_reference(url, real_path)
                            if local_main_path is not None:
                                main_url = fixed_url.split('#')[0]

                                ext = os.path.splitext(local_main_path)[1].lower()

                                valid_media_exts = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.mp4', '.webm', '.ogg', '.mp3', '.wav', '.pdf'}
                                if ext not in valid_media_exts:
                                    return f"![{alt_text}]({fixed_url}{title_str})"

                                parts = fixed_url.split('#')
                                stamped_parts = []
                                poster_ar_str = ""

                                for part_index, p in enumerate(parts):
                                    if p.startswith('poster='):
                                        poster_path, poster_url = resolve_media_reference(p[7:], real_path)
                                        stamped_parts.append(f"poster={get_hash_url(poster_path, poster_url) if poster_path else poster_url}")
                                        dims = get_image_dimensions(poster_path)
                                        if dims:
                                            poster_ar_str = f"&w={dims[0]}&h={dims[1]}"
                                    elif p.startswith('full='):
                                        full_path, full_url = resolve_media_reference(p[5:], real_path)
                                        stamped_parts.append(f"full={get_hash_url(full_path, full_url) if full_path else full_url}")
                                    else:
                                        stamped_parts.append(get_hash_url(local_main_path, p) if part_index == 0 else p)

                                final_stamped_url = '#'.join(stamped_parts)

                                valid_image_exts = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'}
                                if ext in valid_image_exts and os.path.exists(local_main_path):
                                    thumb_dir = os.path.join(art_dir, "thumbnails")
                                    os.makedirs(thumb_dir, exist_ok=True)
                                    thumb_filename = thumbnail_name(local_main_path, item_path)
                                    thumb_local_path = os.path.join(thumb_dir, thumb_filename)

                                    if register_image_asset(
                                        stat_prefix="inline_thumb", fn=generate_cover_thumbnail,
                                        args=(local_main_path, thumb_local_path, *IMAGE_PROFILES['inline_thumb']),
                                        tag="🖼️ [內文縮圖]", src_path=local_main_path, dest_path=thumb_local_path,
                                        context=f"{proj_id} / {art_id}", cache_dict=art_cache, current_hashes=current_hashes,
                                        cache_key=local_main_path, force_overwrite=a_overwrite_thumb,
                                        settings={'profile': IMAGE_PROFILES['inline_thumb']}
                                    ):
                                        art_needs_update = True

                                    orig_url_t = get_hash_url(local_main_path, main_url)
                                    dims = get_image_dimensions(local_main_path)
                                    ar_str = f"&w={dims[0]}&h={dims[1]}" if dims else ""

                                    base_thumb_url = f"./api/{proj_id}/{art_id}/thumbnails/{quote(thumb_filename, safe='/')}"
                                    token = f"__THUMB_URL_{len(pending_replacements)}__"
                                    pending_replacements.append((token, lambda t_p=thumb_local_path, b_u=base_thumb_url: get_hash_url(t_p, b_u)))

                                    if '#full=' in final_stamped_url:
                                        return f"![{alt_text}]({token}#{final_stamped_url.split('#', 1)[1]}{ar_str}{title_str})"
                                    else:
                                        return f"![{alt_text}]({token}#full={orig_url_t}{ar_str}{title_str})"

                                elif ext == '.pdf' and os.path.exists(local_main_path):
                                    if '#poster=' not in final_stamped_url:
                                        thumb_dir = os.path.join(art_dir, "thumbnails")
                                        os.makedirs(thumb_dir, exist_ok=True)

                                        thumb_filename = thumbnail_name(local_main_path, item_path)
                                        thumb_local_path = os.path.join(thumb_dir, thumb_filename)

                                        if register_image_asset(
                                            stat_prefix="pdf_thumb", fn=generate_pdf_thumbnail,
                                            args=(local_main_path, thumb_local_path, *IMAGE_PROFILES['pdf_thumb']),
                                            tag="📄 [PDF縮圖]", src_path=local_main_path, dest_path=thumb_local_path,
                                            context=f"{proj_id} / {art_id}", cache_dict=art_cache, current_hashes=current_hashes,
                                            cache_key=local_main_path, force_overwrite=a_overwrite_pdf,
                                            settings={'profile': IMAGE_PROFILES['pdf_thumb'], 'render_scale': PDF_RENDER_SCALE, 'oversample': PDF_RENDER_OVERSAMPLE, 'strategy': PDF_RENDER_STRATEGY}
                                        ):
                                            art_needs_update = True

                                        base_thumb_url = f"./api/{proj_id}/{art_id}/thumbnails/{quote(thumb_filename, safe='/')}"
                                        token = f"__PDF_POSTER_{len(pending_replacements)}__"
                                        def _resolve_pdf_poster(t_p=thumb_local_path, b_u=base_thumb_url):
                                            if not os.path.exists(t_p):
                                                return ""
                                            t_url = get_hash_url(t_p, b_u)
                                            d = get_image_dimensions(t_p)
                                            ar = f"&w={d[0]}&h={d[1]}" if d else ""
                                            return f"#poster={t_url}{ar}"
                                        pending_replacements.append((token, _resolve_pdf_poster))
                                        final_stamped_url += token
                                    else:
                                        final_stamped_url += poster_ar_str

                                    return f"![{alt_text}]({final_stamped_url}{title_str})"

                                else:
                                    return f"![{alt_text}]({final_stamped_url}{poster_ar_str}{title_str})"

                            return f"![{alt_text}]({url_part})"

                        content = RE_MD_IMG.sub(replace_md_img, content)

                        def replace_html_img(match):
                            nonlocal art_needs_update
                            try:
                                prefix, url, suffix = match.group(1), match.group(2), match.group(3)
                                local_img_path, orig_url = resolve_media_reference(url, real_path)
                                if local_img_path is None:
                                    return match.group(0)

                                valid_image_exts = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'}
                                ext = os.path.splitext(local_img_path)[1].lower()

                                if ext not in valid_image_exts:
                                    return f"{prefix}{orig_url}{suffix}"

                                if os.path.exists(local_img_path):
                                    thumb_dir = os.path.join(art_dir, "thumbnails")
                                    os.makedirs(thumb_dir, exist_ok=True)
                                    thumb_filename = thumbnail_name(local_img_path, item_path)
                                    thumb_local_path = os.path.join(thumb_dir, thumb_filename)

                                    if register_image_asset(
                                        stat_prefix="inline_thumb", fn=generate_cover_thumbnail,
                                        args=(local_img_path, thumb_local_path, *IMAGE_PROFILES['inline_thumb']),
                                        tag="🖼️ [內文縮圖]", src_path=local_img_path, dest_path=thumb_local_path,
                                        context=f"{proj_id} / {art_id}", cache_dict=art_cache, current_hashes=current_hashes,
                                        cache_key=local_img_path, force_overwrite=a_overwrite_thumb,
                                        settings={'profile': IMAGE_PROFILES['inline_thumb']}
                                    ):
                                        art_needs_update = True

                                    orig_url_t = get_hash_url(local_img_path, orig_url)
                                    dims = get_image_dimensions(local_img_path)
                                    size_attrs = f' width="{dims[0]}" height="{dims[1]}" style="aspect-ratio: {dims[0]}/{dims[1]};"' if dims else ""

                                    base_thumb_url = f"./api/{proj_id}/{art_id}/thumbnails/{quote(thumb_filename, safe='/')}"
                                    token = f"__HTML_THUMB_{len(pending_replacements)}__"
                                    pending_replacements.append((token, lambda t_p=thumb_local_path, b_u=base_thumb_url: get_hash_url(t_p, b_u)))

                                    closing_quote = prefix[-1]
                                    return f'{prefix}{token}{closing_quote} data-full="{orig_url_t}"{size_attrs}{suffix[1:]}'

                                return f"{prefix}{url}{suffix}"
                            except Exception as inner_e:
                                cout.warn(f"HTML 圖片替換發生錯誤 ({url}): {inner_e}", indent=2)
                                return match.group(0)

                        content = RE_HTML_IMG.sub(replace_html_img, content)

                        stats["json_total"] += 1
                        json_status, md_hash = check_hash_status(md_file_path, content_filepath, art_cache, 'md_source', a_overwrite_json)
                        current_hashes['md_source'] = md_hash

                        if json_status in ('NEW', 'UPDATED'):
                            art_needs_update = True

                        art_title = meta_title
                        art_desc = meta_desc if meta_desc else proj_desc
                        og_local_path = os.path.join(art_dir, "og.webp")

                        art_group = sub_data.get('group')
                        if not art_group and 'groups' in proj_data:
                            for g_id, g_info in proj_data['groups'].items():
                                if g_info.get('default'):
                                    art_group = g_id
                                    break

                        local_cover_path = os.path.join(item_path, meta_cover) if meta_cover else None
                        art_thumb_filename = "cover_thumb.webp"
                        art_thumb_local_path = os.path.join(art_dir, art_thumb_filename)

                        if meta_cover:
                            art_bg_image_path = os.path.join("assets", "og.png")
                            if register_image_asset(
                                stat_prefix="og", fn=create_og_image,
                                args=(local_cover_path, og_local_path, art_bg_image_path),
                                tag="🖼️ [文章OG圖]", src_path=local_cover_path, dest_path=og_local_path,
                                context=f"{proj_id} / {art_id}", cache_dict=art_cache, current_hashes=current_hashes,
                                cache_key='og_cover', force_overwrite=a_overwrite_og,
                                dependencies=[art_bg_image_path], settings=og_settings
                            ):
                                art_needs_update = True

                            if register_image_asset(
                                stat_prefix="thumb", fn=generate_cover_thumbnail,
                                args=(local_cover_path, art_thumb_local_path, *IMAGE_PROFILES['article_thumb']),
                                tag="🖼️ [文章縮圖]", src_path=local_cover_path, dest_path=art_thumb_local_path,
                                context=f"{proj_id} / {art_id}", cache_dict=art_cache, current_hashes=current_hashes,
                                cache_key='thumb_cover', force_overwrite=a_overwrite_thumb,
                                settings={'profile': IMAGE_PROFILES['article_thumb']}
                            ):
                                art_needs_update = True

                        art_target_url = f"/?p={proj_id}&a={art_id}"
                        art_share_url = f"{BASE_URL}/api/{proj_id}/{art_id}/index.html"
                        art_html_path = os.path.join(art_dir, "index.html")

                        grp_cover_dep = None
                        if art_group and 'groups' in proj_data:
                            g_cov_rel = proj_data['groups'].get(art_group, {}).get('cover')
                            if g_cov_rel:
                                grp_cover_dep = os.path.normpath(os.path.join(proj_path, g_cov_rel))

                        art_html_status, art_detail_hash = check_hash_status(
                            art_detail_path, art_html_path, art_cache, 'art_detail', a_overwrite_json,
                            dependencies=[md_file_path, proj_detail_path, local_cover_path, grp_cover_dep, local_proj_cover, bg_image_path, 'assets/og.png'],
                            settings={'template': html_template, 'base_url': BASE_URL}
                        )
                        current_hashes['art_detail'] = art_detail_hash

                        if art_html_status in ('NEW', 'UPDATED') or art_needs_update or proj_needs_update:
                            art_needs_update = True
                            def _make_art_html_updater(
                                a_title=art_title, p_title=proj_title, a_desc=art_desc,
                                m_cov=meta_cover, a_og_local=og_local_path, l_cov=local_cover_path,
                                r_base=rel_base, p_id=proj_id, a_id=art_id, a_grp=art_group,
                                p_data=proj_data, p_og_local=proj_og_local_path, p_cov=local_proj_cover, p_img_b=proj_img_base,
                                a_t_url=art_target_url, a_s_url=art_share_url
                            ):
                                if m_cov:
                                    a_img_b = f"{BASE_URL}/api/{quote(str(p_id), safe='')}/{quote(str(a_id), safe='')}/og.webp"
                                    hashed = resolve_hashed_asset(a_og_local, a_img_b, l_cov, f"{BASE_URL}/{quote(f'{r_base}/{m_cov}', safe='/')}")
                                else:
                                    grp_og = p_data.get('groups', {}).get(a_grp, {}).get('og_image') if a_grp else None
                                    if grp_og:
                                        hashed = grp_og
                                    elif p_cov:
                                        hashed = resolve_hashed_asset(p_og_local, p_img_b, p_cov, f"{BASE_URL}/{quote(p_cov, safe='/')}")
                                    else:
                                        hashed = resolve_hashed_asset("assets/og.png", p_img_b)
                                return html_template.format(
                                    title=f"{clean_dynamic_text(a_title)} | {clean_dynamic_text(p_title)}",
                                    description=clean_dynamic_text(a_desc),
                                    image=hashed, target_url=a_t_url, share_url=a_s_url
                                )
                            deferred_html_writes.append((art_html_path, _make_art_html_updater))
                            if art_html_status == 'NEW':
                                stats["art_new"] += 1
                            else:
                                stats["art_updated"] += 1
                        else:
                            stats["art_skipped"] += 1

                        valid_api_files.add(os.path.abspath(art_html_path))

                        # 所有媒體與尺寸回填完成後比較最終內容，避免漏掉只改音訊／影片的更新。
                        def _resolve_all_content(raw_c=content, repls=pending_replacements):
                            return resolve_content_tokens(raw_c, repls)
                        deferred_content_writes.append((content_filepath, _resolve_all_content, previous_document, a_overwrite_json))
                        if art_needs_update or current_hashes != art_cache or not os.path.isfile(article_meta_path):
                            deferred_meta_writes.append((article_meta_path, current_hashes))
                        valid_api_files.add(os.path.abspath(article_meta_path))

                        valid_api_files.add(os.path.abspath(content_filepath))

                        article_obj = {
                            "id": art_id,
                            "sort_order": meta_order,
                            "title": meta_title,
                            "content_path": f"./api/{proj_id}/{art_id}/{content_filename}",
                            "_content_local": content_filepath
                        }

                        article_lang = get_content_language(sub_data, f"文章 {proj_folder}/{item}")
                        if article_lang:
                            article_obj['lang'] = article_lang
                        if sub_data.get('min_sys_version'):
                            article_obj["min_sys_version"] = str(sub_data['min_sys_version'])
                        if meta_desc:
                            article_obj["description"] = meta_desc
                        if meta_cover:
                            article_obj["_cover_meta"] = (
                                art_thumb_local_path, f"./api/{proj_id}/{art_id}/{art_thumb_filename}",
                                local_cover_path, f"{rel_base}/{meta_cover}"
                            )
                        if sub_data.get('date'):
                            article_obj["date"] = sub_data['date']

                        apply_normalized_meta(sub_data, article_obj)

                        if 'groups' in proj_data and art_group:
                            article_obj['group'] = art_group

                        articles.append(article_obj)
                    except Exception as e:
                        scan_failures.append(f"{md_file_path}: {e}")
                        cout.warn(f"處理文章失敗 {md_file_path}: {e}")
                        if 'art_dir' in locals():
                            protected_api_dirs.add(os.path.abspath(art_dir))

            if articles:
                sorted_articles = sorted(
                    articles,
                    key=lambda x: (-1 if x.get('pinned', False) else 0, safe_int(x.get('sort_order', 999)))
                )
                for art in sorted_articles:
                    art.pop('sort_order', None)
                    art.pop('folder_name', None)
                proj_data['articles'] = sorted_articles

            output_data["projects"].append(proj_data)

    if scan_failures:
        raise RuntimeError('文章解析失敗，停止提交生成快取：' + '; '.join(scan_failures))

    image_failures = []
    # 🔥 4. 啟動多核心平行池，一次處理所有待辦的 OG 圖、縮圖與 PDF 預覽圖
    if img_tasks:
        max_workers = min(32, (os.cpu_count() or 4) + 4)
        cout.info(f"啟動多執行緒平行渲染 ({len(img_tasks)} 項影像任務, {max_workers} 執行緒)...", icon_key='rocket')
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(_execute_img_task, t) for t in img_tasks if t[0] is not generate_pdf_thumbnail]
            for future in as_completed(futures):
                ok, tag, src, dest, ctx, stat_prefix, status = future.result()
                if ok:
                    print_conversion(tag, src, dest, context=ctx)
                    if status == 'NEW':
                        stats[f"{stat_prefix}_new"] += 1
                    else:
                        stats[f"{stat_prefix}_updated"] += 1
                else:
                    image_failures.append(dest)
                    stats[f"{stat_prefix}_skipped"] += 1

    for task in img_tasks:
        if task[0] is not generate_pdf_thumbnail:
            continue
        ok, tag, src, dest, ctx, stat_prefix, status = _execute_img_task(task)
        if ok:
            print_conversion(tag, src, dest, context=ctx)
            stats[f"{stat_prefix}_{'new' if status == 'NEW' else 'updated'}"] += 1
        else:
            image_failures.append(dest)
            stats[f"{stat_prefix}_skipped"] += 1

    if image_failures:
        raise RuntimeError('影像生成失敗，快取紀錄與資料庫尚未提交：' + ', '.join(image_failures))

    # 🔥 5. 圖片全數生成完畢後，解析所有帶有最新檔案內容 Hash 的路徑
    for proj in output_data["projects"]:
        if 'groups' in proj:
            for g_obj in proj['groups'].values():
                if '_cover_meta' in g_obj:
                    t_local, t_base = g_obj.pop('_cover_meta')
                    g_obj['cover_image'] = get_hash_url(t_local, t_base)
                if '_og_meta' in g_obj:
                    o_local, o_base = g_obj.pop('_og_meta')
                    g_obj['og_image'] = get_hash_url(o_local, o_base)
        if '_cover_meta' in proj:
            t_local, t_base, orig_cov = proj.pop('_cover_meta')
            proj['cover_image'] = resolve_hashed_asset(t_local, t_base, orig_cov, quote(orig_cov, safe='/'))
        for art in proj.get('articles', []):
            if '_cover_meta' in art:
                t_local, t_base, l_cov, rel_cov = art.pop('_cover_meta')
                art['cover_image'] = resolve_hashed_asset(t_local, t_base, l_cov, quote(rel_cov, safe='/'))

    # 寫入所有需要更新的 contents.json 與 index.html
    resolved_contents = []
    for path, resolve, previous, force_json in deferred_content_writes:
        content = resolve()
        if not force_json and isinstance(previous, dict) and previous.get('content') == content:
            stats['json_skipped'] += 1
            continue
        status = 'new' if not os.path.isfile(path) else 'updated'
        resolved_contents.append((path, json.dumps({'content': content}, ensure_ascii=False), status, force_json))

    for path, payload, status, force_json in resolved_contents:
        changed = atomic_write(path, payload, _FILE_HASH_MEMO)
        stats[f"json_{status if (changed or force_json) else 'skipped'}"] += 1

    resolved_html = [(path, fn()) for path, fn in deferred_html_writes]
    for path, html in resolved_html:
        atomic_write(path, html, _FILE_HASH_MEMO)
    for path, hashes in deferred_meta_writes:
        atomic_write(path, json.dumps(hashes, ensure_ascii=False, sort_keys=True), _FILE_HASH_MEMO)
    for project in output_data['projects']:
        for article in project.get('articles', []):
            article['content_path'] = get_hash_url(article.pop('_content_local'), article['content_path'])

    output_data["categories"].sort(key=lambda x: safe_int(x.get('order', 999)))
    cat_order_map = {cat['id']: safe_int(cat.get('order', 999)) for cat in output_data["categories"]}

    def proj_sort(x):
        cat_order = cat_order_map.get(x.get('category'), 999)
        pinned_val = -1 if x.get('pinned', False) else 0
        p_order = -safe_int(x.get('order', 999))
        return (cat_order, pinned_val, p_order, x.get('id', ''))

    output_data["projects"].sort(key=proj_sort)

    cout.success(f"JSON 結構掃描與打包完成，包含 {len(output_data['projects'])} 個專案。")

    atomic_write('all_projects.json', json.dumps(output_data, ensure_ascii=False, indent=2), _FILE_HASH_MEMO)


# ==========================================
# 🧹 清理廢棄 API 資料夾
# ==========================================
def cleanup_old_api_files(api_dir="api"):
    cout.stage("清理階段", "開始刪除無效與舊版 API 資料...", icon_key='clean')

    if not os.path.exists(api_dir):
        cout.skip("沒有找到 api 資料夾，略過清理。", indent=0)
        return

    deleted_files = 0
    deleted_dirs = 0

    for root, dirs, files in os.walk(api_dir, topdown=False):
        current_root_abs = os.path.abspath(root)
        is_protected = any(
            os.path.commonpath([current_root_abs, p_dir]) == p_dir
            for p_dir in protected_api_dirs
        )

        if is_protected:
            continue

        for name in files:
            file_path = os.path.abspath(os.path.join(root, name))
            if file_path not in valid_api_files:
                os.remove(file_path)
                deleted_files += 1
                cout.action("刪除廢棄檔案", os.path.relpath(file_path), icon_key='delete', color='yellow', tree=True)

        for name in dirs:
            dir_path = os.path.join(root, name)
            if not os.listdir(dir_path):
                os.rmdir(dir_path)
                deleted_dirs += 1
                cout.action("刪除空資料夾", os.path.relpath(dir_path), icon_key='folder', color='gray', tree=True)

    cout.success(f"清理完成！共刪除 {deleted_files} 個檔案, {deleted_dirs} 個資料夾。")


if __name__ == "__main__":
    with file_lock("tools/.cache/site_build.lock"):
        is_github_actions = os.getenv("GITHUB_ACTIONS") == "true"

        overwrite_webp = False
        overwrite_json = False
        overwrite_og = False
        overwrite_thumb = False
        overwrite_pdf_thumb = False
        target_folders = set()

        if is_github_actions:
            cout.stage("CI/CD 模式", "偵測到 GitHub Actions 環境", icon_key='bot')
            cout.info("自動停用互動提問，啟用【全域智慧跳過】以加速佈署流程 (僅更新修改過的檔案)。\n", indent=1, tree=True)
        else:
            choice = cout.menu(
                "請選擇整體作業模式？ (包含圖片轉檔與 JSON 打包)",
                [
                    ("1", "全域智慧跳過 (遇到舊檔且無修改則跳過，速度最快 - 預設)"),
                    ("2", "全域強制複寫 (多核心平行重新處理所有檔案與縮圖)"),
                    ("3", "自訂義 (針對各項處理分別選擇)"),
                    ("4", "指定資料夾強制更新 (僅強制重刷特定專案或文章)")
                ],
                prompt_text="請選擇 [1, 2, 3 或 4]", default="1"
            )

            if choice == '2':
                overwrite_webp = overwrite_json = overwrite_og = overwrite_thumb = overwrite_pdf_thumb = True
            elif choice == '3':
                cout.info("\n-- 自訂義細項設定 --", icon_key='config')
                w_choice = input("  [A] 處理選項 (1/5): 專案原圖轉 WebP [1]智慧跳過 [2]強制複寫 (預設 1): ").strip()
                overwrite_webp = (w_choice == '2')

                j_choice = input("  [B] 處理選項 (2/5): Markdown轉JSON與HTML [1]智慧跳過 [2]強制複寫 (預設 1): ").strip()
                overwrite_json = (j_choice == '2')

                o_choice = input("  [C] 處理選項 (3/5): OG 分享圖生成 [1]智慧跳過 [2]強制複寫 (預設 1): ").strip()
                overwrite_og = (o_choice == '2')

                t_choice = input("  [D] 處理選項 (4/5): 封面與內文圖片縮圖生成 [1]智慧跳過 [2]強制複寫 (預設 1): ").strip()
                overwrite_thumb = (t_choice == '2')

                p_choice = input("  [E] 處理選項 (5/5): PDF 封面預覽縮圖生成 [1]智慧跳過 [2]強制複寫 (預設 1): ").strip()
                overwrite_pdf_thumb = (p_choice == '2')
            elif choice == '4':
                targets = input(f"\n{cout.icon('target')} 請輸入要強制更新的資料夾名稱 (多個以空白分隔，如 '02_mind 24_create'): ").strip()
                if targets:
                    target_folders = set(targets.split())
                    cout.action("指定更新模式", f"將強制重刷以下項目及其內容: {', '.join(target_folders)}", icon_key='target', color='magenta', tree=False)

        build_start_time = time.perf_counter()

        # 1. 原圖轉 WebP 後，立即將 Markdown 與 detail.json 內的副檔名更新為 .webp
        convert_project_images(is_github_actions, overwrite_webp, target_folders)
        cout.stage("路徑同步階段", "更新文章與設定檔內之圖片副檔名為 WebP...", icon_key='stage')
        update_extensions_to_webp()

        # 2. 解析更新後的 Markdown 並打包 JSON 與縮圖
        cout.stage("第二階段", "開始解析 Markdown 並打包 JSON 資料庫...", icon_key='stage')
        generate_projects_json(
            overwrite_json=overwrite_json, overwrite_og=overwrite_og,
            overwrite_thumb=overwrite_thumb, overwrite_pdf_thumb=overwrite_pdf_thumb,
            target_folders=target_folders
        )

        # ✨ 使用 Cout 輸出對齊的統計表格 (自動為新增/更新上色)
        cout.stats_table(stats, [
            ("專案 HTML (index)", "proj"),
            ("文章 HTML (index)", "art"),
            ("內文 JSON (contents)", "json"),
            ("專案與文章 OG 圖", "og"),
            ("專案與文章封面縮圖", "thumb"),
            ("群組分享圖 (group_og)", "group_og"),
            ("群組縮圖 (group_thumb)", "group_thumb"),
            ("內文縮圖 (inline_thumb)", "inline_thumb"),
            ("PDF 預覽圖 (pdf_thumb)", "pdf_thumb"),
        ])

        cleanup_old_api_files()

        # 3. 產生最新的 changelogs.json，並將提取出的最新追蹤版號直接交由 generate_version_json 同步
        latest_ver = generate_changelogs_json()
        generate_version_json(is_github_actions, precomputed_latest=latest_ver)

        # 4. 先完成壓縮產物，再計算細項 Hash 發佈最終版本清單 data_version.json
        minify_assets()
        update_data_version()

        # 5. 統一輸出過期或解封提醒清單
        cout.flush_reminders("過期 tag 提示")

        total_elapsed = time.perf_counter() - build_start_time
        cout.success(f"全站建置流程執行完畢！總耗時: {total_elapsed:.2f} 秒。", icon_key='party')

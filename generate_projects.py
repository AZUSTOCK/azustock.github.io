import os
import json
import re
import time
import hashlib
import tempfile
import posixpath
import threading
import urllib.request
import urllib.error
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode, unquote, quote

from PIL import Image
import rjsmin  # type: ignore
import rcssmin  # type: ignore

from tools.build_cache import stat_key, invalidate, atomic_write, signature, file_lock
from tools.convert_webp import (
    convert_to_webp_with_protection,
    generate_cover_thumbnail,
    get_copyright_exif,
    MAX_SIZE,
    RATIO,
)
from tools.update_paths import update_extensions_to_webp
from tools.cout import cout  # ✨ 引入 Cout 全域實例

# ✨ 若想切換為純文字標籤模式 (如 [STAGE], [WARN], [IMG])，取消註解下面這行即可：
# cout.set_icon_mode('text')

# ==========================================
# 🧠 細項 Hash 快取與版本控制設定
# ==========================================
API_LOGIC_VERSION = "U2026-11-18"  # 修改 Markdown 解析或 contents.json 結構時更新
HTML_LOGIC_VERSION = "U2026-11-18"  # 修改分享頁模板或網址生成規則時更新
IMAGE_LOGIC_VERSION = "U2026-09-24"  # ✨ 修改 OG圖合成、圖片轉檔品質時改這個

# 本地原圖轉檔設定：演算法有改動時手動調整此版號。
WEBP_LOGIC_VERSION = "1"
WEBP_QUALITY = 90
WEBP_MAX_SIZE = MAX_SIZE
WEBP_RATIO = RATIO

BASE_URL = "https://azustock.github.io"
API_DIR = "api"
JS_SOURCE_PATH = "main.js"
HASH_CHUNK_SIZE = 1024 * 1024
HASH_HEX_LENGTH = 16
_UNSET = object()

# GitHub 遠端 Metadata 同步設定
GITHUB_API_BASE = "https://api.github.com"
GITHUB_API_TIMEOUT = 10
GITHUB_TOKEN_ENV_KEYS = ("GH_SYNC_TOKEN", "GH_TOKEN", "GITHUB_SYNC_TOKEN", "GITHUB_TOKEN")
GITHUB_LOCAL_SECRET_FILES = (".github_sync.json", "tools/.secrets.json")
GITHUB_DEFAULT_SYNC_FIELDS = ("version", "date")
GITHUB_REMOTE_JSON_RESERVED_KEYS = frozenset({"github", "order", "category", "cover", "groups"})

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

VALID_IMAGE_EXTS = frozenset({'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'})
VALID_MEDIA_EXTS = VALID_IMAGE_EXTS | frozenset({'.mp4', '.webm', '.ogg', '.mp3', '.wav', '.pdf'})
SYS_TAGS = frozenset({
    'MAJOR', 'HOTFIX', 'LATEST', 'FEATURE', 'NEW', 'UPDATED',
    'REFACTOR', 'PATCH', 'STABLE', 'ARCHIVED', 'WIP', 'OC', 'FANART',
})
META_FLAG_KEYS = ('pinned', 'new', 'updated', 'wip', 'archived', 'hidden', 'sensitive', 'required_key', 'lock_mode', 'key')

# 預編譯常用 Regex
RE_LANG_CODE = re.compile(r'[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*')
RE_DYNAMIC_TEXT = re.compile(r'\?\?\[(.*?)\](?:[ \t]*"([^"]+)")?\s*([\s\S]*?)\s*\?\?')
RE_FOLDER_META = re.compile(r'^(-?\d+)_+(.*)$')
RE_TAG_EXPIRE = re.compile(r'^(NEW|UPDATED|LATEST|FEATURE):(\d{4}[-/]\d{2}[-/]\d{2})$', re.IGNORECASE)
RE_DATE_STR = re.compile(r'^\d{4}[-/]\d{2}[-/]\d{2}$')
RE_MD_IMG = re.compile(r'!\[([^\]]*)\]\(([^)]+)\)')
RE_HTML_IMG = re.compile(r'(<img[^>]+src=["\'])([^"\']+)(["\'][^>]*>)')
RE_IMG_TITLE = re.compile(r'(.*?)\s+(["\'])(.*?)\2$')
RE_CLEAN_TAG = re.compile(r'^.*?\[(.*?)\]$')
RE_GITHUB_REPO_URL = re.compile(r'^https?://(?:www\.)?github\.com/([^/\s]+)/([^/\s#?]+?)(?:\.git)?/?$', re.IGNORECASE)
RE_VERSION_PREFIX = re.compile(r'^[vV](?=\d)')

SHARE_HTML_TEMPLATE = """<!DOCTYPE html>
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

# 單次建置期間的記憶體快取與狀態
_FILE_HASH_MEMO = {}
_IMG_DIM_MEMO = {}
_OG_BG_MEMO = {}
_OG_BG_LOCK = threading.Lock()
_GITHUB_API_MEMO = {}

valid_api_files = set()
stats = Counter()


# ==========================================
# 📦 延遲任務資料結構
# ==========================================
@dataclass
class ImageTask:
    fn: object
    args: tuple
    tag: str
    src: str
    dest: str
    context: str
    stat_prefix: str
    status: str


@dataclass
class ContentWriteTask:
    path: str
    raw_content: str
    replacements: list
    previous_content: Optional[str]
    article: dict
    force_overwrite: bool = False


@dataclass
class ShareHtmlTask:
    html_path: str
    title: str
    description: str
    target_url: str
    share_url: str
    og_local: Optional[str] = None
    og_url: Optional[str] = None
    fallback_local: Optional[str] = None
    fallback_url: Optional[str] = None
    group_owner: Optional[dict] = None
    group_id: Optional[str] = None
    proj_og_local: Optional[str] = None
    proj_cover_local: Optional[str] = None
    proj_img_base: Optional[str] = None
    project_title: object = _UNSET

    def render(self):
        if self.og_local and self.og_url:
            image_url = resolve_hashed_asset(self.og_local, self.og_url, self.fallback_local, self.fallback_url)
        else:
            group_og = (
                self.group_owner.get('groups', {}).get(self.group_id, {}).get('og_image')
                if self.group_owner and self.group_id else None
            )
            if group_og:
                image_url = group_og
            elif self.proj_cover_local:
                image_url = resolve_hashed_asset(
                    self.proj_og_local, self.proj_img_base,
                    self.proj_cover_local, f"{BASE_URL}/{quote(self.proj_cover_local, safe='/')}",
                )
            else:
                image_url = resolve_hashed_asset("assets/og.png", self.proj_img_base or f"{BASE_URL}/assets/og.png")
        title = clean_dynamic_text(self.title)
        if self.project_title is not _UNSET:
            title = f"{title} | {clean_dynamic_text(self.project_title)}"
        return SHARE_HTML_TEMPLATE.format(
            title=title,
            description=clean_dynamic_text(self.description),
            image=image_url,
            target_url=self.target_url,
            share_url=self.share_url,
        )


@dataclass
class BuildState:
    og_settings: dict = field(default_factory=lambda: {
        'size': OG_OUTPUT_SIZE, 'content_size': OG_CONTENT_SIZE, 'quality': OG_QUALITY,
    })
    img_tasks: list = field(default_factory=list)
    scheduled_dests: set = field(default_factory=set)
    scheduled_recipes: dict = field(default_factory=dict)
    deferred_meta_writes: list = field(default_factory=list)
    deferred_html_writes: list = field(default_factory=list)
    deferred_content_writes: list = field(default_factory=list)
    deferred_asset_bindings: list = field(default_factory=list)
    scan_failures: list = field(default_factory=list)

    def schedule_image(self, task: ImageTask):
        abs_dest = os.path.abspath(task.dest)
        recipe = (task.fn, repr((task.args[0], task.args[2:])))
        if abs_dest in self.scheduled_recipes and self.scheduled_recipes[abs_dest] != recipe:
            raise ValueError('不同來源或設定會覆寫同一產物：' + task.dest)
        self.scheduled_recipes[abs_dest] = recipe
        if abs_dest not in self.scheduled_dests:
            self.scheduled_dests.add(abs_dest)
            self.img_tasks.append(task)

    def register_image_asset(
        self, *, stat_prefix, fn, args, tag, src_path, dest_path, context,
        cache_dict, current_hashes, force_overwrite, dependencies=None, settings=None,
    ):
        """通用影像資產檢查、統計、排程與白名單註冊器"""
        stats[f"{stat_prefix}_total"] += 1
        source_id = source_identity(src_path)
        output_id = source_identity(dest_path)
        asset_key = f"asset:{source_id}->{output_id}"
        current_hashes.setdefault('_sources', {})[output_id] = {
            'source': source_id, 'folder': posixpath.dirname(source_id),
            'output': output_id, 'kind': stat_prefix,
        }
        status, file_hash = check_hash_status(
            src_path, dest_path, cache_dict, asset_key, force_overwrite,
            logic_version=IMAGE_LOGIC_VERSION, dependencies=dependencies, settings=settings,
        )
        current_hashes[asset_key] = file_hash
        needs_update = status in ('NEW', 'UPDATED')
        if needs_update:
            self.schedule_image(ImageTask(fn, args, tag, src_path, dest_path, context, stat_prefix, status))
        else:
            stats[f"{stat_prefix}_skipped"] += 1
        valid_api_files.add(os.path.abspath(dest_path))
        return needs_update


def convert_project_images(is_github_actions, overwrite_webp=False, target_folders=None):
    if is_github_actions:
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
# 🔗 GitHub 遠端儲存庫 Metadata 同步引擎
# ==========================================
def _get_github_token():
    """依序從環境變數與本地私密 JSON 檔取得 GitHub Token（環境變數優先，供 GitHub Actions 使用）"""
    for env_key in GITHUB_TOKEN_ENV_KEYS:
        token = os.getenv(env_key, "").strip()
        if token:
            return token

    for secret_path in GITHUB_LOCAL_SECRET_FILES:
        if not os.path.isfile(secret_path):
            continue
        try:
            with open(secret_path, "r", encoding="utf-8") as f:
                secret_data = json.load(f)
            if isinstance(secret_data, dict):
                for key in (*GITHUB_TOKEN_ENV_KEYS, "token"):
                    val = secret_data.get(key)
                    if isinstance(val, str) and val.strip():
                        return val.strip()
        except Exception as e:
            cout.warn(f"無法讀取本地私密設定檔 {secret_path}：{e}")
    return ""


def _parse_github_repo(repo_value, fallback_link=None):
    """解析 'owner/repo' 或 GitHub 網址為標準 'owner/repo' 字串"""
    for candidate in (repo_value, fallback_link):
        if not isinstance(candidate, str):
            continue
        text = candidate.strip()
        if not text:
            continue
        url_match = RE_GITHUB_REPO_URL.match(text)
        if url_match:
            return f"{url_match.group(1)}/{url_match.group(2)}"
        parts = [p for p in text.strip('/').split('/') if p]
        if len(parts) == 2 and all(parts):
            repo_name = parts[1][:-4] if parts[1].endswith('.git') else parts[1]
            return f"{parts[0]}/{repo_name}"
    return None


def _github_api_get(endpoint, *, raw=False, allow_404=False):
    """對 GitHub REST API 發送 GET 請求（含單次建置記憶體快取）"""
    cache_key = (endpoint, raw)
    if cache_key in _GITHUB_API_MEMO:
        cached = _GITHUB_API_MEMO[cache_key]
        if cached is None and not allow_404:
            raise RuntimeError(f"GitHub API 404 Not Found: {endpoint}")
        return cached

    url = f"{GITHUB_API_BASE}{endpoint}"
    headers = {
        "User-Agent": "Azustock-Site-Builder",
        "X-GitHub-Api-Version": "2022-11-28",
        "Accept": "application/vnd.github.raw+json" if raw else "application/vnd.github+json",
    }
    token = _get_github_token()
    if token:
        if not token.isascii():
            raise RuntimeError("GitHub Token 包含非 ASCII 字元，請確認已將範例文字替換為實際的 Token。")
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=GITHUB_API_TIMEOUT) as resp:
            payload = resp.read().decode("utf-8")
            result = json.loads(payload)
            _GITHUB_API_MEMO[cache_key] = result
            return result
    except urllib.error.HTTPError as e:
        if e.code == 404 and allow_404:
            _GITHUB_API_MEMO[cache_key] = None
            return None
        hint = "（若為 Private Repo，請確認環境變數 GH_SYNC_TOKEN 具備該儲存庫讀取權限）" if e.code in (401, 403, 404) else ""
        raise RuntimeError(f"HTTP {e.code} {e.reason}: {endpoint}{hint}") from e
    except (urllib.error.URLError, TimeoutError) as e:
        raise RuntimeError(f"連線失敗 ({endpoint}): {e}") from e
    except json.JSONDecodeError as e:
        raise RuntimeError(f"JSON 解析失敗 ({endpoint}): {e}") from e


def _iso_to_date_str(iso_text):
    if not isinstance(iso_text, str) or len(iso_text) < 10:
        return None
    date_part = iso_text[:10]
    return date_part if RE_DATE_STR.match(date_part) else None


def _merge_tags(local_tags, remote_tags, mode="merge"):
    clean_remote = [str(t).strip() for t in (remote_tags or []) if str(t).strip()]
    if mode == "replace":
        return clean_remote
    result = list(local_tags) if isinstance(local_tags, list) else []
    existing_lower = {str(t).split(':')[0].strip().lower() for t in result}
    for tag in clean_remote:
        if tag.lower() not in existing_lower:
            result.append(tag)
            existing_lower.add(tag.lower())
    return result


def sync_github_metadata(raw_data, context):
    """
    依 detail.json 內的 'github' 設定，從外部 GitHub 儲存庫同步 Metadata。
    同時支援：
      1. 遠端 JSON 檔模式（github.source_file，例如 'detail.json' 或 'meta.json'）
      2. GitHub REST API 模式（version / date / updated / description / tags）
    任何網路或權限錯誤皆自動降級為本地 detail.json 數值，不中斷建置。
    """
    gh_cfg = raw_data.get("github")
    if not gh_cfg:
        return raw_data, {}

    if isinstance(gh_cfg, str):
        gh_cfg = {"repo": gh_cfg}
    elif not isinstance(gh_cfg, dict):
        cout.warn(f"{context} 的 github 設定格式無效，已略過。")
        return raw_data, {}

    repo = _parse_github_repo(gh_cfg.get("repo"), fallback_link=raw_data.get("link"))
    if not repo:
        cout.warn(f"{context} 的 github.repo 無法解析，已略過遠端同步。")
        return raw_data, {}

    owner, repo_name = repo.split('/', 1)
    repo_api_base = f"/repos/{quote(owner, safe='')}/{quote(repo_name, safe='')}"
    branch = str(gh_cfg.get("branch") or "").strip() or None
    source_file = str(gh_cfg.get("source_file") or "").strip().lstrip('/') or None
    target_file = str(gh_cfg.get("file") or "").strip().lstrip('/') or None
    date_source = str(gh_cfg.get("date_source") or "release").strip().lower()
    tags_mode = str(gh_cfg.get("tags_mode") or "merge").strip().lower()

    explicit_sync = gh_cfg.get("sync")
    if isinstance(explicit_sync, list):
        sync_fields = [str(f).strip() for f in explicit_sync if str(f).strip()]
    elif source_file:
        sync_fields = None  # 未指定 sync 時，匯入遠端 JSON 內的所有安全欄位
    else:
        sync_fields = list(GITHUB_DEFAULT_SYNC_FIELDS)

    merged = dict(raw_data)
    synced = {}

    try:
        # 模式 A：從目標儲存庫讀取指定的遠端 JSON 檔
        if source_file:
            file_endpoint = f"{repo_api_base}/contents/{quote(source_file, safe='/')}"
            if branch:
                file_endpoint += f"?{urlencode({'ref': branch})}"
            remote_json = _github_api_get(file_endpoint, raw=True, allow_404=True)
            if remote_json is None:
                cout.warn(f"{context} 在 {repo} 找不到遠端檔案 '{source_file}'。")
            elif not isinstance(remote_json, dict):
                cout.warn(f"{context} 的遠端檔案 '{source_file}' 頂層不是 JSON 物件，已略過。")
            else:
                if sync_fields is None:
                    candidate_keys = [k for k in remote_json.keys() if k not in GITHUB_REMOTE_JSON_RESERVED_KEYS]
                else:
                    candidate_keys = [k for k in sync_fields if k in remote_json and k != "github"]

                for key in candidate_keys:
                    val = remote_json.get(key)
                    if val is None or val == "":
                        continue
                    if key == "tags" and isinstance(val, list):
                        merged["tags"] = _merge_tags(merged.get("tags"), val, mode=tags_mode)
                        synced["tags"] = merged["tags"]
                    elif key == "version":
                        clean_ver = RE_VERSION_PREFIX.sub('', str(val).strip())
                        merged["version"] = clean_ver
                        synced["version"] = clean_ver
                    else:
                        merged[key] = val
                        synced[key] = val

        # 模式 B：透過 GitHub REST API 補齊尚未由遠端 JSON 提供的欄位
        api_needed = set(sync_fields or []) - set(synced.keys())
        if api_needed:
            repo_info = None
            latest_release = _UNSET

            def get_repo_info():
                nonlocal repo_info
                if repo_info is None:
                    repo_info = _github_api_get(repo_api_base)
                return repo_info

            def get_latest_release():
                nonlocal latest_release
                if latest_release is _UNSET:
                    latest_release = _github_api_get(f"{repo_api_base}/releases/latest", allow_404=True)
                return latest_release

            if "version" in api_needed:
                rel = get_latest_release()
                raw_tag = rel.get("tag_name") if isinstance(rel, dict) else None
                if not raw_tag:
                    tags_resp = _github_api_get(f"{repo_api_base}/tags?per_page=1", allow_404=True)
                    if isinstance(tags_resp, list) and tags_resp:
                        raw_tag = tags_resp[0].get("name")
                if raw_tag:
                    clean_ver = RE_VERSION_PREFIX.sub('', str(raw_tag).strip())
                    merged["version"] = clean_ver
                    synced["version"] = clean_ver

            synced_date = synced.get("date")
            if ("date" in api_needed or "updated" in api_needed) and not synced_date:
                if target_file:
                    commit_params = {"path": target_file, "per_page": 1}
                    if branch:
                        commit_params["sha"] = branch
                    commits = _github_api_get(f"{repo_api_base}/commits?{urlencode(commit_params)}", allow_404=True)
                    if isinstance(commits, list) and commits:
                        commit_info = commits[0].get("commit", {})
                        iso = (commit_info.get("committer") or commit_info.get("author") or {}).get("date")
                        synced_date = _iso_to_date_str(iso)
                else:
                    if date_source != "push":
                        rel = get_latest_release()
                        if isinstance(rel, dict):
                            synced_date = _iso_to_date_str(rel.get("published_at") or rel.get("created_at"))
                    if not synced_date:
                        info = get_repo_info()
                        if isinstance(info, dict):
                            synced_date = _iso_to_date_str(info.get("pushed_at") or info.get("updated_at"))

            if "date" in api_needed and synced_date:
                merged["date"] = synced_date
                synced["date"] = synced_date

            if "updated" in api_needed and synced_date:
                merged["updated"] = synced_date
                synced["updated"] = synced_date

            if "description" in api_needed:
                info = get_repo_info()
                desc = (info.get("description") or "").strip() if isinstance(info, dict) else ""
                if desc:
                    merged["description"] = desc
                    synced["description"] = desc

            if "tags" in api_needed:
                info = get_repo_info()
                topics = info.get("topics") if isinstance(info, dict) else None
                if isinstance(topics, list) and topics:
                    merged["tags"] = _merge_tags(merged.get("tags"), topics, mode=tags_mode)
                    synced["tags"] = merged["tags"]

        if synced:
            summary = ", ".join(f"{k}={synced[k]}" for k in synced if k != "tags")
            if "tags" in synced:
                summary = f"{summary}, tags({len(synced['tags'])})" if summary else f"tags({len(synced['tags'])})"
            cout.action("GitHub 同步", f"{context} ← {repo} ({summary})", icon_key='refresh', color='cyan', tree=True)

    except Exception as error:
        cout.warn(f"GitHub 同步失敗 ({context} / {repo})，將沿用本地 detail.json：{error}")
        return raw_data, {}

    return merged, synced


# ==========================================
# 🛠️ 通用輔助與快取函式
# ==========================================
def parse_version(v_str):
    """將版本字串拆解為整數列表以供排序 (例如 'v1.10.2' -> [1, 10, 2])"""
    return [int(x) for x in re.findall(r'\d+', str(v_str))]


def safe_int(val, default=999):
    """安全轉換整數（支援負數字串如 '-1'）"""
    if isinstance(val, bool):
        return default
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def parse_folder_meta(folder_name):
    match = RE_FOLDER_META.match(folder_name)
    if match:
        return int(match.group(1)), match.group(2)
    return 999, folder_name


def register_api_id(identifier, source_dir, seen_ids):
    if identifier.strip() in ('', '.', '..'):
        raise ValueError(f"來源資料夾 {source_dir!r} 的 ID {identifier!r} 無法作為獨立的 API 目錄。")
    if identifier in seen_ids:
        raise ValueError(f"重複的 API ID {identifier!r} (路徑: {source_dir})，產物會互相覆寫。")
    seen_ids.add(identifier)


def load_detail_json(json_path, *, required=False):
    """讀取來源設定。可省略的設定檔不存在時，才使用預設值。"""
    try:
        with open(json_path, encoding='utf-8') as stream:
            data = json.load(stream)
    except FileNotFoundError:
        if required:
            raise
        return {}
    except ValueError as error:
        raise ValueError(f"無法解析 {json_path}：{error}") from error
    if not isinstance(data, dict):
        raise ValueError(f"{json_path} 的頂層必須是 JSON 物件")
    return data


def load_cache_json(json_path):
    try:
        return load_detail_json(json_path)
    except (OSError, ValueError) as error:
        cout.warn(f"將重新產生 {json_path}（{error}）")
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


def get_sort_direction(data, context, default='asc'):
    """解析 default_sort ('asc' / 'desc')，無效時警告並退回預設值。"""
    value = data.get('default_sort')
    if value is None or value == '':
        return default
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in ('asc', 'desc'):
            return normalized
    cout.warn(f"{context} 的 default_sort 無效，將使用預設值 '{default}'：{value!r}")
    return default


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
    """透過 Cout 印出圖片轉換前後的檔案大小、壓縮率與所屬專案/文章"""
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
    """將任意尺寸的圖片疊加到 1200x630 的背景圖中央，生成 OG 分享圖"""
    try:
        bg = _get_og_background(bg_path, OG_OUTPUT_SIZE)
        with Image.open(original_path) as raw_img:
            img = raw_img.convert("RGBA")

        max_w, max_h = OG_CONTENT_SIZE
        ratio = min(max_w / img.width, max_h / img.height)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

        x = (OG_OUTPUT_SIZE[0] - new_size[0]) // 2
        y = (OG_OUTPUT_SIZE[1] - new_size[1]) // 2
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


def get_tag_expire_days():
    """從 main.js 的 CONFIG 中動態抓取 TAG_EXPIRE_DAYS"""
    try:
        with open(JS_SOURCE_PATH, 'r', encoding='utf-8') as f:
            match = re.search(r'TAG_EXPIRE_DAYS:\s*(\d+)', f.read())
            if match:
                return int(match.group(1))
    except Exception as e:
        cout.warn(f"無法讀取 TAG_EXPIRE_DAYS，將使用預設值 14: {e}")
    return 14


# ==========================================
# 🗜️ 自動化壓縮與 index.html 單次輸出
# ==========================================
def render_release_homepage(latest_version):
    with open('index_local.html', encoding='utf-8') as stream:
        html = stream.read()
    html = re.sub(r'(\.(?:css|js)\?u=)[^"]+(")', lambda m: m[1] + str(latest_version) + m[2], html)
    html = re.sub(r'(<span id="sys-version"[^>]*>)[^<]+(</span>)', lambda m: m[1] + str(latest_version) + m[2], html)
    html = re.sub(r'<!--[\s\S]*?-->', '', html)
    html = re.sub(r'/\*[\s\S]*?\*/', '', html)
    html = re.sub(r'^\s*//.*$', '', html, flags=re.MULTILINE)
    return re.sub(r'\n\s*\n', '\n', html)


def minify_assets(latest_version=None):
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

        if latest_version and os.path.isfile('index_local.html'):
            source_html = 'index_local.html'
            html = render_release_homepage(latest_version)
        elif os.path.isfile('index.html'):
            source_html = 'index.html'
            with open(source_html, 'r', encoding='utf-8') as f:
                html = f.read()
        else:
            cout.skip("沒有可使用的正式首頁，略過首頁掛載。", indent=0)
            return

        html = re.sub(r'src="(\./)?main\.js([?"#])', r'src="\g<1>main.min.js\g<2>', html)
        html = re.sub(r'href="(\./)?style\.css([?"#])', r'href="\g<1>style.min.css\g<2>', html)

        for resource in ('main.min.js', 'style.min.css'):
            pattern = r'((?:src|href)=")((?:\./)?' + re.escape(resource) + r'(?:\?[^"#]*)?(?:#[^"]*)?)(")'
            html = re.sub(pattern, lambda m: m.group(1) + get_hash_url(resource, m.group(2)) + m.group(3), html)

        atomic_write('index.html', html, _FILE_HASH_MEMO)
        cout.action("網頁掛載成功", f"已從 {source_html} 輸出帶內容 Hash 的正式版 index.html。", color='green')

    except Exception as e:
        cout.warn(f"壓縮失敗: {e}")
        raise RuntimeError("資源壓縮失敗，停止發布版本清單。") from e


# ==========================================
# Hash 與路徑解析引擎
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
        raise OSError(f'計算 Hash 時檔案變動：{absolute}')
    if logic_version:
        digest.update(b'\0' + logic_version.encode('utf-8'))
    result = digest.hexdigest()[:HASH_HEX_LENGTH]
    _FILE_HASH_MEMO[key] = result
    return result


def get_hash_url(local_path, base_url):
    return with_version_hash(base_url, get_file_hash(local_path))


def with_version_hash(base_url, version):
    if not version:
        return base_url
    parts = urlsplit(base_url)
    query = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True) if k != 'v']
    query.append(('v', version))
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def source_identity(path):
    """使用跨 Windows／CI 一致的專案根目錄相對路徑。"""
    try:
        return os.path.relpath(os.path.abspath(path), os.getcwd()).replace('\\', '/')
    except ValueError:
        return os.path.abspath(path).replace('\\', '/')


def thumbnail_name(source, base_dir, prefix='thumb'):
    """回傳縮圖相對路徑；資料夾區分來源與副檔名，實體檔名保持 XXX.webp。"""
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
                      logic_version=_UNSET, dependencies=None, settings=None):
    # 舊位置參數為 (dependencies, settings)，新版可指定 logic_version。
    if logic_version is None:
        if isinstance(dependencies, dict) and settings is None:
            settings, dependencies = dependencies, None
        logic_version = _UNSET
    elif logic_version is not _UNSET and not isinstance(logic_version, str):
        if dependencies is not None and settings is None:
            settings = dependencies
        dependencies, logic_version = logic_version, _UNSET
    if logic_version is _UNSET:
        filename = os.fspath(target_path)
        if filename.endswith('contents.json'):
            logic_version = API_LOGIC_VERSION
        elif filename.endswith('index.html'):
            logic_version = HTML_LOGIC_VERSION
        else:
            logic_version = IMAGE_LOGIC_VERSION
    current_hash = signature(source_path, dependencies, settings, logic_version, get_file_hash)
    if not os.path.isfile(target_path):
        return 'NEW', current_hash
    if force_overwrite or old_hash_dict.get(key) != current_hash:
        return 'UPDATED', current_hash
    return 'SKIPPED', current_hash


# ==========================================
# ⏰ 時間戳過期偵測引擎
# ==========================================
def check_expiration_reminders(item_title, item_type, data_dict, detail_path, days=None):
    """檢查 JSON 內的日期標籤或屬性是否過期，並交由 Cout 收集提醒"""
    if days is None:
        days = get_tag_expire_days()
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
                            filepath=detail_path, color='yellow', icon_key='expired',
                        )
                except ValueError:
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
                            filepath=detail_path, color='green', icon_key='unlock',
                        )
                elif now - dt > expire_delta:
                    cout.collect_reminder(
                        "狀態過期", f"{item_type} '{item_title}' 的 '{key}: {val}' 已過 {days} 天。",
                        filepath=detail_path, color='yellow', icon_key='expired',
                    )
            except ValueError:
                pass


def update_data_version():
    """計算各獨立項目的 Hash，並寫入 data_version.json"""
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
        "style.min.css": get_file_hash("style.min.css"),
    }

    old_versions = load_cache_json('data_version.json')
    changed_items = [k for k, v in items.items() if old_versions.get(k) != v]

    if changed_items:
        cout.info(f"偵測到以下項目內容變更: {cout.styled(', '.join(changed_items), 'bold', 'yellow')}", icon_key='refresh')
    else:
        cout.skip("內容無任何變更，維持現有快取。", indent=0)

    if not items['projects']:
        raise FileNotFoundError('all_projects.json 尚未成功生成，停止發布版本清單。')

    encoded = json.dumps(items, ensure_ascii=False, sort_keys=True, indent=2)
    atomic_write('data_version.json', encoded, _FILE_HASH_MEMO)
    return changed_items


# ==========================================
# 📝 系統日誌與版本同步器
# ==========================================
def collect_log_entries(base_dir='logs'):
    entries = []
    for folder, _, files in os.walk(base_dir):
        if 'detail.json' in files:
            path = os.path.join(folder, 'detail.json')
            detail = load_detail_json(path, required=True)
            version = detail.get('version', os.path.basename(folder))
            if isinstance(version, bool):
                raise ValueError(f"{path} 的 version 不能是布林值")
            entries.append((folder, version, detail))
    entries.sort(key=lambda entry: parse_version(entry[1]), reverse=True)
    latest = next((version for _, version, detail in entries if not detail.get('no_track')), None)
    return entries, latest


def generate_changelogs_json():
    """打包系統日誌 (changelogs.json)，並回傳最新追蹤版號"""
    cout.stage("版本紀錄", "開始打包系統日誌 (Changelog)...", icon_key='stage')

    base_dir = 'logs'
    output_data = []

    if not os.path.exists(base_dir):
        os.makedirs(base_dir, exist_ok=True)
        cout.info(f"已自動建立 '{base_dir}' 資料夾。", icon_key='folder')
        return None

    entries, latest = collect_log_entries(base_dir)
    for folder_path, version, detail in entries:
        version_folder = os.path.basename(folder_path)

        if 'version' in detail and detail['version'] != version_folder:
            cout.action(
                "版本覆寫提示", f"日誌目錄 '{version_folder}' 與內部版號 (同對外版號) '{detail['version']}' 不一致。",
                icon_key='pin', color='yellow', tree=False, indent=1,
            )

        if detail.get('no_track'):
            cout.skip(f"略過不追蹤版本: {version}", indent=1)

        if str(version).count('.') >= 3 or str(version_folder).count('.') >= 3 or detail.get('hidden', False):
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
                "id": version_folder,
                "version": version,
                "date": detail.get('date', "2026-01-01"),
                "status": detail.get('status', "UPDATE"),
                "description": detail.get('description', "系統更新與優化記錄。"),
                "content": content,
            })

    atomic_write('changelogs.json', json.dumps(output_data, ensure_ascii=False, indent=2), _FILE_HASH_MEMO)
    cout.success(f"升級版版本日誌 (Changelog) 打包完成，共發布 {len(output_data)} 筆紀錄。")

    return latest


def generate_version_json(latest_version=_UNSET, is_github_actions=False, *, precomputed_latest=_UNSET):
    """同步版號。舊介面可省略版號或以 CI 布林值作為第一個參數。"""
    cout.stage("系統設定", "開始同步全站版號...", icon_key='config')
    legacy_call = latest_version is _UNSET or isinstance(latest_version, bool)
    if isinstance(latest_version, bool):
        ci_flag = latest_version
        latest_version = _UNSET if isinstance(is_github_actions, bool) else is_github_actions
        is_github_actions = ci_flag
    if precomputed_latest is not _UNSET:
        if latest_version is not _UNSET:
            raise TypeError("請只提供一個版號")
        latest_version = precomputed_latest
    if latest_version is _UNSET:
        _, latest_version = collect_log_entries()
    if isinstance(latest_version, bool):
        raise ValueError("版號不能是布林值")
    if not latest_version:
        cout.warn('找不到任何有效的版號！')
        return

    try:
        atomic_write('version.json', json.dumps({"version": latest_version}, indent=2), _FILE_HASH_MEMO)
        cout.success(f"成功提取最新系統版號 ({latest_version}) 並寫入 version.json")

        if os.path.isfile(JS_SOURCE_PATH):
            with open(JS_SOURCE_PATH, 'r', encoding='utf-8') as f:
                js_content = f.read()

            new_js_content = re.sub(r'(VERSION:\s*")[^"]+(")', rf'\g<1>{latest_version}\g<2>', js_content, count=1)
            if is_github_actions:
                new_js_content = re.sub(r'(DEBUG_FETCH_DELAY:\s*)\d+', r'\g<1>0', new_js_content, count=1)

            if js_content != new_js_content:
                atomic_write(JS_SOURCE_PATH, new_js_content, _FILE_HASH_MEMO)
                mode_note = "並自動關閉 DEBUG_FETCH_DELAY" if is_github_actions else "(本地開發模式，保留 DEBUG 設定)"
                cout.success(f"成功將 {JS_SOURCE_PATH} 同步更新為 {latest_version} {mode_note}")
            else:
                cout.skip(f"{JS_SOURCE_PATH} 設定已是最新，無須修改。", indent=0)
        else:
            cout.warn("找不到 main.js 檔案，無法更新前端系統版本！")
        if legacy_call and os.path.isfile('index_local.html'):
            atomic_write('index.html', render_release_homepage(latest_version), _FILE_HASH_MEMO)
    except Exception as e:
        cout.warn(f"系統版本號同步失敗: {e}")


# ==========================================
# 🚀 影像任務執行器
# ==========================================
def _execute_img_task(task: ImageTask):
    temporary = None
    try:
        directory = os.path.dirname(os.path.abspath(task.dest))
        os.makedirs(directory, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=directory, prefix='.image-build-', suffix='.webp', delete=False) as stream:
            temporary = stream.name
        staged_args = list(task.args)
        staged_args[1] = temporary
        ok = task.fn(*staged_args)
        if not ok or not os.path.isfile(temporary) or not os.path.getsize(temporary):
            raise OSError('影像任務未成功生成檔案')
        with Image.open(temporary, formats=('WEBP',)) as image:
            image.load()
        try:
            mode = os.stat(task.dest).st_mode & 0o777
        except FileNotFoundError:
            mode = 0o644
        os.chmod(temporary, mode)
        os.replace(temporary, task.dest)
        temporary = None
        invalidate(task.dest, _FILE_HASH_MEMO, _IMG_DIM_MEMO)
        return True, task
    except Exception as error:
        cout.warn(f'影像任務失敗 {task.src} → {task.dest}: {error}')
        return False, task
    finally:
        if temporary is not None and os.path.exists(temporary):
            os.unlink(temporary)


def run_image_tasks(img_tasks):
    """平行處理一般圖片任務，並於主執行緒依序處理 PyMuPDF 任務"""
    if not img_tasks:
        return

    image_failures = []

    def record_result(ok, task: ImageTask):
        if ok:
            print_conversion(task.tag, task.src, task.dest, context=task.context)
            stats[f"{task.stat_prefix}_{'new' if task.status == 'NEW' else 'updated'}"] += 1
        else:
            image_failures.append(task.dest)
            stats[f"{task.stat_prefix}_skipped"] += 1

    parallel_tasks = [t for t in img_tasks if t.fn is not generate_pdf_thumbnail]
    pdf_tasks = [t for t in img_tasks if t.fn is generate_pdf_thumbnail]

    if parallel_tasks:
        max_workers = min(32, (os.cpu_count() or 4) + 4)
        cout.info(f"啟動多執行緒平行渲染 ({len(parallel_tasks)} 項影像任務, {max_workers} 執行緒)...", icon_key='rocket')
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(_execute_img_task, t) for t in parallel_tasks]
            for future in as_completed(futures):
                record_result(*future.result())

    for task in pdf_tasks:
        record_result(*_execute_img_task(task))

    if image_failures:
        raise RuntimeError('影像生成失敗，快取紀錄與資料庫尚未提交：' + ', '.join(image_failures))


# ==========================================
# 📄 單篇文章解析與排程
# ==========================================
def process_article(
    *, state: BuildState, item_path, proj_path, proj_folder, proj_id, proj_title, proj_desc,
    proj_detail_path, proj_api_dir, proj_api_url, proj_data, proj_og_local_path, local_proj_cover,
    proj_img_base, bg_image_path, proj_needs_update, seen_art_ids,
    p_overwrite_json, p_overwrite_og, p_overwrite_thumb, overwrite_pdf_thumb,
    is_proj_targeted, target_folders, expire_days,
):
    item = os.path.basename(item_path)
    art_detail_path = os.path.join(item_path, 'detail.json')
    md_file_path = None

    try:
        sub_data = load_detail_json(art_detail_path, required=True)
        sub_data, art_github_synced = sync_github_metadata(sub_data, f"文章 {proj_folder}/{item}")
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

        check_expiration_reminders(meta_title, "文章", sub_data, art_detail_path, expire_days)

        rel_base = item_path.replace(os.sep, '/')
        for sub_item in os.listdir(item_path):
            if sub_item.endswith('.md'):
                md_file_path = os.path.join(item_path, sub_item)
            elif not has_explicit_cover and sub_item.lower() in ('basic.webp', 'architecture.webp'):
                meta_cover = sub_item

        if not md_file_path:
            return None

        stats["art_total"] += 1
        art_id = clean_art_title
        register_api_id(art_id, item_path, seen_art_ids)
        art_dir = os.path.join(proj_api_dir, art_id)
        art_api_url = f"{proj_api_url}/{quote(art_id, safe='')}"
        os.makedirs(art_dir, exist_ok=True)

        content_filename = "contents.json"
        content_filepath = os.path.join(art_dir, content_filename)
        article_meta_path = os.path.join(art_dir, 'meta.json')
        previous_document = load_cache_json(content_filepath)
        art_cache = load_cache_json(article_meta_path)
        current_hashes = {'_source_dir': source_identity(item_path)}
        art_needs_update = False

        with open(md_file_path, 'r', encoding='utf-8') as md_file:
            raw_md_content = md_file.read()

        if sub_data.get('title') is None and raw_md_content.startswith('# '):
            meta_title = raw_md_content.split('\n', 1)[0].replace('# ', '').strip()

        real_path = f"./{rel_base}/"
        pending_replacements = []

        def register_inline_image(local_img_path, orig_url, token_prefix):
            nonlocal art_needs_update
            thumb_dir = os.path.join(art_dir, "thumbnails")
            os.makedirs(thumb_dir, exist_ok=True)
            thumb_filename = thumbnail_name(local_img_path, item_path)
            thumb_local_path = os.path.join(thumb_dir, thumb_filename)

            if state.register_image_asset(
                stat_prefix="inline_thumb", fn=generate_cover_thumbnail,
                args=(local_img_path, thumb_local_path, *IMAGE_PROFILES['inline_thumb']),
                tag="🖼️ [內文縮圖]", src_path=local_img_path, dest_path=thumb_local_path,
                context=f"{proj_id} / {art_id}", cache_dict=art_cache, current_hashes=current_hashes,
                force_overwrite=a_overwrite_thumb, settings={'profile': IMAGE_PROFILES['inline_thumb']},
            ):
                art_needs_update = True

            orig_url_t = get_hash_url(local_img_path, orig_url)
            dims = get_image_dimensions(local_img_path)
            base_thumb_url = f"./{art_api_url}/thumbnails/{quote(thumb_filename, safe='/')}"
            token = f"__{token_prefix}_{len(pending_replacements)}__"
            pending_replacements.append((token, lambda t_p=thumb_local_path, b_u=base_thumb_url: get_hash_url(t_p, b_u)))
            return token, orig_url_t, dims

        def replace_md_img(match):
            nonlocal art_needs_update
            alt_text, url_part = match.group(1), match.group(2).strip()
            title_match = RE_IMG_TITLE.search(url_part)
            if title_match:
                url = title_match.group(1)
                title_str = f' {title_match.group(2)}{title_match.group(3)}{title_match.group(2)}'
            else:
                url, title_str = url_part, ""

            local_main_path, fixed_url = resolve_media_reference(url, real_path)
            if local_main_path is None:
                return f"![{alt_text}]({url_part})"

            ext = os.path.splitext(local_main_path)[1].lower()
            if ext not in VALID_MEDIA_EXTS:
                return f"![{alt_text}]({fixed_url}{title_str})"

            parts = fixed_url.split('#')
            main_url = parts[0]
            stamped_parts = []
            poster_ar_str = ""

            for part_index, part in enumerate(parts):
                if part.startswith('poster='):
                    poster_path, poster_url = resolve_media_reference(part[7:], real_path)
                    stamped_parts.append(f"poster={get_hash_url(poster_path, poster_url) if poster_path else poster_url}")
                    dims = get_image_dimensions(poster_path)
                    if dims:
                        poster_ar_str = f"&w={dims[0]}&h={dims[1]}"
                elif part.startswith('full='):
                    full_path, full_url = resolve_media_reference(part[5:], real_path)
                    stamped_parts.append(f"full={get_hash_url(full_path, full_url) if full_path else full_url}")
                else:
                    stamped_parts.append(get_hash_url(local_main_path, part) if part_index == 0 else part)

            final_stamped_url = '#'.join(stamped_parts)

            if ext in VALID_IMAGE_EXTS and os.path.exists(local_main_path):
                token, orig_url_t, dims = register_inline_image(local_main_path, main_url, "THUMB_URL")
                ar_str = f"&w={dims[0]}&h={dims[1]}" if dims else ""
                if '#full=' in final_stamped_url:
                    return f"![{alt_text}]({token}#{final_stamped_url.split('#', 1)[1]}{ar_str}{title_str})"
                return f"![{alt_text}]({token}#full={orig_url_t}{ar_str}{title_str})"

            if ext == '.pdf' and os.path.exists(local_main_path):
                if '#poster=' not in final_stamped_url:
                    thumb_dir = os.path.join(art_dir, "thumbnails")
                    os.makedirs(thumb_dir, exist_ok=True)
                    thumb_filename = thumbnail_name(local_main_path, item_path)
                    thumb_local_path = os.path.join(thumb_dir, thumb_filename)

                    if state.register_image_asset(
                        stat_prefix="pdf_thumb", fn=generate_pdf_thumbnail,
                        args=(local_main_path, thumb_local_path, *IMAGE_PROFILES['pdf_thumb']),
                        tag="📄 [PDF縮圖]", src_path=local_main_path, dest_path=thumb_local_path,
                        context=f"{proj_id} / {art_id}", cache_dict=art_cache, current_hashes=current_hashes,
                        force_overwrite=a_overwrite_pdf,
                        settings={
                            'profile': IMAGE_PROFILES['pdf_thumb'],
                            'render_scale': PDF_RENDER_SCALE,
                            'oversample': PDF_RENDER_OVERSAMPLE,
                            'strategy': PDF_RENDER_STRATEGY,
                        },
                    ):
                        art_needs_update = True

                    base_thumb_url = f"./{art_api_url}/thumbnails/{quote(thumb_filename, safe='/')}"
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

            return f"![{alt_text}]({final_stamped_url}{poster_ar_str}{title_str})"

        def replace_html_img(match):
            try:
                prefix, url, suffix = match.group(1), match.group(2), match.group(3)
                local_img_path, orig_url = resolve_media_reference(url, real_path)
                if local_img_path is None:
                    return match.group(0)

                if os.path.splitext(local_img_path)[1].lower() not in VALID_IMAGE_EXTS:
                    return f"{prefix}{orig_url}{suffix}"

                if os.path.exists(local_img_path):
                    token, orig_url_t, dims = register_inline_image(local_img_path, orig_url, "HTML_THUMB")
                    size_attrs = f' width="{dims[0]}" height="{dims[1]}" style="aspect-ratio: {dims[0]}/{dims[1]};"' if dims else ""
                    closing_quote = prefix[-1]
                    return f'{prefix}{token}{closing_quote} data-full="{orig_url_t}"{size_attrs}{suffix[1:]}'

                return f"{prefix}{url}{suffix}"
            except Exception as inner_e:
                cout.warn(f"HTML 圖片替換發生錯誤 ({url}): {inner_e}", indent=2)
                return match.group(0)

        content = RE_MD_IMG.sub(replace_md_img, raw_md_content)
        content = RE_HTML_IMG.sub(replace_html_img, content)

        stats["json_total"] += 1
        json_status, md_hash = check_hash_status(
            md_file_path, content_filepath, art_cache, 'md_source', a_overwrite_json,
            logic_version=API_LOGIC_VERSION,
        )
        current_hashes['md_source'] = md_hash
        if json_status in ('NEW', 'UPDATED'):
            art_needs_update = True

        art_title = meta_title
        art_desc = meta_desc if meta_desc else proj_desc
        og_local_path = os.path.join(art_dir, "og.webp")

        art_group = sub_data.get('group')
        if not art_group and 'groups' in proj_data:
            art_group = next((gid for gid, ginfo in proj_data['groups'].items() if ginfo.get('default')), None)

        local_cover_path = os.path.join(item_path, meta_cover) if meta_cover else None
        art_thumb_filename = "cover_thumb.webp"
        art_thumb_local_path = os.path.join(art_dir, art_thumb_filename)

        if meta_cover:
            art_bg_image_path = os.path.join("assets", "og.png")
            if state.register_image_asset(
                stat_prefix="og", fn=create_og_image,
                args=(local_cover_path, og_local_path, art_bg_image_path),
                tag="🖼️ [文章OG圖]", src_path=local_cover_path, dest_path=og_local_path,
                context=f"{proj_id} / {art_id}", cache_dict=art_cache, current_hashes=current_hashes,
                force_overwrite=a_overwrite_og, dependencies=[art_bg_image_path], settings=state.og_settings,
            ):
                art_needs_update = True

            if state.register_image_asset(
                stat_prefix="thumb", fn=generate_cover_thumbnail,
                args=(local_cover_path, art_thumb_local_path, *IMAGE_PROFILES['article_thumb']),
                tag="🖼️ [文章縮圖]", src_path=local_cover_path, dest_path=art_thumb_local_path,
                context=f"{proj_id} / {art_id}", cache_dict=art_cache, current_hashes=current_hashes,
                force_overwrite=a_overwrite_thumb, settings={'profile': IMAGE_PROFILES['article_thumb']},
            ):
                art_needs_update = True

        grp_cover_dep = None
        if art_group and 'groups' in proj_data:
            g_cov_rel = proj_data['groups'].get(art_group, {}).get('cover')
            if g_cov_rel:
                grp_cover_dep = os.path.normpath(os.path.join(proj_path, g_cov_rel))

        art_html_path = os.path.join(art_dir, "index.html")
        art_html_settings = {'template': SHARE_HTML_TEMPLATE, 'base_url': BASE_URL}
        if art_github_synced:
            art_html_settings['github_sync'] = art_github_synced
        art_html_status, art_detail_hash = check_hash_status(
            art_detail_path, art_html_path, art_cache, 'art_detail', a_overwrite_json,
            logic_version=HTML_LOGIC_VERSION,
            dependencies=[md_file_path, proj_detail_path, local_cover_path, grp_cover_dep, local_proj_cover, bg_image_path, 'assets/og.png'],
            settings=art_html_settings,
        )
        current_hashes['art_detail'] = art_detail_hash

        if art_html_status in ('NEW', 'UPDATED') or art_needs_update or proj_needs_update:
            art_needs_update = True
            state.deferred_html_writes.append(ShareHtmlTask(
                html_path=art_html_path,
                title=art_title,
                project_title=proj_title,
                description=art_desc,
                target_url="/?" + urlencode({'p': proj_id, 'a': art_id}),
                share_url=f"{BASE_URL}/{art_api_url}/index.html",
                og_local=og_local_path if meta_cover else None,
                og_url=f"{BASE_URL}/{art_api_url}/og.webp" if meta_cover else None,
                fallback_local=local_cover_path,
                fallback_url=f"{BASE_URL}/{quote(f'{rel_base}/{meta_cover}', safe='/')}" if meta_cover else None,
                group_owner=proj_data,
                group_id=art_group,
                proj_og_local=proj_og_local_path,
                proj_cover_local=local_proj_cover,
                proj_img_base=proj_img_base,
            ))
            stats[f"art_{'new' if art_html_status == 'NEW' else 'updated'}"] += 1
        else:
            stats["art_skipped"] += 1

        valid_api_files.add(os.path.abspath(art_html_path))
        valid_api_files.add(os.path.abspath(article_meta_path))
        valid_api_files.add(os.path.abspath(content_filepath))

        if art_needs_update or current_hashes != art_cache or not os.path.isfile(article_meta_path):
            state.deferred_meta_writes.append((article_meta_path, current_hashes))

        article_obj = {
            "id": art_id,
            "sort_order": meta_order,
            "title": meta_title,
            "content_path": f"./{art_api_url}/{content_filename}",
        }
        state.deferred_content_writes.append(ContentWriteTask(
            content_filepath, content, pending_replacements, previous_document.get('content'),
            article_obj, force_overwrite=a_overwrite_json,
        ))

        article_lang = get_content_language(sub_data, f"文章 {proj_folder}/{item}")
        if article_lang:
            article_obj['lang'] = article_lang
        if sub_data.get('min_sys_version'):
            article_obj["min_sys_version"] = str(sub_data['min_sys_version'])
        if sub_data.get('version'):
            article_obj["version"] = str(sub_data['version'])
        if meta_desc:
            article_obj["description"] = meta_desc
        if meta_cover:
            state.deferred_asset_bindings.append((
                article_obj, 'cover_image',
                lambda t_l=art_thumb_local_path, t_u=f"./{art_api_url}/{art_thumb_filename}",
                       l_c=local_cover_path, r_c=quote(f"{rel_base}/{meta_cover}", safe='/'):
                    resolve_hashed_asset(t_l, t_u, l_c, r_c),
            ))
        if sub_data.get('date'):
            article_obj["date"] = sub_data['date']

        apply_normalized_meta(sub_data, article_obj)

        if 'groups' in proj_data and art_group:
            article_obj['group'] = art_group

        return article_obj
    except Exception as e:
        failed_target = md_file_path or art_detail_path
        state.scan_failures.append(f"{failed_target}: {e}")
        cout.warn(f"處理文章失敗 {failed_target}: {e}")
        return None


# ==========================================
# 🚀 主生成器邏輯
# ==========================================
def generate_projects_json(
    overwrite_json=False, overwrite_og=False, overwrite_thumb=False,
    overwrite_pdf_thumb=False, target_folders=None, expire_days=None,
):
    base_dir = 'projects'
    cat_folders = sorted(os.listdir(base_dir))
    target_folders = target_folders or set()
    if expire_days is None:
        expire_days = get_tag_expire_days()

    _FILE_HASH_MEMO.clear()
    _IMG_DIM_MEMO.clear()
    _GITHUB_API_MEMO.clear()
    with _OG_BG_LOCK:
        for image in _OG_BG_MEMO.values():
            image.close()
        _OG_BG_MEMO.clear()
    stats.clear()
    valid_api_files.clear()

    os.makedirs(API_DIR, exist_ok=True)
    output_data = {"categories": [], "projects": []}
    state = BuildState()
    seen_proj_ids = set()
    proj_has_order = {}
    bg_image_path = os.path.join("assets", "og_base.png")

    def raise_scan_error(error):
        raise error

    # 1. 掃描大分類 (Categories)
    for cat_folder in cat_folders:
        cat_path = os.path.join(base_dir, cat_folder)
        if not os.path.isdir(cat_path):
            continue

        default_order, clean_title = parse_folder_meta(cat_folder)
        cat_data = load_detail_json(os.path.join(cat_path, 'detail.json'))
        cat_cover = cat_data.get('cover')

        cat_cover_url = None
        if cat_cover:
            literal_path = os.path.join(cat_path, cat_cover)
            if not os.path.isabs(cat_cover) and os.path.isfile(literal_path):
                cat_cover = quote(literal_path.replace(os.sep, '/'), safe='/')
            cat_cover_path, cover_url = resolve_media_reference(cat_cover, cat_path)
            if cover_url.startswith('./'):
                cover_url = cover_url[2:]
            cat_cover_url = get_hash_url(cat_cover_path, cover_url)

        cat_default_sort = get_sort_direction(cat_data, f"分類 {cat_folder}", default='asc')
        output_data["categories"].append({
            "order": cat_data.get('order', default_order),
            "id": cat_folder,
            "title": cat_data.get('title', clean_title),
            "meta": cat_data.get('meta', ''),
            "description": cat_data.get('description', ''),
            "watermark_url": cat_data.get('watermark_url', ''),
            "cover_image": cat_cover_url,
            "default_sort": cat_default_sort,
        })

        # 2. 掃描分類底下的專案 (Projects)
        proj_folders = []
        for root, dirs, files in os.walk(cat_path, onerror=raise_scan_error):
            if 'articles' in dirs:
                dirs.remove('articles')
            if 'detail.json' in files and root != cat_path:
                proj_folders.append(root)

        for proj_path in sorted(proj_folders):
            proj_folder = os.path.basename(proj_path)
            stats["proj_total"] += 1
            proj_detail_path = os.path.join(proj_path, 'detail.json')
            raw_proj_data = load_detail_json(proj_detail_path, required=True)
            raw_proj_data, proj_github_synced = sync_github_metadata(raw_proj_data, f"專案 {proj_folder}")
            default_proj_order, clean_proj_title = parse_folder_meta(proj_folder)

            is_proj_targeted = bool(target_folders and (proj_folder in target_folders or clean_proj_title in target_folders))
            p_overwrite_json = overwrite_json or is_proj_targeted
            p_overwrite_og = overwrite_og or is_proj_targeted
            p_overwrite_thumb = overwrite_thumb or is_proj_targeted

            check_expiration_reminders(raw_proj_data.get('title', clean_proj_title), "專案", raw_proj_data, proj_detail_path, expire_days)

            proj_id = clean_proj_title
            register_api_id(proj_id, proj_path, seen_proj_ids)

            raw_proj_order = raw_proj_data.get('order')
            explicit_proj_order = safe_int(raw_proj_order, None) if raw_proj_order is not None else None
            has_prefix_order = RE_FOLDER_META.match(proj_folder) is not None
            proj_has_order[proj_id] = explicit_proj_order is not None or has_prefix_order
            final_proj_order = explicit_proj_order if explicit_proj_order is not None else default_proj_order

            proj_data = {
                'id': proj_id,
                'category': cat_folder,
                'title': raw_proj_data.get('title', clean_proj_title),
                'order': final_proj_order,
                'default_sort': get_sort_direction(raw_proj_data, f"專案 {proj_folder}", default='desc'),
            }

            project_lang = get_content_language(raw_proj_data, f"專案 {proj_folder}")
            if project_lang:
                proj_data['lang'] = project_lang
            for key in ('min_sys_version', 'meta', 'description', 'date', 'version', 'link'):
                value = raw_proj_data.get(key)
                if value:
                    proj_data[key] = str(value) if key in ('min_sys_version', 'version') else value

            apply_normalized_meta(raw_proj_data, proj_data)

            proj_title = proj_data['title']
            proj_desc = raw_proj_data.get('description', '查看專案內容')
            proj_api_dir = os.path.join(API_DIR, proj_id)
            proj_api_url = f"api/{quote(proj_id, safe='')}"
            os.makedirs(proj_api_dir, exist_ok=True)

            proj_meta_path = os.path.join(proj_api_dir, "meta.json")
            proj_cache = load_cache_json(proj_meta_path)
            current_proj_hashes = {'_source_dir': source_identity(proj_path)}
            proj_needs_update = False

            # 群組縮圖與群組 OG 圖
            if raw_proj_data.get('groups'):
                processed_groups = {}
                for g_id, g_info in raw_proj_data['groups'].items():
                    group_obj = dict(g_info)
                    g_cover = g_info.get('cover')
                    if g_cover:
                        g_cover_local_path = os.path.normpath(os.path.join(proj_path, g_cover))
                        if os.path.exists(g_cover_local_path):
                            thumb_dir = os.path.join(proj_api_dir, "thumbnails")
                            os.makedirs(thumb_dir, exist_ok=True)

                            thumb_filename = thumbnail_name(g_cover_local_path, proj_path, 'group_thumb')
                            thumb_local_path = os.path.join(thumb_dir, thumb_filename)
                            if state.register_image_asset(
                                stat_prefix="group_thumb", fn=generate_cover_thumbnail,
                                args=(g_cover_local_path, thumb_local_path, *IMAGE_PROFILES['group_thumb']),
                                tag="🖼️ [群組縮圖]", src_path=g_cover_local_path, dest_path=thumb_local_path,
                                context=f"{proj_id} / {g_id}", cache_dict=proj_cache, current_hashes=current_proj_hashes,
                                force_overwrite=p_overwrite_thumb, settings={'profile': IMAGE_PROFILES['group_thumb']},
                            ):
                                proj_needs_update = True
                            state.deferred_asset_bindings.append((
                                group_obj, 'cover_image',
                                lambda p=thumb_local_path, u=f"./{proj_api_url}/thumbnails/{quote(thumb_filename, safe='/')}":
                                    get_hash_url(p, u),
                            ))

                            og_filename = thumbnail_name(g_cover_local_path, proj_path, 'group_og')
                            og_local_path = os.path.join(proj_api_dir, og_filename)
                            if state.register_image_asset(
                                stat_prefix="group_og", fn=create_og_image,
                                args=(g_cover_local_path, og_local_path, bg_image_path),
                                tag="🖼️ [群組OG圖]", src_path=g_cover_local_path, dest_path=og_local_path,
                                context=f"{proj_id} / {g_id}", cache_dict=proj_cache, current_hashes=current_proj_hashes,
                                force_overwrite=p_overwrite_og, dependencies=[bg_image_path], settings=state.og_settings,
                            ):
                                proj_needs_update = True
                            state.deferred_asset_bindings.append((
                                group_obj, 'og_image',
                                lambda p=og_local_path, u=f"{BASE_URL}/{proj_api_url}/{quote(og_filename, safe='/')}":
                                    get_hash_url(p, u),
                            ))

                    processed_groups[g_id] = group_obj
                proj_data['groups'] = processed_groups

            proj_cover = raw_proj_data.get('cover')
            local_proj_cover = f"{proj_path.replace(os.sep, '/')}/{proj_cover}" if proj_cover else None
            proj_og_local_path = os.path.join(proj_api_dir, "og.webp")

            if local_proj_cover:
                proj_data['cover_image'] = local_proj_cover
                if state.register_image_asset(
                    stat_prefix="og", fn=create_og_image,
                    args=(local_proj_cover, proj_og_local_path, bg_image_path),
                    tag="🖼️ [專案OG圖]", src_path=local_proj_cover, dest_path=proj_og_local_path,
                    context=proj_title, cache_dict=proj_cache, current_hashes=current_proj_hashes,
                    force_overwrite=p_overwrite_og, dependencies=[bg_image_path], settings=state.og_settings,
                ):
                    proj_needs_update = True
                proj_img_base = f"{BASE_URL}/{proj_api_url}/og.webp"

                proj_thumb_filename = "cover_thumb.webp"
                proj_thumb_local_path = os.path.join(proj_api_dir, proj_thumb_filename)
                if state.register_image_asset(
                    stat_prefix="thumb", fn=generate_cover_thumbnail,
                    args=(local_proj_cover, proj_thumb_local_path, *IMAGE_PROFILES['project_thumb']),
                    tag="🖼️ [專案縮圖]", src_path=local_proj_cover, dest_path=proj_thumb_local_path,
                    context=proj_title, cache_dict=proj_cache, current_hashes=current_proj_hashes,
                    force_overwrite=p_overwrite_thumb, settings={'profile': IMAGE_PROFILES['project_thumb']},
                ):
                    proj_needs_update = True
                state.deferred_asset_bindings.append((
                    proj_data, 'cover_image',
                    lambda t_l=proj_thumb_local_path, t_u=f"./{proj_api_url}/{proj_thumb_filename}", o_c=local_proj_cover:
                        resolve_hashed_asset(t_l, t_u, o_c, quote(o_c, safe='/')),
                ))
            else:
                proj_img_base = f"{BASE_URL}/assets/og.png"

            proj_html_path = os.path.join(proj_api_dir, "index.html")
            proj_html_settings = {'template': SHARE_HTML_TEMPLATE, 'base_url': BASE_URL}
            if proj_github_synced:
                proj_html_settings['github_sync'] = proj_github_synced
            proj_html_status, detail_hash = check_hash_status(
                proj_detail_path, proj_html_path, proj_cache, 'detail', p_overwrite_json,
                logic_version=HTML_LOGIC_VERSION,
                dependencies=[local_proj_cover, bg_image_path, 'assets/og.png'],
                settings=proj_html_settings,
            )
            current_proj_hashes['detail'] = detail_hash

            if proj_html_status in ('NEW', 'UPDATED') or proj_needs_update:
                proj_needs_update = True
                state.deferred_html_writes.append(ShareHtmlTask(
                    html_path=proj_html_path,
                    title=proj_title,
                    description=proj_desc,
                    target_url="/?" + urlencode({'p': proj_id}),
                    share_url=f"{BASE_URL}/{proj_api_url}/index.html",
                    og_local=proj_og_local_path if local_proj_cover else None,
                    og_url=proj_img_base if local_proj_cover else None,
                    fallback_local=local_proj_cover,
                    fallback_url=f"{BASE_URL}/{quote(local_proj_cover, safe='/')}" if local_proj_cover else None,
                    proj_img_base=proj_img_base,
                ))
                stats[f"proj_{'new' if proj_html_status == 'NEW' else 'updated'}"] += 1
            else:
                stats["proj_skipped"] += 1

            valid_api_files.add(os.path.abspath(proj_html_path))
            valid_api_files.add(os.path.abspath(proj_meta_path))
            if proj_needs_update or current_proj_hashes != proj_cache or not os.path.exists(proj_meta_path):
                state.deferred_meta_writes.append((proj_meta_path, current_proj_hashes))

            # 3. 掃描專案底下的文章 (Articles)
            articles = []
            articles_dir = os.path.join(proj_path, 'articles')
            if os.path.isdir(articles_dir):
                seen_art_ids = set()
                art_folders = [
                    root for root, _, files in os.walk(articles_dir, onerror=raise_scan_error)
                    if 'detail.json' in files
                ]
                for item_path in sorted(art_folders):
                    article_obj = process_article(
                        state=state, item_path=item_path, proj_path=proj_path,
                        proj_folder=proj_folder, proj_id=proj_id, proj_title=proj_title,
                        proj_desc=proj_desc, proj_detail_path=proj_detail_path,
                        proj_api_dir=proj_api_dir, proj_api_url=proj_api_url,
                        proj_data=proj_data, proj_og_local_path=proj_og_local_path,
                        local_proj_cover=local_proj_cover, proj_img_base=proj_img_base,
                        bg_image_path=bg_image_path, proj_needs_update=proj_needs_update,
                        seen_art_ids=seen_art_ids, p_overwrite_json=p_overwrite_json,
                        p_overwrite_og=p_overwrite_og, p_overwrite_thumb=p_overwrite_thumb,
                        overwrite_pdf_thumb=overwrite_pdf_thumb, is_proj_targeted=is_proj_targeted,
                        target_folders=target_folders, expire_days=expire_days,
                    )
                    if article_obj:
                        articles.append(article_obj)

            if articles:
                articles.sort(key=lambda x: (-1 if x.get('pinned', False) else 0, safe_int(x.get('sort_order', 999))))
                for art in articles:
                    art.pop('sort_order', None)
                proj_data['articles'] = articles

            output_data["projects"].append(proj_data)

    if state.scan_failures:
        raise RuntimeError('文章解析失敗，停止提交生成快取：' + '; '.join(state.scan_failures))

    # 4. 執行所有待辦影像任務
    run_image_tasks(state.img_tasks)

    # 群組分享圖先回填，文章分享頁才能選到正確的 OG 圖。
    for target_dict, field_name, resolver in state.deferred_asset_bindings:
        target_dict[field_name] = resolver()

    # 所有文字和連結均解析成功後，才開始替換已發布的文字檔。
    resolved_contents = []
    for task in state.deferred_content_writes:
        content = resolve_content_tokens(task.raw_content, task.replacements)
        if not task.force_overwrite and task.previous_content == content:
            stats['json_skipped'] += 1
            continue
        payload = json.dumps({'content': content}, ensure_ascii=False)
        status = 'new' if not os.path.isfile(task.path) else 'updated'
        resolved_contents.append((task.path, payload, status))

    resolved_html = [(task.html_path, task.render()) for task in state.deferred_html_writes]
    for path, payload, status in resolved_contents:
        changed = atomic_write(path, payload, _FILE_HASH_MEMO)
        stats[f"json_{status if changed else 'skipped'}"] += 1
    for task in state.deferred_content_writes:
        task.article['content_path'] = get_hash_url(task.path, task.article['content_path'])
    for path, html in resolved_html:
        atomic_write(path, html, _FILE_HASH_MEMO)
    for path, hashes in state.deferred_meta_writes:
        atomic_write(path, json.dumps(hashes, ensure_ascii=False, sort_keys=True), _FILE_HASH_MEMO)

    output_data["categories"].sort(key=lambda x: safe_int(x.get('order', 999)))
    cat_order_map = {cat['id']: safe_int(cat.get('order', 999)) for cat in output_data["categories"]}
    cat_sort_map = {cat['id']: cat.get('default_sort', 'asc') for cat in output_data["categories"]}

    def project_sort_key(proj):
        cat_id = proj.get('category')
        sort_dir = cat_sort_map.get(cat_id, 'asc')
        order_val = safe_int(proj.get('order', 999))
        directed_order = -order_val if sort_dir == 'desc' else order_val
        return (
            cat_order_map.get(cat_id, 999),
            -1 if proj.get('pinned', False) else 0,
            0 if proj_has_order.get(proj.get('id'), False) else 1,
            directed_order,
            proj.get('id', ''),
        )

    output_data["projects"].sort(key=project_sort_key)

    cout.success(f"JSON 結構掃描與打包完成，包含 {len(output_data['projects'])} 個專案。")
    atomic_write('all_projects.json', json.dumps(output_data, ensure_ascii=False, indent=2), _FILE_HASH_MEMO)


# ==========================================
# 🧹 清理廢棄 API 資料夾
# ==========================================
def cleanup_old_api_files(api_dir=API_DIR, *, keep_dirs=()):
    """清理未列入本次建置的檔案，可在手動呼叫時保留指定目錄。"""
    cout.stage("清理階段", "開始刪除無效與舊版 API 資料...", icon_key='clean')

    if not os.path.exists(api_dir):
        cout.skip("沒有找到 api 資料夾，略過清理。", indent=0)
        return

    deleted_files = 0
    deleted_dirs = 0
    kept = {os.path.normcase(os.path.abspath(path)) for path in keep_dirs}
    kept_prefixes = tuple(os.path.join(path, '') for path in kept)

    for root, dirs, files in os.walk(os.path.abspath(api_dir), topdown=False):
        if kept:
            directory = os.path.normcase(root)
            if directory in kept or directory.startswith(kept_prefixes):
                continue
        for name in files:
            file_path = os.path.abspath(os.path.join(root, name))
            if file_path not in valid_api_files:
                os.remove(file_path)
                deleted_files += 1
                cout.action("刪除廢棄檔案", os.path.relpath(file_path), icon_key='delete', color='yellow', tree=True)

        for name in dirs:
            dir_path = os.path.join(root, name)
            if os.path.normcase(dir_path) in kept:
                continue
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
                    ("4", "指定資料夾強制更新 (僅強制重刷特定專案或文章)"),
                ],
                prompt_text="請選擇 [1, 2, 3 或 4]", default="1",
            )

            if choice == '2':
                overwrite_webp = overwrite_json = overwrite_og = overwrite_thumb = overwrite_pdf_thumb = True
            elif choice == '3':
                cout.info("\n-- 自訂義細項設定 --", icon_key='config')
                overwrite_webp = input("  [A] 處理選項 (1/5): 專案原圖轉 WebP [1]智慧跳過 [2]強制複寫 (預設 1): ").strip() == '2'
                overwrite_json = input("  [B] 處理選項 (2/5): Markdown轉JSON與HTML [1]智慧跳過 [2]強制複寫 (預設 1): ").strip() == '2'
                overwrite_og = input("  [C] 處理選項 (3/5): OG 分享圖生成 [1]智慧跳過 [2]強制複寫 (預設 1): ").strip() == '2'
                overwrite_thumb = input("  [D] 處理選項 (4/5): 封面與內文圖片縮圖生成 [1]智慧跳過 [2]強制複寫 (預設 1): ").strip() == '2'
                overwrite_pdf_thumb = input("  [E] 處理選項 (5/5): PDF 封面預覽縮圖生成 [1]智慧跳過 [2]強制複寫 (預設 1): ").strip() == '2'
            elif choice == '4':
                targets = input(f"\n{cout.icon('target')} 請輸入要強制更新的資料夾名稱 (多個以空白分隔，如 '02_mind 24_create'): ").strip()
                if targets:
                    target_folders = set(targets.split())
                    cout.action("指定更新模式", f"將強制重刷以下項目及其內容: {', '.join(target_folders)}", icon_key='target', color='magenta', tree=False)

        build_start_time = time.perf_counter()

        # 1. 原圖轉 WebP 並同步副檔名
        convert_project_images(is_github_actions, overwrite_webp, target_folders)
        cout.stage("路徑同步階段", "更新文章與設定檔內之圖片副檔名為 WebP...", icon_key='stage')
        update_extensions_to_webp()

        # 2. 解析更新後的 Markdown 並打包 JSON 與縮圖
        cout.stage("第二階段", "開始解析 Markdown 並打包 JSON 資料庫...", icon_key='stage')
        generate_projects_json(
            overwrite_json=overwrite_json, overwrite_og=overwrite_og,
            overwrite_thumb=overwrite_thumb, overwrite_pdf_thumb=overwrite_pdf_thumb,
            target_folders=target_folders,
        )

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

        # 3. 產生 changelogs.json 並同步版號至 version.json 與 main.js
        latest_ver = generate_changelogs_json()
        generate_version_json(latest_ver, is_github_actions=is_github_actions)

        # 4. 壓縮 JS/CSS、單次輸出 index.html，最後發布 data_version.json
        minify_assets(latest_version=latest_ver)
        update_data_version()

        # 5. 統一輸出過期或解封提醒清單
        cout.flush_reminders("過期 tag 提示")

        total_elapsed = time.perf_counter() - build_start_time
        cout.success(f"全站建置流程執行完畢！總耗時: {total_elapsed:.2f} 秒。", icon_key='party')
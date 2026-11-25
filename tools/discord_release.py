"""GitHub Release → Discord embed. Python 3.10+, standard library only."""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote


# 更新類型只取摘要開頭的 [STATUS]，不掃描內文關鍵字。
STATUS_COLORS = {
    "MAJOR": 0xF5D547,
    "FEATURE": 0xF5D547,
    "NEW": 0xF5D547,
    "REFACTOR": 0xC77DFF,
    "HOTFIX": 0xFF4D79,
    "PATCH": 0xFF4D79,
    "BUG": 0xFF4D79,
}
DEFAULT_COLOR = 0x44D4BE
DESCRIPTION_LIMIT = 4000  # 沿用舊版的保守長度上限
HEADING_RE = re.compile(r"^ {0,3}#{1,6}(?:[ \t]+|(?=\*\*\[))(.+?)\s*$")
STATUS_RE = re.compile(r"^\[([A-Za-z][A-Za-z0-9_-]*)\][ \t]*(.*)$")
FENCE_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")


class NotificationError(Exception):
    """可安全顯示於 Actions log 的錯誤，不包含 webhook 或 token。"""


@dataclass(frozen=True)
class Config:
    repo: str = ""
    site_url: str = ""
    banner_url: str = ""
    token: str = ""
    webhook: str = ""
    event: str = ""
    input_tag: str = ""
    input_send: bool = False
    summary_path: str = ""
    event_path: str = ""


@dataclass(frozen=True)
class Release:
    tag: str
    title: str = ""
    body: str = ""
    url: str = ""
    timestamp: str = ""
    draft: bool = False
    author: str = ""
    avatar: str = ""


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def load_config():
    def env(key):
        return os.environ.get(key, "").strip()

    return Config(
        repo=env("GITHUB_REPOSITORY"),
        site_url=env("SITE_URL"), banner_url=env("BANNER_URL"),
        token=env("GITHUB_TOKEN"), webhook=env("DISCORD_WEBHOOK"),
        event=env("GITHUB_EVENT_NAME"), input_tag=env("INPUT_TAG"),
        input_send=env("INPUT_SEND").lower() == "true",
        summary_path=env("GITHUB_STEP_SUMMARY"), event_path=env("GITHUB_EVENT_PATH"),
    )


def release_from_json(data):
    if not isinstance(data, dict):
        raise NotificationError("GitHub Release 資料格式無效。")
    def field(key):
        value = data.get(key)
        return value.strip() if isinstance(value, str) else ""
    author = data.get("author") or {}
    if not isinstance(author, dict):
        author = {}
    return Release(
        tag=field("tag_name"), title=field("name"), body=field("body"),
        url=field("html_url"), timestamp=field("published_at") or field("created_at"),
        draft=bool(data.get("draft")), author=str(author.get("login") or "").strip(),
        avatar=str(author.get("avatar_url") or "").strip(),
    )


def fetch_release(config):
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", config.repo):
        raise NotificationError("GITHUB_REPOSITORY 格式無效或未設定。")
    suffix = f"tags/{quote(config.input_tag, safe='')}" if config.input_tag else "latest"
    url = f"https://api.github.com/repos/{config.repo}/releases/{suffix}"
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "GitHub-Actions-Discord-Notify"}
    if config.token:
        headers["Authorization"] = f"Bearer {config.token}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return release_from_json(json.load(resp))
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            raise NotificationError("找不到指定的 Release。" if config.input_tag else "目前沒有已發佈的正式 Release。") from None
        raise NotificationError(f"GitHub API 請求失敗（HTTP {exc.code}）。") from None
    except (urllib.error.URLError, TimeoutError, ValueError):
        raise NotificationError("GitHub API 連線或資料解析失敗。") from None


def read_event_release(config):
    # 直接讀取 GitHub event JSON，避免長 Release Body 超過環境變數限制。
    try:
        data = json.loads(Path(config.event_path).read_text(encoding="utf-8"))
        if not isinstance(data, dict) or not isinstance(data.get("release"), dict):
            raise ValueError
        return release_from_json(data["release"])
    except (OSError, ValueError):
        raise NotificationError("無法讀取 GitHub Release event 資料。") from None


def strip_heading(line):
    match = HEADING_RE.match(line)
    text = match.group(1) if match else line.strip()
    text = re.sub(r"[ \t]+#+[ \t]*$", "", text).strip()
    # 支援 **[MAJOR] summary** 與 **[MAJOR]** summary。
    for marker in ("**", "__"):
        if text.startswith(marker):
            end = text.find(marker, len(marker))
            if end != -1:
                text = (text[len(marker):end] + text[end + len(marker):]).strip()
                break
    return text


def tagged_summary(text):
    match = STATUS_RE.match(text)
    if match and match.group(2).strip():
        status = match.group(1).upper()
        return status, f"[{status}] {match.group(2).strip()}"
    return None


def parse_release_summary(body, title="", tag=""):
    """優先採用第一個帶 [STATUS] 的 ATX 標題，次選純文字，最後 Release Title。"""
    plain = None
    fence = None
    for line in body.lstrip("\ufeff").splitlines():
        fm = FENCE_RE.match(line)
        if fm:
            marker, tail = fm.groups()
            if fence is None:
                fence = marker
                continue
            if marker[0] == fence[0] and len(marker) >= len(fence) and not tail.strip():
                fence = None
                continue
        if fence is not None:
            continue
        heading = HEADING_RE.match(line)
        result = tagged_summary(strip_heading(line))
        if result:
            if heading:
                return result
            if plain is None and not line.startswith(("    ", "\t")):
                plain = result
    if plain:
        return plain
    fallback = strip_heading(title).strip()
    if fallback and fallback != tag:
        return tagged_summary(fallback) or ("", fallback)
    return "", ""


def resolve_embed_color(status):
    return STATUS_COLORS.get(status.upper(), DEFAULT_COLOR)


def text_length(value):
    # 保守計算 UTF-16 單位，避免 emoji 使 Discord 長度超標。
    return len(value.encode("utf-16-le")) // 2


def truncate_text(value, limit):
    if text_length(value) <= limit:
        return value
    if limit < 3:
        return "" if limit <= 0 else "." * limit
    return value.encode("utf-16-le")[: (limit - 3) * 2].decode("utf-16-le", errors="ignore") + "..."


def build_description(release, config, summary):
    tag = release.tag
    header = f"## [{tag}]({release.url}) RELEASE" if release.url else f"## {tag} RELEASE"
    lines = [header]
    if config.repo:
        lines.append(f"-# {config.repo}")
    base = "\n".join(lines)
    footer = ""
    if config.site_url:
        site = f"{config.site_url.rstrip('/')}/?v={quote(tag, safe='')}"
        footer = f"\n[Visit Website ↗]({site})"
    room = DESCRIPTION_LIMIT - text_length(base + footer)
    if room < 0:
        raise NotificationError("版本標題或網站連結過長，無法建立通知。")
    if summary and room > 5:
        base += "\n### " + truncate_text(summary, room - 5)
    return base + footer


def build_embed(release, config):
    if release.draft:
        raise NotificationError("Release 尚未發佈（draft），已取消通知。")
    if not release.tag:
        raise NotificationError("缺少 Release tag。")
    status, summary = parse_release_summary(release.body, release.title, release.tag)
    embed = {
        "description": build_description(release, config, summary),
        "color": resolve_embed_color(status),
        "footer": {"text": f"Version {release.tag}"},
        "timestamp": release.timestamp or now_iso(),
    }
    if release.author:
        embed["author"] = {"name": release.author}
        if release.avatar:
            embed["author"]["icon_url"] = release.avatar
    if config.banner_url:
        embed["image"] = {"url": config.banner_url}
    return {"allowed_mentions": {"parse": []}, "embeds": [embed]}


def write_preview(payload, summary_path, should_send):
    if not summary_path:
        return
    mode = "發送模式" if should_send else "僅預覽模式（未發送到 Discord）"
    desc = payload["embeds"][0]["description"]
    with open(summary_path, "a", encoding="utf-8") as out:
        out.write(f"**{mode}**\n\n{desc}\n")


def send_webhook(payload, webhook):
    if not webhook:
        raise NotificationError("未設定 DISCORD_WEBHOOK Secret。")
    try:
        req = urllib.request.Request(webhook,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            print(f"Discord notification sent (HTTP {resp.status}).")
    except urllib.error.HTTPError as exc:
        raise NotificationError(f"Discord 拒絕通知（HTTP {exc.code}），請檢查 webhook 與訊息設定。") from None
    except (urllib.error.URLError, TimeoutError, ValueError):
        raise NotificationError("Discord 連線失敗；重新送出前請先確認頻道內是否已有公告。") from None


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", type=Path, help="本機 Markdown；只預覽，永不發送")
    parser.add_argument("--tag", help="本機預覽版本號")
    parser.add_argument("--title", default="", help="本機預覽的備援 Release Title")
    parser.add_argument("--repo", help="本機預覽的 owner/repo")
    parser.add_argument("--site-url", help="本機預覽網站網址；空字串可停用")
    parser.add_argument("--banner-url", help="本機預覽 Banner；空字串可停用")
    parser.add_argument("--preview", action="store_true", help="強制只預覽，不發送")
    parser.add_argument("--json", action="store_true", help="輸出 JSON payload；強制不發送")
    args = parser.parse_args(argv)
    if args.file and not (args.tag and args.tag.strip()):
        parser.error("--file 需要搭配 --tag")
    if not args.file and any(x is not None for x in (args.tag, args.repo, args.site_url, args.banner_url)):
        parser.error("本機預覽參數須與 --file 搭配")
    config = load_config()
    try:
        if args.file:
            # 本機模式不讀 event、不查 API、不接觸 webhook，即使有 CI 環境變數。
            from dataclasses import replace
            config = replace(config,
                repo=args.repo if args.repo is not None else config.repo or "AZUSTOCK/azustock.github.io",
                site_url=args.site_url if args.site_url is not None else config.site_url or "https://azustock.com",
                banner_url=args.banner_url if args.banner_url is not None else config.banner_url or "https://azustock.com/assets/og.png")
            try:
                body = args.file.read_text(encoding="utf-8-sig")
            except (OSError, UnicodeError):
                raise NotificationError("無法讀取本機 Markdown 檔案。") from None
            tag = args.tag.strip()
            url = f"https://github.com/{config.repo}/releases/tag/{quote(tag, safe='')}" if config.repo else ""
            release = Release(tag=tag, title=args.title, body=body, url=url)
            should_send = False
        elif config.event == "release":
            release = read_event_release(config)
            should_send = True
        elif config.event == "workflow_dispatch":
            release = fetch_release(config)
            should_send = config.input_send
        else:
            parser.error("請指定 --file 與 --tag，或由 GitHub Actions 執行")
        should_send = should_send and not (args.preview or args.json)
        payload = build_embed(release, config)
        if not args.file:
            write_preview(payload, config.summary_path, should_send)
        if args.json:
            print(json.dumps(payload, ensure_ascii=False, indent=2))
        elif not should_send:
            print(payload["embeds"][0]["description"])
            print(f"\nEmbed color: #{payload['embeds'][0]['color']:06X}")
            print("預覽完成（未發送到 Discord）。")
        else:
            send_webhook(payload, config.webhook)
        return 0
    except NotificationError as exc:
        print(f"錯誤：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

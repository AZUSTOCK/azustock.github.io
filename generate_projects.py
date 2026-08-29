import os
import json
import re
import time
import hashlib
from PIL import Image
from datetime import datetime, timedelta
from tools.convert_webp import convert_to_webp_with_protection, generate_cover_thumbnail
from tools.update_paths import update_extensions_to_webp

# 準備一個 Set 來記錄所有合法的 API 檔案絕對路徑，用於最後的清理階段
valid_api_files = set()

expiration_l = []

# 全域統計數據 (依語系區分)
LANGS = ['zh', 'en', 'ja']
stats = {lang: {
    "proj_total": 0, "proj_new": 0, "proj_updated": 0, "proj_skipped": 0,       
    "art_total": 0,  "art_new": 0,  "art_updated": 0,  "art_skipped": 0,        
    "json_total": 0, "json_new": 0, "json_updated": 0, "json_skipped": 0,       
    "og_total": 0,   "og_new": 0,   "og_updated": 0,   "og_skipped": 0,         
    "thumb_total": 0, "thumb_new": 0, "thumb_updated": 0, "thumb_skipped": 0,    
    "inline_thumb_total": 0, "inline_thumb_new": 0, "inline_thumb_updated": 0, "inline_thumb_skipped": 0 
} for lang in LANGS}

SYS_TAGS = {'MAJOR', 'HOTFIX', 'LATEST', 'FEATURE', 'NEW', 'UPDATED', 'REFACTOR', 'PATCH', 'STABLE', 'ARCHIVED', 'WIP', 'OC'}

# ==========================================
# 🛠️ 輔助系統 (Helper Functions)
# ==========================================
def get_i18n_text(data, lang, default_lang='zh'):
    """
    [多語系引擎] 處理 detail.json 中的多國語系欄位
    - 若為字典: {"zh": "標題", "en": "Title"} -> 依照 lang 提取，若無則退回 default_lang
    - 若為字串: "標題" -> 任何語系皆回傳原字串 (符合「未指定自動以中文為主」的需求)
    """
    if isinstance(data, dict):
        return data.get(lang, data.get(default_lang, ""))
    return str(data) if data else ""

def find_md_file(item_path, lang):
    """
    [多語系引擎] 尋找對應語系的 Markdown 檔案
    優先級: xxx.lang.md -> xxx.zh.md -> xxx.md
    """
    # 1. 優先找完全符合該語系的檔案 (例如 index.en.md)
    for f in os.listdir(item_path):
        if f.endswith(f'.{lang}.md'):
            return os.path.join(item_path, f), False # 找到了，不是 Fallback
    
    # 2. 找不到指定語系時，退回尋找繁體中文版 (.zh.md)
    for f in os.listdir(item_path):
        if f.endswith('.zh.md'):
            return os.path.join(item_path, f), True # 是 Fallback
            
    # 3. 再找不到，尋找無後綴的舊版檔案 (.md)
    for f in os.listdir(item_path):
        if f.endswith('.md'):
            return os.path.join(item_path, f), True # 是 Fallback
            
    return None, False

def get_file_status(source_paths, target_path, force_overwrite=False):
    if not os.path.exists(target_path):
        return 'NEW'
    if force_overwrite:
        return 'UPDATED'
    target_time = os.path.getmtime(target_path)
    for src in source_paths:
        if src and os.path.exists(src):
            if os.path.getmtime(src) > target_time:
                return 'UPDATED'
    return 'SKIPPED'

def print_conversion(tag, src_path, dest_path, context=""):
    """輔助函式：印出圖片轉換前後的檔案大小與所屬專案/文章"""
    if os.path.exists(src_path) and os.path.exists(dest_path):
        s_size = os.path.getsize(src_path) / 1024
        d_size = os.path.getsize(dest_path) / 1024
        # ✨ 若有傳入 context，就把它用中括號包起來顯示
        ctx_str = f" [{context}]" if context else ""
        print(f"  └─ {tag}{ctx_str} {os.path.basename(dest_path)} ({s_size:.1f} KB -> {d_size:.1f} KB)")

def create_og_image(original_path, output_path, bg_path=None):
    """將任意尺寸的圖片疊加到 1200x630 的背景圖中央，生成完美的 OG 分享圖"""
    try:
        OG_SIZE = (1200, 630) 
        img = Image.open(original_path).convert("RGBA")
        
        if bg_path and os.path.exists(bg_path):
            bg = Image.open(bg_path).convert("RGBA")
            bg = bg.resize(OG_SIZE, Image.Resampling.LANCZOS)
        else:
            bg = Image.new("RGBA", OG_SIZE, (30, 41, 59, 255))
            
        max_h, max_w = 600, 1100
        ratio = min(max_w / img.width, max_h / img.height)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        x = (OG_SIZE[0] - new_size[0]) // 2
        y = (OG_SIZE[1] - new_size[1]) // 2
        bg.paste(img, (x, y), img)
        
        final_img = bg.convert("RGB")
        clean_exif = final_img.getexif()
        clean_exif.clear()
        clean_exif[40093] = ("風川梓 (Azustock)" + '\x00').encode('utf-16le')
        clean_exif[40092] = ("Copyright (c) 2026 風川梓 (Azustock). All rights reserved." + '\x00').encode('utf-16le')
        clean_exif[315] = "Azustock"
        exif_bytes = clean_exif.tobytes()
        
        final_img.save(output_path, "WEBP", quality=90, exif=exif_bytes)
        return True
    except Exception as e:
        print(f"⚠️ 生成 OG 圖片失敗 {original_path}: {e}")
        return False

def parse_folder_meta(folder_name):
    match = re.match(r'^(-?\d+)_+(.*)$', folder_name)
    if match:
        return int(match.group(1)), match.group(2)
    return 999, folder_name

def load_detail_json(json_path):
    if os.path.isfile(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Error reading {json_path}: {e}")
    return {}

def get_hash_url(local_path, base_url):
    """獲取帶有檔案內容 Hash 的網址 (取代容易在 CI 失效的 mtime)"""
    if os.path.exists(local_path):
        try:
            # 讀取檔案內容計算 MD5 前 8 碼
            with open(local_path, 'rb') as f:
                file_hash = hashlib.md5(f.read()).hexdigest()[:8]
            return f"{base_url}?v={file_hash}"
        except Exception:
            pass
    return base_url

def check_hash_status(source_path, target_path, old_hash_dict, key, force_overwrite):
    """使用 Hash 判斷單一檔案是否需要更新"""
    current_hash = get_file_hash(source_path)
    if not os.path.exists(target_path):
        return 'NEW', current_hash
    if force_overwrite or old_hash_dict.get(key) != current_hash:
        return 'UPDATED', current_hash
    return 'SKIPPED', current_hash

# ==========================================
# ⏰ 時間戳過期偵測引擎 (Expiration Checker)
# ==========================================
def check_expiration_reminders(item_title, item_type, data_dict, detail_path):
    """檢查 JSON 內的日期標籤或屬性是否過期，並印出黃色警告提醒"""
    now = datetime.now()
    expire_delta = timedelta(days=14) # 與前端 JS 的 TAG_EXPIRE_DAYS 保持一致
    
    # 1. 檢查 Tags (例如 "NEW:2026-08-01")
    tags = data_dict.get('tags') or data_dict.get('TAGS')
    if tags:
        for t in tags:
            match = re.match(r'^(NEW|UPDATED|LATEST|FEATURE):(\d{4}[-/]\d{2}[-/]\d{2})$', str(t), re.IGNORECASE)
            if match:
                try:
                    dt = datetime.strptime(match.group(2).replace('-', '/'), "%Y/%m/%d")
                    if now - dt > expire_delta:
                        expiration_l.append(f"\033[93m  ⏰ [標籤過期] {item_type} '{item_title}' 的 '{t}' 已過 14 天，建議刪除。\n      📁 路徑: {detail_path}\033[0m")
                except Exception:
                    pass
    
    # 2. 檢查屬性欄位 (例如 "new": "2026-08-01" 或 "hidden": "2026-08-01")
    for key in ['new', 'updated', 'wip', 'archived', 'hidden']:
        val = data_dict.get(key) or data_dict.get(key.upper())
        if isinstance(val, str) and re.match(r'^\d{4}[-/]\d{2}[-/]\d{2}$', val):
            try:
                dt = datetime.strptime(val.replace('-', '/'), "%Y/%m/%d")
                if key.lower() == 'hidden':
                    if now >= dt:
                        expiration_l.append(f"\033[92m  🔓 [解封提醒] {item_type} '{item_title}' 的隱藏期限 '{val}' 已到期(現已公開)，建議刪除。\n      📁 路徑: {detail_path}\033[0m")
                else:
                    if now - dt > expire_delta:
                        expiration_l.append(f"\033[93m  ⏰ [狀態過期] {item_type} '{item_title}' 的 '{key}: {val}' 已過 14 天，建議刪除。\n      📁 路徑: {detail_path}\033[0m")
            except Exception:
                pass

# ==========================================
# 🧠 細項 Hash 快取與版本控制引擎 (Fine-Grained State Cache)
# ==========================================
CACHE_FILE = '.build_cache.json'

def get_file_hash(filepath):
    """計算單一檔案的 MD5 Hash (無視作業系統換行符號差異)"""
    if not os.path.exists(filepath): return ""
    hasher = hashlib.md5()
    # ✨ 改以文字模式讀取，統一替換換行符號
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read().replace('\r\n', '\n')
        hasher.update(content.encode('utf-8'))
    return hasher.hexdigest()[:8]

def get_dir_hash(dirpath):
    """計算資料夾內所有 Markdown 與 JSON 的聯合 MD5 Hash (無視換行差異)"""
    if not os.path.exists(dirpath): return ""
    hasher = hashlib.md5()
    for root, dirs, files in os.walk(dirpath):
        for file in sorted(files):
            if file.endswith('.md') or file.endswith('.json'):
                with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read().replace('\r\n', '\n')
                    hasher.update(content.encode('utf-8'))
    return hasher.hexdigest()[:8]

def update_data_version():
    """計算各獨立項目的 Hash，並寫入 data_version.json 與狀態快取"""
    print(f"\n==========================================")
    print(f"🧠 [快取引擎] 開始計算細項 Hash 值 (嚴格語系隔離)...")
    print(f"==========================================")
    
    LANGS = ['zh', 'en', 'ja']
    items = {
        "changelogs.json": get_file_hash("changelogs.json"),
        "COPYRIGHT.md": get_file_hash("COPYRIGHT.md") # ✨ 讓它回到根目錄獨立計算 Hash
    }
    
    for lang in LANGS:
        # 追蹤各語系的獨立總表
        items[f"projects_{lang}"] = get_file_hash(f"api/{lang}/all_projects.json")
        # 追蹤各語系的獨立格言/版權宣告
        items[f"locales_{lang}"] = get_dir_hash(f"locales/{lang}")
    
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
        print(f"🔄 偵測到以下項目內容變更: {', '.join(changed_items)}")
    else:
        print(f"⏭️ 內容無任何變更，維持現有快取。")

    with open('data_version.json', 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2)
        
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2)
        
    return changed_items

def generate_version_json():
    """從 logs 資料夾提取最新版本號 (支援以 detail.json 為主的滾動版號)，並同步寫入前端"""
    print(f"\n==========================================")
    print(f"⚙️ [系統設定] 開始同步全站版號...")
    print(f"==========================================")
    try:
        base_dir = 'logs'
        if not os.path.exists(base_dir) or not os.listdir(base_dir):
            print("⚠️ 找不到 logs 資料夾，無法同步版本號！")
            return

        def parse_version(v_str):
            return [int(x) for x in re.findall(r'\d+', v_str)]
            
        versions_found = []
        for folder in os.listdir(base_dir):
            folder_path = os.path.join(base_dir, folder)
            if not os.path.isdir(folder_path): continue

            actual_version = folder
            detail_path = os.path.join(folder_path, 'detail.json')
            if os.path.exists(detail_path):
                try:
                    with open(detail_path, 'r', encoding='utf-8') as f:
                        detail = json.load(f)
                        if 'version' in detail:
                            actual_version = detail['version']
                except Exception:
                    pass
            versions_found.append(actual_version)

        if not versions_found:
            print("⚠️ 找不到任何有效的版號！")
            return

        # ✨ 取得真正的最新版號 (蒐集所有 detail.json 覆寫過的版號後，進行最高版本排序)
        latest_version = sorted(versions_found, key=parse_version, reverse=True)[0]
        
        # 1. 寫入 version.json 供前端強制對答案
        with open('version.json', 'w', encoding='utf-8') as f:
            json.dump({"version": latest_version}, f, indent=2)
        print(f"✅ 成功提取最新系統版號 ({latest_version}) 並寫入 version.json")
        
        # 2. 反向同步更新 main.js
        js_file = next((f for f in os.listdir('.') if f.startswith('main') and f.endswith('.js')), None)
        if js_file:
            with open(js_file, 'r', encoding='utf-8') as f:
                js_content = f.read()
            
            # 使用正則精準替換 CONFIG 中的 VERSION 數值
            new_js_content = re.sub(r'(VERSION:\s*")[^"]+(")', rf'\g<1>{latest_version}\g<2>', js_content, count=1)
            
            if js_content != new_js_content:
                with open(js_file, 'w', encoding='utf-8') as f:
                    f.write(new_js_content)
                print(f"✅ 成功將 {js_file} 的 CONFIG.VERSION 同步更新為 {latest_version}")
            else:
                print(f"⏭️ {js_file} 版本號已是最新，無須修改。")
        else:
            print("⚠️ 找不到 main.js 檔案，無法更新前端系統版本！")

        # 3. 反向同步更新 index.html (包含 CSS/JS 快取後綴與 Footer 顯示)
        if os.path.exists('index.html'):
            with open('index.html', 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # 替換 CSS 與 JS 的快取後綴 (例如 ./style.css?u=U1.5.6.1)
            new_html = re.sub(r'(\.(?:css|js)\?u=)[^"]+(")', rf'\g<1>{latest_version}\g<2>', html_content)
            # 替換 Footer 裡的靜態文字 (例如 <span id="sys-version">U1.5.6.1</span>)
            new_html = re.sub(r'(<span id="sys-version"[^>]*>)[^<]+(</span>)', rf'\g<1>{latest_version}\g<2>', new_html)
            
            if html_content != new_html:
                with open('index.html', 'w', encoding='utf-8') as f:
                    f.write(new_html)
                print(f"✅ 成功將 index.html 的快取版號與 Footer 同步更新為 {latest_version}")
            else:
                print(f"⏭️ index.html 版本號已是最新，無須修改。")
        else:
            print("⚠️ 找不到 index.html 檔案，跳過 HTML 版號同步。")

    except Exception as e:
        print(f"⚠️ 系統版本號同步失敗: {e}")

## ==========================================
# 📝 升級版系統日誌生成器 (Changelog Generator)
# ==========================================
def generate_changelogs_json():
    base_dir = 'logs'
    output_data = []

    if not os.path.exists(base_dir):
        os.makedirs(base_dir, exist_ok=True)
        print(f"📁 已自動建立 '{base_dir}' 資料夾。")
        return

    def parse_version(v_str):
        return [int(x) for x in re.findall(r'\d+', v_str)]

    for version_folder in sorted(os.listdir(base_dir), key=parse_version, reverse=True):
        folder_path = os.path.join(base_dir, version_folder)
        if not os.path.isdir(folder_path): continue

        version = version_folder
        date = "2026-01-01"
        status = "UPDATE"
        description = "系統更新與優化記錄。"
        content = ""
        is_hidden = False

        detail_path = os.path.join(folder_path, 'detail.json')
        if os.path.exists(detail_path):
            detail = load_detail_json(detail_path)
            date = detail.get('date', date)
            status = detail.get('status', status)
            
            # ✨ 新增：判斷目錄名稱與內部版號是否一致的警告引擎
            if 'version' in detail and detail['version'] != version_folder:
                print(f"\033[93m  📌 [版本覆寫提示] 日誌目錄 '{version_folder}' 與內部版號 (同對外版號) '{detail['version']}' 不一致。\033[0m")
            
            version = detail.get('version', version)
            description = detail.get('description', description)
            is_hidden = detail.get('hidden', False)

        if str(version).count('.') >= 3 or str(version_folder).count('.') >= 3 or is_hidden:
            print(f"  ⏭️ 隱藏內部紀錄: 目錄 {version_folder} (對外版號: {version})")
            continue

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

    with open('changelogs.json', 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    print(f"✅ 升級版版本日誌 (Changelog) 打包完成，共發布 {len(output_data)} 筆紀錄。")


# ==========================================
# 🚀 主生成器邏輯
# ==========================================
def generate_projects_json(overwrite_json=False, overwrite_og=False, overwrite_thumb=False):
    base_dir = 'projects'
    BASE_URL = "https://azustock.github.io"
    LANGS = ['zh', 'en', 'ja']
    
    # 建立共用媒體與總 API 資料夾
    MEDIA_DIR = os.path.join("api", "media")
    os.makedirs(MEDIA_DIR, exist_ok=True)
    
    # ✨ 升級版：動態語系 HTML 模板產生器
    def get_html_template(lang, title, description, image, target_url, share_url):
        i18n_config = {
            'zh': {
                'lang_code': 'zh-TW', 'site_name': '梓本投資控股', 'routing': 'System is routing to:',
                'manual_link': '若系統未自動跳轉，請 <a href="{url}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">點擊此處前往</a>。',
                'footer': '— 風川梓 | Azustock —'
            },
            'en': {
                'lang_code': 'en', 'site_name': 'Azustock Holdings', 'routing': 'System is routing to:',
                'manual_link': 'If not redirected, <a href="{url}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">click here</a>.',
                'footer': '— Kazekawa-Azusa | Azustock —'
            },
            'ja': {
                'lang_code': 'ja', 'site_name': '梓本投資控股', 'routing': 'システムをルーティングしています:',
                'manual_link': '自動的に移動しない場合は、<a href="{url}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">こちらをクリック</a>してください。',
                'footer': '— 風川梓 | Azustock —'
            }
        }
        cfg = i18n_config.get(lang, i18n_config['en'])
        manual_html = cfg['manual_link'].format(url=target_url)

        return f"""<!DOCTYPE html>
<html lang="{cfg['lang_code']}">
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
        <h1 style="font-size: 1.25rem; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 1.5rem; color: #18181b;">{cfg['site_name']}</h1>
        <p style="font-size: 0.95rem; margin-bottom: 0.5rem;">{cfg['routing']}</p>
        <p style="font-size: 1.1rem; font-weight: 600; color: #000; margin-top: 0;">{title}</p>
        <div style="margin: 2.5rem 0 1.5rem 0; width: 100%; height: 1px; background: #e4e4e7;"></div>
        <p style="color: #71717a; font-size: 0.85rem; line-height: 1.6;">{manual_html}</p>
        <p style="font-family: monospace; font-size: 0.75rem; color: #a1a1aa; margin-top: 1.5rem;">{cfg['footer']}</p>
    </div>
</body>
</html>"""

    if not os.path.exists(base_dir):
        print(f"❌ Directory '{base_dir}' not found.")
        return

    # 🚀 開始多語系迴圈打包
    for lang in LANGS:
        print(f"\n🌐 [打包語系] 正在處理 {lang.upper()} 版本...")
        output_data = {"categories": [], "projects": []}
        
        LANG_API_DIR = os.path.join("api", lang)
        os.makedirs(LANG_API_DIR, exist_ok=True)
        
        # 1. 掃描大分類 (Categories)
        for cat_folder in sorted(os.listdir(base_dir)):
            cat_path = os.path.join(base_dir, cat_folder)
            if not os.path.isdir(cat_path): continue

            default_order, clean_title = parse_folder_meta(cat_folder)
            cat_data = load_detail_json(os.path.join(cat_path, 'detail.json'))
            cat_cover = cat_data.get('cover')
            
            cat_cover_url = None
            if cat_cover:
                cat_cover_path = os.path.join(cat_path, cat_cover)
                cat_cover_url = get_hash_url(cat_cover_path, f"{base_dir}/{cat_folder}/{cat_cover}")

            output_data["categories"].append({
                "order": cat_data.get('order', default_order),
                "id": cat_folder, 
                "title": get_i18n_text(cat_data.get('title', clean_title), lang),
                "meta": get_i18n_text(cat_data.get('meta', ''), lang),            
                "description": get_i18n_text(cat_data.get('description', ''), lang), 
                "watermark_url": cat_data.get('watermark_url', ''), 
                "cover_image": cat_cover_url 
            })

            # 2. 掃描分類底下的專案 (Projects)
            for proj_folder in sorted(os.listdir(cat_path)):
                proj_path = os.path.join(cat_path, proj_folder)
                if not os.path.isdir(proj_path): continue

                stats[lang]["proj_total"] += 1 # 統計總數只在第一圈計算
                proj_detail_path = os.path.join(proj_path, 'detail.json')
                proj_data = load_detail_json(proj_detail_path)
                default_proj_order, clean_proj_title = parse_folder_meta(proj_folder)
                
                # 語系化標題
                proj_title_i18n = get_i18n_text(proj_data.get('title', clean_proj_title), lang)
                
                if lang == 'zh': check_expiration_reminders(proj_title_i18n, "專案", proj_data, proj_detail_path)
                
                clean_proj_data = {
                    'id': clean_proj_title,
                    'category': cat_folder,
                    'title': proj_title_i18n,
                    'order': proj_data.get('order', default_proj_order),
                    'default_sort': proj_data.get('default_sort', 'desc')
                }
                
                if proj_data.get('min_sys_version'): clean_proj_data['min_sys_version'] = str(proj_data.get('min_sys_version'))
                if proj_data.get('description'): clean_proj_data['description'] = get_i18n_text(proj_data.get('description'), lang)
                if proj_data.get('date'): clean_proj_data['date'] = proj_data.get('date')
                if proj_data.get('version'): clean_proj_data['version'] = str(proj_data.get('version'))
                
                if proj_data.get('tags'):
                    clean_tags = []
                    for t in proj_data.get('tags'):
                        base = str(t).split(':')[0].upper()
                        if base in SYS_TAGS:
                            clean_tags.append(str(t).upper())
                        else:
                            clean_tags.append(t)
                    clean_proj_data['tags'] = clean_tags
                    
                if proj_data.get('link'): clean_proj_data['link'] = proj_data.get('link')
                
                for key in ['pinned', 'new', 'updated', 'wip', 'archived', 'hidden', 'sensitive']:
                    val = proj_data.get(key) or proj_data.get(key.upper())
                    if val is not None: clean_proj_data[f'is_{key}' if key != 'pinned' else 'pinned'] = val
                
                if proj_data.get('groups'):
                    # 群組標題多語系轉換
                    i18n_groups = {}
                    for g_id, g_info in proj_data.get('groups').items():
                        i18n_groups[g_id] = g_info.copy()
                        if 'title' in g_info: i18n_groups[g_id]['title'] = get_i18n_text(g_info['title'], lang)
                        if 'description' in g_info: i18n_groups[g_id]['description'] = get_i18n_text(g_info['description'], lang)
                    clean_proj_data['groups'] = i18n_groups
                
                proj_cover = proj_data.get('cover')
                if proj_cover:
                    clean_proj_data['cover_image'] = f"{base_dir}/{cat_folder}/{proj_folder}/{proj_cover}"
                    
                proj_data = clean_proj_data 
                articles = []

                proj_id = clean_proj_title
                proj_title = proj_data.get('title', clean_proj_title)
                proj_desc = proj_data.get('description', '查看專案內容')
                
                # 建立語系分離的 API 目錄與共用的 Media 目錄
                proj_api_dir = os.path.join(LANG_API_DIR, str(proj_id))
                proj_media_dir = os.path.join(MEDIA_DIR, str(proj_id))
                os.makedirs(proj_api_dir, exist_ok=True)
                os.makedirs(proj_media_dir, exist_ok=True)
                
                proj_og_filename = "og.webp"
                proj_og_local_path = os.path.join(proj_media_dir, proj_og_filename)
                bg_image_path = os.path.join("assets", "og_base.png")
                
                # 讀取共用媒體快取與當前語系快取
                proj_media_meta_path = os.path.join(proj_media_dir, "meta.json")
                proj_meta_path = os.path.join(proj_api_dir, "meta.json")
                proj_cache = {}
                proj_media_cache = {}
                if os.path.exists(proj_meta_path):
                    try:
                        with open(proj_meta_path, 'r', encoding='utf-8') as f: proj_cache = json.load(f)
                    except Exception: pass
                if os.path.exists(proj_media_meta_path):
                    try:
                        with open(proj_media_meta_path, 'r', encoding='utf-8') as f: proj_media_cache = json.load(f)
                    except Exception: pass
                    
                current_proj_hashes = {}
                current_media_hashes = {}
                proj_needs_update = False
                
                # ✨ 處理專案 OG 圖片 (存入 shared media)
                if 'cover_image' in clean_proj_data:
                    stats[lang]["og_total"] += 1
                    local_proj_cover = clean_proj_data['cover_image']
                    
                    og_status, og_hash = check_hash_status(local_proj_cover, proj_og_local_path, proj_media_cache, 'og_cover', overwrite_og)
                    current_media_hashes['og_cover'] = og_hash
                    
                    if og_status in ('NEW', 'UPDATED'):
                        if create_og_image(local_proj_cover, proj_og_local_path, bg_image_path):
                            if lang == 'zh': print_conversion("🖼️ [專案OG圖]", local_proj_cover, proj_og_local_path, context=proj_title)
                            proj_img = f"{BASE_URL}/api/media/{proj_id}/{proj_og_filename}"
                            if og_status == 'NEW': stats[lang]["og_new"] += 1
                            else: stats[lang]["og_updated"] += 1
                        else:
                            proj_img = f"{BASE_URL}/{clean_proj_data['cover_image']}"
                    else:
                        proj_img = f"{BASE_URL}/api/media/{proj_id}/{proj_og_filename}"
                        stats[lang]["og_skipped"] += 1
                    valid_api_files.add(os.path.abspath(proj_og_local_path))

                    # ✨ 處理專案封面縮圖 (存入 shared media)
                    proj_thumb_filename = "cover_thumb.webp"
                    proj_thumb_local_path = os.path.join(proj_media_dir, proj_thumb_filename)
                    stats[lang]["thumb_total"] += 1 
                    
                    thumb_status, thumb_hash = check_hash_status(local_proj_cover, proj_thumb_local_path, proj_media_cache, 'thumb_cover', overwrite_thumb)
                    current_media_hashes['thumb_cover'] = thumb_hash
                    
                    if thumb_status in ('NEW', 'UPDATED'):
                        if generate_cover_thumbnail(local_proj_cover, proj_thumb_local_path, max_width=180, quality=90):
                            if lang == 'zh': print_conversion("🖼️ [專案縮圖]", local_proj_cover, proj_thumb_local_path, context=proj_title)
                            proj_data['cover_image'] = get_hash_url(proj_thumb_local_path, f"./api/media/{proj_id}/{proj_thumb_filename}")
                            if thumb_status == 'NEW': stats[lang]["thumb_new"] += 1
                            else: stats[lang]["thumb_updated"] += 1
                    else:
                        proj_data['cover_image'] = get_hash_url(proj_thumb_local_path, f"./api/media/{proj_id}/{proj_thumb_filename}")
                        stats[lang]["thumb_skipped"] += 1
                        
                    valid_api_files.add(os.path.abspath(proj_thumb_local_path))
                else:
                    proj_img = f"{BASE_URL}/assets/og.png"

                proj_target_url = f"/?p={proj_id}"
                proj_share_url = f"{BASE_URL}/api/{lang}/{proj_id}/index.html" # HTML 根據語系獨立
                proj_html_path = os.path.join(proj_api_dir, "index.html")
                
                # ✨ 處理專案 HTML (獨立語系)
                proj_html_status, detail_hash = check_hash_status(proj_detail_path, proj_html_path, proj_cache, 'detail', overwrite_json)
                current_proj_hashes['detail'] = detail_hash
                
                if proj_html_status in ('NEW', 'UPDATED'):
                    proj_needs_update = True
                    with open(proj_html_path, "w", encoding="utf-8") as f:
                        f.write(get_html_template(
                            lang, proj_title, proj_desc, proj_img, proj_target_url, proj_share_url
                        ))
                    if proj_html_status == 'NEW': stats[lang]["proj_new"] += 1
                    else: stats[lang]["proj_updated"] += 1
                else:
                    stats[lang]["proj_skipped"] += 1
                    
                valid_api_files.add(os.path.abspath(proj_html_path))

                # 寫入快取
                if proj_needs_update:
                    with open(proj_meta_path, 'w', encoding='utf-8') as f: json.dump(current_proj_hashes, f)
                with open(proj_media_meta_path, 'w', encoding='utf-8') as f: json.dump(current_media_hashes, f)
                valid_api_files.add(os.path.abspath(proj_meta_path))
                valid_api_files.add(os.path.abspath(proj_media_meta_path))

                # 3. 掃描專案底下的文章 (Articles)
                articles_dir = os.path.join(proj_path, 'articles')
                
                if os.path.exists(articles_dir) and os.path.isdir(articles_dir):
                    for item in os.listdir(articles_dir):
                        item_path = os.path.join(articles_dir, item)
                        if not os.path.isdir(item_path): continue

                        art_detail_path = os.path.join(item_path, 'detail.json')
                        sub_data = load_detail_json(art_detail_path)
                        default_art_order, clean_art_title = parse_folder_meta(item)
                        
                        meta_title = get_i18n_text(sub_data.get('title', clean_art_title), lang)
                        meta_desc = get_i18n_text(sub_data.get('description'), lang)
                        meta_order = sub_data.get('order', default_art_order)
                        
                        has_explicit_cover = 'cover' in sub_data
                        meta_cover = sub_data.get('cover')
                        
                        if lang == 'zh': check_expiration_reminders(meta_title, "文章", sub_data, art_detail_path)

                        # ✨ 尋找該語系專屬的 Markdown 檔案
                        md_file_path, is_fallback = find_md_file(item_path, lang)
                        rel_base = f"{base_dir}/{cat_folder}/{proj_folder}/articles/{item}"

                        # 若沒指定封面，自動尋找 basic 或 architecture
                        if not has_explicit_cover:
                            for sub_item in os.listdir(item_path):
                                if sub_item.lower() in ['basic.webp', 'architecture.webp']:
                                    meta_cover = sub_item
                                    
                        if md_file_path:
                            try:
                                art_id = clean_art_title
                                
                                # 1. 確保標題存在 (若 json 沒有，從 md 提取)
                                if sub_data.get('title') is None:
                                    with open(md_file_path, 'r', encoding='utf-8') as md_file:
                                        first_line = md_file.readline()
                                        if first_line.startswith('# '):
                                            meta_title = first_line.replace('# ', '').strip()

                                # ✨ 2. 核心優化：如果是回退文章，直接指向 zh，跳過所有檔案生成！
                                if is_fallback and lang != 'zh':
                                    stats[lang]["art_total"] += 1
                                    stats[lang]["art_skipped"] += 1 
                                    
                                    # 推算已生成的縮圖網址 (因為 zh 已經跑過了)
                                    meta_cover_url = None
                                    if meta_cover:
                                        art_thumb_filename = "cover_thumb.webp"
                                        art_thumb_local_path = os.path.join(MEDIA_DIR, proj_id, art_id, art_thumb_filename)
                                        if os.path.exists(art_thumb_local_path):
                                            meta_cover_url = get_hash_url(art_thumb_local_path, f"./api/media/{proj_id}/{art_id}/{art_thumb_filename}")
                                        else:
                                            meta_cover_url = get_hash_url(os.path.join(item_path, meta_cover), f"{rel_base}/{meta_cover}")
                                    
                                    article_obj = {
                                        "id": art_id,
                                        "sort_order": meta_order,     
                                        "title": meta_title,
                                        "content_path": f"./api/zh/{proj_id}/{art_id}/contents.json" # 🚀 直接指向 zh 的內容
                                    }
                                    
                                    if sub_data.get('min_sys_version'): article_obj["min_sys_version"] = str(sub_data.get('min_sys_version'))
                                    if meta_desc: article_obj["description"] = meta_desc
                                    if meta_cover: article_obj["cover_image"] = meta_cover_url
                                    if sub_data.get('date'): article_obj["date"] = sub_data.get('date')
                                    if sub_data.get('tags'):
                                        clean_tags = []
                                        for t in sub_data.get('tags'):
                                            base = str(t).split(':')[0].upper()
                                            if base in SYS_TAGS: clean_tags.append(str(t).upper())
                                            else: clean_tags.append(t)
                                        article_obj["tags"] = clean_tags
                                    
                                    for key in ['pinned', 'new', 'updated', 'wip', 'archived', 'hidden', 'sensitive']:
                                        val = sub_data.get(key) or sub_data.get(key.upper())
                                        if val is not None: article_obj[f'is_{key}' if key != 'pinned' else 'pinned'] = val

                                    if 'groups' in proj_data:
                                        art_group = sub_data.get('group')
                                        default_group = None
                                        for g_id, g_info in proj_data['groups'].items():
                                            if g_info.get('default'): default_group = g_id
                                        if art_group and art_group in proj_data['groups']: article_obj['group'] = art_group
                                        else: article_obj['group'] = default_group

                                    articles.append(article_obj)
                                    continue # 🚀🚀🚀 直接跳到下一篇文章，不複製任何實體檔案！
                                
                                # ======== 以下為原本正常需要生成的檔案邏輯 (zh 或 已翻譯文章) ========
                                stats[lang]["art_total"] += 1
                                art_dir = os.path.join(LANG_API_DIR, proj_id, art_id)
                                art_media_dir = os.path.join(MEDIA_DIR, proj_id, art_id)
                                os.makedirs(art_dir, exist_ok=True)
                                os.makedirs(art_media_dir, exist_ok=True)
                                
                                content_filename = "contents.json"
                                content_filepath = os.path.join(art_dir, content_filename)
                                
                                art_cache = {}
                                art_media_cache = {}
                                if os.path.exists(content_filepath):
                                    try:
                                        with open(content_filepath, 'r', encoding='utf-8') as f:
                                            art_cache = json.load(f).get("hashes", {})
                                    except Exception: pass
                                media_meta_path = os.path.join(art_media_dir, "meta.json")
                                if os.path.exists(media_meta_path):
                                    try:
                                        with open(media_meta_path, 'r', encoding='utf-8') as f:
                                            art_media_cache = json.load(f)
                                    except Exception: pass
                                    
                                current_hashes = {}
                                current_art_media_hashes = {}
                                art_needs_update = False
                                
                                with open(md_file_path, 'r', encoding='utf-8') as md_file:
                                    content = md_file.read() 
                                    
                                real_path = f"./projects/{cat_folder}/{proj_folder}/articles/{item}/"
                                
                                def replace_md_img(match):
                                    nonlocal art_needs_update
                                    alt_text, url_part = match.group(1), match.group(2).strip()
                                    title_match = re.search(r'(.*?)\s+(["\'])(.*?)\2$', url_part)
                                    if title_match:
                                        url = title_match.group(1)
                                        title_str = f' {title_match.group(2)}{title_match.group(3)}{title_match.group(2)}'
                                    else:
                                        url = url_part
                                        title_str = ""
                                    
                                    if not url.startswith(('http://', 'https://', 'data:')) and 'projects/' not in url:
                                        fixed_url = url.replace('./', real_path)
                                        main_url = fixed_url.split('#')[0]
                                        local_main_path = os.path.normpath(main_url)
                                        ext = os.path.splitext(local_main_path)[1].lower()
                                        
                                        valid_media_exts = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.mp4', '.webm', '.ogg', '.mp3', '.wav'}
                                        if ext not in valid_media_exts:
                                            return f"![{alt_text}]({fixed_url}{title_str})"
                                            
                                        parts = fixed_url.split('#')
                                        stamped_parts = []
                                        for p in parts:
                                            if p.startswith('poster='):
                                                p_path = p[7:]
                                                stamped_parts.append(f"poster={get_hash_url(os.path.normpath(p_path), p_path)}")
                                            elif p.startswith('full='):
                                                p_path = p[5:]
                                                stamped_parts.append(f"full={get_hash_url(os.path.normpath(p_path), p_path)}")
                                            else:
                                                stamped_parts.append(get_hash_url(os.path.normpath(p), p))
                                                
                                        final_stamped_url = '#'.join(stamped_parts)
                                        
                                        valid_image_exts = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'}
                                        if ext in valid_image_exts and os.path.exists(local_main_path):
                                            stats[lang]["inline_thumb_total"] += 1
                                            clean_url = main_url.replace(real_path, '')
                                            safe_name = clean_url.replace('/', '_').replace('\\', '_')
                                            
                                            # ✨ 內文縮圖存入 Shared Media
                                            thumb_dir = os.path.join(art_media_dir, "thumbnails")
                                            os.makedirs(thumb_dir, exist_ok=True)
                                            thumb_filename = f"thumb_{os.path.splitext(safe_name)[0]}.webp"
                                            thumb_local_path = os.path.join(thumb_dir, thumb_filename)
                                            
                                            inline_status, img_hash = check_hash_status(local_main_path, thumb_local_path, art_media_cache, local_main_path, overwrite_thumb)
                                            current_art_media_hashes[local_main_path] = img_hash
                                            
                                            if inline_status in ('NEW', 'UPDATED'):
                                                art_needs_update = True
                                                success = generate_cover_thumbnail(local_main_path, thumb_local_path, max_width=800, quality=85)
                                                if success:
                                                    if lang == 'zh': print_conversion("🖼️ [內文縮圖]", local_main_path, thumb_local_path, context=f"{proj_id} / {art_id}")
                                                    if inline_status == 'NEW': stats[lang]["inline_thumb_new"] += 1
                                                    else: stats[lang]["inline_thumb_updated"] += 1
                                                else:
                                                    stats[lang]["inline_thumb_skipped"] += 1
                                            else:
                                                stats[lang]["inline_thumb_skipped"] += 1
                                                
                                            valid_api_files.add(os.path.abspath(thumb_local_path))
                                            
                                            thumb_url = get_hash_url(thumb_local_path, f"./api/media/{proj_id}/{art_id}/thumbnails/{thumb_filename}")
                                            orig_url_t = get_hash_url(local_main_path, main_url)
                                            
                                            if '#full=' in final_stamped_url:
                                                return f"![{alt_text}]({thumb_url}#{final_stamped_url.split('#', 1)[1]}{title_str})"
                                            else:
                                                return f"![{alt_text}]({thumb_url}#full={orig_url_t}{title_str})"
                                                
                                        return f"![{alt_text}]({final_stamped_url}{title_str})"
                                            
                                    return f"![{alt_text}]({url_part})"
                                    
                                content = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_md_img, content)

                                def replace_html_img(match):
                                    nonlocal art_needs_update
                                    prefix, url, suffix = match.group(1), match.group(2), match.group(3)
                                    if not url.startswith(('http://', 'https://', 'data:')) and 'projects/' not in url:
                                        clean_url = url[2:] if url.startswith('./') else url
                                        orig_url = f"{real_path}{clean_url}"
                                        local_img_path = os.path.normpath(orig_url)
                                        
                                        valid_image_exts = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'}
                                        ext = os.path.splitext(local_img_path)[1].lower()
                                        
                                        if ext not in valid_image_exts:
                                            return f"{prefix}{orig_url}{suffix}"
                                        
                                        if os.path.exists(local_img_path):
                                            stats[lang]["inline_thumb_total"] += 1
                                            safe_name = clean_url.replace('/', '_').replace('\\', '_')
                                            
                                            thumb_dir = os.path.join(art_media_dir, "thumbnails")
                                            os.makedirs(thumb_dir, exist_ok=True)
                                            thumb_filename = f"thumb_{os.path.splitext(safe_name)[0]}.webp"
                                            thumb_local_path = os.path.join(thumb_dir, thumb_filename)
                                            
                                            inline_status, img_hash = check_hash_status(local_img_path, thumb_local_path, art_media_cache, local_img_path, overwrite_thumb)
                                            current_art_media_hashes[local_img_path] = img_hash
                                            
                                            if inline_status in ('NEW', 'UPDATED'):
                                                art_needs_update = True
                                                success = generate_cover_thumbnail(local_img_path, thumb_local_path, max_width=800, quality=85)
                                                if success:
                                                    if lang == 'zh': print_conversion("🖼️ [內文縮圖]", local_img_path, thumb_local_path, context=f"{proj_id} / {art_id}")
                                                    if inline_status == 'NEW': stats[lang]["inline_thumb_new"] += 1
                                                    else: stats[lang]["inline_thumb_updated"] += 1
                                                else:
                                                    stats[lang]["inline_thumb_skipped"] += 1
                                            else:
                                                stats[lang]["inline_thumb_skipped"] += 1
                                                
                                            valid_api_files.add(os.path.abspath(thumb_local_path))
                                            thumb_url = get_hash_url(thumb_local_path, f"./api/media/{proj_id}/{art_id}/thumbnails/{thumb_filename}")
                                            orig_url_t = get_hash_url(local_img_path, orig_url)
                                            return f'{prefix}{thumb_url}" data-full="{orig_url_t}"{suffix[1:]}'
                                            
                                    return f"{prefix}{url}{suffix}"
                                    
                                content = re.sub(r'(<img[^>]+src=["\'])([^"\']+)(["\'][^>]*>)', replace_html_img, content)

                                # ✨ 處理 Markdown 轉 JSON (透過 Hash)
                                stats[lang]["json_total"] += 1
                                json_status, md_hash = check_hash_status(md_file_path, content_filepath, art_cache, 'md_source', overwrite_json)
                                current_hashes['md_source'] = md_hash
                                
                                if json_status in ('NEW', 'UPDATED'):
                                    art_needs_update = True

                                art_title = meta_title
                                art_desc = meta_desc if meta_desc else proj_desc
                                og_local_path = os.path.join(art_media_dir, "og.webp")
                                
                                if meta_cover:
                                    stats[lang]["og_total"] += 1
                                    local_cover_path = os.path.join(item_path, meta_cover)
                                    bg_image_path = os.path.join("assets", "og.png")
                                    
                                    art_og_status, og_src_hash = check_hash_status(local_cover_path, og_local_path, art_media_cache, 'og_cover', overwrite_og)
                                    current_art_media_hashes['og_cover'] = og_src_hash
                                    
                                    if art_og_status in ('NEW', 'UPDATED'):
                                        if create_og_image(local_cover_path, og_local_path, bg_image_path):
                                            if lang == 'zh': print_conversion("🖼️ [文章OG圖]", local_cover_path, og_local_path, context=f"{proj_id} / {art_id}")
                                            art_img = f"{BASE_URL}/api/media/{proj_id}/{art_id}/og.webp"
                                            if art_og_status == 'NEW': stats[lang]["og_new"] += 1
                                            else: stats[lang]["og_updated"] += 1
                                        else:
                                            art_img = f"{BASE_URL}/{rel_base}/{meta_cover}"
                                    else:
                                        art_img = f"{BASE_URL}/api/media/{proj_id}/{art_id}/og.webp"
                                        stats[lang]["og_skipped"] += 1
                                    valid_api_files.add(os.path.abspath(og_local_path))

                                    art_thumb_filename = "cover_thumb.webp"
                                    art_thumb_local_path = os.path.join(art_media_dir, art_thumb_filename)
                                    stats[lang]["thumb_total"] += 1
                                    
                                    art_thumb_status, thumb_src_hash = check_hash_status(local_cover_path, art_thumb_local_path, art_media_cache, 'thumb_cover', overwrite_thumb)
                                    current_art_media_hashes['thumb_cover'] = thumb_src_hash
                                    
                                    if art_thumb_status in ('NEW', 'UPDATED'):
                                        if generate_cover_thumbnail(local_cover_path, art_thumb_local_path, max_width=160, quality=90):
                                            if lang == 'zh': print_conversion("🖼️ [文章縮圖]", local_cover_path, art_thumb_local_path, context=f"{proj_id} / {art_id}")
                                            meta_cover_url = get_hash_url(art_thumb_local_path, f"./api/media/{proj_id}/{art_id}/{art_thumb_filename}")
                                            if art_thumb_status == 'NEW': stats[lang]["thumb_new"] += 1
                                            else: stats[lang]["thumb_updated"] += 1 
                                        else:
                                            meta_cover_url = get_hash_url(local_cover_path, f"{rel_base}/{meta_cover}") 
                                    else:
                                        meta_cover_url = get_hash_url(art_thumb_local_path, f"./api/media/{proj_id}/{art_id}/{art_thumb_filename}")
                                        stats[lang]["thumb_skipped"] += 1
                                        
                                    valid_api_files.add(os.path.abspath(art_thumb_local_path))
                                else:
                                    art_img = proj_img
                                    
                                art_target_url = f"/?p={proj_id}&a={art_id}"
                                art_share_url = f"{BASE_URL}/api/{lang}/{proj_id}/{art_id}/index.html"
                                art_html_path = os.path.join(art_dir, "index.html")

                                art_html_status, art_detail_hash = check_hash_status(art_detail_path, art_html_path, art_cache, 'art_detail', overwrite_json)
                                current_hashes['art_detail'] = art_detail_hash
                                
                                if art_html_status in ('NEW', 'UPDATED') or art_needs_update:
                                    art_needs_update = True
                                    with open(art_html_path, "w", encoding="utf-8") as f:
                                        f.write(get_html_template(
                                            lang, f"{art_title} | {proj_title}", art_desc, art_img, art_target_url, art_share_url
                                        ))
                                    if art_html_status == 'NEW': stats[lang]["art_new"] += 1
                                    else: stats[lang]["art_updated"] += 1
                                else:
                                    stats[lang]["art_skipped"] += 1
                                        
                                valid_api_files.add(os.path.abspath(art_html_path))

                                if art_needs_update:
                                    with open(content_filepath, 'w', encoding='utf-8') as af:
                                        json.dump({"content": content, "hashes": current_hashes}, af, ensure_ascii=False)
                                    
                                    if json_status == 'NEW': stats[lang]["json_new"] += 1
                                    else: stats[lang]["json_updated"] += 1
                                else:
                                    stats[lang]["json_skipped"] += 1
                                    
                                valid_api_files.add(os.path.abspath(content_filepath))
                                
                                with open(media_meta_path, 'w', encoding='utf-8') as f: json.dump(current_art_media_hashes, f)
                                valid_api_files.add(os.path.abspath(media_meta_path))

                                article_obj = {
                                    "id": art_id,
                                    "sort_order": meta_order,     
                                    "title": meta_title,
                                    "content_path": f"./api/{lang}/{proj_id}/{art_id}/{content_filename}"
                                }
                                
                                if sub_data.get('min_sys_version'): article_obj["min_sys_version"] = str(sub_data.get('min_sys_version'))
                                if meta_desc: article_obj["description"] = meta_desc
                                if meta_cover: article_obj["cover_image"] = meta_cover_url
                                if sub_data.get('date'): article_obj["date"] = sub_data.get('date')
                                if sub_data.get('tags'):
                                    clean_tags = []
                                    for t in sub_data.get('tags'):
                                        base = str(t).split(':')[0].upper()
                                        if base in SYS_TAGS:
                                            clean_tags.append(str(t).upper())
                                        else:
                                            clean_tags.append(t)
                                    article_obj["tags"] = clean_tags
                                
                                for key in ['pinned', 'new', 'updated', 'wip', 'archived', 'hidden', 'sensitive']:
                                    val = sub_data.get(key) or sub_data.get(key.upper())
                                    if val is not None: article_obj[f'is_{key}' if key != 'pinned' else 'pinned'] = val

                                if 'groups' in proj_data:
                                    art_group = sub_data.get('group')
                                    default_group = None
                                    for g_id, g_info in proj_data['groups'].items():
                                        if g_info.get('default'):
                                            default_group = g_id
                                    if art_group and art_group in proj_data['groups']:
                                        article_obj['group'] = art_group
                                    else:
                                        article_obj['group'] = default_group

                                articles.append(article_obj)
                            except Exception as e:
                                print(f"⚠️ Error reading Markdown {md_file_path}: {e}")

                if articles:
                    def article_sort(x):
                        pinned_val = 1 if x.get('pinned', False) else 0
                        order_val = int(x.get('sort_order', 999))
                        return (-pinned_val, order_val)

                    sorted_articles = sorted(articles, key=article_sort)
                    for art in sorted_articles:
                        if 'sort_order' in art: del art['sort_order']
                        if 'folder_name' in art: del art['folder_name']
                    proj_data['articles'] = sorted_articles

                output_data["projects"].append(proj_data)

        def safe_sort(x):
            val = x.get('order', 999)
            return int(val) if str(val).isdigit() else 999

        output_data["categories"].sort(key=safe_sort)
        cat_order_map = {cat['id']: cat['order'] for cat in output_data["categories"]}

        def proj_sort(x):
            cat_order = cat_order_map.get(x.get('category'), 999)
            pinned_val = -1 if x.get('pinned', False) else 0
            p_order = -int(x.get('order', 999))
            return (cat_order, pinned_val, p_order, x.get('id', ''))

        output_data["projects"].sort(key=proj_sort)

        print(f"✅ {lang.upper()} 語系 JSON 打包完成，包含 {len(output_data['projects'])} 個專案。")

        # ✨ 寫出該語系的專屬 JSON 檔案 (放入對應的語言資料夾內)
        json_out_path = os.path.join(LANG_API_DIR, "all_projects.json")
        with open(json_out_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        # ⚠️ 關鍵：把這個檔案加入白名單，以免被最後的清理程式誤刪！
        valid_api_files.add(os.path.abspath(json_out_path))

# ==========================================
# 🧹 清理廢棄 API 資料夾
# ==========================================
def cleanup_old_api_files(api_dir="api"):
    print(f"\n==========================================")
    print(f"🧹 [清理階段] 開始刪除無效與舊版 API 資料...")
    print(f"==========================================")
    
    if not os.path.exists(api_dir):
        print("沒有找到 api 資料夾，略過清理。")
        return
        
    deleted_files = 0
    deleted_dirs = 0
    
    for root, dirs, files in os.walk(api_dir, topdown=False):
        for name in files:
            file_path = os.path.abspath(os.path.join(root, name))
            if file_path not in valid_api_files:
                os.remove(file_path)
                deleted_files += 1
                print(f"🗑️ 刪除廢棄檔案: {os.path.relpath(file_path)}")
                
        for name in dirs:
            dir_path = os.path.join(root, name)
            if not os.listdir(dir_path):
                os.rmdir(dir_path)
                deleted_dirs += 1
                print(f"📁 刪除空資料夾: {os.path.relpath(dir_path)}")
                
    print(f"✅ 清理完成！共刪除 {deleted_files} 個檔案, {deleted_dirs} 個資料夾。")


if __name__ == "__main__":
    is_github_actions = os.getenv("GITHUB_ACTIONS") == "true"
    
    overwrite_webp = False
    overwrite_json = False
    overwrite_og = False
    overwrite_thumb = False

    if is_github_actions:
        print("\n🤖 [CI/CD 模式] 偵測到 GitHub Actions 環境。")
        print("   -> 自動停用互動提問，啟用【全域智慧跳過】以加速佈署流程 (僅更新修改過的檔案)。\n")
    else:
        print("請選擇整體作業模式？ (包含圖片轉檔與 JSON 打包)")
        print("  [1] 全域智慧跳過 (遇到舊檔且無修改則跳過，速度最快 - 預設)")
        print("  [2] 全域強制複寫 (重新處理所有檔案與縮圖)")
        print("  [3] 自訂義 (針對各項處理分別選擇)")
        
        choice = input("請選擇 [1, 2 或 3] (預設 1): ").strip()
        
        if choice == '2':
            overwrite_webp = True
            overwrite_json = True
            overwrite_og = True
            overwrite_thumb = True
        elif choice == '3':
            print("\n-- 自訂義細項設定 --")
            w_choice = input("  [A] 第一階段(1/4): 專案原圖轉 WebP [1]智慧跳過 [2]強制複寫 (預設 1): ").strip()
            overwrite_webp = (w_choice == '2')
            
            j_choice = input("  [B] 第二階段(2/4): Markdown轉JSON與HTML [1]智慧跳過 [2]強制複寫 (預設 1): ").strip()
            overwrite_json = (j_choice == '2')
            
            o_choice = input("  [C] 第二階段3/4): OG 分享圖生成 [1]智慧跳過 [2]強制複寫 (預設 1): ").strip()
            overwrite_og = (o_choice == '2')
            
            t_choice = input("  [D] 第二階段(4/4): 封面與內文縮圖生成 [1]智慧跳過 [2]強制複寫 (預設 1): ").strip()
            overwrite_thumb = (t_choice == '2')

    convert_to_webp_with_protection(directory="projects", quality=90, auto_mode=overwrite_webp)
    
    print(f"\n==========================================")
    print(f"📦 [第二階段] 開始解析 Markdown 並打包 JSON 資料庫...")
    print(f"==========================================")
    generate_projects_json(overwrite_json=overwrite_json, overwrite_og=overwrite_og, overwrite_thumb=overwrite_thumb)
    
    # 1. 先產生最新的 changelogs.json
    generate_changelogs_json()

    # 2. ✨ 核心修正：有了日誌之後，再讀取它來生成 version.json 並同步版號！
    generate_version_json()

    print(f"\n📊 [處理統計]")
    for lang in LANGS:
        s = stats[lang]
        print(f"  [{lang.upper()} 語系]")
        print(f"    - 專案 HTML       : 共 {s['proj_total']:>4} 個 | 新增 {s['proj_new']:>4} 個 | 更新 {s['proj_updated']:>4} 個 | 略過 {s['proj_skipped']:>4} 個")
        print(f"    - 文章 HTML       : 共 {s['art_total']:>4} 個 | 新增 {s['art_new']:>4} 個 | 更新 {s['art_updated']:>4} 個 | 略過 {s['art_skipped']:>4} 個")
        print(f"    - 內文 JSON       : 共 {s['json_total']:>4} 個 | 新增 {s['json_new']:>4} 個 | 更新 {s['json_updated']:>4} 個 | 略過 {s['json_skipped']:>4} 個")
        print(f"    - 分享圖 (OG)     : 共 {s['og_total']:>4} 張 | 新增 {s['og_new']:>4} 張 | 更新 {s['og_updated']:>4} 張 | 略過 {s['og_skipped']:>4} 張")
        print(f"    - 封面縮圖        : 共 {s['thumb_total']:>4} 張 | 新增 {s['thumb_new']:>4} 張 | 更新 {s['thumb_updated']:>4} 張 | 略過 {s['thumb_skipped']:>4} 張")
        print(f"    - 內文縮圖        : 共 {s['inline_thumb_total']:>4} 張 | 新增 {s['inline_thumb_new']:>4} 張 | 更新 {s['inline_thumb_updated']:>4} 張 | 略過 {s['inline_thumb_skipped']:>4} 張")
        print("  " + "-"*80)
    
    cleanup_old_api_files()
    
    print(f"\n==========================================")
    print(f"📦 [最後階段] 開始修改路徑...")
    print(f"==========================================")
    update_extensions_to_webp()

    # 3. 執行細項 Hash 快取引擎，統整並輸出 data_version.json
    update_data_version()

    print(f"\n==========================================")
    print(f"過期tag提示 ({len(expiration_l)})")
    print(f"==========================================")
    if expiration_l:
        for i, val in enumerate(expiration_l, 1):
            print(i, val)
    else:
        print('無提示')
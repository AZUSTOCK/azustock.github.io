import os
import json
import re
from PIL import Image
from datetime import datetime, timedelta # ✨ 新增：用於計算過期時間
from tools.convert_webp import convert_to_webp_with_protection, generate_cover_thumbnail
from tools.update_paths import update_extensions_to_webp

# 準備一個 Set 來記錄所有合法的 API 檔案絕對路徑，用於最後的清理階段
valid_api_files = set()

expiration_l = []

# 全域統計數據
stats = {
    "proj_total": 0, "proj_new": 0, "proj_updated": 0, "proj_skipped": 0,       
    "art_total": 0,  "art_new": 0,  "art_updated": 0,  "art_skipped": 0,        
    "json_total": 0, "json_new": 0, "json_updated": 0, "json_skipped": 0,       
    "og_total": 0,   "og_new": 0,   "og_updated": 0,   "og_skipped": 0,         
    "thumb_total": 0, "thumb_new": 0, "thumb_updated": 0, "thumb_skipped": 0,    
    "inline_thumb_total": 0, "inline_thumb_new": 0, "inline_thumb_updated": 0, "inline_thumb_skipped": 0 
}

# ==========================================
# 🛠️ 輔助系統 (Helper Functions)
# ==========================================
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

def print_conversion(tag, src_path, dest_path):
    """輔助函式：印出圖片轉換前後的檔案大小"""
    if os.path.exists(src_path) and os.path.exists(dest_path):
        s_size = os.path.getsize(src_path) / 1024
        d_size = os.path.getsize(dest_path) / 1024
        print(f"  └─ {tag} {os.path.basename(dest_path)} ({s_size:.1f} KB -> {d_size:.1f} KB)")

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

def get_mtime_url(local_path, base_url):
    """獲取帶有最後修改時間戳的網址 (精準 Cache Busting)"""
    if os.path.exists(local_path):
        mtime = int(os.path.getmtime(local_path))
        return f"{base_url}?t={mtime}"
    return base_url

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
# 📝 升級版系統日誌生成器 (Changelog Generator)
# ==========================================
def generate_changelogs_json():
    base_dir = 'logs'
    output_data = []

    if not os.path.exists(base_dir):
        os.makedirs(base_dir, exist_ok=True)
        print(f"📁 已自動建立 '{base_dir}' 資料夾。")
        return

    for version_folder in sorted(os.listdir(base_dir), reverse=True):
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
            version = detail.get('version', version)
            description = detail.get('description', description)
            is_hidden = detail.get('hidden', False)

        if str(version).count('.') >= 3 or str(version_folder).count('.') >= 3 or is_hidden:
            print(f"  ⏭️ 隱藏內部測試紀錄: {version_folder} (不會顯示於前端)")
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
    output_data = {"categories": [], "projects": []}
    BASE_URL = "https://azustock.github.io"
    
    API_DIR = os.path.join("api")
    os.makedirs(API_DIR, exist_ok=True)
    
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
        print(f"❌ Directory '{base_dir}' not found.")
        return

    # 1. 掃描大分類 (Categories)
    for cat_folder in sorted(os.listdir(base_dir)):
        cat_path = os.path.join(base_dir, cat_folder)
        if not os.path.isdir(cat_path): continue

        default_order, clean_title = parse_folder_meta(cat_folder)
        cat_data = load_detail_json(os.path.join(cat_path, 'detail.json'))
        cat_cover = cat_data.get('cover')
        
        # ✨ 新增時間戳處理
        cat_cover_url = None
        if cat_cover:
            cat_cover_path = os.path.join(cat_path, cat_cover)
            cat_cover_url = get_mtime_url(cat_cover_path, f"{base_dir}/{cat_folder}/{cat_cover}")

        output_data["categories"].append({
            "order": cat_data.get('order', default_order),
            "id": cat_folder, 
            "title": cat_data.get('title', clean_title),
            "meta": cat_data.get('meta', ''),            
            "description": cat_data.get('description', ''), 
            "watermark_url": cat_data.get('watermark_url', ''), 
            "cover_image": cat_cover_url # ✨ 替換為有時間戳的網址
        })

        # 2. 掃描分類底下的專案 (Projects)
        for proj_folder in sorted(os.listdir(cat_path)):
            proj_path = os.path.join(cat_path, proj_folder)
            if not os.path.isdir(proj_path): continue

            stats["proj_total"] += 1
            proj_detail_path = os.path.join(proj_path, 'detail.json')
            proj_data = load_detail_json(proj_detail_path)
            default_proj_order, clean_proj_title = parse_folder_meta(proj_folder)
            
            # ✨ 呼叫過期檢查引擎 (專案層級)
            check_expiration_reminders(proj_data.get('title', clean_proj_title), "專案", proj_data, proj_detail_path)
            
            clean_proj_data = {
                'id': clean_proj_title,
                'category': cat_folder,
                'title': proj_data.get('title', clean_proj_title),
                'order': proj_data.get('order', default_proj_order),
                'default_sort': proj_data.get('default_sort', 'desc')
            }
            
            if proj_data.get('description'): clean_proj_data['description'] = proj_data.get('description')
            if proj_data.get('date'): clean_proj_data['date'] = proj_data.get('date')
            if proj_data.get('version'): clean_proj_data['version'] = str(proj_data.get('version'))
            if proj_data.get('tags'):
                sys_tags = {'MAJOR', 'HOTFIX', 'LATEST', 'FEATURE', 'NEW', 'UPDATED', 'REFACTOR', 'PATCH', 'ARCHIVED', 'WIP', 'OC'}
                clean_tags = []
                for t in proj_data.get('tags'):
                    base = str(t).split(':')[0].upper()
                    if base in sys_tags:
                        clean_tags.append(str(t).upper())
                    else:
                        clean_tags.append(t)
                clean_proj_data['tags'] = clean_tags
                
            if proj_data.get('link'): clean_proj_data['link'] = proj_data.get('link')
            
            for key in ['pinned', 'new', 'updated', 'wip', 'archived', 'hidden', 'sensitive']:
                val = proj_data.get(key) or proj_data.get(key.upper())
                if val is not None: clean_proj_data[f'is_{key}' if key != 'pinned' else 'pinned'] = val
            if proj_data.get('groups'): clean_proj_data['groups'] = proj_data.get('groups')
            
            proj_cover = proj_data.get('cover')
            if proj_cover:
                clean_proj_data['cover_image'] = f"{base_dir}/{cat_folder}/{proj_folder}/{proj_cover}"
                
            proj_data = clean_proj_data 
            articles = []

            proj_id = clean_proj_title
            proj_title = proj_data.get('title', clean_proj_title)
            proj_desc = proj_data.get('description', '查看專案內容')
            
            proj_api_dir = os.path.join(API_DIR, str(proj_id))
            os.makedirs(proj_api_dir, exist_ok=True)
            
            proj_og_filename = "og.webp"
            proj_og_local_path = os.path.join(proj_api_dir, proj_og_filename)
            bg_image_path = os.path.join("assets", "og_base.png")
            
            # ✨ 處理專案 OG 圖片
            if 'cover_image' in clean_proj_data:
                stats["og_total"] += 1
                local_proj_cover = clean_proj_data['cover_image']
                
                og_status = get_file_status([local_proj_cover, bg_image_path], proj_og_local_path, overwrite_og)
                if og_status in ('NEW', 'UPDATED'):
                    if create_og_image(local_proj_cover, proj_og_local_path, bg_image_path):
                        print_conversion("🖼️ [專案OG圖]", local_proj_cover, proj_og_local_path)
                        proj_img = f"{BASE_URL}/api/{proj_id}/{proj_og_filename}"
                        if og_status == 'NEW': stats["og_new"] += 1
                        else: stats["og_updated"] += 1
                    else:
                        proj_img = f"{BASE_URL}/{clean_proj_data['cover_image']}"
                else:
                    proj_img = f"{BASE_URL}/api/{proj_id}/{proj_og_filename}"
                    stats["og_skipped"] += 1
                valid_api_files.add(os.path.abspath(proj_og_local_path))

                # ✨ 處理專案封面縮圖 (Thumbnail)
                proj_thumb_filename = "cover_thumb.webp"
                proj_thumb_local_path = os.path.join(proj_api_dir, proj_thumb_filename)
                stats["thumb_total"] += 1 
                
                thumb_status = get_file_status([local_proj_cover], proj_thumb_local_path, overwrite_thumb)
                if thumb_status in ('NEW', 'UPDATED'):
                    if generate_cover_thumbnail(local_proj_cover, proj_thumb_local_path, max_width=180, quality=90):
                        print_conversion("🖼️ [專案縮圖]", local_proj_cover, proj_thumb_local_path)
                        # ✨ 加上時間戳
                        proj_data['cover_image'] = get_mtime_url(proj_thumb_local_path, f"./api/{proj_id}/{proj_thumb_filename}")
                        if thumb_status == 'NEW': stats["thumb_new"] += 1
                        else: stats["thumb_updated"] += 1
                else:
                    # ✨ 加上時間戳
                    proj_data['cover_image'] = get_mtime_url(proj_thumb_local_path, f"./api/{proj_id}/{proj_thumb_filename}")
                    stats["thumb_skipped"] += 1
                    
                valid_api_files.add(os.path.abspath(proj_thumb_local_path))

            else:
                proj_img = f"{BASE_URL}/assets/og.png"

            proj_target_url = f"/?p={proj_id}"
            proj_share_url = f"{BASE_URL}/api/{proj_id}/index.html"
            proj_html_path = os.path.join(proj_api_dir, "index.html")
            
            # ✨ 處理專案 HTML
            proj_html_status = get_file_status([proj_detail_path, proj_og_local_path], proj_html_path, overwrite_json)
            if proj_html_status in ('NEW', 'UPDATED'):
                with open(proj_html_path, "w", encoding="utf-8") as f:
                    f.write(html_template.format(
                        title=proj_title, description=proj_desc, 
                        image=proj_img, target_url=proj_target_url, share_url=proj_share_url
                    ))
                if proj_html_status == 'NEW': stats["proj_new"] += 1
                else: stats["proj_updated"] += 1
            else:
                stats["proj_skipped"] += 1
                
            valid_api_files.add(os.path.abspath(proj_html_path))

            # 3. 掃描專案底下的文章 (Articles)
            articles_dir = os.path.join(proj_path, 'articles')
            
            if os.path.exists(articles_dir) and os.path.isdir(articles_dir):
                for item in os.listdir(articles_dir):
                    item_path = os.path.join(articles_dir, item)
                    if not os.path.isdir(item_path): continue

                    stats["art_total"] += 1
                    art_detail_path = os.path.join(item_path, 'detail.json')
                    sub_data = load_detail_json(art_detail_path)
                    default_art_order, clean_art_title = parse_folder_meta(item)
                    
                    meta_title = sub_data.get('title', clean_art_title)
                    meta_desc = sub_data.get('description')
                    meta_order = sub_data.get('order', default_art_order)
                    
                    # ✨ 核心修正 1：判斷 JSON 內是否「有寫入」cover 屬性 (即使值為 null 也算數)
                    has_explicit_cover = 'cover' in sub_data
                    meta_cover = sub_data.get('cover')
                    
                    # ✨ 呼叫過期檢查引擎 (文章層級)
                    check_expiration_reminders(meta_title, "文章", sub_data, art_detail_path)

                    md_file_path = None
                    rel_base = f"{base_dir}/{cat_folder}/{proj_folder}/articles/{item}"

                    for sub_item in os.listdir(item_path):
                        if sub_item.endswith('.md'):
                            md_file_path = os.path.join(item_path, sub_item)
                        # ✨ 核心修正 2：如果沒有手動設定 cover，且檔名符合白名單，才自動設為封面
                        elif not has_explicit_cover and sub_item.lower() in ['basic.webp', 'architecture.webp']:
                            meta_cover = sub_item
                                
                    if md_file_path:
                        try:
                            art_id = clean_art_title
                            art_dir = os.path.join("api", proj_id, art_id)
                            os.makedirs(art_dir, exist_ok=True)
                            
                            content_filename = "contents.json"
                            content_filepath = os.path.join(art_dir, content_filename)
                            
                            with open(md_file_path, 'r', encoding='utf-8') as md_file:
                                raw_md_content = md_file.read() 
                                
                            if sub_data.get('title') is None and raw_md_content.startswith('# '):
                                meta_title = raw_md_content.split('\n')[0].replace('# ', '').strip()
                            
                            content = raw_md_content 
                            real_path = f"./projects/{cat_folder}/{proj_folder}/articles/{item}/"
                            
                            def replace_md_img(match):
                                alt_text, url_part = match.group(1), match.group(2).strip()
                                title_match = re.search(r'(.*?)\s+(["\'])(.*?)\2$', url_part)
                                if title_match:
                                    url = title_match.group(1)
                                    title_str = f' {title_match.group(2)}{title_match.group(3)}{title_match.group(2)}'
                                else:
                                    url = url_part
                                    title_str = ""
                                
                                if not url.startswith(('http://', 'https://', 'data:')) and 'projects/' not in url:
                                    # ✨ 1. 將所有出現的 './' 全局替換為專案真實路徑 (解決雙重路徑問題)
                                    fixed_url = url.replace('./', real_path)
                                    
                                    # 拆解網址，判斷主檔案類型
                                    main_url = fixed_url.split('#')[0]
                                    local_main_path = os.path.normpath(main_url)
                                    ext = os.path.splitext(local_main_path)[1].lower()
                                    
                                    # ✨ 2. 擴充白名單，讓影音格式也能通過並加上時間戳
                                    valid_media_exts = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.mp4', '.webm', '.ogg', '.mp3', '.wav'}
                                    if ext not in valid_media_exts:
                                        return f"![{alt_text}]({fixed_url}{title_str})"
                                        
                                    # ✨ 3. 為所有的檔案碎片 (主檔名、#poster、#full) 精準加上快取時間戳
                                    parts = fixed_url.split('#')
                                    stamped_parts = []
                                    for p in parts:
                                        if p.startswith('poster='):
                                            p_path = p[7:]
                                            stamped_parts.append(f"poster={get_mtime_url(os.path.normpath(p_path), p_path)}")
                                        elif p.startswith('full='):
                                            p_path = p[5:]
                                            stamped_parts.append(f"full={get_mtime_url(os.path.normpath(p_path), p_path)}")
                                        else:
                                            stamped_parts.append(get_mtime_url(os.path.normpath(p), p))
                                            
                                    final_stamped_url = '#'.join(stamped_parts)
                                    
                                    # ✨ 4. 如果是圖片，才進入縮圖產生邏輯
                                    valid_image_exts = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'}
                                    if ext in valid_image_exts and os.path.exists(local_main_path):
                                        stats["inline_thumb_total"] += 1
                                        clean_url = main_url.replace(real_path, '')
                                        safe_name = clean_url.replace('/', '_').replace('\\', '_')
                                        thumb_dir = os.path.join(art_dir, "thumbnails")
                                        os.makedirs(thumb_dir, exist_ok=True)
                                        thumb_filename = f"thumb_{os.path.splitext(safe_name)[0]}.webp"
                                        thumb_local_path = os.path.join(thumb_dir, thumb_filename)
                                        
                                        inline_status = get_file_status([local_main_path], thumb_local_path, overwrite_thumb)
                                        if inline_status in ('NEW', 'UPDATED'):
                                            success = generate_cover_thumbnail(local_main_path, thumb_local_path, max_width=800, quality=85)
                                            if success:
                                                print_conversion("🖼️ [內文縮圖]", local_main_path, thumb_local_path)
                                                if inline_status == 'NEW': stats["inline_thumb_new"] += 1
                                                else: stats["inline_thumb_updated"] += 1
                                            else:
                                                stats["inline_thumb_skipped"] += 1
                                        else:
                                            stats["inline_thumb_skipped"] += 1
                                            
                                        valid_api_files.add(os.path.abspath(thumb_local_path))
                                        
                                        thumb_url = get_mtime_url(thumb_local_path, f"./api/{proj_id}/{art_id}/thumbnails/{thumb_filename}")
                                        orig_url_t = get_mtime_url(local_main_path, main_url)
                                        
                                        # 組合帶有原圖連結的縮圖網址
                                        if '#full=' in final_stamped_url:
                                            return f"![{alt_text}]({thumb_url}#{final_stamped_url.split('#', 1)[1]}{title_str})"
                                        else:
                                            return f"![{alt_text}]({thumb_url}#full={orig_url_t}{title_str})"
                                            
                                    # ✨ 5. 如果是影片/音樂 (不會進縮圖) 或圖片不存在，直接回傳帶有正確路徑與時間戳的結果
                                    return f"![{alt_text}]({final_stamped_url}{title_str})"
                                        
                                return f"![{alt_text}]({url_part})"
                                
                            content = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_md_img, content)

                            def replace_html_img(match):
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
                                        stats["inline_thumb_total"] += 1
                                        safe_name = clean_url.replace('/', '_').replace('\\', '_')
                                        thumb_dir = os.path.join(art_dir, "thumbnails")
                                        os.makedirs(thumb_dir, exist_ok=True)
                                        thumb_filename = f"thumb_{os.path.splitext(safe_name)[0]}.webp"
                                        thumb_local_path = os.path.join(thumb_dir, thumb_filename)
                                        
                                        inline_status = get_file_status([local_img_path], thumb_local_path, overwrite_thumb)
                                        if inline_status in ('NEW', 'UPDATED'):
                                            success = generate_cover_thumbnail(local_img_path, thumb_local_path, max_width=800, quality=85)
                                            if success:
                                                print_conversion("🖼️ [內文縮圖]", local_img_path, thumb_local_path)
                                                if inline_status == 'NEW': stats["inline_thumb_new"] += 1
                                                else: stats["inline_thumb_updated"] += 1
                                            else:
                                                stats["inline_thumb_skipped"] += 1
                                        else:
                                            stats["inline_thumb_skipped"] += 1
                                            
                                        valid_api_files.add(os.path.abspath(thumb_local_path))
                                        # ✨ 幫原圖與縮圖都加上時間戳
                                        thumb_url = get_mtime_url(thumb_local_path, f"./api/{proj_id}/{art_id}/thumbnails/{thumb_filename}")
                                        orig_url_t = get_mtime_url(local_img_path, orig_url)
                                        return f'{prefix}{thumb_url}" data-full="{orig_url_t}"{suffix[1:]}'
                                        
                                return f"{prefix}{url}{suffix}"
                                
                            content = re.sub(r'(<img[^>]+src=["\'])([^"\']+)(["\'][^>]*>)', replace_html_img, content)

                            # ✨ 處理 Markdown 轉 JSON
                            stats["json_total"] += 1
                            json_status = get_file_status([md_file_path], content_filepath, overwrite_json)
                            if json_status in ('NEW', 'UPDATED'):
                                with open(content_filepath, 'w', encoding='utf-8') as af:
                                    json.dump({"content": content}, af, ensure_ascii=False)
                                if json_status == 'NEW': stats["json_new"] += 1
                                else: stats["json_updated"] += 1
                            else:
                                stats["json_skipped"] += 1
                                
                            valid_api_files.add(os.path.abspath(content_filepath))

                            # ✨ 單篇文章 Share 中轉頁處理 & OG 生成
                            art_title = meta_title
                            art_desc = meta_desc if meta_desc else proj_desc
                            og_local_path = os.path.join(art_dir, "og.webp")
                            
                            if meta_cover:
                                stats["og_total"] += 1
                                local_cover_path = os.path.join(item_path, meta_cover)
                                bg_image_path = os.path.join("assets", "og.png")
                                
                                art_og_status = get_file_status([local_cover_path, bg_image_path], og_local_path, overwrite_og)
                                if art_og_status in ('NEW', 'UPDATED'):
                                    if create_og_image(local_cover_path, og_local_path, bg_image_path):
                                        print_conversion("🖼️ [文章OG圖]", local_cover_path, og_local_path)
                                        art_img = f"{BASE_URL}/api/{proj_id}/{art_id}/og.webp"
                                        if art_og_status == 'NEW': stats["og_new"] += 1
                                        else: stats["og_updated"] += 1
                                    else:
                                        art_img = f"{BASE_URL}/{rel_base}/{meta_cover}"
                                else:
                                    art_img = f"{BASE_URL}/api/{proj_id}/{art_id}/og.webp"
                                    stats["og_skipped"] += 1
                                valid_api_files.add(os.path.abspath(og_local_path))

                                art_thumb_filename = "cover_thumb.webp"
                                art_thumb_local_path = os.path.join(art_dir, art_thumb_filename)
                                stats["thumb_total"] += 1
                                
                                art_thumb_status = get_file_status([local_cover_path], art_thumb_local_path, overwrite_thumb)
                                if art_thumb_status in ('NEW', 'UPDATED'):
                                    if generate_cover_thumbnail(local_cover_path, art_thumb_local_path, max_width=160, quality=90):
                                        print_conversion("🖼️ [文章縮圖]", local_cover_path, art_thumb_local_path)
                                        # ✨ 加上時間戳
                                        meta_cover_url = get_mtime_url(art_thumb_local_path, f"./api/{proj_id}/{art_id}/{art_thumb_filename}")
                                        if art_thumb_status == 'NEW': stats["thumb_new"] += 1
                                        else: stats["thumb_updated"] += 1 
                                    else:
                                        # ✨ 退回原圖也要加時間戳
                                        meta_cover_url = get_mtime_url(local_cover_path, f"{rel_base}/{meta_cover}") 
                                else:
                                    # ✨ 加上時間戳
                                    meta_cover_url = get_mtime_url(art_thumb_local_path, f"./api/{proj_id}/{art_id}/{art_thumb_filename}")
                                    stats["thumb_skipped"] += 1
                                    
                                valid_api_files.add(os.path.abspath(art_thumb_local_path))

                            else:
                                art_img = proj_img
                                
                            art_target_url = f"/?p={proj_id}&a={art_id}"
                            art_share_url = f"{BASE_URL}/api/{proj_id}/{art_id}/index.html"
                            art_html_path = os.path.join(art_dir, "index.html")

                            art_html_status = get_file_status([art_detail_path, md_file_path, og_local_path], art_html_path, overwrite_json)
                            if art_html_status in ('NEW', 'UPDATED'):
                                with open(art_html_path, "w", encoding="utf-8") as f:
                                    f.write(html_template.format(
                                        title=f"{art_title} | {proj_title}", description=art_desc, 
                                        image=art_img, target_url=art_target_url, share_url=art_share_url
                                    ))
                                if art_html_status == 'NEW': stats["art_new"] += 1
                                else: stats["art_updated"] += 1
                            else:
                                stats["art_skipped"] += 1
                                    
                            valid_api_files.add(os.path.abspath(art_html_path))

                            article_obj = {
                                "id": art_id,
                                "sort_order": meta_order,     
                                "title": meta_title,
                                "content_path": f"./api/{proj_id}/{art_id}/{content_filename}"
                            }

                            if meta_desc: article_obj["description"] = meta_desc
                            if meta_cover: article_obj["cover_image"] = meta_cover_url
                            if sub_data.get('date'): article_obj["date"] = sub_data.get('date')
                            if sub_data.get('tags'):
                                sys_tags = {'MAJOR', 'HOTFIX', 'LATEST', 'FEATURE', 'NEW', 'UPDATED', 'REFACTOR', 'PATCH', 'ARCHIVED', 'WIP', 'OC'}
                                clean_tags = []
                                for t in sub_data.get('tags'):
                                    base = str(t).split(':')[0].upper()
                                    if base in sys_tags:
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

    print(f"✅ JSON 打包完成，包含 {len(output_data['projects'])} 個專案。")

    with open('all_projects.json', 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

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
    
    generate_changelogs_json()

    print(f"\n📊 [處理統計]")
    print(f"  - 專案 HTML (index)       : 共 {stats['proj_total']:>4} 個 | 新增 {stats['proj_new']:>4} 個 | 更新 {stats['proj_updated']:>4} 個 | 略過 {stats['proj_skipped']:>4} 個")
    print(f"  - 文章 HTML (index)       : 共 {stats['art_total']:>4} 個 | 新增 {stats['art_new']:>4} 個 | 更新 {stats['art_updated']:>4} 個 | 略過 {stats['art_skipped']:>4} 個")
    print(f"  - 內文 JSON (contents)    : 共 {stats['json_total']:>4} 個 | 新增 {stats['json_new']:>4} 個 | 更新 {stats['json_updated']:>4} 個 | 略過 {stats['json_skipped']:>4} 個")
    print(f"  - 分享圖 (OG webp)        : 共 {stats['og_total']:>4} 張 | 新增 {stats['og_new']:>4} 張 | 更新 {stats['og_updated']:>4} 張 | 略過 {stats['og_skipped']:>4} 張")
    print(f"  - 封面縮圖 (cover_thumb)  : 共 {stats['thumb_total']:>4} 張 | 新增 {stats['thumb_new']:>4} 張 | 更新 {stats['thumb_updated']:>4} 張 | 略過 {stats['thumb_skipped']:>4} 張")
    print(f"  - 內文縮圖 (inline_thumb) : 共 {stats['inline_thumb_total']:>4} 張 | 新增 {stats['inline_thumb_new']:>4} 張 | 更新 {stats['inline_thumb_updated']:>4} 張 | 略過 {stats['inline_thumb_skipped']:>4} 張")
    
    cleanup_old_api_files()
    
    print(f"\n==========================================")
    print(f"📦 [最後階段] 開始修改路徑...")
    print(f"==========================================")
    update_extensions_to_webp()

    print(f"\n==========================================")
    print(f"過期tag提示 ({len(expiration_l)})")
    print(f"==========================================")
    if expiration_l:
        for i, val in enumerate(expiration_l, 1):
            print(i, val)
    else:
        print('無提示')
import os
import json
import re
from PIL import Image
from convert_webp import convert_to_webp_with_protection, generate_cover_thumbnail
from update_paths import update_extensions_to_webp

# 準備一個 Set 來記錄所有合法的 API 檔案絕對路徑，用於最後的清理階段
valid_api_files = set()

# 全域統計數據
stats = {
    "proj_total": 0, "proj_updated": 0, "proj_skipped": 0,
    "art_total": 0,  "art_updated": 0,  "art_skipped": 0,
    "og_total": 0,   "og_updated": 0,   "og_skipped": 0,
    "thumb_total": 0, "thumb_updated": 0, "thumb_skipped": 0
}

# ==========================================
# 🛠️ 輔助系統 (Helper Functions)
# ==========================================
def is_file_outdated(source_paths, target_path):
    """
    智慧判斷目標檔案是否需要更新
    只要目標檔案不存在，或是任何一個來源檔案的修改時間 (mtime) 大於目標檔案，就回傳 True
    """
    if not os.path.exists(target_path):
        return True
        
    target_time = os.path.getmtime(target_path)
    for src in source_paths:
        if src and os.path.exists(src):
            if os.path.getmtime(src) > target_time:
                return True
    return False

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
        bg.convert("RGB").save(output_path, "WEBP", quality=90)
        return True
    except Exception as e:
        print(f"⚠️ 生成 OG 圖片失敗 {original_path}: {e}")
        return False

def parse_folder_meta(folder_name):
    match = re.match(r'^(\d+)_+(.*)$', folder_name)
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

# ==========================================
# 🚀 主生成器邏輯
# ==========================================
def generate_projects_json():
    base_dir = 'projects'
    output_data = {"categories": [], "projects": []}

    is_github_actions = os.getenv("GITHUB_ACTIONS") == "true"
    BASE_URL = "https://azustock.github.io"
    
    API_DIR = os.path.join("api")
    os.makedirs(API_DIR, exist_ok=True)
    
    html_template = """<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <!-- Open Graph / Facebook / Line 專用 -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{share_url}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="{image}">
    
    <!-- Twitter 專用 -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image}">
    
    <!-- 自動跳轉回主程式 -->
    <script>window.location.replace("{target_url}");</script>
</head>
<body>
    <p>正在載入文章... 如果沒有自動跳轉，請 <a href="{target_url}">點擊這裡</a>。</p>
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

        output_data["categories"].append({
            "order": cat_data.get('order', default_order),
            "id": cat_folder, 
            "title": cat_data.get('title', clean_title),
            "meta": cat_data.get('meta', ''),            
            "description": cat_data.get('description', ''), 
            "cover_image": f"{base_dir}/{cat_folder}/{cat_cover}" if cat_cover else None
        })

        # 2. 掃描分類底下的專案 (Projects)
        for proj_folder in sorted(os.listdir(cat_path)):
            proj_path = os.path.join(cat_path, proj_folder)
            if not os.path.isdir(proj_path): continue

            stats["proj_total"] += 1
            proj_detail_path = os.path.join(proj_path, 'detail.json')
            proj_data = load_detail_json(proj_detail_path)
            default_proj_order, clean_proj_title = parse_folder_meta(proj_folder)
            
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
            if proj_data.get('tags'): clean_proj_data['tags'] = proj_data.get('tags')
            if proj_data.get('link'): clean_proj_data['link'] = proj_data.get('link')
            
            if proj_data.get('pinned'): clean_proj_data['pinned'] = True
            if proj_data.get('new'): clean_proj_data['is_new'] = True
            if proj_data.get('updated'): clean_proj_data['is_updated'] = True
            if proj_data.get('wip'): clean_proj_data['is_wip'] = True
            if proj_data.get('archived'): clean_proj_data['is_archived'] = True
            if proj_data.get('groups'): clean_proj_data['groups'] = proj_data.get('groups')
            
            proj_cover = proj_data.get('cover')
            if proj_cover:
                clean_proj_data['cover_image'] = f"{base_dir}/{cat_folder}/{proj_folder}/{proj_cover}"
                
            proj_data = clean_proj_data 
            articles = []

            # 專案目錄 Share 中轉頁處理
            proj_id = clean_proj_title
            proj_title = proj_data.get('title', clean_proj_title)
            proj_desc = proj_data.get('description', '查看專案內容')
            
            proj_api_dir = os.path.join(API_DIR, str(proj_id))
            os.makedirs(proj_api_dir, exist_ok=True)
            
            proj_og_filename = "og.webp"
            proj_og_local_path = os.path.join(proj_api_dir, proj_og_filename)
            bg_image_path = os.path.join("assets", "og_base.png")
            
            # ✨ 處理專案 OG 圖片 (智慧更新)
            if 'cover_image' in clean_proj_data:
                stats["og_total"] += 1
                local_proj_cover = clean_proj_data['cover_image']
                
                if is_file_outdated([local_proj_cover, bg_image_path], proj_og_local_path):
                    if create_og_image(local_proj_cover, proj_og_local_path, bg_image_path):
                        proj_img = f"{BASE_URL}/api/{proj_id}/{proj_og_filename}"
                        stats["og_updated"] += 1
                    else:
                        proj_img = f"{BASE_URL}/{clean_proj_data['cover_image']}"
                else:
                    proj_img = f"{BASE_URL}/api/{proj_id}/{proj_og_filename}"
                    stats["og_skipped"] += 1
                valid_api_files.add(os.path.abspath(proj_og_local_path))

                # ==========================================
                # ✨ 新增：處理專案封面縮圖 (Thumbnail)
                # ==========================================
                proj_thumb_filename = "cover_thumb.webp"
                proj_thumb_local_path = os.path.join(proj_api_dir, proj_thumb_filename)
                
                stats["thumb_total"] += 1 # ✨ 總數 +1
                
                # 利用智慧更新判斷：如果原圖有改，才重新生成縮圖
                if is_file_outdated([local_proj_cover], proj_thumb_local_path):
                    if generate_cover_thumbnail(local_proj_cover, proj_thumb_local_path, max_width=320, quality=90):
                        proj_data['cover_image'] = f"./api/{proj_id}/{proj_thumb_filename}"
                        stats["thumb_updated"] += 1 # ✨ 更新數 +1
                else:
                    # 如果不需更新，也要將 JSON 中的路徑導向縮圖
                    proj_data['cover_image'] = f"./api/{proj_id}/{proj_thumb_filename}"
                    stats["thumb_skipped"] += 1 # ✨ 略過數 +1
                    
                # 加入白名單，防止被清理函數刪除
                valid_api_files.add(os.path.abspath(proj_thumb_local_path))

            else:
                proj_img = f"{BASE_URL}/assets/og.png"

            proj_target_url = f"/?p={proj_id}"
            proj_share_url = f"{BASE_URL}/api/{proj_id}/index.html"
            proj_html_path = os.path.join(proj_api_dir, "index.html")
            
            # ✨ 處理專案 HTML (智慧更新)
            if is_file_outdated([proj_detail_path, proj_og_local_path], proj_html_path):
                with open(proj_html_path, "w", encoding="utf-8") as f:
                    f.write(html_template.format(
                        title=proj_title, description=proj_desc, 
                        image=proj_img, target_url=proj_target_url, share_url=proj_share_url
                    ))
                stats["proj_updated"] += 1
            else:
                stats["proj_skipped"] += 1
                
            valid_api_files.add(os.path.abspath(proj_html_path))

            # 3. 掃描專案底下的文章 (Articles)
            # ✨ 修正 1：指定去 articles 資料夾底下尋找
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
                    meta_cover = sub_data.get('cover')

                    md_file_path = None
                    # ✨ 修正 2：封面圖片的相對路徑加上 articles/
                    rel_base = f"{base_dir}/{cat_folder}/{proj_folder}/articles/{item}"

                    # 🚨 修正縮排：這裡必須在上面的 for item 迴圈裡面！
                    for sub_item in os.listdir(item_path):
                        if sub_item.endswith('.md'):
                            md_file_path = os.path.join(item_path, sub_item)
                        elif sub_item.lower().endswith(('.webp',)) and not meta_cover:
                            meta_cover = sub_item
                                
                    if md_file_path:
                        try:
                            art_id = clean_art_title
                            art_dir = os.path.join("api", proj_id, art_id)
                            os.makedirs(art_dir, exist_ok=True)
                            
                            content_filename = "contents.json"
                            content_filepath = os.path.join(art_dir, content_filename)
                            
                            # ==========================================
                            # ✨ 修正點 1：統一在最前面解析標題，確保後續 HTML 生成能拿到正確名稱
                            # ==========================================
                            with open(md_file_path, 'r', encoding='utf-8') as md_file:
                                raw_md_content = md_file.read() 
                                
                            if sub_data.get('title') is None and raw_md_content.startswith('# '):
                                meta_title = raw_md_content.split('\n')[0].replace('# ', '').strip()
                            
                            # ✨ 處理 Markdown 轉 JSON (智慧更新)
                            if is_file_outdated([md_file_path], content_filepath):
                                content = raw_md_content # 直接拿剛剛讀好的
                                
                                # ✨ 修正 3：讓內文的圖片也能抓到正確的 articles/ 路徑
                                real_path = f"./projects/{cat_folder}/{proj_folder}/articles/{item}/"
                                
                                def replace_md_img(match):
                                    alt_text, url = match.group(1), match.group(2)
                                    if not url.startswith(('http://', 'https://', 'data:')) and 'projects/' not in url:
                                        url = f"{real_path}{url[2:] if url.startswith('./') else url}"
                                    return f"![{alt_text}]({url})"
                                    
                                content = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_md_img, content)

                                def replace_html_img(match):
                                    prefix, url, suffix = match.group(1), match.group(2), match.group(3)
                                    if not url.startswith(('http://', 'https://', 'data:')) and 'projects/' not in url:
                                        url = f"{real_path}{url[2:] if url.startswith('./') else url}"
                                    return f"{prefix}{url}{suffix}"
                                    
                                content = re.sub(r'(<img[^>]+src=["\'])([^"\']+)(["\'][^>]*>)', replace_html_img, content)

                                with open(content_filepath, 'w', encoding='utf-8') as af:
                                    json.dump({"content": content}, af, ensure_ascii=False)
                                    
                                stats["art_updated"] += 1
                            else:
                                stats["art_skipped"] += 1
                                
                            valid_api_files.add(os.path.abspath(content_filepath))

                            # ✨ 單篇文章 Share 中轉頁處理 & OG 生成 (智慧更新)
                            art_title = meta_title
                            art_desc = meta_desc if meta_desc else proj_desc
                            og_local_path = os.path.join(art_dir, "og.webp")
                            
                            if meta_cover:
                                stats["og_total"] += 1
                                local_cover_path = os.path.join(item_path, meta_cover)
                                bg_image_path = os.path.join("assets", "og.png")
                                
                                if is_file_outdated([local_cover_path, bg_image_path], og_local_path):
                                    if create_og_image(local_cover_path, og_local_path, bg_image_path):
                                        art_img = f"{BASE_URL}/api/{proj_id}/{art_id}/og.webp"
                                        stats["og_updated"] += 1
                                    else:
                                        art_img = f"{BASE_URL}/{rel_base}/{meta_cover}"
                                else:
                                    art_img = f"{BASE_URL}/api/{proj_id}/{art_id}/og.webp"
                                    stats["og_skipped"] += 1
                                valid_api_files.add(os.path.abspath(og_local_path))

                                # ==========================================
                                # ✨ 新增：處理文章封面縮圖 (Thumbnail)
                                # ==========================================
                                art_thumb_filename = "cover_thumb.webp"
                                art_thumb_local_path = os.path.join(art_dir, art_thumb_filename)
                                
                                stats["thumb_total"] += 1 # ✨ 總數 +1
                                
                                if is_file_outdated([local_cover_path], art_thumb_local_path):
                                    # 目錄的縮圖更小，寬度設定 160 即可
                                    if generate_cover_thumbnail(local_cover_path, art_thumb_local_path, max_width=160, quality=90):
                                        meta_cover_url = f"./api/{proj_id}/{art_id}/{art_thumb_filename}"
                                        stats["thumb_updated"] += 1 # ✨ 更新數 +1
                                    else:
                                        meta_cover_url = f"{rel_base}/{meta_cover}" # 失敗則退回原圖
                                else:
                                    meta_cover_url = f"./api/{proj_id}/{art_id}/{art_thumb_filename}"
                                    stats["thumb_skipped"] += 1 # ✨ 略過數 +1
                                    
                                valid_api_files.add(os.path.abspath(art_thumb_local_path))

                            else:
                                art_img = proj_img
                                
                            art_target_url = f"/?p={proj_id}&a={art_id}"
                            art_share_url = f"{BASE_URL}/api/{proj_id}/{art_id}/index.html"
                            art_html_path = os.path.join(art_dir, "index.html")

                            if is_file_outdated([art_detail_path, md_file_path, og_local_path], art_html_path):
                                with open(art_html_path, "w", encoding="utf-8") as f:
                                    f.write(html_template.format(
                                        title=f"{art_title} | {proj_title}", description=art_desc, 
                                        image=art_img, target_url=art_target_url, share_url=art_share_url
                                    ))
                                    
                            valid_api_files.add(os.path.abspath(art_html_path))

                            # 建立純淨的文章基底
                            article_obj = {
                                "id": art_id,
                                "sort_order": meta_order,     
                                "title": meta_title,
                                "content_path": f"./api/{proj_id}/{art_id}/{content_filename}"
                            }

                            if meta_desc: article_obj["description"] = meta_desc
                            if meta_cover: article_obj["cover_image"] = meta_cover_url
                            if sub_data.get('date'): article_obj["date"] = sub_data.get('date')
                            if sub_data.get('tags'): article_obj["tags"] = sub_data.get('tags')
                            
                            for key in ['pinned', 'new', 'updated', 'wip', 'archived']:
                                if sub_data.get(key): article_obj[f'is_{key}' if key != 'pinned' else 'pinned'] = True

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

            # 修改 generate_projects_json 中 articles 的排序區塊
            if articles:
                def article_sort(x):
                    pinned_val = 1 if x.get('pinned', False) else 0
                    # 直接由小到大排序 (01, 02, 03...)
                    order_val = int(x.get('sort_order', 999))
                    return (-pinned_val, order_val)

                # 這裡直接執行升冪排序，不需要判斷 default_sort
                sorted_articles = sorted(articles, key=article_sort)
                for art in sorted_articles:
                    if 'sort_order' in art: del art['sort_order']
                    if 'folder_name' in art: del art['folder_name']
                proj_data['articles'] = sorted_articles

            output_data["projects"].append(proj_data)

    # 4. 全域防呆排序與存檔
    def safe_sort(x):
        val = x.get('order', 999)
        return int(val) if str(val).isdigit() else 999

    output_data["categories"].sort(key=safe_sort)
    cat_order_map = {cat['id']: cat['order'] for cat in output_data["categories"]}

    # 修改 generate_projects.py 中的 proj_sort
    def proj_sort(x):
        # 1. 優先根據類別的 order 排序
        cat_order = cat_order_map.get(x.get('category'), 999)
        # 2. 其次根據是否置頂 (pinned 為 True 的排在前面)
        pinned_val = -1 if x.get('pinned', False) else 0
        # 3. ✨ 加上負號：讓專案本身的 order 數值越大的排越前面 (由新到舊)
        p_order = -int(x.get('order', 999))
        
        return (cat_order, pinned_val, p_order, x.get('id', ''))

    output_data["projects"].sort(key=proj_sort)

    # 在 json.dump 之前
    print(f"✅ JSON 打包完成，包含 {len(output_data['projects'])} 個專案。")
    for p in output_data['projects']:
        print(f"   - [{p['category']}] {p['id']} (Order: {p['order']})")

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
    
    # Bottom-up 遍歷，這樣刪除完檔案後可以直接刪除空的父資料夾
    for root, dirs, files in os.walk(api_dir, topdown=False):
        for name in files:
            file_path = os.path.abspath(os.path.join(root, name))
            if file_path not in valid_api_files:
                os.remove(file_path)
                deleted_files += 1
                print(f"🗑️ 刪除廢棄檔案: {os.path.relpath(file_path)}")
                
        # 檢查資料夾是否為空，若是則刪除
        for name in dirs:
            dir_path = os.path.join(root, name)
            if not os.listdir(dir_path):
                os.rmdir(dir_path)
                deleted_dirs += 1
                print(f"📁 刪除空資料夾: {os.path.relpath(dir_path)}")
                
    print(f"✅ 清理完成！共刪除 {deleted_files} 個檔案, {deleted_dirs} 個資料夾。")


if __name__ == "__main__":
    convert_to_webp_with_protection(directory="projects", quality=90, auto_mode=False)
    
    print(f"\n==========================================")
    print(f"📦 [第二階段] 開始解析 Markdown 並打包 JSON 資料庫...")
    print(f"==========================================")
    generate_projects_json()
    
    print(f"\n📊 [處理統計]")
    print(f"  - 專案 (Projects): 共 {stats['proj_total']} 個 | 更新 {stats['proj_updated']} 個 | 略過 {stats['proj_skipped']} 個")
    print(f"  - 文章 (Articles): 共 {stats['art_total']} 個 | 更新 {stats['art_updated']} 個 | 略過 {stats['art_skipped']} 個")
    print(f"  - 圖片 (OG Images): 共 {stats['og_total']} 個 | 更新 {stats['og_updated']} 個 | 略過 {stats['og_skipped']} 個")
    print(f"  - 縮圖 (Thumbnails): 共 {stats['thumb_total']} 個 | 更新 {stats['thumb_updated']} 個 | 略過 {stats['thumb_skipped']} 個")
    
    cleanup_old_api_files()
    
    print(f"\n==========================================")
    print(f"📦 [最後階段] 開始修改路徑...")
    print(f"==========================================")
    update_extensions_to_webp()
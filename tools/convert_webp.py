import os
import glob
import time
from PIL import Image
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# ✨ 支援由外部主程式呼叫 (tools.cout) 或在 tools 目錄下單獨執行 (cout)
try:
    from tools.cout import cout
except ImportError:
    from cout import cout

# ✨ 魔法路徑：自動從 tools 資料夾往上一層找到 projects
DEFAULT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'projects'))

# ==========================================
# 🛡️ 防偽與轉檔設定區
# ==========================================
MAX_SIZE = (1920, 1920) 
RATIO = 0.8
AUTHOR_NAME = "風川梓 (Azustock)"

def get_copyright_exif(img):
    """產生帶有專屬版權宣告的 EXIF 數位簽章位元組"""
    current_year = datetime.now().year
    copyright_text = f"Copyright (c) {current_year} {AUTHOR_NAME}. All rights reserved."
    
    clean_exif = img.getexif()
    clean_exif.clear()
    clean_exif[40093] = (AUTHOR_NAME + '\x00').encode('utf-16le')
    clean_exif[40092] = (copyright_text + '\x00').encode('utf-16le')
    clean_exif[315] = "Azustock" 
    
    return clean_exif.tobytes()

def _convert_single_worker(img_path, force_overwrite, quality, max_size, ratio):
    """單張圖片轉檔 Worker (供 ThreadPoolExecutor 平行呼叫，不直接印出訊息以避免多執行緒輸出交錯)"""
    try:
        file_name, _ = os.path.splitext(img_path)
        
        # ✨ 新增：如果檔名結尾或名稱中包含 _ori，直接回傳 IGNORE 狀態，完全不處理
        if "_ori" in file_name:
            return ('IGNORE', img_path, None, None)
            
        webp_path = f"{file_name}.webp"
        existed_before = os.path.exists(webp_path)
        
        if existed_before and not force_overwrite:
            return ('SKIPPED', img_path, webp_path, None)
            
        with Image.open(img_path) as img:
            clean_img = img.convert("RGBA")
            clean_img.info.clear()

            orig_width, orig_height = clean_img.size

            if orig_width > 300 and orig_height > 300:
                new_width = int(orig_width * ratio)
                new_height = int(orig_height * ratio)
                target_width = min(new_width, max_size[0])
                target_height = min(new_height, max_size[1])
                clean_img.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
            else:
                clean_img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            exif_bytes = get_copyright_exif(clean_img)
            clean_img.save(webp_path, "webp", quality=quality, exif=exif_bytes)
        
        status = 'OVERWRITTEN' if (existed_before and force_overwrite) else 'CONVERTED'
        return (status, img_path, webp_path, None)
        
    except Exception as e:
        return ('ERROR', img_path, None, str(e))

def convert_to_webp_with_protection(directory=DEFAULT_DIR, quality=90, auto_mode=None, max_size=MAX_SIZE, ratio=RATIO):
    """
    掃描目錄下的圖片，利用多核心平行進行「降解析度」、「寫入版權 EXIF」並轉換為 WebP。
    """
    cout.stage("第一階段", "啟動 WebP 多核心轉檔與防禦系統...", icon_key='search')
    
    if auto_mode is not None:
        force_overwrite = auto_mode
        mode_text = "複寫" if force_overwrite else "跳過"
        cout.info(f"系統自動執行中：已設定遇到舊檔時「{mode_text}」。", icon_key='config')
    else:
        user_choice = cout.menu(
            "遇到已經存在的 .webp 檔案時，您希望如何處理？",
            [
                ("1", "跳過 (保留舊檔案，速度最快 - 預設)"),
                ("2", "複寫 (強制重新轉檔並覆蓋舊檔案)")
            ],
            prompt_text="請選擇 [1 或 2]", default="1"
        )
        force_overwrite = (user_choice == '2')

        if force_overwrite:
            cout.warn("已選擇「複寫」模式：將使用多核心強制重新轉檔所有圖片！")
        else:
            cout.success("已選擇「跳過」模式：只會處理尚未轉檔的新圖片。")

    t_start = time.perf_counter()

    search_patterns = [
        os.path.join(directory, "**/*.png"),
        os.path.join(directory, "**/*.jpg"),
        os.path.join(directory, "**/*.jpeg")
    ]
    
    image_files = []
    for pattern in search_patterns:
        image_files.extend(glob.glob(pattern, recursive=True))

    if not image_files:
        cout.skip("沒有找到需要轉換的圖片。", indent=0)
        return

    success_count = 0
    skip_count = 0
    max_workers = min(32, (os.cpu_count() or 4) + 4)
    
    # 🔥 啟動多核心平行池處理圖片
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [
            executor.submit(_convert_single_worker, img_path, force_overwrite, quality, max_size, ratio)
            for img_path in image_files
        ]
        for future in as_completed(futures):
            status, img_path, webp_path, err = future.result()
            
            # ✨ 新增：如果是 IGNORE，直接 pass，不計算入 skip_count
            if status == 'IGNORE':
                pass
            elif status == 'SKIPPED':
                skip_count += 1
            elif status == 'OVERWRITTEN':
                cout.file_size_action("複寫成功", img_path, webp_path, icon_key='refresh', tree=True)
                success_count += 1
            elif status == 'CONVERTED':
                cout.file_size_action("轉換成功", img_path, webp_path, icon_key='success', tree=True)
                success_count += 1
            elif status == 'ERROR':
                cout.error(f"處理失敗 {img_path}: {err}")

    elapsed = time.perf_counter() - t_start
    if success_count > 0:
        cout.success(f"WebP 系統處理完成！成功轉檔/複寫: {success_count} 張 | 略過已存在圖: {skip_count} 張 (耗時 {elapsed:.2f}s)。", icon_key='party')
    else:
        cout.skip(f"圖片皆已為最新 WebP 格式，共略過 {skip_count} 張已存在圖片 (耗時 {elapsed:.2f}s)。", indent=0)

def generate_cover_thumbnail(src_path, dest_path, max_width=320, quality=80):
    """
    讀取原始圖片，等比例縮小並轉換為 WebP，存入 api 資料夾。
    """
    if not os.path.exists(src_path):
        cout.warn(f"找不到來源圖片: {src_path}")
        return False
        
    try:
        with Image.open(src_path) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGBA")
            elif img.mode != "RGB":
                img = img.convert("RGB")

            if img.width > max_width:
                ratio = max_width / img.width
                new_size = (max_width, int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            exif_bytes = get_copyright_exif(img)

            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            img.save(dest_path, "WEBP", quality=quality, exif=exif_bytes)
            return True
            
    except Exception as e:
        cout.error(f"縮圖生成失敗 {src_path}: {e}")
        return False

if __name__ == "__main__":
    convert_to_webp_with_protection(quality=90)
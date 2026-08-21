import os
import glob
from PIL import Image

# ✨ 魔法路徑：自動從 tools 資料夾往上一層找到 projects
DEFAULT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'projects'))

# ==========================================
# 🛡️ 防偽與轉檔設定區
# ==========================================
MAX_SIZE = (1920, 1920) 
RATIO = 0.8
AUTHOR_NAME = "風川梓 (Azustock)"
COPYRIGHT_TEXT = f"Copyright (c) 2026 {AUTHOR_NAME}. All rights reserved."
# ==========================================

def convert_to_webp_with_protection(directory=DEFAULT_DIR, quality=90, auto_mode=None, max_size=MAX_SIZE, ratio=RATIO):
    """
    掃描目錄下的圖片，進行「降解析度」、「壓印浮水印」、「寫入版權 EXIF」並轉換為 WebP。
    包含已存在檔案的處理策略選擇，並支援無外掛自動化執行。
    """
    print(f"\n==========================================")
    print(f"🔍 [第一階段] 啟動 WebP 轉檔與防禦系統...")
    print(f"==========================================")
    
    if auto_mode is not None:
        force_overwrite = auto_mode
        mode_text = "複寫" if force_overwrite else "跳過"
        print(f"⚙️ 系統自動執行中：已設定遇到舊檔時「{mode_text}」。\n")
    else:
        print("遇到已經存在的 .webp 檔案時，您希望如何處理？")
        print("  [1] 跳過 (保留舊檔案，速度最快 - 預設)")
        print("  [2] 複寫 (強制重新轉檔並覆蓋舊檔案)")
        user_choice = input("請選擇 [1 或 2] (直接按 Enter 預設為 1): ").strip()
        force_overwrite = (user_choice == '2')

    if force_overwrite and auto_mode is None:
        print("\n⚠️ 已選擇「複寫」模式：將強制重新轉檔所有圖片！\n")
    elif auto_mode is None:
        print("\n✅ 已選擇「跳過」模式：只會處理尚未轉檔的新圖片。\n")

    search_patterns = [
        os.path.join(directory, "**/*.png"),
        os.path.join(directory, "**/*.jpg"),
        os.path.join(directory, "**/*.jpeg")
    ]
    
    image_files = []
    for pattern in search_patterns:
        image_files.extend(glob.glob(pattern, recursive=True))

    if not image_files:
        print("沒有找到需要轉換的圖片。")
        return

    success_count = 0
    skip_count = 0
    
    for img_path in image_files:
        try:
            file_name, ext = os.path.splitext(img_path)
            webp_path = f"{file_name}.webp"
            
            if os.path.exists(webp_path):
                if not force_overwrite:
                    skip_count += 1
                    continue
                
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
                
                clean_exif = clean_img.getexif()
                clean_exif.clear() 
                
                clean_exif[40093] = (AUTHOR_NAME + '\x00').encode('utf-16le')
                clean_exif[40092] = (COPYRIGHT_TEXT + '\x00').encode('utf-16le')
                clean_exif[315] = "Azustock" 
                
                exif_bytes = clean_exif.tobytes()

                clean_img.save(webp_path, "webp", quality=quality, exif=exif_bytes)
            
            original_size = os.path.getsize(img_path) / 1024
            new_size = os.path.getsize(webp_path) / 1024
            
            if force_overwrite and os.path.exists(webp_path):
                 print(f"🔄 複寫成功: {os.path.basename(img_path)} ({original_size:.1f} KB -> {new_size:.1f} KB)")
            else:
                 print(f"✅ 轉換成功: {os.path.basename(img_path)} ({original_size:.1f} KB -> {new_size:.1f} KB)")
            
            success_count += 1
            
        except Exception as e:
            print(f"❌ 處理失敗 {img_path}: {e}")

    print("\n==========================================")
    print("🎉 系統處理完成！")
    print(f"   - 成功轉檔/複寫: {success_count} 張圖片")
    print(f"   - 跳過已存在圖: {skip_count} 張圖片")
    print("==========================================")

def generate_cover_thumbnail(src_path, dest_path, max_width=320, quality=80):
    """
    讀取原始圖片，等比例縮小並轉換為 WebP，存入 api 資料夾。
    """
    if not os.path.exists(src_path):
        print(f"⚠️ 找不到來源圖片: {src_path}")
        return False
        
    try:
        with Image.open(src_path) as img:
            # 確保圖片為 RGB 模式 (處理帶有透明度的 PNG 轉 WebP)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGBA")
            elif img.mode != "RGB":
                img = img.convert("RGB")

            # 如果圖片寬度大於限制，進行等比例縮放
            if img.width > max_width:
                ratio = max_width / img.width
                new_size = (max_width, int(img.height * ratio))
                # 使用 LANCZOS 演算法確保縮小後的畫質平滑
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # ✨ 核心修復：為所有縮圖注入 EXIF 數位版權簽章
            clean_exif = img.getexif()
            clean_exif.clear() 
            clean_exif[40093] = (AUTHOR_NAME + '\x00').encode('utf-16le')
            clean_exif[40092] = (COPYRIGHT_TEXT + '\x00').encode('utf-16le')
            clean_exif[315] = "Azustock" 
            exif_bytes = clean_exif.tobytes()

            # 確保 API 目標資料夾存在
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            
            # 儲存為 WebP (加上 exif 參數！)
            img.save(dest_path, "WEBP", quality=quality, exif=exif_bytes)
            return True
            
    except Exception as e:
        print(f"❌ 縮圖生成失敗 {src_path}: {e}")
        return False

if __name__ == "__main__":
    convert_to_webp_with_protection(quality=90)
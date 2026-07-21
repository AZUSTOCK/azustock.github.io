from PIL import Image

def verify_signature(image_path):
    try:
        with Image.open(image_path) as img:
            exif = img.getexif()
            
            # 讀取 Unicode 專用欄位 (40093, 40092)
            artist_raw = exif.get(40093)
            copyright_raw = exif.get(40092)
            
            # 如果有讀到資料，就用 utf-16le 解碼，並把結尾的空字元去掉
            artist = artist_raw.decode('utf-16le').rstrip('\x00') if artist_raw else "未找到作者資訊"
            copyright_info = copyright_raw.decode('utf-16le').rstrip('\x00') if copyright_raw else "未找到版權資訊"
            
            print(f"🔍 正在檢查: {image_path}")
            print(f"   👤 作者: {artist}")
            print(f"   ©️ 版權: {copyright_info}\n")
            
    except Exception as e:
        print(f"讀取失敗: {e}")

if __name__ == "__main__":
    # 把括號裡的檔名換成你隨便一張轉好的 WebP
    verify_signature(r"C:\Users\iambe\Desktop\git page\projects\writing\01_note\01_changer\architecture.webp")
    verify_signature(r"C:\Users\iambe\Desktop\basic.webp")
    verify_signature(r"projects\art\01_azu5atellite\01_palindrome\basic.png")
    verify_signature(r"projects\art\01_azu5atellite\01_palindrome\basic.webp")
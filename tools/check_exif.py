import os
from typing import Literal
from PIL import Image

# ✨ 魔法路徑：自動從 tools 資料夾往上一層找到 projects
DEFAULT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'projects'))

def verify_signature(image_path):
    # 如果檔案不存在就跳過，避免報錯
    if not os.path.exists(image_path):
        print(f"⚠️ 檔案不存在，跳過測試: {image_path}")
        return
        
    try:
        with Image.open(image_path) as img:
            exif = img.getexif()
            
            # 讀取 Unicode 專用欄位 (40093, 40092)
            artist_raw = exif.get(40093)
            copyright_raw = exif.get(40092)
            
            # 如果有讀到資料，就用 utf-16le 解碼，並把結尾的空字元去掉
            artist = artist_raw.decode('utf-16le').rstrip('\x00') if artist_raw else "未找到作者資訊"
            copyright_info = copyright_raw.decode('utf-16le').rstrip('\x00') if copyright_raw else "未找到版權資訊"
            
            print(f"🔍 正在檢查: {os.path.basename(image_path)}")
            print(f"   👤 作者: {artist}")
            print(f"   ©️ 版權: {copyright_info}\n")
            
    except Exception as e:
        print(f"讀取失敗 {image_path}: {e}")

def picture_path(category: str| None, project: str, article: str, filename: Literal['cover_thumb.webp', 'og.webp'], batch_name: Literal['thumbnails', 'articles', None]= 'articles', inner_batch_name=None, source_dir: Literal['projects', 'api', None]= 'projects', auto=True):
    """WIP"""
    if auto and source_dir == 'api':
        category = None
        project = project.split('_')[-1]
        article = article.split('_')[-1]
        batch_name = None
        filename = f"thumb_{filename}"

    head_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', source_dir))    
    tup = (i for i in (category, project, batch_name, article, inner_batch_name, filename) if i is not None)
    return os.path.join(head_dir, *tup)

def head_dir(source_dir: Literal['projects', 'api', None]= 'projects'):
    return os.path.abspath(os.path.join(os.path.dirname(__file__), '..', source_dir))


if __name__ == "__main__":
    # 自動組合路徑測試 (你可以換成你真實存在的專案圖片)
    tup = ()
    tup += (os.path.join(DEFAULT_DIR, "art", "01_azu5atellite", "articles", "01_palindrome", "basic.webp"),)
    tup += (os.path.join(head_dir('api'), "azu5atellite", "palindrome", "og.webp"),)
    tup += (os.path.join(head_dir('api'), "azu5atellite", "palindrome", "cover_thumb.webp"),)
    tup += (os.path.join(head_dir('api'), "azu5atellite", "palindrome", "thumbnails", "thumb_basic.webp"),)
    tup += (picture_path("art", "01_azu5atellite", "01_palindrome", "basic.webp"),)
    tup += (os.path.join(DEFAULT_DIR, "art", "01_azu5atellite", "articles", "01_palindrome", "clothing", "normal.webp"),)
    
    print("== 啟動 EXIF 數位簽章檢測 ==\n")
    for path in tup:
        verify_signature(path)
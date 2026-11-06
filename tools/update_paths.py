import os
import glob

# ✨ 支援由外部主程式呼叫 (tools.cout) 或在 tools 目錄下單獨執行 (cout)
try:
    from tools.cout import cout
except ImportError:
    from cout import cout

# ✨ 魔法路徑：自動從 tools 資料夾往上一層找到 projects
DEFAULT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'projects'))

def update_extensions_to_webp(directory=DEFAULT_DIR):
    """
    掃描指定目錄下的所有 .md 與 .json 檔案，
    將內文中的 .png, .jpg, .jpeg 批量替換為 .webp。
    """
    cout.info(f"開始掃描 {os.path.relpath(directory)} 目錄下的 Markdown 與 JSON 檔案...", icon_key='search')
    
    # 尋找所有 md 和 json 檔案 (包含所有子目錄)
    target_files = []
    target_files.extend(glob.glob(f"{directory}/**/*.md", recursive=True))
    target_files.extend(glob.glob(f"{directory}/**/*.json", recursive=True))
    
    if not target_files:
        cout.skip("沒有找到需要掃描的 .md 或 .json 檔案。", indent=0)
        return

    success_count = 0
    for file_path in target_files:
        try:
            # 讀取檔案內容
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 檢查是否包含舊的圖片副檔名
            if '.png' in content or '.jpg' in content or '.jpeg' in content:
                # 執行無差別替換魔法
                new_content = content.replace('.png', '.webp')
                new_content = new_content.replace('.jpg', '.webp')
                new_content = new_content.replace('.jpeg', '.webp')
                
                # 將更新後的新內容寫回檔案
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                    
                cout.action("路徑更新", os.path.relpath(file_path), icon_key='edit', color='green', tree=True)
                success_count += 1
                
        except Exception as e:
            cout.error(f"更新檔案失敗 {os.path.relpath(file_path)}: {e}")
            
    if success_count > 0:
        cout.success(f"系統路徑升級完成！共修改了 {success_count} 個檔案。", icon_key='party')
    else:
        cout.skip("所有檔案內文路徑皆已為 .webp，無須修改。", indent=0)

if __name__ == "__main__":
    update_extensions_to_webp()
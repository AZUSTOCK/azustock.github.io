import os

# ✨ 支援由外部主程式呼叫 (tools.cout) 或在 tools 目錄下單獨執行 (cout)
try:
    from tools.cout import cout
except ImportError:
    from cout import cout

# ✨ 魔法路徑：自動從 tools 資料夾往上一層找到 projects
DEFAULT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'projects'))

def clean_old_contents_json(directory=DEFAULT_DIR):
    """
    遞迴掃描指定目錄，並刪除所有的 contents.json 檔案
    """
    cout.stage("清理工具", f"開始掃描 '{os.path.relpath(directory)}' 目錄...", icon_key='clean')
    
    if not os.path.exists(directory):
        cout.error(f"找不到 '{directory}' 目錄，請確認您在正確的路徑下執行。")
        return

    delete_count = 0
    
    # 使用 os.walk 深入每一層資料夾
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == "contents.json":
                file_path = os.path.join(root, file)
                try:
                    os.remove(file_path)
                    cout.action("已刪除", os.path.relpath(file_path), icon_key='delete', color='yellow', tree=True)
                    delete_count += 1
                except Exception as e:
                    cout.warn(f"刪除失敗 {os.path.relpath(file_path)}: {e}")

    # ✨ 直接以單行狀態總結收尾，不再重複印出 stage 橫幅
    if delete_count > 0:
        cout.success(f"清理完成！總共移除了 {delete_count} 個舊版 contents.json 檔案。", icon_key='party')
    else:
        cout.skip("您的 projects 資料夾很乾淨，沒有發現任何 contents.json 檔案！", indent=0)

if __name__ == "__main__":
    clean_old_contents_json()
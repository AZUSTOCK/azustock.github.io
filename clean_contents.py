import os

def clean_old_contents_json(directory="projects"):
    """
    遞迴掃描指定目錄，並刪除所有的 contents.json 檔案
    """
    print(f"🔍 開始掃描 '{directory}' 目錄...")
    
    if not os.path.exists(directory):
        print(f"❌ 找不到 '{directory}' 目錄，請確認您在正確的路徑下執行。")
        return

    delete_count = 0
    
    # 使用 os.walk 深入每一層資料夾
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == "contents.json":
                file_path = os.path.join(root, file)
                try:
                    os.remove(file_path)
                    print(f"🗑️ 已刪除: {file_path}")
                    delete_count += 1
                except Exception as e:
                    print(f"⚠️ 刪除失敗 {file_path}: {e}")

    print("\n==========================================")
    if delete_count > 0:
        print(f"🎉 清理完成！總共移除了 {delete_count} 個舊版 contents.json 檔案。")
    else:
        print("✨ 您的 projects 資料夾很乾淨，沒有發現任何 contents.json 檔案！")
    print("==========================================")

if __name__ == "__main__":
    clean_old_contents_json()
"""WIP"""
import json
import re
from datetime import datetime
import os

# ==========================================
# ⚙️ 腳本設定區：檔案路徑
# ==========================================
MAIN_JS_PATH = "main.js"
INDEX_HTML_PATH = "index.html"
CHANGELOGS_PATH = "changelogs.json"

def main():
    print("🚀 [系統啟動] Azustock 滾動更新與發布引擎")
    
    # 1. 從 main.js 讀取當前版本號
    try:
        with open(MAIN_JS_PATH, 'r', encoding='utf-8') as f:
            main_js_content = f.read()
            
        version_match = re.search(r'VERSION:\s*"([^"]+)"', main_js_content)
        if not version_match:
            print("❌ 錯誤：無法在 main.js 中找到 CONFIG.VERSION 設定。")
            return
            
        current_version = version_match.group(1)
        print(f"📦 當前系統版本：{current_version}")
    except FileNotFoundError:
        print(f"❌ 錯誤：找不到 {MAIN_JS_PATH}。")
        return

    # 2. 自動推導滾動版號 (假設格式為 U1.5.0 或 1.5.0)
    match = re.match(r'([A-Za-z]*)(\d+)\.(\d+)\.(\d+)', current_version)
    if match:
        prefix = match.group(1)
        major = int(match.group(2))
        minor = int(match.group(3))
        patch = int(match.group(4))
        
        v_patch = f"{prefix}{major}.{minor}.{patch + 1}"
        v_minor = f"{prefix}{major}.{minor + 1}.0"
        v_major = f"{prefix}{major + 1}.0.0"
        
        print("\n請選擇更新幅度 (滾動更新)：")
        print(f"  [1] 修補更新 (Patch) : {v_patch} (適合修正 Bug、微調)")
        print(f"  [2] 次要更新 (Minor) : {v_minor} (適合新增文章、小功能)")
        print(f"  [3] 重大更新 (Major) : {v_major} (適合介面大改版、架構重構)")
        print(f"  [4] 自訂版號")
        
        choice = input("👉 請輸入選項 [1-4]: ").strip()
        if choice == '1': new_version = v_patch
        elif choice == '2': new_version = v_minor
        elif choice == '3': new_version = v_major
        else: new_version = input("👉 請輸入自訂版號 (例如 U1.5.1): ").strip()
    else:
        new_version = input(f"👉 無法自動解析版號。請直接輸入新版號 (當前為 {current_version}): ").strip()

    # 3. 收集更新日誌資訊
    print(f"\n📝 準備發布版本：{new_version}")
    status = input("👉 狀態標籤 (預設: LATEST，可輸入 HOTFIX, FEATURE, UPDATED 等): ").strip().upper() or "LATEST"
    desc = input("👉 簡短描述 (例如: 修復首頁跑馬燈閃爍問題): ").strip()
    content = input("👉 詳細 Markdown 內容 (可留空，後續手動修改 json): ").strip()
    
    if not content:
        content = f"### {new_version} 系統更新\n- {desc}"

    # ==========================================
    # 執行檔案修改作業
    # ==========================================
    print("\n⚙️ 開始修改系統檔案...")

    # 任務 A：更新 changelogs.json
    try:
        if os.path.exists(CHANGELOGS_PATH):
            with open(CHANGELOGS_PATH, 'r', encoding='utf-8') as f:
                logs = json.load(f)
        else:
            logs = []
            
        new_entry = {
            "id": f"log-{new_version.replace('.', '-').lower()}",
            "version": new_version,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "status": status,
            "description": desc,
            "content": content
        }
        logs.insert(0, new_entry) # 將最新日誌插在最上面
        
        with open(CHANGELOGS_PATH, 'w', encoding='utf-8') as f:
            json.dump(logs, f, ensure_ascii=False, indent=4)
        print(f"  ✅ {CHANGELOGS_PATH} 已新增紀錄。")
    except Exception as e:
        print(f"  ❌ 更新 changelogs.json 失敗: {e}")

    # 任務 B：更新 main.js 的版號
    new_main_js = re.sub(r'(VERSION:\s*")[^"]+(")', rf'\g<1>{new_version}\g<2>', main_js_content)
    with open(MAIN_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(new_main_js)
    print(f"  ✅ {MAIN_JS_PATH} 內部系統版號已更新為 {new_version}。")

    # 任務 C：更新 index.html 的快取破壞時間戳
    try:
        with open(INDEX_HTML_PATH, 'r', encoding='utf-8') as f:
            html_content = f.read()
            
        # 將 style.css?u=XXX 和 main.js?u=XXX 替換為新版號
        new_html = re.sub(r'(\.css\?u=)[A-Za-z0-9\.]+', rf'\g<1>{new_version}', html_content)
        new_html = re.sub(r'(\.js\?u=)[A-Za-z0-9\.]+', rf'\g<1>{new_version}', new_html)
        
        with open(INDEX_HTML_PATH, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"  ✅ {INDEX_HTML_PATH} 的快取破壞參數已更新為 ?u={new_version}。")
    except FileNotFoundError:
        print(f"  ❌ 找不到 {INDEX_HTML_PATH}。")

    print(f"\n🎉 發布準備完成！所有快取機制已為版本 {new_version} 重新校準。")
    print("👉 現在你可以將檔案 Commit 並 Push 到 GitHub Pages 了！")

if __name__ == "__main__":
    main()
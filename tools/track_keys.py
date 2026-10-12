import os
import re
import json
import urllib.parse
from datetime import datetime

PROJECTS_DIR = 'projects'
OUTPUT_FILE = 'key_dashboard.html'

# 🚀 正則表達式捕捉引擎
# 1. 獲取端 (Getters)
RE_KEY = re.compile(r'\+\+\[KEY:([^\]]+)\]')
# 2. 鎖定端 (Locks)
RE_SEC_BLK = re.compile(r':::secret\[([^\]]+)\]', re.IGNORECASE)
RE_STL_BLK = re.compile(r':::stealth\[([^\]]+)\]', re.IGNORECASE)
RE_SEC_INL = re.compile(r'!!\[([^\]]+)\]')
RE_STL_INL = re.compile(r'\?\?\[([^\]]+)\]')

results = {}  # 儲存結構: { "KEY_NAME": { "getters": [], "locks": [] } }

def add_record(base_key, record_type, file_path, line_num, raw_str, context):
    if base_key not in results:
        results[base_key] = {'getters': [], 'locks': []}
    
    abs_path = os.path.abspath(file_path)
    safe_path = urllib.parse.quote(abs_path)
    
    results[base_key][record_type].append({
        'file': file_path.replace('\\', '/'),
        'line': line_num,
        'raw': raw_str,
        'context': context.strip()[:150] + ('...' if len(context) > 150 else ''),
        'abs_path': safe_path,
        'raw_abs': abs_path
    })

def extract_bases(raw_str):
    """將複雜的語法 (如 StoryODiary_I#3|SILENT 或 test|6 && ADMIN) 拆解出乾淨的基礎金鑰名"""
    s = re.sub(r'\|SILENT', '', raw_str, flags=re.IGNORECASE)
    s = re.sub(r'\|\s*\d+', '', s)
    s = re.sub(r'#\d+(/\d+)?', '', s)
    words = re.findall(r'[A-Za-z0-9_]+', s)
    return list(set(w for w in words if not w.isdigit()))

def scan_keys():
    print(f"\n📡 [金鑰雷達] 開始全域掃描...")
    total_files = 0
    global results
    results = {}
    
    for root, dirs, files in os.walk(PROJECTS_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            
            # 📖 掃描 Markdown
            if file.endswith('.md'):
                total_files += 1
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    
                for i, line in enumerate(lines):
                    line_num = i + 1
                    for match in RE_KEY.finditer(line):
                        for b in extract_bases(match.group(1)):
                            add_record(b, 'getters', file_path, line_num, match.group(1), line)
                            
                    for pat, l_type in [(RE_SEC_BLK, "Secret Block"), (RE_STL_BLK, "Stealth Block"), 
                                        (RE_SEC_INL, "Secret Inline"), (RE_STL_INL, "Stealth Inline")]:
                        for match in pat.finditer(line):
                            for b in extract_bases(match.group(1)):
                                add_record(b, 'locks', file_path, line_num, f"[{l_type}] {match.group(1)}", line)

            # ⚙️ 掃描 JSON
            elif file == 'detail.json':
                total_files += 1
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                    if 'required_key' in data:
                        raw = str(data['required_key'])
                        for b in extract_bases(raw):
                            add_record(b, 'locks', file_path, 1, f"[JSON required_key] {raw}", f'"required_key": {json.dumps(data["required_key"])}')
                            
                    if 'sensitive' in data:
                        raw = str(data['sensitive'])
                        if '|' in raw:
                            logic_part = raw.split('|', 1)[1]
                            for b in extract_bases(logic_part):
                                add_record(b, 'locks', file_path, 1, f"[JSON sensitive Bypass] {raw}", f'"sensitive": "{raw}"')
                except Exception as e:
                    print(f"⚠️ JSON 解析失敗 {file_path}: {e}")

    # 生成 HTML 面板
    keys_json = json.dumps(results, ensure_ascii=False)
    scan_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    html_template = f"""<!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <title>🔑 Azustock Key Tracker</title>
        <style>
            :root {{
                --bg: #020617; --panel: #0b1220; --text: #e5e7eb; --muted: #9ca3af;
                --accent: #38bdf8; --accent-2: #f5d547; --error: #ef4444; --success: #10b981;
                --border: rgba(56, 189, 248, 0.2); --hover: rgba(56, 189, 248, 0.1);
            }}
            body {{ background: var(--bg); color: var(--text); font-family: -apple-system, monospace; margin: 0; display: flex; height: 100vh; overflow: hidden; }}
            #sidebar {{ width: 320px; background: var(--panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; }}
            .header {{ padding: 20px; border-bottom: 1px solid var(--border); }}
            .header h1 {{ margin: 0; font-size: 1.2rem; color: var(--accent); letter-spacing: 1px; }}
            .header p {{ margin: 5px 0 0 0; font-size: 0.8rem; color: var(--muted); }}
            .search-box {{ padding: 15px; border-bottom: 1px solid var(--border); }}
            .search-box input {{ width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg); color: var(--text); outline: none; box-sizing: border-box; }}
            .search-box input:focus {{ border-color: var(--accent-2); }}
            .key-list {{ flex: 1; overflow-y: auto; padding: 10px; list-style: none; margin: 0; }}
            .key-item {{ padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; margin-bottom: 5px; }}
            .key-item:hover {{ background: var(--hover); }}
            .key-item.active {{ background: var(--hover); border-color: var(--accent); }}
            .key-name {{ font-weight: bold; font-size: 1.1rem; color: var(--accent-2); display: block; }}
            .key-stats {{ font-size: 0.8rem; color: var(--muted); margin-top: 5px; display: flex; gap: 10px; }}
            .stat-g {{ color: var(--success); }} .stat-l {{ color: var(--error); }}
            #main {{ flex: 1; padding: 30px; overflow-y: auto; position: relative; }}
            h2 {{ color: var(--accent-2); border-bottom: 2px solid var(--border); padding-bottom: 10px; margin-top: 0; font-size: 1.8rem; }}
            .section-title {{ color: var(--text); font-size: 1.2rem; margin: 25px 0 15px 0; display: flex; align-items: center; gap: 8px; }}
            .card {{ background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: 0.2s; }}
            .card:hover {{ border-color: var(--accent); transform: translateX(5px); }}
            .card-header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }}
            .file-path {{ font-size: 0.9rem; color: var(--accent); font-weight: bold; word-break: break-all; }}
            .line-badge {{ background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; color: var(--muted); }}
            .raw-str {{ display: inline-block; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; color: #fff; margin-bottom: 10px; border-left: 3px solid var(--accent-2); }}
            .context {{ background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px; font-size: 0.9rem; color: var(--muted); font-family: monospace; white-space: pre-wrap; word-break: break-all; }}
            .btn-group {{ display: flex; gap: 8px; margin-top: 15px; }}
            .btn {{ padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 0.8rem; font-weight: bold; transition: 0.2s; border: 1px solid; display: inline-flex; align-items: center; gap: 5px; }}
            .btn-vscode {{ background: rgba(56, 189, 248, 0.1); color: var(--accent); border-color: var(--accent); }}
            .btn-vscode:hover {{ background: var(--accent); color: #fff; }}
            .btn-cursor {{ background: rgba(16, 185, 129, 0.1); color: var(--success); border-color: var(--success); }}
            .btn-cursor:hover {{ background: var(--success); color: #fff; }}
            .empty-state {{ text-align: center; color: var(--muted); margin-top: 20vh; font-size: 1.2rem; }}
        </style>
    </head>
    <body>
        <div id="sidebar">
            <div class="header">
                <h1>🔑 System Key Radar</h1>
                <p>掃描時間：{scan_time}</p>
            </div>
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="搜尋金鑰名稱..." onkeyup="filterKeys()">
            </div>
            <ul class="key-list" id="keyList"></ul>
        </div>
        <div id="main"><div class="empty-state">👈 請從左側選擇一把金鑰</div></div>
        <script>
            const db = {keys_json};
            const keyListEl = document.getElementById('keyList');
            const mainEl = document.getElementById('main');
            let currentActive = null;
            function renderList(filter = '') {{
                keyListEl.innerHTML = '';
                Object.keys(db).sort().forEach(k => {{
                    if (filter && !k.toLowerCase().includes(filter.toLowerCase())) return;
                    const li = document.createElement('li');
                    li.className = 'key-item' + (currentActive === k ? ' active' : '');
                    li.innerHTML = `<span class="key-name">${{k}}</span><div class="key-stats"><span class="stat-g">📍 發放點: ${{db[k].getters.length}}</span><span class="stat-l">🔒 上鎖點: ${{db[k].locks.length}}</span></div>`;
                    li.onclick = () => selectKey(k, li);
                    keyListEl.appendChild(li);
                }});
            }}
            function filterKeys() {{ renderList(document.getElementById('searchInput').value); }}
            function selectKey(key, el) {{
                currentActive = key;
                document.querySelectorAll('.key-item').forEach(i => i.classList.remove('active'));
                if (el) el.classList.add('active');
                let html = `<h2>🗝️ ${{key}}</h2>`;
                html += `<div class="section-title">📍 發放點 (Getters) - 玩家可在此獲得鑰匙</div>`;
                if (db[key].getters.length === 0) html += `<div class="card" style="color:var(--error); border-color:rgba(239,68,68,0.3);">⚠️ 警告：這把鑰匙沒有任何發放點，玩家無法獲得！</div>`;
                else db[key].getters.forEach(g => html += createCard(g, 'var(--success)'));
                html += `<div class="section-title">🔒 上鎖點 (Locks) - 阻擋未擁有此鑰匙的玩家</div>`;
                if (db[key].locks.length === 0) html += `<div class="card" style="color:var(--muted);">此鑰匙目前沒有被用來鎖住任何東西。</div>`;
                else db[key].locks.forEach(l => html += createCard(l, 'var(--error)'));
                mainEl.innerHTML = html;
            }}
            function createCard(item, color) {{
                return `<div class="card"><div class="card-header"><div class="file-path" style="color: ${{color}}">📄 ${{item.file}}</div><div class="line-badge">Line: ${{item.line}}</div></div><div class="raw-str">${{item.raw.replace(/</g, '&lt;').replace(/>/g, '&gt;')}}</div><div class="context">${{item.context.replace(/</g, '&lt;').replace(/>/g, '&gt;')}}</div><div class="btn-group"><a href="vscode://file/${{item.abs_path}}:${{item.line}}" class="btn btn-vscode">💻 在 VSCode 開啟</a><a href="cursor://file/${{item.abs_path}}:${{item.line}}" class="btn btn-cursor">💻 在 Cursor 開啟</a></div></div>`;
            }}
            renderList();
        </script>
    </body>
    </html>"""

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(html_template)

    total_keys = len(results)
    print(f"✅ 掃描完畢！共掃描 {total_files} 個檔案，發現 {total_keys} 把不重複金鑰。")
    print(f"🎉 報告已生成：請在瀏覽器打開 【 {OUTPUT_FILE} 】 以檢視面板！\n")

def rename_key():
    print(f"\n==========================================")
    print(f"🔄 [金鑰替換引擎] 安全修改金鑰名稱")
    print(f"==========================================")
    old_key = input("👉 請輸入要替換的【舊】金鑰名稱: ").strip()
    if not old_key: return
    
    new_key = input("👉 請輸入【新】的金鑰名稱: ").strip()
    if not new_key or old_key == new_key: return

    print(f"\n🚀 準備將 [{old_key}] 替換為 [{new_key}]...")
    
    # ✨ 強大的防呆正則引擎 (Negative Lookbehind/Lookahead)
    # 確保只替換獨立的單字。例如找 test，遇到 test1 或 latest 都不會誤殺！
    pattern = re.compile(r'(?<![A-Za-z0-9_])' + re.escape(old_key) + r'(?![A-Za-z0-9_])')
    
    changed_files = 0
    replaced_count = 0
    
    for root, dirs, files in os.walk(PROJECTS_DIR):
        for file in files:
            if file.endswith('.md') or file == 'detail.json':
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    if pattern.search(content):
                        new_content, count = pattern.subn(new_key, content)
                        if count > 0:
                            with open(file_path, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f"  📝 已更新: {file_path} (替換 {count} 處)")
                            changed_files += 1
                            replaced_count += count
                except Exception as e:
                    print(f"  ⚠️ 更新失敗 {file_path}: {e}")
                        
    print(f"\n✅ 替換完成！共修改了 {changed_files} 個檔案，替換了 {replaced_count} 處。")
    
    # 改完後主動問使用者要不要順便重新掃描
    run_scan = input("是否要立即重新掃描並更新 HTML 面板？ (Y/n): ").strip().lower()
    if run_scan != 'n':
        scan_keys()

if __name__ == "__main__":
    while True:
        print(f"\n==========================================")
        print(f"🛠️ [金鑰管理員] Azustock Key Manager")
        print(f"==========================================")
        print("  [1] 📡 掃描全域金鑰並生成 HTML 儀表板 (預設)")
        print("  [2] 🔄 重新命名金鑰 (自動防呆並替換所有關聯檔案)")
        print("  [3] ❌ 離開")
        
        choice = input("\n請選擇操作 [1/2/3] (預設 1): ").strip()
        
        if choice == '2':
            rename_key()
        elif choice == '3' or choice.lower() == 'q':
            print("👋 再見！")
            break
        else:
            scan_keys()
            break # 掃描完預設結束程式，因為面板已經開了
"""Azustock 金鑰管理員 U0.0.1

互動選單：python track_keys.py
直接查詢：python track_keys.py --query StoryODiary --no-html
查詢位置：python track_keys.py --file chapter.md --kind locks --no-html
靜默查詢：python track_keys.py --silent on --no-html
產生面板：python track_keys.py --scan
開啟面板：python track_keys.py --open
自訂目錄：python track_keys.py --projects ./projects --output key_dashboard.html
"""

import argparse
import json
import os
import re
import sys
import tempfile
import urllib.parse
import webbrowser
from datetime import datetime
from pathlib import Path

PROJECTS_DIR = 'projects'
OUTPUT_FILE = './tools/tracker/reports/key_dashboard.html'
RE_KEY = re.compile(r'\+\+\[KEY:([^\]]+)\]')
# SILENT 是發放點屬性；完整旗標才匹配，避免把 SILENTLY 當作 SILENT。
RE_SILENT = re.compile(r'\|SILENT(?=\s*(?:\||$))', re.IGNORECASE)
RE_SEC_BLK = re.compile(r':::secret\[([^\]]+)\]', re.IGNORECASE)
RE_STL_BLK = re.compile(r':::stealth\[([^\]]+)\]', re.IGNORECASE)
RE_SEC_INL = re.compile(r'!!\[([^\]]+)\]')
RE_STL_INL = re.compile(r'\?\?\[([^\]]+)\]')
LOCK_PATTERNS = [(RE_SEC_BLK, 'Secret Block'), (RE_STL_BLK, 'Stealth Block'),
                 (RE_SEC_INL, 'Secret Inline'), (RE_STL_INL, 'Stealth Inline')]
results = {}
scan_info = {}
scanned = False
USE_COLOR = sys.stdout.isatty() and 'NO_COLOR' not in os.environ


def styled(value, color='cyan'):
    codes = {'cyan': '36', 'green': '32', 'yellow': '33', 'red': '31', 'bold': '1'}
    # Prevent file text from injecting terminal control sequences.
    value = re.sub(r'[\x00-\x08\x0b-\x1f\x7f-\x9f]', '', str(value))
    return '\033[' + codes[color] + 'm' + value + '\033[0m' if USE_COLOR else value


def extract_bases(raw_str):
    """拆解原有金鑰語法；依出現順序去重，不改變原有 ASCII 名稱規則。"""
    value = RE_SILENT.sub('', raw_str)
    value = re.sub(r'\|\s*\d+', '', value)
    value = re.sub(r'#\d+(/\d+)?', '', value)
    return list(dict.fromkeys(w for w in re.findall(r'[A-Za-z0-9_]+', value)
                              if not w.isdigit()))


def add_record(base_key, record_type, file_path, line_num, raw_str, context, column=1):
    entry = results.setdefault(base_key, {'getters': [], 'locks': []})
    abs_path = os.path.abspath(file_path)
    context = context.strip()
    entry[record_type].append({
        'file': str(file_path).replace('\\', '/'), 'line': line_num, 'column': column,
        'raw': raw_str, 'context': context[:240] + ('…' if len(context) > 240 else ''),
        'abs_path': urllib.parse.quote(abs_path.replace('\\', '/'), safe='/:'),
        'raw_abs': abs_path,
        'kind': record_type,
        'silent': bool(RE_SILENT.search(raw_str)) if record_type == 'getters' else None,
    })


def json_field_positions(text):
    """以 JSON 解碼器逐一走過頂層欄位，避開巢狀同名欄位或字串。"""
    decoder = json.JSONDecoder()
    index = len(text) - len(text.lstrip()) + 1  # 已驗證為頂層物件，跳過 {
    positions = {}
    while index < len(text):
        while index < len(text) and text[index].isspace():
            index += 1
        if index >= len(text) or text[index] == '}':
            break
        start = index
        name, index = decoder.raw_decode(text, index)
        while text[index].isspace():
            index += 1
        index += 1  # colon
        while text[index].isspace():
            index += 1
        _, index = decoder.raw_decode(text, index)
        positions[name] = (text.count('\n', 0, start) + 1,
                           start - text.rfind('\n', 0, start))
        while index < len(text) and text[index].isspace():
            index += 1
        if index < len(text) and text[index] == ',':
            index += 1
    return positions


def collect_keys():
    global results, scan_info, scanned
    if not Path(PROJECTS_DIR).is_dir():
        raise FileNotFoundError('找不到專案目錄：' + os.path.abspath(PROJECTS_DIR))
    results = {}
    scanned = False
    total_files, errors = 0, []
    for root, dirs, files in os.walk(PROJECTS_DIR,
                                     onerror=lambda error: errors.append(str(error))):
        dirs.sort()
        for name in sorted(files):
            if not (name.lower().endswith('.md') or name == 'detail.json'):
                continue
            path = os.path.join(root, name)
            total_files += 1
            try:
                text = Path(path).read_text(encoding='utf-8-sig')
                lines = text.splitlines()
                if name.lower().endswith('.md'):
                    for line_num, line in enumerate(lines, 1):
                        for pattern, kind, label in [(RE_KEY, 'getters', '')] + [
                                (pat, 'locks', label) for pat, label in LOCK_PATTERNS]:
                            for match in pattern.finditer(line):
                                raw = match.group(1)
                                for key in extract_bases(raw):
                                    add_record(key, kind, path, line_num,
                                               ('[' + label + '] ' if label else '') + raw,
                                               line, match.start() + 1)
                else:
                    data = json.loads(text)
                    if not isinstance(data, dict):
                        raise ValueError('detail.json 的頂層必須是物件')
                    positions = json_field_positions(text)
                    for field in ('required_key', 'sensitive'):
                        if field not in data or data[field] is None or isinstance(data[field], bool):
                            continue
                        raw = str(data[field])
                        logic = raw
                        label = 'JSON required_key'
                        if field == 'sensitive':
                            if '|' not in raw:
                                continue
                            logic = raw.split('|', 1)[1]
                            label = 'JSON sensitive Bypass'
                        line, column = positions[field]
                        for key in extract_bases(logic):
                            add_record(key, 'locks', path, line, '[' + label + '] ' + raw,
                                       lines[line - 1], column)
            except (OSError, UnicodeError, ValueError) as error:
                errors.append(path + ': ' + str(error))
    scan_info = {'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                 'files': total_files, 'errors': errors,
                 'root': os.path.abspath(PROJECTS_DIR)}
    scanned = True
    return results


def scan_keys(generate_html=True):
    print(styled('\n金鑰雷達 · 掃描 ' + os.path.abspath(PROJECTS_DIR), 'bold'))
    collect_keys()
    getters = sum(len(value['getters']) for value in results.values())
    locks = sum(len(value['locks']) for value in results.values())
    print(styled('完成', 'green') + '  {} 個檔案 / {} 把金鑰 / {} 筆發放關聯 / {} 筆上鎖關聯'.format(
        scan_info['files'], len(results), getters, locks))
    for error in scan_info['errors']:
        print(styled('略過：' + error, 'yellow'))
    if generate_html:
        write_dashboard()
        print('HTML：' + styled(os.path.abspath(OUTPUT_FILE)))
    return results


def search_records(query='', file_filter='', kind='all', exact=False, silent_filter='all'):
    """金鑰名稱符合時顯示全部位置；否則僅顯示位置／語法／內文符合的紀錄。"""
    query, file_filter = query.casefold(), file_filter.casefold()
    found = {}
    for key in sorted(results, key=str.casefold):
        key_match = key.casefold() == query if exact else query in key.casefold()
        if exact and not key_match:
            continue
        matches = {'getters': [], 'locks': []}
        for record_type in ('getters', 'locks'):
            if kind != 'all' and record_type != kind:
                continue
            for item in results[key][record_type]:
                if silent_filter != 'all' and (record_type != 'getters' or
                        bool(item.get('silent')) != (silent_filter == 'on')):
                    continue
                if file_filter and file_filter not in item['file'].casefold():
                    continue
                if key_match or any(query in item[field].casefold()
                                    for field in ('file', 'raw', 'context')):
                    matches[record_type].append(item)
        if matches['getters'] or matches['locks']:
            found[key] = matches
    return found


def print_query(query='', file_filter='', kind='all', exact=False, summary_only=False, silent_filter='all'):
    found = search_records(query, file_filter, kind, exact, silent_filter)
    print(styled('\n查詢結果 · {} 把金鑰'.format(len(found)), 'bold'))
    if not found:
        print('沒有符合條件的金鑰或位置。')
        return found
    for key, matches in found.items():
        entry = results[key]
        status = '缺少發放點' if not entry['getters'] else (
            '尚未使用' if not entry['locks'] else '已連結')
        silent_count = sum(bool(item.get('silent')) for item in entry['getters'])
        print(styled(key, 'yellow') + '  [{}]  發放 {} / 上鎖 {} / 靜默 {}'.format(
            status, len(entry['getters']), len(entry['locks']), silent_count))
        if summary_only:
            continue
        for record_type, label, color in [('getters', '發放點', 'green'), ('locks', '上鎖點', 'cyan')]:
            for item in matches[record_type]:
                mode = ' [SILENT]' if item.get('silent') else (' [一般]' if record_type == 'getters' else '')
                print('  ' + styled(label, color) + mode + '  {}:{}:{}'.format(
                    styled(item['file']), item['line'], item['column']))
                print('    語法：' + styled(item['raw']))
                print('    內文：' + styled(item['context']))
                print('    位置：' + styled('{}:{}:{}'.format(
                    item['raw_abs'], item['line'], item['column'])))
    return found


def query_keys():
    if not scanned:
        scan_keys(generate_html=False)
    silent_filter = 'all'
    while True:
        print('\n搜尋金鑰、檔案路徑、原始語法或內文；空白列出全部，q 返回。')
        print('發放篩選：:silent 靜默／:normal 一般／:all 全部；目前：' +
              {'all': '全部', 'on': '靜默', 'off': '一般'}[silent_filter])
        query = input('搜尋 > ').strip()
        if query.lower() == 'q':
            return
        if query.lower() in (':silent', ':normal', ':all'):
            silent_filter = {':silent': 'on', ':normal': 'off', ':all': 'all'}[query.lower()]
            print_query(silent_filter=silent_filter)
            continue
        print_query(query, silent_filter=silent_filter)


def write_dashboard():
    # HTML parser 會辨識 script 結束標籤，必須先跳脫 JSON 中的 <。
    payload = json.dumps({'keys': results, 'scan': scan_info}, ensure_ascii=False)
    payload = payload.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    Path(OUTPUT_FILE).write_text(HTML_TEMPLATE.replace('@@PAYLOAD@@', payload), encoding='utf-8')


HTML_TEMPLATE = r'''<!DOCTYPE html>
<html lang="zh-Hant" data-theme="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Azustock · 金鑰管理員</title>
<style>
:root{color-scheme:dark;--bg:#111716;--panel:#19211f;--card:#1f2926;--text:#e9eee9;--muted:#9aa9a1;--line:#32413a;--accent:#b5d99a;--soft:#2c3e2e;--gold:#edc887;--bad:#e9a39c;--shadow:0 12px 36px #0002}
[data-theme=light]{color-scheme:light;--bg:#f4f5ef;--panel:#fafbf6;--card:#fff;--text:#26332c;--muted:#64736a;--line:#dce3d7;--accent:#436c37;--soft:#e8f0df;--gold:#8c6223;--bad:#a0493e;--shadow:0 12px 36px #2b42200a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}button,input,select{font:inherit}button,a,input,select{ -webkit-tap-highlight-color:transparent}button{cursor:pointer}a{color:var(--accent);text-decoration:none}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:3px}button:disabled{opacity:.4;cursor:default}
.shell{display:grid;grid-template-columns:300px minmax(0,1fr);height:100vh;height:100dvh}.sidebar{background:var(--panel);border-right:1px solid var(--line);display:flex;flex-direction:column;min-height:0}.brand{padding:30px 24px 22px;border-bottom:1px solid var(--line)}.eyebrow{font-size:10px;letter-spacing:2.5px;color:var(--accent);font-weight:700}.brand h1{font-size:22px;letter-spacing:-.7px;margin:6px 0 0}.brand p{margin:3px 0;color:var(--muted);font-size:12px}.search-area{padding:20px 18px 12px}.search-area label{display:block;color:var(--muted);font-size:12px;margin-bottom:8px}input,select{background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:9px;padding:10px 12px;width:100%;min-width:0}input::placeholder{color:var(--muted)}.search-area select{margin-top:10px}.list-label{display:flex;justify-content:space-between;padding:8px 24px;color:var(--muted);font-size:11px}.key-list{overflow-y:auto;padding:0 12px 18px;flex:1;min-height:100px}.key-item{display:block;width:100%;text-align:left;padding:13px 14px;margin:3px 0;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--text)}.key-item:hover{background:var(--card)}.key-item.active{background:var(--soft);border-color:var(--line)}.key-name{display:block;font-weight:650;overflow-wrap:anywhere}.key-meta{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--muted);margin-top:4px}.dot{color:var(--gold)}.side-footer{padding:15px 24px;border-top:1px solid var(--line);color:var(--muted);font-size:11px;overflow-wrap:anywhere}.main{overflow-y:auto;padding:32px 40px 48px;min-width:0}.topbar{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:24px}.topbar h2{font-size:24px;font-weight:600;margin:0;letter-spacing:-.6px}.topbar p{font-size:12px;color:var(--muted);margin:3px 0 0}.button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--line);border-radius:8px;padding:7px 11px;color:var(--text);background:var(--panel);font-size:12px;white-space:nowrap}.button:hover{background:var(--soft);border-color:var(--accent)}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:30px}.stat{padding:16px 20px;background:var(--panel);border:1px solid var(--line);border-radius:12px}.stat span{font-size:11px;color:var(--muted)}.stat strong{display:block;font-size:28px;line-height:1.5;font-weight:550}.stat small{font-size:11px;color:var(--muted)}.stat.warning strong{color:var(--gold)}.detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}.detail-head h3{font-size:25px;margin:0;letter-spacing:-.7px;overflow-wrap:anywhere}.detail-head p{color:var(--muted);font-size:12px;margin:6px 0}.badge{display:inline-flex;border:1px solid var(--line);border-radius:30px;padding:3px 10px;font-size:11px;color:var(--accent);white-space:nowrap}.badge.warn{color:var(--gold)}.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding-bottom:20px;border-bottom:1px solid var(--line)}.tab{border:1px solid var(--line);border-radius:8px;padding:7px 14px;color:var(--muted);background:transparent;font-size:12px}.tab.active{background:var(--soft);color:var(--accent);border-color:var(--accent)}.toolbar input{margin-left:auto;width:min(100%,280px);font-size:12px;padding:8px 12px}.section-title{display:flex;gap:10px;align-items:center;margin:24px 0 12px;font-size:14px;font-weight:600}.section-title span{font-size:11px;font-weight:400;color:var(--muted)}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr));gap:12px}.card{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:18px;box-shadow:var(--shadow);min-width:0}.card-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.path{font:12px/1.7 ui-monospace,Consolas,monospace;overflow-wrap:anywhere;color:var(--accent)}.line{font-size:10px;color:var(--muted);white-space:nowrap;background:var(--bg);border-radius:5px;padding:3px 7px}.raw{font:12px/1.7 ui-monospace,Consolas,monospace;color:var(--gold);margin:12px 0 8px;overflow-wrap:anywhere}.context{background:var(--bg);border-radius:7px;padding:12px;margin:0;color:var(--muted);white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.8 ui-monospace,Consolas,monospace}.actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.actions .button{font-size:11px}.notice{border:1px dashed var(--line);border-radius:10px;padding:16px;color:var(--muted);font-size:12px}.notice.warn{color:var(--gold)}.empty{padding:60px 20px;text-align:center;color:var(--muted)}.empty strong{display:block;font-size:20px;color:var(--text);margin-bottom:8px}.navigation{display:flex;gap:6px}#toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text);color:var(--bg);padding:10px 18px;border-radius:10px;box-shadow:var(--shadow);z-index:10;max-width:90%;font-size:12px}.errors{margin-bottom:20px;color:var(--gold);font-size:12px}.errors pre{white-space:pre-wrap;overflow-wrap:anywhere}.tip{font-size:11px;color:var(--muted);margin-top:24px}#count{font-variant-numeric:tabular-nums}
@media(min-width:1500px){.main{padding-left:64px;padding-right:64px}.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:900px){.shell{grid-template-columns:245px minmax(0,1fr)}.main{padding:24px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.stat{padding:12px 16px}}
@media(max-width:640px){.shell{display:block;height:auto}.sidebar{border-right:0;border-bottom:1px solid var(--line)}.brand{padding:18px 20px 12px}.search-area{padding:14px 18px 8px}.key-list{max-height:220px;flex:auto}.side-footer{display:none}.main{overflow:visible;padding:22px 18px 40px}.topbar{align-items:flex-start}.topbar h2{font-size:22px}.stats{gap:8px;margin-bottom:24px}.stat strong{font-size:24px}.toolbar input{width:100%;margin-left:0}.detail-head h3{font-size:22px}}
</style>
</head>
<body>
<div class="shell">
<aside class="sidebar">
 <header class="brand"><div class="eyebrow">AZUSTOCK / KEY RADAR</div><h1>金鑰管理員</h1><p>追蹤每把金鑰的來處與去向。</p></header>
 <div class="search-area"><label for="search">搜尋金鑰與相關位置</label><input id="search" type="search" placeholder="金鑰、檔案、語法或內文…"><select id="status" aria-label="金鑰狀態"><option value="all">全部狀態</option><option value="linked">已連結</option><option value="missing">缺少發放點</option><option value="unused">尚未使用</option></select><select id="silent" aria-label="發放模式"><option value="all">全部發放模式</option><option value="on">僅 SILENT 靜默發放</option><option value="off">僅一般發放</option></select></div>
 <div class="list-label"><span>金鑰索引</span><span id="count"></span></div><nav class="key-list" id="keyList" aria-label="金鑰索引"></nav>
 <footer class="side-footer" id="scanMeta"></footer>
</aside>
<main class="main">
 <header class="topbar"><div><h2>金鑰總覽</h2><p>從取得條件，找到每一個關聯位置。</p></div><button id="theme" class="button" type="button">切換主題</button></header>
 <div class="stats" id="stats"></div><details id="errors" class="errors" hidden><summary></summary><pre></pre></details>
 <div id="detail"></div><p class="tip">本頁為掃描時的快照；修改專案後請重新掃描。VS Code / Cursor 連結需在本機安裝對應編輯器。</p>
</main></div><div id="toast" role="status" hidden></div>
<script id="scanData" type="application/json">@@PAYLOAD@@</script>
<script>
'use strict';
const payload=JSON.parse(document.getElementById('scanData').textContent),db=payload.keys,scan=payload.scan;
const keys=Object.keys(db).sort((a,b)=>a.localeCompare(b)),list=document.getElementById('keyList'),detail=document.getElementById('detail');
let active=null,visible=[],kind='all',locationQuery='',toastTimer;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state=key=>!db[key].getters.length?'missing':!db[key].locks.length?'unused':'linked';
const stateName={missing:'缺少發放點',unused:'尚未使用',linked:'已連結'};
const records=key=>[...db[key].getters,...db[key].locks];
const matches=(item,q)=>[item.file,item.raw,item.context].some(value=>value.toLowerCase().includes(q));
const total=type=>keys.reduce((sum,key)=>sum+db[key][type].length,0);
const silentCount=key=>db[key].getters.filter(item=>item.silent===true).length;
const modeMatches=item=>{const mode=document.getElementById('silent').value;return mode==='all'||(item.kind==='getters'&&Boolean(item.silent)===(mode==='on'));};
document.getElementById('stats').innerHTML=[['金鑰總數',keys.length,'不重複金鑰'],['發放關聯',total('getters'),`金鑰與發放位置 · 靜默 ${keys.reduce((sum,key)=>sum+silentCount(key),0)}`],['上鎖關聯',total('locks'),'金鑰與上鎖位置'],['缺少發放點',keys.filter(key=>state(key)==='missing').length,'需確認其他取得方式']].map((s,i)=>`<div class="stat ${i===3?'warning':''}"><span>${s[0]}</span><strong>${s[1]}</strong><small>${s[2]}</small></div>`).join('');
document.getElementById('scanMeta').textContent=`掃描 ${scan.files} 個檔案 · ${scan.time}\n${scan.root}`;
if(scan.errors.length){const el=document.getElementById('errors');el.hidden=false;el.querySelector('summary').textContent=`有 ${scan.errors.length} 項掃描失敗（點擊查看）`;el.querySelector('pre').textContent=scan.errors.join('\n');}
function renderList(){
 const q=document.getElementById('search').value.trim().toLowerCase(),status=document.getElementById('status').value;
 visible=keys.filter(key=>{const eligible=records(key).filter(modeMatches);return (status==='all'||state(key)===status)&&eligible.length>0&&(!q||key.toLowerCase().includes(q)||eligible.some(item=>matches(item,q)));});
 if(!visible.includes(active)){active=visible[0]||null;kind='all';locationQuery='';}
 document.getElementById('count').textContent=`${visible.length} / ${keys.length}`;
 list.replaceChildren();
 for(const key of visible){const button=document.createElement('button');button.type='button';button.className='key-item'+(key===active?' active':'');button.setAttribute('aria-current',key===active?'true':'false');button.innerHTML=`<span class="key-name">${esc(key)} ${state(key)!=='linked'?'<span class="dot">•</span>':''}</span><span class="key-meta"><span>發放 ${db[key].getters.length}</span><span>上鎖 ${db[key].locks.length}</span><span>靜默 ${silentCount(key)}</span></span>`;button.addEventListener('click',()=>{active=key;kind='all';locationQuery='';renderList();});list.append(button);}
 if(!visible.length)list.innerHTML='<div class="notice">沒有符合條件的金鑰。</div>';
 renderDetail();
}
function createCard(item){
 const line=item.line,column=item.column||1,path=`${item.raw_abs}:${line}:${column}`;
 return `<article class="card"><div class="card-header"><div class="path">${esc(item.file)}</div><span class="line">L${line} : ${column}</span></div><div class="raw">${esc(item.raw)}</div>${item.kind==='getters'?`<span class="badge">${item.silent?'SILENT · 靜默發放':'一般發放'}</span>`:''}<pre class="context">${esc(item.context)}</pre><div class="actions"><a class="button" href="${esc('vscode://file/'+item.abs_path+':'+line+':'+column)}">VS Code ↗</a><a class="button" href="${esc('cursor://file/'+item.abs_path+':'+line+':'+column)}">Cursor ↗</a><button class="button" type="button" data-copy="${esc(path)}">複製位置</button></div></article>`;
}
function renderDetail(){
 if(!active){detail.innerHTML=`<div class="empty"><strong>${keys.length?'沒有符合條件的金鑰':'尚未發現金鑰'}</strong>${keys.length?'試著縮短搜尋文字，或切換狀態篩選。':'確認專案目錄與金鑰語法後，再重新掃描。'}</div>`;return;}
 const entry=db[active],index=visible.indexOf(active);
 detail.innerHTML=`<div class="detail-head"><div><div class="eyebrow">KEY / ${index+1} OF ${visible.length}</div><h3>${esc(active)}</h3><p>發放 ${entry.getters.length} 筆 · 靜默 ${silentCount(active)} 筆 · 上鎖 ${entry.locks.length} 筆 · 涉及 ${new Set(records(active).map(item=>item.file)).size} 個檔案</p><span class="badge ${state(active)!=='linked'?'warn':''}">${stateName[state(active)]}</span></div><div class="navigation"><button type="button" class="button" id="previous" aria-label="上一把金鑰" ${index===0?'disabled':''}>←</button><button type="button" class="button" id="next" aria-label="下一把金鑰" ${index===visible.length-1?'disabled':''}>→</button></div></div><div class="toolbar"><button type="button" data-kind="all" class="tab">全部位置</button><button type="button" data-kind="getters" class="tab">發放點</button><button type="button" data-kind="locks" class="tab">上鎖點</button><input id="location" type="search" aria-label="篩選這把金鑰的位置" placeholder="篩選這把金鑰的位置…" value="${esc(locationQuery)}"></div><div id="recordSections"></div>`;
 detail.querySelectorAll('[data-kind]').forEach(button=>{button.disabled=button.dataset.kind==='locks'&&document.getElementById('silent').value!=='all';button.classList.toggle('active',button.dataset.kind===kind);button.setAttribute('aria-pressed',String(button.dataset.kind===kind));button.addEventListener('click',()=>{kind=button.dataset.kind;detail.querySelectorAll('[data-kind]').forEach(b=>{b.classList.toggle('active',b.dataset.kind===kind);b.setAttribute('aria-pressed',String(b.dataset.kind===kind));});renderRecords();});});
 document.getElementById('location').addEventListener('input',event=>{locationQuery=event.target.value;renderRecords();});
 for(const [id,offset] of [['previous',-1],['next',1]])document.getElementById(id).addEventListener('click',()=>{active=visible[index+offset];locationQuery='';renderList();});
 renderRecords();
}
function renderRecords(){
 const entry=db[active],q=locationQuery.trim().toLowerCase(),search=document.getElementById('search').value.trim().toLowerCase();
 const limitGlobal=search&&!active.toLowerCase().includes(search);
 let html='';
 for(const [type,title,explanation] of [['getters','發放點','取得這把金鑰的位置'],['locks','上鎖點','使用這把金鑰作為條件的位置']]){
  if(kind!=='all'&&kind!==type)continue;
  if(document.getElementById('silent').value!=='all'&&type!=='getters')continue;
  const items=entry[type].filter(item=>modeMatches(item)&&(!q||matches(item,q))&&(!limitGlobal||matches(item,search)));
  html+=`<div class="section-title">${title}<span>${items.length} / ${entry[type].length} 筆 · ${explanation}</span></div>`;
  if(items.length)html+=`<div class="cards">${items.map(createCard).join('')}</div>`;
  else if(entry[type].length)html+='<div class="notice">沒有符合搜尋條件的位置。</div>';
  else html+=`<div class="notice ${type==='getters'?'warn':''}">${type==='getters'?'此掃描範圍內未發現發放點，請確認是否由其他方式取得。':'此金鑰目前沒有上鎖用途。'}</div>`;
 }
 const el=document.getElementById('recordSections');el.innerHTML=html;
 el.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',()=>copyText(button.dataset.copy)));
}
async function copyText(value){
 try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);else{const input=document.createElement('textarea');input.value=value;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();let ok;try{ok=document.execCommand('copy');}finally{input.remove();}if(!ok)throw new Error('copy unavailable');}toast('已複製檔案位置與行號');}
 catch(error){window.prompt('請手動複製位置：',value);}
}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,2300);}
function setTheme(theme){document.documentElement.dataset.theme=theme;document.getElementById('theme').textContent=theme==='dark'?'☀ 淺色模式':'☾ 深色模式';try{localStorage.setItem('key-radar-theme',theme);}catch(error){}}
let theme='dark';try{theme=localStorage.getItem('key-radar-theme')||theme;}catch(error){}setTheme(theme==='light'?'light':'dark');
document.getElementById('theme').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
document.getElementById('search').addEventListener('input',renderList);document.getElementById('status').addEventListener('change',renderList);document.getElementById('silent').addEventListener('change',()=>{kind='all';locationQuery='';renderList();});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();document.getElementById('search').focus();}});
renderList();
</script></body></html>'''


def open_dashboard():
    """用系統預設瀏覽器開啟面板；尚未生成時先掃描生成。"""
    dashboard = Path(OUTPUT_FILE).resolve()
    if not dashboard.is_file():
        print('尚未生成 HTML 儀表板，先掃描並生成…')
        scan_keys(generate_html=True)
    if not dashboard.is_file():
        print(styled('HTML 儀表板未成功生成：' + str(dashboard), 'red'))
        return False
    try:
        opened = webbrowser.open(dashboard.as_uri(), new=2)
    except (webbrowser.Error, OSError) as error:
        print(styled('無法自動開啟瀏覽器：' + str(error), 'yellow'))
        opened = False
    if opened:
        print(styled('已請求預設瀏覽器開啟：' + str(dashboard), 'green'))
    else:
        print('請手動在瀏覽器開啟：' + str(dashboard))
    return opened


def plan_silent_changes(key, enabled, file_filter=''):
    """只修改指定基礎金鑰的 ++[KEY:...]，保留碎片、內文、換行及 BOM。"""
    if not re.fullmatch(r'[A-Za-z0-9_]+', key) or key.isdigit():
        raise ValueError('請輸入基礎金鑰名稱，不含 #碎片 或 |SILENT。')
    root_path = Path(PROJECTS_DIR)
    if not root_path.is_dir():
        raise FileNotFoundError('找不到專案目錄：' + str(root_path.resolve()))
    plans = []
    for root, dirs, files in os.walk(root_path):
        dirs.sort()
        for name in sorted(files):
            path = Path(root) / name
            if not name.lower().endswith('.md') or path.is_symlink():
                continue
            if file_filter and file_filter.casefold() not in str(path).replace('\\', '/').casefold():
                continue
            original = path.read_bytes()
            text = original.decode('utf-8-sig')
            changes = []

            def replace(match):
                raw = match.group(1)
                if key not in extract_bases(raw):
                    return match.group(0)
                silent = bool(RE_SILENT.search(raw))
                if silent == enabled:
                    return match.group(0)
                if enabled:
                    content = raw.rstrip()
                    new_raw = content + '|SILENT' + raw[len(content):]
                else:
                    new_raw = RE_SILENT.sub('', raw)
                changes.append({'line': text.count('\n', 0, match.start()) + 1,
                                'before': raw, 'after': new_raw})
                return match.group(0)[:match.start(1) - match.start()] + new_raw + ']'

            modified = RE_KEY.sub(replace, text)
            if changes:
                bom = b'\xef\xbb\xbf' if original.startswith(b'\xef\xbb\xbf') else b''
                plans.append({'path': path, 'before': original,
                              'after': bom + modified.encode('utf-8'), 'changes': changes})
    return plans


def apply_silent_changes(plans):
    """先檢查檔案有無變動，再逐檔備份並以原子替換寫回。"""
    global scanned
    for plan in plans:
        if plan['path'].read_bytes() != plan['before']:
            raise ValueError('檔案已變動，請重新預覽：' + str(plan['path']))
    changed_files = changed_records = 0
    errors = []
    for plan in plans:
        path = plan['path']
        temporary = None
        try:
            if path.read_bytes() != plan['before']:
                raise ValueError('預覽後檔案已變動')
            backup = Path(str(path) + '.silent.bak')
            index = 1
            while True:
                try:
                    with backup.open('xb') as stream:
                        stream.write(plan['before'])
                    break
                except FileExistsError:
                    backup = Path(str(path) + f'.silent.{index}.bak')
                    index += 1
            with tempfile.NamedTemporaryFile(mode='wb', dir=path.parent, delete=False) as stream:
                temporary = Path(stream.name)
                stream.write(plan['after'])
            temporary.chmod(path.stat().st_mode)
            os.replace(temporary, path)
            scanned = False
            changed_files += 1
            changed_records += len(plan['changes'])
            print('  已更新：' + styled(path) + '（備份：' + styled(backup) + '）')
        except (OSError, UnicodeError, ValueError) as error:
            errors.append(str(path) + ': ' + str(error))
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
    return changed_files, changed_records, errors


def manage_silent(generate_html=True):
    print(styled('\nSILENT 管理 · 靜默發放仍會取得金鑰，僅略過取得提示與震動。', 'bold'))
    key = input('基礎金鑰名稱（空白返回） > ').strip()
    if not key:
        return
    action = input('[1] 加上 SILENT / [2] 移除 SILENT（空白返回） > ').strip()
    if action not in ('1', '2'):
        return
    file_filter = input('限定檔案路徑（可輸入部分路徑；空白處理全部發放點） > ').strip()
    plans = plan_silent_changes(key, action == '1', file_filter)
    if not plans:
        print('沒有需要修改的發放點：可能已是指定狀態，或沒有符合的金鑰／檔案。')
        return
    for plan in plans:
        for change in plan['changes']:
            print('  ' + styled(plan['path']) + ':' + str(change['line']))
            print('    ' + styled(change['before']) + ' → ' + styled(change['after']))
    count = sum(len(plan['changes']) for plan in plans)
    print(f'共 {len(plans)} 個檔案、{count} 處發放點；寫入前會保留備份。')
    if input('套用以上修改？[y/N] > ').strip().lower() not in ('y', 'yes'):
        print('已取消，檔案未修改。')
        return
    files, records, errors = apply_silent_changes(plans)
    print(f'完成：修改 {files} 個檔案、{records} 處發放點。')
    for error in errors:
        print(styled('更新失敗：' + error, 'red'))
    if files:
        scan_keys(generate_html=generate_html)


def rename_key():
    global scanned
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
    
    if changed_files:
        scanned = False

    # 改完後主動問使用者要不要順便重新掃描
    run_scan = input("是否要立即重新掃描並更新 HTML 面板？ (Y/n): ").strip().lower()
    if run_scan != 'n':
        scan_keys()


def main(argv=None):
    global PROJECTS_DIR, OUTPUT_FILE, USE_COLOR
    parser = argparse.ArgumentParser(description='Azustock 金鑰掃描、查詢與 HTML 儀表板')
    parser.add_argument('--projects', default=PROJECTS_DIR, help='專案目錄（預設 projects）')
    parser.add_argument('--output', default=OUTPUT_FILE, help='HTML 輸出位置')
    parser.add_argument('--scan', action='store_true', help='掃描並結束，不進入選單')
    parser.add_argument('--open', action='store_true', help='使用預設瀏覽器開啟 HTML；檔案不存在時先生成')
    parser.add_argument('--query', help='搜尋金鑰、路徑、原始語法或內文（不分大小寫）')
    parser.add_argument('--file', default='', help='只顯示檔案路徑含此文字的位置')
    parser.add_argument('--kind', choices=['all', 'getters', 'locks'], default='all',
                        help='顯示全部／發放點／上鎖點')
    parser.add_argument('--silent', choices=['all', 'on', 'off'], default='all',
                        help='all 全部／on 僅 SILENT 發放點／off 僅一般發放點')
    parser.add_argument('--exact', action='store_true', help='只查詢完整金鑰名稱')
    parser.add_argument('--list', action='store_true', help='只列出金鑰與關聯數量')
    parser.add_argument('--no-html', action='store_true', help='不產生 HTML')
    parser.add_argument('--plain', action='store_true', help='關閉終端機色彩')
    args = parser.parse_args(argv)
    if args.exact and args.query is None:
        parser.error('--exact 需搭配 --query')
    if args.open and args.no_html:
        parser.error('--open 不能搭配 --no-html')
    if args.silent != 'all' and args.kind == 'locks':
        parser.error('--silent on/off 僅適用發放點，不能搭配 --kind locks')
    PROJECTS_DIR, OUTPUT_FILE = args.projects, args.output
    USE_COLOR = USE_COLOR and not args.plain
    if USE_COLOR and os.name == 'nt':
        # Windows 10/11 主控台啟用 ANSI；失敗時自動使用純文字。
        try:
            import ctypes
            handle = ctypes.windll.kernel32.GetStdHandle(-11)
            mode = ctypes.c_ulong()
            USE_COLOR = bool(ctypes.windll.kernel32.GetConsoleMode(handle, ctypes.byref(mode))
                             and ctypes.windll.kernel32.SetConsoleMode(handle, mode.value | 4))
        except (AttributeError, OSError):
            USE_COLOR = False
    try:
        direct_query = args.query is not None or bool(args.file) or args.kind != 'all' or args.list or args.silent != 'all'
        if args.scan or direct_query:
            scan_keys(generate_html=not args.no_html)
            if direct_query:
                print_query(args.query or '', args.file, args.kind, args.exact, args.list, args.silent)
            if args.open:
                return 0 if open_dashboard() else 1
            return 0
        if args.open:
            return 0 if open_dashboard() else 1
        while True:
            print(styled('\n─────────────────────────────────────\n'
                         '  AZUSTOCK · 金鑰管理員\n'
                         '─────────────────────────────────────', 'bold'))
            print('  [0] 離開')
            print('  [1] 掃描金鑰並生成 HTML（預設）')
            print('  [2] 列出金鑰摘要')
            print('  [3] 重新命名金鑰')
            print('  [4] 查詢金鑰與相關位置')
            print('  [5] 開啟 HTML 儀表板')
            print('  [6] 管理 SILENT（加上／移除靜默發放）')
            choice = input('\n操作 [0/1/2/3/4/5/6] > ').strip().lower()
            try:
                match choice:
                    case '0' | 'q':
                        return 0
                    case '' | '1':
                        scan_keys(generate_html=not args.no_html)
                    case '2':
                        if not scanned:
                            scan_keys(generate_html=False)
                        print_query(summary_only=True)
                    case '3':
                        rename_key()
                    case '4':
                        query_keys()
                    case '5':
                        open_dashboard()
                    case '6':
                        manage_silent(generate_html=not args.no_html)
                    case _:
                        print('請輸入 0～6，或 q 離開。')
            except (OSError, UnicodeError, ValueError) as error:
                print(styled('操作失敗：' + str(error), 'red'))
    except (OSError, UnicodeError, ValueError) as error:
        print(styled('操作失敗：' + str(error), 'red'), file=sys.stderr)
        return 1
    except (EOFError, KeyboardInterrupt):
        print('\n已離開金鑰管理員。')
        return 0


if __name__ == '__main__':
    sys.exit(main())


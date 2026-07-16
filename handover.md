# 📦 AZUSTOCK Co., Phy. 作品集與技術部落格 - 交接與維護指南 (U1.2)

> **閱讀對象**：本指南專為「從未接觸過此專案」的開發人員撰寫，旨在幫助您從整體架構到程式碼細節，快速掌握專案全貌並具備獨立維護能力。

## 1. 專案概述

### 1.1 專案用途

本專案為一個個人技術部落格與作品集展示網站。提供專案分類展示、標籤過濾（動態跑馬燈與卡片高亮）、無縫的單頁應用（SPA）Markdown 文章閱讀體驗、自訂 404 防護機制、乾淨網址（Clean URLs）解析，並內建專業級 Mermaid 架構圖互動引擎。同時具備**支援 SEO 爬蟲分享的中轉頁面引擎**與**智慧畫廊排版系統**。

### 1.2 系統架構

本專案採用 **純前端 (Vanilla Frontend) 架構**，不依賴後端伺服器與前端框架（如 React/Vue）。

* **核心技術**：HTML5 + CSS3 (大量使用 CSS 變數、Flexbox 瀑布流排版、全域屬性選擇器與 `-webkit-mask-image` 遮罩技術) + Vanilla JavaScript (ES6+)。
* **資料庫與自動化構建 (Build Tool)**：透過 Python 腳本 (`generate_projects_2.py`) 掃描本地 Markdown 與圖片，自動轉檔並打包為 `all_projects.json` 靜態資料庫。具備**智慧快取 (Smart Caching)** 與 **垃圾回收 (Garbage Collection)** 能力，僅對有變更的檔案進行重構。
* **Markdown 與圖表渲染**：引入第三方 `marked.js` 解析 Markdown，並動態載入 `Mermaid.js` (ESM 模組) 即時渲染架構圖。
* **版權與法律免責**：嚴格區分「開源程式碼 (MIT)」與「原創圖文/醫療觀點內容 (保留所有權利)」，並明定虛擬機構之免責聲明。

### 1.3 執行流程

1. 使用者載入網頁，瀏覽器解析 HTML 與 CSS。
2. JS 啟動，判定使用者主題偏好（深色/淺色）並套用，同步初始化 Mermaid 引擎主題。
3. 發起非同步請求 (Fetch) 獲取 `all_projects.json`。
4. JS 根據 JSON 資料，動態生成全螢幕導覽列、跑馬燈標籤、以及專案卡片網格。
5. **路由解析與防護**：監聽 URL 參數，進行「去數位前綴」比對。若匹配成功則打開對應索引或文章；若失敗則觸發 404 錯誤視窗攔截。

### 1.4 各模組之間的關係

* **`index.html` (骨架)**：定義了全站的基本 DOM 結構與 CDN 資源引入。
* **`style.css` (外觀與物理引擎)**：處理了全站 80% 的互動動畫、Hover 特效，並統一管理全域 Markdown 圖片的 Flexbox 排版系統。
* **`main.js` (大腦)**：負責抓取資料、URL 乾淨路由管理、`marked.js` 攔截器、精準捲動控制 (防滑過頭)，以及動態計算畫廊排版邏輯。
* **`generate_projects.py` (心臟)**：負責在發布前清理資料、合成 OG 圖片、生成 API 靜態路由、計算快取，並自動萃取乾淨的資料夾名稱作為 JSON 內的唯一 ID。

---

## 2. 專案目錄說明

| 檔案/資料夾名稱 | 檔案用途 | 核心模組 | 相依哪些模組 | 被哪些模組使用 |
| --- | --- | --- | --- | --- |
| `index.html` | 網站進入點，定義 DOM 容器結構 | 是 | `style.css`, `main.js` | 無 (為最頂層) |
| `style.css` | 網站視覺樣式與 CSS 動畫引擎 | 是 | 無 | `index.html`, `main.js` |
| `main.js` | 核心邏輯、資料載入、DOM 動態生成 | 是 | JSON, `marked.js`, `mermaid` | `index.html` |
| `generate_projects.py` | 本地端打包腳本，生成 API 路由與資料庫 | 是 | 系統檔案模組, Regex, PIL | 開發者部署時執行 |
| `all_projects.json` | 存放專案與文章結構的整合型資料庫檔案 | 是 | 無 | `main.js` |
| `projects/` | 原始文章結構庫 (Markdown 與圖片) | 否 | 無 | `generate_projects.py` |
| `api/` | **(腳本自動生成)** 存放文章的 JSON 內容、OG 圖與供爬蟲抓取的 `index.html`<br> | 否 | `generate_projects.py` | 社交媒體爬蟲, 前端 `fetch()` |
| `COPYRIGHT.md` | 網站內容著作權聲明與免責條款 | 否 | 無 | 法律與授權聲明 |
| `LICENSE` | 程式碼開源授權聲明 (MIT License) | 否 | 無 | 法律與授權聲明 |

---

## 3. 各檔案詳細說明

### 📄 `style.css`

* **主題系統**：定義在 `[data-theme="dark"]` 與 `[data-theme="light"]`。
* **全域 Markdown 圖片系統**：利用 `[alt="float-right"]`、`[alt="center"]` 等屬性選擇器，無需寫 HTML 即可實現全域圖文排版與骨架屏防塌陷。
* **純 CSS 互動**：利用 `:has()` 選擇器與 SVG 堆疊，達成例如「滑過卡片時書本打開」等高階互動。
* **Mask Image**：針對偽元素 `::after` (如捲動提示箭頭)，使用 `-webkit-mask-image` 配合 `background-color`，使 SVG 圖示能完美跟隨主題變色。
* **Flexbox 瀑布流畫廊**：捨棄 Grid 硬性的 `targetCols` 欄數限制，改用 `flex-wrap: wrap` 搭配垂直方向 (`flex-direction: column`) 與 `--g-rows` 限制高度，達成「由左至右，填滿第一行再換第二行」的完美流動排版。(此功能仍有問題)
* **多重背景破圖防護**：使用 `background-image` 的堆疊技巧繞過 Safari 限制，在圖片破圖時顯示漸層掃描與圖示。



### 📄 `main.js`

* **動態 ESM 載入**：在檔案最上方動態 `import()` Mermaid 核心引擎，避免阻塞首頁渲染。
* **`marked.js` 攔截器 (Renderer)**：
* **圖片攔截 (`renderer.image`)**：相容最新版傳入 Object Token 的機制，強制為所有圖片掛上 `is-loading` 骨架與破圖防護 (`onerror`)。
* **代碼攔截 (`renderer.code`)**：攔截 `mermaid` 語言，將其封裝進帶有放大縮小、全螢幕與拖曳功能的互動控制台 DOM 中。
* **乾淨網址路由 (Clean URLs) 與 404 防呆**：透過 `URLSearchParams` 判斷參數。使用正則表達式 `replace(/^\d+_/, '')` 過濾掉專案與文章的數字前綴，實現 `?p=storyOFdiary` 的乾淨分享網址。若匹配不到 ID，會觸發 `show404Modal` 攔截並重置網址。
* **動態畫廊行數演算**：依據所有圖片的總物理寬度與容器寬度的比例（如 1.5 倍、2.5 倍），智慧計算 `targetRows`。只有內容充足時才允許換行。
* **安全邊界檢測 (Safety Boundary Check)**：無論是首頁卡片或畫廊，在觸發 `scrollBy` 前會計算 `maxScrollLeft` 與 `currentScrollLeft`，防止「滑過頭」產生的震動或邊緣留白。
* **防當機狀態鎖**：透過在 DOM 節點打上 `data-g-rows` 標籤，阻斷 `ResizeObserver` 因反覆修改 CSS 變數而引發的無限迴圈。

### 📄 `generate_projects.py` (極重要)

* **智慧快取 (Smart Caching)**：內建 `is_file_outdated` 函數，透過比對來源檔與目標檔的修改時間 (`mtime`)，只針對有修改的 Markdown 或圖片進行重新打包與生成，大幅降低編譯時間。
* **處理統計與日誌**：每次執行完畢，終端機會清楚列印出「專案 / 文章 / 圖片」的 **共處理總數、已更新數量、已略過數量**。
* **垃圾回收 (Garbage Collection)**：維護 `valid_api_files` 清單，在編譯最後階段透過 `cleanup_old_api_files()` 由下而上 (Bottom-up) 掃描 `api/` 目錄，自動刪除舊版廢棄的檔案與空資料夾。
* **SEO 與 OG 圖片動態合成**：利用 PIL 引擎，自動將文章封面圖疊加置中於底板上，生成 1200x630 的 `og.webp`，並為每個專案與文章生成帶有完整 Meta Tags 的 `index.html` 供 Facebook/Line 爬蟲抓取分享。

### 📄 著作權與法律聲明 (`COPYRIGHT.md` / `LICENSE`)

* 本專案在版權上採用雙軌制：
1. **程式碼層面**：受 `LICENSE` (MIT License) 規範，免責且開源。
2. **內容層面**：受 `COPYRIGHT.md` 規範。所有醫療資訊、散文、圖片及「梓本投資控股 (Azustock Co., Phy.)」之商標，均保留所有權利，且明定禁止用於訓練生成式 AI，並包含醫療觀點的免責聲明。

---

## 4. 核心函式索引

### 前端 (`main.js`)
| 函式名稱 | 核心功能 | 被誰呼叫 |
| --- | --- | --- |
| `applyTheme` | 切換深淺色、Favicon 與 Mermaid 渲染主題 | `DOMContentLoaded`, 主題切換按鈕 |
| `handleImageError` | 破圖處理 (換成 1x1 透明 GIF 解鎖背景權限) | 圖片的 `onerror` 屬性 |
| `show404Modal` | 產生並彈出帶有錯誤資訊與返回按鈕的 404 視窗 | 路由解析器 (找不到專案或文章時) |
| `switchModalContent` | 執行 Modal 內容替換與 FLIP 平滑高度過渡 | `openProjectIndex`, `openArticle`<br> |
| `scrollOneItem` | 執行卡片或畫廊的橫向捲動，內建**防過頭邊界計算** | 點擊左右陰影提示區塊 |
| `filterByTag` | 過濾卡片並讓跑馬燈平滑對齊 | 點擊卡片標籤或跑馬燈標籤 |

### 後端打包 (`generate_projects.py`)

| 函式名稱 | 核心功能 |
| --- | --- |
| `is_file_outdated` | **智慧快取**：檢查目標檔案是否需要重新生成 |
| `create_og_image` | **影像合成**：縮放並將圖片貼上固定底板生成 OG 圖片 |
| `cleanup_old_api_files` | **垃圾回收**：掃描並刪除不在白名單中的 `api/` 舊檔案 |

---

## 5. 執行流程 (系統生命週期)

```mermaid
graph TD
    A[網頁載入 DOMContentLoaded] --> B{判定主題偏好}
    B --> C[套用 Light/Dark 主題與 Favicon]
    C --> D[Fetch all_projects.json]
    D --> E[推導卡片與標籤狀態 Bubbling]
    E --> F[生成跑馬燈動態標籤與 UI]
    F --> G[生成全螢幕選單與分類 Grid]
    G --> H[建立 Intersection Observer 與 Scroll Hints]
    H --> I{解析 URL 參數 (去數位前綴)}
    I -- 匹配成功 (?p=..&a=..) --> J[Fetch /api/../contents.json 並渲染文章]
    I -- 匹配成功 (?p=..) --> K[呼叫 openProjectIndex 顯示索引]
    I -- 匹配失敗 (404) --> M[呼叫 show404Modal 攔截並重置]
    I -- 無參數 --> L[等待使用者互動]

```

---

## 6. 已知問題與容易踩雷的地方

* **Markdown 依賴陷阱**：在 `generate_projects.py` 中，生成 `index.html` 高度依賴 Markdown 的標題內容。因此，判斷快取時已將 `md_file_path` 加入依賴清單。**若未來修改邏輯，請務必確保依賴鏈的完整性，否則會導致 HTML 中的 `<title>` 無法更新**。
* **資料夾命名與 Regex 衝突**：系統在前端與後端皆依賴正則表達式 `^\d+_` 來剝離排序數字。請**避免**將專案真實名稱以「數字+底線」開頭。
* **畫廊 `ResizeObserver` 崩潰**：若要修改畫廊的排版邏輯，在寫入 DOM (`setProperty` / `classList.add`) 之前，**絕對要檢查新舊狀態是否一致**，否則會引發無限迴圈導致瀏覽器當機。

---

## 7. 維護建議

* **新增文章或專案**：只需依照 `01_名稱` 的格式建立資料夾，放入 `.md` 與 `detail.json`，然後執行 `python generate_projects.py`。腳本會顯示處理統計，並自動幫您清理舊的垃圾 API 檔案。
* **修改版權聲明**：若要修改授權範圍或聯絡信箱，請至 `COPYRIGHT.md` 進行修改，前端 Footer 版權宣告不需跟著更動，保持簡潔的 `(c) 2026 Azustock Co., Phy.` 即可。
* **發布新版本**：請務必同時修改 `main.js` 的 `CONFIG.VERSION`，並將 `index.html` 中的 CSS 與 JS 引入路徑加上新的 Query String (例如 `?v=5`)，以強制清除使用者的瀏覽器快取。
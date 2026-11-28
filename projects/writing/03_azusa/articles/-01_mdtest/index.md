# 萬能測試 Markdown

這是一份用來測試所有自訂擴充功能、Markdown 排版與互動特效的綜合測試文件。

---

## 1. 基礎文字與多語系排版 (Typography & Language)
這是一般段落文字，包含**粗體**、*斜體*、~~刪除線~~，以及行內程式碼 `console.log('Hello World');`。  
這裡有一個內部錨點測試連結：[跳轉到下方結語](#文字系統小結)。

> 這是一段引言區塊 (Blockquote)。用來測試區塊引號的樣式與邊框是否正常顯示。

### 1.1 語言與注音標示 (Ruby & Lang Block)
進階注音與拼音測試：
* 預設日文：^^魔法(まほう)^^
* 指定語言：^^Apple(/ˈæp.əl/)[en]^^

**A. 標準多行日文排版測試（套用日文字體與日文專屬寬行距）：**

:::lang[ja]
**春はあけぼの。**
やうやう白くなりゆく山際、少し明かりて、紫だちたる雲の細くたなびきたる。
1. 第一段落支援清單
2. 內部也支援 ^^漢字(かんじ)^^
:::

**B. 不改行距與排版模式（`|no-format`，僅切換字體，行距與對齊完全繼承外部）：**

:::lang[ja|no-format]
「言葉」——這段日文使用了 `:::lang[ja|no-format]`，只會套用日文字體，行距與字距完全保持預設，不會撐開額外高度。
:::

<div id="lang-en" class="no-format">

This English paragraph uses `<div id="lang-en" class="no-format">`, applying the English font family while preserving the default line-height and letter-spacing.

</div>

---

### 1.2 多重分頁切換面板 (Tabbed Panels & Height Sync)

**A. 視窗高度自動鎖定測試（Group 1：搭配 `:::lang[...|no-format]` 與 `.md-divider`）**  
切換下方三個分頁時，系統會自動測量最長分頁（第一頁）的高度並鎖定，因此下方的分割線與版面絕對不會上下跳動，且點擊上方導覽列的「返回跳轉前」也會連同當下選中的分頁一起復原：

<div class="tab-buttons">
<button class="tab-btn active" onclick="window.switchTabPanel('p-1', this, 'Group')">中文</button>
<button class="tab-btn" onclick="window.switchTabPanel('p-2', this, 'Group')">EN</button>
<button class="tab-btn" onclick="window.switchTabPanel('p-3', this, 'Group')">JP</button>
</div>
<div id="p-1" class="tab-panel" data-group="Group" style="display: block;">

:::lang[zh|no-format]
這裡是第一頁（中文分頁），我們故意多寫幾行文字來撐高這個區塊。
* 測試項目一：**粗體文字**與 `行內程式碼`
* 測試項目二：包含防雷貼紙 ||分頁裡面的防雷貼紙也正常運作！||
* 測試項目三：包含內部跳轉測試 [跳轉到程式碼區塊](#程式碼區塊)（跳轉後可點左上角返回鍵測試分頁記憶復原）
:::

</div>
<div id="p-2" class="tab-panel" data-group="Group" style="display: none;">

:::lang[en|no-format]
"Words" — Even though this tab only has a single line of text, the container height remains locked to match the tallest tab in `Group`!
:::

</div>
<div id="p-3" class="tab-panel" data-group="Group" style="display: none;">

:::lang[ja|no-format]
「^^言葉(ことば)^^」——切換到這頁較短的日文時，下方的 `.md-divider` 依然穩如泰山，不會發生版面收縮跳動。
:::

</div>
<div class="md-tab-end divider"></div>

**B. 同文章第二組獨立分頁（Group 2：測試多組互不干擾 & `data-sync="false"` 自由高度）**

<div class="tab-buttons">
<button class="tab-btn active" onclick="window.switchTabPanel('pov-a', this, 'POV-Group')">視角 A（自由高度）</button>
<button class="tab-btn" onclick="window.switchTabPanel('pov-b', this, 'POV-Group')">視角 B（自由高度）</button>
</div>

<div id="pov-a" class="tab-panel" data-group="POV-Group" data-sync="false" style="display: block;">

這是第二組分頁的 **視角 A**。因為加上了 `data-sync="false"`，這組分頁會隨內容自然伸縮，且切換時完全不會影響上方第一組分頁的狀態！

</div>

<div id="pov-b" class="tab-panel" data-group="POV-Group" data-sync="false" style="display: none;">

這是 **視角 B** 的隱藏筆記：
1. 第二組分頁獨立運作中。
2. 支援在文章中無限擴充組合。
3. 捲動長文章時，上方的 `.tab-buttons` 會有與頂部導覽列同等級的毛玻璃黏性吸附效果（Sticky）。

</div>

<div class="md-tab-end divider"></div>

## 2. 防雷與機密解鎖系統 (Spoilers & Secrets)

### 2.1 實體撕開貼紙 (Spoiler Text)
測試 Discord 風格的實體撕開貼紙防雷文字：
* 滑鼠懸停或點擊：這是一段 ||非常機密的隱藏劇透文字，點擊可以把它撕開！||
* 裡面也可以夾雜 ||`程式碼` 或 **粗體**||。

### 2.2 機密與無痕系統 (Secret & Stealth)
!![ALPHA_001] "先獲取鑰匙" ++[MAJOR]已獲取鑰匙++ !! [鑰匙](#鑰匙)

**A. 警示型機密 (Secret)**
* 行內警示：這是一段 !![ALPHA_001] "最高機密" 成功解鎖的行內機密文字 !!。
* 區塊警示：

  :::secret[ALPHA_001] "CLASSIFIED DATA"
  這是**區塊型機密**！
  因為前方有了兩個空白的縮排，現在它完美地被包在清單底下了！
  * 機密項目 A
  * 機密項目 B
  :::

**B. 無痕偽裝 (Stealth)**
* 行內無痕：這是一段 ??[ALPHA_001] "非常普通的風景描述" 隱藏在文字中的真實機密訊息 ??，解鎖瞬間會有亂碼特效。
* 區塊無痕：

  :::stealth[ALPHA_001]
  這是一段非常普通的**多行風景描述**。
  今天天氣很好，陽光明媚，適合出門散步。
  * 鳥兒在唱歌
  * 雲朵在飄
  ---
  > ⚠️ **最高機密檔案**

  這是一段**解鎖後**才會浮現的真實多行內容。
  早安。
  1. 早安早安
  :::

### 2.3 進階金鑰系統：碎片收集與靜音觸發 (Key Fragments & Silent Keys)
測試需要集滿指定編號碎片（`#1` ~ `#2`）以及隱形靜音金鑰（`|SILENT`）的複合邏輯：

* 狀態檢測：!![FRAG_DEMO|2 && SILENT_DEMO] "需要集滿 2 個碎片與靜音金鑰" 🎉 恭喜！你已集齊所有碎片並觸發了隱形靜音金鑰！ !!
* 收集碎片一：++[KEY:FRAG_DEMO#1/2]點我或滾動至此取得【碎片 #1/2】++
* 收集碎片二：++[KEY:FRAG_DEMO#2/2]點我或滾動至此取得【碎片 #2/2】++
* 靜音金鑰（下方埋藏了一顆 0 體積、不彈出提示窗的隱形金鑰 `KEY:SILENT_DEMO|SILENT`）：++[KEY:SILENT_DEMO|SILENT]++

---
### 鑰匙
這是一把用來解開 2.2 區塊機密的鑰匙： ++[KEY:ALPHA_001]++

## 3. 動態高光與 X 光透視跑馬燈 (Highlights & Marquee)

### 3.1 行內高光 (Inline Highlight)
測試各種狀態與徽章的行內跑馬燈：
* 預設高光：++這是一般的高光文字，點擊可以發動 X 光透視跑馬燈++。
* 帶有狀態徽章：++[NEW]這是一個帶有 NEW 徽章的高光文字++。
* 帶有群組顏色：++[MAJOR]重要核心更新提示++。

### 3.2 區塊型高光 (Block Highlight)
測試多行區塊透視框是否能正常運作：

:::highlight[WIP]
這是**多行高光區塊**！
它可以跨越多行，並且完美支援內部的所有 Markdown 語法：
* 清單項目 A
* 清單項目 B，包含 `Code`
* ||區塊內也可以放撕開貼紙！||
:::

:::highlight[UPDATED]
這是**多行高光區塊2**！
它可以跨越多行，並且完美支援內部的所有 Markdown 語法：
* 清單項目 A
* 清單項目 B，包含 `Code`
* ||區塊內也可以放撕開貼紙！||
:::

### 3.3 摺疊區塊
可以收合與打開：

:::details[查看隱藏的錯誤 Log 紀錄]
這裡可以寫任何 Markdown！
* 支援清單
* 支援 **粗體**
* 甚至可以放圖片！
:::

---

## 4. 表格與清單 (Tables & Lists)

### 項目清單
* 第一項：項目測試
* 第二項：包含外部超連結 [外部網站](https://github.com)
* 第三項：包含內部 SPA 路由連結 [日記的故事](?p=storyOFdiary&a=introduction#yona)

### 專屬 Markdown 語法擴充對照表

| 功能項目 | 語法格式 | 顯示效果 / 備註 |
| :--- | :--- | :--- |
| **防雷貼紙** | `\|\|文字\|\|`| 遮蔽防雷，點擊撕開 |
| **日文小字** | `^^漢字(小字)[lang]^^` | 產生上標注音文字 (Ruby)，支援語言變數 |
| **行內高光** | `++[標籤]文字++` | 帶有跑馬燈透視特效的行內高光 |
| **解鎖金鑰** | `++[KEY:代碼]文字++` | 滾動進入視野時觸發解鎖並彈出系統通知 |
| **金鑰碎片** | `++[KEY:代碼#1/3]文字++` | 碎片收集系統，支援指定總數 `/N` 或單純編號 `#1` |
| **靜音金鑰** | `++[KEY:代碼\|SILENT]++` | 不彈出提示窗；若不填文字則化為 0px 隱形觸發點 |
| **區塊高光** | `:::highlight[標籤]`<br>`多行內容`<br>`:::` | 帶有發光邊框的多行透視區塊 |
| **摺疊區塊** | `:::details[標題]`<br>`多行內容`<br>`:::` | 點擊展開的收合區塊 (Accordion) |
| **語言區塊** | `:::lang[語言\|no-format]`<br>`多行內容`<br>`:::` | 套用專屬字體；加上 `\|no-format` 則保留預設行距 |
| **警示機密** *(行內)* | `!![金鑰邏輯] "偽裝" 真實內容 !!` | 未解鎖時帶有 `🔒LOCKED` 黑色警示條（支援 `&&` / `\|\|`） |
| **警示機密** *(區塊)* | `:::secret[金鑰邏輯] "偽裝文字"`<br>`真實多行內容`<br>`:::` | 未解鎖時大範圍模糊，並帶有巨型鎖頭 |
| **無痕偽裝** *(行內)* | `??[金鑰邏輯] "偽裝" 真實內容 ??` | 完美隱身於一般段落中，解鎖時亂碼重組 |
| **無痕偽裝** *(區塊)* | `:::stealth[金鑰邏輯]`<br>`偽裝多行內容`<br>`---`<br>`真實多行內容`<br>`:::` | 解鎖前後皆支援完整 Markdown 排版轉換 |
| **分頁面板** | `<div class="tab-buttons">` + `.tab-panel` | 支援黏性毛玻璃導覽列、多群組獨立切換與高度自動同步 |
| **排版結界** | `<div class="md-divider"></div>` | 清除浮動圖片溢出並畫出分隔線（隱形版為 `.md-clear`） |

> **💡 提示：**
> * 高光的 `[標籤]`、Ruby 的 `[lang]` 與機密的 `"偽裝文字"` 可省略；有解鎖條件的機密仍須指定有效金鑰。
> * `[金鑰邏輯]` 支援 `A || (B && C)` 多重邏輯與 `KEY_ID|3`（需集滿 `#1`~`#3` 碎片）驗證。

---

## 5. 程式碼與圖表引擎 (Code & Mermaid)

### 程式碼區塊
```javascript [this-is-a-very-long-name.js]
console.log("檔案名稱會在左上角顯示！");
```

```javascript
const universalTest = () => {
    console.log("System initialized successfully.");
};
universalTest();
```

```python
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

def process_transcriptions(df):
    """
    清理並轉換資料集特徵矩陣
    """
    df = df.dropna(subset=['transcription'])
    vectorizer = TfidfVectorizer(max_features=1000)
    features = vectorizer.fit_transform(df['transcription'])
    return features
```

### Mermaid 流程圖引擎
```mermaid[簡易測試]
graph TD
    A[開始測試] --> B{功能是否正常？}
    B -->|是| C[完美通過 🎉]
    B -->|否| D[檢查 CSS 與 JS 修正]
```

```mermaid[顏色&樣式測試]
flowchart LR
    
    Start((開始)):::base --> Check{狀態確認}:::base
    Check -->|通過| Run[執行核心程序]:::active
    Check -.->|失敗| Error>記錄日誌]:::base
    
    style Error fill:var(--error-color),color:#fff,stroke:none
    linkStyle 1 stroke:var(--accent-2),stroke-width:3px
```

## 6. 文字系統小結
文字測試到此結束。如果以上所有特效（撕開貼紙、X光跑馬燈、區塊高光、圖表、錨點跳轉）都能完美呈現，代表文字系統運作完全正常！

</br>

---

## 7. 圖片進階排版 (Image Formatting)
測試我們為圖片特別客製化的排版與 Lightbox 放大鏡：

**A. 帶有圖說的圖片 (Caption)**
![測試圖片](./architecture.webp "帶有說明的圖片")

**B. 小圖示 (Icon) 與 文字內聯**
這是一段文字，中間夾雜著一個 ![icon](./architecture.webp) 小圖示，它不該被放大且應該與文字完美對齊。

**C. 左右浮動圖片 (Float)**
<figure class="float-left">
  <img src="./architecture.webp" alt="主視覺" loading="lazy" decoding="async">
  <figcaption>基礎方塊</figcaption>
</figure>

![float-right](./architecture.webp)
一些文字

<div class="md-clear"></div>

---

## 8. 檔案嵌入引擎 (File Embeds)
測試系統自動把特定副檔名的圖片連結，轉化為專屬播放器的功能：

**A. 系統級 PDF 文件嵌入**
![測試文件.pdf](./meme.pdf?h=450)

**B. 影片與音樂播放器**
![測試影片.mp4](./HBD-TETO-2026.mp4#poster=./HBD-TETO-2026.webp)
![測試音樂.wav](./HBD-TETO-2026.wav)

---

## 9. 按鈕與徽章連結 (Buttons & Badges)
GitHub 上常見的小徽章與自訂實體按鈕測試：

**A. GitHub 風格小徽章 (Shields.io)**
只要將圖片的 alt 命名為 `badge`，系統就會把它當成小貼紙，不僅不會被強制放大，連外部連結的箭頭都會自動隱藏！
[![badge](https://img.shields.io/badge/GitHub-%E9%A2%A8%E5%B7%9D%E6%A2%93-181717?logo=github)](https://github.com/AZUSTOCK)
[![badge](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://python.org)

**B. 網站原生實體按鈕 (自訂多種樣式)**
只要在超連結後面的 title 寫上 `btn` 開頭的樣式，系統就會自動套用！
[預設透明邊框按鈕](https://github.com/AZUSTOCK "btn")
[實心高光按鈕](https://github.com/AZUSTOCK "btn btn-fill")
[紅色警告按鈕](https://example.com "btn btn-danger")

## 10. 結語
完整測試到此結束。

---

## 11. 高光期限、批次金鑰與明確錨點 (Extended Syntax)

### 11.1 日期高光

高光日期使用 `YYYY-MM-DD` 或 `YYYY/MM/DD`；系統依共用設定 `status.expire_days` 判斷期限（目前 14 天）。逾期預設只移除高光效果，保留內文；加入 `|EXPIRE` 或 `|EXPIRED` 則隱藏整段。

```markdown
++[2026-01-01]只有日期的高光++
++[NEW:2026-01-01]到期後保留純文字++
++[NEW:2026-01-01|EXPIRE]到期後不顯示++

:::highlight[UPDATED:2026-01-01|EXPIRED]
到期後整個區塊都不顯示。
:::
```

實際測試（過去日期）：

- ++[NEW:2000-01-01]這段仍應顯示，但沒有高光。++
- 以下冒號後的過期文字不應顯示：++[NEW:2000-01-01|EXPIRE]不應出現的測試文字++

:::highlight[UPDATED:2000-01-01]
**過期區塊測試**：這段仍應顯示為普通 Markdown。
:::

### 11.2 批次金鑰、複合條件

- `++[KEY:DEMO_RANGE#1~3]文字++`：一次授予第 1 至 3 個碎片（單一區間最多 100 個）。
- `++[KEY:DEMO_RANGE#1~3/3|SILENT]++`：指定總數與靜音模式；只有行內 `KEY:` 高光會授予金鑰。
- `DEMO_RANGE|3`：驗證是否已取得第 1 至 3 個碎片；`/3` 則是授予金鑰時的總數標示。
- `A || (B && C)`：滿足 A，或同時滿足 B 與 C；括號只包整個 AND 群組，不支援任意巢狀邏輯。

!![SYNTAX_DEMO_RANGE|3] "尚未取得三個碎片" 三個碎片已全部取得 !!

++[KEY:SYNTAX_DEMO_RANGE#1~3/3]批次授予測試碎片（滾動進入視野觸發）++

### 11.3 自訂標題錨點 {#syntax-demo-anchor}

在 Markdown 標題末端加上空格及 `{#id}` 即可指定穩定的錨點，例如：

```markdown
### 自訂標題錨點 {#syntax-demo-anchor}
[返回指定標題](#syntax-demo-anchor)
[其他文章指定段落](?p=專案ID&a=文章ID#syntax-demo-anchor)
```

[返回自訂錨點](#syntax-demo-anchor)

## 12. 進階排版與媒體操作 (Layout & Media)

### 12.1 直書與縮排

<div class="vertical-wrapper">

:::lang[ja|no-format]
「言葉」

縦書きの例です。<br>次の行です。
:::

</div>

<div class="vertical-wrapper" data-indent="false">

這是一個停用自動段首全形空白的直書區塊。

</div>

### 12.2 畫廊

<div class="gallery" style="--g-width: 160px; --g-rows: 1; --g-ratio: 1/1;">

![圖片 A](./architecture.webp "圖 A")

![圖片 B](./architecture.webp "圖 B")

</div>

`--g-width` 控制單張寬度，`--g-rows` 控制列數，`--g-ratio` 控制圖片框比例。Lightbox 可在同一畫廊內切換圖片。 上方兩張 160px 圖片應緊鄰排列（間距為 1rem）；寬度足夠時不應出現橫向捲軸或箭頭。窄版時才出現捲動提示，點擊箭頭只移動畫廊本身，不應使文章頁面偏移。若要清除浮動圖片的排版影響，可使用 `<div class="md-clear"></div>` 或帶分隔線的 `<div class="md-divider"></div>`。

**橫向捲動回歸測試（單列、不自動換行）：**

<div class="gallery" style="--g-width: 240px; --g-rows: 1; --g-ratio: 1/1;">

![圖片 1](./architecture.webp "圖 1")

![圖片 2](./architecture.webp "圖 2")

![圖片 3](./architecture.webp "圖 3")

![圖片 4](./architecture.webp "圖 4")

![圖片 5](./architecture.webp "圖 5")

![圖片 6](./architecture.webp "圖 6")

</div>

請測試左右箭頭、拖曳橫向捲軸及 Lightbox 切換。使用同一圖片檔案刻意測試每個圖說與相簿索引是否各自正確；原有文章垂直與水平位置不應因畫廊箭頭而改變。

### 12.3 圖片與媒體參數

以下使用本測試文件既有資源名稱，實際使用時請換成同文章目錄下存在的檔案。

```markdown
![圖片](./architecture.webp "圖說")
![圖片](./thumb.webp#full=./original.webp)
![float-left](./architecture.webp "靠左圖說")
![float-right](./architecture.webp)
![icon](./architecture.webp)
![文件.pdf](./meme.pdf?h=450#poster=./cover.webp)
![影片.mp4](./HBD-TETO-2026.mp4#poster=./HBD-TETO-2026.webp)
![音訊.wav](./HBD-TETO-2026.wav)
```

- `#full=`：Lightbox 指向原圖；不指定時，由建置工具為本地點陣圖片生成縮圖及原圖連結。
- `#poster=`：PDF 或影片預覽封面；PDF 未指定封面時，建置器可自動產生預覽圖。
- `?h=450`：PDF 桌面內嵌框高度（px）。行動裝置使用自己的預覽與操作選單。
- 影音格式：影片 `mp4`、`webm`、`ogg`；音訊 `mp3`、`wav`。實際播放能力取決於瀏覽器與編碼。
- `&w=...&h=...`、舊版 `&ar=...` 是渲染器使用的尺寸資訊，正常讓生成器自動加入即可。

### 12.4 Mermaid 自訂高度

```mermaid[自訂高度測試]?h=320
flowchart LR
    A[文章] --> B[渲染]
    B --> C[圖表]
```

全站 Mermaid 共用樣式存放於 `config/mermaid_styles.txt`，建置後由前端獨立載入。它主要注入 `graph` / `flowchart` 圖表宣告後方。

## 13. 文章及專案設定檔 (detail.json)

以下均為**設定範例**，不是在 Markdown 內執行的指令。請把對應 JSON 欄位寫入實際專案或文章的 `detail.json`。

### 13.1 基本欄位

```json
{
  "title": "文章標題",
  "description": "文章摘要",
  "date": "2026-11-27",
  "order": 10,
  "lang": "ja",
  "version": "v1.0.0",
  "min_sys_version": "U1.7.0",
  "cover": "architecture.webp",
  "group": "demo",
  "tags": ["OC", "NEW:2026-11-27"],
  "pinned": true
}
```

- `lang`：文章可覆寫專案語言；未設定時繼承專案。
- `group`：對應專案 `groups` 的 ID；未指定時可由專案的 `default: true` 群組接收。
- `default_sort`：專案層級可用 `asc` 或 `desc`，使用者當前工作階段的排序選擇優先。
- `min_sys_version`：低於指定網站版號時觸發系統更新流程。

### 13.2 狀態標籤、日期與優先順序

系統 Tag 依 `tools/config/site_config.json` 的 `status.groups` 及 `status.expirable_tags` 定義。目前第一互斥群組為：

`MAJOR > HOTFIX > LATEST > FEATURE > NEW > UPDATED > REFACTOR > PATCH > STABLE > ARCHIVED`

`WIP`、`OC`、`FANART`、`DEV` 各自獨立。第一群組在專案卡片只顯示當前可見狀態中優先級最高的一項。子文章 `NEW` 會觸發專案 `UPDATED`（專案本身不是 `NEW` 時），其餘系統狀態按群組冒泡；一般自訂文章 Tag 不自動冒泡至專案卡片。

```json
{
  "tags": ["FEATURE:2026-11-27", "OC", "DEV"],
  "new": "2026-11-27",
  "updated": false,
  "wip": true,
  "archived": false,
  "pinned": "2026-11-27"
}
```

目前日期型 Tag 僅支援 `NEW`、`UPDATED`、`LATEST`、`FEATURE`；獨立的 `new`、`updated`、`wip`、`archived`、`pinned` 旗標亦可使用日期作為限期狀態。`hidden` 日期與上述不同，是在指定日期到達時解除隱藏。

### 13.2.1 跳過建置時的過期提醒

若文章是語法測試文件，或刻意保留過期狀態作為展示，可在該文章本地的 `detail.json` 加入：

```json
{
  "skip_expiration_reminders": true
}
```

- 建置時跳過此文章的 Metadata 日期標籤、狀態／解封及 Markdown 行內／區塊高光過期提醒，只輸出一筆「跳過文章過期提醒」。
- 這不是跳過文章建置：內容、縮圖、分享頁及 API 仍正常生成。前端過期判斷、`|EXPIRE`／`|EXPIRED` 隱藏行為、定時解封均維持原樣。
- 僅本地文章設定中的 JSON 布林值 `true` 啟用；省略或設為 `false` 即恢復一般提醒。不繼承專案設定，也不影響其他文章或 Tracker。
- 此欄位僅供建置器使用，不會輸出至公開文章 Metadata。適合本文件 11.1 節刻意使用的過期高光測試。

### 13.3 隱藏文章與金鑰限制

一般金鑰隱藏（取得金鑰後出現在目錄）：

```json
{
  "title": "隱藏測試文章",
  "required_key": "SYNTAX_DEMO_RANGE|3",
  "lock_mode": "hidden",
  "tags": ["MAJOR", "OC", "DEV"]
}
```

- `lock_mode: "hidden"`：缺少金鑰時不顯示文章；解鎖後出現在目錄，系統 Tag 依互斥規則更新專案卡片及跑馬燈。
- `lock_mode: "visible"`（預設）：目錄可顯示上鎖項目，但不能閱讀。
- `hidden: true`：System Override 的獨立隱藏旗標；也可以填日期做定時解封。若同時設定金鑰隱藏，必須同時滿足兩種可見性條件。
- `required_key` 不授予金鑰；`key` 才是在進入對應內容時授予金鑰。

```json
{
  "required_key": "KEY_A || (KEY_B && KEY_C|2)",
  "lock_mode": "hidden",
  "key": ["KEY_D", "KEY_E#1~3/3|SILENT"]
}
```

同一組 OR/AND 條件也可寫成二維陣列，例如 `[["KEY_A"], ["KEY_B", "KEY_C|2"]]`。一維陣列代表 OR。

> 注意：這些是前端閱讀體驗與防雷機制，不是伺服器端的存取控制。公開部署的資料仍可能被直接讀取，不應存放真正機密或個資。

### 13.4 多重內容警告

```json
{
  "sensitive": {
    "MAIN": ["KEY_A", "KEY_B"],
    "INSIDE": "KEY_C && KEY_D",
    "DEFAULT": true
  }
}
```

每個警告可以設定不同的略過條件；`true` 表示顯示且無金鑰略過條件，`false` 表示停用該警告。舊語法 `"sensitive": "INSIDE"` 仍可使用。MAIN 的永久同意以專案內的作品群組為範圍；不同警告類型不因此一律放行。

### 13.5 專案群組

```json
{
  "title": "測試專案",
  "default_sort": "asc",
  "groups": {
    "demo": {
      "title": "測試群組",
      "description": "群組摘要",
      "highlight": true,
      "color": "var(--group-c2)",
      "default": true
    }
  }
}
```

文章設定 `"group": "demo"` 即加入此群組。未定義或未指定的群組會列入其他文章，避免目錄與可見文章數量不一致。

## 14. 維護與操作 (Build & Maintenance)

下列指令均在儲存庫根目錄執行：

```powershell
# 只同步共用設定（不重新生成壓縮產物）
python -m tools.config.site_config
python -m tools.config.site_config --check

# 測試、建置、發布驗證
python -m unittest discover -s tools/tests -v
python generate_projects.py
python -m tools.deployment.prepare_public_site
```

文章、專案與版本日誌內容仍分別維護於 `projects/`、`logs/`，公開共用 Markdown 位於 `content/`。不要直接修改自動生成的 API、Hash 清單及壓縮資源。修改共用 Tag 顏色、主題或警告模板時，使用 `tools/config/site_config.json`。

### 14.1 隱藏文章回歸測試步驟

1. 在測試專案建立公開文章（例如 `PATCH`）及 `lock_mode: "hidden"` 的金鑰隱藏文章（例如 `MAJOR`、`OC`、`DEV`）。
2. 確認解鎖前目錄、文章數量、專案狀態、跑馬燈均不包含僅由隱藏文章提供的狀態；公開 `PATCH` 仍存在。
3. 取得完整金鑰後返回目錄，確認文章顯示，卡片計數增加，互斥狀態更新為 `MAJOR`，`OC`、`DEV` 同步冒泡，兩條跑馬燈各出現一次。
4. 若同一狀態也存在於其他公開專案，確認全站跑馬燈不重複新增該標籤。
5. 在兩個同網域分頁中測試金鑰同步；同時確認 System Override 不略過金鑰限制。

測試請使用獨立的 DEMO 金鑰，避免改變其他文章的閱讀流程。


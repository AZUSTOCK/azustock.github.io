# 萬能測試 Markdown 文件

這是一份用來測試所有自訂擴充功能、Markdown 排版與互動特效的綜合測試文件。

---

## 1. 基礎文字與排版 (Basic Typography)
這是一般段落文字，包含**粗體**、*斜體*、~~刪除線~~，以及行內程式碼 `console.log('Hello World');`。  
^^魔法(まほう)^^日文小字測試。  
這裡有一個內部錨點測試連結：[跳轉到最下方結語](#結語)。

> 這是一段引言區塊 (Blockquote)。用來測試區塊引號的樣式與邊框是否正常顯示。

---

## 2. 秘密與防雷文字 (Spoiler Text)
測試 Discord 風格的實體撕開貼紙防雷文字：
* 滑鼠懸停或點擊：這是一段 ||非常機密的隱藏劇透文字，點擊可以把它撕開！||
* 裡面也可以夾雜 ||`程式碼` 或 **粗體**||。

---

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

---

## 4. 表格與清單 (Tables & Lists)

### 項目清單
* 第一項：項目測試
* 第二項：包含外部超連結 [外部網站](https://github.com)
* 第三項：包含內部 SPA 路由連結 [日記的故事](?p=storyOFdiary&a=introduction#yona)

### 功能對照表
| 功能項目 | 語法格式 | 支援狀態 |
| :--- | :--- | :--- |
| 防雷貼紙 | `\|\|文字\|\|`| ✅ 完美支援 |
| 行內高光 | `++[Badge]文字++` | ✅ 完美支援 |
| 日文小字 | `^^文字(小字)^^` | ✅ 完美支援 |
| 區塊高光 | `:::highlight<多行文字>:::` | ✅ 完美支援 |

---

## 5. 程式碼與圖表引擎 (Code & Mermaid)

### 程式碼區塊 (JavaScript)
```javascript
const universalTest = () => {
    console.log("System initialized successfully.");
};
universalTest();
```

### Mermaid 流程圖引擎
```mermaid[程式碼片段]
graph TD
    A[開始測試] --> B{功能是否正常？}
    B -->|是| C[完美通過 🎉]
    B -->|否| D[檢查 CSS 與 JS 修正]
```

## 6. 結語
測試到此結束。如果以上所有特效（撕開貼紙、X光跑馬燈、區塊高光、圖表、錨點跳轉）都能完美呈現，代表系統運作完全正常！

---

## 7. 圖片進階排版 (Image Formatting)
測試我們為圖片特別客製化的排版與 Lightbox 放大鏡：

**A. 帶有圖說的圖片 (Caption)**
![測試圖片](./architecture.webp "這是一張帶有說明的圖片，右下角會有放大鏡按鈕")

**B. 小圖示 (Icon) 與 文字內聯**
這是一段文字，中間夾雜著一個 ![icon](./architecture.webp) 小圖示，它不該被放大且應該與文字完美對齊。

**C. 左右浮動圖片 (Float)**
<figure class="float-left">
  <img src="./architecture.webp" alt="主視覺" loading="lazy" decoding="async">
  <figcaption>基礎方塊</figcaption>
</figure>

![float-right](./architecture.webp)
這段文字會環繞在圖片附近

<div class="md-clear"></div>

---

## 8. 檔案嵌入引擎 (File Embeds)
測試系統自動把特定副檔名的圖片連結，轉化為專屬播放器的功能：

**A. 系統級 PDF 文件嵌入**
![測試文件.pdf](./meme.pdf?h=450)

**B. 影片與音樂播放器**
![測試影片.mp4](./HBD-TETO-2026.mp4)
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
/* ================================================================== */
/* ⚙️ 網站核心設定區 (SITE CONFIGURATION)                               */
/* 每次發布新版本或修改全域狀態時，請只在這裡修改！                         */
/* ================================================================== */
const CONFIG = {
    // 🚩 發布前必改
    VERSION: "U1.5.12.4",          // 目前系統版本號

    // 🎨 介面與主題設定
    DEFAULT_THEME: "dark",     // 預設主題 (light / dark)
    
    // ✨ 跑馬燈速度設定：跑完一整圈需要的「秒數」(數字越大跑得越慢！)
    MARQUEE_SPEED: 120,

    // ✨ 狀態標籤過期天數 (支援 NEW, UPDATED 等狀態)
    TAG_EXPIRE_DAYS: 14,

    // 🔗 資源路徑
    FAVICON_LIGHT: "https://azustock.github.io/assets/OG_dark.png",
    FAVICON_DARK: "https://azustock.github.io/assets/OG_light.png",
    DATA_SOURCE: "./all_projects.json",
    
    // 🐛 測試與除錯設定
    DEBUG_FETCH_DELAY: 0  // [測試專用] 強制延遲網路請求 (毫秒)。設定 0 即關閉延遲，正式發布請設為 0！
};

// ==========================================
// ✨ 全域共用 SVG 圖標 (集中管理，消滅重複代碼)
// ==========================================
const GLOBAL_SVGS = {
    // 🔗 基礎圖示
    meatballMenu: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle class="dot-1" cx="5" cy="12" r="2.5"/><circle class="dot-2" cx="12" cy="12" r="2.5"/><circle class="dot-3" cx="19" cy="12" r="2.5"/></svg>`,
    link: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    linkLg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    extLinkSm: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: -2px; opacity: 0.8;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    newTab: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    
    // 📌 圖釘與機密
    pin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`,
    pinSmall: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(-45deg);"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`,
    secretPin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path class="secret-shackle" d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    secretPinSmall: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path class="secret-shackle" d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    
    // 📄 媒體與檔案
    zoomIcon: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
    docIcon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    docIconLg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    videoIcon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
    audioIcon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
    download: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    
    // 🗂️ 首頁專案卡片
    folderClosed: `<svg class="icon-book-closed" style="position: absolute; transition: opacity 0.2s ease, transform 0.2s ease;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>`,
    folderOpen: `<svg class="icon-book-open" style="position: absolute; opacity: 0; transform: scale(0.8); transition: opacity 0.2s ease, transform 0.2s ease;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
    arrowUpRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`,
    
    // ⬅️ 導覽與操作方向
    arrowLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
    historyBack: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>`,
    chevronLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    
    // 📊 Mermaid 圖表工具列
    mermaidZoomIn: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
    mermaidZoomOut: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
    mermaidReset: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"></path></svg>`,
    mermaidReload: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>`,
    mermaidFull: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`,
    textSize: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="12" y1="4" x2="12" y2="20"></line><line x1="9" y1="20" x2="15" y2="20"></line></svg>`,

    // 🔔 系統提示與狀態圖示 (新增收斂)
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    closeX: `<svg style="display: block;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    jumpDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: jump-arrow-bounce-down 1.5s infinite ease-in-out;"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>`,
    jumpUp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: jump-arrow-bounce-up 1.5s infinite ease-in-out;"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`,
    errorLock: `<svg class="error-lock-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem; opacity: 0.5; overflow: visible; transition: all 0.3s ease;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path class="error-lock-shackle" d="M7 11V7a5 5 0 0 1 10 0v4" style="transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: center;"></path></svg>`,
    errorAlert: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem; opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    retry: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -4px; margin-right: 6px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>`,
    spinner: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: lightbox-spin 0.8s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`,
    warning: `<svg id="sensitive-warning-svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    detailsArrow: `<svg class="details-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); flex-shrink: 0;"><polyline points="9 18 15 12 9 6"></polyline></svg>`
};

// ==========================================
// ✨ 全域狀態標籤系統 (支援快速擴充與互斥群組)
// ==========================================
// 二維陣列設計：
// 1. 內層陣列代表「互斥群組」，排越前面的優先級越高 (例如 UPDATED 贏過 NEW)
// 2. 外層陣列代表「全域排序」，排越前面的 Tag 會顯示在卡片越左邊
// 將 MAJOR 與 HOTFIX 放在最前面，確保它們不會被其他標籤蓋掉
window.STATUS_LIST = [
    ['MAJOR', 'HOTFIX', 'LATEST', 'FEATURE', 'NEW', 'UPDATED', 'REFACTOR', 'PATCH', 'STABLE', 'ARCHIVED'], 
    ['WIP'], 
    ['OC'],
    ['FANART'],
    ['DEV']
];

// ==========================================
// ✨ 全域觸覺回饋引擎 (Haptic Feedback Engine) [研議中]
// ==========================================
window.triggerHaptic = function(type = 'light') {
    if (!navigator.vibrate) return;
    try {
        if (type === 'light') navigator.vibrate(40); // 輕微點擊 (如：切換主題)
        else if (type === 'success') navigator.vibrate([30, 60, 40]); // 成功回饋 (如：複製成功)
        else if (type === 'error') navigator.vibrate([50, 50, 50, 50]); // 錯誤回饋
    } catch (e) { /* 忽略不支援的裝置 */ }
};

// ==========================================
// ✨ 新增：動態非同步引入 Mermaid 引擎 (ESM 模組)
// ==========================================
window.mermaid = null;
import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs').then(m => {
    window.mermaid = m.default;
    const currentTheme = document.documentElement.getAttribute('data-theme') || CONFIG.DEFAULT_THEME;
    // 第一個地方 (約在上方動態引入 import 的區塊) 和 第二個地方 (約在 applyTheme 函數內)
    // 請將這兩處的 initialize 都改成這樣：
    window.mermaid.initialize({
    startOnLoad: false,
    theme: currentTheme === 'dark' ? 'dark' : 'default',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
    securityLevel: 'loose',
    useMaxWidth: false,

    // ✨ 請務必補上這一段：強制四周留白 25px，並使用純向量繪製標籤外框，保證文字絕對不被裁切！
    flowchart: { 
        padding: 15,
        htmlLabels: false 
    }
});
}).catch(err => console.error("Mermaid 引擎載入失敗:", err));

// 共用函數：自動判斷物件屬性並回傳對應的 HTML 徽章 (✨ 支援互斥與優先級)
window.getStatusBadgeHtml = function(item, isTitle = false) {
    const titleClass = isTitle ? ' title-badge' : '';
    let badges = '';

    window.STATUS_LIST.forEach(group => {
        // 在每個互斥群組中，找到「第一個」符合條件的狀態 (即最高優先級)
        const winningStatus = group.find(status => {
            const boolKey = `is_${status.toLowerCase()}`;
            return item[boolKey] === true || (item.tags && item.tags.includes(status));
        });

        if (winningStatus) {
            badges += `<span class="status-badge${titleClass}" data-status="${winningStatus}">${winningStatus}</span>`;
        }
    });
    
    return badges;
};

// 自動將版本號注入到 Footer
const sysVersionEl = document.getElementById('sys-version');
if (sysVersionEl) sysVersionEl.innerText = CONFIG.VERSION;

// ✨ 自動將跑馬燈速度變成 CSS 變數，供畫面排版使用
document.documentElement.style.setProperty('--marquee-speed', `${CONFIG.MARQUEE_SPEED}s`);

// === 全域變數 (系統內部使用) ===
window.siteProjects = [];

// ✨ 取得細項檔案的專屬 Cache Hash
window.getResVersion = function(key) {
    try {
        const versions = JSON.parse(localStorage.getItem('sys_data_versions') || '{}');
        return versions[key] || CONFIG.VERSION;
    } catch (e) {
        return CONFIG.VERSION;
    }
};

// ==========================================
// ✨ 機密檔案解鎖記憶引擎 (Secret Storage Engine - LocalStorage 版)
// ==========================================
window.isSecretUnlocked = function(id) {
    const unlocked = JSON.parse(localStorage.getItem('sys_unlocked_secrets') || '[]');
    return unlocked.includes(id);
};

window.unlockSecret = function(id) {
    let unlocked = JSON.parse(localStorage.getItem('sys_unlocked_secrets') || '[]');
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('sys_unlocked_secrets', JSON.stringify(unlocked));
        return true; // 代表「剛剛才解鎖」
    }
    return false; // 代表「以前就解鎖過了」
};

// ==========================================
// ✨ 全域字體縮放引擎 (Text Scaling Engine)
// ==========================================
window.currentTextScale = parseInt(localStorage.getItem('sys_text_scale')) || 0; 

window.applyTextScale = function() {
    // ✨ 全站縮放：100% (標準) -> 105% (微放) -> 110% (大字)
    const sizes = ['100%', '110%', '125%'];
    document.documentElement.style.setProperty('--sys-base-font-size', sizes[window.currentTextScale]);
    
    // 防呆設計：推播捲軸事件讓「閱讀進度條」與「捲動提示」重新校正
    const activeContainer = window.getActiveScrollContainer();
    if (activeContainer) {
        setTimeout(() => activeContainer.dispatchEvent(new Event('scroll')), 350);
    }
};

window.toggleTextScale = function(event) {
    if (event) event.stopPropagation();
    window.currentTextScale = (window.currentTextScale + 1) % 3;
    localStorage.setItem('sys_text_scale', window.currentTextScale);
    window.applyTextScale();
    
    const scaleNames = ['標準字體 100%', '全站放大 110%', '全站特大 125%'];
    if (window.showSystemToast) {
         window.showSystemToast('>_ SYS_PREFERENCE', '排版尺寸已更新', scaleNames[window.currentTextScale], 2500, 'success');
    }
};

document.addEventListener('DOMContentLoaded', () => window.applyTextScale());

// ==========================================
// ✨ 全域防止捲軸跳動控制器 (Scroll Lock Engine)
// ==========================================
window.lockScroll = function() {
    if (document.body.style.overflow === 'hidden') return;
    document.body.style.overflow = 'hidden';
    
    // ✨ 確保如果獨立的 activeContainer 存在，也暫時凍結它的捲動
    const activeContainer = window.getActiveScrollContainer();
    if (activeContainer && activeContainer !== document.querySelector('.modal-content')) {
        activeContainer.dataset.lockedOverflow = window.getComputedStyle(activeContainer).overflowY;
        activeContainer.style.overflowY = 'hidden';
    }
};

window.unlockScroll = function() {
    document.body.style.overflow = '';
    
    // ✨ 解除 activeContainer 的凍結
    const activeContainer = window.getActiveScrollContainer();
    if (activeContainer && activeContainer.dataset.lockedOverflow) {
        activeContainer.style.overflowY = activeContainer.dataset.lockedOverflow;
        delete activeContainer.dataset.lockedOverflow;
    }
};

// ==========================================
// ✨ PWA 專屬全域下拉重新整理引擎 (Pull-to-Refresh Engine)
// ==========================================
window.initPWAPullToRefresh = function() {
    // 🛡️ 核心防護：只有在 PWA (Standalone) 模式下才啟用，不干擾一般瀏覽器的原生下拉
    if (!window.isPWAEnvironment()) return;

    const indicator = document.createElement('div');
    indicator.id = 'pwa-refresh-indicator';
    indicator.className = 'pwa-refresh-indicator';
    indicator.innerHTML = GLOBAL_SVGS.mermaidReload; // 借用系統的重整 SVG
    document.body.appendChild(indicator);

    let startY = 0;
    let isPulling = false;
    let canRefresh = false;
    
    // ✨ 優化 1：降低觸發門檻 (原本 75 -> 改為 60)，輕輕一拉即可觸發
    const threshold = 60; 

    // 初始化時先推播一次 Scroll 事件
    const activeContainer = window.getActiveScrollContainer();
    if (activeContainer) {
        activeContainer.dispatchEvent(new Event('scroll'));
    }

    document.addEventListener('touchstart', (e) => {
        // ✨ 核心修復 1：將 getScrollContainer() 修正為 window.getActiveScrollContainer()
        const container = window.getActiveScrollContainer();
        const scrollTop = container ? (container.scrollTop || window.scrollY || 0) : 0;
        
        if (scrollTop <= 0) {
            // ✨ 優化 2：改用 clientY，避免受手機系統介面 (如網址列伸縮) 影響導致的座標誤差
            startY = e.touches[0].clientY; 
            isPulling = true;
            indicator.style.transition = 'none'; 
            indicator.classList.remove('is-success');
            indicator.innerHTML = GLOBAL_SVGS.mermaidReload;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        
        const container = window.getActiveScrollContainer();
        const currentScrollTop = container ? (container.scrollTop || window.scrollY || 0) : 0;
        const currentY = e.touches[0].clientY;
        
        // 如果使用者往上滑 (閱讀文章)，動態更新 startY 錨點
        if (currentScrollTop > 0) {
            startY = currentY; 
            indicator.style.transform = `translate(-50%, -100%)`;
            indicator.style.opacity = '0';
            indicator.classList.remove('ready');
            return;
        }

        const pullDistance = currentY - startY;

        // 只有確實往下拉，且當下位於最頂端時才觸發特效
        if (pullDistance > 0 && currentScrollTop <= 0) {
            // 🚨 阻止 PWA 在 iOS/Android 上的原生橡皮筋回彈效應
            if (e.cancelable) e.preventDefault();
            
            // ✨ 優化 3：改變阻力公式，改用線性係數 (0.45)，讓拉動的手感更輕盈且跟手
            const dampenedDistance = pullDistance * 0.45; 
            const rotation = -Math.min(pullDistance * 1.5, 360);
            
            indicator.style.opacity = Math.min(pullDistance / 40, 1).toString();
            indicator.style.transform = `translate(-50%, calc(${dampenedDistance}px - 100%))`;

            const svgIcon = indicator.querySelector('svg');
            if (svgIcon && !indicator.classList.contains('is-reloading')) {
                svgIcon.style.transform = `rotate(${rotation}deg)`;
            }

            if (dampenedDistance >= threshold) {
                canRefresh = true;
                indicator.classList.add('ready');
            } else {
                canRefresh = false;
                indicator.classList.remove('ready');
            }
        } else {
            indicator.style.transform = `translate(-50%, -100%)`;
            indicator.style.opacity = '0';
            indicator.classList.remove('ready');
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        if (!isPulling) return;
        isPulling = false;

        // 手指離開，恢復 CSS 過渡動畫
        indicator.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
        indicator.classList.remove('ready');
        
        if (canRefresh) {
            // 1. 達標：鎖定在頂部並開始 CSS 無限旋轉
            indicator.classList.add('is-reloading');
            indicator.style.transform = `translate(-50%, 30px)`;
            
            const svgIcon = indicator.querySelector('svg');
            if (svgIcon) svgIcon.style.transform = ''; 

            window.triggerHaptic('light'); // 輕微震動提示開始轉
            
            // 2. 轉個 0.7 秒後，漂亮地變成「打勾」圖示！
            setTimeout(() => {
                indicator.classList.remove('is-reloading');
                indicator.classList.add('is-success');
                indicator.innerHTML = GLOBAL_SVGS.check; 
                window.triggerHaptic('success'); // 強震動提示完成
                
                // 3. 停頓 0.4 秒讓使用者看清楚打勾，然後才觸發真正的重整
                setTimeout(() => {
                    if (window.showSystemRebootScreen) {
                        window.showSystemRebootScreen('MANUAL_RELOAD', CONFIG.VERSION, CONFIG.VERSION, 'UPDATING', true);
                    }
                    window.location.reload();
                }, 400);

            }, 700);
            
        } else {
            // ❌ 未達門檻：彈回原位隱藏
            indicator.style.transform = `translate(-50%, -100%)`;
            indicator.style.opacity = '0';
            window.triggerHaptic('light');
        }
        canRefresh = false;
    });
};

// ==========================================
// ✨ 系統版本比對引擎 (SemVer)
// ==========================================
window.compareVersions = function(v1, v2) {
    // 拔除 "U" 等英文字母，純粹比較數字陣列
    const p1 = String(v1).replace(/[^0-9.]/g, '').split('.').map(Number);
    const p2 = String(v2).replace(/[^0-9.]/g, '').split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const num1 = p1[i] || 0, num2 = p2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
};

// ==========================================
// ✨ 共用路徑與路由處理器 (重構優化)
// ==========================================
window.getCleanBasePath = function() {
    // ✨ 核心修復：支援 index.html 與 index_local.html，同時忽略尾端可能多出的斜線 (/)
    const basePath = window.location.pathname.replace(/index(_local)?\.html\/?$/i, '');
    return basePath.endsWith('/') ? basePath : basePath + '/';
};

window.handleAppRouting = function(pParam, aParam, hashParam = null) {
    if (!pParam) return;
    
    const cleanProjectId = pParam.replace(/^\d+_/, '');
    const project = window.siteProjects.find(proj => proj.id === cleanProjectId);
    
    if (!project) {
        show404Modal('404 Project Not Found', '無法找到您指定的專案。<br/>可能不存在或已被移除');
        window.history.replaceState(null, '', window.location.pathname);
        return;
    }

    if (project.is_hidden && !document.body.classList.contains('system-override-active')) {
        show404Modal('403 ACCESS_DENIED', '拒絕存取。<br/><span style="opacity: 0.8; font-size: 0.85em; font-family: monospace;">ERR_SEC_PROTOCOL: Unauthorized request blocked by <span style="cursor: pointer; position: relative;" class="secret-admin-trigger">風川梓</span>.</span>');
        return;
    }

    if (aParam !== null && aParam !== undefined) {
        let aIndex = project.articles.findIndex(art => art.id === aParam);
        if (aIndex === -1 && !isNaN(parseInt(aParam))) aIndex = parseInt(aParam, 10);
        
        if (aIndex !== -1 && aIndex < project.articles.length) {
            const article = project.articles[aIndex];
            if (article.is_hidden && !document.body.classList.contains('system-override-active')) {
                show404Modal('403 ACCESS_DENIED', '拒絕存取。<br/><span style="opacity: 0.8; font-size: 0.85em; font-family: monospace;">ERR_SEC_PROTOCOL: Unauthorized request blocked by <span style="cursor: pointer; position: relative;" class="secret-admin-trigger">風川梓</span>.</span>');
                return;
            }
            window.openArticle(project.id, aIndex, false, 0, hashParam);
        } else {
            show404Modal('404 Article Not Found', `在專案「${project.title}」中找不到此文章。<br/>可能不存在或已被移除。`);
            window.history.replaceState(null, '', window.location.pathname);
        }
    } else {
        window.openProjectIndex(project.id); 
    }
};

// ✅ 1. 新增此共用函式到全域區 (Global Helpers)
window.updateRouteState = function(projectId, articleId = null, targetHash = null) {
    const cleanPath = window.getCleanBasePath();
    
    // ✨ 修改：加入 !== null 的嚴格判斷，防止 articleId 為 0 時失效
    const spaUrl = articleId !== null 
        ? `${window.location.origin}${cleanPath}?p=${projectId}&a=${articleId}${targetHash || ''}`
        : `${window.location.origin}${cleanPath}?p=${projectId}`;
        
    const shareUrl = articleId !== null
        ? `${window.location.origin}${cleanPath}api/${projectId}/${articleId}/index.html`
        : `${window.location.origin}${cleanPath}api/${projectId}/index.html`;

    window.history.replaceState({ path: spaUrl }, '', spaUrl);
    return shareUrl; 
};

window.getArticleSequence = function(projectId) {
    const proj = window.siteProjects.find(p => p.id === projectId);
    if (!proj || !proj.articles) return [];
    
    const isUnlocked = document.body.classList.contains('system-override-active');
    let currentSort = sessionStorage.getItem(`sort_${projectId}`) || proj.default_sort || 'desc';
    
    let displayArticles = proj.articles
        .map((art, idx) => ({ art, idx }))
        .filter(item => isUnlocked || !item.art.is_hidden);
    
    const pinned = displayArticles.filter(item => item.art.pinned);
    const unpinned = displayArticles.filter(item => !item.art.pinned);
    const renderUnpinned = currentSort === 'asc' ? [...unpinned] : [...unpinned].reverse();
    const finalArray = [...pinned, ...renderUnpinned];
    
    let flatSequence = [];
    if (proj.groups && Object.keys(proj.groups).length > 0) {
        for (const groupId of Object.keys(proj.groups)) {
            flatSequence.push(...finalArray.filter(item => item.art.group === groupId));
        }
        flatSequence.push(...finalArray.filter(item => !item.art.group));
    } else {
        flatSequence = [...finalArray];
    }
    
    return flatSequence;
};

window.handleCopy = function(element, shareUrl) {
    if (element.classList.contains('copied') || window.isCopying) return;
    window.isCopying = true;
    
    // 🔒 終極防抖魔法：在改變文字前，先精準鎖死按鈕當下的實際像素寬度！
    const currentWidth = element.getBoundingClientRect().width;
    element.style.width = `${currentWidth}px`;
    
    const originalContent = element.innerHTML;
    // ✨ 抓取原本的 tooltip (如果有)
    const originalTooltip = element.getAttribute('data-tooltip');
    // ✨ 判斷這是不是一個「純圖示」按鈕
    const isIconOnly = element.classList.contains('icon-only-copy');
    
    // 依據按鈕類型，給予不同大小的打勾圖示
    const iconSize = isIconOnly ? '16' : '14';
    const checkSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
        element.classList.add('copied');
        
        // ✨ 如果是純圖示，我們只換打勾圖示，並動態把 Tooltip 改成「已複製！」
        if (isIconOnly) {
            element.innerHTML = checkSvg;
            if (originalTooltip) element.setAttribute('data-tooltip', '已複製！');
        } else {
            // ✨ 加上 btn-text-hideable 確保手機版不會彈出這段文字
            element.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; gap: 4px;">${checkSvg} <span class="btn-text-hideable">已複製</span></div>`;
        }
        
        setTimeout(() => {
            element.classList.remove('copied');
            element.innerHTML = originalContent;
            
            // 🔓 動畫結束後，解除寬度鎖定，把控制權還給 CSS
            element.style.width = '';
            
            // ✨ 把 Tooltip 換回原本的文字
            if (isIconOnly && originalTooltip) element.setAttribute('data-tooltip', originalTooltip);
            window.isCopying = false; 
        }, 2000);
    }).catch(() => {
        element.style.width = ''; // 發生錯誤時也要記得解鎖
        window.isCopying = false;
    });
};

window.focusAndBumpCard = function(targetCard) {
    const cardRect = targetCard.getBoundingClientRect();
    const isVisible = (
        cardRect.top >= 80 && cardRect.bottom <= window.innerHeight &&
        cardRect.left >= 0 && cardRect.right <= window.innerWidth
    );
    
    const distanceY = Math.abs((cardRect.top + cardRect.height / 2) - (window.innerHeight / 2));
    const distanceX = Math.abs((cardRect.left + cardRect.width / 2) - (window.innerWidth / 2));
    const maxDistance = Math.max(distanceX, distanceY);
    
    let dynamicDelay = 50; 
    if (!isVisible) {
        dynamicDelay = Math.min(800, Math.max(300, 200 + (maxDistance * 0.4)));
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
    
    setTimeout(() => {
        targetCard.classList.remove('jump-bump');
        void targetCard.offsetWidth; 
        targetCard.classList.add('jump-bump');
        setTimeout(() => targetCard.classList.remove('jump-bump'), 600);
    }, dynamicDelay);
};

// ==========================================
// ✨ 系統權限切換重刷引擎 (System Override UI Updater)
// ==========================================
window.refreshUIAfterOverrideToggle = function() {
    const isUnlocked = document.body.classList.contains('system-override-active');

    const updateCardCounts = () => {
        window.siteProjects.forEach(proj => {
            const grid = document.getElementById(`${proj.category}-grid`);
            if (grid && proj.articles && proj.articles.length > 0) {
                grid.querySelectorAll('.card').forEach(card => {
                    const titleEl = card.querySelector('h3');
                    if (titleEl && titleEl.innerText.includes(proj.title)) {
                        // ✨ 核心修復：把尋找的 class 改為正確的 .card-action-btn
                        const actionBtn = card.querySelector('.card-action-btn');
                        if (actionBtn && actionBtn.innerText.includes('展開系列')) {
                            // 動態計算當前權限下可見的文章數量
                            const count = isUnlocked ? proj.articles.length : proj.articles.filter(art => !art.is_hidden).length;
                            
                            // ✨ 精準抓出圖標容器，避免破壞 HTML 結構
                            const iconWrap = actionBtn.querySelector('.card-action-icon-wrap');
                            actionBtn.innerHTML = '';
                            if (iconWrap) actionBtn.appendChild(iconWrap);
                            
                            // 重新植入最新的數字
                            actionBtn.insertAdjacentHTML('beforeend', `展開系列 (${count})`);
                        }
                    }
                });
            }
        });
    };

    if (isUnlocked && window._hasAlreadyUnlockedOnce) {
        updateCardCounts();
        return; 
    }

    if (isUnlocked) window._hasAlreadyUnlockedOnce = true;

    const marquees = document.querySelectorAll('.marquee-content');

    marquees.forEach(m => {
        if (isUnlocked) m.classList.add('suppress-secrets');
        const matrix = new DOMMatrix(window.getComputedStyle(m).transform);
        let currentX = matrix.m41;
        const currentWidth = m.offsetWidth;
        if (currentWidth > 0) {
            currentX = currentX % currentWidth;
            if (currentX > 0) currentX -= currentWidth;
        }
        m.dataset.startX = currentX; 
        
        if (m.marqueePlayer) { m.marqueePlayer.cancel(); m.marqueePlayer = null; }
        m.style.transition = 'none';
        m.style.animation = 'none';

        m.classList.remove('suppress-secrets');
        m.classList.add('force-show-secrets');
    });

    void document.body.offsetWidth;

    marquees.forEach(m => {
        m.dataset.targetWidth = m.offsetWidth;
        m.classList.remove('force-show-secrets');
        if (isUnlocked) m.classList.add('suppress-secrets');
    });

    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        document.querySelectorAll('.grid, .gallery').forEach(el => el.dispatchEvent(new Event('scroll')));
        
        updateCardCounts();

        if (window.currentActiveTag) {
            window._pendingActiveTag = window.currentActiveTag;
            window.currentActiveTag = null; 
            document.querySelectorAll('.card').forEach(c => c.classList.remove('highlighted', 'jump-bump'));
            document.querySelectorAll('.active-tag').forEach(t => t.classList.remove('active-tag'));
        }

        marquees.forEach((m, index) => {
            const targetWidth = parseFloat(m.dataset.targetWidth) || m.offsetWidth;
            let startX = parseFloat(m.dataset.startX) || 0;
            
            if (startX > 0) startX = 0;
            if (startX < -targetWidth) startX = startX % targetWidth;

            const distance = Math.abs(-targetWidth - startX);
            const duration = Math.max(600, Math.min(1600, (distance / targetWidth) * 2000));

            m.marqueePlayer = m.animate([
                { transform: `translateX(${startX}px)`, filter: 'blur(0px)' },
                { transform: `translateX(${startX - (distance * 0.5)}px)`, filter: 'blur(3px)' }, 
                { transform: `translateX(-${targetWidth}px)`, filter: 'blur(0px)' }
            ], { duration, easing: 'ease-in-out' });

            if (isUnlocked) {
                setTimeout(() => m.classList.remove('suppress-secrets'), duration / 2); 
            }

            m.marqueePlayer.onfinish = () => {
                m.style.transform = ''; m.style.filter = ''; m.style.animation = ''; m.marqueePlayer = null;
                m.classList.remove('suppress-secrets'); 
                if (index === 0 && window._pendingActiveTag) {
                    const activeTag = window._pendingActiveTag;
                    window._pendingActiveTag = null; 
                    window.filterByTag(activeTag);  
                }
            };
        });
    }, 50);
};

// ==========================================
// ✨ 獨立檔案快取系統 (Singleton Pattern + Hash)
// ==========================================
window.cachedKotobaList = null;
window.getKotobaList = async function() {
    if (window.cachedKotobaList !== null) return window.cachedKotobaList;
    try {
        const res = await fetch(`./kotoba.md?v=${window.getResVersion('kotoba.md')}`);
        if (res.ok) {
            const text = await res.text();
            window.cachedKotobaList = text.split('---').map(n => n.trim()).filter(n => n.length > 0);
        } else {
            window.cachedKotobaList = [];
        }
    } catch (err) { window.cachedKotobaList = []; }
    return window.cachedKotobaList;
};

window.cachedMermaidStyles = null;
window.getMermaidStyles = async function() {
    if (window.cachedMermaidStyles !== null) return window.cachedMermaidStyles;
    try {
        const res = await fetch(`./mermaid_styles.txt?v=${CONFIG.VERSION}`);
        if (res.ok) {
            window.cachedMermaidStyles = await res.text();
        } else {
            window.cachedMermaidStyles = '';
        }
    } catch (err) { window.cachedMermaidStyles = ''; }
    return window.cachedMermaidStyles;
};

window.cachedQuotesList = null;
window.getQuotesList = async function() {
    if (window.cachedQuotesList !== null) return window.cachedQuotesList;
    try {
        const res = await fetch(`./quotes.md?v=${window.getResVersion('quotes.md')}`);
        if (res.ok) {
            const text = await res.text();
            window.cachedQuotesList = text.split('---').map(n => n.trim()).filter(n => n.length > 0);
        } else {
            window.cachedQuotesList = [];
        }
    } catch (err) { window.cachedQuotesList = []; }
    return window.cachedQuotesList;
};

// ==========================================
// ✨ 全域共用輔助函式 (Global Helpers)
// ==========================================

// 1. 判斷是否為 PWA (Standalone) 模式
window.isPWAEnvironment = function() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
};

// 2. 突破 PWA 限制的 Blob 下載/開新分頁引擎
window.downloadViaBlob = async function(url, filename, isNewTab = false) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        
        // ✨ 記憶體防護鎖：把 Blob 綁在頂層物件，告訴 iOS「我還在用它，不要清掉！」
        if (isNewTab) window.__pwa_blob_cache = blob; 
        
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        
        if (isNewTab) a.target = '_blank';
        else a.download = filename || 'download';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            if (!isNewTab) {
                window.URL.revokeObjectURL(blobUrl);
            }
        }, 500);
        return true;
    } catch (error) {
        console.error("Blob Fetch Error:", error);
        return false;
    }
};

// 3. 整合震動與 Toast 的通用安全下載器 / 開新分頁引擎
window.triggerSecureDownload = async function(url, filename, isNewTab = false) {
    window.triggerHaptic('light');
    
    // 🔥 1. 啟用全域轉圈圈膠囊！在背景拉取檔案時鎖定狀態，防止使用者以為當機
    const actionText = isNewTab ? 'OPENING_FILE...' : 'DOWNLOADING...';
    window.toggleLoading(true, actionText); 
    
    const success = await window.downloadViaBlob(url, filename, isNewTab);
    
    // 🔥 2. 拉取完成後，立刻關閉轉圈圈膠囊
    window.toggleLoading(false); 
    
    if (success) {
        window.triggerHaptic('success');
        // 🔥 3. 補上成功提示，明確告知下載已完成
        const iconSvg = isNewTab ? GLOBAL_SVGS.newTab : GLOBAL_SVGS.jumpDown;
        const toastTitle = `<span style="display: inline-flex; align-items: center; gap: 6px;">${iconSvg} 處理完成</span>`;
        if (window.showSystemToast) {
            window.showSystemToast(toastTitle, isNewTab ? '檔案已準備就緒' : '下載成功', filename, 4000, 'success');
        }
    } else {
        // 🔥 4. 下載失敗時，給予明確的錯誤提示並退回原生瀏覽器開啟
        if (window.showSystemToast) {
            window.showSystemToast('ERROR', '處理失敗', '將嘗試使用瀏覽器原生開啟...', 4000, 'error');
        }
        window.open(url, '_blank'); 
    }
};

// 4. 卡片定位後的高光閃爍特效器
window.simulateHoverFlash = function(element, duration = 700) {
    if (!element) return;
    element.classList.add('simulate-hover');
    setTimeout(() => element.classList.remove('simulate-hover'), duration);
};

// 5. 統一系統錯誤畫面生成器
window.getSystemErrorHtml = function(title, msg) {
    return `
    <div class="sys-error-layout" style="padding: 3rem 0;">
        ${GLOBAL_SVGS.errorAlert.replace('<svg ', '<svg class="sys-error-icon" ')}
        <h2 style="margin:0; color:var(--error-color); font-size:1.5rem;">${title}</h2>
        <p class="sys-error-desc">${msg}</p>
    </div>`;
};


window.triggerSystemUpdate = function(targetVersion) {
    // ✨ 新增：在關閉視窗前，擷取網址列的專案 ID 當作失敗時的退路
    const urlParams = new URLSearchParams(window.location.search);
    const pParam = urlParams.get('p');
    if (pParam) sessionStorage.setItem('sys_fallback_project', pParam);

    closeModal();
    sessionStorage.setItem('sys_reboot_count', '1');
    sessionStorage.setItem('sys_is_rebooting', 'true');
    sessionStorage.setItem('sys_expected_version', targetVersion);
    showSystemRebootScreen('CORE_UPDATE', CONFIG.VERSION, targetVersion, 'UPDATING', true);
    
    setTimeout(() => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('v', new Date().getTime());
        window.location.replace(newUrl.toString());
    }, 1200);
};

window.getRelativeOffsetTop = function(element, container) {
    let itemTop = element.offsetTop;
    let currentEl = element.offsetParent;
    while(currentEl && currentEl !== container) {
        itemTop += currentEl.offsetTop;
        currentEl = currentEl.offsetParent;
    }
    return itemTop;
};

// ✨ 智慧定位預判引擎：在離開清單前，預先計算並快取最佳的返回捲軸位置
window.calculateIdealScrollCache = function(containerId, targetItemId, currentCache) {
    const container = document.getElementById(containerId);
    const scroller = window.getActiveScrollContainer() || container; // ✨ 加上這行，取得真正的捲動層
    if (!container) return currentCache || 0;
    
    // 為了計算精準座標，如果容器處於隱藏狀態，暫時打開它的物理佈局
    const wasHidden = container.style.display === 'none';
    if (wasHidden) {
        container.style.visibility = 'hidden';
        container.style.display = 'block';
    }
    
    let finalScroll = currentCache || 0;
    const targetItem = document.getElementById(targetItemId);
    
    if (targetItem) {
        const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 80;
        const itemTop = window.getRelativeOffsetTop(targetItem, scroller); // ✨ 改為 scroller
        const itemBottom = itemTop + targetItem.offsetHeight;
        const containerHeight = scroller.clientHeight || window.innerHeight; // ✨ 改為 scroller
        
        // 判斷目標是否超出現在的捲軸可視範圍，並進行微調
        if (itemTop < finalScroll + topBarHeight) {
            finalScroll = itemTop - topBarHeight - 15;
        } else if (itemBottom > finalScroll + containerHeight) {
            finalScroll = itemBottom - containerHeight + 10;
        }
    }
    
    if (wasHidden) {
        container.style.display = 'none';
        container.style.visibility = '';
    }
    
    return Math.max(0, finalScroll);
};

// ✨ 獲取當下啟用的獨立捲動容器
window.getActiveScrollContainer = function() {
    // ✨ 核心神修復：因為我們把捲動權還給外層的 Modal 了，
    // 現在不論是在目錄還是文章，捲動的永遠都是 .modal-content！
    return document.querySelector('.modal-content'); 
};

// ==========================================
// ✨ 6. 全域安全 Fetch 防護網 (包含 UI 鎖定、逾時與幽靈渲染防護)
// ==========================================
window.safeFetchWithGuard = async function(url, options = {}) {
    if (window._activeFetcher) window._activeFetcher.abort();
    window._activeFetcher = new AbortController();
    const controller = window._activeFetcher;

    window.toggleLoading(true, options.loadingText || 'FETCHING_DATA...');
    document.body.style.cursor = 'wait';

    let isTimeout = false;
    const timeoutId = setTimeout(() => { isTimeout = true; controller.abort(); }, 8000);

    try {
        await window.debugDelay();
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await (options.isJson ? res.json() : res.text());
        return { success: true, data, controller };
    } catch (error) {
        clearTimeout(timeoutId);
        const aborted = error.name === 'AbortError' && !isTimeout;
        const isOffline = !navigator.onLine || (error.message && error.message.includes('Failed to fetch'));
        return { success: false, aborted, isTimeout, isOffline, error, controller };
    } finally {
        if (window._activeFetcher === controller) {
            document.body.style.cursor = '';
            window.toggleLoading(false);
            window._activeFetcher = null;
        }
    }
};

// ==========================================
// ✨ 7. PDF 專用隱形重試載入器 (Background Image Retry Engine)
// ==========================================
window.executePdfImageRetry = function(img, retryUrl) {
    const coverDiv = img.closest('.pdf-mobile-cover');
    const fallback = coverDiv.querySelector('.pdf-fallback-wrapper');
    const floatBtn = coverDiv.querySelector('.pdf-floating-btn');
    const brokenIcon = fallback ? fallback.querySelector('.pdf-status-icon.broken') : null;
    const loadingIcon = fallback ? fallback.querySelector('.pdf-status-icon.loading') : null;
    const hintOverlay = coverDiv.querySelector('.pdf-first-time-overlay');

    if (brokenIcon) brokenIcon.style.display = 'none';
    if (loadingIcon) loadingIcon.style.display = 'block';

    const bgImg = new Image();
    bgImg.onload = function() {
        img.src = retryUrl;
        img.style.display = 'block';
        img.classList.remove('is-loading');
        if (floatBtn) floatBtn.style.display = '';
        if (fallback) fallback.style.display = 'none';
        
        if (hintOverlay && sessionStorage.getItem('sys_pdf_hint_seen') !== 'true') {
            hintOverlay.style.display = 'flex';
        }
        
        if (brokenIcon) brokenIcon.style.display = 'block';
        if (loadingIcon) loadingIcon.style.display = 'none';
    };
    bgImg.onerror = function() {
        img.dataset.isPermanentBroken = 'true';
        if (brokenIcon) brokenIcon.style.display = 'block';
        if (loadingIcon) loadingIcon.style.display = 'none';
    };
    setTimeout(() => { bgImg.src = retryUrl; }, 500);
};

// ==========================================
// ✨ 8. 網格置中捲動演算法 (Grid Item Centering Engine)
// ==========================================
window.scrollContainerByItem = function(container, itemSelector, direction) {
    const items = Array.from(container.querySelectorAll(itemSelector)).filter(el => el.offsetWidth > 0);
    if (!items.length) return;

    const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;
    let targetItem = null;

    if (direction > 0) { // 向右尋找
        targetItem = items.find(el => (el.getBoundingClientRect().left + el.clientWidth / 2) > containerCenter + 20);
    } else { // 向左尋找
        for (let i = items.length - 1; i >= 0; i--) {
            if ((items[i].getBoundingClientRect().left + items[i].clientWidth / 2) < containerCenter - 20) {
                targetItem = items[i];
                break;
            }
        }
    }
    if (targetItem) targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
};

// ==========================================
// ✨ 全域智慧跳轉提示引擎 (Jump Toast Engine)
// ==========================================
window.initJumpToast = function(container, itemSelector) {
    if (!container) return;

    const newArticles = Array.from(container.querySelectorAll(itemSelector))
        .filter(el => el.querySelector('.status-badge[data-status="NEW"]'));
    
    const modalOverlay = document.getElementById('md-modal');
    let jumpToast = document.getElementById('new-jump-toast');
    if (!jumpToast && modalOverlay) {
        jumpToast = document.createElement('button');
        jumpToast.id = 'new-jump-toast';
        jumpToast.className = 'new-jump-toast';
        modalOverlay.appendChild(jumpToast);
    }

    if (window.indexScrollHandler) {
        container.removeEventListener('scroll', window.indexScrollHandler);
        window.indexScrollHandler = null;
    }

    if (newArticles.length > 0 && jumpToast) {
        let targetArticle = null;
        const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 80;
        
        window.indexScrollHandler = () => {
            const containerRect = container.getBoundingClientRect(); 
            let countAbove = 0, countVisible = 0, countBelow = 0;
            let closestAbove = null, closestBelow = null;

            newArticles.forEach(article => {
                const rect = article.getBoundingClientRect();
                if (rect.top < containerRect.top + topBarHeight) {
                    countAbove++; closestAbove = article; 
                } else if (rect.bottom > containerRect.bottom + 20) {
                    countBelow++; if (!closestBelow) closestBelow = article; 
                } else {
                    countVisible++;
                }
            });

            if (countBelow > 0) {
                targetArticle = closestBelow;
                jumpToast.innerHTML = `${GLOBAL_SVGS.jumpDown} ${countVisible > 0 ? '下方還有' : '發現'} ${countBelow} 篇新內容`;
                jumpToast.classList.add('is-visible');
            } else if (countAbove > 0) {
                targetArticle = closestAbove;
                jumpToast.innerHTML = `${GLOBAL_SVGS.jumpUp} ${countVisible > 0 ? '上方還有' : '發現'} ${countAbove} 篇新內容`;
                jumpToast.classList.add('is-visible');
            } else {
                targetArticle = null; jumpToast.classList.remove('is-visible');
            }
        };
        
        container.addEventListener('scroll', window.indexScrollHandler, { passive: true });
        setTimeout(window.indexScrollHandler, 100);

        jumpToast.onclick = () => {
            if (!targetArticle) return;
            targetArticle.scrollIntoView({ behavior: 'smooth', block: 'center' });
            jumpToast.classList.remove('is-visible'); 
            setTimeout(() => { newArticles.forEach(article => window.simulateHoverFlash(article, 1200)); }, 400);
        };
    } else if (jumpToast) {
        jumpToast.classList.remove('is-visible');
    }
};

// ==========================================
// ✨ 全域 Mermaid 渲染引擎 (自動修復大小自適應與高度裁切)
// ==========================================
window._mermaidRetryCount = 0;
window.renderAllMermaidCharts = function(rootElement = document, onComplete = null) {
    if (window.mermaid) {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        window.mermaid.initialize({
            startOnLoad: false,
            theme: currentTheme === 'dark' ? 'dark' : 'default', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
            securityLevel: 'loose',
            useMaxWidth: false,
            // ✨ 務必把這段補進去這兩個地方！
            flowchart: { 
                padding: 15,
                htmlLabels: false 
            }
        });

        rootElement.querySelectorAll('.mermaid').forEach(el => el.removeAttribute('data-processed'));
        
        // 支援局部重繪，避免重繪時干擾其他圖表
        let queryTarget = '.mermaid';
        if (rootElement.classList && rootElement.classList.contains('mermaid-container')) {
            const tempId = 'mermaid-reload-' + Date.now();
            const mDiv = rootElement.querySelector('.mermaid');
            if (mDiv) { mDiv.id = tempId; queryTarget = `#${tempId}`; }
        }

        window.mermaid.run({ querySelector: queryTarget })
        .catch(e => console.warn('Mermaid 語法錯誤:', e))
        .finally(() => {
            // ✨ 核心修復：強制 SVG 補上 height: auto，解決大小自適應錯亂
            rootElement.querySelectorAll('.mermaid svg').forEach(svg => {
                svg.style.maxWidth = '100%'; svg.style.height = 'auto';
            });
            rootElement.querySelectorAll('.mermaid').forEach(el => window.applyMermaidAspectRatio(el));
            rootElement.querySelectorAll('.mermaid-container').forEach(c => c.classList.remove('drag-initialized'));
            window.initMermaidDrag();
            
            if (queryTarget.startsWith('#')) {
                const mDiv = document.querySelector(queryTarget);
                if(mDiv) mDiv.removeAttribute('id');
            }
            if (onComplete) onComplete();
        });
    } else if (window._mermaidRetryCount < 10) {
        window._mermaidRetryCount++;
        setTimeout(() => window.renderAllMermaidCharts(rootElement, onComplete), 300);
    } else {
        console.warn("Mermaid 引擎載入超時，放棄渲染。");
    }
};


// ==========================================
// ✨ 共用捲軸陰影提示系統 (Scroll Hints Engine)
// ==========================================
window.initScrollHints = function(container, hintLeft, hintRight) {
    if (!container || !hintLeft || !hintRight) return;

    let scrollTimeout;
    const checkScroll = () => {
        clearTimeout(scrollTimeout);
        const isScrollable = container.scrollWidth > container.clientWidth + 5;
        const isAtEnd = Math.ceil(container.scrollLeft + container.clientWidth) >= Math.floor(container.scrollWidth) - 10;
        const isAtStart = container.scrollLeft <= 10;

        if (isScrollable && !isAtEnd) hintRight.classList.add('visible');
        else hintRight.classList.remove('visible');

        if (isScrollable && !isAtStart) hintLeft.classList.add('visible');
        else hintLeft.classList.remove('visible');
    };

    container.addEventListener('scroll', checkScroll);
    const imgs = container.querySelectorAll('img');
    imgs.forEach(img => {
        if (img.complete) checkScroll();
        else img.addEventListener('load', checkScroll);
    });

    new ResizeObserver(checkScroll).observe(container);
    setTimeout(checkScroll, 100);
};

// ==========================================
// ✨ 全域漢堡目錄選單渲染引擎 (TOC Menu Engine)
// ==========================================
window.renderTocMenu = function(menuItems, tooltipText) {
    const tocMount = document.getElementById('toc-mount-point');
    if (!tocMount) return;

    let tocWrapper = tocMount.querySelector('.toc-wrapper');

    if (menuItems && menuItems.length > 0) {
        let tocBtn, tocDropdown, tocList;

        if (!tocWrapper) {
            // NO -> YES: 從無到有，建立並掛上初始透明隱形狀態
            tocWrapper = document.createElement('div');
            tocWrapper.className = 'toc-wrapper content-fade-out';
            
            tocBtn = document.createElement('div');
            tocBtn.className = 'toc-toggle-btn';
            tocBtn.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
            
            tocDropdown = document.createElement('div');
            tocDropdown.className = 'toc-dropdown';
            tocDropdown.innerHTML = '<ul class="toc-list"></ul>';
            
            tocWrapper.appendChild(tocBtn);
            tocWrapper.appendChild(tocDropdown);
            tocMount.appendChild(tocWrapper);
            
            requestAnimationFrame(() => { requestAnimationFrame(() => { tocWrapper.classList.remove('content-fade-out'); }); });
        } else {
            // YES -> YES: 沿用舊的 DOM，絕對靜止不動！
            tocBtn = tocWrapper.querySelector('.toc-toggle-btn');
            tocDropdown = tocWrapper.querySelector('.toc-dropdown');
            tocWrapper.classList.remove('content-fade-out');
        }

        tocBtn.setAttribute('data-tooltip', tooltipText);
        tocList = tocDropdown.querySelector('.toc-list');
        tocList.innerHTML = ''; // 清空舊選項

        menuItems.forEach(item => {
            const li = document.createElement('li');
            li.className = item.className || 'toc-h1';
            const a = document.createElement('a');
            
            // ✨ 核心修復 1：改用 innerHTML，讓機密與高光特效能在目錄中渲染！
            a.innerHTML = item.label; 
            
            a.href = "javascript:void(0)";
            a.onclick = () => {
                window.executeAnchorScroll(item.targetHash, false);
                tocBtn.classList.remove('open');
                tocDropdown.classList.remove('active');
            };
            li.appendChild(a);
            tocList.appendChild(li);
        });

        tocBtn.onclick = () => { tocBtn.classList.toggle('open'); tocDropdown.classList.toggle('active'); };
        tocBtn.classList.remove('open');
        tocDropdown.classList.remove('active');

    } else {
        // YES -> NO: 從有到無，瞬間移除無動畫，防止退場期間佔用 Flex 空間導致排版跳動！
        // (因為外層 switchModalContent 已經有全域淡出淡入保護，這裡直接拔除 DOM 視覺最完美)
        if (tocWrapper && tocWrapper.parentNode) {
            tocWrapper.remove();
        }
    }
};

// ==========================================
// ✨ 全域圖片破圖處理器 (終極解決 Safari/iOS 限制 + 點擊重試引擎)
// ==========================================
window.handleImageError = function(img) {
    if (img.dataset.isBroken) return;
    img.dataset.isBroken = "true";
    
    if (!img.dataset.retrySrc) img.dataset.retrySrc = img.src;
    
    img.onerror = null; 
    img.removeAttribute('srcset'); 
    
    img.classList.remove('is-loading');
    img.classList.add('is-broken');
    
    // 換上透明 SVG 讓 CSS 破圖背景透出來
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

    // ✨ 核心判定：排除目錄頁縮圖、群組縮圖 (.group-header-cover) 與其他非內文圖片
    // 只有當圖片位於內文 (.markdown-body) 或是 Lightbox，且「絕對不是」目錄清單或群組縮圖時才允許重試
    const isContentImage = (img.closest('.markdown-body') !== null || img.id === 'lightbox-img') && !img.classList.contains('article-item-cover') && !img.classList.contains('group-header-cover') && !img.classList.contains('card-image');
    if (!isContentImage) {
        img.style.cursor = 'default';
        return; // 提早結束，不綁定重試事件！
    }

    // ✨ 移除原生 tooltip，改由 JS 動態生成懸浮膠囊
    img.removeAttribute('title'); 
    img.style.cursor = 'pointer';

    // 動態插入高質感的重試懸浮提示膠囊
    let retryHint = img.parentNode.querySelector('.img-retry-hint');
    if (!retryHint) {
        retryHint = document.createElement('div');
        retryHint.className = 'img-retry-hint';
        // 使用我們預設的重新載入 SVG 圖標
        retryHint.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg> 點擊重試`;
        
        // 確保父容器有定位能力，讓 absolute 能精準置中
        if (window.getComputedStyle(img.parentNode).position === 'static') {
            img.parentNode.style.position = 'relative';
        }
        
        // 插入到圖片正後方，使其疊加在畫面上
        img.parentNode.insertBefore(retryHint, img.nextSibling);
    }

    // 建立捕獲階段的點擊攔截器 (阻斷 Lightbox 開啟，優先執行重試)
    const retryHandler = function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        img.removeEventListener('click', retryHandler, true);
        
        // 動畫回饋：讓膠囊 Q 彈縮小並淡出
        if (retryHint) {
            retryHint.style.transition = 'transform 0.15s var(--ease-bounce), opacity 0.15s ease';
            retryHint.style.transform = 'translate(-50%, -50%) scale(0.85)';
            retryHint.style.opacity = '0';
        }
        
        // 延遲 150ms 等動畫演完，再拔除節點並重新載入
        setTimeout(() => {
            // 恢復 Loading 狀態
            delete img.dataset.isBroken;
            img.classList.remove('is-broken');
            img.classList.add('is-loading');
            img.style.cursor = '';
            
            // 移除 DOM 中的提示膠囊
            if (retryHint) retryHint.remove();
            
            // 重新綁定 onerror
            img.onerror = function() { window.handleImageError(this); };
            
            // 強制加上時間戳重新請求 (繞過失敗的瀏覽器快取)
            const origSrc = img.dataset.retrySrc;
            const sep = origSrc.includes('?') ? '&' : '?';
            img.src = origSrc + sep + 'retry=' + new Date().getTime();
        }, 150);
    };
    
    // 使用 capture = true，確保它比任何外層的點擊事件 (如 Lightbox) 更早觸發！
    img.addEventListener('click', retryHandler, true);
};

// ==========================================
// ✨ 全域影音破圖處理器 (Media Fallback & Retry Engine)
// ==========================================
window.handleMediaError = function(sourceEl) {
    const wrapper = sourceEl.closest('.media-container-wrapper');
    if (!wrapper || wrapper.dataset.isBroken) return;
    wrapper.dataset.isBroken = "true";

    const isVideo = wrapper.querySelector('video') !== null;
    const mediaTag = wrapper.querySelector('.md-video, .md-audio');
    
    // 擷取副檔名與原網址
    const origSrc = sourceEl.src;
    const ext = sourceEl.type.split('/')[1] || (isVideo ? 'mp4' : 'mp3');
    
    const aspectStyle = isVideo ? "aspect-ratio: 16/9; min-height: 200px;" : "padding: 1rem 0;";
    
    // 拔除原本的媒體播放器，換成一顆巨大的互動式重試按鈕
    if (mediaTag) {
        mediaTag.outerHTML = `
            <div class="media-error-fallback" style="${aspectStyle}" onclick="window.retryMedia(this, '${origSrc}', '${ext}', ${isVideo})">
                <svg class="media-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                </svg>
                <div class="media-error-title">MEDIA_NOT_FOUND</div>
                <div class="retry-text">
                    ${GLOBAL_SVGS.retry} 點擊區塊以重試載入
                </div>
            </div>
        `;
    }
};

// ✨ 新增：影音重試執行引擎
window.retryMedia = function(btnEl, origSrc, ext, isVideo) {
    const wrapper = btnEl.closest('.media-container-wrapper');
    if (!wrapper) return;
    
    // 清除破圖標記
    delete wrapper.dataset.isBroken;
    
    // 強制加上時間戳重抓 (繞過失敗的快取)
    const sep = origSrc.includes('?') ? '&' : '?';
    const retrySrc = origSrc + sep + 'retry=' + new Date().getTime();
    
    const mediaTag = isVideo 
        ? `<video preload="metadata" controls playsinline class="md-video"><source src="${retrySrc}" type="video/${ext}" onerror="window.handleMediaError(this)">您的瀏覽器不支援影片標籤。</video>`
        : `<audio preload="metadata" controls class="md-audio"><source src="${retrySrc}" type="audio/${ext}" onerror="window.handleMediaError(this)">您的瀏覽器不支援音樂標籤。</audio>`;
        
    // 替換回去
    btnEl.outerHTML = mediaTag;
};

// ==========================================
// ✨ 全域系統提示引擎 (Unified System Toast Engine)
// ==========================================
window.showSystemToast = function(title, msg, subMsg, duration = 12000, type = 'error') {
    // 1. 決定顏色主題 (未來可擴充 'success' 等)
    const themeClass = type === 'error' ? 'error' : 'success';
    const shadowColor = type === 'error' ? 'var(--error-shadow)' : 'var(--glow-1)';

    // 2. 移除畫面上舊的提示 (避免重疊堆高)
    const oldToast = document.getElementById('sys-global-toast');
    if (oldToast) {
        clearTimeout(oldToast.autoRemoveTimer);
        oldToast.remove();
    }

    // 3. 建立新的提示
    const toast = document.createElement('div');
    toast.id = 'sys-global-toast';
    
    toast.innerHTML = `
        <div class="sys-toast-box ${themeClass}">
            <div class="toast-x-icon">
                ${GLOBAL_SVGS.closeX}
            </div>
            <strong class="toast-title">${title}</strong>
            <span class="toast-msg">${msg}</span>
            <span class="toast-sub">${subMsg}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // 4. 進場動畫
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 50);

    const xIcon = toast.querySelector('.toast-x-icon');

    // 6. 點擊 X 關閉事件
    if (xIcon) {
        xIcon.onclick = (e) => {
            e.stopPropagation();
            clearTimeout(toast.autoRemoveTimer);
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 400);
        };
    }
    
    // 7. 定時自動消失
    if (duration > 0) {
        toast.autoRemoveTimer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }
};

// ==========================================
// ✨ 全域載入中指示器 (Global Loading Engine)
// ==========================================
window.toggleLoading = function(show, text = 'FETCHING_DATA...') {
    let loader = document.getElementById('sys-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'sys-loader';
        loader.innerHTML = `
            ${GLOBAL_SVGS.spinner}
            <span id="sys-loader-text"></span>
        `;
        document.body.appendChild(loader);
    }
    
    if (show) {
        document.getElementById('sys-loader-text').innerText = text;
        void loader.offsetWidth; // 強制重繪，確保動畫順暢
        loader.classList.add('is-active');
    } else {
        loader.classList.remove('is-active');
    }
};

// ==========================================
// ✨ 測試用延遲引擎 (Debug Delay Engine)
// ==========================================
window.debugDelay = async function() {
    if (CONFIG.DEBUG_FETCH_DELAY > 0) {
        console.log(`[SYS_DEBUG] 強制暫停 ${CONFIG.DEBUG_FETCH_DELAY} 毫秒...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.DEBUG_FETCH_DELAY));
    }
};

// ==========================================
// ✨ Mermaid 自適應比例引擎 (支援動態 Max-Height 與強制高度拖曳)
// ==========================================
window.applyMermaidAspectRatio = function(mermaidDiv) {
    const svg = mermaidDiv.querySelector('svg');
    const wrapper = mermaidDiv.closest('.mermaid-wrapper');
    const container = mermaidDiv.closest('.mermaid-container');
    if (!svg || !wrapper || !container) return;

    const customH = wrapper.getAttribute('data-custom-height');
    
    // 🔥 拔除錯誤的 aspectRatio 設定，讓 Padding 空間真正釋放！
    // 讓高度回歸自然流動 (auto)，瀏覽器會自動包覆 SVG 並完美保留 1.5rem 的上下左右留白。
    wrapper.style.aspectRatio = 'auto';
    wrapper.style.width = '100%';
    wrapper.style.height = 'auto';
    wrapper.style.overflow = 'hidden'; 
    
    if (customH) {
        // 如果有指定 h，將其作為最大高度限制
        // 👉 在手機上：自然高度若小於 customH，完美等比縮放。
        // 👉 在大螢幕：自然高度若超過 customH，高度被鎖死，轉為可拖曳的視窗。
        wrapper.style.maxHeight = `${customH}px`;
    } else {
        wrapper.style.maxHeight = 'none';
    }

    // 內部圖表維持 100% 寬度自然流動
    mermaidDiv.style.width = '100%';
    mermaidDiv.style.height = 'auto';
    mermaidDiv.style.transform = `translate(0px, 0px) scale(1)`;
    container.dataset.x = 0; 
    container.dataset.y = 0; 

    // 解放 SVG 本體：拔除 Mermaid 寫死的絕對像素
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.maxWidth = 'none'; 
    svg.style.display = 'block';
};

// ==========================================
// ✨ 全域閱讀進度條引擎 (rAF 效能優化版)
// ==========================================
window.initProgressBar = function(mountEl, scrollEl, type, existingBarId = null) {
    if (!mountEl || !scrollEl) return;

    let bar = existingBarId ? document.getElementById(existingBarId) : null;
    if (!bar) {
        bar = document.createElement('div');
        if (existingBarId) bar.id = existingBarId;
        mountEl.appendChild(bar);
    }
    
    // ✨ 核心修改：一出生就自帶 is-start 呼吸燈狀態
    bar.className = `sys-progress-bar ${type === 'vertical' ? 'is-vertical-bar' : 'is-top-bar'} is-start`;
    bar.style.display = 'block';
    bar.style.width = '0%';
    bar.classList.remove('is-complete');

    let ticking = false; // ✨ 防抖鎖

    const updateProgress = () => {
        if (bar.style.display === 'none') {
            ticking = false;
            return;
        }
        
        let progress = 100, maxScroll = 0, currentScroll = 0;

        if (type === 'vertical') {
            maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
            currentScroll = Math.abs(scrollEl.scrollLeft);
        } else {
            maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
            currentScroll = Math.ceil(scrollEl.scrollTop);
        }

        if (maxScroll > 0) {
            progress = (maxScroll - currentScroll <= 5) ? 100 : (currentScroll / maxScroll) * 100;
        }

        bar.style.width = `${progress}%`;
        
        // ✨ 核心神修復：動態切換「起點呼吸」、「滑動中」、「終點發光」三種狀態
        if (progress >= 100) {
            bar.classList.add('is-complete');
            bar.classList.remove('is-start');
        } else if (progress <= 0 || currentScroll <= 5) {
            bar.classList.add('is-start');
            bar.classList.remove('is-complete');
        } else {
            // 滑動中：拔除所有特效，保持最乾淨流暢的實線
            bar.classList.remove('is-complete', 'is-start');
        }

        ticking = false; // ✨ 畫完一次畫面，解開防抖鎖
    };

    if (bar._scrollHandler) scrollEl.removeEventListener('scroll', bar._scrollHandler);
    
    // ✨ 只有在沒被鎖住時，才發送繪製請求給 GPU
    bar._scrollHandler = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateProgress);
            ticking = true;
        }
    };
    
    scrollEl.addEventListener('scroll', bar._scrollHandler, { passive: true });
    setTimeout(updateProgress, 100);
    return bar;
};

// ==========================================
// ✨ 全域大圖預覽 (Lightbox 2.0) 控制引擎
// ==========================================

// 儲存目前的相簿狀態與縮放、平移比例
window.lightboxState = { 
    images: [], 
    currentIndex: 0, 
    zoom: 1, 
    x: 0, 
    y: 0,
    maxZoom: 1.5 // 預設 2 倍，之後會動態更新
};

window.openLightbox = function(btn, event) {
    event.stopPropagation();
    const container = btn.closest('figure');
    if (!container) return;
    
    const targetImg = container.querySelector('img');
    const gallery = btn.closest('.gallery'); // ✨ 補回尋找畫廊的邏輯
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    
    // 1. 初始化 Lightbox 狀態
    window.lightboxState = { 
        images: [], 
        currentIndex: 0, 
        zoom: 1, 
        x: 0, 
        y: 0,
        maxZoom: 2 
    };

    // 相簿圖片陣列讀取邏輯
    if (gallery) {
        const figures = Array.from(gallery.querySelectorAll('figure'));
        window.lightboxState.images = figures.map(fig => {
            const img = fig.querySelector('img');
            return {
                // ✨ 優先拿 data-full，沒有才退回 src
                src: img?.getAttribute('data-full') || img?.src,
                caption: fig.querySelector('figcaption')?.innerText.replace('查看大圖', '').trim()
            }
        }).filter(item => item.src);
        
        const targetFullSrc = targetImg.getAttribute('data-full') || targetImg.src;
        window.lightboxState.currentIndex = window.lightboxState.images.findIndex(item => item.src === targetFullSrc);
    } else {
        window.lightboxState.images = [{
            src: targetImg.getAttribute('data-full') || targetImg.src, // ✨ 優先拿 data-full
            caption: container.querySelector('figcaption')?.innerText.replace('查看大圖', '').trim()
        }];
    }

    if (lightboxImg && lightboxModal) {
        // 重置大圖定位動畫 (關閉過渡)
        lightboxImg.style.transition = 'none';

        // 2. 顯示 Modal
        lightboxModal.classList.add('is-active');

        // ✨ 彈窗首次開啟時，強制校正視窗座標，防漏底！
        if (window.adjustModalViewports) window.adjustModalViewports();

        // ✨ 統一將圖片設定、載入與計算交給 View 更新器處理
        window.updateLightboxView();

        // 恢復動畫過渡效果
        setTimeout(() => { 
            lightboxImg.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease'; 
        }, 50);
    }
};

window.addEventListener('resize', () => {
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    
    // 只有在 Lightbox 是開啟狀態時才重新計算
    if (lightboxModal && lightboxModal.classList.contains('is-active') && lightboxImg) {
        const naturalWidth = lightboxImg.naturalWidth;
        const displayWidth = lightboxImg.clientWidth;
        if (displayWidth > 0 && naturalWidth > 0) {
            window.lightboxState.maxZoom = (naturalWidth / displayWidth) * 1.5;
        }
    }
});

window.updateLightboxView = function() {
    const state = window.lightboxState;
    if (state.images.length === 0) return;
    
    const currentItem = state.images[state.currentIndex];
    const lightboxImg = document.getElementById('lightbox-img');
    const customDom = document.getElementById('lightbox-custom-dom');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const wrapper = document.querySelector('.lightbox-img-wrapper'); 
    
    // ✨ 修改後：同步隱藏/顯示前方的分隔線
    const newTabBtn = document.querySelector('.toolbar-btn[onclick*="new-tab"]');
    if (newTabBtn) {
        newTabBtn.style.display = state.isDomMode ? 'none' : 'flex';
        const prevDivider = newTabBtn.previousElementSibling;
        if (prevDivider && prevDivider.classList.contains('toolbar-divider')) {
            prevDivider.style.display = state.isDomMode ? 'none' : 'block';
        }
    }

    if (state.isDomMode) {
        state.zoom = 1; state.x = 0; state.y = 0; 
        if (lightboxImg) lightboxImg.style.display = 'none';
        if (customDom) customDom.style.display = 'flex';
        
        const target = document.getElementById('lightbox-active-mermaid');
        if (target) target.style.transform = `translate(0px, 0px) scale(1)`;
        if (wrapper) wrapper.classList.remove('is-fetching');
        if (lightboxBackdrop) lightboxBackdrop.src = '';
    } else {
        if (customDom) customDom.style.display = 'none';
        if (lightboxImg) {
            lightboxImg.style.display = 'block';
            state.zoom = 1; state.x = 0; state.y = 0; 
            lightboxImg.style.transform = `translate(0px, 0px) scale(1)`; 
            
            // ✨ 核心修復 1：徹底清除上一張圖片的殘留狀態 (不管上一張是成功還是破圖)
            lightboxImg.classList.remove('is-broken');
            delete lightboxImg.dataset.isBroken;
            
            // ✨ 拔除可能遺留的重試膠囊
            const existingHint = wrapper.querySelector('.img-retry-hint');
            if (existingHint) existingHint.remove();
            
            lightboxImg.style.opacity = '0';
            if (wrapper) wrapper.classList.add('is-fetching');

            lightboxImg.onload = () => {
                if (wrapper) wrapper.classList.remove('is-fetching');
                lightboxImg.style.opacity = '1';
                const naturalWidth = lightboxImg.naturalWidth; 
                const displayWidth = lightboxImg.clientWidth;   
                if (displayWidth > 0 && naturalWidth > 0) {
                    window.lightboxState.maxZoom = (naturalWidth / displayWidth) * 1.5;
                } else {
                    window.lightboxState.maxZoom = 2; 
                }
            };

            // ✨ 新增這段：為大圖預覽也接上破圖處理引擎
            lightboxImg.onerror = () => {
                if (wrapper) wrapper.classList.remove('is-fetching');
                lightboxImg.style.opacity = '1';
                window.handleImageError(lightboxImg);
            };
            
            lightboxImg.src = currentItem.src;
            
            // ✨ 嚴格判定：只在圖片確實從快取載入，且高度正常時，才手動觸發 onload。
            // 移除了錯誤的 synchronous onerror 觸發，將真正的破圖判定交還給瀏覽器底層事件。
            if (lightboxImg.complete && lightboxImg.naturalHeight > 0) {
                lightboxImg.onload();
            }
        }
        if (lightboxBackdrop) lightboxBackdrop.src = currentItem.src;
    }
    
    if (lightboxCaption) {
        lightboxCaption.innerText = currentItem.caption || "";
        lightboxCaption.style.display = currentItem.caption ? "block" : "none";
    }

    const navCapsule = document.getElementById('lightbox-nav-capsule');
    const counter = document.getElementById('lightbox-counter');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (state.images.length > 1 && !state.isDomMode) {
        if (navCapsule) navCapsule.style.display = 'inline-flex';
        if (counter) counter.innerText = `${state.currentIndex + 1} / ${state.images.length}`;
        if (prevBtn) prevBtn.classList.toggle('disabled', state.currentIndex === 0);
        if (nextBtn) nextBtn.classList.toggle('disabled', state.currentIndex === state.images.length - 1);
    } else {
        if (navCapsule) navCapsule.style.display = 'none';
    }
};

// 相簿前後切換邏輯
window.navigateLightbox = function(direction, event) {
    if (event) event.stopPropagation();
    const state = window.lightboxState;
    
    if (direction === -1 && state.currentIndex > 0) {
        state.currentIndex--;
        window.updateLightboxView();
    } else if (direction === 1 && state.currentIndex < state.images.length - 1) {
        state.currentIndex++;
        window.updateLightboxView();
    }
};

// 工具列按鈕動作處理器
window.lightboxAction = function(action, event) {
    if (event) event.stopPropagation();
    const state = window.lightboxState;
    const target = state.isDomMode ? document.getElementById('lightbox-active-mermaid') : document.getElementById('lightbox-img');
    if (!target) return;

    if (action === 'zoom-in') {
        state.zoom = Math.min(state.zoom + 0.5, state.maxZoom);
    } else if (action === 'zoom-out') {
        state.zoom = Math.max(state.zoom - 0.5, 0.5);
    } else if (action === 'reset' || action === 'center') {
        if(action === 'reset') state.zoom = 1;
        state.x = 0; state.y = 0;
    } else if (action === 'reload') {
        if (state.isDomMode) {
            // ✨ Mermaid 圖表重整邏輯
            const activeMermaid = document.getElementById('lightbox-active-mermaid');
            if (activeMermaid && window.mermaid) {
                // 1. 核心修復：重整瞬間，先將座標歸零，防止 Mermaid 在縮放狀態下重繪算錯邊界！
                state.zoom = 1;
                state.x = 0;
                state.y = 0;
                activeMermaid.style.transform = 'translate(0px, 0px) scale(1)';
                
                // 2. 加上載入中特效並執行重繪
                activeMermaid.style.opacity = '0.3'; 
                setTimeout(() => {
                    const originalText = decodeURIComponent(activeMermaid.getAttribute('data-original-text') || '');
                    if (originalText) {
                        activeMermaid.removeAttribute('data-processed');
                        activeMermaid.innerHTML = window.processMermaidCssVars(originalText);
                        window.mermaid.run({ querySelector: '#lightbox-active-mermaid' })
                            .catch(e => console.warn('Mermaid reload failed:', e))
                            .finally(() => {
                                activeMermaid.style.opacity = '1';
                            });
                    } else {
                        activeMermaid.style.opacity = '1';
                    }
                }, 150);
            }
            return;
        }
        
        // ✨ 一般圖片重整邏輯
        // 1. 先更新圖片網址，加上時間戳強制繞過瀏覽器快取
        const currentItem = state.images[state.currentIndex];
        const origSrc = currentItem.src.split('?retry=')[0].split('&retry=')[0];
        const sep = origSrc.includes('?') ? '&' : '?';
        currentItem.src = origSrc + sep + 'retry=' + new Date().getTime();
        
        // 2. 再呼叫 update 引擎，讓它用「帶有新時間戳的網址」去重置畫面與座標並載入
        window.updateLightboxView();
        return;
    } else if (action === 'new-tab') {
        if (state.isDomMode) return;
        
        // ✨ 還原：PWA 繼續使用最強的 Blob 呼叫原生瀏覽器！
        if (window.isPWAEnvironment()) {
            window.triggerSecureDownload(target.src, 'image.webp', true);
        } else {
            window.open(target.src, '_blank');
        }
        return;
    }
    
    target.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
};

// ✨ 手機版工具列開關
window.toggleLightboxTools = function(event) {
    if (event) event.stopPropagation();
    const toolbox = document.getElementById('lightbox-toolbox');
    const btn = event ? event.currentTarget : null; // ✨ 抓取被點擊的按鈕
    
    if (toolbox) {
        toolbox.classList.toggle('is-open');
        if (btn) btn.classList.toggle('is-active'); // ✨ 同步切換狀態
    }
};

window.closeLightbox = function() {
    const lightboxModal = document.getElementById('lightbox-modal');
    const toolbox = document.getElementById('lightbox-toolbox');
    const toggleBtn = document.querySelector('.toolbox-toggle-btn'); // ✨ 抓取按鈕
    
    if (lightboxModal) {
        lightboxModal.classList.remove('is-active');
        if (toolbox) toolbox.classList.remove('is-open');
        if (toggleBtn) toggleBtn.classList.remove('is-active'); // ✨ 關閉時拔除狀態
        
        setTimeout(() => {
            const lightboxImg = document.getElementById('lightbox-img');
            if (lightboxImg) {
                // ✨ 核心修復 2：關閉前先拔掉 onerror 監聽，並使用 removeAttribute
                // 避免單純把 src 設為 "" 時，引發瀏覽器底層的誤判報錯！
                lightboxImg.onerror = null;
                lightboxImg.removeAttribute('src');
                lightboxImg.classList.remove('is-broken');
                delete lightboxImg.dataset.isBroken;
            }
            const backdrop = document.getElementById('lightbox-backdrop');
            if (backdrop) backdrop.removeAttribute('src');
            const caption = document.getElementById('lightbox-caption');
            if (caption) caption.innerText = "";
            
            // 清理 Mermaid 記憶體
            const customDom = document.getElementById('lightbox-custom-dom');
            if (customDom) customDom.innerHTML = "";
            window.lightboxState.isDomMode = false;
        }, 300);
    }
    if (document.activeElement) document.activeElement.blur();
};

window.downloadLightboxImage = async function() {
        const img = document.getElementById('lightbox-img');
        if (!img || !img.src) return;
        const url = img.src;
        const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0] || 'download_image.jpg';
        
        window.triggerSecureDownload(url, fileName);
    };

// ==========================================
// ✨ 智慧分流下載器 (自動判斷當前是圖片還是 Mermaid 圖表)
// ==========================================
window.handleLightboxDownload = function(btn) {
    const state = window.lightboxState;
    
    if (state && state.isDomMode) {
        // 如果目前在 Lightbox 裡看的是 Mermaid 圖表，呼叫 PNG 下載引擎
        window.downloadMermaidPNG(btn);
    } else {
        // 如果看的是一般圖片，呼叫原本的圖片下載引擎
        window.downloadLightboxImage();
    }
};

// ==========================================
// ✨ Mermaid 圖表：一鍵下載高清 PNG 引擎 (相容文章內頁與 Lightbox 全螢幕模式)
// ==========================================
window.downloadMermaidPNG = function(btn) {
    let svgEl = null;
    let fileName = 'diagram.png';

    // ✨ 智慧判斷：檢查這個按鈕是在 Lightbox 裡面，還是文章一般的工具列裡
    const lightboxModal = document.getElementById('lightbox-modal');
    const isInsideLightbox = lightboxModal && lightboxModal.contains(btn);

    if (isInsideLightbox) {
        // 模式 A：在 Lightbox 全螢幕檢視中點擊下載
        const customDom = document.getElementById('lightbox-custom-dom');
        if (customDom) {
            svgEl = customDom.querySelector('svg');
        }
        const captionEl = document.getElementById('lightbox-caption');
        if (captionEl && captionEl.innerText) {
            fileName = `${captionEl.innerText.trim()}.png`;
        }
    } else {
        // 模式 B：在文章內頁的工具列點擊下載
        const container = btn.closest('.mermaid-container');
        if (container) {
            svgEl = container.querySelector('.mermaid svg');
            const titleEl = container.querySelector('.mermaid-title');
            if (titleEl) {
                fileName = `${titleEl.innerText.trim()}.png`;
            }
        }
    }

    if (!svgEl) return;

    // 1. 複製一份 SVG 進行處理
    const clonedSvg = svgEl.cloneNode(true);
    if (!clonedSvg.getAttribute('xmlns')) clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // 取得 SVG 的真實寬高 (用來設定畫布尺寸)
    const viewBox = clonedSvg.getAttribute('viewBox');
    let width = parseInt(clonedSvg.getAttribute('width')) || svgEl.getBoundingClientRect().width || 800;
    let height = parseInt(clonedSvg.getAttribute('height')) || svgEl.getBoundingClientRect().height || 600;
    
    if (viewBox) {
        const [, , w, h] = viewBox.split(' ').map(Number);
        width = w || width;
        height = h || height;
    }

    // 2. 序列化 SVG 並轉為 Data URL
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clonedSvg);
    const encodedData = encodeURIComponent(svgString)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodedData;

    // 3. 利用 Image 物件將 SVG 畫到 Canvas 上
    const img = new Image();
    img.onload = () => {
        // ✨ 設定放大倍率為 3 倍，輸出超高清 Retina 解析度
        const scale = 3; 
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        const ctx = canvas.getContext('2d');
        
        // ✨ 智慧背景色補全：根據當下深淺色主題填上背景，防止 PNG 變透明導致字看不見！
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        ctx.fillStyle = currentTheme === 'dark' ? '#020617' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);

        // 4. 輸出為 PNG 檔案並下載
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            
            // ✨ 統一使用創建 a 標籤來點擊 Blob 網址，絕對不要使用 window.open
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            const isPWA = window.isPWAEnvironment();
            if (!isPWA) {
                window.triggerHaptic('success');
                if (window.showSystemToast) {
                     window.showSystemToast('SUCCESS', '圖表已下載', fileName, 3000, 'success');
                }
            }
        }, 'image/png', 1.0);
    };
    img.src = svgUrl;
};

// ==========================================
// ✨ 全域視窗安全高度與座標引擎 (解決 iPad/iOS PWA 遮罩漏底與工具列偏移)
// ==========================================
window.adjustModalViewports = function() {
    // 同時抓取真實的高度與寬度
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    
    // 即時注入給 CSS 使用
    document.documentElement.style.setProperty('--vv-height', vh + 'px');
    document.documentElement.style.setProperty('--vv-width', vw + 'px');
};

// ✨ 專治蘋果 iOS/iPadOS 旋轉延遲的「多段式校正引擎」
window.handleOrientationChange = function() {
    // iPad 旋轉時，螢幕高度變化的 UI 動畫大約需要 400~500ms 才會完全穩定
    // 透過連續多次重新抓取高度，保證不管動畫卡多久，最終必定能抓到完美數值！
    window.adjustModalViewports();
    setTimeout(window.adjustModalViewports, 100);
    setTimeout(window.adjustModalViewports, 300);
    setTimeout(window.adjustModalViewports, 600); 
};

// ==========================================
// ✨ Lightbox 滾輪縮放、拖曳與多點觸控 (Pinch Zoom) 引擎
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    window.adjustModalViewports();

    // 🔥 核心修復：動態注入 CSS 規則！
    // 只要處於觸控裝置狀態，就徹底解除 Mermaid 區塊的防滑動封印，讓手指能順利上下捲動網頁！
    const touchFixStyle = document.createElement('style');
    touchFixStyle.innerHTML = `body.is-touch-device .mermaid-wrapper { touch-action: auto !important; }`;
    document.head.appendChild(touchFixStyle);

    // 綁定視窗動態追蹤 (支援轉向、調整大小時重新計算)
    window.addEventListener('resize', () => {
        // ✨ 使用 requestAnimationFrame 讓 resize 時的計算更平滑，不卡頓
        window.requestAnimationFrame(window.adjustModalViewports);
    });
    
    // 綁定全新的多段連發校正引擎
    window.addEventListener('orientationchange', window.handleOrientationChange);

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', window.adjustModalViewports);
    }

    // 2. 觸控裝置與窄螢幕動態偵測引擎 (解決桌面版縮小視窗時工具列擠壓消失的問題)
    const checkMobileLayout = () => {
        const isTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
        const isNarrowScreen = window.innerWidth < 700; // ✨ 螢幕寬度小於 700px 時強制啟動收合工具列
        
        if (isTouch || isNarrowScreen) {
            document.body.classList.add('is-touch-device');
            
            // ✨ 強制替換手機版工具列開關的圖示，確保結構可被 CSS 動畫精準控制
            const toggleBtn = document.querySelector('.toolbox-toggle-btn');
            if (toggleBtn && !toggleBtn.dataset.iconInjected) {
                toggleBtn.innerHTML = GLOBAL_SVGS.meatballMenu;
                toggleBtn.dataset.iconInjected = 'true'; // 標記已注入，避免重複執行
            }
        } else {
            document.body.classList.remove('is-touch-device');
            
            // 當恢復寬螢幕桌面版時，確保下拉選單處於關閉狀態，避免版面錯亂
            const toolbox = document.getElementById('lightbox-toolbox');
            const toggleBtn = document.querySelector('.toolbox-toggle-btn');
            if (toolbox) toolbox.classList.remove('is-open');
            if (toggleBtn) toggleBtn.classList.remove('is-active');
        }
    };

    // 初始化並綁定到 Resize 追蹤引擎
    checkMobileLayout();
    window.addEventListener('resize', () => {
        window.requestAnimationFrame(checkMobileLayout);
    });
    
    // 針對真實觸控裝置，保留 passive touchstart 監聽以觸發 CSS :active 按壓回饋
    if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
        document.addEventListener('touchstart', function() {}, {passive: true});
    }

    // 3. ✨ Lightbox 多指觸控與拖曳引擎
    const wrapper = document.querySelector('.lightbox-img-wrapper');
    // 移除原本寫死的 const lightboxImg = ...

    let isDragging = false;
    let startClientX = 0, startClientY = 0;
    let activePointers = [];
    let initialPinchDistance = null;
    let initialZoom = 1;

    if (wrapper) {
        // ✨ 動態解析目標
        const getActiveTarget = () => window.lightboxState.isDomMode 
            ? document.getElementById('lightbox-active-mermaid') 
            : document.getElementById('lightbox-img');

        const updateTransform = () => {
            const target = getActiveTarget();
            if (target) {
                target.style.transform = `translate(${window.lightboxState.x}px, ${window.lightboxState.y}px) scale(${window.lightboxState.zoom})`;
            }
        };

        wrapper.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') e.preventDefault();
        });

        const onPointerMove = (e) => {
            const index = activePointers.findIndex(p => p.id === e.pointerId);
            if (index !== -1) {
                activePointers[index].x = e.clientX;
                activePointers[index].y = e.clientY;
            }

            if (activePointers.length === 1 && isDragging) {
                e.preventDefault();
                window.lightboxState.x = activePointers[0].x - startClientX;
                window.lightboxState.y = activePointers[0].y - startClientY;
                requestAnimationFrame(updateTransform);
            } else if (activePointers.length === 2) {
                e.preventDefault();
                const currentDistance = Math.hypot(
                    activePointers[0].x - activePointers[1].x,
                    activePointers[0].y - activePointers[1].y
                );

                if (initialPinchDistance) {
                    let newZoom = initialZoom * (currentDistance / initialPinchDistance);
                    newZoom = Math.max(1, Math.min(newZoom, window.lightboxState.maxZoom)); 
                    const centerX = (activePointers[0].x + activePointers[1].x) / 2;
                    const centerY = (activePointers[0].y + activePointers[1].y) / 2;
                    const ratio = newZoom / window.lightboxState.zoom - 1;
                    
                    window.lightboxState.x -= (centerX - (window.innerWidth / 2) - window.lightboxState.x) * ratio;
                    window.lightboxState.y -= (centerY - (window.innerHeight / 2) - window.lightboxState.y) * ratio;
                    window.lightboxState.zoom = newZoom;
                    requestAnimationFrame(updateTransform);
                }
            }
        };

        const onPointerUp = (e) => {
            activePointers = activePointers.filter(p => p.id !== e.pointerId);
            if (activePointers.length < 2) initialPinchDistance = null; 

            if (activePointers.length === 1) {
                isDragging = true;
                startClientX = activePointers[0].x - window.lightboxState.x;
                startClientY = activePointers[0].y - window.lightboxState.y;
            } else if (activePointers.length === 0) {
                isDragging = false;
                wrapper.classList.remove('is-dragging');
                if (wrapper.hasPointerCapture && wrapper.hasPointerCapture(e.pointerId)) {
                    wrapper.releasePointerCapture(e.pointerId);
                }
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
                window.removeEventListener('pointercancel', onPointerUp);
            }
        };

        wrapper.addEventListener('pointerdown', (e) => {
            const target = getActiveTarget();
            // 確保點擊點在目標圖表或圖片身上
            if (!target || (!target.contains(e.target) && e.target !== target)) return;
            
            // ✨ 核心修復：如果目標是破圖，直接退出事件！絕對不要啟動拖曳與游標綁架！
            // 把點擊的權利完整還給破圖的「重試膠囊」！
            if (e.target.tagName === 'IMG' && e.target.classList.contains('is-broken')) {
                return;
            }
            
            if ((e.target.tagName === 'IMG' && !e.target.classList.contains('is-broken')) || e.target.closest('svg')) {
                 e.preventDefault(); 
            }

            activePointers.push({ id: e.pointerId, x: e.clientX, y: e.clientY });

            if (activePointers.length === 1) {
                isDragging = true;
                wrapper.classList.add('is-dragging');
                if (wrapper.setPointerCapture) wrapper.setPointerCapture(e.pointerId);
                
                startClientX = e.clientX - window.lightboxState.x;
                startClientY = e.clientY - window.lightboxState.y;
                
                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
                window.addEventListener('pointercancel', onPointerUp);
            } else if (activePointers.length === 2) {
                isDragging = false; 
                initialPinchDistance = Math.hypot(
                    activePointers[0].x - activePointers[1].x,
                    activePointers[0].y - activePointers[1].y
                );
                initialZoom = window.lightboxState.zoom;
            }
        });
        
        wrapper.addEventListener('wheel', (e) => {
            if (!document.getElementById('lightbox-modal').classList.contains('is-active')) return;
            e.preventDefault();
            
            const target = getActiveTarget();
            if(!target) return;

            const state = window.lightboxState;
            const delta = e.deltaY < 0 ? 1 : -1;
            
            let newZoom = Math.max(1, Math.min(state.zoom * (1 + delta * 0.15), state.maxZoom));
            newZoom = Math.max(1, Math.min(newZoom, state.maxZoom));
            
            const ratio = newZoom / state.zoom - 1;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            state.x -= (e.clientX - centerX - state.x) * ratio;
            state.y -= (e.clientY - centerY - state.y) * ratio;
            state.zoom = newZoom;
            
            target.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
        }, { passive: false });
    }
});

// ==========================================
// ✨ 攔截 Markdown 渲染，讓圖片一出生就自帶載入中特效，0毫秒延遲！
// ==========================================
const renderer = new marked.Renderer();

// ==========================================
// ✨ Mermaid CSS 變數轉譯引擎 (將 var 與 rgba 轉為標準 Hex 色碼)
// ==========================================
window.processMermaidCssVars = function(text) {
    // 1. 物理超渡隱形空白 (避免全形空白報錯)
    let processed = text.replace(/[\u00A0\u3000]/g, ' ');

    // 2. 將 var(--xxx) 替換為當下實際的 CSS 數值 (從根目錄抓取)
    processed = processed.replace(/var\((--[^,)]+)(?:,[^)]+)?\)/g, (match, varName) => {
        let val = getComputedStyle(document.documentElement).getPropertyValue(varName.trim()).trim();
        return val || match;
    });

    // 3. 將 rgba() / rgb() 轉為 Mermaid 100% 支援的 8/6 碼 Hex 色碼
    processed = processed.replace(/rgba?\(([^)]+)\)/g, (match, inner) => {
        let parts = inner.split(',').map(s => s.trim());
        if (parts.length >= 3) {
            let r = parseInt(parts[0]);
            let g = parseInt(parts[1]);
            let b = parseInt(parts[2]);
            let a = parts.length >= 4 ? parseFloat(parts[3]) : 1;
            
            // 轉換 RGB 為 6 碼 Hex
            let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
            // 若有透明度，轉換 Alpha 頻道為後 2 碼 Hex
            if (a < 1) {
                let alphaHex = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
                hex += alphaHex;
            }
            return hex;
        }
        return match;
    });

    return processed;
};

// ==========================================
// ✨ 專屬：PDF 首次引導遮罩解除引擎 (Session 級別)
// ==========================================
// 網頁一載入，立刻檢查「本次瀏覽期間」是否已經點擊過 PDF
if (sessionStorage.getItem('sys_pdf_hint_seen') === 'true') {
    document.documentElement.classList.add('pdf-hint-dismissed');
}

window.dismissPdfHint = function() {
    // 🔥 拔除 if 檢查，無論如何只要函式觸發就銷毀畫面上的遮罩！
    sessionStorage.setItem('sys_pdf_hint_seen', 'true');
    document.documentElement.classList.add('pdf-hint-dismissed');
    document.querySelectorAll('.pdf-first-time-overlay').forEach(el => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 400); 
    });
};

// ==========================================
// ✨ 專屬：PDF 縮圖背景無縫重試引擎
// ==========================================
window.handlePdfPosterError = function(img) {
    const coverDiv = img.closest('.pdf-mobile-cover');
    if (!coverDiv || img.dataset.isPermanentBroken) return;

    const floatBtn = coverDiv.querySelector('.pdf-floating-btn');
    const fallback = coverDiv.querySelector('.pdf-fallback-wrapper');
    const brokenIcon = fallback ? fallback.querySelector('.pdf-status-icon.broken') : null;
    const loadingIcon = fallback ? fallback.querySelector('.pdf-status-icon.loading') : null;
    const hintOverlay = coverDiv.querySelector('.pdf-first-time-overlay'); // 🔥 抓取遮罩

    // 1. 紀錄原始網址供重試使用
    if (!img.dataset.retrySrc) img.dataset.retrySrc = img.src;

    // 2. 發生錯誤時，立刻切換至 Fallback 降級版面
    img.style.display = 'none';
    img.classList.remove('is-loading');
    if (floatBtn) floatBtn.style.display = 'none';
    if (fallback) fallback.style.display = 'flex';
    if (hintOverlay) hintOverlay.style.display = 'none'; // 🔥 第一時間強制隱藏遮罩，防止重疊！

    // 3. 背景隱形重試機制：最多重試 1 次
    let retryCount = parseInt(img.dataset.retryCount || '0');
    if (retryCount < 1) {
        img.dataset.retryCount = (retryCount + 1).toString();
        const origSrc = img.dataset.retrySrc;
        const sep = origSrc.includes('?') ? '&' : '?';
        const retryUrl = origSrc + sep + 'retry=' + new Date().getTime();
        
        // 🔥 直接呼叫共用引擎
        window.executePdfImageRetry(img, retryUrl);
    } else {
        img.dataset.isPermanentBroken = 'true';
        if (brokenIcon) brokenIcon.style.display = 'block';
        if (loadingIcon) loadingIcon.style.display = 'none';
    }
};

// ✨ 統一重新載入引擎 (同時重整 iframe 與手機縮圖)
window.reloadPdfContainer = function(btn) {
    const container = btn.closest('.pdf-container');
    if (!container) return;

    // 1. 重整桌機版 iframe
    const ifr = container.querySelector('iframe');
    if (ifr) {
        const orig = ifr.src;
        ifr.src = '';
        setTimeout(() => ifr.src = orig, 100);
    }

    // 2. 重整手機版縮圖
    const img = container.querySelector('.pdf-poster-img');
    if (img) {
        const coverDiv = container.querySelector('.pdf-mobile-cover');
        const fallback = coverDiv.querySelector('.pdf-fallback-wrapper');
        const floatBtn = coverDiv.querySelector('.pdf-floating-btn');
        const hintOverlay = coverDiv.querySelector('.pdf-first-time-overlay'); // 🔥 抓取遮罩

        delete img.dataset.isPermanentBroken;
        img.dataset.retryCount = '0';
        
        const origSrc = img.dataset.retrySrc || img.src;
        const sep = origSrc.includes('?') ? '&' : '?';
        const retryUrl = origSrc + sep + 'manual_retry=' + new Date().getTime();

        const isBroken = fallback && window.getComputedStyle(fallback).display !== 'none';

        if (isBroken) {
            // 🔥 直接呼叫共用引擎
            window.executePdfImageRetry(img, retryUrl);
        } else {
            if (fallback) fallback.style.display = 'none';
            img.style.display = 'block';
            img.classList.add('is-loading');
            if (floatBtn) floatBtn.style.display = ''; 
            img.src = retryUrl;
        }
    }
};

// ==========================================
// ✨ 輔助函數：渲染 PDF 嵌入框架 (動態高度預覽版)
// ==========================================
function renderPDFIframe(href, altText, posterUrl = '', ar = '') {
    let customHeight = "600px";
    const hMatch = href.match(/[?&]h=(\d+)/i);
    if (hMatch) customHeight = hMatch[1] + "px";
    
    const safeAltText = altText ? altText.replace(/'/g, "\\'") : "Document.pdf";
    
    // 🔥 修復 1：點擊事件升級！只有在遮罩「真的存在且沒被隱藏」時，才觸發銷毀與紀錄
    const mobileClickHandler = `
        event.stopPropagation();
        const overlay = this.querySelector('.pdf-first-time-overlay');
        if(overlay && window.getComputedStyle(overlay).display !== 'none' && window.dismissPdfHint) {
            window.dismissPdfHint();
        }
        window.showPdfActionModal('${href}', '${safeAltText}');
    `;

    const coverStyle = ar ? ` style="aspect-ratio: ${ar}; width: 100%; height: auto;"` : '';
    const iframeStyle = `height: ${customHeight}; width: 100%; border: none; display: block; background: var(--bg);`;

    const posterHtml = posterUrl 
        ? `<img src="${posterUrl}" class="pdf-poster-img is-loading" alt="PDF Cover" onload="this.classList.remove('is-loading')" onerror="window.handlePdfPosterError(this)"${coverStyle}>` 
        : '';

    // 🔥 修復 2：讓 Fallback 錯誤頁面框框也完美繼承算好的長寬比例！
    const fallbackArStyle = ar ? ` aspect-ratio: ${ar}; width: 100%; height: auto;` : '';
    const fallbackStyle = (posterUrl ? 'display: none;' : 'display: flex;') + fallbackArStyle;

    // ✨ 準備三種 SVG 圖示，確保它們的尺寸完全一致 (64x64)，這樣切換時就絕對不會位移！
    const genericDocSvg = GLOBAL_SVGS.docIconLg.replace('width="20" height="20"', 'class="pdf-status-icon generic" width="64" height="64" style="opacity: 0.5; margin-bottom: 1.2rem;"');
    const brokenImgSvg = `<svg class="pdf-status-icon broken" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; margin-bottom: 1.2rem; ${posterUrl ? '' : 'display: none;'}"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline><line x1="3" y1="3" x2="21" y2="21"></line></svg>`;
    const loadingSvg = `<svg class="pdf-status-icon loading" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; margin-bottom: 1.2rem; transform-origin: center center; animation: lightbox-spin 0.8s linear infinite; display: none;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`;

    // 將三個 SVG 疊加在同一個位置
    const fallbackHtml = `
        <div class="pdf-fallback-wrapper" style="${fallbackStyle}">
            <div class="pdf-poster-fallback">
                ${posterUrl ? brokenImgSvg + loadingSvg : genericDocSvg}
            </div>
            <div class="pdf-fallback-text">點擊下方按鈕以檢視或下載 PDF 檔案</div>
            <div class="pdf-hint-capsule">
                ${GLOBAL_SVGS.newTab} 點擊開啟 PDF 操作選單
            </div>
        </div>
    `;

    const firstTimeOverlayHtml = posterUrl ? `
        <div class="pdf-first-time-overlay">
            <div class="pdf-first-time-icon">
                ${GLOBAL_SVGS.newTab}
            </div>
            <div class="pdf-first-time-text">點擊區塊以檢視<br>或下載 PDF 檔案</div>
        </div>
    ` : '';

    return `
    <div class="pdf-container" 
        onclick="if(document.body.classList.contains('is-touch-device')) { ${mobileClickHandler} }">
        
        <div class="pdf-container-header" onclick="event.stopPropagation();">
            <div class="pdf-container-title">
                ${GLOBAL_SVGS.docIcon}
                <span style="transform: translateY(1px);">${altText || 'Document.pdf'}</span>
            </div>
            
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="mermaid-btn" data-tooltip="重新整理" onclick="event.stopPropagation(); window.reloadPdfContainer(this);">
                    ${GLOBAL_SVGS.mermaidReload}
                </button>
                <div class="action-btn-divider desktop-only"></div>
                <button class="mermaid-btn desktop-only" data-tooltip="新分頁開啟" onclick="event.stopPropagation(); window.open('${href}', '_blank');">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </button>
            </div>
        </div>
        
        <iframe class="pdf-iframe" src="${href}" style="${iframeStyle}">您的瀏覽器不支援 PDF 嵌入。</iframe>
        
        <div class="pdf-mobile-cover">
            ${posterHtml}
            ${fallbackHtml}
            ${posterUrl ? `<button class="zoom-btn floating pdf-floating-btn">${GLOBAL_SVGS.newTab}</button>` : ''}
            ${firstTimeOverlayHtml}
        </div>
    </div>`;
}

// ==========================================
// ✨ 輔助函數：渲染影音標籤 (Video / Audio)
// ==========================================
function renderMediaTag(cleanMediaUrl, ext, isVideo, posterUrl, altText, imgTitle, ar = '') {
    const displayTitle = altText || imgTitle || (isVideo ? '影片播放' : '音樂播放');
    const iconSvg = isVideo ? GLOBAL_SVGS.videoIcon : GLOBAL_SVGS.audioIcon;
    const posterAttr = (isVideo && posterUrl) ? ` poster="${posterUrl}"` : '';
    // 🔥 如果有算好的比例就用，沒有的話影片預設回退到 16/9
    const aspectStyle = ar ? ` style="aspect-ratio: ${ar}; width: 100%;"` : (isVideo ? ` style="aspect-ratio: 16/9; width: 100%;"` : '');
    
    // 🔥 注入 aspectStyle 到 video 標籤裡
    const mediaTag = isVideo 
        ? `<video preload="metadata" controls playsinline${posterAttr} class="md-video"${aspectStyle}><source src="${cleanMediaUrl}" type="video/${ext}" onerror="window.handleMediaError(this)">您的瀏覽器不支援影片標籤。</video>`
        : `<audio preload="metadata" controls class="md-audio"><source src="${cleanMediaUrl}" type="audio/${ext}" onerror="window.handleMediaError(this)">您的瀏覽器不支援音樂標籤。</audio>`;

    // ✨ 影音專屬：重載腳本 (加上時間戳防快取)
    const reloadScript = `event.stopPropagation(); const media = this.closest('.media-container-wrapper').querySelector('.md-video, .md-audio'); const source = media.querySelector('source'); const orig = source.src.split('?retry=')[0].split('&retry=')[0]; const sep = orig.includes('?') ? '&' : '?'; source.src = orig + sep + 'retry=' + new Date().getTime(); media.load();`;

    // ✨ 注入重新整理按鈕，並在有全螢幕按鈕時加入分隔線
    const actionBtns = `
        <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button class="mermaid-btn" data-tooltip="重新整理" onclick="${reloadScript}">${GLOBAL_SVGS.mermaidReload}</button>
            ${isVideo ? `
            <div style="width: 1px; height: 16px; background: var(--card-border); margin: 0 2px; align-self: center;"></div>
            <button class="mermaid-btn" data-tooltip="全螢幕檢視" onclick="window.toggleWebFullscreen(this.closest('.media-container-wrapper').querySelector('video'))">${GLOBAL_SVGS.mermaidFull}</button>
            ` : ''}
        </div>
    `;

    return `
    <div class="media-container-wrapper">
        <div class="media-container-header" onclick="event.stopPropagation();">
            <div class="media-container-title">
                ${iconSvg}<span style="transform: translateY(1px);">${displayTitle}</span>
            </div>
            ${actionBtns}
        </div>
        ${mediaTag}
    </div>`;
}

// ==========================================
// 1. ✨ 核心主圖片渲染器 (經過重構，極度乾淨！)
// ==========================================
renderer.image = function(token_or_href, title, text) {
    const href = typeof token_or_href === 'object' ? token_or_href.href : token_or_href;
    const altText = typeof token_or_href === 'object' ? token_or_href.text : text;
    const imgTitle = typeof token_or_href === 'object' ? token_or_href.title : title; 
    
    // ✨ 加上這行：將 alt 轉為小寫並去除空白，防止大小寫判定失敗
    const cleanAlt = (altText || '').trim().toLowerCase();

    if (!href) return '';
    
    let decodedHref = href.replace(/%23/g, '#');
    
    // 🔥 擷取並分離真實寬高參數
    let w = '', h = '';
    const wMatch = decodedHref.match(/&w=(\d+)/);
    const hMatch = decodedHref.match(/&h=(\d+)/);
    if (wMatch && hMatch) {
        w = wMatch[1];
        h = hMatch[1];
        // 從原本的網址中剔除這兩個參數
        decodedHref = decodedHref.replace(/&w=\d+/, '').replace(/&h=\d+/, '');
    }
    
    // 給 PDF 或影音使用的比例字串 (利用原生 CSS 支援的 W/H 寫法)
    let ar = (w && h) ? `${w}/${h}` : '';

    // ✨ 為了相容之前的舊版 &ar= 參數，我們還是要保留這個檢查
    const arMatch = decodedHref.match(/&ar=([0-9.]+)/);
    if (arMatch) { 
        ar = arMatch[1];
        // 從原本的網址中剔除這個參數
        decodedHref = decodedHref.replace(/&ar=[0-9.]+/, '');
    }

    let cleanMediaUrl = decodedHref;
    let posterUrl = '';
    if (decodedHref.includes('#poster=')) {
        const parts = decodedHref.split('#poster=');
        cleanMediaUrl = parts[0]; posterUrl = parts[1];
    }
    
    const pureUrlForExt = cleanMediaUrl.split('?')[0];

    // 1. 攔截 PDF (🔥 補上 ar 參數)
    if (pureUrlForExt.match(/\.pdf$/i)) return renderPDFIframe(cleanMediaUrl, altText, posterUrl, ar);

    // 2. 攔截影音 (🔥 補上 ar 參數)
    const isVideo = pureUrlForExt.match(/\.(mp4|webm|ogg)$/i);
    const isAudio = pureUrlForExt.match(/\.(mp3|wav)$/i);
    if (isVideo || isAudio) {
        const ext = pureUrlForExt.split('.').pop().toLowerCase();
        return renderMediaTag(cleanMediaUrl, ext, isVideo, posterUrl, altText, imgTitle, ar);
    }

    // 3. 一般圖片
    let srcUrl = decodedHref, fullUrl = decodedHref;
    if (decodedHref.includes('#full=')) {
        const parts = decodedHref.split('#full=');
        srcUrl = parts[0]; fullUrl = parts[1];
    }

    // 🔥 改用原生 HTML width / height 屬性，並強制鎖死 aspect-ratio，徹底防止透明 SVG 替換造成的高度塌陷！
    const sizeAttr = (w && h) ? `width="${w}" height="${h}" style="aspect-ratio: ${w}/${h};" ` : '';

    // 🔥 替換 imgTag，注入真實尺寸
    const imgTag = `<img src="${srcUrl}" data-full="${fullUrl}" alt="${altText || ''}" class="is-loading" ${sizeAttr}loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">`;
    const zoomBtnHtml = `<button class="zoom-btn" data-tooltip="放大檢視" onclick="window.openLightbox(this, event)">${GLOBAL_SVGS.zoomIcon}</button>`;
    const floatingZoomBtnHtml = `<button class="zoom-btn floating" data-tooltip="放大檢視" onclick="window.openLightbox(this, event)">${GLOBAL_SVGS.zoomIcon}</button>`;

    if (imgTitle) {
        let figureClass = (cleanAlt === 'float-right' || cleanAlt === 'float-left') ? ` class="${cleanAlt}"` : '';
        return `<figure${figureClass}>${imgTag}<figcaption>${imgTitle}${zoomBtnHtml}</figcaption></figure>`;
    } else {
        if (cleanAlt === 'icon' || cleanAlt === 'badge') return imgTag;
        let figureClass = 'no-caption' + ((cleanAlt === 'float-right' || cleanAlt === 'float-left') ? ` ${cleanAlt}` : '');
        return `<figure class="${figureClass}">${imgTag}${floatingZoomBtnHtml}</figure>`;
    }
};

// 2. ✨ 攔截 Mermaid 程式碼區塊與一般程式碼區塊
const originalCodeRenderer = renderer.code.bind(renderer);
renderer.code = function(token_or_code, language, isEscaped) {
    const lang = typeof token_or_code === 'object' ? token_or_code.lang : language;
    
    let rawText = typeof token_or_code === 'object' ? token_or_code.text : token_or_code;

    if (lang && lang.startsWith('mermaid')) {
        const globalMermaidClasses = window.cachedMermaidStyles || '';
        if (globalMermaidClasses) {
            rawText = rawText.replace(/^(graph\s+[A-Za-z]+|flowchart\s+[A-Za-z]+)/im, `$1\n${globalMermaidClasses}\n`);
        }

        const encodedText = encodeURIComponent(rawText);
        const processedText = window.processMermaidCssVars(rawText);

        let chartTitle = "流程圖 (Flowchart)";
        const fullLang = typeof token_or_code === 'object' ? (token_or_code.lang || language) : (language || '');
        const titleMatch = fullLang.match(/\[(.*?)\]/);
        
        if (titleMatch && titleMatch[1]) {
            chartTitle = titleMatch[1];
        } else if (window._lastMarkdownHeadings && window._lastMarkdownHeadings.length > 0) {
            chartTitle = window._lastMarkdownHeadings[window._lastMarkdownHeadings.length - 1];
        }

        // 🔥 解析自訂高度 (例如：?h=800) 並塞入 data 屬性，交給渲染後端計算
        let customHeightAttr = "";
        const hMatch = fullLang.match(/[?&]h=(\d+)/i);
        if (hMatch) {
            customHeightAttr = ` data-custom-height="${hMatch[1]}"`;
        }

        // ✨ 完整歸還你的工具列與按鈕 HTML！請完整覆蓋原本 return 的這整段：
        return `
        <div class="mermaid-container" data-zoom="1" data-x="0" data-y="0">
            <div class="mermaid-toolbar" onclick="event.stopPropagation();">
                <span class="mermaid-title">${chartTitle}</span>
                <div class="mermaid-btns">
                    <button class="mermaid-btn" onclick="window.zoomMermaid(this, 'zoom-in')" data-tooltip="放大">${GLOBAL_SVGS.mermaidZoomIn}</button>
                    <button class="mermaid-btn" onclick="window.zoomMermaid(this, 'zoom-out')" data-tooltip="縮小">${GLOBAL_SVGS.mermaidZoomOut}</button>
                    <button class="mermaid-btn" onclick="window.zoomMermaid(this, 'center')" data-tooltip="置中">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <circle cx="12" cy="12" r="3" />
                            <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2" />
                            <path d="M12 2v3M2 12h3M22 12h-3M12 22v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </button>
                    <button class="mermaid-btn" onclick="window.zoomMermaid(this, 'reset')" data-tooltip="初始狀態">${GLOBAL_SVGS.mermaidReset}</button>
                    
                    <div class="action-btn-divider desktop-only"></div>
                    
                    <button class="mermaid-btn" onclick="window.reloadMermaid(this)" data-tooltip="重新整理">${GLOBAL_SVGS.mermaidReload}</button>
                    <button class="mermaid-btn desktop-only" data-tooltip="下載" onclick="window.downloadMermaidPNG(this)">${GLOBAL_SVGS.download}</button>
                    
                    <div style="width: 1px; height: 16px; background: var(--card-border); margin: 0 2px; align-self: center;"></div>
                    
                    <button class="mermaid-btn" onclick="window.fullscreenMermaid(this)" data-tooltip="放大檢視">${GLOBAL_SVGS.mermaidFull}</button>
                </div>
            </div>
            <!-- 🔥 帶有等比縮放引擎的 Wrapper，並加入內距與 normal 行高防止文字撐破畫布 -->
            <div class="mermaid-wrapper" style="padding: 1.5rem; line-height: normal;"${customHeightAttr}>
                <div class="mermaid" data-original-text="${encodedText}">${processedText}</div>
            </div>
        </div>`;
    }

    // ✨ 非 Mermaid 的普通程式碼區塊：加上複製按鈕、語言標籤與「檔案名稱」
    const fullLang = typeof token_or_code === 'object' ? (token_or_code.lang || language) : (language || '');
    
    // 解析自訂檔案名稱，例如 `javascript [main.js]`
    let fileName = '';
    const titleMatch = fullLang.match(/\[(.*?)\]/);
    if (titleMatch && titleMatch[1]) {
        fileName = titleMatch[1].trim();
    }
    
    const cleanLang = fullLang ? fullLang.split('[')[0].trim() : 'text'; // 容錯處理，預設為 text
    const escapedText = rawText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const copyIcon = GLOBAL_SVGS.copy;

    // ✨ 核心修復：將語言與檔案名稱合併，中間加個分隔線，徹底解決重疊！
    const labelContent = fileName 
        ? `${cleanLang} <span style="opacity: 0.3; margin: 0 6px;">|</span> <span style="text-transform: none; color: var(--accent-2);">${fileName}</span>` 
        : cleanLang;

    return `
    <div class="code-block-wrapper" style="position: relative;">
        <!-- ✨ 拔除 title 屬性，就不會有系統預設的 tooltip 跑出來了 -->
        <div class="code-lang-label">${labelContent}</div>
        <button class="code-copy-btn" onclick="window.copyCodeBlock(this)">
            ${copyIcon} <span class="copy-text">Copy</span>
        </button>
        <pre><code class="language-${cleanLang}">${escapedText}</code></pre>
    </div>`;
};

// ==========================================
// ✨ 新增：程式碼區塊一鍵複製引擎
// ==========================================
window.copyCodeBlock = function(btn) {
    // 防止重複點擊
    if (btn.classList.contains('copied')) return;
    
    // 往上找到外層容器，再往下精準抓取 code 裡面的文字
    const wrapper = btn.closest('.code-block-wrapper');
    const codeEl = wrapper.querySelector('code');
    if (!codeEl) return;

    // innerText 會自動處理好換行與跳脫字元，拿來複製最精準
    const textToCopy = codeEl.innerText;

    // 儲存原本的按鈕內容
    const originalHtml = btn.innerHTML;
    const checkIcon = GLOBAL_SVGS.check;

    navigator.clipboard.writeText(textToCopy).then(() => {
        // 成功時切換狀態與文字
        btn.classList.add('copied');
        btn.innerHTML = `${checkIcon} <span class="copy-text">Copied!</span>`;

        // 2 秒後恢復原狀
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalHtml;
        }, 2000);
    }).catch(err => {
        console.error('程式碼複製失敗:', err);
        btn.innerHTML = `<span class="copy-text" style="color: var(--error-color);">Error</span>`;
        setTimeout(() => btn.innerHTML = originalHtml, 2000);
    });
};

// 3. ✨ 攔截 Markdown 連結
renderer.link = function(token_or_href, title, text) {
    const href = typeof token_or_href === 'object' ? token_or_href.href : token_or_href;
    const linkTitle = typeof token_or_href === 'object' ? token_or_href.title : title;
    
    // ✨ 核心修復：使用內部解析器把 ![badge](...) 語法轉化為真正的 <img> 標籤
    let linkText = text;
    if (typeof token_or_href === 'object') {
        linkText = token_or_href.tokens ? this.parser.parseInline(token_or_href.tokens) : token_or_href.text;
    }

    // ✨ 魔法 1：支援多重樣式按鈕！只要 title 是以 btn 開頭，就直接把它當作 class 塞入
    if (linkTitle && linkTitle.toLowerCase().startsWith('btn')) {
        const btnClasses = linkTitle.toLowerCase(); // 例如 "btn btn-fill" 或 "btn btn-danger"
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="${btnClasses}" style="margin: 0.5rem 0.5rem 0.5rem 0; text-decoration: none; display: inline-flex;">${linkText}</a>`;
    }

    const titleAttr = linkTitle ? ` title="${linkTitle}"` : '';
    if (!href) return `<a${titleAttr} style="font-weight: 600;">${linkText}</a>`;

    // ✨ 魔法 2：智慧判斷如果連結裡面包的是圖片 (例如 GitHub 小徽章 Badge)，拔除外部箭頭與文字粗體
    const isImageLink = linkText.includes('<img');
    const baseStyle = isImageLink ? 'display: inline-block; vertical-align: middle; transition: transform 0.2s ease;' : 'font-weight: 600;';
    const hoverFx = isImageLink ? ' onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'none\'"' : '';

    // 攔截內部 SPA 跳轉
    if (href.includes('?p=') && !href.startsWith('http')) {
        const safeHref = href.replace(/'/g, "\\'");
        return `<a href="${href}" onclick="window.handleSpaLink(event, '${safeHref}')"${titleAttr} style="${baseStyle}"${hoverFx}>${linkText}</a>`;
    }

    // 攔截內部錨點跳轉
    if (href.startsWith('#')) {
        const safeHref = href.replace(/'/g, "\\'");
        return `<a href="${href}" onclick="window.scrollToAnchor(event, '${safeHref}')"${titleAttr} style="${baseStyle}"${hoverFx}>${linkText}</a>`;
    }
    
    // 外部連結 (替換小圖示)
    if (href.startsWith('http')) {
        const extIcon = isImageLink ? '' : GLOBAL_SVGS.extLinkSm;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr} style="${baseStyle}"${hoverFx}>${linkText}${extIcon}</a>`;
    }

    return `<a href="${href}"${titleAttr} style="${baseStyle}"${hoverFx}>${linkText}</a>`;
};

// 4. ✨ 攔截 Markdown 標題，同時用全域陣列記住最新出現的標題文字
window._lastMarkdownHeadings = [];
renderer.heading = function(token_or_text, level, raw) {
    // 1. 抓取原始文字與層級
    let rawText = typeof token_or_text === 'object' ? token_or_text.text : token_or_text;
    const depth = typeof token_or_text === 'object' ? token_or_text.depth : level;
    
    // 2. ✨ 核心修復：優先解析標題內的 Inline 元素 (讓高光、機密文字能在標題內運作！)
    let parsedText = typeof token_or_text === 'object' && token_or_text.tokens 
        ? this.parser.parseInline(token_or_text.tokens) 
        : rawText;
    
    // 3. 偵測並拔除 {#自訂ID}
    let customId = null;
    const idMatch = rawText.match(/\s+\{#([^}]+)\}$/);
    
    if (idMatch) {
        customId = idMatch[1].trim();
        // 分別從 rawText 與解析後的 HTML 字串尾端剔除 ID
        rawText = rawText.replace(/\s+\{#[^}]+\}$/, '').trim(); 
        parsedText = parsedText.replace(/\s+\{#[^}]+\}$/, '').trim();
    }

    // 將最乾淨的標題文字存入全域，給 Mermaid 抓取當作圖表預設標題
    window._lastMarkdownHeadings.push(rawText.replace(/<[^>]+>/g, '')); 
    
    const id = customId || rawText.toLowerCase().replace(/\s+/g, '-').replace(/<[^>]+>/g, '');
    
    // ✨ 輸出時，畫面上的內容使用已渲染的 parsedText！
    return `<h${depth} id="md-sys-${id}" data-raw-title="${encodeURIComponent(rawText)}">${parsedText}</h${depth}>`;
};

// ==========================================
// ✨ 修正：Discord 風格防雷/機密文字擴充 (完美同步與逆向撕紙版)
// ==========================================
const spoilerExtension = {
    name: 'spoiler',
    level: 'inline', 
    start(src) { return src.match(/\|\|/)?.index; }, 
    tokenizer(src, tokens) {
        const rule = /^\|\|(.*?)\|\|/; 
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'spoiler',
                raw: match[0],
                text: match[1],
                tokens: this.lexer.inlineTokens(match[1]) 
            };
        }
    },
    renderer(token) {
        // ✨ 加入 event.stopPropagation() 以及追蹤容器 (spoiler-fold-wrapper)
        return `<span class="spoiler-text" onclick="event.stopPropagation(); this.classList.toggle('revealed')"><span class="spoiler-content">${this.parser.parseInline(token.tokens)}</span><span class="spoiler-cover"></span><span class="spoiler-fold-wrapper"><span class="spoiler-fold"></span></span></span>`;
    }
};

// ==========================================
// ✨ 機密隱藏區塊 (Secret Block)
// ==========================================
const secretBlockExtension = {
    name: 'secretBlock',
    level: 'block',
    start(src) { return src.match(/^:::\s*secret/i)?.index; },
    tokenizer(src, tokens) {
        const rule = /^:::\s*secret(?:\[(.*?)\])?(?:[ \t]*"([^"]+)")?\n([\s\S]*?)\n:::/i;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'secretBlock',
                raw: match[0],
                secretId: match[1] || 'DEFAULT_KEY',
                coverText: match[2] || 'ENCRYPTED DATA',
                tokens: this.lexer.blockTokens(match[3])
            };
        }
    },
    renderer(token) {
        const isUnlocked = window.isSecretUnlocked(token.secretId);
        const placeId = window._currentRenderPlace + '_' + token.secretId;
        let animatedPlaces = JSON.parse(localStorage.getItem('sys_animated_secrets') || '[]');
        const hasAnimatedHere = animatedPlaces.includes(placeId);

        let statusClass = 'is-locked';
        if (isUnlocked) {
            statusClass = hasAnimatedHere ? 'is-unlocked already-unlocked' : 'is-locked pending-auto-unlock';
        }

        const lockIcon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
        
        return `
        <div class="md-secret-block ${statusClass}" data-secret-id="${token.secretId}" data-place-id="${placeId}">
            <div class="secret-overlay">
                ${lockIcon}
                <span class="secret-cover-text">${token.coverText}</span>
                <span style="font-size: 0.7rem; font-weight: normal; opacity: 0.7; margin-top: 4px;">Requires Key: [${token.secretId}]</span>
            </div>
            <div class="secret-content markdown-body">
                ${this.parser.parse(token.tokens)}
            </div>
        </div>`;
    }
};

// ==========================================
// ✨ 行內機密文字 (Inline Secret) 
// ==========================================
const inlineSecretExtension = {
    name: 'inlineSecret',
    level: 'inline',
    start(src) { return src.match(/!!\[/)?.index; },
    tokenizer(src, tokens) {
        const rule = /^!!\[(.*?)\](?:[ \t]*"([^"]+)")?\s*([\s\S]*?)!!/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'inlineSecret',
                raw: match[0],
                secretId: match[1] || 'DEFAULT_KEY',
                coverText: match[2] || 'LOCKED',
                tokens: this.lexer.inlineTokens(match[3])
            };
        }
    },
    renderer(token) {
        const isUnlocked = window.isSecretUnlocked(token.secretId);
        const placeId = window._currentRenderPlace + '_' + token.secretId;
        let animatedPlaces = JSON.parse(localStorage.getItem('sys_animated_secrets') || '[]');
        const hasAnimatedHere = animatedPlaces.includes(placeId);

        let statusClass = 'is-locked';
        if (isUnlocked) {
            statusClass = hasAnimatedHere ? 'is-unlocked already-unlocked' : 'is-locked pending-auto-unlock';
        }
        
        const lockIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;

        return `<span class="md-inline-secret ${statusClass}" data-secret-id="${token.secretId}" data-place-id="${placeId}"><span class="secret-overlay">${lockIcon}<span class="secret-cover-text">${token.coverText}</span></span><span class="secret-content">${this.parser.parseInline(token.tokens)}</span></span>`;
    }
};

// ==========================================
// ✨ 無痕偽裝機密 (Stealth Secret)
// ==========================================
const stealthSecretExtension = {
    name: 'stealthSecret',
    level: 'inline',
    start(src) { return src.match(/\?\?\[/)?.index; },
    tokenizer(src, tokens) {
        const rule = /^\?\?\[(.*?)\](?:[ \t]*"([^"]+)")?\s*([\s\S]*?)\s*\?\?/;
        const match = rule.exec(src);
        if (match) {
            const coverStr = match[2] || '***'; 
            return {
                type: 'stealthSecret',
                raw: match[0],
                secretId: match[1] || 'DEFAULT_KEY',
                coverTokens: this.lexer.inlineTokens(coverStr.trim()), 
                tokens: this.lexer.inlineTokens(match[3].trim())
            };
        }
    },
    renderer(token) {
        const isUnlocked = window.isSecretUnlocked(token.secretId);
        const placeId = window._currentRenderPlace + '_' + token.secretId;
        let animatedPlaces = JSON.parse(localStorage.getItem('sys_animated_secrets') || '[]');
        const hasAnimatedHere = animatedPlaces.includes(placeId);

        let statusClass = 'is-locked';
        if (isUnlocked) {
            statusClass = hasAnimatedHere ? 'is-unlocked already-unlocked' : 'is-locked pending-auto-unlock';
        }

        const parsedCover = this.parser.parseInline(token.coverTokens);
        const parsedReal = this.parser.parseInline(token.tokens);

        return `<span class="md-stealth-secret ${statusClass}" data-secret-id="${token.secretId}" data-place-id="${placeId}"><span class="stealth-cover">${parsedCover}</span><span class="stealth-real">${parsedReal}</span></span>`;
    }
};

// ==========================================
// ✨ 區塊級無痕偽裝 (Stealth Block)
// ==========================================
const stealthBlockExtension = {
    name: 'stealthBlock',
    level: 'block',
    start(src) { return src.match(/^:::\s*stealth/i)?.index; },
    tokenizer(src, tokens) {
        const rule = /^:::\s*stealth(?:\[(.*?)\])?\n([\s\S]*?)\n:::/i;
        const match = rule.exec(src);
        if (match) {
            const innerContent = match[2];
            let coverStr = '***';
            let realStr = innerContent;
            
            const parts = innerContent.split(/\n---\n/);
            if (parts.length > 1) {
                coverStr = parts[0];
                realStr = parts.slice(1).join('\n---\n');
            }

            return {
                type: 'stealthBlock',
                raw: match[0],
                secretId: match[1] || 'DEFAULT_KEY',
                coverTokens: this.lexer.blockTokens(coverStr.trim()), 
                tokens: this.lexer.blockTokens(realStr.trim())
            };
        }
    },
    renderer(token) {
        const isUnlocked = window.isSecretUnlocked(token.secretId);
        const placeId = window._currentRenderPlace + '_' + token.secretId;
        let animatedPlaces = JSON.parse(localStorage.getItem('sys_animated_secrets') || '[]');
        const hasAnimatedHere = animatedPlaces.includes(placeId);

        let statusClass = 'is-locked';
        if (isUnlocked) {
            statusClass = hasAnimatedHere ? 'is-unlocked already-unlocked' : 'is-locked pending-auto-unlock';
        }

        const parsedCover = this.parser.parse(token.coverTokens);
        const parsedReal = this.parser.parse(token.tokens);

        return `<div class="md-stealth-block ${statusClass}" data-secret-id="${token.secretId}" data-place-id="${placeId}"><div class="stealth-cover">${parsedCover}</div><div class="stealth-real">${parsedReal}</div></div>`;
    }
};

// ==========================================
// ✨ 修改：讓高光螢光筆支援 KEY 觸發
// ==========================================
const highlightExtension = {
    name: 'updateHighlight',
    level: 'inline',
    start(src) { return src.match(/\+\+/)?.index; },
    tokenizer(src, tokens) {
        const rule = /^\+\+(?:\[(.*?)\])?([\s\S]*?)\+\+/; 
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'updateHighlight',
                raw: match[0],
                badgeText: match[1] || '',  
                content: match[2],          
                tokens: this.lexer.inlineTokens(match[2])
            };
        }
    },
    renderer(token) {
        const badge = token.badgeText.trim();
        
        // ✨ 新增：判斷這是不是一把「鑰匙」
        const isKey = badge.startsWith('KEY:');
        const secretId = isKey ? badge.replace('KEY:', '').trim() : '';
        const keyAttr = isKey ? ` data-secret-key="${secretId}"` : '';
        
        // 如果是鑰匙，改變預設外觀
        const displayText = isKey ? 'KEY FOUND' : (badge ? badge : 'HIGHLIGHT'); 
        const statusAttr = (badge && !isKey) ? ` data-status="${badge.toUpperCase()}"` : '';
        const defaultStyle = (badge && !isKey) ? '' : ' style="--dynamic-glow: var(--accent-2);"';
        
        const repeatedText = `${displayText} • `.repeat(20);
        const duration = Math.max(20, repeatedText.length * 0.4); 
        
        const bgHtml = `<span class="marquee-text-track" style="--marquee-duration: ${duration}s;" aria-hidden="true"><span class="marquee-part">${repeatedText}</span><span class="marquee-part">${repeatedText}</span></span>`;
        
        // ✨ 把 keyAttr 塞入最外層
        return `<span class="md-highlight-text"${statusAttr}${defaultStyle}${keyAttr}>${bgHtml}<span class="text-content">${this.parser.parseInline(token.tokens)}</span></span>`;
    }
};

// ==========================================
// ✨ 區塊型高光透視框 (Block Highlight)
// ==========================================
const highlightBlockExtension = {
    name: 'highlightBlock',
    level: 'block',
    start(src) { return src.match(/^:::\s*highlight/i)?.index; },
    tokenizer(src, tokens) {
        const rule = /^:::\s*highlight(?:\[(.*?)\])?\n([\s\S]*?)\n:::/i;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'highlightBlock',
                raw: match[0],
                badgeText: match[1] || '',
                text: match[2],
                tokens: this.lexer.blockTokens(match[2])
            };
        }
    },
    renderer(token) {
        const badge = token.badgeText.trim();
        const statusAttr = badge ? ` data-status="${badge.toUpperCase()}"` : '';
        const defaultStyle = badge ? '' : ' style="--dynamic-glow: var(--accent);"';
        const displayText = badge ? badge : 'HIGHLIGHT'; 
        
        const repeatedText = `${displayText} • `.repeat(50);
        const duration = Math.max(20, repeatedText.length * 0.4); 
        
        const bgHtml = `<div class="marquee-text-track" style="--marquee-duration: ${duration}s;" aria-hidden="true"><span class="marquee-part">${repeatedText}</span><span class="marquee-part">${repeatedText}</span></div>`;
        
        return `<div class="md-highlight-text is-block"${statusAttr}${defaultStyle}>${bgHtml}<div class="text-content">${this.parser.parse(token.tokens)}</div></div>`;
    }
};

// ==========================================
// ✨ 日文漢字注音擴充 (Ruby Furigana)
// 語法：^^漢字(かんじ)^^ (預設日文) 或 ^^Word(Pronunciation)[en]^^ (自訂語言)
// ==========================================
const rubyExtension = {
    name: 'ruby',
    level: 'inline',
    start(src) { return src.match(/\^\^/)?.index; },
    tokenizer(src, tokens) {
        const rule = /^\^\^([^()]+)\(([^()]+)\)(?:\[([a-zA-Z\-]+)\])?\^\^/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'ruby',
                raw: match[0],
                kanji: match[1],
                furigana: match[2],
                lang: match[3] || 'ja' // 預設自動套用日文
            };
        }
    },
    renderer(token) {
        return `<ruby lang="${token.lang}">${token.kanji}<rt>${token.furigana}</rt></ruby>`;
    }
};

// ==========================================
// ✨ 多語系段落區塊 (Language Block)
// ==========================================
const langBlockExtension = {
    name: 'langBlock',
    level: 'block',
    start(src) { return src.match(/^:::\s*lang/i)?.index; },
    tokenizer(src, tokens) {
        const rule = /^:::\s*lang(?:\[([a-zA-Z\-]+)\])?\n([\s\S]*?)\n:::/i;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'langBlock',
                raw: match[0],
                lang: match[1] || 'ja',
                tokens: this.lexer.blockTokens(match[2].trim())
            };
        }
    },
    renderer(token) {
        return `<div lang="${token.lang}" class="lang-wrapper">${this.parser.parse(token.tokens)}</div>`;
    }
};

// ==========================================
// ✨ 摺疊區塊 (Collapsible Details)
// ==========================================
const detailsBlockExtension = {
    name: 'detailsBlock',
    level: 'block',
    start(src) { return src.match(/^:::\s*details/i)?.index; },
    tokenizer(src, tokens) {
        const rule = /^:::\s*details(?:\[(.*?)\])?\n([\s\S]*?)\n:::/i;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'detailsBlock',
                raw: match[0],
                summaryText: match[1] || '點擊展開查看',
                tokens: this.lexer.blockTokens(match[2])
            };
        }
    },
    renderer(token) {
        return `
        <details class="md-details">
            <summary>
                <svg class="details-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                <span style="flex-grow: 1;">${token.summaryText}</span>
            </summary>
            <div class="md-details-content">
                ${this.parser.parse(token.tokens)}
            </div>
        </details>
        `;
    }
};

// ⚠️ 註冊擴充元件
marked.use({ 
    // ✨ 確保 langBlockExtension 有加進去
    extensions: [spoilerExtension, highlightExtension, secretBlockExtension, inlineSecretExtension, stealthSecretExtension, stealthBlockExtension, highlightBlockExtension, rubyExtension, langBlockExtension, detailsBlockExtension], 
    renderer: renderer,
    breaks: false, 
    gfm: true      
});

// ==========================================
// ✨ 全域 SPA 路由跳轉攔截器 (支援錨點擷取版 + 防呆)
// ==========================================
window.handleSpaLink = function(event, url) {
    event.preventDefault(); 
    // 防呆：防止 Marked.js 偷偷把網址裡的 & 轉譯成 &amp;
    const cleanUrl = url.replace(/&amp;/g, '&');
    
    // ✨ 核心修復 2：精準分離 Query String 與 Hash，無視前方的路徑 (如 /index.html 或 ./)
    const queryString = cleanUrl.includes('?') ? cleanUrl.split('?')[1].split('#')[0] : '';
    const hashPart = cleanUrl.includes('#') ? cleanUrl.split('#')[1] : null;
    
    const urlParams = new URLSearchParams(queryString);
    
    // 將 hash 傳遞給路由處理器
    window.handleAppRouting(urlParams.get('p'), urlParams.get('a'), hashPart ? '#' + hashPart : null);
};

// === 1. 介面與導覽列邏輯 (Theme & Menu) ===
document.addEventListener('DOMContentLoaded', () => {
    
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    let initialTheme = CONFIG.DEFAULT_THEME; 
    if (savedTheme) initialTheme = savedTheme;
    else if (prefersLight) initialTheme = 'light';

    function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    if (window.mermaid) {
        window.mermaid.initialize({
            startOnLoad: false,
            // ✨ 核心修復：將 currentTheme 改為傳進來的 theme
            theme: theme === 'dark' ? 'dark' : 'default', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
            securityLevel: 'loose',
            useMaxWidth: false,
            flowchart: { 
                padding: 15,
                htmlLabels: false 
            }
        });
        
        const mermaidEls = document.querySelectorAll('.mermaid');
            if (mermaidEls.length > 0) {
                mermaidEls.forEach(el => {
                    // 取出含有 var() 的備份原文
                    const originalText = decodeURIComponent(el.getAttribute('data-original-text') || '');
                    if (originalText) {
                        // ✨ 魔法發生：重新丟進翻譯蒟蒻，這時它會抓到新主題的 CSS 色碼！
                        el.textContent = window.processMermaidCssVars(originalText); 
                        el.removeAttribute('data-processed'); 
                    }
                });
                window.mermaid.run({ querySelector: '.mermaid' }).catch(() => {});
            }
        }
        //主題網頁標籤示切換//
        // const targetFaviconUrl = theme === 'light' ? CONFIG.FAVICON_LIGHT : CONFIG.FAVICON_DARK;
        // document.querySelectorAll("link[rel='icon']").forEach(link => link.href = targetFaviconUrl);
    }

    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        let currentAttr = document.documentElement.getAttribute('data-theme');
        let newTheme = currentAttr === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'light' : 'dark');
    });

    const menuToggle = document.getElementById('menu-toggle');
    const fullscreenMenu = document.getElementById('fullscreen-menu');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        fullscreenMenu.classList.toggle('active');
        if (fullscreenMenu.classList.contains('active')) {
            window.lockScroll();
        } else {
            // ✨ 延遲 600 毫秒，等選單完全滑出畫面後，再解鎖捲軸！
            setTimeout(() => window.unlockScroll(), 600); 
        }
    });

    // ==========================================
    // ✨ 漢堡選單：事件代理 (Event Delegation) 與同頁面強制跳轉/動畫重播
    // ==========================================
    fullscreenMenu.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            e.preventDefault(); 
            
            const targetHash = navItem.getAttribute('href');
            const targetId = targetHash.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (!targetSection) return;

            // 1. 關閉選單視覺
            menuToggle.classList.remove('open');
            fullscreenMenu.classList.remove('active');
            
            // 如果網址列不一樣，就手動更新網址列 (不觸發預設跳動)
            if (window.location.hash !== targetHash) {
                window.history.pushState(null, null, targetHash);
            }

            // ✨ 效能修復：先等選單的透明度動畫開始，再來做滾動，最後才解鎖 CSS 的 overflow: hidden
            setTimeout(() => {
                
                // ✨ 定位修復：放棄寫死的座標，改回使用原生支援 CSS `scroll-margin-top` 的 scrollIntoView！
                // 因為我們已經把它放進 setTimeout 避開了效能衝突，現在它既不卡頓，又能完美定位了。
                targetSection.scrollIntoView({ behavior: 'smooth' });

                // 處理光暈特效過渡重播
                if (targetSection.animationTimer) clearTimeout(targetSection.animationTimer);
                
                targetSection.classList.remove('force-target');
                void targetSection.offsetWidth; 
                
                targetSection.classList.add('force-target');
                
                // ✨ 兩秒後移除系統輔助。若此時滑鼠正在上面 (Hover)，
                // 視覺會被滑鼠完美接管，直到滑鼠移開才會消失！
                targetSection.animationTimer = setTimeout(() => {
                    targetSection.classList.remove('force-target');
                }, 2000);

                // 動畫跑得差不多了，最後再把捲軸防護解開
                setTimeout(() => {
                    window.unlockScroll();
                }, 200);

            }, 50);


        }
    });

    // ✨ 言の箱彩蛋
    const siteTitle = document.querySelector('header h1');
    const profileSection = document.querySelector('main section p');
    let clickCount = 0;
    let clickTimer = null;
    const originalProfile = profileSection ? profileSection.innerHTML : '';

    if (siteTitle && profileSection) {
        siteTitle.style.cursor = 'pointer';
        window.isWhispering = false;

        siteTitle.addEventListener('click', async () => {
            if (window.isWhispering) return; 
            
            clickCount++;
            clearTimeout(clickTimer);
            
            if (clickCount >= 5) {
                window.isWhispering = true; 
                clickCount = 0; 
                
                // ✨ 核心修改 1：在解鎖前，先記住當下是否為「剛好被解鎖的瞬間」
                const isJustUnlocked = !document.body.classList.contains('system-override-active');
                
                // 強制保持解鎖狀態
                document.body.classList.add('system-override-active');
                
                // 呼叫全域重刷引擎 (它內部已有防止重複執行的保護機制)
                window.refreshUIAfterOverrideToggle();
                
                const currentHeight = profileSection.offsetHeight;
                profileSection.style.height = currentHeight + 'px';
                profileSection.style.overflowY = 'auto'; 
                
                profileSection.style.opacity = 0;
                
                try {
                    const notes = await window.getKotobaList();
                    if (notes.length === 0) throw new Error("無可用題庫");
                    const randomNote = notes[Math.floor(Math.random() * notes.length)];
                    
                    setTimeout(() => {
                        // ✨ 核心修改 2：只有「解鎖的當下」亮紅燈，其餘時候都是黃燈日誌！
                        const statusText = isJustUnlocked ? "[ SYSTEM_OVERRIDE_ENABLED : CLASSIFIED_DATA_UNLOCKED ]" : "[ SYSTEM_LOG : KOTOBA_NO_BOX ]";
                        const textColor = isJustUnlocked ? "var(--error-color)" : "var(--accent-2)";
                        
                        const logHeader = `<div style="color: ${textColor}; font-family: 'Courier New', monospace; font-size: 0.85rem; margin-bottom: 0;">${statusText}</div>`;
                        const parsedNote = `<div style="margin-top: -1rem; margin-bottom: 0;">${marked.parse(randomNote)}</div>`;
                        
                        profileSection.innerHTML = logHeader + parsedNote;
                        profileSection.style.opacity = 1;
                    }, 300);
                } catch (err) {
                    console.error("言の箱載入失敗:", err);
                    setTimeout(() => {
                        profileSection.innerHTML = `<span style="color: var(--error-color);">[ERR] KOTOBA_NO_BOX_OFFLINE</span>`;
                        profileSection.style.opacity = 1;
                    }, 300);
                }

                setTimeout(() => {
                    profileSection.style.opacity = 0;
                    setTimeout(() => {
                        profileSection.innerHTML = originalProfile;
                        profileSection.style.opacity = 1;
                        window.isWhispering = false; 
                        
                        profileSection.style.height = '';
                        profileSection.style.overflowY = '';
                    }, 300);
                }, 12000);
            } else {
                clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
            }
        });
    }
});

// === 2. 返回頂部 (Back to Top) 邏輯 ===
const bttBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    // 只要往下捲動超過 300px，就加上 visible，讓它浮現！
    if (bttBtn) {
        bttBtn.classList.toggle('visible', window.scrollY > 300);
    }
});

if (bttBtn) {
    bttBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// === 3. JSON 資料載入與卡片動態生成 ===
async function loadProjects() {
    const dynamicNav = document.getElementById('dynamic-nav');
    const portfolioSections = document.getElementById('portfolio-sections');
    const marquee = document.getElementById('marquee-text');

    try {
        // ✨ 核心資料載入：向 localStorage 取得 projects 的專屬 Hash 版號
        const projVersion = window.getResVersion('projects');
        const response = await fetch(`${CONFIG.DATA_SOURCE}?v=${projVersion}`);
        const db = await response.json();
        
        const categories = db.categories;
        const projects = db.projects;

        // ✨ 建立狀態時間驗證引擎
        const nowMs = new Date().getTime();
        const expireMs = CONFIG.TAG_EXPIRE_DAYS * 24 * 60 * 60 * 1000;
        // 1. 共用過期驗證函式 (您目前已經有的)
        const evaluateExpiration = (val, type = 'status') => {
            if (val === true || String(val).toLowerCase() === 'true') return true; 
            if (typeof val === 'string') {
                const cleanVal = val.trim(); 
                if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(cleanVal)) {
                    const targetDate = new Date(cleanVal.replace(/-/g, '/')).getTime();
                    if (isNaN(targetDate)) return !!val;
                    return type === 'hidden' ? nowMs < targetDate : (nowMs - targetDate) <= expireMs;
                }
            }
            return !!val; 
        };

        // ✨ 請將這整段補回來：處理「標籤陣列」的過期過濾器
        const parseAndFilterTags = (tags) => {
            if (!tags || !Array.isArray(tags)) return [];
            let validTags = [];
            tags.forEach(tag => {
                const strTag = String(tag).trim(); 
                const match = strTag.match(/^(NEW|UPDATED|LATEST|FEATURE):\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})$/i);
                
                if (match) {
                    const baseTag = match[1].toUpperCase();
                    const tagDate = new Date(match[2].replace(/-/g, '/')).getTime();
                    if (!isNaN(tagDate) && (nowMs - tagDate <= expireMs)) {
                        validTags.push(baseTag);
                    }
                } else {
                    validTags.push(strTag); 
                }
            });
            return validTags;
        };

        const flatStatusList = window.STATUS_LIST.flat();

        // 往下是您原本的 projects.forEach 區塊 (維持不變)
        projects.forEach(p => {
            ['is_new', 'is_updated', 'is_wip', 'is_archived', 'pinned'].forEach(k => {
                if (p[k] !== undefined) p[k] = evaluateExpiration(p[k], 'status');
            });
            if (p.is_hidden !== undefined) p.is_hidden = evaluateExpiration(p.is_hidden, 'hidden');
            p.tags = parseAndFilterTags(p.tags);

            let isAllUpdated = p.is_updated;
            let isPublicUpdated = p.is_updated;

            if (p.articles && p.articles.length > 0) {
                p.articles.forEach(art => {
                    ['is_new', 'is_updated', 'is_wip', 'is_archived', 'pinned'].forEach(k => {
                        // ✨ 換成新的 evaluateExpiration
                        if (art[k] !== undefined) art[k] = evaluateExpiration(art[k], 'status');
                    });
                    // ✨ 換成新的 evaluateExpiration
                    if (art.is_hidden !== undefined) art.is_hidden = evaluateExpiration(art.is_hidden, 'hidden');
                    art.tags = parseAndFilterTags(art.tags);
                });

                if (!p.is_new) {
                    p.articles.forEach(art => {
                        const hasUpdate = art.is_new || art.is_updated || (art.tags && (art.tags.includes('NEW') || art.tags.includes('UPDATED') || art.tags.includes('LATEST')));
                        if (hasUpdate) {
                            isAllUpdated = true;
                            // ✨ 只有當文章是公開時，才認定它是「公開級別」的更新
                            if (!art.is_hidden) isPublicUpdated = true;
                        }
                    });
                }
            }
            p.computed_is_updated = isAllUpdated;

            let allActiveStates = new Set();
            let publicActiveStates = new Set();

            flatStatusList.forEach(status => {
                const boolKey = `is_${status.toLowerCase()}`;
                
                // 1. 處理專案「自己」的屬性
                if (p[boolKey] === true || p.tags.includes(status)) {
                    allActiveStates.add(status);
                    publicActiveStates.add(status);
                }

                // 2. 處理「子文章」的狀態冒泡
                if (status !== 'NEW' && p.articles) {
                    p.articles.forEach(art => {
                        if (art[boolKey] === true || (art.tags && art.tags.includes(status))) {
                            allActiveStates.add(status);
                            // ✨ 只有公開文章的標籤，才能進入公開狀態池
                            if (!art.is_hidden) publicActiveStates.add(status);
                        }
                    });
                }

                // 特別處理 UPDATED 的冒泡
                if (status === 'UPDATED') {
                    if (isAllUpdated) allActiveStates.add('UPDATED');
                    if (isPublicUpdated) publicActiveStates.add('UPDATED');
                }
            });

            p.tags = p.tags.filter(t => !flatStatusList.includes(t));
            p.secret_tags = []; // ✨ 準備紀錄哪些標籤是「僅存在於隱藏文章中」的機密標籤

            [...window.STATUS_LIST].reverse().forEach(group => {
                const winningStatus = group.find(status => allActiveStates.has(status));
                if (winningStatus) {
                    p.tags.unshift(winningStatus);
                    // 如果這個最終贏得的標籤「不在」公開狀態池裡，那它就是機密標籤！
                    if (!publicActiveStates.has(winningStatus)) {
                        p.secret_tags.push(winningStatus);
                    }
                }
            });
        });

        window.siteProjects = projects;

        // 1. 處理跑馬燈橫幅
        if (marquee) {
            // ✨ 1. 建立「公開白名單」：找出所有未隱藏專案中，不屬於機密的標籤
            const publicTags = projects.filter(p => !p.is_hidden).flatMap(p => p.tags.filter(t => !(p.secret_tags && p.secret_tags.includes(t))) || []);
            
            // 2. 找出所有標籤 (用於亂數排列)
            const allTags = projects.flatMap(p => p.tags || []);
            const uniqueTags = [...new Set(allTags)].sort(() => Math.random() - 0.5);
            
            // 處理言之箱 (這裡依據你的實際命名可能是 getKotobaList 或 getQuotesList)
            const kotobaList = await window.getKotobaList(); 

            if (kotobaList.length > 0) {
                const randomKotoba = kotobaList[Math.floor(Math.random() * kotobaList.length)];
                const insertIndex = Math.floor(Math.random() * (uniqueTags.length || 1));
                const inlineKotoba = randomKotoba.replace(/\n/g, ' ').replace(/> /g, '').trim();
                uniqueTags.splice(insertIndex, 0, `KOTOBA_NO_BOX:『${inlineKotoba}』`);
            }

            if (uniqueTags.length > 0) {
                const stockContent = uniqueTags.map((tag, i) => {
                    let innerHtml = '';
                    let isSecret = false; // ✨ 預設為公開

                    if (tag.startsWith('KOTOBA_NO_BOX:')) {
                        innerHtml = `<span class="kotoba-whisper" onclick="window.centerKotobaTag(event)">${tag.replace('KOTOBA_NO_BOX:', '')}</span>`;
                    } else {
                        // ✨ 2. 判斷該標籤是否「僅」存在於機密專案中 (不在公開白名單內)
                        isSecret = !publicTags.includes(tag);
                        
                        const isUp = i % 2 !== 0;
                        const change = (Math.random() * 3 + 0.1).toFixed(2); 
                        const arrow = isUp ? '▲' : '▼';
                        const colorClass = isUp ? 'stock-up' : 'stock-down';
                        const sign = isUp ? '+' : '-';
                        const statusAttr = window.STATUS_LIST.flat().includes(tag) ? `data-status="${tag}"` : '';
                        innerHtml = `<span class="clickable-ticker-tag" data-tag="${tag}" ${statusAttr} onclick="window.filterByTag('${tag}', event)"><span class="ticker-name">${tag}</span> <span class="${colorClass}">${arrow} ${sign}${change}%</span></span>`;
                    }
                    
                    // ✨ 核心排版修復：利用 Flex 置中，並把 3rem 的完美對稱間距交給分隔線！
                const wrapperClass = isSecret ? 'marquee-tag-wrapper sys-hidden-ticker' : 'marquee-tag-wrapper';
                return `<span class="${wrapperClass}" style="display: inline-flex; align-items: center;">${innerHtml}<span style="color: var(--muted); opacity: 0.5; margin: 0 10rem;">|</span></span>`;
                }).join(''); // ✨ 直接串接，不再使用 join 加分隔線

                const container = marquee.parentElement;
                // ✨ 將串好的 HTML 塞回兩軌道中
                container.innerHTML = `
                    <div class="marquee-content">${stockContent}</div>
                    <div class="marquee-content">${stockContent}</div>
                `;

                container.onclick = (e) => {
                    if ((window.currentActiveTag || window.isKotobaActive) && !e.target.closest('.clickable-ticker-tag') && !e.target.closest('.kotoba-whisper')) window.clearFilter();
                };

                container.onmouseenter = () => document.querySelectorAll('.marquee-content').forEach(m => { if (m.marqueePlayer) m.marqueePlayer.pause(); });
                container.onmouseleave = () => document.querySelectorAll('.marquee-content').forEach(m => { if (m.marqueePlayer) m.marqueePlayer.play(); });
            }
        }

        dynamicNav.innerHTML = '';
        portfolioSections.innerHTML = '';

        // 2. 動態生成分類區塊
        categories.forEach(cat => {
            const menuDescHtml = cat.meta ? `<span class="nav-item-desc">${cat.meta}</span>` : '';
            
            dynamicNav.innerHTML += `
            <li style="margin: 2.5rem 0;">
                <a href="#${cat.id}-section" class="nav-item" style="margin:0; line-height:1.1; display:inline-block;">${cat.title}</a>
                ${menuDescHtml}
            </li>`;

            const sectionMetaHtml = cat.meta ? `<span class="section-meta">- ${cat.meta}</span>` : '';
            const sectionDescHtml = cat.description ? `<p class="section-desc">${cat.description}</p>` : '';
            const sectionImageHtml = cat.cover_image ? `<img src="${cat.cover_image}" alt="icon" loading="lazy" class="section-icon is-loading" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` : '';

            const watermarkStyle = cat.watermark_url ? ` style="--custom-watermark: url('${cat.watermark_url}');"` : '';

            portfolioSections.innerHTML += `
            <section id="${cat.id}-section"${watermarkStyle}>
                <div class="section-header-layout">
                <div class="section-header-left">
                    <h2>${cat.title}${sectionMetaHtml}</h2>
                    ${sectionDescHtml}
                </div>
                ${sectionImageHtml}
                </div>
                
                <div class="scroll-wrapper">
                <div class="scroll-hint hint-left" id="${cat.id}-hint-left"></div>
                <div class="grid" id="${cat.id}-grid"></div>
                <div class="scroll-hint hint-right" id="${cat.id}-hint-right"></div>
                </div>
            </section>`;
        });

        // 3. 填入專案卡片
        projects.forEach(data => {
            const targetGrid = document.getElementById(`${data.category}-grid`); 
            if (targetGrid) {
                const card = document.createElement('div');
                card.className = 'card';
                // ✨ 新增：如果是隱藏專案，掛上隱形斗篷
                if (data.is_hidden) card.classList.add('sys-hidden-card');
                
                card.setAttribute('data-tags', (data.tags || []).join(','));
                
                const flatList = window.STATUS_LIST.flat(); 
                let tagsHTML = (data.tags || []).map(tag => {
                    // ✨ 動態判斷是否需要加上機密隱形斗篷 class
                    const isSecretTag = data.secret_tags && data.secret_tags.includes(tag);
                    const secretClass = isSecretTag ? ' sys-hidden-tag' : '';
                    
                    const statusAttr = flatList.includes(tag) ? ` data-status="${tag}" class="tag status-tag${secretClass}"` : ` class="tag${secretClass}"`;
                    return `<span${statusAttr} data-tag="${tag}" onclick="window.filterByTag('${tag}', event, this)">${tag}</span>`;
                }).join('');
                
                let actionText = '';
                if (data.articles && data.articles.length > 0) {
                    card.style.cursor = 'pointer';
                    card.onclick = () => { if (window.currentActiveTag) window.clearFilter(); openProjectIndex(data.id); };
                    
                    const visibleCount = data.articles.filter(art => !art.is_hidden).length;
                    
                    actionText = `<div class="card-action-btn">
                        <div class="card-action-icon-wrap">
                            ${GLOBAL_SVGS.folderClosed}
                            ${GLOBAL_SVGS.folderOpen}
                        </div>展開系列 (${visibleCount})</div>`;
                } else if (data.link) {
                    card.style.cursor = 'pointer';
                    card.onclick = () => { 
                        if (window.currentActiveTag) window.clearFilter(); 
                        
                        // ✨ 核心修復：改用隱形 <a> 標籤觸發跳轉，完美避開 PWA 的 window.open 幽靈視窗 Bug！
                        const a = document.createElement('a');
                        a.href = data.link;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    };
                    
                    actionText = `<div class="card-action-btn">
                        ${GLOBAL_SVGS.linkLg} 
                        前往外部專案 <span class="action-arrow card-action-arrow" data-dir="up-right">
                        ${GLOBAL_SVGS.arrowUpRight}</span></div>`;
                } else {
                    card.onclick = () => { if (window.currentActiveTag) window.clearFilter(); };
                    card.addEventListener('mouseenter', () => { card.style.cursor = window.currentActiveTag ? 'pointer' : 'default'; });
                }

                const cardMetaHtml = data.meta ? `<span class="card-meta-text">- ${data.meta}</span>` : '';
                const cardDescHtml = data.description ? `<p class="card-desc-text">${data.description}</p>` : '';
                const cardImageHtml = data.cover_image ? `<img src="${data.cover_image}" alt="cover" loading="lazy" class="card-thumb-img is-loading" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` : '';                
                const absolutePinHtml = data.pinned ? `<div class="card-pin">${GLOBAL_SVGS.pin}</div>` : '';
                const absoluteSecretHtml = data.is_hidden ? `<div class="card-secret-pin">${GLOBAL_SVGS.secretPin}</div>` : '';

                let metaParts = [];
                if (data.date) metaParts.push(data.date);
                if (data.version) metaParts.push(`v${data.version}`); 
                const cardDateHtml = metaParts.length > 0 ? `<div class="card-date-badge">[${metaParts.join(' • ')}]</div>` : '';

                card.innerHTML = `
                    ${absolutePinHtml}${absoluteSecretHtml}${cardDateHtml} 
                    <div class="card-content-wrapper">
                        <div class="card-text"><h3 style="margin-top: 0; margin-bottom: 0.4rem;">${data.title} ${cardMetaHtml}</h3>${cardDescHtml}</div>
                        ${cardImageHtml ? `<div class="card-image">${cardImageHtml}</div>` : ''}
                    </div>
                    <div class="tags-container">${tagsHTML}</div>${actionText}`;
                
                targetGrid.appendChild(card);
            }
        });

        // 綁定捲軸與 Intersection Observer
        categories.forEach(cat => {
            const grid = document.getElementById(`${cat.id}-grid`);
            const hintRight = document.getElementById(`${cat.id}-hint-right`);
            const hintLeft = document.getElementById(`${cat.id}-hint-left`); 
            
            if (grid && hintRight && hintLeft) {
                window.initScrollHints(grid, hintLeft, hintRight);
                // ==========================================
                // ✨ 將向右與向左按鈕的點擊行為，升級為「畫廊置中模式」(過濾隱藏卡片)
                // ==========================================
                hintRight.addEventListener('click', () => window.scrollContainerByItem(grid, '.card', 1));
                hintLeft.addEventListener('click', () => window.scrollContainerByItem(grid, '.card', -1));
            }
            if (grid && grid.children.length === 0) document.getElementById(`${cat.id}-section`).style.display = 'none';
        });

        const cardObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add('show'); observer.unobserve(entry.target); }
            });
        }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 });
        document.querySelectorAll('.card').forEach(card => cardObserver.observe(card));

        // 路由解析 (加入 hash 讀取)
        const urlParams = new URLSearchParams(window.location.search);
        setTimeout(() => window.handleAppRouting(urlParams.get('p'), urlParams.get('a'), window.location.hash || null), 300);

    } catch (err) {
        console.error("載入失敗:", err);
        
        // ✨ 判斷是否為網路斷線或無法連線
        const isOffline = !navigator.onLine || (err.message && err.message.includes('Failed to fetch'));
        const errorTitle = isOffline ? "ERR: NO INTERNET CONNECTION" : "ERR: FAILED TO FETCH DATA";
        const errorDetail = err.message ? err.message.toUpperCase() : "UNKNOWN_SYSTEM_ERROR";
        const errorSub = isOffline ? "請檢查您的網路設定，連線恢復後請重新整理。" : `[SYS_DUMP] ${errorDetail}`;
        
        portfolioSections.innerHTML = `
            <div class="error-container" style="flex-direction: column; gap: 0.8rem;">
                <span class="error-text" onclick="this.style.opacity='0.5'; this.innerHTML='>_ REBOOTING...'; window.location.reload();">
                    ${GLOBAL_SVGS.retry} ${errorTitle}
                </span>
                <span style="font-family: 'Courier New', monospace; font-size: 0.8rem; color: var(--muted); opacity: 0.6; letter-spacing: 0.05em;">
                    ${errorSub}
                </span>
            </div>
        `;
        
        // 確保萬一卡在啟動畫面時，強制關閉重開機遮罩
        if (window.hideSystemRebootScreen) window.hideSystemRebootScreen(false);

        if (marquee) { 
            const marqueeMsg = isOffline ? "NETWORK OFFLINE • PLEASE CHECK CONNECTION • " : "SYSTEM OFFLINE • ERROR • ";
            marquee.innerHTML = `<span>${marqueeMsg}</span>`.repeat(6); 
            marquee.style.color = "var(--error-color)"; 
        }
    }
}

// ==========================================
// ✨ 共用引擎：平滑淡入 / 無縫接軌的終端機重開機畫面
// ==========================================
function showSystemRebootScreen(title, localV, remoteV, msg, immediate = false) {
    document.body.style.overflow = 'hidden'; 
    let screen = document.getElementById('sys-reboot-screen');
    
    if (!screen) {
        screen = document.createElement('div');
        screen.id = 'sys-reboot-screen';
        screen.style.opacity = immediate ? '1' : '0';
        document.body.appendChild(screen);
        
        if (!immediate) {
            setTimeout(() => { screen.style.opacity = '1'; }, 10);
        }
    }
    
    screen.innerHTML = `
        <div class="reboot-title">>_ ${title}</div>
        <div class="reboot-version">Local: ${localV} | Remote: ${remoteV}</div>
        <div class="loading-text">${msg}</div>
    `;
}

// ==========================================
// ✨ 移除遮罩的函數 (加入成功/失敗的主動狀態切換！)
// ==========================================
function hideSystemRebootScreen(isSuccess = true) {
    const screen = document.getElementById('sys-reboot-screen');
    
    // 如果沒有遮罩 (一般訪客)，直接解除防護並返回
    if (!screen) {
        document.documentElement.classList.remove('sys-rebooting');
        // ✨ 修正：判斷沒有開啟任何 Modal 時，才恢復背景捲軸
        if (!document.querySelector('.modal-overlay.active')) {
            document.body.style.overflow = '';
        }
        return;
    }

    // ✨ 魔法發生地：在消失前，主動把文字切換成成功或退回狀態！
    const titleEl = screen.querySelector('.reboot-title');
    const msgEl = screen.querySelector('.loading-text');
    
    if (isSuccess) {
        if (titleEl) { titleEl.innerText = '>_ SYSTEM_ONLINE'; titleEl.style.color = 'var(--accent-2)'; titleEl.style.textShadow = '0 0 10px var(--accent-2)'; }
        if (msgEl) { msgEl.innerText = 'UPDATE_SUCCESSFUL'; msgEl.style.color = 'var(--accent-2)'; msgEl.style.animation = 'none'; }
    } else {
        if (titleEl) { titleEl.innerText = '>_ SYSTEM_REVERTED'; titleEl.style.color = 'var(--muted)'; titleEl.style.textShadow = 'none'; }
        if (msgEl) { msgEl.innerText = 'CDN_CACHE_DELAY'; msgEl.style.color = 'var(--muted)'; msgEl.style.animation = 'none'; }
    }

    // ✨ 停頓 0.6 秒讓使用者欣賞成功訊息，再平滑淡出
    setTimeout(() => {
        // 瞬間拔除 HTML 的隱形斗篷，讓底層早就畫好的新版網站準備就緒
        document.documentElement.classList.remove('sys-rebooting');
        
        // ✨ 修正：動畫結束後，同樣判斷沒有 Modal 時才恢復捲軸
        if (!document.querySelector('.modal-overlay.active')) {
            document.body.style.overflow = '';
        }

        screen.style.transition = 'opacity 0.5s ease';
        screen.style.opacity = '0';
        setTimeout(() => { screen.remove(); }, 500);
    }, 600);
}

async function checkSystemVersionAndBoot() {
    const isRebooting = sessionStorage.getItem('sys_is_rebooting') === 'true';
    const expectedVersion = sessionStorage.getItem('sys_expected_version') || 'UNKNOWN';
    const sysIntent = sessionStorage.getItem('sys_intent');

    if (isRebooting) {
        showSystemRebootScreen('SYSTEM_REBOOTING', CONFIG.VERSION, expectedVersion, 'VERIFYING_MODULES', true);
    }

    try {
        // ✨ 微型化版本檢查：同時核對「系統版號 (version.json)」與「細項內容 Hash (data_version.json)」
        const [sysRes, dataRes] = await Promise.all([
            fetch(`./version.json?t=${new Date().getTime()}`).catch(() => null),
            fetch(`./data_version.json?t=${new Date().getTime()}`).catch(() => null)
        ]);

        const sysData = sysRes && sysRes.ok ? await sysRes.json() : null;
        const contentData = dataRes && dataRes.ok ? await dataRes.json() : null;

        let needReboot = false;
        let rebootReason = '';
        let remoteVersion = CONFIG.VERSION;

        // 1. 檢查系統層級更新 (優先級最高)
        if (sysData && sysData.version && sysData.version !== CONFIG.VERSION) {
            needReboot = true;
            rebootReason = 'SYS_UPDATING';
            remoteVersion = sysData.version;
            console.warn(`[SYS_UPDATE] 發現系統新版本 ${remoteVersion}，準備強制更新...`);
        }
        // 2. 檢查內容層級更新 (如果系統無需更新，才檢查 projects 目錄的 Hash 是否改變)
        else if (contentData && contentData.projects) {
            const localDataVersions = JSON.parse(localStorage.getItem('sys_data_versions') || '{}');
            
            // ✨ 如果本地有舊紀錄，且專案 (projects) 的 Hash 發生改變，才需要強制重開機刷新首頁
            if (localDataVersions.projects && localDataVersions.projects !== contentData.projects) {
                needReboot = true;
                rebootReason = 'SYNCING_NEW_DATA';
                console.info(`[DATA_UPDATE] 發現文章內容修改，準備同步資料庫...`);
            }
            
            // ✨ 寫入最新的細項 Hash 字典到本機
            // (如果是 kotoba.md 等獨立細項改變，下次點擊時會自己抓最新 Hash，不需重啟畫面！)
            localStorage.setItem('sys_data_versions', JSON.stringify(contentData));
        }

        if (needReboot) {
            const rebootCount = parseInt(sessionStorage.getItem('sys_reboot_count') || '0');
            if (rebootCount >= 2) {
                console.error("[SYS_UPDATE] 自動更新/同步失敗，已強制啟動緩存版本。");
                sessionStorage.removeItem('sys_reboot_count'); 
                sessionStorage.removeItem('sys_is_rebooting');
                sessionStorage.removeItem('sys_expected_version');
                sessionStorage.removeItem('sys_intent'); 
                
                // ✨ 新增：抓出退路 ID
                const fallbackP = sessionStorage.getItem('sys_fallback_project');
                sessionStorage.removeItem('sys_fallback_project');

                hideSystemRebootScreen(false); 
                loadProjects(); 
                
                // ✨ 新增：如果退路存在，就在載入完成後幫使用者重新打開目錄
                if (fallbackP) setTimeout(() => window.openProjectIndex(fallbackP), 300);

                if (sysIntent === 'changelog') setTimeout(() => { if (window.showChangelogModal) window.showChangelogModal(true); }, 600); 
                setTimeout(() => { window.showSystemToast('>_ UPDATE_FAILED', 'CDN_CACHE_DELAY_DETECTED', `已還原為安全狀態`, 12000, 'error'); }, 1000);
                return;
            }
            
            sessionStorage.setItem('sys_reboot_count', (rebootCount + 1).toString());
            sessionStorage.setItem('sys_is_rebooting', 'true');
            sessionStorage.setItem('sys_expected_version', remoteVersion);

            // 根據不同更新原因，顯示不同的終端機過場文字
            const screenTitle = rebootReason === 'SYS_UPDATING' ? 'SYS_VERSION_MISMATCH' : 'CONTENT_SYNC_REQUIRED';
            showSystemRebootScreen(screenTitle, CONFIG.VERSION, remoteVersion, rebootReason, isRebooting);
            
            setTimeout(() => {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('v', new Date().getTime());
                window.location.replace(newUrl.toString());
            }, 1800);
            
            return; 
        } else {
            // ✨ 核心神修復：檢查重啟後，系統版本是否真的有達到文章要求的預期？
            if (isRebooting && expectedVersion !== 'UNKNOWN' && window.compareVersions(CONFIG.VERSION, expectedVersion) < 0) {
                console.error("[SYS_UPDATE] 強制升級失敗，CDN 仍快取舊版 JS。");
                
                // 清除標記，避免卡死
                sessionStorage.removeItem('sys_reboot_count');
                sessionStorage.removeItem('sys_is_rebooting');
                sessionStorage.removeItem('sys_expected_version');
                
                // ✨ 新增：抓出退路 ID
                const fallbackP = sessionStorage.getItem('sys_fallback_project');
                sessionStorage.removeItem('sys_fallback_project');

                // 觸發「紅色退回狀態」的終端機過場動畫
                hideSystemRebootScreen(false); 
                loadProjects();
                
                // ✨ 新增：如果退路存在，就在載入完成後幫使用者重新打開目錄
                if (fallbackP) setTimeout(() => window.openProjectIndex(fallbackP), 300);
                
                // 彈出精美的錯誤提示，告訴使用者 CDN 正在塞車
                setTimeout(() => { 
                    window.showSystemToast('>_ UPDATE_FAILED', 'CDN_CACHE_DELAY_DETECTED', `無法取得 ${expectedVersion} 核心，請稍後再試。`, 12000, 'error'); 
                }, 1000);
                
                return; // ⛔ 中斷執行，不再往下走！
            }

            // 如果順利達標，就正常清除標記並啟動
            sessionStorage.removeItem('sys_reboot_count');
            sessionStorage.removeItem('sys_is_rebooting');
            sessionStorage.removeItem('sys_expected_version');
            if (sysIntent === 'changelog') setTimeout(() => { if (window.showChangelogModal) window.showChangelogModal(true); }, 600);
            sessionStorage.removeItem('sys_intent'); 
        }
    } catch (err) {
        console.warn("系統檢查程序中斷:", err);
        sessionStorage.removeItem('sys_is_rebooting');
        sessionStorage.removeItem('sys_intent'); 
    }
    
    hideSystemRebootScreen(true);
    loadProjects();
}

window.addEventListener('DOMContentLoaded', () => {
    checkSystemVersionAndBoot();
    window.getMermaidStyles(); // ✨ 在背景無感預先載入 Mermaid 樣式
    
    // ✨ 啟動 PWA 專屬下拉重整引擎
    window.initPWAPullToRefresh();
});

// === 4. 索引式 Markdown Modal 邏輯 ===
const modalOverlay = document.getElementById('md-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');

// ✨ 新增：動態計算 TopBar 真實高度的引擎
window.updateTopBarHeight = function() {
    const topBar = document.querySelector('.modal-top-bar');
    if (topBar) {
        document.documentElement.style.setProperty('--top-bar-height', `${topBar.offsetHeight}px`);
    }
};

if (!window.modalBodyObserver) {
    window.modalBodyObserver = new ResizeObserver(() => {
        // 高度改變時，即時更新 CSS 變數
        window.updateTopBarHeight();

        const activeContainer = window.getActiveScrollContainer();
        if (activeContainer) {
            activeContainer.dispatchEvent(new Event('scroll'));
        }
        
        const verticalWrappers = document.querySelectorAll('.vertical-wrapper');
        if (verticalWrappers.length > 0) {
            verticalWrappers.forEach(w => w.dispatchEvent(new Event('scroll')));
        }
    });
    window.modalBodyObserver.observe(modalBody);
    
    // 順便監聽 TopBar 本身，預防標題換行時高度改變
    const initialTopBar = document.querySelector('.modal-top-bar');
    if (initialTopBar) window.modalBodyObserver.observe(initialTopBar);
}

function switchModalContent(updateDOMCallback, afterUpdateCallback = null, animateTopBar = true) {
    const isModalOpen = modalOverlay.classList.contains('active');
    const topLeft = document.getElementById('modal-top-left');
    const modalContainer = document.querySelector('.modal-content');
    
    // 🔥 在每次切換正常內容時，確保拔除錯誤畫面的專屬窄視窗屬性
    if (modalContainer) modalContainer.classList.remove('is-sys-error-mode');
    
    if (window.indexScrollHandler) {
        // ✨ 核心修復 1：改為從 modalContainer 移除捲動監聽，徹底消滅殘影！
        if (modalContainer) modalContainer.removeEventListener('scroll', window.indexScrollHandler);
        window.indexScrollHandler = null;
    }
    const jumpToast = document.getElementById('new-jump-toast');
    if (jumpToast) jumpToast.classList.remove('is-visible');

    if (isModalOpen) {
        modalBody.classList.add('content-fade-out');
        if (animateTopBar && topLeft) {
            topLeft.classList.add('content-fade-out');
        }
        
        setTimeout(() => {
            modalContainer.style.transition = 'none'; 
            modalContainer.style.height = ''; 
            
            const viewIndex = document.getElementById('view-index');
            const viewArticle = document.getElementById('view-article');
            const origIndexOverflow = viewIndex ? viewIndex.style.overflowY : '';
            const origArticleOverflow = viewArticle ? viewArticle.style.overflowY : '';
            
            if (viewIndex) viewIndex.style.overflowY = 'hidden';
            if (viewArticle) viewArticle.style.overflowY = 'hidden';
            
            // 執行 DOM 替換
            updateDOMCallback();
            
            // ✨ DOM 替換完畢後，立刻強制更新 TopBar 高度變數！
            window.updateTopBarHeight();
            
            if (afterUpdateCallback) afterUpdateCallback();

            void modalContainer.offsetHeight; 
            
            modalBody.classList.remove('content-fade-out'); 
            if (animateTopBar && topLeft) {
                topLeft.classList.remove('content-fade-out');
            }

            if (viewIndex) viewIndex.style.overflowY = origIndexOverflow;
            if (viewArticle) viewArticle.style.overflowY = origArticleOverflow;
            
            setTimeout(() => { 
                modalContainer.style.transition = ''; 
            }, 50);
        }, 120);
    } else {
        updateDOMCallback();
        window.updateTopBarHeight(); // ✨ 第一次開啟也要更新
        if (afterUpdateCallback) afterUpdateCallback();
        
        modalBody.classList.remove('content-fade-out');
        if (topLeft) topLeft.classList.remove('content-fade-out');
        
        if (window.adjustModalViewports) window.adjustModalViewports();
    }
}

// ==========================================
// 打開該專案的「目錄頁面」
// ==========================================
window.openProjectIndex = function(projectId, restoreScroll = false) {
    // 🔥 全域中斷防護：退回目錄時，立刻中斷任何下載！
    if (window._activeFetcher) {
        window._activeFetcher.abort();
        window._activeFetcher = null;
    }
    if (window.toggleLoading) window.toggleLoading(false);
    const proj = window.siteProjects.find(p => p.id === projectId);
    if (!proj || !proj.articles) return;

    // ✨ 新增：版本相容性防護網 (專案層級)
    if (proj.min_sys_version && window.compareVersions(CONFIG.VERSION, proj.min_sys_version) < 0) {
        window.triggerSystemUpdate(proj.min_sys_version);
        return;
    }

    window.isRendering = false; 
    window.historyStack = []; 

    switchModalContent(
        () => {
            const modalContainer = document.querySelector('.modal-content');
            
            document.querySelector('.modal-top-bar').classList.remove('is-index-mode');

            const proj = window.siteProjects.find(p => p.id === projectId);
            if (!proj || !proj.articles) return;

            // ✨ 新增：敏感內容攔截 (如果不通過，中斷執行並呼叫彈窗)
            if (proj.is_sensitive && window._hasAgreedSensitiveContent !== true) {
                window.showSensitiveAgreementModal(
                    () => window.openProjectIndex(projectId, restoreScroll),
                    () => closeModal() // ✨ 拒絕時：關閉系統 Modal，退回主頁 (這會同時消滅 403 畫面)
                );
                return;
            }

            let currentSort = sessionStorage.getItem(`sort_${projectId}`) || proj.default_sort || 'desc';
            sessionStorage.setItem(`sort_${projectId}`, currentSort);

            // ✨ 精準計算「當下有權限看到」的文章數量
            const isUnlocked = document.body.classList.contains('system-override-active');
            const visibleCount = proj.articles.filter(a => isUnlocked || !a.is_hidden).length;

            const shareUrl = window.updateRouteState(projectId);

            // 2. 將目錄標題與功能按鈕直接注入 modal-top-left (完全還原原始樣式)
            document.getElementById('modal-top-left').innerHTML = `
                <div class="index-header-container">
                    <h1 class="index-header-title">${proj.title} - 目錄</h1>
                    <div class="index-header-actions">
                        <!-- ✨ 使用 visibleCount 替換掉原本的 proj.articles.length -->
                        <span class="article-count-badge">共 ${visibleCount} 篇</span>
                        
                        <!-- ✨ 拔除 data-tooltip -->
                        <button id="toggle-sort-btn" class="share-link-btn responsive-share-btn" style="margin: 0;">
                            <svg class="sort-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path class="sort-arr-left" d="M 4 9 L 9 4 L 9 20"></path><path class="sort-arr-right" d="M 20 15 L 15 20 L 15 4"></path></svg>
                            <span id="sort-btn-text" class="btn-text-hideable"></span>
                        </button>
                        
                        <!-- ✨ 拔除 data-tooltip -->
                        <button class="share-link-btn responsive-share-btn" id="index-share-btn" style="margin: 0;">
                            ${GLOBAL_SVGS.link}
                            <span class="btn-text-hideable">複製連結</span>
                        </button>
                    </div>
                </div>
            `;
            
            const viewIndex = document.getElementById('view-index');
            const viewArticle = document.getElementById('view-article');

            // ✨ DOM 緩存核心：隱藏文章，顯示目錄
            if (viewArticle) viewArticle.style.display = 'none';
            if (viewIndex) viewIndex.style.display = 'block';

            // ✨ 判斷是否需要重新渲染 DOM (若專案與排序相同，則直接沿用舊 DOM)
            const needsRender = viewIndex.dataset.projectId !== projectId || viewIndex.dataset.sort !== currentSort;

            if (needsRender) {
                viewIndex.innerHTML = `<div id="article-list-container" style="transition: opacity 0.2s ease;"></div>`;
            }
            
            // ✨ 目錄模式：隱藏閱讀進度條
            const progressBar = document.getElementById('reading-progress-bar');
            if (progressBar) progressBar.style.display = 'none';

            const shareBtn = document.getElementById('index-share-btn');
            if (shareBtn) {
                shareBtn.addEventListener('click', function() { window.handleCopy(this, shareUrl); });
            }

            const listContainer = viewIndex.querySelector('#article-list-container');
            const sortBtn = document.getElementById('toggle-sort-btn');

            const renderList = (forceRegenerateHTML) => {
                const finalArray = window.getArticleSequence(projectId);

                if (forceRegenerateHTML) {
                    const generateLi = (art, idx, isHighlightGroup, themeClass = '', customStyle = '') => {
                    let descHtml = art.description ? `<span class="article-item-desc">- ${art.description}</span>` : '';
                    let dateHtml = art.date ? `<span class="article-item-date">${art.date}</span>` : '';
                    let statusBadgeHtml = window.getStatusBadgeHtml(art, true);
                    
                    let baseIconHtml = art.cover_image 
                        ? `<img src="${art.cover_image}" alt="cover" class="article-item-cover is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` 
                        : `<div class="article-item-fallback" style="color: var(--muted);">${GLOBAL_SVGS.docIconLg}</div>`;
                    
                    let pinnedBadgeHtml = art.pinned ? `<div class="modal-pin">${GLOBAL_SVGS.pinSmall}</div>` : '';
                    let secretBadgeHtml = art.is_hidden ? `<div class="modal-secret-pin">${GLOBAL_SVGS.secretPinSmall}</div>` : '';
                    let iconHtml = `<div class="article-item-icon-wrap">${pinnedBadgeHtml}${secretBadgeHtml}${baseIconHtml}</div>`;
                    let hiddenClass = art.is_hidden ? ' sys-hidden-item' : '';

                    // ✨ 將 themeClass 也整合進 classList 裡
                    return `
                        <li id="article-item-${idx}" class="article-li ${isHighlightGroup ? 'is-highlight' : 'is-normal'}${hiddenClass}${themeClass}"${customStyle}>
                            <a href="#" onclick="event.preventDefault(); openArticle('${projectId}', ${idx})" class="article-link">
                                ${iconHtml}
                                <div class="article-item-content">
                                    <div class="article-item-title-row">
                                        <span class="article-item-title">${art.title}${statusBadgeHtml}</span>
                                        ${descHtml}
                                    </div>
                                    ${dateHtml}
                                </div>
                            </a>
                        </li>
                    `;
                };

                let html = '';

                if (proj.groups && Object.keys(proj.groups).length > 0) {
                    let colorIndex = 0; 
                    let isFirstGroup = true; 
                    
                    for (const [groupId, groupData] of Object.entries(proj.groups)) {
                        const groupArticles = finalArray.filter(item => item.art.group === groupId);
                        if (groupArticles.length === 0) continue;

                        let groupColor = groupData.color;
                        let themeClass = '';
                        let customStyle = ''; // ✨ 1. 補回這行宣告！
                        
                        if (groupData.highlight) {
                            const groupNum = (colorIndex % 5) + 1;
                            themeClass = ` group-color-${groupNum}`;
                            colorIndex++; 
                        } else if (groupColor) {
                            // ✨ 2. 補回這行，讓群組底下的文章也能吃到專屬顏色！
                            customStyle = ` style="--current-group-color: ${groupColor};"`; 
                        }

                        const topMargin = isFirstGroup ? '0rem' : '1.8rem';

                        // ✨ 3. 處理 Group Header 專屬的合併 Style
                        let inlineStyles = ``;
                        if (groupColor && !groupData.highlight) {
                            inlineStyles += ` --current-group-color: ${groupColor};`;
                        }

                        // ✨ 加上專屬 ID 供漢堡選單跳轉定位
                        const safeGroupId = `group-${groupId.replace(/[\s&]+/g, '-').replace(/-+/g, '-')}`;
                        
                        // ✨ 判斷該群組是否有縮圖
                        let groupCoverHtml = '';
                        if (groupData.cover_image) {
                            // ✨ 新增外層包裝盒 .group-header-cover-wrapper
                            groupCoverHtml = `
                            <div class="group-header-cover-wrapper">
                                <img src="${groupData.cover_image}" alt="Group Cover" class="group-header-cover is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">
                            </div>`;
                        }

                        // ✨ 4. 渲染 HTML，套用 themeClass 與 inlineStyles
                        html += `
                            <div id="${safeGroupId}" class="group-header${themeClass}" style="margin-top: ${topMargin}; margin-bottom: 0.8rem;">
                                <div class="group-header-text">
                                    <div class="group-header-title">${groupData.title || groupId}</div>
                                    ${groupData.description ? `<div class="group-header-desc">${groupData.description}</div>` : ''}
                                </div>
                                ${groupCoverHtml}
                            </div>
                            <ul class="article-list-ul">
                        `;
                        
                        groupArticles.forEach(({art, idx}) => { 
                            html += generateLi(art, idx, groupData.highlight, themeClass, customStyle);
                        });
                        html += `</ul>`;
                        
                        isFirstGroup = false;
                    }
                    const ungrouped = finalArray.filter(item => !item.art.group);
                    if (ungrouped.length > 0) {
                        const topMargin = isFirstGroup ? '0rem' : '1.5rem';
                        // ✨ 未分群區塊也加上 ID
                        html += `<ul id="group-ungrouped" class="article-list-ul" style="margin-top:${topMargin};">`;
                        
                        ungrouped.forEach(({art, idx}) => { 
                            html += generateLi(art, idx, false);
                        });
                        html += `</ul>`;
                    }
                } else {
                    html += `<ul class="article-list-ul" style="margin-top:0rem;">`;
                    finalArray.forEach(({art, idx}) => { 
                        html += generateLi(art, idx, false);
                    });
                    html += `</ul>`;
                }
                listContainer.innerHTML = html;
                } // ✨ 結束 forceRegenerateHTML 區塊

                // ==========================================
                // ✨ 動態建立群組跳轉漢堡選單 (導入共用引擎)
                // ==========================================
                let menuItems = [];
                if (proj.groups && Object.keys(proj.groups).length > 0) {
                    const validGroups = Object.entries(proj.groups).filter(([gId, gData]) => finalArray.some(item => item.art.group === gId));
                    const hasUngrouped = finalArray.some(item => !item.art.group);
                    
                    if ((validGroups.length + (hasUngrouped ? 1 : 0)) >= 2) {
                        validGroups.forEach(([groupId, groupData]) => {
                            menuItems.push({
                                label: groupData.title || groupId,
                                targetHash: `#group-${groupId.replace(/[\s&]+/g, '-').replace(/-+/g, '-')}`,
                                className: 'toc-h1'
                            });
                        });
                        if (hasUngrouped) menuItems.push({ label: '其他', targetHash: '#group-ungrouped', className: 'toc-h1' });
                    }
                }
                window.renderTocMenu(menuItems, '系列分群');
                
                // ✨ 呼叫全域智慧跳轉提示引擎
                window.initJumpToast(modalContainer, '.article-li');
            };

            const updateSortBtnUI = () => {
                const isAsc = currentSort === 'asc';
                sortBtn.classList.toggle('is-asc', isAsc);
                sortBtn.classList.toggle('is-desc', !isAsc);
                sortBtn.querySelector('#sort-btn-text').innerText = isAsc ? '由舊到新' : '由新到舊';
            };

            updateSortBtnUI();
            
            if (needsRender) {
                renderList(true);
                viewIndex.dataset.projectId = projectId;
                viewIndex.dataset.sort = currentSort;
            } else {
                renderList(false); // 若 DOM 已存在，只重新綁定事件
            }

            sortBtn.addEventListener('click', () => {
                if (window.isRendering) return;
                sortBtn.disabled = true; 
                window.isRendering = true;

                currentSort = currentSort === 'desc' ? 'asc' : 'desc';
                sessionStorage.setItem(`sort_${projectId}`, currentSort); 
                
                listContainer.style.transition = 'opacity 0.2s ease';
                listContainer.style.opacity = '0';
                updateSortBtnUI(); 
                
                setTimeout(() => {
                    renderList(true); // 排序改變時強制重繪
                    viewIndex.dataset.sort = currentSort;
                    void listContainer.offsetWidth;
                    listContainer.style.opacity = '1';
                    setTimeout(() => { window.isRendering = false; sortBtn.disabled = false; }, 200); 
                }, 200); 
            });

            modalOverlay.classList.add('active');
            window.lockScroll(); 
        },
        () => {
            const modalContainer = document.querySelector('.modal-content'); 
            if (modalContainer) {
                if (restoreScroll && window._indexScrollTopCache !== undefined) {
                    modalContainer.scrollTo({ top: window._indexScrollTopCache, behavior: 'auto' });
                    
                    const targetItem = document.getElementById(`article-item-${window.lastReadArticleIndex}`);
                    if (targetItem) setTimeout(() => window.simulateHoverFlash(targetItem), 150);
                } else {
                    modalContainer.scrollTo({ top: 0, behavior: 'auto' });
                }
            }
        }
    ); 
};

// ==========================================
// 打開具體的「文章內文」
// ==========================================
window.openArticle = async function(projectId, articleIndex, isFromHistory = false, restoreScrollTop = 0, targetHash = null, restoreInnerScrolls = []) {
    const proj = window.siteProjects.find(p => p.id === projectId);
    const article = proj.articles[articleIndex];

    // ✨ 新增：版本相容性防護網 (文章層級，同時比對專案與文章的要求，取較高者)[cite: 14]
    let targetVersion = proj.min_sys_version || null;
    if (article && article.min_sys_version) {
        if (!targetVersion || window.compareVersions(targetVersion, article.min_sys_version) < 0) {
            targetVersion = article.min_sys_version;
        }
    }

    if (targetVersion && window.compareVersions(CONFIG.VERSION, targetVersion) < 0) {
        window.triggerSystemUpdate(targetVersion);
        return;
    }

    const jumpToast = document.getElementById('new-jump-toast');
    if (jumpToast) jumpToast.classList.remove('is-visible');


    if (!isFromHistory) {
        if (!window.historyStack) window.historyStack = [];
        
        // ✨ 核心修復 1：改抓真正負責捲動的容器 (modalContainer) 的捲軸位置
        if (window.historyStack.length === 0) {
            const scroller = window.getActiveScrollContainer();
            if (scroller) window._indexScrollTopCache = scroller.scrollTop;
        }

        if (window.historyStack.length > 0) {
            const activeContainer = window.getActiveScrollContainer();
            if (activeContainer) {
                window.historyStack[window.historyStack.length - 1].scrollTop = activeContainer.scrollTop;
                
                // ✨ 修正：改由判斷 view-article 是否存在且顯示中，來記錄內部的直書捲軸
                const viewArticle = document.getElementById('view-article');
                if (viewArticle && viewArticle.style.display !== 'none') {
                    const wrappers = viewArticle.querySelectorAll('.vertical-wrapper');
                    window.historyStack[window.historyStack.length - 1].innerScrolls = Array.from(wrappers).map(w => ({
                        scrollTop: w.scrollTop,
                        scrollLeft: w.scrollLeft
                    }));
                }
            }
        }
        
        window.historyStack.push({ projectId, articleIndex, scrollTop: 0, innerScrolls: [] });
    }

    window.lastReadArticleIndex = articleIndex;
    // ✨ 進入文章的瞬間，預先計算並快取好返回目錄時的最佳捲軸位置
    window._indexScrollTopCache = window.calculateIdealScrollCache('view-index', `article-item-${articleIndex}`, window._indexScrollTopCache);
    
    // ✨ 新增：敏感內容攔截 (改用全域變數檢查)
    if ((proj.is_sensitive || article.is_sensitive) && window._hasAgreedSensitiveContent !== true) {
        window.showSensitiveAgreementModal(
            () => window.openArticle(projectId, articleIndex, isFromHistory, restoreScrollTop, targetHash, restoreInnerScrolls),
            () => window.openProjectIndex(projectId) // ✨ 拒絕時：退回該專案的目錄 (這會覆蓋掉 403 畫面)
        );
        return;
    }
    
    let markdownContent = "載入失敗";
    const fetchResult = await window.safeFetchWithGuard(article.content_path, { isJson: true });

    if (fetchResult.aborted) {
        console.log("[SYS] Fetching 任務已由使用者切換中斷。");
        return;
    }

    if (fetchResult.success) {
        markdownContent = fetchResult.data.content;
    } else {
        console.error("無法載入文章內容:", fetchResult.error);
        let errTitle = '404 NOT_FOUND';
        let errMsg = '無法載入文章內容。';
        if (fetchResult.isTimeout) {
            errTitle = 'ERR_CONNECTION_TIMED_OUT'; errMsg = '伺服器回應逾時 (大於 8 秒)，請檢查網路連線後再試。';
        } else if (fetchResult.isOffline) {
            errTitle = 'ERR_INTERNET_DISCONNECTED'; errMsg = '網路連線中斷，請檢查您的網路狀態。';
        }
        markdownContent = `\n# ${article.title}\n\n${window.getSystemErrorHtml(errTitle, errMsg)}`;
    }
    
    if (window._activeFetcher !== null) return; // 幽靈渲染防護

    // ✨ 智慧判斷：如果彈窗是開著的... (這行以下維持原樣)
    // 代表這是「文章切換文章」，我們就把頂部列的動畫關掉！
    const isCurrentlyArticle = document.querySelector('#modal-top-left .unified-nav-capsule') !== null;
    const animateTopBar = !(modalOverlay.classList.contains('active') && isCurrentlyArticle);

    switchModalContent(
        () => {
            document.querySelector('.modal-top-bar').classList.remove('is-index-mode');
            modalOverlay.classList.add('active');
            window.lockScroll();
            window._lastMarkdownHeadings = [];
            
            const viewIndex = document.getElementById('view-index');
            const viewArticle = document.getElementById('view-article');

            // ✨ 隱藏目錄，顯示並注入文章
            if (viewIndex) viewIndex.style.display = 'none';
            if (viewArticle) {
                viewArticle.style.display = 'block';
                // ✨ 賦予目前渲染環境的專屬 ID，供解鎖特效記憶使用
                window._currentRenderPlace = projectId + '_' + articleIndex;
                viewArticle.innerHTML = marked.parse(markdownContent);
            }
            
            // 建立操作指標
            const activeView = viewArticle || modalBody;

            // ==========================================
            // ✨ 啟動進度條引擎 (主進度條 & 直書獨立進度條)
            // ==========================================
            // ✨ 核心修復：閱讀進度條改為監聽真正的捲動容器 modalContainer
            const modalContainer = document.querySelector('.modal-content');
            const topBar = document.querySelector('.modal-top-bar');
            if (modalContainer && topBar) {
                window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');
            }

            // 2. 綁定直書模式 (Vertical Wrapper) 專屬獨立進度條
            const verticalWrappers = activeView.querySelectorAll('.vertical-wrapper');
            verticalWrappers.forEach(wrapper => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.margin = '1rem 0';
                container.style.borderRadius = '12px';
                container.style.overflow = 'hidden'; // 防突出
                
                wrapper.parentNode.insertBefore(container, wrapper);
                wrapper.style.margin = '0';
                container.appendChild(wrapper);

                // ✨ 呼叫中文直書專屬：自動段落縮排處理器
                window.applyIndentToVerticalWrapper(wrapper);

                // ✨ 直接呼叫引擎，一行搞定所有特效與事件綁定！
                window.initProgressBar(container, wrapper, 'vertical');
            });

            const flatSequence = window.getArticleSequence(projectId);
            const seqIndex = flatSequence.findIndex(item => item.idx === articleIndex);

            const generateNavBtn = (item, type) => {
                const isPrev = type === 'prev';
                const iconSvg = isPrev ? GLOBAL_SVGS.chevronLeft : GLOBAL_SVGS.chevronRight;
                const text = isPrev ? '上一篇' : '下一篇'; 
                
                if (!item) {
                    return { cardHtml: '', btnHtml: `<button class="capsule-btn disabled" disabled>${iconSvg}</button>` };
                }
                
                // ✨ 單純防護 HTML 結構，將標題完整傳給 data-tooltip
                const tooltipText = item.art.title.replace(/"/g, '&quot;');
                
                const cardHtml = `<a href="javascript:void(0)" class="nav-card ${type}" onclick="window.openArticle('${projectId}', ${item.idx})"><div class="nav-label">${isPrev ? `${iconSvg} ${text}` : `${text} ${iconSvg}`}</div><div class="nav-title">${item.art.title}</div></a>`;
                
                // 將 tooltipText 完整塞入
                const btnHtml = `<button class="capsule-btn" onclick="window.openArticle('${projectId}', ${item.idx})" data-tooltip="${tooltipText}">${iconSvg}</button>`;
                
                return { cardHtml, btnHtml };
            };

            const prevData = seqIndex > 0 ? generateNavBtn(flatSequence[seqIndex - 1], 'prev') : generateNavBtn(null, 'prev');
            const nextData = seqIndex < flatSequence.length - 1 ? generateNavBtn(flatSequence[seqIndex + 1], 'next') : generateNavBtn(null, 'next');

            if (prevData.cardHtml || nextData.cardHtml) {
                const navContainer = document.createElement('div');
                navContainer.className = 'article-nav-cards';
                navContainer.innerHTML = prevData.cardHtml + nextData.cardHtml;
                activeView.appendChild(navContainer);
            }

            activeView.querySelectorAll('img').forEach(img => {
                if (!img.getAttribute('onerror')) {
                    img.classList.add('is-loading');
                    img.setAttribute('loading', 'lazy'); 
                    img.setAttribute('onerror', 'window.handleImageError(this)');
                    img.addEventListener('load', function() { this.classList.remove('is-loading'); });
                    if (img.complete && img.naturalHeight === 0) window.handleImageError(img);
                }
            });

            // ✨ 呼叫全域 Mermaid 渲染引擎 (取代原本 30 幾行的 renderMermaid 函數)
            window.renderAllMermaidCharts(activeView);

            // ==========================================
            // ✨ 機密檔案解鎖監視引擎 (Secret Unlock Engine)
            // ==========================================
            const keys = activeView.querySelectorAll('[data-secret-key]');
            if (keys.length > 0) {
                const keyObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const keyEl = entry.target;
                            const secretId = keyEl.getAttribute('data-secret-key');
                            
                            // 呼叫解鎖引擎
                            if (window.unlockSecret(secretId)) {
                                // 1. 顯示超有質感的解鎖 Toast
                                if (window.showSystemToast) {
                                    window.showSystemToast('>_ ACCESS_GRANTED', '取得授權金鑰', `已解鎖隱藏機密 [${secretId}]`, 6000, 'success');
                                }
                                window.triggerHaptic('success');
                                
                                // 2. 讓鑰匙發出覺醒光芒
                                keyEl.classList.add('is-key-triggered');
                                
                                const lockedBlocks = document.querySelectorAll(`.md-secret-block.is-locked[data-secret-id="${secretId}"], .md-inline-secret.is-locked[data-secret-id="${secretId}"], .md-stealth-secret.is-locked[data-secret-id="${secretId}"], .md-stealth-block.is-locked[data-secret-id="${secretId}"]`);
                                lockedBlocks.forEach(block => {
                                    // 解除鎖定與待命狀態
                                    block.classList.remove('is-locked', 'pending-auto-unlock');
                                    block.classList.add('is-unlocked');
                                    
                                    // 📝 記錄為已播過動畫，下次進來就不會再閃爍
                                    const placeId = block.getAttribute('data-place-id');
                                    if (placeId) {
                                        let animatedPlaces = JSON.parse(localStorage.getItem('sys_animated_secrets') || '[]');
                                        if (!animatedPlaces.includes(placeId)) {
                                            animatedPlaces.push(placeId);
                                            localStorage.setItem('sys_animated_secrets', JSON.stringify(animatedPlaces));
                                        }
                                    }
                                });
                            }
                            keyObserver.unobserve(keyEl);
                        }
                    });
                }, { threshold: 0.5 }); // 滾到元素露出一半時才觸發

                keys.forEach(k => {
                    if (!window.isSecretUnlocked(k.getAttribute('data-secret-key'))) {
                        keyObserver.observe(k);
                    } else {
                        k.classList.add('is-key-triggered'); // 以前解鎖過，直接亮起
                    }
                });
            }

            // ==========================================
            // ✨ 跨文章機密自動解碼引擎 (Auto-Decrypt for Global Secrets)
            // ==========================================
            const autoUnlockBlocks = activeView.querySelectorAll('.pending-auto-unlock');
            if (autoUnlockBlocks.length > 0) {
                const autoObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const block = entry.target;
                            
                            // 📝 記錄為已播過動畫
                            const placeId = block.getAttribute('data-place-id');
                            if (placeId) {
                                let animatedPlaces = JSON.parse(localStorage.getItem('sys_animated_secrets') || '[]');
                                if (!animatedPlaces.includes(placeId)) {
                                    animatedPlaces.push(placeId);
                                    localStorage.setItem('sys_animated_secrets', JSON.stringify(animatedPlaces));
                                }
                            }
                            
                            // ✨ 核心修復 3：把畫面上所有的同 ID 區塊一起解碼，這樣目錄 (TOC) 裡的副本也會跟著同步！
                            const secretId = block.getAttribute('data-secret-id');
                            if (secretId) {
                                const syncBlocks = document.querySelectorAll(`[data-secret-id="${secretId}"]`);
                                syncBlocks.forEach(b => {
                                    b.classList.remove('is-locked', 'pending-auto-unlock');
                                    b.classList.add('is-unlocked');
                                });
                            } else {
                                block.classList.remove('is-locked', 'pending-auto-unlock');
                                block.classList.add('is-unlocked');
                            }
                            
                            autoObserver.unobserve(block);
                        }
                    });
                }, { threshold: 0.15 }); // 捲入畫面 15% 時觸發自動解碼

                autoUnlockBlocks.forEach(b => autoObserver.observe(b));
            }

            const firstH1 = activeView.querySelector('h1');
            if (firstH1) {
                const wrapper = document.createElement('div');
                wrapper.className = 'article-header-wrapper';
                wrapper.style.marginTop = (firstH1 === activeView.firstElementChild)? '0' : '0.8rem';

                firstH1.style.borderBottom = 'none';
                firstH1.style.paddingBottom = '0';
                firstH1.style.margin = '0';
                firstH1.parentNode.insertBefore(wrapper, firstH1);

                const leftGroup = document.createElement('div');
                leftGroup.className = 'header-left';
                leftGroup.appendChild(firstH1);
                if (article.date) {
                    const dateSpan = document.createElement('div');
                    dateSpan.className = 'article-date';
                    dateSpan.innerText = article.date;
                    leftGroup.appendChild(dateSpan);
                }
                wrapper.appendChild(leftGroup);

                const rightGroup = document.createElement('div');
                rightGroup.className = 'header-right';
                const statusBadge = window.getStatusBadgeHtml(article, false);
                if (statusBadge) {
                    const tagContainer = document.createElement('div');
                    tagContainer.className = 'status-badge-container';
                    tagContainer.innerHTML = statusBadge;
                    rightGroup.appendChild(tagContainer);
                }

                // ✅ 【替換為這 2 行】：
                const articleSlug = article.id || articleIndex;
                const shareUrl = window.updateRouteState(projectId, articleSlug, targetHash);

                // ✨ 替換這兩行，將文章內的複製按鈕升級為無氣泡的響應式
                const shareBtn = document.createElement('button');
                shareBtn.className = 'share-link-btn responsive-share-btn';
                shareBtn.innerHTML = `${GLOBAL_SVGS.link} <span class="btn-text-hideable">複製連結</span>`;
                shareBtn.addEventListener('click', function() { window.handleCopy(this, shareUrl); });

                rightGroup.appendChild(shareBtn);
                wrapper.appendChild(rightGroup);
            }

            const topLeft = document.getElementById('modal-top-left');
            let historyBtnHtml = (window.historyStack && window.historyStack.length > 1) ? `<div class="capsule-divider"></div><button class="capsule-btn history-btn" onclick="window.goBackInHistory()" data-tooltip="返回跳轉前">${GLOBAL_SVGS.historyBack}</button>` : '';
            let sequenceHtml = (flatSequence.length > 1) ? `<div class="capsule-divider"></div>${prevData.btnHtml}<span class="capsule-progress">${seqIndex + 1} / ${flatSequence.length}</span>${nextData.btnHtml}` : '';

            // ✨ 新增：動態生成群組標籤 (Group Badge) 邏輯
            let groupHtml = '';
            if (article.group && proj.groups && proj.groups[article.group]) {
                const groupData = proj.groups[article.group];
                let themeClass = '';
                let customStyle = '';

                // 為了確保顏色與目錄頁完全一致，重跑一次目錄的顏色推導邏輯
                if (groupData.highlight) {
                    let colorIndex = 0;
                    for (const [gId, gData] of Object.entries(proj.groups)) {
                        const groupArticles = flatSequence.filter(item => item.art.group === gId);
                        if (groupArticles.length === 0) continue; // 略過無文章或隱藏的群組
                        
                        if (gId === article.group) {
                            const groupNum = (colorIndex % 5) + 1;
                            themeClass = ` group-color-${groupNum}`;
                            break;
                        }
                        if (gData.highlight) colorIndex++;
                    }
                } else if (groupData.color) {
                    customStyle = ` style="color: ${groupData.color};"`;
                }

                const groupTitle = groupData.title || article.group;
                groupHtml = `<div class="article-group-label${themeClass}"${customStyle}>${groupTitle}</div>`;
            }

            // ✨ 修改：將標籤與膠囊用 top-nav-stack 垂直疊加
            topLeft.innerHTML = `
                <div class="top-nav-stack">
                    ${groupHtml}
                    <div class="unified-nav-capsule">
                        <button class="capsule-btn main-back" onclick="window.openProjectIndex('${projectId}', true)" data-tooltip="返回目錄">${GLOBAL_SVGS.arrowLeft}<span class="desktop-only">目錄</span></button>${sequenceHtml}${historyBtnHtml}
                    </div>
                </div>
            `;

            const tocMount = document.getElementById('toc-mount-point');
            let tocWrapper = tocMount.querySelector('.toc-wrapper'); // 尋找既有的選單
            // ==========================================
            // ✨ 建立文章內文目錄漢堡選單 (導入共用引擎)
            // ==========================================
            const headings = activeView.querySelectorAll('h1, h2, h3');
            let menuItems = [];
            
            if (headings.length > 1) {
                headings.forEach((h, index) => {
                    if (!h.id) h.id = h.innerText.toLowerCase().replace(/[\s&]+/g, '-').replace(/-+/g, '-') || `article-heading-${index}`;
                    
                    // ✨ 核心修復 2：直接抓取 h 的 innerHTML 來保留所有解析過的特效標籤 (機密、高光)
                    let labelText = h.innerHTML;
                    
                    // 預防標題內有超連結，將 <a> 替換為 <span> 防止 TOC 的 <a> 標籤嵌套壞掉
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = labelText;
                    tempDiv.querySelectorAll('a').forEach(aTag => {
                        const span = document.createElement('span');
                        span.innerHTML = aTag.innerHTML;
                        aTag.parentNode.replaceChild(span, aTag);
                    });
                    labelText = tempDiv.innerHTML;
                    
                    let targetHash = '#' + h.id;
                    if (h.id.startsWith('md-sys-')) {
                        const baseId = h.id.replace('md-sys-', '');
                        if (document.getElementById(baseId)) targetHash = '#' + baseId;
                    }
                    
                    menuItems.push({ label: labelText, targetHash: targetHash, className: `toc-${h.tagName.toLowerCase()}` });
                });
            }
            window.renderTocMenu(menuItems, '文章目錄');

            activeView.querySelectorAll('.gallery').forEach(gallery => {
                const wrapper = document.createElement('div');
                wrapper.className = 'scroll-wrapper';
                gallery.parentNode.insertBefore(wrapper, gallery);

                const hintLeft = document.createElement('div');
                hintLeft.className = 'scroll-hint hint-left';
                const hintRight = document.createElement('div');
                hintRight.className = 'scroll-hint hint-right';
                
                wrapper.appendChild(hintLeft);
                wrapper.appendChild(gallery);
                wrapper.appendChild(hintRight);

                const initialStyle = gallery.getAttribute('style') || '';
                const manualRows = (initialStyle.match(/--g-rows:\s*(\d+)/)) ? parseInt(initialStyle.match(/--g-rows:\s*(\d+)/)[1]) : null;

                window.initScrollHints(gallery, hintLeft, hintRight);

                const originalCheckScroll = () => {
                    const totalItems = gallery.querySelectorAll('figure').length;
                    if (totalItems > 0) {
                        let shouldWrap = false;
                        if (!manualRows && totalItems > 1) {
                            const containerWidth = gallery.clientWidth;
                            if (containerWidth > 0) {
                                const matchWidth = initialStyle.match(/--g-width:\s*(\d+)px/);
                                let baseWidth = matchWidth ? parseInt(matchWidth[1]) : 200;
                                if (((baseWidth * totalItems) + (16 * (totalItems - 1))) >= containerWidth * 1.5) shouldWrap = true;
                            }
                        }

                        const isCurrentlyWrapped = gallery.getAttribute('data-wrapped') === 'true';
                        if (shouldWrap !== isCurrentlyWrapped) {
                            if (shouldWrap) {
                                gallery.style.display = 'flex';
                                gallery.style.flexWrap = 'wrap';
                                gallery.style.justifyContent = 'flex-start'; 
                                gallery.style.gridAutoFlow = '';
                                gallery.style.gridTemplateColumns = '';
                                gallery.style.gridTemplateRows = '';
                                gallery.setAttribute('data-wrapped', 'true');
                            } else {
                                gallery.style.display = 'grid';
                                gallery.style.flexWrap = '';
                                gallery.style.justifyContent = '';
                                gallery.style.gridAutoFlow = 'column';
                                gallery.style.gridTemplateColumns = `minmax(var(--g-width), var(--g-width))`;
                                gallery.style.gridTemplateRows = 'auto';
                                gallery.setAttribute('data-wrapped', 'false');
                            }
                        }
                    }
                    const isScrollable = gallery.scrollWidth > gallery.clientWidth + 5;
                    const isAtEnd = Math.ceil(gallery.scrollLeft + gallery.clientWidth) >= Math.floor(gallery.scrollWidth) - 10;
                    const isAtStart = gallery.scrollLeft <= 10;

                    hintRight.classList.toggle('visible', isScrollable && !isAtEnd);
                    hintLeft.classList.toggle('visible', isScrollable && !isAtStart);
                };

                gallery.addEventListener('scroll', originalCheckScroll);
                new ResizeObserver(originalCheckScroll).observe(gallery);
                setTimeout(originalCheckScroll, 150);

                // ✨ 直接呼叫共用水平捲動置中引擎 (取代原本 20 幾行的 scrollOneItem 邏輯)
                hintRight.addEventListener('click', () => window.scrollContainerByItem(gallery, 'figure', 1));
                hintLeft.addEventListener('click', () => window.scrollContainerByItem(gallery, 'figure', -1));
            });

            // ✅ 【將原本的 figure 迴圈內部重構為】：
            activeView.querySelectorAll('figure').forEach(figure => {
                const figcaption = figure.querySelector('figcaption');
                const img = figure.querySelector('img');
                const isGallery = figure.closest('.gallery') !== null;
                
                // 共用按鈕生成器
                const createZoomBtn = (isFloating) => {
                    const btn = document.createElement('button');
                    btn.className = isFloating ? 'zoom-btn floating' : 'zoom-btn';
                    if (isFloating) btn.setAttribute('data-tooltip', '放大檢視');
                    btn.innerHTML = GLOBAL_SVGS.zoomIcon;
                    btn.onclick = (e) => { e.stopPropagation(); window.openLightbox(btn, e); };
                    return btn;
                };

                if (isGallery) {
                    if (figcaption) {
                        figure.style.cursor = 'pointer'; 
                        figure.addEventListener('click', () => figure.classList.toggle('hide-caption'));
                        if (img && !figcaption.querySelector('.zoom-btn')) {
                            figcaption.appendChild(createZoomBtn(false));
                        }
                    }
                } else {
                    figure.classList.add('standalone-figure'); 
                    if (img) {
                        img.style.cursor = 'pointer';
                        img.addEventListener('click', (e) => { e.stopPropagation(); window.openLightbox(img, e); });

                        if (!figure.querySelector('.zoom-btn')) {
                            const isFloating = !figcaption;
                            const zoomBtn = createZoomBtn(isFloating);
                            if (figcaption) {
                                figcaption.appendChild(zoomBtn);
                            } else {
                                figure.classList.add('no-caption');
                                figure.appendChild(zoomBtn);
                            }
                        }
                    }
                }
            });
        },
        () => {
            const modalContainer = document.querySelector('.modal-content');
            if (!modalContainer) return;
            
            if (targetHash) {
                const success = window.executeAnchorScroll(targetHash, true);
                if (success) return; 
            } 

            if (isFromHistory) {
                modalContainer.scrollTo({ top: restoreScrollTop, behavior: 'auto' }); 
                
                if (restoreInnerScrolls && restoreInnerScrolls.length > 0) {
                    // ✨ 加上微幅延遲，等待直書排版與 DOM 結構完全穩定後再還原位置
                    setTimeout(() => {
                        const wrappers = document.querySelectorAll('#view-article .vertical-wrapper');
                        wrappers.forEach((w, i) => {
                            if (restoreInnerScrolls[i]) {
                                w.scrollTo({ 
                                    top: restoreInnerScrolls[i].scrollTop, 
                                    left: restoreInnerScrolls[i].scrollLeft, 
                                    behavior: 'auto' 
                                });
                            }
                        });
                    }, 60);
                }
            } else {
                // ✨ 開啟新文章：主容器與直書容器全部強制歸零
                modalContainer.scrollTo({ top: 0, behavior: 'auto' });
                
                // 加上微幅延遲，確保新生成的 DOM 佈局完成後徹底拔除瀏覽器的自動記憶
                setTimeout(() => {
                    const wrappers = document.querySelectorAll('#view-article .vertical-wrapper');
                    wrappers.forEach(w => w.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
                }, 10);
            }
        },
        animateTopBar
    ); 
};

// === 5. 標籤點擊聚焦邏輯 ===
window.currentActiveTag = null; 
window.highlightedCards = []; 
window.currentCardIndex = 0;  

// ==========================================
// ✨ 言の箱專屬：置中閱讀與點擊切換引擎
// ==========================================
window.isKotobaActive = false;

window.centerKotobaTag = function(event) {
    if (event) event.stopPropagation();
    
    if (window.isKotobaActive) {
        window.clearFilter();
        return;
    }
    
    window.clearFilter();
    window.isKotobaActive = true;
    
    // ✨ 鎖定使用者實際點擊的那一顆言の箱元素
    const targetTagEl = event ? event.target.closest('.kotoba-whisper') : document.querySelector('.kotoba-whisper');
    const firstContent = targetTagEl ? targetTagEl.closest('.marquee-content') : document.querySelector('.marquee-content');
    
    if (targetTagEl && firstContent) {
        document.querySelectorAll('.kotoba-whisper').forEach(t => {
            t.classList.add('is-active');
        });

        const contentWidth = firstContent.offsetWidth;
        
        void firstContent.offsetWidth;
        
        // ✨ 核心修復：直接抓取文字標籤本身的左側座標，徹底拔除 wrapper 帶來的偏移干擾！
        let absoluteLeft = targetTagEl.offsetLeft;
        if (absoluteLeft === 0) {
            absoluteLeft = targetTagEl.getBoundingClientRect().left - firstContent.getBoundingClientRect().left + firstContent.scrollLeft;
        }
        
        let targetX = ((firstContent.parentElement.clientWidth / 2) - (absoluteLeft + (targetTagEl.offsetWidth / 2))) % contentWidth;
        if (targetX > 0) targetX -= contentWidth;
        
        window.scrollMarqueeTo(targetX, contentWidth);
    }
};

window.clearFilter = function(event) {
    if (event) event.stopPropagation(); 
    window.currentActiveTag = null;
    window.highlightedCards = []; 
    window.currentCardIndex = 0;  
    window.isKotobaActive = false; // ✨ 重置言の箱狀態
    
    document.querySelectorAll('.card').forEach(c => c.classList.remove('highlighted', 'jump-bump'));
    document.querySelectorAll('.active-tag').forEach(t => t.classList.remove('active-tag'));
    
    // ✨ 清除言の箱的專屬高光特效
    document.querySelectorAll('.kotoba-whisper').forEach(t => {
        t.classList.remove('is-active');
    });

    const toast = document.getElementById('filter-toast');
    if (toast) toast.classList.remove('active');

    document.querySelectorAll('.marquee-content').forEach(m => {
        if (m.marqueePlayer) { m.marqueePlayer.cancel(); m.marqueePlayer = null; }
        let currentX = new DOMMatrix(window.getComputedStyle(m).transform).m41 % m.offsetWidth; 
        if (currentX > 0) currentX -= m.offsetWidth;

        const remainingTime = (CONFIG.MARQUEE_SPEED * 1000) * (1 - (Math.abs(currentX) / m.offsetWidth)); 
        m.style.transition = 'none';
        m.style.animation = 'none';
        
        m.marqueePlayer = m.animate([{ transform: `translateX(${currentX}px)` }, { transform: `translateX(-${m.offsetWidth}px)` }], { duration: remainingTime, easing: 'linear' });
        m.marqueePlayer.onfinish = () => { m.style.transform = ''; m.style.animation = ''; m.marqueePlayer = null; };
    });
};

window.filterByTag = function(targetTag, event, clickedElement) {
    if (event) event.stopPropagation(); 
    if (window.currentActiveTag === targetTag) return window.clearFilter();

    window.clearFilter();
    window.currentActiveTag = targetTag;
    window.highlightedCards = []; 
    
    // ✨ 鎖定使用者實際點擊的那一顆標籤元素
    let targetTagEl = null;
    if (event && event.target) {
        targetTagEl = event.target.closest('.clickable-ticker-tag');
    }
    if (!targetTagEl && clickedElement) {
        targetTagEl = clickedElement.closest('.clickable-ticker-tag');
    }
    
    const firstContent = targetTagEl ? targetTagEl.closest('.marquee-content') : document.querySelector('.marquee-content');
    if (!targetTagEl && firstContent) {
        targetTagEl = firstContent.querySelector(`.clickable-ticker-tag[data-tag="${targetTag}"]`);
    }
    
    if (targetTagEl && firstContent) {
        const contentWidth = firstContent.offsetWidth;
        void firstContent.offsetWidth;

        // ✨ 核心修復：直接抓取標籤本身的左側座標，徹底拔除 wrapper 帶來的偏移干擾！
        let absoluteLeft = targetTagEl.offsetLeft;
        if (absoluteLeft === 0) {
            absoluteLeft = targetTagEl.getBoundingClientRect().left - firstContent.getBoundingClientRect().left + firstContent.scrollLeft;
        }
        
        let targetX = ((firstContent.parentElement.clientWidth / 2) - (absoluteLeft + (targetTagEl.offsetWidth / 2))) % contentWidth;
        if (targetX > 0) targetX -= contentWidth;
        
        window.scrollMarqueeTo(targetX, contentWidth);
    }

    document.querySelectorAll(`[data-tag="${targetTag}"]`).forEach(t => t.classList.add('active-tag'));
    document.querySelectorAll('.card').forEach(card => {
        const tags = card.getAttribute('data-tags');
        if (tags && tags.includes(targetTag)) { 
            if (card.classList.contains('sys-hidden-card') && !document.body.classList.contains('system-override-active')) {
                return;
            }
            card.classList.add('highlighted'); 
            window.highlightedCards.push(card); 
        }
    });

    if (window.highlightedCards.length === 0) {
        window.clearFilter(); 
        return;
    }

    let clickedCard = clickedElement ? clickedElement.closest('.card') : null;
    window.currentCardIndex = clickedCard ? Math.max(0, window.highlightedCards.indexOf(clickedCard)) : 0;

    const toast = document.getElementById('filter-toast');
    if (toast) {
        document.getElementById('toast-text').innerHTML = `<span class="toast-tag-name">${targetTag}</span>`;
        const toastCount = document.getElementById('toast-count');
        if (toastCount) toastCount.innerText = `(${window.currentCardIndex + 1}/${window.highlightedCards.length})`;
        toast.classList.add('active');
    }

    if (window.highlightedCards.length > 0) window.focusAndBumpCard(window.highlightedCards[window.currentCardIndex]);
};

// ✨ 抽出共用引擎：跑馬燈平滑定位動畫
window.scrollMarqueeTo = function(targetX, contentWidth) {
    document.querySelectorAll('.marquee-content').forEach(m => {
        if (m.marqueePlayer) { m.marqueePlayer.cancel(); m.marqueePlayer = null; }
        let currentX = new DOMMatrix(window.getComputedStyle(m).transform).m41 % contentWidth; 
        if (currentX > 0) currentX -= contentWidth;
        
        m.style.transition = 'none';
        m.style.transform = `translateX(${currentX}px)`;
        m.style.animation = 'none';
        
        void m.offsetWidth; // 強制重繪
        
        const duration = 0.8 + ((Math.abs(targetX - currentX) / contentWidth) * 0.7);
        m.style.transition = `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`;
        m.style.transform = `translateX(${targetX}px)`;
    });
};

window.scrollToNextCard = function(event) {
    if (event) event.stopPropagation();
    if (window.highlightedCards.length <= 1) return;

    window.currentCardIndex = (window.currentCardIndex + 1) % window.highlightedCards.length;
    const toastCount = document.getElementById('toast-count');
    if (toastCount) toastCount.innerText = `(${window.currentCardIndex + 1}/${window.highlightedCards.length})`;
    
    if (window.highlightedCards.length > 0) window.focusAndBumpCard(window.highlightedCards[window.currentCardIndex]);
};

// ==========================================
// ✨ 歷史紀錄與狀態控制
// ==========================================
window.goBackInHistory = function() {
    if (!window.historyStack || window.historyStack.length <= 1) return;
    window.historyStack.pop(); 
    const prev = window.historyStack[window.historyStack.length - 1]; 
    
    // ✨ 修正：傳入 6 個參數，第 5 個給 null (代表沒有錨點)，第 6 個給 innerScrolls 陣列
    window.openArticle(prev.projectId, prev.articleIndex, true, prev.scrollTop || 0, null, prev.innerScrolls || []); 
};

function closeModal() {
    // 🔥 全域中斷防護：關閉視窗時，立刻中斷任何下載！
    if (window._activeFetcher) {
        window._activeFetcher.abort();
        window._activeFetcher = null;
    }
    if (window.toggleLoading) window.toggleLoading(false);

    window.historyStack = []; 
    modalOverlay.classList.remove('active');
    
    // ✨ 關閉 Modal 時，精準拔除 Jump Toast 捲動監聽器，防止 Memory Leak
    if (window.indexScrollHandler) {
        const modalContainer = document.querySelector('.modal-content');
        if (modalContainer) modalContainer.removeEventListener('scroll', window.indexScrollHandler);
        window.indexScrollHandler = null;
    }
    
    // ✨ 延遲解鎖，並在視窗完全隱形後，默默把捲軸推回頂部、清除快取！
    // 這樣下次開啟任何頁面時，絕對是從 0 乾淨開始，不會閃爍殘影。
    setTimeout(() => {
        window.unlockScroll();
        const modalContainer = document.querySelector('.modal-content');
        if (modalContainer) modalContainer.scrollTo({ top: 0, behavior: 'auto' });
        window._indexScrollTopCache = 0;
        window._changelogScrollTopCache = 0;
    }, 300); 

    const jumpToast = document.getElementById('new-jump-toast');
    if (jumpToast) jumpToast.classList.remove('is-visible');

    window.history.replaceState(null, '', window.location.pathname);
}

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

modalOverlay.addEventListener('touchmove', (e) => { if (e.target === modalOverlay) e.preventDefault(); }, { passive: false });

// ==========================================
// ✨ 全域鍵盤快捷鍵引擎 (Unified Keyboard Engine)
// ==========================================
document.addEventListener('keydown', (e) => {
    const lightboxModal = document.getElementById('lightbox-modal');
    const isLightboxOpen = lightboxModal && lightboxModal.classList.contains('is-active');
    
    const modalOverlay = document.getElementById('md-modal');
    const isArticleOpen = modalOverlay && modalOverlay.classList.contains('active');

    // --- 🎬 第 0 層：自製影片全螢幕 (最最高優先權) ---
    const fullscreenVideo = document.querySelector('video.is-web-fullscreen');
    if (fullscreenVideo) {
        if (e.key === 'Escape') {
            window.toggleWebFullscreen(fullscreenVideo); // 退出影片全螢幕
            e.preventDefault();
        }
        // ✨ 直接 return 終止事件！這樣你在全螢幕看影片按左右鍵時，
        // 只會觸發影片原生控制列的「快轉/倒退」，而不會誤觸切換文章！
        return; 
    }

    // --- 🥊 第一層：Lightbox 大圖預覽 ---
    if (isLightboxOpen) {
        if (e.key === 'Escape') {
            const toolbox = document.getElementById('lightbox-toolbox');
            const state = window.lightboxState;
            if (toolbox && toolbox.classList.contains('is-open')) {
                toolbox.classList.remove('is-open'); 
            } else if (state.zoom > 1) {
                window.lightboxAction('reset');      
            } else {
                window.closeLightbox();              
            }
            e.preventDefault();
        }
        if (e.key === 'ArrowLeft') { window.navigateLightbox(-1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { window.navigateLightbox(1); e.preventDefault(); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
        return; // 終止事件，絕不把按鍵傳給底下的文章 Modal
    }

    // --- 📖 第二層：文章 Modal 閱讀模式 ---
    if (isArticleOpen) {
        const tocDropdown = document.querySelector('.toc-dropdown');
        const tocBtn = document.querySelector('.toc-toggle-btn');

        if (e.key === 'Escape') {
            // ✨ 智慧關閉：如果目錄開著就先關目錄，否則才關閉整篇文章
            if (tocDropdown && tocDropdown.classList.contains('active') && tocBtn) {
                tocBtn.click(); 
            } else {
                closeModal();
            }
            e.preventDefault();
        }
        
        if (e.key === 'ArrowLeft') {
            const prevBtn = document.querySelector('.nav-card.prev');
            if (prevBtn) { prevBtn.click(); e.preventDefault(); }
        }
        if (e.key === 'ArrowRight') {
            const nextBtn = document.querySelector('.nav-card.next');
            if (nextBtn) { nextBtn.click(); e.preventDefault(); }
        }
    } else {
        // --- 🏠 第三層：首頁全螢幕選單 ---
        if (e.key === 'Escape') {
            const fullscreenMenu = document.getElementById('fullscreen-menu');
            const menuToggle = document.getElementById('menu-toggle');
            if (fullscreenMenu && fullscreenMenu.classList.contains('active') && menuToggle) {
                menuToggle.click();
                e.preventDefault();
            }
        }
    }

    // ==========================================
    // ✨ 全域通用快捷鍵 (Global Shortcuts)
    // ==========================================
    // 按 [M] 鍵：一鍵切換深淺色主題 (確保沒有在輸入文字時觸發)
    if (e.key.toLowerCase() === 'm' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) themeBtn.click();
    }

    // ✨ 新增：按 [T] 鍵：一鍵切換全站字體大小
    if (e.key.toLowerCase() === 't' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        window.toggleTextScale();
    }
});

// ==========================================
// ✨ Mermaid 專業控制台引擎
// ==========================================
window.zoomMermaid = function(btn, action) {
    const container = btn.closest('.mermaid-container');
    const mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;

    let zoom = parseFloat(container.dataset.zoom) || 1;
    let x = parseFloat(container.dataset.x) || 0;
    let y = parseFloat(container.dataset.y) || 0;

    if (action === 'reset') {
        zoom = 1; x = 0; y = 0;
    } else if (action === 'center') {
        // ✨ 新增：只將座標歸零，但不改變目前的縮放倍率
        x = 0; y = 0;
    } else if (action === 'zoom-in') {
        zoom = Math.min(zoom + 0.5, 3);
    } else if (action === 'zoom-out') {
        zoom = Math.max(0.5, zoom - 0.5);
    }

    container.dataset.zoom = zoom;
    container.dataset.x = x;
    container.dataset.y = y;
    mermaidDiv.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
};

// ==========================================
// ✨ Mermaid 重新整理引擎 (主動重繪 + 瞬間歸零防跑版)
// ==========================================
window.reloadMermaid = function(btn) {
    const container = btn.closest('.mermaid-container');
    const wrapper = container.querySelector('.mermaid-wrapper');
    const mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv || !wrapper) return;

    // 1. 重置數據狀態
    container.dataset.zoom = 1;
    container.dataset.x = 0;
    container.dataset.y = 0;
    
    // 🔥 2. 核心防跑版修復：鎖定外層 Wrapper 的實際尺寸！
    const rect = wrapper.getBoundingClientRect();
    wrapper.style.minHeight = `${rect.height}px`;
    
    // 強制「瞬間」歸零，拔除所有 CSS 動畫過渡
    mermaidDiv.style.transition = 'none';
    mermaidDiv.style.transform = 'translate(0px, 0px) scale(1)';
    
    // 強制瀏覽器立刻重繪 (Reflow)
    void mermaidDiv.offsetWidth; 
    mermaidDiv.style.opacity = '0.3';
    
    setTimeout(() => {
        const originalText = decodeURIComponent(mermaidDiv.getAttribute('data-original-text') || '');
        if (originalText) {
            mermaidDiv.removeAttribute('data-processed');
            mermaidDiv.innerHTML = window.processMermaidCssVars(originalText);
            
            // ✨ 直接呼叫全域引擎，利用 onComplete 進行完美收尾！
            window.renderAllMermaidCharts(container, () => {
                wrapper.style.minHeight = ''; 
                mermaidDiv.style.opacity = '1';
                mermaidDiv.style.transition = 'transform 0.15s var(--ease-smooth)';
            });
        } else {
            mermaidDiv.style.opacity = '1';
            mermaidDiv.style.transition = 'transform 0.15s var(--ease-smooth)';
            wrapper.style.minHeight = '';
        }
    }, 50); 
};

// ✨ 全新：完美偽裝成 Lightbox 的 Mermaid 全螢幕引擎
window.fullscreenMermaid = function(btn) {
    const container = btn.closest('.mermaid-container');
    const mermaidDiv = container.querySelector('.mermaid');
    const titleNode = container.querySelector('.mermaid-title');
    if (!mermaidDiv) return;

    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxWrapper = document.querySelector('.lightbox-img-wrapper');
    
    // 1. 動態建立一個專屬的 DOM 容器放在 Lightbox 裡
    let customContainer = document.getElementById('lightbox-custom-dom');
    if (!customContainer) {
        customContainer = document.createElement('div');
        customContainer.id = 'lightbox-custom-dom';
        customContainer.style.cssText = 'display: none; position: absolute; inset: 0; width: 100%; height: 100%; align-items: center; justify-content: center; pointer-events: none;';
        lightboxWrapper.appendChild(customContainer);
    }

    // 2. 完美克隆圖表，並掛上 CSS 類別
    const clonedMermaid = mermaidDiv.cloneNode(true);
    clonedMermaid.id = 'lightbox-active-mermaid';
    clonedMermaid.className = 'lightbox-mermaid-clone'; // ✨ 只用這一行取代下面所有 style
    clonedMermaid.style.transform = 'translate(0px, 0px) scale(1)'; // 座標初始化仍須 JS
    
    customContainer.innerHTML = '';
    customContainer.appendChild(clonedMermaid);

    // 3. 設定 Lightbox 狀態，加上 isDomMode 隱藏屬性
    window.lightboxState = { 
        images: [{ src: '', caption: titleNode ? titleNode.innerText : "Mermaid 流程圖" }], 
        currentIndex: 0, 
        zoom: 1, 
        x: 0, 
        y: 0,
        maxZoom: 5, // 圖表允許放得更大
        isDomMode: true
    };

    lightboxModal.classList.add('is-active');
    window.updateLightboxView();
};

// ==========================================
// ✨ Mermaid 專業控制台引擎 (支援手機點擊與桌機絲滑拖曳)
// ==========================================
window.initMermaidDrag = function() {
    document.querySelectorAll('.mermaid-container').forEach(container => {
        // 🔥 修復 1：移除 dataset.engineInit 的直接 return 阻斷
        // 改為判斷是否已經有我們自定義的標記，如果有，代表已經綁定過了，跳過。
        // 但我們允許在「重整」時強制重新綁定（因為重整時我們會手動清除這個標記）
        if (container.classList.contains('drag-initialized')) return;
        container.classList.add('drag-initialized');

        const wrapper = container.querySelector('.mermaid-wrapper');
        const mermaidDiv = container.querySelector('.mermaid');
        if (!wrapper || !mermaidDiv) return;

        // ✨ 觸控版專屬：點擊直接進入大圖預覽
        wrapper.addEventListener('click', (e) => {
            // 將原本的寬度判斷改為觸控裝置判斷
            if (document.body.classList.contains('is-touch-device')) {
                const btn = container.querySelector('.mermaid-btn[onclick*="fullscreenMermaid"]');
                if (btn) btn.click();
            }
        });

        let isDragging = false;
        let startX = 0, startY = 0;
        let animationFrameId = null; // 用於高更新率螢幕的效能優化

        // 1. 滑鼠與觸控平移 (Pan)
        wrapper.addEventListener('pointerdown', (e) => {
            if (document.body.classList.contains('is-touch-device')) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            
            isDragging = true;
            wrapper.classList.add('is-dragging'); // ✨ 核心：掛上 class 瞬間拔除 CSS 動畫
            wrapper.style.cursor = 'grabbing';
            
            startX = e.clientX - (parseFloat(container.dataset.x) || 0);
            startY = e.clientY - (parseFloat(container.dataset.y) || 0);
            
            if (wrapper.setPointerCapture) wrapper.setPointerCapture(e.pointerId);
        });

        wrapper.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            
            let x = e.clientX - startX;
            let y = e.clientY - startY;
            container.dataset.x = x;
            container.dataset.y = y;
            const zoom = parseFloat(container.dataset.zoom) || 1;
            
            // ✨ 核心：使用 requestAnimationFrame 確保拖曳時畫面不撕裂
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                mermaidDiv.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
            });
        });

        const endDrag = (e) => {
            if (isDragging) {
                isDragging = false;
                wrapper.classList.remove('is-dragging'); // ✨ 核心：放開滑鼠時把 CSS 動畫還回去
                wrapper.style.cursor = 'grab';
                
                if (wrapper.releasePointerCapture) wrapper.releasePointerCapture(e.pointerId);
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
            }
        };

        wrapper.addEventListener('pointerup', endDrag);
        wrapper.addEventListener('pointercancel', endDrag);

        // 2. 滾輪對準游標中心縮放
        wrapper.addEventListener('wheel', (e) => {
            if (document.body.classList.contains('is-touch-device')) return;
            e.preventDefault();
            let zoom = parseFloat(container.dataset.zoom) || 1;
            let x = parseFloat(container.dataset.x) || 0;
            let y = parseFloat(container.dataset.y) || 0;

            const delta = e.deltaY < 0 ? 1 : -1;
            let newZoom = Math.max(0.5, Math.min(zoom * (1 + delta * 0.15), 3));

            const rect = wrapper.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;

            const ratio = newZoom / zoom - 1;
            x -= (mouseX - x) * ratio;
            y -= (mouseY - y) * ratio;

            container.dataset.zoom = newZoom;
            container.dataset.x = x;
            container.dataset.y = y;
            mermaidDiv.style.transform = `translate(${x}px, ${y}px) scale(${newZoom})`;
        }, { passive: false });
    });
};

function show404Modal(title, message) {
    const modalOverlay = document.getElementById('md-modal');
    const viewIndex = document.getElementById('view-index');
    const viewArticle = document.getElementById('view-article');
    if (viewIndex) viewIndex.style.display = 'none';
    if (viewArticle) viewArticle.style.display = 'block';
    const modalBody = viewArticle || document.getElementById('modal-body');
    const modalTopLeft = document.getElementById('modal-top-left');
    const tocMountPoint = document.getElementById('toc-mount-point');
    
    // 🔥 抓取 Modal 容器並強制縮小寬度
    const modalContainer = modalOverlay.querySelector('.modal-content');
    if (modalContainer) modalContainer.classList.add('is-sys-error-mode');

    if (modalTopLeft) modalTopLeft.innerHTML = `<span style="color: var(--muted); font-weight: 600; font-family: monospace; letter-spacing: 0.05em;">SYSTEM_ERROR</span>`;
    if (tocMountPoint) tocMountPoint.innerHTML = '';

    // ✨ 動態判斷：如果是 403 就顯示鎖頭，否則顯示驚嘆號
    const is403 = title.includes('403');
    const iconSvg = is403 
        ? GLOBAL_SVGS.errorLock.replace('<svg ', '<svg class="sys-error-icon" ') 
        : GLOBAL_SVGS.errorAlert.replace('<svg ', '<svg class="sys-error-icon" ');

    modalBody.innerHTML = `
        <div class="sys-error-layout">
            ${iconSvg}
            <h1>${title}</h1>
            <p class="sys-error-desc">${message}</p>
            <button class="btn sys-error-btn" onclick="closeModal()">
                ${GLOBAL_SVGS.arrowLeft} 返回首頁
            </button>
        </div>`;

    modalOverlay.classList.add('active');
    window.lockScroll();

    // ✨ 403 畫面中的「管理員解鎖彩蛋」與「遠端鎖頭連動特效」
    const trigger = modalBody.querySelector('.secret-admin-trigger');
    if (trigger) {
        const lockIcon = modalBody.querySelector('.error-lock-icon');
        const shackle = modalBody.querySelector('.error-lock-shackle');

        // 當滑鼠移入「風川梓」時：大鎖頭亮起紅光並暴力彈開
        trigger.addEventListener('mouseenter', () => {
            if (lockIcon) {
                lockIcon.style.stroke = 'var(--error-color)';
                lockIcon.style.opacity = '1';
                lockIcon.style.filter = 'drop-shadow(0 0 15px var(--error-color))';
            }
            if (shackle) {
                shackle.style.transform = 'translateY(-10px) translateX(4px) rotate(15deg)';
            }
        });

        // 當滑鼠移出時：大鎖頭扣回原位並變回灰色
        trigger.addEventListener('mouseleave', () => {
            if (lockIcon) {
                lockIcon.style.stroke = 'var(--muted)';
                lockIcon.style.opacity = '0.5';
                lockIcon.style.filter = 'none';
            }
            if (shackle) {
                shackle.style.transform = 'none';
            }
        });

        // 點擊執行解鎖與無縫轉場
        trigger.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const pParam = urlParams.get('p');
            const aParam = urlParams.get('a');
            const hashParam = window.location.hash || null;
            
            // ✨ 新增：在正式解封前，預先檢查目標專案與文章的版本需求
            if (pParam) {
                const cleanProjectId = pParam.replace(/^\d+_/, '');
                const project = window.siteProjects.find(proj => proj.id === cleanProjectId);
                if (project) {
                    let targetVersion = project.min_sys_version || null;
                    
                    // 如果有指定文章，進一步比對文章的版本要求，取兩者中較高者
                    if (aParam !== null && aParam !== undefined) {
                        let aIndex = project.articles.findIndex(art => art.id === aParam);
                        if (aIndex === -1 && !isNaN(parseInt(aParam))) aIndex = parseInt(aParam, 10);
                        if (aIndex !== -1 && project.articles[aIndex].min_sys_version) {
                            if (!targetVersion || window.compareVersions(targetVersion, project.articles[aIndex].min_sys_version) < 0) {
                                targetVersion = project.articles[aIndex].min_sys_version;
                            }
                        }
                    }

                    // 如果系統版本不足，攔截解封動作，直接觸發更新引擎！
                    if (targetVersion && window.compareVersions(CONFIG.VERSION, targetVersion) < 0) {
                        closeModal(); // 關閉 403 畫面
                        sessionStorage.setItem('sys_reboot_count', '1');
                        sessionStorage.setItem('sys_is_rebooting', 'true');
                        sessionStorage.setItem('sys_expected_version', targetVersion);
                        
                        showSystemRebootScreen('CORE_UPDATE', CONFIG.VERSION, targetVersion, 'UPDATING', true);
                        
                        setTimeout(() => {
                            const newUrl = new URL(window.location.href);
                            newUrl.searchParams.set('v', new Date().getTime());
                            window.location.replace(newUrl.toString());
                        }, 1200);
                        return; // ⛔ 中斷後續解封執行
                    }
                }
            }

            document.body.classList.add('system-override-active');
            
            // ✨ 呼叫全域重刷引擎，確保退回首頁時，卡片數字與捲軸提示都已完美更新！
            window.refreshUIAfterOverrideToggle();
            
            if (pParam) {
                window.handleAppRouting(pParam, aParam, hashParam);
            } else {
                closeModal();
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }
        });
    }
}

// ==========================================
// ✨ 敏感內容/使用者協議攔截引擎 (Content Warning Engine)
// ==========================================
window._hasAgreedSensitiveContent = false;

window.showSensitiveAgreementModal = function(onAgreeCallback, onDeclineCallback) {
    if (window._hasAgreedSensitiveContent === true) {
        if (onAgreeCallback) onAgreeCallback();
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'sensitive-modal-overlay';
    overlay.className = 'modal-overlay active'; 
    overlay.style.zIndex = '1100'; 
    
    // ✨ 移除原本的 title，保留游標暗示即可
    overlay.style.cursor = 'pointer';
    
    // 將拒絕/關閉的邏輯抽出來
    const declineAction = () => {
        document.removeEventListener('keydown', escListener);
        overlay.remove();
        window.unlockScroll();
        if (onDeclineCallback) {
            onDeclineCallback();
        } else {
            window.history.replaceState(null, '', window.location.pathname);
        }
    };

    // 建立 ESC 鍵盤監聽器
    const escListener = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            declineAction();
        }
    };
    document.addEventListener('keydown', escListener);

    // ✨ 移除內層與按鈕的 title
    // ✨ 拔除 inline style，改用 .sensitive-modal-box 類別
    overlay.innerHTML = `
        <div class="sensitive-modal-content">
            <button id="sensitive-close-x" class="sensitive-close-btn">
                ${GLOBAL_SVGS.closeX}
            </button>
            ${GLOBAL_SVGS.warning}
            <h2 class="sensitive-title">內容警告 (Content Warning)</h2>
            <p class="sensitive-desc">
                此條目包括但不限於：負面、一時興起、莫名其妙、取景框。<br>點擊前往即表示您已了解。<br>
                <span class="sensitive-desc-hint">(同意後於本次瀏覽器存續期間將不再提示)</span>
            </p>
            <div class="sensitive-actions">
                <button id="sensitive-decline-btn" class="btn">不感興趣</button>
                <button id="sensitive-agree-btn" class="btn">我已了解並前往</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    window.lockScroll();

    // 綁定三個能觸發「拒絕/關閉」的元素
    document.getElementById('sensitive-decline-btn').onclick = declineAction;
    document.getElementById('sensitive-close-x').onclick = declineAction;
    
    // 點擊背景遮罩關閉
    overlay.onclick = (e) => {
        if (e.target === overlay) declineAction();
    };

    document.getElementById('sensitive-agree-btn').onclick = () => {
        document.removeEventListener('keydown', escListener); 
        window._hasAgreedSensitiveContent = true;
        overlay.remove();
        if (onAgreeCallback) onAgreeCallback();
    };
};

// ==========================================
// ✨ 專為 JSON/Markdown 轉 HTML 後的中文排版處理器 (支援 <br> 狀態機遞迴版)
// ==========================================
window.applyIndentToVerticalWrapper = function(container) {
    if (!container || container.getAttribute('data-indent') === 'false') return;

    const indent = '\u3000\u3000'; // 兩個全形空白

    function processNode(node, state) {
        for (let i = 0; i < node.childNodes.length; i++) {
            let child = node.childNodes[i];
            
            if (child.nodeName === 'BR') {
                // ✨ 遇到 <br> 換行標籤，舉起旗子：接下來的文字是新的一行！
                state.isNewLine = true;
            } else if (child.nodeType === Node.TEXT_NODE) {
                // 忽略純換行符號或無意義的空白節點
                if (child.textContent.trim().length > 0) {
                    // 如果旗子舉著 (代表這是新行的開頭)
                    if (state.isNewLine) {
                        if (!child.textContent.startsWith(indent)) {
                            child.textContent = indent + child.textContent.replace(/^\s+/, '');
                        }
                        // 縮排完畢，放下旗子
                        state.isNewLine = false;
                    }
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                // 遇到大型區塊元素，它們本身就自成一區，所以後面的文字又算新的一行
                if (['IMG', 'VIDEO', 'AUDIO', 'TABLE', 'UL', 'OL', 'FIGURE', 'DIV'].includes(child.tagName)) {
                    state.isNewLine = true; 
                } else if (['SCRIPT', 'STYLE'].includes(child.tagName)) {
                    // 系統標籤，直接略過
                } else {
                    // ✨ 遇到 span, a, strong, ruby 等行內元素，帶著「目前的旗子狀態」鑽進去繼續找！
                    processNode(child, state);
                }
            }
        }
    }

    // 針對所有 <p> 段落執行狀態機掃描
    container.querySelectorAll('p').forEach(p => {
        let state = { isNewLine: true }; // 進入新段落，預設舉起新行旗子
        processNode(p, state);
    });
};

// ==========================================
// ✨ 系統級 Markdown 彈窗共用引擎 (Credits, License, Privacy 等)
// ==========================================
window.cachedMarkdownFiles = {}; // 統一管理快取

window.showSystemMarkdownModal = async function(title, badgeText, fetchUrl, cacheKey, extraHtml = '') {
    if (window._activeFetcher) { window._activeFetcher.abort(); window._activeFetcher = null; }
    window.toggleLoading(false);

    let mdText = "載入失敗"; let isError = false;

    if (window.cachedMarkdownFiles[cacheKey]) {
        mdText = window.cachedMarkdownFiles[cacheKey];
    } else {
        const fetchResult = await window.safeFetchWithGuard(`${fetchUrl}?v=${window.getResVersion(cacheKey)}`, { isJson: false });
        if (fetchResult.aborted) return;
        
        if (fetchResult.success) {
            mdText = fetchResult.data;
            window.cachedMarkdownFiles[cacheKey] = mdText;
        } else {
            console.error(`${title} 載入失敗:`, fetchResult.error);
            isError = true;
        }
    }

    if (window._activeFetcher !== null) return;

    switchModalContent(
        () => {
            const modalOverlay = document.getElementById('md-modal');
            const viewIndex = document.getElementById('view-index');
            const viewArticle = document.getElementById('view-article');
            if (viewIndex) viewIndex.style.display = 'none';
            if (viewArticle) viewArticle.style.display = 'block';
            const modalBody = viewArticle || document.getElementById('modal-body');
            
            if (document.getElementById('toc-mount-point')) document.getElementById('toc-mount-point').innerHTML = '';
            
            const modalTopLeft = document.getElementById('modal-top-left');
            if (modalTopLeft) {
                modalTopLeft.innerHTML = `
                    <div class="index-header-container">
                        <h1 class="index-header-title">${title}</h1>
                        <div class="index-header-actions">
                            <span class="article-count-badge">${badgeText}</span>
                        </div>
                    </div>
                `;
            }

            if (isError) {
                modalBody.innerHTML = window.getSystemErrorHtml('System Error', `無法載入 ${title} 檔案。`);
            } else {
                // ✨ 核心修改：將 ${extraHtml} 移到 .markdown-body 的上方！
                // 同時微調 markdown-body 的 marginTop，讓它與上方按鈕保持完美間距
                modalBody.innerHTML = `
                    ${extraHtml}
                    <div class="markdown-body" style="margin-top: 0; padding-bottom: 2rem;">
                        ${marked.parse(mdText)}
                    </div>
                `;
            }

            const modalContainer = document.querySelector('.modal-content');
            const topBar = document.querySelector('.modal-top-bar');
            if (modalContainer && topBar) window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');

            modalOverlay.classList.add('active');
            window.lockScroll();
        },
        () => {
            const modalContainer = document.querySelector('.modal-content');
            if (modalContainer) modalContainer.scrollTo({ top: 0, behavior: 'auto' });
        }
    );
};

// ✨ 使用時只需呼叫一行，乾淨俐落！
window.showCreditsModal = () => window.showSystemMarkdownModal('Credits', 'Acknowledgments', './credits.md', 'credits.md');

window.showLicenseModal = () => window.showSystemMarkdownModal(
    'License & Copyright', 
    'important', 
    './COPYRIGHT.md', 
    'COPYRIGHT.md', 
    `<div id="bilingual-switcher"><div class="lang-tabs">
        <button class="lang-btn active" onclick="window.switchBilingualTab('zh', this)">中文版</button>
        <button class="lang-btn" onclick="window.switchBilingualTab('en', this)">English</button>
        <button class="lang-btn" onclick="window.switchBilingualTab('ja', this)">日本語</button>
    </div></div>`
);

// ==========================================
// ✨ 升級版系統日誌：支援兩層式架構、平滑動畫過場，與「手動強制更新檢查」！
// ==========================================
window.cachedChangelogs = null; 

window.showChangelogModal = async function(isSystemFallback = false) {
    document.body.style.cursor = 'wait';
    window.toggleLoading(true, 'FETCHING_DATA...');
    
    // 🔥 攔截前次請求
    if (window._activeFetcher) window._activeFetcher.abort();
    window._activeFetcher = new AbortController();
    const controller = window._activeFetcher;
    
    let fetchError = false;

    try {
        if (!isSystemFallback) {
            // 🔥 第一個 Fetch 綁定 signal
            const vRes = await fetch(`./version.json?t=${new Date().getTime()}`, { signal: controller.signal }).catch(e => {
                if (e.name === 'AbortError') throw e; 
                return null;
            });
            if (vRes && vRes.ok) {
                const vData = await vRes.json();
                if (vData.version && vData.version !== CONFIG.VERSION) {
                    console.warn(`[MANUAL_UPDATE] 發現新版本 ${vData.version}，準備強制更新...`);
                    sessionStorage.setItem('sys_intent', 'changelog');
                    sessionStorage.removeItem('sys_reboot_count');

                    // 🔥 直接呼叫共用過場畫面引擎
                    window.showSystemRebootScreen(
                        'MANUAL_OVERRIDE : UPDATE', 
                        CONFIG.VERSION, 
                        vData.version, 
                        'FETCHING_AND_REBOOTING', 
                        true
                    );
                    
                    setTimeout(() => {
                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.set('v', new Date().getTime());
                        window.location.replace(newUrl.toString());
                    }, 1800);
                    return;
                }
            }
        }

        await window.debugDelay();

        if (window.cachedChangelogs !== null) {
            // 已有快取
        } else {
            // 🔥 第二個 Fetch 綁定 signal
            const response = await fetch(`./changelogs.json?v=${window.getResVersion('changelogs.json')}`, { signal: controller.signal });
            if (!response.ok) throw new Error('找不到 changelogs.json');
            window.cachedChangelogs = await response.json();
        }

    } catch (error) {
        if (error.name === 'AbortError') return; // 🔥 被中斷就安靜退出
        console.error("日誌讀取或更新檢查失敗:", error);
        fetchError = true;
    } finally {
        if (window._activeFetcher === controller) {
            document.body.style.cursor = '';
            window.toggleLoading(false);
            window._activeFetcher = null;
        }
    }

    // 🔥 幽靈渲染防護
    if (window._activeFetcher !== null) return;

    // 共用標題渲染 (邏輯同步精簡)
    function renderChangelogHeader(isDetail = false, logData = null) {
        const modalTopLeft = document.getElementById('modal-top-left');
        if (!modalTopLeft) return;
        
        if (!isDetail) {
            modalTopLeft.innerHTML = `
                <div class="index-header-container">
                    <h1 class="index-header-title">System Changelog</h1>
                    <div class="index-header-actions">
                        <span class="article-count-badge">Update History</span>
                    </div>
                </div>
            `;
        } else {
            let badgeHTML = '';
            if (logData) {
                // 自動對應 CSS 的狀態名稱
                let activeStatus = logData.status === 'LATEST' ? 'NEW' : logData.status;
                badgeHTML = `<span class="status-badge" data-status="${activeStatus}">${logData.status}</span>`;
            }

            modalTopLeft.innerHTML = `
                <div class="changelog-header-row">
                    <button class="modal-back-btn" onclick="window.renderChangelogIndex(true)">
                        ${GLOBAL_SVGS.arrowLeft} 返回清單
                    </button>
                    <div style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
                        <span class="changelog-version">${logData ? logData.version : ''}</span>
                        ${badgeHTML}
                        <span class="changelog-date">${logData ? logData.date : ''}</span>
                    </div>
                </div>
            `;
        }
    }

    // 2. 渲染第一層：索引清單
    window.renderChangelogIndex = function(restoreScroll = false) {
        switchModalContent(
            () => {
                const modalOverlay = document.getElementById('md-modal');
                const viewIndex = document.getElementById('view-index');
                const viewArticle = document.getElementById('view-article');
                if (viewIndex) viewIndex.style.display = 'none';
                if (viewArticle) viewArticle.style.display = 'block';
                const modalBody = viewArticle || document.getElementById('modal-body');
                const tocMountPoint = document.getElementById('toc-mount-point');
                
                if (tocMountPoint) tocMountPoint.innerHTML = '';
                
                // ✨ 加上這兩行：隱藏閱讀進度條
                const progressBar = document.getElementById('reading-progress-bar');
                if (progressBar) progressBar.style.display = 'none';

                renderChangelogHeader(false);

                if (fetchError || !window.cachedChangelogs) {
                    modalBody.innerHTML = window.getSystemErrorHtml('System Error', '無法載入版本日誌。');
                } else {
                    let listHTML = '<ul class="article-list-ul">';
                    window.cachedChangelogs.forEach(log => {
                        
                        let activeStatus = log.status === 'LATEST' ? 'NEW' : log.status;
                        let badgeHTML = `<span class="status-badge title-badge" data-status="${activeStatus}">${log.status}</span>`;

                        // 1. 在 li 加上 data-status 與 ID 屬性
                        listHTML += `
                            <li id="changelog-item-${log.id}" class="article-li is-highlight changelog-list-item" data-status="${activeStatus}">
                                <a href="javascript:void(0)" class="article-link" onclick="window.renderChangelogDetail('${log.id}')">
                                    <div class="article-item-icon-wrap">
                                        <div class="article-item-fallback changelog-item-icon">${GLOBAL_SVGS.docIconLg}</div>
                                    </div>
                                    <div class="article-item-content">
                                        <div class="article-item-title-row">
                                            <span class="article-item-title"><span class="changelog-item-version">${log.version}</span>${badgeHTML}</span>
                                            <span class="article-item-desc">- ${log.description}</span>
                                        </div>
                                        <span class="article-item-date">${log.date}</span>
                                    </div>
                                </a>
                            </li>
                        `;
                    });
                    listHTML += '</ul>';
                    modalBody.innerHTML = listHTML;
                }
                
                modalOverlay.classList.add('active');
                window.lockScroll();
            },
            () => {
                const modalContainer = document.querySelector('.modal-content');
                if (modalContainer) {
                    if (restoreScroll && window._changelogScrollTopCache !== undefined) {
                        modalContainer.scrollTo({ top: window._changelogScrollTopCache, behavior: 'auto' });
                        const targetItem = document.getElementById(`changelog-item-${window.lastReadChangelogId}`);
                        if (targetItem) setTimeout(() => window.simulateHoverFlash(targetItem), 150);
                    } else {
                        modalContainer.scrollTo({ top: 0, behavior: 'auto' });
                    }
                }
            }
        );
    };

    // 3. 渲染第二層：詳細記錄
    window.renderChangelogDetail = function(logId) {
        // ✨ 核心修復 2：改抓真正負責捲動的容器 (modalContainer)
        if (window._changelogScrollTopCache === undefined) {
            const scroller = window.getActiveScrollContainer();
            if (scroller) window._changelogScrollTopCache = scroller.scrollTop;
        }
        window.lastReadChangelogId = logId; 
        
        // ✨ 在 DOM 被替換前，預先計算好返回時的最佳位置
        window._changelogScrollTopCache = window.calculateIdealScrollCache('view-article', `changelog-item-${logId}`, window._changelogScrollTopCache);

        const targetLog = window.cachedChangelogs.find(l => l.id === logId);
        if (!targetLog) return;

        switchModalContent(
            () => {
                renderChangelogHeader(true, targetLog);
                const viewIndex = document.getElementById('view-index');
                const viewArticle = document.getElementById('view-article');
                if (viewIndex) viewIndex.style.display = 'none';
                if (viewArticle) viewArticle.style.display = 'block';
                const modalBody = viewArticle || document.getElementById('modal-body');
                modalBody.innerHTML = `
                    <div class="markdown-body" style="margin-top: -0.5rem;">
                        ${marked.parse(targetLog.content)}
                    </div>
                `;

                // ✨ 核心修復：閱讀進度條改為監聽真正的捲動容器 modalContainer
                const modalContainer = document.querySelector('.modal-content');
                const topBar = document.querySelector('.modal-top-bar');
                if (modalContainer && topBar) {
                    window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');
                }
            },
            // 替換這一段
            () => {
                // 動畫結束後確保畫面在最頂端
                const modalContainer = document.querySelector('.modal-content');
                if (modalContainer) modalContainer.scrollTo({ top: 0, behavior: 'auto' });
            }
        );
    };

    // 初始進入：顯示第一層索引
    window.renderChangelogIndex();
};

// ==========================================
// ✨ 多語系切換引擎 (支援無限擴充語言)
// ==========================================
window.switchBilingualTab = function(lang, btn) {
    // 1. 隱藏所有語言區塊，只顯示選中的語言
    ['zh', 'en', 'ja'].forEach(l => {
        const el = document.getElementById('lang-' + l);
        if (el) el.style.display = (l === lang) ? 'block' : 'none';
    });
    // 2. 更新按鈕的 active 狀態
    const tabs = btn.closest('.lang-tabs');
    if (tabs) {
        tabs.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    }
    btn.classList.add('active');
};


// ==========================================
// ✨ 文章內部錨點平滑跳轉引擎 (強化模糊比對與防呆)
// ==========================================
window.findAnchorElement = function(hash) {
    if (!hash) return null;
    const targetId = hash.substring(1);
    let decodedId = targetId;
    try { decodedId = decodeURIComponent(targetId); } catch(e) {}
    
    const lowerId = targetId.toLowerCase();
    const lowerDecoded = decodedId.toLowerCase();
    // 將空格與特殊符號轉為減號，模擬 GitHub 轉換規則
    const dashedId = lowerDecoded.replace(/[\s&]+/g, '-').replace(/-+/g, '-'); 

    // 1. 標準精確比對
    // ✨ 核心修復：優先搜尋「精確符合」的 HTML 元素 (使用者手寫的 div)，找不到才去搜尋系統產生的 md-sys- 標題！
    let el = document.getElementById(targetId) || 
             document.getElementById(decodedId) || 
             document.getElementById(`md-sys-${targetId}`) || 
             document.getElementById(`md-sys-${decodedId}`) || 
             document.getElementById(`md-sys-${lowerId}`) || 
             document.getElementById(`md-sys-${lowerDecoded}`) ||
             document.getElementById(`md-sys-${dashedId}`);
    
    // 2. 🚀 終極殺手鐧：模糊比對與文字掃描！
    if (!el) {
        const allHeadings = document.querySelectorAll('.modal-content h1, .modal-content h2, .modal-content h3');
        el = Array.from(allHeadings).find(h => 
            h.id.includes(lowerDecoded) || 
            h.id.includes(dashedId) || 
            lowerDecoded.includes(h.id) ||
            h.innerText.toLowerCase().includes(lowerDecoded)
        );
    }
    return el;
};

// ==========================================
// ✨ 文章內部錨點平滑跳轉 (Anchor Scroll)
// ==========================================
window.scrollToAnchor = function(event, hash) {
    if (event) event.preventDefault();
    
    // 呼叫共用引擎 (同頁面點擊，預設使用平滑捲動)
    const success = window.executeAnchorScroll(hash, false);
    if (!success) {
        console.warn("找不到目標錨點:", hash);
    }
};

// ==========================================
// ✨ 獨立打包：終極精準捲動引擎 (物理座標版)
// ==========================================
window.executeAnchorScroll = function(hash, forceInstantFirst = false) {
    const activeContainer = window.getActiveScrollContainer(); 
    if (!activeContainer) return false;

    const targetEl = window.findAnchorElement(hash);
    if (!targetEl) return null;

    // ✨ 簡化版捲動引擎，移除會造成跳動的冗餘追蹤器
    const topBar = document.querySelector('.modal-top-bar');
    const topBarHeight = topBar ? topBar.offsetHeight : 80;
    let itemTop = window.getRelativeOffsetTop(targetEl, activeContainer);
    const targetScrollTop = itemTop - topBarHeight - 7; 
    
    if (Math.abs(activeContainer.scrollTop - targetScrollTop) > 2) {
        activeContainer.scrollTo({ 
            top: targetScrollTop, 
            behavior: forceInstantFirst ? 'auto' : 'smooth' 
        });
    }

    let highlightEl = targetEl;
    if (highlightEl.textContent.trim() === '') {
        highlightEl = highlightEl.nextElementSibling || targetEl;
    }

    highlightEl.classList.add('highlight-flash');
    setTimeout(() => highlightEl.classList.remove('highlight-flash'), 1500);
    
    return true;
};

// ==========================================
// ✨ 網址列動態監聽引擎 (支援直接改網址、按上下頁、改 Hash)
// ==========================================
window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pParam = urlParams.get('p');
    const aParam = urlParams.get('a');
    const hashParam = window.location.hash || null;

    const modalOverlay = document.getElementById('md-modal');
    const isArticleOpen = modalOverlay && modalOverlay.classList.contains('active');

    if (pParam) {
        // 如果網址帶有專案參數，直接驅動路由與文章開啟器
        window.handleAppRouting(pParam, aParam, hashParam);
    } else if (isArticleOpen) {
        // 如果網址的專案參數被清空，但 Modal 還開著，就自動關閉 Modal
        closeModal();
    }
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash) {
        const modalOverlay = document.getElementById('md-modal');
        if (modalOverlay && modalOverlay.classList.contains('active')) {
            setTimeout(() => {
                // ✨ 傳入 true, true -> 瞬間移動、且「絕對不啟動追蹤引擎」！
                // 瀏覽器已經原生跳轉完了，我們只做一次瞬間微調修正導覽列高度，絕不上下拉扯。
                window.executeAnchorScroll(hash, true, true);
            }, 10);
        }
    }
});

// ==========================================
// ✨ 全域事件監聽：X光透視互動 (點擊切換)
// ==========================================
document.addEventListener('click', (e) => {
    // ✨ 絕對防護 1：如果點擊的是防雷貼紙，直接退出，絕對不准切換高光！
    if (e.target.closest('.spoiler-text')) return;

    // ✨ 絕對防護 2：如果點擊的是圖片、畫廊、放大鏡、影音或 PDF，直接退出，防止點擊穿透！
    if (e.target.closest('figure, img, .zoom-btn, .media-container-wrapper, .pdf-container, .code-block-wrapper')) return;

    // 找出點擊的對象是不是我們的高光文字
    const xrayTarget = e.target.closest('.md-highlight-text');
    
    // 先把「其他」已經開啟透視的高光文字關閉
    document.querySelectorAll('.md-highlight-text.is-xray-active').forEach(el => {
        if (el !== xrayTarget) {
            el.classList.remove('is-xray-active');
        }
    });

    // 如果點擊的是高光文字，就切換它的透視狀態
    if (xrayTarget) {
        xrayTarget.classList.toggle('is-xray-active');
    }
});

// ==========================================
// ✨ 動態系統名言引擊 (System Quote Engine)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const quoteTextEl = document.querySelector('.sys-quote-box .quote-text');
    if (!quoteTextEl) return;

    try {
        // ✨ 修改這裡：改去呼叫專屬的名言題庫！
        const notes = await window.getQuotesList();
        
        if (notes && notes.length > 0) {
            const randomNote = notes[Math.floor(Math.random() * notes.length)];
            
            quoteTextEl.style.opacity = '0';
            
            setTimeout(() => {
                quoteTextEl.innerHTML = marked.parse(randomNote);
                quoteTextEl.style.opacity = '1';
            }, 400); 
        }
    } catch (err) {
        console.warn("系統名言載入失敗，維持預設顯示:", err);
    }
});

// ==========================================
// ✨ 全域網路狀態監聽引擎 (Network Status Monitor)
// ==========================================
window.addEventListener('online', () => {
    console.log("[SYS_NET] 網路連線已恢復，準備重新載入...");
    // 網路恢復時，為了確保資料完整性，直接重整頁面
    window.location.reload(); 
});

window.addEventListener('offline', () => {
    console.warn("[SYS_NET] 網路連線已中斷！");
    
    // 如果系統有載入畫面的遮罩卡著，強制關閉它
    if (window.hideSystemRebootScreen) {
        window.hideSystemRebootScreen(false);
    }

    // ✨ 呼叫共用引擎：顯示網路斷線提示
    window.showSystemToast(
        '>_ SYSTEM_OFFLINE', 
        '網路連線中斷', 
        '請檢查您的網路設定，連線恢復後系統將自動重整。', 
        12000, 
        'error'
    );
});

// ==========================================
// ✨ 手機/PWA 專屬 PDF 安全互動選單 (強制下載與瀏覽器穿透版)
// ==========================================
window.showPdfActionModal = function(href, title) {
    const existing = document.getElementById('pdf-action-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pdf-action-modal';


    // 關閉 Modal 的輔助函式 (✨ 加入捲軸狀態防呆)
    const closeModal = () => {
        overlay.style.opacity = '0';
        overlay.querySelector('.pdf-action-sheet').style.transform = 'translateY(100%)';
        setTimeout(() => {
            overlay.remove();
            // ✨ 核心修復：檢查背後的文章 Modal 是否還開著，如果開著就保持鎖定狀態
            const mdModal = document.getElementById('md-modal');
            if (!mdModal || !mdModal.classList.contains('active')) {
                window.unlockScroll();
            }
        }, 300);
    };

    // ✨ 判斷是否為 PWA (Standalone) 模式
    const isPWA = window.isPWAEnvironment();
    
    // 為了完美的 UX：如果是 PWA，我們直接把藍色主按鈕變成「下載」，並隱藏下方的第二顆按鈕
    const viewBtnText = isPWA ? '檢視 PDF 檔案' : '在新視窗檢視 PDF';
    const viewBtnIcon = GLOBAL_SVGS.newTab;
    const downloadBtnDisplay = isPWA ? 'none' : 'flex';

    overlay.innerHTML = `
        <div class="pdf-action-sheet">
            <div class="pdf-drag-handle"></div>
            <div class="pdf-sheet-title">${title}</div>
            <div class="pdf-sheet-subtitle">PDF DOCUMENT</div>
            <div class="pdf-btn-group">
                <button id="pdf-view-btn" class="pdf-action-btn primary">
                    <span style="width: 20px; height: 20px; display: inline-flex; align-items: center;">${viewBtnIcon}</span>${viewBtnText}
                </button>
                <button id="pdf-download-btn" class="pdf-action-btn secondary" style="display: ${downloadBtnDisplay};">
                    <span style="width: 20px; height: 20px; display: inline-flex; align-items: center;">${GLOBAL_SVGS.download}</span>下載 PDF 檔案
                </button>
                <button id="pdf-modal-close" class="pdf-action-btn cancel">取消</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    window.lockScroll();

    setTimeout(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('.pdf-action-sheet').style.transform = 'translateY(0)';
    }, 10);

    // 綁定事件
    overlay.querySelector('#pdf-view-btn').onclick = () => {
        if (isPWA) {
            // ✨ 聽你的！為了原生的 Safari 工具列，我們換回最強的 Blob 大法！
            window.triggerSecureDownload(href, title, true);
        } else {
            // 普通瀏覽器直接另開分頁即可
            window.open(href, '_blank');
        }
        closeModal();
    };

    if (!isPWA) {
        overlay.querySelector('#pdf-download-btn').onclick = () => {
            // ✨ 單純下載 PDF，傳入 false
            window.triggerSecureDownload(href, title, false);
            closeModal();
        };
    }

    overlay.querySelector('#pdf-modal-close').onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
};


// ==========================================
// ✨ 自製影片網頁全螢幕引擎 (Web Fullscreen) - 破解 PWA 原生限制與 Modal 封印
// ==========================================
window.toggleWebFullscreen = function(videoEl) {
    if (!videoEl) return;
    
    if (videoEl.classList.contains('is-web-fullscreen')) {
        // 退出全螢幕
        videoEl.classList.remove('is-web-fullscreen');
        window.unlockScroll(); // 恢復背景捲動
        
        // ✨ 核心修復：把影片從 body 搬回 Modal 裡的原本位置！
        const placeholder = videoEl._fsPlaceholder;
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.insertBefore(videoEl, placeholder);
            placeholder.remove();
        }
        
        // 移除 body 下的關閉按鈕
        const exitBtn = videoEl._fsExitBtn;
        if (exitBtn) exitBtn.remove();
        
    } else {
        // 進入全螢幕
        // 記錄目前的播放狀態，以免搬家後暫停
        const isPaused = videoEl.paused;
        
        const placeholder = document.createElement('div');
        placeholder.className = 'video-fs-placeholder';
        
        videoEl._fsPlaceholder = placeholder;
        videoEl.parentNode.insertBefore(placeholder, videoEl);
        document.body.appendChild(videoEl); // ✨ 瞬間搬家到最高層級
        
        videoEl.classList.add('is-web-fullscreen');
        window.lockScroll(); // 鎖定背景捲動
        
        // 確保搬家後影片繼續播放
        if (!isPaused) videoEl.play().catch(e => console.warn("自動播放被系統阻擋", e));
        
        // 建立並顯示專屬的關閉按鈕 (一樣放在 body 下)
        if (!videoEl._fsExitBtn) {
            const exitBtn = document.createElement('button');
            exitBtn.className = 'video-exit-fullscreen-btn';
            exitBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            exitBtn.onclick = (e) => {
                e.stopPropagation();
                window.toggleWebFullscreen(videoEl);
            };
            document.body.appendChild(exitBtn);
            videoEl._fsExitBtn = exitBtn;
        } else {
            document.body.appendChild(videoEl._fsExitBtn);
        }
    }
};


// ==========================================
// 🖥️ 系統重載與記憶重置底部選單 (System Action Sheet)
// ==========================================
window.showSystemReloadModal = function() {
    // 1. 深度關閉漢堡選單抽屜
    if (typeof window.closeDrawer === 'function') window.closeDrawer();
    if (typeof window.closeMenu === 'function') window.closeMenu();
    document.querySelectorAll('.drawer, #drawer, #category-drawer, #nav-drawer, #menu-drawer, .nav-menu').forEach(el => {
        el.classList.remove('is-open', 'active', 'open');
    });
    document.querySelectorAll('.drawer-overlay, #drawer-overlay, #overlay, .menu-overlay').forEach(el => {
        el.classList.remove('is-active', 'active', 'show');
    });

    // 2. 動態計算原生捲軸寬度並補償 padding，防止畫面左右跳動
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const existing = document.getElementById('sys-reload-sheet-modal');
    if (existing) existing.remove();

    // 3. 建立 DOM 結構 (✨ 移除所有 onclick 屬性)
    const modalHtml = `
    <div id="sys-reload-sheet-modal" class="sys-sheet-overlay">
        <div class="sys-sheet-content">
            <div class="sys-sheet-handle"></div>
            
            <div class="sys-sheet-header">
                <div class="sys-sheet-title">>_ 系統維護控制台</div>
                <div class="sys-sheet-desc">請選擇要執行的系統程序</div>
            </div>

            <div class="sys-sheet-actions">
                <button type="button" class="sys-sheet-btn" id="sys-btn-soft-reload">
                    <div class="sys-sheet-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                        </svg>
                    </div>
                    <div class="sys-sheet-text">
                        <div class="sys-sheet-btn-title">重新整理系統 (SOFT_RELOAD)</div>
                        <div class="sys-sheet-btn-desc">重新載入頁面並同步檢查遠端最新版本。</div>
                    </div>
                </button>

                <button type="button" class="sys-sheet-btn is-danger" id="sys-btn-format-memory">
                    <div class="sys-sheet-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </div>
                    <div class="sys-sheet-text">
                        <div class="sys-sheet-btn-title">重置系統記憶 (FORMAT_MEMORY)</div>
                        <div class="sys-sheet-btn-desc">清空解鎖金鑰與快取，重新體驗演出（保留主題與字型設定）。</div>
                    </div>
                </button>
            </div>

            <button type="button" class="sys-sheet-cancel" id="sys-btn-cancel-modal">
                取消 (CANCEL)
            </button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (typeof window.lockScroll === 'function') window.lockScroll();

    // 4. ✨ 改用強綁定 EventListener，確保絕對不會發生 is not defined 錯誤
    const modalEl = document.getElementById('sys-reload-sheet-modal');
    const contentEl = modalEl.querySelector('.sys-sheet-content');
    
    // 阻擋內部點擊冒泡
    contentEl.addEventListener('click', (e) => e.stopPropagation());
    
    // 綁定關閉事件 (點擊背景或取消按鈕)
    const closeHandler = (e) => {
        if (e) e.stopPropagation();
        modalEl.classList.remove('is-active');
        if (typeof window.unlockScroll === 'function') window.unlockScroll();
        setTimeout(() => {
            modalEl.remove();
            document.body.style.paddingRight = '';
        }, 280);
    };
    modalEl.addEventListener('click', closeHandler);
    document.getElementById('sys-btn-cancel-modal').addEventListener('click', closeHandler);

    // 綁定: 重新整理系統
    document.getElementById('sys-btn-soft-reload').addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.triggerHaptic === 'function') window.triggerHaptic('selection');
        closeHandler();
        window.location.reload();
    });

    // 綁定: 重置系統記憶
    document.getElementById('sys-btn-format-memory').addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.triggerHaptic === 'function') window.triggerHaptic('warning');

        // 讀取並保護偏好設定
        const savedTheme = localStorage.getItem('theme');
        const savedTextScale = localStorage.getItem('sys_text_scale');

        // 精準清除
        localStorage.removeItem('sys_unlocked_secrets');
        localStorage.removeItem('sys_animated_secrets');
        localStorage.removeItem('sys_data_versions');
        sessionStorage.clear();

        // 恢復偏好設定
        if (savedTheme) localStorage.setItem('theme', savedTheme);
        if (savedTextScale) localStorage.setItem('sys_text_scale', savedTextScale);

        closeHandler();

        // ✨ 終極修復：showSystemRebootScreen 不接受 callback，只接受文字參數！
        // 必須把 window.location.reload() 獨立用 setTimeout 執行
        setTimeout(() => {
            try {
                if (typeof window.showSystemRebootScreen === 'function' || typeof showSystemRebootScreen === 'function') {
                    const rebootFn = window.showSystemRebootScreen || showSystemRebootScreen;
                    // 正確參數傳遞：title, localV, remoteV, msg, immediate
                    rebootFn("FORMATTING_MEMORY", CONFIG.VERSION, "N/A", "CLEARING_CACHE...", true);
                    
                    // 延遲 1.2 秒，讓終端機動畫演完再執行真正的重新整理
                    setTimeout(() => { window.location.reload(); }, 1200);
                } else {
                    window.location.reload();
                }
            } catch (error) {
                console.warn("重啟動畫呼叫失敗，強制執行原生重載:", error);
                window.location.reload();
            }
        }, 150);
    });

    // 觸發進場動畫
    setTimeout(() => {
        if (modalEl) modalEl.classList.add('is-active');
    }, 25);
};
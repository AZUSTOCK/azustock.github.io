/* ================================================================== */
/* ⚙️ 網站核心設定區 (SITE CONFIGURATION)                               */
/* 每次發布新版本或修改全域狀態時，請只在這裡修改！                         */
/* ================================================================== */
const CONFIG = {
    // 🚩 發布前必改
    VERSION: "U1.5.6.7",          // 目前系統版本號

    // 🎨 介面與主題設定
    DEFAULT_THEME: "dark",     // 預設主題 (light / dark)
    
    // ✨ 跑馬燈速度設定：跑完一整圈需要的「秒數」(數字越大跑得越慢！)
    MARQUEE_SPEED: 120,

    // ✨ 狀態標籤過期天數 (支援 NEW, UPDATED 等狀態)
    TAG_EXPIRE_DAYS: 14,

    // 🔗 資源路徑
    FAVICON_LIGHT: "https://azustock.github.io/assets/OG_dark.png",
    FAVICON_DARK: "https://azustock.github.io/assets/OG_light.png",
    DATA_SOURCE: "./all_projects.json" 
};

// ==========================================
// ✨ 全域共用 SVG 圖標 (集中管理，消滅重複代碼)
// ==========================================
const GLOBAL_SVGS = {
    // 🔗 基礎圖示
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
    
    // 📊 Mermaid 圖表工具列
    mermaidZoomIn: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
    mermaidZoomOut: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
    mermaidReset: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"></path></svg>`,
    mermaidReload: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>`,
    mermaidFull: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`,

    // 🔔 系統提示與狀態圖示 (新增收斂)
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    closeX: `<svg style="display: block;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    jumpDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: jump-arrow-bounce-down 1.5s infinite ease-in-out;"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>`,
    jumpUp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: jump-arrow-bounce-up 1.5s infinite ease-in-out;"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`,
    errorLock: `<svg class="error-lock-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem; opacity: 0.5; overflow: visible; transition: all 0.3s ease;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path class="error-lock-shackle" d="M7 11V7a5 5 0 0 1 10 0v4" style="transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: center;"></path></svg>`,
    errorAlert: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem; opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    retry: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -4px; margin-right: 6px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>`,
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
    ['MAJOR', 'HOTFIX', 'LATEST', 'FEATURE', 'NEW', 'UPDATED', 'REFACTOR', 'PATCH', 'ARCHIVED'], 
    ['WIP'], 
    ['OC'],
    ['DEV']
];

// ==========================================
// ✨ 從 CSS 動態讀取標籤顏色的魔法引擎 (Single Source of Truth)
// ==========================================
window.getStatusColorFromCSS = function(status) {
    // 建立快取，相同的標籤只會去讀取一次 CSS，效能極佳
    if (!window._statusColorCache) window._statusColorCache = {};
    if (window._statusColorCache[status]) return window._statusColorCache[status];
    
    // 建立隱藏的測試元素，套用對應的狀態
    const dummy = document.createElement('span');
    dummy.setAttribute('data-status', status);
    dummy.style.display = 'none';
    document.body.appendChild(dummy);
    
    // 從 DOM 提取 CSS 檔案中寫的 --s-color (例如會讀到 "var(--error-color)")
    const color = getComputedStyle(dummy).getPropertyValue('--s-color').trim();
    document.body.removeChild(dummy);
    
    // 如果 CSS 沒寫，預設給主題高光色
    window._statusColorCache[status] = color || 'var(--accent)';
    return window._statusColorCache[status];
};

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
        theme: currentTheme === 'dark' ? 'dark' : 'default', // (第二個地方這裡會是 theme: theme === 'dark' ? ...)
        
        // ✨ 核心修復：拔除容易算錯寬度的 'inherit'，直接給予精準的系統中文字體，讓 Mermaid 完美計算方塊寬度！
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
        
        securityLevel: 'loose'
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
// ✨ 全域防止捲軸跳動控制器 (Scroll Lock Engine)
// ==========================================
window.lockScroll = function() {
    if (document.body.style.overflow === 'hidden') return;
    document.body.style.overflow = 'hidden';
};

window.unlockScroll = function() {
    document.body.style.overflow = '';
};

// ==========================================
// ✨ 共用路徑與路由處理器 (重構優化)
// ==========================================
window.getCleanBasePath = function() {
    const basePath = window.location.pathname.replace(/index\.html$/i, '');
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
    
    const originalContent = element.innerHTML;
    const checkSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
        element.classList.add('copied');
        element.innerHTML = `${checkSvg} <span style="margin-left: 4px;">已複製</span>`;
        setTimeout(() => {
            element.classList.remove('copied');
            element.innerHTML = originalContent;
            window.isCopying = false; 
        }, 2000);
    }).catch(() => {
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
                        const actionBtn = card.querySelector('.action-btn');
                        if (actionBtn && actionBtn.innerText.includes('展開系列')) {
                            const count = isUnlocked ? proj.articles.length : proj.articles.filter(art => !art.is_hidden).length;
                            const iconWrap = actionBtn.querySelector('div');
                            actionBtn.innerHTML = '';
                            if (iconWrap) actionBtn.appendChild(iconWrap);
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
    
    // ✨ 移除原生 tooltip，改由 JS 動態生成懸浮膠囊
    img.removeAttribute('title'); 
    img.style.cursor = 'pointer';
    
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

    // ✨ 動態插入高質感的重試懸浮提示膠囊
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

    // ✨ 建立捕獲階段的點擊攔截器 (阻斷 Lightbox 開啟，優先執行重試)
    const retryHandler = function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        img.removeEventListener('click', retryHandler, true);
        
        // ✨ 動畫回饋：讓膠囊 Q 彈縮小並淡出
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
            <div class="media-error-fallback" style="width: 100%; ${aspectStyle} display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg); color: var(--muted); text-align: center; cursor: pointer; transition: all 0.3s ease;" 
                 onmouseover="this.style.backgroundColor='var(--box-bg)'; this.querySelector('.retry-text').style.color='var(--accent-2)';" 
                 onmouseout="this.style.backgroundColor='var(--bg)'; this.querySelector('.retry-text').style.color='var(--muted)';"
                 onclick="window.retryMedia(this, '${origSrc}', '${ext}', ${isVideo})">
                 
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; margin-bottom: 1rem;">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                </svg>
                <div style="font-family: 'Courier New', monospace; font-size: 1rem; font-weight: bold; letter-spacing: 0.05em; color: var(--error-color);">MEDIA_NOT_FOUND</div>
                
                <!-- ✨ 新增的互動重試文字 -->
                <div class="retry-text" style="font-size: 0.85rem; opacity: 0.8; margin-top: 0.8rem; display: flex; align-items: center; gap: 6px; transition: color 0.3s ease;">
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
    
    // 重建原本的 Media Tag
    const videoStyle = "margin: 0; border: none; box-shadow: none; width: 100%; height: auto; aspect-ratio: 16/9; background: #000; object-fit: contain; display: block; border-bottom-left-radius: 0.8rem; border-bottom-right-radius: 0.8rem;";
    
    const mediaTag = isVideo 
        ? `<video preload="metadata" controls playsinline class="md-video" style="${videoStyle}"><source src="${retrySrc}" type="video/${ext}" onerror="window.handleMediaError(this)">您的瀏覽器不支援影片標籤。</video>`
        : `<audio preload="metadata" controls class="md-audio" style="margin: 0.8rem 1.2rem; width: calc(100% - 2.4rem); border: none;"><source src="${retrySrc}" type="audio/${ext}" onerror="window.handleMediaError(this)">您的瀏覽器不支援音樂標籤。</audio>`;
        
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
            <div class="toast-x-icon" style="position: absolute; top: 5px; right: 7px; width: 32px; height: 32px; display: flex; justify-content: center; align-items: center; opacity: 0.9; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            <strong style="font-size: 1rem; letter-spacing: 0.05em; text-shadow: 0 2px 4px rgba(0,0,0,0.2); padding-right: 1.5rem;">${title}</strong>
            <span style="opacity: 0.95; font-weight: 600;">${msg}</span>
            <span style="opacity: 0.85; font-size: 0.8rem;">${subMsg}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // 4. 進場動畫
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 50);

    const toastBox = toast.firstElementChild;
    const xIcon = toast.querySelector('.toast-x-icon');

    // 5. Hover 發光與 X 旋轉特效
    toastBox.onmouseenter = () => { 
        toastBox.style.boxShadow = `0 0 25px ${shadowColor}, 0 0 10px rgba(255,255,255,0.2)`; 
        if (xIcon) xIcon.style.transform = 'rotate(90deg) scale(1.1)';
    };
    toastBox.onmouseleave = () => { 
        toastBox.style.boxShadow = `0 4px 20px ${shadowColor}`; 
        if (xIcon) xIcon.style.transform = 'rotate(0deg) scale(1)';
    };

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
    
    bar.className = `sys-progress-bar ${type === 'vertical' ? 'is-vertical-bar' : 'is-top-bar'}`;
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
        if (progress === 100) bar.classList.add('is-complete');
        else bar.classList.remove('is-complete');

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
        if (state.isDomMode) return; 
        
        // ✨ 1. 更新當下狀態陣列裡的網址，加上時間戳防快取
        const currentItem = state.images[state.currentIndex];
        const origSrc = currentItem.src.split('?retry=')[0].split('&retry=')[0];
        const sep = origSrc.includes('?') ? '&' : '?';
        currentItem.src = origSrc + sep + 'retry=' + new Date().getTime();
        
        // ✨ 2. 直接呼叫 update 引擎！它會幫我們完美處理所有的 CSS 狀態清除、重繪與 onerror 綁定
        window.updateLightboxView();
        return;
    } else if (action === 'new-tab') {
        if (state.isDomMode) return;
        
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isPWA) {
            // ✨ PWA 模式下使用與 PDF 相同的 Fetch Blob 機制開啟
            fetch(target.src)
                .then(res => res.blob())
                .then(blob => {
                    const blobUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = blobUrl;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(blobUrl);
                    }, 500);
                })
                .catch(err => {
                    console.error('Blob 新分頁穿透失敗:', err);
                    window.open(target.src, '_blank');
                });
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
    if (toolbox) toolbox.classList.toggle('is-open');
};

window.closeLightbox = function() {
    const lightboxModal = document.getElementById('lightbox-modal');
    const toolbox = document.getElementById('lightbox-toolbox');
    if (lightboxModal) {
        lightboxModal.classList.remove('is-active');
        if (toolbox) toolbox.classList.remove('is-open');

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
    
    // 取得真實檔名
    const url = img.src;
    const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0] || 'download_image.jpg';

    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    // ✨ 非 PWA 才觸發震動與 Toast
    if (!isPWA) {
        window.triggerHaptic('light');
        if (window.showSystemToast) {
            const downloadTitle = `<span style="display: inline-flex; align-items: center; gap: 6px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: jump-arrow-bounce-down 1.5s infinite ease-in-out;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>下載中</span>`;
            window.showSystemToast(downloadTitle, '正在取得檔案，請稍候...', fileName, 2000, 'success');
        }
    }

    try {
        // ✨ 改用與 PDF 相同的 Fetch Blob 引擎，破解 PWA 原生限制
        const response = await fetch(url);
        if (!response.ok) throw new Error("網路連線失敗");
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        }, 100);
        
        if (!isPWA) window.triggerHaptic('success');
    } catch (error) {
        console.error("底層下載失敗，改用新分頁開啟:", error);
        window.open(url, '_blank'); 
    }
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
            
            // ✨ 非 PWA 才觸發震動與成功 Toast
            const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
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

    // 2. 觸控裝置偵測 (用於 CSS 的 is-touch-device 標籤)
    const isTouchDevice = (('ontouchstart' in window) || 
                           (navigator.maxTouchPoints > 0) || 
                           (navigator.msMaxTouchPoints > 0));
    if (isTouchDevice) {
        document.body.classList.add('is-touch-device');
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
// ✨ 輔助函數：渲染 PDF 嵌入框架 (改進版：全面以觸控裝置為判斷依據)
// ==========================================
function renderPDFIframe(href, altText) {
    let customHeight = "600px";
    const hMatch = href.match(/[?&]h=(\d+)/i);
    if (hMatch) customHeight = hMatch[1] + "px";
    
    // ✨ 只要是觸控裝置 (手機/平板/PWA)，點擊就彈出安全操作面板
    const mobileClickHandler = `
        event.stopPropagation();
        window.showPdfActionModal('${href}', '${altText || "Document.pdf"}');
    `;

    return `
    <!-- ✨ 修改 1：將 overflow: hidden 改為 visible，允許 Tooltip 突破邊界顯示 -->
    <div class="pdf-container" style="margin: 2rem 0; border: 1px solid var(--card-border); border-radius: 0.8rem 0.8rem 0 0; overflow: visible; box-shadow: 0 4px 15px var(--shadow-base); background: var(--bg); transition: transform 0.2s ease;" 
        onclick="if(document.body.classList.contains('is-touch-device')) { ${mobileClickHandler} }"
        onpointerdown="if(document.body.classList.contains('is-touch-device')) this.style.transform='scale(0.98)';"
        onpointerup="this.style.transform='none';"
        onpointerleave="this.style.transform='none';">
        
        <!-- ✨ 修改 2：加上 position: relative; z-index: 10; 確保 Tooltip 蓋過 iframe，並補上頂部圓角 -->
        <div style="position: relative; z-index: 10; background: var(--glass-bg); padding: 0.6rem 1rem; border-bottom: 1px solid var(--card-border); border-radius: 0.8rem 0.8rem 0 0; font-family: monospace; font-size: 0.9rem; color: var(--muted); display: flex; justify-content: space-between; align-items: center;">
            
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--accent);">
                ${GLOBAL_SVGS.docIcon}
                <span style="transform: translateY(1px);">${altText || 'Document.pdf'}</span>
            </div>
            
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <!-- ✨ 移除 desktop-only，讓手機/平板都能看見重整按鈕 -->
                <button class="mermaid-btn" data-tooltip="重新整理" onclick="event.stopPropagation(); const ifr = this.closest('.pdf-container').querySelector('iframe'); const orig = ifr.src; ifr.src=''; setTimeout(() => ifr.src = orig, 100);">
                    ${GLOBAL_SVGS.mermaidReload}
                </button>
                
                <!-- 觸控裝置隱藏這條分割線 -->
                <div class="desktop-only" style="width: 1px; height: 16px; background: var(--card-border); margin: 0 2px; align-self: center;"></div>
                
                <!-- 觸控裝置隱藏「新分頁開啟」按鈕 -->
                <button class="mermaid-btn desktop-only" data-tooltip="新分頁開啟" onclick="event.stopPropagation(); window.open('${href}', '_blank');">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </button>
            </div>
        </div>
        <iframe class="pdf-iframe" src="${href}" width="100%" height="${customHeight}" style="border: none; display: block; background: var(--bg);">您的瀏覽器不支援 PDF 嵌入。</iframe>
        <div class="pdf-mobile-placeholder" style="display: none; padding: 4rem 1rem; text-align: center; color: var(--muted); flex-direction: column; align-items: center; gap: 1.2rem;">
            <span style="font-size: 1.05rem; letter-spacing: 0.05em;">點擊下方按鈕以檢視或下載 PDF 檔案</span>
            <span style="color: var(--accent); font-weight: 600; display: flex; align-items: center; gap: 8px; background: var(--tag-bg); padding: 0.6rem 1.2rem; border-radius: 2rem; cursor: pointer;">
                ${GLOBAL_SVGS.newTab} 點擊開啟 PDF 操作選單
            </span>
        </div>
    </div>`;
}

// ==========================================
// ✨ 輔助函數：渲染影音標籤 (Video / Audio)
// ==========================================
function renderMediaTag(cleanMediaUrl, ext, isVideo, posterUrl, altText, imgTitle) {
    const displayTitle = altText || imgTitle || (isVideo ? '影片播放' : '音樂播放');
    const iconSvg = isVideo ? GLOBAL_SVGS.videoIcon : GLOBAL_SVGS.audioIcon;
    const posterAttr = (isVideo && posterUrl) ? ` poster="${posterUrl}"` : '';
    const videoStyle = "margin: 0; border: none; box-shadow: none; width: 100%; height: auto; aspect-ratio: 16/9; background: #000; object-fit: contain; display: block;";

    const mediaTag = isVideo 
        ? `<video preload="metadata" controls playsinline${posterAttr} class="md-video" style="${videoStyle}"><source src="${cleanMediaUrl}" type="video/${ext}" onerror="window.handleMediaError(this)">您的瀏覽器不支援影片標籤。</video>`
        : `<audio preload="metadata" controls class="md-audio" style="margin: 0.8rem 1.2rem; width: calc(100% - 2.4rem); border: none;"><source src="${cleanMediaUrl}" type="audio/${ext}" onerror="window.handleMediaError(this)">您的瀏覽器不支援音樂標籤。</audio>`;

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
        <div class="media-container-header">
            <div style="font-family: monospace; font-size: 0.9rem; font-weight: 600; color: var(--accent); display: flex; align-items: center; gap: 8px;">
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
    
    if (!href) return '';

    // 1. 攔截 PDF
    const cleanUrlForCheck = href.split('?')[0].split('#')[0];
    if (cleanUrlForCheck.match(/\.pdf$/i)) return renderPDFIframe(href, altText);

    // 2. 攔截影音
    const decodedHref = href.replace(/%23/g, '#');
    let cleanMediaUrl = decodedHref;
    let posterUrl = '';
    if (decodedHref.includes('#poster=')) {
        const parts = decodedHref.split('#poster=');
        cleanMediaUrl = parts[0]; posterUrl = parts[1];
    }
    
    const pureUrlForExt = cleanMediaUrl.split('?')[0];
    const isVideo = pureUrlForExt.match(/\.(mp4|webm|ogg)$/i);
    const isAudio = pureUrlForExt.match(/\.(mp3|wav)$/i);
    
    if (isVideo || isAudio) {
        const ext = pureUrlForExt.split('.').pop().toLowerCase();
        return renderMediaTag(cleanMediaUrl, ext, isVideo, posterUrl, altText, imgTitle);
    }

    // 3. 一般圖片
    let srcUrl = href, fullUrl = href;
    if (href.includes('#full=')) {
        const parts = href.split('#full=');
        srcUrl = parts[0]; fullUrl = parts[1];
    }

    const imgTag = `<img src="${srcUrl}" data-full="${fullUrl}" alt="${altText || ''}" class="is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">`;
    const zoomBtnHtml = `<button class="zoom-btn" data-tooltip="放大檢視" onclick="window.openLightbox(this, event)">${GLOBAL_SVGS.zoomIcon}</button>`;
    const floatingZoomBtnHtml = `<button class="zoom-btn floating" data-tooltip="放大檢視" onclick="window.openLightbox(this, event)">${GLOBAL_SVGS.zoomIcon}</button>`;

    if (imgTitle) {
        let figureClass = (altText === 'float-right' || altText === 'float-left') ? ` class="${altText}"` : '';
        return `<figure${figureClass}>${imgTag}<figcaption>${imgTitle}${zoomBtnHtml}</figcaption></figure>`;
    } else {
        if (altText === 'icon' || altText === 'badge') return imgTag;
        let figureClass = 'no-caption' + ((altText === 'float-right' || altText === 'float-left') ? ` ${altText}` : '');
        return `<figure class="${figureClass}">${imgTag}${floatingZoomBtnHtml}</figure>`;
    }
};

// 2. ✨ 攔截 Mermaid 程式碼區塊與一般程式碼區塊
const originalCodeRenderer = renderer.code.bind(renderer);
renderer.code = function(token_or_code, language, isEscaped) {
    const lang = typeof token_or_code === 'object' ? token_or_code.lang : language;
    
    // 抓取「完全沒有處理過」的原文
    let rawText = typeof token_or_code === 'object' ? token_or_code.text : token_or_code;

    if (lang && lang.startsWith('mermaid')) {
        
        // ✨ 魔法 1：從快取讀取獨立檔案中的全域樣式並注入
        const globalMermaidClasses = window.cachedMermaidStyles || '';
        if (globalMermaidClasses) {
            // 偵測如果是流程圖 (graph 或 flowchart)，就在宣告後自動換行並注入樣式
            rawText = rawText.replace(/^(graph\s+[A-Za-z]+|flowchart\s+[A-Za-z]+)/im, `$1\n${globalMermaidClasses}\n`);
        }

        // 將注入完樣式的原文編碼並鎖在 data-original-text 裡當作備份
        const encodedText = encodeURIComponent(rawText);
        
        // 使用翻譯蒟蒻，將原文裡的 var() 與 rgba 轉成 Hex 色碼
        const processedText = window.processMermaidCssVars(rawText);

        let chartTitle = "流程圖 (Flowchart)";
        const fullLang = typeof token_or_code === 'object' ? (token_or_code.lang || language) : (language || '');
        const titleMatch = fullLang.match(/\[(.*?)\]/);
        
        if (titleMatch && titleMatch[1]) {
            chartTitle = titleMatch[1];
        } else if (window._lastMarkdownHeadings && window._lastMarkdownHeadings.length > 0) {
            chartTitle = window._lastMarkdownHeadings[window._lastMarkdownHeadings.length - 1];
        }

        return `
        <div class="mermaid-container" data-zoom="1" data-x="0" data-y="0">
            <div class="mermaid-toolbar">
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
                    
                    <!-- ✨ 這條線會被觸控裝置隱藏 (解決圖片中多出來的那條線) -->
                    <div class="desktop-only" style="width: 1px; height: 16px; background: var(--card-border); margin: 0 2px; align-self: center;"></div>
                    
                    <!-- 重新整理按鈕 -->
                    <button class="mermaid-btn" onclick="window.reloadMermaid(this)" data-tooltip="重新整理">${GLOBAL_SVGS.mermaidReload}</button>
                    
                    <button class="mermaid-btn desktop-only" data-tooltip="下載" onclick="window.downloadMermaidPNG(this)">${GLOBAL_SVGS.download}</button>
                    
                    <!-- ✨ 這條線沒有 desktop-only，所以在觸控裝置上會完美保留在「重整」與「全螢幕」之間 -->
                    <div style="width: 1px; height: 16px; background: var(--card-border); margin: 0 2px; align-self: center;"></div>
                    
                    <button class="mermaid-btn" onclick="window.fullscreenMermaid(this)" data-tooltip="放大檢視">${GLOBAL_SVGS.mermaidFull}</button>
                </div>
            </div>
            <div class="mermaid-wrapper">
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

    const copyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

    // ✨ 核心修復：將語言與檔案名稱合併，中間加個分隔線，徹底解決重疊！
    const labelContent = fileName 
        ? `${cleanLang} <span style="opacity: 0.3; margin: 0 6px;">|</span> <span style="text-transform: none; color: var(--accent-2);">${fileName}</span>` 
        : cleanLang;

    return `
    <div class="code-block-wrapper" style="position: relative;">
        <!-- 設定 max-width 避免檔名太長蓋到複製按鈕，過長會自動變成 ... -->
        <div class="code-lang-label" style="max-width: calc(100% - 100px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${fileName || cleanLang}">${labelContent}</div>
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
    // 打勾圖示 SVG
    const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

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
    let text = typeof token_or_text === 'object' ? token_or_text.text : token_or_text;
    const depth = typeof token_or_text === 'object' ? token_or_text.depth : level;
    
    // ✨ 核心魔法：偵測標題文字後面是否帶有 {#自訂ID}
    let customId = null;
    const idMatch = text.match(/\s+\{#([^}]+)\}$/);
    
    if (idMatch) {
        customId = idMatch[1].trim();
        // 把 "{#自訂ID}" 從標題文字中剔除，讓畫面上跟右上角目錄只顯示乾淨的標題
        text = text.replace(/\s+\{#[^}]+\}$/, '').trim(); 
    }

    // 將最乾淨的標題文字存入全域，給 Mermaid 抓取當作圖表預設標題
    window._lastMarkdownHeadings.push(text.replace(/<[^>]+>/g, '')); // 順手剝除 HTML 標籤
    
    // 如果有自訂 ID 就用自訂的，沒有的話就沿用預設的轉換邏輯
    const id = customId || text.toLowerCase().replace(/\s+/g, '-').replace(/<[^>]+>/g, '');
    
    // ✨ 終極魔法：給所有標題 ID 加上 "md-sys-" 前綴！
    // 這樣瀏覽器在網址列看到 #target 時，會找不到 id="target" 的元素，就會放棄原生跳躍。
    // 而我們的 JS 引擎很聰明，會自動加上前綴去找它，完美接管捲動權權！
    return `<h${depth} id="md-sys-${id}" data-raw-title="${encodeURIComponent(text)}">${text}</h${depth}>`;
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
// ✨ 新增：動態高光螢光筆 (雙層接力無縫跑馬燈)
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
        // 拔除 getStatusColorFromCSS，改用 data-status 屬性
        const statusAttr = badge ? ` data-status="${badge.toUpperCase()}"` : '';
        const defaultStyle = badge ? '' : ' style="--dynamic-glow: var(--accent);"';
        const displayText = badge ? badge : 'HIGHLIGHT'; 
        
        const repeatedText = `${displayText} • `.repeat(20);
        const duration = Math.max(20, repeatedText.length * 0.4); 
        
        const bgHtml = `<span class="marquee-text-track" style="--marquee-duration: ${duration}s;" aria-hidden="true"><span class="marquee-part">${repeatedText}</span><span class="marquee-part">${repeatedText}</span></span>`;
        
        return `<span class="md-highlight-text"${statusAttr}${defaultStyle}>${bgHtml}<span class="text-content">${this.parser.parseInline(token.tokens)}</span></span>`;
    }
};

// ==========================================
// ✨ 新增：區塊型高光透視框 (支援多行與內部 Markdown)
// ==========================================
const highlightBlockExtension = {
    name: 'highlightBlock',
    level: 'block',
    start(src) { return src.match(/^:::\s*highlight/)?.index; },
    tokenizer(src, tokens) {
        // 匹配 ::: highlight[標籤] ... ::: 的多行語法
        const rule = /^:::\s*highlight(?:\[(.*?)\])?\n([\s\S]*?)\n:::/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'highlightBlock',
                raw: match[0],
                badgeText: match[1] || '',
                text: match[2],
                // 這裡改用 blockTokens，讓框框裡面也能寫標題、清單、粗體！
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
// ✨ 新增：日文漢字注音擴充 (Ruby Furigana)
// 語法：^^漢字(かんじ)^^
// ==========================================
const rubyExtension = {
    name: 'ruby',
    level: 'inline',
    start(src) { return src.match(/\^\^/)?.index; },
    tokenizer(src, tokens) {
        // 匹配 ^^漢字(注音)^^ 的格式
        const rule = /^\^\^([^()]+)\(([^()]+)\)\^\^/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'ruby',
                raw: match[0],
                kanji: match[1],
                furigana: match[2]
            };
        }
    },
    renderer(token) {
        // 轉換為標準的 HTML ruby 標籤
        return `<ruby>${token.kanji}<rt>${token.furigana}</rt></ruby>`;
    }
};

// ==========================================
// ✨ 新增：摺疊區塊 (Collapsible Details / Accordion) 擴充
// 語法：:::details[標題] 內容 :::
// ==========================================
const detailsBlockExtension = {
    name: 'detailsBlock',
    level: 'block',
    start(src) { return src.match(/^:::\s*details/)?.index; },
    tokenizer(src, tokens) {
        const rule = /^:::\s*details(?:\[(.*?)\])?\n([\s\S]*?)\n:::/;
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

// ⚠️ 記得把 detailsBlockExtension 加進陣列裡！
marked.use({ 
    extensions: [spoilerExtension, highlightExtension, highlightBlockExtension, rubyExtension, detailsBlockExtension], 
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
                theme: theme === 'dark' ? 'dark' : 'default',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
                securityLevel: 'loose' 
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

                // 處理光暈特效動畫重播
                if (targetSection.animationTimer) clearTimeout(targetSection.animationTimer);
                
                targetSection.id = '';
                targetSection.classList.remove('force-target');
                void targetSection.offsetWidth; 
                
                targetSection.id = targetId;
                targetSection.classList.add('force-target');
                
                targetSection.animationTimer = setTimeout(() => {
                    targetSection.classList.remove('force-target');
                }, 3000);

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
        // siteTitle.title = "System Override..."; 
        window.isWhispering = false;

        siteTitle.addEventListener('click', async () => {
            if (window.isWhispering) return; 
            
            clickCount++;
            clearTimeout(clickTimer);
            
            if (clickCount >= 5) {
                window.isWhispering = true; 
                clickCount = 0; 
                
                // ✨ 核心魔法：切換系統覆寫狀態，強制顯現/隱藏機密檔案！
                document.body.classList.toggle('system-override-active');
                
                // ✨ 呼叫全域重刷引擎，統一更新所有卡片數字與版面
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
                        // 依照解鎖狀態切換日誌標題
                        const isActive = document.body.classList.contains('system-override-active');
                        const statusText = isActive ? "[ SYSTEM_OVERRIDE_ENABLED : CLASSIFIED_DATA_UNLOCKED ]" : "[ SYSTEM_LOG : KOTOBA_NO_BOX ]";
                        const textColor = isActive ? "var(--error-color)" : "var(--accent-2)";
                        
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
        
        // 1. 處理「一般狀態」的過期 (例如 NEW, UPDATED 超過期限就消失)
        const evaluateStatus = (val) => {
            if (val === true || String(val).toLowerCase() === 'true') return true; 
            if (typeof val === 'string' && /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(val)) {
                const tagDate = new Date(val.replace(/-/g, '/')).getTime();
                return !isNaN(tagDate) && (nowMs - tagDate <= expireMs);
            }
            return !!val; 
        };

        // ✨ 1.5 處理「機密隱藏」的解封 (例如 HIDDEN，時間還沒到就隱藏，時間到了就公開)
        const evaluateHidden = (val) => {
            if (val === true || String(val).toLowerCase() === 'true') return true; 
            if (typeof val === 'string' && /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(val)) {
                const unsealDate = new Date(val.replace(/-/g, '/')).getTime();
                // 只要現在時間「小於」解封日，就保持隱藏 (true)
                // 到了解封日當天或之後，就變成公開 (false)
                return !isNaN(unsealDate) && (nowMs < unsealDate);
            }
            return !!val; 
        };

        // 2. 處理「標籤陣列」的過期 (例如 "tags": ["NEW:2026-08-14"])
        const parseAndFilterTags = (tags) => {
            if (!tags) return [];
            let validTags = [];
            tags.forEach(tag => {
                const match = tag.match(/^(NEW|UPDATED|LATEST|FEATURE):(\d{4}[-/]\d{2}[-/]\d{2})$/i);
                if (match) {
                    const baseTag = match[1].toUpperCase();
                    const tagDate = new Date(match[2].replace(/-/g, '/')).getTime();
                    if (!isNaN(tagDate) && (nowMs - tagDate <= expireMs)) {
                        validTags.push(baseTag);
                    }
                } else {
                    validTags.push(tag); 
                }
            });
            return validTags;
        };

       // 智慧狀態推導與全域標籤冒泡
        const flatStatusList = window.STATUS_LIST.flat(); 
        projects.forEach(p => {
            ['is_new', 'is_updated', 'is_wip', 'is_archived', 'pinned'].forEach(k => {
                if (p[k] !== undefined) p[k] = evaluateStatus(p[k]);
            });
            if (p.is_hidden !== undefined) p.is_hidden = evaluateHidden(p.is_hidden);
            p.tags = parseAndFilterTags(p.tags);

            let isAllUpdated = p.is_updated;
            let isPublicUpdated = p.is_updated;

            if (p.articles && p.articles.length > 0) {
                p.articles.forEach(art => {
                    ['is_new', 'is_updated', 'is_wip', 'is_archived', 'pinned'].forEach(k => {
                        if (art[k] !== undefined) art[k] = evaluateStatus(art[k]);
                    });
                    if (art.is_hidden !== undefined) art.is_hidden = evaluateHidden(art.is_hidden);
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
            const menuDescHtml = cat.meta ? `<span style="display:block; color:var(--muted); font-size:0.95rem; font-family:sans-serif; text-transform:none; margin-top:0.5rem; letter-spacing:0;">${cat.meta}</span>` : '';
            
            dynamicNav.innerHTML += `
            <li style="margin: 2.5rem 0;">
                <a href="#${cat.id}-section" class="nav-item" style="margin:0; line-height:1.1; display:inline-block;">${cat.title}</a>
                ${menuDescHtml}
            </li>`;

            const sectionMetaHtml = cat.meta ? `<span style="font-size: 1.1rem; color: var(--muted); font-weight: normal; margin-left: 0.5rem;">- ${cat.meta}</span>` : '';
            const sectionDescHtml = cat.description ? `<p style="color: var(--muted); margin-top: 0.2rem; margin-bottom: 0; line-height: 1.6; max-width: 800px; font-size: 0.95rem;">${cat.description}</p>` : '';
            const sectionImageHtml = cat.cover_image ? `<img src="${cat.cover_image}" alt="icon" loading="lazy" class="is-loading" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)" style="width: 72px; height: 72px; border-radius: 16px; object-fit: cover; border: 1px solid var(--card-border); box-shadow: 0 4px 15px var(--shadow-base); flex-shrink: 0;">` : '';

            // ✨ 如果 JSON 裡有設定 watermark_url，就轉成 CSS 變數注入到 section 中
            const watermarkStyle = cat.watermark_url ? ` style="--custom-watermark: url('${cat.watermark_url}');"` : '';

            portfolioSections.innerHTML += `
            <section id="${cat.id}-section"${watermarkStyle}>
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.8rem;">
                <div style="flex: 1;">
                    <h2 style="display: flex; align-items: baseline; flex-wrap: wrap; margin-bottom: 0;">${cat.title}${sectionMetaHtml}</h2>
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
                    
                    // ✨ 核心修復：首頁卡片上的數字也同步扣除隱藏文章
                    const visibleCount = data.articles.filter(art => !art.is_hidden).length;
                    
                    // 1. 如果有子文章 (套用資料夾開關 SVG)
                    actionText = `<div class="action-btn" style="margin-top: 1.2rem; color: var(--accent); font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; transition: color 0.2s ease;">
                        <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
                            ${GLOBAL_SVGS.folderClosed}
                            ${GLOBAL_SVGS.folderOpen}
                        </div>展開系列 (${visibleCount})</div>`;
                } else if (data.link) {
                    // 2. 如果是外部連結 (套用外部連結與箭頭 SVG)
                    actionText = `<div class="action-btn" style="margin-top: 1.2rem; color: var(--accent); font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; transition: color 0.2s ease;">
                        ${GLOBAL_SVGS.linkLg} 
                        前往外部專案 <span class="action-arrow" data-dir="up-right" style="display: flex; align-items: center; transition: transform 0.2s ease;">
                        ${GLOBAL_SVGS.arrowUpRight}</span></div>`;
                } else {
                    card.onclick = () => { if (window.currentActiveTag) window.clearFilter(); };
                    card.addEventListener('mouseenter', () => { card.style.cursor = window.currentActiveTag ? 'pointer' : 'default'; });
                }

                const cardMetaHtml = data.meta ? `<span style="font-size: 0.95rem; color: var(--muted); font-weight: normal; margin-left: 0.5rem;">- ${data.meta}</span>` : '';
                const cardDescHtml = data.description ? `<p style="color: var(--text); font-size: 0.95rem; line-height: 1.6; margin-top: 0.5rem; margin-bottom: 1rem;">${data.description}</p>` : '';
                const cardImageHtml = data.cover_image ? `<img src="${data.cover_image}" alt="cover" loading="lazy" class="is-loading" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)" style="width: 56px; height: 56px; border-radius: 12px; object-fit: cover; border: 1px solid var(--card-border); flex-shrink: 0; background: var(--bg);">` : '';                
                const absolutePinHtml = data.pinned ? `<div class="card-pin">${GLOBAL_SVGS.pin}</div>` : '';
                // ✨ 新增：機密圖釘 HTML
                const absoluteSecretHtml = data.is_hidden ? `<div class="card-secret-pin">${GLOBAL_SVGS.secretPin}</div>` : '';

                let metaParts = [];
                if (data.date) metaParts.push(data.date);
                if (data.version) metaParts.push(`v${data.version}`); 
                const cardDateHtml = metaParts.length > 0 ? `<div style="position: absolute; top: 0.2rem; left: 1.6rem; font-family: monospace; font-size: 0.72rem; font-weight: 600; color: var(--accent); opacity: 0.6; letter-spacing: 0.05em;">[${metaParts.join(' • ')}]</div>` : '';

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
                
                // 1. 向右滾動 (下一張置中)
                hintRight.addEventListener('click', () => {
                    // ✨ 核心修復：加上 .filter(card => card.offsetWidth > 0)，直接剔除隱形的機密卡片
                    const cards = Array.from(grid.querySelectorAll('.card')).filter(card => card.offsetWidth > 0); 
                    if (!cards.length) return;

                    const containerCenter = grid.getBoundingClientRect().left + grid.clientWidth / 2;
                    
                    let targetCard = null;
                    for (const card of cards) {
                        const cardCenter = card.getBoundingClientRect().left + card.clientWidth / 2;
                        if (cardCenter > containerCenter + 20) { 
                            targetCard = card;
                            break;
                        }
                    }
                    
                    if (targetCard) {
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                });

                // 2. 向左滾動 (上一張置中)
                hintLeft.addEventListener('click', () => {
                    // ✨ 核心修復：加上 .filter(card => card.offsetWidth > 0)
                    const cards = Array.from(grid.querySelectorAll('.card')).filter(card => card.offsetWidth > 0);
                    if (!cards.length) return;

                    const containerCenter = grid.getBoundingClientRect().left + grid.clientWidth / 2;
                    
                    let targetCard = null;
                    for (let i = cards.length - 1; i >= 0; i--) {
                        const card = cards[i];
                        const cardCenter = card.getBoundingClientRect().left + card.clientWidth / 2;
                        if (cardCenter < containerCenter - 20) { 
                            targetCard = card;
                            break;
                        }
                    }
                    
                    if (targetCard) {
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                });
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

        const retrySvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -4px; margin-right: 6px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>`;
        
        portfolioSections.innerHTML = `
            <div class="error-container" style="flex-direction: column; gap: 0.8rem;">
                <span class="error-text" onclick="this.style.opacity='0.5'; this.innerHTML='>_ REBOOTING...'; window.location.reload();">
                    ${retrySvg} ${errorTitle}
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
        screen.style.cssText = `position:fixed; inset:0; background:var(--bg); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--accent); opacity:${immediate ? '1' : '0'}; transition:opacity 0.3s ease; cursor: wait;`;
        document.body.appendChild(screen);
        
        if (!immediate) {
            setTimeout(() => { screen.style.opacity = '1'; }, 10);
        }
    }
    
    // ✨ 加上了 reboot-title class，方便消失前更改文字
    screen.innerHTML = `
        <div class="reboot-title" style="font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; letter-spacing: 0.1em; text-shadow: 0 0 10px var(--glow-1); transition: color 0.3s ease, text-shadow 0.3s ease;">>_ ${title}</div>
        <div style="font-family: 'Courier New', monospace; font-size: 0.9rem; color: var(--muted); margin-bottom: 2rem;">Local: ${localV} | Remote: ${remoteV}</div>
        <div class="loading-text" style="font-size: 1.1rem; transition: color 0.3s ease;">${msg}</div>
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
        document.body.style.overflow = '';
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
        document.body.style.overflow = '';

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
                hideSystemRebootScreen(false); 
                loadProjects(); 
                if (sysIntent === 'changelog') setTimeout(() => { if (window.showChangelogModal) window.showChangelogModal(true); }, 600); 
                setTimeout(() => { window.showSystemToast('>_ UPDATE_FAILED', 'CDN_CACHE_DELAY_DETECTED', `已還原為安全狀態`, 12000, 'error'); }, 1000);
                return;
            }
            
            sessionStorage.setItem('sys_reboot_count', (rebootCount + 1).toString());
            sessionStorage.setItem('sys_is_rebooting', 'true');
            sessionStorage.setItem('sys_expected_version', remoteVersion);

            // 根據不同更新原因，顯示不同的終端機過場文字
            const screenTitle = rebootReason === 'SYS_UPDATING' ? 'SYSTEM_VERSION_MISMATCH' : 'CONTENT_SYNC_REQUIRED';
            showSystemRebootScreen(screenTitle, CONFIG.VERSION, remoteVersion, rebootReason, isRebooting);
            
            setTimeout(() => {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('v', new Date().getTime());
                window.location.replace(newUrl.toString());
            }, 1800);
            
            return; 
        } else {
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
});

// === 4. 索引式 Markdown Modal 邏輯 ===
const modalOverlay = document.getElementById('md-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');

if (!window.modalBodyObserver) {
    window.modalBodyObserver = new ResizeObserver(() => {
        const modalContainer = document.querySelector('.modal-content');
        if (modalContainer && modalContainer.style.height && modalContainer.style.height.includes('px')) {
            const lockedHeight = modalContainer.style.height;
            const lockedTransition = modalContainer.style.transition;
            
            modalContainer.style.transition = 'none';
            modalContainer.style.height = '';
            const realHeight = modalContainer.offsetHeight;
            
            modalContainer.style.height = lockedHeight;
            if (Math.abs(parseInt(lockedHeight) - realHeight) > 2) {
                modalContainer.style.transition = lockedTransition;
                modalContainer.style.height = realHeight + 'px';
            } else {
                modalContainer.style.transition = lockedTransition;
            }
        }
        
        // ✨ 核心升級：只要內文高度改變 (包含摺疊區塊開關、圖片載入撐開版面)
        // 就主動觸發一個捲動事件，強迫進度條重新計算正確的百分比！
        if (modalContainer) {
            modalContainer.dispatchEvent(new Event('scroll'));
        }
        
        // 如果有直書模式的區塊，也一併推動進度條更新
        const verticalWrappers = document.querySelectorAll('.vertical-wrapper');
        if (verticalWrappers.length > 0) {
            verticalWrappers.forEach(w => w.dispatchEvent(new Event('scroll')));
        }
    });
    window.modalBodyObserver.observe(modalBody);
}

// ✨ 新增 animateTopBar 參數（預設為 true，兼容其他原本呼叫它的彈窗）
function switchModalContent(updateDOMCallback, afterUpdateCallback = null, animateTopBar = true) {
    const isModalOpen = modalOverlay.classList.contains('active');
    const topLeft = document.getElementById('modal-top-left');
    const tocMount = document.getElementById('toc-mount-point');
    const modalContainer = document.querySelector('.modal-content');
    
    if (window.indexScrollHandler && modalContainer) {
        modalContainer.removeEventListener('scroll', window.indexScrollHandler);
        window.indexScrollHandler = null;
    }
    const jumpToast = document.getElementById('new-jump-toast');
    if (jumpToast) {
        jumpToast.classList.remove('is-visible');
    }

    if (isModalOpen) {
        const currentHeight = modalContainer.offsetHeight; 
        modalContainer.style.height = currentHeight + 'px';

        modalBody.classList.add('content-fade-out');
        
        // ✨ 如果判斷需要動畫，才為頂端目錄列加上 fade-out 效果
        if (animateTopBar) {
            if (topLeft) topLeft.classList.add('content-fade-out');
            if (tocMount) tocMount.classList.add('content-fade-out');
        }
        
        setTimeout(() => {
            modalContainer.style.transition = 'none'; 
            updateDOMCallback();
            void modalBody.offsetHeight; 
            
            modalContainer.style.height = ''; 
            const newHeight = modalContainer.offsetHeight;
            modalContainer.style.height = currentHeight + 'px';
            void modalContainer.offsetHeight; 
            modalContainer.style.transition = ''; 
            
            requestAnimationFrame(() => {
                modalContainer.style.height = newHeight + 'px';
                
                // ✨ 在畫面還是透明時（fade-in 動畫前）執行捲軸跳轉，實現 0 延遲無縫切換
                if (afterUpdateCallback) afterUpdateCallback();

                modalBody.classList.remove('content-fade-out'); 
                
                // ✨ 同步判斷移除
                if (animateTopBar) {
                    if (topLeft) topLeft.classList.remove('content-fade-out');
                    if (tocMount) tocMount.classList.remove('content-fade-out');
                }

                setTimeout(() => { modalContainer.style.height = ''; }, 320); 
            });
        }, 120); 
    } else {
        updateDOMCallback();
        // ✨ 如果是第一次打開，確保在 DOM 更新後立刻定位
        if (afterUpdateCallback) afterUpdateCallback();
        
        modalBody.classList.remove('content-fade-out');
        if (topLeft) topLeft.classList.remove('content-fade-out');
        if (tocMount) tocMount.classList.remove('content-fade-out');
        
        // ✨ 彈窗首次開啟時，強制校正視窗座標，防漏底！
        if (window.adjustModalViewports) window.adjustModalViewports();
    }
}

// ==========================================
// 打開該專案的「目錄頁面」
// ==========================================
window.openProjectIndex = function(projectId, restoreScroll = false) {
    window.isRendering = false; 
    window.historyStack = []; 

    switchModalContent(
        () => {
            const modalContainer = document.querySelector('.modal-content');
            
            document.querySelector('.modal-top-bar').classList.remove('is-index-mode');
            document.getElementById('toc-mount-point').innerHTML = ``;

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

            const cleanPath = window.getCleanBasePath();
            const spaUrl = `${window.location.origin}${cleanPath}?p=${projectId}`;
            window.history.replaceState({ path: spaUrl }, '', spaUrl);
            const shareUrl = `${window.location.origin}${cleanPath}api/${projectId}/index.html`;

            // 2. 將目錄標題與功能按鈕直接注入 modal-top-left
            document.getElementById('modal-top-left').innerHTML = `
                <div class="index-header-container">
                    <h1 class="index-header-title">${proj.title} - 目錄</h1>
                    <div class="index-header-actions">
                        <!-- ✨ 使用 visibleCount 替換掉原本的 proj.articles.length -->
                        <span class="article-count-badge">共 ${visibleCount} 篇</span>
                        <button id="toggle-sort-btn" class="share-link-btn sm">
                            <svg class="sort-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path class="sort-arr-left" d="M 4 9 L 9 4 L 9 20"></path><path class="sort-arr-right" d="M 20 15 L 15 20 L 15 4"></path></svg>
                            <span id="sort-btn-text" style="margin-left: 4px;"></span>
                        </button>
                        <button class="share-link-btn sm" id="index-share-btn">
                            ${GLOBAL_SVGS.link} <span style="margin-left: 4px;">複製連結</span>
                        </button> 
                    </div>
                </div>
            `;
            
            modalBody.innerHTML = `
                <div id="article-list-container" style="transition: opacity 0.2s ease;"></div>
            `;
            
            // ✨ 目錄模式：隱藏閱讀進度條
            const progressBar = document.getElementById('reading-progress-bar');
            if (progressBar) progressBar.style.display = 'none';

            const shareBtn = document.getElementById('index-share-btn');
            if (shareBtn) {
                shareBtn.addEventListener('click', function() { window.handleCopy(this, shareUrl); });
            }

            const listContainer = modalBody.querySelector('#article-list-container');
            const sortBtn = document.getElementById('toggle-sort-btn');

            const renderList = () => {
                const finalArray = window.getArticleSequence(projectId);
                const themePalette = ['var(--group-c1)', 'var(--group-c2)', 'var(--group-c3)', 'var(--group-c4)', 'var(--group-c5)'];

                const generateLi = (art, idx, isHighlightGroup, customColor) => {
                    let descHtml = art.description ? `<span class="article-item-desc">- ${art.description}</span>` : '';
                    let dateHtml = art.date ? `<span class="article-item-date">${art.date}</span>` : '';
                    let statusBadgeHtml = window.getStatusBadgeHtml(art, true);
                    
                    // 替換清單沒有圖片時的佔位符
                    let baseIconHtml = art.cover_image 
                        ? `<img src="${art.cover_image}" alt="cover" class="article-item-cover is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` 
                        : `<div class="article-item-fallback" style="color: var(--muted);">${GLOBAL_SVGS.docIconLg}</div>`;
                    
                    let pinnedBadgeHtml = art.pinned ? `<div class="modal-pin">${GLOBAL_SVGS.pinSmall}</div>` : '';
                    // ✨ 新增：機密小圖釘 HTML
                    let secretBadgeHtml = art.is_hidden ? `<div class="modal-secret-pin">${GLOBAL_SVGS.secretPinSmall}</div>` : '';
                    let iconHtml = `<div class="article-item-icon-wrap">${pinnedBadgeHtml}${secretBadgeHtml}${baseIconHtml}</div>`;
                    let colorStyle = customColor ? ` style="--tab-color: ${customColor};"` : '';
                    
                    // ✨ 新增：判斷是否為隱藏文章
                    let hiddenClass = art.is_hidden ? ' sys-hidden-item' : '';

                    return `
                        <li id="article-item-${idx}" class="article-li ${isHighlightGroup ? 'is-highlight' : 'is-normal'}${hiddenClass}"${colorStyle}>
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
                        let customStyle = '';

                        // ✨ The Logic: Use classes for highlight groups, inline styles ONLY for custom hex colors
                        if (groupData.highlight) {
                            const groupNum = (colorIndex % 5) + 1;
                            themeClass = ` group-color-${groupNum}`;
                            colorIndex++; 
                        } else if (groupColor) {
                            // If they provided a specific hardcoded hex color
                            customStyle = ` style="--current-group-color: ${groupColor};"`;
                        }

                        const topMargin = isFirstGroup ? '0rem' : '1.8rem';

                        // Apply themeClass to the title, or customStyle if it's a hardcoded hex
                        html += `
                            <div class="group-header" style="margin-top: ${topMargin}; margin-bottom: 0.8rem;">
                                <div class="group-header-title${themeClass}"${customStyle}>${groupData.title || groupId}</div>
                                ${groupData.description ? `<div class="group-header-desc">${groupData.description}</div>` : ''}
                            </div>
                            <ul class="article-list-ul">
                        `;
                        
                        groupArticles.forEach(({art, idx}) => { 
                            let descHtml = art.description ? `<span class="article-item-desc">- ${art.description}</span>` : '';
                            let dateHtml = art.date ? `<span class="article-item-date">${art.date}</span>` : '';
                            let statusBadgeHtml = window.getStatusBadgeHtml(art, true);
                            
                            let baseIconHtml = art.cover_image 
                                ? `<img src="${art.cover_image}" alt="cover" class="article-item-cover is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` 
                                : `<div class="article-item-fallback">${GLOBAL_SVGS.docIconLg}</div>`;
                            
                            let pinnedBadgeHtml = art.pinned ? `<div class="modal-pin">${GLOBAL_SVGS.pinSmall}</div>` : '';
                            let secretBadgeHtml = art.is_hidden ? `<div class="modal-secret-pin">${GLOBAL_SVGS.secretPinSmall}</div>` : '';
                            let iconHtml = `<div class="article-item-icon-wrap">${pinnedBadgeHtml}${secretBadgeHtml}${baseIconHtml}</div>`;
                            let hiddenClass = art.is_hidden ? ' sys-hidden-item' : '';
                            
                            // ✨ The Magic: Apply themeClass directly to the <li>
                            let classList = `article-li ${groupData.highlight ? 'is-highlight' : 'is-normal'}${hiddenClass}${themeClass}`;

                            html += `
                                <li id="article-item-${idx}" class="${classList.trim()}"${customStyle}>
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
                        });
                        html += `</ul>`;
                        
                        isFirstGroup = false;
                    }
                    const ungrouped = finalArray.filter(item => !item.art.group);
                    if (ungrouped.length > 0) {
                        const topMargin = isFirstGroup ? '0rem' : '1.5rem';
                        html += `<ul class="article-list-ul" style="margin-top:${topMargin};">`;
                        
                        ungrouped.forEach(({art, idx}) => { 
                             // Inline generic li generation for ungrouped
                             let descHtml = art.description ? `<span class="article-item-desc">- ${art.description}</span>` : '';
                             let dateHtml = art.date ? `<span class="article-item-date">${art.date}</span>` : '';
                             let statusBadgeHtml = window.getStatusBadgeHtml(art, true);
                             let baseIconHtml = art.cover_image ? `<img src="${art.cover_image}" alt="cover" class="article-item-cover is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` : `<div class="article-item-fallback">${GLOBAL_SVGS.docIconLg}</div>`;
                             let pinnedBadgeHtml = art.pinned ? `<div class="modal-pin">${GLOBAL_SVGS.pinSmall}</div>` : '';
                             let secretBadgeHtml = art.is_hidden ? `<div class="modal-secret-pin">${GLOBAL_SVGS.secretPinSmall}</div>` : '';
                             let iconHtml = `<div class="article-item-icon-wrap">${pinnedBadgeHtml}${secretBadgeHtml}${baseIconHtml}</div>`;
                             let hiddenClass = art.is_hidden ? ' sys-hidden-item' : '';
 
                             html += `
                                 <li id="article-item-${idx}" class="article-li is-normal${hiddenClass}">
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
                        });
                        html += `</ul>`;
                    }
                } else {
                    html += `<ul class="article-list-ul" style="margin-top:0rem;">`;
                    finalArray.forEach(({art, idx}) => { 
                         // Generic li for projects with no groups
                         let descHtml = art.description ? `<span class="article-item-desc">- ${art.description}</span>` : '';
                         let dateHtml = art.date ? `<span class="article-item-date">${art.date}</span>` : '';
                         let statusBadgeHtml = window.getStatusBadgeHtml(art, true);
                         let baseIconHtml = art.cover_image ? `<img src="${art.cover_image}" alt="cover" class="article-item-cover is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` : `<div class="article-item-fallback">${GLOBAL_SVGS.docIconLg}</div>`;
                         let pinnedBadgeHtml = art.pinned ? `<div class="modal-pin">${GLOBAL_SVGS.pinSmall}</div>` : '';
                         let secretBadgeHtml = art.is_hidden ? `<div class="modal-secret-pin">${GLOBAL_SVGS.secretPinSmall}</div>` : '';
                         let iconHtml = `<div class="article-item-icon-wrap">${pinnedBadgeHtml}${secretBadgeHtml}${baseIconHtml}</div>`;
                         let hiddenClass = art.is_hidden ? ' sys-hidden-item' : '';

                         html += `
                             <li id="article-item-${idx}" class="article-li is-normal${hiddenClass}">
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
                    });
                    html += `</ul>`;
                }
                listContainer.innerHTML = html;

                const initJumpToast = () => {
                    const newArticles = Array.from(listContainer.querySelectorAll('.article-li'))
                        .filter(li => li.querySelector('.status-badge[data-status="NEW"]'));
                    
                    let jumpToast = document.getElementById('new-jump-toast');
                    if (!jumpToast) {
                        jumpToast = document.createElement('button');
                        jumpToast.id = 'new-jump-toast';
                        jumpToast.className = 'new-jump-toast';
                        modalOverlay.appendChild(jumpToast);
                    }

                    if (window.indexScrollHandler) {
                        modalContainer.removeEventListener('scroll', window.indexScrollHandler);
                        window.indexScrollHandler = null;
                    }

                    if (newArticles.length > 0) {
                        let targetArticle = null;

                        window.indexScrollHandler = () => {
                            const modalRect = modalContainer.getBoundingClientRect();
                            let countAbove = 0, countVisible = 0, countBelow = 0;
                            let closestAbove = null, closestBelow = null;

                            newArticles.forEach(article => {
                                const rect = article.getBoundingClientRect();
                                
                                // ✨ 判斷上方：只要卡片的「頂部邊緣」被頂端導覽列(大約110px)稍微遮住，立刻提示上方有內容
                                const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 80;
                                // 只要卡片頂部碰到「動態頂部導覽列底部 + 20px 緩衝區」，就判定它要被捲上去了
                                if (rect.top < modalRect.top + topBarHeight) {
                                    countAbove++;
                                    closestAbove = article; 
                                } 
                                // ✨ 判斷下方：只要卡片的「底部邊緣」沒有完全顯示在畫面內(留10px安全邊界)，立刻提示下方有內容
                                else if (rect.bottom > modalRect.bottom + 20) {
                                    countBelow++;
                                    if (!closestBelow) closestBelow = article; 
                                } 
                                // ✨ 只有卡片 100% 完整、清晰地在畫面中間，才不顯示提示
                                else {
                                    countVisible++;
                                }
                            });

                            if (countBelow > 0) {
                                targetArticle = closestBelow;
                                const prefix = countVisible > 0 ? '下方還有' : '發現';
                                jumpToast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: jump-arrow-bounce-down 1.5s infinite ease-in-out;"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg> ${prefix} ${countBelow} 篇新內容`;
                                jumpToast.classList.add('is-visible');
                            } else if (countAbove > 0) {
                                targetArticle = closestAbove;
                                const prefix = countVisible > 0 ? '上方還有' : '發現';
                                jumpToast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: jump-arrow-bounce-up 1.5s infinite ease-in-out;"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg> ${prefix} ${countAbove} 篇新內容`;
                                jumpToast.classList.add('is-visible');
                            } else {
                                targetArticle = null;
                                jumpToast.classList.remove('is-visible');
                            }
                        };
                        
                        modalContainer.addEventListener('scroll', window.indexScrollHandler);
                        setTimeout(window.indexScrollHandler, 100);

                        jumpToast.onclick = () => {
                            if (!targetArticle) return;
                            const finalTarget = targetArticle;
                            
                            // ✨ 改用高精度真實座標計算
                            const topBar = document.querySelector('.modal-top-bar');
                            const topBarHeight = topBar ? topBar.offsetHeight : 80;
                            const targetRect = finalTarget.getBoundingClientRect();
                            const containerRect = modalContainer.getBoundingClientRect();
                            const scrollOffset = targetRect.top - containerRect.top - topBarHeight - 40;

                            // 1. 平滑捲動到精準位置
                            modalContainer.scrollTo({
                                top: modalContainer.scrollTop + scrollOffset,
                                behavior: 'smooth'
                            });
                            
                            // 2. 點擊後隱藏 toast
                            jumpToast.classList.remove('is-visible'); 
                            
                            // 3. 等待捲動結束後，為「鎖定的目標」精準加上高光！
                            setTimeout(() => {
                                finalTarget.classList.add('simulate-hover');
                                setTimeout(() => {
                                    finalTarget.classList.remove('simulate-hover');
                                }, 700);
                            }, 500);
                        };
                    } else {
                        jumpToast.classList.remove('is-visible');
                    }
                };

                initJumpToast();
            };

            const updateSortBtnUI = () => {
                const isAsc = currentSort === 'asc';
                sortBtn.classList.toggle('is-asc', isAsc);
                sortBtn.classList.toggle('is-desc', !isAsc);
                sortBtn.querySelector('#sort-btn-text').innerText = isAsc ? '由舊到新' : '由新到舊';
            };

            updateSortBtnUI();
            renderList();

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
                    renderList();      
                    void listContainer.offsetWidth;
                    listContainer.style.opacity = '1';
                    setTimeout(() => { window.isRendering = false; sortBtn.disabled = false; }, 200); 
                }, 200); 
            });

            modalOverlay.classList.add('active');
            window.lockScroll(); 
        },
        () => {
            // ✨ 完美找回舊版：返回目錄時自動定位到最後閱讀的文章並觸發高光動畫
            const modalContainer = document.querySelector('.modal-content');
            if (modalContainer) {
                requestAnimationFrame(() => {
                    // 如果是返回操作，並且存有最後一次閱讀的 index
                    if (restoreScroll && window.lastReadArticleIndex !== undefined) {
                        
                        // ✨ 1. 先無縫還原「剛進入文章前」的原始目錄捲軸位置
                        if (window._indexScrollTopCache !== undefined) {
                            modalContainer.scrollTop = window._indexScrollTopCache;
                        }

                        const targetItem = document.getElementById(`article-item-${window.lastReadArticleIndex}`);
                        if (targetItem) {
                            const topBar = document.querySelector('.modal-top-bar');
                            const topBarHeight = topBar ? topBar.offsetHeight : 80;
                            
                            // ✨ 2. 捨棄受動畫縮放影響的 getBoundingClientRect，改用絕對物理座標 offsetTop
                            let itemTop = targetItem.offsetTop;
                            let currentEl = targetItem.offsetParent;
                            // 遍歷往上加總，直到抵達 modalContainer，取得最真實的相對高度
                            while(currentEl && currentEl !== modalContainer) {
                                itemTop += currentEl.offsetTop;
                                currentEl = currentEl.offsetParent;
                            }
                            const itemBottom = itemTop + targetItem.offsetHeight;

                            // ✨ 3. 計算容器的安全可視範圍 (相對座標)
                            const containerHeight = modalContainer.clientHeight;
                            const visibleTop = modalContainer.scrollTop + topBarHeight;
                            const visibleBottom = modalContainer.scrollTop + containerHeight;

                            // 判斷是否「完整」在可視範圍內
                            const isVisible = (itemTop >= visibleTop) && (itemBottom <= visibleBottom);

                            // ✨ 4. 智慧就近跳轉 (Scroll to Nearest)：免疫所有 CSS 動畫干擾
                            if (!isVisible) {
                                if (itemTop < visibleTop) {
                                    // 情況 A：卡片偏上被遮住 -> 往上拉，對齊頂部並留 20px 呼吸空間
                                    modalContainer.scrollTop = itemTop - topBarHeight - 20;
                                    
                                } else if (itemBottom > visibleBottom) {
                                    // 情況 B：卡片偏下掉出畫面 -> 往下拉，讓底部剛好進來並留 20px 安全距離
                                    let newScrollTop = itemBottom + 20 - containerHeight;
                                    
                                    // 🛡️ 防呆：如果這張卡片特別長，往下拉會導致頭部被導覽列蓋住，則退回「對齊頂部」
                                    if (itemTop < newScrollTop + topBarHeight) {
                                        newScrollTop = itemTop - topBarHeight - 40;
                                    }
                                    
                                    modalContainer.scrollTop = newScrollTop;
                                }
                            }
                            
                            // ✨ 5. 無論有沒有跳轉，都給予該文章高光提示
                            targetItem.classList.add('simulate-hover');
                            setTimeout(() => {
                                targetItem.classList.remove('simulate-hover');
                            }, 700);
                        }
                    } else {
                        modalContainer.scrollTop = 0;
                    }
                });
            }
        }
    ); 
};

// ==========================================
// 打開具體的「文章內文」
// ==========================================
window.openArticle = async function(projectId, articleIndex, isFromHistory = false, restoreScrollTop = 0, targetHash = null, restoreInnerScrolls = []) {
    const jumpToast = document.getElementById('new-jump-toast');
    if (jumpToast) jumpToast.classList.remove('is-visible');

    if (!isFromHistory) {
        const modalContainer = document.querySelector('.modal-content');
        if (!window.historyStack) window.historyStack = [];
        
        // ✨ 1. 新增：當從「目錄頁」進入文章時 (此時 historyStack 是空的)，紀錄目錄的原始捲軸位置
        if (window.historyStack.length === 0 && modalContainer) {
            window._indexScrollTopCache = modalContainer.scrollTop;
        }

        if (window.historyStack.length > 0) {
            if (modalContainer) {
                // 儲存主畫面的捲軸
                window.historyStack[window.historyStack.length - 1].scrollTop = modalContainer.scrollTop;
                
                // 抓取當下所有的 vertical-wrapper 捲軸位置並存入歷史紀錄
                const wrappers = document.querySelectorAll('#modal-body .vertical-wrapper');
                window.historyStack[window.historyStack.length - 1].innerScrolls = Array.from(wrappers).map(w => ({
                    scrollTop: w.scrollTop,
                    scrollLeft: w.scrollLeft
                }));
            }
        }
        // 新增 innerScrolls 初始陣列
        window.historyStack.push({ projectId, articleIndex, scrollTop: 0, innerScrolls: [] });
    }

    window.lastReadArticleIndex = articleIndex;

    const proj = window.siteProjects.find(p => p.id === projectId);
    const article = proj.articles[articleIndex];
    
    // ✨ 新增：敏感內容攔截 (改用全域變數檢查)
    if ((proj.is_sensitive || article.is_sensitive) && window._hasAgreedSensitiveContent !== true) {
        window.showSensitiveAgreementModal(
            () => window.openArticle(projectId, articleIndex, isFromHistory, restoreScrollTop, targetHash, restoreInnerScrolls),
            () => window.openProjectIndex(projectId) // ✨ 拒絕時：退回該專案的目錄 (這會覆蓋掉 403 畫面)
        );
        return;
    }
    
    document.body.style.cursor = 'wait';
    let markdownContent = "載入失敗";
    
    try {
        const response = await fetch(article.content_path);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        markdownContent = data.content; 
    } catch (error) {
        console.error("無法載入文章內容:", error);
        
        // 動態判斷是網路斷線還是檔案遺失
        const isOffline = !navigator.onLine || (error.message && error.message.includes('Failed to fetch'));
        const errTitle = isOffline ? 'ERR_INTERNET_DISCONNECTED' : '404 NOT_FOUND';
        const errMsg = isOffline ? '網路連線中斷，請檢查您的網路狀態。' : '無法載入文章內容，請檢查路徑是否正確。';
        
        // ✨ 核心魔法：第一行給予真實的文章標題 (article.title)，讓系統抽出並渲染完美的 Header！
        // 接下來的內容則替換為置中的終端機風格錯誤提示。
        markdownContent = `
# ${article.title}

<div style="text-align: center; padding: 4rem 1rem; color: var(--muted);">
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem; opacity: 0.5;">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
    <div style="font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: bold; color: var(--error-color); margin-bottom: 0.5rem; letter-spacing: 0.05em;">
        ${errTitle}
    </div>
    <div style="font-size: 0.95rem;">
        ${errMsg}
    </div>
</div>
        `.trim();
    } finally {
        document.body.style.cursor = '';
    }

    // ✨ 智慧判斷：如果彈窗是開著的，而且左上角已經是「文章膠囊模式 (.unified-nav-capsule)」，
    // 代表這是「文章切換文章」，我們就把頂部列的動畫關掉！
    const isCurrentlyArticle = document.querySelector('#modal-top-left .unified-nav-capsule') !== null;
    const animateTopBar = !(modalOverlay.classList.contains('active') && isCurrentlyArticle);

    switchModalContent(
        () => {
            document.querySelector('.modal-top-bar').classList.remove('is-index-mode');
            modalOverlay.classList.add('active');
            window.lockScroll();
            window._lastMarkdownHeadings = [];
            
            modalBody.innerHTML = marked.parse(markdownContent);

            // ==========================================
            // ✨ 啟動進度條引擎 (主進度條 & 直書獨立進度條)
            // ==========================================
            const modalContainer = document.querySelector('.modal-content');
            const topBar = document.querySelector('.modal-top-bar');
            
            // 1. 綁定頂部主進度條
            if (modalContainer && topBar) {
                window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');
            }

            // 2. 綁定直書模式 (Vertical Wrapper) 專屬獨立進度條
            const verticalWrappers = modalBody.querySelectorAll('.vertical-wrapper');
            verticalWrappers.forEach(wrapper => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.margin = '1rem 0';
                container.style.borderRadius = '12px';
                container.style.overflow = 'hidden'; // 防突出
                
                wrapper.parentNode.insertBefore(container, wrapper);
                wrapper.style.margin = '0';
                container.appendChild(wrapper);

                // ✨ 直接呼叫引擎，一行搞定所有特效與事件綁定！
                window.initProgressBar(container, wrapper, 'vertical');
            });

            const flatSequence = window.getArticleSequence(projectId);
            const seqIndex = flatSequence.findIndex(item => item.idx === articleIndex);

            const generateNavBtn = (item, type) => {
                const isPrev = type === 'prev';
                const iconSvg = isPrev ? `<path d="M15 18l-6-6 6-6"/>` : `<path d="M9 18l6-6-6-6"/>`;
                const text = isPrev ? '上一篇' : '下一篇';
                
                if (!item) {
                    return { cardHtml: '', btnHtml: `<button class="capsule-btn disabled" disabled><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg></button>` };
                }
                
                const cardHtml = `<a href="javascript:void(0)" class="nav-card ${type}" onclick="window.openArticle('${projectId}', ${item.idx})"><div class="nav-label">${isPrev ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg> ${text}` : `${text} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>`}</div><div class="nav-title">${item.art.title}</div></a>`;
                const btnHtml = `<button class="capsule-btn" onclick="window.openArticle('${projectId}', ${item.idx})" data-tooltip="${text}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg></button>`;
                return { cardHtml, btnHtml };
            };

            const prevData = seqIndex > 0 ? generateNavBtn(flatSequence[seqIndex - 1], 'prev') : generateNavBtn(null, 'prev');
            const nextData = seqIndex < flatSequence.length - 1 ? generateNavBtn(flatSequence[seqIndex + 1], 'next') : generateNavBtn(null, 'next');

            if (prevData.cardHtml || nextData.cardHtml) {
                const navContainer = document.createElement('div');
                navContainer.className = 'article-nav-cards';
                navContainer.innerHTML = prevData.cardHtml + nextData.cardHtml;
                modalBody.appendChild(navContainer);
            }

            modalBody.querySelectorAll('img').forEach(img => {
                if (!img.getAttribute('onerror')) {
                    img.classList.add('is-loading');
                    img.setAttribute('loading', 'lazy'); 
                    img.setAttribute('onerror', 'window.handleImageError(this)');
                    img.addEventListener('load', function() { this.classList.remove('is-loading'); });
                    if (img.complete && img.naturalHeight === 0) window.handleImageError(img);
                }
            });

            let mermaidRetryCount = 0;
            const renderMermaid = () => {
                if (window.mermaid) {
                    // ✨ 核心修復 1：每次渲染圖表前，強制擷取當下的深淺色主題並重新設定
                    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                    window.mermaid.initialize({
                        startOnLoad: false,
                        theme: currentTheme === 'dark' ? 'dark' : 'default', // 完美同步主題
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
                        securityLevel: 'loose'
                    });

                    document.querySelectorAll('.mermaid').forEach(el => el.removeAttribute('data-processed'));
                    window.mermaid.run({ querySelector: '.mermaid' })
                    .catch(e => console.warn('Mermaid 語法錯誤:', e))
                    .finally(() => window.initMermaidDrag());
                } else if (mermaidRetryCount < 10) {
                    mermaidRetryCount++;
                    setTimeout(renderMermaid, 300);
                } else {
                    console.warn("Mermaid 引擎載入超時，放棄渲染。");
                }
            };
            renderMermaid();

            const firstH1 = modalBody.querySelector('h1');
            if (firstH1) {
                const wrapper = document.createElement('div');
                wrapper.className = 'article-header-wrapper';
                wrapper.style.marginTop = (firstH1 === modalBody.firstElementChild) ? '0' : '0.8rem';

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

                // ✨ 替換這三行，把 targetHash 加回去
                const cleanPath = window.getCleanBasePath();
                const articleSlug = article.id || articleIndex;
                const spaUrl = `${window.location.origin}${cleanPath}?p=${projectId}&a=${articleSlug}${targetHash || ''}`;
                window.history.replaceState({ path: spaUrl }, '', spaUrl);
                const shareUrl = `${window.location.origin}${cleanPath}api/${projectId}/${articleSlug}/index.html`;

                const shareBtn = document.createElement('button');
                shareBtn.className = 'share-link-btn';
                shareBtn.innerHTML = `${GLOBAL_SVGS.link} <span>複製連結</span>`;
                shareBtn.addEventListener('click', function() { window.handleCopy(this, shareUrl); });

                rightGroup.appendChild(shareBtn);
                wrapper.appendChild(rightGroup);
            }

            const topLeft = document.getElementById('modal-top-left');
            let historyBtnHtml = (window.historyStack && window.historyStack.length > 1) ? `<div class="capsule-divider"></div><button class="capsule-btn history-btn" onclick="window.goBackInHistory()" data-tooltip="返回跳轉前">${GLOBAL_SVGS.historyBack}</button>` : '';
            let sequenceHtml = (flatSequence.length > 1) ? `<div class="capsule-divider"></div>${prevData.btnHtml}<span class="capsule-progress">${seqIndex + 1} / ${flatSequence.length}</span>${nextData.btnHtml}` : '';

            topLeft.innerHTML = `<div class="unified-nav-capsule"><button class="capsule-btn main-back" onclick="window.openProjectIndex('${projectId}', true)" data-tooltip="返回目錄">${GLOBAL_SVGS.arrowLeft}<span class="desktop-only">目錄</span></button>${sequenceHtml}${historyBtnHtml}</div>`;

            const tocMount = document.getElementById('toc-mount-point');
            tocMount.innerHTML = ''; 
            const headings = modalBody.querySelectorAll('h1, h2, h3'); 
            if (headings.length > 1) {
                const tocWrapper = document.createElement('div');
                tocWrapper.className = 'toc-wrapper';

                const tocBtn = document.createElement('div');
                tocBtn.className = 'toc-toggle-btn';
                tocBtn.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';

                const tocDropdown = document.createElement('div');
                tocDropdown.className = 'toc-dropdown';
                tocDropdown.innerHTML = '<ul class="toc-list"></ul>';
                const tocList = tocDropdown.querySelector('.toc-list');

                headings.forEach((h, index) => {
                    if (!h.id) {
                        const textId = h.innerText.toLowerCase().replace(/[\s&]+/g, '-').replace(/-+/g, '-');
                        h.id = textId || `article-heading-${index}`;
                    }
                    
                    const li = document.createElement('li');
                    li.className = `toc-${h.tagName.toLowerCase()}`; 
                    const a = document.createElement('a');
                    
                    // ✨ 優先讀取我們剛才存在 data-raw-title 裡「已經剔除自訂 ID」的乾淨標題
                    const rawTitle = h.getAttribute('data-raw-title');
                    if (rawTitle) {
                        // 因為剛剛 encode 過，這裡要 decode 回來，然後再把它當作 HTML 解析一次以支援內部標籤
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = decodeURIComponent(rawTitle);
                        a.innerText = tempDiv.innerText;
                    } else {
                        a.innerText = h.innerText;
                    }
                    
                    a.href = "javascript:void(0)";
                    a.onclick = () => {
                        // ✨ 智慧判斷：如果標題剛好被外層 <div id="自訂ID"> 包覆，優先跳轉到該 div
                        // 這樣才能確保 float 圖片或自訂的外圍排版不會被導覽列切掉！
                        let targetHash = '#' + h.id;
                        if (h.id.startsWith('md-sys-')) {
                            const baseId = h.id.replace('md-sys-', '');
                            // 檢查畫面上是否存在這個同名的外層 div
                            if (document.getElementById(baseId)) {
                                targetHash = '#' + baseId;
                            }
                        }
                        
                        window.executeAnchorScroll(targetHash, false);
                        tocBtn.classList.remove('open');
                        tocDropdown.classList.remove('active');
                    };
                    li.appendChild(a);
                    tocList.appendChild(li);
                });

                tocBtn.onclick = () => { tocBtn.classList.toggle('open'); tocDropdown.classList.toggle('active'); };
                tocWrapper.appendChild(tocBtn);
                tocWrapper.appendChild(tocDropdown);
                tocMount.appendChild(tocWrapper);
            }

            modalBody.querySelectorAll('.gallery').forEach(gallery => {
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

                const scrollOneItem = (direction) => {
                    const figures = Array.from(gallery.querySelectorAll('figure'));
                    if (figures.length === 0) return;
                    const containerCenter = gallery.getBoundingClientRect().left + gallery.clientWidth / 2;
                    let closestIndex = 0;
                    let minDistance = Infinity;

                    figures.forEach((figure, index) => {
                        const distance = Math.abs(containerCenter - (figure.getBoundingClientRect().left + figure.offsetWidth / 2));
                        if (distance < minDistance) { minDistance = distance; closestIndex = index; }
                    });

                    let targetIndex = Math.max(0, Math.min(closestIndex + direction, figures.length - 1));
                    let scrollAmount = (figures[targetIndex].getBoundingClientRect().left + figures[targetIndex].offsetWidth / 2) - containerCenter;

                    const maxScrollLeft = gallery.scrollWidth - gallery.clientWidth;
                    if (direction > 0 && scrollAmount > maxScrollLeft - gallery.scrollLeft) scrollAmount = maxScrollLeft - gallery.scrollLeft;
                    else if (direction < 0 && Math.abs(scrollAmount) > gallery.scrollLeft) scrollAmount = -gallery.scrollLeft;

                    gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                };

                hintRight.addEventListener('click', () => scrollOneItem(1));
                hintLeft.addEventListener('click', () => scrollOneItem(-1));
            });

            modalBody.querySelectorAll('figure').forEach(figure => {
                const figcaption = figure.querySelector('figcaption');
                const img = figure.querySelector('img');
                
                // ✨ 偵測這張圖片是否在畫廊裡面
                const isGallery = figure.closest('.gallery') !== null;
                
                if (isGallery) {
                    // ==========================================
                    // 📁 畫廊內的圖片 (維持原樣，點擊切換標題)
                    // ==========================================
                    if (figcaption) {
                        figure.style.cursor = 'pointer'; 
                        figure.addEventListener('click', () => figure.classList.toggle('hide-caption'));
                        
                        if (img && !figcaption.querySelector('.zoom-btn')) {
                            const zoomBtn = document.createElement('button');
                            zoomBtn.className = 'zoom-btn';
                            zoomBtn.innerHTML = `
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    <line x1="11" y1="8" x2="11" y2="14"></line>
                                    <line x1="8" y1="11" x2="14" y2="11"></line>
                                </svg>
                            `;
                            zoomBtn.onclick = (event) => {
                                event.stopPropagation();
                                window.openLightbox(zoomBtn, event);
                            };
                            figcaption.appendChild(zoomBtn);
                        }
                    }
                } else {
                    // ==========================================
                    // 🖼️ 畫廊外的獨立圖片 (支援圖片點擊與 CSS 連動)
                    // ==========================================
                    figure.classList.add('standalone-figure'); 
                    
                    if (img) {
                        img.style.cursor = 'pointer';
                        
                        // 讓點擊圖片本體直接觸發大圖預覽
                        img.addEventListener('click', (event) => {
                            event.stopPropagation();
                            window.openLightbox(img, event);
                        });

                        // ✨ 自動補全機制：拯救手寫 HTML 缺失的放大鏡按鈕
                        const existingBtn = figure.querySelector('.zoom-btn');
                        if (!existingBtn) {
                            const zoomBtn = document.createElement('button');
                            zoomBtn.setAttribute('data-tooltip', '放大檢視');
                            zoomBtn.innerHTML = `
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    <line x1="11" y1="8" x2="11" y2="14"></line>
                                    <line x1="8" y1="11" x2="14" y2="11"></line>
                                </svg>
                            `;
                            
                            zoomBtn.onclick = (event) => {
                                event.stopPropagation();
                                window.openLightbox(zoomBtn, event);
                            };

                            if (figcaption) {
                                // 情況 A：有圖說的 HTML，把放大鏡塞進 figcaption 裡
                                zoomBtn.className = 'zoom-btn';
                                figcaption.appendChild(zoomBtn);
                            } else {
                                // 情況 B：無圖說的 HTML，把放大鏡設定為懸浮樣式，並確保 figure 有對應的 class
                                figure.classList.add('no-caption');
                                zoomBtn.className = 'zoom-btn floating';
                                figure.appendChild(zoomBtn);
                            }
                        }
                    }
                }
            });
        },
        () => {
            // ✨ 完全無延遲的定位邏輯 (搭載佈局偏移追蹤引擎)
            const modalContainer = document.querySelector('.modal-content');
            if (!modalContainer) return;
            
            requestAnimationFrame(() => {
                if (targetHash) {
                    // 如果有錨點，交給共用引擎處理 (它本身已有追蹤機制)
                    const success = window.executeAnchorScroll(targetHash, true);
                    if (success) return; // 如果跳轉錨點成功，就不執行歷史紀錄復原
                } 

                if (isFromHistory) {
                    // ✨ 歷史復原：導入「佈局偏移追蹤引擎 (Layout Shift Chaser)」
                    const doRestoreScroll = () => {
                        modalContainer.scrollTop = restoreScrollTop;
                        
                        // 同步復原直書模式的內部捲軸
                        if (restoreInnerScrolls && restoreInnerScrolls.length > 0) {
                            const wrappers = modalBody.querySelectorAll('.vertical-wrapper');
                            wrappers.forEach((w, i) => {
                                if (restoreInnerScrolls[i]) {
                                    w.scrollTop = restoreInnerScrolls[i].scrollTop;
                                    w.scrollLeft = restoreInnerScrolls[i].scrollLeft;
                                }
                            });
                        }
                    };

                    doRestoreScroll(); // 1. 第一次強制瞬間復原

                    // 2. 建立追蹤器：對抗 Mermaid、影片、大圖片異步載入導致的高度變化
                    let trackers = [];
                    trackers.push(setTimeout(doRestoreScroll, 300));
                    trackers.push(setTimeout(doRestoreScroll, 600));
                    trackers.push(setTimeout(doRestoreScroll, 1200));

                    // ✋ 防呆機制：如果使用者在載入期間 (1.2秒內) 已經開始自己滑動，立刻放棄系統追蹤
                    const cancelTrackers = () => {
                        trackers.forEach(clearTimeout);
                        modalContainer.removeEventListener('wheel', cancelTrackers);
                        modalContainer.removeEventListener('touchstart', cancelTrackers);
                    };
                    
                    modalContainer.addEventListener('wheel', cancelTrackers, { passive: true });
                    modalContainer.addEventListener('touchstart', cancelTrackers, { passive: true });

                } else {
                    // 全新開啟的文章，一律置頂
                    modalContainer.scrollTop = 0;
                }
            });
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
            t.style.color = 'var(--accent-2)';
            t.style.textShadow = '0 0 10px var(--glow-1)';
            t.style.opacity = '1';
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
        
        document.querySelectorAll('.marquee-content').forEach(m => {
            if (m.marqueePlayer) { m.marqueePlayer.cancel(); m.marqueePlayer = null; }
            let currentX = new DOMMatrix(window.getComputedStyle(m).transform).m41 % contentWidth; 
            if (currentX > 0) currentX -= contentWidth;
            
            m.style.transition = 'none';
            m.style.transform = `translateX(${currentX}px)`;
            m.style.animation = 'none';
            
            void m.offsetWidth; 
            
            const duration = 0.8 + ((Math.abs(targetX - currentX) / contentWidth) * 0.7);

            m.style.transition = `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`;
            m.style.transform = `translateX(${targetX}px)`;
        });
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
        t.style.color = '';
        t.style.textShadow = '';
        t.style.opacity = '';
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
        
        document.querySelectorAll('.marquee-content').forEach(m => {
            if (m.marqueePlayer) { m.marqueePlayer.cancel(); m.marqueePlayer = null; }
            let currentX = new DOMMatrix(window.getComputedStyle(m).transform).m41 % contentWidth; 
            if (currentX > 0) currentX -= contentWidth;
            
            m.style.transition = 'none';
            m.style.transform = `translateX(${currentX}px)`;
            m.style.animation = 'none';
            void m.offsetWidth; 
            m.style.transition = `transform ${0.8 + ((Math.abs(targetX - currentX) / contentWidth) * 0.7)}s cubic-bezier(0.22, 1, 0.36, 1)`;
            m.style.transform = `translateX(${targetX}px)`;
        });
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

window.openMarkdownModal = function(markdownText) {
    modalBody.innerHTML = marked.parse(markdownText);
    modalOverlay.classList.add('active');
    window.lockScroll(); // ✨ 替換為防跳動版本
    document.querySelector('.modal-content').scrollTop = 0;
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
    window.historyStack = []; 
    modalOverlay.classList.remove('active');
    
    // ✨ 延遲 300 毫秒解鎖，配合 Modal 的 opacity: 0.3s 動畫
    setTimeout(() => window.unlockScroll(), 300); 

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
// ✨ Mermaid 重新整理引擎 (主動重繪)
// ==========================================
window.reloadMermaid = function(btn) {
    const container = btn.closest('.mermaid-container');
    const mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;

    // 重置縮放與平移狀態
    container.dataset.zoom = 1;
    container.dataset.x = 0;
    container.dataset.y = 0;
    
    // 加上載入中的透明度特效
    mermaidDiv.style.opacity = '0.3';
    
    // 給 UI 緩衝時間，再執行重繪
    setTimeout(() => {
        // 從隱藏屬性抓回最乾淨的原始語法
        const originalText = decodeURIComponent(mermaidDiv.getAttribute('data-original-text') || '');
        if (originalText) {
            // 拔除已處理標記，強制讓 Mermaid 把它當成新的
            mermaidDiv.removeAttribute('data-processed');
            mermaidDiv.innerHTML = window.processMermaidCssVars(originalText);
            mermaidDiv.style.transform = 'translate(0px, 0px) scale(1)';
            
            // 重新呼叫底層渲染
            if (window.mermaid) {
                window.mermaid.run({ querySelector: '.mermaid' })
                    .catch(e => console.warn('Mermaid reload failed:', e))
                    .finally(() => {
                        mermaidDiv.style.opacity = '1';
                        // 重新綁定拖曳功能
                        window.initMermaidDrag();
                    });
            }
        } else {
            mermaidDiv.style.opacity = '1';
        }
    }, 150);
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

    // 2. 完美克隆圖表，並上色保護
    const clonedMermaid = mermaidDiv.cloneNode(true);
    clonedMermaid.id = 'lightbox-active-mermaid';
    clonedMermaid.style.transform = 'translate(0px, 0px) scale(1)';
    clonedMermaid.style.pointerEvents = 'auto'; // 讓它能被點擊/拖曳
    
    // 強制加上背景色，否則透明黑底會看不見黑色字
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    clonedMermaid.style.backgroundColor = currentTheme === 'dark' ? 'var(--bg)' : 'var(--card)';
    clonedMermaid.style.padding = '20px';
    clonedMermaid.style.borderRadius = '12px';
    clonedMermaid.style.boxShadow = '0 10px 40px var(--shadow-base)';
    clonedMermaid.style.maxHeight = '90vh';
    clonedMermaid.style.maxWidth = '90vw';
    
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
        if (container.dataset.engineInit) return;
        container.dataset.engineInit = 'true';

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
    const modalBody = document.getElementById('modal-body');
    const modalTopLeft = document.getElementById('modal-top-left');
    const tocMountPoint = document.getElementById('toc-mount-point');

    if (modalTopLeft) modalTopLeft.innerHTML = `<span style="color: var(--muted); font-weight: 600; font-family: monospace; letter-spacing: 0.05em;">SYSTEM_ERROR</span>`;
    if (tocMountPoint) tocMountPoint.innerHTML = '';

    // ✨ 動態判斷：如果是 403 就顯示鎖頭，否則顯示驚嘆號
    const is403 = title.includes('403');
    const iconSvg = is403
        ? `<svg class="error-lock-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem; opacity: 0.5; overflow: visible; transition: all 0.3s ease;">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path class="error-lock-shackle" d="M7 11V7a5 5 0 0 1 10 0v4" style="transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: center;"></path>
           </svg>`
        : `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem; opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    modalBody.innerHTML = `
        <div style="text-align: center; padding: 15vh 2rem 10vh 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            ${iconSvg}
            <h1 style="margin: 0 0 1rem 0; border: none; font-size: 2rem; padding: 0;">${title}</h1>
            <p style="color: var(--muted); font-size: 1.05rem; max-width: 400px; line-height: 1.6;">${message}</p>
            <button class="btn" style="margin-top: 2.5rem; padding: 0.6rem 1.5rem; display: flex; align-items: center; gap: 0.5rem;" onclick="closeModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg> 返回首頁
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
            document.body.classList.add('system-override-active');
            
            // ✨ 呼叫全域重刷引擎，確保退回首頁時，卡片數字與捲軸提示都已完美更新！
            window.refreshUIAfterOverrideToggle();
            
            const urlParams = new URLSearchParams(window.location.search);
            const pParam = urlParams.get('p');
            const aParam = urlParams.get('a');
            const hashParam = window.location.hash || null;
            
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
    overlay.innerHTML = `
        <div class="modal-content" style="cursor: auto; max-width: 500px; text-align: center; padding: 3rem 2rem; opacity: 1; position: relative;">
            
            <!-- ✨ 右上角 X 關閉按鈕：保留 Toast 的旋轉動畫 -->
            <button id="sensitive-close-x" style="position: absolute; top: 1.2rem; right: 1.2rem; background: transparent; border: none; color: var(--muted); cursor: pointer; padding: 0.5rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: center center; opacity: 0.7;" onmouseover="this.style.opacity='1'; this.style.color='var(--accent)'; this.style.transform='rotate(90deg) scale(1.1)';" onmouseout="this.style.opacity='0.7'; this.style.color='var(--muted)'; this.style.transform='rotate(0deg) scale(1)';">
                <svg style="display: block;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <svg id="sensitive-warning-svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h2 style="margin: 0 0 1rem 0; color: var(--error-color);">內容警告 (Content Warning)</h2>
            <p style="color: var(--muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem;">
                此條目包括但不限於：負面、一時興起、莫名其妙、取景框。<br>點擊前往即表示您已了解。<br>
                <span style="font-size: 0.8rem; opacity: 0.7;">(同意後於本次瀏覽器存續期間將不再提示)</span>
            </p>
            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
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

// ✨ 專為 JSON/Markdown 轉 HTML 後的中文排版處理器
window.applyIndentToVerticalWrapper = function(container) {
    if (!container || container.getAttribute('data-indent') === 'false') return;

    // ✨ 使用 Unicode 全形空格字元 (U+3000)，直接填入文字，不會被轉義為字串
    const indent = '\u3000\u3000';

    function traverse(node) {
        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                // 檢查是否已經有縮排，避免重複執行
                if (child.textContent.trim().length > 0 && !child.textContent.startsWith(indent)) {
                    const lines = child.textContent.split('\n');
                    const indentedLines = lines.map(line => {
                        // 每一行開頭都加上全形空格
                        return line.trim() ? indent + line.trim() : line;
                    });
                    child.textContent = indentedLines.join('\n');
                }
            } else if (child.tagName !== 'BR' && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
                // 遞迴處理非換行標籤
                traverse(child);
            }
        });
    }

    traverse(container);
};

// ==========================================
// ✨ 隱藏彩蛋：動態讀取 credits.md (整合平滑動畫版)
// ==========================================
window.cachedCreditsText = null;
window.showCreditsModal = async function() {
    document.body.style.cursor = 'wait'; 
    let mdText = "載入失敗"; let isError = false;
    
    try {
        // ✨ 記憶體快取補全：已抓過就用快取，沒抓過才使用版本號向 CDN 要求檔案
        if (window.cachedCreditsText !== null) {
            mdText = window.cachedCreditsText;
        } else {
            const response = await fetch(`./credits.md?v=${window.getResVersion('credits.md')}`);
            if (!response.ok) throw new Error('找不到 credits.md 檔案');
            mdText = await response.text();
            window.cachedCreditsText = mdText;
        }
    } catch (error) {
        console.error("Credits 讀取失敗:", error);
        isError = true;
    } finally {
        document.body.style.cursor = ''; 
    }

    // 2. 資料備妥後，呼叫系統共用的動畫切換引擎
    switchModalContent(
        () => {
            const modalOverlay = document.getElementById('md-modal');
            const modalBody = document.getElementById('modal-body');
            const modalTopLeft = document.getElementById('modal-top-left');
            const tocMountPoint = document.getElementById('toc-mount-point');
            
            if (tocMountPoint) tocMountPoint.innerHTML = '';
            
            if (modalTopLeft) {
                modalTopLeft.innerHTML = `
                    <div class="index-header-container">
                        <h1 class="index-header-title">Credits</h1>
                        <div class="index-header-actions">
                            <span class="article-count-badge">Acknowledgments</span>
                        </div>
                    </div>
                `;
            }

            if (isError) {
                modalBody.innerHTML = `
                    <div style="text-align:center; padding: 3rem 0; color: var(--error-color);">
                        <p>System Error: 無法載入致謝名單。</p>
                    </div>
                `;
            } else {
                modalBody.innerHTML = `
                    <div class="credits-markdown-wrapper markdown-body" style="margin-top: -0.5rem;">
                        ${marked.parse(mdText)}
                    </div>
                `;
            }
            
            // 👇 新增：啟動頂部進度條
            const modalContainer = document.querySelector('.modal-content');
            const topBar = document.querySelector('.modal-top-bar');
            if (modalContainer && topBar) {
                window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');
            }
            // 👆 新增結束

            // 開啟 Modal 並鎖定捲軸
            modalOverlay.classList.add('active');
            window.lockScroll();
        },
        () => {
            // 動畫結束後確保畫面在最頂端
            document.querySelector('.modal-content').scrollTop = 0;
        }
    );
};

// ==========================================
// ✨ 升級版系統日誌：支援兩層式架構、平滑動畫過場，與「手動強制更新檢查」！
// ==========================================
window.cachedChangelogs = null; 

window.showChangelogModal = async function(isSystemFallback = false) {
    document.body.style.cursor = 'wait';
    let fetchError = false;

    try {
        // ✨ 微型化版本檢查：獨立抓取極小的 version.json 來判定是否需要強制手動更新，保護大檔頻寬
        if (!isSystemFallback) {
            const vRes = await fetch(`./version.json?t=${new Date().getTime()}`).catch(() => null);
            if (vRes && vRes.ok) {
                const vData = await vRes.json();
                if (vData.version && vData.version !== CONFIG.VERSION) {
                    console.warn(`[MANUAL_UPDATE] 發現新版本 ${vData.version}，準備強制更新...`);
                    sessionStorage.setItem('sys_intent', 'changelog');
                    sessionStorage.removeItem('sys_reboot_count');

                    document.body.insertAdjacentHTML('beforeend', `
                    <div style="position:fixed; inset:0; background:var(--bg); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--accent); cursor: wait;">
                        <div style="font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; letter-spacing: 0.1em; text-shadow: 0 0 10px var(--glow-1);">>_ MANUAL_OVERRIDE : UPDATE</div>
                            <div style="font-family: 'Courier New', monospace; font-size: 0.9rem; color: var(--muted); margin-bottom: 2rem;">Local: ${CONFIG.VERSION} | Remote: ${vData.version}</div>
                            <div class="loading-text" style="font-size: 1.1rem;">FETCHING_NEW_DATA_AND_REBOOTING</div>
                        </div>
                    `);
                    
                    setTimeout(() => {
                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.set('v', new Date().getTime());
                        window.location.replace(newUrl.toString());
                    }, 1800);
                    return; 
                }
            }
        }

        // ✨ 記憶體快取補全：若系統版本一致，則使用 CDN 緩存或記憶體快取讀取日誌內容
        if (window.cachedChangelogs !== null) {
            // 已有快取，不需重抓
        } else {
            const response = await fetch(`./changelogs.json?v=${window.getResVersion('changelogs.json')}`);
            if (!response.ok) throw new Error('找不到 changelogs.json');
            window.cachedChangelogs = await response.json();
        }

    } catch (error) {
        console.error("日誌讀取或更新檢查失敗:", error);
        fetchError = true;
    }
    
    document.body.style.cursor = '';

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
                <div style="display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap;">
                    <button class="modal-back-btn" onclick="window.renderChangelogIndex()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        返回清單
                    </button>
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <span style="font-family: monospace; font-weight: 900; color: var(--accent); font-size: 1.5rem; letter-spacing: 0.05em; line-height: 1; transform: translateY(1px);">${logData ? logData.version : ''}</span>
                        ${badgeHTML}
                        <span style="font-family: monospace; color: var(--muted); font-size: 0.9rem; margin-left: 0.2rem; transform: translateY(2px);">${logData ? logData.date : ''}</span>
                    </div>
                </div>
            `;
        }
    }

    // 2. 渲染第一層：索引清單
    window.renderChangelogIndex = function() {
        switchModalContent(
            () => {
                const modalOverlay = document.getElementById('md-modal');
                const modalBody = document.getElementById('modal-body');
                const tocMountPoint = document.getElementById('toc-mount-point');
                
                if (tocMountPoint) tocMountPoint.innerHTML = '';
                
                // ✨ 加上這兩行：隱藏閱讀進度條
                const progressBar = document.getElementById('reading-progress-bar');
                if (progressBar) progressBar.style.display = 'none';

                renderChangelogHeader(false);

                if (fetchError || !window.cachedChangelogs) {
                    modalBody.innerHTML = `
                        <div style="text-align:center; padding: 3rem 0; color: var(--error-color);">
                            <p>System Error: 無法載入版本日誌。</p>
                        </div>
                    `;
                } else {
                    let listHTML = '<ul class="article-list-ul">';
                    window.cachedChangelogs.forEach(log => {
                        
                        let activeStatus = log.status === 'LATEST' ? 'NEW' : log.status;
                        let badgeHTML = `<span class="status-badge title-badge" data-status="${activeStatus}">${log.status}</span>`;

                        // 1. 在 li 加上 data-status 屬性，並移除寫死的 style
                        listHTML += `
                            <li class="article-li is-highlight" data-status="${activeStatus}" style="margin-bottom: 1rem;">
                                <a href="javascript:void(0)" class="article-link" onclick="window.renderChangelogDetail('${log.id}')">
                                    <div class="article-item-icon-wrap">
                                        <!-- 2. 圖示顏色直接使用 var() 來繼承 -->
                                        <div class="article-item-fallback" style="color: var(--tab-color, var(--accent));">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                <polyline points="10 9 9 9 8 9"></polyline>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="article-item-content">
                                        <div class="article-item-title-row">
                                            <span class="article-item-title"><span style="font-family: monospace; color: var(--tab-color); font-size: 1.15rem;">${log.version}</span>${badgeHTML}</span>
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
            () => document.querySelector('.modal-content').scrollTop = 0
        );
    };

    // 3. 渲染第二層：詳細記錄
    window.renderChangelogDetail = function(logId) {
        const targetLog = window.cachedChangelogs.find(l => l.id === logId);
        if (!targetLog) return;

        switchModalContent(
            () => {
                renderChangelogHeader(true, targetLog);
                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = `
                    <div class="markdown-body" style="margin-top: -0.5rem;">
                        ${marked.parse(targetLog.content)}
                    </div>
                `;

                const modalContainer = document.querySelector('.modal-content');
                const topBar = document.querySelector('.modal-top-bar');
                if (modalContainer && topBar) {
                    window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');
                }
            },
            () => document.querySelector('.modal-content').scrollTop = 0
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
// ⚖️ 版權與授權條款 Modal 引擎
// ==========================================
window.cachedLicenseText = null;
window.showLicenseModal = async function() {
    document.body.style.cursor = 'wait'; 
    let mdText = "載入失敗"; let isError = false;

    try {
        // ✨ 記憶體快取補全：已抓過就用快取，沒抓過才使用版本號向 CDN 要求檔案
        if (window.cachedLicenseText !== null) {
            mdText = window.cachedLicenseText;
        } else {
            const response = await fetch(`./COPYRIGHT.md?v=${window.getResVersion('COPYRIGHT.md')}`);
            if (!response.ok) throw new Error("找不到版權檔案");
            mdText = await response.text();
            window.cachedLicenseText = mdText;
        }
    } catch (error) {
        console.error("版權檔案載入失敗:", error);
        isError = true;
    } finally {
        document.body.style.cursor = ''; 
    }

    // 2. 資料備妥後，呼叫系統共用的動畫切換引擎
    switchModalContent(
        () => {
            const modalOverlay = document.getElementById('md-modal'); // ✨ 修正：正確抓取 md-modal
            const modalBody = document.getElementById('modal-body');
            const modalTopLeft = document.getElementById('modal-top-left');
            const tocMountPoint = document.getElementById('toc-mount-point');

            // 清空右上角目錄按鈕
            if (tocMountPoint) tocMountPoint.innerHTML = '';

            // 設定左上角精緻的標題 Header
            if (modalTopLeft) {
                modalTopLeft.innerHTML = `
                    <div class="index-header-container">
                        <h1 class="index-header-title">License & Copyright</h1>
                        <div class="index-header-actions">
                            <span class="article-count-badge">important</span>
                        </div>
                    </div>
                `;
            }

            // 處理內容渲染
            if (isError) {
                modalBody.innerHTML = `
                    <div style="text-align:center; padding: 3rem 0; color: var(--error-color);">
                        <p>System Error: 無法載入版權聲明檔案。</p>
                    </div>
                `;
            } else {
                modalBody.innerHTML = `
                    <div class="markdown-body" style="margin-top: -0.5rem; padding-bottom: 2rem;">
                        ${marked.parse(mdText)}
                    </div>
                `;
            }

            // ✨ 自動注入多語系切換按鈕 (更新為支援三語的簡潔寫法)
            const switcher = modalBody.querySelector('#bilingual-switcher');
            if (switcher) {
                switcher.innerHTML = `
                    <div class="lang-tabs">
                        <button class="lang-btn active" onclick="window.switchBilingualTab('zh', this)">中文版</button>
                        <button class="lang-btn" onclick="window.switchBilingualTab('en', this)">English</button>
                        <button class="lang-btn" onclick="window.switchBilingualTab('ja', this)">日本語</button>
                    </div>
                `;
            }

            const modalContainer = document.querySelector('.modal-content');
            const topBar = document.querySelector('.modal-top-bar');
            if (modalContainer && topBar) {
                window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');
            }

            // 開啟 Modal 並鎖定背景捲軸
            modalOverlay.classList.add('active');
            window.lockScroll();
        },
        () => {
            // 動畫結束後確保畫面定位在最頂端
            document.querySelector('.modal-content').scrollTop = 0;
        }
    );
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
// ✨ 獨立打包：終極精準捲動引擎 (動態追蹤定位版 + 物理座標)
// ==========================================
window.executeAnchorScroll = function(hash, forceInstantFirst = false, disableTrackers = false) {
    const modalContainer = document.querySelector('.modal-content');
    if (!modalContainer) return false;

    const targetEl = window.findAnchorElement(hash);
    if (!targetEl) return null;

    // 核心捲動邏輯 (抽離出來以便重複呼叫)
    const doScroll = (isSmooth = true) => {
        const topBar = document.querySelector('.modal-top-bar');
        const topBarHeight = topBar ? topBar.offsetHeight : 80;
        
        // ✨ 捨棄受動畫縮放影響的 getBoundingClientRect，改用絕對物理座標 offsetTop
        let itemTop = targetEl.offsetTop;
        let currentEl = targetEl.offsetParent;
        // 遍歷往上加總，直到抵達 modalContainer，取得最真實的相對高度
        while(currentEl && currentEl !== modalContainer) {
            itemTop += currentEl.offsetTop;
            currentEl = currentEl.offsetParent;
        }
        
        const targetScrollTop = itemTop - topBarHeight - 7; 
        
        // 防抖：誤差大於 2px 才執行捲動
        if (Math.abs(modalContainer.scrollTop - targetScrollTop) > 2) {
            modalContainer.scrollTo({ 
                top: targetScrollTop, 
                behavior: isSmooth ? 'smooth' : 'auto' 
            });
        }
    };

    // 1. 執行第一次跳轉
    doScroll(!forceInstantFirst);

    // 2. 佈局偏移追蹤引擎 (Layout Shift Chaser)
    // ✨ 加上判斷：當我們明確知道網頁已經載入完畢 (例如單純改網址) 時，封印追蹤引擎避免拉扯！
    if (!disableTrackers) {
        let trackers = [];
        trackers.push(setTimeout(() => doScroll(true), 300));
        trackers.push(setTimeout(() => doScroll(true), 600));
        trackers.push(setTimeout(() => doScroll(true), 1200));

        // ✋ 防呆中斷機制：如果使用者在跳轉期間(1.2秒內)自己滑動了滾輪，立刻放棄追蹤
        const cancelTrackers = () => {
            trackers.forEach(clearTimeout);
            modalContainer.removeEventListener('wheel', cancelTrackers);
            modalContainer.removeEventListener('touchstart', cancelTrackers);
        };
        
        modalContainer.addEventListener('wheel', cancelTrackers, { passive: true });
        modalContainer.addEventListener('touchstart', cancelTrackers, { passive: true });
    }

    // 3. 智慧尋找發光目標
    let highlightEl = targetEl;
    if (highlightEl.textContent.trim() === '') {
        highlightEl = highlightEl.nextElementSibling || targetEl;
    }

    // 閃爍動畫 (延長發光時間到 1.5s，配合追蹤引擎)
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
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    // 為了完美的 UX：如果是 PWA，我們直接把藍色主按鈕變成「下載」，並隱藏下方的第二顆按鈕
    const viewBtnText = isPWA ? '檢視 PDF 檔案' : '於瀏覽器中檢視 PDF';
    const viewBtnIcon = isPWA ? GLOBAL_SVGS.download : GLOBAL_SVGS.newTab;
    const downloadBtnDisplay = isPWA ? 'none' : 'flex';

    overlay.innerHTML = `
        <div class="pdf-action-sheet">
            <div style="width: 40px; height: 4px; background: var(--muted); opacity: 0.4; border-radius: 2px; margin: 0 auto 1.2rem auto;"></div>
            <div style="font-weight: 700; font-size: 1.1rem; color: var(--text); margin-bottom: 0.4rem; text-align: center; word-break: break-all;">${title}</div>
            <div style="font-size: 0.85rem; color: var(--muted); text-align: center; margin-bottom: 1.5rem; font-family: monospace;">PDF DOCUMENT</div>
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
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
        // ✨ 如果是 PWA，主按鈕的行為就是強制下載；反之才是開新分頁
        if (isPWA) {
            window.downloadPdfDirectly(href, title);
        } else {
            window.open(href, '_blank');
        }
        closeModal();
    };

    if (!isPWA) {
        overlay.querySelector('#pdf-download-btn').onclick = () => {
            window.downloadPdfDirectly(href, title);
            closeModal();
        };
    }

    overlay.querySelector('#pdf-modal-close').onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
};

window.downloadPdfDirectly = async function(url, filename) {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    // ✨ 非 PWA 才觸發震動與 Toast
    if (!isPWA) {
        window.triggerHaptic('light');
        if (window.showSystemToast) {
            const downloadTitle = `<span style="display: inline-flex; align-items: center; gap: 6px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: jump-arrow-bounce-down 1.5s infinite ease-in-out;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>下載中</span>`;
            window.showSystemToast(downloadTitle, '正在取得檔案，請稍候...', filename, 2000, 'success');
        }
    }
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("網路連線失敗");
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        }, 100);
        
        if (!isPWA) window.triggerHaptic('success');
    } catch (error) {
        console.error("底層下載失敗，改用新分頁開啟:", error);
        window.open(url, '_blank'); 
    }
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
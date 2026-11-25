/* ================================================================== */
/* ⚙️ 網站核心設定區 (SITE CONFIGURATION)                               */
/* 每次發布新版本或修改全域狀態時，請只在這裡修改！                         */
/* ================================================================== */
const CONFIG = {
    // 🚩 發布前必改
    VERSION: "U1.6.2.3",          // 目前系統版本號

    // 🎨 介面與主題設定
    DEFAULT_THEME: "dark",     // 預設主題 (light / dark)
    
    // ✨ 跑馬燈速度設定：跑完一整圈需要的「秒數」(數字越大跑得越慢！)
    MARQUEE_SPEED: 120,

    // ✨ 狀態標籤過期天數 (支援 NEW, UPDATED 等狀態)
    TAG_EXPIRE_DAYS: 14,

    // 🔗 資源路徑
    FAVICON_LIGHT: "./assets/OG_dark.png",
    FAVICON_DARK: "./assets/OG_light.png",
    DATA_SOURCE: "./all_projects.json",
    
    // 🔗 Header 社群與分享圖示連結（修改網址或順序即可更新）
    SOCIAL_LINKS: [
        { name: "GitHub",   url: "https://github.com/AZUSTOCK",          icon: "socialGithub" },
        { name: "YouTube",  url: "https://youtube.com/@azustock", icon: "socialYoutube" },
        { name: "piapro",   url: "https://piapro.jp/azustock",        icon: "socialPiapro" },
        { name: "pixiv",    url: "https://www.pixiv.net/users/131123043",   icon: "socialPixiv" },
        { name: "Twitter",  url: "https://x.com/azustock_phy",            icon: "socialX" },
        { name: "Discord",  url: "",                                     icon: "socialDiscord" },
        { name: "分享本站", copyUrl: "https://azustock.com/",       icon: "socialShare" }
    ],

    // 🐛 測試與除錯設定
    DEBUG_FETCH_DELAY: 0  // [測試專用] 強制延遲網路請求 (毫秒)。設定 0 即關閉延遲，正式發布請設為 0！
};

// ==========================================
// ✨ 內容警告模板設定區 (Sensitive Templates)
// ==========================================
window.SENSITIVE_TEMPLATES = {
    "DEFAULT": {
        title: "內容警告 (Content Warning)",
        desc: "此條目包括但不限於：負面、一時興起、莫名其妙、取景框。<br>點擊前往即表示您已了解。",
        btn_text: "我已了解並前往",
        color: "var(--error-color)"
    },
    "MAIN": {
        title: "內容提示 (Content Notice)",
        desc: "建議先閱讀前篇，以獲得較完整的體驗。<br>點擊前往即表示您已了解。",
        btn_text: "我已了解並前往",
        color: "var(--group-c5)"
    },
    "INSIDE": {
        title: "風險提示 (Risk Warning)",
        desc: "此條目含有警示內容，具高度風險，閱讀後所產生之後果概自行承受。<br>點擊前往即表示您已接受風險。",
        btn_text: "我已接受並前往",
        color: "var(--group-c4)"
    }
};

// ==========================================
// ✨ 全域共用 SVG 圖標 (集中管理，消滅重複代碼)
// ==========================================
const GLOBAL_SVGS = {
    // 🔗 基礎圖示
    meatballMenu: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle class="dot-1" cx="5" cy="12" r="2.5"/><circle class="dot-2" cx="12" cy="12" r="2.5"/><circle class="dot-3" cx="19" cy="12" r="2.5"/></svg>`,
    link: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    linkLg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    extLinkSm: `<svg width="24" height="24" viewBox="-12 -12 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: -4px; opacity: 0.8;"><path d="M9.665 -8.175L1.065 7.265M1.065 7.265L-5.695 3.945M-5.695 3.945L9.665 -8.175M9.665 -8.175L-9.175 -3.175M-9.175 -3.175L-10.735 1.905M-10.735 1.905L-1.135 0.345M-8.655 1.665L-7.975 8.865M-7.975 8.865L-5.695 3.945"/></svg>`,
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
    folderClosed: `<svg class="icon-book-closed" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>`,
    folderOpen: `<svg class="icon-book-open" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
    arrowUpRight: `<svg width="24" height="24" viewBox="-12 -12 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M9.665 -8.175L1.065 7.265M1.065 7.265L-5.695 3.945M-5.695 3.945L9.665 -8.175M9.665 -8.175L-9.175 -3.175M-9.175 -3.175L-10.735 1.905M-10.735 1.905L-1.135 0.345M-8.655 1.665L-7.975 8.865M-7.975 8.865L-5.695 3.945"/></svg>`,
    navPlane: `<svg class="nav-plane-svg" width="42" height="24" viewBox="0 0 64 36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <g class="plane-body">
            <g transform="translate(13 24) scale(0.95)">
                <path stroke-width="1.4" d="M9.665 -8.175L1.065 7.265M1.065 7.265L-5.695 3.945M-5.695 3.945L9.665 -8.175M9.665 -8.175L-9.175 -3.175M-9.175 -3.175L-10.735 1.905M-10.735 1.905L-1.135 0.345M-8.655 1.665L-7.975 8.865M-7.975 8.865L-5.695 3.945"/>
            </g>
        </g>
        <circle class="plane-dot dot-1" cx="26" cy="14" r="1" fill="currentColor" stroke="none"/>
        <circle class="plane-dot dot-2" cx="32" cy="12" r="1.8"/>
        <circle class="plane-dot dot-3" cx="41" cy="14" r="2.7"/>
        <circle class="plane-dot dot-4" cx="51" cy="21" r="4"/>
        <line class="plane-base" x1="45" y1="30" x2="57" y2="30"/>
    </svg>`,

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
    detailsArrow: `<svg class="details-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); flex-shrink: 0;"><polyline points="9 18 15 12 9 6"></polyline></svg>`,

    // 🌐 Header 社群與分享純圖示 SVG (單色 currentColor，深淺色自動同步)
    socialGithub: `<svg viewBox="2 1.75 20 20" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
    socialYoutube: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    socialPixiv: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.935 0A4.924 4.924 0 0 0 0 4.935v14.13A4.924 4.924 0 0 0 4.935 24h14.13A4.924 4.924 0 0 0 24 19.065V4.935A4.924 4.924 0 0 0 19.065 0H4.935zm7.81 4.547c2.181 0 4.058.676 5.399 1.847a6.118 6.118 0 0 1 2.116 4.66c.005 1.854-.88 3.476-2.257 4.563-1.375 1.092-3.225 1.697-5.258 1.697-1.314 0-2.548-.288-3.605-.792v2.49c0 .317.163.563.566.563h.648v.878H6.139v-.878h.661c.418 0 .566-.246.566-.563V8.248c-.433.362-.833.763-1.158 1.186-.05.066-.135.106-.225.106H4.74V8.532c1.198-1.373 2.704-2.55 4.496-3.277 1.123-.458 2.3-.708 3.509-.708zm-.262 1.845c-1.14 0-2.29.392-3.343 1.073v7.484c.96.517 2.088.818 3.31.818 1.484 0 2.755-.474 3.652-1.268.894-.79 1.416-1.91 1.416-3.219 0-1.364-.522-2.567-1.423-3.443-.9-.876-2.155-1.445-3.612-1.445z"/></svg>`,
    socialX: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    socialTwitter: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/></svg>`,
    socialPiapro: `<svg role="img" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.988 0c-4.705 0 -8.7 3.492 -9.351 8.168 -0.06 0.207 -0.09 0.444 -0.09 0.68V24l5.21 -3.403V9.44c0 -2.338 1.893 -4.261 4.231 -4.261s4.261 1.894 4.261 4.232c0 2.337 -1.894 4.261 -4.231 4.261 -0.77 0 -1.54 -0.207 -2.22 -0.621v5.563A9.45 9.45 0 0 0 21.191 11.6C22.405 6.51 19.268 1.45 14.207 0.266A9.48 9.48 0 0 0 11.988 0Z"></path></svg>`,
    socialDiscord: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
    socialShare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 10H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2"></path><polyline points="8.5 6.5 12 3 15.5 6.5"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`
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
        if (type === 'light' || type === 'selection') navigator.vibrate(40);
        else if (type === 'success') navigator.vibrate([30, 60, 40]);
        else if (type === 'warning') navigator.vibrate([40, 50, 40]);
        else if (type === 'error') navigator.vibrate([50, 50, 50, 50]);
    } catch (e) { /* 忽略不支援的裝置 */ }
};

// ==========================================
// ✨ 新增：動態非同步引入 Mermaid 引擎 (ESM 模組)
// ==========================================
window.mermaid = null;
window.initMermaidWithTheme = function(theme) {
    window.mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
        securityLevel: 'loose',
        useMaxWidth: false,
        flowchart: {
            padding: 15,
            htmlLabels: false
        }
    });
};
import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs').then(m => {
    window.mermaid = m.default;
    const currentTheme = document.documentElement.getAttribute('data-theme') || CONFIG.DEFAULT_THEME;
    window.initMermaidWithTheme(currentTheme);
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
window.readDataVersions = function() {
    try {
        const data = JSON.parse(localStorage.getItem('sys_data_versions') || '{}');
        return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch (_) {
        return {};
    }
};
window.getResVersion = function(key) {
    return window.readDataVersions()[key] || CONFIG.VERSION;
};

// ==========================================
// ✨ 核心通用工具庫 (Core Utilities & Memory Cache)
// ==========================================

// 1. 記憶體快取版 Storage 管理器 (消滅重複的 JSON.parse 與同步 I/O 阻塞)
window.SysStorage = {
    _cache: new Map(),
    _prefix: 'sys_set_member:',
    _cacheKey(key, storage) {
        return (storage === localStorage ? 'L:' : 'S:') + key;
    },
    _members(key, storage, markers = null) {
        let list;
        try { list = JSON.parse(storage.getItem(key) || '[]'); } catch (_) {}
        const members = new Set(Array.isArray(list) ? list.filter(v => typeof v === 'string') : []);
        if (storage === localStorage) {
            const prefix = this._prefix + key + ':';
            for (let i = 0; i < storage.length; i++) {
                const name = storage.key(i);
                if (name && name.startsWith(prefix)) {
                    members.add(name.slice(prefix.length));
                    if (markers) markers.push(name);
                }
            }
        }
        return members;
    },
    getSet(key, storage = localStorage) {
        const ck = this._cacheKey(key, storage);
        if (!this._cache.has(ck)) {
            let set;
            try { set = this._members(key, storage); } catch (_) { set = new Set(); }
            this._cache.set(ck, set);
        }
        return this._cache.get(ck);
    },
    has(key, val, storage = localStorage) {
        return this.getSet(key, storage).has(val);
    },
    add(key, val, storage = localStorage) {
        const set = this.getSet(key, storage);
        if (set.has(val)) return false;
        try {
            // 即使另一個分頁的 storage 事件還沒送達，新增前也會看到它的金鑰／碎片。
            const latest = this._members(key, storage);
            latest.forEach(member => set.add(member));
            if (latest.has(val)) return false;
            if (storage !== localStorage) {
                latest.add(val);
                storage.setItem(key, JSON.stringify([...latest]));
            } else {
                // 各成員先各存一筆；兩個分頁即使同時寫，或在等鎖時關頁也不會互蓋。
                const marker = this._prefix + key + ':' + val;
                storage.setItem(marker, '1');
                const merge = compact => {
                    if (storage.getItem(marker) === null) return; // 已合併或使用者已重設
                    const markers = compact ? [] : null;
                    storage.setItem(key, JSON.stringify([...this._members(key, storage, markers)]));
                    // 同時收攏上次關頁留下的紀錄；只清除本次已寫入陣列的成員。
                    if (markers) markers.forEach(name => storage.removeItem(name));
                };
                if (window.navigator?.locks?.request) {
                    // 所有正常寫入在同一把鎖內合併回原本的陣列。若鎖被拒，獨立紀錄仍有效。
                    window.navigator.locks.request(this._prefix + key, () => merge(true))
                        .catch(err => console.warn('[SysStorage] 保留未合併的成員:', err));
                } else {
                    // 沒有 Web Locks 時保留成員紀錄，下一次讀取會與相容用陣列取聯集。
                    merge(false);
                }
            }
        } catch (err) {
            console.warn('[SysStorage] 寫入失敗:', err);
        }
        set.add(val);
        return true;
    },
    invalidate(key, storage) {
        if (key === null) {
            const scope = this._cacheKey('', storage);
            for (const name of this._cache.keys()) if (name.startsWith(scope)) this._cache.delete(name);
        } else {
            this._cache.delete(this._cacheKey(key, storage));
        }
    },
    removeLocalSet(key) {
        const prefix = this._prefix + key + ':';
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const name = localStorage.key(i);
            if (name && name.startsWith(prefix)) localStorage.removeItem(name);
        }
        localStorage.removeItem(key);
        this.invalidate(key, localStorage);
    },
    clearCache() { this._cache.clear(); }
};
window.addEventListener('storage', event => {
    const storage = event.storageArea;
    if (storage !== localStorage && storage !== sessionStorage) return;
    const prefix = window.SysStorage._prefix;
    const key = event.key?.startsWith(prefix) ? event.key.slice(prefix.length).split(':', 1)[0] : event.key;
    window.SysStorage.invalidate(key, storage);
    if (storage === localStorage && (key === null || key === 'sys_unlocked_secrets')) {
        window._keysUnlockedSinceLastIndex = true;
        if (!window._keysRefreshFrame) window._keysRefreshFrame = requestAnimationFrame(() => {
            window._keysRefreshFrame = 0;
            window.refreshHomeKeysUI();
        });
    }
});

// ==========================================
// ✨ 系統記憶備份與還原 (System Memory Transfer)
// ==========================================
window.SysMemory = {
    FORMAT: 'azustock-memory',
    VERSION: 1,
    MAX_BYTES: 2 * 1024 * 1024,
    SET_KEYS: ['sys_unlocked_secrets', 'sys_read_articles', 'sys_animated_secrets', 'sys_agreed_sensitive'],

    // 直接讀取持久化集合（含尚未合併的成員），不使用可能尚未同步的快取。
    snapshot(includeAgreements = false) {
        const data = {};
        for (const key of this.SET_KEYS) {
            if (key === 'sys_agreed_sensitive' && !includeAgreements) continue;
            data[key] = [...window.SysStorage._members(key, localStorage)].sort();
        }
        const theme = localStorage.getItem('theme');
        const scale = localStorage.getItem('sys_text_scale');
        if (theme === 'light' || theme === 'dark') data.theme = theme;
        if (['0', '1', '2'].includes(scale)) data.sys_text_scale = Number(scale);
        return {
            format: this.FORMAT, version: this.VERSION,
            siteVersion: CONFIG.VERSION, sourceOrigin: window.location.origin,
            exportedAt: new Date().toISOString(), data
        };
    },

    // 完整驗證後才允許任何寫入；未列入白名單的欄位不會被還原。
    validate(payload) {
        const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
        if (!isObject(payload) || payload.format !== this.FORMAT || payload.version !== this.VERSION || !isObject(payload.data)) {
            throw new Error('不支援的記憶備份格式或版本。');
        }
        const data = {};
        const has = key => Object.prototype.hasOwnProperty.call(payload.data, key);
        for (const key of this.SET_KEYS) {
            if (!has(key)) continue;
            const values = payload.data[key];
            if (!Array.isArray(values) || values.some(value => typeof value !== 'string' || !value.trim())) {
                throw new Error('記憶集合包含無效資料。');
            }
            data[key] = [...new Set(values)];
        }
        if (has('theme')) {
            if (!['light', 'dark'].includes(payload.data.theme)) throw new Error('備份的主題設定無效。');
            data.theme = payload.data.theme;
        }
        if (has('sys_text_scale')) {
            const value = payload.data.sys_text_scale;
            if (![0, 1, 2].includes(value)) throw new Error('備份的字體大小設定無效。');
            data.sys_text_scale = value;
        }
        if (!Object.keys(data).length) throw new Error('備份沒有可辨識的系統記憶。');
        return data;
    },

    describe(payload) {
        const parts = [];
        if (typeof payload.sourceOrigin === 'string' && payload.sourceOrigin.length <= 256) parts.push('來源：' + payload.sourceOrigin);
        if (typeof payload.siteVersion === 'string' && payload.siteVersion.length <= 80) parts.push('系統版本：' + payload.siteVersion);
        if (typeof payload.exportedAt === 'string' && payload.exportedAt.length <= 80) {
            const date = new Date(payload.exportedAt);
            if (!Number.isNaN(date.getTime())) parts.push('備份時間：' + date.toLocaleString());
        }
        return parts.join('｜') || '此備份未提供來源或版本資訊。';
    },

    // 沿用原有 SysStorage 的獨立成員寫入與 Web Locks 合併機制。
    // add() 會攔截儲存錯誤，因此額外檢查實際持久化的結果，而非只信任回傳值。
    merge(payload, { includeAgreements = false, restorePreferences = false } = {}) {
        const data = this.validate(payload);
        const result = { added: {}, preferences: 0, failed: 0 };
        const storage = window.SysStorage;
        for (const key of this.SET_KEYS) {
            if (!data[key] || (key === 'sys_agreed_sensitive' && !includeAgreements)) continue;
            const before = storage._members(key, localStorage);
            storage.invalidate(key, localStorage);
            for (const value of data[key]) {
                if (!before.has(value)) storage.add(key, value, localStorage);
            }
            storage.invalidate(key, localStorage);
            const after = storage._members(key, localStorage);
            result.added[key] = data[key].filter(value => !before.has(value) && after.has(value)).length;
            result.failed += data[key].filter(value => !after.has(value)).length;
        }
        if (restorePreferences) {
            for (const key of ['theme', 'sys_text_scale']) {
                if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
                try {
                    const value = String(data[key]);
                    if (localStorage.getItem(key) !== value) {
                        localStorage.setItem(key, value);
                        result.preferences++;
                    }
                } catch (_) { result.failed++; }
            }
        }
        return result;
    },

    download(includeAgreements = false, reason = '') {
        const payload = this.snapshot(includeAgreements);
        // 在使用者點擊事件內直接建立本機檔案，不經過 fetch 或外部服務。
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        if (blob.size > this.MAX_BYTES) throw new Error('備份超過 2 MiB，無法以目前格式安全匯出。');
        const filename = `azustock-memory${reason === 'before-import' || reason === 'before-reset' ? '-' + reason : ''}-${payload.exportedAt.replace(/[:.]/g, '-')}.json`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        try { link.click(); }
        finally {
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 30000);
        }
        return filename;
    }
};

// 2. HTML 字串安全跳脫與標籤剝除工具
window.escapeHtml = function(str) {
    return String(str ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
};

window.stripHtml = function(str) {
    return String(str ?? '').replace(/<[^>]+>/g, '');
};

// 3. 統計指定金鑰已收集的碎片數 (有指定總數時僅計數 1..reqCount)
window.countUnlockedFragments = function(baseId, reqCount = null) {
    const unlockedSet = window.SysStorage.getSet('sys_unlocked_secrets');
    if (typeof reqCount === 'number' && reqCount >= 1) {
        let count = 0;
        for (let i = 1; i <= reqCount; i++) {
            if (unlockedSet.has(`${baseId}#${i}`)) count++;
        }
        return count;
    }
    let count = 0;
    const prefix = baseId + '#';
    unlockedSet.forEach(k => { if (k.startsWith(prefix)) count++; });
    return count;
};

// 3b. 統一產生鎖定提示文字 (支援碎片進度顯示，取代原本散落 5 處的重複判斷)
window.getLockPromptText = function(item) {
    if (!item) return '';
    if (item.lock_prompt) return item.lock_prompt;
    const req = item.required_key;
    if (!req) return '';
    const isComplex = Array.isArray(req) || (typeof req === 'string' && (req.includes('||') || req.includes('&&')));
    if (isComplex) return '需要多重金鑰';
    if (typeof req === 'string') {
        const fragMatch = /^([^|]+)\|(\d+)$/.exec(req.trim());
        if (fragMatch) {
            const baseId = fragMatch[1].trim();
            const reqCount = parseInt(fragMatch[2], 10);
            if (baseId && reqCount >= 1) {
                const current = window.countUnlockedFragments(baseId, reqCount);
                return `需要收集 [${baseId}] 碎片 (${current}/${reqCount})`;
            }
        }
    }
    return `需要金鑰 [${req}]`;
};

// 4. 統一解析金鑰與碎片字串 (支援單一碎片 "KEY_A#1/5|SILENT" 與區間 "KEY_A#1~11|SILENT")
window.parseKeySpec = function(rawEntry) {
    if (typeof rawEntry !== 'string' || !rawEntry.trim()) return null;
    const silent = /\|\s*SILENT\s*$/i.test(rawEntry);
    const rawKey = rawEntry.replace(/\|\s*SILENT\s*$/i, '').trim();
    const match = /^([^#|]+)(?:#([^/#|]+)(?:\/(\d+))?)?$/.exec(rawKey);
    if (!match || !match[1].trim()) return null;

    const baseId = match[1].trim();
    const fragIndex = match[2] ? match[2].trim() : null;
    const reqCount = match[3] ? parseInt(match[3], 10) : 1;
    const hasExplicitTotal = !!match[3];

    if ((match[2] && !fragIndex) || (hasExplicitTotal && (isNaN(reqCount) || reqCount < 1))) {
        return null;
    }

    if (fragIndex && fragIndex.includes('~')) {
        const rangeMatch = /^(\d+)\s*~\s*(\d+)$/.exec(fragIndex);
        if (!rangeMatch) return null;
        const rangeStart = parseInt(rangeMatch[1], 10);
        const rangeEnd = parseInt(rangeMatch[2], 10);
        if (rangeStart < 1 || rangeEnd < rangeStart || (rangeEnd - rangeStart + 1) > 100) {
            return null;
        }
        const storeKeys = [];
        for (let i = rangeStart; i <= rangeEnd; i++) {
            storeKeys.push(`${baseId}#${i}`);
        }
        return {
            rawKey, baseId, fragIndex: `${rangeStart}~${rangeEnd}`,
            reqCount, hasExplicitTotal,
            storeKey: storeKeys[0], storeKeys,
            isRange: true, rangeStart, rangeEnd, silent
        };
    }

    const storeKey = fragIndex ? `${baseId}#${fragIndex}` : baseId;
    return {
        rawKey, baseId, fragIndex, reqCount, hasExplicitTotal,
        storeKey, storeKeys: [storeKey],
        isRange: false, rangeStart: null, rangeEnd: null, silent
    };
};

// 5. 同步喚醒畫面上已達解鎖條件的機密區塊
window.revealUnlockedSecretNodes = function(root = document) {
    const lockedNodes = root.querySelectorAll(
        '.md-secret-block.is-locked, .md-inline-secret.is-locked, .md-stealth-secret.is-locked, .md-stealth-block.is-locked, .pending-auto-unlock'
    );
    lockedNodes.forEach(block => {
        const reqId = block.getAttribute('data-secret-id');
        if (!reqId || !window.isSecretUnlocked(reqId)) return;
        block.classList.remove('is-locked', 'pending-auto-unlock');
        block.classList.add('is-unlocked');
        const placeId = block.getAttribute('data-place-id');
        if (placeId) window.SysStorage.add('sys_animated_secrets', placeId);
    });
};

// 6. 計算專案在當前權限下的可見文章數 (取代原本散落 5 處的 filter)
window.getVisibleArticleCount = function(proj) {
    if (!proj || !Array.isArray(proj.articles)) return 0;
    const isUnlockedSys = document.body.classList.contains('system-override-active');
    return proj.articles.filter(art => {
        const artLocked = art.required_key && !window.isSecretUnlocked(art.required_key);
        if (artLocked && (art.lock_mode || 'visible') === 'hidden') return false;
        return isUnlockedSys || !art.is_hidden;
    }).length;
};

// 7. 取得跑馬燈當前的 X 軸偏移量
window.getMarqueeCurrentX = function(marqueeEl, customWidth = null) {
    const width = customWidth || marqueeEl.offsetWidth;
    if (width <= 0) return 0;
    let currentX = new DOMMatrix(window.getComputedStyle(marqueeEl).transform).m41 % width;
    return currentX > 0 ? currentX - width : currentX;
};

// 8. 管理文章內的動態 Observer，於切換文章時統一釋放記憶體
window._articleObservers = [];
window.registerArticleObserver = function(observer) {
    if (observer) window._articleObservers.push(observer);
    return observer;
};
window.clearArticleObservers = function() {
    window._articleObservers.forEach(obs => {
        if (obs && typeof obs.disconnect === 'function') obs.disconnect();
    });
    window._articleObservers = [];
};


// 每次確定要離開目前畫面時更新代號，讓先前的下載與延後的畫面切換一起失效。
window._modalNavigation = 0;
window.beginModalNavigation = function() {
    const navigation = ++window._modalNavigation;
    if (window._activeFetcher) {
        window._activeFetcher.abort();
        window._activeFetcher = null;
        window.toggleLoading(false);
    }
    if (document.body.style.cursor === 'wait') document.body.style.cursor = '';
    window._cancelModalTransition?.();
    window.clearArticleObservers();
    return navigation;
};

// ==========================================
// ✨ 機密檔案解鎖記憶引擎 (支援碎片收集 Key Fragments & 多重邏輯 DNF)
// ==========================================
window.parseKeyLogic = function(input) {
    if (Array.isArray(input)) {
        if (input.length > 0 && typeof input[0] === 'string') {
            return input.map(k => [k]);
        }
        return input; 
    }
    if (typeof input !== 'string') return [];
    return input.split('||').map(group => {
        let cleanGroup = group.trim();
        if (cleanGroup.startsWith('(') && cleanGroup.endsWith(')')) {
            cleanGroup = cleanGroup.slice(1, -1).trim();
        }
        return cleanGroup.split('&&').map(k => k.trim()).filter(k => k.length > 0);
    }).filter(g => g.length > 0);
};

window.isSingleKeyUnlocked = function(reqStr) {
    if (!reqStr) return true;
    const parts = String(reqStr).split('|');
    const baseId = parts[0].trim();
    const reqCount = parts.length > 1 ? parseInt(parts[1], 10) : 1;
    
    const unlockedSet = window.SysStorage.getSet('sys_unlocked_secrets');
    if (unlockedSet.has(baseId)) return true; 
    
    if (parts.length > 1) {
        if (isNaN(reqCount) || reqCount < 1) return false;
        for (let i = 1; i <= reqCount; i++) {
            if (!unlockedSet.has(`${baseId}#${i}`)) return false; 
        }
        return true; 
    }
    return false;
};

window.isSecretUnlocked = function(input) {
    if (!input) return true;
    const dnf = window.parseKeyLogic(input);
    if (dnf.length === 0) return true;
    return dnf.some(andGroup => andGroup.every(key => window.isSingleKeyUnlocked(key)));
};

window.unlockSecret = function(rawKey) {
    const spec = window.parseKeySpec(rawKey);
    if (!spec) return null;
    const { baseId, fragIndex, reqCount, hasExplicitTotal, storeKeys, isRange, rangeStart, rangeEnd } = spec;

    let addedCount = 0;
    for (const key of storeKeys) {
        if (window.SysStorage.add('sys_unlocked_secrets', key)) addedCount++;
    }
    const currentCount = window.countUnlockedFragments(baseId, hasExplicitTotal ? reqCount : null);

    if (addedCount === 0) {
        return { status: 'ALREADY_HAVE', baseId, currentCount, reqCount, hasExplicitTotal, fragIndex, isRange, rangeStart, rangeEnd, addedCount: 0 };
    }
    
    window._keysUnlockedSinceLastIndex = true;
    setTimeout(() => { if (window.refreshHomeKeysUI) window.refreshHomeKeysUI(); }, 500);
    
    if (fragIndex) {
        const isComplete = hasExplicitTotal && currentCount >= reqCount;
        const status = isComplete
            ? 'GRANTED_FRAGMENTS_COMPLETE'
            : (isRange ? 'ACQUIRED_RANGE' : 'ACQUIRED_FRAGMENT');
        return {
            status, baseId, currentCount, reqCount, hasExplicitTotal,
            fragIndex, isRange, rangeStart, rangeEnd, addedCount
        };
    }
    return { status: 'GRANTED', baseId };
};

window.grantDetailKeys = function(spec) {
    const entries = Array.isArray(spec) ? spec.flat() : [spec];
    const received = [];
    for (const entry of entries) {
        if (typeof entry !== 'string' || !entry.trim()) continue;
        const parsed = window.parseKeySpec(entry);
        if (!parsed) {
            console.warn('[SYS] 已略過無效的 detail.json key 設定。');
            continue;
        }
        const result = window.unlockSecret(parsed.rawKey);
        if (result && result.status !== 'ALREADY_HAVE') received.push({ result, silent: parsed.silent });
    }
    if (!received.length) return false;

    window.revealUnlockedSecretNodes(document);

    const visible = received.filter(item => !item.silent);
    if (visible.length) {
        let title = '>_ ACCESS_GRANTED';
        let msg = '取得授權金鑰';
        let subMsg;
        if (visible.length === 1) {
            const result = visible[0].result;
            const baseId = window.escapeHtml(result.baseId);
            subMsg = `已解鎖機密 [${baseId}]`;
            if (result.status === 'ACQUIRED_RANGE') {
                title = '>_ FRAGMENT_ACQUIRED';
                msg = '批次取得金鑰碎片';
                subMsg = result.hasExplicitTotal
                    ? `已解鎖 [${baseId}#${result.rangeStart}~${result.rangeEnd}] (進度: ${result.currentCount}/${result.reqCount})`
                    : `已解鎖 [${baseId}#${result.rangeStart}~${result.rangeEnd}]`;
            } else if (result.status === 'ACQUIRED_FRAGMENT') {
                title = '>_ FRAGMENT_ACQUIRED';
                msg = '取得金鑰碎片';
                subMsg = result.hasExplicitTotal
                    ? `進度: ${result.currentCount}/${result.reqCount} [${baseId}]`
                    : `已取得碎片 [${baseId}#${window.escapeHtml(result.fragIndex)}]`;
            } else if (result.status === 'GRANTED_FRAGMENTS_COMPLETE') {
                msg = '金鑰合成完畢';
                subMsg = `權限已解開！(${result.currentCount}/${result.reqCount}) [${baseId}]`;
            }
        } else {
            msg = `取得 ${visible.length} 個金鑰或碎片`;
            subMsg = visible.map(({result}) => `[${window.escapeHtml(result.baseId)}${result.fragIndex ? '#' + window.escapeHtml(result.fragIndex) : ''}]`).join('、');
        }
        if (window.showSystemToast) window.showSystemToast(title, msg, subMsg, 6000, 'success');
        if (window.triggerHaptic) window.triggerHaptic('success');
    }
    return true;
};

// ✨ 動態文字解析引擎 (O(1) 快取查詢版)
window.parseDynamicText = function(text, renderContext = 'DEFAULT') {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\?\?\[(.*?)\](?:[ \t]*"([^"]+)")?\s*([\s\S]*?)\s*\?\?/g, function(match, key, cover, real) {
        const cleanKey = key.trim();
        const isUnlocked = window.isSecretUnlocked(cleanKey);
        
        if (renderContext === 'TOOLTIP') {
            return isUnlocked ? real.trim() : (cover || '***').trim();
        }

        let strHash = 0;
        for (let i = 0; i < match.length; i++) {
            strHash = Math.imul(31, strHash) + match.charCodeAt(i) | 0;
        }
        
        const placeId = `UI_FX_${renderContext}_${cleanKey}_${strHash}`;
        const hasAnimatedHere = window.SysStorage.has('sys_animated_secrets', placeId);

        let statusClass = 'is-locked';
        if (isUnlocked) {
            statusClass = hasAnimatedHere ? 'is-unlocked already-unlocked' : 'is-unlocked';
            if (!hasAnimatedHere) window.SysStorage.add('sys_animated_secrets', placeId);
        }

        return `<span class="md-stealth-secret ${statusClass}" data-secret-id="${cleanKey}" data-place-id="${placeId}"><span class="stealth-cover">${(cover || '***').trim()}</span><span class="stealth-real">${real.trim()}</span></span>`;
    });
};

window.syncProjectCardUI = function(card, proj) {
    if (!card || !proj) return;
    const pid = proj.id;
    const isLocked = proj.required_key && !window.isSecretUnlocked(proj.required_key);
    const isHiddenLock = (proj.lock_mode || 'visible') === 'hidden';
    const lockPrompt = window.getLockPromptText(proj);

    card.classList.toggle('sys-hidden-card', !!proj.is_hidden);
    card.classList.toggle('is-key-locked', !!(isLocked && !isHiddenLock));
    card.classList.toggle('key-hidden-card', !!(isLocked && isHiddenLock));

    let pin = card.querySelector('.card-secret-pin');
    if (isLocked || proj.is_hidden || proj.required_key) {
        if (!pin) {
            card.insertAdjacentHTML('afterbegin', `<div class="card-secret-pin">${GLOBAL_SVGS.secretPin}</div>`);
            pin = card.querySelector('.card-secret-pin');
        }
        pin.classList.toggle('key-lock-pin', !!isLocked);
    } else if (pin) {
        pin.remove();
    }

    const titleH3 = card.querySelector('.card-text h3');
    if (titleH3) {
        const cardTitleHtml = `<span class="card-title-text">${window.parseDynamicText(proj.title, 'CARD_TITLE')}</span>`;
        const cardMetaHtml = proj.meta ? ` <span class="card-meta-text">${window.parseDynamicText(proj.meta, 'CARD_META')}</span>` : '';
        titleH3.innerHTML = `${cardTitleHtml}${cardMetaHtml}`;
        titleH3.classList.remove('is-meta-wrapped');
        if (card.isConnected && window.syncCardMetaLayout) {
            window.requestAnimationFrame(() => window.syncCardMetaLayout(card));
        }
    }

    const descP = card.querySelector('.card-desc-text');
    if (descP) descP.innerHTML = window.parseDynamicText(proj.description, 'CARD_DESC');

    const actionBtn = card.querySelector('.card-action-btn');
    if (isLocked) {
        card.onclick = (e) => {
            e.stopPropagation();
            window.showSystemToast?.('>_ ACCESS_DENIED', '存取被拒', `${lockPrompt} 才能解鎖`, 4000, 'error');
        };
        if (actionBtn) {
            if (!isHiddenLock && proj.articles?.length) {
                actionBtn.style.color = 'var(--error-color)';
                actionBtn.innerHTML = `<div class="card-action-icon-wrap">${GLOBAL_SVGS.secretPinSmall}</div>${window.escapeHtml(lockPrompt)}解鎖`;
            } else if (proj.link) {
                actionBtn.style.color = '';
                actionBtn.innerHTML = `前往外部專案 <span class="action-arrow card-action-arrow" data-dir="up-right">${GLOBAL_SVGS.arrowUpRight}</span>`;
            }
        }
    } else {
        if (proj.articles && proj.articles.length > 0) {
            card.style.cursor = 'pointer';
            card.onclick = () => { if (window.currentActiveTag) window.clearFilter(); window.openProjectIndex(pid); };
            if (actionBtn) {
                actionBtn.style.color = '';
                const visibleCount = window.getVisibleArticleCount(proj);
                actionBtn.innerHTML = `<div class="card-action-icon-wrap">${GLOBAL_SVGS.folderClosed}${GLOBAL_SVGS.folderOpen}</div>展開系列 (${visibleCount})`;
            }
        } else if (proj.link) {
            card.style.cursor = 'pointer';
            card.onclick = () => {
                if (window.currentActiveTag) window.clearFilter();
                const a = document.createElement('a'); a.href = proj.link; a.target = '_blank'; a.rel = 'noopener noreferrer';
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                window.grantDetailKeys(proj.key);
            };
            if (actionBtn) {
                actionBtn.style.color = '';
                actionBtn.innerHTML = `前往外部專案 <span class="action-arrow card-action-arrow" data-dir="up-right">${GLOBAL_SVGS.arrowUpRight}</span>`;
            }
        } else {
            card.onclick = () => { if (window.currentActiveTag) window.clearFilter(); };
        }
    }
};

window.syncCardMetaLayout = function(root = document) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    const headings = root.matches && root.matches('.card-text h3')
        ? [root]
        : Array.from(root.querySelectorAll('.card-text h3'));

    headings.forEach(h3 => {
        const metaEl = h3.querySelector('.card-meta-text');
        if (!metaEl) {
            h3.classList.remove('is-meta-wrapped');
            return;
        }
        if (h3.offsetWidth === 0) return;

        // 先恢復為同行狀態量測實際可用寬度（會自動計入右側縮圖寬度）
        h3.classList.remove('is-meta-wrapped');

        const titleEl = h3.querySelector('.card-title-text');
        const metaRects = Array.from(metaEl.getClientRects()).filter(r => r.width > 0 && r.height > 0);
        if (metaRects.length === 0) return;

        const metaMinTop = Math.min(...metaRects.map(r => r.top));
        const metaMaxTop = Math.max(...metaRects.map(r => r.top));
        const metaLineHeight = metaRects[0].height || 16;
        let shouldWrap = (metaMaxTop - metaMinTop) > Math.max(4, metaLineHeight * 0.5);

        if (!shouldWrap && titleEl) {
            const titleRects = Array.from(titleEl.getClientRects()).filter(r => r.width > 0 && r.height > 0);
            if (titleRects.length > 0) {
                const titleLastRect = titleRects.reduce((acc, r) => (r.top > acc.top ? r : acc), titleRects[0]);
                const titleLineHeight = titleLastRect.height || 18;
                if ((metaMinTop - titleLastRect.top) > Math.max(4, titleLineHeight * 0.45)) {
                    shouldWrap = true;
                }
            }
        }

        h3.classList.toggle('is-meta-wrapped', shouldWrap);
    });
};

let _cardMetaResizeFrame = null;
window.addEventListener('resize', () => {
    if (_cardMetaResizeFrame !== null) return;
    _cardMetaResizeFrame = window.requestAnimationFrame(() => {
        _cardMetaResizeFrame = null;
        window.syncCardMetaLayout();
        if (window.syncSocialIconsLayout) window.syncSocialIconsLayout();
    });
});

window.refreshHomeKeysUI = function() {
    document.querySelectorAll('.card').forEach(card => {
        const pid = card.getAttribute('data-project-id');
        const proj = window.siteProjects.find(p => p.id === pid);
        if (proj) window.syncProjectCardUI(card, proj);
    });
};

// ==========================================
// ✨ 敏感內容雙軌儲存引擎 (Session vs Local)
// ==========================================
window.hasAgreedToSensitive = function(key) {
    if (window._agreedSensitiveTypes && window._agreedSensitiveTypes.has(key)) return true;
    if (window.SysStorage.has('sys_agreed_sensitive', key, localStorage)) return true;
    if (window.SysStorage.has('sys_session_agreed_sensitive', key, sessionStorage)) return true;
    return false;
};

window.saveSensitiveAgreement = function(key, permanent) {
    if (!window._agreedSensitiveTypes) window._agreedSensitiveTypes = new Set();
    window._agreedSensitiveTypes.add(key);
    window.SysStorage.add('sys_session_agreed_sensitive', key, sessionStorage);
    if (permanent) {
        window.SysStorage.add('sys_agreed_sensitive', key, localStorage);
    }
};


// 解析舊版警告設定，以及每個警告各自設定略過條件的物件格式。
window.parseSensitiveSetting = function(setting) {
    if (!setting) return { types: [], bypassKey: null };

    if (typeof setting === 'object' && !Array.isArray(setting)) {
        // 此檢查僅用在新版物件格式，不改變既有 required_key 的行為。
        // 空條件在 isSecretUnlocked 中會被視為通過，因此不能直接交給它。
        const validAtom = atom => {
            if (typeof atom !== 'string' || !atom.trim()) return false;
            const parts = atom.trim().split('|');
            if (parts.length > 2 || !parts[0].trim()) return false;
            return parts.length === 1 || (/^\d+$/.test(parts[1].trim()) && parseInt(parts[1], 10) > 0);
        };
        const validCondition = value => {
            if (typeof value === 'string') {
                if (!value.trim()) return false;
                return value.split('||').every(rawGroup => {
                    let group = rawGroup.trim();
                    if (!group) return false;
                    if (group.startsWith('(') && group.endsWith(')')) group = group.slice(1, -1).trim();
                    // 與既有 DNF 語法一致：僅接受整個 AND 群組的外層括號。
                    if (!group || /[()]/.test(group)) return false;
                    return group.split('&&').every(validAtom);
                });
            }
            if (!Array.isArray(value) || !value.length) return false;
            if (value.every(item => typeof item === 'string')) return value.every(validAtom);
            return value.every(group => Array.isArray(group) && group.length > 0 && group.every(validAtom));
        };

        const types = [];
        const bypassByType = Object.create(null);
        for (const [rawType, condition] of Object.entries(setting)) {
            if (condition === false) continue;
            const name = rawType.trim().toUpperCase();
            const known = Object.prototype.hasOwnProperty.call(window.SENSITIVE_TEMPLATES, name);
            const type = known ? name : 'DEFAULT';
            if (!known) console.warn(`[SYS] 未知的 sensitive 警告類型「${rawType}」，改顯示 DEFAULT。`);
            if (Object.prototype.hasOwnProperty.call(bypassByType, type)) {
                // 相同類型若被重複定義，保留警告並停用此類型的略過條件。
                bypassByType[type] = null;
                console.warn(`[SYS] sensitive 警告類型「${type}」重複，已停用其略過條件。`);
                continue;
            }
            types.push(type);
            bypassByType[type] = null;
            if (!known || condition === true) continue;
            if (validCondition(condition)) bypassByType[type] = condition;
            else console.warn(`[SYS] sensitive 警告「${type}」的略過條件無效，將顯示警告。`);
        }
        return { types, bypassKey: null, bypassByType };
    }

    let bypassKey = null;
    let values;
    if (Array.isArray(setting)) {
        values = setting.flatMap(value => String(value).split(/\|\||[,+&]/));
    } else if (typeof setting === 'string') {
        let value = setting.trim();
        const match = value.match(/^(.*?)\s+\|\s+(.*)$/);
        if (match) {
            value = match[1].trim();
            bypassKey = match[2].trim();
        }
        values = value.split(/\|\||[,+&]/);

        // 舊格式中，未指定模板的整個字串是一個金鑰條件，放行前顯示 DEFAULT。
        const hasKnownType = values.some(type =>
            Object.prototype.hasOwnProperty.call(window.SENSITIVE_TEMPLATES, type.trim().toUpperCase())
        );
        if (!match && !hasKnownType) {
            bypassKey = value;
            values = ['DEFAULT'];
        }
    } else {
        values = ['DEFAULT'];
    }

    const types = values.map(value => value.trim().toUpperCase()).filter(Boolean).map(type =>
        Object.prototype.hasOwnProperty.call(window.SENSITIVE_TEMPLATES, type) ? type : 'DEFAULT'
    );
    return { types: [...new Set(types.length ? types : ['DEFAULT'])], bypassKey };
};

window.getPendingSensitiveWarning = function(setting, agreePrefix, legacyKeys = []) {
    const { types, bypassKey, bypassByType } = window.parseSensitiveSetting(setting);
    if (bypassKey && window.isSecretUnlocked(bypassKey)) return null;
    // 保留舊紀錄原本的有效期限，避免把工作階段的同意自動變成永久同意。
    if (legacyKeys.some(key => window.hasAgreedToSensitive(key))) return null;
    for (const type of types) {
        const key = `${agreePrefix}_${type}`;
        if (window.hasAgreedToSensitive(key)) continue;
        const condition = bypassByType && bypassByType[type];
        if (condition && window.isSecretUnlocked(condition)) continue;
        return { type, key, bypassCondition: condition || bypassKey || null };
    }
    return null;
};

// ✨ 文章已讀紀錄與 MAIN 警告「最前面未閱讀文章」搜尋引擎
window.getArticleReadKey = function(projectId, article, articleIndex) {
    return `${projectId}:${article?.id || articleIndex}`;
};

window.markArticleRead = function(projectId, article, articleIndex) {
    if (!projectId || !article) return;
    window.SysStorage.add('sys_read_articles', window.getArticleReadKey(projectId, article, articleIndex));
};

window.hasReadArticle = function(projectId, article, articleIndex) {
    if (!projectId || !article) return false;
    return window.SysStorage.has('sys_read_articles', window.getArticleReadKey(projectId, article, articleIndex));
};

window.findFirstUnreadArticleForMain = function(projectId, currentArticleIndex = null, bypassCondition = null) {
    const projects = Array.isArray(window.siteProjects) ? window.siteProjects : [];
    const currentProj = projects.find(p => p.id === projectId);
    if (!currentProj || !Array.isArray(currentProj.articles)) return null;

    const isUnlockedSys = document.body?.classList?.contains('system-override-active') || false;
    const isProjAccessible = (proj) => {
        if (!proj || !Array.isArray(proj.articles)) return false;
        if (proj.required_key && !window.isSecretUnlocked(proj.required_key)) return false;
        if (!isUnlockedSys && proj.is_hidden) return false;
        return true;
    };
    const isArtAccessible = (art) => {
        if (!art) return false;
        if (art.required_key && !window.isSecretUnlocked(art.required_key)) return false;
        if (!isUnlockedSys && art.is_hidden) return false;
        return true;
    };
    const getReadingOrder = (proj) => {
        const indexed = proj.articles.map((art, idx) => ({ art, idx }));
        if (proj.groups && Object.keys(proj.groups).length > 0) {
            const ordered = [];
            for (const groupId of Object.keys(proj.groups)) {
                ordered.push(...indexed.filter(item => item.art.group === groupId));
            }
            ordered.push(...indexed.filter(item => !item.art.group));
            return ordered;
        }
        return indexed;
    };
    const articleGrantsKey = (art, targetStoreKey) => {
        if (!art?.key) return false;
        const entries = Array.isArray(art.key) ? art.key.flat() : [art.key];
        return entries.some(entry => {
            const parsed = window.parseKeySpec(entry);
            return parsed && parsed.storeKeys.includes(targetStoreKey);
        });
    };

    const currentOrdered = getReadingOrder(currentProj);

    // 1. 優先依 MAIN 綁定的略過金鑰反查：找出第一把尚未取得的金鑰對應的文章（先找本專案，再找其他專案）
    if (bypassCondition) {
        const dnf = window.parseKeyLogic(bypassCondition);
        const targetGroup = dnf.find(group => !group.every(k => window.isSingleKeyUnlocked(k)));
        if (targetGroup) {
            const unlockedSet = window.SysStorage.getSet('sys_unlocked_secrets');
            const missingKeys = [];
            for (const reqStr of targetGroup) {
                if (window.isSingleKeyUnlocked(reqStr)) continue;
                const parts = String(reqStr).split('|');
                const baseId = parts[0].trim();
                if (parts.length > 1) {
                    const reqCount = parseInt(parts[1], 10);
                    if (!isNaN(reqCount) && reqCount >= 1) {
                        for (let i = 1; i <= reqCount; i++) {
                            const fragKey = `${baseId}#${i}`;
                            if (!unlockedSet.has(fragKey)) missingKeys.push(fragKey);
                        }
                    }
                } else if (baseId) {
                    missingKeys.push(baseId);
                }
            }

            for (const missingKey of missingKeys) {
                const matchInCurrent = currentOrdered.find(({ art, idx }) =>
                    idx !== currentArticleIndex && isArtAccessible(art) && articleGrantsKey(art, missingKey)
                );
                if (matchInCurrent) {
                    return { projectId: currentProj.id, articleIndex: matchInCurrent.idx, article: matchInCurrent.art };
                }
            }
            for (const missingKey of missingKeys) {
                for (const otherProj of projects) {
                    if (otherProj.id === currentProj.id || !isProjAccessible(otherProj)) continue;
                    const matchInOther = getReadingOrder(otherProj).find(({ art }) =>
                        isArtAccessible(art) && articleGrantsKey(art, missingKey)
                    );
                    if (matchInOther) {
                        return { projectId: otherProj.id, articleIndex: matchInOther.idx, article: matchInOther.art };
                    }
                }
            }
        }
    }

    // 2. 兜底：在整個專案依閱讀順序找目前文章之前的第一篇未讀文章
    let candidates = currentOrdered;
    if (currentArticleIndex !== null) {
        const curPos = currentOrdered.findIndex(item => item.idx === currentArticleIndex);
        candidates = curPos > 0 ? currentOrdered.slice(0, curPos) : [];
    }
    const unread = candidates.find(({ art, idx }) =>
        isArtAccessible(art) && !window.hasReadArticle(currentProj.id, art, idx)
    );
    return unread ? { projectId: currentProj.id, articleIndex: unread.idx, article: unread.art } : null;
};


// ==========================================
// ✨ 全域字體縮放引擎 (Text Scaling Engine)
// ==========================================
window.currentTextScale = parseInt(localStorage.getItem('sys_text_scale')) || 0; 

window.applyTextScale = function() {
    // ✨ 全站縮放：100% (標準) -> 110% (微放) -> 125% (大字)
    const sizes = ['100%', '110%', '125%'];
    document.documentElement.style.setProperty('--sys-base-font-size', sizes[window.currentTextScale]);
    
    const recalcTabs = () => {
        const viewArticle = document.getElementById('view-article');
        if (viewArticle && viewArticle.style.display !== 'none' && window.syncTabPanelsHeight) {
            window.syncTabPanelsHeight(viewArticle);
        }
        if (window.syncCardMetaLayout) {
            window.syncCardMetaLayout();
        }
        if (window.syncSocialIconsLayout) {
            window.syncSocialIconsLayout();
        }
    };

    requestAnimationFrame(recalcTabs);
    setTimeout(() => {
        recalcTabs();
        const activeContainer = window.getActiveScrollContainer();
        if (activeContainer) activeContainer.dispatchEvent(new Event('scroll'));
    }, 350);

    const onFontTransitionEnd = (e) => {
        if (e.target === document.documentElement && e.propertyName === 'font-size') {
            document.documentElement.removeEventListener('transitionend', onFontTransitionEnd);
            recalcTabs();
        }
    };
    document.documentElement.addEventListener('transitionend', onFontTransitionEnd);
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
    document.body.style.overflow = 'hidden';
};

// 延遲動畫可能交錯；以仍在畫面上的捲動鎖定層為準。
function hasActiveScrollLock() {
    return !!document.querySelector(
        '#fullscreen-menu.active, #pdf-action-modal, #md-modal.active, .modal-overlay.active, ' +
        '#sensitive-modal-overlay, video.is-web-fullscreen, #sys-reboot-screen'
    );
}

window.unlockScroll = function(overflow = '') {
    if (!hasActiveScrollLock()) document.body.style.overflow = overflow;
};

// ==========================================
// ✨ PWA 下拉重整：手勢鎖定與平滑回原點引擎
// ==========================================
window.initPWAPullToRefresh = function() {
    if (!window.isPWAEnvironment() || window.__pwaPullToRefreshInitialized) return;
    window.__pwaPullToRefreshInitialized = true;

    let indicator = document.getElementById('pwa-refresh-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'pwa-refresh-indicator';
        indicator.className = 'pwa-refresh-indicator';
        document.body.appendChild(indicator);
    }
    indicator.innerHTML = GLOBAL_SVGS.mermaidReload;
    indicator.setAttribute('aria-hidden', 'true');

    const deadZone = 25; // 指示器的視覺死區；觸控攔截需要更早判定
    const directionTolerance = 6;
    const returnTransition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
    const hiddenTransform = 'translate(-50%, -100%) scale(1)';
    const ignoredTargets = '.gallery, .vertical-wrapper, .tab-buttons, .grid, .mermaid-wrapper, ' +
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), ' +
        'video, audio, canvas, [data-pwa-pull-ignore]';

    let gesture = null;
    let ignoreUntilAllReleased = false;
    let isRefreshing = false;
    let lastPullEndTime = null;

    const getDynamicThreshold = () => Math.max(Math.min(Math.round(window.innerHeight * 0.12), 100), 50);

    const hideIndicator = (animate = true) => {
        indicator.style.transition = animate ? returnTransition : 'none';
        indicator.style.setProperty('transform', hiddenTransform, 'important');
        indicator.style.opacity = '0';
        indicator.classList.remove('ready', 'is-reloading', 'is-success');
    };

    const cancelGesture = (animate = true) => {
        gesture = null;
        hideIndicator(animate);
    };

    const getRefreshContext = (target) => {
        if (document.getElementById('lightbox-modal')?.classList.contains('is-active')) return null;
        if (document.getElementById('sensitive-modal-overlay')) return null;
        if (document.getElementById('pdf-action-modal')) return null;
        if (document.getElementById('sys-reboot-screen')) return null;
        if (document.fullscreenElement || document.querySelector('video.is-web-fullscreen')) return null;

        const menu = document.getElementById('fullscreen-menu');
        if (menu && menu.classList.contains('active')) {
            return menu.contains(target) ? { el: menu, scrollTop: menu.scrollTop } : null;
        }

        const modal = document.getElementById('md-modal');
        const modalContent = document.querySelector('.modal-content');
        if (modal && modal.classList.contains('active')) {
            return modalContent && modalContent.contains(target)
                ? { el: modalContent, scrollTop: modalContent.scrollTop }
                : null;
        }

        const root = document.scrollingElement || document.documentElement;
        if (!root.contains(target)) return null;
        return {
            el: root,
            scrollTop: window.scrollY !== undefined ? window.scrollY : (root.scrollTop || 0)
        };
    };

    // 只在 touchstart 搜尋捲動祖先；後續移動時僅檢查已找到的容器。
    const getNestedScrollers = (target, contextElement) => {
        const result = [];
        for (let node = target; node && node !== contextElement; node = node.parentElement) {
            const overflowY = window.getComputedStyle(node).overflowY;
            if (/^(auto|scroll|overlay)$/.test(overflowY) && node.scrollHeight > node.clientHeight + 1) {
                result.push(node);
            }
        }
        return result;
    };

    const contextStillAtTop = (currentGesture) => {
        if (currentGesture.target.isConnected === false) return false;
        const ctx = getRefreshContext(currentGesture.target);
        return !!ctx && ctx.el === currentGesture.contextElement && ctx.scrollTop <= 0 &&
            currentGesture.nestedScrollers.every(el => el.scrollTop <= 0);
    };

    const findTouch = (touches, identifier) => {
        for (let i = 0; i < touches.length; i++) {
            if (touches[i].identifier === identifier) return touches[i];
        }
        return null;
    };

    const haptic = (type) => {
        if (typeof window.triggerHaptic === 'function') window.triggerHaptic(type);
    };

    const beginReload = (threshold) => {
        isRefreshing = true;
        indicator.style.transition = returnTransition;
        indicator.classList.remove('ready', 'is-success');
        indicator.classList.add('is-reloading');
        indicator.style.setProperty('transform', `translate(-50%, calc(${threshold}px - 100%)) scale(1)`, 'important');
        const icon = indicator.querySelector('svg');
        if (icon) icon.style.transform = '';
        haptic('light');

        // 顯示處理中，不在 reload 前顯示「已成功」的勾號。
        setTimeout(() => {
            // 若其他更新流程已建立重開機畫面，交由該流程繼續處理。
            if (document.getElementById('sys-reboot-screen')) {
                isRefreshing = false;
                hideIndicator();
                return;
            }

            const previousOverflow = hasActiveScrollLock() ? '' : document.body.style.overflow;
            let ownRebootScreen = null;
            try {
                const showReboot = typeof window.showSystemRebootScreen === 'function'
                    ? window.showSystemRebootScreen
                    : (typeof showSystemRebootScreen === 'function' ? showSystemRebootScreen : null);
                if (showReboot) {
                    showReboot('MANUAL_RELOAD', CONFIG.VERSION, 'N/A', 'RELOADING', true);
                    ownRebootScreen = document.getElementById('sys-reboot-screen');
                }
            } catch (error) {
                ownRebootScreen = document.getElementById('sys-reboot-screen');
                console.warn('[PWA_REFRESH] 無法顯示重整畫面，仍會嘗試重新載入。', error);
            }

            const restoreAfterFailure = () => {
                if (!isRefreshing) return;
                isRefreshing = false;
                if (ownRebootScreen && document.getElementById('sys-reboot-screen') === ownRebootScreen) {
                    ownRebootScreen.remove();
                }
                if (document.body.style.overflow === 'hidden') window.unlockScroll(previousOverflow);
                hideIndicator();
                if (typeof window.showSystemToast === 'function') {
                    window.showSystemToast('>_ RELOAD_INCOMPLETE', '重新整理尚未完成', '請再次嘗試。', 6000, 'error');
                }
            };

            // 留一個繪製機會給過場畫面；若導覽遭取消或長時間未完成，允許重試。
            setTimeout(() => {
                const retryTimer = setTimeout(restoreAfterFailure, 15000);
                try {
                    window.location.reload();
                } catch (error) {
                    clearTimeout(retryTimer);
                    console.warn('[PWA_REFRESH] 重新整理失敗。', error);
                    restoreAfterFailure();
                }
            }, 400);
        }, 700);
    };

    hideIndicator(false);

    document.addEventListener('touchstart', (e) => {
        if (isRefreshing) return;
        if (e.touches.length !== 1) {
            if (gesture) cancelGesture();
            ignoreUntilAllReleased = true;
            return;
        }
        if (ignoreUntilAllReleased) return;

        // 任何提前返回都不能沿用上一次的手勢。
        if (gesture) cancelGesture(false);
        const target = e.target && e.target.nodeType === 1 ? e.target : e.target?.parentElement;
        if (!target || target.closest(ignoredTargets)) return;

        const ctx = getRefreshContext(target);
        if (!ctx || ctx.scrollTop > 0) return;
        const nestedScrollers = getNestedScrollers(target, ctx.el);
        if (nestedScrollers.some(el => el.scrollTop > 0)) return;

        const touch = e.touches[0];
        const startedAt = Date.now();
        const repeatedPull = lastPullEndTime !== null && startedAt - lastPullEndTime < 500;
        gesture = {
            id: touch.identifier,
            target,
            contextElement: ctx.el,
            nestedScrollers,
            startX: touch.clientX,
            startY: touch.clientY,
            threshold: getDynamicThreshold() * (repeatedPull ? 1.2 : 1),
            phase: 'tracking',
            startedPull: false,
            canRefresh: false
        };
        hideIndicator(false);
        indicator.innerHTML = GLOBAL_SVGS.mermaidReload;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (isRefreshing || ignoreUntilAllReleased || !gesture) return;
        if (e.touches.length !== 1) {
            cancelGesture();
            ignoreUntilAllReleased = e.touches.length > 0;
            return;
        }
        const touch = findTouch(e.touches, gesture.id);
        if (!touch || !contextStillAtTop(gesture)) {
            cancelGesture();
            return;
        }

        const diffX = Math.abs(touch.clientX - gesture.startX);
        const diffY = touch.clientY - gesture.startY;

        if (gesture.phase === 'tracking') {
            // 水平或向上的意圖明確時退出；微小的水平漂移先不攔截。
            if (diffY <= 0 || diffX >= diffY) {
                if (diffX > directionTolerance || -diffY > directionTolerance) cancelGesture(false);
                return;
            }
            // 瀏覽器已接管或其他元件已處理時，不顯示無法真正接管的下拉動畫。
            if (!e.cancelable || e.defaultPrevented) {
                cancelGesture(false);
                return;
            }
            e.preventDefault();
            if (!e.defaultPrevented) {
                cancelGesture(false);
                return;
            }
            gesture.phase = 'pulling';
        } else if (diffY > 0 && e.cancelable) {
            // 已接管後，往下拉和往回推都維持攔截，避免原生捲動搶走手勢。
            e.preventDefault();
        }

        if (diffY <= 0) {
            gesture.canRefresh = false;
            indicator.style.setProperty('transform', hiddenTransform, 'important');
            indicator.style.opacity = '0';
            indicator.classList.remove('ready');
            return;
        }

        if (diffY > deadZone) gesture.startedPull = true;
        const effectivePull = Math.max(0, diffY - deadZone);
        const rawDistance = effectivePull * 0.4;
        const displayedDistance = Math.min(rawDistance, gesture.threshold);
        indicator.style.opacity = Math.min(diffY / 30, 1).toString();
        const icon = indicator.querySelector('svg');
        if (icon) icon.style.transform = `rotate(${-effectivePull * 1.8}deg)`;

        const ready = rawDistance >= gesture.threshold;
        if (ready !== gesture.canRefresh) {
            gesture.canRefresh = ready;
            indicator.classList.toggle('ready', ready);
            haptic('light');
        }
        indicator.style.setProperty('transform',
            `translate(-50%, calc(${displayedDistance}px - 100%)) scale(${ready ? 1.1 : 1})`, 'important');
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (isRefreshing) return;
        if (ignoreUntilAllReleased) {
            if (e.touches.length === 0) ignoreUntilAllReleased = false;
            return;
        }
        if (!gesture || !findTouch(e.changedTouches, gesture.id)) return;
        if (e.touches.length > 0 || !contextStillAtTop(gesture)) {
            cancelGesture();
            ignoreUntilAllReleased = e.touches.length > 0;
            return;
        }

        const completed = gesture;
        gesture = null;
        if (completed.startedPull) lastPullEndTime = Date.now();
        if (completed.phase === 'pulling' && completed.canRefresh) beginReload(completed.threshold);
        else hideIndicator();
    });

    document.addEventListener('touchcancel', (e) => {
        if (isRefreshing) return;
        if (gesture) cancelGesture();
        ignoreUntilAllReleased = e.touches.length > 0;
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && gesture && !isRefreshing) cancelGesture();
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

window.resolveRouteTarget = function(pParam, aParam) {
    if (!pParam) return { project: null, article: null, aIndex: -1 };
    const cleanProjectId = pParam.replace(/^\d+_/, '');
    const project = window.siteProjects.find(proj => proj.id === cleanProjectId) || null;
    let aIndex = -1, article = null;
    if (project && Array.isArray(project.articles) && aParam !== null && aParam !== undefined) {
        aIndex = project.articles.findIndex(art => art.id === aParam);
        if (aIndex === -1 && !isNaN(parseInt(aParam, 10))) aIndex = parseInt(aParam, 10);
        if (aIndex >= 0 && aIndex < project.articles.length) article = project.articles[aIndex];
        else aIndex = -1;
    }
    return { project, article, aIndex };
};

window.handleAppRouting = function(pParam, aParam, hashParam = null) {
    if (!pParam) return;
    
    const { project, article, aIndex } = window.resolveRouteTarget(pParam, aParam);
    
    if (!project) {
        show404Modal('404 Project Not Found', '無法找到您指定的專案。<br/>可能不存在或已被移除');
        window.history.replaceState(null, '', window.location.pathname);
        return;
    }

    const isUnlockedSys = document.body.classList.contains('system-override-active');
    
    // ✨ 1. 專案層級：只要專案未公開 (is_hidden) 或金鑰未解鎖 (projLocked)，從網址進入一律先攔截顯示 403
    const projLocked = project.required_key && !window.isSecretUnlocked(project.required_key);
    const projHidden = !isUnlockedSys && project.is_hidden;

    if (projHidden || projLocked) {
        show404Modal('403 ACCESS_DENIED', '拒絕存取。<br/><span style="opacity: 0.8; font-size: 0.85em; font-family: monospace;">ERR_SEC_PROTOCOL: Unauthorized request blocked by <span style="cursor: pointer; position: relative;" class="secret-admin-trigger">風川梓</span>.</span>');
        return;
    }

    if (aParam !== null && aParam !== undefined) {
        if (article) {
            
            // ✨ 2. 文章層級：只要文章未公開 (is_hidden) 或金鑰未解鎖 (artLocked)，從網址進入同樣先攔截顯示 403
            const artLocked = article.required_key && !window.isSecretUnlocked(article.required_key);
            const artHidden = !isUnlockedSys && article.is_hidden;
            
            if (artHidden || artLocked) {
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
        .filter(item => { const artLocked = item.art.required_key && !window.isSecretUnlocked(item.art.required_key); if (artLocked && (item.art.lock_mode || 'visible') === 'hidden') return false; return isUnlocked || !item.art.is_hidden; })
    
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
    if (!targetCard) return;
    const cardRect = targetCard.getBoundingClientRect();
    const grid = targetCard.closest('.grid');
    const gridRect = grid ? grid.getBoundingClientRect() : null;

    // 垂直可視區：避開頂部空間與底部啟用中的篩選提示膠囊 (.filter-toast)
    const toastEl = document.getElementById('filter-toast');
    const toastTop = (toastEl && toastEl.classList.contains('active'))
        ? toastEl.getBoundingClientRect().top
        : window.innerHeight;
    const topSafe = 80;
    const bottomSafe = Math.max(topSafe + 40, Math.min(window.innerHeight - 16, toastTop - 16));
    const isVisibleY = cardRect.top >= topSafe && cardRect.bottom <= bottomSafe;

    // 水平可視區：以所屬 .grid 容器與視窗的交集為準，避免卡片在 .grid 內被左右裁切
    const visLeft = gridRect ? Math.max(0, gridRect.left) : 0;
    const visRight = gridRect ? Math.min(window.innerWidth, gridRect.right) : window.innerWidth;
    const availWidth = Math.max(0, visRight - visLeft);
    const padX = Math.min(16, Math.max(0, (availWidth - cardRect.width) / 2));
    const isVisibleX = cardRect.left >= visLeft + padX && cardRect.right <= visRight - padX;

    let distanceX = 0;
    let distanceY = 0;

    if (!isVisibleX && grid && grid.scrollWidth > grid.clientWidth) {
        const cardLeftInGrid = (cardRect.left - gridRect.left) + grid.scrollLeft;
        const idealLeft = cardLeftInGrid - (grid.clientWidth - cardRect.width) / 2;
        const targetLeft = Math.max(0, Math.min(idealLeft, grid.scrollWidth - grid.clientWidth));
        distanceX = Math.abs(targetLeft - grid.scrollLeft);
        grid.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }

    if (!isVisibleY) {
        const usableCenterY = (topSafe + bottomSafe) / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        const deltaY = cardCenterY - usableCenterY;
        const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const targetTop = Math.max(0, currentScrollY + deltaY);
        distanceY = Math.abs(targetTop - currentScrollY);
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }

    const needsScroll = distanceX > 2 || distanceY > 2;
    const dynamicDelay = needsScroll
        ? Math.min(800, Math.max(300, 200 + Math.max(distanceX, distanceY) * 0.4))
        : 50;

    clearTimeout(targetCard._bumpDelayTimer);
    clearTimeout(targetCard._bumpEndTimer);
    targetCard._bumpDelayTimer = setTimeout(() => {
        targetCard.classList.remove('jump-bump');
        void targetCard.offsetWidth;
        targetCard.classList.add('jump-bump');
        targetCard._bumpEndTimer = setTimeout(() => targetCard.classList.remove('jump-bump'), 600);
    }, dynamicDelay);
};

// ==========================================
// ✨ 系統權限切換重刷引擎 (System Override UI Updater)
// ==========================================
window.refreshUIAfterOverrideToggle = function() {
    const isUnlocked = document.body.classList.contains('system-override-active');

    const updateCardCounts = () => {
        document.querySelectorAll('.card[data-project-id]').forEach(card => {
            const pid = card.getAttribute('data-project-id');
            const proj = window.siteProjects.find(p => p.id === pid);
            if (!proj || !proj.articles || proj.articles.length === 0) return;

            const actionBtn = card.querySelector('.card-action-btn');
            if (actionBtn && actionBtn.innerText.includes('展開系列')) {
                const count = window.getVisibleArticleCount(proj);
                const iconWrap = actionBtn.querySelector('.card-action-icon-wrap');
                actionBtn.innerHTML = '';
                if (iconWrap) actionBtn.appendChild(iconWrap);
                actionBtn.insertAdjacentHTML('beforeend', `展開系列 (${count})`);
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
        m.dataset.startX = window.getMarqueeCurrentX(m); 
        
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
window.loadDelimitedMarkdown = async function(filename, cacheKey) {
    if (window[cacheKey] !== null) return window[cacheKey];
    try {
        const res = await fetch(`./${filename}?v=${window.getResVersion(filename)}`);
        if (res.ok) {
            const text = await res.text();
            window[cacheKey] = text.split('---').map(n => n.trim()).filter(n => n.length > 0);
        } else {
            window[cacheKey] = [];
        }
    } catch (err) { window[cacheKey] = []; }
    return window[cacheKey];
};

window.cachedKotobaList = null;
window.getKotobaList = async function() {
    return window.loadDelimitedMarkdown('kotoba.md', 'cachedKotobaList');
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
    return window.loadDelimitedMarkdown('quotes.md', 'cachedQuotesList');
};

// ==========================================
// ✨ 全域共用輔助函式 (Global Helpers)
// ==========================================

// 1. 判斷是否為 PWA (Standalone) 模式
window.isPWAEnvironment = function() {
    return Boolean((typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone);
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
    const scroller = window.getActiveScrollContainer() || container; 
    if (!container) return currentCache || 0;
    
    // ✨ 終極佈局隔離：確保計算期間，另一個視圖絕對不會佔用空間推擠座標！
    const viewArticle = document.getElementById('view-article');
    const viewIndex = document.getElementById('view-index');
    const articleWasVisible = viewArticle && viewArticle.style.display !== 'none';
    const indexWasVisible = viewIndex && viewIndex.style.display !== 'none';

    const wasHidden = container.style.display === 'none';
    
    if (wasHidden) {
        if (containerId === 'view-index' && articleWasVisible) viewArticle.style.display = 'none';
        if (containerId === 'view-article' && indexWasVisible) viewIndex.style.display = 'none';
        
        container.style.visibility = 'hidden';
        container.style.display = 'block';
    }
    
    let finalScroll = currentCache || 0;
    const targetItem = document.getElementById(targetItemId);
    
    if (targetItem) {
        const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 80;
        const itemTop = window.getRelativeOffsetTop(targetItem, scroller); 
        const itemBottom = itemTop + targetItem.offsetHeight;
        const containerHeight = scroller.clientHeight || window.innerHeight; 
        
        // 判斷目標是否超出現在的捲軸可視範圍，並進行微調
        if (itemTop < finalScroll + topBarHeight) {
            finalScroll = itemTop - topBarHeight - 15;
        } else if (itemBottom > finalScroll + containerHeight) {
            finalScroll = itemBottom - containerHeight + 40; // 加一點緩衝，不要貼死底部
        }
    }
    
    if (wasHidden) {
        container.style.display = 'none';
        container.style.visibility = '';
        
        // 恢復原本的顯示狀態
        if (containerId === 'view-index' && articleWasVisible) viewArticle.style.display = 'block';
        if (containerId === 'view-article' && indexWasVisible) viewIndex.style.display = 'block';
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
    let status = null;
    const timeoutId = setTimeout(() => { isTimeout = true; controller.abort(); }, 8000);

    try {
        await window.debugDelay();
        const res = await fetch(url, { signal: controller.signal });
        status = res.status;
        if (!res.ok) throw new Error(`HTTP ${status}`);
        const data = await (options.isJson ? res.json() : res.text());
        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
        return { success: true, data, status, controller };
    } catch (error) {
        const aborted = controller.signal.aborted && !isTimeout;
        const isOffline = !navigator.onLine || (error.message && error.message.includes('Failed to fetch'));
        return { success: false, aborted, isTimeout, isOffline, status, error, controller };
    } finally {
        clearTimeout(timeoutId);
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
        const charts = Array.from(rootElement.querySelectorAll('.mermaid'));
        if (!charts.length) { if (onComplete) onComplete(); return; }
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        window.initMermaidWithTheme(currentTheme);
        // 已渲染的 SVG 不再當成 Mermaid 原始碼；單圖重整會自行還原原文。
        
        return window.mermaid.run({ nodes: charts })
        .catch(e => console.warn('Mermaid 語法錯誤:', e))
        .finally(() => {
            // ✨ 核心修復：強制 SVG 補上 height: auto，解決大小自適應錯亂
            rootElement.querySelectorAll('.mermaid svg').forEach(svg => {
                svg.style.maxWidth = '100%'; svg.style.height = 'auto';
            });
            rootElement.querySelectorAll('.mermaid').forEach(el => window.applyMermaidAspectRatio(el));
            window.initMermaidDrag(rootElement);
            
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
// ✨ 共用捲軸陰影提示系統 (Scroll Hints Engine - rAF 節流整合版)
// ==========================================
window.initScrollHints = function(container, hintLeft, hintRight, beforeMeasure = null) {
    if (!container || !hintLeft || !hintRight) return;
    if (container._scrollHintsCleanup) container._scrollHintsCleanup();
    let frame = null, needsLayout = false, disposed = false;
    const update = () => {
        frame = null;
        if (disposed) return;
        const measureLayout = needsLayout;
        needsLayout = false;
        if (measureLayout && beforeMeasure) beforeMeasure();
        const isScrollable = container.scrollWidth > container.clientWidth + 5;
        const atEnd = Math.ceil(container.scrollLeft + container.clientWidth) >= Math.floor(container.scrollWidth) - 10;
        hintRight.classList.toggle('visible', isScrollable && !atEnd);
        hintLeft.classList.toggle('visible', isScrollable && container.scrollLeft > 10);
    };
    const schedule = (layout = false) => {
        if (disposed) return;
        needsLayout = needsLayout || layout;
        if (frame === null) frame = window.requestAnimationFrame(update);
    };
    const onScroll = () => schedule(false);
    const onImageLoad = () => schedule(true);
    const observer = new ResizeObserver(() => schedule(true));
    container.addEventListener('scroll', onScroll, { passive: true });
    const images = Array.from(container.querySelectorAll('img'));
    images.forEach(img => { if (!img.complete) img.addEventListener('load', onImageLoad); });
    observer.observe(container);
    const cleanup = () => {
        if (disposed) return;
        disposed = true;
        observer.disconnect();
        container.removeEventListener('scroll', onScroll);
        images.forEach(img => img.removeEventListener('load', onImageLoad));
        if (frame !== null) window.cancelAnimationFrame(frame);
        if (container._scrollHintsCleanup === cleanup) delete container._scrollHintsCleanup;
    };
    container._scrollHintsCleanup = cleanup;
    if (container.closest('#view-article')) window.registerArticleObserver({ disconnect: cleanup });
    schedule(true);
    return cleanup;
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
    maxZoom: 2 // 預設 2 倍，之後會動態更新
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
        maxZoom: 2,
        activeGallery: gallery // ✨ 新增：記錄觸發的相簿容器
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
                                window.fitMermaidToLightbox(activeMermaid.querySelector('svg'));
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
    
    // ✨ 修正 1：只在「畫廊相簿模式 (activeGallery)」下執行水平置中，
    // 單張圖片絕對不觸發任何捲動！且改用 gallery.scrollTo 僅移動水平捲軸，徹底防止外層頁面上下跑掉！
    const state = window.lightboxState;
    if (state && !state.isDomMode && state.activeGallery) {
        const gallery = state.activeGallery;
        const figures = gallery.querySelectorAll('figure');
        const targetFig = figures[state.currentIndex];
        if (targetFig && gallery.scrollWidth > gallery.clientWidth) {
            const targetLeft = targetFig.offsetLeft - (gallery.clientWidth / 2) + (targetFig.clientWidth / 2);
            gallery.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
        }
    }

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
// ✨ 全域視窗安全高度與座標引擎 + PWA 頂部實體遮罩守護器
// ==========================================
window.initPWATopShield = function() {
    // 保留可供 iOS/WebKit 取樣的實體遮罩；重複校正視窗時不重建。
    if (!document.getElementById('pwa-status-bar-shield')) {
        const shield = document.createElement('div');
        shield.id = 'pwa-status-bar-shield';
        shield.setAttribute('aria-hidden', 'true');
        document.body.appendChild(shield);
    }

    // --safe-top 直接使用 CSS env(safe-area-inset-top)。
    // 0 可能表示狀態列已由系統保留空間，不可強制補 24/44px 或沿用舊方向的值。
};

window.adjustModalViewports = function() {
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    
    document.documentElement.style.setProperty('--vv-height', vh + 'px');
    document.documentElement.style.setProperty('--vv-width', vw + 'px');

    // ✨ 每次校正視窗時，順便守護頂部安全高度
    if (window.initPWATopShield) window.initPWATopShield();
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
        let lightboxRafId = null;
        let wheelEndTimer = null;

        // ✨ 動態解析目標
        const getActiveTarget = () => window.lightboxState.isDomMode 
            ? document.getElementById('lightbox-active-mermaid') 
            : document.getElementById('lightbox-img');

        const updateTransform = () => {
            lightboxRafId = null;
            const target = getActiveTarget();
            if (target) {
                target.style.transform = `translate(${window.lightboxState.x}px, ${window.lightboxState.y}px) scale(${window.lightboxState.zoom})`;
            }
        };

        const scheduleTransform = () => {
            if (lightboxRafId === null) {
                lightboxRafId = requestAnimationFrame(updateTransform);
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
                scheduleTransform();
            } else if (activePointers.length === 2) {
                e.preventDefault();
                const currentDistance = Math.hypot(
                    activePointers[0].x - activePointers[1].x,
                    activePointers[0].y - activePointers[1].y
                );

                if (initialPinchDistance) {
                    let newZoom = initialZoom * (currentDistance / initialPinchDistance);
                    newZoom = Math.max(0.5, Math.min(newZoom, window.lightboxState.maxZoom)); 
                    const centerX = (activePointers[0].x + activePointers[1].x) / 2;
                    const centerY = (activePointers[0].y + activePointers[1].y) / 2;
                    const ratio = newZoom / window.lightboxState.zoom - 1;
                    
                    window.lightboxState.x -= (centerX - (window.innerWidth / 2) - window.lightboxState.x) * ratio;
                    window.lightboxState.y -= (centerY - (window.innerHeight / 2) - window.lightboxState.y) * ratio;
                    window.lightboxState.zoom = newZoom;
                    scheduleTransform();
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
                if (lightboxRafId !== null) {
                    cancelAnimationFrame(lightboxRafId);
                    lightboxRafId = null;
                }
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
            
            const newZoom = Math.max(0.5, Math.min(state.zoom * (1 + delta * 0.15), state.maxZoom));
            
            const ratio = newZoom / state.zoom - 1;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            state.x -= (e.clientX - centerX - state.x) * ratio;
            state.y -= (e.clientY - centerY - state.y) * ratio;
            state.zoom = newZoom;

            wrapper.classList.add('is-dragging');
            clearTimeout(wheelEndTimer);
            wheelEndTimer = setTimeout(() => { if (!isDragging) wrapper.classList.remove('is-dragging'); }, 120);
            scheduleTransform();
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
    
    // ✨ 核心修復：加入 try-catch 保護，防止 marked.js 核心找不到解析器導致全頁崩潰
    let linkText = text;
    if (typeof token_or_href === 'object') {
        try {
            linkText = (token_or_href.tokens && this.parser) ? this.parser.parseInline(token_or_href.tokens) : (token_or_href.text || text);
        } catch (e) {
            linkText = token_or_href.text || text;
        }
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
    
    // 2. ✨ 核心修復：優先解析標題內的 Inline 元素 (加上 Error 防崩潰保護，解決內文變空白的問題！)
    let parsedText = rawText;
    try {
        if (typeof token_or_text === 'object' && token_or_text.tokens && this.parser) {
            parsedText = this.parser.parseInline(token_or_text.tokens);
        } else if (typeof marked !== 'undefined' && marked.parseInline) {
            parsedText = marked.parseInline(rawText);
        }
    } catch(e) {
        parsedText = rawText; // 解析失敗時，安全退回原始文字，保證網頁絕不崩潰
    }
    
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
    window._lastMarkdownHeadings.push(window.stripHtml(rawText)); 
    
    const id = customId || window.stripHtml(rawText).toLowerCase().replace(/\s+/g, '-');
    
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
window.getSecretRenderState = function(secretId) {
    const isUnlocked = window.isSecretUnlocked(secretId);
    const placeId = window._currentRenderPlace + '_' + secretId;
    const hasAnimatedHere = window.SysStorage.has('sys_animated_secrets', placeId);
    let statusClass = 'is-locked';
    if (isUnlocked) {
        statusClass = hasAnimatedHere ? 'is-unlocked already-unlocked' : 'is-locked pending-auto-unlock';
    }
    return { placeId, statusClass };
};

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
        const { placeId, statusClass } = window.getSecretRenderState(token.secretId);

        const lockIcon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
        
        return `
        <div class="md-secret-block ${statusClass}" data-secret-id="${token.secretId}" data-place-id="${placeId}">
            <div class="secret-overlay">
                ${lockIcon}
                <span class="secret-cover-text">${token.coverText}</span>
                <span style="font-size: 0.7rem; font-weight: normal; opacity: 0.7; margin-top: 4px;">${window.escapeHtml(window.getLockPromptText({ required_key: token.secretId }))}</span>
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
        const { placeId, statusClass } = window.getSecretRenderState(token.secretId);
        
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
        const { placeId, statusClass } = window.getSecretRenderState(token.secretId);

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
        const { placeId, statusClass } = window.getSecretRenderState(token.secretId);

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
        
        // ✨ 強化版靜音標記偵測 (支援大小寫、自動過濾)
        const isKey = badge.startsWith('KEY:');
        const isSilent = /\|SILENT/i.test(badge); 
        const secretId = isKey ? badge.replace('KEY:', '').replace(/\|SILENT/i, '').trim() : '';
        const keyAttr = isKey ? ` data-secret-key="${secretId}" data-silent="${isSilent}"` : '';
        
        if (isKey && isSilent && (!token.content || token.content.trim() === '')) {
            // 輸出一個沒有體積的隱形節點，完全不佔用任何版面，但依然能觸發滾動解鎖！
            return `<span class="md-silent-key-trigger"${keyAttr} style="display: inline-block; width: 0px; height: 0px; opacity: 0; pointer-events: none; overflow: hidden; margin: 0; padding: 0;"></span>`;
        }

        const displayText = isKey ? 'KEY FOUND' : (badge ? badge : 'HIGHLIGHT'); 
        const statusAttr = (badge && !isKey) ? ` data-status="${badge.toUpperCase()}"` : '';
        const defaultStyle = (badge && !isKey) ? '' : ' style="--dynamic-glow: var(--accent-2);"';
        
        const repeatedText = `${displayText} • `.repeat(20);
        const duration = Math.max(20, repeatedText.length * 0.4); 
        
        const bgHtml = `<span class="marquee-text-track" style="--marquee-duration: ${duration}s;" aria-hidden="true"><span class="marquee-part">${repeatedText}</span><span class="marquee-part">${repeatedText}</span></span>`;
        
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

// 文章語言：單篇優先，未設定時沿用專案；只接受安全的語言標記。
window.resolveArticleLanguage = function(article, project) {
    const candidates = [article && article.lang, project && project.lang];
    for (const candidate of candidates) {
        if (typeof candidate !== 'string') continue;
        const tag = candidate.trim();
        if (/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(tag)) {
            return { tag, className: `lang-${tag.split('-')[0].toLowerCase()}` };
        }
    }
    return null;
};

// 用於目錄及上一篇／下一篇的文章標題，不改動旁邊的介面文字或狀態標籤。
window.formatArticleTitleLanguage = function(titleHtml, article, project) {
    const language = window.resolveArticleLanguage(article, project);
    return language ? `<span lang="${language.tag}" class="${language.className}">${titleHtml}</span>` : titleHtml;
};

// 直接標記既有文字節點的元素，不新增整篇文章容器，避免影響標題位置、頁籤與捲動。
window.applyArticleDefaultLanguage = function(root, article, project) {
    const language = window.resolveArticleLanguage(article, project);
    if (!root || !language) return;

    const skipSubtreeTags = new Set(['PRE', 'CODE', 'BUTTON', 'TEXTAREA', 'SELECT', 'SCRIPT', 'STYLE', 'SVG']);
    const targetTags = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'BLOCKQUOTE', 'DT', 'DD', 'TH', 'TD', 'FIGCAPTION', 'DIV', 'SPAN', 'A']);
    const inlineContainers = new Set(['DIV', 'SPAN', 'A']);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode(el) {
            if (skipSubtreeTags.has(el.tagName) || el.classList.contains('tab-buttons')) {
                return NodeFilter.FILTER_REJECT; // 直接跳過整顆子樹
            }
            if (el.hasAttribute('lang') || el.classList.contains('lang-wrapper') ||
                el.classList.contains('lang-zh') || el.classList.contains('lang-en') || el.classList.contains('lang-ja')) {
                return NodeFilter.FILTER_REJECT; // 尊重已手動指定語言的區塊及其子樹
            }
            return targetTags.has(el.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
    });

    let currentNode = walker.nextNode();
    while (currentNode) {
        if (!inlineContainers.has(currentNode.tagName) ||
            Array.from(currentNode.childNodes).some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim())) {
            currentNode.setAttribute('lang', language.tag);
            currentNode.classList.add(language.className);
        }
        currentNode = walker.nextNode();
    }
};

// ==========================================
// ✨ 多語系段落區塊 (Language Block)
// 語法：:::lang[ja] 或 :::lang[ja|no-format]
// ==========================================
const langBlockExtension = {
    name: 'langBlock',
    level: 'block',
    // ✨ 加上 m (multiline) 旗標並容許空白字元，確保在 div 內部也能精準觸發
    start(src) { return src.match(/^:::[ \t\u00A0]*lang/im)?.index; },
    tokenizer(src, tokens) {
        // ✨ 容許行尾有一般空白、全形/不換行空白 (\u00A0) 或 \r\n
        const rule = /^:::[ \t\u00A0]*lang(?:\[([^\]]+)\])?[ \t\u00A0]*\r?\n([\s\S]*?)\r?\n[ \t\u00A0]*:::[ \t\u00A0]*(?:\r?\n|$)/i;
        const match = rule.exec(src);
        if (match) {
            const rawParams = (match[1] || 'ja').split('|').map(s => s.trim());
            const lang = rawParams[0] || 'ja';
            const noFormat = rawParams.slice(1).some(p => p.toLowerCase() === 'no-format');
            return {
                type: 'langBlock',
                raw: match[0],
                lang: lang,
                noFormat: noFormat,
                tokens: this.lexer.blockTokens(match[2].trim())
            };
        }
    },
    renderer(token) {
        const formatClass = token.noFormat ? ' no-format' : '';
        const formatAttr = token.noFormat ? ' data-no-format="true"' : '';
        return `<div id="lang-${token.lang}" lang="${token.lang}" class="lang-wrapper lang-${token.lang}${formatClass}"${formatAttr}>${this.parser.parse(token.tokens)}</div>`;
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
                ${GLOBAL_SVGS.detailsArrow}
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
        const bgHex = theme === 'light' ? '#F1F5F9' : '#020617';
        const root = document.documentElement;

        // 同步頁面底色及原生色彩提示，避免初始行內顏色在切換主題後停留舊值。
        root.setAttribute('data-theme', theme);
        root.style.backgroundColor = bgHex;
        root.style.colorScheme = theme === 'light' ? 'light' : 'dark';

        // ✨ 2. 原地更新 meta 屬性（嚴禁 remove() 重建，避免觸發 iOS WebKit 將 env(safe-area-inset-top) 歸零的 Bug！）
        let metaTheme = document.getElementById('meta-theme-color') || document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', bgHex);
        }

        // ✨ 3. 強制同步刷新實體遮罩的底色與 GPU 重繪，確保 100% 不消失
        const shield = document.getElementById('pwa-status-bar-shield');
        if (shield) {
            shield.style.backgroundColor = bgHex;
        }

        if (window.mermaid) {
            window.initMermaidWithTheme(theme);
            
            const mermaidEls = document.querySelectorAll('.mermaid');
            if (mermaidEls.length > 0) {
                mermaidEls.forEach(el => {
                    const originalText = decodeURIComponent(el.getAttribute('data-original-text') || '');
                    if (originalText) {
                        el.textContent = window.processMermaidCssVars(originalText); 
                        el.removeAttribute('data-processed'); 
                    }
                });
                window.renderAllMermaidCharts(document);
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
        if (document.getElementById('pdf-action-modal')) return;
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
        // 開啟操作面板的點擊仍會冒泡；不要讓它同時導覽或收起選單。
        if (document.getElementById('pdf-action-modal')) {
            e.preventDefault();
            return;
        }
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            e.preventDefault(); 
            
            const targetHash = navItem.getAttribute('href');
            if (!targetHash?.startsWith('#')) return;
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
const handleMainScroll = () => {
    if (bttBtn) {
        const currentY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        bttBtn.classList.toggle('visible', currentY > 300);
    }
};
window.addEventListener('scroll', handleMainScroll, { passive: true });
document.body.addEventListener('scroll', handleMainScroll, { passive: true });

if (bttBtn) {
    bttBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
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

        // 2. 動態生成分類區塊 (批次串接後一次寫入 DOM，避免迴圈內反覆觸發 HTML 解析器)
        let navHtmlBuffer = '';
        let sectionsHtmlBuffer = '';

        categories.forEach((cat, idx) => {
            const navNum = String(idx + 1).padStart(2, '0');
            const menuDescHtml = cat.meta ? `<span class="nav-item-desc">${cat.meta}</span>` : '';
            const navItemStyle = `--nav-delay: ${idx * 45}ms;${cat.watermark_url ? ` --custom-watermark: url('${cat.watermark_url}');` : ''}`;
            navHtmlBuffer += `
            <li style="${navItemStyle}">
                <a href="#${cat.id}-section" class="nav-item">
                    <div class="nav-item-top">
                        <span class="nav-item-index">${navNum}</span>
                        <span class="nav-item-arrow" aria-hidden="true">${GLOBAL_SVGS.navPlane}</span>
                    </div>
                    <span class="nav-item-title">${cat.title}</span>
                    ${menuDescHtml}
                </a>
            </li>`;

            const sectionMetaHtml = cat.meta ? `<span class="section-meta">- ${cat.meta}</span>` : '';
            const sectionDescHtml = cat.description ? `<p class="section-desc">${cat.description}</p>` : '';
            const sectionImageHtml = cat.cover_image ? `<img src="${cat.cover_image}" alt="icon" loading="lazy" class="section-icon is-loading" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` : '';
            const watermarkStyle = cat.watermark_url ? ` style="--custom-watermark: url('${cat.watermark_url}');"` : '';

            sectionsHtmlBuffer += `
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

        dynamicNav.innerHTML = navHtmlBuffer;
        portfolioSections.innerHTML = sectionsHtmlBuffer;

        // 3. 填入專案卡片
        const flatList = window.STATUS_LIST.flat();
        projects.forEach(data => {
            const targetGrid = document.getElementById(`${data.category}-grid`); 
            if (!targetGrid) return;

            const card = document.createElement('div');
            card.className = 'card';
            
            card.setAttribute('data-required-key', typeof data.required_key === 'string' ? data.required_key : JSON.stringify(data.required_key || ''));
            card.setAttribute('data-project-id', data.id);
            card.setAttribute('data-tags', (data.tags || []).join(','));
            
            const tagsHTML = (data.tags || []).map(tag => {
                const isSecretTag = data.secret_tags && data.secret_tags.includes(tag);
                const secretClass = isSecretTag ? ' sys-hidden-tag' : '';
                const statusAttr = flatList.includes(tag) ? ` data-status="${tag}" class="tag status-tag${secretClass}"` : ` class="tag${secretClass}"`;
                return `<span${statusAttr} data-tag="${tag}" onclick="window.filterByTag('${tag}', event, this)">${tag}</span>`;
            }).join('');

            const hasAction = (data.articles && data.articles.length > 0) || data.link;
            if (!hasAction) {
                card.addEventListener('mouseenter', () => { card.style.cursor = window.currentActiveTag ? 'pointer' : 'default'; });
            }

            const cardImageHtml = data.cover_image ? `<img src="${data.cover_image}" alt="cover" loading="lazy" class="card-thumb-img is-loading" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` : '';
            const cardDescHtml = data.description ? `<p class="card-desc-text"></p>` : '';
            const absolutePinHtml = data.pinned ? `<div class="card-pin">${GLOBAL_SVGS.pin}</div>` : '';

            const metaParts = [];
            if (data.date) metaParts.push(data.date);
            if (data.version) metaParts.push(`v${data.version}`); 
            const cardDateHtml = metaParts.length > 0 ? `<div class="card-date-badge">[${metaParts.join(' • ')}]</div>` : '';

            card.innerHTML = `
                ${absolutePinHtml}${cardDateHtml} 
                <div class="card-content-wrapper">
                    <div class="card-text"><h3 style="margin-top: 0; margin-bottom: 0.4rem;"></h3>${cardDescHtml}</div>
                    ${cardImageHtml ? `<div class="card-image">${cardImageHtml}</div>` : ''}
                </div>
                <div class="tags-container">${tagsHTML}</div>${hasAction ? '<div class="card-action-btn"></div>' : ''}`;
            window.syncProjectCardUI(card, data);
            
            targetGrid.appendChild(card);
        });

        if (window.syncCardMetaLayout) {
            window.syncCardMetaLayout(portfolioSections);
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => window.syncCardMetaLayout(portfolioSections));
            }
        }

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
window.showSystemRebootScreen = function(title, localV, remoteV, msg, immediate = false) {
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
window.hideSystemRebootScreen = function(isSuccess = true) {
    const screen = document.getElementById('sys-reboot-screen');
    
    // 如果沒有遮罩 (一般訪客)，直接解除防護並返回
    if (!screen) {
        document.documentElement.classList.remove('sys-rebooting');
        window.unlockScroll();
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
        
        screen.style.transition = 'opacity 0.5s ease';
        screen.style.opacity = '0';
        setTimeout(() => {
            screen.remove();
            window.unlockScroll();
        }, 500);
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
            const localDataVersions = window.readDataVersions();
            
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

// ==========================================
// ✨ Header 社群與分享圖示列渲染引擎 (純 SVG 圖示)
// ==========================================
window.renderSocialLinks = function() {
    const container = document.getElementById('header-social-icons');
    if (!container || !Array.isArray(CONFIG.SOCIAL_LINKS)) return;

    if (CONFIG.SOCIAL_LINKS.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = '';
    container.innerHTML = CONFIG.SOCIAL_LINKS.map((item, idx) => {
        const iconSvg = GLOBAL_SVGS[item.icon] || GLOBAL_SVGS.linkLg;
        const safeName = window.escapeHtml(item.name || '');
        if (item.copyUrl) {
            return `<button type="button" class="header-social-link icon-only-copy" data-social-copy-idx="${idx}" aria-label="${safeName}">${iconSvg}</button>`;
        }
        const rawUrl = typeof item.url === 'string' ? item.url.trim() : '';
        if (!rawUrl) {
            return `<span class="header-social-link is-disabled" aria-label="${safeName}" aria-disabled="true">${iconSvg}</span>`;
        }
        const safeUrl = window.escapeHtml(rawUrl);
        return `<a class="header-social-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer" aria-label="${safeName}">${iconSvg}</a>`;
    }).join('');

    container.querySelectorAll('button[data-social-copy-idx]').forEach(btn => {
        const item = CONFIG.SOCIAL_LINKS[Number(btn.dataset.socialCopyIdx)];
        if (!item || !item.copyUrl) return;
        btn.addEventListener('click', () => window.handleCopy(btn, item.copyUrl));
    });

    window.requestAnimationFrame(() => window.syncSocialIconsLayout());
};

// ==========================================
// ✨ Header 社群圖示平衡換行計算 (避免單顆落單，例如 7 顆自動折為 4+3)
// ==========================================
window.syncSocialIconsLayout = function() {
    const container = document.getElementById('header-social-icons');
    if (!container) return;

    const items = Array.from(container.children);
    const total = items.length;
    if (total <= 1) {
        container.style.maxWidth = '';
        return;
    }

    container.style.maxWidth = '';
    const availableWidth = container.clientWidth;
    if (availableWidth <= 0) return;

    const styles = window.getComputedStyle(container);
    const gap = parseFloat(styles.columnGap || styles.gap) || 16;
    const itemWidth = items[0].getBoundingClientRect().width || 36;
    const maxPerRow = Math.max(1, Math.floor((availableWidth + gap + 0.5) / (itemWidth + gap)));

    if (maxPerRow >= total) return;

    const rows = Math.ceil(total / maxPerRow);
    const balancedCols = Math.ceil(total / rows);
    const targetMaxWidth = Math.ceil(balancedCols * itemWidth + (balancedCols - 1) * gap) + 1;
    container.style.maxWidth = `${targetMaxWidth}px`;
};

window.addEventListener('DOMContentLoaded', () => {
    window.renderSocialLinks();
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
    window._cancelModalTransition?.();
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
        
        const timer = setTimeout(() => {
            window._cancelModalTransition = null;
            modalContainer.style.transition = 'none'; 
            modalContainer.style.height = ''; 
            
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
            
            setTimeout(() => { 
                modalContainer.style.transition = ''; 
            }, 50);
        }, 120);
        window._cancelModalTransition = () => {
            clearTimeout(timer);
            window._cancelModalTransition = null;
            modalBody.classList.remove('content-fade-out');
            if (topLeft) topLeft.classList.remove('content-fade-out');
        };
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
    const proj = window.siteProjects.find(p => p.id === projectId);
    if (!proj || !proj.articles) return;

    // ✨ 新增：若專案受金鑰保護且未解鎖，禁止開啟目錄
    if (proj.required_key && !window.isSecretUnlocked(proj.required_key)) {
        const lockPrompt = window.getLockPromptText(proj);
        if (window.showSystemToast) window.showSystemToast('>_ ACCESS_DENIED', '存取被拒', `${lockPrompt} 才能解鎖`, 4000, 'error');
        return;
    }

    // ✨ 新增：版本相容性防護網 (專案層級)
    if (proj.min_sys_version && window.compareVersions(CONFIG.VERSION, proj.min_sys_version) < 0) {
        window.triggerSystemUpdate(proj.min_sys_version);
        return;
    }

    // 在切換或渲染目錄之前完成警告，避免背景內容提前變動。
    const pendingWarning = window.getPendingSensitiveWarning(
        proj.is_sensitive, `PROJ_${projectId}`, [`PROJ_${projectId}`]
    );
    if (pendingWarning) {
        const recommendedArticle = pendingWarning.type === 'MAIN'
            ? window.findFirstUnreadArticleForMain(projectId, null, pendingWarning.bypassCondition)
            : null;
        window.showSensitiveAgreementModal(
            pendingWarning.type,
            (isPermanent) => {
                window.saveSensitiveAgreement(pendingWarning.key, isPermanent);
                return window.openProjectIndex(projectId, restoreScroll);
            },
            () => closeModal(),
            { recommendedArticle }
        );
        return;
    }

    window.beginModalNavigation();
    window.isRendering = false; 
    window.historyStack = []; 

    switchModalContent(
        () => {
            const modalContainer = document.querySelector('.modal-content');
            
            document.querySelector('.modal-top-bar').classList.remove('is-index-mode');

            const proj = window.siteProjects.find(p => p.id === projectId);
            if (!proj || !proj.articles) return;

            let currentSort = sessionStorage.getItem(`sort_${projectId}`) || proj.default_sort || 'desc';
            sessionStorage.setItem(`sort_${projectId}`, currentSort);

            // ✨ 計算可見文章數
            const visibleCount = window.getVisibleArticleCount(proj);

            const shareUrl = window.updateRouteState(projectId);

            // 2. 將目錄標題與功能按鈕直接注入 modal-top-left
            document.getElementById('modal-top-left').innerHTML = `
                <div class="index-header-container">
                    <h1 class="index-header-title">${window.parseDynamicText(proj.title, 'INDEX_HEADER')}<span style="white-space: nowrap;"> - 目錄</span></h1>
                    <div class="index-header-actions">
                        <span class="article-count-badge">共 ${visibleCount} 篇</span>
                        <button id="toggle-sort-btn" class="share-link-btn responsive-share-btn" style="margin: 0;">
                            <svg class="sort-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path class="sort-arr-left" d="M 4 9 L 9 4 L 9 20"></path><path class="sort-arr-right" d="M 20 15 L 15 20 L 15 4"></path></svg>
                            <span id="sort-btn-text" class="btn-text-hideable"></span>
                        </button>
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
            if (viewIndex) {
                // ✨ 終極防呆：在切換 display: block 之前，強制將目前快取中所有的解鎖元素封印，防止 CSS 動畫重播！
                viewIndex.querySelectorAll('.is-unlocked:not(.already-unlocked)').forEach(el => el.classList.add('already-unlocked'));
                viewIndex.style.display = 'block';
            }

            // 加入 window._keysUnlockedSinceLastIndex
            const needsRender = viewIndex.dataset.projectId !== projectId || viewIndex.dataset.sort !== currentSort || window._keysUnlockedSinceLastIndex;

            if (needsRender) {
                viewIndex.innerHTML = `<div id="article-list-container" style="transition: opacity 0.2s ease;"></div>`;
                window._keysUnlockedSinceLastIndex = false; // 歸零
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
                    // ✨ 移除 && !isUnlockedSys，並分流 key-hidden-item
                    const artLocked = art.required_key && !window.isSecretUnlocked(art.required_key);
                    const lockMode = art.lock_mode || 'visible';

                    let hiddenClass = '';
                    if (art.is_hidden) hiddenClass += ' sys-hidden-item';
                    if (artLocked && lockMode === 'hidden') hiddenClass += ' key-hidden-item';
                    // ✨ 1. 補上這行：未解鎖且可見時，掛上灰階與紅字 Hover 樣式
                    if (artLocked && lockMode === 'visible') hiddenClass += ' is-key-locked-item';

                    // ✨ 動態判定提示文字
                    const lockPrompt = window.getLockPromptText(art);

                    // ✨ 補上 window. 前綴
                    let onClickAttr = artLocked 
                        ? `onclick="event.preventDefault(); window.showSystemToast('>_ ACCESS_DENIED', '存取被拒', '${lockPrompt} 才能解鎖', 4000, 'error');"` 
                        : `onclick="event.preventDefault(); window.openArticle('${projectId}',${idx})"`;

                    let descHtml = art.description ? `<span class="article-item-desc">- ${window.parseDynamicText(art.description, 'INDEX_DESC')}</span>` : '';
                    let dateHtml = art.date ? `<span class="article-item-date">${art.date}</span>` : '';
                    let statusBadgeHtml = window.getStatusBadgeHtml(art, true);
                    
                    let baseIconHtml = art.cover_image 
                        ? `<img src="${art.cover_image}" alt="cover" class="article-item-cover is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` 
                        : `<div class="article-item-fallback" style="color: var(--muted);">${GLOBAL_SVGS.docIconLg}</div>`;
                    
                    let pinnedBadgeHtml = art.pinned ? `<div class="modal-pin">${GLOBAL_SVGS.pinSmall}</div>` : '';
                    
                    // ✨ 2. 修正：未解鎖顯示「鎖頭」；只要已解鎖 (含 required_key 解鎖後) 或為 is_hidden 皆顯示「鑰匙」！
                    let secretBadgeHtml = '';
                    if (artLocked) {
                        secretBadgeHtml = `<div class="modal-secret-pin key-lock-pin">${GLOBAL_SVGS.secretPinSmall}</div>`;
                    } else if (art.is_hidden || art.required_key) {
                        secretBadgeHtml = `<div class="modal-secret-pin">${GLOBAL_SVGS.secretPinSmall}</div>`;
                    }
                    
                    let iconHtml = `<div class="article-item-icon-wrap">${pinnedBadgeHtml}${secretBadgeHtml}${baseIconHtml}</div>`;

                    return `
                        <li id="article-item-${idx}" class="article-li ${isHighlightGroup ? 'is-highlight' : 'is-normal'}${hiddenClass}${themeClass}"${customStyle}>
                                <a href="#" ${onClickAttr} class="article-link">
                                    ${iconHtml}
                                    <div class="article-item-content">
                                        <div class="article-item-title-row">
                                            <span class="article-item-title">${window.formatArticleTitleLanguage(window.parseDynamicText(art.title, 'INDEX_TITLE'), art, proj)}${statusBadgeHtml}</span>
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

                            if (groupData.highlight) {
                                if (groupColor) {
                                    // ✨ 同時開啟 highlight 且有自訂 color：讓文章高光背景與圖示直接套用自訂色
                                    customStyle = ` style="--current-group-color: ${groupColor}; --tab-color: ${groupColor};"`;
                                } else {
                                    // 僅開啟 highlight：走系統預設的 5 色循環
                                    const groupNum = (colorIndex % 5) + 1;
                                    themeClass = ` group-color-${groupNum}`;
                                    colorIndex++; 
                                }
                            } else if (groupColor) {
                                // 僅設定自訂 color（無高光背景）
                                customStyle = ` style="--current-group-color: ${groupColor};"`; 
                            }

                            const topMargin = isFirstGroup ? '0rem' : '1.2rem';
                            // 👇 把這一行補回來即可！
                            const inlineStyles = groupColor ? ` --current-group-color: ${groupColor};` : '';

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

                            // ✨ 修復：將 ${inlineStyles} 補進 style 屬性尾端！
                            html += `
                                <div id="${safeGroupId}" class="group-header${themeClass}" style="margin-top: ${topMargin}; margin-bottom: 0.8rem;${inlineStyles}">
                                    <div class="group-header-text">
                                        <div class="group-header-title">${window.parseDynamicText(groupData.title || groupId, 'GROUP_TITLE')}</div>${groupData.description ? `<div class="group-header-desc">${window.parseDynamicText(groupData.description, 'GROUP_DESC')}</div>` : ''}
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
                            const topMargin = isFirstGroup ? '0rem' : '1rem';
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
                                label: window.parseDynamicText(groupData.title || groupId, 'TOC_GROUP'),
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
            if (window.grantDetailKeys(proj.key)) {
                const header = document.getElementById('modal-top-left');
                const title = header && header.querySelector('.index-header-title');
                if (title) title.innerHTML = `${window.parseDynamicText(proj.title, 'INDEX_HEADER')}<span style="white-space: nowrap;"> - 目錄</span>`;
                const badge = header && header.querySelector('.article-count-badge');
                if (badge) {
                    const count = window.getVisibleArticleCount(proj);
                    badge.textContent = `共 ${count} 篇`;
                }
                renderList(true);
            }
        },
        () => {
            const modalContainer = document.querySelector('.modal-content'); 
            if (modalContainer) {
                if (restoreScroll && window._indexScrollTopCache !== undefined) {
                    // 1. 先試著捲動到快取位置
                    modalContainer.scrollTo({ top: window._indexScrollTopCache, behavior: 'auto' });
                    
                    // ✨ 2. 終極修復：用 setTimeout 等待 DOM 重繪徹底完成，再次確認目標是否在視野內，防止被瀏覽器截斷！
                    setTimeout(() => {
                        const targetItem = document.getElementById(`article-item-${window.lastReadArticleIndex}`);
                        if (targetItem) {
                            const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 80;
                            const itemTop = window.getRelativeOffsetTop(targetItem, modalContainer);
                            const itemBottom = itemTop + targetItem.offsetHeight;
                            const containerHeight = modalContainer.clientHeight || window.innerHeight;
                            
                            let finalScroll = modalContainer.scrollTop;
                            let needsScroll = false;

                            if (itemTop < finalScroll + topBarHeight) {
                                finalScroll = itemTop - topBarHeight - 20;
                                needsScroll = true;
                            } else if (itemBottom > finalScroll + containerHeight) {
                                finalScroll = itemBottom - containerHeight + 40;
                                needsScroll = true;
                            }
                            
                            if (needsScroll) {
                                modalContainer.scrollTo({ top: Math.max(0, finalScroll), behavior: 'auto' });
                                window._indexScrollTopCache = Math.max(0, finalScroll); // 同步更新快取
                            }
                            window.simulateHoverFlash(targetItem, 1200);
                        }
                    }, 50);
                    
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
window.openArticle = async function(projectId, articleIndex, isFromHistory = false, restoreScrollTop = 0, targetHash = null, restoreInnerScrolls = [], restoreActiveTabs = []) {
    const proj = window.siteProjects.find(p => p.id === projectId);
    if (!proj || !Array.isArray(proj.articles)) return;
    const article = proj.articles[articleIndex];
    if (!article) return;
    if (proj.required_key && !window.isSecretUnlocked(proj.required_key)) {
        const lockPrompt = window.getLockPromptText(proj);
        if (window.showSystemToast) window.showSystemToast('>_ ACCESS_DENIED', '存取被拒', `${lockPrompt} 才能解鎖`, 4000, 'error');
        return;
    }

    // ✨ 新增：版本相容性防護網 (文章層級，同時比對專案與文章的要求，取較高者)
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

    // ✨ 文章金鑰權限驗證 (支援動態鎖定提示與陣列解析)
    const isUnlockedSys = document.body.classList.contains('system-override-active');
    if (article.required_key && !window.isSecretUnlocked(article.required_key)) {
        
        const lockPrompt = window.getLockPromptText(article);
        
        window.showSystemToast('>_ ACCESS_DENIED', '存取被拒', `${lockPrompt} 才能解鎖此文章`, 4000, 'error');
        window.history.replaceState(null, '', window.location.pathname);
        return;
    }

    // 專案警告優先，確認完畢後再逐一檢查文章警告。
    const artSlug = article.id || articleIndex;
    const projectWarning = window.getPendingSensitiveWarning(
        proj.is_sensitive, `PROJ_${projectId}`, [`PROJ_${projectId}`]
    );
    const articleWarning = projectWarning ? null : window.getPendingSensitiveWarning(
        article.is_sensitive, `ART_${projectId}_${artSlug}`,
        [`ART_${projectId}_${artSlug}`, `ART_${projectId}_${articleIndex}`]
    );
    const pendingWarning = projectWarning || articleWarning;
    if (pendingWarning) {
        const recommendedArticle = pendingWarning.type === 'MAIN'
            ? window.findFirstUnreadArticleForMain(projectId, projectWarning ? null : articleIndex, pendingWarning.bypassCondition)
            : null;
        window.showSensitiveAgreementModal(
            pendingWarning.type,
            (isPermanent) => {
                window.saveSensitiveAgreement(pendingWarning.key, isPermanent);
                return window.openArticle(projectId, articleIndex, isFromHistory, restoreScrollTop, targetHash, restoreInnerScrolls, restoreActiveTabs);
            },
            () => {
                const viewArticle = document.getElementById('view-article');
                const isReadingArticle = modalOverlay?.classList.contains('active')
                    && viewArticle && viewArticle.style.display !== 'none'
                    && Array.isArray(window.historyStack) && window.historyStack.length > 0;
                if (isReadingArticle) {
                    const cur = window.historyStack[window.historyStack.length - 1];
                    const curProj = window.siteProjects.find(p => p.id === cur.projectId);
                    const curArt = curProj?.articles?.[cur.articleIndex];
                    if (curProj && curArt) {
                        window.updateRouteState(cur.projectId, curArt.id || cur.articleIndex);
                    }
                    return;
                }
                if (projectWarning) {
                    closeModal();
                } else {
                    const viewIndex = document.getElementById('view-index');
                    if (viewIndex && viewIndex.dataset.projectId === projectId && viewIndex.style.display !== 'none') {
                        window.updateRouteState(projectId);
                        // 警告關閉後，立即依目前目錄位置更新新內容提示。
                        if (typeof window.indexScrollHandler === 'function') window.indexScrollHandler();
                    } else {
                        window.openProjectIndex(projectId, true);
                    }
                }
            },
            { recommendedArticle }
        );
        return;
    }

    // 警告全部通過後才寫入歷史，避免每確認一次就重複加入同一篇文章。
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
                
                // ✨ 修正：改由判斷 view-article 是否存在且顯示中，來記錄內部的直書捲軸與分頁狀態
                const viewArticle = document.getElementById('view-article');
                if (viewArticle && viewArticle.style.display !== 'none') {
                    const wrappers = viewArticle.querySelectorAll('.vertical-wrapper');
                    window.historyStack[window.historyStack.length - 1].innerScrolls = Array.from(wrappers).map(w => ({
                        scrollTop: w.scrollTop,
                        scrollLeft: w.scrollLeft
                    }));

                    // 👇 新增：記錄離開前所有處於 active 狀態的 tab-btn 索引 (支援同一篇內有多組分頁)
                    const allTabBtns = viewArticle.querySelectorAll('.tab-btn');
                    window.historyStack[window.historyStack.length - 1].activeTabs = Array.from(allTabBtns)
                        .map((btn, idx) => btn.classList.contains('active') ? idx : -1)
                        .filter(idx => idx !== -1);
                }
            }
        }
        
        window.historyStack.push({ projectId, articleIndex, scrollTop: 0, innerScrolls: [], activeTabs: [] });
    }

    window.lastReadArticleIndex = articleIndex;
    // ✨ 進入文章的瞬間，預先計算並快取好返回目錄時的最佳捲軸位置
    window._indexScrollTopCache = window.calculateIdealScrollCache('view-index', `article-item-${articleIndex}`, window._indexScrollTopCache);
    
    // 驗證 contents.json，失敗時保留文章操作，只替換內文。
    const hasContentPath = typeof article.content_path === 'string' && article.content_path.trim() !== '';
    const navigation = window.beginModalNavigation();
    const fetchResult = hasContentPath
        ? await window.safeFetchWithGuard(article.content_path, { isJson: true })
        : { success: false, isInvalidData: true };

    if (fetchResult.aborted || navigation !== window._modalNavigation) return;

    const hasContent = fetchResult.success && fetchResult.data && typeof fetchResult.data.content === 'string';
    if (!hasContent) {
        console.error('無法載入文章 contents.json:', fetchResult.error || '缺少有效的 content_path 或 content 欄位');
    }
    const markdownContent = hasContent ? fetchResult.data.content : '';

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
                // ✨ 核心修復：清除空行上的不換行空白 (\u00A0)，防止 <div class="tab-panel"> 吞掉內部的 :::lang 語法！
                if (hasContent) {
                    const cleanMarkdown = markdownContent.replace(/^[ \t\u00A0]+$/gm, '');
                    viewArticle.innerHTML = marked.parse(cleanMarkdown);
                    window.applyArticleDefaultLanguage(viewArticle, article, proj);
                    window.markArticleRead(projectId, article, articleIndex);
                    window.grantDetailKeys([proj.key, article.key]);
                } else {
                    const articleName = window.escapeHtml(window.parseDynamicText(String(article.title || article.id || articleIndex), 'TOOLTIP'));
                    viewArticle.innerHTML = window.getSystemErrorHtml('載入失敗', `文章「${articleName}」載入失敗。`);
                    window.updateRouteState(projectId, article.id || articleIndex, targetHash);
                }
            }
            
            /// 建立操作指標
            const activeView = viewArticle || modalBody;

            // ✨ Step 1：自動封裝分頁區塊邊界，並校正預設 .tab-btn.active 顯示狀態
            window.initTabSections(activeView);

            // ✨ Step 2：若從歷史紀錄返回，覆蓋還原當時選中的 tab-btn
            if (isFromHistory && restoreActiveTabs && restoreActiveTabs.length > 0) {
                const allTabBtns = activeView.querySelectorAll('.tab-btn');
                restoreActiveTabs.forEach(idx => {
                    const targetBtn = allTabBtns[idx];
                    if (targetBtn && !targetBtn.classList.contains('active')) {
                        if (typeof targetBtn.onclick === 'function') {
                            targetBtn.onclick();
                        } else {
                            targetBtn.click();
                        }
                    }
                });
            }

            // ✨ Step 3：分頁狀態確定後，統一執行高度同步
            window.syncTabPanelsHeight(activeView);
            setTimeout(() => window.syncTabPanelsHeight(activeView), 60);

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
                    return { cardHtml: '', btnHtml: `<button class="capsule-btn ${type} disabled" disabled>${iconSvg}</button>` };
                }
                
                // ✨ 安全解析：TOOLTIP 不消耗特效額度，NAV_BTN 觸發獨立特效
                const plainTitle = window.stripHtml(window.parseDynamicText(item.art.title, 'TOOLTIP'));
                const tooltipText = plainTitle.replace(/"/g, '&quot;');
                const uiTitle = window.formatArticleTitleLanguage(window.parseDynamicText(item.art.title, 'NAV_BTN'), item.art, proj);
                
                const cardHtml = `<a href="javascript:void(0)" class="nav-card ${type}" onclick="window.openArticle('${projectId}', ${item.idx})"><div class="nav-label">${isPrev ? `${iconSvg}${text}` : `${text}${iconSvg}`}</div><div class="nav-title">${uiTitle}</div></a>`;
                
                const btnHtml = `<button class="capsule-btn ${type}" onclick="window.openArticle('${projectId}', ${item.idx})" data-tooltip="${tooltipText}">${iconSvg}</button>`;
                
                return { cardHtml, btnHtml };
            };

            const prevData = seqIndex > 0 ? generateNavBtn(flatSequence[seqIndex - 1], 'prev') : generateNavBtn(null, 'prev');
            const nextData = seqIndex < flatSequence.length - 1 ? generateNavBtn(flatSequence[seqIndex + 1], 'next') : generateNavBtn(null, 'next');

            if (hasContent && (prevData.cardHtml || nextData.cardHtml)) {
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
                const keyObserver = window.registerArticleObserver(new IntersectionObserver((entries) => {
                    if (navigation !== window._modalNavigation) return;
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        const keyEl = entry.target;
                        const secretId = keyEl.getAttribute('data-secret-key');
                        const isSilent = keyEl.getAttribute('data-silent') === 'true';
                        window.grantDetailKeys(isSilent ? `${secretId}|SILENT` : secretId);
                        keyEl.classList.add('is-key-triggered');
                        keyObserver.unobserve(keyEl);
                    });
                }, { threshold: 0.5 }));

                keys.forEach(k => {
                    const spec = window.parseKeySpec(k.getAttribute('data-secret-key'));
                    if (!spec) return;
                    const hasMissingKey = spec.storeKeys.some(key => !window.SysStorage.has('sys_unlocked_secrets', key));
                    if (hasMissingKey) {
                        keyObserver.observe(k);
                    } else {
                        k.classList.add('is-key-triggered');
                    }
                });
            }

            // ==========================================
            // ✨ 跨文章機密自動解碼引擎 (Auto-Decrypt for Global Secrets)
            // ==========================================
            const autoUnlockBlocks = activeView.querySelectorAll('.pending-auto-unlock');
            if (autoUnlockBlocks.length > 0) {
                const autoObserver = window.registerArticleObserver(new IntersectionObserver((entries) => {
                    if (navigation !== window._modalNavigation) return;
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        const block = entry.target;
                        const placeId = block.getAttribute('data-place-id');
                        if (placeId) window.SysStorage.add('sys_animated_secrets', placeId);
                        
                        const secretId = block.getAttribute('data-secret-id');
                        const targets = secretId ? document.querySelectorAll(`[data-secret-id="${secretId}"]`) : [block];
                        targets.forEach(b => {
                            b.classList.remove('is-locked', 'pending-auto-unlock');
                            b.classList.add('is-unlocked');
                        });
                        autoObserver.unobserve(block);
                    });
                }, { threshold: 0.15 }));

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
            
            // ✨ 動態抓取歷史堆疊中「上一篇（length - 2）」的文章標題，並透過 TOOLTIP 模式安全解析無痕機密文字
            let historyBtnHtml = '';
            if (window.historyStack && window.historyStack.length > 1) {
                const prevEntry = window.historyStack[window.historyStack.length - 2];
                const prevProj = window.siteProjects.find(p => p.id === prevEntry.projectId);
                const prevArt = prevProj && prevProj.articles ? prevProj.articles[prevEntry.articleIndex] : null;
                const prevTitle = prevArt 
                    ? window.stripHtml(window.parseDynamicText(prevArt.title, 'TOOLTIP')).replace(/"/g, '&quot;') 
                    : '跳轉前頁面';
                
                historyBtnHtml = `<div class="capsule-divider"></div><button class="capsule-btn history-btn" onclick="window.goBackInHistory()" data-tooltip="返回：${prevTitle}">${GLOBAL_SVGS.historyBack}</button>`;
            }

            let sequenceHtml = (flatSequence.length > 1) ? `<div class="capsule-divider"></div>${prevData.btnHtml}<span class="capsule-progress">${seqIndex + 1} / ${flatSequence.length}</span>${nextData.btnHtml}` : '';

            // ✨ 新增：動態生成群組標籤 (Group Badge) 邏輯
            let groupHtml = '';
            if (article.group && proj.groups && proj.groups[article.group]) {
                const groupData = proj.groups[article.group];
                let themeClass = '';
                let customStyle = '';

                // ✨ 優先檢查是否有自訂 color，若有則直接套用顏色與光暈
                if (groupData.color) {
                    customStyle = ` style="color: ${groupData.color}; text-shadow: 0 0 8px color-mix(in srgb, ${groupData.color} 30%, transparent);"`;
                } else if (groupData.highlight) {
                    let colorIndex = 0;
                    for (const [gId, gData] of Object.entries(proj.groups)) {
                        const groupArticles = flatSequence.filter(item => item.art.group === gId);
                        if (groupArticles.length === 0) continue; 
                        
                        if (gId === article.group) {
                            const groupNum = (colorIndex % 5) + 1;
                            themeClass = ` group-color-${groupNum}`;
                            break;
                        }
                        // 只有「開啟 highlight 且沒自訂 color」的群組才消耗輪替色額度
                        if (gData.highlight && !gData.color) colorIndex++;
                    }
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
                const manualRows = (initialStyle.match(/--g-rows:\s*(\d+)/)) ? parseInt(initialStyle.match(/--g-rows:\s*(\d+)/)[1], 10) : null;

                // 將折行判斷作為 onBeforeCheck 傳入，只綁定單一 rAF Scroll 與 ResizeObserver
                window.initScrollHints(gallery, hintLeft, hintRight, () => {
                    const totalItems = gallery.querySelectorAll('figure').length;
                    if (totalItems > 0) {
                        let shouldWrap = false;
                        if (!manualRows && totalItems > 1) {
                            const containerWidth = gallery.clientWidth;
                            if (containerWidth > 0) {
                                const matchWidth = initialStyle.match(/--g-width:\s*(\d+)px/);
                                const baseWidth = matchWidth ? parseInt(matchWidth[1], 10) : 200;
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
                });

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

window.centerMarqueeTarget = function(targetTagEl, firstContent) {
    const contentWidth = firstContent.offsetWidth;
    void firstContent.offsetWidth;

    // 使用標籤本身的左側座標，避免 wrapper 位移干擾。
    let absoluteLeft = targetTagEl.offsetLeft;
    if (absoluteLeft === 0) {
        absoluteLeft = targetTagEl.getBoundingClientRect().left - firstContent.getBoundingClientRect().left + firstContent.scrollLeft;
    }

    let targetX = ((firstContent.parentElement.clientWidth / 2) - (absoluteLeft + (targetTagEl.offsetWidth / 2))) % contentWidth;
    if (targetX > 0) targetX -= contentWidth;
    window.scrollMarqueeTo(targetX, contentWidth);
};

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

        window.centerMarqueeTarget(targetTagEl, firstContent);
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
        let currentX = window.getMarqueeCurrentX(m);
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
        window.centerMarqueeTarget(targetTagEl, firstContent);
    }

    document.querySelectorAll(`[data-tag="${targetTag}"]`).forEach(t => t.classList.add('active-tag'));
    document.querySelectorAll('.card').forEach(card => {
        const tags = card.getAttribute('data-tags');
        if (tags && tags.includes(targetTag)) { 
            if (card.classList.contains('key-hidden-card')) return;
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
    const tracks = Array.from(document.querySelectorAll('.marquee-content'));
    const items = tracks.map(m => {
        if (m.marqueePlayer) { m.marqueePlayer.cancel(); m.marqueePlayer = null; }
        const currentX = window.getMarqueeCurrentX(m, contentWidth);
        return { m, currentX, duration: 0.8 + ((Math.abs(targetX - currentX) / contentWidth) * 0.7) };
    });
    items.forEach(({ m, currentX }) => {
        m.style.transition = 'none';
        m.style.transform = `translateX(${currentX}px)`;
        m.style.animation = 'none';
    });
    if (tracks.length > 0) void tracks[0].offsetWidth;
    items.forEach(({ m, duration }) => {
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
    
    // ✨ 傳入 7 個參數：第 5 個給 null (無錨點)，第 6 個還原直書捲軸，第 7 個還原分頁按鈕狀態
    window.openArticle(prev.projectId, prev.articleIndex, true, prev.scrollTop || 0, null, prev.innerScrolls || [], prev.activeTabs || []); 
};

function closeModal() {
    window.beginModalNavigation();

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
        // 延遲關閉期間可能已重新開啟視窗，不能解除新視窗的捲動鎖定。
        if (modalOverlay.classList.contains('active') || document.getElementById('sensitive-modal-overlay')) return;
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
    // ✨ 絕對防護：當敏感內容警告窗或 PDF 操作選單開啟時，阻斷所有的方向鍵與背景操作！
    const sensitiveModal = document.getElementById('sensitive-modal-overlay');
    const pdfActionModal = document.getElementById('pdf-action-modal');

    if (sensitiveModal || pdfActionModal) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        if (e.key === 'Escape') {
            if (pdfActionModal) {
                const closeBtn = pdfActionModal.querySelector('.cancel');
                if (closeBtn) closeBtn.click();
                e.preventDefault();
            }
            return; // 放行 ESC 給敏感警告窗，並阻斷其他按鍵穿透
        }
    }

    // ✨ 宣告必要狀態變數
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
        return; 
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

    // --- 🥊 第一層：Lightbox 大圖預覽 ---
    if (isLightboxOpen) {
        if (e.key === 'Escape') {
            const toolbox = document.getElementById('lightbox-toolbox');
            const state = window.lightboxState;
            if (toolbox && toolbox.classList.contains('is-open')) {
                toolbox.classList.remove('is-open'); 
            } else if (state.zoom !== 1) {
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
        
        // ✨ 嚴格判定：必須是「文章內文 (view-article)」顯示中，才允許左右鍵跳轉！
        const viewArticle = document.getElementById('view-article');
        if (viewArticle && viewArticle.style.display !== 'none') {
            if (e.key === 'ArrowLeft') {
                const prevBtn = document.querySelector('#modal-top-left .unified-nav-capsule .capsule-btn.prev:not(:disabled)');
                if (prevBtn) { prevBtn.click(); e.preventDefault(); }
            }
            if (e.key === 'ArrowRight') {
                const nextBtn = document.querySelector('#modal-top-left .unified-nav-capsule .capsule-btn.next:not(:disabled)');
                if (nextBtn) { nextBtn.click(); e.preventDefault(); }
            }
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

window.fitMermaidToLightbox = function(svg) {
    if (!svg) return;
    const vb = svg.getAttribute('viewBox');
    if (!vb) return;
    const [, , vbW, vbH] = vb.trim().split(/[\s,]+/).map(Number);
    if (vbW > 0 && vbH > 0) {
        const maxW = window.innerWidth * 0.85;
        const maxH = window.innerHeight - 220;
        const fitScale = Math.min(maxW / vbW, maxH / vbH, 1.5);
        svg.style.width = `${Math.round(Math.max(Math.min(vbW * fitScale, maxW), Math.min(280, maxW)))}px`;
        svg.style.height = 'auto';
    }
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

    // 2. 完美克隆圖表，並根據 SVG 的 viewBox 計算不撐破畫面的最佳初始尺寸
    const clonedMermaid = mermaidDiv.cloneNode(true);
    clonedMermaid.id = 'lightbox-active-mermaid';
    clonedMermaid.className = 'lightbox-mermaid-clone';
    clonedMermaid.style.width = '';
    clonedMermaid.style.height = '';
    clonedMermaid.style.transform = 'translate(0px, 0px) scale(1)';

    window.fitMermaidToLightbox(clonedMermaid.querySelector('svg'));
    
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
window.initMermaidDrag = function(rootElement = document) {
    const containers = Array.from(rootElement.querySelectorAll('.mermaid-container'));
    if (rootElement.classList?.contains('mermaid-container')) containers.unshift(rootElement);
    containers.forEach(container => {
        const wrapper = container.querySelector('.mermaid-wrapper');
        const mermaidDiv = container.querySelector('.mermaid');
        if (!wrapper || !mermaidDiv || container._mermaidDragWrapper === wrapper) return;
        container._mermaidDragWrapper = wrapper;
        container.classList.add('drag-initialized');

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
        let mermaidWheelTimer = null;
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
            wrapper.classList.add('is-dragging');
            clearTimeout(mermaidWheelTimer);
            mermaidWheelTimer = setTimeout(() => { if (!isDragging) wrapper.classList.remove('is-dragging'); }, 120);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                mermaidDiv.style.transform = `translate(${x}px, ${y}px) scale(${newZoom})`;
            });
        }, { passive: false });
    });
};

function show404Modal(title, message) {
    window.beginModalNavigation();
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

        // 點擊執行解鎖與無縫轉場 / 智慧降級退出與焦點定位
        trigger.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const pParam = urlParams.get('p');
            const aParam = urlParams.get('a');
            const hashParam = window.location.hash || null;
            const { project, article, aIndex } = window.resolveRouteTarget(pParam, aParam);

            // 1. 啟動 System Override 並重刷首頁 UI
            document.body.classList.add('system-override-active');
            window.refreshUIAfterOverrideToggle();

            if (!project) {
                closeModal();
                return;
            }

            // ✨ 2. 檢查「專案層級」是否受金鑰鎖定 -> 強制退回【主頁】並定位閃爍卡片
            const projLocked = project.required_key && !window.isSecretUnlocked(project.required_key);
            if (projLocked) {
                closeModal(); // 關閉 403 Modal (約 300ms 後會自動執行 unlockScroll)
                const projLockMode = project.lock_mode || 'visible';
                
                if (projLockMode !== 'hidden') {
                    // 顯示金鑰提示
                    if (window.showSystemToast) {
                        const lockPrompt = window.getLockPromptText(project);
                        window.showSystemToast('>_ ACCESS_DENIED', '存取被拒', `${lockPrompt} 才能解鎖`, 4000, 'error');
                    }

                    // ✨ 等待 350ms 讓 closeModal 完成捲軸解鎖後，平滑捲動對準該張上鎖卡片並觸發彈跳與紅框閃爍
                    setTimeout(() => {
                        const targetCard = document.querySelector(`.card[data-project-id="${project.id}"]`);
                        if (targetCard && targetCard.offsetWidth > 0) {
                            window.focusAndBumpCard(targetCard);
                            window.simulateHoverFlash(targetCard, 1500);
                        }
                    }, 350);
                }
                return;
            }

            // ✨ 3. 檢查「文章層級」是否受金鑰鎖定 -> 強制退回【專案目錄】並定位閃爍文章
            if (article) {
                const artLocked = article.required_key && !window.isSecretUnlocked(article.required_key);
                if (artLocked) {
                    const artLockMode = article.lock_mode || 'visible';
                    
                    if (artLockMode !== 'hidden') {
                        // 顯示金鑰提示
                        if (window.showSystemToast) {
                            const lockPrompt = window.getLockPromptText(article);
                            window.showSystemToast('>_ ACCESS_DENIED', '存取被拒', `${lockPrompt} 才能解鎖此文章`, 4000, 'error');
                        }

                        // ✨ 設定目標文章索引並開啟 restoreScroll=true，讓 openProjectIndex 渲染後自動對準並執行 simulateHoverFlash
                        window.lastReadArticleIndex = aIndex;
                        window._indexScrollTopCache = 0;
                        window.openProjectIndex(project.id, true);

                        // ✨ 補充一次精準預判捲動，確保目錄從 403 切換過場後完美置中並觸發紅光閃爍
                        setTimeout(() => {
                            const modalContainer = document.querySelector('.modal-content');
                            const targetItem = document.getElementById(`article-item-${aIndex}`);
                            if (modalContainer && targetItem) {
                                const idealScroll = window.calculateIdealScrollCache('view-index', `article-item-${aIndex}`, modalContainer.scrollTop);
                                modalContainer.scrollTo({ top: idealScroll, behavior: 'smooth' });
                                window.simulateHoverFlash(targetItem, 1500);
                            }
                        }, 220);
                    } else {
                        // 若為 hidden 隱藏式文章，單純退回目錄頂端，不定位也不閃爍
                        window.openProjectIndex(project.id, false);
                    }
                    return;
                }
            }

            // 4. 若皆無金鑰鎖定（純 is_hidden 解封），預先檢查目標的版本需求後正常開啟
            let targetVersion = project.min_sys_version || null;
            if (article && article.min_sys_version) {
                if (!targetVersion || window.compareVersions(targetVersion, article.min_sys_version) < 0) {
                    targetVersion = article.min_sys_version;
                }
            }

            if (targetVersion && window.compareVersions(CONFIG.VERSION, targetVersion) < 0) {
                window.triggerSystemUpdate(targetVersion);
                return;
            }

            // 放行進入目標專案或文章
            window.handleAppRouting(pParam, aParam, hashParam);
        });
    }
}

// ==========================================
// ✨ 敏感內容/使用者協議攔截引擎 (Content Warning Engine)
// ==========================================

window.showSensitiveAgreementModal = function(sensitiveType, onAgreeCallback, onDeclineCallback, options = {}) {
    if (document.getElementById('sensitive-modal-overlay')) return;
    const sType = typeof sensitiveType === 'string' ? sensitiveType.toUpperCase() : 'DEFAULT';
    const tpl = window.SENSITIVE_TEMPLATES[sType] || window.SENSITIVE_TEMPLATES["DEFAULT"];
    const rec = sType === 'MAIN' ? options?.recommendedArticle : null;
    const recTitle = rec?.article
        ? window.escapeHtml(window.stripHtml(window.parseDynamicText(String(rec.article.title || rec.article.id || ''), 'TOOLTIP')))
        : '';
    const jumpUnreadHtml = recTitle ? `
            <button type="button" id="sensitive-jump-unread-btn" class="sensitive-jump-card">
                <span class="sensitive-jump-icon">${GLOBAL_SVGS.docIcon}</span>
                <span class="sensitive-jump-body">
                    <span class="sensitive-jump-kicker">建議先閱讀未讀前篇</span>
                    <span class="sensitive-jump-title">${recTitle}</span>
                </span>
                <span class="sensitive-jump-arrow">${GLOBAL_SVGS.chevronRight}</span>
            </button>` : '';

    const overlay = document.createElement('div');
    overlay.id = 'sensitive-modal-overlay';
    overlay.className = 'modal-overlay active'; 
    overlay.style.zIndex = '1100'; 
    overlay.style.cursor = 'pointer';
    overlay.style.transition = 'opacity 0.2s ease';
    
    let closing = false;
    const declineAction = () => {
        if (closing) return;
        closing = true;
        document.removeEventListener('keydown', escListener);
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none'; 
        setTimeout(() => {
            overlay.remove();
            
            // ✨ 核心修復：檢查背後的文章 Modal 是否還開著，如果開著就保持鎖定狀態！
            const mdModal = document.getElementById('md-modal');
            if (!mdModal || !mdModal.classList.contains('active')) {
                window.unlockScroll();
            }
            
            if (onDeclineCallback) onDeclineCallback();
            else window.history.replaceState(null, '', window.location.pathname);
        }, 250); 
    };

    const escListener = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); declineAction(); }
    };
    document.addEventListener('keydown', escListener);

    overlay.innerHTML = `
        <div class="sensitive-modal-content${recTitle ? ' has-jump-card' : ''}" data-sensitive-type="${sType}" style="--current-warning-color: ${tpl.color};">
            <button type="button" id="sensitive-close-x" class="sensitive-close-btn">${GLOBAL_SVGS.closeX}</button>
            <div id="sensitive-warning-icon-wrapper" style="color: var(--current-warning-color);">${GLOBAL_SVGS.warning}</div>
            <h2 class="sensitive-title">${tpl.title}</h2>
            <p class="sensitive-desc">
                ${tpl.desc}<br>
                <span class="sensitive-desc-hint" style="font-size: 0.8rem; opacity: 0.7;">(預設僅於本次瀏覽器存續期間放行)</span>
            </p>
            ${jumpUnreadHtml}
            <label class="sensitive-checkbox-label">
                <input type="checkbox" id="sensitive-remember-checkbox">
                <span class="sensitive-checkbox-text">在此設備永久放行 (關閉瀏覽器後依然有效)</span>
            </label>
            <div class="sensitive-actions">
                <button type="button" id="sensitive-decline-btn" class="btn">不感興趣</button>
                <button type="button" id="sensitive-agree-btn" class="btn">${tpl.btn_text}</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    window.lockScroll();

    const jumpUnreadBtn = document.getElementById('sensitive-jump-unread-btn');
    if (jumpUnreadBtn && rec) {
        jumpUnreadBtn.onclick = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (closing || jumpUnreadBtn.disabled) return;
            closing = true;
            jumpUnreadBtn.disabled = true;
            document.removeEventListener('keydown', escListener);
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            setTimeout(() => {
                overlay.remove();
                const unlockIfIdle = () => {
                    const mdModal = document.getElementById('md-modal');
                    if (!document.getElementById('sensitive-modal-overlay') && (!mdModal || !mdModal.classList.contains('active'))) {
                        window.unlockScroll();
                    }
                };
                try {
                    const result = window.openArticle(rec.projectId, rec.articleIndex);
                    Promise.resolve(result).finally(unlockIfIdle).catch(error => console.error('跳轉未讀前篇失敗：', error));
                } catch (error) {
                    unlockIfIdle();
                    console.error('跳轉未讀前篇失敗：', error);
                }
            }, 250);
        };
    }

    document.getElementById('sensitive-decline-btn').onclick = (e) => { if(e) { e.preventDefault(); e.stopPropagation(); } declineAction(); };
    document.getElementById('sensitive-close-x').onclick = (e) => { if(e) { e.preventDefault(); e.stopPropagation(); } declineAction(); };
    overlay.onclick = (e) => { if (e.target === overlay) { e.preventDefault(); e.stopPropagation(); declineAction(); } };

    document.getElementById('sensitive-agree-btn').onclick = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const btn = document.getElementById('sensitive-agree-btn');
        if (closing || btn.disabled) return;
        closing = true;
        btn.disabled = true;

        const isPermanent = document.getElementById('sensitive-remember-checkbox').checked;

        document.removeEventListener('keydown', escListener); 
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none'; 
        
        setTimeout(() => {
            overlay.remove();
            const unlockIfIdle = () => {
                const mdModal = document.getElementById('md-modal');
                if (!document.getElementById('sensitive-modal-overlay') && (!mdModal || !mdModal.classList.contains('active'))) {
                    window.unlockScroll();
                }
            };
            try {
                const result = onAgreeCallback ? onAgreeCallback(isPermanent) : null;
                Promise.resolve(result).finally(unlockIfIdle).catch(error => console.error('內容警告後續流程失敗：', error));
            } catch (error) {
                unlockIfIdle();
                console.error('內容警告後續流程失敗：', error);
            }
        }, 250);
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
    const navigation = window.beginModalNavigation();

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

    if (navigation !== window._modalNavigation) return;

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
    const navigation = window.beginModalNavigation();
    let fetchError = false;

    if (!isSystemFallback) {
        const vResult = await window.safeFetchWithGuard(`./version.json?t=${new Date().getTime()}`, { isJson: true });
        if (vResult.aborted || navigation !== window._modalNavigation) return;
        if (vResult.success && vResult.data && vResult.data.version && vResult.data.version !== CONFIG.VERSION) {
            const nextVer = vResult.data.version;
            console.warn(`[MANUAL_UPDATE] 發現新版本 ${nextVer}，準備強制更新...`);
            sessionStorage.setItem('sys_intent', 'changelog');
            sessionStorage.removeItem('sys_reboot_count');

            // 🔥 直接呼叫共用過場畫面引擎
            window.showSystemRebootScreen(
                'MANUAL_OVERRIDE : UPDATE', 
                CONFIG.VERSION, 
                nextVer, 
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

    if (window.cachedChangelogs === null) {
        const logResult = await window.safeFetchWithGuard(`./changelogs.json?v=${window.getResVersion('changelogs.json')}`, { isJson: true });
        if (logResult.aborted || navigation !== window._modalNavigation) return;
        if (logResult.success && Array.isArray(logResult.data)) {
            window.cachedChangelogs = logResult.data;
        } else {
            console.error("日誌讀取或更新檢查失敗:", logResult.error || '無法載入 changelogs.json');
            fetchError = true;
        }
    }

    // 另一個頁面或錯誤畫面已接手時，不再更新 DOM。
    if (navigation !== window._modalNavigation) return;

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
// ✨ 通用分頁/視角切換引擎 (Tabbed Content Switcher)
// ==========================================
window.switchTabPanel = function(panelId, btn, groupName) {
    const container = btn.closest('.markdown-body') || document;
    container.querySelectorAll(`.tab-panel[data-group="${groupName}"]`).forEach(el => {
        el.style.display = 'none';
    });

    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
        targetPanel.style.display = 'block';
    }

    const tabs = btn.closest('.tab-buttons') || btn.parentElement;
    if (tabs) {
        tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        
        // ✨ 若頁籤列可橫向滑動，點擊時自動將該顆頁籤平滑移至中間視野
        if (tabs.scrollWidth > tabs.clientWidth) {
            const targetScrollLeft = btn.offsetLeft - (tabs.clientWidth / 2) + (btn.offsetWidth / 2);
            tabs.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
        }
    }
    btn.classList.add('active');
};

// ==========================================
// ✨ 分頁區塊自動封裝與高度同步引擎
// ==========================================
window.initTabSections = function(rootEl = document) {
    if (!rootEl) return;

    // 1. 將每組 .tab-buttons 一路包覆到 .md-tab-end (若未設置，預設包覆至 .article-nav-cards 或下一組 .tab-buttons 強制結束)
    const tabBars = Array.from(rootEl.querySelectorAll('.tab-buttons'));
    tabBars.forEach(bar => {
        if (bar.parentElement && bar.parentElement.classList.contains('tab-section-wrapper')) return;

        let scan = bar.nextElementSibling;
        let lastNode = null;

        while (scan) {
            // ✨ 只有在遇到明確設置的 .md-tab-end、下一組 .tab-buttons、或文章底部的 .article-nav-cards 時才停止！
            if (
                scan.classList.contains('md-tab-end') ||
                scan.classList.contains('tab-buttons') ||
                scan.classList.contains('article-nav-cards')
            ) {
                break;
            }
            lastNode = scan;
            scan = scan.nextElementSibling;
        }

        if (lastNode) {
            const wrapper = document.createElement('div');
            wrapper.className = 'tab-section-wrapper';
            bar.parentNode.insertBefore(wrapper, bar);

            let curr = bar;
            while (curr) {
                const next = curr.nextElementSibling;
                wrapper.appendChild(curr);
                if (curr === lastNode) break;
                curr = next;
            }
        }
    });

    // 2. 初始載入時自動校正 .tab-btn.active 的顯示狀態
    rootEl.querySelectorAll('.tab-buttons .tab-btn.active').forEach(btn => {
        if (typeof btn.onclick === 'function') btn.onclick();
    });
};

// ==========================================
// ✨ 分頁高度強制同步引擎 (鎖定同群組最高高度，防止切換時視窗與下方分割線跳動)
// ==========================================
window.syncTabPanelsHeight = function(rootEl = document) {
    if (!rootEl) return;
    const panels = Array.from(rootEl.querySelectorAll('.tab-panel[data-group]'));
    if (panels.length === 0) return;

    const scroller = window.getActiveScrollContainer();
    const savedScrollTop = scroller ? scroller.scrollTop : 0;

    const groups = {};
    panels.forEach(p => {
        if (p.getAttribute('data-sync') === 'false') return;
        const g = p.getAttribute('data-group');
        if (!groups[g]) groups[g] = [];
        groups[g].push(p);
    });

    Object.values(groups).forEach(groupPanels => {
        if (groupPanels.length <= 1) return;

        // 記錄原本哪個面板是顯示的
        const origDisplays = groupPanels.map(p => p.style.display);
        const activeIdx = groupPanels.findIndex(p => window.getComputedStyle(p).display !== 'none');
        if (activeIdx !== -1 && groupPanels[activeIdx].offsetWidth === 0) return;

        // 1. 先歸零 min-height，才能量出字體縮放或換行後的最新自然高度
        groupPanels.forEach(p => { p.style.minHeight = ''; });

        let maxHeight = 0;
        groupPanels.forEach(p => { p.style.display = 'none'; });
        try {
            groupPanels.forEach(p => {
                p.style.display = 'block';
                const rect = p.getBoundingClientRect();
                const width = p.offsetWidth;
                const scale = width > 0 ? rect.width / width : 1;
                const height = scale > 0 ? Math.ceil(rect.height / scale) : p.offsetHeight;
                maxHeight = Math.max(maxHeight, height);
                p.style.display = 'none';
            });
        } finally {
            groupPanels.forEach((p, idx) => {
                p.style.display = origDisplays[idx];
                if (maxHeight > 0) {
                    p.style.minHeight = `${maxHeight}px`;
                    p.style.boxSizing = 'border-box';
                }
            });
        }
    });

    // 確保量測過程不會影響外層捲軸位置
    if (scroller && scroller.scrollTop !== savedScrollTop) {
        scroller.scrollTop = savedScrollTop;
    }
};

// 視窗寬度改變時也自動重新計算分頁高度
let tabHeightFrame = null;
window.addEventListener('resize', () => {
    if (tabHeightFrame !== null) return;
    tabHeightFrame = window.requestAnimationFrame(() => {
        tabHeightFrame = null;
        const viewArticle = document.getElementById('view-article');
        if (viewArticle && viewArticle.style.display !== 'none') window.syncTabPanelsHeight(viewArticle);
    });
});


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
                window.executeAnchorScroll(hash, true);
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
function openPdfActionSheet(markup) {
    const previous = document.getElementById('pdf-action-modal');
    const overlay = document.createElement('div');
    overlay.id = 'pdf-action-modal';
    overlay.innerHTML = markup;
    const sheet = overlay.querySelector('.pdf-action-sheet');
    if (previous) previous.replaceWith(overlay);
    else document.body.appendChild(overlay);
    window.lockScroll();

    // 全螢幕選單保留原位；若選單或它的容器層級較高，僅提高這個面板。
    const menu = document.querySelector('#fullscreen-menu.active');
    if (menu) {
        const currentZ = Number.parseInt(getComputedStyle(overlay).zIndex, 10) || 0;
        let z = currentZ;
        for (let node = menu; node && node !== document.body; node = node.parentElement) {
            const menuZ = Number.parseInt(getComputedStyle(node).zIndex, 10);
            if (menuZ >= z) z = menuZ + 1;
        }
        if (z !== currentZ) overlay.style.zIndex = String(z);
    }

    const enterTimer = setTimeout(() => {
        if (!overlay.isConnected) return;
        overlay.style.opacity = '1';
        sheet.style.transform = 'translateY(0)';
    }, 10);

    let closing = false;
    const close = () => {
        if (closing || !overlay.isConnected) return;
        closing = true;
        clearTimeout(enterTimer);
        sheet.querySelectorAll('button').forEach(button => { button.disabled = true; });
        overlay.style.opacity = '0';
        sheet.style.transform = 'translateY(100%)';
        setTimeout(() => {
            if (!overlay.isConnected) return; // 已被新的面板取代。
            overlay.remove();
            window.unlockScroll();
        }, 300);
    };

    overlay.querySelector('.cancel').onclick = close;
    overlay.onclick = (event) => { if (event.target === overlay) close(); };
    return { overlay, close };
}

window.showPdfActionModal = function(href, title) {
    // ✨ 判斷是否為 PWA (Standalone) 模式
    const isPWA = window.isPWAEnvironment();
    
    // 為了完美的 UX：如果是 PWA，我們直接把藍色主按鈕變成「下載」，並隱藏下方的第二顆按鈕
    const viewBtnText = isPWA ? '檢視 PDF 檔案' : '在新視窗檢視 PDF';
    const viewBtnIcon = GLOBAL_SVGS.newTab;
    const downloadBtnDisplay = isPWA ? 'none' : 'flex';

    const { overlay, close } = openPdfActionSheet(`
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
    `);

    // 綁定事件
    overlay.querySelector('#pdf-view-btn').onclick = () => {
        if (isPWA) {
            // ✨ 聽你的！為了原生的 Safari 工具列，我們換回最強的 Blob 大法！
            window.triggerSecureDownload(href, title, true);
        } else {
            // 普通瀏覽器直接另開分頁即可
            window.open(href, '_blank');
        }
        close();
    };

    if (!isPWA) {
        overlay.querySelector('#pdf-download-btn').onclick = () => {
            // ✨ 單純下載 PDF，傳入 false
            window.triggerSecureDownload(href, title, false);
            close();
        };
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


// ==========================================
// 🖥️ 系統重載與記憶重置底部選單 (完美借用 PDF Modal UI)
// ==========================================
// 記憶管理沿用 PDF Action Sheet，不另建一套彈窗引擎。
window.showSystemMemoryModal = function(mode) {
    const exporting = mode === 'export';
    const { overlay, close } = openPdfActionSheet(`
        <div class="pdf-action-sheet sys-memory-sheet">
            <div class="pdf-drag-handle"></div>
            <div class="pdf-sheet-title" style="color: var(--accent); font-family: monospace;">&gt;_ ${exporting ? '匯出系統記憶' : '匯入系統記憶'}</div>
            <div class="pdf-sheet-subtitle">${exporting ? 'EXPORT_MEMORY' : 'IMPORT_MEMORY'}</div>
            <div class="sys-memory-options">
                <p>${exporting ? '備份目前的鑰匙、碎片、已讀及動畫紀錄與外觀偏好。檔案包含閱讀進度，請自行妥善保管。' : '選擇 Azustock 記憶備份（JSON）。鑰匙及閱讀紀錄將合併，不會覆蓋或刪除既有進度。'}</p>
                ${exporting ? '' : '<input id="sys-memory-file" class="sys-memory-file" type="file" accept=".json,application/json" aria-label="選擇記憶備份">'}
                <label><input type="checkbox" id="sys-memory-agreements" aria-describedby="sys-memory-agreement-hint">${exporting ? '一併備份' : '一併還原'}永久內容警告同意紀錄</label>
                <p id="sys-memory-agreement-hint" class="sys-memory-hint"></p>
                ${exporting ? '' : `<label><input type="checkbox" id="sys-memory-preferences" aria-describedby="sys-memory-preference-hint">覆寫現有外觀偏好（主題、字體大小）</label>
                <p id="sys-memory-preference-hint" class="sys-memory-hint"></p>
                <label><input type="checkbox" id="sys-memory-prebackup">合併前先下載目前記憶的完整備份（含永久同意紀錄）</label>
                <p class="sys-memory-hint">備份交由瀏覽器下載，請自行確認檔案已儲存。</p>`}
                <p id="sys-memory-meta" class="sys-memory-hint"></p>
                <p id="sys-memory-status" class="sys-memory-status" role="status" aria-live="polite"></p>
            </div>
            <div class="pdf-btn-group">
                <button id="sys-memory-confirm" class="pdf-action-btn primary" ${exporting ? '' : 'disabled'}>${exporting ? '下載 JSON 備份' : '確認合併'}</button>
                <button id="sys-memory-back" class="pdf-action-btn secondary">返回系統維護</button>
                <button class="pdf-action-btn cancel">取消</button>
            </div>
        </div>
    `);
    const $ = selector => overlay.querySelector(selector);
    const status = $('#sys-memory-status');
    const confirmBtn = $('#sys-memory-confirm');
    const agreements = $('#sys-memory-agreements');
    const agreementHint = $('#sys-memory-agreement-hint');
    const preferences = $('#sys-memory-preferences');
    const preferenceHint = $('#sys-memory-preference-hint');
    const prebackup = $('#sys-memory-prebackup');
    const metadata = $('#sys-memory-meta');
    const fileInput = $('#sys-memory-file');
    const report = (message, error = false) => {
        status.textContent = message;
        status.classList.toggle('is-error', error);
    };
    const describeCounts = data => `鑰匙／碎片 ${data.sys_unlocked_secrets?.length || 0} 筆、已讀 ${data.sys_read_articles?.length || 0} 筆、動畫 ${data.sys_animated_secrets?.length || 0} 筆、永久同意 ${data.sys_agreed_sensitive?.length || 0} 筆。`;
    const setOptions = data => {
        agreements.checked = false;
        agreements.disabled = !data?.sys_agreed_sensitive?.length;
        agreementHint.textContent = !data ? '請先選擇備份檔案。' : agreements.disabled
            ? (exporting ? '目前沒有永久同意紀錄。' : '此備份未包含可還原的永久同意紀錄。')
            : `可${exporting ? '備份' : '還原'} ${data.sys_agreed_sensitive.length} 筆永久同意紀錄。`;
        if (preferences) {
            preferences.checked = false;
            preferences.disabled = !data || (data.theme === undefined && data.sys_text_scale === undefined);
            preferenceHint.textContent = !data ? '請先選擇備份檔案。' : preferences.disabled ? '此備份沒有外觀偏好。' : '僅覆寫備份中存在的設定。';
        }
    };
    $('#sys-memory-back').onclick = () => window.showSystemReloadModal();
    let payload = null;
    let readSequence = 0;
    let committed = false;
    let reloading = false;
    const reload = () => {
        if (reloading) return;
        reloading = true;
        close();
        setTimeout(() => window.location.reload(), 300);
    };
    if (exporting) {
        try {
            const snapshot = window.SysMemory.snapshot(true);
            setOptions(snapshot.data);
            metadata.textContent = window.SysMemory.describe(snapshot);
            report('目前記憶：' + describeCounts(snapshot.data));
        } catch (_) { report('無法讀取目前記憶。', true); }
    } else {
        setOptions(null);
        prebackup.disabled = true;
        fileInput.onchange = async () => {
            const sequence = ++readSequence;
            payload = null;
            confirmBtn.disabled = true;
            setOptions(null);
            prebackup.disabled = true;
            metadata.textContent = '';
            const file = fileInput.files?.[0];
            if (!file) { report(''); return; }
            if (file.size > window.SysMemory.MAX_BYTES) { report('檔案超過 2 MiB。', true); return; }
            report('正在檢查備份格式…');
            try {
                const parsed = JSON.parse(await file.text());
                const data = window.SysMemory.validate(parsed);
                if (sequence !== readSequence || !overlay.isConnected) return;
                payload = parsed;
                setOptions(data);
                metadata.textContent = window.SysMemory.describe(parsed);
                report('備份內容：' + describeCounts(data));
                confirmBtn.disabled = prebackup.disabled = false;
            } catch (_) {
                if (sequence !== readSequence || !overlay.isConnected) return;
                report('無法讀取備份：JSON 格式、版本或資料內容無效。', true);
            }
        };
    }
    const finish = (message, error = false) => {
        committed = true;
        report(message, error);
        confirmBtn.textContent = '重新整理系統';
        confirmBtn.disabled = false;
        fileInput.disabled = agreements.disabled = preferences.disabled = prebackup.disabled = true;
        // 完成摘要留在畫面，離開時才重新整理，避免舊 UI 使用過期記憶。
        $('#sys-memory-back').style.display = 'none';
        $('.cancel').textContent = '關閉並重新整理';
        $('.cancel').onclick = reload;
        overlay.onclick = event => { if (event.target === overlay) reload(); };
    };
    confirmBtn.onclick = () => {
        if (committed) { reload(); return; }
        if (exporting) {
            try {
                const filename = window.SysMemory.download(agreements.checked);
                report('已交由瀏覽器下載：' + filename + '。請確認檔案已儲存。');
                window.triggerHaptic('success');
            } catch (_) { report('無法匯出記憶，請確認瀏覽器允許儲存及下載。', true); }
            return;
        }
        if (!payload) return;
        confirmBtn.disabled = true;
        if (prebackup.checked) {
            try { window.SysMemory.download(true, 'before-import'); }
            catch (_) {
                report('無法建立匯入前備份，尚未合併任何記憶。', true);
                confirmBtn.disabled = false;
                return;
            }
        }
        try {
            const result = window.SysMemory.merge(payload, {
                includeAgreements: agreements.checked,
                restorePreferences: preferences.checked
            });
            const counts = Object.fromEntries(Object.entries(result.added).map(([key, length]) => [key, { length }]));
            const summary = '本次新增：' + describeCounts(counts) + `更新 ${result.preferences} 項外觀偏好。`;
            const backupNote = prebackup.checked ? '已交由瀏覽器下載匯入前備份，請確認檔案。' : '';
            if (result.failed) {
                finish(summary + ` ${result.failed} 筆資料未能儲存；請保留原始備份，重新整理後可再次匯入。` + backupNote, true);
            } else {
                finish('合併完成。' + summary + backupNote);
                window.triggerHaptic('success');
            }
        } catch (_) {
            finish('記憶儲存中斷，可能已有部分資料合併。請保留備份，重新整理後再試。', true);
        }
    };
};

window.showSystemReloadModal = function() {
    // 準備 SVG 圖示
    const refreshIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>`;
    const trashIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

    // 套用與 PDF 彈窗 100% 相同的 HTML 結構 (pdf-action-sheet, pdf-action-btn)
    const { overlay, close } = openPdfActionSheet(`
        <div class="pdf-action-sheet sys-memory-sheet">
            <div class="pdf-drag-handle"></div>
            <div class="pdf-sheet-title" style="color: var(--accent); font-family: monospace;">&gt;_ 系統維護控制台</div>
            <div class="pdf-sheet-subtitle">SYSTEM MAINTENANCE CONSOLE</div>
            <div class="pdf-btn-group">
                <button id="sys-btn-soft-reload" class="pdf-action-btn primary">
                    <span style="width: 20px; height: 20px; display: inline-flex; align-items: center;">${refreshIcon}</span>重新整理系統 (SOFT_RELOAD)
                </button>
                <button id="sys-btn-export-memory" class="pdf-action-btn secondary">
                    匯出系統記憶 (EXPORT_MEMORY)
                </button>
                <button id="sys-btn-import-memory" class="pdf-action-btn secondary">
                    匯入系統記憶 (IMPORT_MEMORY)
                </button>
                <button id="sys-btn-format-memory" class="pdf-action-btn secondary" style="color: var(--error-color); border-color: var(--error-shadow); background: var(--card);">
                    <span style="width: 20px; height: 20px; display: inline-flex; align-items: center;">${trashIcon}</span>重置系統記憶 (FORMAT_MEMORY)
                </button>
                <button id="sys-modal-close" class="pdf-action-btn cancel">取消</button>
            </div>
        </div>
    `);

    // 綁定維護操作
    overlay.querySelector('#sys-btn-soft-reload').onclick = (e) => {
        e.stopPropagation();
        if (typeof window.triggerHaptic === 'function') window.triggerHaptic('selection');
        close();
        setTimeout(() => window.location.reload(), 300);
    };

    overlay.querySelector('#sys-btn-export-memory').onclick = () => window.showSystemMemoryModal('export');
    overlay.querySelector('#sys-btn-import-memory').onclick = () => window.showSystemMemoryModal('import');

    overlay.querySelector('#sys-btn-format-memory').onclick = (e) => {
        e.stopPropagation();
        window.triggerHaptic('warning');
        window.showSystemFormatMemoryModal();
    };
};

window.showSystemFormatMemoryModal = function() {
    const { overlay, close } = openPdfActionSheet(`
        <div class="pdf-action-sheet sys-memory-sheet">
            <div class="pdf-drag-handle"></div>
            <div class="pdf-sheet-title" style="color: var(--error-color); font-family: monospace;">&gt;_ 確認重置系統記憶</div>
            <div class="pdf-sheet-subtitle">CONFIRM_FORMAT_MEMORY</div>
            <div class="sys-memory-options">
                <p>此操作將清除目前網域的鑰匙、碎片、已讀、動畫及永久內容警告同意紀錄，也會清除系統版本快取及暫時狀態。主題與字體大小將保留。</p>
                <p>若沒有備份，清除後將無法透過本站還原。</p>
                <label><input type="checkbox" id="sys-format-backup" checked>重置前先下載完整備份（含永久同意紀錄）</label>
                <label><input type="checkbox" id="sys-format-ack">我已了解，確定要清除系統記憶。</label>
                <p id="sys-format-status" class="sys-memory-status" role="status" aria-live="polite"></p>
            </div>
            <div class="pdf-btn-group">
                <button id="sys-format-confirm" class="pdf-action-btn secondary" style="color: var(--error-color); border-color: var(--error-shadow);" disabled>確認重置 (FORMAT_MEMORY)</button>
                <button id="sys-format-back" class="pdf-action-btn secondary">返回系統維護</button>
                <button class="pdf-action-btn cancel">取消</button>
            </div>
        </div>
    `);
    const ack = overlay.querySelector('#sys-format-ack');
    const backup = overlay.querySelector('#sys-format-backup');
    const confirmBtn = overlay.querySelector('#sys-format-confirm');
    const status = overlay.querySelector('#sys-format-status');
    const reportError = message => { status.textContent = message; status.classList.add('is-error'); };
    overlay.querySelector('#sys-format-back').onclick = () => window.showSystemReloadModal();
    ack.onchange = () => { confirmBtn.disabled = !ack.checked; };
    let resetting = false;
    confirmBtn.onclick = () => {
        if (!ack.checked || resetting) return;
        confirmBtn.disabled = true;
        if (backup.checked) {
            try { window.SysMemory.download(true, 'before-reset'); }
            catch (_) {
                reportError('無法建立備份，尚未清除任何記憶。');
                confirmBtn.disabled = false;
                return;
            }
            // 下載可能被瀏覽器取消。必須另行確認已儲存，才開始不可逆的重置。
            backup.checked = false;
            backup.disabled = true;
            ack.checked = false;
            status.textContent = '已交由瀏覽器下載備份。請確認檔案已儲存，再勾選確認並重置。';
            status.classList.remove('is-error');
            return;
        }
        resetting = true;
        ack.disabled = backup.disabled = true;
        try {
            const savedTheme = localStorage.getItem('theme');
            const savedTextScale = localStorage.getItem('sys_text_scale');

            // ✨ 徹底清除所有由系統寫入的權限與快取紀錄
            window.SysStorage.removeLocalSet('sys_unlocked_secrets');
            window.SysStorage.removeLocalSet('sys_animated_secrets');
            localStorage.removeItem('sys_data_versions');
            window.SysStorage.removeLocalSet('sys_agreed_sensitive'); // ✨ 新增：清除永久同意的敏感內容紀錄
            window.SysStorage.removeLocalSet('sys_read_articles');
            
            sessionStorage.clear();
            window.SysStorage.clearCache();
            window._agreedSensitiveTypes?.clear();

            // 恢復無關權限的外觀偏好設定
            if (savedTheme) localStorage.setItem('theme', savedTheme);
            if (savedTextScale) localStorage.setItem('sys_text_scale', savedTextScale);

            close();

            setTimeout(() => {
                try {
                    window.showSystemRebootScreen("FORMATTING_MEMORY", CONFIG.VERSION, "N/A", "CLEARING_CACHE", true);
                    setTimeout(() => { window.location.reload(); }, 1200);
                } catch (error) {
                    window.location.reload();
                }
            }, 300);
        } catch (_) {
            reportError('重置中斷，可能已有部分記憶被清除。請保留備份並重新整理系統。');
            confirmBtn.textContent = '重新整理系統';
            confirmBtn.disabled = false;
            confirmBtn.onclick = () => window.location.reload();
            overlay.querySelector('#sys-format-back').onclick = confirmBtn.onclick;
            overlay.querySelector('.cancel').onclick = confirmBtn.onclick;
            overlay.onclick = event => { if (event.target === overlay) window.location.reload(); };
        }
    };
};

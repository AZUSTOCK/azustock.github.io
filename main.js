/* ================================================================== */
/* ⚙️ 網站核心設定區 (SITE CONFIGURATION)                               */
/* 每次發布新版本或修改全域狀態時，請只在這裡修改！                         */
/* ================================================================== */
const CONFIG = {
    // 🚩 發布前必改
    VERSION: "U1.5.0",          // 目前系統版本號

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
// ✨ 全域共用 SVG 圖標 (避免重複宣告)
// ==========================================
const GLOBAL_SVGS = {
    link: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    pin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`,
    pinSmall: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(-45deg);"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`,
    
    // ✨ 修改：只留一個扣環，並給它 'secret-shackle' 準備做物理彈出動畫
    secretPin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path class="secret-shackle" d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    secretPinSmall: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path class="secret-shackle" d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
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
    ['OC']
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

// ==========================================
// ✨ 全域防止捲軸跳動控制器 (Scroll Lock Engine)
// ==========================================
window.lockScroll = function() {
    // 防呆：如果已經鎖定，就直接返回，防止重複執行導致閃爍 (解決問題 1)
    if (document.body.style.overflow === 'hidden') return;
    
    // 只做鎖定，不做 Padding 補償，因為 CSS 已經處理好了
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
        show404Modal('404 Not Found', '無法找到您指定的專案。<br/>此連結可能已失效、被移除，或是輸入錯誤的網址。');
        window.history.replaceState(null, '', window.location.pathname);
        return;
    }

    // ✨ 安全防護 1 (專案攔截)：如果該專案是隱藏的，但系統尚未解鎖 (body 沒有 system-override-active)
    if (project.is_hidden && !document.body.classList.contains('system-override-active')) {
        show404Modal('403 ACCESS_DENIED', '拒絕存取。<br/><span style="opacity: 0.8; font-size: 0.85em; font-family: monospace;">ERR_SEC_PROTOCOL: Unauthorized request blocked by <span style="cursor: pointer; position: relative;" class="secret-admin-trigger">風川梓</span>.</span>');
        // 刪除 replaceState，讓網址列保留目標參數，以便解鎖後跳轉！
        return;
    }

    if (aParam !== null && aParam !== undefined) {
        let aIndex = project.articles.findIndex(art => art.id === aParam);
        if (aIndex === -1 && !isNaN(parseInt(aParam))) aIndex = parseInt(aParam, 10);
        
        if (aIndex !== -1 && aIndex < project.articles.length) {
            const article = project.articles[aIndex];
            
            // ✨ 安全防護 2 (文章攔截)：如果該文章是隱藏的，但系統尚未解鎖
            if (article.is_hidden && !document.body.classList.contains('system-override-active')) {
                show404Modal('403 ACCESS_DENIED', '拒絕存取。<br/><span style="opacity: 0.8; font-size: 0.85em; font-family: monospace;">ERR_SEC_PROTOCOL: Unauthorized request blocked by <span style="cursor: pointer; position: relative;" class="secret-admin-trigger">風川梓</span>.</span>');
                // 刪除 replaceState，讓網址列保留目標參數，以便解鎖後跳轉！
                return;
            }

            window.openArticle(project.id, aIndex, false, 0, hashParam);
        } else {
            show404Modal('Article Not Found', `在專案「${project.title}」中找不到此文章。<br/>可能不存在或已被移除。`);
            window.history.replaceState(null, '', window.location.pathname);
        }
    } else {
        window.openProjectIndex(project.id); 
    }
};

// ✨ 統一清單產生器 (根據排序與群組，計算絕對視覺順序)
window.getArticleSequence = function(projectId) {
    const proj = window.siteProjects.find(p => p.id === projectId);
    if (!proj || !proj.articles) return [];
    
    // ✨ 新增：判斷系統是否已經解鎖 (System Override 狀態)
    const isUnlocked = document.body.classList.contains('system-override-active');
    
    // 讀取專案獨立排序
    let currentSort = sessionStorage.getItem(`sort_${projectId}`) || proj.default_sort || 'desc';
    
    // ✨ 核心修復：直接從源頭剔除沒有權限查看的隱藏文章！
    let displayArticles = proj.articles
        .map((art, idx) => ({ art, idx }))
        .filter(item => isUnlocked || !item.art.is_hidden);
    
    const pinned = displayArticles.filter(item => item.art.pinned);
    const unpinned = displayArticles.filter(item => !item.art.pinned);
    
    const renderUnpinned = currentSort === 'asc' ? [...unpinned] : [...unpinned].reverse();
    const finalArray = [...pinned, ...renderUnpinned];
    
    let flatSequence = [];
    // 核心邏輯：群組本身的順序「不反轉」，只依照 Object.keys 的原生順序迭代
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

// ✨ 共用複製連結功能 (還原純淨版，依靠 CSS 鎖定尺寸)
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

// ✨ 新增：共用卡片聚焦與跳躍引擎
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
// ✨ 言の箱題庫快取系統 (Singleton Pattern)
// ==========================================
window.cachedKotobaList = null;
window.getKotobaList = async function() {
    if (window.cachedKotobaList !== null) return window.cachedKotobaList;
    
    try {
        const res = await fetch('./kotoba.md');
        if (res.ok) {
            const text = await res.text();
            window.cachedKotobaList = text.split('---').map(n => n.trim()).filter(n => n.length > 0);
        } else {
            window.cachedKotobaList = [];
        }
    } catch (err) {
        console.warn("言の箱載入失敗:", err);
        window.cachedKotobaList = [];
    }
    return window.cachedKotobaList;
};

// ==========================================
// ✨ 系統名言題庫快取系統 (Singleton Pattern)
// ==========================================
window.cachedQuotesList = null;
window.getQuotesList = async function() {
    if (window.cachedQuotesList !== null) return window.cachedQuotesList;
    
    try {
        const res = await fetch('./quotes.md');
        if (res.ok) {
            const text = await res.text();
            window.cachedQuotesList = text.split('---').map(n => n.trim()).filter(n => n.length > 0);
        } else {
            window.cachedQuotesList = [];
        }
    } catch (err) {
        console.warn("Quotes 載入失敗:", err);
        window.cachedQuotesList = [];
    }
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
// ✨ 全域圖片破圖處理器 (終極解決 Safari/iOS 限制)
// ==========================================
window.handleImageError = function(img) {
    img.onerror = null; 
    img.classList.remove('is-loading');
    img.classList.add('is-broken');
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
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
        // ✨ 設定大圖來源為高畫質原圖
        lightboxImg.src = targetImg.getAttribute('data-full') || targetImg.src; 
        
        // 重置大圖定位與縮放
        lightboxImg.style.transition = 'none';
        lightboxImg.style.transform = `translate(0px, 0px) scale(1)`; 

        // 2. 顯示 Modal
        lightboxModal.classList.add('is-active');

        // ✨ 補回這行，膠囊與按鈕才會真正被呼叫顯示出來！
        window.updateLightboxView();

        // 3. 定義「計算原圖 2 倍限制」的函數
        const calculateMaxZoomForNatural = () => {
            const naturalWidth = lightboxImg.naturalWidth; 
            const displayWidth = lightboxImg.clientWidth;   
            
            if (displayWidth > 0 && naturalWidth > 0) {
                window.lightboxState.maxZoom = (naturalWidth / displayWidth) * 1.5;
            } else {
                window.lightboxState.maxZoom = 2; // 防呆備用值
            }
        };

        // 4. 確保圖片載入後再進行計算
        if (lightboxImg.complete) {
            calculateMaxZoomForNatural();
        } else {
            lightboxImg.onload = calculateMaxZoomForNatural;
        }

        // 恢復動畫過渡效果
        setTimeout(() => { 
            lightboxImg.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'; 
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
    
    // 更新影像與背景
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    if (lightboxImg) {
        state.zoom = 1; 
        state.x = 0; 
        state.y = 0; 
        lightboxImg.style.transform = `translate(0px, 0px) scale(1)`; 
        lightboxImg.src = currentItem.src;
    }
    if (lightboxBackdrop) lightboxBackdrop.src = currentItem.src;
    
    // ✨ 精準控制說明文字的顯示與隱藏
    if (lightboxCaption) {
        lightboxCaption.innerText = currentItem.caption || "";
        lightboxCaption.style.display = currentItem.caption ? "block" : "none";
    }

    // ✨ 更新膠囊導覽列與計數器
    const navCapsule = document.getElementById('lightbox-nav-capsule');
    const counter = document.getElementById('lightbox-counter');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (state.images.length > 1) {
        if (navCapsule) navCapsule.style.display = 'inline-flex';
        if (counter) counter.innerText = `${state.currentIndex + 1} / ${state.images.length}`;
        
        // 動態加上或移除 disabled 樣式
        if (prevBtn) prevBtn.classList.toggle('disabled', state.currentIndex === 0);
        if (nextBtn) nextBtn.classList.toggle('disabled', state.currentIndex === state.images.length - 1);
    } else {
        // 如果只有單張圖片，直接隱藏整個膠囊
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
    const img = document.getElementById('lightbox-img');
    const state = window.lightboxState;
    if (!img) return;

    if (action === 'zoom-in') {
        // ✨ 改為使用計算出的 maxZoom
        state.zoom = Math.min(state.zoom + 0.5, state.maxZoom);
    } else if (action === 'zoom-out') {
        state.zoom = Math.max(state.zoom - 0.5, 0.5);
    } else if (action === 'reset') {
        state.zoom = 1;
        state.x = 0;
        state.y = 0;
    } 
    // ✨ 新增：僅將圖片位移歸零，但不改變縮放比例
    else if (action === 'center') {
        state.x = 0;
        state.y = 0;
    } 
    else if (action === 'new-tab') {
        window.open(img.src, '_blank');
        return;
    }
    
    // 套用 transform
    img.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
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

        if (toolbox) {
            toolbox.classList.remove('is-open');
        }
        // 延遲清空，避免關閉動畫破圖
        setTimeout(() => {
            document.getElementById('lightbox-img').src = "";
            document.getElementById('lightbox-backdrop').src = "";
            document.getElementById('lightbox-caption').innerText = "";
        }, 300);
    }
    
    // ✨ 新增：強制清除當前元素焦點，消滅 Esc 退出時的奇怪按鈕外框
    if (document.activeElement) {
        document.activeElement.blur();
    }
};

// ==========================================
// ✨ Lightbox 滾輪縮放、拖曳與多點觸控 (Pinch Zoom) 引擎
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. 視窗安全高度計算 (修正工具列擋住問題)
    function adjustLightboxHeight() {
        const modal = document.getElementById('lightbox-modal');
        if (window.visualViewport && modal) {
            modal.style.height = window.visualViewport.height + 'px';
        }
    }
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', adjustLightboxHeight);
        window.visualViewport.addEventListener('scroll', adjustLightboxHeight);
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
    const lightboxImg = document.getElementById('lightbox-img');
    
    // 狀態變數
    let isDragging = false;
    let startClientX = 0, startClientY = 0;
    
    // 儲存目前在螢幕上的觸控點 (支援多指)
    let activePointers = [];
    let initialPinchDistance = null;
    let initialZoom = 1;

    if (lightboxImg) {
        // 🛑 封殺原生拖曳殘影
        lightboxImg.addEventListener('dragstart', (e) => e.preventDefault());

        const updateTransform = () => {
            lightboxImg.style.transform = `translate(${window.lightboxState.x}px, ${window.lightboxState.y}px) scale(${window.lightboxState.zoom})`;
        };

        const onPointerMove = (e) => {
            // 更新觸控點最新座標
            const index = activePointers.findIndex(p => p.id === e.pointerId);
            if (index !== -1) {
                activePointers[index].x = e.clientX;
                activePointers[index].y = e.clientY;
            }

            // 【模式 A：單指平移】
            if (activePointers.length === 1 && isDragging) {
                e.preventDefault();
                window.lightboxState.x = activePointers[0].x - startClientX;
                window.lightboxState.y = activePointers[0].y - startClientY;
                requestAnimationFrame(updateTransform);
            } 
            // 【模式 B：雙指縮放】
            else if (activePointers.length === 2) {
                e.preventDefault();
                // 1. 計算兩指間的最新距離
                const currentDistance = Math.hypot(
                    activePointers[0].x - activePointers[1].x,
                    activePointers[0].y - activePointers[1].y
                );

                if (initialPinchDistance) {
                    // 2. 算出新的縮放比例
                    let newZoom = initialZoom * (currentDistance / initialPinchDistance);
                    newZoom = Math.max(1, Math.min(newZoom, window.lightboxState.maxZoom)); // 限制在最低與最大倍率之間

                    // 3. 找出雙指中心點，實現「往手指中心放大」的自然手感
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
            // 移除放開的那根手指
            activePointers = activePointers.filter(p => p.id !== e.pointerId);

            // 如果手指剩下不到兩根，重置雙指縮放初始值
            if (activePointers.length < 2) {
                initialPinchDistance = null; 
            }

            // 狀態轉換
            if (activePointers.length === 1) {
                // 如果原本是雙指，放開一指後，剩下一指無縫接軌繼續「平移」
                isDragging = true;
                startClientX = activePointers[0].x - window.lightboxState.x;
                startClientY = activePointers[0].y - window.lightboxState.y;
            } else if (activePointers.length === 0) {
                // 手指全放開，徹底停止所有動作
                isDragging = false;
                lightboxImg.classList.remove('is-dragging');
                if (lightboxImg.hasPointerCapture && lightboxImg.hasPointerCapture(e.pointerId)) {
                    lightboxImg.releasePointerCapture(e.pointerId);
                }
                
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
                window.removeEventListener('pointercancel', onPointerUp);
            }
        };

        lightboxImg.addEventListener('pointerdown', (e) => {
            if (e.target.id !== 'lightbox-img') return;
            e.preventDefault(); // 🛑 核心：封殺瀏覽器原生點擊反應，交由 JS 全權接管

            // 紀錄按下的這根手指
            activePointers.push({ id: e.pointerId, x: e.clientX, y: e.clientY });

            if (activePointers.length === 1) {
                // 【觸發單指平移】
                isDragging = true;
                lightboxImg.classList.add('is-dragging');
                if (lightboxImg.setPointerCapture) lightboxImg.setPointerCapture(e.pointerId);
                
                startClientX = e.clientX - window.lightboxState.x;
                startClientY = e.clientY - window.lightboxState.y;
                
                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
                window.addEventListener('pointercancel', onPointerUp);
            } else if (activePointers.length === 2) {
                // 【觸發雙指縮放】
                isDragging = false; // 暫停平移
                // 記下雙指剛按下的初始距離與圖片當下縮放率
                initialPinchDistance = Math.hypot(
                    activePointers[0].x - activePointers[1].x,
                    activePointers[0].y - activePointers[1].y
                );
                initialZoom = window.lightboxState.zoom;
            }
        });
    }

    // 4. 滾輪縮放引擎 (維持現狀，給電腦使用)
    if (wrapper && lightboxImg) {
        wrapper.addEventListener('wheel', (e) => {
            if (!document.getElementById('lightbox-modal').classList.contains('is-active')) return;
            e.preventDefault();
            
            const state = window.lightboxState;
            const delta = e.deltaY < 0 ? 1 : -1;
            
            // ✨ 將 15 倍的死值改為動態的 state.maxZoom
            let newZoom = Math.max(1, Math.min(state.zoom * (1 + delta * 0.15), state.maxZoom));
            newZoom = Math.max(1, Math.min(newZoom, state.maxZoom));
            
            const ratio = newZoom / state.zoom - 1;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            state.x -= (e.clientX - centerX - state.x) * ratio;
            state.y -= (e.clientY - centerY - state.y) * ratio;
            state.zoom = newZoom;
            
            lightboxImg.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
        }, { passive: false });
    }
});

// ==========================================
// ✨ 攔截 Markdown 渲染，讓圖片一出生就自帶載入中特效，0毫秒延遲！
// ==========================================
const renderer = new marked.Renderer();

/// 1. ✨ 修復與升級：攔截圖片，支援影音，並自動轉換 Figure 圖片說明與高質感 Tooltip！
renderer.image = function(token_or_href, title, text) {
    const href = typeof token_or_href === 'object' ? token_or_href.href : token_or_href;
    const altText = typeof token_or_href === 'object' ? token_or_href.text : text;
    const imgTitle = typeof token_or_href === 'object' ? token_or_href.title : title; 
    
    if (!href) return '';

    /// 👇 1. 新增 PDF 攔截器 (替換為系統原生 SVG 圖示)
    if (href.match(/\.pdf$/i)) {
        // ✨ 使用你系統預設的文章/文件 SVG 圖示
        const docSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        
        return `
        <div class="pdf-container" style="margin: 2rem 0; border: 1px solid var(--card-border); border-radius: 0.8rem; overflow: hidden; box-shadow: 0 4px 15px var(--shadow-base);">
            <div style="background: var(--glass-bg); padding: 0.6rem 1.2rem; border-bottom: 1px solid var(--card-border); font-family: monospace; font-size: 0.9rem; color: var(--muted); display: flex; justify-content: space-between; align-items: center;">
                
                <!-- 左側：系統文件 SVG 與檔名 -->
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--accent);">
                    ${docSvg}
                    <span style="transform: translateY(1px);">${altText || 'Document.pdf'}</span>
                </div>
                
                <!-- 右側：新分頁開啟按鈕 -->
                <a href="${href}" target="_blank" style="color: var(--muted); text-decoration: none; display: flex; align-items: center; gap: 6px; font-weight: 600; transition: color 0.2s ease;" onmouseover="this.style.color='var(--accent-2)'" onmouseout="this.style.color='var(--muted)'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    新分頁開啟
                </a>
            </div>
            
            <iframe src="${href}" width="100%" height="600px" style="border: none; display: block; background: var(--bg);">您的瀏覽器不支援 PDF 嵌入。</iframe>
        </div>`;
    }

    if (href.match(/\.(mp4|webm|ogg)$/i)) {
        return `<video controls class="md-video"><source src="${href}" type="video/${href.split('.').pop()}">您的瀏覽器不支援影片標籤。</video>`;
    }
    if (href.match(/\.(mp3|wav|ogg)$/i)) {
        return `<audio controls class="md-audio"><source src="${href}" type="audio/${href.split('.').pop()}">您的瀏覽器不支援音樂標籤。</audio>`;
    }

    // 解析縮圖與原圖 (透過 Python 塞入的 #full= 傳遞)
    let srcUrl = href;
    let fullUrl = href;
    if (href.includes('#full=')) {
        const parts = href.split('#full=');
        srcUrl = parts[0];
        fullUrl = parts[1];
    }

    // ✨ 恢復純淨版 imgTag (移除內聯的 onclick 與 style，交給下方統一處理)
    const imgTag = `<img src="${srcUrl}" data-full="${fullUrl}" alt="${altText || ''}" class="is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">`;

    // 統一的 SVG 放大鏡圖示
    const zoomIconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;

    if (imgTitle) {
        // 【情境 A：有說明文字的圖】
        let figureClass = '';
        if (altText === 'float-right' || altText === 'float-left') {
            figureClass = ` class="${altText}"`;
        }
        const zoomBtn = `<button class="zoom-btn" data-tooltip="放大檢視" onclick="window.openLightbox(this, event)">${zoomIconSvg}</button>`;
        return `<figure${figureClass}>${imgTag}<figcaption>${imgTitle}${zoomBtn}</figcaption></figure>`;
    } else {
        // 【情境 B：沒有說明文字的圖 (包含 Icon 與 Badge)】
        if (altText === 'icon' || altText === 'badge') return imgTag;
        
        let figureClass = 'no-caption';
        if (altText === 'float-right' || altText === 'float-left') {
            figureClass += ` ${altText}`;
        }
        
        const zoomBtn = `<button class="zoom-btn floating" data-tooltip="放大檢視" onclick="window.openLightbox(this, event)">${zoomIconSvg}</button>`;
        return `<figure class="${figureClass}">${imgTag}${zoomBtn}</figure>`;
    }
};

// 2. ✨ 攔截 Mermaid 程式碼區塊 (支援自訂標題與自動尋找)
const originalCodeRenderer = renderer.code.bind(renderer);
renderer.code = function(token_or_code, language, isEscaped) {
    const lang = typeof token_or_code === 'object' ? token_or_code.lang : language;
    const text = typeof token_or_code === 'object' ? token_or_code.text : token_or_code;

    if (lang && lang.startsWith('mermaid')) {
        // ✨ 優先檢查是否有自訂標題 (支援 ```mermaid[我的標題] 寫法)
        let chartTitle = "流程圖 (Flowchart)";
        const fullLang = typeof token_or_code === 'object' ? (token_or_code.lang || language) : (language || '');
        const titleMatch = fullLang.match(/\[(.*?)\]/);
        
        if (titleMatch && titleMatch[1]) {
            chartTitle = titleMatch[1];
        } else if (window._lastMarkdownHeadings && window._lastMarkdownHeadings.length > 0) {
            // 如果沒寫中括號，自動抓取文章中圖表上方最近的一個 Markdown 標題
            chartTitle = window._lastMarkdownHeadings[window._lastMarkdownHeadings.length - 1];
        }

        const encodedText = encodeURIComponent(text);
        return `
        <div class="mermaid-container" data-zoom="1" data-x="0" data-y="0">
            <div class="mermaid-toolbar">
                <span class="mermaid-title">${chartTitle}</span>
                <div class="mermaid-btns">
                    <button class="mermaid-btn" onclick="window.zoomMermaid(this, 'zoom-in')" data-tooltip="放大">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </button>
                    <button class="mermaid-btn" onclick="window.zoomMermaid(this, 'zoom-out')" data-tooltip="縮小">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </button>
                    <button class="mermaid-btn" onclick="window.zoomMermaid(this, 'reset')" data-tooltip="重設比例">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                    </button>
                    <div style="width: 1px; height: 16px; background: var(--card-border); margin: 0 2px; align-self: center;"></div>
                    <button class="mermaid-btn" onclick="window.fullscreenMermaid(this)" data-tooltip="全螢幕">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                    </button>
                </div>
            </div>
            <div class="mermaid-wrapper">
                <div class="mermaid" data-original-text="${encodedText}">${text}</div>
            </div>
        </div>`;
    }
    return originalCodeRenderer.apply(this, arguments);
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
    
    // 外部連結
    if (href.startsWith('http')) {
        const extIcon = isImageLink ? '' : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: -2px; opacity: 0.8;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr} style="${baseStyle}"${hoverFx}>${linkText}${extIcon}</a>`;
    }

    return `<a href="${href}"${titleAttr} style="${baseStyle}"${hoverFx}>${linkText}</a>`;
};

// 4. ✨ 攔截 Markdown 標題，同時用全域陣列記住最新出現的標題文字
window._lastMarkdownHeadings = [];
renderer.heading = function(token_or_text, level, raw) {
    const text = typeof token_or_text === 'object' ? token_or_text.text : token_or_text;
    const depth = typeof token_or_text === 'object' ? token_or_text.depth : level;
    
    window._lastMarkdownHeadings.push(text);
    const id = text.toLowerCase().replace(/\s+/g, '-');
    return `<h${depth} id="${id}">${text}</h${depth}>`;
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
        const targetColor = badge ? window.getStatusColorFromCSS(badge.toUpperCase()) : 'var(--accent)';
        const displayText = badge ? badge : 'HIGHLIGHT'; 
        
        // ✨ 改成 20 次，並使用雙層 span 接力，徹底解決跑馬燈斷字問題
        const repeatedText = `${displayText} • `.repeat(20);
        const duration = Math.max(20, repeatedText.length * 0.4); 
        
        const bgHtml = `<span class="marquee-text-track" style="--marquee-duration: ${duration}s;" aria-hidden="true"><span class="marquee-part">${repeatedText}</span><span class="marquee-part">${repeatedText}</span></span>`;
        
        return `<span class="md-highlight-text" style="--dynamic-glow: ${targetColor};">${bgHtml}<span class="text-content">${this.parser.parseInline(token.tokens)}</span></span>`;
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
        const targetColor = badge ? window.getStatusColorFromCSS(badge.toUpperCase()) : 'var(--accent)';
        const displayText = badge ? badge : 'HIGHLIGHT'; 
        
        const repeatedText = `${displayText} • `.repeat(50);
        const duration = Math.max(20, repeatedText.length * 0.4); 
        
        const bgHtml = `<div class="marquee-text-track" style="--marquee-duration: ${duration}s;" aria-hidden="true"><span class="marquee-part">${repeatedText}</span><span class="marquee-part">${repeatedText}</span></div>`;
        
        // ✨ 改用 div 並加上 is-block 類別
        return `<div class="md-highlight-text is-block" style="--dynamic-glow: ${targetColor};">${bgHtml}<div class="text-content">${this.parser.parse(token.tokens)}</div></div>`;
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

// ⚠️ 記得把 rubyExtension 加進 marked.use 的陣列裡！
marked.use({ 
    extensions: [spoilerExtension, highlightExtension, highlightBlockExtension, rubyExtension], 
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
            
            // ✨ 核心修復 2：只在「文章已經打開，且畫面上真的有圖表」時，才觸發重繪
            const mermaidEls = document.querySelectorAll('.mermaid');
            if (mermaidEls.length > 0) {
                mermaidEls.forEach(el => {
                    const originalText = decodeURIComponent(el.getAttribute('data-original-text') || '');
                    if (originalText) {
                        el.textContent = originalText; 
                        el.removeAttribute('data-processed'); 
                    }
                });
                window.mermaid.run({ querySelector: '.mermaid' }).catch(() => {});
            }
        }
    
        // const targetFaviconUrl = theme === 'light' ? CONFIG.FAVICON_LIGHT : CONFIG.FAVICON_DARK;
        // document.querySelectorAll("link[rel='icon']").forEach(link => link.href = targetFaviconUrl);

        const iframe = document.querySelector('iframe.giscus-frame');
        if (iframe && iframe.contentWindow) {
            const newGiscusTheme = theme === 'light' ? 'light' : 'transparent_dark';
            iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: newGiscusTheme } } }, 'https://giscus.app');
        }
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
            e.preventDefault(); // 攔截原生跳轉
            
            const targetHash = navItem.getAttribute('href');
            const targetId = targetHash.substring(1);
            
            // 1. 關閉選單並解鎖捲軸
            menuToggle.classList.remove('open');
            fullscreenMenu.classList.remove('active');
            window.unlockScroll();
            
            // 2. 尋找目標並手動執行跳轉與動畫
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                // 如果網址列不一樣，就手動更新網址列，但不觸發預設跳動
                if (window.location.hash !== targetHash) {
                    window.history.pushState(null, null, targetHash);
                }
                
                // 平滑捲動回區塊頂端
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // ✨ 終極修復 1：清除上一次的計時器，防止多次點擊互相干擾 (解決消失過快)
                if (targetSection.animationTimer) {
                    clearTimeout(targetSection.animationTimer);
                }
                
                // ✨ 終極修復 2：暫時拔掉 ID 與 Class，徹底消滅 CSS 的 :target 狀態 (解決有時沒反應)
                targetSection.id = '';
                targetSection.classList.remove('force-target');
                
                // 強迫瀏覽器重新計算畫面 (Reflow，此時瀏覽器確認動畫被完全移除了)
                void targetSection.offsetWidth; 
                
                // 把 ID 與 Class 裝回去，動畫從 0 秒完美重播！
                targetSection.id = targetId;
                targetSection.classList.add('force-target');
                
                // 重新獨立計時，3秒後清除 Class
                targetSection.animationTimer = setTimeout(() => {
                    targetSection.classList.remove('force-target');
                }, 3000);
            }
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
                
                // 延遲 100 毫秒重新計算網格捲軸並更新卡片數字
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                    document.querySelectorAll('.grid, .gallery').forEach(el => el.dispatchEvent(new Event('scroll')));
                    
                    // ✨ 核心修復：當解鎖或重新上鎖時，動態更新所有首頁卡片的「展開系列 (X)」數字！
                    const isUnlocked = document.body.classList.contains('system-override-active');
                    window.siteProjects.forEach(proj => {
                        // 尋找對應專案的卡片 (透過比對該專案底下的分類 grid)
                        const grid = document.getElementById(`${proj.category}-grid`);
                        if (grid && proj.articles && proj.articles.length > 0) {
                            // 遍尋該 grid 裡的所有卡片，找出標題符合的卡片
                            const cards = grid.querySelectorAll('.card');
                            cards.forEach(card => {
                                const titleEl = card.querySelector('h3');
                                if (titleEl && titleEl.innerText.includes(proj.title)) {
                                    const actionBtn = card.querySelector('.action-btn');
                                    if (actionBtn && actionBtn.innerText.includes('展開系列')) {
                                        // 根據當前解鎖狀態，決定要顯示全部數量還是扣除隱藏文章的數量
                                        const count = isUnlocked ? proj.articles.length : proj.articles.filter(art => !art.is_hidden).length;
                                        
                                        // 保留原本完美的 SVG 圖標，只替換後方的文字數字
                                        const iconWrap = actionBtn.querySelector('div');
                                        actionBtn.innerHTML = '';
                                        if (iconWrap) actionBtn.appendChild(iconWrap);
                                        actionBtn.insertAdjacentHTML('beforeend', `展開系列 (${count})`);
                                    }
                                }
                            });
                        }
                    });

                    // ✨ 動態更新懸浮膠囊與高光狀態！
                    if (window.currentActiveTag) {
                        const activeTag = window.currentActiveTag;
                        window.currentActiveTag = null; 
                        window.filterByTag(activeTag);  
                    }
                }, 100);
                
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
    bttBtn.classList.toggle('visible', window.scrollY > 300);
});
bttBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// === 3. JSON 資料載入與卡片動態生成 ===
async function loadProjects() {
    const dynamicNav = document.getElementById('dynamic-nav');
    const portfolioSections = document.getElementById('portfolio-sections');
    const marquee = document.getElementById('marquee-text');

    try {
        // ✨ 加入時間戳防護，徹底破壞 JSON 快取，保證資料 100% 最新！
        const response = await fetch(`${CONFIG.DATA_SOURCE}?t=${new Date().getTime()}`);
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
        projects.forEach(p => {
            // ✨ 在推導邏輯之前，先結算所有獨立屬性
            ['is_new', 'is_updated', 'is_wip', 'is_archived', 'pinned'].forEach(k => {
                if (p[k] !== undefined) p[k] = evaluateStatus(p[k]);
            });
            
            // ✨ 針對 hidden 屬性使用專屬的解封邏輯
            if (p.is_hidden !== undefined) p.is_hidden = evaluateHidden(p.is_hidden);
            
            // 結算標籤陣列，過期的會在這裡直接被丟棄
            p.tags = parseAndFilterTags(p.tags);

            let isCardUpdated = p.is_updated;

            if (p.articles && p.articles.length > 0) {
                // 子文章也要提前執行結算
                p.articles.forEach(art => {
                    ['is_new', 'is_updated', 'is_wip', 'is_archived', 'pinned'].forEach(k => {
                        if (art[k] !== undefined) art[k] = evaluateStatus(art[k]);
                    });
                    
                    // ✨ 子文章的 hidden 屬性
                    if (art.is_hidden !== undefined) art.is_hidden = evaluateHidden(art.is_hidden);
                    
                    // 子文章的標籤陣列也要結算
                    art.tags = parseAndFilterTags(art.tags);
                });

                // 如果專案本身不是全新的，只要底下有 新文章(NEW) 或 更新(UPDATED)，專案就掛上 UPDATED
                if (!p.is_new && !isCardUpdated) {
                    if (p.articles.some(art => 
                        art.is_new || 
                        art.is_updated || 
                        (art.tags && (art.tags.includes('NEW') || art.tags.includes('UPDATED') || art.tags.includes('LATEST')))
                    )) {
                        isCardUpdated = true;
                    }
                }
            }
            p.computed_is_updated = isCardUpdated;

            let activeStates = new Set();
            const flatStatusList = window.STATUS_LIST.flat(); 

            flatStatusList.forEach(status => {
                const boolKey = `is_${status.toLowerCase()}`;
                const isTrue = status === 'UPDATED' ? isCardUpdated : p[boolKey];

                // 1. 處理專案「自己」的屬性 (如果專案本身是 NEW，這裡依然會正確加上 NEW)
                if (isTrue || p.tags.includes(status)) activeStates.add(status);
                
                // 2. 處理「子文章」的狀態冒泡 (✨ 關鍵：擋下子文章的 NEW，不讓它傳染給專案)
                if (status !== 'NEW' && p.articles && p.articles.some(art => art[`is_${status.toLowerCase()}`] === true || (art.tags && art.tags.includes(status)))) {
                    activeStates.add(status);
                }
            });

            p.tags = p.tags.filter(t => !flatStatusList.includes(t));

            [...window.STATUS_LIST].reverse().forEach(group => {
                const winningStatus = group.find(status => activeStates.has(status));
                if (winningStatus) p.tags.unshift(winningStatus);
            });
        });

        window.siteProjects = projects;

        // 1. 處理跑馬燈橫幅
        if (marquee) {
            // ✨ 1. 建立「公開白名單」：找出所有未隱藏專案的標籤
            const publicTags = projects.filter(p => !p.is_hidden).flatMap(p => p.tags || []);
            
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
                    
                    // ✨ 3. 將標籤與後方的「分隔線」包裝在同一個 span 裡，並掛上隱藏屬性
                    const wrapperClass = isSecret ? 'marquee-tag-wrapper sys-hidden-ticker' : 'marquee-tag-wrapper';
                    return `<span class="${wrapperClass}">${innerHtml} <span style="color: var(--muted); opacity: 0.5; margin: 0 1rem;">|</span> </span>`;
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
                    const statusAttr = flatList.includes(tag) ? ` data-status="${tag}" class="tag status-tag"` : ' class="tag"';
                    return `<span${statusAttr} data-tag="${tag}" onclick="window.filterByTag('${tag}', event, this)">${tag}</span>`;
                }).join('');
                
                let actionText = '';
                if (data.articles && data.articles.length > 0) {
                    card.style.cursor = 'pointer';
                    card.onclick = () => { if (window.currentActiveTag) window.clearFilter(); openProjectIndex(data.id); };
                    
                    // ✨ 核心修復：首頁卡片上的數字也同步扣除隱藏文章
                    const visibleCount = data.articles.filter(art => !art.is_hidden).length;
                    
                    actionText = `<div class="action-btn" style="margin-top: 1.2rem; color: var(--accent); font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; transition: color 0.2s ease;">
                        <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
                            <svg class="icon-book-closed" style="position: absolute; transition: opacity 0.2s ease, transform 0.2s ease;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                            <svg class="icon-book-open" style="position: absolute; opacity: 0; transform: scale(0.8); transition: opacity 0.2s ease, transform 0.2s ease;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        </div>展開系列 (${visibleCount})</div>`;
                } else if (data.link) {
                    card.style.cursor = 'pointer';
                    card.onclick = () => { if (window.currentActiveTag) window.clearFilter(); window.open(data.link, '_blank'); };
                    actionText = `<div class="action-btn" style="margin-top: 1.2rem; color: var(--accent); font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; transition: color 0.2s ease;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> 
                        前往外部專案 <span class="action-arrow" data-dir="up-right" style="display: flex; align-items: center; transition: transform 0.2s ease;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></span></div>`;
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
                const scrollOneItem = (direction) => {
                    const cards = Array.from(grid.querySelectorAll('.card'));
                    if (cards.length === 0) return;

                    const containerRect = grid.getBoundingClientRect();
                    const paddingLeft = parseFloat(window.getComputedStyle(grid).paddingLeft) || 0;
                    const targetEdge = containerRect.left + paddingLeft;

                    let closestIndex = 0;
                    let minDistance = Infinity;

                    cards.forEach((card, index) => {
                        const distance = Math.abs(card.getBoundingClientRect().left - targetEdge);
                        if (distance < minDistance) { minDistance = distance; closestIndex = index; }
                    });

                    let targetIndex = Math.max(0, Math.min(closestIndex + direction, cards.length - 1));
                    let scrollAmount = cards[targetIndex].getBoundingClientRect().left - targetEdge;

                    const maxScrollLeft = grid.scrollWidth - grid.clientWidth;
                    if (direction > 0 && scrollAmount > maxScrollLeft - grid.scrollLeft) scrollAmount = maxScrollLeft - grid.scrollLeft;
                    else if (direction < 0 && Math.abs(scrollAmount) > grid.scrollLeft) scrollAmount = -grid.scrollLeft;
                    
                    grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                };

                hintRight.addEventListener('click', () => scrollOneItem(1));
                hintLeft.addEventListener('click', () => scrollOneItem(-1));
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
        portfolioSections.innerHTML = `<div class="error-container"><span class="error-text">ERR: FAILED TO FETCH DATA</span></div>`;
        if (marquee) { marquee.innerHTML = `<span>SYSTEM OFFLINE • CONNECTION REFUSED • </span>`.repeat(4); marquee.style.color = "var(--error-color)"; }
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
        screen.style.cssText = `position:fixed; inset:0; background:var(--bg); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--accent); opacity:${immediate ? '1' : '0'}; transition:opacity 0.3s ease;`;
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

// ==========================================
// ✨ 全域引擎：版本快取防禦與自動重載系統 (Auto-Updater Engine)
// ==========================================
async function checkSystemVersionAndBoot() {
    const isRebooting = sessionStorage.getItem('sys_is_rebooting') === 'true';
    const expectedVersion = sessionStorage.getItem('sys_expected_version') || 'UNKNOWN';

    if (isRebooting) {
        // 如果剛重整完，畫面會因為 index.html 的設定保持全黑。我們立刻放上無縫遮罩！
        showSystemRebootScreen('SYSTEM_REBOOTING', CONFIG.VERSION, expectedVersion, 'VERIFYING_MODULES', true);
    }

    try {
        const res = await fetch(`./changelogs.json?t=${new Date().getTime()}`);
        const logs = await res.json();
        
        if (logs && logs.length > 0) {
            const remoteVersion = logs[0].version; 
            
            if (remoteVersion !== CONFIG.VERSION) {
                console.warn(`[SYS_UPDATE] 偵測到版本差異 (本機: ${CONFIG.VERSION}, 遠端: ${remoteVersion})`);
                
                const rebootCount = parseInt(sessionStorage.getItem('sys_reboot_count') || '0');
                if (rebootCount >= 2) {
                    console.error("[SYS_UPDATE] 自動更新失敗，可能因為 CDN 伺服器快取延遲。已強制啟動舊版系統。");
                    
                    sessionStorage.removeItem('sys_reboot_count'); 
                    sessionStorage.removeItem('sys_is_rebooting');
                    sessionStorage.removeItem('sys_expected_version');
                    
                    hideSystemRebootScreen(false); // ✨ 傳入 false 顯示失敗狀態
                    loadProjects(); 
                    
                    // ✨ 完美修復版 Toast：從右上角降落，且點擊消失
                    setTimeout(() => {
                        const errorToast = document.createElement('div');
                        errorToast.style.cssText = "position: fixed; top: 90px; right: 30px; z-index: 10000; opacity: 0; transform: translateY(-20px); transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); cursor: pointer;";
                        errorToast.innerHTML = `
                            <div style="background: var(--error-color); color: #fff; padding: 14px 24px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.85rem; box-shadow: 0 4px 20px var(--error-shadow); display: flex; flex-direction: column; gap: 6px; width: max-content; max-width: calc(100vw - 60px); box-sizing: border-box; line-height: 1.4; transition: box-shadow 0.3s ease;">
                                
                                <!-- ✨ 修正 X 旋轉軸心偏移：鎖死尺寸、使用 flex 絕對置中，並設定 transform-origin -->
                                <div class="toast-x-icon" style="position: absolute; top: 12px; right: 14px; width: 18px; height: 18px; display: flex; justify-content: center; align-items: center; opacity: 0.9; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: center center;">
                                    <!-- ✨ 加上 display: block 徹底消除 SVG 預設的文字底部隱形留白 -->
                                    <svg style="display: block;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </div>
                                
                                <strong style="font-size: 1rem; letter-spacing: 0.05em; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">>_ UPDATE_FAILED</strong>
                                <span style="opacity: 0.95; font-weight: 600; padding-right: 1.5rem;">CDN_CACHE_DELAY_DETECTED</span>
                                <span style="opacity: 0.85; font-size: 0.8rem;">已暫時還原為安全版本 (v${CONFIG.VERSION})</span>
                            </div>
                        `;

                        document.body.appendChild(errorToast);

                        setTimeout(() => {
                            errorToast.style.opacity = '1';
                            errorToast.style.transform = 'translateY(0)';
                        }, 50);

                        const toastBox = errorToast.firstElementChild;
                        const xIcon = errorToast.querySelector('.toast-x-icon');

                        // 懸停時增強陰影微光，X 完美繞著中心點順時針轉 90 度
                        toastBox.onmouseenter = () => { 
                            toastBox.style.boxShadow = '0 0 25px var(--error-shadow), 0 0 10px rgba(255,255,255,0.2)'; 
                            if (xIcon) xIcon.style.transform = 'rotate(90deg) scale(1.1)';
                        };
                        toastBox.onmouseleave = () => { 
                            toastBox.style.boxShadow = '0 4px 20px var(--error-shadow)'; 
                            if (xIcon) xIcon.style.transform = 'rotate(0deg) scale(1)';
                        };

                        // 點擊事件：立刻淡出並移除，且清除自動移除的計時器
                        errorToast.onclick = () => {
                            clearTimeout(autoRemoveTimer);
                            errorToast.style.opacity = '0';
                            errorToast.style.transform = 'translateY(-10px)';
                            setTimeout(() => errorToast.remove(), 400);
                        };
                        
                        const autoRemoveTimer = setTimeout(() => {
                            errorToast.style.opacity = '0';
                            errorToast.style.transform = 'translateY(-10px)';
                            setTimeout(() => errorToast.remove(), 400);
                        }, 8000);
                    }, 1000);
                    
                    return;
                }
                
                sessionStorage.setItem('sys_reboot_count', (rebootCount + 1).toString());
                sessionStorage.setItem('sys_is_rebooting', 'true');
                sessionStorage.setItem('sys_expected_version', remoteVersion);

                showSystemRebootScreen('SYSTEM_VERSION_MISMATCH', CONFIG.VERSION, remoteVersion, 'SYS_UPDATING...', isRebooting);
                
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
            }
        }
    } catch (err) {
        console.warn("版本檢查程序跳過:", err);
        sessionStorage.removeItem('sys_is_rebooting');
    }
    
    // ✨ 傳入 true 顯示成功狀態，並渲染新網站
    hideSystemRebootScreen(true);
    loadProjects();
}

window.addEventListener('DOMContentLoaded', checkSystemVersionAndBoot);
// ==========================================
// ✨ 升級版系統日誌：支援「手動強制更新檢查」
// ==========================================
window.cachedChangelogs = null; 

window.showChangelogModal = async function() {
    document.body.style.cursor = 'wait';
    let fetchError = false;

    try {
        const response = await fetch(`./changelogs.json?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('找不到 changelogs.json');
        const latestLogs = await response.json();
        
        if (latestLogs && latestLogs.length > 0 && latestLogs[0].version !== CONFIG.VERSION) {
            console.warn(`[MANUAL_UPDATE] 發現新版本 ${latestLogs[0].version}，準備強制更新...`);
            
            // 手動更新，核發「無縫重整通行證」
            sessionStorage.removeItem('sys_reboot_count');
            sessionStorage.setItem('sys_is_rebooting', 'true');
            sessionStorage.setItem('sys_expected_version', latestLogs[0].version);

            showSystemRebootScreen('MANUAL_OVERRIDE : UPDATE', CONFIG.VERSION, latestLogs[0].version, 'SYS_REBOOTING...');
            
            setTimeout(() => {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('v', new Date().getTime());
                window.location.replace(newUrl.toString());
            }, 1800);
            
            return; 
        }

        window.cachedChangelogs = latestLogs;

    } catch (error) {
        console.error("日誌讀取或更新檢查失敗:", error);
        fetchError = true;
    }
    
    document.body.style.cursor = '';

    // 共用標題渲染
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

    // 第一層：索引清單
    window.renderChangelogIndex = function() {
        switchModalContent(
            () => {
                const modalOverlay = document.getElementById('md-modal');
                const modalBody = document.getElementById('modal-body');
                const tocMountPoint = document.getElementById('toc-mount-point');
                
                if (tocMountPoint) tocMountPoint.innerHTML = '';
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
                        let tabColor = window.getStatusColorFromCSS(activeStatus);
                        let badgeHTML = `<span class="status-badge title-badge" data-status="${activeStatus}">${log.status}</span>`;

                        listHTML += `
                            <li class="article-li is-highlight" style="--tab-color: ${tabColor}; margin-bottom: 1rem;">
                                <a href="javascript:void(0)" class="article-link" onclick="window.renderChangelogDetail('${log.id}')">
                                    <div class="article-item-icon-wrap">
                                        <div class="article-item-fallback" style="color: ${tabColor};">
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
                                            <span class="article-item-title"><span style="font-family: monospace; color: var(--accent-2); font-size: 1.15rem;">${log.version}</span>${badgeHTML}</span>
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

    // 第二層：詳細記錄
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
            },
            () => document.querySelector('.modal-content').scrollTop = 0
        );
    };

    window.renderChangelogIndex();
};

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
    });
    window.modalBodyObserver.observe(modalBody);
}

function switchModalContent(updateDOMCallback, afterUpdateCallback = null) {
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
        if (topLeft) topLeft.classList.add('content-fade-out');
        if (tocMount) tocMount.classList.add('content-fade-out');
        
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
                if (topLeft) topLeft.classList.remove('content-fade-out');
                if (tocMount) tocMount.classList.remove('content-fade-out');

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
                    
                    let baseIconHtml = art.cover_image 
                        ? `<img src="${art.cover_image}" alt="cover" class="article-item-cover is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` 
                        : `<div class="article-item-fallback"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>`;
                    
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
                        if (groupData.highlight && !groupColor) {
                            groupColor = themePalette[colorIndex % themePalette.length];
                            colorIndex++; 
                        }

                        let titleColorStyle = groupColor ? `color: ${groupColor}; border-bottom-color: ${groupColor};` : `color: var(--accent); border-bottom-color: var(--divider-line);`;
                        const topMargin = isFirstGroup ? '0rem' : '1.8rem';
                        
                        html += `
                            <div class="group-header" style="margin-top: ${topMargin}; margin-bottom: 0.8rem;">
                                <div class="group-header-title" style="${titleColorStyle}">${groupData.title || groupId}</div>
                                ${groupData.description ? `<div class="group-header-desc">${groupData.description}</div>` : ''}
                            </div>
                            <ul class="article-list-ul">
                        `;
                        groupArticles.forEach(({art, idx}) => { html += generateLi(art, idx, groupData.highlight, groupColor); });
                        html += `</ul>`;
                        
                        isFirstGroup = false;
                    }
                    const ungrouped = finalArray.filter(item => !item.art.group);
                    if (ungrouped.length > 0) {
                        const topMargin = isFirstGroup ? '0rem' : '1.5rem';
                        html += `<ul class="article-list-ul" style="margin-top:${topMargin};">`;
                        ungrouped.forEach(({art, idx}) => { html += generateLi(art, idx, false, null); });
                        html += `</ul>`;
                    }
                } else {
                    html += `<ul class="article-list-ul" style="margin-top:0rem;">`;
                    finalArray.forEach(({art, idx}) => { html += generateLi(art, idx, false, null); });
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
                            
                            // ✨ 【關鍵修復 1】：把「當下的目標」鎖定進獨立的常數中！
                            // 因為接下來開始捲動時，scroll 事件會觸發，把外層的 targetArticle 覆寫成 null。
                            const finalTarget = targetArticle;
                            
                            // ✨ 【關鍵修復 2】：精準計算絕對高度 (對抗外層群組 position: relative 的干擾)
                            let absoluteTop = finalTarget.offsetTop;
                            let currentEl = finalTarget.offsetParent;
                            while(currentEl && currentEl !== modalContainer) {
                                absoluteTop += currentEl.offsetTop;
                                currentEl = currentEl.offsetParent;
                            }

                            const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 120;
                            
                            // 1. 平滑捲動到精準位置
                            modalContainer.scrollTo({
                                top: Math.max(0, absoluteTop - topBarHeight - 20),
                                behavior: 'smooth'
                            });
                            
                            // 2. 點擊後隱藏 toast
                            jumpToast.classList.remove('is-visible'); 
                            
                            // 3. 等待捲動結束後，為「鎖定的目標」精準加上高光！
                            setTimeout(() => {
                                finalTarget.classList.add('simulate-hover');
                                
                                // 4. 700 毫秒後移除高光
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
                        const targetItem = document.getElementById(`article-item-${window.lastReadArticleIndex}`);
                        if (targetItem) {
                            const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 120;
                            modalContainer.scrollTop = Math.max(0, targetItem.offsetTop - topBarHeight - 20);
                            
                            // ✨ 觸發 simulate-hover 提示特效
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
// ✨ 修正：將 targetHash 加回來，並把 restoreInnerScrolls 放在最後面 (第 6 個參數)
window.openArticle = async function(projectId, articleIndex, isFromHistory = false, restoreScrollTop = 0, targetHash = null, restoreInnerScrolls = []) {
    const jumpToast = document.getElementById('new-jump-toast');
    if (jumpToast) jumpToast.classList.remove('is-visible');

    if (!isFromHistory) {
        if (!window.historyStack) window.historyStack = [];
        if (window.historyStack.length > 0) {
            const modalContainer = document.querySelector('.modal-content');
            if (modalContainer) {
                // 儲存主畫面的捲軸
                window.historyStack[window.historyStack.length - 1].scrollTop = modalContainer.scrollTop;
                
                // ✨ 2. 新增：抓取當下所有的 vertical-wrapper 捲軸位置並存入歷史紀錄
                const wrappers = document.querySelectorAll('#modal-body .vertical-wrapper');
                window.historyStack[window.historyStack.length - 1].innerScrolls = Array.from(wrappers).map(w => ({
                    scrollTop: w.scrollTop,
                    scrollLeft: w.scrollLeft
                }));
            }
        }
        // ✨ 3. 新增 innerScrolls 初始陣列
        window.historyStack.push({ projectId, articleIndex, scrollTop: 0, innerScrolls: [] });
    }

    window.lastReadArticleIndex = articleIndex;

    const proj = window.siteProjects.find(p => p.id === projectId);
    const article = proj.articles[articleIndex];
    
    document.body.style.cursor = 'wait';
    let markdownContent = "載入失敗";
    
    try {
        const response = await fetch(article.content_path);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        markdownContent = data.content; 
    } catch (error) {
        console.error("無法載入文章內容:", error);
        markdownContent = "# 404 Not Found\n無法載入文章內容，請檢察網路連線與路徑是否正確。";
    } finally {
        document.body.style.cursor = '';
    }

    switchModalContent(
        () => {
            document.querySelector('.modal-top-bar').classList.remove('is-index-mode');
            modalOverlay.classList.add('active');
            window.lockScroll();
            window._lastMarkdownHeadings = [];
            
            modalBody.innerHTML = marked.parse(markdownContent);

            // ✨ 攔截並相容原生 HTML 寫法的高光區塊
            modalBody.querySelectorAll('.md-highlight-block').forEach(block => {
                const badge = block.querySelector('.highlight-badge');
                const textEl = block.querySelector('.highlight-text');
                
                if (textEl) {
                    const badgeText = badge ? badge.innerText.trim() : '';
                    const targetColor = badgeText ? window.getStatusColorFromCSS(badgeText.toUpperCase()) : 'var(--accent)';
                    const displayText = badgeText ? badgeText : 'HIGHLIGHT';
                    
                    const repeatedText = `${displayText} • `.repeat(20);
                    const bgHtml = `<span class="marquee-text-track" aria-hidden="true">${repeatedText}</span>`;
                    
                    block.className = `md-highlight-text`;
                    block.style.setProperty('--dynamic-glow', targetColor);
                    block.innerHTML = `${bgHtml}<span class="text-content">${textEl.innerHTML}</span>`;
                }
            });

            const verticalWrappers = modalBody.querySelectorAll('.vertical-wrapper');
            // ✨ 加上 idx 參數來對應陣列
            verticalWrappers.forEach((wrapper, idx) => {
                window.applyIndentToVerticalWrapper(wrapper);
                
                // ✨ 新增：如果是從歷史紀錄返回，且有對應的捲軸數值，就執行還原
                if (isFromHistory && restoreInnerScrolls[idx]) {
                    // 延遲 50 毫秒，確保 DOM 內容與文字縮排已經撐開高度
                    setTimeout(() => {
                        wrapper.scrollTop = restoreInnerScrolls[idx].scrollTop || 0;
                        wrapper.scrollLeft = restoreInnerScrolls[idx].scrollLeft || 0;
                    }, 50);
                }
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
                    window.mermaid.run({ querySelector: '.mermaid' }).then(() => window.initMermaidDrag()).catch(e => console.warn('Mermaid 語法錯誤:', e));
                } else {
                    setTimeout(renderMermaid, 300);
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
            let historyBtnHtml = (window.historyStack && window.historyStack.length > 1) ? `<div class="capsule-divider"></div><button class="capsule-btn history-btn" onclick="window.goBackInHistory()" data-tooltip="返回跳轉前"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg></button>` : '';
            let sequenceHtml = (flatSequence.length > 1) ? `<div class="capsule-divider"></div>${prevData.btnHtml}<span class="capsule-progress">${seqIndex + 1} / ${flatSequence.length}</span>${nextData.btnHtml}` : '';

            topLeft.innerHTML = `<div class="unified-nav-capsule"><button class="capsule-btn main-back" onclick="window.openProjectIndex('${projectId}', true)" data-tooltip="返回目錄"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span class="desktop-only">目錄</span></button>${sequenceHtml}${historyBtnHtml}</div>`;

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
                    // ✨ 核心修復：如果標題已經有 Markdown 產生好的文字 ID，就保留它！
                    // 萬一沒有，才試著用標題文字轉換，最後手段才是加上 article-heading-X
                    if (!h.id) {
                        const textId = h.innerText.toLowerCase().replace(/[\s&]+/g, '-').replace(/-+/g, '-');
                        h.id = textId || `article-heading-${index}`;
                    }
                    
                    const li = document.createElement('li');
                    li.className = `toc-${h.tagName.toLowerCase()}`; 
                    const a = document.createElement('a');
                    a.innerText = h.innerText;
                    a.href = "javascript:void(0)"; 
                    a.onclick = () => {
                        const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 90;
                        const targetTop = h.getBoundingClientRect().top - document.querySelector('.modal-content').getBoundingClientRect().top + document.querySelector('.modal-content').scrollTop - topBarHeight - 20; // 減去動態高度，再多退 20px 留白
                        document.querySelector('.modal-content').scrollTo({ top: targetTop, behavior: 'smooth' });
                        h.classList.add('highlight-flash');
                        setTimeout(() => h.classList.remove('highlight-flash'), 1000);
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
            // ✨ 完全無延遲的定位邏輯
            const modalContainer = document.querySelector('.modal-content');
            if (modalContainer) {
                requestAnimationFrame(() => {
                    if (targetHash) {
                        // 呼叫共用引擎 (跨文章剛打開，強制第一次瞬間移動 auto 以打破動畫干擾)
                        const success = window.executeAnchorScroll(targetHash, true);
                        if (!success) {
                            modalContainer.scrollTop = isFromHistory ? restoreScrollTop : 0;
                        }
                    } else {
                        modalContainer.scrollTop = isFromHistory ? restoreScrollTop : 0;
                    }
                });
            }
        }
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
    
    // ✨ 如果已經是啟用狀態，再次點擊就解除 (恢復跑馬燈輪播)
    if (window.isKotobaActive) {
        window.clearFilter();
        return;
    }
    
    // 1. 清除任何卡片過濾狀態與舊的跑馬燈動畫
    window.clearFilter();
    window.isKotobaActive = true;
    
    const firstContent = document.querySelector('.marquee-content');
    const targetTagEl = firstContent.querySelector('.kotoba-whisper');
    
    if (targetTagEl) {
        // 2. 讓點擊的言之箱文字亮起來 (套用高光特效)
        document.querySelectorAll('.kotoba-whisper').forEach(t => {
            t.style.color = 'var(--accent-2)';
            t.style.textShadow = '0 0 10px var(--glow-1)';
            t.style.opacity = '1';
        });

        const contentWidth = firstContent.offsetWidth;
        let targetX = ((firstContent.parentElement.clientWidth / 2) - (targetTagEl.offsetLeft + (targetTagEl.offsetWidth / 2))) % contentWidth;
        if (targetX > 0) targetX -= contentWidth;
        
        // 3. 執行與一般 Tag 相同的置中動畫，並且「無限期停在該處」，等待使用者下一次操作
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
    
    const firstContent = document.querySelector('.marquee-content');
    const targetTagEl = firstContent.querySelector(`.clickable-ticker-tag[data-tag="${targetTag}"]`);
    
    if (targetTagEl) {
        const contentWidth = firstContent.offsetWidth;
        let targetX = ((firstContent.parentElement.clientWidth / 2) - (targetTagEl.offsetLeft + (targetTagEl.offsetWidth / 2))) % contentWidth;
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
            
            // 權限防護：如果這是一張機密卡片，且系統尚未解鎖，就直接跳過不處理！
            if (card.classList.contains('sys-hidden-card') && !document.body.classList.contains('system-override-active')) {
                return;
            }
            
            card.classList.add('highlighted'); 
            window.highlightedCards.push(card); 
        }
    });

    // ✨ 新增防呆：如果重新計算後，發現「一張符合的卡片都沒有」(例如上鎖後機密卡片消失)
    if (window.highlightedCards.length === 0) {
        window.clearFilter(); // 徹底清除過濾與膠囊狀態
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

    // --- 🥊 第一層：Lightbox 大圖預覽 (最高優先權) ---
    if (isLightboxOpen) {
        if (e.key === 'Escape') {
            const toolbox = document.getElementById('lightbox-toolbox');
            const state = window.lightboxState;
            
            // 💡 聰明的 3 段式退回邏輯：
            if (toolbox && toolbox.classList.contains('is-open')) {
                toolbox.classList.remove('is-open'); // 1. 如果工具箱開著，先收起工具箱
            } else if (state.zoom > 1) {
                window.lightboxAction('reset');      // 2. 如果圖片有放大，先恢復 1:1 比例
            } else {
                window.closeLightbox();              // 3. 都沒有，才真正關閉 Lightbox
            }
            e.preventDefault();
        }
        
        // 左右鍵切換相簿圖片
        if (e.key === 'ArrowLeft') { window.navigateLightbox(-1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { window.navigateLightbox(1); e.preventDefault(); }
        
        // 鎖定上下鍵，防止背景文章在背後偷偷滾動
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
        
        return; // 終止事件，絕不把按鍵傳給底下的文章 Modal
    }

    // --- 📖 第二層：文章 Modal 閱讀模式 ---
    if (isArticleOpen) {
        if (e.key === 'Escape') {
            closeModal();
            e.preventDefault();
        }
        
        // ✨ 新增：左右鍵自動切換「上一篇 / 下一篇」文章
        if (e.key === 'ArrowLeft') {
            const prevBtn = document.querySelector('.nav-card.prev');
            if (prevBtn) { prevBtn.click(); e.preventDefault(); }
        }
        if (e.key === 'ArrowRight') {
            const nextBtn = document.querySelector('.nav-card.next');
            if (nextBtn) { nextBtn.click(); e.preventDefault(); }
        }
        return;
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

function restoreScrollAfterFullscreen() {
    const modalContainer = document.querySelector('.modal-content');
    
    // 如果是退出全螢幕，恢復文章 Modal 的捲軸位置
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (modalContainer && window.preFullscreenScrollTop !== undefined) {
            setTimeout(() => { modalContainer.scrollTop = window.preFullscreenScrollTop; }, 50); 
        }
    }

    // ✨ 核心修復 2：無論是進入或退出全螢幕，強制重設所有圖表比例與置中點，讓 CSS 接手自適應！
    document.querySelectorAll('.mermaid-container').forEach(container => {
        container.dataset.zoom = 1;
        container.dataset.x = 0;
        container.dataset.y = 0;
        const mermaidDiv = container.querySelector('.mermaid');
        if (mermaidDiv) {
            mermaidDiv.style.transform = `translate(0px, 0px) scale(1)`;
        }
    });
}

document.addEventListener('fullscreenchange', restoreScrollAfterFullscreen);
document.addEventListener('webkitfullscreenchange', restoreScrollAfterFullscreen); 

window.fullscreenMermaid = function(btn) {
    const container = btn.closest('.mermaid-container');
    const modalContainer = document.querySelector('.modal-content');

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (modalContainer) window.preFullscreenScrollTop = modalContainer.scrollTop;
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen(); 
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); 
    }
};

window.initMermaidDrag = function() {
    document.querySelectorAll('.mermaid-container').forEach(container => {
        if (container.dataset.engineInit) return;
        container.dataset.engineInit = 'true';

        const wrapper = container.querySelector('.mermaid-wrapper');
        const mermaidDiv = container.querySelector('.mermaid');
        if (!wrapper || !mermaidDiv) return;

        let isDragging = false;
        let startX = 0, startY = 0;

        // 1. 滑鼠拖曳平移 (Pan)
        wrapper.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            startX = e.clientX - (parseFloat(container.dataset.x) || 0);
            startY = e.clientY - (parseFloat(container.dataset.y) || 0);
            wrapper.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let x = e.clientX - startX;
            let y = e.clientY - startY;
            container.dataset.x = x;
            container.dataset.y = y;
            const zoom = parseFloat(container.dataset.zoom) || 1;
            mermaidDiv.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                wrapper.style.cursor = 'grab';
            }
        });

        // 2. 滾輪對準游標中心縮放 (Wheel Zoom - 完美對齊 Lightbox 手感)
        wrapper.addEventListener('wheel', (e) => {
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
            
            // ✨ 順便幫這裡也加上重算廣播，確保退回首頁時，隱藏卡片的捲軸提示正確浮現！
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                document.querySelectorAll('.grid, .gallery').forEach(el => el.dispatchEvent(new Event('scroll')));
            }, 100);
            
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
window.showCreditsModal = async function() {
    document.body.style.cursor = 'wait'; // 先讓游標顯示讀取中
    let mdText = "載入失敗";
    let isError = false;
    
    // 1. 先在背景抓取資料
    try {
        const response = await fetch(`./credits.md?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('找不到 credits.md 檔案');
        mdText = await response.text();
    } catch (error) {
        console.error("Credits 讀取失敗:", error);
        isError = true;
    } finally {
        document.body.style.cursor = ''; // 恢復游標
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

window.showChangelogModal = async function() {
    document.body.style.cursor = 'wait';
    let fetchError = false;

    // ✨ 移除 !window.cachedChangelogs 的限制，讓「每一次點擊按鈕」都強制向伺服器對答案！
    try {
        const response = await fetch(`./changelogs.json?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('找不到 changelogs.json');
        const latestLogs = await response.json();
        
        // ✨ 手動更新偵測魔法：比對版本號
        if (latestLogs && latestLogs.length > 0 && latestLogs[0].version !== CONFIG.VERSION) {
            console.warn(`[MANUAL_UPDATE] 發現新版本 ${latestLogs[0].version}，準備強制更新...`);
            
            // 解除無限重啟鎖定，因為這是使用者手動按下的更新要求！
            sessionStorage.removeItem('sys_reboot_count');

            // 顯示專屬的手動更新終端機畫面
            document.body.insertAdjacentHTML('beforeend', `
                <div style="position:fixed; inset:0; background:var(--bg); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--accent);">
                    <div style="font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; letter-spacing: 0.1em; text-shadow: 0 0 10px var(--glow-1);">>_ MANUAL_OVERRIDE : UPDATE</div>
                    <div style="font-family: 'Courier New', monospace; font-size: 0.9rem; color: var(--muted); margin-bottom: 2rem;">Local: ${CONFIG.VERSION} | Remote: ${latestLogs[0].version}</div>
                    <div class="loading-text" style="font-size: 1.1rem;">FETCHING_NEW_DATA_AND_REBOOTING</div>
                </div>
            `);
            
            // 強制加上時戳破壞快取並重新整理
            setTimeout(() => {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('v', new Date().getTime());
                window.location.replace(newUrl.toString());
            }, 1800);
            
            return; // 🛑 直接中斷，不顯示日誌視窗，進入重開機程序
        }

        // 如果版本一樣，就把最新資料寫入快取，給後面的 Modal 渲染用
        window.cachedChangelogs = latestLogs;

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
                        
                        // ✨ 魔法發生地：推導狀態，並向 CSS 請求色彩！
                        let activeStatus = log.status === 'LATEST' ? 'NEW' : log.status;
                        let tabColor = window.getStatusColorFromCSS(activeStatus);
                        let badgeHTML = `<span class="status-badge title-badge" data-status="${activeStatus}">${log.status}</span>`;

                        listHTML += `
                            <li class="article-li is-highlight" style="--tab-color: ${tabColor}; margin-bottom: 1rem;">
                                <a href="javascript:void(0)" class="article-link" onclick="window.renderChangelogDetail('${log.id}')">
                                    <div class="article-item-icon-wrap">
                                        <div class="article-item-fallback" style="color: ${tabColor};">
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
                                            <span class="article-item-title"><span style="font-family: monospace; color: var(--accent-2); font-size: 1.15rem;">${log.version}</span>${badgeHTML}</span>
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
window.showLicenseModal = async function() {
    document.body.style.cursor = 'wait'; // 先讓游標顯示讀取中
    let mdText = "載入失敗";
    let isError = false;

    // 1. 先在背景抓取資料
    try {
        // 加上時間戳防止瀏覽器快取舊的檔案
        const response = await fetch(`./COPYRIGHT.md?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error("找不到版權檔案");
        mdText = await response.text();
    } catch (error) {
        console.error("版權檔案載入失敗:", error);
        isError = true;
    } finally {
        document.body.style.cursor = ''; // 恢復游標
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
    let el = document.getElementById(targetId) || 
             document.getElementById(decodedId) || 
             document.getElementById(lowerId) || 
             document.getElementById(lowerDecoded) ||
             document.getElementById(dashedId) ||
             document.querySelector(`[name="${targetId}"]`) ||
             document.querySelector(`[name="${decodedId}"]`);
    
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
// ✨ 獨立打包：終極精準捲動引擎 (拔除擾人的強制鎖定)
// ==========================================
window.executeAnchorScroll = function(hash, forceInstantFirst = false) {
    const modalContainer = document.querySelector('.modal-content');
    if (!modalContainer) return false;

    const doScroll = (isSmooth = true) => {
        const el = window.findAnchorElement(hash);
        if (!el) return null;
        
        const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 90;
        
        // 算出絕對高度
        let absoluteTop = el.offsetTop;
        let currentEl = el.offsetParent;
        while(currentEl && currentEl !== modalContainer) {
            absoluteTop += currentEl.offsetTop;
            currentEl = currentEl.offsetParent;
        }
        
        const targetTop = absoluteTop - topBarHeight - 20; 
        modalContainer.scrollTo({ top: Math.max(0, targetTop), behavior: isSmooth ? 'smooth' : 'auto' });
        return el;
    };

    // 執行第一次跳轉 (決定要瞬間移動還是平滑捲動)
    const foundEl = doScroll(!forceInstantFirst);

    if (foundEl) {
        // ✨ 核心修復：拔除多重延遲強制拉回，只保留一次輕微延遲確保圖片撐出版面
        setTimeout(() => doScroll(!forceInstantFirst), 150);

        // 智慧尋找發光目標
        let highlightEl = foundEl;
        if (highlightEl.textContent.trim() === '') {
            highlightEl = highlightEl.nextElementSibling || foundEl;
        }

        // 閃爍動畫
        highlightEl.classList.add('highlight-flash');
        setTimeout(() => highlightEl.classList.remove('highlight-flash'), 1000);
        return true;
    }
    return false;
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
        // 如果使用者直接在網址列修改或補上 #hash，且 Modal 是開著的
        // 直接呼叫精準滾動與發光引擎
        const modalOverlay = document.getElementById('md-modal');
        if (modalOverlay && modalOverlay.classList.contains('active')) {
            window.executeAnchorScroll(hash, false);
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
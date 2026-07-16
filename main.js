/* ================================================================== */
/* ⚙️ 網站核心設定區 (SITE CONFIGURATION)                               */
/* 每次發布新版本或修改全域狀態時，請只在這裡修改！                         */
/* ================================================================== */
const CONFIG = {
    // 🚩 發布前必改
    VERSION: "U1.3.0",          // 目前系統版本號

    // 🎨 介面與主題設定
    DEFAULT_THEME: "light",     // 預設主題 (light / dark)
    
    // ✨ 跑馬燈速度設定：跑完一整圈需要的「秒數」(數字越大跑得越慢！)
    MARQUEE_SPEED: 120,          

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
    pinSmall: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(-45deg);"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`
};

// ==========================================
// ✨ 全域狀態標籤系統 (支援快速擴充與互斥群組)
// ==========================================
// 二維陣列設計：
// 1. 內層陣列代表「互斥群組」，排越前面的優先級越高 (例如 UPDATED 贏過 NEW)
// 2. 外層陣列代表「全域排序」，排越前面的 Tag 會顯示在卡片越左邊
window.STATUS_LIST = [['UPDATED', 'NEW', 'ARCHIVED'], ['WIP'], ['OC']];

// ==========================================
// ✨ 新增：動態非同步引入 Mermaid 引擎 (ESM 模組)
// ==========================================
window.mermaid = null;
import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs').then(m => {
    window.mermaid = m.default;
    const currentTheme = document.documentElement.getAttribute('data-theme') || CONFIG.DEFAULT_THEME;
    window.mermaid.initialize({
        startOnLoad: false,
        theme: currentTheme === 'dark' ? 'dark' : 'default',
        fontFamily: 'inherit',
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
// ✨ 共用路徑與路由處理器 (重構優化)
// ==========================================
window.getCleanBasePath = function() {
    const basePath = window.location.pathname.replace(/index\.html$/i, '');
    return basePath.endsWith('/') ? basePath : basePath + '/';
};

window.handleAppRouting = function(pParam, aParam) {
    if (!pParam) return;
    
    // ✨ 防呆：自動過濾專案 ID 的數字前綴 (例如 01_myProject -> myProject)
    const cleanProjectId = pParam.replace(/^\d+_/, '');
    const project = window.siteProjects.find(proj => proj.id === cleanProjectId);
    
    if (!project) {
        show404Modal('404 Not Found', '無法找到您指定的專案。<br/>此連結可能已失效、被移除，或是輸入錯誤的網址。');
        window.history.replaceState(null, '', window.location.pathname);
        return;
    }

    if (aParam !== null && aParam !== undefined) {
        // ✨ 改用文章的 id (例如 "intro") 來尋找
        let aIndex = project.articles.findIndex(art => art.id === aParam);
        
        // 防呆：如果找不到 (可能 JSON 忘記加 id，或是有人拿以前的數字網址進來)，退回數字解析
        if (aIndex === -1 && !isNaN(parseInt(aParam))) aIndex = parseInt(aParam, 10);
        
        if (aIndex !== -1 && aIndex < project.articles.length) {
            window.openArticle(project.id, aIndex); 
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
    
    // 讀取專案獨立排序
    let currentSort = sessionStorage.getItem(`sort_${projectId}`) || proj.default_sort || 'desc';
    let displayArticles = proj.articles.map((art, idx) => ({ art, idx }));
    
    const pinned = displayArticles.filter(item => item.art.pinned);
    const unpinned = displayArticles.filter(item => !item.art.pinned);
    
    let renderUnpinned = [...unpinned];
    // 核心邏輯：若 currentSort 為 'asc' (由舊到新)，則對非置頂文章進行處理
    if (currentSort === 'asc') {
        renderUnpinned = [...unpinned];
    } else {
        renderUnpinned = [...unpinned].reverse();
    }
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
// ✨ 共用捲軸陰影提示系統 (Scroll Hints Engine)
// ==========================================
window.initScrollHints = function(container, hintLeft, hintRight) {
    if (!container || !hintLeft || !hintRight) return;

    const checkScroll = () => {
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
window.lightboxState = { images: [], currentIndex: 0, zoom: 1, x: 0, y: 0 };

window.openLightbox = function(btn, event) {
    event.stopPropagation();
    const container = btn.closest('figure');
    if (!container) return;
    
    const targetImg = container.querySelector('img');
    const gallery = btn.closest('.gallery');
    
    // ✨ 核心修復：強制重置所有狀態與圖片屬性
    window.lightboxState = { 
        images: [], 
        currentIndex: 0, 
        zoom: 1, 
        x: 0, 
        y: 0 
    };

    // 取得圖片 DOM 並立即歸零樣式
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightboxImg) {
        lightboxImg.style.transition = 'none'; // 移除過渡，確保瞬間重置
        lightboxImg.style.transform = `translate(0px, 0px) scale(1)`; 
        // 稍後恢復 transition，讓後續的縮放動畫正常運作
        setTimeout(() => { lightboxImg.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'; }, 50);
    }
    
    // 判斷是否為相簿群組 (Gallery)
    if (gallery) {
        const figures = Array.from(gallery.querySelectorAll('figure'));
        window.lightboxState.images = figures.map(fig => ({
            src: fig.querySelector('img')?.src,
            caption: fig.querySelector('figcaption')?.innerText.replace('查看大圖', '').trim()
        })).filter(item => item.src);
        
        window.lightboxState.currentIndex = window.lightboxState.images.findIndex(item => item.src === targetImg.src);
    } else {
        window.lightboxState.images = [{
            src: targetImg.src,
            caption: container.querySelector('figcaption')?.innerText.replace('查看大圖', '').trim()
        }];
    }

    window.updateLightboxView();

    const lightboxModal = document.getElementById('lightbox-modal');
    if (lightboxModal) lightboxModal.classList.add('is-active');
};

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
        state.zoom = Math.min(state.zoom + 0.5, 4);
    } else if (action === 'zoom-out') {
        state.zoom = Math.max(state.zoom - 0.5, 0.5);
    } else if (action === 'reset') {
        state.zoom = 1;
        state.x = 0; // 恢復 1:1 時也要把位置歸零
        state.y = 0;
    } else if (action === 'new-tab') {
        window.open(img.src, '_blank');
        return;
    }
    
    // ✨ 統一在這裡套用縮放與平移
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
    if (lightboxModal) {
        lightboxModal.classList.remove('is-active');
        // 延遲清空，避免關閉動畫破圖
        setTimeout(() => {
            document.getElementById('lightbox-img').src = "";
            document.getElementById('lightbox-backdrop').src = "";
            document.getElementById('lightbox-caption').innerText = "";
        }, 300);
    }
};

// ==========================================
// ✨ Lightbox 滾輪縮放與拖曳 (Zoom & Panning) 引擎
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const lightboxImg = document.getElementById('lightbox-img');
    const wrapper = document.querySelector('.lightbox-img-wrapper');
    let isDragging = false;
    let startClientX = 0, startClientY = 0;

    const updateTransform = () => {
        const state = window.lightboxState;
        if (lightboxImg) lightboxImg.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
    };

    // --- 1. 滑鼠滾輪縮放 (Wheel Zoom 游標追蹤版) ---
    if (wrapper) {
        wrapper.addEventListener('wheel', (e) => {
            const state = window.lightboxState;
            // 如果 Lightbox 沒開，就不干涉滾輪
            if (!document.getElementById('lightbox-modal').classList.contains('is-active')) return;
            
            e.preventDefault(); // 阻止背景文章跟著滾動
            
            // 計算目標縮放比例
            const delta = e.deltaY < 0 ? 1 : -1;
            let newZoom = state.zoom * (1 + delta * 0.15); // 改用乘法讓縮放更平滑
            newZoom = Math.max(0.5, Math.min(newZoom, 15)); // 放寬極限到 15 倍
            
            // ✨ 核心數學：以滑鼠游標為中心點進行平移補償
            // 算出新的縮放率與舊的縮放率的比例差異
            const ratio = newZoom / state.zoom - 1;
            
            // 取得畫面正中心座標
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // 根據滑鼠距離畫面中心的偏移量，反向平移圖片
            state.x -= (e.clientX - centerX - state.x) * ratio;
            state.y -= (e.clientY - centerY - state.y) * ratio;
            
            // 更新狀態並渲染
            state.zoom = newZoom;
            updateTransform();
        }, { passive: false });
    }
    // --- 2. 拖曳平移 (Drag Panning) ---
    const startDrag = (e) => {
        // ✨ 核心修復：阻止瀏覽器預設的「圖片拖曳存檔」殘影行為
        if (e.type === 'mousedown') e.preventDefault(); 

        const state = window.lightboxState;
        // if (state.zoom <= 1) return; // 只有在放大狀態才允許拖曳
        
        isDragging = true;
        lightboxImg.classList.add('is-dragging');
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        startClientX = clientX - state.x;
        startClientY = clientY - state.y;
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault(); // 防止手機端滑動觸發重整
        
        const state = window.lightboxState;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        state.x = clientX - startClientX;
        state.y = clientY - startClientY;
        updateTransform();
    };

    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        lightboxImg.classList.remove('is-dragging');
    };

    if (lightboxImg) {
        // 滑鼠綁定
        lightboxImg.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', stopDrag);
        // 觸控綁定
        lightboxImg.addEventListener('touchstart', startDrag, { passive: false });
        window.addEventListener('touchmove', onDrag, { passive: false });
        window.addEventListener('touchend', stopDrag);
    }
});

// ==========================================
// ✨ 攔截 Markdown 渲染，讓圖片一出生就自帶載入中特效，0毫秒延遲！
// ==========================================
const renderer = new marked.Renderer();

// 1. ✨ 修復與升級：攔截圖片，支援影音，並自動轉換 Figure 圖片說明！
renderer.image = function(token_or_href, title, text) {
    const href = typeof token_or_href === 'object' ? token_or_href.href : token_or_href;
    const altText = typeof token_or_href === 'object' ? token_or_href.text : text;
    const imgTitle = typeof token_or_href === 'object' ? token_or_href.title : title; 
    
    if (!href) return '';

    if (href.match(/\.(mp4|webm|ogg)$/i)) {
        return `<video controls class="md-video"><source src="${href}" type="video/${href.split('.').pop()}">您的瀏覽器不支援影片標籤。</video>`;
    }
    if (href.match(/\.(mp3|wav|ogg)$/i)) {
        return `<audio controls class="md-audio"><source src="${href}" type="audio/${href.split('.').pop()}">您的瀏覽器不支援音樂標籤。</audio>`;
    }

    const imgTag = `<img src="${href}" alt="${altText || ''}" class="is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">`;

    if (imgTitle) {
        let figureClass = '';
        if (altText === 'float-right' || altText === 'float-left') {
            figureClass = ` class="${altText}"`;
        }
        
        // ✨ 新增：在有提示文字的圖片中，注入專屬放大按鈕
        const zoomBtn = `
        <button class="zoom-btn" title="查看大圖" onclick="window.openLightbox(this, event)">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
        </button>`;

        return `<figure${figureClass}>${imgTag}<figcaption>${imgTitle}${zoomBtn}</figcaption></figure>`;
    }

    return imgTag;
};

// 2. ✨ 攔截 Mermaid 程式碼區塊
const originalCodeRenderer = renderer.code.bind(renderer);
renderer.code = function(token_or_code, language, isEscaped) {
    const lang = typeof token_or_code === 'object' ? token_or_code.lang : language;
    const text = typeof token_or_code === 'object' ? token_or_code.text : token_or_code;

    if (lang === 'mermaid') {
        const encodedText = encodeURIComponent(text);
        return `
        <div class="mermaid-container">
            <div class="mermaid-toolbar">
                <button class="mermaid-btn" onclick="window.zoomMermaid(this, 1)" data-tooltip="放大">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
                <button class="mermaid-btn" onclick="window.zoomMermaid(this, -1)" data-tooltip="縮小">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
                <button class="mermaid-btn" onclick="window.zoomMermaid(this, 0)" data-tooltip="重設比例">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                </button>
                <div style="width: 1px; height: 16px; background: var(--card-border); margin: 0 4px; align-self: center;"></div>
                <button class="mermaid-btn" onclick="window.fullscreenMermaid(this)" data-tooltip="全螢幕">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                </button>
            </div>
            <div class="mermaid-wrapper">
                <div class="mermaid" data-zoom="100" style="--zoom: 100%;" data-original-text="${encodedText}">${text}</div>
            </div>
        </div>`;
    }
    return originalCodeRenderer.apply(this, arguments);
};

// 3. ✨ 攔截 Markdown 連結
renderer.link = function(token_or_href, title, text) {
    const href = typeof token_or_href === 'object' ? token_or_href.href : token_or_href;
    const linkText = typeof token_or_href === 'object' ? token_or_href.text : text;
    const linkTitle = typeof token_or_href === 'object' ? token_or_href.title : title;
    
    const titleAttr = linkTitle ? ` title="${linkTitle}"` : '';
    if (!href) return `<a${titleAttr}>${linkText}</a>`;

    if (href.startsWith('?p=')) {
        return `<a href="${href}" onclick="window.handleSpaLink(event, '${href}')"${titleAttr} style="font-weight: 600;">${linkText}</a>`;
    }
    
    if (href.startsWith('http')) {
        const extIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; vertical-align: -2px; opacity: 0.8;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${linkText}${extIcon}</a>`;
    }

    return `<a href="${href}"${titleAttr}>${linkText}</a>`;
};

// ==========================================
// ✨ 新增：自訂 Discord 風格防雷/機密文字擴充 (||隱藏||)
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
        return `<span class="spoiler-text" onclick="this.classList.toggle('revealed')" title="點擊解密">${this.parser.parseInline(token.tokens)}</span>`;
    }
};

marked.use({ 
    extensions: [spoilerExtension], 
    renderer: renderer,
    breaks: false, 
    gfm: true      
});

// ==========================================
// ✨ 全域 SPA 路由跳轉攔截器
// ==========================================
window.handleSpaLink = function(event, url) {
    event.preventDefault(); 
    const urlParams = new URLSearchParams(url);
    window.handleAppRouting(urlParams.get('p'), urlParams.get('a'));
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
                fontFamily: 'inherit',
                securityLevel: 'loose' 
            });
            
            document.querySelectorAll('.mermaid').forEach(el => {
                const originalText = decodeURIComponent(el.getAttribute('data-original-text') || '');
                if (originalText) {
                    el.textContent = originalText; 
                    el.removeAttribute('data-processed'); 
                }
            });
            window.mermaid.run({ querySelector: '.mermaid' }).catch(() => {});
        }
    
        const targetFaviconUrl = theme === 'light' ? CONFIG.FAVICON_LIGHT : CONFIG.FAVICON_DARK;
        document.querySelectorAll("link[rel='icon']").forEach(link => link.href = targetFaviconUrl);

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
        document.body.style.overflow = fullscreenMenu.classList.contains('active') ? 'hidden' : '';
    });

    // ==========================================
    // ✨ 漢堡選單：事件代理 (Event Delegation) 點擊自動關閉
    // ==========================================
    // 不管未來動態載入了多少個 .nav-item，只要把事件掛在父層就永遠生效！
    fullscreenMenu.addEventListener('click', (e) => {
        if (e.target.closest('.nav-item')) {
            menuToggle.classList.remove('open');
            fullscreenMenu.classList.remove('active');
            document.body.style.overflow = '';
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
        siteTitle.title = "System Override..."; 
        window.isWhispering = false;

        siteTitle.addEventListener('click', async () => {
            if (window.isWhispering) return; 
            
            clickCount++;
            clearTimeout(clickTimer);
            
            if (clickCount >= 5) {
                window.isWhispering = true; 
                clickCount = 0; 
                profileSection.style.opacity = 0;
                
                try {
                    const notes = await window.getKotobaList();
                    if (notes.length === 0) throw new Error("無可用題庫");
                    const randomNote = notes[Math.floor(Math.random() * notes.length)];
                    
                    setTimeout(() => {
                        const logHeader = `<div style="color: var(--accent-2); font-family: 'Courier New', monospace; font-size: 0.85rem; margin-bottom: 0.5rem;">[ SYSTEM_LOG : KOTOBA_NO_BOX ]</div>`;
                        profileSection.innerHTML = logHeader + marked.parse(randomNote);
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
        const response = await fetch(CONFIG.DATA_SOURCE);
        const db = await response.json();
        
        const categories = db.categories;
        const projects = db.projects;

        // 智慧狀態推導與全域標籤冒泡
        projects.forEach(p => {
            let isCardUpdated = p.is_updated;
            p.tags = p.tags || [];

            if (p.articles && p.articles.length > 0) {
                if (!p.is_new && !isCardUpdated) {
                    if (p.articles.some(art => art.is_new || art.is_updated)) isCardUpdated = true;
                }
            }
            p.computed_is_updated = isCardUpdated;

            let activeStates = new Set();
            const flatStatusList = window.STATUS_LIST.flat(); 

            flatStatusList.forEach(status => {
                const boolKey = `is_${status.toLowerCase()}`;
                const isTrue = status === 'UPDATED' ? isCardUpdated : p[boolKey];

                if (isTrue || p.tags.includes(status)) activeStates.add(status);
                if (p.articles && p.articles.some(art => art[`is_${status.toLowerCase()}`] === true || (art.tags && art.tags.includes(status)))) {
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
            const allTags = projects.flatMap(p => p.tags || []);
            const uniqueTags = [...new Set(allTags)].sort(() => Math.random() - 0.5);
            const kotobaList = await window.getKotobaList();

            if (kotobaList.length > 0) {
                const randomKotoba = kotobaList[Math.floor(Math.random() * kotobaList.length)];
                const insertIndex = Math.floor(Math.random() * (uniqueTags.length || 1));
                const inlineKotoba = randomKotoba.replace(/\n/g, ' ').replace(/> /g, '').trim();
                uniqueTags.splice(insertIndex, 0, `KOTOBA_NO_BOX:『${inlineKotoba}』`);
            }

            if (uniqueTags.length > 0) {
                const stockContent = uniqueTags.map((tag, i) => {
                    if (tag.startsWith('KOTOBA_NO_BOX:')) {
                        return `<span class="kotoba-whisper">${tag.replace('KOTOBA_NO_BOX:', '')}</span>`;
                    }
                    const isUp = i % 2 !== 0; 
                    const change = (Math.random() * 3 + 0.1).toFixed(2); 
                    const arrow = isUp ? '▲' : '▼';
                    const colorClass = isUp ? 'stock-up' : 'stock-down';
                    const sign = isUp ? '+' : '-';
                    const statusAttr = window.STATUS_LIST.flat().includes(tag) ? `data-status="${tag}"` : '';
                    return `<span class="clickable-ticker-tag" data-tag="${tag}" ${statusAttr} onclick="window.filterByTag('${tag}', event)"><span class="ticker-name">${tag}</span> <span class="${colorClass}">${arrow} ${sign}${change}%</span></span>`;
                }).join('<span style="color: var(--muted); opacity: 0.5; margin: 0 1rem;">|</span>');

                const container = marquee.parentElement;
                container.innerHTML = `
                    <div class="marquee-content">${stockContent} <span style="color: var(--muted); opacity: 0.5; margin: 0 1rem;">|</span> </div>
                    <div class="marquee-content">${stockContent} <span style="color: var(--muted); opacity: 0.5; margin: 0 1rem;">|</span> </div>
                `;

                container.onclick = (e) => {
                    if (window.currentActiveTag && !e.target.closest('.clickable-ticker-tag')) window.clearFilter();
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
            const sectionImageHtml = cat.cover_image ? `<img src="${cat.cover_image}" alt="icon" class="is-loading" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)" style="width: 72px; height: 72px; border-radius: 16px; object-fit: cover; border: 1px solid var(--card-border); box-shadow: 0 4px 15px var(--shadow-base); flex-shrink: 0;">` : '';

            portfolioSections.innerHTML += `
            <section id="${cat.id}-section">
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
                    actionText = `<div class="action-btn" style="margin-top: 1.2rem; color: var(--accent); font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; transition: color 0.2s ease;">
                        <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
                            <svg class="icon-book-closed" style="position: absolute; transition: opacity 0.2s ease, transform 0.2s ease;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                            <svg class="icon-book-open" style="position: absolute; opacity: 0; transform: scale(0.8); transition: opacity 0.2s ease, transform 0.2s ease;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        </div>展開系列 (${data.articles.length})</div>`;
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
                const cardImageHtml = data.cover_image ? `<img src="${data.cover_image}" alt="cover" class="is-loading" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)" style="width: 56px; height: 56px; border-radius: 12px; object-fit: cover; border: 1px solid var(--card-border); flex-shrink: 0; background: var(--bg);">` : '';
                const absolutePinHtml = data.pinned ? `<div class="card-pin">${GLOBAL_SVGS.pin}</div>` : '';

                let metaParts = [];
                if (data.date) metaParts.push(data.date);
                if (data.version) metaParts.push(`v${data.version}`); 
                const cardDateHtml = metaParts.length > 0 ? `<div style="position: absolute; top: 0.2rem; left: 1.6rem; font-family: monospace; font-size: 0.72rem; font-weight: 600; color: var(--accent); opacity: 0.6; letter-spacing: 0.05em;">[${metaParts.join(' • ')}]</div>` : '';

                card.innerHTML = `
                    ${absolutePinHtml}${cardDateHtml} 
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

        // 路由解析
        const urlParams = new URLSearchParams(window.location.search);
        setTimeout(() => window.handleAppRouting(urlParams.get('p'), urlParams.get('a')), 300);

    } catch (err) {
        console.error("載入失敗:", err);
        portfolioSections.innerHTML = `<div class="error-container"><span class="error-text">ERR: FAILED TO FETCH DATA</span></div>`;
        if (marquee) { marquee.innerHTML = `<span>SYSTEM OFFLINE • CONNECTION REFUSED • </span>`.repeat(4); marquee.style.color = "var(--error-color)"; }
    }
}

window.addEventListener('DOMContentLoaded', loadProjects);

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

function switchModalContent(updateDOMCallback) {
    const isModalOpen = modalOverlay.classList.contains('active');
    const topLeft = document.getElementById('modal-top-left');
    const tocMount = document.getElementById('toc-mount-point');
    const modalContainer = document.querySelector('.modal-content');
    
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
                modalBody.classList.remove('content-fade-out'); 
                if (topLeft) topLeft.classList.remove('content-fade-out');
                if (tocMount) tocMount.classList.remove('content-fade-out');

                setTimeout(() => { modalContainer.style.height = ''; }, 320); 
            });
        }, 120); 
    } else {
        updateDOMCallback();
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

    switchModalContent(() => {
        document.getElementById('modal-top-left').innerHTML = `<button class="modal-back-btn" style="opacity: 0; pointer-events: none; visibility: hidden;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> <span>返回索引</span></button>`;
        document.getElementById('toc-mount-point').innerHTML = `<div class="toc-wrapper" style="opacity: 0; pointer-events: none; visibility: hidden;"><div class="toc-toggle-btn"><span class="bar"></span><span class="bar"></span><span class="bar"></span></div></div>`;
        document.querySelector('.modal-top-bar').classList.add('is-index-mode');

        const proj = window.siteProjects.find(p => p.id === projectId);
        if (!proj || !proj.articles) return;

        let currentSort = sessionStorage.getItem(`sort_${projectId}`) || proj.default_sort || 'desc';
        sessionStorage.setItem(`sort_${projectId}`, currentSort);

        const cleanPath = window.getCleanBasePath();
        const spaUrl = `${window.location.origin}${cleanPath}?p=${projectId}`;
        window.history.replaceState({ path: spaUrl }, '', spaUrl);
        const shareUrl = `${window.location.origin}${cleanPath}api/${projectId}/index.html`;

        let displayArticles = proj.articles.map((art, idx) => ({ art, idx }));

        modalBody.innerHTML = `
            <div class="article-header-wrapper" style="margin-top: 0; padding-right: 1.5rem;">
                <div class="header-left" style="min-width: 0; flex: 1 1 auto;"><h1 style="margin:0; padding:0; border:none; word-break: break-word;">${proj.title} - 目錄</h1></div>
                <div class="header-right">
                    <span style="font-family: monospace; font-size: 0.85rem; font-weight: 600; color: var(--accent); background: var(--tag-bg); padding: 0.15rem 0.6rem; border-radius: 999px; letter-spacing: 0.05em; border: 1px solid var(--card-border); white-space: nowrap;">共 ${proj.articles.length} 篇</span>
                    <button id="toggle-sort-btn" class="share-link-btn" style="width: auto; padding: 0 0.8rem;">
                        <svg class="sort-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path class="sort-arr-left" d="M 4 9 L 9 4 L 9 20"></path><path class="sort-arr-right" d="M 20 15 L 15 20 L 15 4"></path></svg>
                        <span id="sort-btn-text" style="margin-left: 4px;"></span>
                    </button>
                    <button class="share-link-btn" id="index-share-btn">${GLOBAL_SVGS.link} <span style="margin-left: 4px;">複製連結</span></button> 
                </div>
            </div>
            <div id="article-list-container" style="transition: opacity 0.2s ease;"></div>
        `;

        const shareBtn = modalBody.querySelector('#index-share-btn');
        if (shareBtn) {
            shareBtn.removeAttribute('id');
            shareBtn.addEventListener('click', function() { window.handleCopy(this, shareUrl); });
        }

        const listContainer = modalBody.querySelector('#article-list-container');
        const sortBtn = modalBody.querySelector('#toggle-sort-btn');

        const renderList = () => {
            const finalArray = window.getArticleSequence(projectId);
            const themePalette = ['var(--group-c1)', 'var(--group-c2)', 'var(--group-c3)', 'var(--group-c4)', 'var(--group-c5)'];

            const generateLi = (art, idx, isHighlightGroup, customColor) => {
                let descHtml = art.description ? `<span style="font-size: 0.95rem; color: var(--muted); line-height: 1.4;">- ${art.description}</span>` : '';
                let dateHtml = art.date ? `<span style="font-family: monospace; font-size: 0.85rem; color: var(--muted); margin-left: auto; padding-left: 1rem; flex-shrink: 0;">${art.date}</span>` : '';
                let statusBadgeHtml = window.getStatusBadgeHtml(art, true);
                
                let baseIconHtml = art.cover_image ? `<img src="${art.cover_image}" alt="cover" class="is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)" style="position: relative; z-index: 2; width: 44px !important; height: 44px !important; min-width: 44px !important; min-height: 44px !important; max-width: 44px !important; max-height: 44px !important; aspect-ratio: 1/1 !important; object-fit: cover; border-radius: 8px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 1px solid var(--card-border); box-sizing: border-box; display: block !important;">` : `<div style="position: relative; z-index: 2; width: 44px; height: 44px; min-width: 44px; min-height: 44px; flex-shrink: 0; background: var(--bg); border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--card-border); box-sizing: border-box;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>`;
                let pinnedBadgeHtml = art.pinned ? `<div class="modal-pin">${GLOBAL_SVGS.pinSmall}</div>` : '';
                let iconHtml = `<div style="position: relative; flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; min-width: 44px; min-height: 44px;">${pinnedBadgeHtml}${baseIconHtml}</div>`;
                let colorStyle = customColor ? ` style="--tab-color: ${customColor};"` : '';

                return `<li class="article-li ${isHighlightGroup ? 'is-highlight' : 'is-normal'}"${colorStyle}><a href="#" onclick="event.preventDefault(); openArticle('${projectId}', ${idx})" style="display: flex; align-items: center; gap: 1rem; text-decoration: none; padding: 0.5rem; border-radius: 0.8rem; transition: background-color 0.2s;">${iconHtml}<div style="display: flex; align-items: center; width: 100%; flex-wrap: wrap; row-gap: 0.4rem;"><div style="display: flex; align-items: baseline; flex-wrap: wrap; gap: 0.5rem;"><span style="font-size: 1.15rem; color: var(--accent); font-weight: bold;">${art.title}${statusBadgeHtml}</span>${descHtml}</div>${dateHtml}</div></a></li>`;
            };

            let html = '';

            if (proj.groups && Object.keys(proj.groups).length > 0) {
                let colorIndex = 0; 
                for (const [groupId, groupData] of Object.entries(proj.groups)) {
                    const groupArticles = finalArray.filter(item => item.art.group === groupId);
                    if (groupArticles.length === 0) continue;

                    let groupColor = groupData.color;
                    if (groupData.highlight && !groupColor) {
                        groupColor = themePalette[colorIndex % themePalette.length];
                        colorIndex++; 
                    }

                    let titleColorStyle = groupColor ? `color: ${groupColor}; border-bottom-color: ${groupColor};` : `color: var(--accent); border-bottom-color: var(--divider-line);`;
                    
                    html += `<div class="group-header" style="margin-top: 1.8rem; margin-bottom: 0.8rem;"><div style="font-size: 0.75rem; letter-spacing: 0.15em; border-bottom: 1px solid; padding-bottom: 0.3rem; ${titleColorStyle}">${groupData.title || groupId}</div>${groupData.description ? `<div style="font-size: 0.85rem; color: var(--muted); margin-top: 0.4rem;">${groupData.description}</div>` : ''}</div><ul style="list-style:none; padding-left:0; margin:0;">`;
                    groupArticles.forEach(({art, idx}) => { html += generateLi(art, idx, groupData.highlight, groupColor); });
                    html += `</ul>`;
                }
                const ungrouped = finalArray.filter(item => !item.art.group);
                if (ungrouped.length > 0) {
                    html += `<ul style="list-style:none; padding-left:0; margin-top:1.5rem;">`;
                    ungrouped.forEach(({art, idx}) => { html += generateLi(art, idx, false, null); });
                    html += `</ul>`;
                }
            } else {
                html += `<ul style="list-style:none; padding-left:0; margin-top:1.5rem;">`;
                finalArray.forEach(({art, idx}) => { html += generateLi(art, idx, false, null); });
                html += `</ul>`;
            }
            listContainer.innerHTML = html;
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
        document.body.style.overflow = 'hidden';
        
        const modalContainer = document.querySelector('.modal-content');
        modalContainer.scrollTop = (restoreScroll && window.lastIndexScrollPos !== undefined) ? window.lastIndexScrollPos : 0;
    }); 
};

// ==========================================
// 打開具體的「文章內文」
// ==========================================
window.openArticle = async function(projectId, articleIndex, isFromHistory = false) {
    if (!isFromHistory) {
        if (!window.historyStack) window.historyStack = [];
        window.historyStack.push({ projectId, articleIndex });
    }

    const modalContainer = document.querySelector('.modal-content');
    if (modalContainer) window.lastIndexScrollPos = modalContainer.scrollTop;

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

    switchModalContent(() => {
        document.querySelector('.modal-top-bar').classList.remove('is-index-mode');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        modalBody.innerHTML = marked.parse(markdownContent);
        document.querySelector('.modal-content').scrollTop = 0;

        const flatSequence = window.getArticleSequence(projectId);
        const seqIndex = flatSequence.findIndex(item => item.idx === articleIndex);

        // --- 內部導航按鈕產生器 ---
        const generateNavBtn = (item, type) => {
            const isPrev = type === 'prev';
            const iconSvg = isPrev ? `<path d="M15 18l-6-6 6-6"/>` : `<path d="M9 18l6-6-6-6"/>`;
            const text = isPrev ? '上一篇' : '下一篇';
            
            if (!item) {
                return { cardHtml: '', btnHtml: `<button class="capsule-btn disabled" disabled><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg></button>` };
            }
            
            const cardHtml = `<a href="javascript:void(0)" class="nav-card ${type}" onclick="window.openArticle('${projectId}', ${item.idx})"><div class="nav-label">${isPrev ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg> ${text}` : `${text} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>`}</div><div class="nav-title">${item.art.title}</div></a>`;
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
                document.querySelectorAll('.mermaid').forEach(el => el.removeAttribute('data-processed'));
                window.mermaid.run({ querySelector: '.mermaid' }).then(() => window.initMermaidDrag()).catch(e => console.warn('Mermaid 語法錯誤:', e));
            } else {
                setTimeout(renderMermaid, 300);
            }
        };
        renderMermaid();

        // --- 處理標題與 Meta ---
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

            const cleanPath = window.getCleanBasePath();
            const articleSlug = article.id || articleIndex;
            const spaUrl = `${window.location.origin}${cleanPath}?p=${projectId}&a=${articleSlug}`;
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
                h.id = `article-heading-${index}`;
                const li = document.createElement('li');
                li.className = `toc-${h.tagName.toLowerCase()}`; 
                const a = document.createElement('a');
                a.innerText = h.innerText;
                a.href = "javascript:void(0)"; 
                a.onclick = () => {
                    const targetTop = h.getBoundingClientRect().top - document.querySelector('.modal-content').getBoundingClientRect().top + document.querySelector('.modal-content').scrollTop - 90;
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

        // ==========================================
        // ✨ 統一處理所有圖片區塊 (包含 Gallery、Float 與 Markdown 原生圖片)
        // ==========================================
        modalBody.querySelectorAll('figure').forEach(figure => {
            // 1. 綁定點擊隱藏/顯示提示文字的功能
            figure.addEventListener('click', () => figure.classList.toggle('hide-caption'));
            
            // 2. 動態注入放大鏡按鈕 (防呆：如果還沒有按鈕才加)
            const figcaption = figure.querySelector('figcaption');
            const img = figure.querySelector('img');
            
            if (figcaption && img && !figcaption.querySelector('.zoom-btn')) {
                const zoomBtn = document.createElement('button');
                zoomBtn.className = 'zoom-btn';
                zoomBtn.title = '查看大圖';
                zoomBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                `;
                // 阻止事件冒泡，點擊放大鏡時不會觸發外層的 hide-caption
                zoomBtn.onclick = (event) => window.openLightbox(zoomBtn, event);
                figcaption.appendChild(zoomBtn);
            }
        });
    }); 
};

// === 5. 標籤點擊聚焦邏輯 ===
window.currentActiveTag = null; 
window.highlightedCards = []; 
window.currentCardIndex = 0;  

window.clearFilter = function(event) {
    if (event) event.stopPropagation(); 
    window.currentActiveTag = null;
    window.highlightedCards = []; 
    window.currentCardIndex = 0;  
    
    document.querySelectorAll('.card').forEach(c => c.classList.remove('highlighted', 'jump-bump'));
    document.querySelectorAll('.active-tag').forEach(t => t.classList.remove('active-tag'));
    
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
        if (tags && tags.includes(targetTag)) { card.classList.add('highlighted'); window.highlightedCards.push(card); }
    });
    
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
    document.body.style.overflow = 'hidden';
    document.querySelector('.modal-content').scrollTop = 0;
};

// ==========================================
// ✨ 歷史紀錄與狀態控制
// ==========================================
window.goBackInHistory = function() {
    if (!window.historyStack || window.historyStack.length <= 1) return;
    window.historyStack.pop(); 
    const prev = window.historyStack[window.historyStack.length - 1]; 
    window.openArticle(prev.projectId, prev.articleIndex, true); 
};

function closeModal() {
    window.historyStack = []; 
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    window.history.replaceState(null, '', window.location.pathname);
}

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlay.classList.contains('active') && !document.getElementById('lightbox-modal').classList.contains('is-active')) closeModal(); });
modalOverlay.addEventListener('touchmove', (e) => { if (e.target === modalOverlay) e.preventDefault(); }, { passive: false });

// ==========================================
// ✨ Mermaid 專業控制台引擎
// ==========================================
window.zoomMermaid = function(btn, direction) {
    const container = btn.closest('.mermaid-container');
    const mermaidDiv = container.querySelector('.mermaid');
    const wrapper = container.querySelector('.mermaid-wrapper'); 
    if (!mermaidDiv || !wrapper) return;

    let currentZoom = parseInt(mermaidDiv.getAttribute('data-zoom')) || 100;
    if (!wrapper.dataset.lockedHeight) wrapper.dataset.lockedHeight = wrapper.offsetHeight + 'px';

    if (direction === 0) {
        currentZoom = 100; 
        wrapper.style.height = '';
        delete wrapper.dataset.lockedHeight;
    } else {
        wrapper.style.height = wrapper.dataset.lockedHeight;
        currentZoom = Math.max(50, Math.min(currentZoom + (direction * 25), 400)); 
    }

    mermaidDiv.setAttribute('data-zoom', currentZoom);
    mermaidDiv.style.setProperty('--zoom', `${currentZoom}%`);
};

function restoreScrollAfterFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const modalContainer = document.querySelector('.modal-content');
        if (modalContainer && window.preFullscreenScrollTop !== undefined) {
            setTimeout(() => { modalContainer.scrollTop = window.preFullscreenScrollTop; }, 50); 
        }
    }
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
    document.querySelectorAll('.mermaid-wrapper').forEach(wrapper => {
        if (wrapper.dataset.dragInit) return;
        wrapper.dataset.dragInit = 'true';

        let isDown = false, startX, startY, scrollLeft, scrollTop;

        wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - wrapper.offsetLeft; startY = e.pageY - wrapper.offsetTop;
            scrollLeft = wrapper.scrollLeft; scrollTop = wrapper.scrollTop;
        });
        wrapper.addEventListener('mouseleave', () => { isDown = false; });
        wrapper.addEventListener('mouseup', () => { isDown = false; });
        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            wrapper.scrollLeft = scrollLeft - ((e.pageX - wrapper.offsetLeft) - startX);
            wrapper.scrollTop = scrollTop - ((e.pageY - wrapper.offsetTop) - startY);
        });
    });
};

function show404Modal(title, message) {
    const modalOverlay = document.getElementById('md-modal');
    const modalBody = document.getElementById('modal-body');
    const modalTopLeft = document.getElementById('modal-top-left');
    const tocMountPoint = document.getElementById('toc-mount-point');

    if (modalTopLeft) modalTopLeft.innerHTML = `<span style="color: var(--muted); font-weight: 600; font-family: monospace; letter-spacing: 0.05em;">SYSTEM_ERROR</span>`;
    if (tocMountPoint) tocMountPoint.innerHTML = '';

    modalBody.innerHTML = `
        <div style="text-align: center; padding: 15vh 2rem 10vh 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem; opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <h1 style="margin: 0 0 1rem 0; border: none; font-size: 2rem; padding: 0;">${title}</h1>
            <p style="color: var(--muted); font-size: 1.05rem; max-width: 400px; line-height: 1.6;">${message}</p>
            <button class="btn" style="margin-top: 2.5rem; padding: 0.6rem 1.5rem; display: flex; align-items: center; gap: 0.5rem;" onclick="closeModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg> 返回首頁
            </button>
        </div>`;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
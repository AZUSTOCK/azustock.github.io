// 📦 引入外部模組
import { CONFIG, GLOBAL_SVGS, STATUS_LIST } from './js/config.js';
import { triggerHaptic, isPWAEnvironment, compareVersions, getResVersion } from './js/utils.js';
import './js/ui/toast.js';
import './js/features/mermaid.js';
import './js/core/router.js';
import './js/ui/lightbox.js';
import './js/ui/modal.js';
import './js/core/data.js';
import './js/core/markdown.js';

// 🌉 模組橋接
window.CONFIG = CONFIG;
window.GLOBAL_SVGS = GLOBAL_SVGS;
window.STATUS_LIST = STATUS_LIST;
window.triggerHaptic = triggerHaptic;
window.isPWAEnvironment = isPWAEnvironment;
window.compareVersions = compareVersions;
window.getResVersion = function(key) { return getResVersion(key, CONFIG.VERSION); };

// ==========================================
// ✨ 全域共用工具與狀態標籤
// ==========================================
window.getStatusColorFromCSS = function(status) {
    if (!window._statusColorCache) window._statusColorCache = {};
    if (window._statusColorCache[status]) return window._statusColorCache[status];
    const dummy = document.createElement('span'); dummy.setAttribute('data-status', status); dummy.style.display = 'none'; document.body.appendChild(dummy);
    const color = getComputedStyle(dummy).getPropertyValue('--s-color').trim(); document.body.removeChild(dummy);
    window._statusColorCache[status] = color || 'var(--accent)'; return window._statusColorCache[status];
};

window.getStatusBadgeHtml = function(item, isTitle = false) {
    const titleClass = isTitle ? ' title-badge' : ''; let badges = '';
    window.STATUS_LIST.forEach(group => {
        const winningStatus = group.find(status => { const boolKey = `is_${status.toLowerCase()}`; return item[boolKey] === true || (item.tags && item.tags.includes(status)); });
        if (winningStatus) badges += `<span class="status-badge${titleClass}" data-status="${winningStatus}">${winningStatus}</span>`;
    });
    return badges;
};

// 自動將版本號注入到 Footer & CSS
const sysVersionEl = document.getElementById('sys-version');
if (sysVersionEl) sysVersionEl.innerText = CONFIG.VERSION;
document.documentElement.style.setProperty('--marquee-speed', `${CONFIG.MARQUEE_SPEED}s`);

// === 全域變數 (系統內部使用) ===
window.siteProjects = [];
window.lockScroll = function() { if (document.body.style.overflow === 'hidden') return; document.body.style.overflow = 'hidden'; };
window.unlockScroll = function() { document.body.style.overflow = ''; };

window.getArticleSequence = function(projectId) {
    const proj = window.siteProjects.find(p => p.id === projectId); if (!proj || !proj.articles) return [];
    const isUnlocked = document.body.classList.contains('system-override-active');
    let currentSort = sessionStorage.getItem(`sort_${projectId}`) || proj.default_sort || 'desc';
    let displayArticles = proj.articles.map((art, idx) => ({ art, idx })).filter(item => isUnlocked || !item.art.is_hidden);
    const pinned = displayArticles.filter(item => item.art.pinned), unpinned = displayArticles.filter(item => !item.art.pinned);
    const renderUnpinned = currentSort === 'asc' ? [...unpinned] : [...unpinned].reverse(), finalArray = [...pinned, ...renderUnpinned];
    let flatSequence = [];
    if (proj.groups && Object.keys(proj.groups).length > 0) {
        for (const groupId of Object.keys(proj.groups)) { flatSequence.push(...finalArray.filter(item => item.art.group === groupId)); }
        flatSequence.push(...finalArray.filter(item => !item.art.group));
    } else { flatSequence = [...finalArray]; }
    return flatSequence;
};

window.handleCopy = function(element, shareUrl) {
    if (element.classList.contains('copied') || window.isCopying) return; window.isCopying = true;
    navigator.clipboard.writeText(shareUrl).then(() => { element.classList.add('copied'); setTimeout(() => { element.classList.remove('copied'); window.isCopying = false; }, 2000); }).catch(() => { window.isCopying = false; });
};

window.focusAndBumpCard = function(targetCard) {
    const cardRect = targetCard.getBoundingClientRect();
    const isVisible = (cardRect.top >= 80 && cardRect.bottom <= window.innerHeight && cardRect.left >= 0 && cardRect.right <= window.innerWidth);
    const maxDistance = Math.max(Math.abs((cardRect.top + cardRect.height / 2) - (window.innerHeight / 2)), Math.abs((cardRect.left + cardRect.width / 2) - (window.innerWidth / 2)));
    let dynamicDelay = 50; 
    if (!isVisible) { dynamicDelay = Math.min(800, Math.max(300, 200 + (maxDistance * 0.4))); targetCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); }
    setTimeout(() => { targetCard.classList.remove('jump-bump'); void targetCard.offsetWidth; targetCard.classList.add('jump-bump'); setTimeout(() => targetCard.classList.remove('jump-bump'), 600); }, dynamicDelay);
};

window.refreshUIAfterOverrideToggle = function() {
    const isUnlocked = document.body.classList.contains('system-override-active');
    const updateCardCounts = () => {
        window.siteProjects.forEach(proj => {
            const grid = document.getElementById(`${proj.category}-grid`);
            if (grid && proj.articles && proj.articles.length > 0) {
                grid.querySelectorAll('.card').forEach(card => {
                    const titleEl = card.querySelector('h3');
                    if (titleEl && titleEl.innerText.includes(proj.title)) {
                        const actionBtn = card.querySelector('.card-action-btn');
                        if (actionBtn && actionBtn.innerText.includes(window.t('expand_series'))) {
                            const count = isUnlocked ? proj.articles.length : proj.articles.filter(art => !art.is_hidden).length;
                            const iconWrap = actionBtn.querySelector('.card-action-icon-wrap'); actionBtn.innerHTML = '';
                            if (iconWrap) actionBtn.appendChild(iconWrap);
                            actionBtn.insertAdjacentHTML('beforeend', `${window.t('expand_series')} (${count})`);
                        }
                    }
                });
            }
        });
    };

    if (isUnlocked && window._hasAlreadyUnlockedOnce) { updateCardCounts(); return; }
    if (isUnlocked) window._hasAlreadyUnlockedOnce = true;

    const marquees = document.querySelectorAll('.marquee-content');
    marquees.forEach(m => {
        if (isUnlocked) m.classList.add('suppress-secrets');
        let currentX = new DOMMatrix(window.getComputedStyle(m).transform).m41 % m.offsetWidth; if (currentX > 0) currentX -= m.offsetWidth;
        m.dataset.startX = currentX; 
        if (m.marqueePlayer) { m.marqueePlayer.cancel(); m.marqueePlayer = null; }
        m.style.transition = 'none'; m.style.animation = 'none'; m.classList.remove('suppress-secrets'); m.classList.add('force-show-secrets');
    });

    void document.body.offsetWidth;
    marquees.forEach(m => { m.dataset.targetWidth = m.offsetWidth; m.classList.remove('force-show-secrets'); if (isUnlocked) m.classList.add('suppress-secrets'); });

    setTimeout(() => {
        window.dispatchEvent(new Event('resize')); document.querySelectorAll('.grid, .gallery').forEach(el => el.dispatchEvent(new Event('scroll')));
        updateCardCounts();
        if (window.currentActiveTag) { window._pendingActiveTag = window.currentActiveTag; window.currentActiveTag = null; document.querySelectorAll('.card').forEach(c => c.classList.remove('highlighted', 'jump-bump')); document.querySelectorAll('.active-tag').forEach(t => t.classList.remove('active-tag')); }
        marquees.forEach((m, index) => {
            const targetWidth = parseFloat(m.dataset.targetWidth) || m.offsetWidth; let startX = parseFloat(m.dataset.startX) || 0;
            if (startX > 0) startX = 0; if (startX < -targetWidth) startX = startX % targetWidth;
            const distance = Math.abs(-targetWidth - startX), duration = Math.max(600, Math.min(1600, (distance / targetWidth) * 2000));
            m.marqueePlayer = m.animate([{ transform: `translateX(${startX}px)`, filter: 'blur(0px)' }, { transform: `translateX(${startX - (distance * 0.5)}px)`, filter: 'blur(3px)' }, { transform: `translateX(-${targetWidth}px)`, filter: 'blur(0px)' }], { duration, easing: 'ease-in-out' });
            if (isUnlocked) setTimeout(() => m.classList.remove('suppress-secrets'), duration / 2); 
            m.marqueePlayer.onfinish = () => { m.style.transform = ''; m.style.filter = ''; m.style.animation = ''; m.marqueePlayer = null; m.classList.remove('suppress-secrets'); if (index === 0 && window._pendingActiveTag) { const activeTag = window._pendingActiveTag; window._pendingActiveTag = null; window.filterByTag(activeTag); } };
        });
    }, 50);
};

window.simulateHoverFlash = function(element, duration = 700) { if (!element) return; element.classList.add('simulate-hover'); setTimeout(() => element.classList.remove('simulate-hover'), duration); };
window.getSystemErrorHtml = function(title, msg) { return `<div class="sys-error-layout" style="padding: 3rem 0;">${GLOBAL_SVGS.errorAlert.replace('<svg ', '<svg class="sys-error-icon" ')}<h2 style="margin:0; color:var(--error-color); font-size:1.5rem;">${title}</h2><p class="sys-error-desc">${msg}</p></div>`; };
window.initScrollHints = function(container, hintLeft, hintRight) {
    if (!container || !hintLeft || !hintRight) return;
    let scrollTimeout;
    const checkScroll = () => {
        clearTimeout(scrollTimeout);
        const isScrollable = container.scrollWidth > container.clientWidth + 5, isAtEnd = Math.ceil(container.scrollLeft + container.clientWidth) >= Math.floor(container.scrollWidth) - 10, isAtStart = container.scrollLeft <= 10;
        hintRight.classList.toggle('visible', isScrollable && !isAtEnd); hintLeft.classList.toggle('visible', isScrollable && !isAtStart);
    };
    container.addEventListener('scroll', checkScroll);
    container.querySelectorAll('img').forEach(img => { if (img.complete) checkScroll(); else img.addEventListener('load', checkScroll); });
    new ResizeObserver(checkScroll).observe(container); setTimeout(checkScroll, 100);
};

window.initProgressBar = function(mountEl, scrollEl, type, existingBarId = null) {
    if (!mountEl || !scrollEl) return;
    let bar = existingBarId ? document.getElementById(existingBarId) : null;
    if (!bar) { bar = document.createElement('div'); if (existingBarId) bar.id = existingBarId; mountEl.appendChild(bar); }
    bar.className = `sys-progress-bar ${type === 'vertical' ? 'is-vertical-bar' : 'is-top-bar'} is-start`; bar.style.display = 'block'; bar.style.width = '0%'; bar.classList.remove('is-complete');
    let ticking = false; 
    const updateProgress = () => {
        if (bar.style.display === 'none') { ticking = false; return; }
        let progress = 100, maxScroll = 0, currentScroll = 0;
        if (type === 'vertical') { maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth; currentScroll = Math.abs(scrollEl.scrollLeft); } 
        else { maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight; currentScroll = Math.ceil(scrollEl.scrollTop); }
        if (maxScroll > 0) progress = (maxScroll - currentScroll <= 5) ? 100 : (currentScroll / maxScroll) * 100;
        bar.style.width = `${progress}%`;
        if (progress >= 100) { bar.classList.add('is-complete'); bar.classList.remove('is-start'); } 
        else if (progress <= 0 || currentScroll <= 0) { bar.classList.add('is-start'); bar.classList.remove('is-complete'); } 
        else { bar.classList.remove('is-complete', 'is-start'); }
        ticking = false; 
    };
    if (bar._scrollHandler) scrollEl.removeEventListener('scroll', bar._scrollHandler);
    bar._scrollHandler = () => { if (!ticking) { window.requestAnimationFrame(updateProgress); ticking = true; } };
    scrollEl.addEventListener('scroll', bar._scrollHandler, { passive: true }); setTimeout(updateProgress, 100);
    return bar;
};

window.switchBilingualTab = function(lang, btn) {
    ['zh', 'en', 'ja'].forEach(l => { const el = document.getElementById('lang-' + l); if (el) el.style.display = (l === lang) ? 'block' : 'none'; });
    const tabs = btn.closest('.lang-tabs'); if (tabs) tabs.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
};

window.findAnchorElement = function(hash) {
    if (!hash) return null;
    const targetId = hash.substring(1); let decodedId = targetId; try { decodedId = decodeURIComponent(targetId); } catch(e) {}
    const lowerId = targetId.toLowerCase(), lowerDecoded = decodedId.toLowerCase(), dashedId = lowerDecoded.replace(/[\s&]+/g, '-').replace(/-+/g, '-'); 
    let el = document.getElementById(targetId) || document.getElementById(decodedId) || document.getElementById(`md-sys-${targetId}`) || document.getElementById(`md-sys-${decodedId}`) || document.getElementById(`md-sys-${lowerId}`) || document.getElementById(`md-sys-${lowerDecoded}`) || document.getElementById(`md-sys-${dashedId}`);
    if (!el) {
        const allHeadings = document.querySelectorAll('.modal-content h1, .modal-content h2, .modal-content h3');
        el = Array.from(allHeadings).find(h => h.id.includes(lowerDecoded) || h.id.includes(dashedId) || lowerDecoded.includes(h.id) || h.innerText.toLowerCase().includes(lowerDecoded));
    }
    return el;
};

window.scrollToAnchor = function(event, hash) {
    if (event) event.preventDefault();
    const success = window.executeAnchorScroll(hash, false); if (!success) console.warn("找不到目標錨點:", hash);
};

window.executeAnchorScroll = function(hash, forceInstantFirst = false, disableTrackers = false) {
    const modalContainer = document.querySelector('.modal-content'); if (!modalContainer) return false;
    const targetEl = window.findAnchorElement(hash); if (!targetEl) return null;
    const doScroll = (isSmooth = true) => {
        const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 80;
        let itemTop = targetEl.offsetTop, currentEl = targetEl.offsetParent;
        while(currentEl && currentEl !== modalContainer) { itemTop += currentEl.offsetTop; currentEl = currentEl.offsetParent; }
        const targetScrollTop = itemTop - topBarHeight - 7; 
        if (Math.abs(modalContainer.scrollTop - targetScrollTop) > 2) modalContainer.scrollTo({ top: targetScrollTop, behavior: isSmooth ? 'smooth' : 'auto' });
    };

    doScroll(!forceInstantFirst);
    if (!disableTrackers) {
        let trackers = [setTimeout(() => doScroll(true), 300), setTimeout(() => doScroll(true), 600), setTimeout(() => doScroll(true), 1200)];
        const cancelTrackers = () => { trackers.forEach(clearTimeout); modalContainer.removeEventListener('wheel', cancelTrackers); modalContainer.removeEventListener('touchstart', cancelTrackers); };
        modalContainer.addEventListener('wheel', cancelTrackers, { passive: true }); modalContainer.addEventListener('touchstart', cancelTrackers, { passive: true });
    }
    let highlightEl = targetEl; if (highlightEl.textContent.trim() === '') highlightEl = highlightEl.nextElementSibling || targetEl;
    highlightEl.classList.add('highlight-flash'); setTimeout(() => highlightEl.classList.remove('highlight-flash'), 1500);
    return true;
};

// ==========================================
// ✨ 標籤與跑馬燈過濾邏輯
// ==========================================
window.currentActiveTag = null; window.highlightedCards = []; window.currentCardIndex = 0; window.isKotobaActive = false;

window.centerKotobaTag = function(event) {
    if (event) event.stopPropagation(); if (window.isKotobaActive) return window.clearFilter();
    window.clearFilter(); window.isKotobaActive = true;
    const targetTagEl = event ? event.target.closest('.kotoba-whisper') : document.querySelector('.kotoba-whisper'), firstContent = targetTagEl ? targetTagEl.closest('.marquee-content') : document.querySelector('.marquee-content');
    if (targetTagEl && firstContent) {
        document.querySelectorAll('.kotoba-whisper').forEach(t => t.classList.add('is-active'));
        const contentWidth = firstContent.offsetWidth; void firstContent.offsetWidth;
        let absoluteLeft = targetTagEl.offsetLeft; if (absoluteLeft === 0) absoluteLeft = targetTagEl.getBoundingClientRect().left - firstContent.getBoundingClientRect().left + firstContent.scrollLeft;
        let targetX = ((firstContent.parentElement.clientWidth / 2) - (absoluteLeft + (targetTagEl.offsetWidth / 2))) % contentWidth; if (targetX > 0) targetX -= contentWidth;
        window.scrollMarqueeTo(targetX, contentWidth);
    }
};

window.clearFilter = function(event) {
    if (event) event.stopPropagation(); window.currentActiveTag = null; window.highlightedCards = []; window.currentCardIndex = 0; window.isKotobaActive = false; 
    document.querySelectorAll('.card').forEach(c => c.classList.remove('highlighted', 'jump-bump')); document.querySelectorAll('.active-tag').forEach(t => t.classList.remove('active-tag'));
    document.querySelectorAll('.kotoba-whisper').forEach(t => t.classList.remove('is-active'));
    const toast = document.getElementById('filter-toast'); if (toast) toast.classList.remove('active');
    document.querySelectorAll('.marquee-content').forEach(m => {
        if (m.marqueePlayer) { m.marqueePlayer.cancel(); m.marqueePlayer = null; }
        let currentX = new DOMMatrix(window.getComputedStyle(m).transform).m41 % m.offsetWidth; if (currentX > 0) currentX -= m.offsetWidth;
        const remainingTime = (CONFIG.MARQUEE_SPEED * 1000) * (1 - (Math.abs(currentX) / m.offsetWidth)); 
        m.style.transition = 'none'; m.style.animation = 'none';
        m.marqueePlayer = m.animate([{ transform: `translateX(${currentX}px)` }, { transform: `translateX(-${m.offsetWidth}px)` }], { duration: remainingTime, easing: 'linear' });
        m.marqueePlayer.onfinish = () => { m.style.transform = ''; m.style.animation = ''; m.marqueePlayer = null; };
    });
};

window.filterByTag = function(targetTag, event, clickedElement) {
    if (event) event.stopPropagation(); if (window.currentActiveTag === targetTag) return window.clearFilter();
    window.clearFilter(); window.currentActiveTag = targetTag; window.highlightedCards = []; 
    
    let targetTagEl = (event && event.target) ? event.target.closest('.clickable-ticker-tag') : (clickedElement ? clickedElement.closest('.clickable-ticker-tag') : null);
    const firstContent = targetTagEl ? targetTagEl.closest('.marquee-content') : document.querySelector('.marquee-content');
    if (!targetTagEl && firstContent) targetTagEl = firstContent.querySelector(`.clickable-ticker-tag[data-tag="${targetTag}"]`);
    
    if (targetTagEl && firstContent) {
        const contentWidth = firstContent.offsetWidth; void firstContent.offsetWidth;
        let absoluteLeft = targetTagEl.offsetLeft; if (absoluteLeft === 0) absoluteLeft = targetTagEl.getBoundingClientRect().left - firstContent.getBoundingClientRect().left + firstContent.scrollLeft;
        let targetX = ((firstContent.parentElement.clientWidth / 2) - (absoluteLeft + (targetTagEl.offsetWidth / 2))) % contentWidth; if (targetX > 0) targetX -= contentWidth;
        window.scrollMarqueeTo(targetX, contentWidth);
    }

    document.querySelectorAll(`[data-tag="${targetTag}"]`).forEach(t => t.classList.add('active-tag'));
    document.querySelectorAll('.card').forEach(card => {
        const tags = card.getAttribute('data-tags');
        if (tags && tags.includes(targetTag)) { 
            if (card.classList.contains('sys-hidden-card') && !document.body.classList.contains('system-override-active')) return;
            card.classList.add('highlighted'); window.highlightedCards.push(card); 
        }
    });

    if (window.highlightedCards.length === 0) return window.clearFilter(); 
    let clickedCard = clickedElement ? clickedElement.closest('.card') : null;
    window.currentCardIndex = clickedCard ? Math.max(0, window.highlightedCards.indexOf(clickedCard)) : 0;

    const toast = document.getElementById('filter-toast');
    if (toast) {
        document.getElementById('toast-text').innerHTML = `<span class="toast-tag-name">${targetTag}</span>`;
        const toastCount = document.getElementById('toast-count'); if (toastCount) toastCount.innerText = `(${window.currentCardIndex + 1}/${window.highlightedCards.length})`;
        toast.classList.add('active');
    }
    if (window.highlightedCards.length > 0) window.focusAndBumpCard(window.highlightedCards[window.currentCardIndex]);
};

window.scrollMarqueeTo = function(targetX, contentWidth) {
    document.querySelectorAll('.marquee-content').forEach(m => {
        if (m.marqueePlayer) { m.marqueePlayer.cancel(); m.marqueePlayer = null; }
        let currentX = new DOMMatrix(window.getComputedStyle(m).transform).m41 % contentWidth; if (currentX > 0) currentX -= contentWidth;
        m.style.transition = 'none'; m.style.transform = `translateX(${currentX}px)`; m.style.animation = 'none'; void m.offsetWidth; 
        const duration = 0.8 + ((Math.abs(targetX - currentX) / contentWidth) * 0.7);
        m.style.transition = `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`; m.style.transform = `translateX(${targetX}px)`;
    });
};

window.scrollToNextCard = function(event) {
    if (event) event.stopPropagation(); if (window.highlightedCards.length <= 1) return;
    window.currentCardIndex = (window.currentCardIndex + 1) % window.highlightedCards.length;
    const toastCount = document.getElementById('toast-count'); if (toastCount) toastCount.innerText = `(${window.currentCardIndex + 1}/${window.highlightedCards.length})`;
    if (window.highlightedCards.length > 0) window.focusAndBumpCard(window.highlightedCards[window.currentCardIndex]);
};

// ==========================================
// ✨ 全域影片全螢幕引擎
// ==========================================
window.toggleWebFullscreen = function(videoEl) {
    if (!videoEl) return;
    if (videoEl.classList.contains('is-web-fullscreen')) {
        videoEl.classList.remove('is-web-fullscreen'); window.unlockScroll(); 
        const placeholder = videoEl._fsPlaceholder; if (placeholder && placeholder.parentNode) { placeholder.parentNode.insertBefore(videoEl, placeholder); placeholder.remove(); }
        if (videoEl._fsExitBtn) videoEl._fsExitBtn.remove();
    } else {
        const isPaused = videoEl.paused, placeholder = document.createElement('div'); placeholder.className = 'video-fs-placeholder';
        videoEl._fsPlaceholder = placeholder; videoEl.parentNode.insertBefore(placeholder, videoEl); document.body.appendChild(videoEl); 
        videoEl.classList.add('is-web-fullscreen'); window.lockScroll(); 
        if (!isPaused) videoEl.play().catch(e => console.warn("自動播放被系統阻擋", e));
        
        if (!videoEl._fsExitBtn) {
            const exitBtn = document.createElement('button'); exitBtn.className = 'video-exit-fullscreen-btn';
            exitBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            exitBtn.onclick = (e) => { e.stopPropagation(); window.toggleWebFullscreen(videoEl); };
            document.body.appendChild(exitBtn); videoEl._fsExitBtn = exitBtn;
        } else { document.body.appendChild(videoEl._fsExitBtn); }
    }
};

// ==========================================
// ✨ DOM 載入與全域事件監聽
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = window.t ? window.t(el.getAttribute('data-i18n')) : el.innerHTML; });
    document.querySelectorAll('[data-i18n-tooltip]').forEach(el => { el.setAttribute('data-tooltip', window.t ? window.t(el.getAttribute('data-i18n-tooltip')) : el.getAttribute('data-tooltip')); });
    document.querySelectorAll('[data-i18n-alt]').forEach(el => { el.setAttribute('alt', window.t ? window.t(el.getAttribute('data-i18n-alt')) : el.getAttribute('alt')); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', window.t ? window.t(el.getAttribute('data-i18n-aria')) : el.getAttribute('aria-label')); });

    const themeToggle = document.getElementById('theme-toggle'), savedTheme = localStorage.getItem('theme'), prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    let initialTheme = savedTheme ? savedTheme : (prefersLight ? 'light' : CONFIG.DEFAULT_THEME); 
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (window.mermaid) {
            window.mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif', securityLevel: 'loose' });
            document.querySelectorAll('.mermaid').forEach(el => {
                const originalText = decodeURIComponent(el.getAttribute('data-original-text') || '');
                if (originalText) { el.textContent = window.processMermaidCssVars(originalText); el.removeAttribute('data-processed'); }
            });
            window.mermaid.run({ querySelector: '.mermaid' }).catch(() => {});
        }
    }
    applyTheme(initialTheme);
    if(themeToggle) themeToggle.addEventListener('click', () => { let newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; applyTheme(newTheme); localStorage.setItem('theme', newTheme); });
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => { if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'light' : 'dark'); });

    const menuToggle = document.getElementById('menu-toggle'), fullscreenMenu = document.getElementById('fullscreen-menu');
    if(menuToggle) menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open'); fullscreenMenu.classList.toggle('active');
        if (fullscreenMenu.classList.contains('active')) { window.lockScroll(); } else { setTimeout(() => window.unlockScroll(), 600); }
    });

    if(fullscreenMenu) fullscreenMenu.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            e.preventDefault(); const targetHash = navItem.getAttribute('href'), targetId = targetHash.substring(1), targetSection = document.getElementById(targetId);
            if (!targetSection) return;
            menuToggle.classList.remove('open'); fullscreenMenu.classList.remove('active');
            if (window.location.hash !== targetHash) window.history.pushState(null, null, targetHash);
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                if (targetSection.animationTimer) clearTimeout(targetSection.animationTimer);
                targetSection.id = ''; targetSection.classList.remove('force-target'); void targetSection.offsetWidth; 
                targetSection.id = targetId; targetSection.classList.add('force-target');
                targetSection.animationTimer = setTimeout(() => { targetSection.classList.remove('force-target'); }, 3000);
                setTimeout(() => window.unlockScroll(), 200);
            }, 50);
        }
    });

    const siteTitle = document.querySelector('header h1'), profileSection = document.querySelector('main section p');
    let clickCount = 0, clickTimer = null; const originalProfile = profileSection ? profileSection.innerHTML : '';
    if (siteTitle && profileSection) {
        siteTitle.style.cursor = 'pointer'; window.isWhispering = false;
        siteTitle.addEventListener('click', async () => {
            if (window.isWhispering) return; 
            clickCount++; clearTimeout(clickTimer);
            if (clickCount >= 5) {
                window.isWhispering = true; clickCount = 0; 
                const isJustUnlocked = !document.body.classList.contains('system-override-active');
                document.body.classList.add('system-override-active'); window.refreshUIAfterOverrideToggle();
                profileSection.style.height = profileSection.offsetHeight + 'px'; profileSection.style.overflowY = 'auto'; profileSection.style.opacity = 0;
                
                try {
                    const notes = await window.getKotobaList(); if (notes.length === 0) throw new Error(window.t('no_quotes'));
                    const randomNote = notes[Math.floor(Math.random() * notes.length)];
                    setTimeout(() => {
                        const statusText = isJustUnlocked ? "[ SYSTEM_OVERRIDE_ENABLED : CLASSIFIED_DATA_UNLOCKED ]" : "[ SYSTEM_LOG : KOTOBA_NO_BOX ]", textColor = isJustUnlocked ? "var(--error-color)" : "var(--accent-2)";
                        profileSection.innerHTML = `<div style="color: ${textColor}; font-family: 'Courier New', monospace; font-size: 0.85rem; margin-bottom: 0;">${statusText}</div><div style="margin-top: -1rem; margin-bottom: 0;">${marked.parse(randomNote)}</div>`;
                        profileSection.style.opacity = 1;
                    }, 300);
                } catch (err) { setTimeout(() => { profileSection.innerHTML = `<span style="color: var(--error-color);">[ERR] KOTOBA_NO_BOX_OFFLINE</span>`; profileSection.style.opacity = 1; }, 300); }
                setTimeout(() => { profileSection.style.opacity = 0; setTimeout(() => { profileSection.innerHTML = originalProfile; profileSection.style.opacity = 1; window.isWhispering = false; profileSection.style.height = ''; profileSection.style.overflowY = ''; }, 300); }, 12000);
            } else { clickTimer = setTimeout(() => { clickCount = 0; }, 1000); }
        });
    }

    const quoteTextEl = document.querySelector('.sys-quote-box .quote-text');
    if (quoteTextEl && window.getQuotesList) {
        window.getQuotesList().then(notes => {
            if (notes && notes.length > 0) {
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                quoteTextEl.style.opacity = '0'; setTimeout(() => { quoteTextEl.innerHTML = marked.parse(randomNote); quoteTextEl.style.opacity = '1'; }, 400); 
            }
        }).catch(err => console.warn("名言載入失敗:", err));
    }
});

const bttBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => { if (bttBtn) bttBtn.classList.toggle('visible', window.scrollY > 300); });
if (bttBtn) bttBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.addEventListener('click', (e) => {
    if (e.target.closest('.spoiler-text')) return;
    const xrayTarget = e.target.closest('.md-highlight-text');
    document.querySelectorAll('.md-highlight-text.is-xray-active').forEach(el => { if (el !== xrayTarget) el.classList.remove('is-xray-active'); });
    if (xrayTarget) xrayTarget.classList.toggle('is-xray-active');
});

document.addEventListener('keydown', (e) => {
    const isLightboxOpen = document.getElementById('lightbox-modal')?.classList.contains('is-active'), isArticleOpen = document.getElementById('md-modal')?.classList.contains('active');
    const fullscreenVideo = document.querySelector('video.is-web-fullscreen');
    
    if (fullscreenVideo) { if (e.key === 'Escape') { window.toggleWebFullscreen(fullscreenVideo); e.preventDefault(); } return; }
    if (isLightboxOpen) {
        if (e.key === 'Escape') {
            const toolbox = document.getElementById('lightbox-toolbox');
            if (toolbox && toolbox.classList.contains('is-open')) { toolbox.classList.remove('is-open'); } else if (window.lightboxState.zoom > 1) { window.lightboxAction('reset'); } else { window.closeLightbox(); } e.preventDefault();
        }
        if (e.key === 'ArrowLeft') { window.navigateLightbox(-1); e.preventDefault(); } if (e.key === 'ArrowRight') { window.navigateLightbox(1); e.preventDefault(); } if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
        return; 
    }
    if (isArticleOpen) {
        const tocDropdown = document.querySelector('.toc-dropdown'), tocBtn = document.querySelector('.toc-toggle-btn');
        if (e.key === 'Escape') { if (tocDropdown?.classList.contains('active') && tocBtn) { tocBtn.click(); } else { window.closeModal(); } e.preventDefault(); }
        if (e.key === 'ArrowLeft') { const prevBtn = document.querySelector('.nav-card.prev'); if (prevBtn) { prevBtn.click(); e.preventDefault(); } }
        if (e.key === 'ArrowRight') { const nextBtn = document.querySelector('.nav-card.next'); if (nextBtn) { nextBtn.click(); e.preventDefault(); } }
    } else {
        if (e.key === 'Escape') { const fsMenu = document.getElementById('fullscreen-menu'), menuBtn = document.getElementById('menu-toggle'); if (fsMenu?.classList.contains('active') && menuBtn) { menuBtn.click(); e.preventDefault(); } }
    }
    if (e.key.toLowerCase() === 'm' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { document.getElementById('theme-toggle')?.click(); }
});

document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    let activeModal = [document.getElementById('pdf-action-modal'), document.getElementById('sensitive-modal-overlay'), document.getElementById('lightbox-modal')?.classList.contains('is-active') ? document.getElementById('lightbox-modal') : null, document.getElementById('md-modal')?.classList.contains('active') ? document.getElementById('md-modal') : null, document.getElementById('fullscreen-menu')?.classList.contains('active') ? document.getElementById('fullscreen-menu') : null].find(m => m);
    if (!activeModal) return; 
    const focusableEls = Array.from(activeModal.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(el => (el.offsetWidth > 0 || el.offsetHeight > 0) && window.getComputedStyle(el).visibility !== 'hidden');
    if (focusableEls.length === 0) { e.preventDefault(); return; }
    const firstEl = focusableEls[0], lastEl = focusableEls[focusableEls.length - 1];
    if (!activeModal.contains(document.activeElement)) { firstEl.focus(); e.preventDefault(); return; }
    if (e.shiftKey) { if (document.activeElement === firstEl) { lastEl.focus(); e.preventDefault(); } } else { if (document.activeElement === lastEl) { firstEl.focus(); e.preventDefault(); } }
});

window.addEventListener('online', () => { window.location.reload(); });
window.addEventListener('offline', () => {
    if (window.hideSystemRebootScreen) window.hideSystemRebootScreen(false);
    if (window.showSystemToast) window.showSystemToast(window.t('net_offline_title'), window.t('net_offline_msg'), window.t('net_offline_sub'), 12000, 'error');
});
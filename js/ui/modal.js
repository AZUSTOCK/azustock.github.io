import { CONFIG, GLOBAL_SVGS } from '../config.js';

// ==========================================
// ✨ 索引式 Markdown Modal 邏輯與觀察器
// ==========================================
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
        
        if (modalContainer) modalContainer.dispatchEvent(new Event('scroll'));
        
        const verticalWrappers = document.querySelectorAll('.vertical-wrapper');
        if (verticalWrappers.length > 0) {
            verticalWrappers.forEach(w => w.dispatchEvent(new Event('scroll')));
        }
    });
    window.modalBodyObserver.observe(modalBody);
}

// ✨ 動畫切換核心引擎
export function switchModalContent(updateDOMCallback, afterUpdateCallback = null, animateTopBar = true) {
    const isModalOpen = modalOverlay.classList.contains('active');
    const topLeft = document.getElementById('modal-top-left');
    const tocMount = document.getElementById('toc-mount-point');
    const modalContainer = document.querySelector('.modal-content');
    
    if (window.indexScrollHandler && modalContainer) {
        modalContainer.removeEventListener('scroll', window.indexScrollHandler);
        window.indexScrollHandler = null;
    }
    const jumpToast = document.getElementById('new-jump-toast');
    if (jumpToast) jumpToast.classList.remove('is-visible');

    if (isModalOpen) {
        const currentHeight = modalContainer.offsetHeight; 
        modalContainer.style.height = currentHeight + 'px';

        modalBody.classList.add('content-fade-out');
        
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
                if (afterUpdateCallback) afterUpdateCallback();
                modalBody.classList.remove('content-fade-out'); 
                
                if (animateTopBar) {
                    if (topLeft) topLeft.classList.remove('content-fade-out');
                    if (tocMount) tocMount.classList.remove('content-fade-out');
                }
                setTimeout(() => { modalContainer.style.height = ''; }, 320); 
            });
        }, 120); 
    } else {
        updateDOMCallback();
        if (afterUpdateCallback) afterUpdateCallback();
        modalBody.classList.remove('content-fade-out');
        if (topLeft) topLeft.classList.remove('content-fade-out');
        if (tocMount) tocMount.classList.remove('content-fade-out');
        if (window.adjustModalViewports) window.adjustModalViewports();
    }
}

// ==========================================
// ✨ 專案目錄與文章開啟器
// ==========================================
export function openProjectIndex(projectId, restoreScroll = false) {
    const proj = window.siteProjects.find(p => p.id === projectId);
    if (!proj || !proj.articles) return;

    if (proj.min_sys_version && window.compareVersions(CONFIG.VERSION, proj.min_sys_version) < 0) {
        closeModal(); 
        sessionStorage.setItem('sys_reboot_count', '1');
        sessionStorage.setItem('sys_is_rebooting', 'true');
        sessionStorage.setItem('sys_expected_version', proj.min_sys_version);
        if(window.showSystemRebootScreen) window.showSystemRebootScreen(window.t('core_update'), CONFIG.VERSION, proj.min_sys_version, window.t('updating'), true);
        setTimeout(() => {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('v', new Date().getTime());
            window.location.replace(newUrl.toString());
        }, 1200);
        return; 
    }

    window.isRendering = false; window.historyStack = []; 

    switchModalContent(
        () => {
            const modalContainer = document.querySelector('.modal-content');
            document.querySelector('.modal-top-bar').classList.remove('is-index-mode');
            document.getElementById('toc-mount-point').innerHTML = ``;

            const proj = window.siteProjects.find(p => p.id === projectId);
            if (!proj || !proj.articles) return;

            if (proj.is_sensitive && window._hasAgreedSensitiveContent !== true) {
                window.showSensitiveAgreementModal(() => openProjectIndex(projectId, restoreScroll), () => closeModal());
                return;
            }

            let currentSort = sessionStorage.getItem(`sort_${projectId}`) || proj.default_sort || 'desc';
            sessionStorage.setItem(`sort_${projectId}`, currentSort);

            const isUnlocked = document.body.classList.contains('system-override-active');
            const visibleCount = proj.articles.filter(a => isUnlocked || !a.is_hidden).length;

            const cleanPath = window.getCleanBasePath();
            const spaUrl = `${window.location.origin}${cleanPath}?p=${projectId}`;
            window.history.replaceState({ path: spaUrl }, '', spaUrl);
            
            const projLang = window.CURRENT_LANG; 
            const shareUrl = `${window.location.origin}${cleanPath}api/${projLang}/${projectId}/index.html`;

            document.getElementById('modal-top-left').innerHTML = `
                <div class="index-header-container">
                    <h1 class="index-header-title">${proj.title} - ${window.t('index_title')}</h1>
                    <div class="index-header-actions">
                        <span class="article-count-badge">${window.t('total_articles', [visibleCount])}</span>
                        <button id="toggle-sort-btn" class="share-link-btn sm is-desc">
                            <svg class="sort-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path class="sort-arr-left" d="M 4 9 L 9 4 L 9 20"></path><path class="sort-arr-right" d="M 20 15 L 15 20 L 15 4"></path></svg>
                            <span class="btn-text-wrapper">
                                <span class="sort-text-desc">${window.t('sort_desc')}</span>
                                <span class="sort-text-asc">${window.t('sort_asc')}</span>
                            </span>
                        </button>
                        <button class="share-link-btn sm" id="index-share-btn">
                            <span class="btn-state-wrapper">
                                <span class="state-idle">${GLOBAL_SVGS.link} <span>${window.t('copy_link')}</span></span>
                                <span class="state-success">${GLOBAL_SVGS.check} <span>${window.t('copied')}</span></span>
                            </span>
                        </button> 
                    </div>
                </div>
            `;
            
            modalBody.innerHTML = `<div id="article-list-container" style="transition: opacity 0.2s ease;"></div>`;
            const progressBar = document.getElementById('reading-progress-bar');
            if (progressBar) progressBar.style.display = 'none';

            const shareBtn = document.getElementById('index-share-btn');
            if (shareBtn) shareBtn.addEventListener('click', function() { window.handleCopy(this, shareUrl); });

            const listContainer = modalBody.querySelector('#article-list-container');
            const sortBtn = document.getElementById('toggle-sort-btn');

            const renderList = () => {
                const finalArray = window.getArticleSequence(projectId);
                const generateLi = (art, idx, isHighlightGroup, themeClass = '', customStyle = '') => {
                    let descHtml = art.description ? `<span class="article-item-desc">- ${art.description}</span>` : '';
                    let dateHtml = art.date ? `<span class="article-item-date">${art.date}</span>` : '';
                    let statusBadgeHtml = window.getStatusBadgeHtml(art, true);
                    let baseIconHtml = art.cover_image ? `<img src="${art.cover_image}" alt="cover" class="article-item-cover is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` : `<div class="article-item-fallback" style="color: var(--muted);">${GLOBAL_SVGS.docIconLg}</div>`;
                    let pinnedBadgeHtml = art.pinned ? `<div class="modal-pin">${GLOBAL_SVGS.pinSmall}</div>` : '';
                    let secretBadgeHtml = art.is_hidden ? `<div class="modal-secret-pin">${GLOBAL_SVGS.secretPinSmall}</div>` : '';
                    let iconHtml = `<div class="article-item-icon-wrap">${pinnedBadgeHtml}${secretBadgeHtml}${baseIconHtml}</div>`;
                    let hiddenClass = art.is_hidden ? ' sys-hidden-item' : '';

                    return `
                        <li id="article-item-${idx}" class="article-li ${isHighlightGroup ? 'is-highlight' : 'is-normal'}${hiddenClass}${themeClass}"${customStyle}>
                            <a href="#" onclick="event.preventDefault(); window.openArticle('${projectId}', ${idx})" class="article-link">
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
                    let colorIndex = 0, isFirstGroup = true; 
                    for (const [groupId, groupData] of Object.entries(proj.groups)) {
                        const groupArticles = finalArray.filter(item => item.art.group === groupId);
                        if (groupArticles.length === 0) continue;

                        let groupColor = groupData.color, themeClass = '', customStyle = '';
                        if (groupData.highlight) { const groupNum = (colorIndex % 5) + 1; themeClass = ` group-color-${groupNum}`; colorIndex++; } 
                        else if (groupColor) { customStyle = ` style="--current-group-color: ${groupColor};"`; }
                        const topMargin = isFirstGroup ? '0rem' : '1.8rem';

                        html += `<div class="group-header" style="margin-top: ${topMargin}; margin-bottom: 0.8rem;"><div class="group-header-title${themeClass}"${customStyle}>${groupData.title || groupId}</div>${groupData.description ? `<div class="group-header-desc">${groupData.description}</div>` : ''}</div><ul class="article-list-ul">`;
                        groupArticles.forEach(({art, idx}) => { html += generateLi(art, idx, groupData.highlight, themeClass, customStyle); });
                        html += `</ul>`;
                        isFirstGroup = false;
                    }
                    const ungrouped = finalArray.filter(item => !item.art.group);
                    if (ungrouped.length > 0) {
                        const topMargin = isFirstGroup ? '0rem' : '1.5rem';
                        html += `<ul class="article-list-ul" style="margin-top:${topMargin};">`;
                        ungrouped.forEach(({art, idx}) => { html += generateLi(art, idx, false); });
                        html += `</ul>`;
                    }
                } else {
                    html += `<ul class="article-list-ul" style="margin-top:0rem;">`;
                    finalArray.forEach(({art, idx}) => { html += generateLi(art, idx, false); });
                    html += `</ul>`;
                }
                listContainer.innerHTML = html;

                const initJumpToast = () => {
                    const newArticles = Array.from(listContainer.querySelectorAll('.article-li')).filter(li => li.querySelector('.status-badge[data-status="NEW"]'));
                    let jumpToast = document.getElementById('new-jump-toast');
                    if (!jumpToast) { jumpToast = document.createElement('button'); jumpToast.id = 'new-jump-toast'; jumpToast.className = 'new-jump-toast'; modalOverlay.appendChild(jumpToast); }

                    if (window.indexScrollHandler) { modalContainer.removeEventListener('scroll', window.indexScrollHandler); window.indexScrollHandler = null; }

                    if (newArticles.length > 0) {
                        let targetArticle = null;
                        window.indexScrollHandler = () => {
                            const modalRect = modalContainer.getBoundingClientRect();
                            let countAbove = 0, countVisible = 0, countBelow = 0, closestAbove = null, closestBelow = null;

                            newArticles.forEach(article => {
                                const rect = article.getBoundingClientRect();
                                const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 80;
                                if (rect.top < modalRect.top + topBarHeight) { countAbove++; closestAbove = article; } 
                                else if (rect.bottom > modalRect.bottom + 20) { countBelow++; if (!closestBelow) closestBelow = article; } 
                                else { countVisible++; }
                            });

                            if (countBelow > 0) {
                                targetArticle = closestBelow;
                                jumpToast.innerHTML = `${GLOBAL_SVGS.jumpDown} ${countVisible > 0 ? window.t('more_below') : window.t('found_new')} ${countBelow} ${window.t('new_articles')}`;
                                jumpToast.classList.add('is-visible');
                            } else if (countAbove > 0) {
                                targetArticle = closestAbove;
                                jumpToast.innerHTML = `${GLOBAL_SVGS.jumpUp} ${countVisible > 0 ? window.t('more_above') : window.t('found_new')} ${countAbove} ${window.t('new_articles')}`;
                                jumpToast.classList.add('is-visible');
                            } else {
                                targetArticle = null; jumpToast.classList.remove('is-visible');
                            }
                        };
                        modalContainer.addEventListener('scroll', window.indexScrollHandler);
                        setTimeout(window.indexScrollHandler, 100);

                        jumpToast.onclick = () => {
                            if (!targetArticle) return;
                            const finalTarget = targetArticle;
                            const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 80;
                            const scrollOffset = finalTarget.getBoundingClientRect().top - modalContainer.getBoundingClientRect().top - topBarHeight - 40;
                            modalContainer.scrollTo({ top: modalContainer.scrollTop + scrollOffset, behavior: 'smooth' });
                            jumpToast.classList.remove('is-visible'); 
                            setTimeout(() => { if(window.simulateHoverFlash) window.simulateHoverFlash(finalTarget); }, 500);
                        };
                    } else { jumpToast.classList.remove('is-visible'); }
                };
                initJumpToast();
            };

            const updateSortBtnUI = () => {
                const isAsc = currentSort === 'asc';
                sortBtn.classList.toggle('is-asc', isAsc); sortBtn.classList.toggle('is-desc', !isAsc);
            };

            updateSortBtnUI(); renderList();

            sortBtn.addEventListener('click', () => {
                if (window.isRendering) return;
                sortBtn.disabled = true; window.isRendering = true;
                currentSort = currentSort === 'desc' ? 'asc' : 'desc';
                sessionStorage.setItem(`sort_${projectId}`, currentSort); 
                listContainer.style.transition = 'opacity 0.2s ease'; listContainer.style.opacity = '0';
                updateSortBtnUI(); 
                setTimeout(() => {
                    renderList(); void listContainer.offsetWidth; listContainer.style.opacity = '1';
                    setTimeout(() => { window.isRendering = false; sortBtn.disabled = false; }, 200); 
                }, 200); 
            });

            modalOverlay.classList.add('active');
            if(window.lockScroll) window.lockScroll(); 
        },
        () => {
            const modalContainer = document.querySelector('.modal-content');
            if (modalContainer) {
                requestAnimationFrame(() => {
                    if (restoreScroll && window.lastReadArticleIndex !== undefined) {
                        if (window._indexScrollTopCache !== undefined) modalContainer.scrollTop = window._indexScrollTopCache;
                        const targetItem = document.getElementById(`article-item-${window.lastReadArticleIndex}`);
                        if (targetItem) {
                            const topBarHeight = document.querySelector('.modal-top-bar')?.offsetHeight || 80;
                            let itemTop = targetItem.offsetTop, currentEl = targetItem.offsetParent;
                            while(currentEl && currentEl !== modalContainer) { itemTop += currentEl.offsetTop; currentEl = currentEl.offsetParent; }
                            const itemBottom = itemTop + targetItem.offsetHeight;
                            const containerHeight = modalContainer.clientHeight, visibleTop = modalContainer.scrollTop + topBarHeight, visibleBottom = modalContainer.scrollTop + containerHeight;
                            const isVisible = (itemTop >= visibleTop) && (itemBottom <= visibleBottom);

                            if (!isVisible) {
                                if (itemTop < visibleTop) { modalContainer.scrollTop = itemTop - topBarHeight - 20; } 
                                else if (itemBottom > visibleBottom) {
                                    let newScrollTop = itemBottom + 20 - containerHeight;
                                    if (itemTop < newScrollTop + topBarHeight) newScrollTop = itemTop - topBarHeight - 40;
                                    modalContainer.scrollTop = newScrollTop;
                                }
                            }
                            if(window.simulateHoverFlash) window.simulateHoverFlash(targetItem);
                        }
                    } else { modalContainer.scrollTop = 0; }
                });
            }
        }
    ); 
}

export async function openArticle(projectId, articleIndex, isFromHistory = false, restoreScrollTop = 0, targetHash = null, restoreInnerScrolls = []) {
    const proj = window.siteProjects.find(p => p.id === projectId);
    const article = proj.articles[articleIndex];

    if (article && article.min_sys_version && window.compareVersions(CONFIG.VERSION, article.min_sys_version) < 0) {
        closeModal();
        sessionStorage.setItem('sys_reboot_count', '1');
        sessionStorage.setItem('sys_is_rebooting', 'true');
        sessionStorage.setItem('sys_expected_version', article.min_sys_version);
        if(window.showSystemRebootScreen) window.showSystemRebootScreen(window.t('core_update'), CONFIG.VERSION, article.min_sys_version, window.t('updating'), true);
        setTimeout(() => {
            const newUrl = new URL(window.location.href); newUrl.searchParams.set('v', new Date().getTime()); window.location.replace(newUrl.toString());
        }, 1200);
        return; 
    }

    const jumpToast = document.getElementById('new-jump-toast');
    if (jumpToast) jumpToast.classList.remove('is-visible');

    if (!isFromHistory) {
        const modalContainer = document.querySelector('.modal-content');
        if (!window.historyStack) window.historyStack = [];
        if (window.historyStack.length === 0 && modalContainer) window._indexScrollTopCache = modalContainer.scrollTop;
        if (window.historyStack.length > 0 && modalContainer) {
            window.historyStack[window.historyStack.length - 1].scrollTop = modalContainer.scrollTop;
            const wrappers = document.querySelectorAll('#modal-body .vertical-wrapper');
            window.historyStack[window.historyStack.length - 1].innerScrolls = Array.from(wrappers).map(w => ({ scrollTop: w.scrollTop, scrollLeft: w.scrollLeft }));
        }
        window.historyStack.push({ projectId, articleIndex, scrollTop: 0, innerScrolls: [] });
    }

    window.lastReadArticleIndex = articleIndex;
    
    if ((proj.is_sensitive || article.is_sensitive) && window._hasAgreedSensitiveContent !== true) {
        showSensitiveAgreementModal(() => openArticle(projectId, articleIndex, isFromHistory, restoreScrollTop, targetHash, restoreInnerScrolls), () => openProjectIndex(projectId));
        return;
    }
    
    document.body.style.cursor = 'wait';
    let markdownContent = window.t('load_failed');
    let isArticleFallback = false;
    
    try {
        isArticleFallback = article.content_path.includes('/zh/') && window.CURRENT_LANG !== 'zh';
        const response = await fetch(article.content_path);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        markdownContent = data.content; 
    } catch (error) {
        console.error("無法載入文章內容:", error);
        const isOffline = !navigator.onLine || (error.message && error.message.includes('Failed to fetch'));
        const errTitle = isOffline ? window.t('err_net_disconnect') : window.t('err_not_found');
        const errMsg = isOffline ? window.t('net_offline_sub') : window.t('err_not_found'); 
        
        markdownContent = `\n# ${article.title}\n\n<div class="sys-error-layout">\n    <svg class="sys-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>\n        <line x1="12" y1="9" x2="12" y2="13"></line>\n        <line x1="12" y1="17" x2="12.01" y2="17"></line>\n    </svg>\n    <div class="media-error-title" style="font-size: 1.2rem; margin-bottom: 0.5rem;">\n        ${errTitle}\n    </div>\n    <div class="sys-error-desc">\n        ${errMsg}\n    </div>\n</div>`.trim();
    } finally {
        document.body.style.cursor = '';
    }

    const isCurrentlyArticle = document.querySelector('#modal-top-left .unified-nav-capsule') !== null;
    const animateTopBar = !(modalOverlay.classList.contains('active') && isCurrentlyArticle);

    switchModalContent(
        () => {
            document.querySelector('.modal-top-bar').classList.remove('is-index-mode');
            modalOverlay.classList.add('active');
            if(window.lockScroll) window.lockScroll();
            window._lastMarkdownHeadings = [];
            
            modalBody.innerHTML = marked.parse(markdownContent);

            const modalContainer = document.querySelector('.modal-content');
            const topBar = document.querySelector('.modal-top-bar');
            
            if (modalContainer && topBar && window.initProgressBar) window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');

            const verticalWrappers = modalBody.querySelectorAll('.vertical-wrapper');
            verticalWrappers.forEach(wrapper => {
                const container = document.createElement('div');
                container.style.cssText = 'position: relative; margin: 1rem 0; border-radius: 12px; overflow: hidden;';
                wrapper.parentNode.insertBefore(container, wrapper);
                wrapper.style.margin = '0'; container.appendChild(wrapper);
                if(window.initProgressBar) window.initProgressBar(container, wrapper, 'vertical');
            });

            const flatSequence = window.getArticleSequence(projectId);
            const seqIndex = flatSequence.findIndex(item => item.idx === articleIndex);

            const generateNavBtn = (item, type) => {
                const isPrev = type === 'prev';
                const iconSvg = isPrev ? GLOBAL_SVGS.chevronLeft : GLOBAL_SVGS.chevronRight;
                const text = isPrev ? window.t('prev_article') : window.t('next_article');
                
                if (!item) return { cardHtml: '', btnHtml: `<button class="capsule-btn disabled" disabled>${iconSvg}</button>` };
                const cardHtml = `<a href="javascript:void(0)" class="nav-card ${type}" onclick="window.openArticle('${projectId}', ${item.idx})"><div class="nav-label">${isPrev ? `${iconSvg} ${text}` : `${text} ${iconSvg}`}</div><div class="nav-title">${item.art.title}</div></a>`;
                const btnHtml = `<button class="capsule-btn" onclick="window.openArticle('${projectId}', ${item.idx})" data-tooltip="${text}">${iconSvg}</button>`;
                return { cardHtml, btnHtml };
            };

            const prevData = seqIndex > 0 ? generateNavBtn(flatSequence[seqIndex - 1], 'prev') : generateNavBtn(null, 'prev');
            const nextData = seqIndex < flatSequence.length - 1 ? generateNavBtn(flatSequence[seqIndex + 1], 'next') : generateNavBtn(null, 'next');

            if (prevData.cardHtml || nextData.cardHtml) {
                const navContainer = document.createElement('div'); navContainer.className = 'article-nav-cards';
                navContainer.innerHTML = prevData.cardHtml + nextData.cardHtml; modalBody.appendChild(navContainer);
            }

            modalBody.querySelectorAll('img').forEach(img => {
                if (!img.getAttribute('onerror')) {
                    img.classList.add('is-loading'); img.setAttribute('loading', 'lazy'); img.setAttribute('onerror', 'window.handleImageError(this)');
                    img.addEventListener('load', function() { this.classList.remove('is-loading'); });
                    if (img.complete && img.naturalHeight === 0 && window.handleImageError) window.handleImageError(img);
                }
            });

            let mermaidRetryCount = 0;
            const renderMermaid = () => {
                if (window.mermaid) {
                    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                    window.mermaid.initialize({ startOnLoad: false, theme: currentTheme === 'dark' ? 'dark' : 'default', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif', securityLevel: 'loose' });
                    document.querySelectorAll('.mermaid').forEach(el => el.removeAttribute('data-processed'));
                    window.mermaid.run({ querySelector: '.mermaid' }).catch(e => console.warn('Mermaid 語法錯誤:', e)).finally(() => { if(window.initMermaidDrag) window.initMermaidDrag(); });
                } else if (mermaidRetryCount < 10) { mermaidRetryCount++; setTimeout(renderMermaid, 300); } 
                else { console.warn("Mermaid 引擎載入超時，放棄渲染。"); }
            };
            renderMermaid();

            const firstH1 = modalBody.querySelector('h1');
            if (firstH1) {
                const wrapper = document.createElement('div'); wrapper.className = 'article-header-wrapper'; wrapper.style.marginTop = (firstH1 === modalBody.firstElementChild) ? '0' : '0.8rem';
                firstH1.style.borderBottom = 'none'; firstH1.style.paddingBottom = '0'; firstH1.style.margin = '0';
                firstH1.parentNode.insertBefore(wrapper, firstH1);

                const leftGroup = document.createElement('div'); leftGroup.className = 'header-left'; leftGroup.appendChild(firstH1);
                if (article.date) { const dateSpan = document.createElement('div'); dateSpan.className = 'article-date'; dateSpan.innerText = article.date; leftGroup.appendChild(dateSpan); }
                wrapper.appendChild(leftGroup);

                const rightGroup = document.createElement('div'); rightGroup.className = 'header-right';
                const statusBadge = window.getStatusBadgeHtml(article, false);
                if (statusBadge) { const tagContainer = document.createElement('div'); tagContainer.className = 'status-badge-container'; tagContainer.innerHTML = statusBadge; rightGroup.appendChild(tagContainer); }

                const cleanPath = window.getCleanBasePath(); const articleSlug = article.id || articleIndex;
                const spaUrl = `${window.location.origin}${cleanPath}?p=${projectId}&a=${articleSlug}${targetHash || ''}`;
                window.history.replaceState({ path: spaUrl }, '', spaUrl);
                
                const artLang = article.content_path.includes('/zh/') ? 'zh' : window.CURRENT_LANG;
                const shareUrl = `${window.location.origin}${cleanPath}api/${artLang}/${projectId}/${articleSlug}/index.html`;

                const shareBtn = document.createElement('button'); shareBtn.className = 'share-link-btn';
                shareBtn.innerHTML = `<span class="btn-state-wrapper"><span class="state-idle">${GLOBAL_SVGS.link} <span>${window.t('copy_link')}</span></span><span class="state-success">${GLOBAL_SVGS.check} <span>${window.t('copied')}</span></span></span>`;
                shareBtn.addEventListener('click', function() { if(window.handleCopy) window.handleCopy(this, shareUrl); });
                rightGroup.appendChild(shareBtn); wrapper.appendChild(rightGroup);
                
                if (isArticleFallback) {
                    const fallbackBanner = document.createElement('div');
                    fallbackBanner.style.cssText = "margin: -0.2rem 0 1.5rem 0; padding: 0.8rem 1.2rem; background: color-mix(in srgb, var(--accent-2) 10%, transparent); border-left: 4px solid var(--accent-2); border-radius: 4px 8px 8px 4px; color: var(--text); font-size: 0.9rem; display: flex; align-items: center; gap: 8px;";
                    fallbackBanner.innerHTML = `<span style="color: var(--accent-2); flex-shrink: 0; display: flex; align-items: center;">${GLOBAL_SVGS.fallbackHint}</span> <span style="opacity: 0.9; line-height: 1.4; padding-top: 2px;">${marked.parseInline(window.t('article_fallback_hint'))}</span>`;
                    wrapper.parentNode.insertBefore(fallbackBanner, wrapper.nextSibling);
                }
            }

            const topLeft = document.getElementById('modal-top-left');
            let historyBtnHtml = (window.historyStack && window.historyStack.length > 1) ? `<div class="capsule-divider"></div><button class="capsule-btn history-btn" onclick="window.goBackInHistory()" data-tooltip="${window.t('history_back')}">${GLOBAL_SVGS.historyBack}</button>` : '';
            let sequenceHtml = (flatSequence.length > 1) ? `<div class="capsule-divider"></div>${prevData.btnHtml}<span class="capsule-progress">${seqIndex + 1} / ${flatSequence.length}</span>${nextData.btnHtml}` : '';
            topLeft.innerHTML = `<div class="unified-nav-capsule"><button class="capsule-btn main-back" onclick="window.openProjectIndex('${projectId}', true)" data-tooltip="${window.t('back_to_index')}">${GLOBAL_SVGS.arrowLeft}<span class="desktop-only">${window.t('index_title')}</span></button>${sequenceHtml}${historyBtnHtml}</div>`;

            const tocMount = document.getElementById('toc-mount-point'); tocMount.innerHTML = ''; 
            const headings = modalBody.querySelectorAll('h1, h2, h3'); 
            if (headings.length > 1) {
                const tocWrapper = document.createElement('div'); tocWrapper.className = 'toc-wrapper';
                const tocBtn = document.createElement('div'); tocBtn.className = 'toc-toggle-btn'; tocBtn.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
                const tocDropdown = document.createElement('div'); tocDropdown.className = 'toc-dropdown'; tocDropdown.innerHTML = '<ul class="toc-list"></ul>';
                const tocList = tocDropdown.querySelector('.toc-list');

                headings.forEach((h, index) => {
                    if (!h.id) { const textId = h.innerText.toLowerCase().replace(/[\s&]+/g, '-').replace(/-+/g, '-'); h.id = textId || `article-heading-${index}`; }
                    const li = document.createElement('li'); li.className = `toc-${h.tagName.toLowerCase()}`; const a = document.createElement('a');
                    const rawTitle = h.getAttribute('data-raw-title');
                    if (rawTitle) { const tempDiv = document.createElement('div'); tempDiv.innerHTML = decodeURIComponent(rawTitle); a.innerText = tempDiv.innerText; } 
                    else { a.innerText = h.innerText; }
                    
                    a.href = "javascript:void(0)";
                    a.onclick = () => {
                        let targetHash = '#' + h.id;
                        if (h.id.startsWith('md-sys-')) {
                            const baseId = h.id.replace('md-sys-', '');
                            if (document.getElementById(baseId)) targetHash = '#' + baseId;
                        }
                        if(window.executeAnchorScroll) window.executeAnchorScroll(targetHash, false);
                        tocBtn.classList.remove('open'); tocDropdown.classList.remove('active');
                    };
                    li.appendChild(a); tocList.appendChild(li);
                });
                tocBtn.onclick = () => { tocBtn.classList.toggle('open'); tocDropdown.classList.toggle('active'); };
                tocWrapper.appendChild(tocBtn); tocWrapper.appendChild(tocDropdown); tocMount.appendChild(tocWrapper);
            }

            modalBody.querySelectorAll('.gallery').forEach(gallery => {
                const wrapper = document.createElement('div'); wrapper.className = 'scroll-wrapper';
                gallery.parentNode.insertBefore(wrapper, gallery);
                const hintLeft = document.createElement('div'); hintLeft.className = 'scroll-hint hint-left';
                const hintRight = document.createElement('div'); hintRight.className = 'scroll-hint hint-right';
                wrapper.appendChild(hintLeft); wrapper.appendChild(gallery); wrapper.appendChild(hintRight);

                const initialStyle = gallery.getAttribute('style') || '';
                const manualRows = (initialStyle.match(/--g-rows:\s*(\d+)/)) ? parseInt(initialStyle.match(/--g-rows:\s*(\d+)/)[1]) : null;

                if(window.initScrollHints) window.initScrollHints(gallery, hintLeft, hintRight);

                const originalCheckScroll = () => {
                    const totalItems = gallery.querySelectorAll('figure').length;
                    if (totalItems > 0) {
                        let shouldWrap = false;
                        if (!manualRows && totalItems > 1) {
                            const containerWidth = gallery.clientWidth;
                            if (containerWidth > 0) {
                                const matchWidth = initialStyle.match(/--g-width:\s*(\d+)px/); let baseWidth = matchWidth ? parseInt(matchWidth[1]) : 200;
                                if (((baseWidth * totalItems) + (16 * (totalItems - 1))) >= containerWidth * 1.5) shouldWrap = true;
                            }
                        }
                        const isCurrentlyWrapped = gallery.getAttribute('data-wrapped') === 'true';
                        if (shouldWrap !== isCurrentlyWrapped) {
                            if (shouldWrap) { gallery.style.display = 'flex'; gallery.style.flexWrap = 'wrap'; gallery.style.justifyContent = 'flex-start'; gallery.style.gridAutoFlow = ''; gallery.style.gridTemplateColumns = ''; gallery.style.gridTemplateRows = ''; gallery.setAttribute('data-wrapped', 'true'); } 
                            else { gallery.style.display = 'grid'; gallery.style.flexWrap = ''; gallery.style.justifyContent = ''; gallery.style.gridAutoFlow = 'column'; gallery.style.gridTemplateColumns = `minmax(var(--g-width), var(--g-width))`; gallery.style.gridTemplateRows = 'auto'; gallery.setAttribute('data-wrapped', 'false'); }
                        }
                    }
                    const isScrollable = gallery.scrollWidth > gallery.clientWidth + 5, isAtEnd = Math.ceil(gallery.scrollLeft + gallery.clientWidth) >= Math.floor(gallery.scrollWidth) - 10, isAtStart = gallery.scrollLeft <= 10;
                    hintRight.classList.toggle('visible', isScrollable && !isAtEnd); hintLeft.classList.toggle('visible', isScrollable && !isAtStart);
                };
                gallery.addEventListener('scroll', originalCheckScroll); new ResizeObserver(originalCheckScroll).observe(gallery); setTimeout(originalCheckScroll, 150);

                const scrollOneItem = (direction) => {
                    const figures = Array.from(gallery.querySelectorAll('figure')); if (figures.length === 0) return;
                    const containerCenter = gallery.getBoundingClientRect().left + gallery.clientWidth / 2;
                    let closestIndex = 0, minDistance = Infinity;
                    figures.forEach((figure, index) => { const distance = Math.abs(containerCenter - (figure.getBoundingClientRect().left + figure.offsetWidth / 2)); if (distance < minDistance) { minDistance = distance; closestIndex = index; } });
                    let targetIndex = Math.max(0, Math.min(closestIndex + direction, figures.length - 1)), scrollAmount = (figures[targetIndex].getBoundingClientRect().left + figures[targetIndex].offsetWidth / 2) - containerCenter;
                    const maxScrollLeft = gallery.scrollWidth - gallery.clientWidth;
                    if (direction > 0 && scrollAmount > maxScrollLeft - gallery.scrollLeft) scrollAmount = maxScrollLeft - gallery.scrollLeft;
                    else if (direction < 0 && Math.abs(scrollAmount) > gallery.scrollLeft) scrollAmount = -gallery.scrollLeft;
                    gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                };
                hintRight.addEventListener('click', () => scrollOneItem(1)); hintLeft.addEventListener('click', () => scrollOneItem(-1));
            });

            modalBody.querySelectorAll('figure').forEach(figure => {
                const figcaption = figure.querySelector('figcaption'); const img = figure.querySelector('img');
                const isGallery = figure.closest('.gallery') !== null;
                
                if (isGallery) {
                    if (figcaption) {
                        figure.style.cursor = 'pointer'; figure.addEventListener('click', () => figure.classList.toggle('hide-caption'));
                        if (img && !figcaption.querySelector('.zoom-btn')) {
                            const zoomBtn = document.createElement('button'); zoomBtn.className = 'zoom-btn'; zoomBtn.innerHTML = GLOBAL_SVGS.zoomIcon;
                            zoomBtn.onclick = (event) => { event.stopPropagation(); if(window.openLightbox) window.openLightbox(zoomBtn, event); };
                            figcaption.appendChild(zoomBtn);
                        }
                    }
                } else {
                    figure.classList.add('standalone-figure'); 
                    if (img) {
                        img.style.cursor = 'pointer';
                        img.addEventListener('click', (event) => { event.stopPropagation(); if(window.openLightbox) window.openLightbox(img, event); });
                        const existingBtn = figure.querySelector('.zoom-btn');
                        if (!existingBtn) {
                            const zoomBtn = document.createElement('button'); zoomBtn.setAttribute('data-tooltip', window.t('zoom_in')); zoomBtn.innerHTML = GLOBAL_SVGS.zoomIcon;
                            zoomBtn.onclick = (event) => { event.stopPropagation(); if(window.openLightbox) window.openLightbox(zoomBtn, event); };
                            if (figcaption) { zoomBtn.className = 'zoom-btn'; figcaption.appendChild(zoomBtn); } 
                            else { figure.classList.add('no-caption'); zoomBtn.className = 'zoom-btn floating'; figure.appendChild(zoomBtn); }
                        }
                    }
                }
            });
        },
        () => {
            const modalContainer = document.querySelector('.modal-content');
            if (!modalContainer) return;
            
            requestAnimationFrame(() => {
                if (targetHash) { if(window.executeAnchorScroll) { const success = window.executeAnchorScroll(targetHash, true); if (success) return; } } 
                if (isFromHistory) {
                    const doRestoreScroll = () => {
                        modalContainer.scrollTop = restoreScrollTop;
                        if (restoreInnerScrolls && restoreInnerScrolls.length > 0) {
                            const wrappers = modalBody.querySelectorAll('.vertical-wrapper');
                            wrappers.forEach((w, i) => { if (restoreInnerScrolls[i]) { w.scrollTop = restoreInnerScrolls[i].scrollTop; w.scrollLeft = restoreInnerScrolls[i].scrollLeft; } });
                        }
                    };
                    doRestoreScroll(); 
                    let trackers = []; trackers.push(setTimeout(doRestoreScroll, 300)); trackers.push(setTimeout(doRestoreScroll, 600)); trackers.push(setTimeout(doRestoreScroll, 1200));
                    const cancelTrackers = () => { trackers.forEach(clearTimeout); modalContainer.removeEventListener('wheel', cancelTrackers); modalContainer.removeEventListener('touchstart', cancelTrackers); };
                    modalContainer.addEventListener('wheel', cancelTrackers, { passive: true }); modalContainer.addEventListener('touchstart', cancelTrackers, { passive: true });
                } else { modalContainer.scrollTop = 0; }
            });
        },
        animateTopBar
    ); 
}

export function openMarkdownModal(markdownText) {
    modalBody.innerHTML = marked.parse(markdownText);
    modalOverlay.classList.add('active');
    if(window.lockScroll) window.lockScroll(); 
    document.querySelector('.modal-content').scrollTop = 0;
}

export function closeModal() {
    window.historyStack = []; 
    modalOverlay.classList.remove('active');
    setTimeout(() => { if(window.unlockScroll) window.unlockScroll(); }, 300); 
    const jumpToast = document.getElementById('new-jump-toast');
    if (jumpToast) jumpToast.classList.remove('is-visible');
    window.history.replaceState(null, '', window.location.pathname);
}

// 綁定關閉事件
if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if(modalOverlay) {
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    modalOverlay.addEventListener('touchmove', (e) => { if (e.target === modalOverlay) e.preventDefault(); }, { passive: false });
}

export function show404Modal(title, message) {
    const tocMountPoint = document.getElementById('toc-mount-point');
    const modalTopLeft = document.getElementById('modal-top-left');
    if (modalTopLeft) modalTopLeft.innerHTML = `<span style="color: var(--muted); font-weight: 600; font-family: monospace; letter-spacing: 0.05em;">${window.t('system_error_label')}</span>`;
    if (tocMountPoint) tocMountPoint.innerHTML = '';

    const is403 = title.includes('403');
    const iconSvg = is403 ? GLOBAL_SVGS.errorLock.replace('<svg ', '<svg class="sys-error-icon" ') : GLOBAL_SVGS.errorAlert.replace('<svg ', '<svg class="sys-error-icon" ');

    modalBody.innerHTML = `
        <div class="sys-error-layout">
            ${iconSvg}
            <h1>${title}</h1>
            <p class="sys-error-desc">${message}</p>
            <button class="btn sys-error-btn" onclick="window.closeModal()">
                ${GLOBAL_SVGS.arrowLeft} ${window.t('back_to_home')}
            </button>
        </div>`;

    modalOverlay.classList.add('active');
    if(window.lockScroll) window.lockScroll();

    const trigger = modalBody.querySelector('.secret-admin-trigger');
    if (trigger) {
        const lockIcon = modalBody.querySelector('.error-lock-icon'); const shackle = modalBody.querySelector('.error-lock-shackle');
        trigger.addEventListener('mouseenter', () => {
            if (lockIcon) { lockIcon.style.stroke = 'var(--error-color)'; lockIcon.style.opacity = '1'; lockIcon.style.filter = 'drop-shadow(0 0 15px var(--error-color))'; }
            if (shackle) { shackle.style.transform = 'translateY(-10px) translateX(4px) rotate(15deg)'; }
        });
        trigger.addEventListener('mouseleave', () => {
            if (lockIcon) { lockIcon.style.stroke = 'var(--muted)'; lockIcon.style.opacity = '0.5'; lockIcon.style.filter = 'none'; }
            if (shackle) { shackle.style.transform = 'none'; }
        });
        trigger.addEventListener('click', () => {
            document.body.classList.add('system-override-active');
            if(window.refreshUIAfterOverrideToggle) window.refreshUIAfterOverrideToggle();
            const urlParams = new URLSearchParams(window.location.search);
            const pParam = urlParams.get('p'), aParam = urlParams.get('a'), hashParam = window.location.hash || null;
            if (pParam && window.handleAppRouting) { window.handleAppRouting(pParam, aParam, hashParam); } 
            else { closeModal(); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }
        });
    }
}

// ==========================================
// ✨ 特殊彈窗 (權限、版權、日誌、PDF)
// ==========================================
window._hasAgreedSensitiveContent = false;
export function showSensitiveAgreementModal(onAgreeCallback, onDeclineCallback) {
    if (window._hasAgreedSensitiveContent === true) { if (onAgreeCallback) onAgreeCallback(); return; }

    const overlay = document.createElement('div');
    overlay.id = 'sensitive-modal-overlay'; overlay.className = 'modal-overlay active'; overlay.style.zIndex = '1100'; overlay.style.cursor = 'pointer';
    
    const declineAction = () => {
        document.removeEventListener('keydown', escListener); overlay.remove();
        if(window.unlockScroll) window.unlockScroll();
        if (onDeclineCallback) { onDeclineCallback(); } else { window.history.replaceState(null, '', window.location.pathname); }
    };

    const escListener = (e) => { if (e.key === 'Escape') { e.preventDefault(); declineAction(); } };
    document.addEventListener('keydown', escListener);

    overlay.innerHTML = `
        <div class="modal-content sensitive-modal-content">
            <button id="sensitive-close-x" class="sensitive-close-btn">${GLOBAL_SVGS.closeX}</button>
            ${GLOBAL_SVGS.warning}
            <h2 class="sensitive-title">${window.t('cw_title')}</h2>
            <p class="sensitive-desc">${window.t('cw_desc')}<br><span class="sensitive-desc-hint">${window.t('cw_desc_hint')}</span></p>
            <div class="sensitive-actions">
                <button id="sensitive-decline-btn" class="btn">${window.t('cw_decline')}</button>
                <button id="sensitive-agree-btn" class="btn">${window.t('cw_agree')}</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    if(window.lockScroll) window.lockScroll();

    document.getElementById('sensitive-decline-btn').onclick = declineAction;
    document.getElementById('sensitive-close-x').onclick = declineAction;
    overlay.onclick = (e) => { if (e.target === overlay) declineAction(); };

    document.getElementById('sensitive-agree-btn').onclick = () => {
        document.removeEventListener('keydown', escListener); window._hasAgreedSensitiveContent = true;
        overlay.remove(); if (onAgreeCallback) onAgreeCallback();
    };
}

window.cachedCreditsText = null;
export async function showCreditsModal() {
    document.body.style.cursor = 'wait'; let mdText = window.t('load_failed'); let isError = false;
    try {
        if (window.cachedCreditsText !== null) { mdText = window.cachedCreditsText; } 
        else { mdText = await window.fetchLocaleText('credits.md', true); window.cachedCreditsText = mdText; }
    } catch (error) { console.error("Credits 讀取失敗:", error); isError = true; } finally { document.body.style.cursor = ''; }

    switchModalContent(
        () => {
            const tocMountPoint = document.getElementById('toc-mount-point'), modalTopLeft = document.getElementById('modal-top-left');
            if (tocMountPoint) tocMountPoint.innerHTML = '';
            if (modalTopLeft) modalTopLeft.innerHTML = `<div class="index-header-container"><h1 class="index-header-title">${window.t('credits')}</h1><div class="index-header-actions"><span class="article-count-badge">${window.t('acknowledgments_badge')}</span></div></div>`;

            if (isError) { modalBody.innerHTML = window.getSystemErrorHtml(window.t('system_error_label'), window.t('credits_failed')); } 
            else { modalBody.innerHTML = `<div class="credits-markdown-wrapper markdown-body" style="margin-top: -0.5rem;">${marked.parse(mdText)}</div>`; }
            
            const modalContainer = document.querySelector('.modal-content'), topBar = document.querySelector('.modal-top-bar');
            if (modalContainer && topBar && window.initProgressBar) window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');

            modalOverlay.classList.add('active'); if(window.lockScroll) window.lockScroll();
        },
        () => document.querySelector('.modal-content').scrollTop = 0
    );
}

window.cachedLicenseText = null;
export async function showLicenseModal() {
    document.body.style.cursor = 'wait'; let mdText = window.t('load_failed'); let isError = false;
    try {
        if (window.cachedLicenseText !== null) { mdText = window.cachedLicenseText; } 
        else {
            const response = await fetch(`./COPYRIGHT.md?v=${window.getResVersion('COPYRIGHT.md')}`);
            if (!response.ok) throw new Error(window.t('license_not_found'));
            mdText = await response.text(); window.cachedLicenseText = mdText;
        }
    } catch (error) { console.error("版權檔案載入失敗:", error); isError = true; } finally { document.body.style.cursor = ''; }

    switchModalContent(
        () => {
            const tocMountPoint = document.getElementById('toc-mount-point'), modalTopLeft = document.getElementById('modal-top-left');
            if (tocMountPoint) tocMountPoint.innerHTML = '';
            if (modalTopLeft) modalTopLeft.innerHTML = `<div class="index-header-container"><h1 class="index-header-title">${window.t('license_title')}</h1><div class="index-header-actions"><span class="article-count-badge">${window.t('important_badge')}</span></div></div>`;

            if (isError) { modalBody.innerHTML = window.getSystemErrorHtml(window.t('system_error_label'), window.t('license_failed')); } 
            else { modalBody.innerHTML = `<div class="markdown-body" style="margin-top: -0.5rem; padding-bottom: 2rem;">${marked.parse(mdText)}</div>`; }

            const switcher = modalBody.querySelector('#bilingual-switcher');
            if (switcher) {
                const current = window.CURRENT_LANG || 'zh';
                switcher.innerHTML = `<div class="lang-tabs"><button class="lang-btn ${current === 'zh' ? 'active' : ''}" onclick="window.switchBilingualTab('zh', this)">中文版</button><button class="lang-btn ${current === 'en' ? 'active' : ''}" onclick="window.switchBilingualTab('en', this)">English</button><button class="lang-btn ${current === 'ja' ? 'active' : ''}" onclick="window.switchBilingualTab('ja', this)">日本語</button></div>`;
                const activeBtn = switcher.querySelector('.lang-btn.active'); if (activeBtn && window.switchBilingualTab) window.switchBilingualTab(current, activeBtn);
            }

            const modalContainer = document.querySelector('.modal-content'), topBar = document.querySelector('.modal-top-bar');
            if (modalContainer && topBar && window.initProgressBar) window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');

            modalOverlay.classList.add('active'); if(window.lockScroll) window.lockScroll();
        },
        () => document.querySelector('.modal-content').scrollTop = 0
    );
}

window.cachedChangelogs = null; 
export async function showChangelogModal(isSystemFallback = false) {
    document.body.style.cursor = 'wait'; let fetchError = false;
    try {
        if (!isSystemFallback) {
            const vRes = await fetch(`./version.json?t=${new Date().getTime()}`).catch(() => null);
            if (vRes && vRes.ok) {
                const vData = await vRes.json();
                if (vData.version && vData.version !== CONFIG.VERSION) {
                    sessionStorage.setItem('sys_intent', 'changelog'); sessionStorage.removeItem('sys_reboot_count');
                    document.body.insertAdjacentHTML('beforeend', `<div style="position:fixed; inset:0; background:var(--bg); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--accent); cursor: wait;"><div style="font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; letter-spacing: 0.1em; text-shadow: 0 0 10px var(--glow-1);">${window.t('manual_override')}</div><div style="font-family: 'Courier New', monospace; font-size: 0.9rem; color: var(--muted); margin-bottom: 2rem;">Local: ${CONFIG.VERSION} | Remote: ${vData.version}</div><div class="loading-text" style="font-size: 1.1rem;">${window.t('fetching_rebooting')}</div></div>`);
                    setTimeout(() => { const newUrl = new URL(window.location.href); newUrl.searchParams.set('v', new Date().getTime()); window.location.replace(newUrl.toString()); }, 1800);
                    return; 
                }
            }
        }
        if (window.cachedChangelogs === null) {
            const response = await fetch(`./changelogs.json?v=${window.getResVersion('changelogs.json')}`);
            if (!response.ok) throw new Error(window.t('changelog_not_found'));
            window.cachedChangelogs = await response.json();
        }
    } catch (error) { console.error("日誌讀取或更新檢查失敗:", error); fetchError = true; }
    document.body.style.cursor = '';

    function renderChangelogHeader(isDetail = false, logData = null) {
        const modalTopLeft = document.getElementById('modal-top-left'); if (!modalTopLeft) return;
        if (!isDetail) { modalTopLeft.innerHTML = `<div class="index-header-container"><h1 class="index-header-title">${window.t('changelog_title')}</h1><div class="index-header-actions"><span class="article-count-badge">${window.t('update_history')}</span></div></div>`; } 
        else {
            let badgeHTML = '';
            if (logData) { let activeStatus = logData.status === 'LATEST' ? 'NEW' : logData.status; badgeHTML = `<span class="status-badge" data-status="${activeStatus}">${logData.status}</span>`; }
            modalTopLeft.innerHTML = `<div class="changelog-header-row"><button class="modal-back-btn" onclick="window.renderChangelogIndex()">${GLOBAL_SVGS.arrowLeft} ${window.t('return_list')}</button><div style="display: flex; align-items: center; gap: 0.8rem;"><span class="changelog-version">${logData ? logData.version : ''}</span>${badgeHTML}<span class="changelog-date">${logData ? logData.date : ''}</span></div></div>`;
        }
    }

    window.renderChangelogIndex = function() {
        switchModalContent(
            () => {
                const tocMountPoint = document.getElementById('toc-mount-point'); if (tocMountPoint) tocMountPoint.innerHTML = '';
                const progressBar = document.getElementById('reading-progress-bar'); if (progressBar) progressBar.style.display = 'none';
                renderChangelogHeader(false);

                if (fetchError || !window.cachedChangelogs) { modalBody.innerHTML = window.getSystemErrorHtml(window.t('system_error_label'), window.t('changelog_failed')); } 
                else {
                    let listHTML = '<ul class="article-list-ul">';
                    window.cachedChangelogs.forEach(log => {
                        let activeStatus = log.status === 'LATEST' ? 'NEW' : log.status;
                        let badgeHTML = `<span class="status-badge title-badge" data-status="${activeStatus}">${log.status}</span>`;
                        listHTML += `<li class="article-li is-highlight changelog-list-item" data-status="${activeStatus}"><a href="javascript:void(0)" class="article-link" onclick="window.renderChangelogDetail('${log.id}')"><div class="article-item-icon-wrap"><div class="article-item-fallback changelog-item-icon">${GLOBAL_SVGS.docIconLg}</div></div><div class="article-item-content"><div class="article-item-title-row"><span class="article-item-title"><span class="changelog-item-version">${log.version}</span>${badgeHTML}</span><span class="article-item-desc">- ${log.description}</span></div><span class="article-item-date">${log.date}</span></div></a></li>`;
                    });
                    listHTML += '</ul>'; modalBody.innerHTML = listHTML;
                }
                modalOverlay.classList.add('active'); if(window.lockScroll) window.lockScroll();
            }, () => document.querySelector('.modal-content').scrollTop = 0
        );
    };

    window.renderChangelogDetail = function(logId) {
        const targetLog = window.cachedChangelogs.find(l => l.id === logId); if (!targetLog) return;
        switchModalContent(
            () => {
                renderChangelogHeader(true, targetLog);
                modalBody.innerHTML = `<div class="markdown-body" style="margin-top: -0.5rem;">${marked.parse(targetLog.content)}</div>`;
                const modalContainer = document.querySelector('.modal-content'), topBar = document.querySelector('.modal-top-bar');
                if (modalContainer && topBar && window.initProgressBar) window.initProgressBar(topBar, modalContainer, 'top', 'reading-progress-bar');
            }, () => document.querySelector('.modal-content').scrollTop = 0
        );
    };
    window.renderChangelogIndex();
}

export function showPdfActionModal(href, title) {
    const existing = document.getElementById('pdf-action-modal'); if (existing) existing.remove();
    const overlay = document.createElement('div'); overlay.id = 'pdf-action-modal';
    
    const closeModalSheet = () => {
        overlay.style.opacity = '0'; overlay.querySelector('.pdf-action-sheet').style.transform = 'translateY(100%)';
        setTimeout(() => {
            overlay.remove();
            const mdModal = document.getElementById('md-modal');
            if (!mdModal || !mdModal.classList.contains('active')) { if(window.unlockScroll) window.unlockScroll(); }
        }, 300);
    };

    const isPWA = window.isPWAEnvironment && window.isPWAEnvironment();
    const viewBtnText = isPWA ? window.t('view_pdf') : window.t('view_pdf_browser'), viewBtnIcon = isPWA ? GLOBAL_SVGS.download : GLOBAL_SVGS.newTab, downloadBtnDisplay = isPWA ? 'none' : 'flex';

    overlay.innerHTML = `<div class="pdf-action-sheet"><div class="pdf-drag-handle"></div><div class="pdf-sheet-title">${title}</div><div class="pdf-sheet-subtitle">PDF DOCUMENT</div><div class="pdf-btn-group"><button id="pdf-view-btn" class="pdf-action-btn primary"><span style="width: 20px; height: 20px; display: inline-flex; align-items: center;">${viewBtnIcon}</span>${viewBtnText}</button><button id="pdf-download-btn" class="pdf-action-btn secondary" style="display: ${downloadBtnDisplay};"><span style="width: 20px; height: 20px; display: inline-flex; align-items: center;">${GLOBAL_SVGS.download}</span>${window.t('download_pdf')}</button><button id="pdf-modal-close" class="pdf-action-btn cancel">${window.t('cancel')}</button></div></div>`;
    document.body.appendChild(overlay); if(window.lockScroll) window.lockScroll();
    setTimeout(() => { overlay.style.opacity = '1'; overlay.querySelector('.pdf-action-sheet').style.transform = 'translateY(0)'; }, 10);

    overlay.querySelector('#pdf-view-btn').onclick = () => {
        if (isPWA) { downloadPdfDirectly(href, title, true); } else { window.open(href, '_blank'); } closeModalSheet();
    };
    if (!isPWA) { overlay.querySelector('#pdf-download-btn').onclick = () => { downloadPdfDirectly(href, title, false); closeModalSheet(); }; }
    overlay.querySelector('#pdf-modal-close').onclick = closeModalSheet; overlay.onclick = (e) => { if (e.target === overlay) closeModalSheet(); };
}

export async function downloadPdfDirectly(url, filename, isNewTab = false) {
    if(window.triggerSecureDownload) window.triggerSecureDownload(url, filename, isNewTab);
}

// 橋接全域變數
window.switchModalContent = switchModalContent;
window.openProjectIndex = openProjectIndex;
window.openArticle = openArticle;
window.openMarkdownModal = openMarkdownModal;
window.closeModal = closeModal;
window.show404Modal = show404Modal;
window.showSensitiveAgreementModal = showSensitiveAgreementModal;
window.showCreditsModal = showCreditsModal;
window.showChangelogModal = showChangelogModal;
window.showLicenseModal = showLicenseModal;
window.showPdfActionModal = showPdfActionModal;
window.downloadPdfDirectly = downloadPdfDirectly;
import { CONFIG, STATUS_LIST } from '../config.js';
import { compareVersions } from '../utils.js';

// ==========================================
// ✨ 獨立檔案快取與載入系統
// ==========================================
export async function fetchLocaleText(fileName, isDocument = false) {
    let lang = window.CURRENT_LANG;
    let url = `./locales/${lang}/${fileName}?v=${window.getResVersion('locales_' + lang)}`;
    let res = await fetch(url);

    if (!res.ok && lang !== 'zh') {
        url = `./locales/zh/${fileName}?v=${window.getResVersion('locales_zh')}`;
        res = await fetch(url);
    }

    if (!res.ok) throw new Error(window.t('load_failed'));
    return await res.text();
}

window.cachedKotobaList = null;
export async function getKotobaList() {
    if (window.cachedKotobaList !== null) return window.cachedKotobaList;
    try {
        const text = await fetchLocaleText('kotoba.md', false);
        window.cachedKotobaList = text.split('---').map(n => n.trim()).filter(n => n.length > 0);
    } catch (err) { window.cachedKotobaList = []; }
    return window.cachedKotobaList;
}

window.cachedMermaidStyles = null;
export async function getMermaidStyles() {
    if (window.cachedMermaidStyles !== null) return window.cachedMermaidStyles;
    try {
        const res = await fetch(`./mermaid_styles.txt?v=${CONFIG.VERSION}`);
        if (res.ok) { window.cachedMermaidStyles = await res.text(); } 
        else { window.cachedMermaidStyles = ''; }
    } catch (err) { window.cachedMermaidStyles = ''; }
    return window.cachedMermaidStyles;
}

window.cachedQuotesList = null;
export async function getQuotesList() {
    if (window.cachedQuotesList !== null) return window.cachedQuotesList;
    try {
        const text = await fetchLocaleText('quotes.md', false);
        window.cachedQuotesList = text.split('---').map(n => n.trim()).filter(n => n.length > 0);
    } catch (err) { window.cachedQuotesList = []; }
    return window.cachedQuotesList;
}

// ==========================================
// ✨ 核心資料載入引擎 (專案與分類)
// ==========================================
export async function loadProjects() {
    const dynamicNav = document.getElementById('dynamic-nav');
    const portfolioSections = document.getElementById('portfolio-sections');
    const marquee = document.getElementById('marquee-text');

    try {
        const projVersion = window.getResVersion(`projects_${window.CURRENT_LANG}`);
        const response = await fetch(`${CONFIG.DATA_SOURCE}?v=${projVersion}`);
        const db = await response.json();
        
        const categories = db.categories;
        const projects = db.projects;

        const nowMs = new Date().getTime();
        const expireMs = CONFIG.TAG_EXPIRE_DAYS * 24 * 60 * 60 * 1000;
        
        const evaluateStatus = (val) => {
            if (val === true || String(val).toLowerCase() === 'true') return true; 
            if (typeof val === 'string' && /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(val)) {
                const tagDate = new Date(val.replace(/-/g, '/')).getTime();
                return !isNaN(tagDate) && (nowMs - tagDate <= expireMs);
            }
            return !!val; 
        };

        const evaluateHidden = (val) => {
            if (val === true || String(val).toLowerCase() === 'true') return true; 
            if (typeof val === 'string' && /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(val)) {
                const unsealDate = new Date(val.replace(/-/g, '/')).getTime();
                return !isNaN(unsealDate) && (nowMs < unsealDate);
            }
            return !!val; 
        };

        const parseAndFilterTags = (tags) => {
            if (!tags) return [];
            let validTags = [];
            tags.forEach(tag => {
                const match = tag.match(/^(NEW|UPDATED|LATEST|FEATURE):(\d{4}[-/]\d{2}[-/]\d{2})$/i);
                if (match) {
                    const baseTag = match[1].toUpperCase();
                    const tagDate = new Date(match[2].replace(/-/g, '/')).getTime();
                    if (!isNaN(tagDate) && (nowMs - tagDate <= expireMs)) validTags.push(baseTag);
                } else {
                    validTags.push(tag); 
                }
            });
            return validTags;
        };

        const flatStatusList = STATUS_LIST.flat(); 
        projects.forEach(p => {
            ['is_new', 'is_updated', 'is_wip', 'is_archived', 'pinned'].forEach(k => { if (p[k] !== undefined) p[k] = evaluateStatus(p[k]); });
            if (p.is_hidden !== undefined) p.is_hidden = evaluateHidden(p.is_hidden);
            p.tags = parseAndFilterTags(p.tags);

            let isAllUpdated = p.is_updated, isPublicUpdated = p.is_updated;
            if (p.articles && p.articles.length > 0) {
                p.articles.forEach(art => {
                    ['is_new', 'is_updated', 'is_wip', 'is_archived', 'pinned'].forEach(k => { if (art[k] !== undefined) art[k] = evaluateStatus(art[k]); });
                    if (art.is_hidden !== undefined) art.is_hidden = evaluateHidden(art.is_hidden);
                    art.tags = parseAndFilterTags(art.tags);
                });
                if (!p.is_new) {
                    p.articles.forEach(art => {
                        const hasUpdate = art.is_new || art.is_updated || (art.tags && (art.tags.includes('NEW') || art.tags.includes('UPDATED') || art.tags.includes('LATEST')));
                        if (hasUpdate) { isAllUpdated = true; if (!art.is_hidden) isPublicUpdated = true; }
                    });
                }
            }
            p.computed_is_updated = isAllUpdated;

            let allActiveStates = new Set(), publicActiveStates = new Set();
            flatStatusList.forEach(status => {
                const boolKey = `is_${status.toLowerCase()}`;
                if (p[boolKey] === true || p.tags.includes(status)) { allActiveStates.add(status); publicActiveStates.add(status); }
                if (status !== 'NEW' && p.articles) {
                    p.articles.forEach(art => {
                        if (art[boolKey] === true || (art.tags && art.tags.includes(status))) {
                            allActiveStates.add(status); if (!art.is_hidden) publicActiveStates.add(status);
                        }
                    });
                }
                if (status === 'UPDATED') {
                    if (isAllUpdated) allActiveStates.add('UPDATED'); if (isPublicUpdated) publicActiveStates.add('UPDATED');
                }
            });

            p.tags = p.tags.filter(t => !flatStatusList.includes(t));
            p.secret_tags = []; 

            [...STATUS_LIST].reverse().forEach(group => {
                const winningStatus = group.find(status => allActiveStates.has(status));
                if (winningStatus) {
                    p.tags.unshift(winningStatus);
                    if (!publicActiveStates.has(winningStatus)) p.secret_tags.push(winningStatus);
                }
            });
        });

        window.siteProjects = projects;

        if (marquee) {
            const publicTags = projects.filter(p => !p.is_hidden).flatMap(p => p.tags.filter(t => !(p.secret_tags && p.secret_tags.includes(t))) || []);
            const allTags = projects.flatMap(p => p.tags || []);
            const uniqueTags = [...new Set(allTags)].sort(() => Math.random() - 0.5);
            
            const kotobaList = await getKotobaList(); 
            if (kotobaList.length > 0) {
                const randomKotoba = kotobaList[Math.floor(Math.random() * kotobaList.length)];
                const insertIndex = Math.floor(Math.random() * (uniqueTags.length || 1));
                const inlineKotoba = randomKotoba.replace(/\n/g, ' ').replace(/> /g, '').trim();
                uniqueTags.splice(insertIndex, 0, `KOTOBA_NO_BOX:『${inlineKotoba}』`);
            }

            if (uniqueTags.length > 0) {
                const stockContent = uniqueTags.map((tag, i) => {
                    let innerHtml = '', isSecret = false; 

                    if (tag.startsWith('KOTOBA_NO_BOX:')) {
                        innerHtml = `<span class="kotoba-whisper" onclick="window.centerKotobaTag(event)">${tag.replace('KOTOBA_NO_BOX:', '')}</span>`;
                    } else {
                        isSecret = !publicTags.includes(tag);
                        const isUp = i % 2 !== 0, change = (Math.random() * 3 + 0.1).toFixed(2), arrow = isUp ? '▲' : '▼', colorClass = isUp ? 'stock-up' : 'stock-down', sign = isUp ? '+' : '-';
                        const statusAttr = STATUS_LIST.flat().includes(tag) ? `data-status="${tag}"` : '';
                        innerHtml = `<span class="clickable-ticker-tag" data-tag="${tag}" ${statusAttr} onclick="window.filterByTag('${tag}', event)"><span class="ticker-name">${tag}</span> <span class="${colorClass}">${arrow} ${sign}${change}%</span></span>`;
                    }
                    
                const wrapperClass = isSecret ? 'marquee-tag-wrapper sys-hidden-ticker' : 'marquee-tag-wrapper';
                return `<span class="${wrapperClass}" style="display: inline-flex; align-items: center;">${innerHtml}<span style="color: var(--muted); opacity: 0.5; margin: 0 10rem;">|</span></span>`;
                }).join(''); 

                const container = marquee.parentElement;
                container.innerHTML = `<div class="marquee-content">${stockContent}</div><div class="marquee-content">${stockContent}</div>`;
                container.onclick = (e) => { if ((window.currentActiveTag || window.isKotobaActive) && !e.target.closest('.clickable-ticker-tag') && !e.target.closest('.kotoba-whisper')) if(window.clearFilter) window.clearFilter(); };
                container.onmouseenter = () => document.querySelectorAll('.marquee-content').forEach(m => { if (m.marqueePlayer) m.marqueePlayer.pause(); });
                container.onmouseleave = () => document.querySelectorAll('.marquee-content').forEach(m => { if (m.marqueePlayer) m.marqueePlayer.play(); });
            }
        }

        dynamicNav.innerHTML = ''; portfolioSections.innerHTML = '';

        categories.forEach(cat => {
            const menuDescHtml = cat.meta ? `<span class="nav-item-desc">${cat.meta}</span>` : '';
            dynamicNav.innerHTML += `<li style="margin: 2.5rem 0;"><a href="#${cat.id}-section" class="nav-item" style="margin:0; line-height:1.1; display:inline-block;">${cat.title}</a>${menuDescHtml}</li>`;

            const sectionMetaHtml = cat.meta ? `<span class="section-meta">- ${cat.meta}</span>` : '';
            const sectionDescHtml = cat.description ? `<p class="section-desc">${cat.description}</p>` : '';
            const sectionImageHtml = cat.cover_image ? `<img src="${cat.cover_image}" alt="icon" loading="lazy" class="section-icon is-loading" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">` : '';
            const watermarkStyle = cat.watermark_url ? ` style="--custom-watermark: url('${cat.watermark_url}');"` : '';

            portfolioSections.innerHTML += `
            <section id="${cat.id}-section"${watermarkStyle}>
                <div class="section-header-layout"><div class="section-header-left"><h2>${cat.title}${sectionMetaHtml}</h2>${sectionDescHtml}</div>${sectionImageHtml}</div>
                <div class="scroll-wrapper"><div class="scroll-hint hint-left" id="${cat.id}-hint-left"></div><div class="grid" id="${cat.id}-grid"></div><div class="scroll-hint hint-right" id="${cat.id}-hint-right"></div></div>
            </section>`;
        });

        projects.forEach(data => {
            const targetGrid = document.getElementById(`${data.category}-grid`); 
            if (targetGrid) {
                const card = document.createElement('div'); card.className = 'card';
                if (data.is_hidden) card.classList.add('sys-hidden-card');
                card.setAttribute('data-tags', (data.tags || []).join(','));
                
                const flatList = STATUS_LIST.flat(); 
                let tagsHTML = (data.tags || []).map(tag => {
                    const isSecretTag = data.secret_tags && data.secret_tags.includes(tag);
                    const secretClass = isSecretTag ? ' sys-hidden-tag' : '';
                    const statusAttr = flatList.includes(tag) ? ` data-status="${tag}" class="tag status-tag${secretClass}"` : ` class="tag${secretClass}"`;
                    return `<span${statusAttr} data-tag="${tag}" onclick="window.filterByTag('${tag}', event, this)">${tag}</span>`;
                }).join('');
                
                let actionText = '';
                if (data.articles && data.articles.length > 0) {
                    card.style.cursor = 'pointer';
                    card.onclick = () => { if (window.currentActiveTag) window.clearFilter(); if(window.openProjectIndex) window.openProjectIndex(data.id); };
                    const visibleCount = data.articles.filter(art => !art.is_hidden).length;
                    actionText = `<div class="card-action-btn"><div class="card-action-icon-wrap">${window.GLOBAL_SVGS.folderClosed}${window.GLOBAL_SVGS.folderOpen}</div>${window.t('expand_series')} (${visibleCount})</div>`; 
                } else if (data.link) {
                    card.style.cursor = 'pointer';
                    card.onclick = () => { 
                        if (window.currentActiveTag) window.clearFilter(); 
                        const a = document.createElement('a'); a.href = data.link; a.target = '_blank'; a.rel = 'noopener noreferrer'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    };
                    actionText = `<div class="card-action-btn">${window.GLOBAL_SVGS.linkLg} ${window.t('external_project')} <span class="action-arrow card-action-arrow" data-dir="up-right">${window.GLOBAL_SVGS.arrowUpRight}</span></div>`;
                } else {
                    card.onclick = () => { if (window.currentActiveTag) window.clearFilter(); };
                    card.addEventListener('mouseenter', () => { card.style.cursor = window.currentActiveTag ? 'pointer' : 'default'; });
                }

                const cardMetaHtml = data.meta ? `<span class="card-meta-text">- ${data.meta}</span>` : '';
                const cardDescHtml = data.description ? `<p class="card-desc-text">${data.description}</p>` : '';
                const cardImageHtml = data.cover_image ? `<img src="${data.cover_image}" alt="cover" loading="lazy" class="card-thumb-img is-loading" onload="this.classList.remove('is-loading')" onerror="if(window.handleImageError) window.handleImageError(this)">` : '';                
                const absolutePinHtml = data.pinned ? `<div class="card-pin">${window.GLOBAL_SVGS.pin}</div>` : '';
                const absoluteSecretHtml = data.is_hidden ? `<div class="card-secret-pin">${window.GLOBAL_SVGS.secretPin}</div>` : '';

                let metaParts = [];
                if (data.date) metaParts.push(data.date); if (data.version) metaParts.push(`v${data.version}`); 
                const cardDateHtml = metaParts.length > 0 ? `<div class="card-date-badge">[${metaParts.join(' • ')}]</div>` : '';

                card.innerHTML = `${absolutePinHtml}${absoluteSecretHtml}${cardDateHtml} <div class="card-content-wrapper"><div class="card-text"><h3 style="margin-top: 0; margin-bottom: 0.4rem;">${data.title} ${cardMetaHtml}</h3>${cardDescHtml}</div>${cardImageHtml ? `<div class="card-image">${cardImageHtml}</div>` : ''}</div><div class="tags-container">${tagsHTML}</div>${actionText}`;
                targetGrid.appendChild(card);
            }
        });

        categories.forEach(cat => {
            const grid = document.getElementById(`${cat.id}-grid`), hintRight = document.getElementById(`${cat.id}-hint-right`), hintLeft = document.getElementById(`${cat.id}-hint-left`); 
            if (grid && hintRight && hintLeft) {
                if(window.initScrollHints) window.initScrollHints(grid, hintLeft, hintRight);
                
                hintRight.addEventListener('click', () => {
                    const cards = Array.from(grid.querySelectorAll('.card')).filter(card => card.offsetWidth > 0); if (!cards.length) return;
                    const containerCenter = grid.getBoundingClientRect().left + grid.clientWidth / 2;
                    let targetCard = null;
                    for (const card of cards) { const cardCenter = card.getBoundingClientRect().left + card.clientWidth / 2; if (cardCenter > containerCenter + 20) { targetCard = card; break; } }
                    if (targetCard) targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                });

                hintLeft.addEventListener('click', () => {
                    const cards = Array.from(grid.querySelectorAll('.card')).filter(card => card.offsetWidth > 0); if (!cards.length) return;
                    const containerCenter = grid.getBoundingClientRect().left + grid.clientWidth / 2;
                    let targetCard = null;
                    for (let i = cards.length - 1; i >= 0; i--) { const card = cards[i]; const cardCenter = card.getBoundingClientRect().left + card.clientWidth / 2; if (cardCenter < containerCenter - 20) { targetCard = card; break; } }
                    if (targetCard) targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                });
            }
            if (grid && grid.children.length === 0) document.getElementById(`${cat.id}-section`).style.display = 'none';
        });

        const cardObserver = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('show'); observer.unobserve(entry.target); } }); }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 });
        document.querySelectorAll('.card').forEach(card => cardObserver.observe(card));

        const urlParams = new URLSearchParams(window.location.search);
        setTimeout(() => { if(window.handleAppRouting) window.handleAppRouting(urlParams.get('p'), urlParams.get('a'), window.location.hash || null); }, 300);

    } catch (err) {
        console.error("載入失敗:", err);
        const isOffline = !navigator.onLine || (err.message && err.message.includes('Failed to fetch'));
        const errorTitle = isOffline ? window.t('err_offline_title') : window.t('err_fetch_title'), errorDetail = err.message ? err.message.toUpperCase() : window.t('err_unknown'), errorSub = isOffline ? window.t('err_offline_sub') : `${window.t('sys_dump')} ${errorDetail}`;
        
        portfolioSections.innerHTML = `<div class="error-container" style="flex-direction: column; gap: 0.8rem;"><span class="error-text" onclick="this.style.opacity='0.5'; this.innerHTML='${window.t('rebooting')}'; window.location.reload();">${window.GLOBAL_SVGS.retry} ${errorTitle}</span><span style="font-family: 'Courier New', monospace; font-size: 0.8rem; color: var(--muted); opacity: 0.6; letter-spacing: 0.05em;">${errorSub}</span></div>`;
        
        if (window.hideSystemRebootScreen) window.hideSystemRebootScreen(false);
        if (marquee) { const marqueeMsg = isOffline ? window.t('marquee_net_offline') : window.t('marquee_sys_offline'); marquee.innerHTML = `<span>${marqueeMsg}</span>`.repeat(6); marquee.style.color = "var(--error-color)"; }
    }
}

// ==========================================
// ✨ 系統重開機遮罩引擎
// ==========================================
export function showSystemRebootScreen(title, localV, remoteV, msg, immediate = false) {
    document.body.style.overflow = 'hidden'; 
    let screen = document.getElementById('sys-reboot-screen');
    
    if (!screen) {
        screen = document.createElement('div'); screen.id = 'sys-reboot-screen'; screen.style.opacity = immediate ? '1' : '0';
        document.body.appendChild(screen);
        if (!immediate) setTimeout(() => { screen.style.opacity = '1'; }, 10);
    }
    screen.innerHTML = `<div class="reboot-title">>_ ${title}</div><div class="reboot-version">Local: ${localV} | Remote: ${remoteV}</div><div class="loading-text">${msg}</div>`;
}

export function hideSystemRebootScreen(isSuccess = true) {
    const screen = document.getElementById('sys-reboot-screen');
    if (!screen) {
        document.documentElement.classList.remove('sys-rebooting');
        if (!document.querySelector('.modal-overlay.active')) document.body.style.overflow = '';
        return;
    }

    const titleEl = screen.querySelector('.reboot-title'); const msgEl = screen.querySelector('.loading-text');
    
    if (isSuccess) {
        if (titleEl) { titleEl.innerText = window.t('sys_online'); titleEl.style.color = 'var(--accent-2)'; titleEl.style.textShadow = '0 0 10px var(--accent-2)'; }
        if (msgEl) { msgEl.innerText = window.t('update_success'); msgEl.style.color = 'var(--accent-2)'; msgEl.style.animation = 'none'; }
    } else {
        if (titleEl) { titleEl.innerText = window.t('sys_reverted'); titleEl.style.color = 'var(--muted)'; titleEl.style.textShadow = 'none'; }
        if (msgEl) { msgEl.innerText = window.t('cdn_delay'); msgEl.style.color = 'var(--muted)'; msgEl.style.animation = 'none'; }
    }

    setTimeout(() => {
        document.documentElement.classList.remove('sys-rebooting');
        if (!document.querySelector('.modal-overlay.active')) document.body.style.overflow = '';
        screen.style.transition = 'opacity 0.5s ease'; screen.style.opacity = '0';
        setTimeout(() => { screen.remove(); }, 500);
    }, 600);
}

export async function checkSystemVersionAndBoot() {
    const isRebooting = sessionStorage.getItem('sys_is_rebooting') === 'true';
    const expectedVersion = sessionStorage.getItem('sys_expected_version') || 'UNKNOWN';
    const sysIntent = sessionStorage.getItem('sys_intent');

    if (isRebooting) showSystemRebootScreen(window.t('sys_rebooting'), CONFIG.VERSION, expectedVersion, window.t('verifying_modules'), true);

    try {
        const [sysRes, dataRes] = await Promise.all([
            fetch(`./version.json?t=${new Date().getTime()}`).catch(() => null),
            fetch(`./data_version.json?t=${new Date().getTime()}`).catch(() => null)
        ]);

        const sysData = sysRes && sysRes.ok ? await sysRes.json() : null;
        const contentData = dataRes && dataRes.ok ? await dataRes.json() : null;

        let needReboot = false, rebootReason = '', remoteVersion = CONFIG.VERSION;

        if (sysData && sysData.version && sysData.version !== CONFIG.VERSION) {
            needReboot = true; rebootReason = window.t('sys_updating'); remoteVersion = sysData.version;
            console.warn(`[SYS_UPDATE] 發現系統新版本 ${remoteVersion}，準備強制更新...`);
        } else if (contentData && contentData.projects) {
            const localDataVersions = JSON.parse(localStorage.getItem('sys_data_versions') || '{}');
            if (localDataVersions.projects && localDataVersions.projects !== contentData.projects) {
                needReboot = true; rebootReason = window.t('syncing_new_data');
                console.info(`[DATA_UPDATE] 發現文章內容修改，準備同步資料庫...`);
            }
            localStorage.setItem('sys_data_versions', JSON.stringify(contentData));
        }

        if (needReboot) {
            const rebootCount = parseInt(sessionStorage.getItem('sys_reboot_count') || '0');
            if (rebootCount >= 2) {
                console.error("[SYS_UPDATE] 自動更新/同步失敗，已強制啟動緩存版本。");
                sessionStorage.removeItem('sys_reboot_count'); sessionStorage.removeItem('sys_is_rebooting'); sessionStorage.removeItem('sys_expected_version'); sessionStorage.removeItem('sys_intent'); 
                hideSystemRebootScreen(false); loadProjects(); 
                if (sysIntent === 'changelog') setTimeout(() => { if (window.showChangelogModal) window.showChangelogModal(true); }, 600); 
                setTimeout(() => { if(window.showSystemToast) window.showSystemToast(window.t('update_failed'), window.t('cdn_delay_detected'), window.t('reverted_safe_state'), 12000, 'error'); }, 1000);
                return;
            }
            
            sessionStorage.setItem('sys_reboot_count', (rebootCount + 1).toString()); sessionStorage.setItem('sys_is_rebooting', 'true'); sessionStorage.setItem('sys_expected_version', remoteVersion);
            const screenTitle = rebootReason === window.t('sys_updating') ? 'SYS_VERSION_MISMATCH' : 'CONTENT_SYNC_REQUIRED';
            showSystemRebootScreen(screenTitle, CONFIG.VERSION, remoteVersion, rebootReason, isRebooting);
            
            setTimeout(() => { const newUrl = new URL(window.location.href); newUrl.searchParams.set('v', new Date().getTime()); window.location.replace(newUrl.toString()); }, 1800);
            return; 
        } else {
            if (isRebooting && expectedVersion !== 'UNKNOWN' && compareVersions(CONFIG.VERSION, expectedVersion) < 0) {
                console.error("[SYS_UPDATE] 強制升級失敗，CDN 仍快取舊版 JS。");
                sessionStorage.removeItem('sys_reboot_count'); sessionStorage.removeItem('sys_is_rebooting'); sessionStorage.removeItem('sys_expected_version');
                hideSystemRebootScreen(false); loadProjects();
                setTimeout(() => { if(window.showSystemToast) window.showSystemToast(window.t('update_failed'), window.t('cdn_delay_detected'), window.t('update_failed_core', [expectedVersion]), 12000, 'error'); }, 1000);
                return; 
            }
            sessionStorage.removeItem('sys_reboot_count'); sessionStorage.removeItem('sys_is_rebooting'); sessionStorage.removeItem('sys_expected_version');
            if (sysIntent === 'changelog') setTimeout(() => { if (window.showChangelogModal) window.showChangelogModal(true); }, 600);
            sessionStorage.removeItem('sys_intent'); 
        }
    } catch (err) {
        console.warn("系統檢查程序中斷:", err);
        sessionStorage.removeItem('sys_is_rebooting'); sessionStorage.removeItem('sys_intent'); 
    }
    
    hideSystemRebootScreen(true); loadProjects();
}

// 橋接全域
window.fetchLocaleText = fetchLocaleText;
window.getKotobaList = getKotobaList;
window.getMermaidStyles = getMermaidStyles;
window.getQuotesList = getQuotesList;
window.loadProjects = loadProjects;
window.showSystemRebootScreen = showSystemRebootScreen;
window.hideSystemRebootScreen = hideSystemRebootScreen;

// 初始化檢查
window.addEventListener('DOMContentLoaded', () => {
    checkSystemVersionAndBoot();
    getMermaidStyles(); 
});
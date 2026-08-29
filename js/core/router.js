// ==========================================
// ✨ 網址路由與歷史紀錄引擎 (Router & History Engine)
// ==========================================
export function getCleanBasePath() {
    const basePath = window.location.pathname.replace(/index(_local)?\.html$/i, '');
    return basePath.endsWith('/') ? basePath : basePath + '/';
}

export function handleAppRouting(pParam, aParam, hashParam = null) {
    if (!pParam) return;
    
    const cleanProjectId = pParam.replace(/^\d+_/, '');
    const project = window.siteProjects.find(proj => proj.id === cleanProjectId);
    
    const error403Msg = `${window.t('err_403_desc')}<br/><span class="err-sec-protocol">ERR_SEC_PROTOCOL: Unauthorized request blocked by <span class="secret-admin-trigger">${window.t('author_name')}</span>.</span>`;
    
    if (!project) {
        if(window.show404Modal) window.show404Modal(window.t('err_404_proj_title'), window.t('err_404_proj_desc'));
        window.history.replaceState(null, '', window.location.pathname);
        return;
    }

    if (project.is_hidden && !document.body.classList.contains('system-override-active')) {
        if(window.show404Modal) window.show404Modal(window.t('err_403_title'), error403Msg);
        return;
    }

    if (aParam !== null && aParam !== undefined) {
        let aIndex = project.articles.findIndex(art => art.id === aParam);
        if (aIndex === -1 && !isNaN(parseInt(aParam))) aIndex = parseInt(aParam, 10);
        
        if (aIndex !== -1 && aIndex < project.articles.length) {
            const article = project.articles[aIndex];
            if (article.is_hidden && !document.body.classList.contains('system-override-active')) {
                if(window.show404Modal) window.show404Modal(window.t('err_403_title'), error403Msg);
                return;
            }
            if(window.openArticle) window.openArticle(project.id, aIndex, false, 0, hashParam);
        } else {
            if(window.show404Modal) window.show404Modal(window.t('err_404_art_title'), window.t('err_404_art_desc', [project.title]));
            window.history.replaceState(null, '', window.location.pathname);
        }
    } else {
        if(window.openProjectIndex) window.openProjectIndex(project.id); 
    }
}

export function handleSpaLink(event, url) {
    event.preventDefault(); 
    const cleanUrl = url.replace(/&amp;/g, '&');
    const queryString = cleanUrl.includes('?') ? cleanUrl.split('?')[1].split('#')[0] : '';
    const hashPart = cleanUrl.includes('#') ? cleanUrl.split('#')[1] : null;
    
    const urlParams = new URLSearchParams(queryString);
    window.handleAppRouting(urlParams.get('p'), urlParams.get('a'), hashPart ? '#' + hashPart : null);
}

export function goBackInHistory() {
    if (!window.historyStack || window.historyStack.length <= 1) return;
    window.historyStack.pop(); 
    const prev = window.historyStack[window.historyStack.length - 1]; 
    if(window.openArticle) window.openArticle(prev.projectId, prev.articleIndex, true, prev.scrollTop || 0, null, prev.innerScrolls || []); 
}

window.getCleanBasePath = getCleanBasePath;
window.handleAppRouting = handleAppRouting;
window.handleSpaLink = handleSpaLink;
window.goBackInHistory = goBackInHistory;

// 綁定網址列動態監聽
window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pParam = urlParams.get('p');
    const aParam = urlParams.get('a');
    const hashParam = window.location.hash || null;

    const modalOverlay = document.getElementById('md-modal');
    const isArticleOpen = modalOverlay && modalOverlay.classList.contains('active');

    if (pParam) {
        window.handleAppRouting(pParam, aParam, hashParam);
    } else if (isArticleOpen && window.closeModal) {
        window.closeModal();
    }
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash) {
        const modalOverlay = document.getElementById('md-modal');
        if (modalOverlay && modalOverlay.classList.contains('active')) {
            setTimeout(() => {
                if (window.executeAnchorScroll) window.executeAnchorScroll(hash, true, true);
            }, 10);
        }
    }
});
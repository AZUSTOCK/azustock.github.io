import { GLOBAL_SVGS } from '../config.js';

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
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

    const isContentImage = (img.closest('.markdown-body') !== null || img.id === 'lightbox-img') && !img.classList.contains('article-item-cover') && !img.classList.contains('card-image');
    if (!isContentImage) {
        img.style.cursor = 'default';
        return; 
    }

    img.removeAttribute('title'); 
    img.style.cursor = 'pointer';

    let retryHint = img.parentNode.querySelector('.img-retry-hint');
    if (!retryHint) {
        retryHint = document.createElement('div');
        retryHint.className = 'img-retry-hint';
        retryHint.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg> ${window.t('click_to_retry')}`;
        
        if (window.getComputedStyle(img.parentNode).position === 'static') img.parentNode.style.position = 'relative';
        img.parentNode.insertBefore(retryHint, img.nextSibling);
    }

    const retryHandler = function(e) {
        e.preventDefault(); e.stopImmediatePropagation();
        img.removeEventListener('click', retryHandler, true);
        
        if (retryHint) {
            retryHint.style.transition = 'transform 0.15s var(--ease-bounce), opacity 0.15s ease';
            retryHint.style.transform = 'translate(-50%, -50%) scale(0.85)';
            retryHint.style.opacity = '0';
        }
        
        setTimeout(() => {
            delete img.dataset.isBroken; img.classList.remove('is-broken'); img.classList.add('is-loading'); img.style.cursor = '';
            if (retryHint) retryHint.remove();
            img.onerror = function() { window.handleImageError(this); };
            const origSrc = img.dataset.retrySrc;
            const sep = origSrc.includes('?') ? '&' : '?';
            img.src = origSrc + sep + 'retry=' + new Date().getTime();
        }, 150);
    };
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
    const origSrc = sourceEl.src;
    const ext = sourceEl.type.split('/')[1] || (isVideo ? 'mp4' : 'mp3');
    const aspectStyle = isVideo ? "aspect-ratio: 16/9; min-height: 200px;" : "padding: 1rem 0;";
    
    if (mediaTag) {
        mediaTag.outerHTML = `
            <div class="media-error-fallback" style="${aspectStyle}" onclick="window.retryMedia(this, '${origSrc}', '${ext}', ${isVideo})">
                <svg class="media-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                <div class="media-error-title">${window.t('media_not_found')}</div>
                <div class="retry-text">${GLOBAL_SVGS.retry} ${window.t('click_to_retry_block')}</div>
            </div>`;
    }
};

window.retryMedia = function(btnEl, origSrc, ext, isVideo) {
    const wrapper = btnEl.closest('.media-container-wrapper'); if (!wrapper) return;
    delete wrapper.dataset.isBroken;
    const sep = origSrc.includes('?') ? '&' : '?';
    const retrySrc = origSrc + sep + 'retry=' + new Date().getTime();
    
    const mediaTag = isVideo 
        ? `<video preload="metadata" controls playsinline class="md-video"><source src="${retrySrc}" type="video/${ext}" onerror="window.handleMediaError(this)">${window.t('browser_no_video') || '不支援影片標籤'}</video>`
        : `<audio preload="metadata" controls class="md-audio"><source src="${retrySrc}" type="audio/${ext}" onerror="window.handleMediaError(this)">${window.t('browser_no_audio') || '不支援音樂標籤'}</audio>`;
    btnEl.outerHTML = mediaTag;
};

// ==========================================
// ✨ Mermaid CSS 變數轉譯引擎
// ==========================================
window.processMermaidCssVars = function(text) {
    let processed = text.replace(/[\u00A0\u3000]/g, ' ');
    processed = processed.replace(/var\((--[^,)]+)(?:,[^)]+)?\)/g, (match, varName) => {
        let val = getComputedStyle(document.documentElement).getPropertyValue(varName.trim()).trim(); return val || match;
    });
    processed = processed.replace(/rgba?\(([^)]+)\)/g, (match, inner) => {
        let parts = inner.split(',').map(s => s.trim());
        if (parts.length >= 3) {
            let r = parseInt(parts[0]), g = parseInt(parts[1]), b = parseInt(parts[2]), a = parts.length >= 4 ? parseFloat(parts[3]) : 1;
            let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
            if (a < 1) hex += Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
            return hex;
        }
        return match;
    });
    return processed;
};

// ==========================================
// ✨ Markdown 輔助渲染函數 (PDF / Media)
// ==========================================
function renderPDFIframe(href, altText) {
    let customHeight = "600px"; const hMatch = href.match(/[?&]h=(\d+)/i); if (hMatch) customHeight = hMatch[1] + "px";
    const mobileClickHandler = `event.stopPropagation(); window.showPdfActionModal('${href}', '${altText || "Document.pdf"}');`;
    return `
    <div class="pdf-container" onclick="if(document.body.classList.contains('is-touch-device')) { ${mobileClickHandler} }">
        <div class="pdf-container-header" onclick="event.stopPropagation();">
            <div class="pdf-container-title">${GLOBAL_SVGS.docIcon}<span style="transform: translateY(1px);">${altText || 'Document.pdf'}</span></div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="mermaid-btn" data-tooltip="${window.t('refresh')}" onclick="event.stopPropagation(); const ifr = this.closest('.pdf-container').querySelector('iframe'); const orig = ifr.src; ifr.src=''; setTimeout(() => ifr.src = orig, 100);">${GLOBAL_SVGS.mermaidReload}</button>
                <div class="action-btn-divider desktop-only"></div>
                <button class="mermaid-btn desktop-only" data-tooltip="${window.t('open_new_tab')}" onclick="event.stopPropagation(); window.open('${href}', '_blank');">${GLOBAL_SVGS.newTab}</button>
            </div>
        </div>
        <iframe class="pdf-iframe" src="${href}" width="100%" height="${customHeight}" style="border: none; display: block; background: var(--bg);"></iframe>
        <div class="pdf-mobile-placeholder"><span style="font-size: 1.05rem; letter-spacing: 0.05em;">${window.t('pdf_hint')}</span><span class="pdf-mobile-btn">${GLOBAL_SVGS.newTab} ${window.t('open_pdf_menu')}</span></div>
    </div>`;
}

function renderMediaTag(cleanMediaUrl, ext, isVideo, posterUrl, altText, imgTitle) {
    const displayTitle = altText || imgTitle || (isVideo ? window.t('video_player') : window.t('audio_player'));
    const iconSvg = isVideo ? GLOBAL_SVGS.videoIcon : GLOBAL_SVGS.audioIcon;
    const posterAttr = (isVideo && posterUrl) ? ` poster="${posterUrl}"` : '';
    const mediaTag = isVideo 
        ? `<video preload="metadata" controls playsinline${posterAttr} class="md-video"><source src="${cleanMediaUrl}" type="video/${ext}" onerror="window.handleMediaError(this)">${window.t('browser_no_video')}</video>`
        : `<audio preload="metadata" controls class="md-audio"><source src="${cleanMediaUrl}" type="audio/${ext}" onerror="window.handleMediaError(this)">${window.t('browser_no_audio')}</audio>`;
    const reloadScript = `event.stopPropagation(); const media = this.closest('.media-container-wrapper').querySelector('.md-video, .md-audio'); const source = media.querySelector('source'); const orig = source.src.split('?retry=')[0].split('&retry=')[0]; const sep = orig.includes('?') ? '&' : '?'; source.src = orig + sep + 'retry=' + new Date().getTime(); media.load();`;
    const actionBtns = `<div style="display: flex; gap: 0.5rem; align-items: center;"><button class="mermaid-btn" data-tooltip="${window.t('refresh')}" onclick="${reloadScript}">${GLOBAL_SVGS.mermaidReload}</button>${isVideo ? `<div style="width: 1px; height: 16px; background: var(--card-border); margin: 0 2px; align-self: center;"></div><button class="mermaid-btn" data-tooltip="${window.t('fullscreen')}" onclick="window.toggleWebFullscreen(this.closest('.media-container-wrapper').querySelector('video'))">${GLOBAL_SVGS.mermaidFull}</button>` : ''}</div>`;
    return `<div class="media-container-wrapper"><div class="media-container-header" onclick="event.stopPropagation();"><div class="media-container-title">${iconSvg}<span style="transform: translateY(1px);">${displayTitle}</span></div>${actionBtns}</div>${mediaTag}</div>`;
}

// ==========================================
// ✨ 初始化 Marked 渲染引擎
// ==========================================
const renderer = new marked.Renderer();

renderer.image = function(token_or_href, title, text) {
    const href = typeof token_or_href === 'object' ? token_or_href.href : token_or_href, altText = typeof token_or_href === 'object' ? token_or_href.text : text, imgTitle = typeof token_or_href === 'object' ? token_or_href.title : title; 
    if (!href) return '';

    const cleanUrlForCheck = href.split('?')[0].split('#')[0];
    if (cleanUrlForCheck.match(/\.pdf$/i)) return renderPDFIframe(href, altText);

    const decodedHref = href.replace(/%23/g, '#');
    let cleanMediaUrl = decodedHref, posterUrl = '';
    if (decodedHref.includes('#poster=')) { const parts = decodedHref.split('#poster='); cleanMediaUrl = parts[0]; posterUrl = parts[1]; }
    
    const pureUrlForExt = cleanMediaUrl.split('?')[0], isVideo = pureUrlForExt.match(/\.(mp4|webm|ogg)$/i), isAudio = pureUrlForExt.match(/\.(mp3|wav)$/i);
    if (isVideo || isAudio) { const ext = pureUrlForExt.split('.').pop().toLowerCase(); return renderMediaTag(cleanMediaUrl, ext, isVideo, posterUrl, altText, imgTitle); }

    let srcUrl = href, fullUrl = href;
    if (href.includes('#full=')) { const parts = href.split('#full='); srcUrl = parts[0]; fullUrl = parts[1]; }

    const imgTag = `<img src="${srcUrl}" data-full="${fullUrl}" alt="${altText || ''}" class="is-loading" loading="lazy" onload="this.classList.remove('is-loading')" onerror="window.handleImageError(this)">`;
    const zoomBtnHtml = `<button class="zoom-btn" data-tooltip="${window.t('zoom_in')}" onclick="window.openLightbox(this, event)">${GLOBAL_SVGS.zoomIcon}</button>`;
    const floatingZoomBtnHtml = `<button class="zoom-btn floating" data-tooltip="${window.t('zoom_in')}" onclick="window.openLightbox(this, event)">${GLOBAL_SVGS.zoomIcon}</button>`;

    if (imgTitle) {
        let figureClass = (altText === 'float-right' || altText === 'float-left') ? ` class="${altText}"` : '';
        return `<figure${figureClass}>${imgTag}<figcaption>${imgTitle}${zoomBtnHtml}</figcaption></figure>`;
    } else {
        if (altText === 'icon' || altText === 'badge') return imgTag;
        let figureClass = 'no-caption' + ((altText === 'float-right' || altText === 'float-left') ? ` ${altText}` : '');
        return `<figure class="${figureClass}">${imgTag}${floatingZoomBtnHtml}</figure>`;
    }
};

renderer.code = function(token_or_code, language, isEscaped) {
    const lang = typeof token_or_code === 'object' ? token_or_code.lang : language;
    let rawText = typeof token_or_code === 'object' ? token_or_code.text : token_or_code;

    if (lang && lang.startsWith('mermaid')) {
        const globalMermaidClasses = window.cachedMermaidStyles || '';
        if (globalMermaidClasses) rawText = rawText.replace(/^(graph\s+[A-Za-z]+|flowchart\s+[A-Za-z]+)/im, `$1\n${globalMermaidClasses}\n`);
        const encodedText = encodeURIComponent(rawText), processedText = window.processMermaidCssVars(rawText);

        let chartTitle = window.t('flowchart');
        const fullLang = typeof token_or_code === 'object' ? (token_or_code.lang || language) : (language || '');
        const titleMatch = fullLang.match(/\[(.*?)\]/);
        if (titleMatch && titleMatch[1]) chartTitle = titleMatch[1];
        else if (window._lastMarkdownHeadings && window._lastMarkdownHeadings.length > 0) chartTitle = window._lastMarkdownHeadings[window._lastMarkdownHeadings.length - 1];

        return `<div class="mermaid-container" data-zoom="1" data-x="0" data-y="0"><div class="mermaid-toolbar" onclick="event.stopPropagation();"><span class="mermaid-title">${chartTitle}</span><div class="mermaid-btns"><button class="mermaid-btn" onclick="window.zoomMermaid(this, 'zoom-in')" data-tooltip="${window.t('zoom_in')}">${GLOBAL_SVGS.mermaidZoomIn}</button><button class="mermaid-btn" onclick="window.zoomMermaid(this, 'zoom-out')" data-tooltip="${window.t('zoom_out')}">${GLOBAL_SVGS.mermaidZoomOut}</button><button class="mermaid-btn" onclick="window.zoomMermaid(this, 'center')" data-tooltip="${window.t('center_view')}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2" /><path d="M12 2v3M2 12h3M22 12h-3M12 22v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg></button><button class="mermaid-btn" onclick="window.zoomMermaid(this, 'reset')" data-tooltip="${window.t('reset_view')}">${GLOBAL_SVGS.mermaidReset}</button><div class="action-btn-divider desktop-only"></div><button class="mermaid-btn" onclick="window.reloadMermaid(this)" data-tooltip="${window.t('refresh')}">${GLOBAL_SVGS.mermaidReload}</button><button class="mermaid-btn desktop-only" data-tooltip="${window.t('download')}" onclick="window.downloadMermaidPNG(this)">${GLOBAL_SVGS.download}</button><div style="width: 1px; height: 16px; background: var(--card-border); margin: 0 2px; align-self: center;"></div><button class="mermaid-btn" onclick="window.fullscreenMermaid(this)" data-tooltip="${window.t('view_image')}">${GLOBAL_SVGS.mermaidFull}</button></div></div><div class="mermaid-wrapper"><div class="mermaid" data-original-text="${encodedText}">${processedText}</div></div></div>`;
    }

    const fullLang = typeof token_or_code === 'object' ? (token_or_code.lang || language) : (language || '');
    let fileName = ''; const titleMatch = fullLang.match(/\[(.*?)\]/); if (titleMatch && titleMatch[1]) fileName = titleMatch[1].trim();
    
    const cleanLang = fullLang ? fullLang.split('[')[0].trim() : 'text'; 
    const escapedText = rawText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const labelContent = fileName ? `${cleanLang} <span style="opacity: 0.3; margin: 0 6px;">|</span> <span style="text-transform: none; color: var(--accent-2);">${fileName}</span>` : cleanLang;

    return `<div class="code-block-wrapper" style="position: relative;"><div class="code-lang-label" style="max-width: calc(100% - 100px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${fileName || cleanLang}">${labelContent}</div><button class="code-copy-btn" onclick="window.copyCodeBlock(this)"><span class="btn-state-wrapper"><span class="state-idle">${GLOBAL_SVGS.copy} <span class="copy-text">${window.t('copy_code')}</span></span><span class="state-success">${GLOBAL_SVGS.check} <span class="copy-text">${window.t('copied_exclaim')}</span></span></span></button><pre><code class="language-${cleanLang}">${escapedText}</code></pre></div>`;
};

window.copyCodeBlock = function(btn) {
    if (btn.classList.contains('copied')) return;
    const wrapper = btn.closest('.code-block-wrapper'); const codeEl = wrapper.querySelector('code'); if (!codeEl) return;
    navigator.clipboard.writeText(codeEl.innerText).then(() => { btn.classList.add('copied'); setTimeout(() => { btn.classList.remove('copied'); }, 2000); }).catch(err => console.error('程式碼複製失敗:', err));
};

renderer.link = function(token_or_href, title, text) {
    const href = typeof token_or_href === 'object' ? token_or_href.href : token_or_href, linkTitle = typeof token_or_href === 'object' ? token_or_href.title : title;
    let linkText = typeof token_or_href === 'object' ? (token_or_href.tokens ? this.parser.parseInline(token_or_href.tokens) : token_or_href.text) : text;

    if (linkTitle && linkTitle.toLowerCase().startsWith('btn')) return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="${linkTitle.toLowerCase()}" style="margin: 0.5rem 0.5rem 0.5rem 0; text-decoration: none; display: inline-flex;">${linkText}</a>`;

    const titleAttr = linkTitle ? ` title="${linkTitle}"` : '';
    if (!href) return `<a${titleAttr} style="font-weight: 600;">${linkText}</a>`;

    const isImageLink = linkText.includes('<img'), baseStyle = isImageLink ? 'display: inline-block; vertical-align: middle; transition: transform 0.2s ease;' : 'font-weight: 600;', hoverFx = isImageLink ? ' onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'none\'"' : '';

    if (href.includes('?p=') && !href.startsWith('http')) return `<a href="${href}" onclick="window.handleSpaLink(event, '${href.replace(/'/g, "\\'")}')"${titleAttr} style="${baseStyle}"${hoverFx}>${linkText}</a>`;
    if (href.startsWith('#')) return `<a href="${href}" onclick="window.scrollToAnchor(event, '${href.replace(/'/g, "\\'")}')"${titleAttr} style="${baseStyle}"${hoverFx}>${linkText}</a>`;
    if (href.startsWith('http')) return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr} style="${baseStyle}"${hoverFx}>${linkText}${isImageLink ? '' : GLOBAL_SVGS.extLinkSm}</a>`;
    return `<a href="${href}"${titleAttr} style="${baseStyle}"${hoverFx}>${linkText}</a>`;
};

window._lastMarkdownHeadings = [];
renderer.heading = function(token_or_text, level, raw) {
    let text = typeof token_or_text === 'object' ? token_or_text.text : token_or_text; const depth = typeof token_or_text === 'object' ? token_or_text.depth : level;
    let customId = null; const idMatch = text.match(/\s+\{#([^}]+)\}$/);
    if (idMatch) { customId = idMatch[1].trim(); text = text.replace(/\s+\{#[^}]+\}$/, '').trim(); }
    window._lastMarkdownHeadings.push(text.replace(/<[^>]+>/g, '')); 
    const id = customId || text.toLowerCase().replace(/\s+/g, '-').replace(/<[^>]+>/g, '');
    return `<h${depth} id="md-sys-${id}" data-raw-title="${encodeURIComponent(text)}">${text}</h${depth}>`;
};

// ==========================================
// ✨ Marked 擴充語法設定
// ==========================================
const spoilerExtension = {
    name: 'spoiler', level: 'inline', start(src) { return src.match(/\|\|/)?.index; }, 
    tokenizer(src) { const match = /^\|\|(.*?)\|\|/.exec(src); if (match) return { type: 'spoiler', raw: match[0], text: match[1], tokens: this.lexer.inlineTokens(match[1]) }; },
    renderer(token) { return `<span class="spoiler-text" onclick="event.stopPropagation(); this.classList.toggle('revealed')"><span class="spoiler-content">${this.parser.parseInline(token.tokens)}</span><span class="spoiler-cover"></span><span class="spoiler-fold-wrapper"><span class="spoiler-fold"></span></span></span>`; }
};

const highlightExtension = {
    name: 'updateHighlight', level: 'inline', start(src) { return src.match(/\+\+/)?.index; },
    tokenizer(src) { const match = /^\+\+(?:\[(.*?)\])?([\s\S]*?)\+\+/.exec(src); if (match) return { type: 'updateHighlight', raw: match[0], badgeText: match[1] || '', content: match[2], tokens: this.lexer.inlineTokens(match[2]) }; },
    renderer(token) {
        const badge = token.badgeText.trim(), statusAttr = badge ? ` data-status="${badge.toUpperCase()}"` : '', defaultStyle = badge ? '' : ' style="--dynamic-glow: var(--accent);"';
        const repeatedText = `${badge || 'HIGHLIGHT'} • `.repeat(20); const duration = Math.max(20, repeatedText.length * 0.4); 
        return `<span class="md-highlight-text"${statusAttr}${defaultStyle}><span class="marquee-text-track" style="--marquee-duration: ${duration}s;" aria-hidden="true"><span class="marquee-part">${repeatedText}</span><span class="marquee-part">${repeatedText}</span></span><span class="text-content">${this.parser.parseInline(token.tokens)}</span></span>`;
    }
};

const highlightBlockExtension = {
    name: 'highlightBlock', level: 'block', start(src) { return src.match(/^:::\s*highlight/)?.index; },
    tokenizer(src) { const match = /^:::\s*highlight(?:\[(.*?)\])?\n([\s\S]*?)\n:::/.exec(src); if (match) return { type: 'highlightBlock', raw: match[0], badgeText: match[1] || '', text: match[2], tokens: this.lexer.blockTokens(match[2]) }; },
    renderer(token) {
        const badge = token.badgeText.trim(), statusAttr = badge ? ` data-status="${badge.toUpperCase()}"` : '', defaultStyle = badge ? '' : ' style="--dynamic-glow: var(--accent);"';
        const repeatedText = `${badge || 'HIGHLIGHT'} • `.repeat(50); const duration = Math.max(20, repeatedText.length * 0.4); 
        return `<div class="md-highlight-text is-block"${statusAttr}${defaultStyle}><div class="marquee-text-track" style="--marquee-duration: ${duration}s;" aria-hidden="true"><span class="marquee-part">${repeatedText}</span><span class="marquee-part">${repeatedText}</span></div><div class="text-content">${this.parser.parse(token.tokens)}</div></div>`;
    }
};

const rubyExtension = {
    name: 'ruby', level: 'inline', start(src) { return src.match(/\^\^/)?.index; },
    tokenizer(src) { const match = /^\^\^([^()]+)\(([^()]+)\)\^\^/.exec(src); if (match) return { type: 'ruby', raw: match[0], kanji: match[1], furigana: match[2] }; },
    renderer(token) { return `<ruby>${token.kanji}<rt>${token.furigana}</rt></ruby>`; }
};

const detailsBlockExtension = {
    name: 'detailsBlock', level: 'block', start(src) { return src.match(/^:::\s*details/)?.index; },
    tokenizer(src) { const match = /^:::\s*details(?:\[(.*?)\])?\n([\s\S]*?)\n:::/.exec(src); if (match) return { type: 'detailsBlock', raw: match[0], summaryText: match[1] || '點擊展開查看', tokens: this.lexer.blockTokens(match[2]) }; },
    renderer(token) { return `<details class="md-details"><summary><svg class="details-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg><span style="flex-grow: 1;">${token.summaryText}</span></summary><div class="md-details-content">${this.parser.parse(token.tokens)}</div></details>`; }
};

marked.use({ extensions: [spoilerExtension, highlightExtension, highlightBlockExtension, rubyExtension, detailsBlockExtension], renderer: renderer, breaks: false, gfm: true });

// ==========================================
// ✨ 中文排版：全形空格縮排控制器
// ==========================================
window.applyIndentToVerticalWrapper = function(container) {
    if (!container || container.getAttribute('data-indent') === 'false') return;
    const indent = '\u3000\u3000';
    function traverse(node) {
        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                if (child.textContent.trim().length > 0 && !child.textContent.startsWith(indent)) { child.textContent = child.textContent.split('\n').map(line => line.trim() ? indent + line.trim() : line).join('\n'); }
            } else if (child.tagName !== 'BR' && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') { traverse(child); }
        });
    }
    traverse(container);
};
import { GLOBAL_SVGS } from '../config.js';

// ==========================================
// ✨ 全域大圖預覽 (Lightbox 2.0) 控制引擎
// ==========================================
window.lightboxState = { images: [], currentIndex: 0, zoom: 1, x: 0, y: 0, maxZoom: 1.5 };

window.openLightbox = function(btn, event) {
    event.stopPropagation();
    const container = btn.closest('figure'); if (!container) return;
    
    const targetImg = container.querySelector('img'), gallery = btn.closest('.gallery'), lightboxModal = document.getElementById('lightbox-modal'), lightboxImg = document.getElementById('lightbox-img');
    window.lightboxState = { images: [], currentIndex: 0, zoom: 1, x: 0, y: 0, maxZoom: 2 };

    if (gallery) {
        window.lightboxState.images = Array.from(gallery.querySelectorAll('figure')).map(fig => {
            const img = fig.querySelector('img');
            return { src: img?.getAttribute('data-full') || img?.src, caption: fig.querySelector('figcaption')?.innerText.replace('查看大圖', '').replace(window.t ? window.t('view_image') : '', '').trim() };
        }).filter(item => item.src);
        window.lightboxState.currentIndex = window.lightboxState.images.findIndex(item => item.src === (targetImg.getAttribute('data-full') || targetImg.src));
    } else {
        window.lightboxState.images = [{ src: targetImg?.getAttribute('data-full') || targetImg?.src, caption: container.querySelector('figcaption')?.innerText.replace('查看大圖', '').replace(window.t ? window.t('view_image') : '', '').trim() }];
    }

    if (lightboxImg && lightboxModal) {
        lightboxImg.style.transition = 'none'; lightboxModal.classList.add('is-active');
        if (window.adjustModalViewports) window.adjustModalViewports();
        window.updateLightboxView();
        setTimeout(() => { lightboxImg.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease'; }, 50);
    }
};

window.addEventListener('resize', () => {
    const lightboxModal = document.getElementById('lightbox-modal'), lightboxImg = document.getElementById('lightbox-img');
    if (lightboxModal && lightboxModal.classList.contains('is-active') && lightboxImg) {
        const naturalWidth = lightboxImg.naturalWidth, displayWidth = lightboxImg.clientWidth;
        if (displayWidth > 0 && naturalWidth > 0) window.lightboxState.maxZoom = (naturalWidth / displayWidth) * 1.5;
    }
});

window.updateLightboxView = function() {
    const state = window.lightboxState; if (state.images.length === 0) return;
    const currentItem = state.images[state.currentIndex], lightboxImg = document.getElementById('lightbox-img'), customDom = document.getElementById('lightbox-custom-dom');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop'), lightboxCaption = document.getElementById('lightbox-caption'), wrapper = document.querySelector('.lightbox-img-wrapper'); 
    
    const newTabBtn = document.querySelector('.toolbar-btn[onclick*="new-tab"]');
    if (newTabBtn) {
        newTabBtn.style.display = state.isDomMode ? 'none' : 'flex';
        const prevDivider = newTabBtn.previousElementSibling; if (prevDivider && prevDivider.classList.contains('toolbar-divider')) prevDivider.style.display = state.isDomMode ? 'none' : 'block';
    }

    if (state.isDomMode) {
        state.zoom = 1; state.x = 0; state.y = 0; 
        if (lightboxImg) lightboxImg.style.display = 'none'; if (customDom) customDom.style.display = 'flex';
        const target = document.getElementById('lightbox-active-mermaid'); if (target) target.style.transform = `translate(0px, 0px) scale(1)`;
        if (wrapper) wrapper.classList.remove('is-fetching'); if (lightboxBackdrop) lightboxBackdrop.src = '';
    } else {
        if (customDom) customDom.style.display = 'none';
        if (lightboxImg) {
            lightboxImg.style.display = 'block'; state.zoom = 1; state.x = 0; state.y = 0; lightboxImg.style.transform = `translate(0px, 0px) scale(1)`; 
            lightboxImg.classList.remove('is-broken'); delete lightboxImg.dataset.isBroken;
            const existingHint = wrapper.querySelector('.img-retry-hint'); if (existingHint) existingHint.remove();
            lightboxImg.style.opacity = '0'; if (wrapper) wrapper.classList.add('is-fetching');

            lightboxImg.onload = () => {
                if (wrapper) wrapper.classList.remove('is-fetching');
                lightboxImg.style.opacity = '1'; window.lightboxState.maxZoom = (lightboxImg.clientWidth > 0 && lightboxImg.naturalWidth > 0) ? (lightboxImg.naturalWidth / lightboxImg.clientWidth) * 1.5 : 2;
            };
            lightboxImg.onerror = () => { if (wrapper) wrapper.classList.remove('is-fetching'); lightboxImg.style.opacity = '1'; if (window.handleImageError) window.handleImageError(lightboxImg); };
            lightboxImg.src = currentItem.src;
            if (lightboxImg.complete && lightboxImg.naturalHeight > 0) lightboxImg.onload();
        }
        if (lightboxBackdrop) lightboxBackdrop.src = currentItem.src;
    }
    
    if (lightboxCaption) { lightboxCaption.innerText = currentItem.caption || ""; lightboxCaption.style.display = currentItem.caption ? "block" : "none"; }

    const navCapsule = document.getElementById('lightbox-nav-capsule'), counter = document.getElementById('lightbox-counter');
    const prevBtn = document.getElementById('lightbox-prev'), nextBtn = document.getElementById('lightbox-next');
    if (state.images.length > 1 && !state.isDomMode) {
        if (navCapsule) navCapsule.style.display = 'inline-flex'; if (counter) counter.innerText = `${state.currentIndex + 1} / ${state.images.length}`;
        if (prevBtn) prevBtn.classList.toggle('disabled', state.currentIndex === 0); if (nextBtn) nextBtn.classList.toggle('disabled', state.currentIndex === state.images.length - 1);
    } else { if (navCapsule) navCapsule.style.display = 'none'; }
};

window.navigateLightbox = function(direction, event) {
    if (event) event.stopPropagation();
    const state = window.lightboxState;
    if (direction === -1 && state.currentIndex > 0) { state.currentIndex--; window.updateLightboxView(); } 
    else if (direction === 1 && state.currentIndex < state.images.length - 1) { state.currentIndex++; window.updateLightboxView(); }
};

window.lightboxAction = function(action, event) {
    if (event) event.stopPropagation();
    const state = window.lightboxState, target = state.isDomMode ? document.getElementById('lightbox-active-mermaid') : document.getElementById('lightbox-img');
    if (!target) return;

    if (action === 'zoom-in') state.zoom = Math.min(state.zoom + 0.5, state.maxZoom); 
    else if (action === 'zoom-out') state.zoom = Math.max(state.zoom - 0.5, 0.5); 
    else if (action === 'reset' || action === 'center') { if(action === 'reset') state.zoom = 1; state.x = 0; state.y = 0; } 
    else if (action === 'reload') {
        if (state.isDomMode) {
            const activeMermaid = document.getElementById('lightbox-active-mermaid');
            if (activeMermaid && window.mermaid) {
                state.zoom = 1; state.x = 0; state.y = 0; activeMermaid.style.transform = 'translate(0px, 0px) scale(1)'; activeMermaid.style.opacity = '0.3'; 
                setTimeout(() => {
                    const originalText = decodeURIComponent(activeMermaid.getAttribute('data-original-text') || '');
                    if (originalText) { activeMermaid.removeAttribute('data-processed'); activeMermaid.innerHTML = window.processMermaidCssVars(originalText); window.mermaid.run({ querySelector: '#lightbox-active-mermaid' }).finally(() => { activeMermaid.style.opacity = '1'; }); } 
                    else { activeMermaid.style.opacity = '1'; }
                }, 150);
            }
            return;
        }
        const currentItem = state.images[state.currentIndex];
        const origSrc = currentItem.src.split('?retry=')[0].split('&retry=')[0];
        currentItem.src = origSrc + (origSrc.includes('?') ? '&' : '?') + 'retry=' + new Date().getTime();
        window.updateLightboxView(); return;
    } else if (action === 'new-tab') {
        if (state.isDomMode) return;
        if (window.isPWAEnvironment && window.isPWAEnvironment()) { if (window.triggerSecureDownload) window.triggerSecureDownload(target.src, 'image.webp', true); } 
        else { window.open(target.src, '_blank'); }
        return;
    }
    target.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
};

window.toggleLightboxTools = function(event) {
    if (event) event.stopPropagation();
    const toolbox = document.getElementById('lightbox-toolbox'), btn = event ? event.currentTarget : null;
    if (toolbox) { toolbox.classList.toggle('is-open'); if (btn) btn.classList.toggle('is-active'); }
};

window.closeLightbox = function() {
    const lightboxModal = document.getElementById('lightbox-modal'), toolbox = document.getElementById('lightbox-toolbox'), toggleBtn = document.querySelector('.toolbox-toggle-btn');
    if (lightboxModal) {
        lightboxModal.classList.remove('is-active'); if (toolbox) toolbox.classList.remove('is-open'); if (toggleBtn) toggleBtn.classList.remove('is-active'); 
        setTimeout(() => {
            const lightboxImg = document.getElementById('lightbox-img');
            if (lightboxImg) { lightboxImg.onerror = null; lightboxImg.removeAttribute('src'); lightboxImg.classList.remove('is-broken'); delete lightboxImg.dataset.isBroken; }
            const backdrop = document.getElementById('lightbox-backdrop'); if (backdrop) backdrop.removeAttribute('src');
            const caption = document.getElementById('lightbox-caption'); if (caption) caption.innerText = "";
            const customDom = document.getElementById('lightbox-custom-dom'); if (customDom) customDom.innerHTML = "";
            window.lightboxState.isDomMode = false;
        }, 300);
    }
    if (document.activeElement) document.activeElement.blur();
};

window.downloadLightboxImage = async function() {
    const img = document.getElementById('lightbox-img'); if (!img || !img.src) return;
    const url = img.src, fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0] || 'download_image.jpg';
    if (window.triggerSecureDownload) window.triggerSecureDownload(url, fileName);
};

window.handleLightboxDownload = function(btn) {
    if (window.lightboxState && window.lightboxState.isDomMode) { if (window.downloadMermaidPNG) window.downloadMermaidPNG(btn); } 
    else { window.downloadLightboxImage(); }
};

window.adjustModalViewports = function() {
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight, vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    document.documentElement.style.setProperty('--vv-height', vh + 'px'); document.documentElement.style.setProperty('--vv-width', vw + 'px');
};

window.handleOrientationChange = function() {
    window.adjustModalViewports(); setTimeout(window.adjustModalViewports, 100); setTimeout(window.adjustModalViewports, 300); setTimeout(window.adjustModalViewports, 600); 
};

document.addEventListener('DOMContentLoaded', () => {
    window.adjustModalViewports();
    window.addEventListener('resize', () => window.requestAnimationFrame(window.adjustModalViewports));
    window.addEventListener('orientationchange', window.handleOrientationChange);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', window.adjustModalViewports);

    const checkMobileLayout = () => {
        const isTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)), isNarrowScreen = window.innerWidth < 700;
        if (isTouch || isNarrowScreen) {
            document.body.classList.add('is-touch-device'); const toggleBtn = document.querySelector('.toolbox-toggle-btn');
            if (toggleBtn && !toggleBtn.dataset.iconInjected) { toggleBtn.innerHTML = GLOBAL_SVGS.meatballMenu; toggleBtn.dataset.iconInjected = 'true'; }
        } else {
            document.body.classList.remove('is-touch-device'); const toolbox = document.getElementById('lightbox-toolbox'), toggleBtn = document.querySelector('.toolbox-toggle-btn');
            if (toolbox) toolbox.classList.remove('is-open'); if (toggleBtn) toggleBtn.classList.remove('is-active');
        }
    };
    checkMobileLayout(); window.addEventListener('resize', () => window.requestAnimationFrame(checkMobileLayout));
    if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) document.addEventListener('touchstart', function() {}, {passive: true});

    const wrapper = document.querySelector('.lightbox-img-wrapper');
    let isDragging = false, startClientX = 0, startClientY = 0, activePointers = [], initialPinchDistance = null, initialZoom = 1;

    if (wrapper) {
        const getActiveTarget = () => window.lightboxState.isDomMode ? document.getElementById('lightbox-active-mermaid') : document.getElementById('lightbox-img');
        const updateTransform = () => { const target = getActiveTarget(); if (target) target.style.transform = `translate(${window.lightboxState.x}px, ${window.lightboxState.y}px) scale(${window.lightboxState.zoom})`; };

        wrapper.addEventListener('dragstart', (e) => { if (e.target.tagName === 'IMG') e.preventDefault(); });
        const onPointerMove = (e) => {
            const index = activePointers.findIndex(p => p.id === e.pointerId); if (index !== -1) { activePointers[index].x = e.clientX; activePointers[index].y = e.clientY; }
            if (activePointers.length === 1 && isDragging) {
                e.preventDefault(); window.lightboxState.x = activePointers[0].x - startClientX; window.lightboxState.y = activePointers[0].y - startClientY; requestAnimationFrame(updateTransform);
            } else if (activePointers.length === 2) {
                e.preventDefault(); const currentDistance = Math.hypot(activePointers[0].x - activePointers[1].x, activePointers[0].y - activePointers[1].y);
                if (initialPinchDistance) {
                    let newZoom = initialZoom * (currentDistance / initialPinchDistance); newZoom = Math.max(1, Math.min(newZoom, window.lightboxState.maxZoom)); 
                    const centerX = (activePointers[0].x + activePointers[1].x) / 2, centerY = (activePointers[0].y + activePointers[1].y) / 2, ratio = newZoom / window.lightboxState.zoom - 1;
                    window.lightboxState.x -= (centerX - (window.innerWidth / 2) - window.lightboxState.x) * ratio; window.lightboxState.y -= (centerY - (window.innerHeight / 2) - window.lightboxState.y) * ratio; window.lightboxState.zoom = newZoom; requestAnimationFrame(updateTransform);
                }
            }
        };

        const onPointerUp = (e) => {
            activePointers = activePointers.filter(p => p.id !== e.pointerId); if (activePointers.length < 2) initialPinchDistance = null; 
            if (activePointers.length === 1) { isDragging = true; startClientX = activePointers[0].x - window.lightboxState.x; startClientY = activePointers[0].y - window.lightboxState.y; } 
            else if (activePointers.length === 0) { isDragging = false; wrapper.classList.remove('is-dragging'); if (wrapper.hasPointerCapture && wrapper.hasPointerCapture(e.pointerId)) wrapper.releasePointerCapture(e.pointerId); window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp); window.removeEventListener('pointercancel', onPointerUp); }
        };

        wrapper.addEventListener('pointerdown', (e) => {
            const target = getActiveTarget(); if (!target || (!target.contains(e.target) && e.target !== target)) return;
            if (e.target.tagName === 'IMG' && e.target.classList.contains('is-broken')) return;
            if ((e.target.tagName === 'IMG' && !e.target.classList.contains('is-broken')) || e.target.closest('svg')) e.preventDefault(); 

            activePointers.push({ id: e.pointerId, x: e.clientX, y: e.clientY });
            if (activePointers.length === 1) {
                isDragging = true; wrapper.classList.add('is-dragging'); if (wrapper.setPointerCapture) wrapper.setPointerCapture(e.pointerId);
                startClientX = e.clientX - window.lightboxState.x; startClientY = e.clientY - window.lightboxState.y;
                window.addEventListener('pointermove', onPointerMove); window.addEventListener('pointerup', onPointerUp); window.addEventListener('pointercancel', onPointerUp);
            } else if (activePointers.length === 2) { isDragging = false; initialPinchDistance = Math.hypot(activePointers[0].x - activePointers[1].x, activePointers[0].y - activePointers[1].y); initialZoom = window.lightboxState.zoom; }
        });
        
        wrapper.addEventListener('wheel', (e) => {
            if (!document.getElementById('lightbox-modal').classList.contains('is-active')) return;
            e.preventDefault(); const target = getActiveTarget(); if(!target) return;
            const state = window.lightboxState, delta = e.deltaY < 0 ? 1 : -1;
            let newZoom = Math.max(1, Math.min(state.zoom * (1 + delta * 0.15), state.maxZoom));
            const ratio = newZoom / state.zoom - 1, centerX = window.innerWidth / 2, centerY = window.innerHeight / 2;
            state.x -= (e.clientX - centerX - state.x) * ratio; state.y -= (e.clientY - centerY - state.y) * ratio; state.zoom = newZoom; target.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
        }, { passive: false });
    }
});
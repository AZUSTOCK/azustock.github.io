import { CONFIG, GLOBAL_SVGS } from '../config.js';

// ==========================================
// ✨ 動態非同步引入 Mermaid 引擎 (ESM 模組)
// ==========================================
window.mermaid = null;
import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs').then(m => {
    window.mermaid = m.default;
    const currentTheme = document.documentElement.getAttribute('data-theme') || CONFIG.DEFAULT_THEME;
    window.mermaid.initialize({
        startOnLoad: false,
        theme: currentTheme === 'dark' ? 'dark' : 'default',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
        securityLevel: 'loose'
    });
}).catch(err => console.error("Mermaid 引擎載入失敗:", err));

export function zoomMermaid(btn, action) {
    const container = btn.closest('.mermaid-container');
    const mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;

    let zoom = parseFloat(container.dataset.zoom) || 1;
    let x = parseFloat(container.dataset.x) || 0;
    let y = parseFloat(container.dataset.y) || 0;

    if (action === 'reset') { zoom = 1; x = 0; y = 0; } 
    else if (action === 'center') { x = 0; y = 0; } 
    else if (action === 'zoom-in') { zoom = Math.min(zoom + 0.5, 3); } 
    else if (action === 'zoom-out') { zoom = Math.max(0.5, zoom - 0.5); }

    container.dataset.zoom = zoom; container.dataset.x = x; container.dataset.y = y;
    mermaidDiv.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
}

export function reloadMermaid(btn) {
    const container = btn.closest('.mermaid-container');
    const mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;

    container.dataset.zoom = 1; container.dataset.x = 0; container.dataset.y = 0;
    mermaidDiv.style.opacity = '0.3';
    
    setTimeout(() => {
        const originalText = decodeURIComponent(mermaidDiv.getAttribute('data-original-text') || '');
        if (originalText) {
            mermaidDiv.removeAttribute('data-processed');
            // 注意：processMermaidCssVars 仍依賴 window 呼叫
            mermaidDiv.innerHTML = window.processMermaidCssVars(originalText);
            mermaidDiv.style.transform = 'translate(0px, 0px) scale(1)';
            
            if (window.mermaid) {
                window.mermaid.run({ querySelector: '.mermaid' })
                    .catch(e => console.warn('Mermaid reload failed:', e))
                    .finally(() => { mermaidDiv.style.opacity = '1'; window.initMermaidDrag(); });
            }
        } else {
            mermaidDiv.style.opacity = '1';
        }
    }, 150);
}

export function fullscreenMermaid(btn) {
    const container = btn.closest('.mermaid-container');
    const mermaidDiv = container.querySelector('.mermaid');
    const titleNode = container.querySelector('.mermaid-title');
    if (!mermaidDiv) return;

    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxWrapper = document.querySelector('.lightbox-img-wrapper');
    
    let customContainer = document.getElementById('lightbox-custom-dom');
    if (!customContainer) {
        customContainer = document.createElement('div');
        customContainer.id = 'lightbox-custom-dom';
        customContainer.style.cssText = 'display: none; position: absolute; inset: 0; width: 100%; height: 100%; align-items: center; justify-content: center; pointer-events: none;';
        lightboxWrapper.appendChild(customContainer);
    }

    const clonedMermaid = mermaidDiv.cloneNode(true);
    clonedMermaid.id = 'lightbox-active-mermaid';
    clonedMermaid.style.transform = 'translate(0px, 0px) scale(1)';
    clonedMermaid.style.pointerEvents = 'auto'; 
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    clonedMermaid.style.backgroundColor = currentTheme === 'dark' ? 'var(--bg)' : 'var(--card)';
    clonedMermaid.style.padding = '20px';
    clonedMermaid.style.borderRadius = '12px';
    clonedMermaid.style.boxShadow = '0 10px 40px var(--shadow-base)';
    clonedMermaid.style.maxHeight = '90vh';
    clonedMermaid.style.maxWidth = '90vw';
    
    customContainer.innerHTML = '';
    customContainer.appendChild(clonedMermaid);

    window.lightboxState = { 
        images: [{ src: '', caption: titleNode ? titleNode.innerText : window.t('flowchart') }], 
        currentIndex: 0, zoom: 1, x: 0, y: 0, maxZoom: 5, isDomMode: true
    };

    lightboxModal.classList.add('is-active');
    if(window.updateLightboxView) window.updateLightboxView();
}

export function initMermaidDrag() {
    document.querySelectorAll('.mermaid-container').forEach(container => {
        if (container.dataset.engineInit) return;
        container.dataset.engineInit = 'true';

        const wrapper = container.querySelector('.mermaid-wrapper');
        const mermaidDiv = container.querySelector('.mermaid');
        if (!wrapper || !mermaidDiv) return;

        wrapper.addEventListener('click', (e) => {
            if (document.body.classList.contains('is-touch-device')) {
                const btn = container.querySelector('.mermaid-btn[onclick*="fullscreenMermaid"]');
                if (btn) btn.click();
            }
        });

        let isDragging = false, startX = 0, startY = 0, animationFrameId = null;

        wrapper.addEventListener('pointerdown', (e) => {
            if (document.body.classList.contains('is-touch-device') || (e.pointerType === 'mouse' && e.button !== 0)) return;
            isDragging = true; wrapper.classList.add('is-dragging'); wrapper.style.cursor = 'grabbing';
            startX = e.clientX - (parseFloat(container.dataset.x) || 0);
            startY = e.clientY - (parseFloat(container.dataset.y) || 0);
            if (wrapper.setPointerCapture) wrapper.setPointerCapture(e.pointerId);
        });

        wrapper.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            let x = e.clientX - startX, y = e.clientY - startY;
            container.dataset.x = x; container.dataset.y = y;
            const zoom = parseFloat(container.dataset.zoom) || 1;
            
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                mermaidDiv.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
            });
        });

        const endDrag = (e) => {
            if (isDragging) {
                isDragging = false; wrapper.classList.remove('is-dragging'); wrapper.style.cursor = 'grab';
                if (wrapper.releasePointerCapture) wrapper.releasePointerCapture(e.pointerId);
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
            }
        };
        wrapper.addEventListener('pointerup', endDrag); wrapper.addEventListener('pointercancel', endDrag);

        wrapper.addEventListener('wheel', (e) => {
            if (document.body.classList.contains('is-touch-device')) return;
            e.preventDefault();
            let zoom = parseFloat(container.dataset.zoom) || 1, x = parseFloat(container.dataset.x) || 0, y = parseFloat(container.dataset.y) || 0;
            let newZoom = Math.max(0.5, Math.min(zoom * (1 + (e.deltaY < 0 ? 1 : -1) * 0.15), 3));
            const rect = wrapper.getBoundingClientRect(), mouseX = e.clientX - rect.left - rect.width / 2, mouseY = e.clientY - rect.top - rect.height / 2;
            const ratio = newZoom / zoom - 1;
            x -= (mouseX - x) * ratio; y -= (mouseY - y) * ratio;
            container.dataset.zoom = newZoom; container.dataset.x = x; container.dataset.y = y;
            mermaidDiv.style.transform = `translate(${x}px, ${y}px) scale(${newZoom})`;
        }, { passive: false });
    });
}

export function downloadMermaidPNG(btn) {
    let svgEl = null; let fileName = 'diagram.png';
    const lightboxModal = document.getElementById('lightbox-modal');
    const isInsideLightbox = lightboxModal && lightboxModal.contains(btn);

    if (isInsideLightbox) {
        const customDom = document.getElementById('lightbox-custom-dom');
        if (customDom) svgEl = customDom.querySelector('svg');
        const captionEl = document.getElementById('lightbox-caption');
        if (captionEl && captionEl.innerText) fileName = `${captionEl.innerText.trim()}.png`;
    } else {
        const container = btn.closest('.mermaid-container');
        if (container) {
            svgEl = container.querySelector('.mermaid svg');
            const titleEl = container.querySelector('.mermaid-title');
            if (titleEl) fileName = `${titleEl.innerText.trim()}.png`;
        }
    }
    if (!svgEl) return;

    const clonedSvg = svgEl.cloneNode(true);
    if (!clonedSvg.getAttribute('xmlns')) clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const viewBox = clonedSvg.getAttribute('viewBox');
    let width = parseInt(clonedSvg.getAttribute('width')) || svgEl.getBoundingClientRect().width || 800;
    let height = parseInt(clonedSvg.getAttribute('height')) || svgEl.getBoundingClientRect().height || 600;
    if (viewBox) { const [, , w, h] = viewBox.split(' ').map(Number); width = w || width; height = h || height; }

    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clonedSvg)).replace(/'/g, '%27').replace(/"/g, '%22');
    const img = new Image();
    img.onload = () => {
        const scale = 3, canvas = document.createElement('canvas');
        canvas.width = width * scale; canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' ? '#020617' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale); ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob), a = document.createElement('a');
            a.style.display = 'none'; a.href = url; a.download = fileName; document.body.appendChild(a); a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
            if (window.isPWAEnvironment && !window.isPWAEnvironment()) {
                if(window.triggerHaptic) window.triggerHaptic('success');
                if (window.showSystemToast) window.showSystemToast(window.t('success'), window.t('chart_downloaded'), fileName, 3000, 'success');
            }
        }, 'image/png', 1.0);
    };
    img.src = svgUrl;
}

window.zoomMermaid = zoomMermaid;
window.reloadMermaid = reloadMermaid;
window.fullscreenMermaid = fullscreenMermaid;
window.initMermaidDrag = initMermaidDrag;
window.downloadMermaidPNG = downloadMermaidPNG;
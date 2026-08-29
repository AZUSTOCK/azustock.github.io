import { GLOBAL_SVGS } from '../config.js';

// ==========================================
// ✨ 系統提示框引擎 (System Toast Engine)
// ==========================================
export function showSystemToast(title, msg, subMsg, duration = 12000, type = 'error') {
    const themeClass = type === 'error' ? 'error' : 'success';
    
    const oldToast = document.getElementById('sys-global-toast');
    if (oldToast) {
        clearTimeout(oldToast.autoRemoveTimer);
        oldToast.remove();
    }

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

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 50);

    const xIcon = toast.querySelector('.toast-x-icon');
    if (xIcon) {
        xIcon.onclick = (e) => {
            e.stopPropagation();
            clearTimeout(toast.autoRemoveTimer);
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 400);
        };
    }
    
    if (duration > 0) {
        toast.autoRemoveTimer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }
}

// 橋接至 Window，維持 HTML 的相容性
window.showSystemToast = showSystemToast;
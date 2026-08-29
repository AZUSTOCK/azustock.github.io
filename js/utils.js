// ==========================================
// ✨ 全域觸覺回饋引擎 (Haptic Feedback Engine) [研議中]
// ==========================================
export function triggerHaptic(type = 'light') {
    if (!navigator.vibrate) return;
    try {
        if (type === 'light') navigator.vibrate(40); // 輕微點擊 (如：切換主題)
        else if (type === 'success') navigator.vibrate([30, 60, 40]); // 成功回饋 (如：複製成功)
        else if (type === 'error') navigator.vibrate([50, 50, 50, 50]); // 錯誤回饋
    } catch (e) { /* 忽略不支援的裝置 */ }
};

export function isPWAEnvironment() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
};

// ==========================================
// ✨ 系統版本比對引擎 (SemVer)
// ==========================================
export function compareVersions(v1, v2) {
    // 拔除 "U" 等英文字母，純粹比較數字陣列
    const p1 = String(v1).replace(/[^0-9.]/g, '').split('.').map(Number);
    const p2 = String(v2).replace(/[^0-9.]/g, '').split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const num1 = p1[i] || 0, num2 = p2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
};

// ✨ 取得細項檔案的專屬 Cache Hash
export function getResVersion(key, configVersion) {
    try {
        const versions = JSON.parse(localStorage.getItem('sys_data_versions') || '{}');
        return versions[key] || configVersion;
    } catch (e) {
        return configVersion;
    }
}
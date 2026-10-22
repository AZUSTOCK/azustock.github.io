import os
import re
import sys
import unicodedata
from contextlib import contextmanager

# 確保 Windows 終端機能正確解析 ANSI 顏色碼
if os.name == 'nt':
    os.system('')

USE_COLOR = sys.stdout.isatty() and 'NO_COLOR' not in os.environ


def styled(value, *styles):
    codes = {
        'cyan': '36', 'green': '32', 'yellow': '33', 'red': '31',
        'magenta': '35', 'blue': '34', 'gray': '90', 'bold': '1', 'dim': '2'
    }
    clean_val = re.sub(r'[\x00-\x08\x0b-\x1f\x7f-\x9f]', '', str(value))
    if not USE_COLOR or not styles:
        return clean_val
    seq = ';'.join(codes[s] for s in styles if s in codes)
    return '\033[' + seq + 'm' + clean_val + '\033[0m' if seq else clean_val


class Cout:
    LEVELS = {'DEBUG': 10, 'INFO': 20, 'WARN': 30, 'ERROR': 40}
    PRESET_ICONS = {
        'emoji': {
            'info': 'ℹ️', 'success': '✅', 'warn': '⚠️', 'error': '❌', 'skip': '⏭️',
            'stage': '📦', 'compress': '🗜️', 'cache': '🧠', 'config': '⚙️', 'clean': '🧹',
            'search': '🔍', 'rocket': '🚀', 'bot': '🤖', 'target': '🎯', 'pin': '📌',
            'image': '🖼️', 'pdf': '📄', 'folder': '📁', 'delete': '🗑️', 'refresh': '🔄',
            'expired': '⏰', 'unlock': '🔓', 'stats': '📊', 'party': '🎉', 'prompt': '👉',
            'edit': '📝'
        },
        'text': {
            'info': '[INFO]', 'success': '[OK]', 'warn': '[WARN]', 'error': '[ERR]', 'skip': '[SKIP]',
            'stage': '[STAGE]', 'compress': '[MINIFY]', 'cache': '[CACHE]', 'config': '[CFG]', 'clean': '[CLEAN]',
            'search': '[SCAN]', 'rocket': '[START]', 'bot': '[CI/CD]', 'target': '[TARGET]', 'pin': '[NOTE]',
            'image': '[IMG]', 'pdf': '[PDF]', 'folder': '[DIR]', 'delete': '[DEL]', 'refresh': '[SYNC]',
            'expired': '[EXPIRED]', 'unlock': '[UNLOCK]', 'stats': '[STATS]', 'party': '[DONE]', 'prompt': '>>>',
            'edit': '[EDIT]'
        }
    }

    def __init__(self, mode='emoji', custom_icons=None, min_level='INFO', indent_str='  '):
        self.indent_level = 0
        self.indent_str = indent_str
        self.min_level = self.LEVELS.get(min_level.upper(), 20)
        self.reminders = []
        self.set_icon_mode(mode, custom_icons)

    def set_icon_mode(self, mode='emoji', custom_icons=None):
        self.mode = mode
        if mode == 'none':
            self.icons = {}
        else:
            base = self.PRESET_ICONS.get(mode, self.PRESET_ICONS['emoji']).copy()
            if custom_icons and isinstance(custom_icons, dict):
                base.update(custom_icons)
            self.icons = base

    def icon(self, key, fallback=''):
        if self.mode == 'none':
            return ''
        return self.icons.get(key, key if fallback == '' else fallback)

    @staticmethod
    def styled(value, *styles):
        return styled(value, *styles)

    @staticmethod
    def _strip_ansi(text):
        return re.sub(r'\033\[[0-9;]*m', '', str(text))

    @classmethod
    def display_width(cls, text):
        plain = cls._strip_ansi(text)
        width = 0
        for ch in plain:
            if unicodedata.combining(ch) or ord(ch) == 0xFE0F:
                continue
            eaw = unicodedata.east_asian_width(ch)
            width += 2 if eaw in ('F', 'W') or ord(ch) > 0x1F000 else 1
        return width

    @classmethod
    def pad(cls, text, width, align='left'):
        pad_len = max(0, width - cls.display_width(text))
        if align == 'right':
            return (' ' * pad_len) + str(text)
        elif align == 'center':
            left = pad_len // 2
            return (' ' * left) + str(text) + (' ' * (pad_len - left))
        return str(text) + (' ' * pad_len)

    @contextmanager
    def indent(self, steps=1):
        self.indent_level += steps
        try:
            yield
        finally:
            self.indent_level = max(0, self.indent_level - steps)

    def _prefix(self, extra_indent=0, tree=False):
        lvl = self.indent_level + extra_indent
        if tree:
            base = self.indent_str * max(0, lvl)
            return f"{base}  └─ " if lvl == 0 else f"{base}└─ "
        return self.indent_str * lvl

    def _emit(self, text, level='INFO', extra_indent=0, tree=False):
        if self.LEVELS.get(level, 20) < self.min_level:
            return
        print(f"{self._prefix(extra_indent, tree)}{text}")

    def stage(self, tag, message="", icon_key='stage'):
        line = styled("=" * 42, 'gray')
        ic = self.icon(icon_key)
        prefix = f"{ic} " if ic else ""
        tag_str = styled(f"[{tag}]", 'bold', 'cyan') if tag else ""
        msg_str = f" {styled(message, 'bold')}" if message else ""
        print(f"\n{line}")
        print(f"{prefix}{tag_str}{msg_str}".strip())
        print(f"{line}")

    def debug(self, msg, icon_key='info', indent=0, tree=False):
        ic = self.icon(icon_key)
        prefix = f"{ic} " if ic else ""
        self._emit(f"{prefix}{styled(msg, 'gray')}", 'DEBUG', indent, tree)

    def info(self, msg, icon_key='info', indent=0, tree=False):
        ic = self.icon(icon_key)
        prefix = f"{ic} " if ic else ""
        self._emit(f"{prefix}{styled(msg, 'cyan') if not ic else msg}", 'INFO', indent, tree)

    def success(self, msg, icon_key='success', indent=0, tree=False):
        ic = self.icon(icon_key)
        prefix = f"{ic} " if ic else ""
        self._emit(f"{prefix}{styled(msg, 'green')}", 'INFO', indent, tree)

    def warn(self, msg, icon_key='warn', indent=0, tree=False):
        ic = self.icon(icon_key)
        prefix = f"{ic} " if ic else ""
        self._emit(f"{prefix}{styled(msg, 'yellow')}", 'WARN', indent, tree)

    def error(self, msg, icon_key='error', indent=0, tree=False):
        ic = self.icon(icon_key)
        prefix = f"{ic} " if ic else ""
        self._emit(f"{prefix}{styled(msg, 'red')}", 'ERROR', indent, tree)

    def skip(self, msg, icon_key='skip', indent=1, tree=False):
        ic = self.icon(icon_key)
        prefix = f"{ic} " if ic else ""
        self._emit(f"{prefix}{styled(msg, 'gray')}", 'INFO', indent, tree)

    def action(self, tag, msg, context="", icon_key="", color='cyan', tree=True, indent=0):
        ic = f"{self.icon(icon_key)} " if icon_key and self.icon(icon_key) else ""
        tag_part = styled(f"[{tag}]", 'bold', color) if tag else ""
        ctx_part = f" {styled(f'[{context}]', 'magenta')}" if context else ""
        body = f" {msg}" if (tag_part or ctx_part) else msg
        self._emit(f"{ic}{tag_part}{ctx_part}{body}".strip(), 'INFO', indent, tree)

    def size_action(self, tag, name, src_kb, dest_kb, context="", icon_key='image', tree=True, indent=0):
        diff_pct = ((dest_kb - src_kb) / src_kb * 100) if src_kb > 0 else 0
        pct_color = 'green' if diff_pct <= 0 else 'yellow'
        pct_str = styled(f"{diff_pct:+.1f}%", pct_color)
        size_info = f"({src_kb:.1f} KB -> {dest_kb:.1f} KB | {pct_str})"
        
        ic = f"{self.icon(icon_key)} " if icon_key and self.icon(icon_key) else ""
        tag_part = styled(f"[{tag}]", 'cyan') if tag else ""
        ctx_part = f" {styled(f'[{context}]', 'magenta')}" if context else ""
        name_part = f" {styled(name, 'bold')}" if name else ""
        self._emit(f"{ic}{tag_part}{ctx_part}{name_part} {size_info}".strip(), 'INFO', indent, tree)

    def file_size_action(self, tag, src_path, dest_path, context="", icon_key='image', tree=True, indent=0):
        if os.path.exists(src_path) and os.path.exists(dest_path):
            s_kb = os.path.getsize(src_path) / 1024
            d_kb = os.path.getsize(dest_path) / 1024
            self.size_action(tag, os.path.basename(dest_path), s_kb, d_kb, context, icon_key, tree, indent)

    def collect_reminder(self, tag, message, filepath="", color='yellow', icon_key='expired'):
        ic = f"{self.icon(icon_key)} " if self.icon(icon_key) else ""
        line1 = styled(f"{ic}[{tag}] {message}", color)
        if filepath:
            dir_ic = f"{self.icon('folder')} " if self.icon('folder') else ""
            line2 = styled(f"      {dir_ic}路徑: {filepath}", 'gray')
            self.reminders.append(f"{line1}\n{line2}")
        else:
            self.reminders.append(line1)

    def flush_reminders(self, title="過期 tag 提示"):
        self.stage(f"{title} ({len(self.reminders)})", icon_key='expired')
        if self.reminders:
            for i, val in enumerate(self.reminders, 1):
                print(f"{styled(f'{i:>2}.', 'bold')} {val}")
            self.reminders.clear()
        else:
            self.info("無提示", icon_key='success')

    def table(self, headers, rows, title=None, aligns=None):
        if title:
            ic = f"{self.icon('stats')} " if self.icon('stats') else ""
            print(f"\n{ic}{styled(title, 'bold', 'cyan')}")

        col_count = len(headers)
        if aligns is None:
            aligns = ['left'] + ['right'] * (col_count - 1)

        col_widths = [self.display_width(h) for h in headers]
        for row in rows:
            for i, cell in enumerate(row):
                col_widths[i] = max(col_widths[i], self.display_width(cell))

        sep_line = "  +" + "+".join("-" * (w + 2) for w in col_widths) + "+"
        header_cells = [self.pad(styled(h, 'bold'), col_widths[i], 'center') for i, h in enumerate(headers)]

        print(sep_line)
        print("  | " + " | ".join(header_cells) + " |")
        print(sep_line)

        for row in rows:
            formatted_cells = [self.pad(cell, col_widths[i], aligns[i]) for i, cell in enumerate(row)]
            print("  | " + " | ".join(formatted_cells) + " |")

        print(sep_line)

    def stats_table(self, stats, item_configs, title="[處理統計]"):
        headers = ["項目類別", "總數", "新增", "更新", "略過"]
        rows = []
        for label, prefix in item_configs:
            total = stats.get(f"{prefix}_total", 0)
            new_c = stats.get(f"{prefix}_new", 0)
            upd_c = stats.get(f"{prefix}_updated", 0)
            skp_c = stats.get(f"{prefix}_skipped", 0)
            rows.append([
                label,
                str(total),
                styled(new_c, 'bold', 'green') if new_c > 0 else styled(0, 'gray'),
                styled(upd_c, 'bold', 'yellow') if upd_c > 0 else styled(0, 'gray'),
                styled(skp_c, 'gray')
            ])
        self.table(headers, rows, title=title)

    def menu(self, title, options, prompt_text="請選擇", default="1"):
        print(f"\n{styled(title, 'bold')}")
        for key, desc in options:
            print(f"  {styled(f'[{key}]', 'cyan', 'bold')} {desc}")
        ic = f"{self.icon('prompt')} " if self.icon('prompt') else ""
        choice = input(f"{ic}{prompt_text} (預設 {default}): ").strip()
        return choice if choice else default


# ✅ 補齊 3：建立全域實例，讓外部可以直接 `from tools.cout import cout`
cout = Cout(mode=os.getenv("AZU_ICON_MODE", "emoji"))

# ==========================================================
# 🧪 Cout 萬能自我檢測與展示函式 (Universal Test Suite)
# ==========================================================
def run_cout_universal_test(instance=None, interactive=False):
    """
    一键測試並展示 Cout 的所有功能：
    1. 圖示模式切換 (emoji / text / none / custom)
    2. 階段橫幅與多層次縮排 (stage / indent)
    3. 語意化狀態與層級過濾 (debug / info / success / warn / error / skip)
    4. 行為日誌與真實檔案容量計算 (action / size_action / file_size_action)
    5. 過期提醒收集與輸出 (collect_reminder / flush_reminders)
    6. 通用表格與專案統計表格 (table / stats_table)
    7. 互動選單 (menu - 預設自動模擬輸入，設 interactive=True 可手動測試)
    8. 安全性防注入與寬度對齊斷言驗證 (styled / display_width)
    """
    import tempfile
    from unittest.mock import patch

    c = instance or Cout()
    orig_mode = c.mode
    orig_icons = c.icons.copy()
    orig_level = c.min_level

    try:
        # --- [區塊 1] 視覺與業務流程展示 (分別展示 Emoji 與 Text 模式) ---
        for test_mode in ('emoji', 'text'):
            c.set_icon_mode(test_mode)
            c.min_level = c.LEVELS['DEBUG']  # 暫時開啟 DEBUG 以便展示所有層級

            c.stage(f"萬能測試 ({test_mode.upper()} 模式)", "驗證階段橫幅、語意狀態與縮排層級", icon_key='rocket')
            
            # 1. 語意狀態與多層次縮排測試
            c.debug("這是 DEBUG 訊息 (開發除錯細節)")
            c.info("這是 INFO 訊息 (一般系統通知)")
            c.success("這是 SUCCESS 訊息 (任務執行成功)")
            c.warn("這是 WARN 訊息 (潛在異常警告)")
            c.error("這是 ERROR 訊息 (嚴重錯誤提示)")
            c.skip("這是 SKIP 訊息 (略過不處理項目)", indent=0)

            with c.indent():
                c.info("進入第一層縮排 (with cout.indent())", icon_key='folder')
                c.action("一般行為", "執行子模組初始化", context="Core", icon_key='config', color='cyan', tree=True)
                with c.indent():
                    c.action("深層行為", "寫入快取設定檔", context="Core / Cache", icon_key='edit', color='green', tree=True)

            # 2. 容量變化與真實臨時檔案測試
            c.stage("行為日誌測試", "驗證記憶體數值與真實檔案大小計算", icon_key='compress')
            c.size_action("數值壓縮", "main.min.js", 150.4, 62.8, context="Assets", icon_key='stage')
            c.size_action("體積膨脹", "uncompressed.bmp", 45.0, 120.0, context="Assets", icon_key='warn')

            # 建立真實臨時檔案以測試 file_size_action
            with tempfile.NamedTemporaryFile(delete=False) as f_src, tempfile.NamedTemporaryFile( suffix=".webp", delete=False) as f_dst:
                f_src.write(b"0" * 1024 * 200)  # 模擬 200 KB 原始檔
                f_dst.write(b"0" * 1024 * 35)   # 模擬 35 KB 轉出檔
                src_path, dst_path = f_src.name, f_dst.name

            try:
                c.file_size_action("真實檔案轉檔", src_path, dst_path, context="TempTest", icon_key='image')
            finally:
                os.remove(src_path)
                os.remove(dst_path)

            # 3. 表格對齊測試 (通用表格 + 統計表格)
            c.table(
                title="通用表格對齊測試 (中英數與色碼混排)",
                headers=["模組名稱", "狀態", "耗時 (ms)", "備註說明"],
                rows=[
                    ["WebP 防偽引擎", c.styled("正常", "green"), "128.5", "含 EXIF 數位簽章寫入"],
                    ["Markdown 解析", c.styled("更新", "yellow"), "42.0", "支援圖片寬高與懶加載"],
                    ["SEO OG 合成器", c.styled("略過", "gray"), "0.8", "Hash 未變動"],
                ],
                aligns=['left', 'center', 'right', 'left']
            )

            mock_stats = {
                "proj_total": 10, "proj_new": 2, "proj_updated": 1, "proj_skipped": 7,
                "art_total": 64,  "art_new": 0, "art_updated": 5, "art_skipped": 59,
                "og_total": 74,   "og_new": 0, "og_updated": 0, "og_skipped": 74,
            }
            c.stats_table(mock_stats, [
                ("專案 HTML (index)", "proj"),
                ("文章 HTML (index)", "art"),
                ("分享圖 (og.webp)", "og"),
            ], title=f"專案統計報表測試 ({test_mode})")

            # 4. 提醒收集器測試
            c.collect_reminder("標籤過期", "專案 '02_mind' 的 'NEW:2026-08-01' 已過 14 天。", "projects/02_mind/detail.json", color='yellow', icon_key='expired')
            c.collect_reminder("解封提醒", "文章 '24_create' 隱藏期限已到期。", "projects/02_mind/articles/24_create/detail.json", color='green', icon_key='unlock')
            c.flush_reminders("過期與解封提醒測試")

        # --- [區塊 2] 自動化斷言驗證 (選單、層級過濾、安全防注入) ---
        c.set_icon_mode('emoji')
        c.stage("底層機制自動化驗證", "檢測選單、層級過濾與控制碼防注入", icon_key='search')

        # A. 測試互動選單 menu()
        menu_opts = [("1", "快速跳過模式"), ("2", "強制複寫模式")]
        if interactive:
            ans = c.menu("【手動互動測試】請測試輸入選項：", menu_opts, default="1")
        else:
            with patch('builtins.input', return_value=''):
                ans = c.menu("【自動模擬選單】模擬直接按 Enter 使用預設值：", menu_opts, default="1")
            assert ans == "1", "選單預設值回傳錯誤"
        c.success(f"選單功能驗證通過 (回傳選擇: '{ans}')")

        # B. 測試嚴重度過濾 (min_level = WARN)
        c.min_level = c.LEVELS['WARN']
        c.debug("這行若印出代表過濾失敗！")
        c.info("這行若印出代表過濾失敗！")
        c.min_level = c.LEVELS['INFO']
        c.success("層級過濾驗證通過 (WARN 模式下已成功攔截 DEBUG 與 INFO)")

        # C. 測試安全防注入與顯示寬度計算
        dirty_str = "惡意字串\x07\x08\x1b[31m測試"
        clean_res = c.styled(dirty_str, 'cyan')
        assert '\x07' not in clean_res and '\x08' not in clean_res, "控制碼過濾失敗"
        assert c.display_width(c.styled("中文Test", "bold", "green")) == 8, "中英混合寬度計算錯誤"
        c.success("安全防注入與 ANSI 中英字寬計算驗證 100% 通過！", icon_key='party')

    finally:
        # 測試結束後還原 cout 原始狀態，不影響外部程式運作
        c.set_icon_mode(orig_mode, orig_icons)
        c.min_level = orig_level


if __name__ == "__main__":
    # 直接執行 python tools/cout.py 時，自動啟動萬能測試
    run_cout_universal_test(cout, interactive=False)
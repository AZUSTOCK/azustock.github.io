/* ================================================================== */
/* 🌍 系統多語系引擎 (i18n Engine)                                       */
/* ================================================================== */

const I18N_DICT = {
    zh: {
        copy_link: "複製連結", copied: "已複製", download: "下載", refresh: "重新整理",
        fullscreen: "全螢幕", zoom_in: "放大", zoom_out: "縮小", center_view: "置中",
        reset_view: "重設", open_new_tab: "新分頁開啟", expand_series: "展開系列",
        external_project: "外部專案", prev_article: "上一篇", next_article: "下一篇",
        back_to_index: "返回目錄", history_back: "返回跳轉前", index_title: "目錄",
        total_articles: "共 {0} 篇", sort_asc: "由舊到新", sort_desc: "由新到舊",
        found_new: "發現", more_above: "上方還有", more_below: "下方還有", new_articles: "篇新內容",
        system_error: "系統錯誤", back_to_home: "返回首頁", access_denied: "拒絕存取",
        loading: "讀取中...", downloading: "下載中", opening: "開啟中", return_list: "返回清單",
        changelog_title: "系統日誌", update_history: "History", license_title: "版權與授權",
        copy_code: "複製", error: "發生錯誤", view_pdf: "檢視 PDF 檔案",
        view_pdf_browser: "於瀏覽器中檢視 PDF", download_pdf: "下載 PDF 檔案", cancel: "取消",
        click_to_retry: "點擊重試", media_not_found: "找不到媒體檔案", open_pdf_menu: "點擊開啟 PDF 操作選單",
        pdf_hint: "點擊下方按鈕以檢視或下載 PDF 檔案", lightbox_preview: "大圖預覽", video_player: "影片",
        audio_player: "音訊", browser_no_video: "您的瀏覽器不支援影片標籤。", browser_no_audio: "您的瀏覽器不支援音樂標籤。",
        flowchart: "流程圖 (Flowchart)", view_image: "查看大圖", prev_image: "上一張",
        next_image: "下一張", next_item: "跳至下一個", remove_filter: "解除過濾", share_site: "分享本站",
        credits: "致謝", copied_exclaim: "已複製!", click_to_retry_block: "點擊區塊以重試載入",
        close: "關閉",
        more_options: "更多選項",
        fetching_file: "正在取得檔案，請稍候...",
        processing: "處理中...",
        
        // 剝離 HTML 的純文字變數
        cw_title: "內容警告 (Content Warning)",
        cw_desc: "此條目包括但不限於：負面、一時興起、莫名其妙、取景框。<br>點擊前往即表示您已了解。",
        cw_desc_hint: "(同意後於本次瀏覽器存續期間將不再提示)",
        cw_decline: "不感興趣",
        cw_agree: "我已了解並前往",
        err_404_proj_title: "404 找不到專案",
        err_404_proj_desc: "無法找到您指定的專案。<br/>可能不存在或已被移除",
        err_403_title: "403 存取遭拒",
        err_403_desc: "拒絕存取。",
        author_name: "風川梓",
        err_404_art_title: "404 找不到文章",
        err_404_art_desc: "在專案「{0}」中找不到此文章。<br/>可能不存在或已被移除。",
        system_error_label: "SYSTEM_ERROR",
        rebooting: ">_ 重新啟動中...",
        err_unknown: "未知的系統錯誤",
        sys_dump: "[系統傾印]",
        err_offline_title: "ERR: 無網路連線",
        err_fetch_title: "ERR: 無法取得資料",
        err_offline_sub: "請檢查您的網路設定，連線恢復後請重新整理。",
        net_offline_title: ">_ 系統離線",
        net_offline_msg: "網路連線中斷",
        net_offline_sub: "請檢查您的網路設定，連線恢復後系統將自動重整。",
        reverted_safe_state: "已還原為安全狀態",
        update_failed_core: "無法取得 {0} 核心，請稍後再試。",
        load_failed: "載入失敗",
        credits_failed: "無法載入致謝名單。",
        license_failed: "無法載入版權聲明檔案。",
        changelog_failed: "無法載入版本日誌。",
        sys_rebooting: "SYSTEM_REBOOTING",
        verifying_modules: "VERIFYING_MODULES",
        sys_updating: "SYS_UPDATING",
        syncing_new_data: "SYNCING_NEW_DATA",
        sys_online: ">_ SYSTEM_ONLINE",
        sys_reverted: ">_ SYSTEM_REVERTED",
        update_success: "更新成功",
        cdn_delay: "CDN_CACHE_DELAY",
        update_failed: ">_ UPDATE_FAILED",
        cdn_delay_detected: "CDN_CACHE_DELAY_DETECTED",
        reload_system: ">_ 重新載入系統",
        fetching_data: "正在取得資料...",
        awaiting_data: ">_ 系統啟動中 : 等待資料串流...",
        manual_override: ">_ 手動覆寫 : 更新",
        fetching_rebooting: "取得資料並重啟中...",
        important_badge: "Important",
        acknowledgments_badge: "Acknowledgments",
        marquee_net_offline: "網路斷線 • 請檢查連線狀態 • ",
        marquee_sys_offline: "系統離線 • 發生錯誤 • ",
        core_update: "CORE_UPDATE",
        updating: "UPDATING",
        success: "成功",
        chart_downloaded: "圖表已下載",
        no_quotes: "無可用題庫",
        header_desc: "Software Engineer · Systems Builder<br/>程式、金融、像素、音符、字詞",
        profile_desc: "一個名為「梓」的人的聚集地，<br/>通常都在寫寫字、寫程式、畫圖、音樂和財經及理解中。<br/>此亦為「梓本投資控股偽存公司」的官方網站，主要用於展示旗下梓們的作品。",
        profile_quote: "「在某個特別的時間點，妳會遇見她。興許過了一段時間後，妳會到達那個，決定閱讀她的時間點。」",
        aria_theme: "切換深淺色模式",
        aria_btt: "返回頂部",
        article_fallback_hint: "*此文章尚未提供當前語言的翻譯，目前顯示預設語言。*"
    },
    en: {
        copy_link: "Copy Link", copied: "Copied!", download: "Download", refresh: "Refresh",
        fullscreen: "Fullscreen", zoom_in: "Zoom In", zoom_out: "Zoom Out", center_view: "Center",
        reset_view: "Reset", open_new_tab: "New Tab", expand_series: "View All", external_project: "Visit Site",
        prev_article: "Prev", next_article: "Next", back_to_index: "To Index", history_back: "Go Back",
        index_title: "Index", total_articles: "{0} Items", sort_asc: "Oldest", sort_desc: "Newest",
        found_new: "Found", more_above: "Above:", more_below: "Below:", new_articles: "New",
        system_error: "System Error", back_to_home: "Home", access_denied: "Access Denied",
        loading: "Loading...", downloading: "Downloading", opening: "Opening", return_list: "Back",
        changelog_title: "Changelog", update_history: "History", license_title: "License",
        copy_code: "Copy", error: "Error", view_pdf: "View PDF", view_pdf_browser: "Open in Browser",
        download_pdf: "Download PDF", cancel: "Cancel", click_to_retry: "Click to Retry",
        media_not_found: "MEDIA NOT FOUND", open_pdf_menu: "Open PDF Options", pdf_hint: "Click below to view or download PDF",
        lightbox_preview: "Image Preview", video_player: "Video", audio_player: "Audio",
        browser_no_video: "Your browser does not support the video tag.", browser_no_audio: "Your browser does not support the audio tag.",
        flowchart: "Flowchart", view_image: "View Image", prev_image: "Prev", next_image: "Next",
        next_item: "Next", remove_filter: "Clear Filter", share_site: "Share Site", credits: "Credits",
        copied_exclaim: "Copied!", click_to_retry_block: "Click to retry loading",
        close: "Close",
        more_options: "More Options",
        fetching_file: "Fetching file, please wait...",
        processing: "Processing...",

        cw_title: "Content Warning",
        cw_desc: "This entry may contain negative, impulsive, inexplicable content, or viewfinder shots.<br>Proceeding implies your understanding.",
        cw_desc_hint: "(Will not prompt again during this session)",
        cw_decline: "Not Interested",
        cw_agree: "I Understand",
        err_404_proj_title: "404 Project Not Found",
        err_404_proj_desc: "The specified project could not be found.<br/>It may not exist or has been removed.",
        err_403_title: "403 ACCESS DENIED",
        err_403_desc: "Access Denied.",
        author_name: "Kazekawa-Azusa",
        err_404_art_title: "404 Article Not Found",
        err_404_art_desc: "The article could not be found in project '{0}'.<br/>It may not exist or has been removed.",
        system_error_label: "SYSTEM_ERROR",
        rebooting: ">_ REBOOTING...",
        err_unknown: "UNKNOWN SYSTEM ERROR",
        sys_dump: "[SYS_DUMP]",
        err_offline_title: "ERR: NO INTERNET CONNECTION",
        err_fetch_title: "ERR: FAILED TO FETCH DATA",
        err_offline_sub: "Please check your network connection and refresh.",
        net_offline_title: ">_ SYSTEM_OFFLINE",
        net_offline_msg: "Network Disconnected",
        net_offline_sub: "Please check your network. System will auto-refresh when restored.",
        reverted_safe_state: "Reverted to a safe state",
        update_failed_core: "Failed to fetch core {0}. Please try again later.",
        load_failed: "Load Failed",
        credits_failed: "Failed to load credits.",
        license_failed: "Failed to load license.",
        changelog_failed: "Failed to load changelog.",
        sys_rebooting: "SYSTEM_REBOOTING",
        verifying_modules: "VERIFYING_MODULES",
        sys_updating: "SYS_UPDATING",
        syncing_new_data: "SYNCING_NEW_DATA",
        sys_online: ">_ SYSTEM_ONLINE",
        sys_reverted: ">_ SYSTEM_REVERTED",
        update_success: "UPDATE_SUCCESSFUL",
        cdn_delay: "CDN_CACHE_DELAY",
        update_failed: ">_ UPDATE_FAILED",
        cdn_delay_detected: "CDN_CACHE_DELAY_DETECTED",
        reload_system: ">_ RELOAD_SYSTEM",
        fetching_data: "FETCHING DATA...",
        awaiting_data: ">_ SYSTEM_BOOTING : AWAITING_DATA_STREAM...",
        manual_override: ">_ MANUAL_OVERRIDE : UPDATE",
        fetching_rebooting: "FETCHING_AND_REBOOTING...",
        important_badge: "Important",
        acknowledgments_badge: "Acknowledgments",
        marquee_net_offline: "NETWORK OFFLINE • PLEASE CHECK CONNECTION • ",
        marquee_sys_offline: "SYSTEM OFFLINE • ERROR • ",
        core_update: "CORE_UPDATE",
        updating: "UPDATING",
        success: "SUCCESS",
        chart_downloaded: "Chart Downloaded",
        no_quotes: "No quotes available",
        header_desc: "Software Engineer · Systems Builder<br />Code, Finance, Pixels, Notes, and Words",
        profile_desc: "A gathering place for a person named 'Azusa'.<br/>Usually writing, coding, drawing, making music, and studying finance.<br/>This is also the official website of 'Azustock Holdings Company Phony'.",
        profile_quote: "「At that moment, you meet her. Perhaps in the future, you will reach the point where you decide to read her.」",
        aria_theme: "Toggle Theme",
        aria_btt: "Back to Top",
        // ✨ 新增：文章未翻譯時的回退提示
        article_fallback_hint: "*This article has not been translated into English yet. Displaying the default language.*"
    },
    ja: {
        copy_link: "リンク複製", copied: "コピー完了", download: "保存", refresh: "更新",
        fullscreen: "全画面表示", zoom_in: "拡大", zoom_out: "縮小", center_view: "中央揃え",
        reset_view: "リセット", open_new_tab: "新しいタブ", expand_series: "すべて見る", external_project: "サイトへ",
        prev_article: "前へ", next_article: "次へ", back_to_index: "目次へ", history_back: "戻る",
        index_title: "目次", total_articles: "全 {0} 件", sort_asc: "古い順", sort_desc: "新しい順",
        found_new: "新着", more_above: "上に", more_below: "下に", new_articles: "件",
        system_error: "エラー", back_to_home: "ホームへ", access_denied: "アクセス拒否",
        loading: "読み込み中...", downloading: "保存中...", opening: "開いています", return_list: "リストへ",
        changelog_title: "更新履歴", update_history: "History", license_title: "ライセンス",
        copy_code: "コピー", error: "エラー", view_pdf: "PDFを表示", view_pdf_browser: "ブラウザで表示",
        download_pdf: "PDFをダウンロード", cancel: "キャンセル", click_to_retry: "再試行",
        media_not_found: "メディアが見つかりません", open_pdf_menu: "PDFメニューを開く", pdf_hint: "下のボタンをクリックしてPDFを表示または保存",
        lightbox_preview: "画像プレビュー", video_player: "動画", audio_player: "音声",
        browser_no_video: "お使いのブラウザは動画タグをサポートしていません。", browser_no_audio: "お使いのブラウザは音声タグをサポートしていません。",
        flowchart: "フローチャート", view_image: "画像を拡大", prev_image: "前へ", next_image: "次へ",
        next_item: "次へ", remove_filter: "フィルター解除", share_site: "サイトを共有", credits: "謝辞",
        copied_exclaim: "コピー完了", click_to_retry_block: "クリックして再試行",
        close: "閉じる",
        more_options: "その他",
        fetching_file: "ファイルを取得しています...",
        processing: "処理中...",

        cw_title: "コンテンツ警告 (Content Warning)",
        cw_desc: "このエントリには、ネガティブな内容、突発的なもの、不可解なもの、またはファインダー越しの景色が含まれる場合があります。<br>クリックして進むと、同意したとみなされます。",
        cw_desc_hint: "(同意後、このセッション中は再表示されません)",
        cw_decline: "戻る",
        cw_agree: "理解して進む",
        err_404_proj_title: "404 見つかりません",
        err_404_proj_desc: "指定されたプロジェクトが見つかりません。<br/>存在しないか、削除された可能性があります。",
        err_403_title: "403 アクセス拒否",
        err_403_desc: "アクセス拒否。",
        author_name: "風川梓",
        err_404_art_title: "404 記事が見つかりません",
        err_404_art_desc: "プロジェクト「{0}」にこの記事が見つかりません。<br/>存在しないか、削除された可能性があります。",
        system_error_label: "SYSTEM_ERROR",
        rebooting: ">_ 再起動中...",
        err_unknown: "不明なシステムエラー",
        sys_dump: "[システムダンプ]",
        err_offline_title: "ERR: NO INTERNET CONNECTION",
        err_fetch_title: "ERR: FAILED TO FETCH DATA",
        err_offline_sub: "ネットワーク設定を確認してください。",
        net_offline_title: ">_ SYSTEM_OFFLINE",
        net_offline_msg: "ネットワーク切断",
        net_offline_sub: "ネットワークを確認してください。復旧時に自動更新されます。",
        reverted_safe_state: "安全な状態に復元されました",
        update_failed_core: "コア {0} を取得できませんでした。後でお試しください。",
        load_failed: "読み込み失敗",
        credits_failed: "謝辞を読み込めませんでした。",
        license_failed: "ライセンスを読み込めませんでした。",
        changelog_failed: "更新履歴を読み込めませんでした。",
        sys_rebooting: "SYSTEM_REBOOTING",
        verifying_modules: "VERIFYING_MODULES",
        sys_updating: "SYS_UPDATING",
        syncing_new_data: "SYNCING_NEW_DATA",
        sys_online: ">_ SYSTEM_ONLINE",
        sys_reverted: ">_ SYSTEM_REVERTED",
        update_success: "更新成功",
        cdn_delay: "CDN キャッシュ遅延",
        update_failed: ">_ UPDATE_FAILED",
        cdn_delay_detected: "CDN キャッシュ遅延を検出",
        reload_system: ">_ システム再読み込み",
        fetching_data: "データ取得中...",
        awaiting_data: ">_ システム起動中 : データストリーム待機...",
        manual_override: ">_ MANUAL_OVERRIDE : UPDATE",
        fetching_rebooting: "データ取得・再起動中...",
        important_badge: "Important",
        acknowledgments_badge: "Acknowledgments",
        marquee_net_offline: "NETWORK OFFLINE • PLEASE CHECK CONNECTION • ",
        marquee_sys_offline: "SYSTEM OFFLINE • ERROR • ",
        core_update: "CORE_UPDATE",
        updating: "UPDATING",
        success: "成功",
        chart_downloaded: "グラフを保存しました",
        no_quotes: "利用可能な名言がありません",
        header_desc: "Software Engineer · Systems Builder<br />コード、金融、ピクセル、音符、言葉",
        profile_desc: "「梓」という名の人の集まる場所。<br/>普段は文章を書いたり、プログラミング、絵描き、音楽、金融の勉強をしています。<br/>ここは「梓本投資控股偽存会社」の公式サイトでもあり、梓たちの作品を展示しています。",
        profile_quote: "「ある特別な時期に、あなたは彼女に出会う。そしておそらく、しばらくしてから、あなたは彼女を読むと決めるその時に到達するだろう。」",
        aria_theme: "テーマ切替",
        aria_btt: "トップへ戻る",
        // ✨ 新增：文章未翻譯時的回退提示
        article_fallback_hint: "*この記事はまだ翻訳されていません。デフォルトの言語を表示しています。*"
    }
};

window.CURRENT_LANG = 'zh';

window.initI18n = function() {
    const savedLang = localStorage.getItem('sys_lang');
    if (savedLang && I18N_DICT[savedLang]) {
        window.CURRENT_LANG = savedLang;
    } else {
        const browserLang = (navigator.language || navigator.userLanguage).toLowerCase();
        
        // ✨ 語言偵測邏輯：包含 zh 就中文，包含 ja 就日文，其餘「全部」預設為英文！
        if (browserLang.includes('zh')) {
            window.CURRENT_LANG = 'zh';
        } else if (browserLang.includes('ja')) {
            window.CURRENT_LANG = 'ja';
        } else {
            window.CURRENT_LANG = 'en';
        }
    }

    // ✨ 網頁載入時，自動為選單裡的語言按鈕加上高光狀態
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.lang-switch-btn').forEach(btn => {
            if(btn.getAttribute('data-lang') === window.CURRENT_LANG) {
                btn.classList.add('active');
            }
        });
    });
};

window.t = function(key, args = []) {
    let text = I18N_DICT[window.CURRENT_LANG][key];
    if (!text) text = I18N_DICT['zh'][key] || key;
    args.forEach((arg, index) => {
        text = text.replace(`{${index}}`, arg);
    });
    return text;
};

window.changeLanguage = function(lang) {
    if (I18N_DICT[lang] && lang !== window.CURRENT_LANG) {
        localStorage.setItem('sys_lang', lang);
        window.location.reload(); 
    }
};

window.initI18n();
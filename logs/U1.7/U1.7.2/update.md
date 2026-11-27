## refactor
1. Split `changelogs.json` into a `{ groups, logs }` index with on-demand `api/_changelogs/<id>.json` chunks.
2. Replaced fixed `700px` top-bar and button breakpoints with a dynamic width/font-scale layout engine.
3. Extracted shared modal layout, group styling, heading TOC, and scroll-restore helpers (`syncModalHeaderLayouts`, `resolveGroupStyle`, `buildHeadingTocMenu`, `restoreItemIntoModalView`).

## add
1. URL parameter routing for system modals (`?sys=...`) to preserve active view and language tab on reload/PWA refresh.
2. Prev/next changelog navigation via `.unified-nav-capsule` (`←`/`→` shortcuts) and bottom `.article-nav-cards`.
3. Version grouping for changelogs (`<prefix> Series`, `detail.json` override, `logs/groups.json`) with `.group-header` and `.article-group-label`.
4. TOC quick-jump menus for changelog group lists and detail headings.
5. Three-level progressive compression for `.unified-nav-capsule` on narrow screens.
6. Short-title-first condensation (`License`, `Changelog`) to preserve single-row system modal headers before wrapping.
7. Smart hash caching (`api/_changelogs/meta.json`) and independent `logs` build stats in `generate_projects.py`.

## change / update
1. Unified changelog chunk loading with the article loading capsule via `safeFetchWithGuard`.
2. Switched Index action buttons to full-text-first and Article `.share-link-btn` to single-line-first two-mode layouts with non-touch tooltips.
3. Updated `release_validation.py` and `test_public_site.py` for grouped/split changelogs.

## adjust
1. Pinned `#modal-top-right` to row 1 while wrapped left-side header content expands full-width below.
2. Disabled top-bar fade/scale animation when switching adjacent changelog versions.
3. Matched changelog return-to-index scroll restoration and viewport pull-back behavior with articles.

## fix
1. Fixed excessive header gap caused by `#modal-top-right` `margin: 0 !important`.
2. Fixed desktop/mobile/PWA `#modal-top-right` wrapping and `transform: scale` measurement races using `offsetWidth`, physical line-wrap checks, and `flex: 1 1 0` / `0 0 auto`.
3. Fixed premature article header wrapping caused by `.header-left:has(.article-date)` `flex-basis: 200px`.

## remove
1. Removed `- 目錄` suffix from project index titles.
2. Removed hardcoded `700px` responsive button rules, `500px` `#toggle-sort-btn` / `.capsule-btn` padding overrides, redundant changelog capsule CSS selectors, and dead `cachedChangelogContents`.
## refactor
1. Split `changelogs.json` into a `{ groups, logs }` index with on-demand `api/_changelogs/<id>.json` chunks.
2. Replaced fixed `700px` top-bar and button breakpoints with a dynamic width/font-scale layout engine.

## add
1. URL parameter routing for system modals (`?sys=...`) to preserve active view and language tab on reload/PWA refresh.
2. Prev/next changelog navigation via `.unified-nav-capsule` (`←`/`→` shortcuts) and bottom `.article-nav-cards`.
3. Version grouping for changelogs (`<prefix> Series`, `detail.json` override, `logs/groups.json`) with `.group-header` and `.article-group-label`.
4. TOC quick-jump menus for changelog group lists and detail headings.
5. Three-level progressive compression for `.unified-nav-capsule` on narrow screens.
6. Smart hash caching (`api/_changelogs/meta.json`) and independent `logs` build stats in `generate_projects.py`.

## change / update
1. Unified changelog chunk loading with the article loading capsule via `safeFetchWithGuard`.
2. Switched Index and Article action buttons to a two-mode full-text-first layout with non-touch tooltips.
3. Updated `release_validation.py` and `test_public_site.py` for grouped/split changelogs.

## adjust
1. Pinned `#modal-top-right` to row 1 while wrapped left-side header content expands full-width below.
2. Disabled top-bar fade/scale animation when switching adjacent changelog versions.

## fix
1. Fixed excessive header gap caused by `#modal-top-right` `margin: 0 !important`.
2. Fixed `#modal-top-right` wrapping onto a second row on long titles or active TOC buttons.

## remove
1. Removed hardcoded `700px` responsive button rules and unused `500px` `#toggle-sort-btn` padding override.
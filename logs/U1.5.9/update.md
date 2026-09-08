## refactor
1. extract `<li class="article-li">...</li>` to `generateLi` (function)
2. extract to `window.triggerSystemUpdate` (function)
3. extract to `window.getRelativeOffsetTop` (function)

## add
1. `toc-toggle-btn` (Series Groups menu) in project page
2. `data-tooltip` for `toc-toggle-btn`

## change / update
1. apply fault tolerance for time-tags (Regex update)
2. `toggle-sort-btn`, `share-link-btn` UI (Responsive text-hideable)

## adjust
1. Jump Toast UI (Fix horizontal jitter & center alignment)
2. `data-tooltip` UI (Fix line-height & top cut-off issue)
3. animation for `toc-toggle-btn`
4. UI

## fix
1. unlock article version check (Add pre-check on 403 unlock trigger)
2. `targetItem` undefined error in `executeAnchorScroll`
3. UI

## deprecate

## remove
1. `data-tooltip` in `toggle-sort-btn`, `share-link-btn`

## pending

## notice

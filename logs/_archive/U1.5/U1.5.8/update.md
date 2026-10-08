## refactor
1. detach `generateLi`
2. apply `window.scrollMarqueeTo`, `checkMobileLayout`, `window.isPWAEnvironment()`

## add
1. article version support
2. `no_tract` in log detail.json
3. `applyTextScale` associated

## change / update
1. js, css narrow & clean

## adjust
1. touch feedback in gallery (remove)
2. progress-bar & `is-start` animation
3. system unlock logic
4. UI

## fix
1. PWA card link fatal window error
2. `.card:hover` style error
3. `.action-btn` to `.card-action-btn` associated error
4. PWA PDF link jump
5. PWA PDF garbage collection
6. Lightbox narrow-layout window error
7. markdown list link CSS pollution
8. `handleCopy`
9. `applyIndentToVerticalWrapper`

## deprecate
1. old share link & physical `index.html` structure

## remove
1. redundant `DOMMatrix` calculation in `main.js`
2. old `is-touch-device` detection fragment
3. `getStatusColorFromCSS`
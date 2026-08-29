## refactor
1. detach `generateLi`
2. apply `window.scrollMarqueeTo`, `checkMobileLayout`, `window.isPWAEnvironment()`

## add
1. article version support
2. untranslated warn banner
3. Global Smart Focus Trap Engine (A11y)
4. keyboard navigation visual indicators (`:focus-visible`)

## change / update
1. responsive `max-width` breakpoint to `699px`
2. `get_html_template` support `<html lang="?">`
3. js, css narrow

## adjust
1. touch feedback in gallery (remove)
2. progress-bar & `is-start` animation
3. system unlock logic

## fix
1. PWA card link fatal window error
2. `.card:hover` style error
3. `.action-btn` to `.card-action-btn` associated error
4. PWA PDF link jump
5. PWA PDF garbage collection
6. Lightbox narrow-layout window error
7. markdown list link CSS pollution
8. hidden menu keyboard focus bug (`visibility: hidden`)
9. gallery image scroll displacement on focus (`overflow: clip` & `:focus-within`)

## deprecate
1. old share link & physical `index.html` structure

## remove
1. redundant `DOMMatrix` calculation in `main.js`
2. old `is-touch-device` detection fragment
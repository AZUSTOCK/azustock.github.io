## refactor
1. 

## add
1. 

## change / update
1. Routed video fullscreen to native fullscreen (`requestFullscreen` / `webkitEnterFullscreen`) on non-PWA touch browsers while keeping custom `is-web-fullscreen` for PWA and desktop

## adjust
1. Widened mobile (<= 700px) modal content and top-bar horizontal layout (1.5rem → 1.15rem padding) and aligned modal scroll-hint offsets (-1rem)

## fix
1. Removed redundant mobile .modal-content / .modal-top-bar breakpoint overrides that caused doubled horizontal padding on narrow screens
2. Prevented accidental mobile browser toolbar toggling during Lightbox and web-fullscreen video gestures via `touchmove` interception and `overscroll-behavior: none`

## deprecate
1. 

## remove
1. 

## pending
1. 

## notice
1. 
## Refactor
1. Auto-add `md-sys-` prefix to markdown title IDs to prevent native anchor scroll conflicts.
2. Add `disableTrackers` parameter to `window.executeAnchorScroll` and `hashchange` events.
3. Consolidate and clean up core logic in `style.css` and `main.js`.

## Add
1. Support custom title anchor ID syntax.
2. Add `data-raw-title` attribute to TOC engine for clean heading displays.
3. Add reading progress bar for both horizontal and vertical writing modes.
4. Add one-click high-resolution download feature for images and Mermaid diagrams.
5. Add comprehensive PWA (Progressive Web App) support and configurations.
6. Add system reload button (`>_ RELOAD_SYSTEM`) in the fullscreen menu.
7. Introduce `window.triggerHaptic` engine for native-like tactile feedback on mobile devices.
8. Add native-like PDF Action Sheet for mobile/touch devices to enhance safety and UX.
9. Add global keyboard shortcuts (e.g., `M` for theme toggle, refined `Esc` logic).
10. Add custom Web Fullscreen engine for videos to bypass PWA native API restrictions.

## Change / Update
1. Update hamburger menu jumping behavior to prioritize targeting outer `div` wrappers.

## Adjust
1. Fine-tune UI layout and DOM manipulation details across `style.css` and `main.js`.
2. Optimize `animateTopBar` parameter logic in `switchModalContent` and `openArticle` for smoother top-bar transitions.

## Fix
1. Fix PDF open issue on touch devices with wider screens.
2. Fix scroll jittering/jumping error when manually modifying the URL hash.
3. Fix scroll restoration accuracy when returning to previous articles (integrating Layout Shift Chaser).

## Remove
1. Remove Giscus associated code.

## Notice
1. Custom anchor syntax: `## title {#custom-id}`
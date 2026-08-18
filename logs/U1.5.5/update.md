## refactor
1. Auto-add `md-sys-` prefix to markdown title IDs to prevent native anchor scroll conflicts.
2. Add `disableTrackers` parameter to `window.executeAnchorScroll` and `hashchange` events.
3. style.css
4. main.js 

## add
1. Support custom title anchor ID syntax.
2. Add `data-raw-title` attribute to TOC engine for clean heading displays.
3. article progress bar
4. download image / mermaid

## change / update
1. Update hamburger menu jumping behavior to prioritize targeting outer `div` wrappers.

## adjust
1. style.css
2. main.js

## fix
1. Fix PDF open issue on touch devices with wider screens.
2. Fix scroll jittering/jumping error when manually modifying the URL hash.

## remove
1. Remove Giscus associated code.

## notice
1. Custom anchor syntax: `## title {#custom-id}`
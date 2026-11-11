## refactor
1. Move tooltip text-overflow logic to CSS
2. Consolidate expiration checks into unified `evaluateExpiration` function
3. Extract URL routing logic into a shared `window.updateRouteState` helper
4. Extract zoom button generation into a reusable `createZoomBtn` helper

## add
1. Group Badge in Modal Top Bar
2. Show article titles in next/prev capsule-btn tooltips
3. Centralize TAG_EXPIRE_DAYS configuration in main.js
4. Implement Group Cover image inheritance and rendering logic
5. group thumbnail
6. force update folder logic in generate_projects.py

## change / update
1. Code section UI
2. Horizontal scroll support for long code-lang-label
3. Update .md-details CSS styling
4. Responsive UI for narrow screens in main.js & style.css
5. Upgrade Group Header UI layout (Inline Float Right style)
6. group thumbnail in generate_projects.py

## adjust
1. code-lang-label width and padding
2. generate_projects.py logic

## fix
1. Mermaid UI
2. Scroll position restoration issues
3. Case-sensitivity issue for ![icon]
4. Restore missing `parseAndFilterTags` function causing FETCHING DATA ERROR
5. Fix duplicate `<ul>` tag rendering issue for ungrouped articles
6. Fix `articleId=0` falsy evaluation in routing function
7. applyTheme

## remove
1. Native title attribute from code-lang-label
2. Redundant CSS declarations for Group Header
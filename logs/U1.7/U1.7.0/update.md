## refactor
1. Discord WebHook and GitHub Pages deployment (Branch → Artifact; YAML + Python)
2. Centralized public site preparation, exclusion rules, and pre-deployment validation
3. UI interaction state management, Filter Toast logic, and System Toast lifecycle

## add
1. GitHub metadata sync with version prefix normalization
2. `header-social-icons`
3. System Memory (export, validated merge import, and reset with confirmation and optional backup)
4. Kotoba click history (`sys_clicked_kotoba`) and collection progress in Filter Toast
5. Manual deployment trigger
6. Public Site Inventory (file paths, sizes, SHA-256 hashes) with comparison against the previous deployment
7. Local preview tools for public site preparation and Discord notifications (with JSON payload output)
8. Unit tests for Discord notifications and public site preparation

## change / update
1. Custom domain (`azustock.github.io` → `azustock.com`), including Open Graph, Twitter Cards, canonical URLs, and PWA manifest
2. `default_sort` in `categories`
3. `fullscreen-menu` UI
4. Discord notifications (render release changelog headings as H3; map embed colors via explicit `[STATUS]`)

## adjust
1. Navigation hover and icon animations (`nav-item`, `nav-plane-svg`)
2. `tags-container` available width
3. Filter Toast navigation button states and disabled button/tooltip styling

## fix
1. UI shake and hover flickering
2. Hidden elements blocking pointer events and retaining keyboard focus
3. Lightbox reopening and delayed cleanup
4. System Toast animation timing
5. Single-item Filter Toast navigation
6. Invalid favicon and legacy domain resource references
7. Deployment script escaping and stale staging files
8. Duplicate release titles and keyword-triggered embed color mismatches in Discord notifications

## remove
1. Legacy `gh-pages` branch and force-push deployment mechanism
2. Internal build tools, cache metadata, and source files from public deployment (`tools/`, `logs/`, root `README.md`, `api/**/meta.json`, `projects/**/detail.json`, `projects/**/index.md`)

## notice
1. The official domain is now `azustock.com`; local storage is isolated from the previous domain, though existing System Memory backups remain compatible.
2. The new deployment workflow requires GitHub Pages Source to be set to GitHub Actions.
3. Public Site Inventory reports are stored as a separate GitHub Actions artifact (`public-site-inventory`) for 30 days and are not published to the website.

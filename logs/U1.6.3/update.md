## refactor
1. Discord WebHook (YAML + Python)
2. GitHub Pages deployment (Branch → Artifact; YAML + Python)
3. Filter Toast logic
4. UI interaction state management
5. System Toast lifecycle
6. GitHub metadata version normalization
7. Centralized public site preparation, exclusion rules, and validation

## add
1. GitHub metadata sync
2. `header-social-icons`
3. System Memory (export / import / reset)
4. System Memory backup validation and merge mechanism
5. Kotoba click history (`sys_clicked_kotoba`)
6. Kotoba collection progress in Filter Toast
7. Pre-deployment file and resource validation
8. Manual deployment trigger
9. System Memory reset confirmation and optional backup
10. Local Discord notification preview and JSON payload output
11. Public Site Inventory (file paths, sizes, and SHA-256 hashes)
12. Inventory comparison against the previous successful deployment
13. Local public site preparation and preview
14. Unit tests for Discord notifications and public site preparation

## change / update
1. `default_sort` in `categories`
2. `fullscreen-menu` UI
3. Custom domain (`azustock.github.io` → `azustock.com`)
4. Open Graph, Twitter Cards and canonical URLs
5. PWA Manifest (ID, scope and start URL)
6. Favicon resource references
7. System Memory backup metadata
8. System Memory import result summary
9. Discord Release notifications (extract the changelog heading and render it as H3)
10. Discord Embed color mapping based on explicit `[STATUS]`
11. GitHub version prefixes (preserve existing prefixes; prepend `v` to numeric versions)

## adjust
1. UI
2. `sys-memory-sheet` UI
3. `nav-item` gradient hover effect
4. `nav-plane-svg` animation
5. `tags-container` available width
6. Filter Toast navigation button states
7. Disabled button cursor and tooltip opacity
8. System Memory descriptions and disabled option styles

## fix
1. UI shake and hover flickering
2. Interaction State (hidden elements blocking pointer events)
3. Hidden elements retaining keyboard focus
4. Lightbox reopening and delayed cleanup
5. System Toast animation timing
6. Invalid favicon references
7. Legacy domain resource references
8. Deployment script escaping
9. Single-item Filter Toast navigation
10. Duplicate and incorrect version prefixes
11. Incorrect Discord Embed colors caused by summary keywords
12. Duplicate Release titles in Discord notifications
13. Stale files in deployment staging

## deprecate
1. Branch-based deployment via `gh-pages`

## remove
1. Force-push deployment mechanism
2. System Memory source origin display
3. Redundant System Memory descriptions
4. Invalid 16×16 and 32×32 favicon references
5. Inline notification and public site preparation scripts from GitHub Actions workflows
6. Internal build tools, cache metadata, and source files from public deployment (`tools/`, `logs/`, root `README.md`, `api/**/meta.json`, `projects/**/detail.json`, `projects/**/index.md`)

## notice
1. The official domain has been changed to `azustock.com`.
2. Local storage is isolated between the old and new domains.
3. Existing System Memory backups remain compatible.
4. The new deployment workflow requires GitHub Pages Source to be set to GitHub Actions.
5. Public Site Inventory reports are available as a separate GitHub Actions artifact (`public-site-inventory`) for 30 days and are not published to the website.

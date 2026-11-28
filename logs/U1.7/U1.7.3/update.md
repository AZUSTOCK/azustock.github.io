## refactor
1. Unified site configuration (`site_config.json`) with build-time injection into frontend assets, theme/status palettes, and trackers
2. Reorganized `tools/` into modular subpackages with shared path, cache, and tracker utilities
3. Organized public resources (`content/`, `config/`) with path-independent hash identifiers separated from brand assets
4. In-memory version-aware frontend resource caching (replacing `localStorage` version map writes)
5. Unified article visibility rules and project status aggregation
6. Aligned changelog index and detail views with the `#view-index` / `#view-article` dual-view template
7. Consolidated shared helpers and stylesheet structure across `main.js`, `style.css`, `generate_projects.py`, and `tools/`

## add
1. Shared `site_config.json` with granular validation and standalone configuration sync
2. Unit and regression test suites covering site config, public resource caching, visibility/tags, expiration opt-out, and gallery/lightbox behavior
3. Article-level `skip_expiration_reminders` option and updated Markdown syntax/metadata examples
4. Inline SVG support for `social_links` icons in `main.js`
5. Automatic stale manifest key pruning in `webp_manifest.py`
6. Throttled background update checks on modal navigation with immediate no-cooldown checks via the version button

## change / update
1. Updated Python tool execution paths (`python -m tools.*`), `.gitignore`, and `check_exif` / `tracker` launchers
2. Updated GitHub Actions workflow caching (`api/`, `data_version.json`, `tools/.cache/`) and `main`-only Pages deployment gating
3. Dynamic theme CSS variable reading for `applyTheme()`, Discord release embeds, and Mermaid PNG export
4. Complete `cout` build/error summaries across tools and missing project cover warnings in `generate_projects.py`
5. Updated project tags and both marquee tracks dynamically when article visibility changes
6. PWA pull-to-refresh checkmark confirmation before handing off to the reload overlay
7. Automatically hid the leading `"-"` separator on wrapped index descriptions and removed gallery card border radius on hover

## fix
1. Inconsistent/duplicate status tag definitions and missing `LATEST` and `.group-color-5` palettes
2. Stale in-memory resource caches, concurrent loading conflicts, and resource fetches before data-version initialization
3. Windows CP950 encoding compatibility in unit tests and direct-script execution for `check_exif.py`
4. Visibility, unlock-state, status priority, tag filtering, and article count mismatches in cached project indices
5. Articles omitted from project indices when their group is undefined in project metadata
6. Gallery layout issues (phantom columns from empty paragraphs, scroll-hint scoping, caption overflow past bottom rounded corners)
7. Lightbox selection for repeated gallery images and safe-area `max-width` override on `.lightbox-caption`
8. Changelog TOC menu flicker and amplified vertical bounce when returning to deeply scrolled lists
9. Lingering reading progress bar on 404/403 modals and hardcoded `--c1-text` hover color on highlight list items

## remove
1. Hardcoded Discord status colors and shared resource paths
2. Reverse parsing of frontend sensitive templates and tag expiration settings
3. Obsolete `.build_cache.json` workflow cache entry
4. Pre-rendered hidden status tags and legacy marquee secret visibility logic
5. Legacy root-level scripts in `tools/` (including `tools/release.py`) after module reorganization
6. Automatic `.gitignore` mutation (`_ensure_gitignore`) in `webp_manifest.py`

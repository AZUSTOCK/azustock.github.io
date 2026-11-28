## refactor
1. Unified site configuration (Single Source of Truth)
2. Build-time configuration injection
3. Centralized theme and status tag palettes
4. Tools directory reorganization
5. Shared path and Python module management
6. Tracker configuration integration
7. Public resource directory organization
8. Centralized public resource paths and path-independent hash identifiers
9. Version-aware frontend resource caching
10. Separated runtime configuration from brand assets
11. Unified article visibility and project status aggregation

## add
1. Shared site_config.json
2. Configuration validation
3. Standalone configuration synchronization
4. Site configuration unit tests
5. Public resource path and frontend cache regression tests
6. Article syntax and metadata examples in the Markdown test document
7. Hidden article visibility and tag regression tests
8. Article-level `skip_expiration_reminders` for intentional expiration tests
9. Expiration reminder opt-out regression tests and syntax documentation
10. Inline SVG support for `social_links` icons in `main.js`
11. Automatic stale manifest key pruning in `webp_manifest.py`

## change / update
1. Python tool execution paths
2. GitHub Actions workflow caching (`api/`, `data_version.json`, `tools/.cache/`) and `main`-only Pages deployment gating
3. Unified status tag and expiration rules
4. Discord theme color resolution
5. Moved shared Markdown content to content/
6. Moved Mermaid styles to config/
7. Integrated the latest generator with unified configuration
8. Reorganized .gitignore
9. Updated project tags and both marquee tracks when article visibility changes
10. Dynamic theme CSS variable reading for `applyTheme()` and Mermaid PNG export
11. Granular `site_config.py` validation diagnostics and complete `cout` build/error summaries across tools

## fix
1. Inconsistent status tag definitions
2. Missing LATEST status palette
3. Duplicate configuration definitions
4. Stale in-memory resource caches and concurrent resource loading conflicts
5. Resource loading before data version initialization
6. Windows CP950 compatibility in unit tests (explicit UTF-8 encoding)
7. Missing unlocked articles in cached project indices
8. Hidden article status tags appearing before unlock or failing to appear after unlock
9. Status priority masking visible project tags
10. Tag filtering and article counts after visibility changes
11. Articles omitted from indices when their group is undefined in project metadata
12. Removed phantom gallery columns caused by empty Markdown paragraphs.
13. Restricted horizontal scroll hints to their own containers and preserved gallery row layouts.
14. Fixed Lightbox selection for repeated images in a gallery.

## remove
1. Hardcoded Discord status color definitions
2. Reverse parsing of frontend sensitive templates
3. Reverse parsing of frontend tag expiration settings
4. Obsolete .build_cache.json workflow cache entry
5. Hardcoded shared resource paths
6. Pre-rendered hidden status tags and legacy marquee secret visibility logic
7. Legacy root-level files in tools/ after module reorganization
8. Legacy tools/release.py and tools/deployment/release.py
9. One-time migration artifacts (`tools/MIGRATION.md`, `tools/config/migrate_resources.py`, `tools/config/generator_config_only.patch`) and migration-only tests
10. Redundant `.gitignore` rules already covered by `/tools/.cache/`
11. Automatic `.gitignore` mutation (`_ensure_gitignore`) in `webp_manifest.py`

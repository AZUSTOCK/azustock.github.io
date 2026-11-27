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
5. Tools migration documentation
6. Public resource migration tool
7. Resource migration and cache regression tests
8. Article syntax and metadata examples in the Markdown test document
9. Hidden article visibility and tag regression tests
10. Article-level `skip_expiration_reminders` for intentional expiration tests
11. Expiration reminder opt-out regression tests and syntax documentation

## change / update
1. Python tool execution paths
2. GitHub Actions tool integration
3. Unified status tag and expiration rules
4. Discord theme color resolution
5. Moved shared Markdown content to content/
6. Moved Mermaid styles to config/
7. Integrated the latest generator with unified configuration
8. Reorganized .gitignore
9. Updated project tags and both marquee tracks when article visibility changes

## fix
1. Inconsistent status tag definitions
2. Missing LATEST status palette
3. Duplicate configuration definitions
4. Legacy release writer compatibility
5. Stale in-memory resource caches and concurrent resource loading conflicts
6. Resource loading before data version initialization
7. Windows CP950 compatibility in unit tests (explicit UTF-8 encoding)
8. Missing unlocked articles in cached project indices
9. Hidden article status tags appearing before unlock or failing to appear after unlock
10. Status priority masking visible project tags
11. Tag filtering and article counts after visibility changes
12. Articles omitted from indices when their group is undefined in project metadata
13. Removed phantom gallery columns caused by empty Markdown paragraphs.
14. Restricted horizontal scroll hints to their own containers and preserved gallery row layouts.
15. Fixed Lightbox selection for repeated images in a gallery.

## deprecate
1. Legacy release.py for the current logs-based architecture
2. Previous tools directory paths

## remove
1. Hardcoded Discord status color definitions
2. Reverse parsing of frontend sensitive templates
3. Reverse parsing of frontend tag expiration settings
4. Obsolete .build_cache.json workflow cache entry
5. Hardcoded shared resource paths
6. Pre-rendered hidden status tags and legacy marquee secret visibility logic

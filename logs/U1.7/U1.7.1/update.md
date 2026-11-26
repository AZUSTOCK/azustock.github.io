## refactor
1. Shared release metadata and version tracking logic
2. Release validation architecture
3. Reorganized main.js into 9 sections with unified DOMContentLoaded and resize handlers.
4. Extracted shared helpers and consolidated inline SVGs into GLOBAL_SVGS.
5. Regrouped style.css layers, merged :root blocks, and removed duplicate overrides.

## add
1. Release integrity validation
2. System version consistency checks
3. Data version hash verification
4. API and media resource validation
5. Open Graph resource validation
6. PWA Manifest validation
7. Release validation summary in Public Site Inventory
8. Added unit tests for single-line triple-backtick code and shared SHA-256 caching.
9. Auto-downgrade wrapping spoilers to inline fade in horizontal and vertical layouts.
10. Date-based expiration for block and inline highlights (default downgrade to plain text, |EXPIRE to hide).
11. Build-time expiration reminders for Markdown highlights in generate_projects.py.
12. Added hidden and pinned trackers (track_hidden.py, track_pinned.py).
13. Multi-select badge (AND) and group (OR) filtering with color-coded active filter chips in Tracker.
14. Dark theme toggle in tracker.html matching main site palette.

## change / update
1. Shared SHA-256 hash cache between validation and inventory, and cached changelogs.json.
2. Updated getMermaidStyles() to use file-hash cache versioning.
3. Moved footer link hover styles to CSS and replaced reload(true) with reload().
4. Group-scoped MAIN content notice agreements
5. Updated track_tags.py to evaluate Markdown highlight expiration and mask inline code.
6. Made tracker_web.py and tracker.html register tools and editable fields dynamically.

## adjust
1. Trimmed deploy.yml cache paths, simplified build command, and removed redundant exclusion entries.
2. Moved touch .mermaid-wrapper touch-action rule from JS to CSS.
3. MAIN content notice checkbox wording
4. Trimmed Tracker UI labels and isolated badge hover from record card hover.

## fix
1. Build continuation after version synchronization failure
2. Deployment of incomplete or inconsistent website data
3. Fixed local .svg build failures, share-page HTML/JS escaping, and version regex matching.
4. Fixed Markdown code-block rewriting and single-line triple-backtick validation bypass.
5. Fixed .is-key-locked and .group-header-title override conflicts and #toggle-sort-btn selector.
6. Fixed filter-toast SVG flash shift when closing Kotoba and duplicate scroll on 403 unlock.
7. Fixed the cursor on clickable article status badges in the article index.
8. Fixed CRLF line-ending matching in highlightBlockExtension.

## remove
1. Removed unused SVGs, no-op class toggles, and dead CSS rules.
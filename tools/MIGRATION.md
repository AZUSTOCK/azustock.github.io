# Unified Configuration, Tools & Public Resource Organization

## Apply

1. Back up or commit your current repository, especially `generate_projects.py`.
2. Copy the ZIP contents to the repository root. The two workflow paths must be preserved.
3. Delete only the old *relocated* source paths listed below (after confirming the new files exist). Do not delete the whole `tools/` folder: keep your local `.secrets.json`, `.cache/`, inventory, tracker backups and any extra tools.
4. The included `.gitignore` is based on the latest uploaded `.gitignore`; merge any newer local rules.
5. Migrate the five public resources as described below, then run the configuration check and tests, build and validate locally before pushing.

### Moved paths

| Old path relative to tools/ | New path relative to tools/ |
| --- | --- |
| build_cache.py | common/build_cache.py |
| cout.py | common/cout.py |
| clean_contents.py | build/clean_contents.py |
| update_paths.py | build/update_paths.py |
| convert_webp.py | media/convert_webp.py |
| webp_manifest.py | media/webp_manifest.py |
| crop_tool.html | media/crop_tool.html |
| image_resizer.html | media/image_resizer.html |
| prepare_public_site.py | deployment/prepare_public_site.py |
| release_validation.py | deployment/release_validation.py |
| release.py | deployment/release.py (legacy WIP; do not run with logs/) |
| discord_release.py | notifications/discord_release.py |
| test_public_site.py | tests/test_public_site.py |
| test_discord_release.py | tests/test_discord_release.py |
| check_exif.py | check_exif/check_exif.py |

Tracker and EXIF .bat launchers have been updated. Direct execution of Tracker scripts remains supported. Use `python -m` from the repository root for relocated Python tools. Update external scripts or editor tasks that refer to old locations.

### Source of truth

Edit `tools/config/site_config.json` for shared tags, colors, expiry rules, theme variables, site origin, banner, frontend settings and sensitive templates. Do not edit the generated marker regions in `main.js` or `style.css`. `VERSION` continues to come from the tracked logs in a full build; the standalone injector keeps the existing version. `DEBUG_FETCH_DELAY` comes from configuration in local mode and is forced to zero during CI.

`status.groups` defines group order and mutually exclusive tag priority. `status.tags` defines actual colors, `color_aliases` handles website/Discord palette aliases, and `discord_aliases` is Discord-only. `expirable_tags` determines which dated `tags[]` values expire. `metadata_flag_tags` determines which tags can be written as top-level metadata flags; unrelated flags (pinned, hidden, etc.) retain their existing meaning. The tracker still reports legacy unsupported flag names for cleanup. `LATEST` shares `NEW` color; `BUG` is a Discord alias for `HOTFIX`.

The site URL and banner are shared among Python generation, validation, JS's share link, and Discord. If changing domains or assets, also review HTML meta/link tags, PWA manifest, DNS, and repository Pages settings: these are not rewritten by this injection pass. `DATA_SOURCE` is intentionally constrained to the existing `all_projects.json` contract. No new runtime fetch is introduced.

### Commands (repository root)

```powershell
python -m tools.config.site_config
python -m tools.config.site_config --check
python -m unittest discover -s tools/tests -v
python generate_projects.py
python -m tools.deployment.prepare_public_site
python -m tools.notifications.discord_release --file update.md --tag U1.7.2.1 --preview
python -m tools.tracker.tracker --web
python -m tools.check_exif.check_exif --web
python -m tools.media.convert_webp
```

The standalone config command only injects JS/CSS. It does not rebuild minified assets, version files, or deploy. Run the generator for those outputs. Discord reads the JSON directly at execution time; publish the corresponding site build before notifying when changing colors.

### Public resource migration (Phase 2.1)

The actual Markdown and Mermaid text files were not supplied; the archive does not contain dummy content. From the repository root, preview and apply the move:

```powershell
python -m tools.config.migrate_resources
python -m tools.config.migrate_resources --apply
```

| Old root path | New path |
| --- | --- |
| kotoba.md | content/kotoba.md |
| quotes.md | content/quotes.md |
| credits.md | content/credits.md |
| COPYRIGHT.md | content/COPYRIGHT.md |
| mermaid_styles.txt (or assets/styles/mermaid_styles.txt from the previous package) | config/mermaid_styles.txt |

The helper checks all destinations first, refuses conflicts and symlinks, preserves bytes, and does not overwrite. If neither source nor destination exists, the optional file is reported missing. The helper migrates the five known public resources, including either historical Mermaid location. If both historical locations exist, or a historical location and the new destination both exist, it stops before moving any file; compare the files manually. `config/` is public runtime configuration, distinct from excluded `tools/config/`; `assets/` remains reserved for brand assets. Empty `assets/styles/` can be removed manually if no other files remain. for any future relocation, move the file yourself and edit `resources` in `tools/config/site_config.json`. Review `git status` and stage the moves in the same commit as code changes. Do not run migration during a build. Do not create placeholder Markdown files.

Resource paths are injected into `CONFIG.RESOURCES`; `data_version.json` now uses stable IDs `kotoba`, `quotes`, `credits`, `copyright`, `mermaid_styles`, `changelogs` (the remaining keys stay unchanged). New frontend code can read old filename keys from existing manifests/localStorage. A successful cache entry is tied to its Hash; failures are retryable. After the boot-time manifest check or any later localStorage manifest change, the next resource lookup uses the new Hash. This is not continuous polling or live replacement of already rendered content. The new paths are intentionally public. Project/article URLs, `?sys=credits`, `?sys=license`, PWA files, and System Memory keys remain unchanged. Old **direct file URLs** no longer exist after moving; update external links to those files and check relative links in the actual Markdown. Deploy the new paths and frontend together, with a tracked system version bump in logs, to reduce stale-client mismatch. No new version number is assigned here.

Release validation verifies hashes at configured paths. If a resource is still present only at a historical location, validation stops and asks for migration. Optional resources absent at both paths remain warnings, as before. The original `.build_cache.json` is no longer read by the latest supplied generator. Keep it ignored if present; it need not be migrated. CI no longer caches that unused path. Do not cache build lockfiles. The generator still uses its existing `api/**/meta.json` and local WebP manifest for incremental builds.

### Generator baseline

The included `generate_projects.py` is now based on the user's latest `generate_projects(7).py`, preserving its grouped/chunked changelog logic, content/asset hashes, targeted rebuilds, atomic writes, locks and cleanup. `generator_config_only.patch` is updated against that specific uploaded file (line endings normalized). The reorganized `tools/` and workflows are based on `Azustock_unified_config_tools.zip`. If the previous reorganization is already applied, do not delete files again; if not, use the old-to-new table above. Preserve any locally modified tools and private files. No public content is included in the ZIP.

### Verification

77 offline unit tests passed, including Node.js tests of the actual frontend resource-cache functions (skipped if Node is unavailable). For this runtime-config relocation, Python syntax, JS syntax and config injection check were rerun. YAML parsing and the actual latest generator's grouped changelog and resource hash functions were checked in the preceding package; neither the generator nor the workflows changed here. Minifier imports were stubbed only for the isolated generator test because rjsmin/rcssmin were unavailable; compression, full-site build with the actual content, Windows launchers and live GitHub Pages/Discord were not tested.

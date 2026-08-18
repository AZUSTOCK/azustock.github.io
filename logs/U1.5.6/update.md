## refactor
1. Cache engine (implemented MD5 Hash)
2. Separation of core data loading strategy

## add
1. Handle `MEDIA_NOT_FOUND` fallback
2. Hash dictionary in `contents.json` and `meta.json`
3. Micro-Version Check for `version.json` and `data_version.json`
4. Singleton Cache for `COPYRIGHT.md`, `credits.md`, and `changelogs.json`
5. Automated version update mechanism

## change / update
1. `generate_projects.py`: Updated `generate_version_json()`

## adjust
1. App name
2. Lightbox image transition behavior

## fix
1. SVG not showing issue
2. `handleImageError` logic
3. PWA-associated download issue
4. Lightbox broken image issue

## deprecate
1. Usage of `new Date().getTime()` for URL parameter `?t=...`
2. Cache busting based on `os.path.getmtime`
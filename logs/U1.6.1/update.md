## refactor
1. Decoupled `highlight` and `color` logic

## add
1. Custom group theme color support (`color` property in `detail.json` `groups`)
2. js, css loading error UI
3. lock & key behavior
4. track_keys.py

## change / update
1. Updated `.article-item-fallback` CSS selector
2. Clean index.html while packing
3. lock & key behavior

## adjust
1. Adjusted `.article-group-label` color
2. UI
3. topMargin
4. lock & key associated
5. -secret-pin

## fix
1. Fixed missing `${inlineStyles}` (`--current-group-color`) injection in the `.group-header`
2. scroll
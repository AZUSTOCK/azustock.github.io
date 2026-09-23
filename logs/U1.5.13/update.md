# Continuously updated

## refactor
1. `applyIndentToVerticalWrapper` to recursive 
2. Revert custom block extensions (`secretBlock`, `stealthBlock`, `highlightBlock`, `langBlock`, `detailsBlock`) regex to standard strict mode (`^:::`) to ensure robust Markdown parsing and prevent conflicts with lists and paragraphs.

## add
1. tag: FANART
2. Article Lock & Unlock

| type | block | inline |
| :--- | :--- | :--- |
| secret | `:::secret` | `!![]` |
| stealth | `:::stealth` | `??[]` |
| key |  | `++[KEY:id]++` |

3. Multilingual Support (Language Block & CSS `:lang` variables): `:::lang[ja]`
4. Language parameter support for Ruby Furigana: `^^Kanji(Furigana)[lang]^^` (defaults to `ja`).

## change / update
1. TOC change to read `innerHTML`

## adjust
1. Reboot URL Fallback
2. calculateIdealScrollCache position
3. group-header-cover behavior

## fix
1. marquee text animation in `.vertical-wrapper` scrolls bottom-to-top (`translateY`)
2. main page section animation behavior

## deprecate
1. 

## remove
1. Removed overly permissive regex (`^[ \t]*` and `\r?\n`) in custom block parsers to prevent unexpected formatting absorption.
2. unused fetch in index.html

## pending
1. 

## notice
1. For `sys_unlocked_secrets`

| session | local | 
| :--- | :--- | 
| `sessionStorage.getItem('sys_unlocked_secrets')` | `localStorage.getItem('sys_unlocked_secrets')` |
| `sessionStorage.setItem('sys_unlocked_secrets'` | `localStorage.setItem('sys_unlocked_secrets'` |
| `sessionStorage.getItem('sys_animated_secrets')` | `localStorage.getItem('sys_animated_secrets')` |
| `sessionStorage.setItem('sys_animated_secrets'` | `localStorage.setItem('sys_animated_secrets'` |
| (Console) remove key | `localStorage.removeItem('sys_unlocked_secrets')` |
| (Console) remove animate record | `sessionStorage.removeItem('sys_animated_secrets')`

> now `localStorage`
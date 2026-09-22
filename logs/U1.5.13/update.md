## refactor
1. `applyIndentToVerticalWrapper` to recursive 

## add
1. tag: FANART
2. Article Lock & Unlock

| type | block | inline |
| :--- | :--- | :--- |
| secret | `:::secret` | `!![]` |
| stealth | `:::stealth` | `??[]` |
| key |  | `++[KEY:id]++` |

## change / update
1. TOC change to read `innerHTML`

## adjust
1. Reboot URL Fallback
2. calculateIdealScrollCache position

## fix
1. 

## deprecate
1. 

## remove
1. 

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
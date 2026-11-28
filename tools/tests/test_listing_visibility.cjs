// Test actual frontend visibility/tag/sequence functions, independent of the browser.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('main.js', 'utf8');
function section(start, end) {
    const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
    assert(a >= 0 && b > a, start);
    return source.slice(a, b);
}
let override = false, keys = new Set(), frames = [], refreshes = 0;
const ctx = vm.createContext({window: {}, document: {body: {classList: {contains: () => override}}},
    sessionStorage: {getItem: () => null}, requestAnimationFrame: cb => (frames.push(cb), frames.length)});
vm.runInContext([
    section('window.STATUS_LIST = [', '// END GENERATED STATUS GROUPS'),
    section('window.isSystemOverrideActive =', 'window.showAccessDeniedToast ='),
    section('window.isListingVisible =', '// ==========================================\n// ✨ 機密檔案解鎖'),
    section('window.parseKeyLogic =', 'window.unlockSecret ='),
    section('window.getVisibleMarqueeTags =', 'window.createTickerTag ='),
    section('window.getArticleSequence =', '// ✨ 全域 SPA 路由跳轉攔截器')
].join('\n'), ctx);
const w = ctx.window;
w.SysStorage = {getSet: () => keys};
w.refreshHomeKeysUI = () => refreshes++;
const project = {id:'p', tags:['ordinary'], groups:{g:{}}, default_sort:'asc', articles:[
    {id:'public', group:'g', tags:['PATCH']},
    {id:'key-hidden', group:'g', required_key:'A|2', lock_mode:'hidden', tags:['MAJOR','OC','DEV']},
    {id:'override', is_hidden:true, tags:['HOTFIX','FANART']},
    {id:'both', is_hidden:true, required_key:'B', lock_mode:'hidden', tags:['WIP']},
    {id:'orphan', group:'removed', tags:[]},
    {id:'visible-lock', required_key:'C', lock_mode:'visible', tags:[]}
]};
const other = {id:'q', tags:['OC']};
const hiddenProject = {id:'r', tags:['ARCHIVED'], required_key:'D', lock_mode:'hidden'};
w.siteProjects = [project, other, hiddenProject];
const json = x => JSON.parse(JSON.stringify(x));
const tags = () => json(w.getProjectDisplayTags(project));
const ids = () => json(w.getArticleSequence('p').map(x => x.art.id));
const countMatches = () => assert.equal(w.getVisibleArticleCount(project), ids().length);
assert.deepEqual(tags(), ['PATCH','ordinary']);
assert.deepEqual(ids(), ['public','orphan','visible-lock']); countMatches();
assert.deepEqual(json(w.getVisibleMarqueeTags()), ['PATCH','ordinary','OC']);
keys.add('A#1'); assert.deepEqual(tags(), ['PATCH','ordinary']); countMatches();
keys.add('A#2'); assert.deepEqual(tags(), ['MAJOR','OC','DEV','ordinary']);
assert.deepEqual(ids(), ['public','key-hidden','orphan','visible-lock']); countMatches();
assert.deepEqual(json(w.getVisibleMarqueeTags()), ['MAJOR','OC','DEV','ordinary']);
assert.deepEqual(project.tags, ['ordinary']); // aggregation never overwrites metadata
assert.equal(w.isListingVisible(hiddenProject), false);
override = true;
assert.equal(w.isListingVisible(project.articles[3]), false); // override cannot bypass keys
assert.deepEqual(tags(), ['MAJOR','OC','FANART','DEV','ordinary']); countMatches();
keys.add('B'); assert.deepEqual(tags(), ['MAJOR','WIP','OC','FANART','DEV','ordinary']); countMatches();
keys.add('D'); assert.ok(w.getVisibleMarqueeTags().includes('ARCHIVED'));
override = false; keys.delete('A#2');
assert.deepEqual(tags(), ['PATCH','ordinary']); countMatches();
const newProject = {tags:[], articles:[{tags:['NEW']}]};
assert.deepEqual(json(w.getProjectDisplayTags(newProject)), ['UPDATED']);
newProject.is_new = true;
assert.deepEqual(json(w.getProjectDisplayTags(newProject)), ['NEW']);
w.scheduleListingRefresh(); w.scheduleListingRefresh();
assert.equal(w._listingRevision, 2); assert.equal(frames.length, 1); frames.shift()();
assert.equal(refreshes, 1); assert.equal(w._keysRefreshFrame, 0);
console.log('Listing visibility, status priority, marquee deduplication, group fallback, and coalescing passed.');

// Exercise the actual generated config and resource functions without loading the DOM.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const code = fs.readFileSync('main.js', 'utf8');
function extract(a, b) {
    const start = code.indexOf(a), end = code.indexOf(b, start + a.length);
    assert(start >= 0 && end > start);
    return code.slice(start, end);
}
let versions = {}, calls = [], pending = [];
const ctx = vm.createContext({
    window: {}, localStorage: { getItem: () => JSON.stringify(versions) },
    fetch: (url) => { calls.push(url); return new Promise(resolve => pending.push(resolve)); },
    AbortController, setTimeout, clearTimeout, console,
});
vm.runInContext(extract('const CONFIG = {','// END GENERATED SITE CONFIG') + '\n' +
    extract('window.readDataVersions = function','// ✨ 共用輔助函式') + '\n' +
    extract('const resourceCache = new Map();','// ==========================================\n// ✨ 全域共用輔助函式'), ctx);
const w = ctx.window;
const tick = () => new Promise(resolve => setImmediate(resolve));
const respond = (text, ok=true) => pending.shift()({ok, status: ok ? 200 : 404, text: async () => text});
async function main() {
    versions = {'kotoba.md':'old', 'changelogs.json':'oldlog'};
    assert.equal(w.getResVersion('kotoba'), 'old');
    assert.equal(w.getResVersion('changelogs'), 'oldlog');
    versions.kotoba = 'new';
    assert.equal(w.getResVersion('kotoba.md'), 'new');
    versions.kotoba = '';
    assert.notEqual(w.getResVersion('kotoba'), 'old');
    versions.kotoba = 'one';
    const a = w.getKotobaList(), b = w.getKotobaList();
    await tick(); assert.equal(calls.length, 1); assert.equal(calls[0], './content/kotoba.md?v=one');
    respond(' first --- second ');
    assert.equal(JSON.stringify(await a), '["first","second"]');
    await b; await w.getKotobaList(); assert.equal(calls.length, 1);
    versions.kotoba = 'two';
    const slow = w.getKotobaList(); await tick();
    versions.kotoba = 'three';
    const fresh = w.getKotobaList(); await tick();
    respond('stale'); await tick(); respond('fresh');
    assert.equal(JSON.stringify(await fresh), '["fresh"]');
    assert.equal(JSON.stringify(await slow), '["fresh"]');
    assert.equal(JSON.stringify(w.cachedKotobaList), '["fresh"]');
    versions['mermaid_styles.txt'] = 'legacy-mermaid';
    assert.equal(w.getResVersion('mermaid_styles'), 'legacy-mermaid');
    const fail = w.getMermaidStyles(); await tick(); respond('', false);
    assert.equal(await fail, '');
    const retry = w.getMermaidStyles(); await tick(); respond('classDef a fill:red');
    assert.equal(await retry, 'classDef a fill:red');
    assert.equal(calls.at(-1), './config/mermaid_styles.txt?v=legacy-mermaid');
    versions.quotes = 'q'; const quotes = w.getQuotesList(); await tick(); respond('quote');
    assert.equal(JSON.stringify(await quotes), '["quote"]');
    assert.equal(calls.at(-1), './content/quotes.md?v=q');
}
main().catch(error => { console.error(error); process.exitCode = 1; });

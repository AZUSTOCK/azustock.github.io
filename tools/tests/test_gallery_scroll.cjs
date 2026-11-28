// Regression checks against the actual shared horizontal scrolling and gallery helpers.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('main.js', 'utf8');
function section(start, end) {
    const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
    assert(a >= 0 && b > a, start);
    return source.slice(a, b);
}
const ctx = vm.createContext({window: {}, document: {getElementById: () => null}});
vm.runInContext([
    section('window.getHorizontalScrollGeometry =', '// ✨ 全域智慧跳轉提示引擎'),
    section('window.normalizeGalleryItems =', 'window.initArticleGalleries ='),
    section('window.openLightbox =', 'window.updateLightboxView =')
].join('\n'), ctx);
const w = ctx.window;
// Empty parser-generated paragraphs disappear; author content and identified nodes remain.
let removed = [];
const child = (tagName, textContent, attrs = [], children = []) => ({tagName, textContent, attributes:attrs, children, remove(){removed.push(this);}});
const empty = child('P', ''), whitespace = child('P', '\n '), figure = child('FIGURE','caption');
const text = child('P','Keep this'), identified = child('P','',['id']), markup = child('P','',[],['BR']);
w.normalizeGalleryItems({children:[empty, figure, whitespace, text, identified, markup]});
assert.deepEqual(removed, [empty, whitespace]);
// Transform-aware geometry; every operation only supplies left and behavior to this container.
function fixture(scale=1) {
    const c = {clientWidth: 320, offsetWidth: 322, clientLeft: 1, scrollWidth: 1000, scrollLeft:0,
        scrollTop:51, getBoundingClientRect(){return {left:100,width:this.offsetWidth*scale};},
        scrollTo(opts){assert.deepEqual(Object.keys(opts).sort(),['behavior','left']); this.scrollLeft=opts.left;},
        querySelectorAll(){return items;}};
    const items = [0,176,352,528,704,880].flatMap(x=>[0,1].map(()=>({offsetWidth:160,
        getBoundingClientRect(){return {left:100+(1+x-c.scrollLeft)*scale,width:160*scale};},
        scrollIntoView(){throw Error('Must not scroll ancestors');}})));
    return c;
}
for(const scale of [1,.95,1.25]) {
    const c=fixture(scale);
    w.scrollContainerByItem(c,'figure',1); assert.ok(Math.abs(c.scrollLeft-96)<.001);
    for(let i=0;i<8;i++)w.scrollContainerByItem(c,'figure',1);
    assert.equal(c.scrollLeft,680);
    for(let i=0;i<8;i++)w.scrollContainerByItem(c,'figure',-1);
    assert.equal(c.scrollLeft,0); assert.equal(c.scrollTop,51);
    w.centerHorizontalItem(c,c.querySelectorAll()[4]); assert.ok(Math.abs(c.scrollLeft-272)<.001);
}
const noOverflow=fixture();noOverflow.scrollWidth=noOverflow.clientWidth;w.scrollContainerByItem(noOverflow,'figure',1);assert.equal(noOverflow.scrollLeft,0);
// Same URL, separate figure and caption: click the second slide.
const img={getAttribute:()=>'/same.webp',src:'/same.webp'};
const figures=['A','B'].map(caption=>({querySelector(sel){return sel==='img'?img:{innerText:caption};}}));
const gallery={querySelectorAll:()=>figures};
w.openLightbox({closest:sel=>sel==='figure'?figures[1]:gallery},{stopPropagation(){}});
assert.equal(w.lightboxState.currentIndex,1);
assert.equal(w.lightboxState.images[1].figure,figures[1]);
assert.equal(w.lightboxState.images[1].caption,'B');
console.log('Gallery normalization, scoped scroll, transform scaling, multirow scrolling and duplicate-image selection passed.');

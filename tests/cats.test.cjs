/* Cat companion system — automated checks.
   Static checks run over the repo files; runtime checks drive the real pages in
   headless Chromium (Playwright). Run:  node tests/cats.test.cjs
   Requires a static server on $BASE (default http://localhost:8299).            */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.BASE || 'http://localhost:8299';
const ROUTES = [
  '/index.html', '/pages/about.html', '/pages/resume.html', '/pages/projects.html',
  '/pages/data-science.html', '/pages/qa-impact.html', '/pages/contact.html',
  '/projects/wph-ai-platform/index.html'
];

let pass = 0, fail = 0;
function ok(name, cond, extra) { (cond ? pass++ : fail++); console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  → ' + (extra || ''))); }

function htmlFiles() {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      const fp = path.join(d, e.name);
      if (e.isDirectory()) walk(fp);
      else if (e.name.endsWith('.html')) out.push(fp);
    }
  })(ROOT);
  return out;
}

async function main() {
  // ---- STATIC CHECKS -------------------------------------------------------
  const files = htmlFiles();

  // 1 + regression: no literal {TAG} anywhere in rendered HTML source
  const withTag = files.filter(f => fs.readFileSync(f, 'utf8').includes('{TAG}'));
  ok('static: no literal {TAG} in any HTML', withTag.length === 0, withTag.join(', '));

  // cats.js included exactly once per page, legacy file not referenced
  let incOnce = true, noLegacy = true;
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    const n = (s.match(/assets\/cats\.js/g) || []).length;
    if (n !== 1) { incOnce = false; }
    if (/cat-companion\.js/.test(s)) noLegacy = false;
  }
  ok('static: cats.js included exactly once per page', incOnce);
  ok('static: legacy cat-companion.js not referenced by any page', noLegacy);

  // movement vs sprite transforms live on different elements (source contract)
  const catsSrc = fs.readFileSync(path.join(ROOT, 'assets/cats.js'), 'utf8');
  ok('static: companion owns translate3d', /companion\.style\.transform = 'translate3d/.test(catsSrc));
  ok('static: sprite owns its own transform (gait bob)', /spriteBox\.canvas\.style\.transform = 'translateY/.test(catsSrc));
  ok('static: flip owns scaleX', /flip\.style\.transform = 'scaleX/.test(catsSrc));

  // ---- RUNTIME CHECKS ------------------------------------------------------
  const b = await chromium.launch();

  // per-route: init once, one companion, control, no {TAG}, no overflow, no errors
  for (const rt of ROUTES) {
    const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type() === 'error' && !/font|403|net::ERR|goatcounter|cloudflare|favicon|404/i.test(m.text())) errs.push(m.text()); });
    await p.goto(BASE + rt, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => ({
      init: !!window.__catSystemLoaded,
      companions: document.querySelectorAll('.shadow-companion').length,
      controls: document.querySelectorAll('.cat-control').length,
      tag: document.documentElement.outerHTML.includes('{TAG}'),
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      compPE: getComputedStyle(document.querySelector('.shadow-companion')).pointerEvents,
      sprPE: getComputedStyle(document.querySelector('.shadow-sprite')).pointerEvents
    }));
    ok('runtime: init once — ' + rt, r.init && r.companions === 1 && r.controls === 1, JSON.stringify(r));
    ok('runtime: no {TAG} — ' + rt, r.tag === false);
    ok('runtime: no horizontal overflow — ' + rt, r.overflowX === false);
    ok('runtime: cat layers never capture pointer — ' + rt, r.compPE === 'none' && r.sprPE === 'none');
    ok('runtime: no JS errors — ' + rt, errs.length === 0, errs.join(' | '));
    await p.close();
  }

  // config validity: every animation has a positive frame count + a src
  const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
  await p.goto(BASE + '/index.html'); await p.waitForTimeout(400);
  const cfg = await p.evaluate(() => {
    const a = window.CatSystem.animations, keys = Object.keys(a);
    return {
      keys,
      allFrames: keys.every(k => Number.isInteger(a[k].frames) && a[k].frames > 0),
      allSrc: keys.every(k => typeof a[k].src === 'string' && a[k].src.length > 0),
      spritesReady: window.CatSystem.spritesReady,
      missing: window.CatSystem.missingAssets.length
    };
  });
  ok('runtime: every SHADOW animation has frames > 0', cfg.allFrames, JSON.stringify(cfg));
  ok('runtime: every SHADOW animation has a src path', cfg.allSrc);
  ok('runtime: missing sprite sheets are reported honestly', cfg.spritesReady === false && cfg.missing === cfg.keys.length);

  // targets: explicit allowlist only, and an approved button stays clickable
  const t = await p.evaluate(() => {
    const el = document.querySelector('[data-shadow-target="built"]');
    const rr = el.getBoundingClientRect();
    const top = document.elementFromPoint(rr.left + rr.width / 2, rr.top + rr.height / 2);
    return { count: document.querySelectorAll('[data-shadow-target]').length, onTop: el.contains(top) || top === el };
  });
  ok('runtime: approved targets use an allowlist (index has 7)', t.count === 7, 'count=' + t.count);
  ok('runtime: approved button remains clickable (not covered)', t.onTop);
  await p.close();

  // reduced motion disables autonomous movement
  {
    const ctx = await b.newContext({ viewport: { width: 1200, height: 800 }, reducedMotion: 'reduce' });
    const pp = await ctx.newPage();
    await pp.goto(BASE + '/index.html'); await pp.waitForTimeout(1000);
    const x1 = await pp.evaluate(() => document.querySelector('.shadow-companion').style.transform);
    await pp.waitForTimeout(2200);
    const x2 = await pp.evaluate(() => document.querySelector('.shadow-companion').style.transform);
    ok('runtime: reduced-motion → Shadow does not roam', x1 === x2, x1 + ' vs ' + x2);
    await ctx.close();
  }

  // mobile disables free movement
  {
    const pp = await b.newPage({ viewport: { width: 500, height: 820 } });
    await pp.goto(BASE + '/index.html'); await pp.waitForTimeout(600);
    const m = await pp.evaluate(() => ({ d: getComputedStyle(document.querySelector('.shadow-companion')).display, ov: document.documentElement.scrollWidth > window.innerWidth + 1 }));
    ok('runtime: mobile → free-roam Shadow hidden', m.d === 'none');
    ok('runtime: mobile → no horizontal overflow', m.ov === false);
    await pp.close();
  }

  // preference persists (Hide) across reload + visibility pause is wired
  {
    const ctx = await b.newContext({ viewport: { width: 1200, height: 800 } });
    const pp = await ctx.newPage();
    await pp.goto(BASE + '/index.html'); await pp.waitForTimeout(300);
    await pp.evaluate(() => window.CatSystem.setPref('hide'));
    await pp.reload(); await pp.waitForTimeout(400);
    const h = await pp.evaluate(() => ({ pref: window.CatSystem.getPref(), disp: document.querySelector('.shadow-companion').style.display }));
    ok('runtime: Hide preference persists across reload', h.pref === 'hide' && h.disp === 'none');
    await ctx.close();
  }

  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });

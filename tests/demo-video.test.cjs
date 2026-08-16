/* Localized demo video — automated checks.
   Static (resolver/config) via require(); runtime (DOM) via Playwright.
   Run with a static server on $BASE (default http://localhost:8299):
     BASE=http://localhost:8299 node tests/demo-video.test.cjs                */
'use strict';
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const DV = require(path.resolve(__dirname, '..', 'assets', 'demo-video.js'));
const { DEMO_LOCALIZATION, resolveDemoMedia, isValidVideoId, validateConfig } = DV;

const BASE = process.env.BASE || 'http://localhost:8299';
const ALL = ['en','es','pl','uk','fr','ro','cs','no','is','sv','da','fi','et','lv','lt'];
const EN_ID = 'XlATAL1rO5w';

let pass = 0, fail = 0;
function ok(name, cond, extra) { (cond ? pass++ : fail++); console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  → ' + (extra || ''))); }

async function main() {
  // ── STATIC: resolver + config ─────────────────────────────────────────────
  // 1. English → English audio + English captions.
  {
    const m = resolveDemoMedia('en');
    ok('1. en → English audio + English captions',
      m.videoId === EN_ID && m.actualAudioLanguage === 'en' && m.captionLanguage === 'en' &&
      m.dubbed === true && !m.usedEnglishAudioFallback && !m.usedEnglishCaptionFallback, JSON.stringify(m));
  }

  // 2. A configured dubbed language selects its localized video.
  {
    const FAKE = 'ABCDEFGHIJK'; // valid 11-char format, not a real video
    const saved = { ...DEMO_LOCALIZATION.uk };
    DEMO_LOCALIZATION.uk = { videoId: FAKE, audioLanguage: 'uk', captionLanguage: 'uk', dubbed: true, captionsAvailable: true };
    const m = resolveDemoMedia('uk');
    ok('2. configured dubbed language uses its localized video',
      m.videoId === FAKE && m.actualAudioLanguage === 'uk' && m.dubbed === true &&
      !m.usedEnglishAudioFallback && m.captionLanguage === 'uk' && !m.usedEnglishCaptionFallback, JSON.stringify(m));
    DEMO_LOCALIZATION.uk = saved;
  }

  // 3. Localized captions but no dubbed video → English audio + localized captions.
  {
    const saved = { ...DEMO_LOCALIZATION.uk };
    DEMO_LOCALIZATION.uk = { videoId: null, audioLanguage: 'en', captionLanguage: 'uk', dubbed: false, captionsAvailable: true };
    const m = resolveDemoMedia('uk');
    ok('3. no dubbed id → English audio + localized (uk) captions',
      m.videoId === EN_ID && m.actualAudioLanguage === 'en' && m.usedEnglishAudioFallback === true &&
      m.captionLanguage === 'uk' && m.captionsAvailable === true && m.usedEnglishCaptionFallback === false, JSON.stringify(m));
    DEMO_LOCALIZATION.uk = saved;
  }

  // 4. No localized captions → English captions.
  {
    const m = resolveDemoMedia('es'); // default config: es captionsAvailable false
    ok('4. no localized captions → English captions',
      m.captionLanguage === 'en' && m.captionsAvailable === true && m.usedEnglishCaptionFallback === true, JSON.stringify(m));
  }

  // 5. Invalid language → English configuration.
  {
    const m = resolveDemoMedia('zz-INVALID');
    ok('5. invalid language → English configuration',
      m.selectedLanguage === 'en' && m.videoId === EN_ID && m.actualAudioLanguage === 'en' &&
      m.captionLanguage === 'en' && m.dubbed === true, JSON.stringify(m));
  }

  // 10. Placeholder/null IDs never reach a resolved videoId.
  {
    const bad = ALL.map(resolveDemoMedia).filter(m => !isValidVideoId(m.videoId));
    ok('10. resolver never returns an invalid/placeholder videoId', bad.length === 0, JSON.stringify(bad));
  }

  // 14. All 15 language configs pass validation.
  {
    const errs = validateConfig();
    const all15 = ALL.every(l => Object.prototype.hasOwnProperty.call(DEMO_LOCALIZATION, l));
    ok('14. all 15 configs valid', errs.length === 0 && all15 && Object.keys(DEMO_LOCALIZATION).length === 15, JSON.stringify(errs));
  }

  // ── RUNTIME: DOM behaviour ────────────────────────────────────────────────
  const b = await chromium.launch();

  async function freshPage() {
    const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
    // Count tk:langchange registrations before any page script runs (test 11).
    await p.addInitScript(() => {
      window.__tkLang = 0;
      const orig = document.addEventListener.bind(document);
      document.addEventListener = function (type) { if (type === 'tk:langchange') window.__tkLang++; return orig.apply(document, arguments); };
    });
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type() === 'error' && !/font|403|net::ERR|goatcounter|cloudflare|favicon|404/i.test(m.text())) errs.push(m.text()); });
    p._errs = errs;
    await p.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(500);
    return p;
  }

  // 6. Hero and inline demo stay synchronized.
  {
    const p = await freshPage();
    const r = await p.evaluate(() => {
      const hero = document.querySelector('[data-demo-link]');
      const embed = document.querySelector('[data-video]');
      const v = new URL(hero.href).searchParams.get('v');
      return { heroV: v, embedV: embed.dataset.video };
    });
    ok('6. hero + inline reference the same videoId', r.heroV === r.embedV && r.heroV === EN_ID, JSON.stringify(r));
    await p.close();
  }

  // 7. Language change resets an open player.
  {
    const p = await freshPage();
    await p.click('[data-video-play]');
    await p.waitForTimeout(200);
    const opened = await p.evaluate(() => !!document.querySelector('iframe.video-frame'));
    await p.evaluate(() => window.I18N.set('fr'));
    await p.waitForTimeout(200);
    const afterState = await p.evaluate(() => ({
      iframe: !!document.querySelector('iframe.video-frame'),
      facade: !!document.querySelector('[data-video-play]')
    }));
    ok('7. language change stops + removes the open player', opened && !afterState.iframe && afterState.facade, JSON.stringify({ opened, afterState }));
    await p.close();
  }

  // 8. Changing language never autoplays.
  {
    const p = await freshPage();
    let iframeSeen = false;
    for (const l of ['uk', 'ro', 'sv', 'en']) {
      await p.evaluate(x => window.I18N.set(x), l);
      await p.waitForTimeout(80);
      if (await p.evaluate(() => !!document.querySelector('iframe'))) iframeSeen = true;
    }
    ok('8. changing language never autoplays (no iframe appears)', !iframeSeen);
    await p.close();
  }

  // 9. Actual audio + subtitle languages appear in the accessibility label.
  {
    const p = await freshPage();
    await p.evaluate(() => window.I18N.set('en'));
    await p.waitForTimeout(80);
    const enAria = await p.evaluate(() => document.querySelector('[data-video-play]').getAttribute('aria-label'));
    await p.evaluate(() => window.I18N.set('uk'));
    await p.waitForTimeout(80);
    const ukAria = await p.evaluate(() => document.querySelector('[data-video-play]').getAttribute('aria-label'));
    ok('9. a11y label states actual audio + subtitles',
      /English audio/.test(enAria) && /English subtitles/.test(enAria) && / — /.test(ukAria) && / · /.test(ukAria),
      JSON.stringify({ enAria, ukAria }));
    await p.close();
  }

  // 10b. Placeholder/null never rendered in the DOM.
  {
    const p = await freshPage();
    const bad = await p.evaluate(() => {
      const embed = document.querySelector('[data-video]');
      const v = embed.dataset.video;
      return { v, isNull: v === 'null' || v === '' || v == null, placeholder: /VIDEO_ID/i.test(document.documentElement.innerHTML) };
    });
    ok('10b. no null/placeholder videoId in the rendered page', !bad.isNull && !bad.placeholder && bad.v === EN_ID, JSON.stringify(bad));
    await p.close();
  }

  // 11. Exactly one tk:langchange listener registered.
  {
    const p = await freshPage();
    const n = await p.evaluate(() => window.__tkLang);
    ok('11. exactly one tk:langchange listener', n === 1, 'count=' + n);
    await p.close();
  }

  // 12. Existing translation functionality still works.
  {
    const p = await freshPage();
    await p.evaluate(() => window.I18N.set('fr'));
    await p.waitForTimeout(80);
    const h1 = await p.evaluate(() => document.querySelector('[data-i18n="hero.h1"]').textContent);
    ok('12. translations still work after demo integration', /systèmes/.test(h1), h1);
    await p.close();
  }

  // 13. Selected language persists across reload; demo reflects it.
  {
    const p = await freshPage();
    await p.evaluate(() => window.I18N.set('sv'));
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => ({
      lang: window.I18N.get(),
      status: document.querySelector('[data-demo-status]').textContent
    }));
    ok('13. language persists across reload + demo status reflects it', r.lang === 'sv' && r.status.length > 0, JSON.stringify(r));
    await p.close();
  }

  // Bonus: no JS console errors on load.
  {
    const p = await freshPage();
    ok('runtime: no JS errors on load', p._errs.length === 0, p._errs.join(' | '));
    await p.close();
  }

  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });

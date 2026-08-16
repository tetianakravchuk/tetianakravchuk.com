/* ============================================================================
   demo-video.js — language-aware audio & subtitles for the WPH demo.

   ONE source of truth for demo media (DEMO_LOCALIZATION) + a pure resolver
   (resolveDemoMedia) + a DOM controller that keeps the hero link and the inline
   player in sync with the site language (window.I18N / the `tk:langchange`
   event). No second language state, no hard-coded English sentences, no
   invented video IDs.

   Three experiences, in resolution order:
     1. Localized dubbed video + localized subtitles   (dubbed video configured)
     2. English audio + localized subtitles            (localized captions only)
     3. English audio + English subtitles              (final fallback)

   IMPORTANT: caption tracks must actually be uploaded to the YouTube video.
   `captionsAvailable` in the config is the ONLY thing that makes the site claim
   a caption language exists — URL parameters alone cannot create captions.
   ========================================================================== */
(function (root) {
  'use strict';

  // ── Central configuration (the ONLY place video IDs live) ──────────────────
  // videoId: null  → no dubbed video yet; use the original English video.
  // dubbed:  true   → this video's own audio IS the selected language.
  // captionsAvailable: true → a caption track in captionLanguage is uploaded.
  //   (All non-English are false until the tracks are actually uploaded — the
  //    site must not claim captions that don't exist. Flip to true per language
  //    once you upload that caption track; no JS change needed.)
  var DEMO_LOCALIZATION = {
    en: { videoId: 'XlATAL1rO5w', audioLanguage: 'en', captionLanguage: 'en', dubbed: true,  captionsAvailable: true  },
    es: { videoId: null,          audioLanguage: 'en', captionLanguage: 'es', dubbed: false, captionsAvailable: false },
    pl: { videoId: null,          audioLanguage: 'en', captionLanguage: 'pl', dubbed: false, captionsAvailable: false },
    uk: { videoId: null,          audioLanguage: 'en', captionLanguage: 'uk', dubbed: false, captionsAvailable: false },
    fr: { videoId: null,          audioLanguage: 'en', captionLanguage: 'fr', dubbed: false, captionsAvailable: false },
    ro: { videoId: null,          audioLanguage: 'en', captionLanguage: 'ro', dubbed: false, captionsAvailable: false },
    cs: { videoId: null,          audioLanguage: 'en', captionLanguage: 'cs', dubbed: false, captionsAvailable: false },
    no: { videoId: null,          audioLanguage: 'en', captionLanguage: 'no', dubbed: false, captionsAvailable: false },
    is: { videoId: null,          audioLanguage: 'en', captionLanguage: 'is', dubbed: false, captionsAvailable: false },
    sv: { videoId: null,          audioLanguage: 'en', captionLanguage: 'sv', dubbed: false, captionsAvailable: false },
    da: { videoId: null,          audioLanguage: 'en', captionLanguage: 'da', dubbed: false, captionsAvailable: false },
    fi: { videoId: null,          audioLanguage: 'en', captionLanguage: 'fi', dubbed: false, captionsAvailable: false },
    et: { videoId: null,          audioLanguage: 'en', captionLanguage: 'et', dubbed: false, captionsAvailable: false },
    lv: { videoId: null,          audioLanguage: 'en', captionLanguage: 'lv', dubbed: false, captionsAvailable: false },
    lt: { videoId: null,          audioLanguage: 'en', captionLanguage: 'lt', dubbed: false, captionsAvailable: false }
  };

  var YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
  function isValidVideoId(id) { return typeof id === 'string' && YT_ID_RE.test(id); }

  // ── Resolver (pure) ─────────────────────────────────────────────────────────
  function resolveDemoMedia(selectedLanguage) {
    var en = DEMO_LOCALIZATION.en;
    // Invalid language code → use the complete English configuration.
    var known = Object.prototype.hasOwnProperty.call(DEMO_LOCALIZATION, selectedLanguage);
    var lang = known ? selectedLanguage : 'en';
    var cfg = DEMO_LOCALIZATION[lang];

    // Audio: dubbed video for this language if one exists, else English video.
    var videoId, actualAudioLanguage, dubbed, usedEnglishAudioFallback;
    if (cfg.dubbed && isValidVideoId(cfg.videoId)) {
      videoId = cfg.videoId;
      actualAudioLanguage = cfg.audioLanguage;
      dubbed = true;
      usedEnglishAudioFallback = false;
    } else {
      videoId = en.videoId;                 // original English video
      actualAudioLanguage = 'en';
      dubbed = false;
      usedEnglishAudioFallback = (lang !== 'en');
    }

    // Captions: selected language if available, else English, else none.
    var captionLanguage, captionsAvailable, usedEnglishCaptionFallback;
    if (cfg.captionsAvailable && cfg.captionLanguage) {
      captionLanguage = cfg.captionLanguage;
      captionsAvailable = true;
      usedEnglishCaptionFallback = false;
    } else if (en.captionsAvailable) {
      captionLanguage = en.captionLanguage; // 'en'
      captionsAvailable = true;
      usedEnglishCaptionFallback = (lang !== 'en');
    } else {
      captionLanguage = null;
      captionsAvailable = false;
      usedEnglishCaptionFallback = false;
    }

    return {
      selectedLanguage: lang,
      videoId: videoId,
      actualAudioLanguage: actualAudioLanguage,
      captionLanguage: captionLanguage,
      dubbed: dubbed,
      captionsAvailable: captionsAvailable,
      usedEnglishAudioFallback: usedEnglishAudioFallback,
      usedEnglishCaptionFallback: usedEnglishCaptionFallback
    };
  }

  // Validate the whole config (used by tests + a dev-time guard).
  function validateConfig() {
    var errors = [];
    if (!DEMO_LOCALIZATION.en || !isValidVideoId(DEMO_LOCALIZATION.en.videoId)) errors.push('en must have a valid videoId');
    Object.keys(DEMO_LOCALIZATION).forEach(function (l) {
      var c = DEMO_LOCALIZATION[l];
      if (c.videoId !== null && !isValidVideoId(c.videoId)) errors.push(l + ': invalid videoId "' + c.videoId + '"');
      if (c.dubbed && !isValidVideoId(c.videoId)) errors.push(l + ': dubbed=true requires a real videoId');
      if (typeof c.captionsAvailable !== 'boolean') errors.push(l + ': captionsAvailable must be boolean');
      if (typeof c.audioLanguage !== 'string') errors.push(l + ': audioLanguage must be a string');
    });
    return errors;
  }

  // Export the pure core for tests / other modules (Node + browser).
  var api = {
    DEMO_LOCALIZATION: DEMO_LOCALIZATION,
    resolveDemoMedia: resolveDemoMedia,
    isValidVideoId: isValidVideoId,
    validateConfig: validateConfig
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DemoVideo = api;

  // ── Browser controller ──────────────────────────────────────────────────────
  if (typeof document === 'undefined') return;

  function initController() {
    var embed = document.querySelector('[data-video]');
    var heroLink = document.querySelector('[data-demo-link]');
    if (!embed && !heroLink) return;              // demo not on this page

    var facade = embed ? embed.querySelector('[data-video-play]') : null;
    var status = document.querySelector('[data-demo-status]');
    var playerOpen = false;
    var escHandler = null;

    // Localized helpers (delegate to the shared i18n dictionaries).
    function t(key) { return (root.I18N && root.I18N.t) ? root.I18N.t(key) : key; }
    function currentLang() { return (root.I18N && root.I18N.get) ? root.I18N.get() : (document.documentElement.lang || 'en'); }

    function audioLabel(m) { return m.usedEnglishAudioFallback ? t('demo.audioEnglish') : t('demo.audioLocalized'); }
    function subLabel(m) {
      if (!m.captionsAvailable) return t('demo.subsUnavailable');
      return m.usedEnglishCaptionFallback ? t('demo.subsEnglish') : t('demo.subsLocalized');
    }
    function statusText(m) { return audioLabel(m) + ' · ' + subLabel(m); }
    function ariaFor(m, verbKey) { return t(verbKey) + ' — ' + audioLabel(m) + ' · ' + subLabel(m); }
    function iframeTitle(m) { return t('feat.videoLabel') + ' — ' + audioLabel(m) + ' · ' + subLabel(m); }

    function buildEmbedUrl(m) {
      // Only trusted, validated IDs from the config ever reach a URL.
      var url = 'https://www.youtube-nocookie.com/embed/' + m.videoId + '?rel=0&autoplay=1&playsinline=1';
      if (m.captionsAvailable && m.captionLanguage) {
        url += '&cc_load_policy=1&cc_lang_pref=' + encodeURIComponent(m.captionLanguage);
      }
      return url;
    }

    function trackDemo(m, location) {
      try {
        if (root.goatcounter && typeof root.goatcounter.count === 'function') {
          root.goatcounter.count({
            path: 'demo_opened',
            title: 'demo_opened lang=' + m.selectedLanguage +
              ' audio=' + m.actualAudioLanguage +
              ' cap=' + (m.captionLanguage || 'none') +
              ' dub=' + (m.dubbed ? 1 : 0) +
              ' enAudioFb=' + (m.usedEnglishAudioFallback ? 1 : 0) +
              ' enCapFb=' + (m.usedEnglishCaptionFallback ? 1 : 0) +
              ' loc=' + location,
            event: true
          });
        }
      } catch (e) { /* analytics must never break the demo */ }
    }

    function closePlayer(restoreFocus) {
      if (!playerOpen || !embed || !facade) return;
      embed.replaceChildren(facade);         // back to poster state
      playerOpen = false;
      if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
      if (restoreFocus && facade.focus) facade.focus();
    }

    function openPlayer() {
      if (!embed || !facade) return;
      var m = resolveDemoMedia(currentLang());
      if (!isValidVideoId(m.videoId)) return;   // never render an invalid/placeholder ID

      var wrap = document.createElement('div');
      wrap.className = 'video-frame-wrap';

      var iframe = document.createElement('iframe');
      iframe.className = 'video-frame';
      iframe.src = buildEmbedUrl(m);
      iframe.title = iframeTitle(m);
      iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'video-close';
      close.setAttribute('aria-label', t('demo.close'));
      close.textContent = '✕';
      close.addEventListener('click', function () { closePlayer(true); });

      wrap.appendChild(iframe);
      wrap.appendChild(close);
      embed.replaceChildren(wrap);
      playerOpen = true;

      escHandler = function (e) { if (e.key === 'Escape') { e.preventDefault(); closePlayer(true); } };
      document.addEventListener('keydown', escHandler);
      if (close.focus) close.focus();          // move focus into the player region

      trackDemo(m, 'inline');
    }

    // Update both entry points + status for the current language. Never autoplay.
    function render() {
      var m = resolveDemoMedia(currentLang());

      if (heroLink) {
        heroLink.href = 'https://www.youtube.com/watch?v=' + m.videoId;
        heroLink.setAttribute('aria-label', ariaFor(m, 'demo.watch'));
        heroLink.setAttribute('data-audio-lang', m.actualAudioLanguage);
        heroLink.setAttribute('data-caption-lang', m.captionLanguage || '');
      }

      if (embed) embed.dataset.video = m.videoId;   // keep the poster's id current

      if (facade) {
        facade.setAttribute('aria-label', ariaFor(m, 'demo.play'));
      }

      if (status) {
        status.textContent = statusText(m);
        // Extra context WITHOUT relying on color: a plain-text note + title.
        status.setAttribute('data-fallback', m.usedEnglishAudioFallback ? 'audio' : 'none');
        status.title = m.usedEnglishAudioFallback ? t('demo.playingEnglish') : '';
      }

      // If the player is open when the language changes: stop + remove the iframe,
      // return to poster, do NOT restart playback.
      if (playerOpen) closePlayer(false);
    }

    if (facade) facade.addEventListener('click', openPlayer);
    // Hero link opens YouTube externally — record it as a demo open too.
    if (heroLink) heroLink.addEventListener('click', function () { trackDemo(resolveDemoMedia(currentLang()), 'hero'); });

    // Single shared language state: react to the i18n language-change event.
    document.addEventListener('tk:langchange', render);

    // Initial paint (covers first load + a previously-saved language, since the
    // controller reads the current language rather than waiting for an event).
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initController);
  else initController();

})(typeof window !== 'undefined' ? window : globalThis);

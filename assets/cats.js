/* ============================================================================
   cats.js — the coordinated cat companion system for tetianakravchuk.com

   FOUR CATS, ONE VISUAL WORLD (sleek black cats, amber eyes, thin dark-blue
   collar, small amber tag):

     • SHADOW      — the only free-roaming cat. Walks, stretches, sits, jumps,
                     climbs and rubs against an explicit allowlist of buttons.
     • RÉSUMÉ CAT  — stationary landmark beside the résumé download action.
     • COFFEE CAT  — small secondary signature near the footer / lower-left.
     • BOOK CAT    — stationary sleeper tied to projects / case-study reading.

   ── RENDERING ───────────────────────────────────────────────────────────────
   Shadow is architected as a SPRITE state machine. Real sprite sheets are not
   in the repo yet (see SHADOW_ANIMATIONS[*].src — those files are missing), so
   `SPRITES_READY` is false and every cat falls back to a consistent procedural
   canvas renderer. When the sheets are added and SPRITES_READY flips true, the
   same state machine drives image frames instead — no other code changes.

   ── LAYERING (movement and sprite transforms never collide) ──────────────────
     .shadow-companion  → translate3d() page position + jump-arc Y  (JS/rAF)
       .shadow-flip     → scaleX(±1) facing direction only
         .shadow-sprite → the sprite frame / procedural canvas + gait bob
       .shadow-bubble   → optional speech (sibling of flip → never mirrored)

   ── PREFERENCES ──────────────────────────────────────────────────────────────
   A keyboard-accessible control persists 🐾 On / Quiet / Hide to localStorage.

   Public config (optional, set before load): window.CAT_SYSTEM = { coffeeUrl,
   resumeUrl, disabled }.
   ========================================================================== */
(function () {
  'use strict';

  if (window.__catSystemLoaded) return;
  window.__catSystemLoaded = true;

  var CFG = window.CAT_SYSTEM || {};
  if (CFG.disabled === true) return;

  // ── Shared constants ───────────────────────────────────────────────────────
  var RESUME_URL = CFG.resumeUrl || '/assets/resume/Tetiana_Kravchuk_Resume.pdf';
  var COFFEE_URL = CFG.coffeeUrl || 'https://buymeacoffee.com/tetianakravchuk';
  var MOBILE_BP  = 720;            // below this, Shadow does not roam freely
  var STORE_KEY  = 'tk-cats-pref'; // 'on' | 'quiet' | 'hide'

  var palette = {
    fur:      '#0b0b12',
    furHi:    'rgba(60,66,92,0.55)', // subtle charcoal highlight
    eye:      '#ffb43a',             // amber
    collar:   '#1e2a52',             // dark blue
    tag:      '#ffc24a',             // amber tag
    nose:     '#c98a95'
  };

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function isMobile() { return window.innerWidth < MOBILE_BP; }

  // ── Preference store ─────────────────────────────────────────────────────────
  var pref = 'on';
  try { pref = localStorage.getItem(STORE_KEY) || 'on'; } catch (e) {}
  if (['on', 'quiet', 'hide'].indexOf(pref) === -1) pref = 'on';
  function savePref(v) { pref = v; try { localStorage.setItem(STORE_KEY, v); } catch (e) {} apply(); }

  // Effective behavior flags derived from preference + environment.
  function showCats()      { return pref !== 'hide'; }
  function shadowRoams()   { return pref === 'on' && !reduceMotion && !isMobile(); }
  function ambientMotion() { return pref !== 'hide' && !reduceMotion; }

  /* ==========================================================================
     SHARED PROCEDURAL RENDERER — one cat drawn many poses so all four cats
     belong to the same visual world. Drawn facing RIGHT, feet on y=0 baseline,
     in a local space the caller scales. (This is the documented fallback for
     the not-yet-present sprite sheets.)
     ======================================================================== */
  function withCollar(ctx, hx, hy, s) {
    // thin dark-blue collar + small amber tag, just under the chin
    ctx.strokeStyle = palette.collar;
    ctx.lineWidth = 2.4 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(hx, hy + 8 * s, 9 * s, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = palette.tag;
    ctx.beginPath();
    ctx.arc(hx, hy + 16 * s, 2.4 * s, 0, 7);
    ctx.fill();
  }

  function eye(ctx, x, y, r, look) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    var g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4);
    g.addColorStop(0, palette.eye); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, 7); ctx.fill();
    ctx.restore();
    ctx.fillStyle = palette.eye;
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.92, r, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#160c02';
    ctx.beginPath(); ctx.ellipse(x + (look ? look.x : 0), y + (look ? look.y : 0), r * 0.28, r * 0.82, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.2, 0, 7); ctx.fill();
  }

  function head(ctx, hx, hy, s, opt) {
    opt = opt || {};
    ctx.fillStyle = palette.fur;
    // ears
    ctx.beginPath();
    ctx.moveTo(hx - 9 * s, hy - 4 * s); ctx.lineTo(hx - 13 * s, hy - 17 * s); ctx.lineTo(hx - 2 * s, hy - 9 * s); ctx.closePath();
    ctx.moveTo(hx + 9 * s, hy - 4 * s); ctx.lineTo(hx + 13 * s, hy - 17 * s); ctx.lineTo(hx + 2 * s, hy - 9 * s); ctx.closePath();
    ctx.fill();
    // skull
    ctx.beginPath(); ctx.ellipse(hx, hy, 12 * s, 10.5 * s, 0, 0, 7); ctx.fill();
    // charcoal highlight along the crown
    ctx.strokeStyle = palette.furHi; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.arc(hx, hy, 11 * s, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
    if (opt.closedEyes) {
      ctx.strokeStyle = '#2a2030'; ctx.lineWidth = 1.4 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx - 7 * s, hy - 1 * s); ctx.lineTo(hx - 3 * s, hy - 1 * s);
      ctx.moveTo(hx + 3 * s, hy - 1 * s); ctx.lineTo(hx + 7 * s, hy - 1 * s); ctx.stroke();
    } else {
      eye(ctx, hx - 4.6 * s, hy - 1 * s, 3.3 * s, opt.look);
      eye(ctx, hx + 4.6 * s, hy - 1 * s, 3.3 * s, opt.look);
    }
    ctx.fillStyle = palette.nose;
    ctx.beginPath(); ctx.moveTo(hx, hy + 3.4 * s); ctx.lineTo(hx - 1.6 * s, hy + 2 * s); ctx.lineTo(hx + 1.6 * s, hy + 2 * s); ctx.closePath(); ctx.fill();
    if (opt.collar) withCollar(ctx, hx, hy, s);
  }

  function leg(ctx, hx, dx, s) {
    ctx.strokeStyle = palette.fur; ctx.lineCap = 'round'; ctx.lineWidth = 4.4 * s;
    ctx.beginPath(); ctx.moveTo(hx, -12 * s); ctx.quadraticCurveTo(hx + dx * 0.5, -6 * s, hx + dx, -1 * s); ctx.stroke();
  }

  // pose ∈ sit|walk|stretch|sleep|crouch|reach|rub ; t = seconds (for cycles)
  function drawCat(ctx, pose, s, t, look) {
    ctx.save();
    // soft contact shadow
    ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 22 * s, 4.4 * s, 0, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = palette.fur;

    if (pose === 'sleep') {
      // curled sleeper
      ctx.beginPath(); ctx.ellipse(0, -9 * s, 26 * s, 12 * s, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = palette.fur; ctx.lineCap = 'round'; ctx.lineWidth = 6 * s;
      ctx.beginPath(); ctx.moveTo(20 * s, -8 * s); ctx.quadraticCurveTo(34 * s, -14 * s, 24 * s, -20 * s); ctx.stroke();
      // tucked head
      ctx.fillStyle = palette.fur;
      ctx.beginPath(); ctx.ellipse(-16 * s, -10 * s, 10 * s, 9 * s, 0, 0, 7); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-22 * s, -16 * s); ctx.lineTo(-26 * s, -26 * s); ctx.lineTo(-16 * s, -19 * s); ctx.closePath();
      ctx.moveTo(-12 * s, -17 * s); ctx.lineTo(-9 * s, -27 * s); ctx.lineTo(-6 * s, -18 * s); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2a2030'; ctx.lineWidth = 1.2 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-19 * s, -10 * s); ctx.lineTo(-15 * s, -10 * s); ctx.stroke();
      withCollar(ctx, -16 * s, -10 * s, s * 0.8);
      ctx.restore(); return;
    }

    if (pose === 'sit') {
      // curled tail
      ctx.save(); ctx.strokeStyle = palette.fur; ctx.lineCap = 'round'; ctx.lineWidth = 6 * s;
      ctx.beginPath(); ctx.moveTo(12 * s, -4 * s); ctx.quadraticCurveTo(26 * s, -6 * s, 22 * s, -18 * s);
      ctx.quadraticCurveTo(19 * s, -26 * s, 8 * s, -22 * s); ctx.stroke(); ctx.restore();
      // haunch + upright body
      ctx.beginPath();
      ctx.moveTo(-14 * s, -2 * s); ctx.quadraticCurveTo(-18 * s, -22 * s, -8 * s, -34 * s);
      ctx.quadraticCurveTo(-2 * s, -42 * s, 6 * s, -36 * s); ctx.quadraticCurveTo(16 * s, -30 * s, 15 * s, -12 * s);
      ctx.quadraticCurveTo(15 * s, -2 * s, 6 * s, -2 * s); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.strokeStyle = palette.fur; ctx.lineCap = 'round'; ctx.lineWidth = 5 * s;
      ctx.beginPath(); ctx.moveTo(-2 * s, -14 * s); ctx.lineTo(-4 * s, -1 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6 * s, -14 * s); ctx.lineTo(6 * s, -1 * s); ctx.stroke(); ctx.restore();
      head(ctx, -2 * s, -44 * s, s, { collar: true, look: look });
      ctx.restore(); return;
    }

    if (pose === 'stretch') {
      // front paws planted, hips raised, spine long (never slides — caller keeps x fixed)
      ctx.save(); ctx.strokeStyle = palette.fur; ctx.lineCap = 'round'; ctx.lineWidth = 6 * s;
      ctx.beginPath(); ctx.moveTo(18 * s, -18 * s); ctx.quadraticCurveTo(34 * s, -30 * s, 30 * s, -40 * s); ctx.stroke(); ctx.restore();
      leg(ctx, -18 * s, 0, s);           // planted front
      leg(ctx, 16 * s, 2 * s, s);        // raised hind
      ctx.beginPath();
      ctx.moveTo(-20 * s, -6 * s);
      ctx.quadraticCurveTo(-8 * s, -20 * s, 6 * s, -22 * s);
      ctx.quadraticCurveTo(20 * s, -24 * s, 20 * s, -14 * s);
      ctx.quadraticCurveTo(18 * s, -4 * s, 10 * s, -4 * s);
      ctx.lineTo(-14 * s, -3 * s); ctx.quadraticCurveTo(-22 * s, -3 * s, -20 * s, -6 * s); ctx.closePath(); ctx.fill();
      head(ctx, -22 * s, -6 * s, s, { collar: true, look: look }); // head low, forward
      ctx.restore(); return;
    }

    // quadruped: walk / crouch / reach / rub share a body with pose tweaks
    var swing = pose === 'walk' ? Math.sin(t * 9) : 0;
    var swing2 = pose === 'walk' ? Math.sin(t * 9 + Math.PI) : 0;
    var crouch = pose === 'crouch' ? 5 * s : 0;
    // tail
    ctx.save(); ctx.strokeStyle = palette.fur; ctx.lineCap = 'round'; ctx.lineWidth = 6 * s;
    var tsw = Math.sin(t * (pose === 'walk' ? 9 : 2)) * 5 * s;
    ctx.beginPath(); ctx.moveTo(15 * s, -14 * s + crouch); ctx.quadraticCurveTo(30 * s, -22 * s + tsw, 26 * s + tsw, -38 * s); ctx.stroke(); ctx.restore();
    // legs
    leg(ctx, 11 * s, swing2 * 5 * s, s);
    leg(ctx, -12 * s, swing * 5 * s, s);
    // body
    ctx.fillStyle = palette.fur;
    ctx.beginPath();
    ctx.moveTo(-16 * s, -8 * s + crouch); ctx.quadraticCurveTo(-20 * s, -30 * s + crouch, 0, -30 * s + crouch);
    ctx.quadraticCurveTo(20 * s, -30 * s + crouch, 18 * s, -10 * s + crouch);
    ctx.quadraticCurveTo(17 * s, -3 * s, 8 * s, -3 * s); ctx.lineTo(-8 * s, -3 * s);
    ctx.quadraticCurveTo(-16 * s, -3 * s, -16 * s, -8 * s + crouch); ctx.closePath(); ctx.fill();

    if (pose === 'reach') {
      // front paws raised up a surface (climb / reach)
      ctx.save(); ctx.strokeStyle = palette.fur; ctx.lineCap = 'round'; ctx.lineWidth = 5 * s;
      ctx.beginPath(); ctx.moveTo(-13 * s, -18 * s); ctx.quadraticCurveTo(-22 * s, -34 * s, -24 * s, -40 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-6 * s, -18 * s); ctx.quadraticCurveTo(-16 * s, -32 * s, -18 * s, -38 * s); ctx.stroke(); ctx.restore();
    } else {
      leg(ctx, 6 * s, swing * 5 * s, s);
      leg(ctx, -9 * s, swing2 * 5 * s, s);
    }
    head(ctx, -18 * s, -22 * s + crouch, s, { collar: true, look: look });
    ctx.restore();
  }

  // Helper: make a retina-crisp canvas of logical size (w,h).
  function makeCanvas(w, h, cls) {
    var c = document.createElement('canvas');
    c.className = cls;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    c.style.width = w + 'px'; c.style.height = h + 'px';
    var ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    return { canvas: c, ctx: ctx, w: w, h: h };
  }

  /* ==========================================================================
     SPRITE STATE CONFIG — centralized. Real sheets are MISSING today, so
     SPRITES_READY = false and the procedural poses above are used. Add the
     files at these paths and flip SPRITES_READY to true to go photo-real.
     ======================================================================== */
  var SHADOW_ANIMATIONS = {
    idle:      { src: '/assets/cats/shadow/idle.webp',      frames: 8,  fps: 6,  loop: true,  pose: 'sit' },
    'walk-side':  { src: '/assets/cats/shadow/walk-side.webp',  frames: 12, fps: 12, loop: true,  pose: 'walk' },
    'walk-front': { src: '/assets/cats/shadow/walk-front.webp', frames: 10, fps: 10, loop: true,  pose: 'walk' },
    stretch:   { src: '/assets/cats/shadow/stretch.webp',   frames: 9,  fps: 10, loop: false, pose: 'stretch' },
    sit:       { src: '/assets/cats/shadow/sit.webp',       frames: 6,  fps: 6,  loop: true,  pose: 'sit' },
    jump:      { src: '/assets/cats/shadow/jump.webp',      frames: 10, fps: 16, loop: false, pose: 'crouch' },
    climb:     { src: '/assets/cats/shadow/climb.webp',     frames: 12, fps: 12, loop: false, pose: 'reach' },
    'rub-button': { src: '/assets/cats/shadow/rub-button.webp', frames: 10, fps: 10, loop: false, pose: 'rub' },
    'rub-corner': { src: '/assets/cats/shadow/rub-corner.webp', frames: 10, fps: 10, loop: false, pose: 'rub' },
    sleep:     { src: '/assets/cats/shadow/sleep.webp',     frames: 6,  fps: 3,  loop: true,  pose: 'sleep' }
  };
  var SPRITES_READY = false; // no sheets present — see report / MISSING_ASSETS
  var MISSING_ASSETS = Object.keys(SHADOW_ANIMATIONS).map(function (k) { return SHADOW_ANIMATIONS[k].src; });
  window.__shadowMissingAssets = MISSING_ASSETS;

  /* ==========================================================================
     SHADOW — the interactive companion (three-layer DOM)
     ======================================================================== */
  var Shadow = (function () {
    var SIZE = 1.7; // scale of the procedural cat
    var SPRITE_W = 96, SPRITE_H = 92; // logical canvas box for the fallback

    var companion = document.createElement('div');
    companion.className = 'shadow-companion';
    companion.setAttribute('aria-hidden', 'true');
    var flip = document.createElement('div'); flip.className = 'shadow-flip';
    var spriteBox = makeCanvas(SPRITE_W, SPRITE_H, 'shadow-sprite');
    var bubble = document.createElement('div'); bubble.className = 'shadow-bubble'; bubble.hidden = true;
    flip.appendChild(spriteBox.canvas);
    companion.appendChild(flip);
    companion.appendChild(bubble);
    var sctx = spriteBox.ctx;

    // world state
    var state = { x: -80, y: 0, dir: 1, mode: 'idle', modeT: 0, bob: 0, t: 0 };
    var target = null;          // { el, kind } chosen approved target
    var seq = null;             // active behavior sequence generator state
    var groundY = 0;            // page-space Y of the walking baseline
    var running = false, raf = 0, last = 0;
    var nextActionAt = 0;       // scheduler
    var mounted = false;

    // Approved targets only (explicit allowlist).
    function approvedTargets() {
      var out = [];
      var nodes = document.querySelectorAll('[data-shadow-target]');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.closest('[data-shadow-ignore]')) continue;
        out.push(el);
      }
      return out;
    }

    function computeGround() {
      // Baseline = a believable "floor" near the bottom of the viewport, clear of
      // the hero text above and the fixed control/coffee cat below.
      groundY = Math.round(window.innerHeight - 118);
    }

    function setFacing(dir) {
      if (state.dir === dir) return;
      state.dir = dir;
      flip.style.transform = 'scaleX(' + dir + ')'; // flip ONLY on this element
    }

    function place() {
      // position ONLY on companion; never gait/flip here
      companion.style.transform = 'translate3d(' + state.x + 'px,' + (state.y) + 'px,0)';
    }

    function say(text, ms) {
      if (!text) { bubble.hidden = true; return; }
      bubble.textContent = text; bubble.hidden = false;
      clearTimeout(say._t); say._t = setTimeout(function () { bubble.hidden = true; }, ms || 2600);
    }

    // ---- rendering (fallback procedural; swap to sprite frames when ready) ----
    function render() {
      sctx.clearRect(0, 0, SPRITE_W, SPRITE_H);
      var pose = (SHADOW_ANIMATIONS[state.mode] && SHADOW_ANIMATIONS[state.mode].pose) || 'sit';
      sctx.save();
      sctx.translate(SPRITE_W / 2, SPRITE_H - 6);
      // eyes glance toward the last pointer position when idle/sitting
      var look = null;
      if ((pose === 'sit' || pose === 'idle') && pointer.seen) {
        var ex = state.x + SPRITE_W / 2, ey = state.y + SPRITE_H - 40;
        var dx = pointer.x - ex, dy = pointer.y - ey, d = Math.hypot(dx, dy) || 1;
        look = { x: (dx / d) * 1.2, y: (dy / d) * 1.4 };
      }
      drawCat(sctx, pose, SIZE, state.t, look);
      sctx.restore();
      // gait bob lives on the sprite element (separate from translate/flip)
      spriteBox.canvas.style.transform = 'translateY(' + state.bob.toFixed(2) + 'px)';
    }

    // ---- behavior sequences (distinct, non-teleporting) -----------------------
    function beginMode(mode, dur) { state.mode = mode; state.modeT = 0; state._dur = dur || 0; }

    // choose the next autonomous behavior
    function decide() {
      if (!shadowRoams()) { beginMode('sit'); return; }
      var roll = Math.random();
      if (roll < 0.5) {
        var ts = approvedTargets();
        if (ts.length) { target = ts[(Math.random() * ts.length) | 0]; startApproach(); return; }
      }
      if (roll < 0.72) { beginMode('stretch', 1.6); }
      else if (roll < 0.86) { walkTo(clamp(60 + Math.random() * (window.innerWidth - 120), 40, window.innerWidth - 60)); }
      else { beginMode('sit'); }
      // schedule the following action 18–35s out (randomized)
      nextActionAt = state.t + 18 + Math.random() * 17;
    }

    var walkGoal = null;
    function walkTo(px) { walkGoal = px; beginMode('walk-side'); }
    function startApproach() {
      // companion is position:fixed → work in VIEWPORT coords (rect is viewport).
      var r = target.getBoundingClientRect();
      var gx = r.left + r.width / 2;
      // stop just beside the target's near edge
      var standX = state.x < gx ? r.left - 24 : r.right + 24;
      walkGoal = clamp(standX, 30, window.innerWidth - 30);
      beginMode('walk-side');
      seq = { phase: 'approach' };
    }

    var WALK_SPEED = 82 * SIZE; // px/s, tuned so paws don't slide at this gait
    function update(dt) {
      state.t += dt; state.modeT += dt;
      var mode = state.mode;

      // gait bob only while walking
      state.bob = mode === 'walk-side' || mode === 'walk-front'
        ? Math.abs(Math.sin(state.t * 9)) * -2.4 : 0;

      if (mode === 'walk-side') {
        if (walkGoal != null) {
          var dir = walkGoal < state.x ? -1 : 1; setFacing(dir);
          var step = WALK_SPEED * dt;
          if (Math.abs(walkGoal - state.x) <= step) { state.x = walkGoal; walkGoal = null; arriveFromWalk(); }
          else state.x += dir * step;
        }
      } else if (mode === 'stretch') {
        if (state.modeT >= state._dur) decide();
      } else if (mode === 'jump') {
        // parabolic arc handled on companion Y; sprite shows crouch/extend
        var p = clamp(state.modeT / state._dur, 0, 1);
        state.y = groundY - Math.sin(p * Math.PI) * (jump_.h) - (jump_.rise * p);
        state.x = jump_.x0 + (jump_.x1 - jump_.x0) * p;
        if (p >= 1) { state.y = jump_.y1; onPerch(); }
      } else if (mode === 'climb') {
        var pc = clamp(state.modeT / state._dur, 0, 1);
        state.y = jump_.y0 + (jump_.y1 - jump_.y0) * ease(pc);
        if (pc >= 1) onPerch();
      } else if (mode === 'sit') {
        // resting on a perch or the ground
        if (state.t >= nextActionAt && shadowRoams()) decide();
      } else if (mode === 'rub-button' || mode === 'rub-corner') {
        if (state.modeT >= state._dur) { pressPerchTarget(false); leaveTarget(); }
      }

      place(); render();
    }

    function arriveFromWalk() {
      if (seq && seq.phase === 'approach' && target) {
        // rub first, then climb/jump onto it, sit briefly, leave
        var r = target.getBoundingClientRect();
        setFacing(state.x < window.scrollX + r.left + r.width / 2 ? 1 : -1);
        seq.phase = 'rub';
        beginMode(Math.random() < 0.5 ? 'rub-button' : 'rub-corner', 1.5);
        nextActionAt = state.t + 24 + Math.random() * 11;
      } else {
        beginMode('sit'); nextActionAt = state.t + 18 + Math.random() * 17;
      }
    }

    var jump_ = { x0: 0, x1: 0, y0: 0, y1: 0, h: 60, rise: 0 };
    function leaveTarget() {
      // hop/climb back down and wander off
      var back = clamp(state.x + state.dir * -70, 40, window.innerWidth - 40);
      jump_ = { x0: state.x, x1: back, y0: state.y, y1: groundY, h: 26, rise: 0 };
      seq = null; target = null;
      beginMode('jump', 0.42);
    }

    function onPerch() {
      state.mode = 'sit'; state.modeT = 0;
      // sit long enough to be noticed but not annoying, then leave
      nextActionAt = state.t + 1.6 + Math.random() * 1.2;
      var backToLeave = state.t; // schedule leave via decide replacement
      // override: after the brief sit, leave the perch
      setTimeout(function () { if (state.mode === 'sit' && target) leaveTarget(); }, 1800);
    }

    function afterRubClimb() {
      // recompute geometry NOW, in viewport coords (companion is fixed).
      var r = target.getBoundingClientRect();
      var topY = r.top;
      var landX = clamp(r.left + r.width * 0.5, r.left + 16, r.right - 16);
      var perchY = topY - (SPRITE_H - 20);
      var climbNeeded = (groundY - topY) > 150; // far above the floor → climb, else jump
      jump_ = { x0: state.x, x1: landX, y0: state.y, y1: perchY, h: 62, rise: 0 };
      if (climbNeeded) { beginMode('climb', 0.9); }
      else { beginMode('jump', 0.5); }
    }

    // hook: when a rub sequence ends we go climb/jump; onPerch sits; then leave
    var _origBegin = beginMode;
    function pressPerchTarget(active) {
      if (!target) return;
      // brief visual "pressed" state — never actually triggers the link
      target.classList.toggle('shadow-pressed', !!active);
    }

    // Advance from rub → climb inside update()'s rub branch end:
    // (we piggyback: when rub ends we call this instead of leaving directly)
    function rubThenClimb() { pressPerchTarget(true); afterRubClimb(); }

    // patch update's rub completion to climb instead of immediately leaving
    var _update = update;
    update = function (dt) {
      var wasRub = (state.mode === 'rub-button' || state.mode === 'rub-corner');
      var willEnd = wasRub && (state.modeT + dt) >= state._dur;
      if (willEnd) { state.modeT = 0; state.mode = 'sit'; pressPerchTarget(false); rubThenClimb(); place(); render(); return; }
      _update(dt);
    };

    // ---- pointer (eye tracking only) -----------------------------------------
    var pointer = { x: 0, y: 0, seen: false };

    // ---- loop -----------------------------------------------------------------
    function frame(ts) {
      if (!running) return;
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      update(dt);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    // ---- public ---------------------------------------------------------------
    function mount() {
      if (mounted) return; mounted = true;
      document.body.appendChild(companion);
      computeGround();
      state.y = groundY; state.x = -80; place();
      window.addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.seen = true; }, { passive: true });
    }
    function enter() {
      // quiet entrance from a safe edge, after the visitor has read the hero
      state.x = -80; state.y = groundY; setFacing(1);
      walkTo(Math.round(window.innerWidth * 0.28));
      nextActionAt = state.t + 6;
    }

    return {
      mount: mount,
      start: function () {
        computeGround(); state.y = state.mode === 'sit' ? groundY : groundY;
        if (shadowRoams()) {
          start();
          if (state.x < 0) setTimeout(enter, (5 + Math.random() * 3) * 1000); // 5–8s hero read
        } else if (ambientMotion()) {
          // quiet mode: rare idle/stretch, no roaming
          state.x = clamp(window.innerWidth * 0.28, 40, window.innerWidth - 60);
          beginMode('sit'); start();
        } else {
          state.x = clamp(window.innerWidth * 0.28, 40, window.innerWidth - 60);
          beginMode('sit'); render(); place();
        }
      },
      stop: stop,
      hide: function () { stop(); companion.style.display = 'none'; },
      show: function () { companion.style.display = ''; },
      recompute: function () { computeGround(); if (state.mode === 'sit' || state.mode === 'idle') { state.y = groundY; place(); } },
      el: companion
    };
  })();

  /* ==========================================================================
     STATIONARY CATS — résumé, coffee, book. Small canvases with subtle ambient
     motion (breath / tail / sleep-Z). Placed at [data-cat-spot="..."] anchors;
     coffee falls back to a fixed lower-left signature.
     ======================================================================== */
  function makeStationary(kind, host, opts) {
    opts = opts || {};
    var box = makeCanvas(opts.w || 92, opts.h || 84, 'cat-still cat-still-' + kind);
    box.canvas.setAttribute('aria-hidden', 'true');
    var wrap = document.createElement(opts.href ? 'a' : 'div');
    wrap.className = 'cat-still-wrap cat-still-' + kind + '-wrap';
    if (opts.href) { wrap.href = opts.href; wrap.setAttribute('rel', 'noopener'); if (opts.blank) wrap.target = '_blank'; wrap.setAttribute('aria-label', opts.label || (kind + ' cat')); }
    wrap.appendChild(box.canvas);
    if (opts.caption) { var cap = document.createElement('span'); cap.className = 'cat-still-cap'; cap.textContent = opts.caption; wrap.appendChild(cap); }
    host.appendChild(wrap);

    var t0 = 0, raf = 0, alive = false;
    function draw(t) {
      var ctx = box.ctx; ctx.clearRect(0, 0, box.w, box.h);
      ctx.save(); ctx.translate(box.w / 2, box.h - 6);
      var breath = ambientMotion() ? Math.sin(t * 1.6) * 0.4 : 0;
      ctx.translate(0, breath);
      var pose = kind === 'book' ? 'sleep' : 'sit';
      drawCat(ctx, pose, opts.scale || 1.5, t);
      ctx.restore();
      if (kind === 'book' && ambientMotion()) drawZ(ctx, box, t);
    }
    function loop(ts) { if (!alive) return; if (!t0) t0 = ts; var t = (ts - t0) / 1000; draw(t); raf = requestAnimationFrame(loop); }
    function start() { if (alive || !ambientMotion()) { draw(0); return; } alive = true; t0 = 0; raf = requestAnimationFrame(loop); }
    function stop() { alive = false; if (raf) cancelAnimationFrame(raf); }
    return { wrap: wrap, start: start, stop: stop, redraw: function () { draw(0); }, canvas: box.canvas };
  }
  function drawZ(ctx, box, t) {
    ctx.save(); ctx.fillStyle = 'rgba(30,42,82,0.55)'; ctx.font = '600 11px ui-monospace, monospace';
    var p = (t % 3) / 3; ctx.globalAlpha = 1 - p;
    ctx.fillText('z', box.w * 0.66, box.h * 0.34 - p * 14); ctx.restore();
  }

  /* ==========================================================================
     CONTROL — 🐾 On / Quiet / Hide (keyboard accessible, persisted)
     ======================================================================== */
  var control = document.createElement('button');
  control.type = 'button';
  control.className = 'cat-control';
  control.setAttribute('aria-label', 'Cat companion mode');
  function labelFor(p) { return p === 'on' ? '🐾 Cats: On' : p === 'quiet' ? '🐾 Cats: Quiet' : '🐾 Cats: Hidden'; }
  function refreshControl() { control.textContent = labelFor(pref); control.setAttribute('aria-pressed', pref !== 'hide'); control.title = 'Click to cycle: On → Quiet → Hide'; }
  control.addEventListener('click', function () {
    savePref(pref === 'on' ? 'quiet' : pref === 'quiet' ? 'hide' : 'on');
    refreshControl();
  });

  /* ==========================================================================
     ORCHESTRATION
     ======================================================================== */
  var stills = [];

  function buildStills() {
    stills.forEach(function (s) { s.stop(); if (s.wrap.parentNode) s.wrap.parentNode.removeChild(s.wrap); });
    stills = [];
    if (!showCats()) return;

    // Résumé cat — beside the résumé download action if a spot is provided.
    var rspot = document.querySelector('[data-cat-spot="resume"]');
    if (rspot) stills.push(makeStationary('resume', rspot, { scale: 1.4, label: 'Résumé cat' }));

    // Book / sleeping cat — projects / case-study reading.
    var bspot = document.querySelector('[data-cat-spot="book"]');
    if (bspot) stills.push(makeStationary('book', bspot, { scale: 1.5, w: 104, h: 74, label: 'Sleeping cat' }));

    // Coffee cat — small secondary signature. Prefer the footer so it stays out
    // of the hero's primary visual hierarchy; fall back to a fixed lower-left
    // host only if no footer exists on the page.
    var coffeeHost = document.querySelector('[data-cat-spot="coffee"]') || document.querySelector('.footer');
    var fixedFallback = false;
    if (!coffeeHost) { coffeeHost = document.createElement('div'); coffeeHost.className = 'cat-coffee-host'; document.body.appendChild(coffeeHost); fixedFallback = true; }
    var coffee = makeStationary('coffee', coffeeHost, {
      scale: 1.1, w: 70, h: 66, href: COFFEE_URL, blank: true,
      label: 'Buy me a coffee', caption: '☕ Buy me a coffee'
    });
    if (!fixedFallback) coffee.wrap.classList.add('cat-coffee-inline');
    stills.push(coffee);

    stills.forEach(function (s) { s.start(); });
  }

  function apply() {
    refreshControl();
    if (!showCats()) {
      Shadow.hide();
      buildStills();
      return;
    }
    Shadow.show();
    Shadow.start();
    buildStills();
  }

  function boot() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', boot); return; }
    document.body.appendChild(control);
    Shadow.mount();
    refreshControl();
    apply();

    // React to environment changes
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { Shadow.recompute(); }, 150); }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { Shadow.stop(); stills.forEach(function (s) { s.stop(); }); }
      else { if (showCats()) { Shadow.start(); stills.forEach(function (s) { s.start(); }); } }
    });
    try {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
        reduceMotion = e.matches; apply();
      });
    } catch (e) {}
  }

  // small utils
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // expose a tiny API for tests / debugging
  window.CatSystem = {
    getPref: function () { return pref; },
    setPref: savePref,
    animations: SHADOW_ANIMATIONS,   // exposed for the test suite
    missingAssets: MISSING_ASSETS,
    spritesReady: SPRITES_READY,
    shadowEl: function () { return Shadow.el; }
  };
})();

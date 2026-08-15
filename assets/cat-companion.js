/* ============================================================================
   Cat Companion — an interactive, animated black cat with heterochromia.

   A self-contained vanilla-JS overlay on a pointer-events:none canvas. The cat
   wanders the bottom of the viewport and, depending on nearby UI, leaps onto
   buttons or reaches up to scratch cards. Idle, it sits and tracks the cursor
   with its eyes (one yellow, one orange).

   ── RENDERING ──────────────────────────────────────────────────────────────
   Two interchangeable renderers behind one interaction "brain":

   1. SPRITE (photo-real): drop in a sprite-sheet PNG and describe its frame
      grid + clips via window.CAT_COMPANION.sprite. Frames sampled from real cat
      locomotion (hand-drawn / rotoscoped) give natural muscle, spine and tail
      motion the code can't. This is the intended production path.

   2. VECTOR (fallback): if no sprite sheet is configured or it fails to load,
      a procedural cat is drawn so the feature works out-of-the-box. It reads as
      a stylised silhouette, not a realistic cat — swap in a sheet for realism.

   The state machine, physics, pathfinding and DOM effects are identical for
   both renderers; only the pixels differ.

   ── SUPPLYING A SPRITE SHEET ────────────────────────────────────────────────
   Set BEFORE this script loads:

     window.CAT_COMPANION = {
       sprite: {
         src: 'cat-sprite.png',   // grid of equal-size frames, left→right, top→bottom
         frameW: 128, frameH: 128,// px per frame
         cols: 8,                 // frames per row in the sheet
         displayHeight: 66,       // on-screen cat height in CSS px (auto-scaled)
         footOffsetY: 6,          // px of transparent padding below the paws in-frame
         clips: {                 // frame indices (row-major) per animation
           idle:    { frames: [0,1,2,3],       fps: 6,  loop: true },
           walk:    { frames: [8,9,10,11,12,13,14,15], fps: 12, loop: true },
           jump:    { frames: [16,17,18,19,20,21],     fps: 0,  loop: false, progress: true },
           scratch: { frames: [24,25,26,27],   fps: 10, loop: true }
         },
         // Optional heterochromatic eye overlay drawn on top of the sprite so
         // the pupils can track the cursor. Anchors are in FRAME pixels
         // (measured from the frame's top-left). Omit `eyes` if your sheet
         // already bakes the two-colour eyes into every frame.
         eyes: { leftAnchor: { x: 54, y: 40 }, rightAnchor: { x: 74, y: 40 }, radius: 3.4 }
       }
     };

   `jump` should read takeoff → airborne → land across its frames; with
   progress:true the engine maps the leap arc (0→1) onto those frames so the
   pose stays in sync with the physics instead of a fixed fps.

   ── TARGETING (opt-in overrides, with sensible defaults) ────────────────────
     - data-cat-target="jump"     → cat prefers to jump onto this element
     - data-cat-target="scratch"  → cat prefers to scratch this element
     - data-cat-ignore            → cat never interacts with this element

   Other knobs: window.CAT_COMPANION = { scale, enabled, sprite }.
   ========================================================================== */
(function () {
  'use strict';

  if (window.__catCompanionLoaded) return;
  window.__catCompanionLoaded = true;

  var OPTS = window.CAT_COMPANION || {};
  if (OPTS.enabled === false) return;

  var prefersReduced = false;
  try {
    prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* older browsers */ }

  // --- Tunables ---------------------------------------------------------------
  var SCALE       = OPTS.scale || 1.6;      // overall cat size multiplier
  var GROUND_PAD  = 10;                      // px the feet sit above viewport bottom
  var WALK_SPEED  = 78 * SCALE;              // px / second
  var JUMP_REACH  = 210 * SCALE;             // max height (px) the cat will leap

  // Eyes — both orange. (Set EYE_LEFT to a different hue for a heterochromatic
  // cat; the assignment is anatomical so it stays consistent as the cat turns.)
  var EYE_ORANGE  = '#ff7a18';
  var EYE_LEFT    = EYE_ORANGE;   // cat's left  eye
  var EYE_RIGHT   = EYE_ORANGE;   // cat's right eye
  var FUR         = '#07070e';
  var FUR_HI      = 'rgba(70,70,90,0.0)';    // no rim needed — black cat on light bg

  // Target discovery selectors (defaults + opt-in data attributes).
  var SEL_JUMP    = '[data-cat-target="jump"], .button, .btn';
  var SEL_SCRATCH = '[data-cat-target="scratch"], .card, .profile-card, .onboarding-card, .auth-card, .tarot-table-card';
  var SEL_IGNORE  = '[data-cat-ignore]';

  // --- Sprite subsystem -------------------------------------------------------
  // Loads an optional sprite sheet and plays named clips. When absent/failed,
  // `sprite.ready` stays false and the vector renderer takes over automatically.
  var SP = OPTS.sprite || null;
  var sprite = {
    ready: false,
    img: null,
    frameW: SP ? (SP.frameW || 128) : 128,
    frameH: SP ? (SP.frameH || 128) : 128,
    cols: SP ? (SP.cols || 8) : 8,
    displayHeight: SP ? (SP.displayHeight || 66) : 66,
    footOffsetY: SP ? (SP.footOffsetY || 0) : 0,
    clips: SP ? (SP.clips || {}) : {},
    eyes: SP ? (SP.eyes || null) : null
  };

  if (SP && SP.src) {
    var im = new Image();
    im.onload = function () {
      sprite.img = im;
      sprite.ready = true;
      // If the sheet omits cols, infer from width.
      if (!SP.cols) sprite.cols = Math.max(1, Math.floor(im.width / sprite.frameW));
    };
    im.onerror = function () {
      // stay in vector fallback; log once for the developer
      if (window.console) console.info('[cat-companion] sprite sheet failed to load — using vector fallback:', SP.src);
    };
    im.src = SP.src;
  }

  // Animation controller: tracks the active clip + frame for the sprite renderer.
  var anim = { clip: null, name: '', frame: 0, t: 0 };

  function setClip(name) {
    if (anim.name === name) return;
    if (!sprite.clips[name]) return;
    anim.name = name;
    anim.clip = sprite.clips[name];
    anim.frame = 0;
    anim.t = 0;
  }

  function stepAnim(dt, progress) {
    var clip = anim.clip;
    if (!clip || !clip.frames || !clip.frames.length) return;
    if (clip.progress && typeof progress === 'number') {
      // physics-synced: map 0..1 onto the frame list
      var idx = Math.round(clamp(progress, 0, 1) * (clip.frames.length - 1));
      anim.frame = idx;
      return;
    }
    var fps = clip.fps || 8;
    anim.t += dt;
    var advance = Math.floor(anim.t * fps);
    if (advance > 0) {
      anim.t -= advance / fps;
      var next = anim.frame + advance;
      if (clip.loop) anim.frame = next % clip.frames.length;
      else anim.frame = Math.min(next, clip.frames.length - 1);
    }
  }

  // Map a behaviour state → sprite clip name (+ optional progress for jumps).
  function clipForState() {
    var s = cat.state;
    if (s === 'JUMP') return { name: 'jump', progress: cat.stateT / (cat.stateDur || 1) };
    if (s === 'DESCEND') return { name: 'jump', progress: 0.55 + 0.45 * (cat.stateT / (cat.stateDur || 1)) };
    if (s === 'SCRATCH') return { name: 'scratch' };
    if (s === 'IDLE' || s === 'ON_BUTTON' || cat.sit > 0.5) return { name: 'idle' };
    return { name: 'walk' };
  }

  // --- Overlay layer ----------------------------------------------------------
  var layer = document.createElement('div');
  layer.className = 'cat-companion-layer';
  layer.setAttribute('aria-hidden', 'true');

  var canvas = document.createElement('canvas');
  canvas.className = 'cat-companion-canvas';
  layer.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, DPR = 1;

  function mount() {
    (document.body || document.documentElement).appendChild(layer);
    resize();
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // keep the cat on-screen after a resize
    cat.x = clamp(cat.x, 40, W - 40);
    if (cat.state === 'WANDER' || cat.state === 'IDLE') cat.y = groundY();
  }

  function groundY() { return H - GROUND_PAD; }

  // --- Input ------------------------------------------------------------------
  var mouse = { x: W / 2, y: H / 2, seen: false };
  window.addEventListener('pointermove', function (e) {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.seen = true;
    if (prefersReduced) drawOnce(); // static mode still tracks eyes on demand
  }, { passive: true });

  // --- The cat ("brain" + body state) ----------------------------------------
  var cat = {
    x: 90 * SCALE,
    y: 0,
    facing: 1,           // 1 = right, -1 = left
    state: 'WANDER',     // WANDER | APPROACH_JUMP | JUMP | ON_BUTTON | DESCEND | APPROACH_SCRATCH | SCRATCH | IDLE
    wanderX: 0,
    stateT: 0,           // seconds elapsed in current state
    stateDur: 0,         // planned duration for timed states
    legPhase: 0,         // walk-cycle accumulator
    sit: prefersReduced ? 1 : 0, // 0 = standing quadruped, 1 = sitting
    scratchArm: 0,       // scratch reach 0..1 oscillation
    blink: 0,
    blinkTimer: 2 + Math.random() * 3,
    target: null,        // { el, rect, kind, ... }
    jumpFrom: null,
    jumpTo: null,
    cooldown: {}         // per-element interaction cooldown timestamps
  };
  cat.y = groundY();
  cat.wanderX = cat.x;

  // --- Target discovery -------------------------------------------------------
  function collectTargets() {
    var out = [];
    var ground = groundY();
    var seen = [];

    function scan(selector, kind) {
      var nodes;
      try { nodes = document.querySelectorAll(selector); } catch (e) { return; }
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (seen.indexOf(el) !== -1) continue;
        if (el.closest && el.closest(SEL_IGNORE)) continue;
        if (el.closest && el.closest('.cat-companion-layer')) continue;
        var r = el.getBoundingClientRect();
        if (r.width < 40 || r.height < 22) continue;          // too small to bother
        if (r.right < 8 || r.left > W - 8) continue;          // off-screen horizontally
        if (r.bottom < 0 || r.top > H) continue;              // off-screen vertically

        if (kind === 'jump') {
          // Reachable buttons: top edge sits within a leap of the ground.
          if (r.top > ground - 8) continue;                   // already below the cat
          if (ground - r.top > JUMP_REACH) continue;          // too high to reach
          if (r.width > 380) continue;                        // giant bars aren't perches
        } else {
          // Scratchable cards: must extend down near the ground band so the cat
          // can stand beside them and reach up.
          if (r.bottom < ground - 60) continue;               // floats too high above floor
          if (r.top > ground) continue;                       // entirely below viewport floor
        }
        seen.push(el);
        out.push({ el: el, rect: r, kind: kind });
      }
    }

    scan(SEL_JUMP, 'jump');
    scan(SEL_SCRATCH, 'scratch');
    return out;
  }

  function pickTarget() {
    var now = clock;
    var cands = collectTargets().filter(function (t) {
      var key = cat.cooldown[targetKey(t.el)];
      return !key || now - key > 9; // 9s cooldown per element
    });
    if (!cands.length) return null;
    // Prefer nearby targets, with a dash of randomness so it doesn't feel robotic.
    cands.sort(function (a, b) {
      return Math.abs(centerX(a.rect) - cat.x) - Math.abs(centerX(b.rect) - cat.x);
    });
    var pool = cands.slice(0, Math.min(4, cands.length));
    return pool[(Math.random() * pool.length) | 0];
  }

  var targetKeyMap = new WeakMap();
  var targetKeySeq = 0;
  function targetKey(el) {
    var k = targetKeyMap.get(el);
    if (!k) { k = ++targetKeySeq; targetKeyMap.set(el, k); }
    return k;
  }

  function centerX(r) { return r.left + r.width / 2; }

  // --- Behaviour (state machine) ---------------------------------------------
  function enter(state, dur) {
    cat.state = state;
    cat.stateT = 0;
    cat.stateDur = dur || 0;
  }

  function decide() {
    // Roughly 55% chance to seek a target, otherwise idle or wander.
    var roll = Math.random();
    if (roll < 0.55) {
      var t = pickTarget();
      if (t) {
        cat.target = t;
        if (t.kind === 'jump') enter('APPROACH_JUMP');
        else enter('APPROACH_SCRATCH');
        return;
      }
    }
    if (roll < 0.78) {
      enter('IDLE', 2.4 + Math.random() * 3.5);
    } else {
      cat.wanderX = 60 + Math.random() * (W - 120);
      enter('WANDER');
    }
  }

  function faceToward(x) { cat.facing = x < cat.x ? -1 : 1; }

  function stepToward(x, dt) {
    var dir = x < cat.x ? -1 : 1;
    cat.facing = dir;
    var dist = Math.abs(x - cat.x);
    var move = WALK_SPEED * dt;
    if (move >= dist) { cat.x = x; return true; }
    cat.x += dir * move;
    cat.legPhase += dt * 9;
    return false;
  }

  // --- Physics helpers --------------------------------------------------------
  function bezierArc(p0, p1, peakY, s) {
    // Quadratic-style arc with a lifted control point; s in [0,1].
    var cx = (p0.x + p1.x) / 2;
    var cy = peakY;
    var mt = 1 - s;
    return {
      x: mt * mt * p0.x + 2 * mt * s * cx + s * s * p1.x,
      y: mt * mt * p0.y + 2 * mt * s * cy + s * s * p1.y
    };
  }

  function update(dt) {
    cat.stateT += dt;

    // blinking (independent of state)
    cat.blinkTimer -= dt;
    if (cat.blinkTimer <= 0) { cat.blink = 1; cat.blinkTimer = 2.4 + Math.random() * 4; }
    if (cat.blink > 0) cat.blink = Math.max(0, cat.blink - dt * 7);

    var s = cat.state;

    if (s === 'WANDER') {
      cat.sit = approach(cat.sit, 0, dt * 6);
      var arrived = stepToward(cat.wanderX, dt);
      if (arrived) decide();

    } else if (s === 'IDLE') {
      cat.sit = approach(cat.sit, 1, dt * 4);
      // eyes track cursor while sitting (handled in draw)
      if (cat.stateT >= cat.stateDur) decide();

    } else if (s === 'APPROACH_JUMP') {
      cat.sit = approach(cat.sit, 0, dt * 6);
      var r = cat.target.rect = liveRect(cat.target.el, cat.target.rect);
      if (!r) { decide(); return; }
      var landX = clamp(centerX(r), r.left + 14, r.right - 14);
      if (stepToward(landX, dt) || Math.abs(cat.x - landX) < 2) {
        cat.jumpFrom = { x: cat.x, y: groundY() };
        cat.jumpTo   = { x: landX, y: r.top };
        faceToward(landX);
        enter('JUMP', 0.52);
      }

    } else if (s === 'JUMP') {
      var p = easeOut(cat.stateT / cat.stateDur);
      var peak = Math.min(cat.jumpFrom.y, cat.jumpTo.y) - 70 * SCALE;
      var pos = bezierArc(cat.jumpFrom, cat.jumpTo, peak, p);
      cat.x = pos.x; cat.y = pos.y;
      if (cat.stateT >= cat.stateDur) {
        cat.y = cat.jumpTo.y;
        pressButton(cat.target.el);
        cat.cooldown[targetKey(cat.target.el)] = clock;
        enter('ON_BUTTON', 0.7 + Math.random() * 0.5);
      }

    } else if (s === 'ON_BUTTON') {
      cat.sit = approach(cat.sit, 1, dt * 8);
      if (cat.stateT >= cat.stateDur) {
        var back = clamp(cat.jumpTo.x + (cat.facing * -40), 40, W - 40);
        cat.jumpFrom = { x: cat.x, y: cat.y };
        cat.jumpTo   = { x: back, y: groundY() };
        cat.sit = 0;
        enter('DESCEND', 0.42);
      }

    } else if (s === 'DESCEND') {
      var pd = easeIn(cat.stateT / cat.stateDur);
      var peakd = Math.min(cat.jumpFrom.y, cat.jumpTo.y) - 34 * SCALE;
      var posd = bezierArc(cat.jumpFrom, cat.jumpTo, peakd, pd);
      cat.x = posd.x; cat.y = posd.y;
      if (cat.stateT >= cat.stateDur) { cat.y = groundY(); cat.target = null; decide(); }

    } else if (s === 'APPROACH_SCRATCH') {
      cat.sit = approach(cat.sit, 0, dt * 6);
      var rc = cat.target.rect = liveRect(cat.target.el, cat.target.rect);
      if (!rc) { decide(); return; }
      // Stand just outside the nearer vertical edge and face the card.
      var fromLeft = Math.abs(cat.x - rc.left) < Math.abs(cat.x - rc.right);
      var standX = fromLeft ? rc.left - 20 * SCALE : rc.right + 20 * SCALE;
      standX = clamp(standX, 30, W - 30);
      cat.scratchEdge = fromLeft ? rc.left : rc.right;
      if (stepToward(standX, dt) || Math.abs(cat.x - standX) < 2) {
        cat.facing = fromLeft ? 1 : -1;   // face toward the card
        spawnScratchFx(cat.target.el, rc, fromLeft);
        cat.cooldown[targetKey(cat.target.el)] = clock;
        enter('SCRATCH', 1.3);
      }

    } else if (s === 'SCRATCH') {
      cat.sit = approach(cat.sit, 0, dt * 6);
      cat.scratchArm = (Math.sin(cat.stateT * 15) + 1) / 2;
      if (cat.stateT >= cat.stateDur) { cat.scratchArm = 0; cat.target = null; decide(); }
    }

    cat.x = clamp(cat.x, 22, W - 22);

    // Drive the sprite animation from the current behaviour state.
    if (sprite.ready) {
      var c = clipForState();
      setClip(c.name);
      stepAnim(dt, c.progress);
    }
  }

  // Re-measure a target; bail if it vanished or scrolled out of reach.
  function liveRect(el, prev) {
    if (!el || !el.isConnected) return null;
    var r = el.getBoundingClientRect();
    if (r.width < 20 || r.bottom < -40 || r.top > H + 40) return null;
    return r;
  }

  // --- Button press + scratch DOM effects ------------------------------------
  function pressButton(el) {
    if (!el || !el.classList) return;
    el.classList.add('cat-pressed');
    setTimeout(function () { el.classList.remove('cat-pressed'); }, 420);
  }

  function spawnScratchFx(el, rect, fromLeft) {
    // Positioned in the overlay layer at the card's edge — never touches the
    // card's own DOM or layout.
    var fx = document.createElement('div');
    fx.className = 'cat-scratch-fx';
    var h = Math.min(rect.height * 0.55, 120);
    var top = clamp(rect.bottom - h - 18, rect.top + 6, H - h);
    var x = fromLeft ? rect.left + 6 : rect.right - 34;
    fx.style.left = x + 'px';
    fx.style.top = top + 'px';
    fx.style.height = h + 'px';
    fx.innerHTML =
      '<svg viewBox="0 0 28 120" preserveAspectRatio="none" width="28" height="' + h + '">' +
      '<path d="M6 6 C10 40 8 80 4 114" /><path d="M14 2 C18 40 16 82 12 118" />' +
      '<path d="M22 8 C26 42 24 82 20 112" /></svg>';
    layer.appendChild(fx);
    setTimeout(function () { fx.classList.add('fade'); }, 520);
    setTimeout(function () { if (fx.parentNode) fx.parentNode.removeChild(fx); }, 1300);
  }

  // --- Drawing ----------------------------------------------------------------
  function drawScene() {
    ctx.clearRect(0, 0, W, H);
    drawCat();
  }

  function drawCat() {
    ctx.save();
    ctx.translate(cat.x, cat.y);

    // soft contact shadow (only when near the ground)
    var footGap = groundY() - cat.y;
    var shScale = clamp(1 - footGap / 260, 0.25, 1);
    ctx.save();
    ctx.globalAlpha = 0.28 * shScale;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, 1, 24 * SCALE * shScale, 5 * SCALE, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body: sprite renderer if a sheet is loaded, else vector fallback. The body
    // is drawn in this translated/flipped space; each renderer returns the eye
    // anchors in absolute WORLD coordinates.
    var eyes = sprite.ready ? drawSpriteBody() : drawVectorBody();

    // Restore to world space BEFORE drawing the eyes — their anchors are world
    // coords, so they must not be offset by the cat.x/cat.y translate above.
    ctx.restore();

    // Heterochromatic eyes drawn in world space (unflipped) so the slit pupils
    // can track the cursor. Skipped when a sprite bakes its own eyes in.
    if (eyes) {
      drawEye(eyes.left.x, eyes.left.y, EYE_LEFT, eyes.r);   // cat's left
      drawEye(eyes.right.x, eyes.right.y, EYE_RIGHT, eyes.r); // cat's right
    }
  }

  // Vector fallback body. Returns eye anchors derived from the drawn head.
  function drawVectorBody() {
    ctx.save();
    ctx.scale(cat.facing, 1);
    if (cat.sit > 0.5) drawSitting();
    else drawQuadruped();
    ctx.restore();

    var loc = cat._headLocal;
    if (!loc) return null;
    var S = loc.s;
    var hx = cat.x + cat.facing * loc.x;
    var hy = cat.y + loc.y;

    // nose
    ctx.fillStyle = '#d98a9a';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 3.5 * S);
    ctx.lineTo(hx - 1.6 * S, hy + 2 * S);
    ctx.lineTo(hx + 1.6 * S, hy + 2 * S);
    ctx.closePath();
    ctx.fill();

    // whiskers
    ctx.strokeStyle = 'rgba(240,233,212,0.5)';
    ctx.lineWidth = 0.8;
    for (var i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(hx + cat.facing * 2 * S, hy + 3 * S);
      ctx.lineTo(hx + cat.facing * 16 * S, hy + 3 * S + i * 3 * S);
      ctx.stroke();
    }

    var dx = 4.6 * S, ey = hy - 1 * S;
    return {
      left:  { x: hx - cat.facing * dx, y: ey },
      right: { x: hx + cat.facing * dx, y: ey },
      r: 3.4 * S
    };
  }

  // Sprite-sheet body. Draws the current frame flipped by facing, feet at (0,0).
  function drawSpriteBody() {
    var fw = sprite.frameW, fh = sprite.frameH;
    var scale = (sprite.displayHeight * SCALE) / fh;
    var destW = fw * scale, destH = fh * scale;
    var footOff = sprite.footOffsetY * scale;

    var clip = anim.clip || sprite.clips.idle || sprite.clips[Object.keys(sprite.clips)[0]];
    var frames = clip && clip.frames && clip.frames.length ? clip.frames : [0];
    var frameIndex = frames[Math.min(anim.frame, frames.length - 1)] || 0;
    var sx = (frameIndex % sprite.cols) * fw;
    var sy = Math.floor(frameIndex / sprite.cols) * fh;

    ctx.save();
    ctx.scale(cat.facing, 1);
    // bottom of the frame (minus transparent padding) sits at the cat's feet
    ctx.drawImage(sprite.img, sx, sy, fw, fh, -destW / 2, -destH + footOff, destW, destH);
    ctx.restore();

    // Eye overlay anchors, converted from frame pixels → world coords.
    if (!sprite.eyes) return null;
    var top = -destH + footOff;
    function toWorld(a) {
      var lx = (a.x - fw / 2) * scale;
      var ly = top + a.y * scale;
      return { x: cat.x + cat.facing * lx, y: cat.y + ly };
    }
    return {
      left: toWorld(sprite.eyes.leftAnchor),
      right: toWorld(sprite.eyes.rightAnchor),
      r: (sprite.eyes.radius || 3.4) * scale
    };
  }

  // Standing / walking / scratching quadruped, drawn facing right, feet at (0,0)
  function drawQuadruped() {
    var S = SCALE;
    var walk = (cat.state === 'WANDER' || cat.state === 'APPROACH_JUMP' || cat.state === 'APPROACH_SCRATCH');
    var swing = walk ? Math.sin(cat.legPhase) : 0;
    var swing2 = walk ? Math.sin(cat.legPhase + Math.PI) : 0;
    var bodyH = -20 * S;

    ctx.fillStyle = FUR;
    ctx.strokeStyle = FUR_HI;
    ctx.lineWidth = 1;

    // legs (behind body)
    legPath(11 * S, -1 * S, swing2 * 5 * S, S);   // back leg
    legPath(-12 * S, -1 * S, swing * 5 * S, S);   // front leg (far)

    // tail — sways; lifts when walking
    ctx.beginPath();
    var tsw = Math.sin((walk ? cat.legPhase : cat.stateT * 2)) * 6 * S;
    ctx.moveTo(15 * S, -14 * S);
    ctx.quadraticCurveTo(30 * S, -22 * S + tsw, 26 * S + tsw, -38 * S);
    ctx.lineWidth = 6 * S;
    ctx.strokeStyle = FUR;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = FUR_HI;

    // body
    ctx.beginPath();
    ctx.moveTo(-16 * S, -8 * S);
    ctx.quadraticCurveTo(-20 * S, -30 * S, 0 * S, -30 * S);
    ctx.quadraticCurveTo(20 * S, -30 * S, 18 * S, -10 * S);
    ctx.quadraticCurveTo(17 * S, -3 * S, 8 * S, -3 * S);
    ctx.lineTo(-8 * S, -3 * S);
    ctx.quadraticCurveTo(-16 * S, -3 * S, -16 * S, -8 * S);
    ctx.closePath();
    ctx.fill();

    // front legs (in front of body) — raised during scratch
    var reach = cat.state === 'SCRATCH' ? cat.scratchArm : 0;
    if (reach > 0) {
      // rear front-paw planted, near paw reaching up the card
      legPath(6 * S, -1 * S, 0, S);
      ctx.save();
      ctx.strokeStyle = FUR;
      ctx.lineCap = 'round';
      ctx.lineWidth = 5 * S;
      ctx.beginPath();
      ctx.moveTo(-13 * S, -18 * S);
      ctx.quadraticCurveTo(-22 * S, (-26 - reach * 14) * S, -24 * S, (-30 - reach * 16) * S);
      ctx.stroke();
      ctx.restore();
    } else {
      legPath(6 * S, -1 * S, swing * 5 * S, S);
      legPath(-9 * S, -1 * S, swing2 * 5 * S, S);
    }

    // head blob (silhouette; face detail added later in world space)
    drawHead(-18 * S, bodyH - 2 * S, S);
  }

  function drawSitting() {
    var S = SCALE;
    ctx.fillStyle = FUR;
    ctx.strokeStyle = FUR_HI;
    ctx.lineWidth = 1;

    // curled tail around the base
    ctx.save();
    ctx.strokeStyle = FUR; ctx.lineCap = 'round'; ctx.lineWidth = 6 * S;
    ctx.beginPath();
    ctx.moveTo(12 * S, -4 * S);
    ctx.quadraticCurveTo(26 * S, -6 * S, 22 * S, -18 * S);
    ctx.quadraticCurveTo(19 * S, -26 * S, 8 * S, -22 * S);
    ctx.stroke();
    ctx.restore();

    // haunch + upright body
    ctx.beginPath();
    ctx.moveTo(-14 * S, -2 * S);
    ctx.quadraticCurveTo(-18 * S, -22 * S, -8 * S, -34 * S);
    ctx.quadraticCurveTo(-2 * S, -42 * S, 6 * S, -36 * S);
    ctx.quadraticCurveTo(16 * S, -30 * S, 15 * S, -12 * S);
    ctx.quadraticCurveTo(15 * S, -2 * S, 6 * S, -2 * S);
    ctx.closePath();
    ctx.fill();

    // two front legs straight down
    ctx.save();
    ctx.strokeStyle = FUR; ctx.lineCap = 'round'; ctx.lineWidth = 5 * S;
    ctx.beginPath(); ctx.moveTo(-2 * S, -14 * S); ctx.lineTo(-4 * S, -1 * S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6 * S, -14 * S); ctx.lineTo(6 * S, -1 * S); ctx.stroke();
    // little paws
    ctx.lineWidth = 1; ctx.fillStyle = FUR;
    ctx.beginPath(); ctx.ellipse(-4 * S, -1 * S, 3 * S, 2 * S, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6 * S, -1 * S, 3 * S, 2 * S, 0, 0, 7); ctx.fill();
    ctx.restore();

    drawHead(-2 * S, -44 * S, S);
  }

  function drawHead(hx, hy, S) {
    ctx.fillStyle = FUR;
    // ears
    ctx.beginPath();
    ctx.moveTo(hx - 9 * S, hy - 4 * S);
    ctx.lineTo(hx - 13 * S, hy - 17 * S);
    ctx.lineTo(hx - 2 * S, hy - 9 * S);
    ctx.closePath();
    ctx.moveTo(hx + 9 * S, hy - 4 * S);
    ctx.lineTo(hx + 13 * S, hy - 17 * S);
    ctx.lineTo(hx + 2 * S, hy - 9 * S);
    ctx.closePath();
    ctx.fill();
    // skull
    ctx.beginPath();
    ctx.ellipse(hx, hy, 12 * S, 10.5 * S, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = FUR_HI; ctx.lineWidth = 1; ctx.stroke();

    // stash world head centre for the face pass
    cat._headLocal = { x: hx, y: hy, s: S };
  }

  // R = iris vertical radius (px). All eye features derive from R so this works
  // identically for the vector head and the sprite eye-overlay.
  function drawEye(ex, ey, color, R) {
    var blink = cat.blink;
    var rx = R * 0.94, ry = R * (1 - blink * 0.86);

    // glow
    ctx.save();
    ctx.globalAlpha = 0.5;
    var g = ctx.createRadialGradient(ex, ey, 0, ex, ey, R * 2.6);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(ex, ey, R * 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // iris
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    if (blink > 0.7) return;

    // slit pupil — tracks the cursor when idle/sitting
    var track = (cat.state === 'IDLE' || cat.sit > 0.5) && mouse.seen;
    var px = 0, py = 0;
    if (track) {
      var dx = mouse.x - ex, dy = mouse.y - ey;
      var d = Math.hypot(dx, dy) || 1;
      px = (dx / d) * R * 0.38;
      py = (dy / d) * R * 0.47;
    }
    ctx.fillStyle = '#0a0a06';
    ctx.beginPath();
    ctx.ellipse(ex + px, ey + py, R * 0.26, ry * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();

    // catch-light
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(ex - R * 0.29 + px * 0.4, ey - R * 0.35 + py * 0.4, R * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // one leg: hip at (hx,hy-ish), foot offset by `dx`
  function legPath(hx, hy, dx, S) {
    ctx.save();
    ctx.strokeStyle = FUR;
    ctx.lineCap = 'round';
    ctx.lineWidth = 4.5 * S;
    ctx.beginPath();
    ctx.moveTo(hx, -12 * S);
    ctx.quadraticCurveTo(hx + dx * 0.5, -6 * S, hx + dx, -1 * S);
    ctx.stroke();
    ctx.restore();
  }

  // --- small math helpers -----------------------------------------------------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function approach(v, target, step) {
    if (v < target) return Math.min(target, v + step);
    if (v > target) return Math.max(target, v - step);
    return v;
  }
  function easeOut(t) { t = clamp(t, 0, 1); return 1 - (1 - t) * (1 - t); }
  function easeIn(t) { t = clamp(t, 0, 1); return t * t; }

  // --- Loop -------------------------------------------------------------------
  var last = 0, clock = 0, rafId = 0, running = false;

  function frame(ts) {
    if (!running) return;
    if (!last) last = ts;
    var dt = Math.min(0.05, (ts - last) / 1000); // clamp big gaps (tab switches)
    last = ts;
    clock += dt;
    update(dt);
    drawScene();
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || prefersReduced) return;
    running = true; last = 0;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  // Reduced-motion: draw a single sitting cat, refresh only for eye tracking.
  function drawOnce() {
    cat.state = 'IDLE'; cat.sit = 1; cat.x = clamp(cat.x, 40, W - 40); cat.y = groundY();
    drawScene();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (!prefersReduced) start();
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resize(); if (prefersReduced) drawOnce(); }, 120);
  }, { passive: true });

  // React to motion-preference changes at runtime
  try {
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
      prefersReduced = e.matches;
      if (prefersReduced) { stop(); drawOnce(); } else { cat.sit = 0; start(); }
    });
  } catch (e) { /* legacy browsers */ }

  function boot() {
    mount();
    if (prefersReduced) { drawOnce(); return; }
    // Visible entrance: sit in view for a few seconds before wandering off, so
    // the cat is immediately noticeable on load instead of slipping past a corner.
    cat.x = clamp(W * 0.22, 60, W - 60);
    cat.y = groundY();
    cat.sit = 1;
    enter('IDLE', 3.6);
    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

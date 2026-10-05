/* ANSWERING THE DARK — pool.js  ·  POOLED PERCEPTION
   The flagship co-op mechanic: the Quiet sends ONE thought, split across four
   human senses. Each console perceives only its channel and cannot understand
   the phrase alone — the team must describe what they sense and pool it.

   A phrase carries hidden attributes. Each console perceives a subset, rendered
   in its own modality. Four candidate "reads" are offered; each console's channel
   rules some out, and ONLY by combining all four does exactly one read survive.
   That's the proof the mechanic requires pooling — not a gimmick. */
"use strict";
window.MC = window.MC || {};
MC.POOL = (function () {

  // ---- attribute vocabularies (the alien's dimensions of meaning) ----
  // motion: how the source moves · count: how many voices · warmth: emotional temperature
  // shape: the glyph it draws · pace: its rhythm
  const MOTION = { approach: "coming closer", recede: "drawing back", orbit: "circling", still: "holding still" };
  const WARMTH = { cold: "wary", cool: "calm", warm: "kind", glowing: "joyful" };
  const SHAPE  = { spiral: "a spiral (an invitation)", ring: "a ring (we are whole)", branch: "a branch (we are many)", wave: "a wave (hello)", point: "a single point (just me)" };

  // Which attributes each console can PERCEIVE (deliberate overlaps so the team triangulates)
  const CHANNELS = {
    COMMS:   ["pace", "warmth"],   // SPARROW — hears rhythm + tone
    SCIENCE: ["shape", "count"],   // HALO   — sees the drawn glyph
    NAV:     ["motion", "count"],  // COMPASS— feels where/how it moves
    POWER:   ["warmth", "pace"],   // AMP    — senses the energy pulse
  };

  // ---- the phrase library (Act I "learning to listen" set) ----
  // Each phrase: hidden truth + 4 candidate reads. Exactly one read is consistent
  // with ALL four channels; each channel eliminates a different wrong read.
  const PHRASES = [
    {
      truth: { motion: "approach", count: 3, warmth: "warm", shape: "wave", pace: "slow" },
      says: "Hello. We are three, and we come closer — gently.",
      reads: [
        "Hello. We are three, and we come closer — gently.",   // correct
        "Warning. We are many, and we are pulling away.",       // wrong motion/shape
        "Alone here. One of us. Holding very still.",           // wrong count/motion
        "Hurry. We are three, and we race toward you.",         // wrong pace
      ],
    },
    {
      truth: { motion: "orbit", count: 1, warmth: "cool", shape: "ring", pace: "steady" },
      says: "Just me. Calm. I will circle, so you can see all of me.",
      reads: [
        "Just me. Calm. I will circle, so you can see all of me.", // correct
        "Many of us, joyful, rushing in a spiral.",                // wrong count/warmth/shape
        "One of us, afraid, backing away.",                        // wrong warmth/motion
        "We are whole and we come straight at you, fast.",         // wrong motion/pace
      ],
    },
    {
      truth: { motion: "still", count: 5, warmth: "glowing", shape: "branch", pace: "slow" },
      says: "We are many — a whole people — overjoyed, and we hold still so as not to frighten you.",
      reads: [
        "We are many — a whole people — overjoyed, and we hold still so as not to frighten you.", // correct
        "One voice, wary, circling slowly.",                       // wrong count/warmth/motion
        "Many of us, joyful, but quick and coming closer.",        // wrong pace/motion
        "A few, calm, drawing a single point and drawing back.",   // wrong shape/count
      ],
    },
    {
      truth: { motion: "recede", count: 1, warmth: "cold", shape: "point", pace: "quick" },
      says: "One of us — frightened — pulls sharply back to a single point. We came too close, too fast. Forgive us.",
      reads: [
        "One of us — frightened — pulls sharply back to a single point. We came too close, too fast. Forgive us.", // correct
        "Many of us, joyful, drifting slowly closer.",             // wrong on nearly everything
        "One of us, calm, circling to be seen.",                   // wrong warmth/motion/pace
        "A whole people, wary, holding a branch, quite still.",    // wrong count/shape/motion
      ],
    },
    {
      truth: { motion: "orbit", count: 3, warmth: "warm", shape: "spiral", pace: "steady" },
      says: "Three of us — kindly — circle you in a slow spiral, an old, old invitation: come, walk inward with us.",
      reads: [
        "Three of us — kindly — circle you in a slow spiral, an old, old invitation: come, walk inward with us.", // correct
        "Three of us, kindly, coming straight at you in a rush.",  // wrong motion/pace
        "One of us, wary, drawing back from a spiral.",            // wrong count/warmth/motion
        "Many of us, joyful, holding a ring, perfectly still.",    // wrong count/shape/motion
      ],
    },
    {
      truth: { motion: "approach", count: 5, warmth: "glowing", shape: "ring", pace: "steady" },
      says: "All of us — whole and overjoyed — come near at a steady pace, offering the closed ring: you are one of us now.",
      reads: [
        "All of us — whole and overjoyed — come near at a steady pace, offering the closed ring: you are one of us now.", // correct
        "All of us, joyful, but drawing back and quick.",          // wrong motion/pace
        "One of us, calm, approaching with a single point.",       // wrong count/warmth/shape
        "Three of us, wary, holding a spiral, quite still.",       // wrong count/warmth/shape/motion
      ],
    },
    {
      truth: { motion: "still", count: 3, warmth: "cool", shape: "wave", pace: "steady" },
      says: "Three of us hold still and, calm and even, raise a simple wave — the first word anyone learns: hello.",
      reads: [
        "Three of us hold still and, calm and even, raise a simple wave — the first word anyone learns: hello.", // correct
        "Three of us, joyful, rushing in with a wave.",            // wrong warmth/motion/pace
        "One of us, wary, receding behind a ring.",                // wrong count/warmth/motion/shape
        "Many of us, kind, spiraling slowly closer.",              // wrong count/motion/shape/pace
      ],
    },
    // ── index 7 — easy ──
    {
      truth: { motion: "approach", count: 2, warmth: "warm", shape: "wave", pace: "steady" },
      says: "Two of us, kind, come near at an easy pace with an open wave: hello again — we remember you.",
      reads: [
        "Two of us, kind, come near at an easy pace with an open wave: hello again — we remember you.", // correct
        "Two of us, wary, backing away and hiding a wave.",        // wrong warmth/motion
        "Five of us, joyful, rushing a spiral at you.",            // wrong count/shape/pace
        "One of us, calm, holding a single point, still.",         // wrong count/shape/motion
      ],
    },
    // ── index 8 — easy ──
    {
      truth: { motion: "still", count: 1, warmth: "cool", shape: "point", pace: "slow" },
      says: "Just one of us — calm — holds a single still point, patient, in no hurry at all. Take your time.",
      reads: [
        "Just one of us — calm — holds a single still point, patient, in no hurry at all. Take your time.", // correct
        "Just one of us, joyful, racing closer with a wave.",      // wrong warmth/motion/shape/pace
        "Three of us, calm, holding still around a ring.",         // wrong count/shape
        "One of us, wary, drawing a spiral and backing off.",      // wrong warmth/shape/motion
      ],
    },
    // ── index 9 — hard ──
    {
      truth: { motion: "approach", count: 1, warmth: "glowing", shape: "spiral", pace: "quick" },
      says: "One of us, overjoyed, rushes in drawing a spiral — too eager, maybe; forgive the excitement. We just waited so long.",
      reads: [
        "One of us, overjoyed, rushes in drawing a spiral — too eager, maybe; forgive the excitement. We just waited so long.", // correct
        "One of us, joyful, slowly circling a spiral.",            // wrong motion/pace
        "One of us, wary, rushing in with a spiral.",              // wrong warmth
        "Five of us, joyful, rushing a spiral closer.",            // wrong count
      ],
    },
    // ── index 10 — hard · the "crisis" beat (a fast approach that ISN'T an attack) ──
    {
      truth: { motion: "approach", count: 5, warmth: "warm", shape: "ring", pace: "quick" },
      says: "All of us, warm, come FAST with a closing ring — not an attack: we're trying to hand you something before the moment passes. Please don't run.",
      reads: [
        "All of us, warm, come FAST with a closing ring — not an attack: we're trying to hand you something before the moment passes. Please don't run.", // correct
        "All of us, cold, attacking fast in a tightening ring.",   // wrong warmth (the fear-read — the trap)
        "All of us, warm, drifting slowly nearer with a wave.",    // wrong pace/shape
        "One of us, warm, rushing a single point at you.",         // wrong count/shape
      ],
    },
    // ── index 11 — hard ──
    {
      truth: { motion: "recede", count: 3, warmth: "cool", shape: "branch", pace: "slow" },
      says: "Three of us, calm, draw slowly back behind a branch — giving you room, not leaving. We'll be right here.",
      reads: [
        "Three of us, calm, draw slowly back behind a branch — giving you room, not leaving. We'll be right here.", // correct
        "Three of us, calm, coming closer past a branch.",         // wrong motion
        "Three of us, afraid, fleeing fast from a branch.",        // wrong warmth/pace
        "One of us, calm, receding slowly with a ring.",           // wrong count/shape
      ],
    },
    // ── index 12 — hard ──
    {
      truth: { motion: "orbit", count: 5, warmth: "glowing", shape: "wave", pace: "steady" },
      says: "All of us, joyful, circle you waving — a whole people saying hello at once, going around so everyone gets a turn to see you.",
      reads: [
        "All of us, joyful, circle you waving — a whole people saying hello at once, going around so everyone gets a turn to see you.", // correct
        "All of us, joyful, coming straight in, waving fast.",     // wrong motion/pace
        "All of us, wary, circling behind a spiral.",              // wrong warmth/shape
        "Three of us, joyful, circling with a wave.",              // wrong count
      ],
    },
    // ── index 13 — hard ──
    {
      truth: { motion: "still", count: 3, warmth: "cold", shape: "spiral", pace: "slow" },
      says: "Three of us hold still, wary, around a slow spiral — unsure, testing. Are you safe to invite inward? Show us gently.",
      reads: [
        "Three of us hold still, wary, around a slow spiral — unsure, testing. Are you safe to invite inward? Show us gently.", // correct
        "Three of us, joyful, still around a spiral.",             // wrong warmth
        "Three of us, wary, rushing a spiral at you.",             // wrong motion/pace
        "Five of us, wary, holding still around a ring.",          // wrong count/shape
      ],
    },
  ];

  // ---------- COMPOSE: the reply. The INVERSE mechanic. ----------
  // Now humanity speaks. The team agrees on an INTENT, and each console sets the
  // ONE dimension it controls. The message only "sings" when every console's
  // contribution matches the chosen intent — four senses making one thought.
  const CONTROLS = {   // which attribute each console composes
    COMMS:   "pace",   // the rhythm of our answer
    NAV:     "motion", // whether we approach, hold, circle
    SCIENCE: "shape",  // the glyph we draw back
    POWER:   "warmth", // the warmth we send
  };
  const CHOICES = {
    pace:   ["slow", "steady", "quick"],
    motion: ["approach", "still", "orbit", "recede"],
    shape:  ["wave", "ring", "spiral", "branch", "point"],
    warmth: ["cool", "warm", "glowing"],
  };
  const INTENTS = [
    { key: "hello",  human: "“Hello. We hear you.”",
      target: { pace: "slow", motion: "still", shape: "wave", warmth: "warm" },
      reply: "You raise a slow, warm wave and hold still — the whole team, one gesture. Across the dark, the Quiet answers with the same wave, learned in an instant. First contact, both ways." },
    { key: "peace",  human: "“We come in peace. Be calm.”",
      target: { pace: "slow", motion: "still", shape: "ring", warmth: "warm" },
      reply: "A slow, warm, closed ring, held perfectly still: nothing hidden, nothing rushing. The Quiet's frightened flicker steadies into a long, even glow. It believes you." },
    { key: "joy",    human: "“We are glad you're there. We come as friends.”",
      target: { pace: "steady", motion: "approach", shape: "wave", warmth: "glowing" },
      reply: "A glowing, steady approach with an open wave — not fear, not caution, just gladness. The Quiet brightens like a held breath let go, and comes to meet you halfway." },
    { key: "remember", human: "“We will remember you.” (the last word)",
      target: { pace: "slow", motion: "orbit", shape: "ring", warmth: "glowing" },
      reply: "Slowly, glowingly, you circle it in a closed ring — the shape of keeping, the shape of a promise that comes back around. The Quiet — the last memory of a vanished people — finally, for the first time in eons, is remembered. It resolves into a constellation of many faces, holds one note of light, and is not alone." },
  ];

  // ---------- ACT STRUCTURE + the Quiet's emotional arc ----------
  const ACTS = [
    { n: 1, tag: "ACT I · CONTACT", title: "Contact",
      intro: "Four billion kilometres out, AURORA hears it: a clean, patterned whisper from a stretch of charted-empty dark. It is faint, and shy, and it has been waiting a very long time to be answered. Learn to listen.",
      quiet: "wary — a faint, distant thing, unsure it should have spoken at all", pool: [0, 1, 4, 7, 8], count: 3 },
    { n: 2, tag: "ACT II · THE LONG LISTEN", title: "The Long Listen",
      intro: "It heard you hear it. Now it comes closer — brighter, braver, harder to read — testing whether you'll flinch. Every alarming thing it does is a misread kindness. Don't retreat. Stay, and understand.",
      quiet: "warming — closer now, learning your rhythm, daring to hope", pool: [2, 3, 5, 6, 9, 11, 12, 13], count: 4, always: [10] },
    { n: 3, tag: "ACT III · THE ANSWER", title: "The Answer",
      intro: "You understand it. Now it's your turn to speak. Humanity has to say something back across the dark — and you hold the pen. Build the reply together. Make it true.",
      quiet: "hopeful — holding its breath, waiting to hear what we are", pool: [], count: 0 },
  ];

  // ---------- the crew (solo voices; multiplayer identities) ----------
  const CREW = {
    COMMS:   { call: "SPARROW", name: "Perez",   report: (t) => `I've got the rhythm — it's ${t.pace}, and the tone… ${t.warmth === "cold" ? "thin, careful" : t.warmth === "cool" ? "even, calm" : t.warmth === "warm" ? "round and kind" : "bright, almost singing"}.` },
    NAV:     { call: "COMPASS", name: "Okonkwo", report: (t) => `Plotting ${t.count} source${t.count > 1 ? "s" : ""}, and they're ${MOTION[t.motion]}. That's not noise, Flight.` },
    SCIENCE: { call: "HALO",    name: "Vance",   report: (t) => `It's drawing something — ${SHAPE[t.shape].split(" (")[0]}, ${t.count} of them. It means something. I can feel it.` },
    POWER:   { call: "AMP",     name: "Rhee",    report: (t) => `Energy's ${t.pace}, running ${t.warmth === "cold" ? "faint" : t.warmth === "glowing" ? "hot and warm" : "steady"} — it's not draining us, it's… offering.` },
  };
  const BANTER = {
    win: ["HALO: See? It wasn't a threat. It never was.", "SPARROW: Nice, Flight. It heard us hear it.", "COMPASS: Cleanly read. It's getting braver.", "AMP: Whatever that was, it just relaxed — and so did I."],
    miss: ["SPARROW: Easy — it's patient. Let's read it again.", "AMP: We're okay. It didn't take it wrong.", "HALO: It's shy, not angry. Try once more.", "COMPASS: Recalculating. No harm done."],
  };
  const REVEAL = {
    title: "Will you remember us?",
    body: "As your answer crosses the dark, the Quiet finally lets you see it — not a ship, not a weapon: a mind. The last caretaker-mind of a whole vanished people, who poured every life and song and face into one keeper when their star died so that no one would be forgotten — and then were gone. It has kept them singing, alone, across eons, and it reached out for one reason: a memorial with no one left to remember it is the loneliest thing that can be. It resolves, for one held moment, into a constellation of many faces settling into a single note of light, and asks the only question it has ever wanted to ask. You already answered it. You listened. You will remember.",
  };

  // ---- render one channel's perception into a container ----
  function human(attr, val) {
    return ({ motion: MOTION, warmth: WARMTH, shape: SHAPE })[attr]?.[val] ?? val;
  }

  // COMMS: rhythm strip (visual) + Web Audio tone (pace = tempo, warmth = pitch)
  function renderComms(el, ph) {
    const pace = ph.truth.pace, warmth = ph.truth.warmth;
    const beats = pace === "slow" ? 3 : pace === "steady" ? 5 : 8;
    const dots = Array.from({ length: 8 }, (_, i) =>
      `<span class="pdot ${i < beats && i % (pace==="slow"?3:pace==="steady"?2:1)===0 ? 'on':''}"></span>`).join("");
    el.innerHTML = `<div class="ch-title">◗ SPARROW — you HEAR it</div>
      <div class="pace-strip">${dots}</div>
      <button class="pbtn play-tone">▶ replay the sound</button>
      <div class="ch-hint">Tempo: <b>${pace}</b>. Its tone feels <b>${warmth === 'cold' ? 'thin & wary' : warmth === 'cool' ? 'even & calm' : warmth === 'warm' ? 'round & kind' : 'bright & joyful'}</b>.</div>`;
    const freq = { cold: 210, cool: 300, warm: 420, glowing: 620 }[warmth];
    const gap = { slow: 0.5, steady: 0.32, quick: 0.16 }[pace];
    el.querySelector(".play-tone").onclick = () => playTone(freq, gap, beats);
  }

  // SCIENCE: canvas glyph (shape) repeated (count)
  function renderScience(el, ph) {
    el.innerHTML = `<div class="ch-title">◗ HALO — you SEE its shape</div>
      <canvas class="ch-canvas" width="300" height="150"></canvas>
      <div class="ch-hint">You count <b>${ph.truth.count}</b>, drawing <b>${SHAPE[ph.truth.shape].split(' (')[0]}</b>.</div>`;
    drawGlyphs(el.querySelector("canvas"), ph.truth.shape, ph.truth.count);
  }

  // NAV: canvas moving dots (motion) with count
  function renderNav(el, ph) {
    el.innerHTML = `<div class="ch-title">◗ COMPASS — you FEEL where it moves</div>
      <canvas class="ch-canvas" width="300" height="150"></canvas>
      <div class="ch-hint">You feel <b>${ph.truth.count}</b> source(s), <b>${MOTION[ph.truth.motion]}</b>.</div>`;
    animMotion(el.querySelector("canvas"), ph.truth.motion, ph.truth.count);
  }

  // POWER: canvas energy waveform (warmth = amplitude, pace = frequency)
  function renderPower(el, ph) {
    el.innerHTML = `<div class="ch-title">◗ AMP — you SENSE its pulse</div>
      <canvas class="ch-canvas" width="300" height="150"></canvas>
      <div class="ch-hint">The energy runs <b>${ph.truth.pace}</b>, and feels <b>${ph.truth.warmth === 'cold' ? 'faint' : ph.truth.warmth === 'glowing' ? 'strong & warm' : 'steady'}</b>.</div>`;
    animPulse(el.querySelector("canvas"), ph.truth.warmth, ph.truth.pace);
  }

  const RENDER = { COMMS: renderComms, SCIENCE: renderScience, NAV: renderNav, POWER: renderPower };

  // ---------- canvas drawing helpers ----------
  function drawGlyphs(cv, shape, count) {
    const c = cv.getContext("2d"), W = cv.width, H = cv.height;
    c.clearRect(0, 0, W, H); c.strokeStyle = "#7fd4ff"; c.lineWidth = 2; c.shadowColor = "#7fd4ff"; c.shadowBlur = 8;
    const step = W / (count + 1);
    for (let i = 1; i <= count; i++) {
      const x = step * i, y = H / 2, r = 22;
      c.beginPath();
      if (shape === "spiral") { for (let a = 0; a < 12; a += 0.3) { const rr = a * 1.6; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; a === 0 ? c.moveTo(px, py) : c.lineTo(px, py); } }
      else if (shape === "ring") c.arc(x, y, r, 0, Math.PI * 2);
      else if (shape === "branch") { c.moveTo(x, y + r); c.lineTo(x, y - r); c.moveTo(x, y); c.lineTo(x - r, y - r); c.moveTo(x, y); c.lineTo(x + r, y - r); }
      else if (shape === "wave") { for (let t = -r; t <= r; t++) { const py = y + Math.sin(t / 4) * 8; t === -r ? c.moveTo(x + t, py) : c.lineTo(x + t, py); } }
      else { c.arc(x, y, 4, 0, Math.PI * 2); }
      c.stroke();
    }
  }
  function animMotion(cv, motion, count) {
    const c = cv.getContext("2d"), W = cv.width, H = cv.height; let t = 0;
    const parts = Array.from({ length: count }, (_, i) => ({ off: i * 0.7 }));
    (function frame() {
      c.clearRect(0, 0, W, H); c.fillStyle = "#ffd27f"; c.shadowColor = "#ffd27f"; c.shadowBlur = 10;
      const p = (t % 100) / 100;
      parts.forEach((s, i) => {
        let x, y = H / 2 + (i - (count - 1) / 2) * 22;
        if (motion === "approach") x = 20 + p * (W - 40);
        else if (motion === "recede") x = (W - 20) - p * (W - 40);
        else if (motion === "orbit") { const a = p * Math.PI * 2 + s.off; x = W / 2 + Math.cos(a) * 60; y = H / 2 + Math.sin(a) * 40; }
        else x = W / 2 + Math.sin(t / 30 + s.off) * 6;
        c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill();
      });
      t++; cv._raf = requestAnimationFrame(frame);
    })();
  }
  function animPulse(cv, warmth, pace) {
    const c = cv.getContext("2d"), W = cv.width, H = cv.height; let t = 0;
    const amp = { cold: 10, cool: 22, warm: 34, glowing: 48 }[warmth];
    const freq = { slow: 0.05, steady: 0.11, quick: 0.22 }[pace];
    const col = { cold: "#6b8", cool: "#7fd", warm: "#fd9", glowing: "#fb6" }[warmth];
    (function frame() {
      c.clearRect(0, 0, W, H); c.strokeStyle = col; c.lineWidth = 2; c.shadowColor = col; c.shadowBlur = 10; c.beginPath();
      for (let x = 0; x < W; x++) { const y = H / 2 + Math.sin((x + t) * freq) * amp * (0.7 + 0.3 * Math.sin(t / 20)); x === 0 ? c.moveTo(x, y) : c.lineTo(x, y); }
      c.stroke(); t += 2; cv._raf = requestAnimationFrame(frame);
    })();
  }
  // Web Audio tone (COMMS)
  function playTone(freq, gap, beats) {
    try {
      const ctx = playTone._ctx || (playTone._ctx = new (window.AudioContext || window.webkitAudioContext)());
      let t = ctx.currentTime;
      for (let i = 0; i < beats; i++) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = freq; o.type = "sine"; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + gap * 0.8);
        o.start(t); o.stop(t + gap); t += gap;
      }
    } catch (e) {}
  }

  return {
    PHRASES, CHANNELS, RENDER, human,
    CONTROLS, CHOICES, INTENTS, ACTS, CREW, BANTER, REVEAL,
    banter(kind, seed) { const a = BANTER[kind]; return a[(seed >>> 0) % a.length]; },
    crewReport(role, ph) { const c = CREW[role]; return c ? `${c.call}: ${c.report(ph.truth)}` : ""; },
    // draw this act's phrase indices: guaranteed `always`, filled to `count` from the pool, shuffled
    drawAct(actIdx, seed) {
      const A = ACTS[actIdx]; if (!A || !A.count) return [];
      seed = (seed >>> 0) || 1;
      const shuf = (arr) => { for (let i = arr.length - 1; i > 0; i--) { seed = (seed * 9301 + 49297) % 233280; const j = Math.floor(seed / 233280 * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
      const always = (A.always || []).slice();
      const pool = shuf(A.pool.filter(i => !always.includes(i)));
      const out = always.concat(pool.slice(0, Math.max(0, A.count - always.length)));
      return shuf(out);
    },
    actLen() { return ACTS.reduce((n, a) => n + (a.count || 0), 0); },
    // how many of the message's dimensions match the chosen intent (0..4)
    harmony(compose, intent) {
      const dims = Object.values(CONTROLS);
      return dims.reduce((n, d) => n + (compose[d] === intent.target[d] ? 1 : 0), 0);
    },
    dimCount() { return Object.keys(CONTROLS).length; },
    pick(seed) { return PHRASES[(seed | 0) % PHRASES.length]; },
    // shuffle candidate order deterministically by seed, return {order, correctIdx}
    reads(ph, seed) {
      seed = (seed >>> 0) || 1;              // normalize: always a positive 32-bit int (negatives broke the modulo)
      const order = ph.reads.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const j = Math.floor((seed / 233280) * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      return { order, correctIdx: order.indexOf(0) };
    },
  };
})();

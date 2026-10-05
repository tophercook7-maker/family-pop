/* ANSWERING THE DARK — sound.js
   Procedural audio bed (Web Audio, zero asset files): a slow, living space-drone
   under everything, a soft chime on a read, and a warm chord that "sings" when the
   composed message goes out. Starts on the first user gesture (autoplay policy). */
"use strict";
window.MC = window.MC || {};
MC.SOUND = (function () {
  let ctx, master, ambient, on = true, started = false;

  function ensure() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = on ? 1 : 0; master.connect(ctx.destination);
    } catch (e) { ctx = null; }
  }
  function startAmbient() {
    if (!ctx || ambient) return;
    ambient = ctx.createGain(); ambient.gain.value = 0.0001; ambient.connect(master);
    const freqs = [55, 82.41, 110, 164.81]; // A1 · E2 · A2 · E3 — an open, patient chord
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = i % 2 ? "sine" : "triangle"; o.frequency.value = f; o.detune.value = (i - 1.5) * 4;
      const g = ctx.createGain(); g.gain.value = 0.5 / freqs.length; o.connect(g); g.connect(ambient); o.start();
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + i * 0.017; // slow shimmer
      const la = ctx.createGain(); la.gain.value = 0.25 / freqs.length; lfo.connect(la); la.connect(g.gain); lfo.start();
    });
    ambient.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 5);
  }

  return {
    start() { if (started) return; started = true; ensure(); if (ctx && ctx.state === "suspended") ctx.resume(); startAmbient(); },
    toggle() { on = !on; if (master) master.gain.linearRampToValueAtTime(on ? 1 : 0, ctx.currentTime + 0.3); return on; },
    isOn() { return on; },
    chime(ok) {
      if (!ctx || !on) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(ok ? 520 : 300, t);
      if (ok) o.frequency.exponentialRampToValueAtTime(784, t + 0.18);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.5);
    },
    sing() {
      if (!ctx || !on) return;
      const t = ctx.currentTime;
      [261.63, 329.63, 392.0, 523.25].forEach((f, i) => { // a warm C-major that resolves — "both ways"
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f;
        const s = t + i * 0.09;
        g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.1, s + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
        o.connect(g); g.connect(master); o.start(s); o.stop(t + 2.8);
      });
    },
  };
})();

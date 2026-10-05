/* ANSWERING THE DARK — stars.js
   A slow, living starfield behind everything. Drifting, twinkling, parallaxed by
   depth. Pure canvas, no assets. Sits at z-index 0 under the UI. */
"use strict";
window.MC = window.MC || {};
MC.starfield = function (canvas) {
  const c = canvas.getContext("2d");
  let W, H, stars;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const n = Math.max(90, Math.min(260, (W * H) / 8500));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      z: Math.random() * 0.85 + 0.15,           // depth → size, speed, brightness
      ph: Math.random() * Math.PI * 2,          // twinkle phase
    }));
  }
  resize();
  window.addEventListener("resize", resize);
  let t = 0;
  (function frame() {
    c.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.y += s.z * 0.14;                         // gentle downward drift
      if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W; }
      const tw = 0.55 + 0.45 * Math.sin(t * 0.03 + s.ph);
      c.globalAlpha = Math.min(1, s.z * tw);
      c.fillStyle = s.z > 0.72 ? "#bfe3ff" : "#e6eeff";
      c.beginPath();
      c.arc(s.x, s.y, s.z * 1.35, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    t++;
    requestAnimationFrame(frame);
  })();
};

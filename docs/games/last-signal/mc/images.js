/* ANSWERING THE DARK — images.js
   Maps scenes to imagery. Most are NASA/JWST public-domain photos (assets/img);
   the Quiet's reveal + endings get bespoke AI hero art (assets/img/hero_*).
   Keyed by beat id / act index / ending key so the act files stay clean. */
"use strict";
window.MC = window.MC || {};

const IMG = (n) => "assets/img/" + n + ".jpg";

MC.BEAT_IMG = {
  // ACT I
  b_open: IMG("deepfield"), b_decode: IMG("field_stars"), b_nav: IMG("neptune"),
  b_analyze: IMG("nebula_blue"), b_power: IMG("sun"), b_reach: IMG("carina"),
  b_hold_after_run: IMG("carina"), b_milestone: IMG("cluster"),
  // ACT II
  b2_open: IMG("field_stars"), b2_resonance: IMG("sun"), b2_language: IMG("nebula_blue"),
  b2_looms: IMG("pillars"), b2_crew: IMG("earthnight"), b2_sentence: IMG("cluster"),
  // ACT III  (b3_reveal: a globular cluster — thousands of lights, "everyone it carries")
  b3_pressure: IMG("earthnight"), b3_reveal: IMG("cluster"),
  b3_compose: IMG("deepfield"), b3_transmit: IMG("galaxy"),
};

// per-act interstitial art (act index 0,1,2)
MC.ACT_IMG = [IMG("deepfield"), IMG("carina"), IMG("galaxy")];

// ending hero art (curated JWST/Hubble per ending; swap to bespoke AI later if desired)
MC.ENDING_IMG = {
  duet: IMG("galaxy"), gift: IMG("nebula_blue"), open_door: IMG("field_stars"),
  quiet_kept: IMG("pillars"), long_way: IMG("neptune"),
};

MC.LOBBY_IMG = IMG("carina");

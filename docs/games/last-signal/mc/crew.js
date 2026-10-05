/* THE LAST SIGNAL — crew.js
   The made-up team. In solo, these controllers staff the consoles you don't:
   they report readings, react to your calls with personality, and keep the
   crew of AURORA (and you) human. Rule-based, no LLM required — always works. */
"use strict";
window.MC = window.MC || {};

MC.CREW = {
  SPARROW: { role: "COMMS",   name: "Perez",   trait: "warm, keeps everyone's spirits up" },
  COMPASS: { role: "NAV",     name: "Okonkwo", trait: "calm, precise, dry humor" },
  AMP:     { role: "POWER",   name: "Rhee",    trait: "brilliant worrier, talks fast" },
  HALO:    { role: "SCIENCE", name: "Vance",   trait: "dreamer, sees the wonder first" },
  AURORA:  { role: "SHIP",    name: "Cmdr. Sol", trait: "steady voice from the dark" },
};

// callsign for a given console role
MC.callsignFor = (role) => Object.keys(MC.CREW).find(cs => MC.CREW[cs].role === role) || "FLIGHT";

// roster the SoloNet reports: you (FLIGHT) + the four made-up controllers.
// Display is CALLSIGN-only (no real names surfaced in the UI).
MC.CREW_ROSTER = (mode) => {
  const you = { role: MC.state.role, name: "FLIGHT (you)", callsign: "FLIGHT", you:true };
  const others = Object.entries(MC.CREW)
    .filter(([cs, c]) => c.role !== "SHIP" && c.role !== MC.state.role)
    .map(([cs, c]) => ({ role: c.role, name: cs, callsign: cs, ai: true }));
  return [you, ...others];
};

// pick a line from a pool, varied by beat index so it isn't repetitive
MC.pick = (pool, seed) => pool[(seed + pool.length) % pool.length];

// generic reactions crew throw in after you make a call
MC.CREW_REACTIONS = {
  bold: [
    ["SPARROW", "That's the call I'd make too, Flight. Ship's steadying up."],
    ["AMP", "Bold. Okay okay — rerouting to match. I can hold it, I can hold it."],
    ["COMPASS", "Understood. Plotting it clean."],
  ],
  careful: [
    ["COMPASS", "Careful's good. Careful gets everyone home."],
    ["HALO", "I like it. Slow is how you hear the quiet parts."],
    ["AMP", "Oh thank goodness, a plan that doesn't spike my board."],
  ],
  wonder: [
    ["HALO", "Flight... whatever this is, it's not random. My whole board is goosebumps."],
    ["SPARROW", "Sol's crew went dead silent up there. The good kind of silent."],
    ["HALO", "We're the first ones. Ever. I keep thinking that and forgetting to breathe."],
  ],
};

MC.crewSay = (cs, text) => MC.log(cs, text);

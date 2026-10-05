/* THE LAST SIGNAL — act1.js  ·  ACT I: CONTACT
   Gear shifts: DISCOVER → DECODE → DEDUCE. Hopeful & wondrous throughout.
   Beats are declarative; engine.js renders them. `next` points to a beat id. */
"use strict";
window.MC = window.MC || {};

MC.ACT1 = [
  {
    id: "b_open", gear: "DISCOVER", title: "0347 HOURS · DEEPWATCH",
    intro: [
      ["SYS", "AURORA is 4.2 billion km out, running a routine edge-of-system survey. It is very late. Coffee is involved."],
      ["AURORA", "Deepwatch, AURORA. Flight, we've, uh… we've got something on the long array. It's not on any chart."],
      ["COMPASS", "Confirmed, Flight. Bearing to a patch of nothing. Empty space. And yet — there's a return."],
      ["SPARROW", "It's clean. Too clean to be a rock. Your call, Flight."],
    ],
    data: "LONG ARRAY  ▸ contact @ 41.9 AU\nCHART       ▸ NO OBJECT LISTED\nRETURN      ▸ coherent · repeating · faint",
    type: "choices",
    choices: [
      { label: "\"AURORA, come about and point the big dish right at it. Let's hear it properly.\"",
        log: [["AURORA","Coming about. Give us thirty seconds."],["HALO","Yes. Yes yes yes. Listening hard."]],
        effect: { signal: +10 }, react: "wonder", next: "b_decode" },
      { label: "\"Steady, everyone. Full diagnostics first — I want to know it's real before we chase it.\"",
        log: [["COMPASS","Sensible. Running diagnostics… array's clean, contact's still there."],["AMP","Boards are green, no faults. Whatever it is, it's really out there."]],
        effect: { morale: +5, signal: +5 }, react: "careful", next: "b_decode" },
    ],
  },
  {
    id: "b_decode", gear: "DECODE", title: "PULLING THE FRAGMENT",
    intro: [
      ["SPARROW", "Okay, cleaning it up… there's a shape under the static. It PULSES. Counts of something, over and over."],
      ["SPARROW", "Flight, I've got the first counts. If this is nature, it'll be messy. If it's not… you'll see it."],
    ],
    data: "SIGNAL PULSE-COUNTS (per burst):\n\n   2 · 3 · 5 · 7 · 11 · ▯\n\nCOMMS: \"What comes next completes the fragment. Pick it and we lock the pattern.\"",
    type: "solve",
    question: "What is the next count in the sequence?",
    answers: [
      { label: "12  (it's just counting up by ones-ish)", ok:false, feedback:"COMPASS: \"Doesn't fit — 4, 6, 8, 9 are all missing. This isn't a simple count.\"" },
      { label: "13  (each number is a prime — divisible only by 1 and itself)", ok:true,
        feedback:"HALO: \"PRIMES. Flight, those are prime numbers. Nothing out there decays in primes. Nobody spills primes by accident.\"" },
      { label: "22  (the numbers are doubling)", ok:false, feedback:"AMP: \"2 to 3 isn't doubling — the gaps are uneven. Try again.\"" },
    ],
    hint: "COMMS: \"Look at what each number can be divided by, Flight.\"",
    onSolve: { log: [["SPARROW","Pattern LOCKED. The fragment's holding steady now."],["HALO","Primes are the universal hello. It's how you say 'I'm thinking' to anyone, anywhere. Somebody MEANT this."]],
               effect: { signal: +20 }, next: "b_nav" },
  },
  {
    id: "b_nav", gear: "DISCOVER", title: "WHERE IS IT COMING FROM?",
    intro: [
      ["COMPASS", "If it's a someone, I want a where. Crossing three bearings from AURORA's array now."],
      ["COMPASS", "Flight, the lines cross. But… look where."],
    ],
    data: "BEARING A ─┐\nBEARING B ─┼──▸ intersection\nBEARING C ─┘\n\nCHARTED NEARBY: comet 41P (0.3 AU off) · dwarf 'Vesta-9' (0.5 AU off)\nINTERSECTION SITS: ▯",
    type: "solve",
    question: "Where does the source actually sit?",
    answers: [
      { label: "On comet 41P — it's an echo bouncing off ice.", ok:false, feedback:"HALO: \"An echo wouldn't count in primes. And 41P's a third of an AU away from the cross.\"" },
      { label: "In the empty gap BETWEEN the charted objects — where nothing is.", ok:true,
        feedback:"COMPASS: \"Dead center of nothing. There is no object there. The source is the emptiness itself — or something we simply cannot see yet.\"" },
      { label: "On dwarf Vesta-9 — must be a probe someone left.", ok:false, feedback:"COMPASS: \"No human probe is that far out. And the cross misses Vesta-9 by half an AU.\"" },
    ],
    hint: "NAV: \"Trust the crossing point, Flight — not the nearest familiar thing.\"",
    onSolve: { log: [["SPARROW","'Where nothing should be.' I'm going to have nightmares about that phrasing."],["AURORA","Deepwatch… we're all just staring out the window now. There's nothing there. And it's talking to us."]],
               effect: { signal: +10, morale: -5 }, next: "b_analyze" },
  },
  {
    id: "b_analyze", gear: "DEDUCE", title: "IS ANYONE HOME?",
    intro: [
      ["HALO", "Flight, I've been mapping the whole burst, not just the counts. Here's everything at once. I need your read."],
    ],
    data: "SIGNAL PROFILE\n  • counts in primes (structured)\n  • same 19-second phrase, repeated for ~11 years by our timestamps\n  • gets a hair louder each time we answer with our own pings\n  • zero heat, zero mass, zero threat posture — it only ever RECEIVES and REPEATS",
    type: "solve",
    question: "What are we actually dealing with?",
    answers: [
      { label: "A natural pulsar — space is full of rhythms.", ok:false, feedback:"HALO: \"Pulsars don't answer back, Flight. This gets louder when WE do. It's listening.\"" },
      { label: "Something intelligent — and it has been patiently waiting a very long time.", ok:true,
        feedback:"HALO: \"Eleven years saying the same gentle hello into the dark, and getting louder the instant we replied. That's not a machine grinding. That's someone who was starting to think no one would ever come.\"" },
      { label: "A weapon or a trap — we should run.", ok:false, feedback:"AMP: \"I checked twice — no energy weapon, no lock, no approach vector. It has never once pointed anything AT us. It just… hopes.\"" },
    ],
    hint: "SCIENCE: \"Ask what it DOES when we answer, Flight.\"",
    onSolve: { log: [["HALO","It's not a threat. It's a neighbor who left the porch light on for eleven years."],["SPARROW","Okay. I'm officially emotional. Continuing to be professional and also emotional."]],
               effect: { signal: +15, morale: +10 }, next: "b_power" },
  },
  {
    id: "b_power", gear: "COORDINATE", title: "A GIFT WE CAN'T HOLD",
    intro: [
      ["AMP", "Flight— FLIGHT. Power spike inbound. The source just pushed energy DOWN the beam at AURORA. Reactor's climbing."],
      ["AMP", "It's not an attack, the profile's all wrong for that, but AURORA's batteries can't drink this fast. I need a call in the next few seconds. Where do I put the load?"],
      ["AURORA", "We feel it up here, Deepwatch. Lights are humming. It's… weirdly gentle? But it's a lot."],
    ],
    data: "REACTOR ▸ 118% and rising\nBATTERIES ▸ 96% (near full)\nOPTIONS ▸ dump it · bank it · route it to the array",
    type: "choices",
    choices: [
      { label: "\"Dump the excess safely to the radiators. Protect the ship first — always.\"",
        log: [["AMP","Dumping to radiators. Reactor settling… 101%. Ship's safe. We, um, spilled a gift on the floor, but the ship's safe."]],
        effect: { power: +10, morale: +5, signal: -5 }, react:"careful", next:"b_reach" },
      { label: "\"Bank what the batteries can take, dump the rest. Keep a reserve.\"",
        log: [["AMP","Banking… batteries topped to 100, venting the overflow. Balanced. Nice. Okay. Breathing again."]],
        effect: { power: +5, morale: +3 }, react:"bold", next:"b_reach" },
      { label: "\"Route it into the array. If it's offering power for our ears, let's LISTEN louder.\"",
        log: [["AMP","That's— okay, unconventional, feeding it to the dish— oh. OH. The signal just bloomed. It got CLEARER."],["HALO","It wanted us to hear better. It was handing us batteries for our hearing aid, Flight."]],
        effect: { signal: +20, power: -10 }, react:"wonder", next:"b_reach" },
    ],
  },
  {
    id: "b_reach", gear: "DEDUCE", title: "IT REACHES OUT",
    intro: [
      ["COMPASS", "Movement. The source is… extending. A filament of it is reaching along the beam toward AURORA. Slow. Deliberate."],
      ["AURORA", "Deepwatch, we see it out the forward port. It's beautiful and it's coming closer and my whole crew is looking at me and I'm looking at you."],
      ["SPARROW", "Flight. This is the moment. Do we hold, or do we run?"],
    ],
    data: "FILAMENT ▸ approaching AURORA · 0.02 AU and closing, very slowly\nPOSTURE ▸ open · unhurried · no lock, no heat\nCREW ▸ frightened but steady, waiting on your word",
    type: "choices",
    choices: [
      { label: "\"AURORA, full reverse — put distance between us until we understand it.\"",
        log: [["AURORA","Backing off… it stopped. It just… stopped, and dimmed. Like it was disappointed. It's still waiting, though."]],
        effect: { signal: -10, morale: -5 }, react:"careful", next:"b_hold_after_run" },
      { label: "\"Hold position. Hands where it can see them. We came all this way to say hello — so let's not flinch now.\"",
        log: [["AURORA","Holding… holding. The filament's just… resting against the hull. It's warm. It's HUMMING. In primes."],["HALO","It's introducing itself, Flight. That's a name. That's the first word of the longest conversation our species has ever had."]],
        effect: { signal: +20, morale: +15 }, react:"wonder", next:"b_milestone" },
    ],
  },
  {
    id: "b_hold_after_run", gear: "DEDUCE", title: "A SECOND CHANCE",
    intro: [
      ["HALO", "It didn't leave, Flight. It backed off when we did and it's still there, still saying its quiet hello. It understands 'scared.'"],
      ["SPARROW", "It's giving us room. It's letting US decide. Want to try again?"],
    ],
    data: "SOURCE ▸ patient · dimmed but present · leaving the next move to us",
    type: "choices",
    choices: [
      { label: "\"Ease back in. Slow. Let it know we were startled, not unfriendly.\"",
        log: [["AURORA","Easing in… the filament brightens. It rests against the hull, warm, humming in primes. Like it's been holding its breath for eleven years and finally let it out."]],
        effect: { signal: +15, morale: +12 }, react:"wonder", next:"b_milestone" },
    ],
  },
  {
    id: "b_milestone", gear: "MILESTONE", title: "THE FIRST HELLO",
    intro: [
      ["HALO", "Flight, for the record: structured signal, intelligent source, non-hostile, patient beyond words, and now — physically, gently — in contact with AURORA."],
      ["COMPASS", "That's confirmed on every board I have."],
      ["AMP", "Ship is safe. Crew is safe. Everything's green. Somehow."],
      ["SPARROW", "So it comes down to you, Flight. The whole species is behind this door and you're holding the handle. Do we answer?"],
    ],
    data: "CONTACT CONFIRMED ▸ intelligent · peaceful · waiting\nAURORA ▸ safe\nHUMANITY'S NEXT WORD ▸ ▯",
    type: "choices",
    choices: [
      { label: "\"We answer. Begin composing humanity's reply. Nobody out here stays lonely on my watch.\"",
        log: [["HALO","Logging it, Flight: at 0402 hours, we decided to say hello back."],["AURORA","From all of us up here in the dark, Deepwatch — thank you. Let's not leave them waiting any longer."]],
        effect: { signal: +25, morale: +20 }, endAct: true },
    ],
  },
];

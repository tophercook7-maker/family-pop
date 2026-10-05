/* ANSWERING THE DARK — act2.js  ·  ACT II: THE LONG LISTEN
   Tone: older/YA. Hearing was the easy part. Understanding is slow, costly, and
   asks the crew to be braver than they knew. Still: no violence, no gore. The
   danger is losing the ship, losing nerve, and losing the chance. */
"use strict";
window.MC = window.MC || {};

MC.ACT2 = [
  {
    id: "b2_open", gear: "DECODE", title: "CALL AND RESPONSE",
    intro: [
      ["HALO", "It heard our hello and it's doing something new, Flight. It sends our own prime-string back — then adds one change. Waits. Sends again, changes something else."],
      ["SPARROW", "It's not repeating anymore. It's... taking turns. Like it's trying to build something WITH us instead of just at us."],
    ],
    data: "EXCHANGE LOG\n  us  → 2 3 5 7 11\n  it  → 2 3 5 7 11 · [holds] · 2 3 5 7 11 (+13)\n  us  → 2 3 5 7 11 13\n  it  → 13 · 13 · [brighter] · then a NEW cluster, waiting",
    type: "solve",
    question: "What is the Quiet actually doing here?",
    answers: [
      { label: "Testing whether we're a recording — checking if we can only echo.", ok:false,
        feedback:"HALO: \"It rewards us when we ADD, not when we copy. It doesn't want a mirror. It wants a partner.\"" },
      { label: "Building a shared language, one exchange at a time — teaching us grammar with patience.", ok:true,
        feedback:"HALO: \"Every turn it hands us one new rule and waits to see if we use it. That's not a signal, Flight. That's a first lesson. It's the most patient teacher in the universe, because it has had nothing but time.\"" },
      { label: "Counting down to something.", ok:false,
        feedback:"COMPASS: \"No terminal value, no acceleration. Nothing's counting down. It's counting TOGETHER.\"" },
    ],
    hint: "SCIENCE: \"Watch what it does when we copy versus when we add something of our own.\"",
    onSolve: { log: [["SPARROW","Okay. First shared word logged. We have a vocabulary of exactly one and I've never been prouder of anything."]],
               effect: { signal: +15 }, set:{ learning:true }, next: "b2_resonance" },
  },
  {
    id: "b2_resonance", gear: "COORDINATE", title: "IT TRIES TO HOLD ON",
    intro: [
      ["AMP", "Flight, we've got resonance building on AURORA's reactor and it is NOT slowing down. The Quiet's matched our power harmonics — it's coupling to us to stay connected, like it's afraid we'll drift away."],
      ["AMP", "It doesn't mean harm, the intent's all wrong for harm, but good intentions don't un-shake a reactor mounting. If this climbs another twelve percent the ship has to scram and we lose the ship's array — maybe the ship. Thirty seconds, Flight. What do we do?"],
      ["AURORA", "Deepwatch, I've got a crew of six up here and a hull that's starting to sing. I trust you. Make the call."],
    ],
    data: "REACTOR RESONANCE ▸ 74% → climbing\nSCRAM THRESHOLD ▸ 86%\nCOUPLING ▸ the Quiet, holding our hand too tight",
    type: "choices",
    choices: [
      { label: "\"Sever the coupling. Drop the link cold. I will not gamble AURORA's crew on a first date.\"",
        log: [["AMP","Severing— resonance dropping, ship's safe. Link's dark. It's... reaching after us. Dimming. It doesn't understand why we let go."],["HALO","We're safe. And it's alone again. It'll take a while to earn that back."]],
        effect: { power:+15, morale:+8, signal:-15 }, set:{ severed:true }, react:"careful", next:"b2_language" },
      { label: "\"Detune the reactor to a frequency it can't grab — hold the link, lose the resonance. Thread it, Amp.\"",
        log: [["AMP","Detuning— walking the frequency down— resonance breaking without dropping the link— THERE. Holding. Ship's steady and we never let go of its hand. I need to sit down."],["COMPASS","Cleanly done. That's the one that gets everyone home AND keeps the door open."]],
        effect: { power:-5, morale:+10, signal:+10 }, set:{ brave:true }, react:"bold", next:"b2_language" },
      { label: "\"Match it. Ride the resonance up and let it pour understanding into the array while we can hold — I trust it.\"",
        log: [["AMP","That's— okay we're riding it, 80, 82, the array is DROWNING in structure, I can hold to 85 and NOT a hair more—"],["HALO","Flight the data is a flood, years of it in seconds, it's giving us everything it has because it thinks it might lose us— pull up pull up we have it—"],["AMP","Backing off at 85. Ship intact. That was insane and it worked and please never make me do that again."]],
        effect: { power:-15, signal:+25, morale:-5 }, set:{ brave:true, reckless:true }, react:"wonder", next:"b2_language" },
    ],
  },
  {
    id: "b2_language", gear: "DECODE", title: "THE SHAPE OF ITS WORDS",
    intro: [
      ["HALO", "Now that we can hold a channel, I can see how it really talks. It's not sound and it's not text. Watch — it takes a number, breaks it into its prime factors, and plays those factors as a chord. The MATH is the melody. The melody is the MEANING."],
      ["HALO", "It just sent 30. Thirty is two times three times five. Three notes, one chord. And it keeps sending numbers whose factors all share... a shape. Read me the shape, Flight, and we'll have our second word."],
    ],
    data: "IT SENDS: 30 · 105 · 1155 · 15015\n  30    = 2·3·5\n  105   = 3·5·7\n  1155  = 3·5·7·11\n  15015 = 3·5·7·11·13\nEach number = the one before, given a new prime. Each chord = the last chord, plus a voice.",
    type: "solve",
    question: "What concept is it building, note by note?",
    answers: [
      { label: "'Bigger' — it's just showing us larger and larger numbers.", ok:false,
        feedback:"HALO: \"Size isn't the point — it never repeats a voice and never drops one. It's not about big. It's about how they fit.\"" },
      { label: "'Together' — many separate voices kept whole inside one chord; a crowd that never loses a single member.", ok:true,
        feedback:"HALO: \"'Together.' Every prime kept, none swallowed, all sounding at once. Flight — the first full idea it chose to teach us, out of everything it could have said... was how to be many and unbroken at the same time. That's not an accident. That's a wound, or a wish.\"" },
      { label: "'Danger' — a warning encoded in rising tension.", ok:false,
        feedback:"COMPASS: \"No dissonance in the chords — they're consonant, every one. Whatever this is, it's the opposite of a warning.\"" },
    ],
    hint: "SCIENCE: \"Don't read the numbers. Read what happens to the voices from one chord to the next.\"",
    onSolve: { log: [["SPARROW","'Together.' It reached across a lightless void for eleven years to teach us the word 'together' first. I'm going to need a minute."]],
               effect: { signal:+15 }, set:{ word_together:true }, next: "b2_looms" },
  },
  {
    id: "b2_looms", gear: "DEDUCE", title: "THE THING THAT LOOMS",
    intro: [
      ["COMPASS", "Flight — it's GROWING. The source is expanding across the forward view, fast, and it's going dark as it does. AURORA's whole sky is filling with it."],
      ["AURORA", "Deepwatch it's ENORMOUS, it's bigger than anything should be, the crew's calling for a burn to run and I've got my hand on the throttle and I am asking you ONCE — do we go?"],
      ["AMP", "Every instinct in my body says run, Flight."],
    ],
    data: "SOURCE ▸ expanding · darkening · enveloping AURORA's forward hemisphere\nCREW ▸ at panic threshold · requesting immediate burn\nPOSTURE ▸ still no lock · still no heat · still, somehow, gentle",
    type: "choices",
    choices: [
      { label: "\"Burn. Run now, apologize later — I won't hold six people still in front of something that big on a hunch.\"",
        log: [["AURORA","Burning— we're moving— and it... folded away from us. Instantly. Made itself small again so we'd stop being afraid. Deepwatch, I think we just ran from someone trying to protect us."],["COMPASS","Sensor replay confirms it: a micrometeoroid stream was inbound on AURORA's track. The 'looming' was it spreading itself thin to CATCH the stream before it hit the ship. It grew dark because it was taking the hits for us."]],
        effect: { morale:-10, signal:-10 }, set:{ ran_from_shield:true }, react:"careful", next:"b2_crew" },
      { label: "\"Hold. Hands off the throttle. If it wanted to hurt us it had eleven years and a thousand chances — hold, and watch what it's actually doing.\"",
        log: [["AURORA","Holding— holding— it's spread across our whole sky and— Deepwatch, there's DEBRIS hitting it. A micrometeoroid stream was on our track and it put ITSELF between us and the rocks. It's shielding us. It grew huge so it could take the hits meant for AURORA."],["HALO","It saw the danger before we did and its first move was to cover us with its own body. Flight, that's the bravest, kindest thing I have ever watched anything do, and we almost shot the engines and fled from it."]],
        effect: { morale:+12, signal:+18 }, set:{ brave:true, saw_shield:true }, react:"wonder", next:"b2_crew" },
    ],
  },
  {
    id: "b2_crew", gear: "DEDUCE", title: "THE WEIGHT ON AURORA",
    intro: [
      ["AURORA", "Deepwatch, I have to be straight with you. My youngest, callsign LARK, hasn't said a word since the sky went dark. Just staring out the port. This is a lot to ask of a person — to sit still in the reach of something we can't measure. They're scared. Frankly, so am I."],
      ["SPARROW", "That's a real cost, Flight. Not everything out here is a puzzle. Some of it's just people, far from home, holding it together. How do we answer that?"],
    ],
    data: "AURORA CREW ▸ physically safe · emotionally spent\nLARK ▸ frozen · overwhelmed · needs their commander, and needs yours",
    type: "choices",
    choices: [
      { label: "\"Cmdr — tell Lark the truth: we're all scared, and we're doing it anyway, and that's what brave actually is. Fear you share stops being a wall.\"",
        log: [["AURORA","...Relaying that. Word for word. ...Lark just laughed. Wet-eyed, but a laugh. Said 'okay. okay.' and put their hand back on the console. Thank you, Deepwatch. That's the call that keeps a crew a crew."]],
        effect: { morale:+15 }, set:{ honest:true }, react:"careful", next:"b2_sentence" },
      { label: "\"Order a rest rotation. Get Lark off the line, warm meal, real sleep. People aren't instruments — you don't run them past redline.\"",
        log: [["AURORA","Pulling Lark off-shift. Good call. They'll be sharper for it, and they'll know we look after our own before we look after the mission."]],
        effect: { morale:+12 }, set:{ careful_leader:true }, react:"careful", next:"b2_sentence" },
      { label: "\"Put Lark on the science feed. Let them SEE what we've found — that it shielded us. Awe is the cure for that kind of fear.\"",
        log: [["AURORA","Routing the shield replay to Lark's station... they're watching it save us, over and over. Deepwatch, they just whispered 'it protected us.' The fear's turning into something else. Wonder, I think. You turned their nightmare into the best day of their life."]],
        effect: { morale:+10, signal:+8 }, set:{ shared_wonder:true }, react:"wonder", next:"b2_sentence" },
    ],
  },
  {
    id: "b2_sentence", gear: "MILESTONE", title: "THE FIRST TRUE SENTENCE",
    intro: [
      ["HALO", "Flight, we have enough shared words now to receive a whole thought. It's been assembling one for hours. It's ready. So am I, I think."],
      ["HALO", "Here it comes — 'together' ... 'long' ... 'alone' ... and then a single voice, held by itself, for a very long time. Reading it plainly: 'We have been together, for a long time, alone.' It's telling us who it is. It's telling us it's the last of something."],
      ["AURORA", "The whole ship went quiet, Deepwatch. Even the hull. We're all just... listening to somebody tell us they've been lonely longer than our species has had language."],
    ],
    data: "SHARED VOCABULARY ▸ sufficient for full concepts\nITS FIRST SENTENCE ▸ \"We have been together — for a long time — alone.\"\nMEANING ▸ it is old · it is one of the last · it has waited",
    type: "choices",
    choices: [
      { label: "\"Then it's waited long enough. Log it, everyone: we understand it — and tomorrow, we answer it. Nobody stays the last of anything on my watch if I can help it.\"",
        log: [["HALO","Two-way understanding: CONFIRMED. We and the Quiet can, for the first time, mean the same thing at the same time."],["SPARROW","Get some rest, Flight. Tomorrow we tell the dark what humanity has to say for itself. No pressure."]],
        effect: { signal:+20, morale:+15 }, set:{ understood:true }, endAct:true },
    ],
  },
];

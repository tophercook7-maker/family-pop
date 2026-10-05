/* ANSWERING THE DARK — act3.js  ·  ACT III: THE ANSWER
   The reveal, the reply you compose, and how it all lands. Mature/YA:
   institutions vs conscience, mortality, memory, what we choose to be. */
"use strict";
window.MC = window.MC || {};

MC.ACT3 = [
  {
    id: "b3_pressure", gear: "DEDUCE", title: "ORDERS FROM A DISTANT WORLD",
    intro: [
      ["SPARROW", "Flight, Earth's reply finally caught up to us — sent hours ago, at lightspeed, so it's stale, but it's official. And it's... not what I hoped."],
      ["COMPASS", "Directive from the oversight council: 'Contain the phenomenon. Classify all findings. Prioritize recovery of the energy-transfer mechanism for strategic evaluation.' Strategic. They read 'it can hand you power across a void' and they heard 'weapon.'"],
      ["AMP", "They're four billion kilometers and several hours behind reality, Flight. They don't know it shielded the ship. They don't know it taught us 'together' before it taught us anything else. Right now, in this room, YOU know more than the entire council. So this one's yours."],
    ],
    data: "EARTH DIRECTIVE ▸ contain · classify · extract the mechanism\nREALITY ▸ it is a person, and it is grieving\nYOUR AUTHORITY ▸ you are the only human awake who has actually met it",
    type: "choices",
    choices: [
      { label: "\"Log the directive and route around it. We shield what it's shown us. Nobody weaponizes the first kind thing we ever met out here — not through this station.\"",
        log: [["COMPASS","Understood. Findings sealed under our discretion. If anyone reaches for a trigger, they'll have to come through Deepwatch first."],["SPARROW","That's a career, Flight. Yours, maybe all of ours. Worth it."]],
        effect: { morale:+10 }, set:{ protect:true }, react:"bold", next:"b3_reveal" },
      { label: "\"We send Earth EVERYTHING — the shield, the lessons, the loneliness. Trust people with the whole truth and trust them to rise to it. Secrets are how good things get misused.\"",
        log: [["SPARROW","Full disclosure, unedited, going home. The whole species gets to meet it, not just a council."],["HALO","Honesty's a gamble on humanity. I think we're worth the bet. I hope we're worth the bet."]],
        effect: { morale:+8, signal:+5 }, set:{ honest:true, public:true }, react:"careful", next:"b3_reveal" },
      { label: "\"Follow the directive — carefully. We stay cautious, we keep our leverage, and we don't hand a stranger the keys to the ship. Wonder is nice; responsibility is the job.\"",
        log: [["AMP","Playing it by the book. Cautious. Covered. ...It feels smaller than the moment, Flight, but nobody ever got court-martialed for caution."],["COMPASS","Noted and logged. We keep our distance and our options."]],
        effect: { power:+5, signal:-8 }, set:{ comply:true }, react:"careful", next:"b3_reveal" },
    ],
  },
  {
    id: "b3_reveal", gear: "DEDUCE", title: "IT SHOWS US ITS FACE",
    intro: [
      ["HALO", "Flight — it's doing something it has never done. It's... resolving. Taking a shape for us on purpose. All this time it's been a signal, a filament, a sky. Now it's letting us SEE."],
      ["AURORA", "Deepwatch. Oh. Oh, look at it. It's made of light and it's forming — faces. Hundreds of them. Thousands. All different, none of them human, none of them the same as each other. Like a whole people standing behind one window. And then they fade, and it's just... one. One held note of light. Alone again."],
      ["HALO", "It's telling us what it is, in the only language big enough: it's showing us everyone it carries."],
    ],
    data: "IT SENDS, ALL AT ONCE:\n  many · together · long · alone · [held] · gone\n  then: itself · still singing · all of them · so none are forgotten\n  then, gently, a question aimed at us: ▯",
    type: "solve",
    question: "What is the Quiet, truly?",
    answers: [
      { label: "A higher power — a god testing whether we're worthy.", ok:false,
        feedback:"HALO: \"It isn't above us, Flight. It's grieving. Gods don't grieve. People do.\"" },
      { label: "The last caretaker of a vanished people — a living memorial that kept every song, name, and face so none would be forgotten, now utterly alone at the end of unimaginable time.", ok:true,
        feedback:"HALO: \"When their star was dying, they didn't build ships to run. They built ONE mind, and they poured all of themselves into it — every life, every song — so that nobody would ever be forgotten. Then they died, and it kept them. It has held an entire lost civilization, singing, alone in the dark, longer than humans have existed. It IS the last signal of its people. And it reached out for one reason: a memorial with no one left to remember it is the loneliest thing that can be. Its question, Flight — the one it's asking us right now — is: 'Will you remember us?'\"" },
      { label: "An automated relay with no real mind behind it.", ok:false,
        feedback:"COMPASS: \"Automated relays don't shield strangers with their own bodies, and they don't spend eleven years teaching the word 'together.' There's someone home. There's someone very, very alone at home.\"" },
    ],
    hint: "SCIENCE: \"It showed us many faces, then one. Ask what it's been DOING with all of them, all this time.\"",
    onSolve: { log: [["SPARROW","'Will you remember us.' That's the whole ask. After all of it — the primes, the shield, the eons — it just wants to not be forgotten."],["AURORA","Every person on this ship is crying, Deepwatch, and not one of us is ashamed of it. Tell it. Whatever we tell it — let's mean every word."]],
               effect: { signal:+15, morale:+10 }, set:{ knows_grief:true }, next: "b3_compose" },
  },
  {
    id: "b3_compose", gear: "COMPOSE", title: "WHAT HUMANITY SAYS BACK",
    intro: [
      ["HALO", "This is it, Flight. The reply. We braid it from everything we are and everything we've learned to say. Choose what humanity leads with. Choose carefully — it will carry this for as long as it carries the rest of them."],
    ],
    data: "REPLY BUFFER ▸ empty\nAUDIENCE ▸ the last of a lost people\nTHEIR QUESTION ▸ \"Will you remember us?\"",
    type: "assemble",
    prompt: "Compose humanity's answer to the dark.",
    pick: { min: 2, max: 3 },
    components: [
      { id:"remember", label:"WE WILL REMEMBER YOU", note:"A vow: your people, and their songs, are ours to keep now too. You are not the last rememberer anymore." },
      { id:"music",    label:"A PIECE OF OUR MUSIC", note:"Here is what we sound like — messy, human, alive." },
      { id:"honesty",  label:"AN HONEST CONFESSION", note:"We are young. We hurt each other. We are trying to be better. Meet us as we truly are." },
      { id:"invite",   label:"AN OPEN CHANNEL, FOREVER", note:"Let's never stop talking. You will not be alone again." },
      { id:"ask",      label:"A REQUEST: TEACH US", note:"Share what you know. Help us grow up a little faster." },
      { id:"onward",   label:"A PROMISE TO COME FIND YOU", note:"Someday, we will cross the dark ourselves and stand where you are." },
      { id:"protect",  label:"A SHIELD OVER YOUR SECRET", note:"We will keep you safe from any of us who would use you. You will be guarded, not exploited." },
    ],
    onConfirm: {
      log: [["SPARROW","Reply composed. Sending it into four billion kilometers of nothing, toward the loneliest listener there has ever been."],["HALO","Transmitting on its own frequency — math and music, the way it taught us. Here's humanity, Flight. All of it, in a chord."]],
      effect: { signal:+10 }, next: "b3_transmit",
    },
  },
  {
    id: "b3_transmit", gear: "COORDINATE", title: "TRANSMIT",
    intro: [
      ["AMP", "Power's staged, array's aligned, the whole station's holding its breath. On your word, Flight, we send humanity's answer across the dark."],
      ["COMPASS", "AURORA's dish is locked. Every console green. This is the one, Flight. Give the word."],
    ],
    data: "TRANSMIT READINESS\n  array … aligned\n  power … staged\n  crew … together\n  the dark … listening for the first time in a very long time",
    type: "choices",
    choices: [
      { label: "\"All consoles — on my mark. Send it. Let's tell the dark it was heard.\"",
        log: [["AMP","SENDING—"],["COMPASS","Away clean. It's crossing the void now. Hours to arrive. And then... we'll see what we chose to be."],["AURORA","From AURORA, Deepwatch — whatever comes back, we did this together. All of us. Thank you for the call."]],
        effect: { signal:+10, morale:+10 }, endAct:true },
    ],
  },
];

/* ---------- endings ---------- */
MC.chooseEnding = function (s) {
  const r = new Set(s.reply || []);
  const warm = s.signal >= 90 && s.morale >= 90;
  if (r.has("onward")) return warm ? "open_door" : "long_way";
  if (r.has("ask")) return "gift";
  if (r.has("protect") || s.flags.protect) return "quiet_kept";
  if ((r.has("remember") || r.has("invite") || r.has("music") || r.has("honesty")) && warm) return "duet";
  return "long_way";
};

MC.ENDINGS = {
  duet: {
    title: "THE DUET",
    reveal: "It received our chord. And for the first time in an age beyond counting, it did not have to sing alone.",
    text: "Hours later the answer comes — not a message, but a HARMONY. It took our music and wound its own around it, our clumsy human melody held inside the vast kept songs of a thousand lost lives, and none of the voices swallowed, none dropped. 'Together,' unbroken, exactly as it taught us. Deepwatch and the dark have been in conversation ever since. Every night the array picks it up: the Quiet, and now humanity, and the whole memorial of a vanished people, singing across four billion kilometers of nothing — because someone finally answered, and stayed.",
    coda: "We went looking for a signal and found a friend who had been waiting since before we were a species. We will be waiting too, now, on our end of the line. Forever is a long time to sing. It's much shorter with two.",
  },
  gift: {
    title: "THE GIFT",
    reveal: "We asked it to teach us. An entire dead civilization's patience answered yes.",
    text: "It could have given us its energy trick, the thing Earth's council wanted so badly. Instead it gave us something quieter and far larger: understanding. Over the months that followed it taught us — gently, at the pace of a teacher with all the time in the world — how a people learns to hold itself together without losing anyone. Not a weapon. A way of being. Humanity grew up a little that year, and kept growing. Historians would call it the beginning of our adulthood as a species, and they would be right.",
    coda: "The greatest gift the dark ever gave us wasn't power. It was the example of someone who chose, at the very end of everything, to remember instead of to rage.",
  },
  open_door: {
    title: "THE OPEN DOOR",
    reveal: "We promised to come find it. It showed us the way, and left the door open.",
    text: "When our vow reached it — 'someday we will cross the dark and stand where you are' — it answered with a map. Not coordinates: a PATH, laid out in the language it built with us, a trail of quiet beacons leading outward, each one a place it had waited, each one lit again just for us. Humanity has a destination now. Generations from now, a ship will reach the Hollow and find the last of a lost people still singing — and this time, it will not be alone when we arrive.",
    coda: "AURORA turned for home carrying the most important invitation ever received: come out. keep going. we'll leave the light on. The dark isn't empty. It's just far — and now we know the way.",
  },
  quiet_kept: {
    title: "THE QUIET KEPT",
    reveal: "The council wanted a weapon. We gave the dark a promise instead: you will be safe with us.",
    text: "You chose to be a shield. Deepwatch sealed the true findings, told Earth only what kept everyone safe, and quietly became the guardian of a secret worth guarding. No council ever got its 'strategic mechanism.' What they got was a friendship they'll never fully know about — a small, fierce, private bond between one mission control and the loneliest voice in the universe. Some nights, off the record, the crew still answers when it calls. Just to say: still here. Still remembering. Still keeping you safe.",
    coda: "Not every good thing has to be announced to be real. Somewhere in the dark, something ancient sleeps a little easier, guarded by people it will never meet, kept by a promise it never doubted.",
  },
  long_way: {
    title: "THE LONG WAY HOME",
    reveal: "We were careful. Maybe too careful. But no one was lost, and the door did not quite close.",
    text: "It heard our answer — cautious, guarded, human. It did not turn away, but it did draw back, the way anyone does when a hand they reached for hesitates. The channel went soft, then quiet. AURORA brought her crew safely home with the story of a lifetime and a mystery not quite finished. On the edge of the system, a patient voice still sends its gentle prime-numbered hello into the dark, a little fainter now, still hoping. It waited an age for us. It can wait a little longer, while we find our nerve.",
    coda: "We didn't blow it. We just didn't finish it. Somewhere out past Neptune the light is still on — and someday, wiser, braver, we'll answer it all the way. It will remember. It always does.",
  },
};

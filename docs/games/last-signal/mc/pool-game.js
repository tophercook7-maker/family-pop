/* ANSWERING THE DARK — pool-game.js
   The multiplayer shell around POOLED PERCEPTION. Reuses net.js transport
   (solo / local tabs / relay share-code) and pool.js renderers.

   Roles: FLIGHT (host, authority + reads the team's pooled report) and four
   consoles (COMMS/NAV/SCIENCE/POWER) who each perceive only ONE channel.
   Sync protocol over net: {type} in
     role   — announce console (roster)
     phrase — FLIGHT broadcasts current phrase {idx, seed}; clients render own channel
     result — FLIGHT broadcasts verdict {ok, pos, says}
     advance— FLIGHT moves to the next phrase / ending
*/
"use strict";
window.MC = window.MC || {};
MC.GAME = (function () {
  const $ = (s) => document.querySelector(s);
  const CONSOLES = ["COMMS", "NAV", "SCIENCE", "POWER"];
  const CREW = { COMMS: "SPARROW", NAV: "COMPASS", SCIENCE: "HALO", POWER: "AMP", FLIGHT: "FLIGHT" };
  const MISSION_LEN = 5;

  // Stand alone from the narrative engine: ensure state + roster helper exist.
  MC.state = MC.state || { id: Math.random().toString(36).slice(2, 9), role: "FLIGHT", name: "Flight", mode: "solo" };
  MC.CREW_ROSTER = MC.CREW_ROSTER || (() => [{ role: "FLIGHT", name: "You" }]);
  const S = MC.state;
  let app, phase = "boot", roundN = 0, cur = null, curSeed = 0, understood = 0, roster = [];
  let actIdx = 0, actPhrases = [], phrasePtr = 0, totalPhrases = 0;

  function net() { return S.net; }
  const isFlight = () => S.role === "FLIGHT";

  // ---------- boot ----------
  function boot() {
    app.innerHTML = `
      <div class="dw-boot">
        <div class="eyebrow">DEEPWATCH · POOLED PERCEPTION</div>
        <h1>ANSWERING THE DARK</h1>
        <p class="quiet">Four senses of one listening mind. You cannot read the dark alone.</p>
        <input id="nm" class="dw-in" maxlength="16" value="${S.name || "Flight"}" placeholder="your name"/>
        <button class="dw-big" data-go="solo"><b>▸ SOLO</b><small>Your crew reports all four senses — you make the call.</small></button>
        <button class="dw-big" data-go="host"><b>▸ HOST A MISSION</b><small>Get a share-code. Up to 4 join, each takes one sense.</small></button>
        <div class="dw-row"><input id="code" class="dw-in code" maxlength="5" placeholder="CODE"/><button class="dw-big narrow" data-go="join"><b>JOIN →</b></button></div>
        <div class="dw-alt"><a data-go="howto" href="#">▸ How it works</a> &nbsp;·&nbsp; <a href="campaign.html">the original story campaign</a></div>
      </div>`;
    app.onclick = (e) => {
      const go = e.target.closest("[data-go]")?.dataset.go; if (!go) return;
      if (go === "howto") { e.preventDefault(); primer(); return; }
      S.name = ($("#nm")?.value || "Flight").trim() || "Flight";
      if (go === "solo") start("solo", null, "FLIGHT");
      else if (go === "host") start("relay", MC.makeCode(), "FLIGHT");
      else if (go === "join") { const c = ($("#code").value || "").toUpperCase(); if (c.length >= 4) start("relay", c, null); }
    };
  }

  // ---------- start / net wiring ----------
  function start(mode, room, role) {
    // host & solo are FLIGHT; a joiner starts UNASSIGNED (role "") so the lobby lets them take a console.
    S.mode = mode; S.room = room; S.role = role || (mode === "solo" ? "FLIGHT" : "");
    S.net = MC.makeNet(mode, room);
    net().onRoster((r) => { roster = r; if (phase === "lobby") renderLobby(); });
    net().onMessage(onMsg);
    net().join();
    if (mode === "solo") beginMission();
    else { phase = "lobby"; renderLobby(); announce(); }
  }
  function announce() { if (S.mode !== "solo") net().send({ type: "role", role: S.role, name: S.name }); }

  function onMsg(m) {
    if (m.type === "role") { /* roster handled by transport; keep names */ }
    if (m.type === "phrase") { curSeed = m.seed; cur = MC.POOL.pick(m.idx); roundN = m.round; phase = "round"; renderRound(); }
    if (m.type === "result") { showResult(m.ok, m.pos, m.says); }
    if (m.type === "advance") { if (m.ending) renderEnding(m.understood); }
    if (m.type === "intro") { actIdx = m.actIdx; phase = "intro"; renderActIntro(); }
    if (m.type === "compose") { phase = "compose"; renderCompose(); }
    if (m.type === "intent") { intent = MC.POOL.INTENTS.find(x => x.key === m.key); renderCompose(); }
    if (m.type === "set") { compose[m.dim] = m.val; renderCompose(); }
    if (m.type === "sent") { intent = MC.POOL.INTENTS.find(x => x.key === m.key); renderReply(); }
  }

  // ---------- lobby ----------
  function renderLobby() {
    const mine = S.role;
    const taken = {}; roster.forEach(r => { if (r.role && r.role !== "FLIGHT") taken[r.role] = r.name || r.role; });
    app.innerHTML = `
      <div class="dw-lobby">
        <div class="eyebrow">MISSION LOBBY</div>
        ${S.room ? `<div class="dw-code">SHARE CODE · <b>${S.room}</b></div>` : ""}
        <p class="quiet">Each crewmate takes ONE sense. When a message comes, you'll only perceive your own — so keep talking (voice or in the room).</p>
        <div class="dw-consoles">
          ${CONSOLES.map(c => {
            const who = taken[c]; const isMine = mine === c;
            return `<button class="dw-console ${isMine ? "mine" : ""} ${who && !isMine ? "busy" : ""}" data-role="${c}">
              <b>${CREW[c]}</b><span>${consoleSense(c)}</span>
              <em>${isMine ? "you" : who || "open"}</em></button>`;
          }).join("")}
        </div>
        <div class="dw-flight">${isFlight() ? "You are <b>FLIGHT</b> — you coordinate and make the final read." : "FLIGHT coordinates the mission."}</div>
        ${isFlight() ? `<button class="dw-big go" data-go="begin"><b>BEGIN THE LISTEN ▸</b></button>` : `<div class="quiet">Waiting for FLIGHT to begin…</div>`}
      </div>`;
    app.onclick = (e) => {
      const r = e.target.closest("[data-role]")?.dataset.role;
      if (r && !isFlight()) { S.role = r; announce(); renderLobby(); }
      if (e.target.closest('[data-go="begin"]')) beginMission();
    };
  }
  function consoleSense(c){ return { COMMS:"hears the rhythm & tone", NAV:"feels where it moves", SCIENCE:"sees the shape it draws", POWER:"senses the energy pulse" }[c]; }

  // ---------- first-time primer (teaches the novel mechanic) ----------
  function seenPrimer() { try { return localStorage.getItem("dw-seen-primer") === "1"; } catch { return false; } }
  function primer() {
    phase = "primer";
    app.innerHTML = `
      <div class="dw-lobby dw-primer">
        <div class="eyebrow">HOW TO LISTEN</div>
        <h1>You are four senses of one mind.</h1>
        <div class="primer-steps">
          <div class="pstep"><span class="pnum">1</span><div><b>The Quiet doesn't speak in words.</b> It sends one thought, split across four senses. Each console perceives only its own — one <i>hears</i> the rhythm, one <i>sees</i> the shape, one <i>feels</i> the motion, one <i>senses</i> the warmth.</div></div>
          <div class="pstep"><span class="pnum">2</span><div><b>No one can read it alone.</b> Your single sense is always ambiguous. Only by pooling what each of you perceives does exactly one meaning survive.</div></div>
          <div class="pstep"><span class="pnum">3</span><div><b>So talk.</b> Say what you sense out loud, agree on the read, and answer the dark together. There's no losing here — only listening, and patience.</div></div>
        </div>
        <button class="dw-big go" data-go="ready"><b>I'm ready to listen ▸</b></button>
      </div>`;
    app.onclick = (e) => { if (e.target.closest('[data-go="ready"]')) { try { localStorage.setItem("dw-seen-primer", "1"); } catch {} boot(); } };
  }

  // ---------- act flow ----------
  function beginMission() {
    actIdx = 0; understood = 0; roundN = 0;
    totalPhrases = MC.POOL.actLen();
    showActIntro();
  }
  function showActIntro() {
    phase = "intro";
    if (S.mode !== "solo") net().send({ type: "intro", actIdx });
    renderActIntro();
  }
  function renderActIntro() {
    const A = MC.POOL.ACTS[actIdx];
    const coordinator = (S.mode === "solo" || isFlight());
    app.innerHTML = `
      <div class="dw-lobby">
        <div class="eyebrow">${A.tag}</div>
        <h1>${A.title}</h1>
        <p class="quiet">${A.intro}</p>
        <div class="dw-flight">The Quiet, right now: <i>${A.quiet}</i></div>
        ${coordinator ? `<button class="dw-big go" data-go="act"><b>${actIdx < 2 ? "BEGIN THE LISTEN ▸" : "COMPOSE THE ANSWER ▸"}</b></button>`
          : `<div class="quiet">Waiting for FLIGHT…</div>`}
      </div>`;
    app.onclick = (e) => { if (e.target.closest('[data-go="act"]')) enterAct(); };
  }
  function enterAct() {
    const A = MC.POOL.ACTS[actIdx];
    if (!A.count) { startCompose(true); return; }   // Act III → compose
    actPhrases = MC.POOL.drawAct(actIdx, (Date.now() & 0x7fffffff) ^ (actIdx * 2654435761 >>> 0));
    phrasePtr = 0;
    presentPhrase();
  }
  function presentPhrase() {
    roundN++;
    const idx = actPhrases[phrasePtr];
    curSeed = (Date.now() & 0xffff) ^ (roundN * 2654435761 >>> 0);
    cur = MC.POOL.pick(idx);
    phase = "round";
    if (S.mode !== "solo") net().send({ type: "phrase", idx, seed: curSeed, round: roundN });
    renderRound();
  }
  function advancePhrase() {
    phrasePtr++;
    if (phrasePtr >= actPhrases.length) { actIdx++; showActIntro(); }
    else presentPhrase();
  }

  function renderRound() {
    const showAll = (S.mode === "solo") || isFlight();
    const roles = showAll ? CONSOLES : [S.role];
    const chHtml = roles.map(r => `<div class="ch" data-ch="${r}"></div>`).join("");
    const { order, correctIdx } = MC.POOL.reads(cur, curSeed);
    const canRead = showAll; // FLIGHT / solo make the call
    const actTag = (MC.POOL.ACTS[actIdx] && MC.POOL.ACTS[actIdx].tag) || "LISTEN";
    const crew = (S.mode === "solo")
      ? `<div class="crewlog">${CONSOLES.map(r => `<div class="crewline">${MC.POOL.crewReport(r, cur)}</div>`).join("")}</div>` : "";
    app.innerHTML = `
      <div class="dw-round">
        <div class="dw-hdr"><span class="eyebrow">${actTag}</span>
          <span class="dw-sig"><span class="presence" style="--warm:${totalPhrases ? (understood / totalPhrases).toFixed(2) : 0}"></span>the Quiet · ${understood}/${totalPhrases || "—"}</span></div>
        <div class="prompt"><div class="lbl">— INCOMING —</div><div class="msg">A pattern resolves out of the static. ${showAll ? "Your crew reports all four senses." : "You perceive only <b>your</b> sense — tell the team what you feel."}</div></div>
        <div class="grid ${roles.length === 1 ? "solo1" : ""}">${chHtml}</div>
        ${crew}
        ${canRead ? `<div class="read"><h3>THE READ</h3><div class="sub">Only one fits every console. What is the Quiet saying?</div>
          <div class="reads">${order.map((oi, pos) => `<button class="readbtn" data-pos="${pos}">${cur.reads[oi]}</button>`).join("")}</div>
          <div class="verdict" id="verdict"></div></div>`
        : `<div class="read waiting"><div class="sub">Report your sense to FLIGHT. When the team agrees, FLIGHT makes the read.</div></div>`}
      </div>`;
    roles.forEach(r => MC.POOL.RENDER[r]($(`.ch[data-ch="${r}"]`), cur));
    if (canRead) app.querySelectorAll("[data-pos]").forEach(b => b.onclick = () => submitRead(+b.dataset.pos, correctIdx));
  }

  function submitRead(pos, correctIdx) {
    const ok = pos === correctIdx;
    if (ok) understood++;
    showResult(ok, pos, cur.says);
    if (S.mode !== "solo") net().send({ type: "result", ok, pos, says: cur.says });
  }

  function showResult(ok, pos, says) {
    if (MC.SOUND) MC.SOUND.chime(ok);
    const v = $("#verdict"); const btns = app.querySelectorAll("[data-pos]");
    if (btns[pos]) btns[pos].classList.add(ok ? "good" : "bad");
    if (v) { v.className = "verdict " + (ok ? "win" : "miss");
      const line = MC.POOL.banter(ok ? "win" : "miss", (curSeed >>> 0) + pos);
      v.innerHTML = ok
        ? `✦ Understood together — “${says}” &nbsp; <span class="qbright">The Quiet brightens.</span><div class="crewline" style="margin-top:8px">${line}</div>`
        : `That reading contradicts a console. Pool again.<div class="crewline" style="margin-top:8px">${line}</div>`; }
    if (ok && (S.mode === "solo" || isFlight())) {
      const last = (phrasePtr >= actPhrases.length - 1);
      setTimeout(() => { const b = document.createElement("button"); b.className = "dw-big go";
        b.innerHTML = `<b>${last ? (actIdx < 2 ? "END OF ACT ▸" : "▸") : "NEXT ▸"}</b>`;
        b.onclick = advancePhrase; ($(".read") || app).appendChild(b); }, 500);
    }
  }

  // ---------- COMPOSE (the reply — the inverse of listening) ----------
  let intent = null, compose = {};
  function controlledDims() {
    if (S.mode === "solo") return Object.values(MC.POOL.CONTROLS);   // solo FLIGHT tunes all four
    if (isFlight()) return [];                                       // FLIGHT coordinates, doesn't tune
    return [MC.POOL.CONTROLS[S.role]];                               // a console tunes its one sense
  }
  function startCompose(broadcast) {
    phase = "compose"; intent = null; compose = {};
    if (broadcast && S.mode !== "solo") net().send({ type: "compose" });
    renderCompose();
  }
  function pickIntent(key) { intent = MC.POOL.INTENTS.find(x => x.key === key); if (S.mode !== "solo") net().send({ type: "intent", key }); renderCompose(); }
  function setDim(dim, val) { compose[dim] = val; if (S.mode !== "solo") net().send({ type: "set", dim, val }); renderCompose(); }
  function previewPhrase() {
    return { truth: { pace: compose.pace || "steady", motion: compose.motion || "still",
      shape: compose.shape || "wave", warmth: compose.warmth || "cool", count: 3 } };
  }
  function dimLabel(d) { return { pace: "COMMS — the rhythm we send", motion: "NAV — how we move", shape: "SCIENCE — the glyph we draw", warmth: "POWER — the warmth we send" }[d]; }
  function renderCompose() {
    const dims = controlledDims(), coordinator = (S.mode === "solo" || isFlight());
    const total = MC.POOL.dimCount(), h = intent ? MC.POOL.harmony(compose, intent) : 0;
    const chan = ["COMMS", "NAV", "SCIENCE", "POWER"];
    let intentHtml = !intent
      ? (coordinator
          ? `<div class="sub">FLIGHT: choose what humanity says back.</div><div class="reads">${MC.POOL.INTENTS.map(it => `<button class="readbtn" data-intent="${it.key}">${it.human}</button>`).join("")}</div>`
          : `<div class="sub">FLIGHT is choosing what to say. Stand by your console.</div>`)
      : `<div class="intent-chosen">Sending: <b>${intent.human}</b></div>`;
    let ctrlHtml = "";
    if (intent && dims.length)
      ctrlHtml = `<div class="read"><h3>YOUR VOICE</h3>${dims.map(d => `<div class="ctrl"><div class="ctrl-lbl">${dimLabel(d)}</div>
        <div class="chips">${MC.POOL.CHOICES[d].map(v => `<button class="chip ${compose[d] === v ? "on" : ""}" data-dim="${d}" data-val="${v}">${v}</button>`).join("")}</div></div>`).join("")}</div>`;
    else if (intent && !dims.length)
      ctrlHtml = `<div class="read"><div class="sub">Your crew is tuning their senses. When the message rings true, send it.</div></div>`;
    app.innerHTML = `
      <div class="dw-round">
        <div class="dw-hdr"><span class="eyebrow">COMPOSE · THE ANSWER</span><span class="dw-sig"><span class="presence" style="--warm:${totalPhrases ? (understood / totalPhrases).toFixed(2) : 1}"></span>the Quiet · ${understood}/${totalPhrases || understood}</span></div>
        <div class="prompt"><div class="lbl">— TRANSMIT —</div><div class="msg">You don't pick a reply — you <b>build</b> one. Each console shapes one sense; it only sings when all four agree.</div></div>
        <div class="read">${intentHtml}</div>
        ${intent ? `<div class="grid" id="cpreview">${chan.map(r => `<div class="ch" data-ch="${r}"></div>`).join("")}</div>` : ""}
        ${ctrlHtml}
        ${intent ? `<div class="read"><div class="harmony">HARMONY <b>${h}/${total}</b><span class="hbar"><i style="width:${h / total * 100}%"></i></span></div>
          ${coordinator ? `<button class="dw-big go ${h < total ? "dim" : ""}" data-send ${h < total ? "disabled" : ""}><b>${h < total ? "not yet in tune…" : "SEND THE ANSWER ▸"}</b></button>`
            : (h < total ? `<div class="sub">${h}/${total} senses in tune — keep talking.</div>` : `<div class="sub">In tune. Waiting for FLIGHT to send…</div>`)}</div>` : ""}
      </div>`;
    if (intent) chan.forEach(r => MC.POOL.RENDER[r]($(`#cpreview .ch[data-ch="${r}"]`), previewPhrase()));
    app.querySelectorAll("[data-intent]").forEach(b => b.onclick = () => pickIntent(b.dataset.intent));
    app.querySelectorAll("[data-dim]").forEach(b => b.onclick = () => setDim(b.dataset.dim, b.dataset.val));
    const send = $("[data-send]"); if (send) send.onclick = () => sendReply();
  }
  function sendReply() { if (MC.SOUND) MC.SOUND.sing(); if (S.mode !== "solo") net().send({ type: "sent", key: intent.key }); renderReply(); }
  function renderReply() {
    const R = MC.POOL.REVEAL;
    app.innerHTML = `
      <div class="dw-ending">
        <div class="eyebrow">— THE ANSWER, SENT —</div>
        <h1>${intent.human}</h1>
        <p class="quiet">${intent.reply}</p>
        <hr class="dw-rule"/>
        <div class="eyebrow" style="color:var(--gold)">— THE QUIET LETS YOU SEE IT —</div>
        <h1 class="reveal-title">“${R.title}”</h1>
        <p class="quiet">${R.body}</p>
        <div class="dw-score">phrases understood together: <b>${understood}/${totalPhrases || understood}</b></div>
        <button class="dw-big go" data-go="again"><b>◂ Answer the dark again</b></button>
      </div>`;
    app.onclick = (e) => { if (e.target.closest('[data-go="again"]')) { phase = "boot"; boot(); } };
  }

  // ---------- ending ----------
  function endMission() { renderEnding(understood); if (S.mode !== "solo") net().send({ type: "advance", ending: true, understood }); }
  function renderEnding(u) {
    const good = u >= Math.ceil(MISSION_LEN * 0.6);
    app.innerHTML = `
      <div class="dw-ending">
        <div class="eyebrow">— THE ANSWER —</div>
        <h1>${good ? "You answered the dark — right." : "The window narrows… but the dark remembers you tried."}</h1>
        <p class="quiet">${good
          ? "Sentence by sentence, four senses became one understanding. The Quiet — the last caretaker-mind of a vanished people, alone across eons — finally has someone who listened. It resolves, for one held moment, into a constellation of many faces, and asks the only thing it ever wanted to ask: <b>“Will you remember us?”</b> You will."
          : "It went shy again, and the signal thinned back to static. But it heard you try to listen — and a memorial that has been alone for eons now knows it isn't entirely forgotten. Maybe next time. It will keep singing, and keep the light on."}</p>
        <div class="dw-score">phrases understood together: <b>${u}/${MISSION_LEN}</b></div>
        <button class="dw-big go" data-go="again"><b>◂ Listen again</b></button>
      </div>`;
    app.onclick = (e) => { if (e.target.closest('[data-go="again"]')) { phase = "boot"; boot(); } };
  }

  return {
    mount(el) { app = el; seenPrimer() ? boot() : primer(); },
    // debug: render a single-console (crewmate) view to preview the multiplayer split
    preview(el, role) { app = el; S.mode = "relay"; S.role = role; S.net = { send(){}, onMessage(){}, onRoster(){}, join(){} };
      cur = MC.POOL.pick(0); curSeed = 1234; roundN = 1; understood = 0; renderRound(); },
    previewCompose(el, key) { app = el; S.mode = "solo"; S.role = "FLIGHT"; understood = 4; phase = "compose";
      intent = MC.POOL.INTENTS.find(x => x.key === (key || "remember"));
      compose = { pace: intent.target.pace, motion: intent.target.motion, shape: "spiral", warmth: intent.target.warmth };
      renderCompose(); },
  };
})();

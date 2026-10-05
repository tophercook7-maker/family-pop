/* ANSWERING THE DARK — engine.js  ·  Deepwatch mission-control runtime
   (formerly "The Last Signal"). Multi-act, choice-flags, assemble mechanic,
   branching endings. Solo + synced multiplayer. */
"use strict";
window.MC = window.MC || {};
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => Array.from(e.querySelectorAll(s));

MC.state = {
  id: Math.random().toString(36).slice(2, 9),
  mode: "solo", role: "FLIGHT", name: "Flight", room: null,
  act: 0, beat: 0, seed: 0, screen: "boot",
  power: 100, morale: 100, signal: 0,
  flags: {}, reply: [],
  net: null, roster: [],
};

MC.acts = () => [MC.ACT1, MC.ACT2, MC.ACT3].filter(Boolean);
MC.curAct = () => MC.acts()[MC.state.act] || [];
MC.ACT_META = [
  { tag: "ACT I · CONTACT",       title: "ACT I — CONTACT",
    blurb: "AURORA hears something in the dark that should not be there. Is it real? Is it alive? And what do you do when the answer is yes?" },
  { tag: "ACT II · THE LONG LISTEN", title: "ACT II — THE LONG LISTEN",
    blurb: "Hearing is not understanding. Now the slow, dangerous work begins: build a shared language, survive its help, and don't flinch when it finally comes close." },
  { tag: "ACT III · THE ANSWER",  title: "ACT III — THE ANSWER",
    blurb: "Humanity has to say something back — and you hold the pen. Choose your words carefully. Someone very old, and very alone, is about to find out who we are." },
];

/* ---------- logging ---------- */
MC.log = function (who, text, fromRemote) {
  const box = $("#log");
  if (box) {
    const div = document.createElement("div");
    div.className = "line";
    div.innerHTML = `<span class="t">${new Date().toTimeString().slice(0,5)}</span>` +
      `<span class="who who-${who}">${who}:</span> ${escapeHtml(text)}`;
    box.appendChild(div); box.scrollTop = box.scrollHeight;
  }
  if (!fromRemote && MC.state.net && MC.state.mode !== "solo")
    MC.state.net.send({ type: "log", who, text });
};
function escapeHtml(s){return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));}

// scene image panel; hides itself gracefully if the file isn't present
MC.viewportHTML = function (src, label, tall) {
  if (!src) return "";
  const onerr = "this.closest('.viewport')&&this.closest('.viewport').remove()";
  return `<div class="viewport ${tall?'tall':''}"><img src="${src}" alt="" onerror="${onerr}"/>` +
    (label?`<span class="vlabel">${escapeHtml(label)}</span>`:"") + `</div>`;
};

/* ---------- gauges + flags ---------- */
MC.setGauge = function (k, delta) {
  MC.state[k] = Math.max(0, Math.min(999, MC.state[k] + (delta||0)));
  const el = $(`.g-${k} b`); if (el) el.textContent = MC.state[k] + (k==="signal"?"%":"");
};
MC.applyEffect = function (eff) {
  if (!eff) return;
  ["power","morale","signal"].forEach(k => eff[k] && MC.setGauge(k, eff[k]));
};
MC.applySet = function (set, flag) {
  if (flag) MC.state.flags[flag] = true;
  if (set) Object.assign(MC.state.flags, set);
};

/* ---------- boot / lobby ---------- */
MC.boot = function () {
  starfield();
  const b = $("#boot");
  b.innerHTML = `
    <div class="hero" style="background-image:url('${MC.LOBBY_IMG}')"></div>
    <h1>ANSWERING&nbsp;THE&nbsp;DARK</h1>
    <div class="sub">Deepwatch Mission Control · a first-contact ops game</div>
    <div class="card">
      <label class="sub" style="display:block;text-align:left;margin-bottom:6px">Controller name</label>
      <input id="nm" class="code" style="width:100%;letter-spacing:1px;font-size:16px;text-align:left" value="Flight" maxlength="18"/>
      <button class="bigbtn" data-go="solo"><b>▸ SOLO — Take command with your crew</b>
        <small>You're Flight Director. Your crew — Sparrow, Compass, Amp, Halo — staff the consoles.</small></button>
      <button class="bigbtn" data-go="host"><b>▸ HOST A MISSION — Play with friends</b>
        <small>Get a share-code. Up to 4 crewmates join you from anywhere.</small></button>
      <div class="row" style="margin-top:6px">
        <input id="joincode" class="code" placeholder="CODE" maxlength="5"/>
        <button class="bigbtn" style="width:auto;margin:0" data-go="join"><b>JOIN →</b></button>
      </div>
      <div style="margin-top:8px"><a class="linkbtn" id="legacylink" href="legacy/index.html">(play the original 5-stations version)</a></div>
    </div>`;
  $("#nm").addEventListener("input", e => MC.state.name = e.target.value || "Flight");
  MC.state.name = "Flight";
  b.addEventListener("click", e => {
    const go = e.target.closest("[data-go]")?.dataset.go; if (!go) return;
    if (go === "solo") MC.start("solo");
    else if (go === "host") MC.start("host");
    else if (go === "join") {
      const code = ($("#joincode").value||"").toUpperCase().trim();
      if (code.length < 4) { $("#joincode").focus(); return; }
      MC.start("join", code);
    }
  });
};

/* ---------- start ---------- */
MC.start = function (kind, code) {
  if (kind === "solo") { MC.state.mode = "solo"; MC.state.role = "FLIGHT"; }
  else if (kind === "host") { MC.state.mode = "multi"; MC.state.role = "FLIGHT"; MC.state.room = MC.makeCode(); }
  else if (kind === "join") { MC.state.mode = "multi"; MC.state.room = code; MC.state.role = pickOpenConsole(); }

  MC.state.net = MC.makeNet(MC.state.mode, MC.state.room);
  MC.state.net.onRoster(r => { MC.state.roster = r; renderRoster(); });
  MC.state.net.onMessage(onNetMessage);

  $("#boot").classList.add("hidden");
  $("#hud").classList.remove("hidden");
  renderTopbar();
  MC.state.net.join();
  MC.showBeat(0);

  MC.log("SYS", MC.state.mode==="solo"
    ? "Solo command. Your crew is on console. The dark is very large tonight, Flight. Let's be worthy of it."
    : `Mission room ${MC.state.room} open. ${MC.RELAY_URL ? "Share the code — crew join from anywhere." : "Same-device crew can join in another tab."}`);
};
function pickOpenConsole(){
  const taken = new Set(MC.state.roster.map(r=>r.role));
  return ["COMMS","SCIENCE","POWER","NAV"].find(r=>!taken.has(r)) || "COMMS";
}

/* ---------- net inbound ---------- */
function onNetMessage(m){
  if (m.type === "log") MC.log(m.who, m.text, true);
  else if (m.type === "beat" && (m.act!==MC.state.act || m.index!==MC.state.beat)) {
    if (typeof m.act==="number") MC.state.act = m.act;
    MC.showBeat(m.index, true);
  } else if (m.type === "gauge") {
    ["power","morale","signal"].forEach(k=>{ if (k in m){ MC.state[k]=m[k]; MC.setGauge(k,0);} });
  }
}
function syncGauges(){ if (MC.state.mode!=="solo") MC.state.net.send({type:"gauge",power:MC.state.power,morale:MC.state.morale,signal:MC.state.signal}); }

/* ---------- topbar / roster ---------- */
function renderTopbar(){
  $("#brand").textContent = "DEEPWATCH";
  $("#mission").textContent = MC.state.mode==="solo"
    ? "SOLO · you are FLIGHT" : `ROOM ${MC.state.room} · you are ${MC.callsignFor(MC.state.role)}`;
  updateActBadge();
  MC.setGauge("power",0); MC.setGauge("morale",0); MC.setGauge("signal",0);
}
function updateActBadge(){
  const meta = MC.ACT_META[MC.state.act] || MC.ACT_META[0];
  const t = $("#act-tag"); if (t) t.textContent = meta.tag;
}
function renderRoster(){
  const el = $("#crewlist"); if (!el) return;
  const list = MC.state.mode==="solo" ? MC.CREW_ROSTER("solo") : MC.state.roster;
  el.innerHTML = list.map(p=>{
    const cs = p.callsign || MC.callsignFor(p.role);
    const you = p.you || p.role===MC.state.role;
    return `<div class="member"><span class="dot ${you?'you':''}"></span>${cs}
      <span class="cs">${p.role}${p.ai?' · AI':''}</span></div>`;
  }).join("");
}

/* ---------- beat rendering ---------- */
MC.showBeat = function (index, fromRemote) {
  const beat = MC.curAct()[index]; if (!beat) return;
  MC.state.beat = index; MC.state.seed++; MC.state.screen = "beat";
  updateActBadge();
  if (!fromRemote && MC.state.mode!=="solo") MC.state.net.send({ type:"beat", act:MC.state.act, index });

  (beat.intro||[]).forEach(([who,line]) => MC.log(who, line, true));

  const main = $("#main");
  main.innerHTML =
    MC.viewportHTML(MC.BEAT_IMG[beat.id] || beat.img, "AURORA · optical feed") +
    `<div class="gear">GEAR · ${beat.gear}</div>` +
    `<h2>${beat.title}</h2>` +
    (beat.intro||[]).map(([who,line])=>`<div class="narr"><b class="who-${who}">${who}</b> — ${escapeHtml(line)}</div>`).join("") +
    (beat.data?`<div class="data">${escapeHtml(beat.data)}</div>`:"") +
    `<div id="interact"></div>`;

  if (beat.type === "choices")  renderChoices(beat);
  else if (beat.type === "solve") renderSolve(beat);
  else if (beat.type === "assemble") renderAssemble(beat);
};

function afterResolve(next, endAct){
  syncGauges();
  if (endAct) return setTimeout(MC.advanceAct, 750);
  setTimeout(()=>MC.showBeat(idOf(next)), 700);
}

function renderChoices(beat){
  const wrap = document.createElement("div"); wrap.className = "choices";
  beat.choices.forEach(ch => {
    const btn = document.createElement("button"); btn.className = "choice"; btn.textContent = ch.label;
    btn.onclick = () => {
      $$(".choice").forEach(b=>b.disabled=true);
      (ch.log||[]).forEach(([who,line])=>MC.log(who,line));
      MC.applyEffect(ch.effect); MC.applySet(ch.set, ch.flag);
      if (ch.react && MC.CREW_REACTIONS[ch.react]) {
        const [who,line] = MC.pick(MC.CREW_REACTIONS[ch.react], MC.state.seed);
        setTimeout(()=>MC.log(who,line), 350);
      }
      afterResolve(ch.next, ch.endAct);
    };
    wrap.appendChild(btn);
  });
  $("#interact").appendChild(wrap);
}

function renderSolve(beat){
  const host = $("#interact");
  host.insertAdjacentHTML("beforeend", `<div class="narr" style="margin-top:8px"><b>${escapeHtml(beat.question)}</b></div>`);
  const wrap = document.createElement("div"); wrap.className="choices";
  let tries = 0;
  beat.answers.forEach(a => {
    const btn = document.createElement("button"); btn.className="choice"; btn.textContent = a.label;
    btn.onclick = () => {
      if (a.ok) {
        $$(".choice").forEach(b=>b.disabled=true);
        showFeedback(host, a.feedback, true);
        (beat.onSolve.log||[]).forEach(([who,line])=>MC.log(who,line));
        MC.applyEffect(beat.onSolve.effect); MC.applySet(beat.onSolve.set, beat.onSolve.flag);
        setTimeout(()=>afterResolve(beat.onSolve.next, beat.onSolve.endAct), 500);
      } else {
        tries++; btn.disabled = true;
        showFeedback(host, a.feedback, false);
        if (tries >= 2 && beat.hint) setTimeout(()=>showFeedback(host, beat.hint, false, true), 400);
      }
    };
    wrap.appendChild(btn);
  });
  host.appendChild(wrap);
}
function showFeedback(host, text, good, hint){
  let fb = host.querySelector(hint?".feedback.hint":".feedback:not(.hint)");
  if (!fb){ fb=document.createElement("div"); host.appendChild(fb); }
  fb.className = "feedback "+(good?"good":"bad")+(hint?" hint":"");
  fb.textContent = (hint?"💡 ":"")+text.replace(/^[A-Z]+: /,"");
  const m=text.match(/^([A-Z]+): (.*)/); if(m) MC.log(m[1], m[2]);
}

/* ---------- assemble (Act III: compose the reply) ---------- */
function renderAssemble(beat){
  const host = $("#interact");
  host.insertAdjacentHTML("beforeend",
    `<div class="narr" style="margin-top:8px"><b>${escapeHtml(beat.prompt)}</b>
     <span style="color:var(--dim)"> (choose ${beat.pick.min}–${beat.pick.max})</span></div>`);
  const pips = document.createElement("div"); pips.className="pips";
  const chosen = new Set();
  beat.components.forEach(c => {
    const p = document.createElement("button"); p.className="pip"; p.dataset.id=c.id;
    p.innerHTML = `${c.label}<div style="font-size:11px;color:var(--dim);margin-top:2px">${escapeHtml(c.note)}</div>`;
    p.onclick = () => {
      if (chosen.has(c.id)) { chosen.delete(c.id); p.classList.remove("on"); }
      else { if (chosen.size>=beat.pick.max) return; chosen.add(c.id); p.classList.add("on"); }
      confirm.disabled = chosen.size < beat.pick.min;
      confirm.textContent = `▸ TRANSMIT REPLY (${chosen.size} chosen)`;
    };
    pips.appendChild(p);
  });
  host.appendChild(pips);
  const confirm = document.createElement("button");
  confirm.className="choice"; confirm.dataset.confirm="1"; confirm.disabled=true;
  confirm.textContent = "▸ TRANSMIT REPLY (0 chosen)";
  confirm.onclick = () => {
    MC.state.reply = [...chosen];
    $$(".pip").forEach(b=>b.disabled=true); confirm.disabled=true;
    (beat.onConfirm.log||[]).forEach(([who,line])=>MC.log(who,line));
    MC.applyEffect(beat.onConfirm.effect); MC.applySet(beat.onConfirm.set, beat.onConfirm.flag);
    afterResolve(beat.onConfirm.next, beat.onConfirm.endAct);
  };
  host.appendChild(confirm);
}

const idOf = (id) => Math.max(0, MC.curAct().findIndex(b=>b.id===id));

/* ---------- act transitions ---------- */
MC.advanceAct = function(){
  MC.state.act++;
  if (MC.state.act >= MC.acts().length) return MC.finish();
  MC.state.screen = "interstitial";
  const meta = MC.ACT_META[MC.state.act];
  updateActBadge();
  $("#main").innerHTML = `
    ${MC.viewportHTML(MC.ACT_IMG[MC.state.act], meta.title, true)}
    <div class="gear">ACT ${["I","II","III"][MC.state.act-1]} · COMPLETE</div>
    <h2>${meta.title}</h2>
    <div class="narr">${escapeHtml(meta.blurb)}</div>
    <div class="data">MISSION STATUS
  understanding … ${MC.state.signal}%
  crew morale … ${MC.state.morale}%
  ship power … ${MC.state.power}
  AURORA … safe · on station</div>
    <div class="choices"><button class="choice" data-continue="1">▸ BEGIN ${meta.title}</button></div>`;
  $("[data-continue]").onclick = () => { if (MC.state.mode!=="solo") MC.state.net.send({type:"beat",act:MC.state.act,index:0}); MC.showBeat(0); };
};

/* ---------- ending ---------- */
MC.finish = function(){
  MC.state.screen = "ending";
  const key = MC.chooseEnding(MC.state);
  const end = MC.ENDINGS[key];
  MC.log("SYS", `— ${end.title.toUpperCase()} —`);
  $("#main").innerHTML = `
    ${MC.viewportHTML(MC.ENDING_IMG[key], end.title, true)}
    <div id="ending-screen" class="gear">MISSION · COMPLETE</div>
    <h2>${end.title}</h2>
    ${end.reveal ? `<div class="data" style="color:var(--violet)">${escapeHtml(end.reveal)}</div>`:""}
    <div class="narr">${escapeHtml(end.text)}</div>
    <div class="data">FINAL LOG
  understanding … ${MC.state.signal}%
  crew morale … ${MC.state.morale}%
  the reply we sent … ${(MC.state.reply||[]).join(", ")||"—"}
  ending … ${end.title}</div>
    <div class="narr" style="color:var(--dim)">${escapeHtml(end.coda)}</div>
    <div class="choices"><button class="choice" onclick="location.reload()">▸ Play again — the dark has other answers</button></div>`;
};

/* ---------- starfield ---------- */
function starfield(){
  const c=document.createElement("canvas"); c.id="stars"; document.body.appendChild(c);
  const x=c.getContext("2d"); let W,H,stars;
  const rz=()=>{W=c.width=innerWidth;H=c.height=innerHeight;
    stars=Array.from({length:150},()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random()*.8+.2}));};
  rz(); addEventListener("resize",rz);
  (function loop(){ x.clearRect(0,0,W,H);
    stars.forEach(s=>{ x.globalAlpha=s.z; x.fillStyle="#9fc7ff";
      x.fillRect(s.x,s.y,s.z*1.6,s.z*1.6); s.y+=s.z*.12; if(s.y>H)s.y=0;});
    requestAnimationFrame(loop);})();
}

document.addEventListener("DOMContentLoaded", MC.boot);

/* ---------- DEMO auto-play (for App Review screen recording) ---------- */
/* Enabled by MC.DEMO in config.js. Shows the lobby, starts a solo mission,
   and plays through visibly so a reviewer sees the full core flow. NOT shipped
   in the store build (MC.DEMO is false there). */
if (window.MC && MC.DEMO) {
  document.addEventListener("DOMContentLoaded", () => {
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    (async () => {
      await wait(2600);                                   // admire the lobby
      try { MC.state.name = "Commander"; MC.start("solo"); } catch (e) {}
      await wait(2400);
      while (true) {
        if ($("#ending-screen")) { await wait(4500); location.reload(); return; }
        const cont = $("#main [data-continue]");
        if (cont && !cont.disabled) { cont.click(); await wait(2600); continue; }
        const beat = MC.curAct()[MC.state.beat];
        if (MC.state.screen === "beat" && beat && beat.type === "assemble") {
          const pips = $$("#interact .pip").filter(b => !b.disabled);
          const need = beat.pick.min - $$("#interact .pip.on").length;
          for (let i = 0; i < need && i < pips.length; i++) { pips[i].click(); await wait(700); }
          const conf = $("#interact [data-confirm]");
          if (conf && !conf.disabled) { conf.click(); }
          await wait(2600); continue;
        }
        const btns = $$("#interact .choice").filter(b => !b.disabled);
        if (btns.length) {
          let t = btns[0];
          if (beat && beat.type === "solve") {
            const ok = beat.answers.find(a => a.ok);
            t = btns.find(b => b.textContent === ok.label) || btns[0];
          }
          t.click();
        }
        await wait(2700);
      }
    })();
  });
}

/* ---------- screenshot helper: ?startsolo jumps into the mission ---------- */
if (location.search.includes("startsolo"))
  document.addEventListener("DOMContentLoaded", () => { MC.state.name = "Topher"; MC.start("solo"); });

/* ---------- headless self-test (?autotest=1) — plays all three acts ---------- */
if (location.search.includes("autotest")) {
  window.onerror = (msg) => { document.title = "AUTOTEST:FAIL:" + msg; };
  let steps = 0;
  document.addEventListener("DOMContentLoaded", () => {
    try { MC.state.name = "Tester"; MC.start("solo"); } catch (e) { document.title = "AUTOTEST:FAIL:start:" + e.message; }
  });
  setInterval(() => {
    try {
      if ($("#ending-screen")) {
        if (!/AUTOTEST/.test(document.title))
          document.title = `AUTOTEST:PASS:steps=${steps}:signal=${MC.state.signal}:morale=${MC.state.morale}:ending=${$("#main h2")?.textContent}`;
        return;
      }
      const cont = $("#main [data-continue]");
      if (cont && !cont.disabled) { cont.click(); steps++; return; }
      const beat = MC.curAct()[MC.state.beat];
      if (MC.state.screen==="beat" && beat && beat.type==="assemble") {
        const pips = $$("#interact .pip").filter(b=>!b.disabled);
        const picked = $$("#interact .pip.on").length;
        if (picked < beat.pick.min && pips.length) { pips[picked].click(); return; }
        const conf = $("#interact [data-confirm]"); if (conf && !conf.disabled) { conf.click(); steps++; }
        return;
      }
      const btns = $$("#interact .choice").filter(b=>!b.disabled);
      if (!btns.length) return;
      let target = btns[0];
      if (beat && beat.type==="solve") {
        const ok = beat.answers.find(a=>a.ok);
        target = btns.find(b=>b.textContent===ok.label) || btns[0];
      }
      target.click(); steps++;
    } catch (e) { document.title = "AUTOTEST:FAIL:loop:" + e.message; }
  }, 150);
}

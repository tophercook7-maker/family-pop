/* ============================================================
   THE LAST SIGNAL — game.js
   Multiplayer text adventure engine
   ============================================================ */

"use strict";

/* ---------- tiny utils ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const uid = () => Math.random().toString(36).slice(2, 9);
const ts = () => new Date().toISOString().slice(11, 19);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/* ---------- broadcast channel for multiplayer ---------- */
const BC = (() => {
  let ch = null;
  const subscribers = [];
  const init = () => {
    if (!ch) ch = new BroadcastChannel("the-last-signal");
    ch.addEventListener("message", (e) => {
      const msg = e.data;
      if (msg && msg.source && msg.source !== localStation()) {
        subscribers.forEach((fn) => fn(msg));
      }
    });
  };
  const send = (payload) => {
    if (!ch) init();
    ch.postMessage({ ...payload, source: localStation(), at: ts() });
  };
  const onMessage = (fn) => { subscribers.push(fn); };
  return { init, send, onMessage };
})();

function localStation() {
  return Game.state.station || "UNKNOWN";
}
function localCallsign() {
  return Game.state.callsign || "ANON";
}

/* ---------- persistent save ---------- */
const Store = {
  key: "the-last-signal-save",
  save() {
    const payload = {
      v: 1,
      state: Game.state,
      meta: { savedAt: ts(), station: localStation() },
    };
    try { localStorage.setItem(this.key, JSON.stringify(payload)); } catch {}
  },
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  clear() {
    try { localStorage.removeItem(this.key); } catch {}
  },
};

/* ---------- clock / mission timer ---------- */
const Clock = {
  start: Date.now(),
  durationMs: 6 * 60 * 60 * 1000, // 6 hours in-game
  elapsed() {
    return Date.now() - this.start;
  },
  remaining() {
    return Math.max(0, this.durationMs - this.elapsed());
  },
  formatMs(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const s = String(totalSec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  },
  tick() {
    const remaining = this.remaining();
    $("#clock-value").textContent = this.formatMs(remaining);
    const totalSec = Math.floor(remaining / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    $("#clock-eta").textContent = `T-MINUS ${m}:${String(s).padStart(2, "0")}`;
    if (remaining <= 0) {
      Game.end("timeout");
    }
  },
};

/* ---------- comms ---------- */
const Comms = {
  init() {
    const form = $("#comms-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#comms-input");
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      this.broadcast(text);
      this.log(localCallsign(), text, true);
    });
    BC.onMessage((msg) => {
      if (msg.type === "comms") {
        this.log(msg.payload.callsign, msg.payload.text, false);
      } else if (msg.type === "global") {
        this.log(`SYSTEM [${msg.source}]`, msg.payload.text, false);
      }
    });
  },
  broadcast(text) {
    BC.send({ type: "comms", payload: { callsign: localCallsign(), text } });
  },
  log(callsign, text, self) {
    const log = $("#comms-log");
    if (!log) return;
    const li = document.createElement("li");
    li.innerHTML = `<div class="meta">${self ? "YOU" : callsign} · ${ts()}</div><div>${escapeHtml(text)}</div>`;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  },
  sendGlobal(text) {
    BC.send({ type: "global", payload: { text } });
  },
};

/* ---------- contacts / presence ---------- */
const Contacts = {
  registry: {
    "AURORA-7": "Arctic Communications",
    "PINNACLE": "Mountain Signal Analysis",
    "MERIDIAN": "Desert Data Decryption",
    "TRIDENT": "Oceanic Systems Engineering",
    "HELIX": "Orbital Mission Coordination",
  },
  known: new Set(["AURORA-7", "PINNACLE", "MERIDIAN", "TRIDENT", "HELIX"]),
  seen: new Set(),
  init() {
    BC.onMessage((msg) => {
      if (msg.source && this.known.has(msg.source)) {
        this.seen.add(msg.source);
        this.render();
      }
    });
    this.render();
    Objectives.refresh();
  },
  render() {
    const el = $("#station-contacts");
    if (!el) return;
    el.innerHTML = "";
    this.known.forEach((station) => {
      const online = station === localStation() || this.seen.has(station);
      const div = document.createElement("div");
      div.className = `contact ${online ? "online" : ""}`;
      div.innerHTML =
        `<div class="dot"></div>` +
        `<div class="callsign">${station}</div>` +
        `<div class="role">${this.registry[station] || "Unknown"}</div>`;
      el.appendChild(div);
    });
  },
};

/* ---------- objectives ---------- */
const Objectives = {
  list: [
    { id: "connect", text: "Connect to your station", done: () => !!Game.state.station },
    { id: "read_first", text: "Read the first scene", done: () => !!Game.state.scene && Game.state.scene !== "intro" },
    { id: "broadcast_once", text: "Send one broadcast to all stations", done: () => (Game.state.broadcastEvents?.size || 0) > 0 },
    { id: "share_findings", text: "Share at least one key finding", done: () => Object.values(Game.state.flags || {}).some(Boolean) },
    { id: "check_ending", text: "Check mission outcome before time runs out", done: () => false },
  ],
  render() {
    const ul = $("#objectives-list");
    if (!ul) return;
    ul.innerHTML = "";
    this.list.forEach((item) => {
      const li = document.createElement("li");
      const done = !!item.done();
      li.className = `objective ${done ? "done" : ""}`;
      li.innerHTML = `<span class="objective-marker">${done ? "●" : "○"}</span><span>${item.text}</span>`;
      ul.appendChild(li);
    });
  },
  refresh() {
    this.render();
  },
};

/* ---------- scene engine ---------- */
class SceneEngine {
  constructor() {
    this.currentSceneId = null;
  }
  render(sceneId, payload = {}) {
    const scene = Stations.current.scenes[sceneId];
    if (!scene) {
      console.warn("Missing scene:", sceneId);
      return;
    }
    this.currentSceneId = sceneId;
    Game.state.scene = sceneId;
    Store.save();

    const loc = $("#scene-location");
    const text = $("#scene-text");
    const help = $("#scene-help");
    const choices = $("#scene-choices");
    const status = $("#scene-status");

    if (loc) loc.textContent = `${localStation()} — ${scene.location || "UNKNOWN"}`;
    if (text) text.textContent = scene.text;
    if (help) {
      const firstTime = !(Game.state.flags && Game.state.flags["tutorial_seen"]);
      help.innerHTML = firstTime
        ? `<div class="scene-tutorial">First time here? Open the menu ☰ → Mission or How to Play. Open multiple tabs as different stations to cooperate.</div>`
        : "";
    }

    if (choices) {
      choices.innerHTML = "";
      let firstChoice = true;
      (scene.choices || []).forEach((c) => {
        const btn = document.createElement("button");
        btn.className = "choice";
        btn.innerHTML = `<div>${escapeHtml(c.text)}</div>${c.hint ? `<div class="hint">${escapeHtml(c.hint)}</div>` : ""}`;
        btn.addEventListener("click", () => {
          if (firstChoice && !Game.state.flags["tutorial_seen"]) {
            Game.onEvent({ type: "setFlag", key: "tutorial_seen" });
            firstChoice = false;
          }
          const next = typeof c.next === "function" ? c.next(Game.state, payload) : c.next;
          const event = typeof c.event === "function" ? c.event(Game.state) : c.event || null;
          if (event) {
            Game.onEvent(event);
          }
          this.render(next, { ...payload, _choice: c.id });
        });
        choices.appendChild(btn);
      });
    }

    if (status) {
      status.innerHTML = `
        <span>Station: ${localStation()}</span>
        <span>Scene: ${sceneId}</span>
        <span>Saved autos</span>
      `;
    }
    Objectives.refresh();

    Game.addLog(`Scene → ${scene.location || sceneId}`);
  }
}

/* ---------- endings ---------- */
const Endings = {
  united: {
    id: "united",
    title: "ENDING: UNITED FRONT",
    text:
      "Across five stations, humanity coordinated like a single organism. The signal is confirmed as extraterrestrial contact. Because you shared instead of hoarded, the message arrived intact. First contact is peaceful, organized, and yours.",
    requires: {
      helix: ["helix_announced"],
      trident: ["pulse_shared"],
      meridian: ["message_translated"],
      pinnacle: ["primes_shared"],
      aurora: ["pattern_confirmed", "map_shared", "pass_shared"],
    },
  },
  partial: {
    id: "partial",
    title: "ENDING: COORDINATED INCOMPLETE",
    text:
      "Stations shared enough to build a partial handshake, but key pieces are missing. Some heard a warning. Others heard an invitation. Without full consensus, the window closed. The signal never repeats.",
    requires: {
      helix: ["helix_announced"],
      trident: ["pulse_shared"],
      meridian: ["message_translated"],
      pinnacle: ["primes_shared"],
      aurora: ["pattern_confirmed", "map_shared"],
    },
  },
  isolated: {
    id: "isolated",
    title: "ENDING: FRAGMENTED SIGNAL",
    text:
      "Each station solved its own puzzle, but together you failed to reconstruct the full message. Some heard a warning. Others heard an invitation. Without consensus, the window closed. The signal never repeats.",
    requires: { any: ["pattern_confirmed", "primes_shared", "message_translated", "pulse_shared", "helix_announced"] },
  },
  timeout: {
    id: "timeout",
    title: "ENDING: DEAD AIR",
    text:
      "The deadline passed before global coordination could form. Whatever was meant to arrive at those coordinates never got a clear answer. Stations stand silent. The next signal, if there is one, is anyone’s guess.",
  },
};

/* ---------- main app ---------- */
const Game = {
  state: {
    station: null,
    callsign: null,
    scene: "intro",
    flags: {},
    inventory: new Set(),
    startedAt: Date.now(),
    broadcastEvents: new Set(),
  },
  engine: new SceneEngine(),

  init() {
    this.bindTabs();
    this.bindMenu();
    this.bindEnding();
    BC.init();
    Comms.init();
    Contacts.init();

    const restored = Store.load();
    if (restored && restored.state && restored.state.station) {
      this.state = restored.state;
      Stations.load(this.state.station).then(() => {
        this.enterStation(this.state.station, this.state.callsign, false);
        this.engine.render(this.state.scene || "intro");
        Objectives.refresh();
      }).catch(() => {
        this.enterStation(this.state.station, this.state.callsign, false);
        this.engine.render("intro");
        Objectives.refresh();
      });
    } else {
      this.show("lobby");
    }

    $("#lobby-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const callsign = $("#callsign").value.trim().toUpperCase();
      const station = $("#station-select").value;
      if (!station) return alert("Pick a station.");
      if (!callsign) return alert("Enter a callsign.");
      try {
        await Stations.load(station);
      } catch (err) {
        console.error(err);
        alert("Failed to load station module: " + (err && err.message ? err.message : err));
        return;
      }
      this.enterStation(station, callsign, true);
      Objectives.refresh();
      this.engine.render("intro");
    });

    // tick clock every second
    setInterval(() => Clock.tick(), 1000);
    Clock.tick();
  },

  enterStation(station, callsign, fresh) {
    this.state.station = station;
    this.state.callsign = callsign;
    this.state.scene = fresh ? "intro" : this.state.scene;
    $("#station-id").textContent = `${station} // ${callsign}`;
    this.tab("scene");
    this.renderScene();
    this.showTip("Tip: Use the Inter-Station Channel to share clues with other stations. Cooperation unlocks the best ending.");
    Comms.broadcast(`${callsign} online at ${station}`);
    BC.sendGlobal(`${callsign} connected to ${station}.`);
    this.addLog(`Connected to ${station} as ${callsign}`);
    if (fresh) Store.save();
  },

  renderScene() {
    this.engine.render(this.state.scene || "intro");
  },

  show(viewId) {
    $$(".view").forEach((v) => v.classList.remove("active"));
    const target = $(`#${viewId}`);
    if (target) target.classList.add("active");
    $("#menu").classList.add("hidden");
  },

  tab(name) {
    $$("#tab-bar button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    this.show(name);
  },

  bindTabs() {
    $$("#tab-bar button").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.tab(btn.dataset.tab);
      });
    });
    $$("button[data-return]").forEach((btn) => {
      btn.addEventListener("click", () => this.tab("hud"));
    });
  },

  bindMenu() {
    $("#menu-btn")?.addEventListener("click", () => {
      $("#menu").classList.toggle("hidden");
    });
    $$("#menu button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        if (action === "mission") {
          Game.show("mission");
        } else if (action === "save") {
          Store.save();
          alert("Mission saved.");
        } else if (action === "load") {
          const restored = Store.load();
          if (restored?.state?.station) {
            this.state = restored.state;
            this.enterStation(this.state.station, this.state.callsign, false);
            this.engine.render(this.state.scene || "intro");
          } else {
            alert("No saved mission found.");
          }
        } else if (action === "restart") {
          if (confirm("Restart mission? Progress will be lost.")) {
            Store.clear();
            location.reload();
          }
        } else if (action === "about") {
          modal("About", "THE LAST SIGNAL — by Topher Cook\nMultiplayer text suspense adventure.\nNo horror. No blood. No profanity.");
        } else if (action === "help") {
          modal("How to Play", "1) Choose a station and enter a callsign.\n2) Read the scene, then pick a choice.\n3) Use the bottom tabs: HQ, Ops, Logs, More.\n4) Use Inter-Station Channel to coordinate with other stations.\n5) Share findings. The ending depends on cooperation.\n\nTips:\n- Open multiple tabs as different stations to test multiplayer.\n- Your progress autosaves locally.\n- Menu → Save/Load anytime.\n- The clock is your deadline.", [
            { label: "Got it", fn: () => {} }
          ]);
        }
        $("#menu").classList.add("hidden");
      });
    });
  },

  bindEnding() {
    $("#ending-restart")?.addEventListener("click", () => {
      Store.clear();
      location.reload();
    });
  },

  addLog(text) {
    const log = $("#terminal-log");
    if (!log) return;
    const li = document.createElement("li");
    li.textContent = `[${ts()}] ${text}`;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  },

  onEvent(evt) {
    const s = this.state;
    if (evt.type === "setFlag") s.flags[evt.key] = evt.value !== undefined ? evt.value : true;
    if (evt.type === "addItem") s.inventory.add(evt.item);
    if (evt.type === "removeItem") s.inventory.delete(evt.item);
    if (evt.type === "broadcast") this.broadcast(evt.text);
    if (evt.type === "global") BC.sendGlobal(evt.text);
    if (evt.type === "checkEnding") {
      const ending = Endings[evt.ending] || Endings.timeout;
      const req = ending.requires;
      if (!req) {
        this.end(evt.ending);
        return;
      }
      let useEnding = evt.ending;
      if (ending.id === "timeout") {
        // timeout is handled separately by Clock; allow explicit check too
      } else if (req.any) {
        const anyMet = req.any.some((flag) => !!s.flags[flag]);
        if (!anyMet) useEnding = "timeout";
      } else if (req.helix || req.trident || req.meridian || req.pinnacle || req.aurora) {
        const checks = [];
        if (req.helix) checks.push(req.helix.every((f) => !!s.flags[f]));
        if (req.trident) checks.push(req.trident.every((f) => !!s.flags[f]));
        if (req.meridian) checks.push(req.meridian.every((f) => !!s.flags[f]));
        if (req.pinnacle) checks.push(req.pinnacle.every((f) => !!s.flags[f]));
        if (req.aurora) checks.push(req.aurora.every((f) => !!s.flags[f]));
        const allMet = checks.every((c) => c);
        const someMet = checks.some((c) => c);
        if (!allMet && evt.ending === "united") {
          useEnding = someMet ? "partial" : "isolated";
        } else if (!allMet && evt.ending === "partial") {
          useEnding = someMet ? "partial" : "isolated";
        }
      }
      this.end(useEnding);
    }
    Objectives.refresh();
    Store.save();
  },

  broadcast(text) {
    Comms.broadcast(text);
    if (!Game.state.broadcastEvents) Game.state.broadcastEvents = new Set();
    Game.state.broadcastEvents.add(text);
    Objectives.refresh();
  },

  end(endingId) {
    const ending = Endings[endingId] || Endings.timeout;
    Game.state.ending = endingId;
    Store.save();
    $("#ending-title").textContent = ending.title;
    $("#ending-text").textContent = ending.text;
    const stats = $("#ending-stats");
    if (stats) {
      stats.innerHTML = `
        <div class="stat-row"><span>Station</span><b>${localStation()}</b></div>
        <div class="stat-row"><span>Callsign</span><b>${localCallsign()}</b></div>
        <div class="stat-row"><span>Ending</span><b>${ending.title}</b></div>
        <div class="stat-row"><span>Total stations seen</span><b>${Contacts.seen.size + 1}</b></div>
      `;
    }
    this.tab("ending");
    this.addLog(`Mission ended → ${ending.title}`);
  },
};

/* ---------- modal ---------- */
function modal(title, body, actions = []) {
  const m = $("#modal");
  $("#modal-title").textContent = title;
  $("#modal-body").textContent = body;
  const wrap = $("#modal-actions");
  wrap.innerHTML = "";
  actions.forEach((a) => {
    const btn = document.createElement("button");
    btn.textContent = a.label;
    btn.addEventListener("click", () => {
      a.fn();
      m.classList.add("hidden");
    });
    wrap.appendChild(btn);
  });
  m.classList.remove("hidden");
}

function showTip(text, ms = 6000) {
  let tip = $("#tip-banner");
  if (!tip) {
    tip = document.createElement("div");
    tip.id = "tip-banner";
    document.body.appendChild(tip);
  }
  tip.textContent = text;
  tip.classList.remove("hidden");
  clearTimeout(tip._timer);
  tip._timer = setTimeout(() => tip.classList.add("hidden"), ms);
}

/* ---------- escape ---------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Load station scripts on-demand via script injection */
function loadStationScript(name) {
  return new Promise((resolve, reject) => {
    if (window[name]) return resolve(window[name]);
    const s = document.createElement("script");
    s.src = `stations/${name.toLowerCase()}.js`;
    s.onload = () => {
      if (!window[name]) {
        reject(new Error(`Station script loaded but window.${name} is missing`));
        return;
      }
      resolve(window[name]);
    };
    s.onerror = () => reject(new Error(`Failed to load stations/${name.toLowerCase()}.js`));
    document.head.appendChild(s);
  });
}

/* ---------- stations registry ---------- */
const Stations = {
  current: null,
  async load(name) {
    const modName = name.replace(/-/g, ""); // AURORA-7 -> AURORA7
    const mod = await loadStationScript(modName);
    this.current = mod;
  },
};

/* ---------- bootstrap ---------- */
window.addEventListener("DOMContentLoaded", () => {
  Game.init();
});

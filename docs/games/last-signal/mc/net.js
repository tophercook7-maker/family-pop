/* THE LAST SIGNAL — net.js
   Transport abstraction so the SAME game runs three ways:
     • solo   — no network, crew are made-up AI
     • local  — BroadcastChannel (multiple tabs / same device), zero server
     • relay  — WebSocket share-code (join from ANYWHERE); set MC.RELAY_URL
   All transports expose: .join(room), .send(msg), .onMessage(fn), .onRoster(fn)
   A message is {type, from, role, payload}. The engine doesn't care which
   transport delivered it. */
"use strict";
window.MC = window.MC || {};

// Point this at your deployed relay (see server/relay.js) to play across devices.
// Example: MC.RELAY_URL = "wss://deepwatch-relay.example.com";
MC.RELAY_URL = MC.RELAY_URL || null;

MC.makeCode = () => {
  const A = "ACDEFHJKLMNPRTUVWXY3479"; // no ambiguous chars
  let s = ""; for (let i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)];
  return s;
};

/* ---- SOLO: loopback, roster is just you + made-up crew ---- */
MC.SoloNet = function () {
  const subs = [], rosterSubs = [];
  return {
    kind: "solo",
    join() { setTimeout(() => rosterSubs.forEach(f => f(MC.CREW_ROSTER("solo"))), 0); },
    send() {/* solo: nothing leaves the room */},
    onMessage(fn) { subs.push(fn); },
    onRoster(fn) { rosterSubs.push(fn); },
  };
};

/* ---- LOCAL: BroadcastChannel across tabs on this device ---- */
MC.LocalNet = function (room) {
  const subs = [], rosterSubs = [];
  const ch = new BroadcastChannel("last-signal:" + room);
  const seen = {}; // role -> lastSeen
  const me = () => ({ role: MC.state.role, name: MC.state.name });
  const bumpRoster = () => {
    const now = Date.now();
    const roster = Object.entries(seen)
      .filter(([, t]) => now - t < 8000)
      .map(([role]) => ({ role, name: role }));
    rosterSubs.forEach(f => f(roster));
  };
  ch.onmessage = (e) => {
    const m = e.data;
    if (!m || m.from === MC.state.id) return;
    if (m.role) { seen[m.role] = Date.now(); bumpRoster(); }
    if (m.type === "hello") ch.postMessage({ type: "here", from: MC.state.id, role: MC.state.role });
    subs.push && subs.forEach(f => f(m));
  };
  return {
    kind: "local",
    join() { ch.postMessage({ type: "hello", from: MC.state.id, role: MC.state.role });
             seen[MC.state.role] = Date.now(); bumpRoster();
             setInterval(() => { ch.postMessage({ type: "ping", from: MC.state.id, role: MC.state.role }); }, 3000); },
    send(msg) { ch.postMessage({ ...msg, from: MC.state.id, role: MC.state.role }); },
    onMessage(fn) { subs.push(fn); },
    onRoster(fn) { rosterSubs.push(fn); },
  };
};

/* ---- RELAY: WebSocket share-code, cross-device ---- */
MC.RelayNet = function (room) {
  const subs = [], rosterSubs = [];
  let ws, ready = false, queue = [];
  const connect = () => {
    ws = new WebSocket(MC.RELAY_URL);
    ws.onopen = () => {
      ready = true;
      ws.send(JSON.stringify({ type: "join", room, from: MC.state.id, role: MC.state.role, name: MC.state.name }));
      queue.forEach(q => ws.send(q)); queue = [];
    };
    ws.onmessage = (e) => {
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.type === "roster") { rosterSubs.forEach(f => f(m.roster)); return; }
      if (m.from === MC.state.id) return;
      subs.forEach(f => f(m));
    };
    ws.onclose = () => { ready = false; setTimeout(connect, 1500); };
  };
  return {
    kind: "relay",
    join() { if (!MC.RELAY_URL) { console.warn("No MC.RELAY_URL set"); } else connect(); },
    send(msg) { const s = JSON.stringify({ ...msg, room, from: MC.state.id, role: MC.state.role });
                if (ready) ws.send(s); else queue.push(s); },
    onMessage(fn) { subs.push(fn); },
    onRoster(fn) { rosterSubs.push(fn); },
  };
};

MC.makeNet = (mode, room) =>
  mode === "solo" ? MC.SoloNet()
  : (MC.RELAY_URL ? MC.RelayNet(room) : MC.LocalNet(room));

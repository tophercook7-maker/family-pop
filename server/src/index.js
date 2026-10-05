// Family Pop server — one private "Family" per family (a Durable Object), so each family's
// people, chat, feed, bank, Family Book and board games live together and update live.
import { DurableObject } from "cloudflare:workers";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type,x-fp-token",
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...CORS } });
const fail = (msg, status = 400) => json({ error: msg }, status);
const rid = (n = 10) => { const a = "abcdefghjkmnpqrstuvwxyz23456789"; let s = ""; const b = crypto.getRandomValues(new Uint8Array(n)); for (const x of b) s += a[x % a.length]; return s; };
const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, "0")).join("");
const clip = (s, n) => String(s ?? "").slice(0, n);
const today = () => new Date().toISOString().slice(0, 10);

// Daily Pop Bucks caps so the bank stays meaningful
const EARN_CAPS = { "word-popper": 300, "pic-pop": 600, "story": 60, "challenge": 200 };
const SHOP = { pass: 300, square: 600, piece: 150 };
const PROFILE_FIELDS = ["name", "piece", "birthday", "nick", "food", "secret", "chatTrivia", "mom"];

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const p = url.pathname.split("/").filter(Boolean); // api, ...
    if (p[0] !== "api") return json({ ok: true, app: "family-pop" });
    try {
      if (p[1] === "create" && req.method === "POST") {
        const fid = rid(12);
        const stub = env.FAMILY.get(env.FAMILY.idFromName(fid));
        const body = await req.json();
        return stub.fetch(new Request(`https://do/init?fid=${fid}`, { method: "POST", body: JSON.stringify(body) }));
      }
      if (p[1] === "relink" && req.method === "POST") {
        const { code } = await req.json();
        const dir = env.DIR.get(env.DIR.idFromName("dir"));
        const r = await (await dir.fetch(new Request("https://dir/get", { method: "POST", body: JSON.stringify({ code: clip(code, 12).toUpperCase() }) }))).json();
        if (!r.fid) return fail("That code didn't work. Codes last 15 minutes.", 404);
        const stub = env.FAMILY.get(env.FAMILY.idFromName(r.fid));
        return stub.fetch(new Request(`https://do/relink?fid=${r.fid}`, { method: "POST", body: JSON.stringify(r) }));
      }
      if (p[1] === "f" && p[2]) {
        const fid = clip(p[2], 20);
        const stub = env.FAMILY.get(env.FAMILY.idFromName(fid));
        const rest = "/" + p.slice(3).join("/");
        const u = new URL(`https://do${rest}`);
        u.search = url.search; u.searchParams.set("fid", fid);
        return stub.fetch(new Request(u, req));
      }
      return fail("Not found", 404);
    } catch (e) { return fail("Server error: " + e.message, 500); }
  },
};

export class Directory extends DurableObject {
  async fetch(req) {
    const url = new URL(req.url), b = await req.json();
    if (url.pathname === "/put") { await this.ctx.storage.put("c:" + b.code, { fid: b.fid, memberId: b.memberId, exp: Date.now() + 15 * 60e3 }); return json({ ok: true }); }
    if (url.pathname === "/get") {
      const v = await this.ctx.storage.get("c:" + b.code);
      if (!v || v.exp < Date.now()) return json({});
      await this.ctx.storage.delete("c:" + b.code);
      return json(v);
    }
    return json({});
  }
}

export class Family extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.env = env; this.d = null; }

  async load() {
    if (this.d) return this.d;
    const keys = ["meta", "members", "chat", "feed", "book", "sqpics", "games", "earn", "trivia"];
    const got = await this.ctx.storage.get(keys);
    this.d = {
      meta: got.get("meta") || null, members: got.get("members") || {}, chat: got.get("chat") || [], feed: got.get("feed") || [],
      book: got.get("book") || [], sqpics: got.get("sqpics") || {}, games: got.get("games") || {}, earn: got.get("earn") || {}, trivia: got.get("trivia") || [],
    };
    return this.d;
  }
  async save(...keys) { const o = {}; for (const k of keys) o[k] = this.d[k]; await this.ctx.storage.put(o); }
  async putPhoto(b64) {
    if (!b64 || typeof b64 !== "string" || !b64.startsWith("data:image/")) return null;
    if (b64.length > 900_000) throw new Error("That photo is too big");
    const id = rid(12); await this.ctx.storage.put("photo:" + id, b64); return id;
  }
  broadcast(type, data, onlyTo) {
    for (const ws of this.ctx.getWebSockets()) {
      const [mid] = this.ctx.getTags(ws);
      if (onlyTo && !onlyTo.includes(mid)) continue;
      try { ws.send(JSON.stringify({ type, data })); } catch (e) {}
    }
  }
  newMember(fields, status) {
    const m = { id: rid(8), status, joined: Date.now(), bucks: 500, passes: 1, pieces: [], sqCredits: 0,
      stats: { games: 0, wins: 0, right: 0, asked: 0, rent: 0, trophies: [] }, chatTrivia: true, mom: false, approver: false };
    for (const f of PROFILE_FIELDS) if (fields[f] !== undefined) m[f] = typeof fields[f] === "boolean" ? fields[f] : clip(fields[f], f === "secret" ? 140 : 40);
    if (!m.name) m.name = "Family member";
    if (!m.piece) m.piece = "🫧";
    return m;
  }
  publicMember(m, full) {
    const o = { id: m.id, name: m.name, piece: m.piece, status: m.status, approver: !!m.approver, mom: !!m.mom, creator: !!m.creator,
      bucks: m.bucks, passes: m.passes, stats: m.stats, pieces: m.pieces || [] };
    if (full) Object.assign(o, { birthday: m.birthday || "", nick: m.nick || "", food: m.food || "", secret: m.secret || "", chatTrivia: m.chatTrivia !== false, sqCredits: m.sqCredits || 0 });
    return o;
  }
  async who(req, url) {
    const t = req.headers.get("x-fp-token") || url.searchParams.get("t");
    if (!t) return null;
    const h = await sha(t);
    return Object.values(this.d.members).find(m => m.tokenHash === h) || null;
  }
  async issueToken(m) { const t = rid(24); m.tokenHash = await sha(t); return t; }
  snapshot(me) {
    const d = this.d;
    if (me.status !== "member") return { meta: { name: d.meta.name }, me: this.publicMember(me, true), pending: true };
    const members = Object.values(d.members).filter(m => m.status === "member" || (me.approver && m.status === "pending"));
    const myRooms = (r) => r === "all" || r.split("~").includes(me.id);
    return {
      meta: { name: d.meta.name, approval: d.meta.approval, fid: d.meta.fid, code: d.meta.code },
      me: this.publicMember(me, true),
      members: members.map(m => this.publicMember(m, m.status === "member")),
      chat: d.chat.filter(c => myRooms(c.room)).slice(-300),
      feed: d.feed.slice(-80),
      book: d.book, trivia: d.trivia.slice(-200), sqpics: d.sqpics,
      games: Object.values(d.games).map(g => ({ id: g.id, title: g.title, status: g.status, updated: g.updated, players: g.players, turnMember: g.turnMember, created: g.created })),
    };
  }

  async fetch(req) {
    const url = new URL(req.url);
    const d = await this.load();
    const path = url.pathname;

    if (path === "/init" && req.method === "POST") {
      if (d.meta) return fail("Family already exists");
      const b = await req.json();
      d.meta = { fid: url.searchParams.get("fid"), name: clip(b.familyName || "Our Family", 40), code: rid(6).toUpperCase(), approval: true, created: Date.now() };
      const m = this.newMember(b.me || {}, "member"); m.creator = true; m.approver = true;
      const token = await this.issueToken(m); d.members[m.id] = m;
      await this.save("meta", "members");
      return json({ fid: d.meta.fid, memberId: m.id, token, code: d.meta.code });
    }
    if (!d.meta) return fail("We couldn't find that family. Check the link.", 404);

    if (path === "/relink" && req.method === "POST") {
      const b = await req.json(); const m = d.members[b.memberId];
      if (!m) return fail("Member not found", 404);
      const token = await this.issueToken(m); await this.save("members");
      return json({ fid: d.meta.fid, memberId: m.id, token });
    }
    if (path === "/info") return json({ name: d.meta.name, approval: d.meta.approval, count: Object.values(d.members).filter(m => m.status === "member").length });

    if (path === "/join" && req.method === "POST") {
      const b = await req.json();
      if (clip(b.code, 12).toUpperCase() !== d.meta.code) return fail("That invite code doesn't match. Ask for a new link.", 403);
      const m = this.newMember(b.me || {}, d.meta.approval ? "pending" : "member");
      const token = await this.issueToken(m); d.members[m.id] = m; await this.save("members");
      if (m.status === "pending") this.broadcast("pending", { name: m.name, piece: m.piece }, Object.values(d.members).filter(x => x.approver).map(x => x.id));
      else this.broadcast("members", null);
      return json({ fid: d.meta.fid, memberId: m.id, token, status: m.status });
    }

    if (path.startsWith("/photo/")) {
      const me = await this.who(req, url); if (!me || me.status !== "member") return new Response("no", { status: 403, headers: CORS });
      const b64 = await this.ctx.storage.get("photo:" + path.slice(7));
      if (!b64) return new Response("missing", { status: 404, headers: CORS });
      const [head, data] = b64.split(",");
      const bin = Uint8Array.from(atob(data), c => c.charCodeAt(0));
      return new Response(bin, { headers: { "content-type": head.slice(5, head.indexOf(";")), "cache-control": "private, max-age=31536000", ...CORS } });
    }

    const me = await this.who(req, url);
    if (!me) return fail("Please join the family first", 401);

    if (path === "/ws") {
      if (req.headers.get("Upgrade") !== "websocket") return fail("Expected websocket");
      const pair = new WebSocketPair();
      this.ctx.acceptWebSocket(pair[1], [me.id]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (path === "/me") return json(this.snapshot(me));
    if (path === "/game") {
      const g = d.games[url.searchParams.get("id")];
      if (!g) return fail("That game is gone", 404);
      return json(g);
    }
    if (path !== "/do" || req.method !== "POST") return fail("Not found", 404);
    if (me.status !== "member") return fail("Waiting for approval", 403);

    const b = await req.json();
    const a = b.action;
    const isApprover = !!me.approver;
    const member = (id) => { const m = d.members[id]; if (!m) throw new Error("Unknown family member"); return m; };

    switch (a) {
      case "profile": {
        for (const f of PROFILE_FIELDS) if (b[f] !== undefined && f !== "mom") me[f] = typeof b[f] === "boolean" ? b[f] : clip(b[f], f === "secret" ? 140 : 40);
        await this.save("members"); this.broadcast("members", null); return json({ ok: true });
      }
      case "approve": case "deny": {
        if (!isApprover) return fail("Only the people who approve new members can do that", 403);
        const m = member(b.memberId);
        if (a === "approve") { m.status = "member"; this.post(`${m.piece} ${m.name} joined the family! Welcome!`); }
        else delete d.members[m.id];
        await this.save("members", "feed"); this.broadcast("members", null); this.broadcast("feed", null); return json({ ok: true });
      }
      case "setApprover": {
        if (!isApprover) return fail("Only approvers can change who approves", 403);
        const m = member(b.memberId); m.approver = !!b.on;
        if (b.mom !== undefined) { for (const x of Object.values(d.members)) x.mom = false; m.mom = !!b.mom; }
        if (!Object.values(d.members).some(x => x.approver)) me.approver = true;
        await this.save("members"); this.broadcast("members", null); return json({ ok: true });
      }
      case "setMom": {
        if (!isApprover) return fail("Only approvers can do that", 403);
        for (const x of Object.values(d.members)) x.mom = false; member(b.memberId).mom = true;
        await this.save("members"); this.broadcast("members", null); return json({ ok: true });
      }
      case "settings": {
        if (!isApprover) return fail("Only approvers can change settings", 403);
        if (b.approval !== undefined) d.meta.approval = !!b.approval;
        if (b.name) d.meta.name = clip(b.name, 40);
        if (b.newCode) d.meta.code = rid(6).toUpperCase();
        await this.save("meta"); this.broadcast("members", null); return json({ ok: true, code: d.meta.code });
      }
      case "relinkCode": {
        const code = rid(6).toUpperCase();
        const dir = this.env.DIR.get(this.env.DIR.idFromName("dir"));
        await dir.fetch(new Request("https://dir/put", { method: "POST", body: JSON.stringify({ code, fid: d.meta.fid, memberId: me.id }) }));
        return json({ code });
      }
      case "chat": {
        const text = clip(b.text, 1000).trim(); const photo = await this.putPhoto(b.photo);
        if (!text && !photo) return fail("Empty message");
        const room = b.room === "all" || !b.room ? "all" : [me.id, member(b.room).id].sort().join("~");
        const msg = { id: rid(10), room, from: me.id, text, photo, ts: Date.now() };
        d.chat.push(msg); if (d.chat.length > 2000) d.chat.splice(0, d.chat.length - 2000);
        // things said in the family chat can become "Who said this?" trivia, only if the person said that's okay
        if (room === "all" && me.chatTrivia !== false && text.length >= 20 && text.length <= 160 && !/https?:\/\//.test(text)) {
          d.trivia.push({ id: rid(8), cat: "Way Back When", kind: "said", about: me.id, q: `Who said this in the family chat? "${text}"`, a: me.name, ts: Date.now() });
          if (d.trivia.length > 500) d.trivia.splice(0, d.trivia.length - 500);
        }
        await this.save("chat", "trivia");
        this.broadcast("chat", msg, room === "all" ? null : room.split("~"));
        return json({ ok: true, msg });
      }
      case "makeTrivia": { // turn a message or post into a question by hand
        const q = clip(b.q, 200), ans = clip(b.a, 60); if (!q || !ans) return fail("Need a question and an answer");
        const photo = b.photoId || (await this.putPhoto(b.photo));
        d.book.push({ id: rid(8), cat: CATS(b.cat), q, a: ans, wrong: (b.wrong || []).map(w => clip(w, 60)).filter(Boolean).slice(0, 3), photo, by: me.id, ts: Date.now() });
        await this.save("book"); this.broadcast("book", null); return json({ ok: true });
      }
      case "bookDel": {
        const e = d.book.find(x => x.id === b.id); if (!e) return json({ ok: true });
        if (e.by !== me.id && !isApprover) return fail("Only the person who added it can remove it", 403);
        d.book = d.book.filter(x => x.id !== b.id); await this.save("book"); this.broadcast("book", null); return json({ ok: true });
      }
      case "post": {
        const text = clip(b.text, 2000).trim(); const photo = await this.putPhoto(b.photo);
        if (!text && !photo) return fail("Write something or add a photo");
        const p = { id: rid(10), from: me.id, text, photo, ts: Date.now(), likes: [], comments: [] };
        d.feed.push(p); if (d.feed.length > 400) d.feed.splice(0, d.feed.length - 400);
        await this.save("feed"); this.broadcast("feed", p); return json({ ok: true, post: p });
      }
      case "like": {
        const p = d.feed.find(x => x.id === b.postId); if (!p) return fail("Post not found", 404);
        p.likes = p.likes.includes(me.id) ? p.likes.filter(x => x !== me.id) : p.likes.concat(me.id);
        await this.save("feed"); this.broadcast("feed", null); return json({ ok: true });
      }
      case "comment": {
        const p = d.feed.find(x => x.id === b.postId); if (!p) return fail("Post not found", 404);
        const text = clip(b.text, 500).trim(); if (!text) return fail("Empty comment");
        p.comments.push({ from: me.id, text, ts: Date.now() }); await this.save("feed"); this.broadcast("feed", null); return json({ ok: true });
      }
      case "give": {
        const to = member(b.to); if (to.id === me.id) return fail("Pick someone else");
        const bucks = Math.max(0, Math.floor(+b.bucks || 0)), passes = Math.max(0, Math.floor(+b.passes || 0));
        if (bucks > me.bucks || passes > me.passes) return fail("You don't have that much to give");
        if (!bucks && !passes) return fail("Pick an amount");
        me.bucks -= bucks; me.passes -= passes; to.bucks += bucks; to.passes += passes;
        const what = [bucks && `${bucks} Pop Bucks`, passes && `${passes} Free Pass${passes > 1 ? "es" : ""}`].filter(Boolean).join(" and ");
        const note = clip(b.note, 140);
        this.post(`🎁 ${me.piece} ${me.name} gave ${to.piece} ${to.name} ${what}${note ? `: "${note}"` : "!"}`);
        await this.save("members", "feed"); this.broadcast("members", null); this.broadcast("feed", null); return json({ ok: true });
      }
      case "earn": {
        const game = String(b.game || ""); const cap = EARN_CAPS[game]; if (!cap) return fail("Unknown game");
        const k = `${me.id}:${game}:${today()}`; const so = d.earn[k] || 0;
        const amt = Math.max(0, Math.min(Math.floor(+b.amount || 0), cap - so));
        d.earn[k] = so + amt; me.bucks += amt;
        for (const key of Object.keys(d.earn)) if (!key.endsWith(today())) delete d.earn[key];
        await this.save("members", "earn"); if (amt) this.broadcast("members", null);
        return json({ ok: true, earned: amt, capLeft: cap - d.earn[k], bucks: me.bucks });
      }
      case "pass": { // use (-1) or win (+1) a Free Pass during a board game
        const delta = Math.sign(+b.delta || 0);
        if (delta < 0 && me.passes < 1) return fail("No Free Pass to use");
        me.passes += delta; await this.save("members"); this.broadcast("members", null); return json({ ok: true, passes: me.passes });
      }
      case "shop": {
        const item = String(b.item || ""), price = item.startsWith("piece:") ? SHOP.piece : SHOP[item];
        if (!price) return fail("Not for sale"); if (me.bucks < price) return fail(`You need ${price} Pop Bucks`);
        if (item.startsWith("piece:")) { const pc = clip(item.slice(6), 8); if ((me.pieces || []).includes(pc)) return fail("You already have that piece"); me.pieces = (me.pieces || []).concat(pc); }
        else if (item === "pass") me.passes++;
        else if (item === "square") me.sqCredits = (me.sqCredits || 0) + 1;
        me.bucks -= price; await this.save("members"); this.broadcast("members", null); return json({ ok: true });
      }
      case "square": { // put your picture on a board square (won or bought)
        if ((me.sqCredits || 0) < 1) return fail("Win a game or buy a picture square in the Bank first");
        const i = Math.floor(+b.index); if (!(i >= 0 && i < 24)) return fail("Pick a square");
        const photo = await this.putPhoto(b.photo); if (!photo) return fail("Pick a photo");
        me.sqCredits--; d.sqpics[i] = { photo, name: clip(b.name, 18), caption: clip(b.caption, 60), by: me.name, byId: me.id, date: today() };
        this.post(`📸 ${me.piece} ${me.name} put their picture on the board: ${d.sqpics[i].name}`);
        await this.save("members", "sqpics", "feed"); this.broadcast("sqpics", null); this.broadcast("feed", null); return json({ ok: true });
      }
      case "gameCreate": {
        const id = rid(8);
        const g = { id, title: clip(b.title, 60) || "Family Pop", status: "playing", created: Date.now(), updated: Date.now(), host: me.id,
          players: (b.players || []).slice(0, 8), state: b.state, turnMember: b.turnMember || null, rev: 1 };
        d.games[id] = g; this.prune(); await this.save("games");
        this.post(`🎲 ${me.piece} ${me.name} started a Family Pop game with ${g.players.map(p => p.name).join(", ")}`);
        await this.save("feed"); this.broadcast("games", { id }); this.broadcast("feed", null); return json({ ok: true, id });
      }
      case "gameUpdate": {
        const g = d.games[b.id]; if (!g) return fail("That game is gone", 404);
        if (!g.players.some(p => p.memberId === me.id)) return fail("You're not in this game", 403);
        if (b.rev !== g.rev) return fail("Someone else just moved. Refreshing…", 409);
        g.state = b.state; g.turnMember = b.turnMember || null; g.updated = Date.now(); g.rev++;
        if (b.over) g.status = "done";
        await this.save("games"); this.broadcast("game", { id: g.id, rev: g.rev, turnMember: g.turnMember, event: clip(b.event, 200) });
        return json({ ok: true, rev: g.rev });
      }
      case "gameEnd": { // award results once per game (or once per pass-the-phone game id)
        const key = "ended:" + clip(b.gameKey, 40);
        if (await this.ctx.storage.get(key)) return json({ ok: true, already: true });
        await this.ctx.storage.put(key, 1);
        const lines = [];
        for (const r of (b.results || []).slice(0, 8)) {
          const m = d.members[r.memberId]; if (!m) continue;
          const s = m.stats; s.games++; s.right += r.right | 0; s.asked += r.asked | 0; s.rent += r.rent | 0;
          for (const t of (r.trophies || []).slice(0, 4)) s.trophies.push(clip(t, 4));
          if (s.trophies.length > 60) s.trophies.splice(0, s.trophies.length - 60);
          const bank = Math.max(0, Math.min(400, Math.round((r.worth | 0) / 10)));
          m.bucks += bank; if (r.winner) { s.wins++; m.sqCredits = (m.sqCredits || 0) + 1; }
          lines.push(`${m.piece} ${m.name} +${bank}`);
        }
        const win = (b.results || []).find(r => r.winner);
        this.post(`🏆 ${clip(b.winnerName, 40)} won Family Pop! Pop Bucks to the bank: ${lines.join(", ")}`);
        if (b.id && d.games[b.id]) d.games[b.id].status = "done";
        await this.save("members", "feed", "games"); this.broadcast("members", null); this.broadcast("feed", null); this.broadcast("games", null);
        return json({ ok: true, winnerGotSquare: !!(win && d.members[win.memberId]) });
      }
      case "gameDelete": {
        const g = d.games[b.id]; if (g && (g.host === me.id || isApprover)) { delete d.games[b.id]; await this.save("games"); this.broadcast("games", null); }
        return json({ ok: true });
      }
      default: return fail("Unknown action");
    }
  }
  prune() { const gs = Object.values(this.d.games).sort((a, b) => b.updated - a.updated); for (const g of gs.slice(30)) delete this.d.games[g.id]; }
  post(text) { this.d.feed.push({ id: rid(10), from: "system", text, ts: Date.now(), likes: [], comments: [] }); }
  async webSocketMessage(ws, msg) { if (msg === "ping") ws.send("pong"); }
  async webSocketClose(ws) { try { ws.close(); } catch (e) {} }
}
function CATS(c) { return ["Way Back When", "Favorites", "Who's in the Picture?", "Then & Now"].includes(c) ? c : "Way Back When"; }

// Family Pop server — one private "Family" per family (a Durable Object), so each family's
// people, chat, feed, bank, Family Book and board games live together and update live.
import { DurableObject } from "cloudflare:workers";
import { sendPush } from "./push.js";

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
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
// "June 10", "Jun 10th", "6/10", "06-10" -> [6,10]
function parseBday(s) {
  s = String(s || "").toLowerCase().trim(); if (!s) return null;
  let m = s.match(/^(\d{1,2})\s*[\/\-.]\s*(\d{1,2})/); if (m) return [+m[1], +m[2]];
  const mm = s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/); if (!mm) return null; const mi = MONTHS.indexOf(mm[1]);
  m = s.match(/(\d{1,2})/); return m ? [mi + 1, +m[1]] : null;
}
function centralToday(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 864e5);
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(d).map(x => [x.type, x.value]));
  return [+p.month, +p.day, +p.year];
}
const BDAY_BUCKS = 250;
const GRANDMA_PROMPTS = [
  "What was your house like when you were little?", "How did you and Dad meet?", "What's your favorite memory of your mama?",
  "What did you do for fun when you were a kid?", "What was school like for you?", "What was your very first job?",
  "What's the best meal you ever cooked?", "What do you remember about living in California?", "What was Christmas like when you were a girl?",
  "Who was your best friend growing up, and what did you two do?", "What's something your daddy always said?", "What are you proudest of?",
  "What was the hardest time in your life, and how did you get through it?", "What do you remember about the day each of your kids was born?",
  "What song takes you right back to being young?", "What's a family recipe you learned, and who taught you?", "What advice would you give your grandkids?",
  "What was the funniest thing that ever happened in our family?", "What do you remember about your grandparents?", "Where's the most beautiful place you've ever been?",
  "What did a Saturday look like when you were 10?", "What was your first car?", "What's a prayer that was answered in your life?",
  "What do you want the family to always remember?"];
const PROFILE_FIELDS = ["name", "piece", "birthday", "nick", "food", "secret", "chatTrivia", "mom", "fb"];
const RELATIONS = ["Mom's mother","Mom's father","Mom's grandmother","Mom's grandfather","Mom's great-grandparent","Mom's ancestor","Mom's brother","Mom's sister","Mom's aunt","Mom's uncle","Mom's cousin","Other family"];

export default {
  async scheduled(event, env, ctx) { // every morning: daily question, birthdays, Ask Grandma, Sunday dinner reminders
    const dir = env.DIR.get(env.DIR.idFromName("dir"));
    const { fids } = await (await dir.fetch(new Request("https://dir/list", { method: "POST", body: "{}" }))).json();
    for (const fid of fids || []) ctx.waitUntil(env.FAMILY.get(env.FAMILY.idFromName(fid)).fetch(new Request(`https://do/tick?fid=${fid}`, { method: "POST", body: "{}" })).catch(() => {}));
  },
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
      if (p[1] === "vapid") return json({ publicKey: env.VAPID_PUBLIC || "" });
      if (p[1] === "pair" && req.method === "POST") {
        const ip = req.headers.get("CF-Connecting-IP") || "";
        const dir = env.DIR.get(env.DIR.idFromName("dir"));
        const r = ip ? await (await dir.fetch(new Request("https://dir/getip", { method: "POST", body: JSON.stringify({ ip }) }))).json() : {};
        if (!r.fid) return json({ none: true });
        const stub = env.FAMILY.get(env.FAMILY.idFromName(r.fid));
        return stub.fetch(new Request(`https://do/relink?fid=${r.fid}`, { method: "POST", body: JSON.stringify(r) }));
      }
      if (p[1] === "relink" && req.method === "POST") {
        const { code } = await req.json();
        const dir = env.DIR.get(env.DIR.idFromName("dir"));
        const r = await (await dir.fetch(new Request("https://dir/get", { method: "POST", body: JSON.stringify({ code: clip(code, 16).toUpperCase() }) }))).json();
        if (!r.fid) return fail("That code didn't work. Codes last 15 minutes.", 404);
        const stub = env.FAMILY.get(env.FAMILY.idFromName(r.fid));
        return stub.fetch(new Request(`https://do/relink?fid=${r.fid}`, { method: "POST", body: JSON.stringify(r) }));
      }
      if (p[1] === "f" && p[2]) {
        const fid = clip(p[2], 20);
        const stub = env.FAMILY.get(env.FAMILY.idFromName(fid));
        const rest = "/" + p.slice(3).join("/");
        if (rest === "/tick" || rest === "/init" || rest === "/relink") return fail("Not found", 404); // internal only
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
    if (url.pathname === "/put") { const ttl = Math.min(Math.max(+b.ttl || 15 * 60e3, 60e3), 7 * 864e5);
      await this.ctx.storage.put("c:" + b.code, { fid: b.fid, memberId: b.memberId, exp: Date.now() + ttl }); return json({ ok: true }); }
    if (url.pathname === "/putip") { await this.ctx.storage.put("ip:" + b.ip, { fid: b.fid, memberId: b.memberId, exp: Date.now() + 15 * 60e3 }); return json({ ok: true }); }
    if (url.pathname === "/getip") { const v = await this.ctx.storage.get("ip:" + b.ip); if (!v || v.exp < Date.now()) return json({}); await this.ctx.storage.delete("ip:" + b.ip); return json(v); }
    if (url.pathname === "/reg") { await this.ctx.storage.put("f:" + b.fid, 1); return json({ ok: true }); }
    if (url.pathname === "/list") { const m = await this.ctx.storage.list({ prefix: "f:" }); return json({ fids: [...m.keys()].map(k => k.slice(2)) }); }
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
    const keys = ["meta", "members", "chat", "feed", "book", "sqpics", "games", "earn", "trivia", "tree", "daily", "stories", "recipes", "dinner", "prayers", "polls"];
    const got = await this.ctx.storage.get(keys);
    this.d = {
      meta: got.get("meta") || null, members: got.get("members") || {}, chat: got.get("chat") || [], feed: got.get("feed") || [],
      book: got.get("book") || [], sqpics: got.get("sqpics") || {}, games: got.get("games") || {}, earn: got.get("earn") || {}, trivia: got.get("trivia") || [], tree: got.get("tree") || [], daily: got.get("daily") || null, stories: got.get("stories") || { list: [], queue: [] }, recipes: got.get("recipes") || [], dinner: got.get("dinner") || null, prayers: got.get("prayers") || [], polls: got.get("polls") || [],
    };
    return this.d;
  }
  async save(...keys) { const o = {}; for (const k of keys) o[k] = this.d[k]; await this.ctx.storage.put(o); }
  async putPhoto(b64, kind = "image") {
    if (!b64 || typeof b64 !== "string" || !b64.startsWith("data:" + kind + "/")) return null;
    if (b64.length > (kind === "audio" ? 1_400_000 : 900_000)) throw new Error(kind === "audio" ? "That voice message is too long (about 1 minute max)" : "That photo is too big");
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
    for (const f of PROFILE_FIELDS) if (fields[f] !== undefined) m[f] = typeof fields[f] === "boolean" ? fields[f] : clip(fields[f], f === "secret" ? 140 : f === "fb" ? 200 : 40);
    m.fb = fbLink(m.fb);
    if (!m.name) m.name = "Family member";
    if (!m.piece) m.piece = "🫧";
    return m;
  }
  publicMember(m, full) {
    const o = { id: m.id, name: m.name, piece: m.piece, status: m.status, approver: !!m.approver, mom: !!m.mom, creator: !!m.creator,
      bucks: m.bucks, passes: m.passes, stats: m.stats, pieces: m.pieces || [] };
    o.fb = m.fb || ""; o.mpts = m.mpts || 0;
    if (full) Object.assign(o, { birthday: m.birthday || "", nick: m.nick || "", food: m.food || "", secret: m.secret || "", chatTrivia: m.chatTrivia !== false, sqCredits: m.sqCredits || 0 });
    return o;
  }
  async who(req, url) {
    const t = req.headers.get("x-fp-token") || url.searchParams.get("t");
    if (!t) return null;
    const h = await sha(t);
    return Object.values(this.d.members).find(m => m.tokenHash === h || (m.tokenHashes || []).includes(h)) || null;
  }
  async issueToken(m) { // each phone/app keeps its own sign-in; adding a device never signs out the others
    const t = rid(24), h = await sha(t);
    m.tokenHashes = [...new Set([...(m.tokenHashes || []), ...(m.tokenHash ? [m.tokenHash] : []), h])].slice(-10);
    m.tokenHash = h; return t;
  }
  snapshot(me) {
    const d = this.d;
    if (me.status !== "member") return { meta: { name: d.meta.name }, me: this.publicMember(me, true), pending: true };
    const members = Object.values(d.members).filter(m => m.status === "member" || (me.approver && m.status === "pending"));
    const myRooms = (r) => r === "all" || r.split("~").includes(me.id);
    return {
      meta: { name: d.meta.name, approval: d.meta.approval, fid: d.meta.fid, code: d.meta.code },
      me: this.publicMember(me, true),
      today: (() => { const t = centralToday(), n = centralToday(1); const on = d => Object.values(this.d.members).filter(m => m.status === "member" && (b => b && b[0] === d[0] && b[1] === d[1])(parseBday(m.birthday))).map(m => m.id);
        return { birthdays: on(t), tomorrow: on(n) }; })(),
      members: members.map(m => this.publicMember(m, m.status === "member")),
      chat: d.chat.filter(c => myRooms(c.room)).slice(-300),
      feed: d.feed.slice(-80),
      book: d.book, trivia: d.trivia.slice(-200), sqpics: d.sqpics, tree: d.tree,
      daily: d.daily && { date: d.daily.date, q: d.daily.q, cat: d.daily.cat, opts: d.daily.opts, about: d.daily.about, answers: d.daily.answers, first: d.daily.first,
        a: d.daily.answers[me.id] ? d.daily.a : undefined },
      champion: d.meta.champion || null, month: d.meta.monthKey,
      grandma: this.grandmaNow(), stories: d.stories.list.slice(-60), recipes: d.recipes, dinner: this.dinnerNow(),
      prayers: d.prayers.slice(-40), polls: d.polls.slice(-12).map(pl => this.pollView(pl, me)), pushOn: (me.push || []).length > 0,
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
      const dir = this.env.DIR.get(this.env.DIR.idFromName("dir")); await dir.fetch(new Request("https://dir/reg", { method: "POST", body: JSON.stringify({ fid: d.meta.fid }) }));
      return json({ fid: d.meta.fid, memberId: m.id, token, code: d.meta.code });
    }
    if (!d.meta) return fail("We couldn't find that family. Check the link.", 404);
    if (!this.registered) { this.registered = true; const dir = this.env.DIR.get(this.env.DIR.idFromName("dir")); this.ctx.waitUntil(dir.fetch(new Request("https://dir/reg", { method: "POST", body: JSON.stringify({ fid: d.meta.fid }) })).catch(() => { this.registered = false; })); }
    if (path === "/tick") { await this.tick(); return json({ ok: true }); }

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
      if (m.status === "pending") { const ap = Object.values(d.members).filter(x => x.approver).map(x => x.id); this.broadcast("pending", { name: m.name, piece: m.piece }, ap);
        this.notify(ap, null, { title: "💐 Someone wants to join", body: `${m.piece} ${m.name} is waiting for a yes`, tag: "pending", url: "./#family" }); }
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
    await this.birthdays(); await this.monthly(); await this.ensureDaily();

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
        for (const f of PROFILE_FIELDS) if (b[f] !== undefined && f !== "mom") me[f] = typeof b[f] === "boolean" ? b[f] : clip(b[f], f === "secret" ? 140 : f === "fb" ? 200 : 40);
        me.fb = fbLink(me.fb);
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
      case "pairStart": {
        const dir = this.env.DIR.get(this.env.DIR.idFromName("dir"));
        const ip = req.headers.get("CF-Connecting-IP") || "";
        if (ip) await dir.fetch(new Request("https://dir/putip", { method: "POST", body: JSON.stringify({ ip, fid: d.meta.fid, memberId: me.id }) }));
        const code = rid(6).toUpperCase();
        await dir.fetch(new Request("https://dir/put", { method: "POST", body: JSON.stringify({ code, fid: d.meta.fid, memberId: me.id, ttl: 30 * 60e3 }) }));
        return json({ code });
      }
      case "homeLink": { // a one-time pass that rides along when you add Family Pop to your Home Screen
        const code = rid(10).toUpperCase();
        const dir = this.env.DIR.get(this.env.DIR.idFromName("dir"));
        await dir.fetch(new Request("https://dir/put", { method: "POST", body: JSON.stringify({ code, fid: d.meta.fid, memberId: me.id, ttl: 7 * 864e5 }) }));
        return json({ code });
      }
      case "relinkCode": {
        const code = rid(6).toUpperCase();
        const dir = this.env.DIR.get(this.env.DIR.idFromName("dir"));
        await dir.fetch(new Request("https://dir/put", { method: "POST", body: JSON.stringify({ code, fid: d.meta.fid, memberId: me.id }) }));
        return json({ code });
      }
      case "chat": {
        const text = clip(b.text, 1000).trim(); const photo = await this.putPhoto(b.photo); const audio = await this.putPhoto(b.audio, "audio");
        if (!text && !photo && !audio) return fail("Empty message");
        const room = b.room === "all" || !b.room ? "all" : [me.id, member(b.room).id].sort().join("~");
        const msg = { id: rid(10), room, from: me.id, text, photo, audio, ts: Date.now() };
        d.chat.push(msg); if (d.chat.length > 2000) d.chat.splice(0, d.chat.length - 2000);
        // things said in the family chat can become "Who said this?" trivia, only if the person said that's okay
        if (room === "all" && me.chatTrivia !== false && text.length >= 20 && text.length <= 160 && !/https?:\/\//.test(text)) {
          d.trivia.push({ id: rid(8), cat: "Way Back When", kind: "said", about: me.id, q: `Who said this in the family chat? "${text}"`, a: me.name, ts: Date.now() });
          if (d.trivia.length > 500) d.trivia.splice(0, d.trivia.length - 500);
        }
        await this.save("chat", "trivia");
        this.broadcast("chat", msg, room === "all" ? null : room.split("~"));
        this.notify(room === "all" ? null : room.split("~"), me.id, { title: `💬 ${me.piece} ${me.name}${room === "all" ? " · Family chat" : ""}`, body: text || (audio ? "🎤 Voice message" : "📷 Photo"), tag: "chat-" + room, url: "./#chat" });
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
        const photos = []; for (const ph of (b.photos || []).slice(0, 8)) { const id = await this.putPhoto(ph); if (id) photos.push(id); }
        if (!text && !photo && !photos.length) return fail("Write something or add a photo");
        const p = { id: rid(10), from: me.id, text, photo: photo || photos[0] || null, photos: photos.length > 1 ? photos : undefined, ts: Date.now(), likes: [], comments: [] };
        d.feed.push(p); if (d.feed.length > 400) d.feed.splice(0, d.feed.length - 400);
        await this.save("feed"); this.broadcast("feed", p);
        this.notify(null, me.id, { title: `📸 ${me.piece} ${me.name} shared something`, body: text || "New pictures", tag: "feed", url: "./#home" });
        return json({ ok: true, post: p });
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
        this.notify([to.id], null, { title: `🎁 ${me.name} sent you a gift!`, body: what + (note ? ` · "${note}"` : ""), tag: "gift", url: "./#bank" });
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
        await this.save("feed"); this.broadcast("games", { id }); this.broadcast("feed", null);
        this.notify(g.players.map(p => p.memberId).filter(Boolean), me.id, { title: "🎲 New Family Pop game!", body: `${me.name} started a game with you`, tag: "game-" + id, url: "./#play" });
        return json({ ok: true, id });
      }
      case "gameUpdate": {
        const g = d.games[b.id]; if (!g) return fail("That game is gone", 404);
        if (!g.players.some(p => p.memberId === me.id)) return fail("You're not in this game", 403);
        if (b.rev !== g.rev) return fail("Someone else just moved. Refreshing…", 409);
        g.state = b.state; g.turnMember = b.turnMember || null; g.updated = Date.now(); g.rev++;
        if (b.over) g.status = "done";
        await this.save("games"); this.broadcast("game", { id: g.id, rev: g.rev, turnMember: g.turnMember, event: clip(b.event, 200) });
        if (g.turnMember && g.turnMember !== me.id && !b.over) this.notify([g.turnMember], null, { title: "🔔 Your turn in Family Pop!", body: clip(b.event, 120) || "It's your move", tag: "game-" + g.id, url: "./#play" });
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
          m.mpts = (m.mpts || 0) + 10 + (r.right | 0) * 2 + (r.winner ? 50 : 0);
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
      case "treeAdd": {
        const name = clip(b.name, 60).trim(); if (!name) return fail("Please add a name");
        const e = { id: rid(8), name, relation: RELATIONS.includes(b.relation) ? b.relation : "Other family", born: clip(b.born, 40), died: clip(b.died, 40), place: clip(b.place, 60),
          story: clip(b.story, 300), photo: await this.putPhoto(b.photo), by: me.id, ts: Date.now() };
        d.tree.push(e); if (d.tree.length > 500) d.tree.shift();
        this.post(`🌳 ${me.piece} ${me.name} added ${name} (${e.relation}) to the family tree`);
        await this.save("tree", "feed"); this.broadcast("tree", null); this.broadcast("feed", null); return json({ ok: true });
      }
      case "treeImport": { // load the family's researched tree in one go
        if (!isApprover && !me.mom) return fail("Only Mom or an approver can load the family research", 403);
        const have = new Set(d.tree.map(t => t.name.toLowerCase())); let n = 0;
        for (const x of (b.people || []).slice(0, 80)) {
          const name = clip(x.name, 60).trim(); if (!name || have.has(name.toLowerCase())) continue;
          d.tree.push({ id: rid(8), name, relation: RELATIONS.includes(x.relation) ? x.relation : "Other family", born: clip(x.born, 40), died: clip(x.died, 40),
            place: clip(x.place, 60), story: clip(x.story, 300), photo: null, by: me.id, ts: Date.now() }); have.add(name.toLowerCase()); n++;
        }
        if (n) this.post(`🌳 ${me.piece} ${me.name} added ${n} people from the family research to Mom's family tree: the Youngs, Vaughns, Bagleys, Duggans and Neighbors, all the way back to Ireland!`);
        await this.save("tree", "feed"); this.broadcast("tree", null); this.broadcast("feed", null); return json({ ok: true, added: n });
      }
      case "treeDel": {
        const e = d.tree.find(x => x.id === b.id); if (!e) return json({ ok: true });
        if (e.by !== me.id && !isApprover && !me.mom) return fail("Only the person who added it, Mom, or an approver can remove it", 403);
        d.tree = d.tree.filter(x => x.id !== b.id); await this.save("tree"); this.broadcast("tree", null); return json({ ok: true });
      }
      case "daily": {
        const q = d.daily; if (!q) return fail("No question today");
        if (q.about === me.id) return fail("This one's about you! See who knows you");
        if (q.answers[me.id]) return fail("You already answered today");
        const ok = String(b.pick) === q.a; let paid = 0;
        if (ok && !q.first) { q.first = me.id; paid = 50; } else if (ok) paid = 15;
        q.answers[me.id] = { ok, ts: Date.now() }; me.bucks += paid; if (ok) me.mpts = (me.mpts || 0) + 5;
        await this.save("daily", "members"); this.broadcast("daily", null); this.broadcast("members", null);
        return json({ ok: true, right: ok, a: q.a, paid, first: q.first === me.id });
      }
      case "pushSub": {
        const sub = b.sub; if (!sub || !sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) return fail("Bad subscription");
        if (!/^https:\/\//.test(sub.endpoint)) return fail("Bad subscription");
        me.push = (me.push || []).filter(x => x.endpoint !== sub.endpoint).concat({ endpoint: clip(sub.endpoint, 600), keys: { p256dh: clip(sub.keys.p256dh, 200), auth: clip(sub.keys.auth, 60) } }).slice(-5);
        await this.save("members");
        this.ctx.waitUntil(this.pushTo(me, { title: "🔔 Alerts are on!", body: "Family Pop will let you know when it's your turn, and more.", tag: "hello", url: "./" }));
        return json({ ok: true });
      }
      case "pushOff": { me.push = []; await this.save("members"); return json({ ok: true }); }
      case "storyAnswer": { // Ask Grandma: Mom answers this week's question by voice or typing
        if (!me.mom) return fail("Ask Grandma questions are for Mom to answer");
        const g = this.grandmaNow(); if (!g) return fail("No question this week");
        const text = clip(b.text, 3000).trim(), audio = await this.putPhoto(b.audio, "audio"); if (!text && !audio) return fail("Say or type an answer");
        d.stories.list.push({ id: rid(8), week: g.week, prompt: g.prompt, by: me.id, text, audio, ts: Date.now() });
        d.stories.queue = d.stories.queue.filter(x => x.q !== g.prompt);
        d.feed.push({ id: rid(10), from: "system", kind: "story", text: `🎙️ ${me.piece} ${me.name} answered this week's Ask Grandma: "${g.prompt}"`, audio, story: text, ts: Date.now(), likes: [], comments: [] });
        await this.save("stories", "feed"); this.broadcast("feed", null); this.broadcast("stories", null);
        this.notify(null, me.id, { title: `🎙️ ${me.name} told a story`, body: g.prompt, tag: "story", url: "./#home" });
        return json({ ok: true });
      }
      case "storySuggest": {
        const q = clip(b.q, 200).trim(); if (q.length < 8) return fail("Type a question for Mom");
        d.stories.queue.push({ q, by: me.id, ts: Date.now() }); if (d.stories.queue.length > 30) d.stories.queue.shift();
        await this.save("stories"); this.broadcast("stories", null); return json({ ok: true });
      }
      case "recipeAdd": {
        const title = clip(b.title, 80).trim(); if (!title) return fail("Name the dish");
        const r = { id: rid(8), title, whose: clip(b.whose, 60).trim() || me.name, ingredients: clip(b.ingredients, 2000), steps: clip(b.steps, 4000), photo: await this.putPhoto(b.photo), by: me.id, ts: Date.now() };
        d.recipes.push(r); this.post(`🍲 ${me.piece} ${me.name} added ${r.whose}'s ${title} to the family recipe box`);
        await this.save("recipes", "feed"); this.broadcast("recipes", null); this.broadcast("feed", null); return json({ ok: true });
      }
      case "recipeDel": {
        const r = d.recipes.find(x => x.id === b.id); if (r && (r.by === me.id || isApprover || me.mom)) { d.recipes = d.recipes.filter(x => x.id !== b.id); await this.save("recipes"); this.broadcast("recipes", null); }
        return json({ ok: true });
      }
      case "dinner": { // Sunday dinner: who's hosting, what everyone's bringing
        const dn = this.dinnerNow(true);
        if (b.host !== undefined) { if (!isApprover && !me.mom) return fail("Mom or an approver sets the host"); dn.host = clip(b.host, 60); }
        if (b.item !== undefined) { const it = clip(b.item, 80).trim(); if (it) dn.items[me.id] = it; else delete dn.items[me.id]; }
        if (b.coming !== undefined) dn.coming[me.id] = !!b.coming;
        await this.save("dinner"); this.broadcast("dinner", null); return json({ ok: true });
      }
      case "prayerAdd": {
        const text = clip(b.text, 600).trim(); if (!text) return fail("Type your prayer request");
        d.prayers.push({ id: rid(8), from: me.id, text, ts: Date.now(), praying: [], answered: false });
        if (d.prayers.length > 200) d.prayers.shift();
        await this.save("prayers"); this.broadcast("prayers", null);
        this.notify(null, me.id, { title: `🙏 ${me.name} asked for prayer`, body: text.slice(0, 120), tag: "prayer", url: "./#home" });
        return json({ ok: true });
      }
      case "pray": {
        const pr = d.prayers.find(x => x.id === b.id); if (!pr) return fail("Not found", 404);
        if (!pr.praying.includes(me.id)) { pr.praying.push(me.id); if (pr.from !== me.id) this.notify([pr.from], null, { title: `🙏 ${me.name} is praying for you`, body: pr.text.slice(0, 100), tag: "pray-" + pr.id, url: "./#home" }); }
        await this.save("prayers"); this.broadcast("prayers", null); return json({ ok: true });
      }
      case "prayerAnswered": {
        const pr = d.prayers.find(x => x.id === b.id); if (!pr || pr.from !== me.id) return fail("Only the person who asked can mark it answered", 403);
        pr.answered = true; pr.answeredTs = Date.now(); this.post(`🙌 ${me.piece} ${me.name}'s prayer was answered: "${pr.text.slice(0, 120)}"`);
        await this.save("prayers", "feed"); this.broadcast("prayers", null); this.broadcast("feed", null); return json({ ok: true });
      }
      case "pollAdd": {
        const q = clip(b.q, 140).trim(); if (q.length < 6) return fail("Type the question");
        const pl = { id: rid(8), q, by: me.id, ts: Date.now(), answers: {}, status: "collecting", top: null };
        d.polls.push(pl); if (d.polls.length > 40) d.polls.shift();
        await this.save("polls"); this.broadcast("polls", null);
        this.notify(null, me.id, { title: "📊 New Family Feud question!", body: q, tag: "poll-" + pl.id, url: "./#play" });
        return json({ ok: true });
      }
      case "pollAnswer": {
        const pl = d.polls.find(x => x.id === b.id); if (!pl || pl.status !== "collecting") return fail("That one's closed");
        const t = clip(b.text, 60).trim(); if (!t) return fail("Type an answer");
        pl.answers[me.id] = t; const n = Object.keys(pl.answers).length, total = Object.values(d.members).filter(m => m.status === "member").length;
        if (n >= total && n >= 3) this.closePoll(pl);
        await this.save("polls", "feed"); this.broadcast("polls", null); return json({ ok: true });
      }
      case "pollClose": {
        const pl = d.polls.find(x => x.id === b.id); if (!pl) return fail("Not found", 404);
        if (pl.by !== me.id && !isApprover) return fail("Only the person who asked can close it", 403);
        if (Object.keys(pl.answers).length < 2) return fail("Wait for at least 2 answers");
        this.closePoll(pl); await this.save("polls", "feed"); this.broadcast("polls", null); this.broadcast("feed", null); return json({ ok: true });
      }
      case "pollPlayed": { // you played the board: earn a little
        const pl = d.polls.find(x => x.id === b.id); if (!pl || pl.status !== "ready") return fail("Not ready");
        pl.played = pl.played || {}; if (pl.played[me.id] != null) return json({ ok: true, already: true });
        const score = Math.max(0, Math.min(100, Math.floor(+b.score || 0))); pl.played[me.id] = score;
        me.bucks += score; me.mpts = (me.mpts || 0) + Math.round(score / 10);
        await this.save("polls", "members"); this.broadcast("members", null); return json({ ok: true, earned: score });
      }
      default: return fail("Unknown action");
    }
  }
  async birthdays() {
    const [mo, da, yr] = centralToday(); let changed = false;
    for (const m of Object.values(this.d.members)) {
      if (m.status !== "member") continue;
      const b = parseBday(m.birthday);
      if (!b || b[0] !== mo || b[1] !== da || m.bdayYear === yr) continue;
      m.bdayYear = yr; m.bucks += BDAY_BUCKS; m.passes += 1; changed = true;
      this.d.feed.push({ id: rid(10), from: "system", kind: "birthday", about: m.id, text: `🎂 Happy Birthday, ${m.piece} ${m.name}! The family bank gave you ${BDAY_BUCKS} Pop Bucks and a Free Pass. Leave a birthday wish!`, ts: Date.now(), likes: [], comments: [] });
    }
    if (changed) { await this.save("members", "feed"); this.broadcast("feed", null); this.broadcast("members", null); }
  }
  async monthly() {
    const [mo, , yr] = centralToday(); const key = `${yr}-${String(mo).padStart(2, "0")}`;
    if (this.d.meta.monthKey === key) return;
    const prev = this.d.meta.monthKey;
    if (prev) {
      const ms = Object.values(this.d.members).filter(m => m.status === "member" && (m.mpts || 0) > 0).sort((a, b) => b.mpts - a.mpts);
      if (ms.length) {
        const c = ms[0], label = new Date(prev + "-15").toLocaleString("en-US", { month: "long", year: "numeric" });
        this.d.meta.champion = { memberId: c.id, name: c.name, piece: c.piece, month: label, pts: c.mpts };
        c.bucks += 300; c.stats.trophies.push("🥇");
        this.post(`🥇 ${c.piece} ${c.name} is the Family Champion of ${label}! +300 Pop Bucks, their picture welcomes everyone all month, and they win a REAL 3D-printed ${c.piece} game piece!`);
      }
      for (const m of Object.values(this.d.members)) m.mpts = 0;
    }
    this.d.meta.monthKey = key; await this.save("meta", "members", "feed"); this.broadcast("feed", null);
  }
  async ensureDaily() {
    const [mo, da, yr] = centralToday(); const date = `${yr}-${mo}-${da}`;
    if (this.d.daily && this.d.daily.date === date) return;
    const q = makeDaily(this.d, date); this.d.daily = q ? Object.assign(q, { date, answers: {}, first: null }) : { date, q: null, answers: {} };
    await this.save("daily");
  }
  closePoll(pl) {
    const norm = t => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\b(a|an|the|my|her|his)\b/g, "").replace(/\s+/g, " ").trim();
    const groups = {};
    for (const t of Object.values(pl.answers)) { const k = norm(t); if (!k) continue; (groups[k] = groups[k] || { text: t, count: 0 }).count++; }
    pl.top = Object.values(groups).sort((a, b) => b.count - a.count).slice(0, 6); pl.status = "ready";
    this.post(`📊 Family Feud board is ready: "${pl.q}". Can you guess the top answers?`);
    this.notify(null, null, { title: "📊 The Family Feud board is ready!", body: pl.q, tag: "poll-" + pl.id, url: "./#play" });
  }
  pollView(pl, me) {
    return { id: pl.id, q: pl.q, by: pl.by, ts: pl.ts, status: pl.status, count: Object.keys(pl.answers).length, mine: pl.answers[me.id] || "",
      top: pl.status === "ready" ? pl.top : null, played: pl.played ? pl.played[me.id] : undefined };
  }
  weekKey() { const [mo, da, yr] = centralToday(); const d = Date.UTC(yr, mo - 1, da); const monday = d - ((new Date(d).getUTCDay() + 6) % 7) * 864e5; return new Date(monday).toISOString().slice(0, 10); }
  grandmaNow() {
    const mom = Object.values(this.d.members).find(m => m.mom && m.status === "member"); if (!mom) return null;
    const week = this.weekKey(), st = this.d.stories;
    if (!st.current || st.current.week !== week) {
      const used = new Set(st.list.map(x => x.prompt));
      const next = (st.queue.find(x => !used.has(x.q)) || {}).q || GRANDMA_PROMPTS.find(p => !used.has(p)) || GRANDMA_PROMPTS[Math.floor(Date.now() / 6048e5) % GRANDMA_PROMPTS.length];
      st.current = { week, prompt: next }; this.ctx.waitUntil(this.save("stories"));
    }
    const answered = st.list.find(x => x.week === week);
    return { week, prompt: st.current.prompt, momId: mom.id, answered: answered ? answered.id : null, suggestions: st.queue.length };
  }
  dinnerNow(create) {
    const [mo, da, yr] = centralToday(); const d = new Date(Date.UTC(yr, mo - 1, da)); const toSun = (7 - d.getUTCDay()) % 7;
    const sunday = new Date(d.getTime() + toSun * 864e5).toISOString().slice(0, 10);
    if (!this.d.dinner || this.d.dinner.date !== sunday) {
      const fresh = { date: sunday, host: this.d.dinner ? this.d.dinner.host : "", items: {}, coming: {} };
      if (!create) return fresh; this.d.dinner = fresh;
    }
    return this.d.dinner;
  }
  async pushTo(m, data) {
    const v = this.env.VAPID_PRIVATE && this.env.VAPID_PUBLIC ? { publicKey: this.env.VAPID_PUBLIC, privateKey: this.env.VAPID_PRIVATE, subject: "mailto:topher@mixedmakershop.com" } : null;
    if (!v || !(m.push || []).length) return;
    let dead = false;
    for (const sub of m.push.slice()) { try { const st = await sendPush(sub, data, v); if (st === 404 || st === 410) { m.push = m.push.filter(x => x.endpoint !== sub.endpoint); dead = true; } } catch (e) {} }
    if (dead) await this.save("members");
  }
  notify(toIds, exceptId, data) { // phone alerts; toIds null = the whole family
    const ms = Object.values(this.d.members).filter(m => m.status === "member" && m.id !== exceptId && (!toIds || toIds.includes(m.id)) && (m.push || []).length);
    if (ms.length) this.ctx.waitUntil(Promise.all(ms.map(m => this.pushTo(m, data))));
  }
  async tick() { // runs every morning from the scheduler
    const before = this.d.daily && this.d.daily.date;
    await this.birthdays(); await this.monthly(); await this.ensureDaily();
    const [mo, da, yr] = centralToday(); const dow = new Date(Date.UTC(yr, mo - 1, da)).getUTCDay();
    for (const f of this.d.feed.filter(f => f.kind === "birthday" && Date.now() - f.ts < 20 * 3600e3)) {
      const m = this.d.members[f.about]; if (m) this.notify(null, null, { title: `🎂 It's ${m.name}'s birthday!`, body: "Send a birthday wish in Family Pop", tag: "bday-" + m.id, url: "./#home" });
    }
    if (this.d.daily && this.d.daily.q && this.d.daily.date !== before) this.notify(null, null, { title: "⭐ Today's family question is up!", body: this.d.daily.q, tag: "daily", url: "./#home" });
    const g = this.grandmaNow(); if (g && dow === 1 && !g.answered) this.notify([g.momId], null, { title: "🎙️ This week's Ask Grandma", body: g.prompt, tag: "grandma", url: "./#home" });
    if (dow === 6) { const dn = this.dinnerNow(); this.notify(null, null, { title: "🍽️ Sunday dinner is tomorrow!", body: dn.host ? `At ${dn.host}'s. What are you bringing?` : "What are you bringing?", tag: "dinner", url: "./#home" }); }
    for (const pl of this.d.polls) if (pl.status === "collecting" && Date.now() - pl.ts > 3 * 864e5 && Object.keys(pl.answers).length >= 2) this.closePoll(pl);
    await this.save("polls", "feed");
  }
  prune() { const gs = Object.values(this.d.games).sort((a, b) => b.updated - a.updated); for (const g of gs.slice(30)) delete this.d.games[g.id]; }
  post(text) { this.d.feed.push({ id: rid(10), from: "system", text, ts: Date.now(), likes: [], comments: [] }); }
  async webSocketMessage(ws, msg) { if (msg === "ping") ws.send("pong"); }
  async webSocketClose(ws) { try { ws.close(); } catch (e) {} }
}
function CATS(c) { return ["Way Back When", "Favorites", "Who's in the Picture?", "Then & Now"].includes(c) ? c : "Way Back When"; }

function fbLink(u) { u = String(u || "").trim(); if (!u) return ""; if (!/^https?:\/\//.test(u)) u = "https://" + u;
  try { const h = new URL(u).hostname.replace(/^www\.|^m\./, ""); return ["facebook.com", "fb.com"].includes(h) ? u : ""; } catch (e) { return ""; } }
function seeded(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
const FOODS = ["Fried chicken", "Spaghetti", "Pizza", "Tacos", "Meatloaf", "Chicken and dumplings", "Cheeseburgers", "Catfish", "Pot roast", "Enchiladas"];
const TOWNS = ["Hot Springs", "Little Rock", "Malvern", "Arkadelphia", "Benton", "Mena", "Texarkana", "Hope"];
function makeDaily(d, date) {
  const r = seeded(date + (d.meta.fid || "")); const pick = a => a[Math.floor(r() * a.length)];
  const mix = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ms = Object.values(d.members).filter(m => m.status === "member"), names = ms.map(m => m.name), qs = [];
  const key = x => String(x).toLowerCase().split(",")[0].trim();
  const opts = (a, pool) => { const seen = new Set([key(a)]); return mix([a].concat(mix(pool.filter(x => { if (!x) return false; const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; })).slice(0, 3))); };
  for (const m of ms) {
    if (m.food) qs.push({ cat: "Favorites", about: m.id, q: `What's ${m.name}'s favorite food?`, a: m.food, opts: opts(m.food, ms.map(x => x.food).concat(FOODS)) });
    if (m.nick && names.length > 1) qs.push({ cat: "Way Back When", about: m.id, q: `Who goes by "${m.nick}"?`, a: m.name, opts: opts(m.name, names) });
    if (m.secret && names.length > 1) qs.push({ cat: "Way Back When", about: m.id, q: `Whose secret is this? "${m.secret}"`, a: m.name, opts: opts(m.name, names) });
  }
  const tn = d.tree.map(t => t.name), mom = ms.find(m => m.mom);
  for (const t of d.tree) {
    if (!["Other family", "Mom's ancestor"].includes(t.relation)) { const same = new Set(d.tree.filter(x => x.relation === t.relation).map(x => x.name));
      if (tn.length - same.size >= 1 && !(same.size > 1 && !t.born)) qs.push({ cat: "Way Back When", q: `Who was ${t.relation.replace("Mom's", mom ? mom.name + "'s" : "Mom's")}${same.size > 1 && t.born ? ", born " + t.born : ""}?`, a: t.name, opts: opts(t.name, tn.filter(n => !same.has(n))) }); }
    if (t.place) qs.push({ cat: "Way Back When", q: `Where was ${t.name} born?`, a: t.place, opts: opts(t.place, d.tree.map(x => x.place).concat(TOWNS)) });
  }
  for (const e of d.book) if (!e.photo) qs.push({ cat: e.cat, q: e.q, a: e.a, opts: opts(e.a, (e.wrong || []).concat(names)) });
  const good = qs.filter(q => q.opts.length >= 2);
  return good.length ? pick(good) : null;
}

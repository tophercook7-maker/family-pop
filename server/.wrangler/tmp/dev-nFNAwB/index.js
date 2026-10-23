var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
import { DurableObject } from "cloudflare:workers";

// src/push.js
var enc = new TextEncoder();
var b64u = {
  enc: /* @__PURE__ */ __name((buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), "enc"),
  dec: /* @__PURE__ */ __name((s) => Uint8Array.from(atob(String(s).replace(/-/g, "+").replace(/_/g, "/") + "===".slice((String(s).length + 3) % 4)), (c) => c.charCodeAt(0)), "dec")
};
var cat = /* @__PURE__ */ __name((...parts) => {
  const n = parts.reduce((a, p) => a + p.length, 0), out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}, "cat");
async function hkdf(salt, ikm, info, bytes) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, bytes * 8));
}
__name(hkdf, "hkdf");
async function encryptPayload(sub, payload, fixed) {
  const uaPublic = b64u.dec(sub.keys.p256dh), auth = b64u.dec(sub.keys.auth);
  const as = fixed ? fixed.keyPair : await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const salt = fixed ? fixed.salt : crypto.getRandomValues(new Uint8Array(16));
  const ikm = await hkdf(auth, shared, cat(enc.encode("WebPush: info\0"), uaPublic, asPublic), 32);
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const plain = cat(typeof payload === "string" ? enc.encode(payload) : payload, new Uint8Array([2]));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, plain));
  const rs = new Uint8Array([0, 0, 16, 0]);
  return cat(salt, rs, new Uint8Array([asPublic.length]), asPublic, cipher);
}
__name(encryptPayload, "encryptPayload");
async function vapidHeader(endpoint, vapid) {
  const aud = new URL(endpoint).origin;
  const header = b64u.enc(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = b64u.enc(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1e3) + 12 * 3600, sub: vapid.subject })));
  const pub = b64u.dec(vapid.publicKey);
  const jwk = { kty: "EC", crv: "P-256", d: vapid.privateKey, x: b64u.enc(pub.slice(1, 33)), y: b64u.enc(pub.slice(33, 65)), ext: true };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(`${header}.${body}`));
  return `vapid t=${header}.${body}.${b64u.enc(sig)}, k=${vapid.publicKey}`;
}
__name(vapidHeader, "vapidHeader");
async function sendPush(sub, data, vapid) {
  const body = await encryptPayload(sub, JSON.stringify(data));
  const r = await fetch(sub.endpoint, { method: "POST", body, headers: {
    "Content-Encoding": "aes128gcm",
    "Content-Type": "application/octet-stream",
    TTL: "86400",
    Urgency: "normal",
    Authorization: await vapidHeader(sub.endpoint, vapid)
  } });
  let text = "";
  try {
    text = (await r.text()).slice(0, 300);
  } catch (e) {
  }
  return { status: r.status, text };
}
__name(sendPush, "sendPush");

// src/index.js
var CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type,x-fp-token"
};
var json = /* @__PURE__ */ __name((data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...CORS } }), "json");
var fail = /* @__PURE__ */ __name((msg, status = 400) => json({ error: msg }, status), "fail");
var rid = /* @__PURE__ */ __name((n = 10) => {
  const a = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  const b = crypto.getRandomValues(new Uint8Array(n));
  for (const x of b) s += a[x % a.length];
  return s;
}, "rid");
var sha = /* @__PURE__ */ __name(async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join(""), "sha");
var clip = /* @__PURE__ */ __name((s, n) => String(s ?? "").slice(0, n), "clip");
var today = /* @__PURE__ */ __name(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), "today");
var EARN_CAPS = { "word-popper": 300, "pic-pop": 600, "story": 60, "challenge": 200 };
var SHOP = { pass: 300, square: 600, piece: 150 };
var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
function parseBday(s) {
  s = String(s || "").toLowerCase().trim();
  if (!s) return null;
  let m = s.match(/^(\d{1,2})\s*[\/\-.]\s*(\d{1,2})/);
  if (m) return [+m[1], +m[2]];
  const mm = s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
  if (!mm) return null;
  const mi = MONTHS.indexOf(mm[1]);
  m = s.match(/(\d{1,2})/);
  return m ? [mi + 1, +m[1]] : null;
}
__name(parseBday, "parseBday");
function centralToday(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 864e5);
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(d).map((x) => [x.type, x.value]));
  return [+p.month, +p.day, +p.year];
}
__name(centralToday, "centralToday");
var BDAY_BUCKS = 250;
var SN_DEFAULT = "Sarnaw";
var centralDay = /* @__PURE__ */ __name((off = 0) => {
  const [mo, da, yr] = centralToday(off);
  return `${yr}-${String(mo).padStart(2, "0")}-${String(da).padStart(2, "0")}`;
}, "centralDay");
var HAND_BUCKS = 75;
var TOURNEYS = [{ game: "word-popper", name: "Word Popper", icon: "\u{1FAE7}", mode: "best", rule: "Best single game score" }, { game: "pic-pop", name: "PIC POP", icon: "\u{1F5BC}\uFE0F", mode: "sum", rule: "Most puzzle points all month" }];
var TOURNEY_PRIZES = [500, 250, 100];
var TOURNEY_TROPHIES = ["\u{1F3C6}", "\u{1F948}", "\u{1F949}"];
var GRANDMA_PROMPTS = [
  "What was your house like when you were little?",
  "How did you and Dad meet?",
  "What's your favorite memory of your mama?",
  "What did you do for fun when you were a kid?",
  "What was school like for you?",
  "What was your very first job?",
  "What's the best meal you ever cooked?",
  "What do you remember about living in California?",
  "What was Christmas like when you were a girl?",
  "Who was your best friend growing up, and what did you two do?",
  "What's something your daddy always said?",
  "What are you proudest of?",
  "What was the hardest time in your life, and how did you get through it?",
  "What do you remember about the day each of your kids was born?",
  "What song takes you right back to being young?",
  "What's a family recipe you learned, and who taught you?",
  "What advice would you give your grandkids?",
  "What was the funniest thing that ever happened in our family?",
  "What do you remember about your grandparents?",
  "Where's the most beautiful place you've ever been?",
  "What did a Saturday look like when you were 10?",
  "What was your first car?",
  "What's a prayer that was answered in your life?",
  "What do you want the family to always remember?"
];
var PROFILE_FIELDS = ["name", "piece", "birthday", "nick", "food", "secret", "chatTrivia", "mom", "fb"];
var TRIAL_DAYS = 30;
var FREE_CAP = 4;
var PLUS_YEAR = 365 * 864e5;
var FOREVER_FIDS = ["wvjtreqeabwc"];
var PLUS_ACTIONS = /* @__PURE__ */ new Set([
  "makeTrivia",
  "treeAdd",
  "treeEdit",
  "treeImport",
  "daily",
  "pushSub",
  "pushTest",
  "storyAnswer",
  "storySuggest",
  "recipeAdd",
  "dinner",
  "prayerAdd",
  "pray",
  "prayerAnswered",
  "pollAdd",
  "pollAnswer",
  "pollClose",
  "pollPlayed",
  "noteAdd",
  "checkinSet",
  "checkin",
  "eventAdd",
  "eventRsvp",
  "handAdd",
  "handTake",
  "handDone",
  "square"
]);
function planOf(meta) {
  const now = Date.now();
  meta = meta || {};
  if (meta.plan === "forever") return { tier: "plus", forever: true };
  if ((meta.plusUntil || 0) > now) return { tier: "plus", paid: true, until: meta.plusUntil };
  if ((meta.trialEnds || 0) > now) return { tier: "plus", trial: true, until: meta.trialEnds, daysLeft: Math.ceil((meta.trialEnds - now) / 864e5) };
  return { tier: "free", trialUsed: !!meta.trialEnds, cap: FREE_CAP };
}
__name(planOf, "planOf");
var needPlus = /* @__PURE__ */ __name((msg) => json({ error: msg || "That's part of Family Pop Plus.", plus: true }, 402), "needPlus");
async function sameSecret(a, b) {
  const [x, y] = await Promise.all([sha(String(a || "")), sha(String(b || ""))]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}
__name(sameSecret, "sameSecret");
function parseUntil(u) {
  if (u == null || u === "") return 0;
  const n = typeof u === "number" ? u : /^\d+$/.test(String(u)) ? +u : Date.parse(String(u) + (/^\d{4}-\d{2}-\d{2}$/.test(String(u)) ? "T23:59:59-06:00" : ""));
  return Number.isFinite(n) && n > 0 ? n : NaN;
}
__name(parseUntil, "parseUntil");
var RELATIONS = ["Mom's mother", "Mom's father", "Mom's grandmother", "Mom's grandfather", "Mom's great-grandparent", "Mom's ancestor", "Mom's brother", "Mom's sister", "Mom's aunt", "Mom's uncle", "Mom's cousin", "Other family"];
var src_default = {
  async scheduled(event, env, ctx) {
    const dir = env.DIR.get(env.DIR.idFromName("dir"));
    const { fids } = await (await dir.fetch(new Request("https://dir/list", { method: "POST", body: "{}" }))).json();
    for (const fid of fids || []) ctx.waitUntil(env.FAMILY.get(env.FAMILY.idFromName(fid)).fetch(new Request(`https://do/tick?fid=${fid}&slot=${new Date(event.scheduledTime).getUTCHours() >= 17 ? "noon" : "morning"}`, { method: "POST", body: "{}" })).catch(() => {
    }));
  },
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const p = url.pathname.split("/").filter(Boolean);
    if (p[0] !== "api") return json({ ok: true, app: "family-pop" });
    try {
      if (p[1] === "create" && req.method === "POST") {
        const fid = rid(12);
        const stub = env.FAMILY.get(env.FAMILY.idFromName(fid));
        const body = await req.json();
        return stub.fetch(new Request(`https://do/init?fid=${fid}`, { method: "POST", body: JSON.stringify(body) }));
      }
      if (p[1] === "admin" && p[2] === "plan" && req.method === "POST") {
        const secret = env.ADMIN_PLAN_SECRET || "";
        const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
        if (secret.length < 32 || !got || !await sameSecret(got, secret)) return fail("Not found", 404);
        const b = await req.json().catch(() => ({}));
        const fid = String(b.fid || "");
        if (!/^[a-z0-9]{8,20}$/.test(fid)) return fail("fid looks wrong");
        if (!["plus", "free", "trial", "forever"].includes(b.plan)) return fail("plan must be plus, free, trial or forever");
        const until = parseUntil(b.until);
        if (Number.isNaN(until)) return fail("until must be a date like 2027-10-22");
        const stub = env.FAMILY.get(env.FAMILY.idFromName(fid));
        return stub.fetch(new Request(`https://do/plan?fid=${fid}`, { method: "POST", body: JSON.stringify({ plan: b.plan, until }) }));
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
      if (p[1] === "devreq" && req.method === "POST") {
        const dir = env.DIR.get(env.DIR.idFromName("dir"));
        const code = rid(5).toUpperCase();
        await dir.fetch(new Request("https://dir/devreq", { method: "POST", body: JSON.stringify({ code }) }));
        return json({ code });
      }
      if (p[1] === "devwait" && req.method === "POST") {
        const { code } = await req.json();
        const dir = env.DIR.get(env.DIR.idFromName("dir"));
        return json(await (await dir.fetch(new Request("https://dir/devget", { method: "POST", body: JSON.stringify({ code: clip(code, 8).toUpperCase() }) }))).json());
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
        if (rest === "/tick" || rest === "/init" || rest === "/relink" || rest === "/plan") return fail("Not found", 404);
        const u = new URL(`https://do${rest}`);
        u.search = url.search;
        u.searchParams.set("fid", fid);
        return stub.fetch(new Request(u, req));
      }
      return fail("Not found", 404);
    } catch (e) {
      return fail("Server error: " + e.message, 500);
    }
  }
};
var Directory = class extends DurableObject {
  static {
    __name(this, "Directory");
  }
  async fetch(req) {
    const url = new URL(req.url), b = await req.json();
    if (url.pathname === "/put") {
      const ttl = Math.min(Math.max(+b.ttl || 15 * 6e4, 6e4), 7 * 864e5);
      await this.ctx.storage.put("c:" + b.code, { fid: b.fid, memberId: b.memberId, exp: Date.now() + ttl, multi: !!b.multi });
      return json({ ok: true });
    }
    if (url.pathname === "/devreq") {
      await this.ctx.storage.put("d:" + b.code, { exp: Date.now() + 30 * 6e4 });
      return json({ ok: true });
    }
    if (url.pathname === "/devset") {
      const v = await this.ctx.storage.get("d:" + b.code);
      if (!v || v.exp < Date.now() || v.token) return json({ ok: false });
      await this.ctx.storage.put("d:" + b.code, { ...v, fid: b.fid, memberId: b.memberId, token: b.token });
      return json({ ok: true });
    }
    if (url.pathname === "/devget") {
      const v = await this.ctx.storage.get("d:" + b.code);
      if (!v || v.exp < Date.now()) return json({ gone: true });
      if (!v.token) return json({ waiting: true });
      await this.ctx.storage.delete("d:" + b.code);
      return json({ fid: v.fid, memberId: v.memberId, token: v.token });
    }
    if (url.pathname === "/putip") {
      await this.ctx.storage.put("ip:" + b.ip, { fid: b.fid, memberId: b.memberId, exp: Date.now() + 15 * 6e4 });
      return json({ ok: true });
    }
    if (url.pathname === "/getip") {
      const v = await this.ctx.storage.get("ip:" + b.ip);
      if (!v || v.exp < Date.now()) return json({});
      await this.ctx.storage.delete("ip:" + b.ip);
      return json(v);
    }
    if (url.pathname === "/reg") {
      await this.ctx.storage.put("f:" + b.fid, 1);
      return json({ ok: true });
    }
    if (url.pathname === "/list") {
      const m = await this.ctx.storage.list({ prefix: "f:" });
      return json({ fids: [...m.keys()].map((k) => k.slice(2)) });
    }
    if (url.pathname === "/get") {
      const v = await this.ctx.storage.get("c:" + b.code);
      if (!v || v.exp < Date.now()) return json({});
      if (!v.multi) await this.ctx.storage.delete("c:" + b.code);
      return json(v);
    }
    return json({});
  }
};
var Family = class extends DurableObject {
  static {
    __name(this, "Family");
  }
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
    this.d = null;
  }
  async load() {
    if (this.d) return this.d;
    const keys = ["meta", "members", "chat", "feed", "book", "sqpics", "games", "earn", "trivia", "tree", "daily", "stories", "recipes", "dinner", "prayers", "polls", "hands", "events", "notes"];
    const got = await this.ctx.storage.get(keys);
    this.d = {
      meta: got.get("meta") || null,
      members: got.get("members") || {},
      chat: got.get("chat") || [],
      feed: got.get("feed") || [],
      book: got.get("book") || [],
      sqpics: got.get("sqpics") || {},
      games: got.get("games") || {},
      earn: got.get("earn") || {},
      trivia: got.get("trivia") || [],
      tree: got.get("tree") || [],
      daily: got.get("daily") || null,
      stories: got.get("stories") || { list: [], queue: [] },
      recipes: got.get("recipes") || [],
      dinner: got.get("dinner") || null,
      prayers: got.get("prayers") || [],
      polls: got.get("polls") || [],
      hands: got.get("hands") || [],
      events: got.get("events") || [],
      notes: got.get("notes") || []
    };
    if (this.d.meta && !this.d.meta.plan) {
      this.d.meta.plan = FOREVER_FIDS.includes(this.d.meta.fid) ? "forever" : "trial";
      if (this.d.meta.plan === "trial") this.d.meta.trialEnds = Date.now() + TRIAL_DAYS * 864e5;
      this.ctx.waitUntil(this.save("meta"));
    }
    const sm = Object.values(this.d.members).find((m) => m.mom);
    const sn = this.d.meta && this.d.meta.momName || SN_DEFAULT;
    if (sm && sm.name !== sn) {
      sm.realName = sm.realName || sm.name;
      sm.name = sn;
      this.ctx.waitUntil(this.save("members"));
    }
    return this.d;
  }
  plus() {
    return planOf(this.d.meta).tier === "plus";
  }
  memberCount() {
    return Object.values(this.d.members).filter((m) => m.status === "member").length;
  }
  planView() {
    const p = planOf(this.d.meta), n = this.memberCount();
    return { ...p, members: n, cap: p.tier === "plus" ? null : FREE_CAP, full: p.tier !== "plus" && n >= FREE_CAP };
  }
  async save(...keys) {
    const o = {};
    for (const k of keys) o[k] = this.d[k];
    await this.ctx.storage.put(o);
  }
  async putPhoto(b64, kind = "image") {
    if (!b64 || typeof b64 !== "string" || !b64.startsWith("data:" + kind + "/")) return null;
    if (b64.length > (kind === "audio" ? 14e5 : 9e5)) throw new Error(kind === "audio" ? "That voice message is too long (about 1 minute max)" : "That photo is too big");
    const id = rid(12);
    await this.ctx.storage.put("photo:" + id, b64);
    return id;
  }
  broadcast(type, data, onlyTo) {
    for (const ws of this.ctx.getWebSockets()) {
      const [mid] = this.ctx.getTags(ws);
      if (onlyTo && !onlyTo.includes(mid)) continue;
      try {
        ws.send(JSON.stringify({ type, data }));
      } catch (e) {
      }
    }
  }
  newMember(fields, status) {
    const m = {
      id: rid(8),
      status,
      joined: Date.now(),
      bucks: 500,
      passes: 1,
      pieces: [],
      sqCredits: 0,
      stats: { games: 0, wins: 0, right: 0, asked: 0, rent: 0, trophies: [] },
      chatTrivia: true,
      mom: false,
      approver: false
    };
    for (const f of PROFILE_FIELDS) if (fields[f] !== void 0) m[f] = typeof fields[f] === "boolean" ? fields[f] : clip(fields[f], f === "secret" ? 140 : f === "fb" ? 200 : 40);
    m.fb = fbLink(m.fb);
    if (!m.name) m.name = "Family member";
    if (!m.piece) m.piece = "\u{1FAE7}";
    return m;
  }
  publicMember(m, full) {
    const o = {
      id: m.id,
      name: m.name,
      piece: m.piece,
      status: m.status,
      approver: !!m.approver,
      mom: !!m.mom,
      creator: !!m.creator,
      bucks: m.bucks,
      passes: m.passes,
      stats: m.stats,
      pieces: m.pieces || []
    };
    o.fb = m.fb || "";
    o.mpts = m.mpts || 0;
    o.checkin = !!m.checkin;
    o.checkDay = m.checkDay || "";
    if (full) Object.assign(o, { birthday: m.birthday || "", nick: m.nick || "", food: m.food || "", secret: m.secret || "", chatTrivia: m.chatTrivia !== false, sqCredits: m.sqCredits || 0 });
    return o;
  }
  async who(req, url) {
    const t = req.headers.get("x-fp-token") || url.searchParams.get("t");
    if (!t) return null;
    const h = await sha(t);
    return Object.values(this.d.members).find((m) => m.tokenHash === h || (m.tokenHashes || []).includes(h)) || null;
  }
  async issueToken(m) {
    const t = rid(24), h = await sha(t);
    m.tokenHashes = [.../* @__PURE__ */ new Set([...m.tokenHashes || [], ...m.tokenHash ? [m.tokenHash] : [], h])].slice(-10);
    m.tokenHash = h;
    return t;
  }
  snapshot(me) {
    const d = this.d;
    if (me.status !== "member") return { meta: { name: d.meta.name }, me: this.publicMember(me, true), pending: true };
    const members = Object.values(d.members).filter((m) => m.status === "member" || me.approver && m.status === "pending");
    const myRooms = /* @__PURE__ */ __name((r) => r === "all" || r.split("~").includes(me.id), "myRooms");
    return {
      meta: { name: d.meta.name, approval: d.meta.approval, fid: d.meta.fid, code: d.meta.code, momName: d.meta.momName || SN_DEFAULT },
      plan: this.planView(),
      me: this.publicMember(me, true),
      today: (() => {
        const t = centralToday(), n = centralToday(1);
        const on = /* @__PURE__ */ __name((d2) => Object.values(this.d.members).filter((m) => m.status === "member" && ((b) => b && b[0] === d2[0] && b[1] === d2[1])(parseBday(m.birthday))).map((m) => m.id), "on");
        return { birthdays: on(t), tomorrow: on(n) };
      })(),
      members: members.map((m) => this.publicMember(m, m.status === "member")),
      chat: d.chat.filter((c) => myRooms(c.room)).slice(-300),
      feed: d.feed.slice(-80),
      book: d.book,
      trivia: d.trivia.slice(-200),
      sqpics: d.sqpics,
      tree: d.tree,
      daily: this.plus() && d.daily && {
        date: d.daily.date,
        q: d.daily.q,
        cat: d.daily.cat,
        opts: d.daily.opts,
        about: d.daily.about,
        answers: d.daily.answers,
        first: d.daily.first,
        a: d.daily.answers[me.id] ? d.daily.a : void 0
      },
      champion: d.meta.champion || null,
      month: d.meta.monthKey,
      grandma: this.grandmaNow(),
      stories: d.stories.list.slice(-60),
      recipes: d.recipes,
      dinner: this.dinnerNow(),
      prayers: d.prayers.slice(-40),
      polls: d.polls.slice(-12).map((pl) => this.pollView(pl, me)),
      pushOn: (me.push || []).length > 0,
      hands: d.hands.filter((h) => h.status !== "done" || Date.now() - h.doneTs < 7 * 864e5).slice(-40),
      tourney: this.tourneyView(),
      dayKey: centralDay(),
      notes: me.mom ? d.notes.slice(-60) : d.notes.filter((n) => n.from === me.id).slice(-20),
      events: d.events.filter((e) => e.date >= centralDay(-1)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 30),
      photos: d.feed.filter((p) => p.photo || p.photos && p.photos.length).flatMap((p) => (p.photos || [p.photo]).map((id) => ({ id, from: p.from, ts: p.ts, text: (p.text || "").slice(0, 120) }))).slice(-600),
      games: Object.values(d.games).map((g) => ({ id: g.id, title: g.title, status: g.status, updated: g.updated, players: g.players, turnMember: g.turnMember, created: g.created }))
    };
  }
  async fetch(req) {
    const url = new URL(req.url);
    const d = await this.load();
    const path = url.pathname;
    if (path === "/init" && req.method === "POST") {
      if (d.meta) return fail("Family already exists");
      const b2 = await req.json();
      d.meta = {
        fid: url.searchParams.get("fid"),
        name: clip(b2.familyName || "Our Family", 40),
        code: rid(6).toUpperCase(),
        approval: true,
        created: Date.now(),
        plan: "trial",
        trialEnds: Date.now() + TRIAL_DAYS * 864e5
      };
      const m = this.newMember(b2.me || {}, "member");
      m.creator = true;
      m.approver = true;
      const token = await this.issueToken(m);
      d.members[m.id] = m;
      await this.save("meta", "members");
      const dir = this.env.DIR.get(this.env.DIR.idFromName("dir"));
      await dir.fetch(new Request("https://dir/reg", { method: "POST", body: JSON.stringify({ fid: d.meta.fid }) }));
      return json({ fid: d.meta.fid, memberId: m.id, token, code: d.meta.code });
    }
    if (!d.meta) return fail("We couldn't find that family. Check the link.", 404);
    if (!this.registered) {
      this.registered = true;
      const dir = this.env.DIR.get(this.env.DIR.idFromName("dir"));
      this.ctx.waitUntil(dir.fetch(new Request("https://dir/reg", { method: "POST", body: JSON.stringify({ fid: d.meta.fid }) })).catch(() => {
        this.registered = false;
      }));
    }
    if (path === "/plan" && req.method === "POST") {
      const b2 = await req.json(), now = Date.now(), m = d.meta;
      if (b2.plan === "forever") m.plan = "forever";
      else if (b2.plan === "plus") {
        m.plan = "plus";
        m.plusUntil = b2.until || Math.max(now, m.plusUntil || 0) + PLUS_YEAR;
      } else if (b2.plan === "trial") {
        m.plan = "trial";
        m.plusUntil = 0;
        m.trialEnds = b2.until || now + TRIAL_DAYS * 864e5;
      } else {
        m.plan = "free";
        m.plusUntil = 0;
        m.trialEnds = Math.min(m.trialEnds || now - 1, now - 1);
      }
      await this.save("meta");
      this.broadcast("members", null);
      const pl = planOf(m);
      return json({ ok: true, fid: m.fid, plan: m.plan, tier: pl.tier, until: pl.until ? new Date(pl.until).toISOString() : null });
    }
    if (path === "/tick") {
      await req.text().catch(() => "");
      if (url.searchParams.get("slot") === "noon") await this.checkinAlerts();
      else await this.tick();
      return json({ ok: true });
    }
    if (path === "/relink" && req.method === "POST") {
      const b2 = await req.json();
      const m = d.members[b2.memberId];
      if (!m) return fail("Member not found", 404);
      const token = await this.issueToken(m);
      await this.save("members");
      return json({ fid: d.meta.fid, memberId: m.id, token });
    }
    if (path === "/info") return json({ name: d.meta.name, approval: d.meta.approval, count: this.memberCount(), full: this.planView().full });
    if (path === "/join" && req.method === "POST") {
      const b2 = await req.json();
      if (clip(b2.code, 12).toUpperCase() !== d.meta.code) return fail("That invite code doesn't match. Ask for a new link.", 403);
      if (this.planView().full) return needPlus(`${d.meta.name} already has ${FREE_CAP} people, the most free Family Pop holds. Ask whoever started it to turn on Family Pop Plus, then use this link again.`);
      const m = this.newMember(b2.me || {}, d.meta.approval ? "pending" : "member");
      const token = await this.issueToken(m);
      d.members[m.id] = m;
      await this.save("members");
      if (m.status === "pending") {
        const ap = Object.values(d.members).filter((x) => x.approver).map((x) => x.id);
        this.broadcast("pending", { name: m.name, piece: m.piece }, ap);
        this.notify(ap, null, { title: "\u{1F490} Someone wants to join", body: `${m.piece} ${m.name} is waiting for a yes`, tag: "pending", url: "./#family" });
      } else this.broadcast("members", null);
      return json({ fid: d.meta.fid, memberId: m.id, token, status: m.status });
    }
    if (path.startsWith("/photo/")) {
      const me2 = await this.who(req, url);
      if (!me2 || me2.status !== "member") return new Response("no", { status: 403, headers: CORS });
      const b64 = await this.ctx.storage.get("photo:" + path.slice(7));
      if (!b64) return new Response("missing", { status: 404, headers: CORS });
      const [head, data] = b64.split(",");
      const bin = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
      return new Response(bin, { headers: { "content-type": head.slice(5, head.indexOf(";")), "cache-control": "private, max-age=31536000", ...CORS } });
    }
    const me = await this.who(req, url);
    if (!me) return fail("Please join the family first", 401);
    await this.birthdays();
    await this.monthly();
    await this.ensureDaily();
    if (path === "/ws") {
      if (req.headers.get("Upgrade") !== "websocket") return fail("Expected websocket");
      const pair = new WebSocketPair();
      this.ctx.acceptWebSocket(pair[1], [me.id]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (path === "/me") {
      if (me.status === "member") await this.tourneyRoll();
      return json(this.snapshot(me));
    }
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
    if (PLUS_ACTIONS.has(a) && !this.plus()) return needPlus();
    if ((a === "chat" || a === "post") && (b.photo || b.audio || (b.photos || []).length) && !this.plus()) return needPlus("Photos and voice messages are part of Family Pop Plus.");
    const member = /* @__PURE__ */ __name((id) => {
      const m = d.members[id];
      if (!m) throw new Error("Unknown family member");
      return m;
    }, "member");
    switch (a) {
      case "profile": {
        for (const f of PROFILE_FIELDS) if (b[f] !== void 0 && f !== "mom" && !(f === "name" && me.mom)) me[f] = typeof b[f] === "boolean" ? b[f] : clip(b[f], f === "secret" ? 140 : f === "fb" ? 200 : 40);
        me.fb = fbLink(me.fb);
        await this.save("members");
        this.broadcast("members", null);
        return json({ ok: true });
      }
      case "approve":
      case "deny": {
        if (!isApprover) return fail("Only the people who approve new members can do that", 403);
        const m = member(b.memberId);
        if (a === "approve" && m.status !== "member" && this.planView().full) return needPlus(`Free Family Pop holds ${FREE_CAP} people. Turn on Plus to let ${m.name} in. They'll stay on the waiting list until then.`);
        if (a === "approve") {
          m.status = "member";
          this.post(`${m.piece} ${m.name} joined the family! Welcome!`);
        } else delete d.members[m.id];
        await this.save("members", "feed");
        this.broadcast("members", null);
        this.broadcast("feed", null);
        return json({ ok: true });
      }
      case "setApprover": {
        if (!isApprover) return fail("Only approvers can change who approves", 403);
        const m = member(b.memberId);
        m.approver = !!b.on;
        if (b.mom !== void 0) {
          for (const x of Object.values(d.members)) x.mom = false;
          m.mom = !!b.mom;
        }
        if (!Object.values(d.members).some((x) => x.approver)) me.approver = true;
        await this.save("members");
        this.broadcast("members", null);
        return json({ ok: true });
      }
      case "setMom": {
        if (!isApprover) return fail("Only approvers can do that", 403);
        for (const x of Object.values(d.members)) x.mom = false;
        const sm = member(b.memberId);
        sm.mom = true;
        if (sm.name !== (d.meta.momName || SN_DEFAULT)) {
          sm.realName = sm.realName || sm.name;
          sm.name = d.meta.momName || SN_DEFAULT;
        }
        await this.save("members");
        this.broadcast("members", null);
        return json({ ok: true });
      }
      case "settings": {
        if (b.momName !== void 0 && (isApprover || me.mom)) {
          d.meta.momName = clip(b.momName, 24).trim() || SN_DEFAULT;
          for (const x of Object.values(d.members)) if (x.mom) x.name = d.meta.momName;
          await this.save("meta", "members");
          this.broadcast("members", null);
          this.broadcast("feed", null);
          if (Object.keys(b).length <= 2) return json({ ok: true });
        }
        if (!isApprover) return fail("Only approvers can change settings", 403);
        if (b.approval !== void 0) d.meta.approval = !!b.approval;
        if (b.name) d.meta.name = clip(b.name, 40);
        if (b.newCode) d.meta.code = rid(6).toUpperCase();
        await this.save("meta");
        this.broadcast("members", null);
        return json({ ok: true, code: d.meta.code });
      }
      case "pairStart": {
        const dir = this.env.DIR.get(this.env.DIR.idFromName("dir"));
        const ip = req.headers.get("CF-Connecting-IP") || "";
        if (ip) await dir.fetch(new Request("https://dir/putip", { method: "POST", body: JSON.stringify({ ip, fid: d.meta.fid, memberId: me.id }) }));
        const code = rid(6).toUpperCase();
        await dir.fetch(new Request("https://dir/put", { method: "POST", body: JSON.stringify({ code, fid: d.meta.fid, memberId: me.id, ttl: 30 * 6e4 }) }));
        return json({ code });
      }
      case "homeLink": {
        const code = rid(10).toUpperCase();
        const dir = this.env.DIR.get(this.env.DIR.idFromName("dir"));
        await dir.fetch(new Request("https://dir/put", { method: "POST", body: JSON.stringify({ code, fid: d.meta.fid, memberId: me.id, ttl: 7 * 864e5, multi: true }) }));
        return json({ code });
      }
      case "signInDevice": {
        const target = b.memberId ? d.members[b.memberId] : me;
        if (!target || target.status !== "member") return fail("Pick who it is");
        if (target.id !== me.id && !isApprover) return fail("Only an approver can sign in someone else's phone", 403);
        const token = await this.issueToken(target);
        await this.save("members");
        const dir = this.env.DIR.get(this.env.DIR.idFromName("dir"));
        const r = await (await dir.fetch(new Request("https://dir/devset", { method: "POST", body: JSON.stringify({ code: clip(b.code, 8).toUpperCase().replace(/[^A-Z0-9]/g, ""), fid: d.meta.fid, memberId: target.id, token }) }))).json();
        if (!r.ok) return fail("That code didn't work. Have them close and reopen Family Pop for a fresh one.");
        return json({ ok: true, name: target.name });
      }
      case "relinkCode": {
        const code = rid(6).toUpperCase();
        const dir = this.env.DIR.get(this.env.DIR.idFromName("dir"));
        await dir.fetch(new Request("https://dir/put", { method: "POST", body: JSON.stringify({ code, fid: d.meta.fid, memberId: me.id }) }));
        return json({ code });
      }
      case "chat": {
        const text = clip(b.text, 1e3).trim();
        const photo = await this.putPhoto(b.photo);
        const audio = await this.putPhoto(b.audio, "audio");
        if (!text && !photo && !audio) return fail("Empty message");
        const room = b.room === "all" || !b.room ? "all" : [me.id, member(b.room).id].sort().join("~");
        const msg = { id: rid(10), room, from: me.id, text, photo, audio, ts: Date.now() };
        d.chat.push(msg);
        if (d.chat.length > 2e3) d.chat.splice(0, d.chat.length - 2e3);
        if (room === "all" && me.chatTrivia !== false && text.length >= 20 && text.length <= 160 && !/https?:\/\//.test(text)) {
          d.trivia.push({ id: rid(8), cat: "Way Back When", kind: "said", about: me.id, q: `Who said this in the family chat? "${text}"`, a: me.name, ts: Date.now() });
          if (d.trivia.length > 500) d.trivia.splice(0, d.trivia.length - 500);
        }
        await this.save("chat", "trivia");
        this.broadcast("chat", msg, room === "all" ? null : room.split("~"));
        this.notify(room === "all" ? null : room.split("~"), me.id, { title: `\u{1F4AC} ${me.piece} ${me.name}${room === "all" ? " \xB7 Family chat" : ""}`, body: text || (audio ? "\u{1F3A4} Voice message" : "\u{1F4F7} Photo"), tag: "chat-" + room, url: "./#chat" });
        return json({ ok: true, msg });
      }
      case "makeTrivia": {
        const q = clip(b.q, 200), ans = clip(b.a, 60);
        if (!q || !ans) return fail("Need a question and an answer");
        const photo = b.photoId || await this.putPhoto(b.photo);
        d.book.push({ id: rid(8), cat: CATS(b.cat), q, a: ans, wrong: (b.wrong || []).map((w) => clip(w, 60)).filter(Boolean).slice(0, 3), photo, by: me.id, ts: Date.now() });
        await this.save("book");
        this.broadcast("book", null);
        return json({ ok: true });
      }
      case "bookDel": {
        const e = d.book.find((x) => x.id === b.id);
        if (!e) return json({ ok: true });
        if (e.by !== me.id && !isApprover) return fail("Only the person who added it can remove it", 403);
        d.book = d.book.filter((x) => x.id !== b.id);
        await this.save("book");
        this.broadcast("book", null);
        return json({ ok: true });
      }
      case "post": {
        const text = clip(b.text, 2e3).trim();
        const photo = await this.putPhoto(b.photo);
        const photos = [];
        for (const ph of (b.photos || []).slice(0, 8)) {
          const id = await this.putPhoto(ph);
          if (id) photos.push(id);
        }
        if (!text && !photo && !photos.length) return fail("Write something or add a photo");
        const p = { id: rid(10), from: me.id, text, photo: photo || photos[0] || null, photos: photos.length > 1 ? photos : void 0, ts: Date.now(), likes: [], comments: [] };
        d.feed.push(p);
        if (d.feed.length > 400) d.feed.splice(0, d.feed.length - 400);
        await this.save("feed");
        this.broadcast("feed", p);
        this.notify(null, me.id, { title: `\u{1F4F8} ${me.piece} ${me.name} shared something`, body: text || "New pictures", tag: "feed", url: "./#home" });
        return json({ ok: true, post: p });
      }
      case "like": {
        const p = d.feed.find((x) => x.id === b.postId);
        if (!p) return fail("Post not found", 404);
        p.likes = p.likes.includes(me.id) ? p.likes.filter((x) => x !== me.id) : p.likes.concat(me.id);
        await this.save("feed");
        this.broadcast("feed", null);
        return json({ ok: true });
      }
      case "comment": {
        const p = d.feed.find((x) => x.id === b.postId);
        if (!p) return fail("Post not found", 404);
        const text = clip(b.text, 500).trim();
        if (!text) return fail("Empty comment");
        p.comments.push({ from: me.id, text, ts: Date.now() });
        await this.save("feed");
        this.broadcast("feed", null);
        return json({ ok: true });
      }
      case "give": {
        const to = member(b.to);
        if (to.id === me.id) return fail("Pick someone else");
        const bucks = Math.max(0, Math.floor(+b.bucks || 0)), passes = Math.max(0, Math.floor(+b.passes || 0));
        if (bucks > me.bucks || passes > me.passes) return fail("You don't have that much to give");
        if (!bucks && !passes) return fail("Pick an amount");
        me.bucks -= bucks;
        me.passes -= passes;
        to.bucks += bucks;
        to.passes += passes;
        const what = [bucks && `${bucks} Pop Bucks`, passes && `${passes} Free Pass${passes > 1 ? "es" : ""}`].filter(Boolean).join(" and ");
        const note = clip(b.note, 140);
        this.post(`\u{1F381} ${me.piece} ${me.name} gave ${to.piece} ${to.name} ${what}${note ? `: "${note}"` : "!"}`);
        this.notify([to.id], null, { title: `\u{1F381} ${me.name} sent you a gift!`, body: what + (note ? ` \xB7 "${note}"` : ""), tag: "gift", url: "./#bank" });
        await this.save("members", "feed");
        this.broadcast("members", null);
        this.broadcast("feed", null);
        return json({ ok: true });
      }
      case "earn": {
        const game = String(b.game || "");
        const cap = EARN_CAPS[game];
        if (!cap) return fail("Unknown game");
        const k = `${me.id}:${game}:${today()}`;
        const so = d.earn[k] || 0;
        const amt = Math.max(0, Math.min(Math.floor(+b.amount || 0), cap - so));
        d.earn[k] = so + amt;
        me.bucks += amt;
        for (const key of Object.keys(d.earn)) if (!key.endsWith(today())) delete d.earn[key];
        let tPlace = null;
        if (b.tscore != null) {
          const t = await this.tourneyRoll();
          if (t.game === game) {
            const v = Math.max(0, Math.floor(+b.tscore || 0));
            if (t.mode === "best") t.scores[me.id] = Math.max(t.scores[me.id] || 0, Math.min(v, 5e3));
            else t.scores[me.id] = (t.scores[me.id] || 0) + Math.min(v, 500);
            tPlace = Object.values(t.scores).filter((x) => x > t.scores[me.id]).length + 1;
            await this.save("meta");
            this.broadcast("tourney", null);
          }
        }
        await this.save("members", "earn");
        if (amt) this.broadcast("members", null);
        return json({ ok: true, tPlace, earned: amt, capLeft: cap - d.earn[k], bucks: me.bucks });
      }
      case "pass": {
        const delta = Math.sign(+b.delta || 0);
        if (delta < 0 && me.passes < 1) return fail("No Free Pass to use");
        me.passes += delta;
        await this.save("members");
        this.broadcast("members", null);
        return json({ ok: true, passes: me.passes });
      }
      case "shop": {
        const item = String(b.item || ""), price = item.startsWith("piece:") ? SHOP.piece : SHOP[item];
        if (!price) return fail("Not for sale");
        if (me.bucks < price) return fail(`You need ${price} Pop Bucks`);
        if (item.startsWith("piece:")) {
          const pc = clip(item.slice(6), 8);
          if ((me.pieces || []).includes(pc)) return fail("You already have that piece");
          me.pieces = (me.pieces || []).concat(pc);
        } else if (item === "pass") me.passes++;
        else if (item === "square") me.sqCredits = (me.sqCredits || 0) + 1;
        me.bucks -= price;
        await this.save("members");
        this.broadcast("members", null);
        return json({ ok: true });
      }
      case "square": {
        if ((me.sqCredits || 0) < 1) return fail("Win a game or buy a picture square in the Bank first");
        const i = Math.floor(+b.index);
        if (!(i >= 0 && i < 24)) return fail("Pick a square");
        const photo = await this.putPhoto(b.photo);
        if (!photo) return fail("Pick a photo");
        me.sqCredits--;
        d.sqpics[i] = { photo, name: clip(b.name, 18), caption: clip(b.caption, 60), by: me.name, byId: me.id, date: today() };
        this.post(`\u{1F4F8} ${me.piece} ${me.name} put their picture on the board: ${d.sqpics[i].name}`);
        await this.save("members", "sqpics", "feed");
        this.broadcast("sqpics", null);
        this.broadcast("feed", null);
        return json({ ok: true });
      }
      case "gameCreate": {
        const id = rid(8);
        const g = {
          id,
          title: clip(b.title, 60) || "Family Pop",
          status: "playing",
          created: Date.now(),
          updated: Date.now(),
          host: me.id,
          players: (b.players || []).slice(0, 8),
          state: b.state,
          turnMember: b.turnMember || null,
          rev: 1
        };
        d.games[id] = g;
        this.prune();
        await this.save("games");
        this.post(`\u{1F3B2} ${me.piece} ${me.name} started a Family Pop game with ${g.players.map((p) => p.name).join(", ")}`);
        await this.save("feed");
        this.broadcast("games", { id });
        this.broadcast("feed", null);
        this.notify(g.players.map((p) => p.memberId).filter(Boolean), me.id, { title: "\u{1F3B2} New Family Pop game!", body: `${me.name} started a game with you`, tag: "game-" + id, url: "./#play" });
        return json({ ok: true, id });
      }
      case "gameUpdate": {
        const g = d.games[b.id];
        if (!g) return fail("That game is gone", 404);
        if (!g.players.some((p) => p.memberId === me.id)) return fail("You're not in this game", 403);
        if (b.rev !== g.rev) return fail("Someone else just moved. Refreshing\u2026", 409);
        g.state = b.state;
        g.turnMember = b.turnMember || null;
        g.updated = Date.now();
        g.rev++;
        if (b.over) g.status = "done";
        await this.save("games");
        this.broadcast("game", { id: g.id, rev: g.rev, turnMember: g.turnMember, event: clip(b.event, 200) });
        if (g.turnMember && g.turnMember !== me.id && !b.over) this.notify([g.turnMember], null, { title: "\u{1F514} Your turn in Family Pop!", body: clip(b.event, 120) || "It's your move", tag: "game-" + g.id, url: "./#play" });
        return json({ ok: true, rev: g.rev });
      }
      case "gameEnd": {
        const key = "ended:" + clip(b.gameKey, 40);
        if (await this.ctx.storage.get(key)) return json({ ok: true, already: true });
        await this.ctx.storage.put(key, 1);
        const lines = [];
        for (const r of (b.results || []).slice(0, 8)) {
          const m = d.members[r.memberId];
          if (!m) continue;
          const s = m.stats;
          s.games++;
          s.right += r.right | 0;
          s.asked += r.asked | 0;
          s.rent += r.rent | 0;
          for (const t of (r.trophies || []).slice(0, 4)) s.trophies.push(clip(t, 4));
          if (s.trophies.length > 60) s.trophies.splice(0, s.trophies.length - 60);
          const bank = Math.max(0, Math.min(400, Math.round((r.worth | 0) / 10)));
          m.bucks += bank;
          if (r.winner) {
            s.wins++;
            m.sqCredits = (m.sqCredits || 0) + 1;
          }
          m.mpts = (m.mpts || 0) + 10 + (r.right | 0) * 2 + (r.winner ? 50 : 0);
          lines.push(`${m.piece} ${m.name} +${bank}`);
        }
        const win = (b.results || []).find((r) => r.winner);
        this.post(`\u{1F3C6} ${clip(b.winnerName, 40)} won Family Pop! Pop Bucks to the bank: ${lines.join(", ")}`);
        if (b.id && d.games[b.id]) d.games[b.id].status = "done";
        await this.save("members", "feed", "games");
        this.broadcast("members", null);
        this.broadcast("feed", null);
        this.broadcast("games", null);
        return json({ ok: true, winnerGotSquare: !!(win && d.members[win.memberId]) });
      }
      case "gameDelete": {
        const g = d.games[b.id];
        if (g && (g.host === me.id || isApprover)) {
          delete d.games[b.id];
          await this.save("games");
          this.broadcast("games", null);
        }
        return json({ ok: true });
      }
      case "treeEdit": {
        const e = d.tree.find((x) => x.id === b.id);
        if (!e) return fail("Not found", 404);
        for (const f of ["born", "died"]) if (b[f] !== void 0) e[f] = clip(b[f], 40);
        if (b.story !== void 0) e.story = clip(b.story, 300);
        await this.save("tree");
        this.broadcast("tree", null);
        return json({ ok: true });
      }
      case "noteAdd": {
        const sn = Object.values(d.members).find((m) => m.mom && m.status === "member");
        if (!sn) return fail("Ask Topher to mark who Sarnaw is first");
        if (sn.id === me.id) return fail("This one's for the family to send you");
        const text = clip(b.text, 600).trim(), photo = await this.putPhoto(b.photo), audio = await this.putPhoto(b.audio, "audio");
        if (!text && !photo && !audio) return fail("Write something, or add a picture or voice message");
        d.notes.push({ id: rid(8), from: me.id, text, photo, audio, ts: Date.now(), seen: false });
        if (d.notes.length > 300) d.notes.shift();
        await this.save("notes");
        this.broadcast("notes", null, [sn.id, me.id]);
        this.notify([sn.id], null, { title: `\u{1F48C} A note from ${me.name}`, body: text ? text.slice(0, 120) : audio ? "A voice message for you" : "A picture for you", tag: "note", url: "./#home" });
        return json({ ok: true });
      }
      case "noteSeen": {
        if (!me.mom) return json({ ok: true });
        let ch = false;
        for (const n of d.notes) if (!n.seen && (!b.id || n.id === b.id)) {
          n.seen = true;
          n.seenTs = Date.now();
          ch = true;
          const f = d.members[n.from];
          if (f && f.id !== me.id) this.notify([f.id], null, { title: `\u{1F49B} ${d.meta.momName || SN_DEFAULT} read your note`, body: (n.text || "Your note").slice(0, 100), tag: "noteseen", url: "./#home" });
        }
        if (ch) {
          await this.save("notes");
          this.broadcast("notes", null);
        }
        return json({ ok: true });
      }
      case "checkinSet": {
        me.checkin = !!b.on;
        if (me.checkin) me.checkDay = centralDay();
        await this.save("members");
        this.broadcast("members", null);
        return json({ ok: true });
      }
      case "checkin": {
        const first = me.checkDay !== centralDay();
        me.checkDay = centralDay();
        me.checkTs = Date.now();
        if (first && me.checkAlerted === centralDay()) this.notify(null, me.id, { title: `\u{1F49B} ${me.name} checked in`, body: "All good today", tag: "checkin-" + me.id, url: "./#home" });
        await this.save("members");
        this.broadcast("members", null);
        return json({ ok: true });
      }
      case "eventAdd": {
        const title = clip(b.title, 80).trim(), date = String(b.date || "");
        if (!title) return fail("Name the event");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < centralDay()) return fail("Pick a day that hasn't passed");
        const e = { id: rid(8), title, date, time: clip(b.time, 20), place: clip(b.place, 80), note: clip(b.note, 300), by: me.id, rsvp: { [me.id]: "yes" }, ts: Date.now() };
        d.events.push(e);
        d.events = d.events.filter((x) => x.date >= centralDay(-60)).slice(-150);
        this.post(`\u{1F4C5} ${me.piece} ${me.name} added "${title}" to the family calendar: ${(/* @__PURE__ */ new Date(date + "T12:00:00")).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${e.time ? " at " + e.time : ""}`);
        await this.save("events", "feed");
        this.broadcast("events", null);
        this.broadcast("feed", null);
        this.notify(null, me.id, { title: `\u{1F4C5} ${title}`, body: `${me.name} added it to the family calendar. Are you coming?`, tag: "event-" + e.id, url: "./#family" });
        return json({ ok: true });
      }
      case "eventRsvp": {
        const e = d.events.find((x) => x.id === b.id);
        if (!e) return fail("Not found", 404);
        if (["yes", "no", "maybe"].includes(b.ans)) e.rsvp[me.id] = b.ans;
        else delete e.rsvp[me.id];
        await this.save("events");
        this.broadcast("events", null);
        return json({ ok: true });
      }
      case "eventDel": {
        const e = d.events.find((x) => x.id === b.id);
        if (e && (e.by === me.id || isApprover)) {
          d.events = d.events.filter((x) => x.id !== b.id);
          await this.save("events");
          this.broadcast("events", null);
        }
        return json({ ok: true });
      }
      case "handAdd": {
        const text = clip(b.text, 300).trim();
        if (text.length < 4) return fail("Say what you need a hand with");
        const h = { id: rid(8), from: me.id, text, when: clip(b.when, 60).trim(), ts: Date.now(), status: "open", helper: null };
        d.hands.push(h);
        if (d.hands.length > 120) d.hands.shift();
        await this.save("hands");
        this.broadcast("hands", null);
        this.notify(null, me.id, { title: `\u{1F91D} ${me.name} could use a hand`, body: text.slice(0, 120) + (h.when ? " \xB7 " + h.when : ""), tag: "hand-" + h.id, url: "./#home" });
        return json({ ok: true });
      }
      case "handTake": {
        const h = d.hands.find((x) => x.id === b.id);
        if (!h || h.status === "done") return fail("That one's already taken care of");
        if (h.from === me.id) return fail("That's your own request");
        if (h.helper && h.helper !== me.id) return fail("Someone already said they'd help");
        if (h.helper === me.id) {
          h.helper = null;
          h.status = "open";
        } else {
          h.helper = me.id;
          h.status = "taken";
          this.notify([h.from], null, { title: `\u{1F91D} ${me.name} will help!`, body: h.text.slice(0, 120), tag: "hand-" + h.id, url: "./#home" });
        }
        await this.save("hands");
        this.broadcast("hands", null);
        return json({ ok: true });
      }
      case "handDone": {
        const h = d.hands.find((x) => x.id === b.id);
        if (!h || h.status === "done") return json({ ok: true });
        if (h.from !== me.id && !isApprover) return fail("The person who asked marks it done", 403);
        h.status = "done";
        h.doneTs = Date.now();
        const hp = h.helper && d.members[h.helper];
        if (hp) {
          hp.bucks += HAND_BUCKS;
          hp.mpts = (hp.mpts || 0) + 15;
          hp.stats.helped = (hp.stats.helped || 0) + 1;
          this.post(`\u{1F91D} ${hp.piece} ${hp.name} gave ${me.piece} ${me.name} a hand: "${h.text.slice(0, 100)}". +${HAND_BUCKS} Pop Bucks from the family bank!`);
          this.notify([hp.id], null, { title: `\u{1F91D} ${me.name} says thank you!`, body: `+${HAND_BUCKS} Pop Bucks for helping`, tag: "hand-" + h.id, url: "./#bank" });
        }
        await this.save("hands", "members", "feed");
        this.broadcast("hands", null);
        this.broadcast("members", null);
        this.broadcast("feed", null);
        return json({ ok: true });
      }
      case "handDel": {
        const h = d.hands.find((x) => x.id === b.id);
        if (h && (h.from === me.id || isApprover)) {
          d.hands = d.hands.filter((x) => x.id !== b.id);
          await this.save("hands");
          this.broadcast("hands", null);
        }
        return json({ ok: true });
      }
      case "treeAdd": {
        const name = clip(b.name, 60).trim();
        if (!name) return fail("Please add a name");
        const e = {
          id: rid(8),
          name,
          relation: RELATIONS.includes(b.relation) ? b.relation : "Other family",
          born: clip(b.born, 40),
          died: clip(b.died, 40),
          place: clip(b.place, 60),
          story: clip(b.story, 300),
          photo: await this.putPhoto(b.photo),
          by: me.id,
          ts: Date.now()
        };
        d.tree.push(e);
        if (d.tree.length > 500) d.tree.shift();
        this.post(`\u{1F333} ${me.piece} ${me.name} added ${name} (${e.relation.replace(/^Mom's/, (d.meta.momName || SN_DEFAULT) + "'s")}) to the family tree`);
        await this.save("tree", "feed");
        this.broadcast("tree", null);
        this.broadcast("feed", null);
        return json({ ok: true });
      }
      case "treeImport": {
        if (!isApprover && !me.mom) return fail("Only Mom or an approver can load the family research", 403);
        const have = new Set(d.tree.map((t) => t.name.toLowerCase()));
        let n = 0;
        for (const x of (b.people || []).slice(0, 80)) {
          const name = clip(x.name, 60).trim();
          if (!name || have.has(name.toLowerCase())) continue;
          d.tree.push({
            id: rid(8),
            name,
            relation: RELATIONS.includes(x.relation) ? x.relation : "Other family",
            born: clip(x.born, 40),
            died: clip(x.died, 40),
            place: clip(x.place, 60),
            story: clip(x.story, 300),
            photo: null,
            by: me.id,
            ts: Date.now()
          });
          have.add(name.toLowerCase());
          n++;
        }
        if (n) this.post(`\u{1F333} ${me.piece} ${me.name} added ${n} people from the family research to ${d.meta.momName || SN_DEFAULT}'s family tree: the Youngs, Vaughns, Bagleys, Duggans and Neighbors, all the way back to Ireland!`);
        await this.save("tree", "feed");
        this.broadcast("tree", null);
        this.broadcast("feed", null);
        return json({ ok: true, added: n });
      }
      case "treeDel": {
        const e = d.tree.find((x) => x.id === b.id);
        if (!e) return json({ ok: true });
        if (e.by !== me.id && !isApprover && !me.mom) return fail("Only the person who added it, Mom, or an approver can remove it", 403);
        d.tree = d.tree.filter((x) => x.id !== b.id);
        await this.save("tree");
        this.broadcast("tree", null);
        return json({ ok: true });
      }
      case "daily": {
        const q = d.daily;
        if (!q) return fail("No question today");
        if (q.about === me.id) return fail("This one's about you! See who knows you");
        if (q.answers[me.id]) return fail("You already answered today");
        const ok = String(b.pick) === q.a;
        let paid = 0;
        if (ok && !q.first) {
          q.first = me.id;
          paid = 50;
        } else if (ok) paid = 15;
        q.answers[me.id] = { ok, ts: Date.now() };
        me.bucks += paid;
        if (ok) me.mpts = (me.mpts || 0) + 5;
        await this.save("daily", "members");
        this.broadcast("daily", null);
        this.broadcast("members", null);
        return json({ ok: true, right: ok, a: q.a, paid, first: q.first === me.id });
      }
      case "pushSub": {
        const sub = b.sub;
        if (!sub || !sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) return fail("Bad subscription");
        if (!/^https:\/\//.test(sub.endpoint)) return fail("Bad subscription");
        me.push = (me.push || []).filter((x) => x.endpoint !== sub.endpoint).concat({ endpoint: clip(sub.endpoint, 600), keys: { p256dh: clip(sub.keys.p256dh, 200), auth: clip(sub.keys.auth, 60) } }).slice(-5);
        await this.save("members");
        const res = await this.pushTo(me, { title: "\u{1F514} Alerts are on!", body: "Family Pop will let you know when it's your turn, and more.", tag: "hello", url: "./" });
        return json({ ok: true, res });
      }
      case "pushTest": {
        if (!(me.push || []).length) return json({ ok: true, res: [], none: true });
        const res = await this.pushTo(me, { title: "\u{1F514} Test alert", body: "If you can read this, alerts work!", tag: "test", url: "./" });
        return json({ ok: true, res });
      }
      case "pushOff": {
        me.push = [];
        await this.save("members");
        return json({ ok: true });
      }
      case "storyAnswer": {
        if (!me.mom) return fail(`These questions are for ${d.meta.momName || SN_DEFAULT} to answer`);
        const g = this.grandmaNow();
        if (!g) return fail("No question this week");
        const text = clip(b.text, 3e3).trim(), audio = await this.putPhoto(b.audio, "audio");
        if (!text && !audio) return fail("Say or type an answer");
        d.stories.list.push({ id: rid(8), week: g.week, prompt: g.prompt, by: me.id, text, audio, ts: Date.now() });
        d.stories.queue = d.stories.queue.filter((x) => x.q !== g.prompt);
        d.feed.push({ id: rid(10), from: "system", kind: "story", text: `\u{1F399}\uFE0F ${me.piece} ${me.name} answered this week's Ask ${d.meta.momName || SN_DEFAULT}: "${g.prompt}"`, audio, story: text, ts: Date.now(), likes: [], comments: [] });
        await this.save("stories", "feed");
        this.broadcast("feed", null);
        this.broadcast("stories", null);
        this.notify(null, me.id, { title: `\u{1F399}\uFE0F ${me.name} told a story`, body: g.prompt, tag: "story", url: "./#home" });
        return json({ ok: true });
      }
      case "storySuggest": {
        const q = clip(b.q, 200).trim();
        if (q.length < 8) return fail(`Type a question for ${d.meta.momName || SN_DEFAULT}`);
        d.stories.queue.push({ q, by: me.id, ts: Date.now() });
        if (d.stories.queue.length > 30) d.stories.queue.shift();
        await this.save("stories");
        this.broadcast("stories", null);
        return json({ ok: true });
      }
      case "recipeAdd": {
        const title = clip(b.title, 80).trim();
        if (!title) return fail("Name the dish");
        const r = { id: rid(8), title, whose: clip(b.whose, 60).trim() || me.name, ingredients: clip(b.ingredients, 2e3), steps: clip(b.steps, 4e3), photo: await this.putPhoto(b.photo), by: me.id, ts: Date.now() };
        d.recipes.push(r);
        this.post(`\u{1F372} ${me.piece} ${me.name} added ${r.whose}'s ${title} to the family recipe box`);
        await this.save("recipes", "feed");
        this.broadcast("recipes", null);
        this.broadcast("feed", null);
        return json({ ok: true });
      }
      case "recipeDel": {
        const r = d.recipes.find((x) => x.id === b.id);
        if (r && (r.by === me.id || isApprover || me.mom)) {
          d.recipes = d.recipes.filter((x) => x.id !== b.id);
          await this.save("recipes");
          this.broadcast("recipes", null);
        }
        return json({ ok: true });
      }
      case "dinner": {
        const dn = this.dinnerNow(true);
        if (b.host !== void 0) {
          if (!isApprover && !me.mom) return fail("Mom or an approver sets the host");
          dn.host = clip(b.host, 60);
        }
        if (b.item !== void 0) {
          const it = clip(b.item, 80).trim();
          if (it) dn.items[me.id] = it;
          else delete dn.items[me.id];
        }
        if (b.coming !== void 0) dn.coming[me.id] = !!b.coming;
        await this.save("dinner");
        this.broadcast("dinner", null);
        return json({ ok: true });
      }
      case "prayerAdd": {
        const text = clip(b.text, 600).trim();
        if (!text) return fail("Type your prayer request");
        d.prayers.push({ id: rid(8), from: me.id, text, ts: Date.now(), praying: [], answered: false });
        if (d.prayers.length > 200) d.prayers.shift();
        await this.save("prayers");
        this.broadcast("prayers", null);
        this.notify(null, me.id, { title: `\u{1F64F} ${me.name} asked for prayer`, body: text.slice(0, 120), tag: "prayer", url: "./#home" });
        return json({ ok: true });
      }
      case "pray": {
        const pr = d.prayers.find((x) => x.id === b.id);
        if (!pr) return fail("Not found", 404);
        if (!pr.praying.includes(me.id)) {
          pr.praying.push(me.id);
          if (pr.from !== me.id) this.notify([pr.from], null, { title: `\u{1F64F} ${me.name} is praying for you`, body: pr.text.slice(0, 100), tag: "pray-" + pr.id, url: "./#home" });
        }
        await this.save("prayers");
        this.broadcast("prayers", null);
        return json({ ok: true });
      }
      case "prayerAnswered": {
        const pr = d.prayers.find((x) => x.id === b.id);
        if (!pr || pr.from !== me.id) return fail("Only the person who asked can mark it answered", 403);
        pr.answered = true;
        pr.answeredTs = Date.now();
        this.post(`\u{1F64C} ${me.piece} ${me.name}'s prayer was answered: "${pr.text.slice(0, 120)}"`);
        await this.save("prayers", "feed");
        this.broadcast("prayers", null);
        this.broadcast("feed", null);
        return json({ ok: true });
      }
      case "pollAdd": {
        const q = clip(b.q, 140).trim();
        if (q.length < 6) return fail("Type the question");
        const pl = { id: rid(8), q, by: me.id, ts: Date.now(), answers: {}, status: "collecting", top: null };
        d.polls.push(pl);
        if (d.polls.length > 40) d.polls.shift();
        await this.save("polls");
        this.broadcast("polls", null);
        this.notify(null, me.id, { title: "\u{1F4CA} New Family Feud question!", body: q, tag: "poll-" + pl.id, url: "./#play" });
        return json({ ok: true });
      }
      case "pollAnswer": {
        const pl = d.polls.find((x) => x.id === b.id);
        if (!pl || pl.status !== "collecting") return fail("That one's closed");
        const t = clip(b.text, 60).trim();
        if (!t) return fail("Type an answer");
        pl.answers[me.id] = t;
        const n = Object.keys(pl.answers).length, total = Object.values(d.members).filter((m) => m.status === "member").length;
        if (n >= total && n >= 3) this.closePoll(pl);
        await this.save("polls", "feed");
        this.broadcast("polls", null);
        return json({ ok: true });
      }
      case "pollClose": {
        const pl = d.polls.find((x) => x.id === b.id);
        if (!pl) return fail("Not found", 404);
        if (pl.by !== me.id && !isApprover) return fail("Only the person who asked can close it", 403);
        if (Object.keys(pl.answers).length < 2) return fail("Wait for at least 2 answers");
        this.closePoll(pl);
        await this.save("polls", "feed");
        this.broadcast("polls", null);
        this.broadcast("feed", null);
        return json({ ok: true });
      }
      case "pollPlayed": {
        const pl = d.polls.find((x) => x.id === b.id);
        if (!pl || pl.status !== "ready") return fail("Not ready");
        pl.played = pl.played || {};
        if (pl.played[me.id] != null) return json({ ok: true, already: true });
        const score = Math.max(0, Math.min(100, Math.floor(+b.score || 0)));
        pl.played[me.id] = score;
        me.bucks += score;
        me.mpts = (me.mpts || 0) + Math.round(score / 10);
        await this.save("polls", "members");
        this.broadcast("members", null);
        return json({ ok: true, earned: score });
      }
      default:
        return fail("Unknown action");
    }
  }
  async birthdays() {
    if (!this.plus()) return;
    const [mo, da, yr] = centralToday();
    let changed = false;
    for (const m of Object.values(this.d.members)) {
      if (m.status !== "member") continue;
      const b = parseBday(m.birthday);
      if (!b || b[0] !== mo || b[1] !== da || m.bdayYear === yr) continue;
      m.bdayYear = yr;
      m.bucks += BDAY_BUCKS;
      m.passes += 1;
      changed = true;
      this.d.feed.push({ id: rid(10), from: "system", kind: "birthday", about: m.id, text: `\u{1F382} Happy Birthday, ${m.piece} ${m.name}! The family bank gave you ${BDAY_BUCKS} Pop Bucks and a Free Pass. Leave a birthday wish!`, ts: Date.now(), likes: [], comments: [] });
    }
    if (changed) {
      await this.save("members", "feed");
      this.broadcast("feed", null);
      this.broadcast("members", null);
    }
  }
  async monthly() {
    const [mo, , yr] = centralToday();
    const key = `${yr}-${String(mo).padStart(2, "0")}`;
    if (this.d.meta.monthKey === key) return;
    const prev = this.d.meta.monthKey;
    if (prev) {
      const ms = Object.values(this.d.members).filter((m) => m.status === "member" && (m.mpts || 0) > 0).sort((a, b) => b.mpts - a.mpts);
      if (ms.length && this.plus()) {
        const c = ms[0], label = (/* @__PURE__ */ new Date(prev + "-15")).toLocaleString("en-US", { month: "long", year: "numeric" });
        this.d.meta.champion = { memberId: c.id, name: c.name, piece: c.piece, month: label, pts: c.mpts };
        c.bucks += 300;
        c.stats.trophies.push("\u{1F947}");
        this.post(`\u{1F947} ${c.piece} ${c.name} is the Family Champion of ${label}! +300 Pop Bucks, their picture welcomes everyone all month, and they win a REAL 3D-printed ${c.piece} game piece!`);
      }
      for (const m of Object.values(this.d.members)) m.mpts = 0;
    }
    this.d.meta.monthKey = key;
    await this.save("meta", "members", "feed");
    this.broadcast("feed", null);
  }
  async ensureDaily() {
    const [mo, da, yr] = centralToday();
    const date = `${yr}-${mo}-${da}`;
    if (this.d.daily && this.d.daily.date === date) return;
    const q = makeDaily(this.d, date);
    this.d.daily = q ? Object.assign(q, { date, answers: {}, first: null }) : { date, q: null, answers: {} };
    await this.save("daily");
  }
  closePoll(pl) {
    const norm = /* @__PURE__ */ __name((t) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\b(a|an|the|my|her|his)\b/g, "").replace(/\s+/g, " ").trim(), "norm");
    const groups = {};
    for (const t of Object.values(pl.answers)) {
      const k = norm(t);
      if (!k) continue;
      (groups[k] = groups[k] || { text: t, count: 0 }).count++;
    }
    pl.top = Object.values(groups).sort((a, b) => b.count - a.count).slice(0, 6);
    pl.status = "ready";
    this.post(`\u{1F4CA} Family Feud board is ready: "${pl.q}". Can you guess the top answers?`);
    this.notify(null, null, { title: "\u{1F4CA} The Family Feud board is ready!", body: pl.q, tag: "poll-" + pl.id, url: "./#play" });
  }
  pollView(pl, me) {
    return {
      id: pl.id,
      q: pl.q,
      by: pl.by,
      ts: pl.ts,
      status: pl.status,
      count: Object.keys(pl.answers).length,
      mine: pl.answers[me.id] || "",
      top: pl.status === "ready" ? pl.top : null,
      played: pl.played ? pl.played[me.id] : void 0
    };
  }
  weekKey() {
    const [mo, da, yr] = centralToday();
    const d = Date.UTC(yr, mo - 1, da);
    const monday = d - (new Date(d).getUTCDay() + 6) % 7 * 864e5;
    return new Date(monday).toISOString().slice(0, 10);
  }
  grandmaNow() {
    const mom = Object.values(this.d.members).find((m) => m.mom && m.status === "member");
    if (!mom) return null;
    const week = this.weekKey(), st = this.d.stories;
    if (!st.current || st.current.week !== week) {
      const used = new Set(st.list.map((x) => x.prompt));
      const next = (st.queue.find((x) => !used.has(x.q)) || {}).q || GRANDMA_PROMPTS.find((p) => !used.has(p)) || GRANDMA_PROMPTS[Math.floor(Date.now() / 6048e5) % GRANDMA_PROMPTS.length];
      st.current = { week, prompt: next };
      this.ctx.waitUntil(this.save("stories"));
    }
    const answered = st.list.find((x) => x.week === week);
    return { week, prompt: st.current.prompt, momId: mom.id, answered: answered ? answered.id : null, suggestions: st.queue.length };
  }
  dinnerNow(create) {
    const [mo, da, yr] = centralToday();
    const d = new Date(Date.UTC(yr, mo - 1, da));
    const toSun = (7 - d.getUTCDay()) % 7;
    const sunday = new Date(d.getTime() + toSun * 864e5).toISOString().slice(0, 10);
    if (!this.d.dinner || this.d.dinner.date !== sunday) {
      const fresh = { date: sunday, host: this.d.dinner ? this.d.dinner.host : "", items: {}, coming: {} };
      if (!create) return fresh;
      this.d.dinner = fresh;
    }
    return this.d.dinner;
  }
  async pushTo(m, data) {
    const v = this.env.VAPID_PRIVATE && this.env.VAPID_PUBLIC ? { publicKey: this.env.VAPID_PUBLIC, privateKey: this.env.VAPID_PRIVATE, subject: "mailto:topher@mixedmakershop.com" } : null;
    if (!v || !(m.push || []).length) return [];
    let dead = false;
    const out = [];
    for (const sub of m.push.slice()) {
      const host = (() => {
        try {
          return new URL(sub.endpoint).host;
        } catch (e) {
          return "?";
        }
      })();
      try {
        const { status, text } = await sendPush(sub, data, v);
        out.push({ host, status, text });
        console.log(`push ${host} ${status} ${text}`);
        if (status === 404 || status === 410) {
          m.push = m.push.filter((x) => x.endpoint !== sub.endpoint);
          dead = true;
        }
      } catch (e) {
        out.push({ host, status: 0, text: String(e.message || e) });
        console.log(`push ${host} ERR ${e.message || e}`);
      }
    }
    if (dead) await this.save("members");
    return out;
  }
  notify(toIds, exceptId, data) {
    if (!this.plus()) return;
    const ms = Object.values(this.d.members).filter((m) => m.status === "member" && m.id !== exceptId && (!toIds || toIds.includes(m.id)) && (m.push || []).length);
    if (ms.length) this.ctx.waitUntil(Promise.all(ms.map((m) => this.pushTo(m, data))));
  }
  async tick() {
    if (!this.plus()) {
      await this.monthly();
      await this.tourneyRoll();
      return;
    }
    const before = this.d.daily && this.d.daily.date;
    await this.birthdays();
    await this.monthly();
    await this.ensureDaily();
    const [mo, da, yr] = centralToday();
    const dow = new Date(Date.UTC(yr, mo - 1, da)).getUTCDay();
    for (const f of this.d.feed.filter((f2) => f2.kind === "birthday" && Date.now() - f2.ts < 20 * 36e5)) {
      const m = this.d.members[f.about];
      if (m) this.notify(null, null, { title: `\u{1F382} It's ${m.name}'s birthday!`, body: "Send a birthday wish in Family Pop", tag: "bday-" + m.id, url: "./#home" });
    }
    if (this.d.daily && this.d.daily.q && this.d.daily.date !== before) this.notify(null, null, { title: "\u2B50 Today's family question is up!", body: this.d.daily.q, tag: "daily", url: "./#home" });
    const g = this.grandmaNow();
    if (g && dow === 1 && !g.answered) this.notify([g.momId], null, { title: `\u{1F399}\uFE0F This week's Ask ${this.d.meta.momName || SN_DEFAULT}`, body: g.prompt, tag: "grandma", url: "./#home" });
    if (dow === 6) {
      const dn = this.dinnerNow();
      this.notify(null, null, { title: "\u{1F37D}\uFE0F Sunday dinner is tomorrow!", body: dn.host ? `At ${dn.host}'s. What are you bringing?` : "What are you bringing?", tag: "dinner", url: "./#home" });
    }
    await this.tourneyRoll();
    await this.remembering();
    if (dow === 0) await this.recap();
    const td = centralDay(), tm = centralDay(1);
    for (const e of this.d.events) {
      const who = Object.entries(e.rsvp).filter(([, a]) => a !== "no").map(([id]) => id), at = (e.time ? " at " + e.time : "") + (e.place ? " \xB7 " + e.place : "");
      if (e.date === tm) this.notify(null, null, { title: `\u{1F4C5} Tomorrow: ${e.title}`, body: (at.replace(/^ at /, "") || "Are you coming?") + (who.length ? ` \xB7 ${who.length} coming` : ""), tag: "event-" + e.id, url: "./#family" });
      if (e.date === td) this.notify(who.length ? who : null, null, { title: `\u{1F4C5} Today: ${e.title}`, body: at.replace(/^ at /, "") || "See you there!", tag: "event-" + e.id, url: "./#family" });
    }
    for (const m of Object.values(this.d.members)) if (m.status === "member" && m.checkin && m.checkDay !== td)
      this.notify([m.id], null, { title: "\u2600\uFE0F Good morning!", body: "Tap to let the family know you're OK today", tag: "checkin", url: "./?checkin=1#home" });
    for (const pl of this.d.polls) if (pl.status === "collecting" && Date.now() - pl.ts > 3 * 864e5 && Object.keys(pl.answers).length >= 2) this.closePoll(pl);
    await this.save("polls", "feed");
  }
  async checkinAlerts() {
    if (!this.plus()) return;
    const td = centralDay();
    let changed = false;
    for (const m of Object.values(this.d.members)) {
      if (m.status !== "member" || !m.checkin || m.checkDay === td || m.checkAlerted === td) continue;
      m.checkAlerted = td;
      changed = true;
      this.notify(null, m.id, { title: `\u{1F49B} ${m.name} hasn't checked in today`, body: "Might be nothing. Maybe give them a text?", tag: "checkin-" + m.id, url: "./#home" });
      this.notify([m.id], null, { title: "\u{1F49B} The family's checking on you", body: "Tap to say you're OK", tag: "checkin", url: "./?checkin=1#home" });
    }
    if (changed) await this.save("members");
  }
  monthKeyNow() {
    const [mo, , yr] = centralToday();
    return `${yr}-${String(mo).padStart(2, "0")}`;
  }
  async tourneyRoll() {
    const key = this.monthKeyNow(), t = this.d.meta.tourney;
    if (t && t.key === key) return t;
    if (t && Object.keys(t.scores).length) {
      const label = (/* @__PURE__ */ new Date(t.key + "-15")).toLocaleString("en-US", { month: "long" });
      const top = Object.entries(t.scores).filter(([id]) => this.d.members[id]).sort((a, b) => b[1] - a[1]).slice(0, 3);
      const lines = top.map(([id, sc], i) => {
        const m = this.d.members[id];
        m.bucks += TOURNEY_PRIZES[i];
        m.stats.trophies.push(TOURNEY_TROPHIES[i]);
        this.notify([id], null, { title: `${TOURNEY_TROPHIES[i]} You placed #${i + 1} in the ${label} ${t.name} tournament!`, body: `+${TOURNEY_PRIZES[i]} Pop Bucks`, tag: "tourney", url: "./#games" });
        return `${TOURNEY_TROPHIES[i]} ${m.piece} ${m.name} (${sc}) +${TOURNEY_PRIZES[i]}`;
      });
      this.post(`\u{1F3C6} The ${label} ${t.icon} ${t.name} tournament is over! ${lines.join(" \xB7 ")}`);
      this.d.meta.lastTourney = { name: t.name, icon: t.icon, month: label, top: top.map(([id, sc]) => ({ id, sc })) };
    }
    const [mo] = centralToday(), g = TOURNEYS[mo % TOURNEYS.length];
    this.d.meta.tourney = { key, ...g, scores: {} };
    if (t) {
      this.post(`\u{1F3C1} A new tournament starts today: ${g.icon} ${g.name}! ${g.rule} wins 500 Pop Bucks and a \u{1F3C6}. Play it in Games.`);
      this.notify(null, null, { title: `\u{1F3C1} This month's tournament: ${g.name}`, body: "Top 3 win Pop Bucks and trophies", tag: "tourney", url: "./#games" });
    }
    await this.save("meta", "members", "feed");
    this.broadcast("feed", null);
    this.broadcast("tourney", null);
    return this.d.meta.tourney;
  }
  tourneyView() {
    const t = this.d.meta.tourney;
    if (!t) return null;
    const [mo, , yr] = centralToday(), daysLeft = new Date(Date.UTC(yr, mo, 0)).getUTCDate() - centralToday()[1];
    return {
      name: t.name,
      icon: t.icon,
      game: t.game,
      rule: t.rule,
      daysLeft,
      prizes: TOURNEY_PRIZES,
      board: Object.entries(t.scores).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, sc]) => ({ id, sc })),
      last: this.d.meta.lastTourney || null
    };
  }
  async remembering() {
    const [mo, da, yr] = centralToday(), done = this.d.meta.remembered || (this.d.meta.remembered = {});
    let any = false;
    const say = /* @__PURE__ */ __name((k, text, e) => {
      if (done[k]) return;
      done[k] = 1;
      any = true;
      this.d.feed.push({ id: rid(10), from: "system", kind: "remember", about: e ? e.id : null, photo: e && e.photo || null, text, ts: Date.now(), likes: [], comments: [] });
      this.notify(null, null, { title: "\u{1F56F}\uFE0F Today we remember", body: text.replace(/^🕯️ /, "").slice(0, 120), tag: "remember", url: "./#home" });
    }, "say");
    for (const e of this.d.tree) {
      if (!e.died) continue;
      const dd = parseBday(e.died), bd = parseBday(e.born), yrOf = /* @__PURE__ */ __name((s) => (String(s).match(/(1[89]\d\d|20\d\d)/) || [])[1], "yrOf");
      if (dd && dd[0] === mo && dd[1] === da) {
        const y = yrOf(e.died);
        say(`d:${e.id}:${yr}`, `\u{1F56F}\uFE0F Today we remember ${e.name}${e.relation ? ", " + e.relation : ""}, who went home ${y ? yr - y + " years ago today" : "on this day"}.${e.story ? ' "' + e.story + '"' : ""} Share a memory of them below.`, e);
      }
      if (bd && bd[0] === mo && bd[1] === da) {
        const y = yrOf(e.born);
        say(`b:${e.id}:${yr}`, `\u{1F56F}\uFE0F ${e.name} was born on this day${y ? " in " + y + " (" + (yr - y) + " years ago)" : ""}. ${e.relation ? e.relation + ". " : ""}${e.story ? '"' + e.story + '" ' : ""}Share a memory of them below.`, e);
      }
    }
    const lastMon = (() => {
      const d = new Date(Date.UTC(yr, 5, 0));
      while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() - 1);
      return d.getUTCDate();
    })();
    if (mo === 5 && da === lastMon) {
      const gone = this.d.tree.filter((e) => e.died);
      if (gone.length) say(`memorial:${yr}`, `\u{1F56F}\uFE0F Family Remembering Day. Today we remember ${gone.map((e) => e.name).join(", ")}. Share a story, a photo, or something they used to say.`, null);
    }
    if (any) {
      await this.save("meta", "feed");
      this.broadcast("feed", null);
    }
  }
  async recap() {
    const wk = this.weekKey();
    if (this.d.meta.recapWeek === wk) return;
    this.d.meta.recapWeek = wk;
    const since = Date.now() - 7 * 864e5, d = this.d, mine = /* @__PURE__ */ __name((x) => x.ts > since, "mine"), n = /* @__PURE__ */ __name((k, a) => a.length ? `${a.length} ${k}${a.length === 1 ? "" : "s"}` : "", "n");
    const posts = d.feed.filter((p) => mine(p) && p.from !== "system"), photos = posts.reduce((a, p) => a + (p.photos ? p.photos.length : p.photo ? 1 : 0), 0);
    const msgs = d.chat.filter(mine), wins = d.feed.filter((p) => mine(p) && p.from === "system" && /^🏆 .* won Family Pop/.test(p.text));
    const act = {};
    for (const x of posts.concat(msgs)) act[x.from] = (act[x.from] || 0) + 1;
    const top = Object.entries(act).sort((a, b) => b[1] - a[1])[0], tm = top && d.members[top[0]];
    const lines = [
      posts.length && `\u{1F4F8} ${n("post", posts)}${photos ? ` and ${photos} picture${photos === 1 ? "" : "s"}` : ""}`,
      msgs.length && `\u{1F4AC} ${n("message", msgs)}`,
      wins.length && `\u{1F3B2} ${n("board game", wins)} played. ${wins.map((w) => w.text.match(/^🏆 (.*?) won/)[1]).join(", ")} won`,
      d.hands.filter((h) => h.status === "done" && h.doneTs > since).length && `\u{1F91D} ${d.hands.filter((h) => h.status === "done" && h.doneTs > since).length} helping hand(s) given`,
      d.prayers.filter((p) => p.answered && p.answeredTs > since).length && `\u{1F64C} ${d.prayers.filter((p) => p.answered && p.answeredTs > since).length} prayer(s) answered`,
      d.stories.list.filter(mine).length && `\u{1F399}\uFE0F A new Ask ${d.meta.momName || SN_DEFAULT} story`,
      d.recipes.filter(mine).length && `\u{1F372} ${n("new recipe", d.recipes.filter(mine))}`,
      tm && `\u2B50 Most active: ${tm.piece} ${tm.name}`,
      d.meta.tourney && Object.keys(d.meta.tourney.scores).length && (() => {
        const [id] = Object.entries(d.meta.tourney.scores).sort((a, b) => b[1] - a[1])[0];
        const m = d.members[id];
        return m ? `\u{1F3C6} Leading the ${d.meta.tourney.name} tournament: ${m.piece} ${m.name}` : "";
      })()
    ].filter(Boolean);
    if (!lines.length) return this.save("meta");
    d.feed.push({ id: rid(10), from: "system", kind: "recap", text: "\u{1F5DE}\uFE0F This week in our family\n" + lines.join("\n"), ts: Date.now(), likes: [], comments: [] });
    await this.save("meta", "feed");
    this.broadcast("feed", null);
    this.notify(null, null, { title: "\u{1F5DE}\uFE0F This week in our family", body: lines.slice(0, 3).join(" \xB7 "), tag: "recap", url: "./#home" });
  }
  prune() {
    const gs = Object.values(this.d.games).sort((a, b) => b.updated - a.updated);
    for (const g of gs.slice(30)) delete this.d.games[g.id];
  }
  post(text) {
    this.d.feed.push({ id: rid(10), from: "system", text, ts: Date.now(), likes: [], comments: [] });
  }
  async webSocketMessage(ws, msg) {
    if (msg === "ping") ws.send("pong");
  }
  async webSocketClose(ws) {
    try {
      ws.close();
    } catch (e) {
    }
  }
};
function CATS(c) {
  return ["Way Back When", "Favorites", "Who's in the Picture?", "Then & Now"].includes(c) ? c : "Way Back When";
}
__name(CATS, "CATS");
function fbLink(u) {
  u = String(u || "").trim();
  if (!u) return "";
  if (!/^https?:\/\//.test(u)) u = "https://" + u;
  try {
    const h = new URL(u).hostname.replace(/^www\.|^m\./, "");
    return ["facebook.com", "fb.com"].includes(h) ? u : "";
  } catch (e) {
    return "";
  }
}
__name(fbLink, "fbLink");
function seeded(str) {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ h >>> 15, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
__name(seeded, "seeded");
var FOODS = ["Fried chicken", "Spaghetti", "Pizza", "Tacos", "Meatloaf", "Chicken and dumplings", "Cheeseburgers", "Catfish", "Pot roast", "Enchiladas"];
var TOWNS = ["Hot Springs", "Little Rock", "Malvern", "Arkadelphia", "Benton", "Mena", "Texarkana", "Hope"];
function makeDaily(d, date) {
  const r = seeded(date + (d.meta.fid || ""));
  const pick = /* @__PURE__ */ __name((a) => a[Math.floor(r() * a.length)], "pick");
  const mix = /* @__PURE__ */ __name((a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, "mix");
  const ms = Object.values(d.members).filter((m) => m.status === "member"), names = ms.map((m) => m.name), qs = [];
  const key = /* @__PURE__ */ __name((x) => String(x).toLowerCase().split(",")[0].trim(), "key");
  const opts = /* @__PURE__ */ __name((a, pool) => {
    const seen = /* @__PURE__ */ new Set([key(a)]);
    return mix([a].concat(mix(pool.filter((x) => {
      if (!x) return false;
      const k = key(x);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })).slice(0, 3)));
  }, "opts");
  for (const m of ms) {
    if (m.food) qs.push({ cat: "Favorites", about: m.id, q: `What's ${m.name}'s favorite food?`, a: m.food, opts: opts(m.food, ms.map((x) => x.food).concat(FOODS)) });
    if (m.nick && names.length > 1) qs.push({ cat: "Way Back When", about: m.id, q: `Who goes by "${m.nick}"?`, a: m.name, opts: opts(m.name, names) });
    if (m.secret && names.length > 1) qs.push({ cat: "Way Back When", about: m.id, q: `Whose secret is this? "${m.secret}"`, a: m.name, opts: opts(m.name, names) });
  }
  const tn = d.tree.map((t) => t.name), mom = ms.find((m) => m.mom);
  for (const t of d.tree) {
    if (!["Other family", "Mom's ancestor"].includes(t.relation)) {
      const same = new Set(d.tree.filter((x) => x.relation === t.relation).map((x) => x.name));
      if (tn.length - same.size >= 1 && !(same.size > 1 && !t.born)) qs.push({ cat: "Way Back When", q: `Who was ${t.relation.replace("Mom's", (d.meta.momName || SN_DEFAULT) + "'s")}${same.size > 1 && t.born ? ", born " + t.born : ""}?`, a: t.name, opts: opts(t.name, tn.filter((n) => !same.has(n))) });
    }
    if (t.place) qs.push({ cat: "Way Back When", q: `Where was ${t.name} born?`, a: t.place, opts: opts(t.place, d.tree.map((x) => x.place).concat(TOWNS)) });
  }
  for (const e of d.book) if (!e.photo) qs.push({ cat: e.cat, q: e.q, a: e.a, opts: opts(e.a, (e.wrong || []).concat(names)) });
  const good = qs.filter((q) => q.opts.length >= 2);
  return good.length ? pick(good) : null;
}
__name(makeDaily, "makeDaily");

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-YfMwcS/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-YfMwcS/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  Directory,
  Family,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map

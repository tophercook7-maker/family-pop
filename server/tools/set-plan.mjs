#!/usr/bin/env node
// Turn Family Pop Plus on or off for one family. Sets plan fields only; it can't read anything in the family.
//
//   FP_ADMIN_SECRET=... node tools/set-plan.mjs <fid> plus [until]     paid: 1 year from today (or from the current end date), or until a date
//   FP_ADMIN_SECRET=... node tools/set-plan.mjs <fid> free              trial/paid time ends now (data stays, Plus features lock)
//   FP_ADMIN_SECRET=... node tools/set-plan.mjs <fid> trial [until]     restart a 30-day trial (or until a date)
//   FP_ADMIN_SECRET=... node tools/set-plan.mjs <fid> forever           everything on, never billed (Topher's own family)
//
// The fid is the part of an invite link before the dot: ...?join=<fid>.<code>  (Stripe shows it as "client_reference_id").
// Dates look like 2027-10-22.
const API = process.env.FP_API || "https://family-pop.henryai.workers.dev";
const FOREVER = "wvjtreqeabwc"; // Topher's family
const [fid, plan, until, flag] = process.argv.slice(2);
const secret = process.env.FP_ADMIN_SECRET || "";
const die = (m) => { console.error(m); process.exit(1); };
if (!fid || !plan) die("Usage: node tools/set-plan.mjs <fid> <plus|free|trial|forever> [until YYYY-MM-DD]");
if (!["plus", "free", "trial", "forever"].includes(plan)) die("plan must be plus, free, trial or forever");
if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until) && until !== "--force") die("until must look like 2027-10-22");
if (secret.length < 32) die("Set FP_ADMIN_SECRET first (the same value you gave `npx wrangler secret put ADMIN_PLAN_SECRET`).");
if (fid === FOREVER && plan !== "forever" && until !== "--force" && flag !== "--force") die(`${FOREVER} is Topher's own family and stays "forever". Add --force if you really mean it.`);
const r = await fetch(`${API}/api/admin/plan`, {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
  body: JSON.stringify({ fid, plan, until: until && until !== "--force" ? until : undefined }),
});
const body = await r.json().catch(() => ({}));
if (!r.ok) die(`Failed (${r.status}): ${body.error || "no answer"}${r.status === 404 && !body.error?.includes("family") ? " — wrong secret, secret not set on the server, or no such family" : ""}`);
console.log(`${body.fid}: plan=${body.plan} → ${body.tier === "plus" ? "Plus is ON" : "free (Plus features locked, data kept)"}${body.until ? ` until ${body.until.slice(0, 10)}` : ""}`);

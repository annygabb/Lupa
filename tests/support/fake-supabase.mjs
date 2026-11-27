// SIMULADOR DE TESTE do Supabase (NÃO é o Supabase real e NUNCA deve ir para produção).
//
// Emula apenas o subconjunto de PostgREST e GoTrue que o LUPA usa, sobre um Postgres
// REAL com as migrações do repositório aplicadas. Serve para testar ponta a ponta
// interface → API Next.js → "Supabase" → Postgres, incluindo RLS/GRANTs (as consultas
// rodam com o papel service_role, como no Supabase), constraints, RPCs e triggers.
//
// Uso: LUPA_PG_TEST_URL=postgres://... node tests/support/fake-supabase.mjs
// Variáveis: FAKE_SUPABASE_PORT (54443), FAKE_SUPABASE_TLS_CERT/KEY (HTTPS opcional),
//            FAKE_SUPABASE_SERVICE_KEY, FAKE_SUPABASE_PUBLISHABLE_KEY.
import { createServer as createHttp } from "node:http";
import { createServer as createHttps } from "node:https";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";

const PORT = Number(process.env.FAKE_SUPABASE_PORT || 54443);
const SERVICE_KEY = process.env.FAKE_SUPABASE_SERVICE_KEY || "sb_secret_fake_for_tests_only";
const PUBLISHABLE_KEY = process.env.FAKE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_fake_for_tests_only";
const pool = new pg.Pool({ connectionString: process.env.LUPA_PG_TEST_URL, max: 8 });

const IDENT = /^[a-z_][a-z0-9_]*$/;
const TABLES = new Set([
  "lupa_live_events", "lupa_live_votes", "lupa_live_rate_limits", "lupa_organizations",
  "lupa_organization_members", "lupa_event_feedback", "lupa_live_audit", "lupa_rate_limits",
]);
const RPCS = new Set([
  "lupa_event_snapshot", "lupa_cast_vote", "lupa_feedback_summary", "lupa_cleanup_expired_records",
  "lupa_consume_limit", "lupa_session_state",
]);

// ---------- GoTrue (Auth) em memória, ligado a auth.users ----------
const users = new Map();      // email -> { id, password }
const accessTokens = new Map(); // token -> userId
const refreshTokens = new Map(); // token -> userId
export const stats = { tokenRequests: 0 };

function json(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : null;
}

function issueTokens(userId) {
  const access = randomBytes(24).toString("hex");
  const refresh = randomBytes(24).toString("hex");
  accessTokens.set(access, userId);
  refreshTokens.set(refresh, userId);
  return { access_token: access, refresh_token: refresh, expires_in: 3600, token_type: "bearer" };
}

async function handleAuth(req, res, path, url) {
  if (req.headers.apikey !== PUBLISHABLE_KEY) return json(res, 401, { msg: "invalid apikey" });
  const bearer = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (path === "token" && req.method === "POST") {
    stats.tokenRequests++;
    const body = await readBody(req);
    const grant = url.searchParams.get("grant_type");
    if (grant === "password") {
      const user = users.get(String(body?.email || "").toLowerCase());
      if (!user || user.password !== body?.password) return json(res, 400, { error: "invalid_grant" });
      return json(res, 200, issueTokens(user.id));
    }
    if (grant === "refresh_token") {
      const userId = refreshTokens.get(body?.refresh_token);
      if (!userId) return json(res, 400, { error: "invalid_grant" });
      refreshTokens.delete(body.refresh_token); // rotação
      return json(res, 200, issueTokens(userId));
    }
    return json(res, 400, { error: "unsupported_grant_type" });
  }
  if (path === "user" && req.method === "GET") {
    const userId = accessTokens.get(bearer);
    if (!userId) return json(res, 401, { msg: "invalid token" });
    const email = [...users.entries()].find(([, u]) => u.id === userId)?.[0] ?? null;
    return json(res, 200, { id: userId, email });
  }
  if (path === "user" && req.method === "PUT") {
    const userId = accessTokens.get(bearer);
    if (!userId) return json(res, 401, { msg: "invalid token" });
    const body = await readBody(req);
    for (const u of users.values()) if (u.id === userId) u.password = body?.password;
    return json(res, 200, { id: userId });
  }
  if (path === "logout" && req.method === "POST") {
    const userId = accessTokens.get(bearer);
    accessTokens.delete(bearer);
    for (const [token, id] of refreshTokens) if (id === userId) refreshTokens.delete(token);
    res.writeHead(204); return res.end();
  }
  if (path === "recover" && req.method === "POST") return json(res, 200, {});
  return json(res, 404, { msg: "not found" });
}

// ---------- PostgREST (subconjunto) ----------
function literal(value) {
  if (value !== null && typeof value === "object") return JSON.stringify(value);
  return value;
}

function parseFilters(url, params) {
  const where = [];
  for (const [key, raw] of url.searchParams) {
    if (["select", "order", "limit", "on_conflict"].includes(key)) continue;
    if (!IDENT.test(key)) throw Object.assign(new Error("bad column"), { status: 400 });
    const m = /^(eq|gt|lt|gte|lte|in)\.(.*)$/s.exec(raw);
    if (!m) throw Object.assign(new Error("bad filter"), { status: 400 });
    const [, op, value] = m;
    if (op === "in") {
      const items = value.replace(/^\(|\)$/g, "").split(",").filter(Boolean);
      if (!items.length) { where.push("false"); continue; }
      const placeholders = items.map(item => { params.push(item); return "$" + params.length; });
      where.push(`"${key}" in (${placeholders.join(",")})`);
    } else {
      params.push(value);
      const sqlOp = { eq: "=", gt: ">", lt: "<", gte: ">=", lte: "<=" }[op];
      where.push(`"${key}" ${sqlOp} $${params.length}`);
    }
  }
  return where.length ? " where " + where.join(" and ") : "";
}

function selectList(url) {
  const select = url.searchParams.get("select");
  if (!select || select === "*") return "*";
  const cols = select.split(",");
  if (!cols.every(c => IDENT.test(c))) throw Object.assign(new Error("bad select"), { status: 400 });
  return cols.map(c => `"${c}"`).join(",");
}

async function asServiceRole(fn) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("set local role service_role");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function handleRest(req, res, path, url) {
  // Como no Supabase: chave de serviço obrigatória; nada é acessível com a chave pública.
  if (req.headers.apikey !== SERVICE_KEY) return json(res, 401, { message: "Invalid API key" });
  const prefer = String(req.headers.prefer || "");
  if (path.startsWith("rpc/")) {
    const fn = path.slice(4);
    if (!RPCS.has(fn)) return json(res, 404, { message: "function not found" });
    const body = (await readBody(req)) || {};
    const keys = Object.keys(body);
    if (!keys.every(k => IDENT.test(k))) return json(res, 400, { message: "bad arg" });
    const args = keys.map((k, i) => `${k} => $${i + 1}`).join(", ");
    const rows = await asServiceRole(c => c.query(`select to_jsonb(public.${fn}(${args})) as r`, keys.map(k => literal(body[k]))));
    return json(res, 200, rows.rows[0]?.r ?? null);
  }
  if (!TABLES.has(path)) return json(res, 404, { message: "relation not found" });
  const params = [];
  if (req.method === "GET") {
    const where = parseFilters(url, params);
    const order = url.searchParams.get("order");
    let orderSql = "";
    if (order) {
      const [col, dir] = order.split(".");
      if (!IDENT.test(col)) return json(res, 400, { message: "bad order" });
      orderSql = ` order by "${col}" ${dir === "desc" ? "desc" : "asc"}`;
    }
    const limit = Number(url.searchParams.get("limit") ?? 1000);
    const rows = await asServiceRole(c => c.query(`select ${selectList(url)} from public.${path}${where}${orderSql} limit ${Math.max(0, Math.min(limit, 1000))}`, params));
    return json(res, 200, rows.rows);
  }
  const representation = prefer.includes("return=representation");
  if (req.method === "POST") {
    const body = await readBody(req);
    const records = Array.isArray(body) ? body : [body];
    const cols = Object.keys(records[0] || {});
    if (!cols.every(c => IDENT.test(c))) return json(res, 400, { message: "bad column" });
    const values = records.map(r => "(" + cols.map(col => { params.push(literal(r[col])); return "$" + params.length; }).join(",") + ")");
    let conflict = "";
    const onConflict = url.searchParams.get("on_conflict");
    if (onConflict && prefer.includes("resolution=ignore-duplicates")) {
      if (!onConflict.split(",").every(c => IDENT.test(c))) return json(res, 400, { message: "bad conflict" });
      conflict = ` on conflict (${onConflict}) do nothing`;
    }
    const returning = representation ? " returning " + selectList(url) : "";
    const rows = await asServiceRole(c => c.query(`insert into public.${path} (${cols.map(c => `"${c}"`).join(",")}) values ${values.join(",")}${conflict}${returning}`, params));
    return representation ? json(res, 201, rows.rows) : json(res, 201, undefined);
  }
  if (req.method === "PATCH") {
    const body = await readBody(req);
    const cols = Object.keys(body || {});
    if (!cols.length || !cols.every(c => IDENT.test(c))) return json(res, 400, { message: "bad column" });
    const sets = cols.map(col => { params.push(literal(body[col])); return `"${col}" = $${params.length}`; });
    const where = parseFilters(url, params);
    const returning = representation ? " returning " + selectList(url) : "";
    const rows = await asServiceRole(c => c.query(`update public.${path} set ${sets.join(",")}${where}${returning}`, params));
    return representation ? json(res, 200, rows.rows) : json(res, 204, undefined);
  }
  if (req.method === "DELETE") {
    const where = parseFilters(url, params);
    if (!where) return json(res, 400, { message: "DELETE requires a filter" });
    const returning = representation ? " returning " + selectList(url) : "";
    const rows = await asServiceRole(c => c.query(`delete from public.${path}${where}${returning}`, params));
    return representation ? json(res, 200, rows.rows) : json(res, 204, undefined);
  }
  return json(res, 405, { message: "method not allowed" });
}

// ---------- Rotas de apoio ao teste (semeadura) ----------
async function handleTestAdmin(req, res, path) {
  if (req.headers["x-test-admin"] !== SERVICE_KEY) return json(res, 401, {});
  const body = await readBody(req);
  if (path === "user") {
    const id = (await pool.query("insert into auth.users(id) values (gen_random_uuid()) returning id")).rows[0].id;
    users.set(String(body.email).toLowerCase(), { id, password: body.password });
    return json(res, 201, { id });
  }
  if (path === "organization") {
    const org = await pool.query("insert into public.lupa_organizations(name, slug) values ($1, $2) returning id", [body.name, body.slug]);
    for (const m of body.members || [])
      await pool.query("insert into public.lupa_organization_members(organization_id, user_id, role) values ($1, $2, $3)", [org.rows[0].id, m.userId, m.role]);
    return json(res, 201, { id: org.rows[0].id });
  }
  if (path === "sql-count") {
    const allowed = { votes: "lupa_live_votes", events: "lupa_live_events", feedback: "lupa_event_feedback", audit: "lupa_live_audit" };
    const table = allowed[body.table];
    if (!table) return json(res, 400, {});
    return json(res, 200, { count: Number((await pool.query(`select count(*) from public.${table}`)).rows[0].count) });
  }
  if (path === "stats") return json(res, 200, stats);
  return json(res, 404, {});
}

async function handler(req, res) {
  const url = new URL(req.url, "http://fake");
  try {
    if (url.pathname === "/health") return json(res, 200, { ok: true });
    if (url.pathname.startsWith("/auth/v1/")) return await handleAuth(req, res, url.pathname.slice(9), url);
    if (url.pathname.startsWith("/rest/v1/")) return await handleRest(req, res, url.pathname.slice(9), url);
    if (url.pathname.startsWith("/__test/")) return await handleTestAdmin(req, res, url.pathname.slice(8));
    return json(res, 404, { message: "not found" });
  } catch (error) {
    const code = error?.code;
    const status = error?.status ?? (code === "23505" ? 409 : code === "42501" ? 403 : code?.startsWith?.("22") || code?.startsWith?.("23") ? 400 : 500);
    return json(res, status, { code, message: String(error?.message || error).slice(0, 300) });
  }
}

const tls = process.env.FAKE_SUPABASE_TLS_CERT && process.env.FAKE_SUPABASE_TLS_KEY
  ? { cert: readFileSync(process.env.FAKE_SUPABASE_TLS_CERT), key: readFileSync(process.env.FAKE_SUPABASE_TLS_KEY) }
  : null;
const server = tls ? createHttps(tls, handler) : createHttp(handler);
server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`fake-supabase ouvindo em ${tls ? "https" : "http"}://127.0.0.1:${PORT}\n`);
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { server.close(); pool.end().finally(() => process.exit(0)); });

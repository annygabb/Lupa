/**
 * Armazenamento do LUPA Live.
 *
 * - Produção: Supabase Postgres via PostgREST/RPC com chave de serviço SOMENTE no servidor.
 * - Desenvolvimento/testes: motor local em memória, habilitado apenas fora de produção
 *   (NODE_ENV=test ou LUPA_LIVE_ALLOW_LOCAL_DEMO=true). Em produção sem banco, todas as
 *   operações falham com LiveDatabaseUnavailable (a API responde 503 LIVE_UNCONFIGURED);
 *   nunca simulamos persistência em produção.
 *
 * O motor local reproduz as MESMAS regras do banco (fases, expiração, voto único por
 * sessão e rodada, limite de taxa, feedback só após encerramento, supressão < 5).
 */

const url = () => (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.LUPA_SUPABASE_URL)?.replace(/\/+$/, "");
const secret = () => process.env.SUPABASE_SECRET_KEY || process.env.LUPA_SUPABASE_SERVICE_ROLE_KEY;

export class LiveDatabaseUnavailable extends Error {
  constructor() {
    super("Banco do LUPA Live não configurado.");
    this.name = "LiveDatabaseUnavailable";
  }
}

export class LiveDatabaseError extends Error {
  constructor(public readonly status: number) {
    super("Falha no acesso ao banco remoto (HTTP " + status + ").");
    this.name = "LiveDatabaseError";
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url() && secret());
}

export function allowLocalDemo(): boolean {
  return process.env.NODE_ENV === "test" ||
    (process.env.NODE_ENV !== "production" && process.env.LUPA_LIVE_ALLOW_LOCAL_DEMO === "true");
}

/** Modo efetivo: banco real, motor local de desenvolvimento ou indisponível. */
export function liveMode(): "supabase" | "local-demo" | "unconfigured" {
  if (isSupabaseConfigured() && process.env.LUPA_LIVE_SIGNING_SECRET &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return "supabase";
  if (!isSupabaseConfigured() && allowLocalDemo()) return "local-demo";
  return "unconfigured";
}

export function liveDatabaseEnabled(): boolean {
  if (!process.env.LUPA_LIVE_SIGNING_SECRET || process.env.LUPA_LIVE_SIGNING_SECRET.length < 32) return false;
  return liveMode() !== "unconfigured";
}

export function liveDatabaseMode(): "supabase" | "local-resilient" {
  return isSupabaseConfigured() ? "supabase" : "local-resilient";
}

export type LivePhase = "pre" | "reveal" | "post" | "closed";

export interface LiveCount {
  phase: "pre" | "post";
  optionIndex: number;
  count: number;
}

export interface LiveSnapshot {
  code: string;
  claimId: string;
  title: string;
  question: string;
  choices: string[];
  phase: LivePhase;
  expiresAt: string;
  counts: LiveCount[];
  correctIndex?: number;
  postQuestion?: {
    question: string;
    choices: string[];
    correctIndex?: number;
    explanation?: string;
  };
  /** Estado da própria sessão do participante (sem revelar a alternativa escolhida). */
  viewer?: SessionState;
}

export interface SessionState {
  votedPre: boolean;
  votedPost: boolean;
  feedbackSent: boolean;
}

export interface FeedbackSummary {
  total: number;
  suppressed: boolean;
  averageClarity: number | null;
  averageUsefulness: number | null;
}

// -------------------------------------------------------------
// MOTOR LOCAL (somente desenvolvimento, testes e demonstração local)
// -------------------------------------------------------------

interface PostQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface LocalStoredEvent {
  id: string;
  code: string;
  claimId: string;
  title: string;
  question: string;
  choices: string[];
  correctIndex: number;
  phase: LivePhase;
  createdAt: string;
  expiresAt: string;
  organizationId?: string;
  postQuestion?: PostQuestion;
}

interface LocalStoredVote {
  code: string;
  phase: "pre" | "post";
  optionIndex: number;
  sessionHash: string;
  createdAt: string;
}

interface LocalStoredFeedback {
  code: string;
  sessionHash: string;
  clarity: number;
  usefulness: number;
  createdAt: string;
}

interface LocalRateLimit {
  count: number;
  resetAt: number;
}

export interface LocalAuditEntry {
  organizationId: string;
  eventCode: string;
  actorId: string;
  action: "event_created" | "phase_advanced" | "event_deleted";
  createdAt: string;
}

declare global {
  var __LUPA_LOCAL_LIVE_EVENTS__: Map<string, LocalStoredEvent> | undefined;
  var __LUPA_LOCAL_LIVE_VOTES__: LocalStoredVote[] | undefined;
  var __LUPA_LOCAL_LIVE_FEEDBACK__: LocalStoredFeedback[] | undefined;
  var __LUPA_LOCAL_LIVE_RATE_LIMITS__: Map<string, LocalRateLimit> | undefined;
  var __LUPA_LOCAL_LIVE_AUDITS__: LocalAuditEntry[] | undefined;
}

const localEvents = (globalThis.__LUPA_LOCAL_LIVE_EVENTS__ ??= new Map());
const localVotes = (globalThis.__LUPA_LOCAL_LIVE_VOTES__ ??= []);
const localFeedback = (globalThis.__LUPA_LOCAL_LIVE_FEEDBACK__ ??= []);
const localRateLimits = (globalThis.__LUPA_LOCAL_LIVE_RATE_LIMITS__ ??= new Map());
const localAudits = (globalThis.__LUPA_LOCAL_LIVE_AUDITS__ ??= []);

export const LOCAL_DEMO_CODE = "CAFE2026BEEF";

/** Evento de demonstração LOCAL (nunca existe em produção). */
export function seedLocalDemoEvent() {
  localEvents.set(LOCAL_DEMO_CODE, {
    id: "demo-uuid-0001",
    code: LOCAL_DEMO_CODE,
    claimId: "massa-magra-nao-equivale-a-musculos",
    title: "Sessão Demonstrativa LUPA Live",
    question:
      "Um estudo relata que ~25% do peso perdido correspondeu à massa magra. Qual é a interpretação correta?",
    choices: [
      "Perderam 25% de todos os músculos do corpo.",
      "Não. Massa magra não é sinônimo de músculo funcional.",
      "Sim, isso sempre comprova sarcopenia.",
    ],
    correctIndex: 1,
    phase: "pre",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    postQuestion: {
      question:
        "Uma pessoa perde 8 kg hipotéticos e uma partição ilustrativa de 25% da perda é massa magra. Quanto se classifica como massa magra nessa ilustração?",
      choices: [
        "8 kg inteiros.",
        "2,0 kg do peso perdido (não é perda de 25% de todos os seus músculos).",
        "25% de toda a massa muscular do corpo.",
      ],
      correctIndex: 1,
      explanation:
        "25% da perda hipotética (8 kg × 0,25 = 2 kg). A fração se aplica ao peso perdido, não ao estoque de músculos.",
    },
  });
}

if (allowLocalDemo() && localEvents.size === 0) seedLocalDemoEvent();

/** Somente testes: zera o motor local. */
export function resetLocalLiveStore() {
  localEvents.clear();
  localVotes.length = 0;
  localFeedback.length = 0;
  localRateLimits.clear();
  localAudits.length = 0;
}

function localEffectivePhase(evt: LocalStoredEvent): LivePhase {
  return Date.parse(evt.expiresAt) <= Date.now() ? "closed" : evt.phase;
}

function requireLocal() {
  if (!allowLocalDemo()) throw new LiveDatabaseUnavailable();
}

// -------------------------------------------------------------
// ACESSO REMOTO (Supabase PostgREST)
// -------------------------------------------------------------

export async function liveDb<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = url();
  const key = secret();

  if (!base || !key) {
    throw new LiveDatabaseUnavailable();
  }

  const res = await fetch(base + "/rest/v1/" + path, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      ...(key.startsWith("sb_secret_") ? {} : { Authorization: "Bearer " + key }),
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) throw new LiveDatabaseError(res.status);
  if (res.status === 204) return null as T;
  const raw = await res.text();
  return raw ? JSON.parse(raw) as T : null as T;
}

// -------------------------------------------------------------
// OPERAÇÕES (Supabase ou motor local)
// -------------------------------------------------------------

export async function createLiveEvent(event: {
  code: string;
  claimId: string;
  title: string;
  question: string;
  choices: string[];
  correctIndex?: number;
  organizationId?: string;
  createdBy?: string;
  postQuestion?: PostQuestion;
}): Promise<{ code: string }> {
  if (isSupabaseConfigured()) {
    await liveDb("lupa_live_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        code: event.code,
        claim_id: event.claimId,
        title: event.title,
        question: event.question,
        choices: event.choices,
        correct_index: event.correctIndex ?? 1,
        post_question: event.postQuestion ?? null,
        ...(event.organizationId ? { organization_id: event.organizationId } : {}),
        ...(event.createdBy ? { created_by: event.createdBy } : {}),
      }),
    });
    return { code: event.code };
  }
  requireLocal();
  localEvents.set(event.code, {
    id: "evt-" + Math.random().toString(36).slice(2, 10),
    code: event.code,
    claimId: event.claimId,
    title: event.title,
    question: event.question,
    choices: event.choices,
    correctIndex: event.correctIndex ?? 1,
    phase: "pre",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    organizationId: event.organizationId,
    postQuestion: event.postQuestion,
  });
  return { code: event.code };
}

/**
 * Snapshot "bruto" do evento. NÃO é a resposta pública: a rota pública remove
 * contagens enquanto a rodada está aberta; o painel autorizado usa adminSnapshot().
 * A RPC do banco já omite gabaritos antes da revelação.
 */
export async function eventSnapshot(code: string): Promise<LiveSnapshot | null> {
  const normCode = code.toUpperCase();

  if (isSupabaseConfigured()) {
    return await liveDb<LiveSnapshot | null>("rpc/lupa_event_snapshot", {
      method: "POST",
      body: JSON.stringify({ p_code: normCode }),
    });
  }
  requireLocal();

  const evt = localEvents.get(normCode);
  if (!evt) return null;
  const phase = localEffectivePhase(evt);

  const countsMap = new Map<string, number>();
  for (const v of localVotes) {
    if (v.code === normCode) {
      const k = `${v.phase}:${v.optionIndex}`;
      countsMap.set(k, (countsMap.get(k) || 0) + 1);
    }
  }
  const counts: LiveCount[] = [];
  for (const [k, count] of countsMap) {
    const [p, i] = k.split(":");
    counts.push({ phase: p as "pre" | "post", optionIndex: Number(i), count });
  }

  // Mesma regra da RPC lupa_event_snapshot: gabarito só após o início da revelação.
  return {
    code: evt.code,
    claimId: evt.claimId,
    title: evt.title,
    question: evt.question,
    choices: evt.choices,
    phase,
    expiresAt: evt.expiresAt,
    counts,
    correctIndex: evt.phase === "pre" ? undefined : evt.correctIndex,
    postQuestion: !evt.postQuestion ? undefined
      : phase === "closed" ? evt.postQuestion
      : phase === "post" ? { question: evt.postQuestion.question, choices: evt.postQuestion.choices }
      : undefined,
  };
}

/** Snapshot completo para organizador autorizado (inclui gabaritos e todas as contagens). */
export async function adminSnapshot(code: string): Promise<LiveSnapshot | null> {
  const normCode = code.toUpperCase();
  if (isSupabaseConfigured()) {
    const rows = await liveDb<Array<{ correct_index: number; post_question: LiveSnapshot["postQuestion"] }>>(
      "lupa_live_events?code=eq." + normCode + "&select=correct_index,post_question&limit=1"
    );
    if (!rows?.length) return null;
    const snapshot = await eventSnapshot(normCode);
    if (!snapshot) return null;
    return {
      ...snapshot,
      correctIndex: rows[0].correct_index,
      postQuestion: rows[0].post_question || snapshot.postQuestion,
    };
  }
  requireLocal();
  const evt = localEvents.get(normCode);
  const snapshot = await eventSnapshot(normCode);
  if (!evt || !snapshot) return null;
  return { ...snapshot, correctIndex: evt.correctIndex, postQuestion: evt.postQuestion };
}

export async function castVote(params: {
  code: string;
  phase: "pre" | "post";
  optionIndex: number;
  sessionHash: string;
}): Promise<{ accepted: boolean; reason?: string }> {
  const { code, phase, optionIndex, sessionHash } = params;
  const normCode = code.toUpperCase();

  if (isSupabaseConfigured()) {
    return await liveDb<{ accepted: boolean; reason?: string }>(
      "rpc/lupa_cast_vote", {
        method: "POST",
        body: JSON.stringify({
          p_code: normCode, p_phase: phase, p_option: optionIndex, p_session_hash: sessionHash,
        }),
      }
    );
  }
  requireLocal();

  const evt = localEvents.get(normCode);
  if (!evt) return { accepted: false, reason: "NOT_FOUND" };
  if (localEffectivePhase(evt) !== phase) return { accepted: false, reason: "PHASE_UNAVAILABLE" };

  // Mesmo limite da RPC: 8 tentativas por minuto por sessão.
  const limit = consumeLocalLimit(`vote-session:${normCode}`, sessionHash, 60, 8);
  if (!limit.allowed) return { accepted: false, reason: "RATE_LIMIT" };

  const already = localVotes.some(
    (v) => v.code === normCode && v.phase === phase && v.sessionHash === sessionHash
  );
  if (already) return { accepted: false, reason: "ALREADY_VOTED" };

  localVotes.push({ code: normCode, phase, optionIndex, sessionHash, createdAt: new Date().toISOString() });
  return { accepted: true, reason: "ACCEPTED" };
}

/** O que esta sessão já fez (para restaurar a interface após recarregar a página). */
export async function sessionState(code: string, sessionHash: string): Promise<SessionState> {
  const normCode = code.toUpperCase();
  if (isSupabaseConfigured()) {
    const state = await liveDb<SessionState | null>("rpc/lupa_session_state", {
      method: "POST",
      body: JSON.stringify({ p_code: normCode, p_session_hash: sessionHash }),
    });
    return state ?? { votedPre: false, votedPost: false, feedbackSent: false };
  }
  requireLocal();
  const mine = localVotes.filter(v => v.code === normCode && v.sessionHash === sessionHash);
  return {
    votedPre: mine.some(v => v.phase === "pre"),
    votedPost: mine.some(v => v.phase === "post"),
    feedbackSent: localFeedback.some(f => f.code === normCode && f.sessionHash === sessionHash),
  };
}

export async function advanceLivePhase(
  code: string,
  nextPhase: "reveal" | "post" | "closed"
): Promise<boolean> {
  const normCode = code.toUpperCase();
  const expectedPhase = nextPhase === "reveal" ? "pre" : nextPhase === "post" ? "reveal" : "post";

  if (isSupabaseConfigured()) {
    // Atualização condicional (compare-and-set): duas abas não avançam duas fases.
    const rows = await liveDb<Array<{ code: string }>>(
      `lupa_live_events?code=eq.${normCode}&phase=eq.${expectedPhase}` +
      `&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=code`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ phase: nextPhase }),
      }
    );
    return Array.isArray(rows) && rows.length === 1;
  }
  requireLocal();

  const evt = localEvents.get(normCode);
  if (!evt || localEffectivePhase(evt) !== expectedPhase) return false;
  evt.phase = nextPhase;
  return true;
}

export async function deleteLiveEvent(code: string): Promise<boolean> {
  const normCode = code.toUpperCase();

  if (isSupabaseConfigured()) {
    const rows = await liveDb<Array<{ code: string }>>(
      `lupa_live_events?code=eq.${normCode}&select=code`, {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      }
    );
    return Array.isArray(rows) && rows.length === 1;
  }
  requireLocal();

  const existed = localEvents.delete(normCode);
  for (let i = localVotes.length - 1; i >= 0; i--) {
    if (localVotes[i].code === normCode) localVotes.splice(i, 1);
  }
  for (let i = localFeedback.length - 1; i >= 0; i--) {
    if (localFeedback[i].code === normCode) localFeedback.splice(i, 1);
  }
  return existed;
}

export type FeedbackOutcome = "saved" | "already-sent" | "not-found" | "not-open";

/** Feedback educacional (1–5). Só aceito com a sessão encerrada e ainda não expirada. */
export async function submitFeedback(params: {
  code: string; sessionHash: string; clarity: number; usefulness: number;
}): Promise<FeedbackOutcome> {
  const normCode = params.code.toUpperCase();
  if (isSupabaseConfigured()) {
    const rows = await liveDb<Array<{ id: string; phase: string; expires_at: string }>>(
      "lupa_live_events?code=eq." + normCode + "&select=id,phase,expires_at&limit=1"
    );
    if (!rows?.length) return "not-found";
    if (rows[0].phase !== "closed" || Date.parse(rows[0].expires_at) <= Date.now()) return "not-open";
    // Inserção idempotente: a restrição unique(event_id, session_hash) decide em caso de corrida.
    const inserted = await liveDb<Array<{ id: number }>>(
      "lupa_event_feedback?on_conflict=event_id,session_hash&select=id", {
        method: "POST",
        headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
        body: JSON.stringify({
          event_id: rows[0].id, session_hash: params.sessionHash,
          clarity: params.clarity, usefulness: params.usefulness,
          purpose_version: "experience-feedback-v1",
        }),
      }
    );
    if (!Array.isArray(inserted)) throw new LiveDatabaseError(502);
    return inserted.length === 1 ? "saved" : "already-sent";
  }
  requireLocal();
  const evt = localEvents.get(normCode);
  if (!evt) return "not-found";
  if (evt.phase !== "closed" || Date.parse(evt.expiresAt) <= Date.now()) return "not-open";
  if (localFeedback.some(f => f.code === normCode && f.sessionHash === params.sessionHash)) return "already-sent";
  localFeedback.push({
    code: normCode, sessionHash: params.sessionHash,
    clarity: params.clarity, usefulness: params.usefulness, createdAt: new Date().toISOString(),
  });
  return "saved";
}

export async function feedbackSummary(code: string): Promise<FeedbackSummary> {
  const normCode = code.toUpperCase();
  if (isSupabaseConfigured()) {
    return await liveDb<FeedbackSummary>("rpc/lupa_feedback_summary", {
      method: "POST", body: JSON.stringify({ p_code: normCode }),
    });
  }
  requireLocal();
  const rows = localFeedback.filter(f => f.code === normCode);
  if (rows.length < 5) return { total: rows.length, suppressed: true, averageClarity: null, averageUsefulness: null };
  const avg = (values: number[]) => Math.round(100 * values.reduce((a, b) => a + b, 0) / values.length) / 100;
  return {
    total: rows.length, suppressed: false,
    averageClarity: avg(rows.map(r => r.clarity)),
    averageUsefulness: avg(rows.map(r => r.usefulness)),
  };
}

function consumeLocalLimit(scope: string, key: string, windowSeconds: number, max: number) {
  const now = Date.now();
  const id = scope + "|" + key;
  const entry = localRateLimits.get(id);
  if (!entry || now >= entry.resetAt) {
    localRateLimits.set(id, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: 1 <= max, retryAfter: 0 };
  }
  entry.count++;
  return {
    allowed: entry.count <= max,
    retryAfter: entry.count <= max ? 0 : Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Limite de taxa persistente (janela fixa). No Supabase usa a RPC lupa_consume_limit,
 * que funciona entre instâncias serverless; localmente usa memória.
 */
export async function consumeRateLimit(
  scope: string, keyHashValue: string, windowSeconds: number, max: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  if (isSupabaseConfigured()) {
    const result = await liveDb<{ allowed: boolean; retryAfter: number }>("rpc/lupa_consume_limit", {
      method: "POST",
      body: JSON.stringify({
        p_scope: scope, p_key_hash: keyHashValue, p_window_seconds: windowSeconds, p_max: max,
      }),
    });
    return { allowed: Boolean(result?.allowed), retryAfter: Number(result?.retryAfter ?? 0) };
  }
  requireLocal();
  return consumeLocalLimit(scope, keyHashValue, windowSeconds, max);
}

export async function recordAuditAction(params: {
  organizationId: string;
  eventCode: string;
  actorId: string;
  action: "event_created" | "phase_advanced" | "event_deleted";
}): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await liveDb("lupa_live_audit", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          organization_id: params.organizationId,
          event_code: params.eventCode,
          actor_id: params.actorId,
          action: params.action,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  if (allowLocalDemo()) {
    localAudits.push({ ...params, createdAt: new Date().toISOString() });
    return true;
  }
  return false;
}

export function getLocalAudits(): LocalAuditEntry[] {
  return [...localAudits];
}

export function cleanupExpiredLocalRecords(): { eventsDeleted: number; rateLimitsDeleted: number } {
  let eventsDeleted = 0;
  const now = Date.now();
  for (const [code, evt] of localEvents.entries()) {
    if (new Date(evt.expiresAt).getTime() < now) {
      localEvents.delete(code);
      eventsDeleted++;
    }
  }
  let rateLimitsDeleted = 0;
  for (const [key, rl] of localRateLimits.entries()) {
    if (rl.resetAt < now) {
      localRateLimits.delete(key);
      rateLimitsDeleted++;
    }
  }
  return { eventsDeleted, rateLimitsDeleted };
}

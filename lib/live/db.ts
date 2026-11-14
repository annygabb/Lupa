/**
 * Armazenamento do LUPA Live.
 * Suporta Supabase Postgres quando configurado (produção)
 * e motor resiliente local (em memória com persistência efêmera)
 * para desenvolvimento, testes E2E e demonstração no hackathon sem falhas 503.
 */

const url = () => (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.LUPA_SUPABASE_URL)?.replace(/\/+$/, "");
const secret = () => process.env.SUPABASE_SECRET_KEY || process.env.LUPA_SUPABASE_SERVICE_ROLE_KEY;

export class LiveDatabaseUnavailable extends Error {
  constructor() {
    super("Banco do LUPA Live não configurado.");
    this.name = "LiveDatabaseUnavailable";
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url() && secret());
}

export function allowLocalDemo(): boolean {
  return process.env.NODE_ENV === "test" ||
    (process.env.NODE_ENV !== "production" && process.env.LUPA_LIVE_ALLOW_LOCAL_DEMO === "true");
}
export function liveDatabaseEnabled(): boolean {
  // Em produção, nunca simular persistência quando o banco está ausente.
  return allowLocalDemo() || (isSupabaseConfigured() &&
    Boolean(process.env.LUPA_LIVE_SIGNING_SECRET &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY));
}

export function liveDatabaseMode(): "supabase" | "local-resilient" {
  return isSupabaseConfigured() ? "supabase" : "local-resilient";
}

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
  phase: "pre" | "reveal" | "post" | "closed";
  expiresAt: string;
  counts: LiveCount[];
  correctIndex?: number;
  postQuestion?: {
    question: string;
    choices: string[];
    correctIndex?: number;
    explanation?: string;
  };
}

// -------------------------------------------------------------
// MOTOR RESILIENTE LOCAL (Fallback para Dev / Demonstração / Testes)
// -------------------------------------------------------------

interface LocalStoredEvent {
  id: string;
  code: string;
  claimId: string;
  title: string;
  question: string;
  choices: string[];
  correctIndex: number;
  phase: "pre" | "reveal" | "post" | "closed";
  createdAt: string;
  expiresAt: string;
  postQuestion?: {
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  };
}

interface LocalStoredVote {
  code: string;
  phase: "pre" | "post";
  optionIndex: number;
  sessionHash: string;
  createdAt: string;
}

interface LocalRateLimit {
  count: number;
  resetAt: number;
}

// Armazenamento singleton em memória global
declare global {
  // eslint-disable-next-line no-var
  var __LUPA_LOCAL_LIVE_EVENTS__: Map<string, LocalStoredEvent> | undefined;
  // eslint-disable-next-line no-var
  var __LUPA_LOCAL_LIVE_VOTES__: LocalStoredVote[] | undefined;
  // eslint-disable-next-line no-var
  var __LUPA_LOCAL_LIVE_RATE_LIMITS__: Map<string, LocalRateLimit> | undefined;
}

const localEvents = (globalThis.__LUPA_LOCAL_LIVE_EVENTS__ ??= new Map());
const localVotes = (globalThis.__LUPA_LOCAL_LIVE_VOTES__ ??= []);
const localRateLimits = (globalThis.__LUPA_LOCAL_LIVE_RATE_LIMITS__ ??= new Map());

// Seed inicial de um evento demo padrão para testes imediatos
if (allowLocalDemo() && localEvents.size === 0) {
  localEvents.set("CAFE2026BEEF", {
    id: "demo-uuid-0001",
    code: "CAFE2026BEEF",
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
        "25% da perda hipotética (8kg * 0,25 = 2kg). A bioestatística protege contra interpretações equivocadas.",
    },
  });
}

// -------------------------------------------------------------
// OPERAÇÕES DE BANCO UNIFICADAS (Supabase ou Local)
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

  if (!res.ok) {
    throw new Error("Falha no acesso ao banco remoto (HTTP " + res.status + ").");
  }
  if (res.status === 204) return null as T;
  const raw = await res.text();
  return raw ? JSON.parse(raw) as T : null as T;
}

export async function createLiveEvent(event: {
  code: string;
  claimId: string;
  title: string;
  question: string;
  choices: string[];
  correctIndex?: number;
  organizationId?: string;
  createdBy?: string;
  postQuestion?: {
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  };
}): Promise<{ code: string }> {
  if (isSupabaseConfigured()) {
      await liveDb("lupa_live_events", {
        method: "POST",
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
  if (!allowLocalDemo()) throw new LiveDatabaseUnavailable();

  // Motor local: exclusivamente testes/desenvolvimento autorizado
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
    expiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    postQuestion: event.postQuestion,
  });

  return { code: event.code };
}

export async function eventSnapshot(
  code: string,
  options: { isOrganizer?: boolean } = {}
): Promise<LiveSnapshot | null> {
  const normCode = code.toUpperCase();

  if (isSupabaseConfigured()) {
    return await liveDb<LiveSnapshot | null>("rpc/lupa_event_snapshot", {
      method: "POST",
      body: JSON.stringify({ p_code: normCode }),
    });
  }
  if (!allowLocalDemo()) throw new LiveDatabaseUnavailable();

  // Motor local
  const evt = localEvents.get(normCode);
  if (!evt) return null;

  // Calcula totais agregados por fase e opção
  const countsMap = new Map<string, number>();
  for (const v of localVotes) {
    if (v.code === normCode) {
      const k = `${v.phase}:${v.optionIndex}`;
      countsMap.set(k, (countsMap.get(k) || 0) + 1);
    }
  }

  const counts: LiveCount[] = [];
  for (let i = 0; i < evt.choices.length; i++) {
    counts.push({
      phase: "pre",
      optionIndex: i,
      count: countsMap.get(`pre:${i}`) || 0,
    });
    counts.push({
      phase: "post",
      optionIndex: i,
      count: countsMap.get(`post:${i}`) || 0,
    });
  }

  // Se for participante e a fase ainda for 'pre', oculta contagens para não influenciar votos
  const publicCounts =
    !options.isOrganizer && evt.phase === "pre"
      ? counts.map((c) => ({ ...c, count: 0 }))
      : counts;

  return {
    code: evt.code,
    claimId: evt.claimId,
    title: evt.title,
    question: evt.question,
    choices: evt.choices,
    phase: evt.phase,
    expiresAt: evt.expiresAt,
    counts: publicCounts,
    correctIndex: options.isOrganizer || evt.phase !== "pre" ? evt.correctIndex : undefined,
    postQuestion: evt.postQuestion && (evt.phase === "post" || evt.phase === "closed")
      ? (options.isOrganizer || evt.phase === "closed" ? evt.postQuestion : {
          question: evt.postQuestion.question,
          choices: evt.postQuestion.choices,
        })
      : undefined,
  };
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
  if (!allowLocalDemo()) throw new LiveDatabaseUnavailable();

  // Motor local
  const evt = localEvents.get(normCode);
  if (!evt) {
    return { accepted: false, reason: "EVENT_NOT_FOUND" };
  }

  if (evt.phase !== phase && evt.phase !== "closed") {
    // se estiver em reveal e o usuário tentar votar no pré
    return { accepted: false, reason: "PHASE_CLOSED" };
  }
  if (evt.phase === "closed") {
    return { accepted: false, reason: "EVENT_CLOSED" };
  }

  // Rate limit: max 8 tentativas por minuto por sessão
  const rlKey = `${normCode}:${sessionHash}`;
  const now = Date.now();
  const rl = localRateLimits.get(rlKey);
  if (rl) {
    if (now < rl.resetAt) {
      if (rl.count >= 8) {
        return { accepted: false, reason: "RATE_LIMITED" };
      }
      rl.count++;
    } else {
      localRateLimits.set(rlKey, { count: 1, resetAt: now + 60_000 });
    }
  } else {
    localRateLimits.set(rlKey, { count: 1, resetAt: now + 60_000 });
  }

  // Integridade: 1 voto por sessão por rodada
  const already = localVotes.some(
    (v) => v.code === normCode && v.phase === phase && v.sessionHash === sessionHash
  );
  if (already) {
    return { accepted: false, reason: "ALREADY_VOTED" };
  }

  localVotes.push({
    code: normCode,
    phase,
    optionIndex,
    sessionHash,
    createdAt: new Date().toISOString(),
  });

  return { accepted: true };
}

export async function advanceLivePhase(
  code: string,
  nextPhase: "pre" | "reveal" | "post" | "closed"
): Promise<boolean> {
  const normCode = code.toUpperCase();

  if (isSupabaseConfigured()) {
    const expectedPhase = nextPhase === "reveal" ? "pre" : nextPhase === "post" ? "reveal" : "post";
    const rows = await liveDb<Array<{ code: string }>>(
      `lupa_live_events?code=eq.${normCode}&phase=eq.${expectedPhase}&select=code`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ phase: nextPhase }),
      }
    );
    return Array.isArray(rows) && rows.length === 1;
  }
  if (!allowLocalDemo()) throw new LiveDatabaseUnavailable();

  const evt = localEvents.get(normCode);
  if (!evt) return false;
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
  if (!allowLocalDemo()) throw new LiveDatabaseUnavailable();

  localEvents.delete(normCode);
  // Remove votos com cascade
  for (let i = localVotes.length - 1; i >= 0; i--) {
    if (localVotes[i].code === normCode) {
      localVotes.splice(i, 1);
    }
  }
  return true;
}

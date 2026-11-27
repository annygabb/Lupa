import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Segurança do LUPA Live (participantes anônimos).
 *
 * - A sessão do participante é um token ASSINADO emitido pelo servidor no GET do
 *   snapshot (`sid.emitidoEm.assinatura`). Votos e feedback exigem esse token:
 *   um script que só faz POST sem antes receber um token é recusado (403).
 * - O token é vinculado ao código do evento e expira em 4 horas.
 * - O cliente (IP) nunca é armazenado em claro: usamos HMAC com o segredo do
 *   ambiente apenas para limitar a taxa de emissão de sessões e de votos.
 */

export const SID_COOKIE = "lupa_live_sid";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 4;

export function newSessionId() {
  return randomBytes(24).toString("hex");
}

function secret() {
  const value = process.env.LUPA_LIVE_SIGNING_SECRET;
  if (!value || value.length < 32) throw new Error("LUPA_LIVE_SIGNING_SECRET não configurado");
  return value;
}

export function signingSecretConfigured(): boolean {
  const value = process.env.LUPA_LIVE_SIGNING_SECRET;
  return Boolean(value && value.length >= 32);
}

function hmac(scope: string, value: string) {
  return createHmac("sha256", secret()).update(scope + ":" + value).digest("hex");
}

export function sessionHash(sessionId: string) {
  return createHmac("sha256", secret()).update(sessionId).digest("hex");
}

export function validSessionId(input: string | undefined): input is string {
  return Boolean(input && /^[a-f0-9]{48}$/.test(input));
}

/** Emite um token de participante vinculado ao evento. */
export function issueSessionToken(code: string, now = Date.now()) {
  const sid = newSessionId();
  const issuedAt = Math.floor(now / 1000);
  const signature = hmac("live-session", code + "." + sid + "." + issuedAt).slice(0, 40);
  return { sid, token: sid + "." + issuedAt + "." + signature };
}

/** Valida assinatura, vínculo com o evento e validade. Retorna null se inválido. */
export function readSessionToken(
  token: string | undefined, code: string, now = Date.now()
): { sid: string; issuedAt: number } | null {
  if (!token || token.length > 160) return null;
  const match = /^([a-f0-9]{48})\.(\d{9,11})\.([a-f0-9]{40})$/.exec(token);
  if (!match) return null;
  const [, sid, rawIssued, signature] = match;
  const issuedAt = Number(rawIssued);
  const nowSeconds = Math.floor(now / 1000);
  if (issuedAt > nowSeconds + 60 || nowSeconds - issuedAt > SESSION_MAX_AGE_SECONDS) return null;
  let expected: string;
  try {
    expected = hmac("live-session", code + "." + sid + "." + issuedAt).slice(0, 40);
  } catch {
    return null;
  }
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return { sid, issuedAt };
}

/** Endereço do cliente pseudonimizado (HMAC). Nunca registrar o IP em claro. */
export function clientHash(request: NextRequest | Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  return hmac("client", ip);
}

/** Pseudônimo de um identificador sensível (ex.: e-mail) para limitação de taxa. */
export function keyHash(scope: string, value: string) {
  return hmac(scope, value.trim().toLowerCase());
}

/**
 * Normaliza o código do evento: aceita minúsculas na URL, mas TODAS as consultas
 * usam a forma canônica em maiúsculas (o banco só aceita ^[A-F0-9]{12}$).
 */
export function normalizeCode(code: string | undefined | null): string | null {
  if (typeof code !== "string") return null;
  const upper = code.trim().toUpperCase();
  return /^[A-F0-9]{12}$/.test(upper) ? upper : null;
}

export function validCode(code: string) {
  return normalizeCode(code) !== null;
}

function originOf(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : null;
  } catch {
    return null;
  }
}

/**
 * Origens aceitas para escrita: a origem canônica da requisição, a origem derivada
 * do Host (o navegador não permite forjá-lo), LUPA_APP_BASE_URL e, opcionalmente,
 * LUPA_ALLOWED_ORIGINS (lista separada por vírgulas para domínios alternativos).
 */
export function trustedOrigins(request: NextRequest): Set<string> {
  const set = new Set<string>();
  set.add(request.nextUrl.origin);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host && /^[a-z0-9.:[\]-]+$/i.test(host)) {
    const proto = (request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", ""))
      .split(",")[0].trim();
    const fromHost = originOf(proto + "://" + host);
    if (fromHost) set.add(fromHost);
  }
  const base = originOf(process.env.LUPA_APP_BASE_URL);
  if (base) set.add(base);
  for (const item of (process.env.LUPA_ALLOWED_ORIGINS || "").split(",")) {
    const origin = originOf(item.trim());
    if (origin) set.add(origin);
  }
  return set;
}

/**
 * Proteção de escrita (CSRF/script de terceiros): exige o cabeçalho Origin
 * presente e confiável. Ausência de Origin NÃO é permissão.
 */
export function sameSiteWrite(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || !trustedOrigins(request).has(origin)) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  return !fetchSite || fetchSite === "same-origin";
}

/** Mantido por compatibilidade: agora tem a mesma regra estrita de sameSiteWrite. */
export function sameOrigin(request: NextRequest) {
  return sameSiteWrite(request);
}

export function liveLimits() {
  const num = (name: string, fallback: number, min: number, max: number) => {
    const value = Number(process.env[name]);
    return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
  };
  return {
    /** Novas sessões de participante por cliente (IP pseudonimizado) por minuto e por evento. */
    sessionsPerClientMinute: num("LUPA_LIVE_MAX_SESSIONS_PER_CLIENT_MINUTE", 40, 1, 5000),
    /** Tentativas de voto por cliente por minuto e por evento (redes de escola compartilham IP). */
    votesPerClientMinute: num("LUPA_LIVE_MAX_VOTES_PER_CLIENT_MINUTE", 80, 1, 10000),
    /** Tentativas de login por e-mail a cada 15 minutos. */
    loginPerEmail15: num("LUPA_AUTH_MAX_LOGIN_PER_EMAIL_15MIN", 8, 1, 100),
    /** Tentativas de login por cliente a cada 15 minutos. */
    loginPerClient15: num("LUPA_AUTH_MAX_LOGIN_PER_CLIENT_15MIN", 30, 1, 1000),
    /** Pedidos de recuperação por e-mail por hora. */
    recoverPerEmailHour: num("LUPA_AUTH_MAX_RECOVER_PER_EMAIL_HOUR", 3, 1, 50),
  };
}

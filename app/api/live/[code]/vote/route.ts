import { NextRequest } from "next/server";
import { castVote, consumeRateLimit, liveDatabaseEnabled } from "@/lib/live/db";
import {
  clientHash, liveLimits, normalizeCode, readSessionToken, sameSiteWrite, sessionHash, SID_COOKIE,
} from "@/lib/live/security";
import { privateJson } from "@/lib/live/institutional-auth";
import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ code: string }> };
const ROUTE = "api/live/[code]/vote";

const STATUS_BY_REASON: Record<string, number> = {
  ACCEPTED: 201,
  ALREADY_VOTED: 409,
  PHASE_UNAVAILABLE: 409,
  PHASE_CLOSED: 409,
  EVENT_CLOSED: 409,
  NOT_FOUND: 404,
  EVENT_NOT_FOUND: 404,
  RATE_LIMIT: 429,
  RATE_LIMITED: 429,
  INVALID_INPUT: 400,
};

/**
 * Voto anônimo. Regras no SERVIDOR:
 * 1. Origin presente e confiável (scripts sem Origin são recusados).
 * 2. Sessão de participante ASSINADA, emitida antes pelo GET do snapshot (403 SESSION_REQUIRED).
 * 3. Limite por rede (IP pseudonimizado) por evento e por minuto, e 8 tentativas/min por sessão.
 * 4. Um voto por sessão e por rodada, somente na rodada aberta (garantido pelo banco).
 */
export async function POST(req: NextRequest, { params }: Context) {
  const code = normalizeCode((await params).code);
  if (!code) return privateJson({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  if (!sameSiteWrite(req)) {
    log.security("invalid_origin", { route: ROUTE, eventCode: code });
    return privateJson({ error: "INVALID_ORIGIN" }, 403);
  }

  const media = req.headers.get("content-type") ?? "";
  if (!media.toLowerCase().startsWith("application/json")) {
    return privateJson({ error: "UNSUPPORTED_MEDIA_TYPE" }, 415);
  }

  let payload: unknown;
  try {
    const body = await req.text();
    if (new TextEncoder().encode(body).length > 512) return privateJson({ error: "PAYLOAD_TOO_LARGE" }, 413);
    payload = JSON.parse(body);
  } catch {
    return privateJson({ error: "INVALID_JSON" }, 400);
  }

  const v = payload as { phase?: unknown; optionIndex?: unknown } | null;
  if (
    !v || typeof v !== "object" ||
    (v.phase !== "pre" && v.phase !== "post") ||
    !Number.isInteger(v.optionIndex) || Number(v.optionIndex) < 0 || Number(v.optionIndex) > 2
  ) {
    return privateJson({ error: "INVALID_VOTE" }, 400);
  }

  const session = readSessionToken(req.cookies.get(SID_COOKIE)?.value, code);
  if (!session) {
    log.security("vote_without_session", { route: ROUTE, eventCode: code });
    return privateJson({ error: "SESSION_REQUIRED" }, 403);
  }

  try {
    const limit = await consumeRateLimit(
      "live-vote:" + code, clientHash(req), 60, liveLimits().votesPerClientMinute
    );
    if (!limit.allowed) {
      log.security("vote_rate_limited", { route: ROUTE, eventCode: code });
      const res = privateJson({ accepted: false, reason: "RATE_LIMIT" }, 429);
      res.headers.set("Retry-After", String(Math.max(1, limit.retryAfter)));
      return res;
    }

    const outcome = await castVote({
      code, phase: v.phase, optionIndex: Number(v.optionIndex), sessionHash: sessionHash(session.sid),
    });
    const reason = outcome.accepted ? "ACCEPTED" : (outcome.reason ?? "REJECTED");
    const status = outcome.accepted ? 201 : (STATUS_BY_REASON[reason] ?? 409);
    if (status === 429) log.security("vote_session_rate_limited", { route: ROUTE, eventCode: code });
    return privateJson({ accepted: outcome.accepted, reason }, status);
  } catch (error) {
    log.error(ROUTE, "LIVE_VOTE_FAILED", error, { eventCode: code });
    return privateJson({ error: "LIVE_VOTE_FAILED" }, 503);
  }
}

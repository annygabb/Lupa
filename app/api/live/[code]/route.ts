import { NextRequest } from "next/server";
import {
  advanceLivePhase, deleteLiveEvent, eventSnapshot, liveDatabaseEnabled, recordAuditAction,
  consumeRateLimit, sessionState,
} from "@/lib/live/db";
import {
  normalizeCode, readSessionToken, issueSessionToken, sessionHash, clientHash, liveLimits,
  SID_COOKIE, SESSION_MAX_AGE_SECONDS,
} from "@/lib/live/security";
import {
  getInstitutionalUser, requireEventManager, sameSiteWrite, privateJson, getEventOrganizationId,
} from "@/lib/live/institutional-auth";
import { toPublicSnapshot } from "@/lib/live/public-snapshot";
import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{code:string}> };
const ROUTE = "api/live/[code]";

/**
 * Snapshot PÚBLICO (participante e telão). Também emite a sessão assinada do
 * participante: votar e avaliar exigem esse cookie, emitido com limite por rede.
 */
export async function GET(request: NextRequest, {params}: Context) {
  const code = normalizeCode((await params).code);
  if (!code) return privateJson({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  try {
    const snapshot = await eventSnapshot(code);
    if (!snapshot) return privateJson({ error: "NOT_FOUND" }, 404);
    const body = toPublicSnapshot(snapshot);

    const existing = readSessionToken(request.cookies.get(SID_COOKIE)?.value, code);
    let issuedToken: string | null = null;
    if (existing) {
      try {
        body.viewer = await sessionState(code, sessionHash(existing.sid));
      } catch (error) {
        // O estado da sessão é conveniência de interface; o voto continua protegido pelo banco.
        log.error(ROUTE, "SESSION_STATE_FAILED", error, { eventCode: code });
      }
    } else {
      let allowed = true;
      try {
        const limit = await consumeRateLimit(
          "live-session:" + code, clientHash(request), 60, liveLimits().sessionsPerClientMinute
        );
        allowed = limit.allowed;
      } catch (error) {
        // Sem o limitador (ex.: migração pendente), a sessão ainda é emitida; os votos
        // continuam limitados por sessão no banco. O erro fica registrado para correção.
        log.error(ROUTE, "SESSION_LIMITER_FAILED", error, { eventCode: code });
      }
      if (allowed) {
        issuedToken = issueSessionToken(code).token;
        body.viewer = { votedPre: false, votedPost: false, feedbackSent: false };
      } else {
        log.security("live_session_rate_limited", { route: ROUTE, eventCode: code });
      }
    }

    const response = privateJson(body);
    if (issuedToken) {
      response.cookies.set(SID_COOKIE, issuedToken, {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax", path: "/api/live/" + code, maxAge: SESSION_MAX_AGE_SECONDS,
      });
    }
    return response;
  } catch (error) {
    log.error(ROUTE, "LIVE_READ_FAILED", error, { eventCode: code });
    return privateJson({ error: "LIVE_READ_FAILED" }, 503);
  }
}

const NEXT: Record<string, "reveal" | "post" | "closed"> = { pre: "reveal", reveal: "post", post: "closed" };

export async function PATCH(request: NextRequest, {params}: Context) {
  const code = normalizeCode((await params).code);
  if (!code) return privateJson({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  if (!sameSiteWrite(request)) {
    log.security("invalid_origin", { route: ROUTE, method: "PATCH" });
    return privateJson({ error: "INVALID_ORIGIN" }, 403);
  }
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ error: "UNAUTHENTICATED" }, 401);
  let next: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 512) return privateJson({ error: "PAYLOAD_TOO_LARGE" }, 413);
    next = (JSON.parse(raw) as { phase?: unknown })?.phase;
  } catch {
    return privateJson({ error: "INVALID_JSON" }, 400);
  }
  if (next !== "reveal" && next !== "post" && next !== "closed")
    return privateJson({ error: "INVALID_PHASE" }, 400);
  try {
    if (!await requireEventManager(user.id, code)) {
      log.security("forbidden_event", { route: ROUTE, method: "PATCH", eventCode: code });
      return privateJson({ error: "FORBIDDEN" }, 403);
    }
    const current = await eventSnapshot(code);
    if (!current) return privateJson({ error: "NOT_FOUND" }, 404);
    if (NEXT[current.phase] !== next) return privateJson({ error: "INVALID_TRANSITION", phase: current.phase }, 409);
    const changed = await advanceLivePhase(code, next);
    if (!changed) return privateJson({ error: "PHASE_CHANGED" }, 409);
    const orgId = await getEventOrganizationId(code);
    if (orgId) {
      const audited = await recordAuditAction({
        organizationId: orgId, eventCode: code, actorId: user.id, action: "phase_advanced",
      });
      if (!audited) log.error(ROUTE, "AUDIT_WRITE_FAILED", new Error("audit"), { eventCode: code });
    }
    return privateJson({ phase: next });
  } catch (error) {
    log.error(ROUTE, "LIVE_UPDATE_FAILED", error, { eventCode: code });
    return privateJson({ error: "LIVE_UPDATE_FAILED" }, 503);
  }
}

export async function DELETE(request: NextRequest, {params}: Context) {
  const code = normalizeCode((await params).code);
  if (!code) return privateJson({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  if (!sameSiteWrite(request)) {
    log.security("invalid_origin", { route: ROUTE, method: "DELETE" });
    return privateJson({ error: "INVALID_ORIGIN" }, 403);
  }
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ error: "UNAUTHENTICATED" }, 401);
  try {
    if (!await requireEventManager(user.id, code)) {
      log.security("forbidden_event", { route: ROUTE, method: "DELETE", eventCode: code });
      return privateJson({ error: "FORBIDDEN" }, 403);
    }
    const orgId = await getEventOrganizationId(code);
    const deleted = await deleteLiveEvent(code);
    if (deleted && orgId) {
      const audited = await recordAuditAction({
        organizationId: orgId, eventCode: code, actorId: user.id, action: "event_deleted",
      });
      if (!audited) log.error(ROUTE, "AUDIT_WRITE_FAILED", new Error("audit"), { eventCode: code });
    }
    return deleted ? privateJson({ deleted: true, code }) : privateJson({ error: "NOT_FOUND" }, 404);
  } catch (error) {
    log.error(ROUTE, "LIVE_DELETE_FAILED", error, { eventCode: code });
    return privateJson({ error: "LIVE_DELETE_FAILED" }, 503);
  }
}

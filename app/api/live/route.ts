import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { createLiveEvent, liveDatabaseEnabled, liveDb, recordAuditAction } from "@/lib/live/db";
import { liveQuestion } from "@/lib/live/content";
import {
  getInstitutionalUser, membershipsOf, requireOrganizationManager,
  sameSiteWrite, mayManage, privateJson,
} from "@/lib/live/institutional-auth";
import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ROUTE = "api/live";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lista os eventos das organizações que o usuário gerencia (nunca de outras). */
export async function GET() {
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ error: "UNAUTHENTICATED" }, 401);
  try {
    const orgIds = (await membershipsOf(user.id))
      .filter(m => mayManage(m.role) && UUID.test(m.organization_id))
      .map(m => m.organization_id);
    if (!orgIds.length) return privateJson({ events: [] });
    const rows = await liveDb<Array<{code:string; title:string; phase:string; organization_id:string; created_at:string; expires_at:string}>>(
      "lupa_live_events?organization_id=in.(" + orgIds.join(",") +
      ")&select=code,title,phase,organization_id,created_at,expires_at&order=created_at.desc&limit=50"
    );
    return privateJson({ events: rows ?? [] });
  } catch (error) {
    log.error(ROUTE, "LIVE_READ_FAILED", error);
    return privateJson({ error: "LIVE_READ_FAILED" }, 503);
  }
}

/** Cria uma sessão para uma organização que o usuário gerencia (verificado no servidor). */
export async function POST(request: NextRequest) {
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  if (!sameSiteWrite(request)) {
    log.security("invalid_origin", { route: ROUTE, method: "POST" });
    return privateJson({ error: "INVALID_ORIGIN" }, 403);
  }
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ error: "UNAUTHENTICATED" }, 401);
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json"))
    return privateJson({ error: "INVALID_MEDIA_TYPE" }, 415);

  let input: { claimId?: unknown; organizationId?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 2048) return privateJson({ error: "PAYLOAD_TOO_LARGE" }, 413);
    input = JSON.parse(raw) as typeof input;
  } catch { return privateJson({ error: "INVALID_JSON" }, 400); }
  if (!input || typeof input.claimId !== "string" || typeof input.organizationId !== "string" ||
    !UUID.test(input.organizationId))
    return privateJson({ error: "INVALID_REQUEST" }, 400);
  const item = liveQuestion(input.claimId);
  if (!item) return privateJson({ error: "INVALID_CLAIM" }, 400);

  try {
    if (!await requireOrganizationManager(user.id, input.organizationId)) {
      log.security("forbidden_organization", { route: ROUTE, method: "POST" });
      return privateJson({ error: "FORBIDDEN_ORGANIZATION" }, 403);
    }
    const code = randomBytes(6).toString("hex").toUpperCase();
    await createLiveEvent({
      code, organizationId: input.organizationId, createdBy: user.id,
      claimId: item.claimId, title: item.title, question: item.question,
      choices: item.choices, correctIndex: item.correctIndex,
      postQuestion: item.postQuestion,
    });
    // A falha de auditoria é registrada, mas não converte a criação em erro (evita
    // um novo clique criar um segundo evento).
    const audited = await recordAuditAction({
      organizationId: input.organizationId, eventCode: code, actorId: user.id, action: "event_created",
    });
    if (!audited) log.error(ROUTE, "AUDIT_WRITE_FAILED", new Error("audit"), { eventCode: code });
    log.info("live.event_created", { eventCode: code });
    return privateJson({
      code, organizationId: input.organizationId,
      joinUrl: "/live/" + code,
      presentationUrl: "/live/apresentacao/" + code, phase: "pre",
    }, 201);
  } catch (error) {
    log.error(ROUTE, "LIVE_CREATE_FAILED", error);
    return privateJson({ error: "LIVE_CREATE_FAILED" }, 503);
  }
}

import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { createLiveEvent, liveDatabaseEnabled, liveDb } from "@/lib/live/db";
import { liveQuestion } from "@/lib/live/content";
import {
  getInstitutionalUser, membershipsOf, requireOrganizationManager,
  sameSiteWrite, mayManage, privateJson,
} from "@/lib/live/institutional-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ error: "UNAUTHENTICATED" }, 401);
  try {
    const memberships = (await membershipsOf(user.id)).filter(m=>mayManage(m.role));
    if (!memberships.length) return privateJson({ events: [] });
    const orgIds = memberships.map(m=>m.organization_id);
    const rows = await liveDb<Array<{code:string; title:string; phase:string; organization_id:string; created_at:string}>>(
      "lupa_live_events?organization_id=in.(" + orgIds.join(",") +
      ")&select=code,title,phase,organization_id,created_at&order=created_at.desc&limit=50"
    );
    return privateJson({ events: rows });
  } catch { return privateJson({ error: "LIVE_READ_FAILED" }, 503); }
}

export async function POST(request: NextRequest) {
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  if (!sameSiteWrite(request)) return privateJson({ error: "INVALID_ORIGIN" }, 403);
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ error: "UNAUTHENTICATED" }, 401);
  if (!(request.headers.get("content-type") || "").startsWith("application/json"))
    return privateJson({ error: "INVALID_MEDIA_TYPE" }, 415);

  let input: { claimId?: unknown; organizationId?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 2048) return privateJson({ error: "PAYLOAD_TOO_LARGE" }, 413);
    input = JSON.parse(raw) as typeof input;
  } catch { return privateJson({ error: "INVALID_JSON" }, 400); }
  if (typeof input.claimId !== "string" || typeof input.organizationId !== "string")
    return privateJson({ error: "INVALID_REQUEST" }, 400);
  const item = liveQuestion(input.claimId);
  if (!item) return privateJson({ error: "INVALID_CLAIM" }, 400);

  try {
    if (!await requireOrganizationManager(user.id, input.organizationId))
      return privateJson({ error: "FORBIDDEN_ORGANIZATION" }, 403);
    const code = randomBytes(6).toString("hex").toUpperCase();
    await createLiveEvent({
      code, organizationId: input.organizationId, createdBy: user.id,
      claimId: item.claimId, title: item.title, question: item.question,
      choices: item.choices, correctIndex: item.correctIndex,
      postQuestion: item.postQuestion,
    });
    // An audit write must be durable, but failure to write audit does not
    // transform success into a retry that could create a second event.
    try {
      await liveDb("lupa_live_audit", {
        method: "POST",
        body: JSON.stringify({ organization_id: input.organizationId,
          event_code: code, actor_id: user.id, action: "event_created" }),
      });
    } catch { /* Capture and alert in observability before production release. */ }
    return privateJson({
      code, organizationId: input.organizationId,
      joinUrl: "/live/" + code,
      presentationUrl: "/live/apresentacao/" + code, phase: "pre",
    }, 201);
  } catch { return privateJson({ error: "LIVE_CREATE_FAILED" }, 503); }
}

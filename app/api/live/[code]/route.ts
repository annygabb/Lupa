import { NextRequest } from "next/server";
import { advanceLivePhase, deleteLiveEvent, eventSnapshot, liveDatabaseEnabled, liveDb } from "@/lib/live/db";
import { validCode } from "@/lib/live/security";
import {
  getInstitutionalUser, requireEventManager, sameSiteWrite, privateJson,
} from "@/lib/live/institutional-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{code:string}> };

export async function GET(_request: NextRequest, {params}: Context) {
  const { code } = await params;
  if (!validCode(code)) return privateJson({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  try {
    // Strict PUBLIC response. Organizer gets a distinct authorized endpoint.
    const snapshot = await eventSnapshot(code);
    if (!snapshot) return privateJson({ error: "NOT_FOUND" }, 404);
    snapshot.counts = snapshot.phase === "pre" ? [] :
      snapshot.phase === "reveal" ? snapshot.counts.filter(c=>c.phase==="pre") :
      snapshot.counts;
    return privateJson(snapshot);
  } catch { return privateJson({ error: "LIVE_READ_FAILED" }, 503); }
}

export async function PATCH(request: NextRequest, {params}: Context) {
  const { code } = await params;
  if (!validCode(code)) return privateJson({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  if (!sameSiteWrite(request)) return privateJson({ error: "INVALID_ORIGIN" }, 403);
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ error: "UNAUTHENTICATED" }, 401);
  try {
    if (!await requireEventManager(user.id, code)) return privateJson({ error: "FORBIDDEN" }, 403);
    const raw = await request.text();
    if (raw.length > 512) return privateJson({ error: "PAYLOAD_TOO_LARGE" }, 413);
    const payload = JSON.parse(raw) as { phase?: unknown };
    const next = payload?.phase;
    if (!["reveal","post","closed"].includes(String(next)))
      return privateJson({ error: "INVALID_PHASE" }, 400);
    const current = await eventSnapshot(code, {isOrganizer:true});
    if (!current) return privateJson({ error: "NOT_FOUND" }, 404);
    const allowed:Record<string,string> = { pre:"reveal",reveal:"post",post:"closed" };
    if (allowed[current.phase] !== next) return privateJson({ error:"INVALID_TRANSITION" }, 409);
    const changed = await advanceLivePhase(code, next as "reveal"|"post"|"closed");
    if (!changed) return privateJson({ error:"PHASE_CHANGED" }, 409);
    return privateJson({ phase:next });
  } catch { return privateJson({ error:"LIVE_UPDATE_FAILED" }, 503); }
}

export async function DELETE(request: NextRequest, {params}: Context) {
  const {code} = await params;
  if (!validCode(code)) return privateJson({ error:"INVALID_CODE" },400);
  if (!liveDatabaseEnabled()) return privateJson({ error:"LIVE_UNCONFIGURED" },503);
  if (!sameSiteWrite(request)) return privateJson({ error:"INVALID_ORIGIN" },403);
  const user=await getInstitutionalUser();
  if(!user) return privateJson({ error:"UNAUTHENTICATED" },401);
  try {
    if (!await requireEventManager(user.id,code)) return privateJson({ error:"FORBIDDEN" },403);
    const deleted=await deleteLiveEvent(code);
    return deleted ? privateJson({deleted:true,code}) : privateJson({error:"NOT_FOUND"},404);
  } catch {return privateJson({error:"LIVE_DELETE_FAILED"},503);}
}

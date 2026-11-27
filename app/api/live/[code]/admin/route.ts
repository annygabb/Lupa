import { NextRequest } from "next/server";
import { adminSnapshot, liveDatabaseEnabled } from "@/lib/live/db";
import { normalizeCode } from "@/lib/live/security";
import { getInstitutionalUser, requireEventManager, privateJson } from "@/lib/live/institutional-auth";
import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ code: string }> };
const ROUTE = "api/live/[code]/admin";

/** Snapshot completo (gabaritos e contagens ao vivo) só para gestor da organização do evento. */
export async function GET(_request: NextRequest, { params }: Context) {
  const code = normalizeCode((await params).code);
  if (!code) return privateJson({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ error: "UNAUTHENTICATED" }, 401);
  try {
    if (!await requireEventManager(user.id, code)) {
      log.security("forbidden_event", { route: ROUTE, eventCode: code });
      return privateJson({ error: "FORBIDDEN" }, 403);
    }
    const snapshot = await adminSnapshot(code);
    return snapshot ? privateJson(snapshot) : privateJson({ error: "NOT_FOUND" }, 404);
  } catch (error) {
    log.error(ROUTE, "ADMIN_SNAPSHOT_FAILED", error, { eventCode: code });
    return privateJson({ error: "ADMIN_SNAPSHOT_FAILED" }, 503);
  }
}

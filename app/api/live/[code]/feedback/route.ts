import { NextRequest } from "next/server";
import { liveDatabaseEnabled, submitFeedback } from "@/lib/live/db";
import { normalizeCode, readSessionToken, sessionHash, SID_COOKIE } from "@/lib/live/security";
import { privateJson, sameSiteWrite } from "@/lib/live/institutional-auth";
import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ code: string }> };
const ROUTE = "api/live/[code]/feedback";

/** Avaliação educacional opcional (1–5), uma por sessão de participante, após o encerramento. */
export async function POST(request: NextRequest, { params }: Context) {
  const code = normalizeCode((await params).code);
  if (!code) return privateJson({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  if (!sameSiteWrite(request)) {
    log.security("invalid_origin", { route: ROUTE, eventCode: code });
    return privateJson({ error: "INVALID_ORIGIN" }, 403);
  }
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json"))
    return privateJson({ error: "UNSUPPORTED_MEDIA_TYPE" }, 415);

  let input: { clarity?: unknown; usefulness?: unknown; purposeAccepted?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 512) return privateJson({ error: "PAYLOAD_TOO_LARGE" }, 413);
    input = JSON.parse(raw) as typeof input;
  } catch {
    return privateJson({ error: "INVALID_JSON" }, 400);
  }
  const score = (value: unknown) => Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
  if (!input || !score(input.clarity) || !score(input.usefulness) || input.purposeAccepted !== true)
    return privateJson({ error: "INVALID_FEEDBACK_OR_PURPOSE" }, 400);

  const session = readSessionToken(request.cookies.get(SID_COOKIE)?.value, code);
  if (!session) return privateJson({ error: "SESSION_REQUIRED" }, 403);

  try {
    const outcome = await submitFeedback({
      code, sessionHash: sessionHash(session.sid),
      clarity: Number(input.clarity), usefulness: Number(input.usefulness),
    });
    if (outcome === "not-found") return privateJson({ error: "NOT_FOUND" }, 404);
    if (outcome === "not-open") return privateJson({ error: "FEEDBACK_NOT_OPEN" }, 409);
    if (outcome === "already-sent") return privateJson({ error: "ALREADY_SENT" }, 409);
    return privateJson({ saved: true }, 201);
  } catch (error) {
    log.error(ROUTE, "FEEDBACK_SAVE_FAILED", error, { eventCode: code });
    return privateJson({ error: "FEEDBACK_SAVE_FAILED" }, 503);
  }
}

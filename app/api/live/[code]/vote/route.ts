import { NextRequest, NextResponse } from "next/server";
import { castVote, liveDatabaseEnabled } from "@/lib/live/db";
import {
  newSessionId,
  sessionHash,
  SID_COOKIE,
  validCode,
  validSessionId,
  sameOrigin,
} from "@/lib/live/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ code: string }> };

const fail = (code: string, status: number) =>
  NextResponse.json({ error: code }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest, { params }: Context) {
  const { code } = await params;
  if (!validCode(code)) return fail("INVALID_CODE", 400);
  if (!liveDatabaseEnabled()) return fail("LIVE_UNCONFIGURED", 503);
  if (!sameOrigin(req)) return fail("INVALID_ORIGIN", 403);

  const media = req.headers.get("content-type") ?? "";
  if (!media.toLowerCase().startsWith("application/json")) {
    return fail("UNSUPPORTED_MEDIA_TYPE", 415);
  }

  let payload: unknown;
  try {
    const body = await req.text();
    if (new TextEncoder().encode(body).length > 512) {
      return fail("PAYLOAD_TOO_LARGE", 413);
    }
    payload = JSON.parse(body);
  } catch {
    return fail("INVALID_JSON", 400);
  }

  const v = payload as { phase?: unknown; optionIndex?: unknown } | null;
  if (
    !v ||
    typeof v !== "object" ||
    !["pre", "post"].includes(String(v.phase)) ||
    !Number.isInteger(v.optionIndex) ||
    Number(v.optionIndex) < 0 ||
    Number(v.optionIndex) > 2
  ) {
    return fail("INVALID_VOTE", 400);
  }

  const existing = req.cookies.get(SID_COOKIE)?.value;
  const session = validSessionId(existing) ? existing : newSessionId();

  try {
    const outcome = await castVote({
      code,
      phase: v.phase as "pre" | "post",
      optionIndex: Number(v.optionIndex),
      sessionHash: sessionHash(session),
    });

    const status = outcome.accepted
      ? 201
      : (outcome.reason === "RATE_LIMITED" || outcome.reason === "RATE_LIMIT")
      ? 429
      : outcome.reason === "ALREADY_VOTED"
      ? 409
      : (outcome.reason === "EVENT_NOT_FOUND" || outcome.reason === "NOT_FOUND")
      ? 404
      : 409;

    const res = NextResponse.json(
      { accepted: outcome.accepted, reason: outcome.reason },
      { status, headers: { "Cache-Control": "no-store" } }
    );

    res.cookies.set(SID_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/live/" + code,
      maxAge: 60 * 60 * 4,
    });

    return res;
  } catch {
    return fail("LIVE_VOTE_FAILED", 503);
  }
}

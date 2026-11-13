import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createLiveEvent, liveDatabaseEnabled } from "@/lib/live/db";
import { isOrganizerAuthorized, sameOrigin } from "@/lib/live/security";
import { liveQuestion } from "@/lib/live/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!liveDatabaseEnabled()) {
    return NextResponse.json(
      { error: "LIVE_UNCONFIGURED", message: "A sala requer banco exclusivo do LUPA configurado." },
      { status: 503 }
    );
  }
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  }
  if (!isOrganizerAuthorized(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let payload: unknown;
  try {
    const text = await req.text();
    if (new TextEncoder().encode(text).length > 2048) {
      return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
    }
    payload = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const claimId =
    typeof payload === "object" && payload !== null && "claimId" in payload
      ? (payload as { claimId: unknown }).claimId
      : null;

  if (typeof claimId !== "string") {
    return NextResponse.json({ error: "INVALID_CLAIM" }, { status: 400 });
  }

  const item = liveQuestion(claimId);
  if (!item) {
    return NextResponse.json({ error: "INVALID_CLAIM" }, { status: 400 });
  }

  const code = randomBytes(6).toString("hex").toUpperCase();

  try {
    await createLiveEvent({
      code,
      claimId: item.claimId,
      title: item.title,
      question: item.question,
      choices: item.choices,
      correctIndex: item.correctIndex,
      postQuestion: item.postQuestion,
    });

    return NextResponse.json(
      {
        code,
        joinUrl: "/live/" + code,
        presentationUrl: "/live/apresentacao/" + code,
        phase: "pre",
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "LIVE_CREATE_FAILED", message: "Não foi possível criar a sessão." },
      { status: 503 }
    );
  }
}

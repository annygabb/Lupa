import { NextRequest, NextResponse } from "next/server";
import {
  advanceLivePhase,
  deleteLiveEvent,
  eventSnapshot,
  liveDatabaseEnabled,
} from "@/lib/live/db";
import { isOrganizerAuthorized, sameOrigin, validCode } from "@/lib/live/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ code: string }> };

const result = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export async function GET(req: NextRequest, { params }: Context) {
  const { code } = await params;
  if (!validCode(code)) return result({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return result({ error: "LIVE_UNCONFIGURED" }, 503);

  try {
    const isOrganizer = isOrganizerAuthorized(req);
    const data = await eventSnapshot(code, { isOrganizer });
    if (!data) return result({ error: "NOT_FOUND" }, 404);

    // O organizador e o modo telão vêem totais completos; participantes só após a revelação
    const isPresentation = req.headers.get("x-lupa-view") === "presentation";
    if (!isOrganizer && !isPresentation) {
      data.counts =
        data.phase === "pre"
          ? []
          : data.phase === "reveal"
          ? data.counts.filter((v) => v.phase === "pre")
          : data.counts;
    }

    return result(data);
  } catch {
    return result({ error: "LIVE_READ_FAILED" }, 503);
  }
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const { code } = await params;
  if (!validCode(code)) return result({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return result({ error: "LIVE_UNCONFIGURED" }, 503);
  if (!sameOrigin(req)) return result({ error: "INVALID_ORIGIN" }, 403);
  if (!isOrganizerAuthorized(req)) return result({ error: "UNAUTHORIZED" }, 401);

  let nextPhase: string;
  try {
    const input = await req.json();
    nextPhase = input?.phase;
  } catch {
    return result({ error: "INVALID_JSON" }, 400);
  }

  if (!["reveal", "post", "closed"].includes(nextPhase)) {
    return result({ error: "INVALID_PHASE" }, 400);
  }

  try {
    const item = await eventSnapshot(code, { isOrganizer: true });
    if (!item) return result({ error: "NOT_FOUND" }, 404);

    const transitions: Record<string, string> = {
      pre: "reveal",
      reveal: "post",
      post: "closed",
    };
    if (transitions[item.phase] !== nextPhase) {
      return result({ error: "INVALID_TRANSITION" }, 409);
    }

    const success = await advanceLivePhase(
      code,
      nextPhase as "pre" | "reveal" | "post" | "closed"
    );
    if (!success) return result({ error: "PHASE_CHANGED" }, 409);

    return result({ phase: nextPhase });
  } catch {
    return result({ error: "LIVE_UPDATE_FAILED" }, 503);
  }
}

/** Exclusão explícita e irreversível de um evento; votos e limites removidos por CASCADE. */
export async function DELETE(req: NextRequest, { params }: Context) {
  const { code } = await params;
  if (!validCode(code)) return result({ error: "INVALID_CODE" }, 400);
  if (!liveDatabaseEnabled()) return result({ error: "LIVE_UNCONFIGURED" }, 503);
  if (!sameOrigin(req)) return result({ error: "INVALID_ORIGIN" }, 403);
  if (!isOrganizerAuthorized(req)) return result({ error: "UNAUTHORIZED" }, 401);

  try {
    const deleted = await deleteLiveEvent(code);
    return deleted ? result({ deleted: true, code }) : result({ error: "NOT_FOUND" }, 404);
  } catch {
    return result({ error: "LIVE_DELETE_FAILED" }, 503);
  }
}

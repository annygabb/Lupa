import { NextRequest, NextResponse } from "next/server";
import { generateQrSvg, getCanonicalLiveUrl } from "@/lib/live/qr";
import { normalizeCode } from "@/lib/live/security";
import { log } from "@/lib/log";
import { eventSnapshot, liveDatabaseEnabled } from "@/lib/live/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ code: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const code = normalizeCode((await params).code);
  if (!code) {
    return NextResponse.json({ error: "INVALID_CODE" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  if (!liveDatabaseEnabled()) {
    return NextResponse.json({ error: "LIVE_UNCONFIGURED" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (process.env.NODE_ENV === "production" && !process.env.LUPA_APP_BASE_URL) {
    return NextResponse.json({ error: "CANONICAL_URL_UNCONFIGURED" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const format = req.nextUrl.searchParams.get("format") || "svg";
  if (format !== "svg" && format !== "json") {
    return NextResponse.json({ error: "UNSUPPORTED_FORMAT" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    // Um código bem formado não significa que existe uma sessão ativa.
    const snapshot = await eventSnapshot(code);
    if (!snapshot) {
      return NextResponse.json({ error: "EVENT_NOT_FOUND" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    if (snapshot.phase === "closed" || Date.parse(snapshot.expiresAt) <= Date.now()) {
      return NextResponse.json({ error: "EVENT_CLOSED" }, { status: 410, headers: { "Cache-Control": "no-store" } });
    }
  } catch (error) {
    log.error("api/live/[code]/qr", "LIVE_READ_FAILED", error, { eventCode: code });
    return NextResponse.json({ error: "LIVE_READ_FAILED" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const targetUrl = getCanonicalLiveUrl(code, req.nextUrl.origin);

  try {
    const svgString = await generateQrSvg(targetUrl, {
      margin: 2,
      darkColor: "#071a33", // Prussian 950
      lightColor: "#ffffff",
    });

    if (format === "json") {
      return NextResponse.json(
        {
          code,
          targetUrl,
          svg: svgString,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return new NextResponse(svgString, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Disposition": `inline; filename="lupa-qr-${code}.svg"`,
      },
    });
  } catch (error) {
    log.error("api/live/[code]/qr", "QR_GENERATION_FAILED", error, { eventCode: code });
    return NextResponse.json(
      { error: "QR_GENERATION_FAILED" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

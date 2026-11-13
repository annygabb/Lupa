import { NextRequest, NextResponse } from "next/server";
import { generateQrSvg, getCanonicalLiveUrl } from "@/lib/live/qr";
import { validCode } from "@/lib/live/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ code: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const { code } = await params;
  if (!validCode(code)) {
    return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
  }

  const targetUrl = getCanonicalLiveUrl(code, req.nextUrl.origin);

  const format = req.nextUrl.searchParams.get("format") || "svg";

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
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    return new NextResponse(svgString, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Disposition": `inline; filename="lupa-qr-${code}.svg"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "QR_GENERATION_FAILED" },
      { status: 500 }
    );
  }
}

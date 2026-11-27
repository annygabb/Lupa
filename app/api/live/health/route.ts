import { NextResponse } from "next/server";
import { liveDb, liveMode } from "@/lib/live/db";
import { authConfigured } from "@/lib/live/institutional-auth";
import { signingSecretConfigured } from "@/lib/live/security";
import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

/**
 * Prontidão REAL do LUPA Live.
 * - 200 ready: Supabase, Auth e segredo configurados e todas as tabelas das migrações acessíveis.
 * - 200 local-demo: motor em memória de desenvolvimento (impossível em produção).
 * - 503 unconfigured / unavailable: o Live não deve ser demonstrado neste ambiente.
 */
export async function GET() {
  const mode = liveMode();
  if (mode === "local-demo" && signingSecretConfigured())
    return NextResponse.json({ status: "local-demo", database: "memory", persistent: false }, { headers });
  if (mode !== "supabase" || !authConfigured() || !signingSecretConfigured())
    return NextResponse.json({ status: "unconfigured" }, { status: 503, headers });
  try {
    await Promise.all([
      liveDb("lupa_organizations?select=id&limit=0"),
      liveDb("lupa_organization_members?select=user_id&limit=0"),
      liveDb("lupa_live_events?select=id&limit=0"),
      liveDb("lupa_event_feedback?select=id&limit=0"),
      liveDb("lupa_rate_limits?select=scope&limit=0"),
    ]);
    return NextResponse.json({ status: "ready", database: "connected", persistent: true }, { headers });
  } catch (error) {
    log.error("api/live/health", "LIVE_DB_UNAVAILABLE", error);
    return NextResponse.json({ status: "unavailable", database: "error" }, { status: 503, headers });
  }
}

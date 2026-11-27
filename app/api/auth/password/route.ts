import { NextRequest } from "next/server";
import { privateJson, sameSiteWrite } from "@/lib/live/institutional-auth";
import { checkAuthLimits } from "@/lib/live/auth-limits";
import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ROUTE = "api/auth/password";

/** Define nova senha a partir do link de recuperação (o token é validado pelo Supabase Auth). */
export async function POST(request: NextRequest) {
  if (!sameSiteWrite(request)) return privateJson({ error: "INVALID_ORIGIN" }, 403);
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json"))
    return privateJson({ error: "INVALID_MEDIA_TYPE" }, 415);
  let input: { accessToken?: unknown; password?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 6000) return privateJson({ error: "INVALID_INPUT" }, 400);
    input = JSON.parse(raw) as typeof input;
  } catch { return privateJson({ error: "INVALID_JSON" }, 400); }
  if (!input || typeof input.accessToken !== "string" || input.accessToken.length > 5000 ||
    typeof input.password !== "string" || input.password.length < 12 || input.password.length > 128)
    return privateJson({ error: "INVALID_INPUT" }, 400);
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.LUPA_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!/^https:\/\/[a-z0-9.-]+(:\d{2,5})?$/i.test(base) || !key)
    return privateJson({ error: "AUTH_UNCONFIGURED" }, 503);

  const limited = await checkAuthLimits(request, [
    { scope: "auth-password-client", windowSeconds: 900, max: 10 },
  ], ROUTE);
  if (!limited.ok) return privateJson({ error: limited.status === 429 ? "TOO_MANY_ATTEMPTS" : "AUTH_UNCONFIGURED" }, limited.status);

  try {
    const response = await fetch(base + "/auth/v1/user", {
      method: "PUT", cache: "no-store",
      headers: { apikey: key, Authorization: "Bearer " + input.accessToken, "Content-Type": "application/json" },
      body: JSON.stringify({ password: input.password }),
    });
    if (!response.ok) {
      log.security("password_reset_rejected", { route: ROUTE, status: response.status });
      return privateJson({ error: "INVALID_OR_EXPIRED_RECOVERY_LINK" }, 401);
    }
    return privateJson({ updated: true });
  } catch (error) {
    log.error(ROUTE, "PASSWORD_UPDATE_UNAVAILABLE", error);
    return privateJson({ error: "PASSWORD_UPDATE_UNAVAILABLE" }, 503);
  }
}

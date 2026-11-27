import { NextRequest } from "next/server";
import { privateJson, sameSiteWrite } from "@/lib/live/institutional-auth";
import { checkAuthLimits, liveLimits } from "@/lib/live/auth-limits";
import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ROUTE = "api/auth/recover";
const GENERIC = { message: "Se o e-mail estiver cadastrado, enviaremos instruções." };

export async function POST(request: NextRequest) {
  if (!sameSiteWrite(request)) return privateJson({ error: "INVALID_ORIGIN" }, 403);
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json"))
    return privateJson({ error: "INVALID_MEDIA_TYPE" }, 415);
  let email: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 1024) return privateJson({ error: "INVALID_INPUT" }, 400);
    email = (JSON.parse(raw) as { email?: unknown })?.email;
  } catch { return privateJson({ error: "INVALID_JSON" }, 400); }
  if (typeof email !== "string" || email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return privateJson({ error: "INVALID_INPUT" }, 400);
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.LUPA_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const app = process.env.LUPA_APP_BASE_URL;
  if (!/^https:\/\/[a-z0-9.-]+(:\d{2,5})?$/i.test(base) || !key || !app?.startsWith("https://"))
    return privateJson({ error: "AUTH_UNCONFIGURED" }, 503);

  const limited = await checkAuthLimits(request, [
    { scope: "auth-recover-client", windowSeconds: 3600, max: 20 },
    { scope: "auth-recover-email", identity: email, windowSeconds: 3600, max: liveLimits().recoverPerEmailHour },
  ], ROUTE);
  // Limite excedido devolve a MESMA mensagem genérica (sem revelar se o e-mail existe).
  if (!limited.ok && limited.status === 429) return privateJson(GENERIC);
  if (!limited.ok) return privateJson({ error: "AUTH_UNCONFIGURED" }, 503);

  try {
    const redirect = new URL("/recuperar-acesso", app);
    const response = await fetch(base + "/auth/v1/recover?redirect_to=" + encodeURIComponent(redirect.toString()), {
      method: "POST", cache: "no-store", headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok && response.status >= 500) log.error(ROUTE, "RECOVERY_PROVIDER_ERROR", new Error("HTTP " + response.status));
    // Prevent user enumeration. Remote provider applies its own abuse controls.
    return privateJson(GENERIC);
  } catch (error) {
    log.error(ROUTE, "RECOVERY_UNAVAILABLE", error);
    return privateJson({ error: "RECOVERY_UNAVAILABLE" }, 503);
  }
}

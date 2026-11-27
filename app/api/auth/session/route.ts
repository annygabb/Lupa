import { NextRequest } from "next/server";
import {
  authConfigured, getInstitutionalUser, membershipsOf, privateJson, sameSiteWrite,
  signInOrganization, signOutInstitutionalUser,
} from "@/lib/live/institutional-auth";
import { checkAuthLimits, liveLimits } from "@/lib/live/auth-limits";
import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ROUTE = "api/auth/session";
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function GET() {
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ authenticated: false }, 401);
  try {
    const memberships = await membershipsOf(user.id);
    return privateJson({ authenticated: true, user, memberships });
  } catch (error) {
    log.error(ROUTE, "IDENTITY_UNAVAILABLE", error);
    return privateJson({ error: "IDENTITY_UNAVAILABLE" }, 503);
  }
}

export async function POST(request: NextRequest) {
  if (!sameSiteWrite(request)) {
    log.security("invalid_origin", { route: ROUTE });
    return privateJson({ error: "INVALID_ORIGIN" }, 403);
  }
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json"))
    return privateJson({ error: "INVALID_MEDIA_TYPE" }, 415);
  let values: { email?: unknown; password?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 4096) return privateJson({ error: "PAYLOAD_TOO_LARGE" }, 413);
    values = JSON.parse(raw) as typeof values;
  } catch { return privateJson({ error: "INVALID_JSON" }, 400); }
  if (!values || typeof values.email !== "string" || values.email.length > 254 || !EMAIL.test(values.email) ||
    typeof values.password !== "string" || values.password.length < 8 || values.password.length > 1024)
    return privateJson({ error: "INVALID_CREDENTIALS" }, 400);
  if (!authConfigured()) return privateJson({ error: "AUTH_UNCONFIGURED" }, 503);

  const limits = liveLimits();
  const limited = await checkAuthLimits(request, [
    { scope: "auth-login-client", windowSeconds: 900, max: limits.loginPerClient15 },
    { scope: "auth-login-email", identity: values.email, windowSeconds: 900, max: limits.loginPerEmail15 },
  ], ROUTE);
  if (!limited.ok) {
    const res = privateJson({ error: limited.status === 429 ? "TOO_MANY_ATTEMPTS" : "AUTH_UNCONFIGURED" }, limited.status);
    if (limited.status === 429) res.headers.set("Retry-After", String(Math.max(1, limited.retryAfter ?? 900)));
    return res;
  }

  try {
    const result = await signInOrganization(values.email, values.password);
    if ("error" in result) {
      if (result.error === "AUTH_UNCONFIGURED") return privateJson({ error: "AUTH_UNCONFIGURED" }, 503);
      // Mesma resposta para senha errada e conta sem organização (não enumerar contas).
      log.security("login_failed", { route: ROUTE, reason: result.error });
      return privateJson({ error: "INVALID_CREDENTIALS" }, 401);
    }
    return privateJson({ authenticated: true, user: result.user, memberships: result.memberships });
  } catch (error) {
    log.error(ROUTE, "LOGIN_UNAVAILABLE", error);
    return privateJson({ error: "LOGIN_UNAVAILABLE" }, 503);
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameSiteWrite(request)) return privateJson({ error: "INVALID_ORIGIN" }, 403);
  await signOutInstitutionalUser();
  return privateJson({ signedOut: true });
}

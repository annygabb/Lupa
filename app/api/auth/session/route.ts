import { NextRequest } from "next/server";
import { getInstitutionalUser, membershipsOf, privateJson, sameSiteWrite, signInOrganization, signOutInstitutionalUser } from "@/lib/live/institutional-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ authenticated: false }, 401);
  try {
    const memberships = await membershipsOf(user.id);
    return privateJson({ authenticated: true, user, memberships });
  } catch { return privateJson({ error: "IDENTITY_UNAVAILABLE" }, 503); }
}

export async function POST(request: NextRequest) {
  if (!sameSiteWrite(request)) return privateJson({ error: "INVALID_ORIGIN" }, 403);
  if (!(request.headers.get("content-type") || "").startsWith("application/json"))
    return privateJson({ error: "INVALID_MEDIA_TYPE" }, 415);
  let values: { email?: unknown; password?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 4096) return privateJson({ error: "PAYLOAD_TOO_LARGE" }, 413);
    values = JSON.parse(raw) as typeof values;
  } catch { return privateJson({ error: "INVALID_JSON" }, 400); }
  if (typeof values.email !== "string" || values.email.length > 254 ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email) ||
    typeof values.password !== "string" || values.password.length < 8 || values.password.length > 1024)
    return privateJson({ error: "INVALID_CREDENTIALS" }, 400);
  try {
    const result = await signInOrganization(values.email, values.password);
    if ("error" in result) return privateJson({
      error: result.error === "AUTH_UNCONFIGURED" ? "AUTH_UNCONFIGURED" : "INVALID_CREDENTIALS",
    }, result.error === "AUTH_UNCONFIGURED" ? 503 : 401);
    return privateJson({ authenticated: true, user: result.user, memberships: result.memberships });
  } catch { return privateJson({ error: "LOGIN_UNAVAILABLE" }, 503); }
}

export async function DELETE(request: NextRequest) {
  if (!sameSiteWrite(request)) return privateJson({ error: "INVALID_ORIGIN" }, 403);
  await signOutInstitutionalUser();
  return privateJson({ signedOut: true });
}

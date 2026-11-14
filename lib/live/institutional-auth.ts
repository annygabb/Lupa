/**
 * LUPA Institutional Auth Gateway (no third-party dependency).
 *
 * The browser never receives database secret keys or session refresh tokens.
 * Access tokens are validated with Supabase Auth /user on every protected request.
 * Authorization comes from protected organization membership rows, NEVER from
 * user_metadata or a client-selected role.
 *
 * For deployment: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
 * and LUPA_SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY must refer to THE SAME
 * dedicated LUPA project.
 */
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { liveDb } from "@/lib/live/db";

const ACCESS = "lupa_org_access";
const REFRESH = "lupa_org_refresh";
export const MANAGER_ROLES = ["owner", "admin", "organizer"] as const;
export type ManagerRole = (typeof MANAGER_ROLES)[number];
export interface AuthUser { id: string; email: string | null }
export interface OrganizationMembership {
  organization_id: string;
  role: "owner" | "admin" | "organizer" | "viewer" | "curator";
}
interface AuthTokens { access_token: string; refresh_token: string; expires_in: number }
type CookieStore = Awaited<ReturnType<typeof cookies>>;

function authConfig() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.LUPA_SUPABASE_URL || "").replace(/\/+$/, "");
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(url) || !publishable)
    throw new Error("LUPA_AUTH_UNCONFIGURED");
  return { url, publishable };
}

export function authConfigured(): boolean {
  try { authConfig(); return true; } catch { return false; }
}

async function authRequest(path: string, init: RequestInit = {}) {
  const { url, publishable } = authConfig();
  return fetch(url + "/auth/v1/" + path, {
    ...init,
    cache: "no-store",
    headers: { apikey: publishable, "Content-Type": "application/json", ...init.headers },
  });
}

function saveCookies(store: CookieStore, tokens: AuthTokens) {
  const shared = {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const, path: "/",
  };
  store.set(ACCESS, tokens.access_token, {
    ...shared, maxAge: Math.max(1, Math.min(tokens.expires_in || 3600, 86400)),
  });
  store.set(REFRESH, tokens.refresh_token, { ...shared, maxAge: 60 * 60 * 24 * 7 });
}

export async function signInOrganization(email: string, password: string) {
  if (!authConfigured()) return { error: "AUTH_UNCONFIGURED" as const };
  const response = await authRequest("token?grant_type=password", {
    method: "POST", body: JSON.stringify({ email, password }),
  });
  if (!response.ok) return { error: "INVALID_CREDENTIALS" as const };
  const tokens = await response.json() as AuthTokens;
  if (!tokens.access_token || !tokens.refresh_token) return { error: "AUTH_INVALID_RESPONSE" as const };
  const user = await getUserByToken(tokens.access_token);
  if (!user) return { error: "AUTH_INVALID_USER" as const };
  const memberships = await membershipsOf(user.id);
  // Only provisioned institutional members may open a management session.
  if (!memberships.length) return { error: "NO_ORGANIZATION_ACCESS" as const };
  saveCookies(await cookies(), tokens);
  return { user, memberships };
}

async function getUserByToken(token: string): Promise<AuthUser | null> {
  if (!token) return null;
  const response = await authRequest("user", {
    method: "GET", headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) return null;
  const json = await response.json() as { id?: unknown; email?: unknown };
  if (typeof json.id !== "string" || !/^[a-f0-9-]{36}$/i.test(json.id)) return null;
  return { id: json.id, email: typeof json.email === "string" ? json.email : null };
}

export async function getInstitutionalUser(): Promise<AuthUser | null> {
  if (!authConfigured()) return null;
  const store = await cookies();
  let token = store.get(ACCESS)?.value || "";
  try {
    const user = token && await getUserByToken(token);
    if (user) return user;
    const refresh = store.get(REFRESH)?.value;
    if (!refresh) return null;
    const response = await authRequest("token?grant_type=refresh_token", {
      method: "POST", body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!response.ok) return null;
    const tokens = await response.json() as AuthTokens;
    if (!tokens.access_token || !tokens.refresh_token) return null;
    token = tokens.access_token;
    const refreshed = await getUserByToken(token);
    if (!refreshed) return null;
    saveCookies(store, tokens);
    return refreshed;
  } catch {
    // Fail closed on Auth downtime; do not trust unverified JWT payloads.
    return null;
  }
}

export async function signOutInstitutionalUser() {
  const store = await cookies();
  const token = store.get(ACCESS)?.value;
  if (token && authConfigured()) {
    try {
      await authRequest("logout", {
        method: "POST", headers: { Authorization: "Bearer " + token },
      });
    } catch { /* Cookies will still be cleared. */ }
  }
  store.delete(ACCESS);
  store.delete(REFRESH);
}

export async function membershipsOf(userId: string): Promise<OrganizationMembership[]> {
  if (!/^[a-f0-9-]{36}$/i.test(userId)) return [];
  return await liveDb<OrganizationMembership[]>(
    "lupa_organization_members?user_id=eq." + userId +
    "&select=organization_id,role&limit=100"
  );
}

export function mayManage(role: string): role is ManagerRole {
  return (MANAGER_ROLES as readonly string[]).includes(role);
}

export async function requireOrganizationManager(
  userId: string, organizationId: string
): Promise<boolean> {
  if (!/^[a-f0-9-]{36}$/i.test(organizationId)) return false;
  const memberships = await membershipsOf(userId);
  return memberships.some(m => m.organization_id === organizationId && mayManage(m.role));
}

export async function requireEventManager(
  userId: string, code: string
): Promise<boolean> {
  if (!/^[A-F0-9]{12}$/i.test(code)) return false;
  const events = await liveDb<Array<{ organization_id: string | null }>>(
    "lupa_live_events?code=eq." + code + "&select=organization_id&limit=1"
  );
  if (!events.length || !events[0].organization_id) return false;
  return requireOrganizationManager(userId, events[0].organization_id);
}

export function privateJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

export function sameSiteWrite(request: NextRequest) {
  const origin = request.headers.get("origin");
  // A missing Origin is not permission: use Fetch Metadata as defense in depth.
  const fetchSite = request.headers.get("sec-fetch-site");
  return origin === request.nextUrl.origin &&
    (!fetchSite || fetchSite === "same-origin");
}

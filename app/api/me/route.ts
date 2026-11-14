import { getInstitutionalUser, membershipsOf, privateJson } from "@/lib/live/institutional-auth";
import { liveDb } from "@/lib/live/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ error: "UNAUTHENTICATED" }, 401);
  try {
    const memberships = await membershipsOf(user.id);
    const rows = await liveDb<Array<{id: string; name: string; slug: string}>>(
      "lupa_organizations?select=id,name,slug&limit=100"
    );
    // Only return names of organizations to which this user belongs.
    const organizations = memberships.map(m => ({
      id: m.organization_id,
      role: m.role,
      name: rows.find(o => o.id === m.organization_id)?.name || "Instituição",
      slug: rows.find(o => o.id === m.organization_id)?.slug || "",
    }));
    return privateJson({ user, organizations });
  } catch { return privateJson({ error: "MEMBERSHIP_UNAVAILABLE" }, 503); }
}

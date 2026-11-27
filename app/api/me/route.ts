import { getInstitutionalUser, membershipsOf, privateJson } from "@/lib/live/institutional-auth";
import { liveDatabaseEnabled, liveDb } from "@/lib/live/db";
import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Conta autenticada e SOMENTE as organizações às quais ela pertence. */
export async function GET() {
  if (!liveDatabaseEnabled()) return privateJson({ error: "LIVE_UNCONFIGURED" }, 503);
  const user = await getInstitutionalUser();
  if (!user) return privateJson({ error: "UNAUTHENTICATED" }, 401);
  try {
    const memberships = (await membershipsOf(user.id)).filter(m => UUID.test(m.organization_id));
    const ids = memberships.map(m => m.organization_id);
    // Consulta só as organizações do usuário (antes lia todas e filtrava em memória).
    const rows = ids.length ? await liveDb<Array<{ id: string; name: string; slug: string }>>(
      "lupa_organizations?id=in.(" + ids.join(",") + ")&select=id,name,slug&limit=100"
    ) : [];
    const organizations = memberships.map(m => {
      const org = rows.find(o => o.id === m.organization_id);
      return { id: m.organization_id, role: m.role, name: org?.name || "Instituição", slug: org?.slug || "" };
    });
    return privateJson({ user, organizations });
  } catch (error) {
    log.error("api/me", "MEMBERSHIP_UNAVAILABLE", error);
    return privateJson({ error: "MEMBERSHIP_UNAVAILABLE" }, 503);
  }
}

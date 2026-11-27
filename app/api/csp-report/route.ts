import { log } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recebe relatórios de violação da Content-Security-Policy (report-uri).
 * Registra apenas a diretiva violada e a ORIGEM do recurso bloqueado (sem query string,
 * sem corpo da página, sem dados do usuário). Sempre responde 204.
 */
export async function POST(request: Request) {
  try {
    const raw = (await request.text()).slice(0, 8192);
    const parsed = JSON.parse(raw) as { "csp-report"?: Record<string, unknown> } | Array<{ body?: Record<string, unknown> }>;
    const report = Array.isArray(parsed) ? parsed[0]?.body ?? {} : parsed["csp-report"] ?? {};
    const blocked = String(report["blocked-uri"] ?? report.blockedURL ?? "");
    let blockedOrigin = blocked;
    try { blockedOrigin = new URL(blocked).origin; } catch { blockedOrigin = blocked.slice(0, 40); }
    const page = String(report["document-uri"] ?? report.documentURL ?? "");
    let pagePath = "";
    try { pagePath = new URL(page).pathname; } catch { /* ignorado */ }
    log.security("csp_violation", {
      directive: String(report["effective-directive"] ?? report["violated-directive"] ?? report.effectiveDirective ?? "").slice(0, 60),
      blockedOrigin: blockedOrigin.slice(0, 120),
      pagePath: pagePath.slice(0, 120),
    });
  } catch {
    // Relatório malformado: ignorar silenciosamente é intencional (endpoint público).
  }
  return new Response(null, { status: 204 });
}

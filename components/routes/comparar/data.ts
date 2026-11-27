/**
 * Dados e textos da rota /comparar. Toda a lógica científica vem de features/comparison
 * (compatibilidade, avisos, indicadores conferidos); aqui só organizamos a apresentação.
 */
import { reviewedMetrics, type ReviewedMetric } from "@/features/comparison/reviewed-metrics";
import { unifiedEvidenceCatalog, type UnifiedEvidenceRecord } from "@/features/evidence/unified-catalog";

/** Referências em ordem alfabética para os dois seletores. */
export const compareReferences = [...unifiedEvidenceCatalog].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

export const catalogSize = unifiedEvidenceCatalog.length;
export const projectionApprovedCount = unifiedEvidenceCatalog.filter(r => r.projectionApproved).length;
export const reviewedMetricCount = reviewedMetrics.length;

export const metricGroups = [
  { key: "composition", label: "Composição corporal", detail: "Peso, gordura e massa magra", items: ["M01", "M02", "M03"] },
  { key: "maintenance", label: "Continuidade", detail: "Manutenção e retirada", items: ["M04"] },
  { key: "psychological", label: "Saúde mental", detail: "Categorias PHQ-9", items: ["M05"] },
] as const;

export type MetricGroup = (typeof metricGroups)[number];

export function groupForMetric(metric: ReviewedMetric): MetricGroup {
  return metricGroups.find(g => g.items.some(id => id === metric.id)) ?? metricGroups[0];
}

/** "a | b | c" vira lista; texto vazio vira lista vazia. */
export function splitResults(text: string): string[] {
  return text.split(" | ").map(s => s.trim()).filter(Boolean);
}

/** Família de estudos legível ao público (ensaios nomeados); códigos internos não são exibidos. */
export function readableFamily(record: UnifiedEvidenceRecord): string | null {
  const f = record.studyFamily;
  if (!f || f.includes("_")) return null;
  return f;
}

export function formatReviewDate(iso: string): string {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

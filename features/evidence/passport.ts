/**
 * Passaporte da Evidência: resumo exportável e reprodutível de uma ficha do catálogo LUPA.
 *
 * Regras (prompt mestre §3, §5.4 e §6.2):
 * - Alias resolve para o registro canônico; nunca gera uma segunda evidência.
 * - Nenhum campo é inferido: o que não está nos dados catalogados vira `null`
 *   e aparece como "não informado na fonte catalogada".
 * - N só vem de campo estruturado conferido (indicadores M01–M05); o texto livre da
 *   população é preservado como está, sem extração automática de números.
 * - Revisão clínica independente é sempre pendente: o esquema rejeita qualquer outro valor.
 */
import { z } from "zod";
import { reviewedMetricsForEvidence } from "@/features/comparison/reviewed-metrics";
import { designNames, drugNames } from "@/lib/evidence-presentation";
import { getEvidenceById } from "./catalog";
import {
  getUnifiedEvidence, unifiedEvidenceCatalog,
  type DrugFilter, type EvidenceDesign, type UnifiedEvidenceRecord,
} from "./unified-catalog";

export const PASSPORT_SCHEMA_VERSION = "passport-v1" as const;
export const PASSPORT_MISSING = "não informado na fonte catalogada";
export const PASSPORT_DISCLAIMER =
  "Ferramenta educacional; sem revisão clínica independente; não é recomendação individual.";
const UNDETERMINED_FAMILY = "META_ANALYSIS_OVERLAP_UNDETERMINED";

const idSchema = z.string().regex(/^[EPR]\d{2}$/);
const httpsUrl = z.string().url().refine(url => url.startsWith("https://"), "A fonte precisa usar HTTPS");

// Rótulos públicos compartilhados com a interface (lib/evidence-presentation importa só tipos daqui).
const designLabels = designNames;
const exposureLabels = drugNames;
const designCodes = Object.keys(designLabels) as [EvidenceDesign, ...EvidenceDesign[]];
const exposureCodes = Object.keys(exposureLabels) as [DrugFilter, ...DrugFilter[]];

const checkedMetricSchema = z.strictObject({
  id: z.string().regex(/^M\d{2}$/),
  title: z.string().min(5),
  outcome: z.string().min(3),
  unit: z.string().min(1),
  timeWindow: z.string().min(8),
  estimator: z.string().min(5),
  analyzedN: z.number().int().positive(),
  denominatorStatus: z.enum(["by_arm_reported", "only_total_reported"]),
  arms: z.array(z.strictObject({
    label: z.string().min(2),
    sampleN: z.number().int().positive().nullable(),
    value: z.number().finite(),
    ciLower: z.number().finite().nullable(),
    ciUpper: z.number().finite().nullable(),
  })).min(1),
  sourceUrl: httpsUrl,
  sourceLocator: z.string().min(8),
  reviewedOn: z.string().date(),
  limitations: z.string().min(10),
  status: z.literal("primary_source_checked"),
  independentClinicalReview: z.literal(false),
});

export const evidencePassportSchema = z.strictObject({
  schemaVersion: z.literal(PASSPORT_SCHEMA_VERSION),
  exportedAt: z.string().datetime(),
  lupaId: idSchema,
  requestedId: idSchema,
  sourceIds: z.array(idSchema).min(1),
  aliases: z.array(idSchema),
  pmid: z.string().regex(/^\d{6,9}$/).nullable(),
  primaryUrl: httpsUrl,
  references: z.array(z.strictObject({ sourceId: idSchema, url: httpsUrl })).min(1),
  originalTitle: z.string().min(4),
  year: z.number().int().min(1900).max(2100).nullable(),
  sourceKind: z.enum(["publication", "regulatory"]),
  design: z.strictObject({ code: z.enum(designCodes), label: z.string().min(3) }),
  exposure: z.array(z.strictObject({ code: z.enum(exposureCodes), label: z.string().min(3) })).min(1).nullable(),
  population: z.array(z.string().min(1)).min(1).nullable(),
  sampleSize: z.strictObject({
    total: z.number().int().positive(),
    byArm: z.array(z.strictObject({ label: z.string().min(2), n: z.number().int().positive() })).min(1).nullable(),
    sourceMetricId: z.string().regex(/^M\d{2}$/),
  }).nullable(),
  reportedResult: z.array(z.string().min(1)).min(1).nullable(),
  limitations: z.string().min(4).nullable(),
  studyFamily: z.strictObject({
    code: z.string().min(2),
    overlapUndetermined: z.boolean(),
    relatedIds: z.array(idSchema),
  }).nullable(),
  reviewStatus: z.strictObject({
    cataloguing: z.literal("candidate"),
    documentaryCheck: z.strictObject({
      checked: z.boolean(),
      label: z.enum(["conferida", "pendente"]),
      basis: z.string().min(5).nullable(),
    }).refine(v => v.checked === (v.label === "conferida") && v.checked === (v.basis !== null),
      "Status de conferência documental inconsistente"),
    independentClinicalReview: z.strictObject({
      done: z.literal(false),
      label: z.literal("pendente"),
    }),
  }),
  checkedMetrics: z.array(checkedMetricSchema),
  projectionApproved: z.literal(false),
  disclaimer: z.literal(PASSPORT_DISCLAIMER),
}).superRefine((v, ctx) => {
  if (v.sourceIds[0] !== v.lupaId)
    ctx.addIssue({ code: "custom", path: ["sourceIds"], message: "O primeiro identificador deve ser o canônico" });
  if (!v.sourceIds.includes(v.requestedId))
    ctx.addIssue({ code: "custom", path: ["requestedId"], message: "Identificador acessado não pertence ao registro" });
  if (v.aliases.includes(v.lupaId) || v.aliases.length !== v.sourceIds.length - 1)
    ctx.addIssue({ code: "custom", path: ["aliases"], message: "Aliases inconsistentes com os identificadores" });
  if (new Set(v.sourceIds).size !== v.sourceIds.length)
    ctx.addIssue({ code: "custom", path: ["sourceIds"], message: "Identificador duplicado" });
});
export type EvidencePassport = z.infer<typeof evidencePassportSchema>;

/** Segmentos " | " e "•" viram lista; "Prioridade: P0" é campo interno da fila de curadoria. */
function segments(text: string): string[] | null {
  const parts = text.split(/\s*[|•]\s*/).map(s => s.replace(/\s+/g, " ").trim())
    .filter(s => s && !/^prioridade\s*:/i.test(s));
  return parts.length ? parts : null;
}

/** Conferência documental: só com indicador M01–M05 ou nota explícita de conferência no catálogo. */
function documentaryCheck(record: UnifiedEvidenceRecord, metricIds: readonly string[]) {
  if (metricIds.length) {
    return {
      checked: true, label: "conferida" as const,
      basis: "Indicador(es) " + metricIds.join(", ") + " conferido(s) na fonte primária",
    };
  }
  const note = getEvidenceById(record.id)?.sourceVerificationNote ?? null;
  if (note && /\bconferid[oa]\b/i.test(note) && !/pendente/i.test(note)) {
    return { checked: true, label: "conferida" as const, basis: "Nota de verificação do catálogo: " + note };
  }
  return { checked: false, label: "pendente" as const, basis: null };
}

/** N apenas quando os indicadores conferidos do registro concordam em um único total. */
function sampleSizeFrom(metrics: ReturnType<typeof reviewedMetricsForEvidence>): EvidencePassport["sampleSize"] {
  if (!metrics.length) return null;
  const totals = new Set(metrics.map(m => m.analyzedN));
  if (totals.size !== 1) return null;
  const first = metrics[0];
  const byArm = first.denominatorStatus === "by_arm_reported" && first.arms.every(a => a.sampleN !== null)
    ? first.arms.map(a => ({ label: a.label, n: a.sampleN as number }))
    : null;
  return { total: first.analyzedN, byArm, sourceMetricId: first.id };
}

export function buildEvidencePassport(
  id: unknown,
  options: { exportedAt?: Date } = {},
): EvidencePassport | null {
  if (typeof id !== "string" || id.length > 12) return null;
  const requestedId = id.trim().toUpperCase();
  if (!idSchema.safeParse(requestedId).success) return null;
  const record = getUnifiedEvidence(requestedId);
  if (!record) return null;

  const metrics = reviewedMetricsForEvidence(record.id);
  const family = record.studyFamily;
  const passport: EvidencePassport = {
    schemaVersion: PASSPORT_SCHEMA_VERSION,
    exportedAt: (options.exportedAt ?? new Date()).toISOString(),
    lupaId: record.id,
    requestedId,
    sourceIds: [...record.sourceIds],
    aliases: record.sourceIds.filter(s => s !== record.id),
    pmid: record.pmid,
    primaryUrl: record.url,
    references: record.references.map(r => ({ sourceId: r.sourceId, url: r.url })),
    originalTitle: record.title,
    year: record.year,
    sourceKind: record.sourceKind,
    design: { code: record.design, label: designLabels[record.design] },
    exposure: record.drugs.length ? record.drugs.map(code => ({ code, label: exposureLabels[code] })) : null,
    population: segments(record.populationSummary),
    sampleSize: sampleSizeFrom(metrics),
    reportedResult: segments(record.resultsSummary),
    limitations: record.limitations.trim() || null,
    studyFamily: family ? {
      code: family,
      overlapUndetermined: family === UNDETERMINED_FAMILY,
      relatedIds: family === UNDETERMINED_FAMILY ? [] :
        unifiedEvidenceCatalog.filter(r => r.id !== record.id && r.studyFamily === family).map(r => r.id),
    } : null,
    reviewStatus: {
      cataloguing: record.curationStatus,
      documentaryCheck: documentaryCheck(record, metrics.map(m => m.id)),
      independentClinicalReview: { done: false, label: "pendente" },
    },
    checkedMetrics: metrics.map(m => ({
      id: m.id, title: m.title, outcome: m.outcome, unit: m.unit,
      timeWindow: m.timeWindow, estimator: m.estimator,
      analyzedN: m.analyzedN, denominatorStatus: m.denominatorStatus,
      arms: m.arms.map(a => ({ label: a.label, sampleN: a.sampleN, value: a.value, ciLower: a.ciLower, ciUpper: a.ciUpper })),
      sourceUrl: m.sourceUrl, sourceLocator: m.sourceLocator, reviewedOn: m.reviewedOn,
      limitations: m.limitations, status: m.displayStatus,
      independentClinicalReview: m.independentClinicalReview,
    })),
    projectionApproved: record.projectionApproved,
    disclaimer: PASSPORT_DISCLAIMER,
  };
  return evidencePassportSchema.parse(passport);
}

export function passportToJSON(passport: EvidencePassport): string {
  return JSON.stringify(evidencePassportSchema.parse(passport), null, 2);
}

/** Reabre um passaporte exportado; lança erro se o arquivo não respeitar o esquema. */
export function parsePassportJSON(text: string): EvidencePassport {
  return evidencePassportSchema.parse(JSON.parse(text));
}

export function passportFileName(passport: Pick<EvidencePassport, "lupaId">, ext: "json" | "md"): string {
  return "lupa-passaporte-" + idSchema.parse(passport.lupaId) + "." + ext;
}

function fmtNumber(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}
function fmtSigned(value: number, unit: string): string {
  return (value > 0 ? "+" : "") + value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + unit;
}
/** Evita que texto do catálogo seja lido como marcação Markdown/HTML. */
function md(text: string): string {
  return text.replace(/[\\`*_[\]<>#|]/g, ch => "\\" + ch);
}
function orMissing(value: string | null): string {
  return value === null ? PASSPORT_MISSING : md(value);
}

export function passportReviewSummary(passport: EvidencePassport): string {
  const s = passport.reviewStatus;
  return "candidato em curadoria · conferência documental " + s.documentaryCheck.label +
    " · revisão clínica independente " + s.independentClinicalReview.label;
}

export function passportToMarkdown(passport: EvidencePassport): string {
  const p = evidencePassportSchema.parse(passport);
  const s = p.reviewStatus;
  const lines: string[] = [
    "# Passaporte da Evidência — " + p.lupaId,
    "",
    "> **Aviso:** " + p.disclaimer,
    "> Registro em curadoria; não autorizado para projeções populacionais.",
    "",
    "## Identificação",
    "",
    "- **ID LUPA (canônico):** " + p.lupaId,
    "- **Identificadores de origem:** " + p.sourceIds.join(", "),
    "- **Aliases:** " + (p.aliases.length ? p.aliases.join(", ") : "nenhum"),
    "- **PMID:** " + orMissing(p.pmid),
    "- **Fonte original:** <" + p.primaryUrl + ">",
    "- **Título original:** " + md(p.originalTitle),
    "- **Ano:** " + (p.year === null ? PASSPORT_MISSING : String(p.year)),
    "- **Tipo de fonte / desenho:** " + (p.sourceKind === "regulatory" ? "Documento oficial" : "Publicação científica") + " · " + p.design.label,
    "- **Medicamento / exposição:** " + (p.exposure ? p.exposure.map(e => e.label).join(", ") : PASSPORT_MISSING),
    "",
    "## Status de revisão",
    "",
    "- **Catalogação:** candidato (" + s.cataloguing + ")",
    "- **Conferência documental:** " + s.documentaryCheck.label + (s.documentaryCheck.basis ? " — " + md(s.documentaryCheck.basis) : ""),
    "- **Revisão clínica independente:** " + s.independentClinicalReview.label,
    "",
    "## População",
    "",
    ...(p.population ? p.population.map(x => "- " + md(x)) : ["- " + PASSPORT_MISSING]),
    "",
    "**N (campo estruturado conferido):** " + (p.sampleSize
      ? fmtNumber(p.sampleSize.total) + " (" + p.sampleSize.sourceMetricId + ")" +
        (p.sampleSize.byArm ? " — " + p.sampleSize.byArm.map(a => md(a.label) + ": " + fmtNumber(a.n)).join("; ") : " — N por braço " + PASSPORT_MISSING)
      : PASSPORT_MISSING),
    "",
    "## O que o estudo observou",
    "",
    ...(p.reportedResult ? p.reportedResult.map(x => "- " + md(x)) : ["- " + PASSPORT_MISSING]),
    "",
    "## O que o estudo não prova",
    "",
    "- " + orMissing(p.limitations),
    ...p.checkedMetrics.map(m => "- " + m.id + ": " + md(m.limitations)),
    "",
    "## Família / coorte",
    "",
    p.studyFamily
      ? "- " + md(p.studyFamily.code) + (p.studyFamily.overlapUndetermined
        ? " (sobreposição de participantes não determinada)"
        : p.studyFamily.relatedIds.length ? " — também no catálogo: " + p.studyFamily.relatedIds.join(", ") + ". Não some amostras." : "")
      : "- " + PASSPORT_MISSING,
    "",
    "## Indicadores conferidos vinculados",
    "",
    ...(p.checkedMetrics.length ? p.checkedMetrics.flatMap(m => [
      "### " + m.id + " — " + md(m.title),
      "",
      "- **Desfecho:** " + md(m.outcome) + " · " + md(m.timeWindow),
      "- **Estimador:** " + md(m.estimator),
      ...m.arms.map(a => "- **" + md(a.label) + ":** " + fmtSigned(a.value, m.unit) +
        (a.ciLower !== null && a.ciUpper !== null ? " (IC 95% " + fmtSigned(a.ciLower, m.unit) + " a " + fmtSigned(a.ciUpper, m.unit) + ")" : "") +
        " · n " + (a.sampleN === null ? PASSPORT_MISSING : fmtNumber(a.sampleN))),
      "- **N analisado:** " + fmtNumber(m.analyzedN),
      "- **Localização na fonte:** " + md(m.sourceLocator) + " — <" + m.sourceUrl + ">",
      "- **Conferido em:** " + m.reviewedOn + " · revisão clínica independente pendente",
      "",
    ]) : ["- Nenhum indicador numérico conferido para esta ficha.", ""]),
    "## Fontes",
    "",
    ...p.references.map(r => "- " + r.sourceId + ": <" + r.url + ">"),
    "",
    "---",
    "",
    "Esquema " + p.schemaVersion + " · exportado em " + p.exportedAt + " · LUPA Saúde",
    "",
    "_" + p.disclaimer + "_",
    "",
  ];
  return lines.join("\n");
}

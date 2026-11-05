import { z } from "zod";
import seed from "./catalog.seed.json";

export const catalogRecordSchema = z.strictObject({
  legacyId: z.string().regex(/^E\d{2}$/),
  title: z.string().min(4),
  topic: z.string().min(2),
  year: z.number().int().min(1900).max(2100),
  sourceUrl: z.string().url().refine((url) => url.startsWith("https://"), "HTTPS obrigatório"),
  populationAndArms: z.string(),
  resultsSummary: z.string(),
  limitations: z.string().min(4),
  studyFamily: z.string().nullable(),
  studyFamilyNote: z.string().min(2),
  sourceVerificationNote: z.string().min(2),
  rateUseNote: z.string().min(2),
  sourceType: z.enum(["clinical_trial", "post_hoc", "consensus", "observational",
    "meta_analysis", "systematic_review", "pharmacovigilance", "regulatory"]),
  curationStatus: z.literal("candidate"),
  projectionApproved: z.literal(false),
});
export type CatalogRecord = z.infer<typeof catalogRecordSchema>;

// Registros candidatos com resumos já presentes na documentação, não fatos liberados para projeção.
export const evidenceCatalog: readonly CatalogRecord[] = Object.freeze(
  z.array(catalogRecordSchema).length(14).parse(seed),
);
const byId = new Map(evidenceCatalog.map((entry) => [entry.legacyId, entry]));
if (byId.size !== evidenceCatalog.length) {
  throw new Error("IDs científicos duplicados");
}
export function getEvidenceById(id: string): CatalogRecord | undefined {
  return byId.get(id);
}
export function searchEvidence(query: string): CatalogRecord[] {
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  if (!normalized) return [...evidenceCatalog];
  return evidenceCatalog.filter((item) =>
    [item.legacyId, item.title, item.topic, item.resultsSummary, item.limitations]
      .some((text) => text.toLocaleLowerCase("pt-BR").includes(normalized)),
  );
}
export function listOverlappingFamilies(): ReadonlyMap<string, readonly string[]> {
  const families = new Map<string, string[]>();
  for (const item of evidenceCatalog) {
    if (!item.studyFamily) continue;
    families.set(item.studyFamily, [...(families.get(item.studyFamily) ?? []), item.legacyId]);
  }
  return new Map([...families].filter(([, ids]) => ids.length > 1));
}

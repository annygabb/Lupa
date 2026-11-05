import { z } from "zod";
import type { CatalogRecord } from "./catalog";

// A decisão humana de projeção é separada de uma simples extração ou leitura de resumo.
export const projectionCandidateSchema = z.strictObject({
  reviewStatus: z.enum(["candidate","extracted","reviewed","approved_for_display",
    "approved_for_projection","rejected"]),
  sourceType: z.enum(["clinical_trial","post_hoc","consensus","observational",
    "meta_analysis","systematic_review","pharmacovigilance","regulatory"]),
  publicationId: z.string().min(1),
  cohortId: z.string().min(1),
  outcomeCode: z.string().min(1),
  measureKind: z.enum(["count","proportion","mean","change","rate","textual"]),
  sourceLocator: z.string().nullable(),
  reportedUnit: z.string().nullable(),
  followupWeeks: z.number().finite().positive().nullable(),
  analyzedN: z.number().int().positive().nullable(),
  numerator: z.number().int().nonnegative().nullable(),
  denominator: z.number().int().positive().nullable(),
  personTimeDenominator: z.number().finite().positive().nullable(),
  populationCompatibilityReviewed: z.boolean(),
  timeCompatibilityReviewed: z.boolean(),
  overlapChecked: z.boolean(),
  associationOnly: z.boolean(),
  hypotheticalDrugIcuLink: z.boolean(),
  effectMeasure: z.enum(["RR","OR","HR","mean_difference","percentage_points"]).nullable(),
  baselineRiskReviewed: z.boolean(),
});
export type ProjectionCandidate = z.infer<typeof projectionCandidateSchema>;
export type EvidenceBlockCode =
  | "INVALID_INPUT" | "NOT_APPROVED" | "SOURCE_NOT_SUITABLE" | "MISSING_SOURCE_LOCATOR"
  | "MISSING_FOLLOWUP" | "MISSING_UNIT" | "MISSING_SAMPLE" | "MISSING_DENOMINATOR"
  | "INVALID_FRACTION" | "MISSING_PERSON_TIME" | "NOT_NUMERIC"
  | "POPULATION_UNREVIEWED" | "TIME_UNREVIEWED" | "OVERLAP_UNREVIEWED"
  | "ASSOCIATION_NOT_CAUSAL" | "ICU_LINK_UNPROVEN" | "OR_WITHOUT_BASELINE_RISK";
export type ProjectionAssessment = { allowed: boolean; blockers: EvidenceBlockCode[] };

export function assessProjectionEligibility(input: unknown): ProjectionAssessment {
  const parsed = projectionCandidateSchema.safeParse(input);
  if (!parsed.success) return { allowed: false, blockers: ["INVALID_INPUT"] };
  const v = parsed.data;
  const blockers: EvidenceBlockCode[] = [];
  if (v.reviewStatus !== "approved_for_projection") blockers.push("NOT_APPROVED");
  if (["regulatory","pharmacovigilance","consensus"].includes(v.sourceType))
    blockers.push("SOURCE_NOT_SUITABLE");
  if (!v.sourceLocator?.trim()) blockers.push("MISSING_SOURCE_LOCATOR");
  if (v.followupWeeks === null) blockers.push("MISSING_FOLLOWUP");
  if (!v.reportedUnit?.trim()) blockers.push("MISSING_UNIT");
  if (v.analyzedN === null) blockers.push("MISSING_SAMPLE");
  if (v.measureKind === "textual") blockers.push("NOT_NUMERIC");
  if (v.measureKind === "proportion" || v.measureKind === "count") {
    if (v.numerator === null || v.denominator === null) blockers.push("MISSING_DENOMINATOR");
    else if (v.numerator > v.denominator) blockers.push("INVALID_FRACTION");
  }
  if (v.measureKind === "rate" && v.personTimeDenominator === null)
    blockers.push("MISSING_PERSON_TIME");
  if (!v.populationCompatibilityReviewed) blockers.push("POPULATION_UNREVIEWED");
  if (!v.timeCompatibilityReviewed) blockers.push("TIME_UNREVIEWED");
  if (!v.overlapChecked) blockers.push("OVERLAP_UNREVIEWED");
  if (v.associationOnly) blockers.push("ASSOCIATION_NOT_CAUSAL");
  if (v.hypotheticalDrugIcuLink) blockers.push("ICU_LINK_UNPROVEN");
  if (v.effectMeasure === "OR" && !v.baselineRiskReviewed)
    blockers.push("OR_WITHOUT_BASELINE_RISK");
  return { allowed: blockers.length === 0, blockers };
}

// Não soma participantes de subestudos como coortes independentes.
export function findPotentiallyOverlappingPublications(records: readonly CatalogRecord[]) {
  const seen = new Map<string,string>();
  const duplicateFamilies: { family: string; first: string; second: string }[] = [];
  for (const record of records) {
    if (!record.studyFamily) continue;
    const previous = seen.get(record.studyFamily);
    if (previous) duplicateFamilies.push({
      family: record.studyFamily, first: previous, second: record.legacyId,
    });
    else seen.set(record.studyFamily, record.legacyId);
  }
  return duplicateFamilies;
}

import { getUnifiedEvidence, getCatalogAudit, type UnifiedEvidenceRecord } from "@/features/evidence/unified-catalog";
import { assessStudyComparison, type ComparisonWarningCode } from "@/features/comparison/compatibility";
import { assessProjectionEligibility } from "@/features/evidence/projection-guard";
import { explainBlockers } from "./blocker-copy";
import {
  classificationLabel, classificationRank, evidenceLensClaims, reviewStatusLabel,
  type ClaimClassification, type EvidenceLensClaim,
} from "./claims";

/**
 * LUPA Evidence Engine — interpretação DETERMINÍSTICA e rastreável.
 * 1. resolve o claim curado; 2. recupera as evidências canônicas (aliases colapsados);
 * 3. aplica as regras existentes (compatibilidade e elegibilidade de projeção);
 * 4. devolve a classificação mais rigorosa entre a curadoria e as regras.
 * Não usa IA, não calcula efeito clínico e não promove nenhum estudo a "revisado".
 */
export const ENGINE_METHOD = "deterministic-curated" as const;
export const ENGINE_VERSION = "lupa-interpret-v1" as const;

/** Avisos de compatibilidade que, sozinhos, impedem uma conclusão que dependa dos dois estudos. */
const NON_COMPARABLE_WARNINGS: readonly ComparisonWarningCode[] = [
  "MUSCLE_ICU_INDIRECT_LINK", "DIFFERENT_OUTCOMES", "DIFFERENT_DRUGS", "SAME_REFERENCE",
];

export interface InterpretedEvidence {
  requestedId: string; id: string; aliasResolved: boolean;
  title: string; year: number | null; pmid: string | null; url: string;
  design: UnifiedEvidenceRecord["design"]; curationStatus: "candidate";
  passportHref: string;
}

export interface Interpretation {
  claimId: string;
  question: string;
  classification: ClaimClassification;
  classificationLabel: string;
  curatedClassification: ClaimClassification;
  /** Verdadeiro quando as regras foram mais rigorosas que a curadoria editorial. */
  tightenedByRules: boolean;
  summary: string;
  explanation: string;
  allowedConclusion: string;
  prohibitedExtrapolations: readonly string[];
  evidence: InterpretedEvidence[];
  missingEvidenceIds: string[];
  comparison: null | {
    left: string; right: string; compareHref: string;
    canShowSideBySide: boolean; canPoolNumericalEstimates: false;
    warnings: { code: ComparisonWarningCode; label: string; explanation: string }[];
  };
  projection: null | { allowed: boolean; blockers: { code: string; title: string; why: string }[] };
  reviewStatus: EvidenceLensClaim["reviewStatus"];
  reviewStatusLabel: string;
  clinicalReviewPending: boolean;
  sourceNotes: readonly string[];
  method: typeof ENGINE_METHOD;
  engineVersion: typeof ENGINE_VERSION;
  catalog: { canonicalRecords: number; sourceIds: number; readyForProjection: number };
}

function strictest(a: ClaimClassification, b: ClaimClassification): ClaimClassification {
  return classificationRank[a] >= classificationRank[b] ? a : b;
}

export function interpretClaim(
  claimId: string,
  claims: readonly EvidenceLensClaim[] = evidenceLensClaims,
): Interpretation | null {
  const claim = claims.find(c => c.id === claimId);
  if (!claim) return null;

  // Evidências: aliases viram o registro canônico e nunca contam duas vezes.
  const seen = new Set<string>();
  const evidence: InterpretedEvidence[] = [];
  const missingEvidenceIds: string[] = [];
  for (const requestedId of claim.evidenceIds) {
    const record = getUnifiedEvidence(requestedId);
    if (!record) { missingEvidenceIds.push(requestedId); continue; }
    if (seen.has(record.id)) continue;
    seen.add(record.id);
    evidence.push({
      requestedId, id: record.id, aliasResolved: requestedId !== record.id,
      title: record.title, year: record.year, pmid: record.pmid, url: record.url,
      design: record.design, curationStatus: record.curationStatus,
      passportHref: `/evidencias/${record.id}`,
    });
  }

  let ruleClass: ClaimClassification = "supported_in_context";
  if (missingEvidenceIds.length || (claim.kind === "evidence" && evidence.length === 0)) ruleClass = strictest(ruleClass, "insufficient_evidence");

  let comparison: Interpretation["comparison"] = null;
  if (claim.comparePair) {
    const [l, r] = claim.comparePair.map(id => getUnifiedEvidence(id));
    if (l && r) {
      const assessment = assessStudyComparison(l, r);
      comparison = {
        left: l.id, right: r.id, compareHref: `/comparar?a=${l.id}&b=${r.id}`,
        canShowSideBySide: assessment.canShowSideBySide, canPoolNumericalEstimates: false,
        warnings: assessment.warnings.map(w => ({ code: w.code, label: w.label, explanation: w.explanation })),
      };
      if (assessment.warnings.some(w => NON_COMPARABLE_WARNINGS.includes(w.code))) ruleClass = strictest(ruleClass, "not_comparable");
    } else {
      ruleClass = strictest(ruleClass, "insufficient_evidence");
    }
  }

  let projection: Interpretation["projection"] = null;
  if (claim.projectionProbe) {
    const result = assessProjectionEligibility(claim.projectionProbe);
    projection = { allowed: result.allowed, blockers: explainBlockers(result.blockers) };
    if (!result.allowed && claim.kind === "projection") ruleClass = strictest(ruleClass, "insufficient_evidence");
  }

  const classification = strictest(claim.classification, ruleClass);
  const audit = getCatalogAudit();
  return {
    claimId: claim.id,
    question: claim.question,
    classification,
    classificationLabel: classificationLabel[classification],
    curatedClassification: claim.classification,
    tightenedByRules: classification !== claim.classification,
    summary: claim.shortAnswer,
    explanation: claim.explanation,
    allowedConclusion: claim.allowedConclusion,
    prohibitedExtrapolations: claim.prohibitedExtrapolations,
    evidence,
    missingEvidenceIds,
    comparison,
    projection,
    reviewStatus: claim.reviewStatus,
    reviewStatusLabel: reviewStatusLabel[claim.reviewStatus],
    clinicalReviewPending: claim.reviewStatus !== "independently_reviewed",
    sourceNotes: claim.sourceNotes,
    method: ENGINE_METHOD,
    engineVersion: ENGINE_VERSION,
    catalog: {
      canonicalRecords: audit.canonicalRecords,
      sourceIds: audit.originalRecords + audit.supplementalSources,
      readyForProjection: audit.readyForProjection,
    },
  };
}

export function listClaims() {
  return evidenceLensClaims.map(c => ({ id: c.id, title: c.title, question: c.question, kind: c.kind }));
}

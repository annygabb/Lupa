import { describe, expect, it } from "vitest";
import { catalogRecordSchema, evidenceCatalog, getEvidenceById, searchEvidence } from "../../features/evidence/catalog";
import { dataModelSchemas, outcomeObservationsSchema } from "../../features/evidence/contracts";
import { assessProjectionEligibility, findPotentiallyOverlappingPublications } from "../../features/evidence/projection-guard";

describe("Catálogo científico da Etapa 2", () => {
  it("carrega exatamente as 14 referências aprovadas para curadoria inicial", () => {
    expect(evidenceCatalog).toHaveLength(14);
    expect(new Set(evidenceCatalog.map(x => x.legacyId)).size).toBe(14);
    expect(evidenceCatalog.every(x => catalogRecordSchema.safeParse(x).success)).toBe(true);
  });
  it("preserva fonte, resultado e limitação, sem liberar projeções", () => {
    for (const item of evidenceCatalog) {
      expect(item.sourceUrl).toMatch(/^https:\/\//);
      expect(item.resultsSummary.length).toBeGreaterThan(15);
      expect(item.limitations.length).toBeGreaterThan(10);
      expect(item.projectionApproved).toBe(false);
      expect(item.curationStatus).toBe("candidate");
    }
  });
  it("recupera os estudos de massa magra e UTI", () => {
    expect(getEvidenceById("E04")?.studyFamily).toBe("SURMOUNT-1");
    expect(getEvidenceById("E12")?.topic).toBe("UTI");
    expect(searchEvidence("sarcopenia").length).toBeGreaterThan(0);
  });
  it("não permite somar subestudo SURMOUNT-1 como pesquisa independente", () => {
    const pairs = findPotentiallyOverlappingPublications(evidenceCatalog);
    expect(pairs.some(p => p.first === "E01" && p.second === "E04")).toBe(true);
  });
  it("rejeita um link não seguro e dados liberados sem revisão", () => {
    const candidate = evidenceCatalog[0];
    expect(catalogRecordSchema.safeParse({...candidate, sourceUrl:"http://invalid.example"}).success).toBe(false);
    expect(catalogRecordSchema.safeParse({...candidate, projectionApproved:true}).success).toBe(false);
  });
});

describe("Contratos da modelagem relacional", () => {
  it("cobre as 20 entidades do dicionário aprovado", () => {
    expect(Object.keys(dataModelSchemas)).toHaveLength(20);
  });
  it("rejeita proporção com numerador maior que denominador", () => {
    const invalid = {
      id:"11111111-1111-4111-8111-111111111111",
      publication_id:"22222222-2222-4222-8222-222222222222",
      cohort_id:"33333333-3333-4333-8333-333333333333",
      arm_id:null,
      outcome_id:"44444444-4444-4444-8444-444444444444",
      followup_weeks:52,
      measure_kind:"proportion",
      reported_value:120,
      reported_unit:"%",
      numerator:24,
      denominator:20,
      sd_value:null, ci_lower:null, ci_upper:null, ci_level:null,
      source_locator:"Figura 1", is_projection_eligible:false, extraction_note:null,
    };
    const result = outcomeObservationsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

const approvedSynthetic = {
  reviewStatus:"approved_for_projection",sourceType:"clinical_trial",
  publicationId:"publication-synthetic",cohortId:"cohort-synthetic",
  outcomeCode:"event_pct", measureKind:"proportion",sourceLocator:"Tabela 2",
  reportedUnit:"%",followupWeeks:52,analyzedN:200,
  numerator:20,denominator:200,personTimeDenominator:null,
  populationCompatibilityReviewed:true,timeCompatibilityReviewed:true,overlapChecked:true,
  associationOnly:false,hypotheticalDrugIcuLink:false,
  effectMeasure:null,baselineRiskReviewed:true,
} as const;

describe("Evidence Guard", () => {
  it("aceita apenas candidato sintético integralmente revisado", () => {
    expect(assessProjectionEligibility(approvedSynthetic).allowed).toBe(true);
  });
  it("bloqueia dados sem denominador", () => {
    const result=assessProjectionEligibility({...approvedSynthetic,denominator:null});
    expect(result.blockers).toContain("MISSING_DENOMINATOR");
  });
  it("bloqueia sinais de farmacovigilância como incidência", () => {
    const result=assessProjectionEligibility({...approvedSynthetic,sourceType:"pharmacovigilance"});
    expect(result.blockers).toContain("SOURCE_NOT_SUITABLE");
  });
  it("bloqueia hipótese causal entre tirzepatida e desfechos de UTI", () => {
    const result=assessProjectionEligibility({...approvedSynthetic,associationOnly:true,hypotheticalDrugIcuLink:true});
    expect(result.blockers).toContain("ASSOCIATION_NOT_CAUSAL");
    expect(result.blockers).toContain("ICU_LINK_UNPROVEN");
  });
  it("bloqueia OR sem risco basal", () => {
    const result=assessProjectionEligibility({...approvedSynthetic,effectMeasure:"OR",baselineRiskReviewed:false});
    expect(result.blockers).toContain("OR_WITHOUT_BASELINE_RISK");
  });
  it("bloqueia dados apenas extraídos, ainda sem aprovação de projeção", () => {
    expect(assessProjectionEligibility({...approvedSynthetic,reviewStatus:"extracted"}).blockers).toContain("NOT_APPROVED");
  });
});

import { describe, expect, it } from "vitest";
import { assessStudyComparison } from "../../features/comparison/compatibility";
import { friendlyCompatibilityWarnings, getCompatibilityVerdict } from "../../features/comparison/compatibility-copy";
import { reviewedMetrics } from "../../features/comparison/reviewed-metrics";
import { getUnifiedEvidence } from "../../features/evidence/unified-catalog";

const ref=(id:string)=>getUnifiedEvidence(id)!;

describe("Etapa 4B — UX científica de compatibilidade",()=>{
  it("apresenta veredito contextual sem liberação de números",()=>{
    const assessment=assessStudyComparison(ref("E04"),ref("E12"));
    const v=getCompatibilityVerdict(assessment);
    expect(v.title).toBe("Comparação descritiva disponível");
    expect(v.statusLabel).toBe("Comparação contextual");
    expect(v.subtitle).toContain("não foi demonstrada");
    expect(assessment.canPoolNumericalEstimates).toBe(false);
  });
  it("distingue referências idênticas e aliases",()=>{
    const assessment=assessStudyComparison(ref("E04"),ref("P20"));
    const v=getCompatibilityVerdict(assessment);
    expect(v.type).toBe("unavailable");
    expect(v.title).toBe("Selecione dois estudos diferentes");
    expect(assessment.canShowSideBySide).toBe(false);
  });
  it("mostra relação causal não demonstrada antes de alertas genéricos",()=>{
    const warnings=friendlyCompatibilityWarnings(assessStudyComparison(ref("E12"),ref("E04")));
    expect(warnings[0].code).toBe("MUSCLE_ICU_INDIRECT_LINK");
    expect(warnings[0].title).toBe("Ligação causal não demonstrada");
    expect(warnings.some(x=>x.code==="DIFFERENT_DESIGNS")).toBe(true);
    expect(warnings.some(x=>x.code==="BOTH_PENDING_CURATOR_REVIEW")).toBe(false);
  });
});

describe("Etapa 4B — cartões, gráfico e layouts",()=>{
  it("não altera dados numéricos ou critérios de aprovação da Etapa 4",()=>{
    expect(reviewedMetrics.map(x=>x.id)).toEqual(["M01","M02","M03","M04","M05"]);
    expect(reviewedMetrics.every(x=>x.approvedForPopulationProjection===false)).toBe(true);
    expect(reviewedMetrics.every(x=>x.independentClinicalReview===false)).toBe(true);
  });
});

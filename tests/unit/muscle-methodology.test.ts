import { describe,expect,it } from "vitest";
import {
  evaluateMuscleIcuCausalChain, getResearchClaim, muscleClaims, researchQuestions,
  researchClaimSchema,
} from "../../features/muscle/evidence-map";
import { reviewedMetrics } from "../../features/comparison/reviewed-metrics";
import { getUnifiedEvidence } from "../../features/evidence/unified-catalog";

describe("Etapa 5 — músculo, função e UTI",()=>{
  it("registra quatro interpretações auditáveis sem misturar causalidade",()=>{
    expect(muscleClaims).toHaveLength(4);
    expect(researchQuestions).toHaveLength(4);
    for(const claim of muscleClaims){
      expect(researchClaimSchema.safeParse(claim).success).toBe(true);
      expect(claim.url.startsWith("https://")).toBe(true);
      expect(claim.evidenceIds.every(id=>getUnifiedEvidence(id))).toBe(true);
    }
  });
  it("não transforma massa magra em diagnóstico nem OR em risco absoluto",()=>{
    expect(getResearchClaim("C01")!.notInferred).toContain("sarcopenia");
    expect(getResearchClaim("C02")!.summary).toContain("força muscular");
    expect(getResearchClaim("C03")!.notInferred).toContain("probabilidade absoluta");
    expect(getResearchClaim("C04")!.notInferred).toContain("OR");
  });
  it("bloqueia a ponte causal sem dados longitudinais e comparáveis",()=>{
    const chain=evaluateMuscleIcuCausalChain();
    expect(chain.supported).toBe(false);
    expect(chain.missing).toHaveLength(4);
    expect(chain.message).toContain("não foi estabelecida");
  });
  it("não houve liberação de projeção clínica em decorrência da nova análise",()=>{
    expect(reviewedMetrics.every(m=>!m.approvedForPopulationProjection)).toBe(true);
  });
});

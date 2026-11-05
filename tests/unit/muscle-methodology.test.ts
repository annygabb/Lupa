import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe,expect,it } from "vitest";
import { MuscleResearch } from "../../components/muscle/muscle-research";
import { MethodologyPage } from "../../components/methodology/methodology-page";
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
  it("a UI liga perguntas, fontes, E04, E12 e estudo E10",()=>{
    const html=renderToStaticMarkup(createElement(MuscleResearch));
    expect(html).toContain("Além do peso");
    expect(html).toContain("Que pergunta você quer responder?");
    expect(html).toContain("A lacuna causal do projeto");
    expect(html).toContain("SURMOUNT-1");
    expect(html).toContain("9.366");
    expect(html).toContain("OR 2,33");
    expect(html).toContain("OR 2,67");
    expect(html).toContain("Abrir Comparador");
    expect(html).toContain("https://pubmed.ncbi.nlm.nih.gov/30312372/");
    expect(html).toContain("https://pubmed.ncbi.nlm.nih.gov/40462133/");
    expect(html).toContain("Não se pode multiplicar");
  });
  it("não houve liberação de projeção clínica em decorrência da nova análise",()=>{
    expect(reviewedMetrics.every(m=>!m.approvedForPopulationProjection)).toBe(true);
  });
});
describe("Etapa 7 — metodologia integral",()=>{
  it("substitui placeholder por protocolo, fórmulas, fontes e contexto Brasil/SUS",()=>{
    const html=renderToStaticMarkup(createElement(MethodologyPage));
    expect(html).toContain("Como analisamos uma evidência");
    expect(html).toContain("O que o sistema impede");
    expect(html).toContain("cenários");
    expect(html).toContain("N(t)");
    expect(html).toContain("IBGE");
    expect(html).toContain("Vigitel");
    expect(html).toContain("Conitec");
    expect(html).toContain("Glossário científico");
    expect(html).toContain("Publicações e documentos originais");
    expect(html).toContain("0");
    expect(html).toContain("não significa aprovação");
  });
});

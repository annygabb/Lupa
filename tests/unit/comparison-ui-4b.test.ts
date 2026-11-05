import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CompatibilityPanel } from "../../components/comparison/compatibility-panel";
import { MetricChart } from "../../components/comparison/metric-chart";
import { StudyComparator } from "../../components/comparison/study-comparator";
import { assessStudyComparison } from "../../features/comparison/compatibility";
import { friendlyCompatibilityWarnings, getCompatibilityVerdict } from "../../features/comparison/compatibility-copy";
import { getReviewedMetric, reviewedMetrics } from "../../features/comparison/reviewed-metrics";
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
  it("mostra os três estados e detalhamento metodológico acessível",()=>{
    const assessment=assessStudyComparison(ref("E04"),ref("E12"));
    const html=renderToStaticMarkup(createElement(CompatibilityPanel,{assessment}));
    expect(html).toContain("Análise de compatibilidade");
    expect(html).toContain("Comparação descritiva disponível");
    expect(html).toContain("Lado a lado");
    expect(html).toContain("Disponível");
    expect(html).toContain("Cálculo combinado");
    expect(html).toContain("Bloqueado");
    expect(html).toContain("Projeções");
    expect(html).toContain("Indisponíveis");
    expect(html).toContain("Pontos de atenção");
    expect(html).toContain("Ver justificativas científicas completas");
    expect(html).toContain("não há estimativa causal");
    expect(html).toContain("não para calcular risco clínico");
  });
  it("veredito da mesma publicação informa bloqueio visual sem verde de sucesso",()=>{
    const assessment=assessStudyComparison(ref("E16"),ref("P22"));
    const html=renderToStaticMarkup(createElement(CompatibilityPanel,{assessment}));
    expect(html).toContain("Selecione dois estudos diferentes");
    expect(html).toContain("Indisponível");
    expect(html).toContain("Mesma publicação selecionada");
    expect(html).not.toContain("Comparação descritiva disponível");
  });
});

describe("Etapa 4B — cartões, gráfico e layouts",()=>{
  it("mantém os dois seletores funcionais, ação de inverter e leitura da fonte",()=>{
    const html=renderToStaticMarkup(createElement(StudyComparator));
    expect(html).toContain('id="compare-left"');
    expect(html).toContain('id="compare-right"');
    expect(html).toContain("Inverter estudos");
    expect(html).toContain("Abrir ficha completa");
    expect(html).toContain("Fonte original");
    expect(html).toContain("Ver todos os dados e limitações");
    expect(html).toContain("Em curadoria");
    expect(html).toContain("LUPA Saúde / Comparador científico");
  });
  it("mostra agrupamento dos indicadores e alternativa de seleção móvel",()=>{
    const html=renderToStaticMarkup(createElement(StudyComparator));
    expect(html).toContain("Selecione um tema de análise");
    expect(html).toContain("Composição corporal");
    expect(html).toContain("Continuidade");
    expect(html).toContain("Saúde mental");
    expect(html).toContain('id="reviewed-metric"');
    expect(html).toContain("<optgroup");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("independente dos estudos A e B");
    expect(html).toContain("-10,9%");
  });
  it("mantém visíveis os valores por série e a tabela de suporte",()=>{
    const metric=getReviewedMetric("M04")!;
    const html=renderToStaticMarkup(createElement(MetricChart,{metric}));
    expect(html).toContain("N total:");
    expect(html).toContain("-5,5%");
    expect(html).toContain("+14,0%");
    expect(html).toContain("Tabela de dados");
    expect(html).toContain("IC 95%");
    expect(html).toContain("Como ler este dado");
    expect(html).toContain("Limites da interpretação");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Não houve revisão clínica independente");
  });
  it("não inventa n ou intervalos ausentes no estudo de saúde mental",()=>{
    const html=renderToStaticMarkup(createElement(MetricChart,{metric:getReviewedMetric("M05")!}));
    expect(html).toContain("N por braço não conferido");
    expect(html).toContain("Não conferido");
    expect(html).toContain("Não extraído");
    expect(html).toContain("18,2%");
    expect(html).toContain("24,3%");
  });
  it("não altera dados numéricos ou critérios de aprovação da Etapa 4",()=>{
    expect(reviewedMetrics.map(x=>x.id)).toEqual(["M01","M02","M03","M04","M05"]);
    expect(reviewedMetrics.every(x=>x.approvedForPopulationProjection===false)).toBe(true);
    expect(reviewedMetrics.every(x=>x.independentClinicalReview===false)).toBe(true);
  });
});

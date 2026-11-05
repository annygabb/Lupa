import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StudyComparator } from "../../components/comparison/study-comparator";
import { StudioStudyCard } from "../../components/comparison/studio-study-card";
import { EvidenceOrbit } from "../../components/comparison/evidence-orbit";
import { ComparisonBarPlot } from "../../components/comparison/comparison-bar-plot";
import { MetricChart } from "../../components/comparison/metric-chart";
import { getUnifiedEvidence } from "../../features/evidence/unified-catalog";
import { getReviewedMetric, reviewedMetrics } from "../../features/comparison/reviewed-metrics";

describe("Studio premium — integridade da interface",()=>{
  it("renderiza hero visual real, seletores, navegação interna e segurança científica",()=>{
    const html=renderToStaticMarkup(createElement(StudyComparator));
    expect(html).toContain("LUPA Saúde / Comparador científico");
    expect(html).toContain("Enxergue além dos números");
    expect(html).toContain("RESEARCH STUDIO");
    expect(html).toContain('id="compare-left"');
    expect(html).toContain('id="compare-right"');
    expect(html).toContain('aria-label="Trocar posições dos estudos"');
    expect(html).toContain('href="#comparacao"');
    expect(html).toContain('href="#indicadores"');
    expect(html).toContain("Análise de compatibilidade");
    expect(html).toContain("Cálculo combinado");
    expect(html).toContain("Bloqueado");
    expect(html).toContain("Projeções");
    expect(html).toContain("Indisponíveis");
    expect(html).toContain("Ver justificativas científicas completas");
  });
  it("evita repetir o landmark main dentro do layout raiz",()=>{
    const html=renderToStaticMarkup(createElement(StudyComparator));
    expect(html).not.toContain("<main");
  });
  it("os cards contêm a origem, detalhes da amostra e links seguros",()=>{
    const study=getUnifiedEvidence("E04")!;
    const html=renderToStaticMarkup(createElement(StudioStudyCard,{record:study,side:"a"}));
    expect(html).toContain("Principal limitação");
    expect(html).toContain("Em curadoria");
    expect(html).toContain("Ver todos os dados e limitações");
    expect(html).toContain("Abrir ficha completa");
    expect(html).toContain("/evidencias/E04");
    expect(html).toContain("Fonte original");
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it("o gráfico visual usa somente os mesmos dois braços da medida",()=>{
    const metric=getReviewedMetric("M03")!;
    const html=renderToStaticMarkup(createElement(ComparisonBarPlot,{metric}));
    expect(html).toContain("<svg");
    expect(html).toContain("Tirzepatida");
    expect(html).toContain("Placebo");
    expect(html).toContain("Grupo 1");
    expect(html).toContain("Grupo 2");
    expect(html).toContain('role="img"');
  });
  it("mantém resultado negativo e positivo do SURMOUNT-4 e escala de 0–100% para PHQ-9",()=>{
    const m04=renderToStaticMarkup(createElement(ComparisonBarPlot,{metric:getReviewedMetric("M04")!}));
    const m05=renderToStaticMarkup(createElement(ComparisonBarPlot,{metric:getReviewedMetric("M05")!}));
    expect(m04).toContain("+20%"); // marcadores da escala matemática, não novos desfechos
    expect(m04).toContain("-20%");
    expect(m05).toContain("100%");
    expect(m05).toContain("0%");
  });
  it("mantém tabela clínica e números de origem, sem inventar denominadores",()=>{
    const html=renderToStaticMarkup(createElement(MetricChart,{metric:getReviewedMetric("M05")!}));
    expect(html).toContain("18,2%");
    expect(html).toContain("24,3%");
    expect(html).toContain("N por braço não conferido");
    expect(html).toContain("Não extraído");
    expect(html).toContain("Tabela de dados");
    expect(html).toContain("Não houve revisão clínica independente");
  });
  it("representação ornamental explicita que conexões não autorizam cálculos",()=>{
    const html=renderToStaticMarkup(createElement(EvidenceOrbit,{leftId:"E04",rightId:"E12"}));
    expect(html).toContain("E04");
    expect(html).toContain("E12");
    expect(html).toContain("CONEXÕES NÃO SÃO CAUSALIDADE");
    expect(html).toContain("não por cálculo combinado");
  });
  it("todos os cinco indicadores continuam bloqueados para projeção",()=>{
    expect(reviewedMetrics).toHaveLength(5);
    expect(reviewedMetrics.every(m=>!m.approvedForPopulationProjection)).toBe(true);
    expect(reviewedMetrics.every(m=>!m.independentClinicalReview)).toBe(true);
  });
});

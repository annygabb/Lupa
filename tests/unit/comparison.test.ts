import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe,expect,it } from "vitest";
import { reviewedMetricSchema, reviewedMetrics, getReviewedMetric, formatMetricValue } from "../../features/comparison/reviewed-metrics";
import { assessStudyComparison } from "../../features/comparison/compatibility";
import { getUnifiedEvidence } from "../../features/evidence/unified-catalog";
import { StudyComparator } from "../../components/comparison/study-comparator";
import { MetricChart } from "../../components/comparison/metric-chart";

describe("Etapa 4 — extração conferida para comparação descritiva",()=>{
  it("contém cinco medidas e três fontes diferentes com origem rastreável",()=>{
    expect(reviewedMetrics).toHaveLength(5);
    expect(new Set(reviewedMetrics.map(x=>x.id)).size).toBe(5);
    expect(new Set(reviewedMetrics.map(x=>x.evidenceId))).toEqual(new Set(["E04","E16","E21"]));
    for (const metric of reviewedMetrics) {
      expect(reviewedMetricSchema.safeParse(metric).success).toBe(true);
      expect(metric.displayStatus).toBe("primary_source_checked");
      expect(metric.approvedForPopulationProjection).toBe(false);
      expect(metric.independentClinicalReview).toBe(false);
      expect(metric.sourceUrl.startsWith("https://")).toBe(true);
      expect(metric.arms).toHaveLength(2);
      expect(metric.sourceLocator.length).toBeGreaterThan(10);
    }
  });
  it("preserva população e valores dos três desfechos DXA sem confundir fração com mudança",()=>{
    expect(getReviewedMetric("M01")?.arms.map(x=>x.value)).toEqual([-21.3,-5.3]);
    expect(getReviewedMetric("M02")?.arms.map(x=>x.value)).toEqual([-33.9,-8.2]);
    expect(getReviewedMetric("M03")?.arms.map(x=>x.value)).toEqual([-10.9,-2.6]);
    expect(getReviewedMetric("M03")?.arms.map(x=>x.sampleN)).toEqual([124,36]);
    expect(getReviewedMetric("M03")?.followupWeeks).toBe(72);
  });
  it("preserva SURMOUNT-4, tempo de randomização, n por braço, IC e estimand",()=>{
    const m=getReviewedMetric("M04")!;
    expect(m.analyzedN).toBe(670);
    expect(m.arms.map(x=>x.sampleN)).toEqual([335,335]);
    expect(m.arms.map(x=>x.value)).toEqual([-5.5,14]);
    expect(m.arms[0].ciLower).toBe(-6.8);
    expect(m.arms[1].ciUpper).toBe(15.2);
    expect(m.timeWindow).toContain("Semana 36");
    expect(m.estimator).toContain("Least-squares");
  });
  it("registra N total e NÃO inventa denominador por braço para análise PHQ-9",()=>{
    const m=getReviewedMetric("M05")!;
    expect(m.analyzedN).toBe(4056);
    expect(m.denominatorStatus).toBe("only_total_reported");
    expect(m.arms.map(x=>x.sampleN)).toEqual([null,null]);
    expect(m.arms.map(x=>x.value)).toEqual([18.2,24.3]);
    expect(m.limitations).toContain("psicopatologia");
  });
  it("bloqueia conjunto de braços com n incoerente",()=>{
    const m=getReviewedMetric("M04")!;
    expect(reviewedMetricSchema.safeParse({...m,analyzedN:700}).success).toBe(false);
    expect(reviewedMetricSchema.safeParse({...m,arms:m.arms.map((x,i)=>i===0?{...x,value:90}:x)}).success).toBe(false);
  });
  it("bloqueia proporção acima de 100 e aprovação indevida de projeção",()=>{
    const m=getReviewedMetric("M05")!;
    expect(reviewedMetricSchema.safeParse({...m,arms:[{...m.arms[0],value:120},m.arms[1]]}).success).toBe(false);
    expect(reviewedMetricSchema.safeParse({...m,approvedForPopulationProjection:true}).success).toBe(false);
  });
  it("formata sinais e unidade corretamente",()=>{
    expect(formatMetricValue(-5.5,"%")).toBe("-5,5%");
    expect(formatMetricValue(14,"%")).toBe("+14,0%");
    expect(formatMetricValue(0,"%")).toBe("0,0%");
  });
});

describe("Etapa 4 — bloqueio de inferência científica",()=>{
  const lookup=(id:string)=>getUnifiedEvidence(id)!;
  it("não permite comparar um artigo com seu alias idêntico",()=>{
    const assessment=assessStudyComparison(lookup("E04"),lookup("P20"));
    expect(assessment.canShowSideBySide).toBe(false);
    expect(assessment.canPoolNumericalEstimates).toBe(false);
    expect(assessment.warnings.some(x=>x.code==="SAME_REFERENCE")).toBe(true);
  });
  it("sinaliza famílias de estudos com participantes possivelmente compartilhados",()=>{
    const assessment=assessStudyComparison(lookup("E01"),lookup("E04"));
    expect(assessment.warnings.some(x=>x.code==="OVERLAPPING_COHORTS")).toBe(true);
  });
  it("identifica a lacuna causal entre composição muscular e recuperação de UTI",()=>{
    const a=assessStudyComparison(lookup("E04"),lookup("E12"));
    expect(a.canShowSideBySide).toBe(true);
    expect(a.canPoolNumericalEstimates).toBe(false);
    expect(a.dataForWithinStudyChart).toEqual({left:3,right:0});
    expect(a.warnings.some(x=>x.code==="MUSCLE_ICU_INDIRECT_LINK")).toBe(true);
    expect(a.warnings.some(x=>x.code==="NO_DIRECT_CROSS_STUDY_POOLED_EFFECT")).toBe(true);
  });
  it("distingue documento regulatório de estudo clínico",()=>{
    const a=assessStudyComparison(lookup("E26"),lookup("E04"));
    expect(a.warnings.some(x=>x.code==="DIFFERENT_SOURCE_KINDS")).toBe(true);
  });
  it("nunca libera combinação numérica entre publicações independentes",()=>{
    const a=assessStudyComparison(lookup("E16"),lookup("E21"));
    expect(a.canPoolNumericalEstimates).toBe(false);
    expect(a.warnings.some(x=>x.code==="DIFFERENT_OUTCOMES")).toBe(true);
  });
});

describe("Etapa 4 — interface e dados em gráfico",()=>{
  it("renderiza valores conferidos, informação sobre N e origem nos gráficos",()=>{
    const html=renderToStaticMarkup(createElement(MetricChart,{metric:getReviewedMetric("M04")!}));
    expect(html).toContain("-5,5%");
    expect(html).toContain("+14,0%");
    expect(html).toContain("335");
    expect(html).toContain("IC 95%");
    expect(html).toContain("Abrir fonte original");
    expect(html).toContain("Não houve revisão clínica independente");
  });
  it("apresenta percentuais PHQ-9 sem inventar N por braço",()=>{
    const html=renderToStaticMarkup(createElement(MetricChart,{metric:getReviewedMetric("M05")!}));
    expect(html).toContain("18,2%");
    expect(html).toContain("24,3%");
    expect(html).toContain("N por braço não conferido");
    expect(html).toContain("Não conferido");
  });
  it("renderiza controles de seleção, avisos metodológicos e gráfico no estado inicial",()=>{
    const html=renderToStaticMarkup(createElement(StudyComparator));
    expect(html).toContain('id="compare-left"');
    expect(html).toContain('id="compare-right"');
    expect(html).toContain('id="reviewed-metric"');
    expect(html).toContain("Verificação de compatibilidade");
    expect(html).toContain("Relação sobre músculos e UTI não demonstrada");
    expect(html).toContain("Não calcular efeito combinado");
    expect(html).toContain("-10,9%");
  });
});

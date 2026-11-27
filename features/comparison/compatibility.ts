import type { UnifiedEvidenceRecord } from "@/features/evidence/unified-catalog";
import { reviewedMetricsForEvidence } from "./reviewed-metrics";

export type ComparisonWarningCode =
  | "SAME_REFERENCE" | "OVERLAPPING_COHORTS" | "DIFFERENT_SOURCE_KINDS"
  | "DIFFERENT_DESIGNS" | "DIFFERENT_OUTCOMES" | "DIFFERENT_DRUGS"
  | "MUSCLE_ICU_INDIRECT_LINK" | "BOTH_PENDING_CURATOR_REVIEW"
  | "NO_DIRECT_CROSS_STUDY_POOLED_EFFECT";
export interface ComparisonWarning {
  code: ComparisonWarningCode;
  label: string;
  explanation: string;
}
export interface StudyComparisonAssessment {
  canShowSideBySide: boolean;
  canPoolNumericalEstimates: false;
  dataForWithinStudyChart: { left: number; right: number };
  warnings: readonly ComparisonWarning[];
}

export function assessStudyComparison(
  left: UnifiedEvidenceRecord,
  right: UnifiedEvidenceRecord,
): StudyComparisonAssessment {
  const warnings: ComparisonWarning[] = [];
  const add=(code:ComparisonWarningCode,label:string,explanation:string)=>{
    warnings.push({code,label,explanation});
  };
  const same=left.id===right.id;
  if(same) {
    add("SAME_REFERENCE","Mesma publicação",
      "Selecione duas referências diferentes. Um alias corresponde à mesma publicação, não a outro estudo.");
  }
  if (!same && left.studyFamily && left.studyFamily===right.studyFamily &&
      left.studyFamily!=="META_ANALYSIS_OVERLAP_UNDETERMINED") {
    add("OVERLAPPING_COHORTS","Possível sobreposição de participantes",
      "As referências pertencem à mesma família de estudos. Não some automaticamente as amostras ou os efeitos.");
  }
  if(left.sourceKind!==right.sourceKind) {
    add("DIFFERENT_SOURCE_KINDS","Fontes de natureza diferente",
      "Um documento regulatório não equivale a ensaio clínico nem necessariamente possui denominadores.");
  }
  if(left.design!==right.design) {
    add("DIFFERENT_DESIGNS","Desenhos diferentes",
      "Resultados de diferentes desenhos de pesquisa não devem ser agregados sem avaliação metodológica específica.");
  }
  if(!left.topics.some(topic=>right.topics.includes(topic))) {
    add("DIFFERENT_OUTCOMES","Temas ou desfechos diferentes",
      "Não há um mesmo domínio de desfecho registrado nas duas fichas; gráficos separados são mais apropriados.");
  }
  if(!left.drugs.some(drug=>right.drugs.includes(drug))) {
    add("DIFFERENT_DRUGS","Tratamentos ou contextos diferentes",
      "As fichas avaliam medicamentos ou contextos distintos. Não inferir um efeito relativo direto.");
  }
  const muscleAndIcu=(
    (left.topics.some(x=>x==="muscle"||x==="sarcopenia") && right.topics.includes("icu")) ||
    (right.topics.some(x=>x==="muscle"||x==="sarcopenia") && left.topics.includes("icu"))
  );
  if(muscleAndIcu && !same) {
    add("MUSCLE_ICU_INDIRECT_LINK","Relação sobre músculos e UTI não demonstrada",
      "Composição corporal após medicamentos e prognóstico na UTI foram estudados em populações distintas; não há estimativa causal da tirzepatida sobre recuperação crítica.");
  }
  add("BOTH_PENDING_CURATOR_REVIEW","Fichas em curadoria",
    "O catálogo de referência ainda não possui revisão clínica independente de todos os resultados extraídos.");
  add("NO_DIRECT_CROSS_STUDY_POOLED_EFFECT","Comparação apenas descritiva",
    "A ferramenta não calcula diferença de tratamento entre estudos, risco acumulado, incidência ou metanálise. Os gráficos são internos a uma mesma publicação.");
  return {
    canShowSideBySide: !same,
    canPoolNumericalEstimates: false,
    dataForWithinStudyChart: {
      left: reviewedMetricsForEvidence(left.id).length,
      right: reviewedMetricsForEvidence(right.id).length,
    },
    warnings,
  };
}

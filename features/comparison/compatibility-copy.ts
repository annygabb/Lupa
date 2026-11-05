import type {
  ComparisonWarningCode,
  StudyComparisonAssessment,
} from "./compatibility";

export interface FriendlyWarning {
  code: ComparisonWarningCode;
  title: string;
  summary: string;
  priority: number;
}

const warningCopy: Record<ComparisonWarningCode, Omit<FriendlyWarning,"code">> = {
  SAME_REFERENCE: {
    title:"Mesma publicação selecionada",
    summary:"Os dois campos apontam para a mesma referência. Selecione outro estudo.",
    priority:0,
  },
  MUSCLE_ICU_INDIRECT_LINK: {
    title:"Ligação causal não demonstrada",
    summary:"Não há evidência direta de que a mudança de massa magra por tirzepatida explique desfechos em UTI.",
    priority:1,
  },
  OVERLAPPING_COHORTS: {
    title:"Amostras possivelmente sobrepostas",
    summary:"As publicações pertencem à mesma família e podem compartilhar participantes.",
    priority:2,
  },
  DIFFERENT_OUTCOMES: {
    title:"Desfechos diferentes",
    summary:"As referências avaliam resultados distintos; não existe uma medida comum já validada para agregação.",
    priority:3,
  },
  DIFFERENT_SOURCE_KINDS: {
    title:"Tipos de fonte distintos",
    summary:"Documentos regulatórios e estudos clínicos têm finalidades e bases de dados diferentes.",
    priority:4,
  },
  DIFFERENT_DESIGNS: {
    title:"Métodos diferentes",
    summary:"Os estudos seguem desenhos diferentes. Isso exige interpretação contextual.",
    priority:5,
  },
  DIFFERENT_DRUGS: {
    title:"Contextos clínicos distintos",
    summary:"Os medicamentos ou cenários analisados não são diretamente equivalentes.",
    priority:6,
  },
  BOTH_PENDING_CURATOR_REVIEW: {
    title:"Revisão científica em andamento",
    summary:"O catálogo ainda não recebeu revisão clínica independente de todas as informações.",
    priority:7,
  },
  NO_DIRECT_CROSS_STUDY_POOLED_EFFECT: {
    title:"Sem efeito combinado",
    summary:"Nenhuma taxa ou efeito entre publicações é calculado pelo Comparador.",
    priority:8,
  },
};

export function friendlyCompatibilityWarnings(
  assessment: StudyComparisonAssessment,
): FriendlyWarning[] {
  return assessment.warnings
    .filter(item=>
      item.code!=="BOTH_PENDING_CURATOR_REVIEW" &&
      item.code!=="NO_DIRECT_CROSS_STUDY_POOLED_EFFECT"
    )
    .map(item=>({code:item.code,...warningCopy[item.code]}))
    .sort((a,b)=>a.priority-b.priority);
}

export interface CompatibilityVerdict {
  title: string;
  subtitle: string;
  statusLabel: string;
  type: "unavailable"|"contextual";
}

export function getCompatibilityVerdict(
  assessment: StudyComparisonAssessment,
): CompatibilityVerdict {
  if(!assessment.canShowSideBySide) return {
    title:"Selecione dois estudos diferentes",
    subtitle:"Os campos apontam para a mesma publicação. Escolha outra referência para iniciar uma comparação.",
    statusLabel:"Seleção duplicada",
    type:"unavailable",
  };
  const indirect=assessment.warnings.some(x=>x.code==="MUSCLE_ICU_INDIRECT_LINK");
  return {
    title:"Comparação descritiva disponível",
    subtitle:indirect
      ?"Você pode explorar os estudos lado a lado, mas a relação causal entre composição muscular e recuperação em UTI não foi demonstrada."
      :"Você pode explorar métodos e resultados lado a lado, mas os números de publicações diferentes não podem ser combinados.",
    statusLabel:"Comparação contextual",
    type:"contextual",
  };
}

import { z } from "zod";
import { projectionCandidateSchema } from "@/features/evidence/projection-guard";

/**
 * Evidence Lens — afirmações curadas editorialmente (não é chatbot, não é tribunal da verdade).
 * Todo número aqui já existe no catálogo/indicadores conferidos do LUPA; nada é revisão clínica.
 */
export const claimClassifications = ["supported_in_context", "partially_supported", "insufficient_evidence", "not_comparable"] as const;
export type ClaimClassification = (typeof claimClassifications)[number];

/** Rigor crescente: o motor nunca devolve uma classificação mais branda que as regras permitem. */
export const classificationRank: Record<ClaimClassification, number> = {
  supported_in_context: 0, partially_supported: 1, insufficient_evidence: 2, not_comparable: 3,
};

export const classificationLabel: Record<ClaimClassification, string> = {
  supported_in_context: "Sustentada no contexto do estudo",
  partially_supported: "Parcialmente sustentada",
  insufficient_evidence: "Evidência insuficiente para afirmar",
  not_comparable: "Estudos não comparáveis para essa conclusão",
};

export const reviewStatusLabel = {
  candidate: "Ficha em curadoria · revisão clínica independente pendente",
  source_checked: "Números conferidos no artigo original · revisão clínica independente pendente",
  independently_reviewed: "Revisão clínica independente documentada",
} as const;

export const evidenceLensClaimSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]{3,80}$/),
  kind: z.enum(["evidence", "projection"]),
  title: z.string().min(3),
  question: z.string().min(10),
  shortAnswer: z.string().min(10),
  explanation: z.string().min(20),
  allowedConclusion: z.string().min(10),
  prohibitedExtrapolations: z.array(z.string().min(5)).min(1),
  evidenceIds: z.array(z.string().regex(/^[EPR]\d{2}$/)),
  comparePair: z.tuple([z.string(), z.string()]).optional(),
  projectionProbe: projectionCandidateSchema.optional(),
  classification: z.enum(claimClassifications),
  reviewStatus: z.enum(["candidate", "source_checked", "independently_reviewed"]),
  /** Obrigatório para "independently_reviewed": quem revisou, quando e o escopo. Hoje não existe nenhum. */
  reviewRecord: z.strictObject({ reviewer: z.string().min(3), date: z.string(), scope: z.string() }).optional(),
  sourceNotes: z.array(z.string()),
}).refine(c => c.reviewStatus !== "independently_reviewed" || Boolean(c.reviewRecord), {
  message: "independently_reviewed exige reviewRecord documentado",
});
export type EvidenceLensClaim = z.infer<typeof evidenceLensClaimSchema>;

const rawClaims: EvidenceLensClaim[] = [
  {
    id: "massa-magra-nao-equivale-a-musculos",
    kind: "evidence",
    title: "Massa magra não é músculo",
    question: "Se 25% do peso perdido era massa magra, a pessoa perdeu 25% dos músculos?",
    shortAnswer: "Não dá para ler assim. Cerca de 25% do peso perdido foi massa magra medida por DXA — não 25% dos músculos.",
    explanation: "No subestudo DXA do SURMOUNT-1 (160 avaliados; tirzepatida n=124, placebo n=36; 72 semanas), a massa magra caiu 10,9% no grupo tratado e 2,6% no placebo, cada uma em relação ao próprio valor inicial. Cerca de 75% do peso perdido foi gordura e 25% massa magra. Massa magra inclui água, órgãos e outros tecidos além do músculo.",
    allowedConclusion: "Nesse subestudo, a perda de peso com tirzepatida incluiu massa magra medida por DXA, em torno de 25% do peso perdido.",
    prohibitedExtrapolations: [
      "Que a pessoa perdeu 25% dos músculos.",
      "Que houve perda de força ou de função muscular — elas não foram medidas.",
      "Que o tratamento causa sarcopenia — o diagnóstico exige força e desempenho, segundo o consenso EWGSOP2.",
    ],
    evidenceIds: ["E04", "E10"],
    classification: "partially_supported",
    reviewStatus: "source_checked",
    sourceNotes: ["Indicadores M01–M03 conferidos no artigo original.", "Subestudo financiado pela Eli Lilly."],
  },
  {
    id: "uti-mortalidade-nao-e-efeito-do-medicamento",
    kind: "evidence",
    title: "Músculo, UTI e medicamento",
    question: "Estudos de massa muscular na UTI comprovam mortalidade causada pela tirzepatida?",
    shortAnswer: "Não. São perguntas e populações diferentes, e nenhum estudo do acervo testou essa ligação.",
    explanation: "O SURMOUNT-1 mediu composição corporal por DXA em adultos com obesidade e não acompanhou internações em UTI. A metanálise E12 (35 estudos, 9.366 pacientes) associou baixa massa muscular na admissão à mortalidade (OR 2,33 no curto prazo), mas não estudou o medicamento. Juntar as duas coisas cria uma ponte que ninguém mediu.",
    allowedConclusion: "Baixa massa muscular na admissão está associada a pior prognóstico em pacientes críticos, nos estudos reunidos pela metanálise.",
    prohibitedExtrapolations: [
      "Que a tirzepatida aumenta a mortalidade em UTI.",
      "Que OR 2,33 significa 233% mais risco absoluto de morte.",
      "Calcular mortes atribuíveis ao medicamento a partir desses dois estudos.",
    ],
    evidenceIds: ["E04", "E12"],
    comparePair: ["E04", "E12"],
    projectionProbe: {
      reviewStatus: "candidate", sourceType: "meta_analysis", publicationId: "E12", cohortId: "E12",
      outcomeCode: "short_term_mortality", measureKind: "textual", sourceLocator: null, reportedUnit: null,
      followupWeeks: null, analyzedN: 9366, numerator: null, denominator: null, personTimeDenominator: null,
      populationCompatibilityReviewed: false, timeCompatibilityReviewed: false, overlapChecked: false,
      associationOnly: true, hypotheticalDrugIcuLink: true, effectMeasure: "OR", baselineRiskReviewed: false,
    },
    classification: "not_comparable",
    reviewStatus: "candidate",
    sourceNotes: ["A metanálise reúne estudos heterogêneos, em sua maioria retrospectivos."],
  },
  {
    id: "interromper-tratamento-reganho",
    kind: "evidence",
    title: "Parar o tratamento",
    question: "Ao parar a tirzepatida, o peso volta?",
    shortAnswer: "No SURMOUNT-4, quem trocou para placebo recuperou parte do peso; quem continuou seguiu perdendo.",
    explanation: "Depois de 36 semanas de tirzepatida para todos, 670 participantes foram randomizados (335 por braço). Entre as semanas 36 e 88, quem continuou teve −5,5% de peso e quem trocou para placebo teve +14,0%.",
    allowedConclusion: "Entre participantes que toleraram e completaram a fase inicial, interromper o tratamento levou a reganho de peso na janela estudada.",
    prohibitedExtrapolations: [
      "Que todas as pessoas recuperam exatamente 14% do peso.",
      "Que o grupo placebo representa pessoas que nunca usaram o medicamento — todos tinham sido tratados antes.",
      "Aplicar automaticamente essa curva a outro medicamento.",
    ],
    evidenceIds: ["E16"],
    classification: "supported_in_context",
    reviewStatus: "source_checked",
    sourceNotes: ["Indicador M04 conferido no artigo original.", "Ensaio financiado pela Eli Lilly."],
  },
  {
    id: "phq9-nao-prova-seguranca-universal",
    kind: "evidence",
    title: "Saúde mental e PHQ-9",
    question: "Um estudo com PHQ-9 prova que o medicamento é seguro para a saúde mental de todo mundo?",
    shortAnswer: "Não. Mostra o que aconteceu em participantes selecionados, sem psicopatologia importante conhecida.",
    explanation: "Na análise pós-hoc dos ensaios SURMOUNT (4.056 participantes no total), a piora para uma categoria PHQ-9 mais grave ocorreu em 18,2% com tirzepatida e 24,3% com placebo. Pessoas com psicopatologia importante conhecida foram excluídas, e o N por braço não aparece no resumo.",
    allowedConclusion: "Nos participantes estudados, não houve sinal de piora de sintomas depressivos medida pelo PHQ-9 em comparação ao placebo.",
    prohibitedExtrapolations: [
      "Que o medicamento é seguro para quem tem transtorno psiquiátrico — essas pessoas foram excluídas.",
      "Que 18,2% é a taxa de depressão causada pelo medicamento.",
      "Que o resultado vale como taxa nacional brasileira.",
    ],
    evidenceIds: ["E21", "P02"],
    classification: "insufficient_evidence",
    reviewStatus: "source_checked",
    sourceNotes: ["Indicador M05 conferido no artigo original.", "Análise pós-hoc dos SURMOUNT financiada pela Eli Lilly."],
  },
  {
    id: "automedicacao-amostra-nao-e-pais",
    kind: "evidence",
    title: "Automedicação no Brasil",
    question: "23,8% dos brasileiros usam canetas para emagrecer sem receita?",
    shortAnswer: "Não é um número do Brasil inteiro: é a proporção entre 860 usuários que responderam a um questionário online.",
    explanation: "O questionário reuniu 860 adultos que usavam ou já tinham usado liraglutida ou semaglutida para emagrecer; 23,8% (IC95% 21,1–26,8) relataram uso sem prescrição. Quem nunca usou não entra no denominador, e o recrutamento pela internet pode selecionar perfis diferentes.",
    allowedConclusion: "Entre os participantes do levantamento, 23,8% relataram automedicação — um sinal de atenção naquela amostra.",
    prohibitedExtrapolations: [
      "Que 23,8% da população brasileira usa sem receita.",
      "Comparar diretamente com o percentual de uso nos EUA, que mede outra coisa.",
    ],
    evidenceIds: ["E22"],
    classification: "partially_supported",
    reviewStatus: "candidate",
    sourceNotes: ["Amostra online não representativa."],
  },
  {
    id: "cenario-2036-nao-e-previsao-sus",
    kind: "projection",
    title: "Cenários até 2041",
    question: "O cenário de 2036 do LUPA é uma previsão para o SUS?",
    shortAnswer: "Não. É um cálculo ilustrativo, com premissas editáveis, sobre um grupo fictício.",
    explanation: "O laboratório usa o motor lupa-flow-v2: aplica taxas hipotéticas de início, continuidade e saída a um grupo de referência editável. Nenhuma taxa foi calibrada com dados nacionais, e o pedido de avaliação à Conitec, protocolado em 24/09/2026, não é incorporação ao SUS.",
    allowedConclusion: "Dá para explorar como premissas diferentes mudam o número de pessoas em acompanhamento dentro do modelo.",
    prohibitedExtrapolations: [
      "Prever quantos brasileiros vão usar o medicamento.",
      "Estimar mortalidade, internações ou efeitos clínicos.",
      "Afirmar que o SUS vai oferecer o medicamento.",
    ],
    evidenceIds: ["R07"],
    projectionProbe: {
      reviewStatus: "candidate", sourceType: "regulatory", publicationId: "R07", cohortId: "R07",
      outcomeCode: "public_access", measureKind: "textual", sourceLocator: null, reportedUnit: null,
      followupWeeks: null, analyzedN: null, numerator: null, denominator: null, personTimeDenominator: null,
      populationCompatibilityReviewed: false, timeCompatibilityReviewed: false, overlapChecked: false,
      associationOnly: false, hypotheticalDrugIcuLink: false, effectMeasure: null, baselineRiskReviewed: false,
    },
    classification: "insufficient_evidence",
    reviewStatus: "candidate",
    sourceNotes: ["Motor determinístico lupa-flow-v2; premissas ilustrativas, sem calibração nacional."],
  },
];

export const evidenceLensClaims: readonly EvidenceLensClaim[] = Object.freeze(
  rawClaims.map(claim => evidenceLensClaimSchema.parse(claim)),
);

export const claimIds = evidenceLensClaims.map(c => c.id);

export function getClaim(id: string): EvidenceLensClaim | undefined {
  return evidenceLensClaims.find(c => c.id === id);
}

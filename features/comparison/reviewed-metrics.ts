import { z } from "zod";

// Fichas numéricas obtidas de publicações originais e conferidas para EXIBIÇÃO DESCRITIVA.
// Não conferem aprovação clínica independente, não alimentam o motor de projeções
// e não representam risco individual nem estimativas brasileiras.
const armSchema = z.strictObject({
  key: z.string().min(1),
  label: z.string().min(2),
  sampleN: z.number().int().positive().nullable(),
  value: z.number().finite(),
  ciLower: z.number().finite().nullable(),
  ciUpper: z.number().finite().nullable(),
}).superRefine((v,ctx)=>{
  if ((v.ciLower === null) !== (v.ciUpper === null))
    ctx.addIssue({code:"custom",message:"Intervalo de confiança incompleto",path:["ciLower"]});
  if (v.ciLower!==null && v.ciUpper!==null &&
      !(v.ciLower <= v.value && v.value <= v.ciUpper))
    ctx.addIssue({code:"custom",message:"Estimativa fora do intervalo de confiança",path:["value"]});
});

export const reviewedMetricSchema = z.strictObject({
  id: z.string().regex(/^M\d{2}$/),
  evidenceId: z.enum(["E04","E16","E21"]),
  studyLabel: z.string().min(5),
  title: z.string().min(5),
  outcome: z.string().min(3),
  design: z.string().min(5),
  description: z.string().min(10),
  measurementKind: z.enum(["relative_change_from_own_baseline","outcome_proportion"]),
  unit: z.literal("%"),
  followupWeeks: z.number().int().positive(),
  timeWindow: z.string().min(8),
  analyzedN: z.number().int().positive(),
  denominatorStatus: z.enum(["by_arm_reported","only_total_reported"]),
  arms: z.array(armSchema).length(2),
  sourceUrl: z.string().url().refine(x=>x.startsWith("https://"),"A fonte precisa usar HTTPS"),
  sourceLocator: z.string().min(8),
  reviewedOn: z.string().date(),
  estimator: z.string().min(5),
  population: z.string().min(10),
  limitations: z.string().min(20),
  displayStatus: z.literal("primary_source_checked"),
  approvedForPopulationProjection: z.literal(false),
  independentClinicalReview: z.literal(false),
}).superRefine((v,ctx)=>{
  const sum=v.arms.reduce((n,arm)=>n+(arm.sampleN??0),0);
  if (v.denominatorStatus==="by_arm_reported" &&
      (v.arms.some(arm=>arm.sampleN===null) || sum!==v.analyzedN))
    ctx.addIssue({code:"custom",path:["analyzedN"],message:"N total diferente da soma dos braços"});
  if (v.denominatorStatus==="only_total_reported" &&
      v.arms.some(arm=>arm.sampleN!==null))
    ctx.addIssue({code:"custom",path:["arms"],message:"N por braço não foi conferido nesta fonte"});
  if (v.measurementKind==="outcome_proportion" &&
      v.arms.some(arm=>arm.value<0 || arm.value>100))
    ctx.addIssue({code:"custom",path:["arms"],message:"Proporção fora de 0–100%"});
});
export type ReviewedMetric = z.infer<typeof reviewedMetricSchema>;

const sourceDate = "2026-11-05";
const dxaCommon = {
  evidenceId:"E04" as const,
  studyLabel:"SURMOUNT-1 — subestudo DXA",
  design:"Subestudo clínico com composição corporal por DXA",
  followupWeeks:72,
  timeWindow:"Semana 0 até semana 72",
  analyzedN:160,
  denominatorStatus:"by_arm_reported" as const,
  unit:"%" as const,
  measurementKind:"relative_change_from_own_baseline" as const,
  sourceUrl:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11965027/",
  sourceLocator:"Abstract: Materials and Methods; Results (n=124 e n=36; semana 72)",
  reviewedOn:sourceDate,
  estimator:"Mudança percentual média reportada em cada grupo (base da respectiva medida)",
  population:"Adultos com obesidade/sobrepeso no subestudo DXA; tirzepatida n=124 e placebo n=36.",
  limitations:"DXA mede massa magra, que não equivale a músculo funcional; não mede força, sarcopenia ou prognóstico de UTI. Subestudo de n=160.",
  displayStatus:"primary_source_checked" as const,
  approvedForPopulationProjection:false as const,
  independentClinicalReview:false as const,
};
const metricRecords: ReviewedMetric[] = [
  {
    ...dxaCommon,
    id:"M01",title:"Mudança do peso corporal",
    outcome:"Peso corporal",description:"Variação percentual do peso corporal desde o início até a semana 72; não equivale à fração do peso perdido.",
    arms:[
      {key:"tirzepatide",label:"Tirzepatida (doses agrupadas)",sampleN:124,value:-21.3,ciLower:null,ciUpper:null},
      {key:"placebo",label:"Placebo",sampleN:36,value:-5.3,ciLower:null,ciUpper:null},
    ],
  },
  {
    ...dxaCommon,
    id:"M02",title:"Mudança da massa gorda",
    outcome:"Massa gorda",description:"Variação percentual da massa gorda medida por DXA em relação à massa gorda inicial de cada grupo.",
    arms:[
      {key:"tirzepatide",label:"Tirzepatida (doses agrupadas)",sampleN:124,value:-33.9,ciLower:null,ciUpper:null},
      {key:"placebo",label:"Placebo",sampleN:36,value:-8.2,ciLower:null,ciUpper:null},
    ],
  },
  {
    ...dxaCommon,
    id:"M03",title:"Mudança da massa magra",
    outcome:"Massa magra",description:"Variação percentual da massa magra medida por DXA em relação à massa magra inicial; massa magra não é sinônimo de músculos.",
    arms:[
      {key:"tirzepatide",label:"Tirzepatida (doses agrupadas)",sampleN:124,value:-10.9,ciLower:null,ciUpper:null},
      {key:"placebo",label:"Placebo",sampleN:36,value:-2.6,ciLower:null,ciUpper:null},
    ],
  },
  {
    id:"M04",evidenceId:"E16",studyLabel:"SURMOUNT-4 — retirada randomizada",
    title:"Peso após continuar ou interromper a tirzepatida",
    outcome:"Peso corporal",description:"Após 36 semanas iniciais de tirzepatida para todos, os participantes foram randomizados para continuar ou trocar para placebo por mais 52 semanas.",
    design:"Ensaio randomizado de retirada, com fase inicial aberta",
    measurementKind:"relative_change_from_own_baseline",unit:"%",
    followupWeeks:52,timeWindow:"Semana 36 (randomização) até semana 88",
    analyzedN:670,denominatorStatus:"by_arm_reported",
    arms:[
      {key:"continued",label:"Continuou tirzepatida",sampleN:335,value:-5.5,ciLower:-6.8,ciUpper:-4.2},
      {key:"withdrawn",label:"Trocou para placebo",sampleN:335,value:14.0,ciLower:12.8,ciUpper:15.2},
    ],
    sourceUrl:"https://jamanetwork.com/journals/jama/fullarticle/2812936",
    sourceLocator:"Table 2, primary end point, treatment-regimen estimand; weeks 36–88",
    reviewedOn:sourceDate,
    estimator:"Least-squares mean da mudança percentual, estimand de regime de tratamento",
    population:"670 adultos com obesidade/sobrepeso sem diabetes randomizados após fase aberta de 36 semanas (335 por braço).",
    limitations:"Participantes selecionados que chegaram à randomização após 36 semanas de tratamento; placebo após retirada não é grupo nunca tratado. Não extrapolar para todos os brasileiros.",
    displayStatus:"primary_source_checked",approvedForPopulationProjection:false,independentClinicalReview:false,
  },
  {
    id:"M05",evidenceId:"E21",studyLabel:"SURMOUNT-1/2/3 — análise psiquiátrica pós-hoc",
    title:"Piora para categoria PHQ-9 mais grave",
    outcome:"Categoria PHQ-9",description:"Percentual com mudança para categoria mais grave de sintomas depressivos, relatado na análise pós-hoc; não é incidência de depressão causada pelo medicamento.",
    design:"Análise pós-hoc de ensaios clínicos",
    measurementKind:"outcome_proportion",unit:"%",
    followupWeeks:72,timeWindow:"Resultado informado para avaliação até semana 72",
    analyzedN:4056,denominatorStatus:"only_total_reported",
    arms:[
      {key:"tirzepatide",label:"Tirzepatida",sampleN:null,value:18.2,ciLower:null,ciUpper:null},
      {key:"placebo",label:"Placebo",sampleN:null,value:24.3,ciLower:null,ciUpper:null},
    ],
    sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/41537305/",
    sourceLocator:"Abstract: Results, PHQ-9 category shift; N=4,056 (aggregate)",
    reviewedOn:sourceDate,
    estimator:"Percentuais publicados da mudança de categoria PHQ-9; N por braço não identificado no resumo",
    population:"4.056 adultos com obesidade/sobrepeso sem psicopatologia importante conhecida, reunidos em três estudos SURMOUNT.",
    limitations:"Análise pós-hoc; participantes com psicopatologia importante conhecida foram excluídos. Percentual não mede pressão estética, causalidade de transtornos psiquiátricos nem prevalência no Brasil.",
    displayStatus:"primary_source_checked",approvedForPopulationProjection:false,independentClinicalReview:false,
  },
];
export const reviewedMetrics: readonly ReviewedMetric[] = Object.freeze(
  metricRecords.map(item=>Object.freeze(reviewedMetricSchema.parse(item))),
);
if (new Set(reviewedMetrics.map(x=>x.id)).size !== reviewedMetrics.length)
  throw new Error("Indicadores revisados com identificador duplicado");

export function getReviewedMetric(id: string): ReviewedMetric | undefined {
  return reviewedMetrics.find(metric=>metric.id===id);
}
export function reviewedMetricsForEvidence(id: string): readonly ReviewedMetric[] {
  return reviewedMetrics.filter(metric=>metric.evidenceId===id);
}
export function formatMetricValue(value: number, unit: string): string {
  const sign=value>0?"+":"";
  return sign+value.toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})+unit;
}

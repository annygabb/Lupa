/** Descriptive extractions from PubMed-indexed publications. Never prediction coefficients. */
export type ClinicalPlot = {
  id: string; label: string; title: string; question: string;
  unit: string; axisLabel: string; arms: readonly { label: string; value: number; n: number | null }[];
  population: string; period: string; design: string; pmid: string;
  finding: string; limitation: string; locator: string;
  approvedForProjection: false;
};

export const clinicalPlots: readonly ClinicalPlot[] = [
  {
    id: "cardio", label: "Benefício cardiovascular", title: "Menos eventos cardiovasculares no SELECT",
    question: "Há benefícios além da perda de peso?", unit: "% de participantes", axisLabel: "Participantes com evento cardiovascular composto (%)",
    arms: [{label:"Semaglutida", value:6.5,n:8803},{label:"Placebo",value:8,n:8801}],
    population:"17.604 adultos ≥45 anos, com doença cardiovascular e sobrepeso/obesidade, sem diabetes; estudo internacional.",
    period:"Seguimento médio de 39,8 meses", design:"Ensaio randomizado SELECT",pmid:"37952131",
    finding:"O desfecho reuniu morte cardiovascular, infarto não fatal ou AVC não fatal. HR 0,80 (IC95% 0,72–0,90).",
    limitation:"Resultado de uma população de alto risco; não estima o benefício de toda pessoa que usa uma caneta. Financiamento: Novo Nordisk.",
    locator:"Resumo, Results; desfecho primário: 569/8.803 e 701/8.801",approvedForProjection:false,
  },
  {
    id:"fat",label:"Gordura corporal",title:"A redução de gordura foi maior que a de massa magra",
    question:"O que compõe o peso perdido?",unit:"% da massa gorda inicial",axisLabel:"Mudança na massa gorda em relação ao início (%)",
    arms:[{label:"Tirzepatida",value:-33.9,n:124},{label:"Placebo",value:-8.2,n:36}],
    population:"160 adultos com sobrepeso/obesidade, sem diabetes, no subestudo DXA do SURMOUNT-1; internacional.",
    period:"72 semanas",design:"Subestudo de ensaio randomizado",pmid:"39996356",
    finding:"A medição por DXA separa gordura e massa magra. As doses de tirzepatida foram analisadas em conjunto.",
    limitation:"Mudança relativa à massa gorda de cada grupo, não à massa corporal total. Não é previsão individual. Financiamento: Eli Lilly.",
    locator:"Resumo, Results; mudança percentual da massa gorda",approvedForProjection:false,
  },
  {
    id:"lean",label:"Massa magra",title:"O emagrecimento também incluiu perda de massa magra",
    question:"Perder peso é sempre perder só gordura?",unit:"% da massa magra inicial",axisLabel:"Mudança na massa magra em relação ao início (%)",
    arms:[{label:"Tirzepatida",value:-10.9,n:124},{label:"Placebo",value:-2.6,n:36}],
    population:"160 adultos com sobrepeso/obesidade, sem diabetes, no subestudo DXA do SURMOUNT-1; internacional.",
    period:"72 semanas",design:"Subestudo de ensaio randomizado",pmid:"39996356",
    finding:"A massa magra inclui água, órgãos e outros tecidos. Sua redução não equivale, por si só, a perda de força ou sarcopenia.",
    limitation:"Não mede risco de UTI nem permite somar perdas de estudos diferentes. Financiamento: Eli Lilly.",
    locator:"Resumo, Results; mudança percentual da massa magra",approvedForProjection:false,
  },
  {
    id:"mental",label:"Saúde mental",title:"Piora de categoria de sintomas depressivos no SURMOUNT",
    question:"As canetas aumentam a depressão?",unit:"% de participantes",axisLabel:"Participantes com mudança para categoria PHQ-9 mais grave (%)",
    arms:[{label:"Tirzepatida",value:18.2,n:null},{label:"Placebo",value:24.3,n:null}],
    population:"4.056 adultos com sobrepeso/obesidade dos estudos SURMOUNT-1/2/3, sem psicopatologia importante conhecida; internacional.",
    period:"Até 72 semanas",design:"Análise pós-hoc de ensaios",pmid:"41537305",
    finding:"PHQ-9 é um questionário de sintomas depressivos. O estudo não encontrou aumento de depressão com tirzepatida na população selecionada.",
    limitation:"Não é incidência de depressão causada pelo remédio. N por braço não está informado no resumo. Não representa taxas do Brasil ou dos EUA. Financiamento: Eli Lilly.",
    locator:"Resumo, Results; mudança para categoria PHQ-9 mais grave",approvedForProjection:false,
  },
  {
    id:"withdrawal",label:"Interrupção",title:"Após a retirada, o peso voltou a subir no SURMOUNT-4",
    question:"O que aconteceu quando o tratamento foi interrompido?",unit:"% do peso na randomização",axisLabel:"Mudança no peso da semana 36 à semana 88 (%)",
    arms:[{label:"Continuou tirzepatida",value:-5.5,n:335},{label:"Trocou para placebo",value:14,n:335}],
    population:"670 adultos randomizados após 36 semanas de tirzepatida; sem diabetes; estudo internacional.",
    period:"52 semanas após a randomização",design:"Ensaio randomizado de retirada",pmid:"38078870",
    finding:"Os dois grupos haviam recebido tratamento na fase inicial. O placebo aqui representa retirada, não ausência de uso prévio.",
    limitation:"Pessoas que completaram a fase inicial foram selecionadas. Não prolongar essa curva por 5, 10 ou 15 anos. Financiamento: Eli Lilly.",
    locator:"Resumo, Results; mudança média do peso entre semanas 36 e 88",approvedForProjection:false,
  },
  {
    id:"icu",label:"Gravidade na UTI",title:"Perda muscular observada na primeira semana de UTI",
    question:"A gravidade da doença faz diferença para o músculo?",unit:"% da área do reto femoral inicial",axisLabel:"Mudança na área do músculo reto femoral por ultrassom (%)",
    arms:[{label:"Falência de um órgão",value:-3,n:null},{label:"Falência de múltiplos órgãos",value:-15.7,n:null}],
    population:"Coorte de 63 pacientes críticos em dois hospitais da Inglaterra; total da coorte, não N de cada subgrupo.",
    period:"Dia 1 ao dia 7 de UTI",design:"Coorte prospectiva observacional",pmid:"24108501",
    finding:"A perda foi maior no grupo com falência de múltiplos órgãos. Mesmo o grupo com um órgão em falência era de pacientes críticos, não casos leves.",
    limitation:"O estudo não avaliou GLP-1 ou tirzepatida. Ultrassom de um músculo não equivale a massa magra por DXA. Não calcula chance de recuperação ou morte.",
    locator:"Resumo, Results; comparação por falência orgânica no dia 7",approvedForProjection:false,
  },
];

export const horizons = [2026,2031,2036,2041] as const;
export const countrySnapshot = {
  brazil:{value:null,year:null,status:"insufficient_evidence",definition:"Não foi localizada nesta busca uma prevalência nacional comparável de uso atual ou passado de GLP-1/GIP.",pmid:"41796096"},
  usa:{value:12,year:2025,status:"preprint",definition:"Uso atual ou passado de GLP-1/GIP, por qualquer indicação; adultos ≥18 anos, outubro de 2025. Não mede somente uso ativo para emagrecimento.",pmid:"42922826"},
} as const;

/** No calibrated longitudinal country model exists in the retrieved evidence. Missing ≠ zero. */
export function futureCountryValue(country:"BR"|"US",year:number):null {
  void country; void year;
  return null;
}

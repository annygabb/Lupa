import { z } from "zod";

/**
 * LUPA — modelo determinístico de fluxos de tratamento, NÃO de desfechos clínicos.
 * Tudo que entra é uma hipótese editável; nenhum N/percentual é inferido dos ensaios.
 * O conjunto-base NÃO representa automaticamente o total elegível no Brasil.
 */
export const scenarioInputSchema = z.strictObject({
  referenceYear: z.literal(2026),
  populationBase: z.number().int().min(1_000).max(100_000_000),
  annualPopulationGrowthPct: z.number().finite().min(-5).max(5),
  initialActivePct: z.number().finite().min(0).max(30),
  annualStartPct: z.number().finite().min(0).max(30),
  annualRetentionPct: z.number().finite().min(0).max(100),
  annualAccessIncreasePp: z.number().finite().min(0).max(5),
  costPerActivePersonBRL: z.number().finite().min(0).max(150_000),
});

export type ScenarioInput = z.infer<typeof scenarioInputSchema>;
export type ScenarioPresetId = "conservador"|"intermediario"|"expansao";

export const SCENARIO_PRESETS: Record<ScenarioPresetId, {label:string;note:string;input:ScenarioInput}> = {
  conservador: {
    label:"Acesso restrito",
    note:"Baixa taxa hipotética de início; não representa cobertura observada.",
    input:{referenceYear:2026,populationBase:1_000_000,annualPopulationGrowthPct:0,
      initialActivePct:1,annualStartPct:.7,annualRetentionPct:55,
      annualAccessIncreasePp:0,costPerActivePersonBRL:0},
  },
  intermediario: {
    label:"Acesso gradual",
    note:"Crescimento moderado das entradas e continuidade assumida.",
    input:{referenceYear:2026,populationBase:1_000_000,annualPopulationGrowthPct:0,
      initialActivePct:2,annualStartPct:2.5,annualRetentionPct:70,
      annualAccessIncreasePp:.3,costPerActivePersonBRL:0},
  },
  expansao: {
    label:"Expansão hipotética",
    note:"Ampliação ilustrativa de início de tratamento — NÃO é compromisso do SUS.",
    input:{referenceYear:2026,populationBase:1_000_000,annualPopulationGrowthPct:0,
      initialActivePct:3,annualStartPct:5,annualRetentionPct:80,
      annualAccessIncreasePp:1,costPerActivePersonBRL:0},
  },
};

export interface ScenarioYear {
  year: number;
  referencePopulation: number;
  startRatePct: number;
  continued: number;
  started: number;
  exited: number;
  active: number;
  activeSharePct: number;
  annualIllustrativeCostBRL: number|null;
  cumulativeStarts: number;
}

export interface ScenarioResult {
  modelVersion: "lupa-flow-v1";
  kind: "hypothetical_illustration";
  input: ScenarioInput;
  rows: readonly ScenarioYear[];
  last2031: ScenarioYear;
  last2036: ScenarioYear;
  sources: readonly {name:string;url:string;role:"context_only"}[];
  warnings: readonly string[];
}

const contextSources=[
  {name:"IBGE — projeções da população (revisão 2024)",url:"https://www.ibge.gov.br/estatisticas/sociais/populacao/9109-proje%C3%A7%C3%A3o-da-populacao.html",role:"context_only" as const},
  {name:"Vigitel Brasil 2006–2024 — capitais e DF",url:"https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/vigitel/",role:"context_only" as const},
  {name:"Ministério da Saúde — pedido de avaliação na Conitec (24/09/2026)",url:"https://www.gov.br/saude/pt-br/assuntos/noticias/2026/setembro/ministerio-da-saude-protocola-na-conitec-pedido-de-analise-para-incorporacao-de-canetas-emagrecedoras-no-sus",role:"context_only" as const},
];

export function runScenario(untrusted: ScenarioInput): ScenarioResult {
  const input=scenarioInputSchema.parse(untrusted);
  const rows: ScenarioYear[]=[];
  let priorActive=Math.round(input.populationBase*input.initialActivePct/100);
  let cumulativeStarts=0;

  for(let year=input.referenceYear;year<=2036;year++) {
    const elapsed=year-input.referenceYear;
    const population=Math.max(0,Math.round(input.populationBase*Math.pow(1+input.annualPopulationGrowthPct/100,elapsed)));
    const rate=Math.min(100,input.annualStartPct+input.annualAccessIncreasePp*elapsed);
    if(elapsed===0) {
      const active=Math.min(population,priorActive);
      rows.push({year,referencePopulation:population,startRatePct:0,
        continued:active,started:0,exited:0,active,activeSharePct:population?100*active/population:0,
        annualIllustrativeCostBRL:input.costPerActivePersonBRL>0?
          Math.round(active*input.costPerActivePersonBRL):null,cumulativeStarts});
      priorActive=active;
      continue;
    }

    const continued=Math.min(population,Math.round(priorActive*input.annualRetentionPct/100));
    const exited=Math.max(0,priorActive-continued);
    const slots=Math.max(0,population-continued);
    const started=Math.min(slots,Math.round(slots*rate/100));
    const active=continued+started;
    cumulativeStarts+=started;

    rows.push({
      year,referencePopulation:population,startRatePct:rate,
      continued,started,exited,active,
      activeSharePct:population?100*active/population:0,
      annualIllustrativeCostBRL:input.costPerActivePersonBRL>0?
        Math.round(active*input.costPerActivePersonBRL):null,
      cumulativeStarts,
    });
    priorActive=active;
  }
  const last2031=rows.find(r=>r.year===2031);
  const last2036=rows.find(r=>r.year===2036);
  if(!last2031||!last2036)throw new Error("Horizonte de projeção não calculado");

  return {
    modelVersion:"lupa-flow-v1",kind:"hypothetical_illustration",input,rows,last2031,last2036,
    sources:contextSources,
    warnings:[
      "Simulação hipotética de entradas, continuidade e saída; não é previsão, incidência, eficácia clínica ou cobertura brasileira estimada.",
      "População de referência, taxas de início, continuidade, crescimento e custo foram definidos pelo usuário ou pelo preset ilustrativo; não são dados observados pelo LUPA.",
      "A saída de tratamento é diferença entre ativos anteriores e quem continua. Pessoas podem iniciar novamente em outro ano; entradas acumuladas não equivalem a indivíduos únicos.",
      "Não estima eventos adversos, mudanças de massa magra, mortalidade, internação em UTI nem resultados clínicos.",
      "O pedido de avaliação à Conitec em 24/09/2026 não equivale à incorporação ou fornecimento universal pelo SUS.",
      "Valores monetários só aparecem quando se informa custo anual hipotético por pessoa; não incluem validação orçamentária ou preço oficial.",
    ],
  };
}

export function scenarioCsv(result: ScenarioResult): string {
  const columns=[
    ["year","ano"],["referencePopulation","populacao_referencia"],
    ["startRatePct","taxa_inicio_pct"],["continued","continuaram"],["started","iniciaram"],
    ["exited","saidas"],["active","ativos"],["activeSharePct","pct_ativos"],
    ["annualIllustrativeCostBRL","custo_hipotetico_brl"],
    ["cumulativeStarts","entradas_acumuladas"],
  ] as const;
  const head=columns.map(c=>c[1]).join(";");
  const lines=result.rows.map(row=>columns.map(([key])=>{
    const value=row[key];
    return value===null?"":String(value).replace(".",",");
  }).join(";"));
  const comments=[
    "# SIMULACAO HIPOTETICA LUPA (nao e previsao clinica ou oficial)",
    "# modelo="+result.modelVersion,
    "# entradas_acumuladas nao equivale a pessoas unicas",
  ];
  return "\uFEFF"+[...comments,head,...lines].join("\r\n")+"\r\n";
}

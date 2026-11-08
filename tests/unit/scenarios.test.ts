import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ScenarioDashboard } from "../../components/scenarios/scenario-dashboard";
import {
  SCENARIO_PRESETS, runScenario, scenarioCsv, scenarioInputSchema,
} from "../../features/scenarios/engine";

const example=SCENARIO_PRESETS.intermediario.input;

describe("Etapa 6 — motor de cenários hipotéticos",()=>{
  it("valida todos os presets e a natureza ilustrativa",()=>{
    for(const value of Object.values(SCENARIO_PRESETS)){
      expect(scenarioInputSchema.safeParse(value.input).success).toBe(true);
      const res=runScenario(value.input);
      expect(res.kind).toBe("hypothetical_illustration");
      expect(res.modelVersion).toBe("lupa-flow-v2");
      expect(res.rows).toHaveLength(16);
    }
  });
  it("calcula 2026–2041 com 2031 e 2036 presentes sem números clínicos",()=>{
    const out=runScenario(example);
    expect(out.rows[0].year).toBe(2026);
    expect(out.rows[10].year).toBe(2036);
    expect(out.last2031.year).toBe(2031);
    expect(out.last2036.year).toBe(2036);
    expect(out.rows[0].referencePopulation).toBe(1_000_000);
    expect(out.rows[0].active).toBe(20_000);
    expect(out.last2036.active).toBeGreaterThan(out.last2031.active);
    expect(out.warnings.some(w=>w.includes("não é previsão"))).toBe(true);
    expect(out.sources.every(source=>source.role==="context_only")).toBe(true);
  });
  it("é determinístico e mantém contagens e proporções coerentes",()=>{
    const a=runScenario(example);
    const b=runScenario({...example});
    expect(a).toEqual(b);
    for(let i=0;i<a.rows.length;i++){
      const row=a.rows[i];
      expect(row.active).toBe(row.continued+row.started);
      expect(row.active).toBeLessThanOrEqual(row.referencePopulation);
      expect(row.started).toBeGreaterThanOrEqual(0);
      expect(row.exited).toBeGreaterThanOrEqual(0);
      expect(row.activeSharePct).toBeGreaterThanOrEqual(0);
      expect(row.activeSharePct).toBeLessThanOrEqual(100);
      if(i>0)expect(row.exited).toBe(a.rows[i-1].active-row.continued);
    }
  });
  it("preserva ativos com continuidade 100 e sem novas entradas",()=>{
    const out=runScenario({...example,initialActivePct:10,annualRetentionPct:100,
      annualStartPct:0,annualAccessIncreasePp:0,annualPopulationGrowthPct:0});
    expect(out.rows.every(r=>r.active===100_000)).toBe(true);
    expect(out.rows.slice(1).every(r=>r.started===0&&r.exited===0)).toBe(true);
  });
  it("não mantém tratamento com retenção zero e sem início",()=>{
    const out=runScenario({...example,initialActivePct:10,
      annualRetentionPct:0,annualStartPct:0,annualAccessIncreasePp:0});
    expect(out.rows[0].active).toBe(100_000);
    expect(out.rows[1].active).toBe(0);
    expect(out.rows[1].exited).toBe(100_000);
    expect(out.rows.at(-1)?.active).toBe(0);
  });
  it("não gera ativos acima do grupo quando o grupo encolhe",()=>{
    const out=runScenario({...example,initialActivePct:30,annualRetentionPct:100,
      annualStartPct:30,annualAccessIncreasePp:5,annualPopulationGrowthPct:-5});
    expect(out.rows.every(r=>r.active<=r.referencePopulation)).toBe(true);
  });
  it("não inventa custos quando usuário informa zero",()=>{
    const out=runScenario(example);
    expect(out.rows.every(r=>r.annualIllustrativeCostBRL===null)).toBe(true);
  });
  it("custo hipotético é calculado exclusivamente pelo parâmetro do usuário",()=>{
    const out=runScenario({...example,costPerActivePersonBRL:250});
    expect(out.last2036.annualIllustrativeCostBRL).toBe(out.last2036.active*250);
    expect(out.rows[0].annualIllustrativeCostBRL).toBe(20_000*250);
    expect(out.warnings.some(w=>w.includes("orçamentária"))).toBe(true);
  });
  it("recusa valores inválidos incluindo NaN, proporções fora de faixa e N impossível",()=>{
    for(const bad of [
      {...example,populationBase:0},
      {...example,populationBase:1e12},
      {...example,annualRetentionPct:101},
      {...example,annualStartPct:99},
      {...example,annualAccessIncreasePp:6},
      {...example,annualPopulationGrowthPct:-99},
      {...example,costPerActivePersonBRL:-1},
      {...example,annualStartPct:Number.NaN},
    ]){
      expect(scenarioInputSchema.safeParse(bad).success).toBe(false);
      expect(()=>runScenario(bad)).toThrow();
    }
  });
  it("presets crescentes produzem cenários ordenados, sem inferir uso real no Brasil",()=>{
    const c=runScenario(SCENARIO_PRESETS.conservador.input).last2036.active;
    const m=runScenario(SCENARIO_PRESETS.intermediario.input).last2036.active;
    const e=runScenario(SCENARIO_PRESETS.expansao.input).last2036.active;
    expect(c).toBeLessThan(m);expect(m).toBeLessThan(e);
  });
  it("CSV possui BOM, dezesseis linhas de dados e aviso obrigatório",()=>{
    const csv=scenarioCsv(runScenario(example));
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("SIMULACAO HIPOTETICA");
    expect(csv).toContain("entradas_acumuladas nao equivale a pessoas unicas");
    expect(csv).toContain("ano;populacao_referencia");
    expect(csv.split("\r\n").filter(line=>/^20(2[6-9]|3[0-9]|4[01]);/.test(line))).toHaveLength(16);
  });
  it("renderiza entradas, gráfico, 2031/2036, fontes, exportação e avisos",()=>{
    const html=renderToStaticMarkup(createElement(ScenarioDashboard));
    expect(html).toContain("Projete hipóteses");
    expect(html).toContain("Horizonte 2031");
    expect(html).toContain("Horizonte 2036");
    expect(html).toContain('id="scenario-populationBase"');
    expect(html).toContain('id="scenario-annualRetentionPct"');
    expect(html).toContain("Exportar CSV");
    expect(html).toContain("Exportar JSON");
    expect(html).toContain("Tabela anual");
    expect(html).toContain("O que os resultados não significam");
    expect(html).toContain("Conitec");
  });
});

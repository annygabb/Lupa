import { describe, expect, it } from "vitest";
import { SCENARIO_PRESETS, runScenario, scenarioInputSchema } from "../../features/scenarios/engine";
import {
  SENSITIVITY_HORIZONS, SENSITIVITY_OUTPUTS, runSensitivity, sensitivityGrid,
} from "../../features/scenarios/sensitivity";
import {
  buildScenarioExport, scenarioExportCsv, scenarioExportJson,
} from "../../components/routes/projecoes/scenario-export";

const base = SCENARIO_PRESETS.intermediario.input;
const values = [50, 60, 70, 80, 90];

describe("FE-06 — análise de sensibilidade uma premissa por vez", () => {
  it("é determinística: mesma entrada produz exatamente a mesma saída", () => {
    const a = runSensitivity(base, "annualRetentionPct", values);
    const b = runSensitivity({ ...base }, "annualRetentionPct", [...values]);
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.method).toBe("one_at_a_time");
    expect(a.modelVersion).toBe("lupa-flow-v2");
    expect(a.kind).toBe("hypothetical_illustration");
    expect(a.notice).toMatch(/uma premissa por vez/);
    expect(a.notice).toMatch(/não efeito clínico/);
  });

  it("varia somente o campo escolhido; as demais premissas ficam constantes", () => {
    const out = runSensitivity(base, "annualStartPct", [1, 2.5, 4]);
    expect(out.points).toHaveLength(3);
    for (const p of out.points) {
      const { annualStartPct, ...rest } = p.input;
      const { annualStartPct: baseStart, ...baseRest } = base;
      expect(rest).toEqual(baseRest);
      expect(annualStartPct).toBe(p.value);
      expect(p.isBaseline).toBe(p.value === baseStart);
    }
    expect(out.baselineValue).toBe(2.5);
    expect(out.baselineInput).toEqual(base);
  });

  it("rejeita valores inválidos pelo mesmo schema do motor e não os calcula", () => {
    const out = runSensitivity(base, "annualRetentionPct", [101, -1, Number.NaN, 70]);
    expect(out.points.map(p => p.value)).toEqual([70]);
    expect(out.rejected.map(r => r.value)).toEqual([101, -1, Number.NaN]);
    for (const r of out.rejected) {
      expect(scenarioInputSchema.safeParse({ ...base, annualRetentionPct: r.value }).success).toBe(false);
      expect(r.reason.length).toBeGreaterThan(0);
    }
    expect(runSensitivity(base, "populationBase", [1500.5]).rejected).toHaveLength(1);
    expect(() => runSensitivity(base, "referenceYear" as never, [2026])).toThrow();
    expect(() => runSensitivity({ ...base, annualStartPct: 99 }, "annualRetentionPct", values)).toThrow();
  });

  it("preserva custo não informado como null, nunca 0", () => {
    const out = runSensitivity(base, "annualRetentionPct", values);
    for (const y of SENSITIVITY_HORIZONS) {
      expect(out.baseline[y].annualIllustrativeCostBRL).toBeNull();
      for (const p of out.points) {
        expect(p.horizons[y].annualIllustrativeCostBRL).toEqual({ value: null, deltaAbs: null, deltaPct: null });
      }
    }
    const withCost = runSensitivity({ ...base, costPerActivePersonBRL: 250 }, "annualRetentionPct", values);
    const p = withCost.points.find(x => x.value === 80)!;
    const ref = runScenario({ ...base, costPerActivePersonBRL: 250, annualRetentionPct: 80 }).last2036;
    expect(p.horizons[2036].annualIllustrativeCostBRL.value).toBe(ref.annualIllustrativeCostBRL);
    expect(p.horizons[2036].annualIllustrativeCostBRL.deltaAbs).not.toBeNull();
  });

  it("deltas absolutos e percentuais batem com runScenario em 2031/2036/2041", () => {
    const out = runSensitivity(base, "annualRetentionPct", values);
    const ref = runScenario(base);
    for (const p of out.points) {
      const variant = runScenario({ ...base, annualRetentionPct: p.value });
      for (const y of SENSITIVITY_HORIZONS) {
        const v = variant.rows.find(r => r.year === y)!;
        const b = ref.rows.find(r => r.year === y)!;
        for (const o of SENSITIVITY_OUTPUTS.filter(k => k !== "annualIllustrativeCostBRL")) {
          const m = p.horizons[y][o];
          expect(m.value).toBe(v[o]);
          expect(m.deltaAbs).toBe((v[o] as number) - (b[o] as number));
          if (b[o] === 0) expect(m.deltaPct).toBeNull();
          else expect(m.deltaPct).toBeCloseTo(100 * ((v[o] as number) - (b[o] as number)) / (b[o] as number), 10);
        }
      }
      if (p.isBaseline) for (const y of SENSITIVITY_HORIZONS) {
        expect(p.horizons[y].active.deltaAbs).toBe(0);
        expect(p.horizons[y].active.deltaPct).toBe(0);
      }
    }
    // Continuidade maior não reduz ativos neste cenário.
    const active2041 = out.points.map(p => p.horizons[2041].active.value as number);
    expect([...active2041].sort((a, b) => a - b)).toEqual(active2041);
  });

  it("não altera o horizonte 2026–2041 do motor", () => {
    const out = runSensitivity(base, "initialActivePct", [0, 1, 2, 3]);
    expect(Object.keys(out.baseline).map(Number)).toEqual([2031, 2036, 2041]);
    for (const p of out.points) {
      const rows = runScenario(p.input).rows;
      expect(rows).toHaveLength(16);
      expect(rows[0].year).toBe(2026);
      expect(rows.at(-1)!.year).toBe(2041);
    }
  });

  it("mantém invariantes: ativos ≤ população de referência e nenhuma saída negativa", () => {
    const extreme = { ...base, initialActivePct: 30, annualStartPct: 30, annualAccessIncreasePp: 5, annualPopulationGrowthPct: -5 };
    for (const field of ["annualRetentionPct", "annualStartPct", "annualPopulationGrowthPct", "annualAccessIncreasePp", "initialActivePct"] as const) {
      const grid = sensitivityGrid(field, extreme[field], [-100, -10, -1, 1, 10, 100]);
      const out = runSensitivity(extreme, field, grid);
      expect(out.rejected).toHaveLength(0);
      for (const p of out.points) {
        for (const row of runScenario(p.input).rows) expect(row.active).toBeLessThanOrEqual(row.referencePopulation);
        for (const y of SENSITIVITY_HORIZONS) for (const o of SENSITIVITY_OUTPUTS) {
          const v = p.horizons[y][o].value;
          if (v !== null) expect(v).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("grade de valores respeita os limites do schema, inclui o atual e não repete", () => {
    expect(sensitivityGrid("annualRetentionPct", 95, [-20, -10, 10, 20])).toEqual([75, 85, 95, 100]);
    expect(sensitivityGrid("annualStartPct", 0.5, [-2, -1, 1, 2])).toEqual([0, 0.5, 1.5, 2.5]);
    expect(sensitivityGrid("annualAccessIncreasePp", 0.3, [-.2, -.1, .1, .2])).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
  });
});

describe("FE-03 — exportação do laboratório", () => {
  const result = runScenario(base);
  const sens = runSensitivity(base, "annualRetentionPct", values);
  const when = new Date("2026-11-08T12:00:00.000Z");

  it("JSON traz modelVersion real, kind, timestamp ISO, premissas, resultados e aviso", () => {
    const data = JSON.parse(scenarioExportJson(result, null, when));
    expect(data.modelVersion).toBe("lupa-flow-v2");
    expect(data.kind).toBe("hypothetical_illustration");
    expect(data.exportedAt).toBe("2026-11-08T12:00:00.000Z");
    expect(data.assumptions).toEqual(base);
    expect(data.results.rows).toHaveLength(16);
    expect(Object.keys(data.results.horizons)).toEqual(["2031", "2036", "2041"]);
    expect(data.results.costInformed).toBe(false);
    expect(data.results.horizons["2036"].annualIllustrativeCostBRL).toBeNull();
    expect(data.methodologicalNotice).toMatch(/hipotética/);
    expect(data.methodologicalNotice).toMatch(/não informado, não zero/);
    expect(data.sensitivity).toBeNull();
  });

  it("inclui a sensibilidade quando calculada", () => {
    const data = buildScenarioExport(result, sens, when);
    expect(data.sensitivity?.field).toBe("annualRetentionPct");
    expect(data.sensitivity?.points).toHaveLength(5);
    expect(JSON.parse(scenarioExportJson(result, sens, when)).sensitivity.method).toBe("one_at_a_time");
  });

  it("CSV mantém o conteúdo do motor e acrescenta metadados e sensibilidade", () => {
    const csv = scenarioExportCsv(result, sens, when);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.match(/﻿/g)).toHaveLength(1);
    expect(csv).toContain("# modelo=lupa-flow-v2");
    expect(csv).toContain("# kind=hypothetical_illustration");
    expect(csv).toContain("# exportado_em=2026-11-08T12:00:00.000Z");
    expect(csv).toContain("# premissa annualRetentionPct=70");
    expect(csv).toContain("SIMULACAO HIPOTETICA");
    expect(csv.split("\r\n").filter(l => /^20(2[6-9]|3[0-9]|4[01]);/.test(l))).toHaveLength(16);
    expect(csv).toContain("premissa;valor;horizonte;saida;valor_saida;delta_abs;delta_pct");
    expect(csv.split("\r\n").filter(l => l.startsWith("annualRetentionPct;"))).toHaveLength(5 * 3 * 5);
    expect(csv).toContain("annualRetentionPct;70;2031;annualIllustrativeCostBRL;;;");
    expect(scenarioExportCsv(result, null, when)).not.toContain("ANALISE DE SENSIBILIDADE");
  });
});

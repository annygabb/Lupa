import { z } from "zod";
import {
  runScenario, scenarioInputSchema,
  type ScenarioInput, type ScenarioResult, type ScenarioYear,
} from "./engine";

/**
 * Análise de sensibilidade "uma premissa por vez" sobre o modelo lupa-flow-v2.
 * Não há fórmula paralela: cada variação é recalculada por `runScenario` e validada
 * pelo mesmo `scenarioInputSchema`. O resultado descreve o comportamento do MODELO
 * hipotético; não é efeito clínico, previsão nem intervalo de incerteza estatística.
 */
export const SENSITIVITY_HORIZONS = [2031, 2036, 2041] as const;
export type SensitivityHorizon = (typeof SENSITIVITY_HORIZONS)[number];

export const SENSITIVITY_OUTPUTS = ["active", "started", "continued", "exited", "annualIllustrativeCostBRL"] as const;
export type SensitivityOutput = (typeof SENSITIVITY_OUTPUTS)[number];

export const sensitivityFieldSchema = z.enum([
  "populationBase", "annualPopulationGrowthPct", "initialActivePct", "annualStartPct",
  "annualRetentionPct", "annualAccessIncreasePp", "costPerActivePersonBRL",
]);
export type SensitivityField = z.infer<typeof sensitivityFieldSchema>;

export const SENSITIVITY_NOTICE =
  "Varia uma premissa por vez; as demais ficam constantes. Resultado do modelo hipotético lupa-flow-v2, não efeito clínico, previsão ou intervalo de confiança.";

export interface SensitivityMetric {
  /** Saída do modelo; `null` quando não calculada (ex.: custo não informado). Nunca 0 por ausência. */
  value: number | null;
  /** Diferença absoluta contra o cenário-base; `null` se algum dos lados for `null`. */
  deltaAbs: number | null;
  /** Diferença percentual contra o cenário-base; `null` se o base for `null` ou 0. */
  deltaPct: number | null;
}
export type SensitivityHorizonOutputs = Record<SensitivityOutput, SensitivityMetric>;

export interface SensitivityPoint {
  value: number;
  isBaseline: boolean;
  input: ScenarioInput;
  horizons: Record<SensitivityHorizon, SensitivityHorizonOutputs>;
}

export interface SensitivityResult {
  method: "one_at_a_time";
  modelVersion: ScenarioResult["modelVersion"];
  kind: ScenarioResult["kind"];
  field: SensitivityField;
  baselineValue: number;
  baselineInput: ScenarioInput;
  baseline: Record<SensitivityHorizon, Record<SensitivityOutput, number | null>>;
  points: readonly SensitivityPoint[];
  rejected: readonly { value: unknown; reason: string }[];
  notice: string;
}

function rowAt(result: ScenarioResult, year: SensitivityHorizon): ScenarioYear {
  const row = result.rows.find(r => r.year === year);
  if (!row) throw new Error("Horizonte de sensibilidade ausente: " + year);
  return row;
}

function outputsOf(row: ScenarioYear): Record<SensitivityOutput, number | null> {
  return {
    active: row.active,
    started: row.started,
    continued: row.continued,
    exited: row.exited,
    annualIllustrativeCostBRL: row.annualIllustrativeCostBRL,
  };
}

function compare(value: number | null, base: number | null): SensitivityMetric {
  if (value === null || base === null) return { value, deltaAbs: null, deltaPct: null };
  const deltaAbs = value - base;
  return { value, deltaAbs, deltaPct: base === 0 ? null : 100 * deltaAbs / base };
}

/**
 * Recalcula o cenário variando apenas `field`. Valores que o schema do motor recusa
 * (fora da faixa, NaN, não inteiro onde exigido) não são calculados: vão para `rejected`.
 * Lança erro se a entrada-base ou o campo forem inválidos.
 */
export function runSensitivity(input: ScenarioInput, field: SensitivityField, values: readonly number[]): SensitivityResult {
  const base = scenarioInputSchema.parse(input);
  const key = sensitivityFieldSchema.parse(field);
  const baseResult = runScenario(base);

  const baseline = Object.fromEntries(SENSITIVITY_HORIZONS.map(y => [y, outputsOf(rowAt(baseResult, y))])) as SensitivityResult["baseline"];
  const points: SensitivityPoint[] = [];
  const rejected: { value: unknown; reason: string }[] = [];

  for (const value of values) {
    const parsed = scenarioInputSchema.safeParse({ ...base, [key]: value });
    if (!parsed.success) {
      rejected.push({ value, reason: parsed.error.issues.map(i => i.message).join("; ") });
      continue;
    }
    const variant = runScenario(parsed.data);
    const horizons = Object.fromEntries(SENSITIVITY_HORIZONS.map(y => {
      const out = outputsOf(rowAt(variant, y));
      return [y, Object.fromEntries(SENSITIVITY_OUTPUTS.map(o => [o, compare(out[o], baseline[y][o])])) as SensitivityHorizonOutputs];
    })) as SensitivityPoint["horizons"];
    points.push({ value: parsed.data[key], isBaseline: parsed.data[key] === base[key], input: parsed.data, horizons });
  }

  return {
    method: "one_at_a_time",
    modelVersion: baseResult.modelVersion,
    kind: baseResult.kind,
    field: key,
    baselineValue: base[key],
    baselineInput: base,
    baseline,
    points,
    rejected,
    notice: SENSITIVITY_NOTICE,
  };
}

/**
 * Valores de teste ao redor do valor atual: `center + offset`, restritos aos limites do
 * schema do motor, arredondados para evitar ruído de ponto flutuante e sem repetição.
 */
export function sensitivityGrid(field: SensitivityField, center: number, offsets: readonly number[], decimals = 2): number[] {
  const shape = scenarioInputSchema.shape[sensitivityFieldSchema.parse(field)];
  const min = shape.minValue ?? -Infinity;
  const max = shape.maxValue ?? Infinity;
  const f = 10 ** decimals;
  const out: number[] = [];
  for (const offset of [0, ...offsets]) {
    const v = Math.round(Math.min(max, Math.max(min, center + offset)) * f) / f;
    if (Number.isFinite(v) && !out.includes(v)) out.push(v);
  }
  return out.sort((a, b) => a - b);
}

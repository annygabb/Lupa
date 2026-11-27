/**
 * Simulação educativa sem inferência de músculo basal, força ou risco hospitalar individual.
 * A sensibilidade de 20–25% se aplica à FRAÇÃO DO PESO PERDIDO, não aos músculos.
 * SURMOUNT-1 DXA, semana 72: PMID 39996356; não extrapolar taxa mensal.
 */
export type LossMode = "kg" | "percent";
export type SexStyle = "feminino" | "masculino" | "neutro" | "nao-informar";
export type MedicineContext = "tirzepatida" | "semaglutida" | "outro" | "nenhum" | "nao-informar";

export interface TimepointInput {
  id: string;
  month: number;
  loss: number;
}
export interface BodyProjectionInput {
  initialWeightKg: number;
  heightCm: number;
  ageYears: number;
  lossMode: LossMode;
  timepoints: TimepointInput[];
  leanLowPct: number;
  leanHighPct: number;
}
export interface ProjectionRow {
  id: string;
  month: number;
  enteredLoss: number;
  lostKg: number;
  weightAfterKg: number;
  leanLossLowKg: number;
  leanLossHighKg: number;
  fatLossLowKg: number;
  fatLossHighKg: number;
}
export interface BodyProjection {
  input: BodyProjectionInput;
  rows: ProjectionRow[];
  bmi: number;
  label: "hipotese_matematica_nao_clinica";
}
export function buildBodyProjection(input: BodyProjectionInput): BodyProjection {
  const { initialWeightKg: weight, heightCm: height, ageYears: age,
    lossMode, timepoints, leanLowPct: low, leanHighPct: high } = input;
  if (![weight, height, age, low, high].every(Number.isFinite) ||
    weight < 30 || weight > 400 || height < 120 || height > 230 ||
    !Number.isInteger(age) || age < 18 || age > 110 ||
    low < 0 || high > 100 || low > high ||
    (lossMode !== "kg" && lossMode !== "percent") ||
    timepoints.length < 1 || timepoints.length > 12) {
    throw new RangeError("Revise os valores de peso, altura, idade, fração e períodos.");
  }
  const months = new Set<number>();
  const rows = timepoints.map(({ id, month, loss }) => {
    const lostKg = lossMode === "percent" ? (weight * loss / 100) : loss;
    if (!id || !Number.isInteger(month) || month < 1 || month > 60 ||
      months.has(month) || !Number.isFinite(loss) || loss < 0 ||
      lostKg >= weight) {
      throw new RangeError("Revise meses repetidos, perda negativa ou maior que o peso inicial.");
    }
    months.add(month);
    return {
      id, month, enteredLoss: loss, lostKg,
      weightAfterKg: weight - lostKg,
      leanLossLowKg: lostKg * low / 100,
      leanLossHighKg: lostKg * high / 100,
      fatLossLowKg: lostKg * (1 - high / 100),
      fatLossHighKg: lostKg * (1 - low / 100),
    };
  }).sort((a, b) => a.month - b.month);
  return { input, rows, bmi: weight / Math.pow(height / 100, 2),
    label: "hipotese_matematica_nao_clinica" };
}

/** Impacto ilustrativo de um grupo HIPOTÉTICO; nunca deriva do corpo do visitante. */
export function buildHospitalLoadExample(patients: number, dailyCostBRL: number,
  observedExtraDays = 1.31) {
  if (![patients, dailyCostBRL, observedExtraDays].every(Number.isFinite) ||
    !Number.isInteger(patients) || patients < 0 || patients > 100000 ||
    dailyCostBRL < 0 || dailyCostBRL > 1000000 ||
    observedExtraDays < 0 || observedExtraDays > 60) {
    throw new RangeError("Premissas hospitalares inválidas.");
  }
  return {
    extraBedDaysIllustrative: patients * observedExtraDays,
    exampleCostBRL: patients * observedExtraDays * dailyCostBRL,
    label: "cenario_nao_previsao" as const,
  };
}

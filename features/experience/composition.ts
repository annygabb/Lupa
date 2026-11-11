/**
 * Simulação matemática DIDÁTICA; jamais prevê composição corporal individual ou desfechos de UTI.
 * O parâmetro leanShareOfLossPct se refere à FRAÇÃO DO PESO PERDIDO, não da massa magra basal.
 */
export interface CompositionInput {
  initialWeightKg: number;
  weightLossKg: number;
  leanShareOfLossPct: number;
}
export interface CompositionOutput {
  weightAfterKg: number;
  fatLossKg: number;
  leanLossKg: number;
  leanShareOfLossPct: number;
  context: "hypothetical_illustration";
}
export function calculateComposition(input: CompositionInput): CompositionOutput {
  const { initialWeightKg: weight, weightLossKg: lost, leanShareOfLossPct: fraction } = input;
  if (![weight, lost, fraction].every(Number.isFinite) ||
      weight < 30 || weight > 400 || lost < 0 || lost >= weight ||
      fraction < 0 || fraction > 100) {
    throw new RangeError("Premissas fora dos limites permitidos.");
  }
  return {
    weightAfterKg: Math.round((weight - lost) * 100) / 100,
    fatLossKg: Math.round(lost * (100 - fraction) * 100) / 10000,
    leanLossKg: Math.round(lost * fraction * 100) / 10000,
    leanShareOfLossPct: fraction,
    context: "hypothetical_illustration",
  };
}

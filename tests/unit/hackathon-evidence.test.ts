import { describe, it, expect } from "vitest";
import { countrySnapshot, futureCountryValue, clinicalPlots } from "../../features/insights/evidence";
import { runScenario, SCENARIO_PRESETS } from "../../features/scenarios/engine";

describe("Comparação científica sem fabricar bases nacionais", () => {
 it("mantém Brasil ausente, sem transformar em zero nem copiar os EUA", () => {
  expect(countrySnapshot.brazil.value).toBeNull();
  expect(countrySnapshot.usa.value).toBe(12);
  expect(countrySnapshot.usa.status).toBe("preprint");
  expect(countrySnapshot.usa.definition).toContain("passado");
 });
 it("não prolonga observações de 2025 até 2026/2031/2036/2041", () => {
  for (const year of [2026,2031,2036,2041]) {
   expect(futureCountryValue("BR", year)).toBeNull();
   expect(futureCountryValue("US", year)).toBeNull();
  }
 });
 it("não atribui efeitos de UTI ao fármaco nem funde escalas", () => {
  const icu=clinicalPlots.find(p=>p.id==="icu")!;
  const lean=clinicalPlots.find(p=>p.id==="lean")!;
  expect(icu.arms.map(a=>a.value)).toEqual([-3,-15.7]);
  expect(icu.population).toContain("Inglaterra");
  expect(icu.approvedForProjection).toBe(false);
  expect(lean.approvedForProjection).toBe(false);
  expect(icu.unit).not.toBe(lean.unit);
  expect(icu.limitation).toContain("não avaliou");
 });
 it("preserva referência e calcula cenário ilustrativo até 2041 dentro do grupo", () => {
  const r=runScenario(SCENARIO_PRESETS.intermediario.input);
  expect(r.rows).toHaveLength(16);
  expect(r.rows[0].year).toBe(2026);
  expect(r.last2041.year).toBe(2041);
  expect(r.rows.every(y=>y.active<=y.referencePopulation&&y.active>=0)).toBe(true);
  expect(r.kind).toBe("hypothetical_illustration");
 });
});

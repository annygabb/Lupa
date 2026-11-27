import { describe, expect, it } from "vitest";
import { buildReport, parseCsv } from "../../scripts/pilot-report.mjs";

// DADOS FICTÍCIOS apenas para testar o cálculo. Não são resultados do LUPA.
const fixture = `participante,formacao,tarefa,etapa,correta,erro_grave,segundos,clareza
F01,teste,massa-magra,pre,0,1,40,
F01,teste,massa-magra,pos,1,0,30,4
F02,teste,massa-magra,pre,1,0,50,
F02,teste,massa-magra,pos,1,0,20,5`;

describe("relatório do piloto de compreensão", () => {
  it("calcula precisão com denominadores, mudança e erros graves", () => {
    const report = buildReport(parseCsv(fixture), { date: "2026-01-01" });
    expect(report).toContain("n real de participantes: 2");
    expect(report).toContain("| massa-magra | 1/2 (50,0%) | 2/2 (100,0%) | 50,0 | 1 → 0 | 25 |");
    expect(report).toContain("| comparacao-uti | 0/0 (—) | 0/0 (—) | — |");
  });
  it("recusa dados vazios, e-mails e valores inválidos", () => {
    expect(() => buildReport([])).toThrow(/sem dados reais/);
    expect(() => parseCsv(fixture.replace("F01,teste,massa-magra,pre", "a@b.com,teste,massa-magra,pre"))).toThrow();
    expect(() => parseCsv(fixture.replace(",pre,0,1,40,", ",pre,2,1,40,"))).toThrow(/0 ou 1/);
  });
});

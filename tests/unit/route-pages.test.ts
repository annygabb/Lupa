/**
 * Testes de renderização das PÁGINAS REAIS (app/*), que substituem os testes que
 * renderizavam componentes legados não usados por nenhuma rota (removidos na remediação).
 * Verificam as salvaguardas científicas visíveis ao usuário em cada tela.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { reviewedMetrics } from "../../features/comparison/reviewed-metrics";
import { unifiedEvidenceCatalog } from "../../features/evidence/unified-catalog";

async function render(route: string) {
  const mod = await import("../../app/" + (route ? route + "/" : "") + "page");
  const element = await mod.default({ searchParams: Promise.resolve({}) });
  return renderToStaticMarkup(element ?? createElement(mod.default));
}

describe("página inicial", () => {
  it("comunica o problema, o público e a curadoria sem exagerar", async () => {
    const html = await render("");
    for (const text of ["Canetas para emagrecer", "profissionais de saúde", "Por que o LUPA existe",
      "50 referências", "benefícios, riscos", "não 25% dos músculos"]) expect(html).toContain(text);
    expect(html).not.toMatch(/validad[oa] clinicamente|aprovad[oa] pela banca|previs[ãa]o para o SUS confirmada/i);
  });
});

describe("/comparar", () => {
  it("bloqueia cálculo combinado e mostra a lacuna causal no estado inicial", async () => {
    const html = await render("comparar");
    for (const text of ['id="compare-left"', 'id="compare-right"', "Cálculo combinado",
      "Ligação causal não demonstrada", "-10,9%", "IC 95%", "Abrir fonte original"]) expect(html).toContain(text);
  });
  it("nenhum indicador conferido está liberado para projeção populacional", () => {
    expect(reviewedMetrics).toHaveLength(5);
    expect(reviewedMetrics.every(m => !m.approvedForPopulationProjection)).toBe(true);
  });
});

describe("/evidencias", () => {
  it("renderiza busca, contagem, fontes HTTPS e estado de curadoria", async () => {
    const html = await render("evidencias");
    for (const text of ['type="search"', "Exibindo", "Em curadoria", "/evidencias/E04"]) expect(html).toContain(text);
    expect(html).not.toMatch(/href="http:\/\//);
  });
  it("os 50 registros canônicos continuam como candidatos, sem liberação de projeção", () => {
    expect(unifiedEvidenceCatalog).toHaveLength(50);
    expect(unifiedEvidenceCatalog.every(r => r.projectionApproved === false)).toBe(true);
  });
});

describe("/musculos-uti", () => {
  it("liga perguntas, fontes e a lacuna causal sem inferir efeito do medicamento na UTI", async () => {
    const html = await render("musculos-uti");
    for (const text of ["Além do peso", "Que pergunta você quer responder?", "lacuna causal", "SURMOUNT-1",
      "9.366", "OR 2,33", "OR 2,67", "pubmed.ncbi.nlm.nih.gov/30312372", "pubmed.ncbi.nlm.nih.gov/40462133"])
      expect(html).toContain(text);
  });
});

describe("/metodologia", () => {
  it("documenta protocolo, fórmula dos cenários, bloqueios e contexto Brasil/SUS", async () => {
    const html = await render("metodologia");
    for (const text of ["Como analisamos", "impede", "N(t)", "IBGE", "Conitec"]) expect(html).toContain(text);
  });
});

describe("/projecoes", () => {
  it("apresenta laboratório hipotético com horizontes, controles e exportação", async () => {
    const html = await render("projecoes");
    for (const text of ["Projete hipóteses", "2031", "2036", "2041", "Exportar CSV", "Exportar JSON", 'type="range"', "Conitec"])
      expect(html).toContain(text);
    expect((html.match(/hipot/gi) ?? []).length).toBeGreaterThan(5);
  });
});

describe("/saude-mental", () => {
  it("cita a fonte do PHQ-9 e não cria taxa de depressão brasileira", async () => {
    const html = await render("saude-mental");
    expect(html).toContain("PHQ-9");
    expect(html).toContain("41537305");
    expect(html).not.toMatch(/\d+(,\d+)?% dos brasileiros (têm|tem|sofrem) depress/i);
  });
});

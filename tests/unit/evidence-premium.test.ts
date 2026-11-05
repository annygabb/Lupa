import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe,expect,it } from "vitest";
import { EvidenceExplorer } from "../../components/evidence/evidence-explorer";
import { EvidenceCard } from "../../components/evidence/evidence-card";
import { getUnifiedEvidence, unifiedEvidenceCatalog } from "../../features/evidence/unified-catalog";

describe("Explorador — coerência com o dashboard premium",()=>{
  it("usa a nova identidade, mas mantém os filtros e a busca local",()=>{
    const html=renderToStaticMarkup(createElement(EvidenceExplorer));
    expect(html).toContain("lupa-dashboard-card");
    expect(html).toContain("lupa-premium-kicker");
    expect(html).toContain('id="evidence-search"');
    expect(html).toContain('id="topic-select"');
    expect(html).toContain('id="drug-select"');
    expect(html).toContain('id="design-select"');
    expect(html).toContain('id="sort-select"');
    expect(html).toContain("Página 1 de 6");
    expect(html).toContain("Em curadoria");
  });
  it("mantém acesso à ficha e publicação de cada fonte no card",()=>{
    const item=getUnifiedEvidence("E04")!;
    const html=renderToStaticMarkup(createElement(EvidenceCard,{record:item}));
    expect(html).toContain("lupa-dashboard-card");
    expect(html).toContain("SURMOUNT-1");
    expect(html).toContain("/evidencias/E04");
    expect(html).toContain("Limitação:");
    expect(html).toContain("Fonte original");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Em curadoria");
  });
  it("preserva todos os 50 registros como não liberados para projeção",()=>{
    expect(unifiedEvidenceCatalog.length).toBe(50);
    expect(unifiedEvidenceCatalog.every(item=>item.curationStatus==="candidate")).toBe(true);
    expect(unifiedEvidenceCatalog.every(item=>item.projectionApproved===false)).toBe(true);
  });
});

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EvidenceCard } from "../../components/evidence/evidence-card";
import { EvidenceExplorer } from "../../components/evidence/evidence-explorer";
import {
  buildEvidenceHref, designNames, drugNames, priorityName,
  shortDescription, sourceKindName, topicNames, yearName,
} from "../../lib/evidence-presentation";
import {
  getUnifiedEvidence, unifiedEvidenceCatalog,
} from "../../features/evidence/unified-catalog";
import { searchUnifiedEvidence } from "../../features/evidence/search";

describe("Apresentação do catálogo",()=>{
  it("mantém rótulos humanos coerentes com os campos científicos",()=>{
    expect(topicNames.icu).toBe("UTI e recuperação");
    expect(topicNames.sarcopenia).toBe("Sarcopenia");
    expect(designNames.meta_analysis).toBe("Metanálise");
    expect(drugNames.tirzepatide).toBe("Tirzepatida");
    expect(sourceKindName("regulatory")).toBe("Documento oficial");
    expect(priorityName("P0")).toContain("editorial");
    expect(yearName(null)).toBe("Ano não informado");
  });
  it("permite só identificadores E, P e R bem formados em rotas internas",()=>{
    expect(buildEvidenceHref("E01")).toBe("/evidencias/E01");
    expect(buildEvidenceHref("P15")).toBe("/evidencias/P15");
    expect(buildEvidenceHref("R07")).toBe("/evidencias/R07");
    expect(()=>buildEvidenceHref("../admin")).toThrow();
    expect(()=>buildEvidenceHref("unknown")).toThrow();
  });
  it("reduz resumos extensos sem mutilar o texto curto",()=>{
    expect(shortDescription("  Resultado simples.  ")).toBe("Resultado simples.");
    expect(shortDescription("Uma amostra descrita no artigo original",16).endsWith("…")).toBe(true);
  });
  it("todas as referências têm fichas identificáveis com links HTTPS",()=>{
    expect(unifiedEvidenceCatalog).toHaveLength(50);
    for(const item of unifiedEvidenceCatalog){
      expect(buildEvidenceHref(item.id)).toMatch(/^\/evidencias\/[EPR]\d{2}$/);
      expect(item.references.length).toBeGreaterThan(0);
      expect(item.references.every(x=>x.url.startsWith("https://"))).toBe(true);
      expect(item.curationStatus).toBe("candidate");
      expect(item.projectionApproved).toBe(false);
    }
  });
  it("o card mostra a fonte, estado de revisão e navegação real",()=>{
    const record=getUnifiedEvidence("E04");
    expect(record).toBeDefined();
    const html=renderToStaticMarkup(createElement(EvidenceCard,{record:record!}));
    expect(html).toContain("Em curadoria");
    expect(html).toContain("/evidencias/E04");
    expect(html).toContain("Fonte original");
    expect(html).toContain("Limitação:");
    expect(html).toContain("rel=\"noopener noreferrer\"");
    expect(html).not.toContain("Aprovado para projeção");
  });
  it("o explorador renderiza busca, filtros, cards e paginação antes da interação",()=>{
    const html=renderToStaticMarkup(createElement(EvidenceExplorer));
    expect(html).toContain('id="evidence-search"');
    expect(html).toContain('id="topic-select"');
    expect(html).toContain('id="drug-select"');
    expect(html).toContain('id="design-select"');
    expect(html).toContain('id="source-select"');
    expect(html).toContain('id="sort-select"');
    expect(html).toContain("Página 1 de 6");
    expect(html).toContain("Em curadoria");
  });
  it("buscas e filtros compartilhados com a interface retornam referências corretas",()=>{
    const filtered=searchUnifiedEvidence({
      query:"Mounjaro",topics:["muscle"],sort:"newest",limit:9,
    });
    expect(filtered.items.length).toBeGreaterThan(0);
    expect(filtered.items.every(item=>item.topics.includes("muscle"))).toBe(true);
    expect(filtered.items.every(item=>item.drugs.includes("tirzepatide"))).toBe(true);
    const empty=searchUnifiedEvidence({query:"neurocirurgia cósmica inexistente"});
    expect(empty.total).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { supplementalEvidenceCatalog } from "../../features/evidence/supplemental";
import { evidenceCatalog } from "../../features/evidence/catalog";
import { extractPubmedId, normalizeEvidenceUrl, normalizeSearchText } from "../../features/evidence/normalization";
import {
  getCatalogAudit, getUnifiedEvidence, listExactAliases, listStudyFamilyOverlap,
  unifiedEvidenceCatalog,
} from "../../features/evidence/unified-catalog";
import { searchUnifiedEvidence } from "../../features/evidence/search";

describe("Etapa 3A: proveniência e identidade", () => {
  it("preserva as 14 referências anteriores e as 41 fontes adicionais", () => {
    expect(evidenceCatalog).toHaveLength(14);
    expect(supplementalEvidenceCatalog).toHaveLength(41);
    expect(supplementalEvidenceCatalog.filter(x=>x.sourceId.startsWith("P"))).toHaveLength(30);
    expect(supplementalEvidenceCatalog.filter(x=>x.sourceId.startsWith("R"))).toHaveLength(11);
  });
  it("consolida 5 aliases exatos em 50 registros canônicos sem perder nenhuma fonte",()=>{
    expect(unifiedEvidenceCatalog).toHaveLength(50);
    expect(listExactAliases()).toEqual([
      {canonicalId:"E01",aliasId:"P12"},
      {canonicalId:"E04",aliasId:"P20"},
      {canonicalId:"E16",aliasId:"P22"},
      {canonicalId:"E21",aliasId:"P03"},
      {canonicalId:"E25",aliasId:"R01"},
    ]);
    expect(unifiedEvidenceCatalog.reduce((sum,r)=>sum+r.sourceIds.length,0)).toBe(55);
    expect(getUnifiedEvidence("P03")).toBe(getUnifiedEvidence("E21"));
    expect(getUnifiedEvidence("R01")).toBe(getUnifiedEvidence("E25"));
  });
  it("identifica publicações relacionadas sem incorretamente fundi-las",()=>{
    const fam=listStudyFamilyOverlap();
    expect(fam.get("SURMOUNT-1")).toEqual(expect.arrayContaining(["E01","E04","P04"]));
    expect(fam.get("SURMOUNT-4")).toEqual(expect.arrayContaining(["E16","P23"]));
    expect(fam.get("BR_OBESITY_PERCEPTIONS_SURVEY")).toEqual(["P25","P26"]);
    expect(getUnifiedEvidence("P25")).not.toBe(getUnifiedEvidence("P26"));
  });
  it("mantém todos os registros como candidatos sem aprovação para projeções",()=>{
    expect(getCatalogAudit()).toMatchObject({
      originalRecords:14,supplementalSources:41,canonicalRecords:50,
      readyForProjection:0,candidates:50,
    });
    for(const item of unifiedEvidenceCatalog){
      expect(item.curationStatus).toBe("candidate");
      expect(item.projectionApproved).toBe(false);
      expect(item.url.startsWith("https://")).toBe(true);
      expect(item.references.length).toBe(item.sourceIds.length);
    }
  });
  it("não altera o conteúdo de resultados e limitações do dossiê",()=>{
    const ref=supplementalEvidenceCatalog.find(x=>x.sourceId==="P01")!;
    const canonical=getUnifiedEvidence("P01")!;
    expect(canonical.resultsSummary).toBe(ref.reportedResult);
    expect(canonical.limitations).toBe(ref.limitations);
    expect(getUnifiedEvidence("E01")!.resultsSummary).toBe(evidenceCatalog[0].resultsSummary);
  });
  it("mantém documento regulatório fora de ensaios clínicos",()=>{
    expect(getUnifiedEvidence("R02")?.sourceKind).toBe("regulatory");
    expect(getUnifiedEvidence("R02")?.design).toBe("regulatory");
    expect(getUnifiedEvidence("E25")?.sourceKind).toBe("regulatory");
  });
});

describe("Etapa 3A: busca e filtros locais",()=>{
  it("ignora acentos, diferenças de caixa e admite termos em conjunto",()=>{
    expect(normalizeSearchText("SAÚDE  MENTAL")).toBe("saude mental");
    expect(searchUnifiedEvidence({query:"sarcopenia"}).total).toBeGreaterThan(0);
    expect(searchUnifiedEvidence({query:"P03"}).items[0].id).toBe("E21");
  });
  it("localiza nomes comerciais via princípios ativos sem alterar a fonte",()=>{
    expect(searchUnifiedEvidence({query:"Mounjaro"}).total).toBeGreaterThan(0);
    expect(searchUnifiedEvidence({query:"Ozempic"}).total).toBeGreaterThan(0);
    expect(searchUnifiedEvidence({query:"Zepbound"}).total).toBeGreaterThan(0);
  });
  it("filtra temas e medicamentos em conjunção",()=>{
    const result=searchUnifiedEvidence({topics:["mental"],drugs:["tirzepatide"]});
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every(x=>x.topics.includes("mental")&&x.drugs.includes("tirzepatide"))).toBe(true);
    expect(result.items.some(x=>x.id==="E21")).toBe(true);
  });
  it("mostra filtro de documentos regulatórios sem misturar com meta-análise",()=>{
    const result=searchUnifiedEvidence({sourceKinds:["regulatory"]});
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every(x=>x.sourceKind==="regulatory")).toBe(true);
    expect(result.items.some(x=>x.id==="R07")).toBe(true);
  });
  it("combina prioridades e pesquisa sobre órgãos",()=>{
    const result=searchUnifiedEvidence({topics:["pancreas","biliary"],priorities:["P0"]});
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every(x=>x.priority==="P0")).toBe(true);
  });
  it("é paginada, estável e rejeita filtros inválidos",()=>{
    const first=searchUnifiedEvidence({sort:"title",limit:5,offset:0});
    const second=searchUnifiedEvidence({sort:"title",limit:5,offset:5});
    expect(first.total).toBe(50);
    expect(first.items).toHaveLength(5);
    expect(second.items).toHaveLength(5);
    expect(new Set([...first.items,...second.items].map(x=>x.id)).size).toBe(10);
    expect(first.page.hasMore).toBe(true);
    expect(()=>searchUnifiedEvidence({fromYear:2036,toYear:2026})).toThrow();
    expect(()=>searchUnifiedEvidence({query:"x".repeat(161)})).toThrow();
  });
  it("não executa cálculo clínico ou converte resultados em incidência",()=>{
    expect(getUnifiedEvidence("P15")?.projectionApproved).toBe(false);
    expect(getUnifiedEvidence("R02")?.projectionApproved).toBe(false);
    expect(getUnifiedEvidence("E12")?.projectionApproved).toBe(false);
  });
});

describe("Normalização de links",()=>{
  it("extrai PubMed ID de URL validada",()=>{
    expect(extractPubmedId("https://pubmed.ncbi.nlm.nih.gov/40366681/")).toBe("40366681");
    expect(extractPubmedId("https://www.gov.br/saude")).toBeNull();
    expect(normalizeEvidenceUrl("https://pubmed.ncbi.nlm.nih.gov/40366681/"))
      .toBe(normalizeEvidenceUrl("https://pubmed.ncbi.nlm.nih.gov/40366681"));
    expect(()=>normalizeEvidenceUrl("http://example.com/")).toThrow();
  });
});

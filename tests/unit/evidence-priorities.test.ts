import { describe, expect, it } from "vitest";
import { initialCurationQueue, listInitialCuration } from "../../features/evidence/priorities";
import { searchUnifiedEvidence } from "../../features/evidence/search";
import { getUnifiedEvidence } from "../../features/evidence/unified-catalog";
describe("Fila de 15 referências a conferir",()=>{
  it("contém 15 referências distintas e existentes, todas candidatas",()=>{
    expect(initialCurationQueue).toHaveLength(15);
    expect(new Set(initialCurationQueue).size).toBe(15);
    expect(listInitialCuration()).toHaveLength(15);
    expect(listInitialCuration().every(item=>item.curationStatus==="candidate")).toBe(true);
    expect(listInitialCuration().every(item=>!item.projectionApproved)).toBe(true);
  });
  it("evita contar aliases como artigos adicionais",()=>{
    expect(getUnifiedEvidence("P12")?.id).toBe("E01");
    expect(initialCurationQueue).not.toContain("P12");
    expect(listInitialCuration().every(item=>item.url.startsWith("https://"))).toBe(true);
  });
  it("inclui Brasil, saúde mental, UTI e segurança por órgão",()=>{
    const refs=listInitialCuration();
    expect(refs.some(r=>r.topics.includes("brazil"))).toBe(true);
    expect(refs.some(r=>r.topics.includes("icu"))).toBe(true);
    expect(refs.some(r=>r.topics.includes("mental"))).toBe(true);
    expect(refs.some(r=>r.topics.includes("pancreas")||r.topics.includes("biliary"))).toBe(true);
    expect(searchUnifiedEvidence({query:"anvisa",sourceKinds:["regulatory"]}).total).toBeGreaterThan(0);
  });
});

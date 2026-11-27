import { describe,expect,it } from "vitest";
import { unifiedEvidenceCatalog } from "../../features/evidence/unified-catalog";

describe("Explorador — coerência com o dashboard premium",()=>{
  it("preserva todos os 50 registros como não liberados para projeção",()=>{
    expect(unifiedEvidenceCatalog.length).toBe(50);
    expect(unifiedEvidenceCatalog.every(item=>item.curationStatus==="candidate")).toBe(true);
    expect(unifiedEvidenceCatalog.every(item=>item.projectionApproved===false)).toBe(true);
  });
});

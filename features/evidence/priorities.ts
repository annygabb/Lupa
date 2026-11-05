import { getUnifiedEvidence, type UnifiedEvidenceRecord } from "./unified-catalog";
// Fila editorial de revisão; não significa liberação de dados para gráficos/projeções.
export const initialCurationQueue = [
  "E01","E04","E10","E11","E12","E16","E21",
  "P01","P02","P04","P06","P15","P16","P24","P25",
] as const;
export type InitialCurationId = (typeof initialCurationQueue)[number];
export function listInitialCuration(): readonly UnifiedEvidenceRecord[] {
  return initialCurationQueue.map(id => {
    const entry=getUnifiedEvidence(id);
    if(!entry)throw new Error("Referência prioritária ausente: "+id);
    return entry;
  });
}

import { z } from "zod";
import seed from "./supplemental.seed.json";

export const supplementalRecordSchema = z.strictObject({
  sourceId: z.string().regex(/^[PR]\d{2}$/),
  title: z.string().min(5),
  pmid: z.string().regex(/^\d{6,9}$/).nullable(),
  sourceUrl: z.string().url().refine((value) => value.startsWith("https://"), "Link HTTPS obrigatório"),
  editorialPriority: z.enum(["P0", "P1", "P2"]),
  sourceMetadata: z.string(),
  reportedResult: z.string(),
  limitations: z.string(),
  verificationNote: z.string(),
  projectionNote: z.string(),
  existingAlias: z.string().regex(/^E\d{2}$/).nullable(),
  documentKind: z.enum(["publication", "regulatory"]),
  originDocument: z.literal("LUPA_Saude_PubMed_Saude_Mental_Seguranca_Brasil_2026(1).docx"),
  curationStatus: z.literal("candidate"),
  projectionApproved: z.literal(false),
});
export type SupplementalRecord = z.infer<typeof supplementalRecordSchema>;
export const supplementalEvidenceCatalog: readonly SupplementalRecord[] = Object.freeze(
  z.array(supplementalRecordSchema).length(41).parse(seed),
);
const ids = supplementalEvidenceCatalog.map((item) => item.sourceId);
if (new Set(ids).size !== ids.length) throw new Error("IDs duplicados na fonte complementar");

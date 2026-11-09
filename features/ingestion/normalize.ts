import { z } from "zod";
import { IngestionError, type PubMedEndpoint } from "./errors";

// Normalização de METADADOS bibliográficos vindos do PubMed (E-utilities, retmode=json).
// Nada aqui extrai efeito clínico, resultado ou resumo interpretativo: só identificadores,
// título, ano, periódico, autores e tipos de publicação declarados pelo próprio PubMed.

const MAX_AUTHORS_LISTED = 10;

// ---------- Esquemas de resposta (Zod nas fronteiras externas) ----------

const numericString = z.union([z.string(), z.number()]).transform(String).pipe(z.string().regex(/^\d+$/));

export const esearchResponseSchema = z.looseObject({
  esearchresult: z.looseObject({
    count: numericString,
    retmax: numericString,
    retstart: numericString,
    idlist: z.array(z.union([z.string(), z.number()]).transform(String)),
    querytranslation: z.string().optional(),
    ERROR: z.string().optional(),
  }),
});

const authorSchema = z.looseObject({
  name: z.string(),
  authtype: z.string().optional(),
});
const articleIdSchema = z.looseObject({
  idtype: z.string(),
  value: z.string(),
});

export const esummaryDocSchema = z.looseObject({
  uid: z.union([z.string(), z.number()]).transform(String),
  title: z.string().optional(),
  pubdate: z.string().optional(),
  epubdate: z.string().optional(),
  sortpubdate: z.string().optional(),
  source: z.string().optional(),
  fulljournalname: z.string().optional(),
  authors: z.array(authorSchema).optional(),
  articleids: z.array(articleIdSchema).optional(),
  elocationid: z.string().optional(),
  pubtype: z.array(z.string()).optional(),
  error: z.string().optional(),
});
export type EsummaryDoc = z.infer<typeof esummaryDocSchema>;

export const esummaryResponseSchema = z.looseObject({
  result: z.looseObject({
    uids: z.array(z.union([z.string(), z.number()]).transform(String)),
  }),
});

export interface EsearchPage {
  count: number;
  retmax: number;
  retstart: number;
  pmids: string[];
  queryTranslation: string | null;
}

function malformed(endpoint: PubMedEndpoint, issue: string): IngestionError {
  return new IngestionError("MALFORMED_RESPONSE", `Resposta ${endpoint} fora do formato esperado: ${issue}`, {
    endpoint,
  });
}

function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "estrutura inválida";
  const path = issue.path.length ? issue.path.join(".") : "(raiz)";
  return `${path}: ${issue.message}`;
}

/** Valida e normaliza uma página do esearch. Resposta inválida vira erro tipado, não exceção crua. */
export function parseEsearchPage(payload: unknown): EsearchPage {
  const parsed = esearchResponseSchema.safeParse(payload);
  if (!parsed.success) throw malformed("esearch", firstIssue(parsed.error));
  const result = parsed.data.esearchresult;
  if (result.ERROR) throw malformed("esearch", `erro informado pelo NCBI (${result.ERROR.slice(0, 120)})`);
  const pmids: string[] = [];
  for (const raw of result.idlist) {
    const pmid = normalizePmid(raw);
    if (!pmid) throw malformed("esearch", `PMID inválido na lista (${raw.slice(0, 20)})`);
    pmids.push(pmid);
  }
  return {
    count: Number(result.count),
    retmax: Number(result.retmax),
    retstart: Number(result.retstart),
    pmids,
    queryTranslation: result.querytranslation ?? null,
  };
}

export interface NormalizedCandidate {
  pmid: string;
  doi: string | null;
  pmcid: string | null;
  title: string;
  year: number | null;
  journal: string | null;
  authors: string[];
  authorCount: number;
  publicationTypes: string[];
  pubmedUrl: string;
}

export interface SummaryItemError {
  pmid: string;
  code: "SUMMARY_UNAVAILABLE" | "MALFORMED_ITEM";
  message: string;
}

export interface EsummaryBatch {
  candidates: NormalizedCandidate[];
  itemErrors: SummaryItemError[];
}

/**
 * Valida o envelope do esummary e normaliza cada documento. Um documento malformado ou com
 * `error` do NCBI vira `itemErrors` (o lote continua); envelope malformado vira erro tipado.
 */
export function parseEsummaryBatch(payload: unknown, requestedPmids: readonly string[]): EsummaryBatch {
  const parsed = esummaryResponseSchema.safeParse(payload);
  if (!parsed.success) throw malformed("esummary", firstIssue(parsed.error));
  const result = parsed.data.result as Record<string, unknown>;
  const candidates: NormalizedCandidate[] = [];
  const itemErrors: SummaryItemError[] = [];
  for (const pmid of requestedPmids) {
    const raw = result[pmid];
    if (raw === undefined) {
      itemErrors.push({ pmid, code: "SUMMARY_UNAVAILABLE", message: "PMID ausente na resposta do esummary" });
      continue;
    }
    const doc = esummaryDocSchema.safeParse(raw);
    if (!doc.success) {
      itemErrors.push({ pmid, code: "MALFORMED_ITEM", message: firstIssue(doc.error) });
      continue;
    }
    if (doc.data.error) {
      itemErrors.push({ pmid, code: "SUMMARY_UNAVAILABLE", message: doc.data.error.slice(0, 160) });
      continue;
    }
    const candidate = normalizeSummaryDoc(doc.data);
    if (!candidate || candidate.pmid !== pmid) {
      itemErrors.push({ pmid, code: "MALFORMED_ITEM", message: "uid ou título ausente/inconsistente" });
      continue;
    }
    candidates.push(candidate);
  }
  return { candidates, itemErrors };
}

// ---------- Normalizadores de campo ----------

/** PMID: só dígitos, sem zeros à esquerda, 1–9 dígitos. Aceita prefixo "PMID:". */
export function normalizePmid(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim().replace(/^pmid:\s*/i, "");
  if (!/^\d{1,12}$/.test(text)) return null;
  const stripped = text.replace(/^0+/, "");
  return stripped.length > 0 && stripped.length <= 9 ? stripped : null;
}

/** DOI em minúsculas, sem prefixo `doi:` nem `https://doi.org/`, sem pontuação final. */
export function normalizeDoi(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let text = value.trim();
  text = text.replace(/^doi:\s*/i, "").replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  text = text.replace(/[.,;\s]+$/, "").toLowerCase();
  return /^10\.\d{4,9}\/\S+$/.test(text) ? text : null;
}

/** PMCID no formato `PMC123456`. */
export function normalizePmcid(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^pmc(\d{1,10})$/i.exec(value.trim());
  return match ? `PMC${match[1]}` : null;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Decodifica entidades básicas, remove marcação HTML e colapsa espaços. Não reescreve o conteúdo. */
export function normalizeTitle(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, entity: string) => {
      if (entity[0] === "#") {
        const code = entity[1]?.toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
      }
      return ENTITIES[entity.toLowerCase()] ?? whole;
    })
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Ano de publicação a partir de `pubdate`/`sortpubdate`/`epubdate` (primeiro ano plausível). */
export function normalizeYear(...values: Array<string | undefined>): number | null {
  const maxYear = new Date().getUTCFullYear() + 1;
  for (const value of values) {
    if (!value) continue;
    const match = /\b(1[89]\d{2}|20\d{2})\b/.exec(value);
    if (!match) continue;
    const year = Number(match[1]);
    if (year >= 1800 && year <= maxYear) return year;
  }
  return null;
}

export function normalizeJournal(doc: Pick<EsummaryDoc, "fulljournalname" | "source">): string | null {
  const name = normalizeTitle(doc.fulljournalname ?? "") || normalizeTitle(doc.source ?? "");
  return name || null;
}

export function normalizeAuthors(authors: EsummaryDoc["authors"]): { authors: string[]; authorCount: number } {
  const people = (authors ?? [])
    .filter((author) => !author.authtype || author.authtype.toLowerCase() === "author")
    .map((author) => normalizeTitle(author.name))
    .filter((name) => name.length > 0);
  return { authors: people.slice(0, MAX_AUTHORS_LISTED), authorCount: people.length };
}

export function pubmedUrlFor(pmid: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
}

export function normalizeSummaryDoc(doc: EsummaryDoc): NormalizedCandidate | null {
  const pmid = normalizePmid(doc.uid);
  const title = normalizeTitle(doc.title);
  if (!pmid || !title) return null;
  const ids = doc.articleids ?? [];
  const doiFromIds = ids.find((item) => item.idtype.toLowerCase() === "doi")?.value;
  const doiFromLocation = /doi:\s*(\S+)/i.exec(doc.elocationid ?? "")?.[1];
  const pmcFromIds = ids.find((item) => ["pmc", "pmcid"].includes(item.idtype.toLowerCase()))?.value;
  const { authors, authorCount } = normalizeAuthors(doc.authors);
  return {
    pmid,
    doi: normalizeDoi(doiFromIds) ?? normalizeDoi(doiFromLocation),
    pmcid: normalizePmcid(pmcFromIds?.replace(/^pmc-id:\s*/i, "").split(";")[0]),
    title,
    year: normalizeYear(doc.pubdate, doc.sortpubdate, doc.epubdate),
    journal: normalizeJournal(doc),
    authors,
    authorCount,
    publicationTypes: [...new Set((doc.pubtype ?? []).map((type) => normalizeTitle(type)).filter(Boolean))].sort(),
    pubmedUrl: pubmedUrlFor(pmid),
  };
}

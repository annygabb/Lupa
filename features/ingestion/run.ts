import { toIngestionError } from "./errors";
import { buildCatalogIndex, dedupeCandidates, type CatalogLike } from "./dedupe";
import { DEFAULT_PAGE_SIZE, HARD_MAX_RESULTS, type PubMedClient } from "./pubmed-client";
import { buildDryRunReport, searchErrorToReport, type DryRunReport, type ReportError } from "./report";

// Orquestração do dry-run: consulta → normalização → deduplicação → relatório.
// Função pura em relação ao sistema de arquivos: devolve o relatório; quem grava é o script,
// e somente em reports/pubmed-dry-run/. Não existe caminho de código que altere o catálogo.

export const DEFAULT_PUBMED_QUERY =
  '(semaglutide[tiab] OR tirzepatide[tiab]) AND (obesity[tiab] OR "body composition"[tiab] OR "mental health"[tiab])';
export const DEFAULT_MAX_RESULTS = 20;

export interface DryRunOptions {
  client: PubMedClient;
  catalog: CatalogLike;
  query?: string;
  maxResults?: number;
  pageSize?: number;
  sort?: "relevance" | "pub_date";
  now?: () => Date;
}

export async function runPubMedDryRun(options: DryRunOptions): Promise<DryRunReport> {
  const term = (options.query ?? DEFAULT_PUBMED_QUERY).trim();
  const maxResults = Math.min(HARD_MAX_RESULTS, Math.max(1, Math.trunc(options.maxResults ?? DEFAULT_MAX_RESULTS)));
  const pageSize = Math.min(maxResults, Math.max(1, Math.trunc(options.pageSize ?? DEFAULT_PAGE_SIZE)));
  const sort = options.sort ?? "relevance";
  const generatedAt = (options.now ?? (() => new Date()))().toISOString();
  const index = buildCatalogIndex(options.catalog);
  const errors: ReportError[] = [];

  let totalCount: number | null = null;
  let pmids: string[] = [];
  let pages = 0;
  let duplicates = 0;
  let queryTranslation: string | null = null;
  try {
    const search = await options.client.search(term, { maxResults, pageSize, sort });
    totalCount = search.totalCount;
    pmids = search.pmids;
    pages = search.pages;
    duplicates = search.duplicatesInResponse;
    queryTranslation = search.queryTranslation;
  } catch (cause) {
    errors.push(searchErrorToReport(toIngestionError(cause).toJSON(), "search"));
  }

  let candidates: ReturnType<typeof dedupeCandidates> = [];
  if (pmids.length) {
    const summaries = await options.client.summaries(pmids, pageSize);
    candidates = dedupeCandidates(summaries.candidates, index);
    for (const batch of summaries.batchErrors) errors.push(searchErrorToReport(batch.error, "summary_batch", batch.pmids));
    for (const item of summaries.itemErrors) {
      errors.push({ scope: "summary_item", code: item.code, message: item.message, pmids: [item.pmid], endpoint: "esummary", status: null, attempts: null });
    }
  }

  return buildDryRunReport({
    generatedAt,
    query: { term, sort, maxResults, pageSize, queryTranslation },
    source: { apiKeyUsed: options.client.hasApiKey, emailProvided: options.client.hasEmail },
    pubmed: { totalCount, retrieved: pmids.length, pages, duplicatesInResponse: duplicates },
    catalog: { canonicalRecords: index.canonicalCount, indexedSources: index.sourceCount },
    candidates,
    errors,
  });
}

import { IngestionError, toIngestionError, type IngestionErrorCode, type PubMedEndpoint } from "./errors";
import {
  parseEsearchPage,
  parseEsummaryBatch,
  type EsearchPage,
  type NormalizedCandidate,
  type SummaryItemError,
} from "./normalize";

// Cliente mínimo das NCBI E-utilities (esearch + esummary, JSON) para o dry-run do LUPA.
// - Fila serial com intervalo mínimo: ≤3 req/s sem chave (334 ms), ≤10 req/s com chave (100 ms).
// - Timeout por requisição (AbortController), retry com backoff exponencial + jitter para
//   429 / 5xx / timeout / falha de rede, no máximo 3 tentativas.
// - fetch, sleep, relógio e aleatoriedade injetáveis: os testes rodam sem rede.
// - Nenhum segredo (api_key/email) aparece em mensagens de erro.

export const EUTILS_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
export const PUBMED_TOOL_NAME = "lupa-saude";
export const MIN_INTERVAL_NO_KEY_MS = 334;
export const MIN_INTERVAL_WITH_KEY_MS = 100;
export const DEFAULT_TIMEOUT_MS = 15_000;
export const DEFAULT_MAX_ATTEMPTS = 3;
export const DEFAULT_PAGE_SIZE = 20;
export const HARD_MAX_RESULTS = 200;
const MAX_ESUMMARY_IDS = 200;
const MAX_RETRY_AFTER_MS = 30_000;

export type FetchLike = (input: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
}>;

export interface PubMedClientOptions {
  fetch?: FetchLike;
  /** E-mail de contato opcional (variável NCBI_EMAIL). Nunca inventado. */
  email?: string | null;
  /** Chave opcional (variável NCBI_API_KEY). Nunca impressa. */
  apiKey?: string | null;
  baseUrl?: string;
  timeoutMs?: number;
  maxAttempts?: number;
  minIntervalMs?: number;
  backoffBaseMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  random?: () => number;
}

export interface SearchOptions {
  maxResults?: number;
  pageSize?: number;
  sort?: "relevance" | "pub_date";
}

export interface SearchResult {
  term: string;
  totalCount: number;
  pmids: string[];
  pages: number;
  queryTranslation: string | null;
  duplicatesInResponse: number;
}

export interface SummaryResult {
  candidates: NormalizedCandidate[];
  itemErrors: SummaryItemError[];
  batchErrors: Array<{ pmids: string[]; error: ReturnType<IngestionError["toJSON"]> }>;
}

export interface PubMedClient {
  readonly hasApiKey: boolean;
  readonly hasEmail: boolean;
  readonly requestCount: () => number;
  search(term: string, options?: SearchOptions): Promise<SearchResult>;
  summaries(pmids: readonly string[], batchSize?: number): Promise<SummaryResult>;
}

const RETRYABLE: ReadonlySet<IngestionErrorCode> = new Set(["RATE_LIMITED", "SERVER_ERROR", "TIMEOUT", "NETWORK"]);

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lê configuração opcional do ambiente. Retorna `null` quando ausente; nunca cria valores. */
export function pubmedConfigFromEnv(env: Record<string, string | undefined>): Pick<PubMedClientOptions, "email" | "apiKey"> {
  const email = env.NCBI_EMAIL?.trim();
  const apiKey = env.NCBI_API_KEY?.trim();
  return {
    email: email && EMAIL_PATTERN.test(email) ? email : null,
    apiKey: apiKey && /^[A-Za-z0-9]{8,64}$/.test(apiKey) ? apiKey : null,
  };
}

function clampInt(value: number | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
  return null;
}

export function createPubMedClient(options: PubMedClientOptions = {}): PubMedClient {
  const fetchImpl: FetchLike | undefined = options.fetch ?? (globalThis.fetch as unknown as FetchLike | undefined);
  if (!fetchImpl) throw new IngestionError("INVALID_INPUT", "fetch indisponível neste ambiente");
  const fetcher: FetchLike = fetchImpl;
  const apiKey = options.apiKey ?? null;
  const email = options.email ?? null;
  const baseUrl = (options.baseUrl ?? EUTILS_BASE_URL).replace(/\/+$/, "");
  const timeoutMs = clampInt(options.timeoutMs, DEFAULT_TIMEOUT_MS, 1, 120_000);
  const maxAttempts = clampInt(options.maxAttempts, DEFAULT_MAX_ATTEMPTS, 1, DEFAULT_MAX_ATTEMPTS);
  const floorInterval = apiKey ? MIN_INTERVAL_WITH_KEY_MS : MIN_INTERVAL_NO_KEY_MS;
  // O intervalo pode ser maior que o mínimo público, nunca menor.
  const minIntervalMs = Math.max(floorInterval, options.minIntervalMs ?? floorInterval);
  const backoffBaseMs = clampInt(options.backoffBaseMs, 500, 0, 10_000);
  const sleep = options.sleep ?? defaultSleep;
  const now = options.now ?? Date.now;
  const random = options.random ?? Math.random;

  let lastRequestAt = Number.NEGATIVE_INFINITY;
  let queue: Promise<unknown> = Promise.resolve();
  let requests = 0;

  /** Fila serial: cada requisição espera a anterior e o intervalo mínimo desde o último envio. */
  function schedule<T>(task: () => Promise<T>): Promise<T> {
    const run = async () => {
      const wait = lastRequestAt + minIntervalMs - now();
      if (wait > 0) await sleep(wait);
      lastRequestAt = now();
      requests += 1;
      return task();
    };
    const next = queue.then(run, run);
    queue = next.catch(() => undefined);
    return next;
  }

  function buildUrl(endpoint: PubMedEndpoint, params: Record<string, string>): string {
    const search = new URLSearchParams({ db: "pubmed", retmode: "json", ...params, tool: PUBMED_TOOL_NAME });
    if (email) search.set("email", email);
    if (apiKey) search.set("api_key", apiKey);
    return `${baseUrl}/${endpoint}.fcgi?${search.toString()}`;
  }

  async function attemptOnce(endpoint: PubMedEndpoint, url: string): Promise<{ payload: unknown } | { error: IngestionError; retryAfterMs: number | null }> {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    try {
      const response = await fetcher(url, { signal: controller.signal, headers: { accept: "application/json" } });
      if (response.status === 429) {
        return {
          error: new IngestionError("RATE_LIMITED", "NCBI respondeu 429 (limite de taxa)", { endpoint, status: 429 }),
          retryAfterMs: parseRetryAfter(response.headers.get("retry-after")),
        };
      }
      if (response.status >= 500) {
        return {
          error: new IngestionError("SERVER_ERROR", `NCBI respondeu ${response.status}`, { endpoint, status: response.status }),
          retryAfterMs: null,
        };
      }
      if (!response.ok) {
        return {
          error: new IngestionError("HTTP_ERROR", `NCBI respondeu ${response.status}`, { endpoint, status: response.status }),
          retryAfterMs: null,
        };
      }
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        if (timedOut) throw new Error("timeout");
        return {
          error: new IngestionError("MALFORMED_RESPONSE", "Corpo da resposta não é JSON válido", { endpoint, status: response.status }),
          retryAfterMs: null,
        };
      }
      return { payload };
    } catch (cause) {
      if (timedOut) {
        return {
          error: new IngestionError("TIMEOUT", `Tempo limite de ${timeoutMs} ms excedido`, { endpoint }),
          retryAfterMs: null,
        };
      }
      const base = toIngestionError(cause, "NETWORK");
      return { error: new IngestionError("NETWORK", `Falha de rede: ${base.message}`, { endpoint }), retryAfterMs: null };
    } finally {
      clearTimeout(timer);
    }
  }

  async function request(endpoint: PubMedEndpoint, params: Record<string, string>): Promise<unknown> {
    const url = buildUrl(endpoint, params);
    let last: IngestionError | null = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const outcome = await schedule(() => attemptOnce(endpoint, url));
      if ("payload" in outcome) return outcome.payload;
      last = outcome.error;
      if (!RETRYABLE.has(last.code)) {
        throw new IngestionError(last.code, last.message, { ...last.details, attempts: attempt });
      }
      if (attempt < maxAttempts) {
        const exponential = backoffBaseMs * 2 ** (attempt - 1);
        const jitter = Math.floor(random() * backoffBaseMs);
        await sleep(Math.max(outcome.retryAfterMs ?? 0, exponential + jitter));
      }
    }
    throw new IngestionError("RETRIES_EXHAUSTED", `Tentativas esgotadas (${maxAttempts}) em ${endpoint}: ${last?.message ?? "erro"}`, {
      endpoint,
      attempts: maxAttempts,
      status: last?.details.status,
      lastCode: last?.code,
    });
  }

  async function search(term: string, searchOptions: SearchOptions = {}): Promise<SearchResult> {
    const cleaned = term.trim();
    if (!cleaned || cleaned.length > 1000) throw new IngestionError("INVALID_INPUT", "Consulta vazia ou longa demais");
    const maxResults = clampInt(searchOptions.maxResults, DEFAULT_PAGE_SIZE, 1, HARD_MAX_RESULTS);
    const pageSize = clampInt(searchOptions.pageSize, Math.min(DEFAULT_PAGE_SIZE, maxResults), 1, maxResults);
    const sort = searchOptions.sort ?? "relevance";
    const seen = new Set<string>();
    const pmids: string[] = [];
    let duplicates = 0;
    let totalCount = 0;
    let pages = 0;
    let queryTranslation: string | null = null;
    let retstart = 0;
    while (pmids.length < maxResults) {
      const retmax = Math.min(pageSize, maxResults - pmids.length);
      const page: EsearchPage = parseEsearchPage(
        await request("esearch", { term: cleaned, retmax: String(retmax), retstart: String(retstart), sort }),
      );
      pages += 1;
      totalCount = page.count;
      queryTranslation ??= page.queryTranslation;
      for (const pmid of page.pmids) {
        if (seen.has(pmid)) {
          duplicates += 1;
          continue;
        }
        seen.add(pmid);
        if (pmids.length < maxResults) pmids.push(pmid);
      }
      retstart += page.pmids.length;
      if (page.pmids.length === 0 || retstart >= totalCount) break;
    }
    return { term: cleaned, totalCount, pmids, pages, queryTranslation, duplicatesInResponse: duplicates };
  }

  async function summaries(pmids: readonly string[], batchSize = DEFAULT_PAGE_SIZE): Promise<SummaryResult> {
    const size = clampInt(batchSize, DEFAULT_PAGE_SIZE, 1, MAX_ESUMMARY_IDS);
    const unique = [...new Set(pmids)];
    const result: SummaryResult = { candidates: [], itemErrors: [], batchErrors: [] };
    for (let index = 0; index < unique.length; index += size) {
      const batch = unique.slice(index, index + size);
      try {
        const parsed = parseEsummaryBatch(await request("esummary", { id: batch.join(",") }), batch);
        result.candidates.push(...parsed.candidates);
        result.itemErrors.push(...parsed.itemErrors);
      } catch (cause) {
        // Um lote com falha não derruba os demais: vira erro registrado no relatório.
        result.batchErrors.push({ pmids: batch, error: toIngestionError(cause).toJSON() });
      }
    }
    return result;
  }

  return {
    hasApiKey: Boolean(apiKey),
    hasEmail: Boolean(email),
    requestCount: () => requests,
    search,
    summaries,
  };
}

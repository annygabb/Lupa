import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { unifiedEvidenceCatalog } from "../../features/evidence/unified-catalog";
import { buildCatalogIndex, classifyCandidate, dedupeCandidates, type CatalogLike } from "../../features/ingestion/dedupe";
import { IngestionError, redactSecrets } from "../../features/ingestion/errors";
import {
  normalizeDoi,
  normalizePmcid,
  normalizePmid,
  normalizeSummaryDoc,
  normalizeTitle,
  normalizeYear,
  parseEsearchPage,
  parseEsummaryBatch,
  pubmedUrlFor,
  type NormalizedCandidate,
} from "../../features/ingestion/normalize";
import {
  createPubMedClient,
  MIN_INTERVAL_NO_KEY_MS,
  MIN_INTERVAL_WITH_KEY_MS,
  pubmedConfigFromEnv,
  type FetchLike,
  type PubMedClientOptions,
} from "../../features/ingestion/pubmed-client";
import {
  assertSafeReportPath,
  renderMarkdownReport,
  resolveReportPaths,
  REVIEW_STATUS,
  stripVolatile,
} from "../../features/ingestion/report";
import { DEFAULT_PUBMED_QUERY, runPubMedDryRun } from "../../features/ingestion/run";

// Todos os testes rodam SEM rede: fetch, sleep e relógio são injetados.

const ROOT = path.resolve(__dirname, "../..");

type MockResponse = Awaited<ReturnType<FetchLike>>;
function respond(status: number, body: unknown, headers: Record<string, string> = {}): MockResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
    json: async () => body,
  };
}

function esearchBody(all: string[], url: URL) {
  const retstart = Number(url.searchParams.get("retstart"));
  const retmax = Number(url.searchParams.get("retmax"));
  return {
    header: { type: "esearch", version: "0.3" },
    esearchresult: {
      count: String(all.length),
      retmax: String(retmax),
      retstart: String(retstart),
      idlist: all.slice(retstart, retstart + retmax),
      querytranslation: "mock translation",
    },
  };
}

function docFor(pmid: string, extra: Record<string, unknown> = {}) {
  return {
    uid: pmid,
    title: `Título &amp; metadados <i>do</i> PMID ${pmid}.`,
    pubdate: "2025 Mar 3",
    sortpubdate: "2025/03/03 00:00",
    source: "J Test",
    fulljournalname: "Journal of Testing",
    authors: [
      { name: "Silva A", authtype: "Author" },
      { name: "Souza B", authtype: "Author" },
      { name: "Grupo X", authtype: "CollectiveName" },
    ],
    articleids: [
      { idtype: "pubmed", value: pmid },
      { idtype: "doi", value: `10.1000/TEST.${pmid}` },
    ],
    pubtype: ["Journal Article", "Randomized Controlled Trial"],
    ...extra,
  };
}

function esummaryBody(url: URL, docs: Record<string, Record<string, unknown>> = {}) {
  const ids = (url.searchParams.get("id") ?? "").split(",").filter(Boolean);
  const result: Record<string, unknown> = { uids: ids };
  for (const id of ids) result[id] = docFor(id, docs[id]);
  return { header: { type: "esummary" }, result };
}

interface Harness {
  fetch: FetchLike;
  calls: URL[];
  times: number[];
  sleeps: number[];
  options: PubMedClientOptions;
}

/** Relógio falso: `sleep` avança o tempo sem esperar de verdade. */
function harness(handler: (url: URL, call: number) => MockResponse | Promise<MockResponse>, extra: PubMedClientOptions = {}): Harness {
  let clock = 1_000;
  const calls: URL[] = [];
  const times: number[] = [];
  const sleeps: number[] = [];
  const fetch: FetchLike = async (input) => {
    const url = new URL(input);
    calls.push(url);
    times.push(clock);
    return handler(url, calls.length);
  };
  return {
    fetch,
    calls,
    times,
    sleeps,
    options: {
      fetch,
      now: () => clock,
      sleep: async (ms) => {
        sleeps.push(ms);
        clock += ms;
      },
      random: () => 0.5,
      backoffBaseMs: 100,
      ...extra,
    },
  };
}

const POOL = Array.from({ length: 50 }, (_, index) => String(40_000_000 + index));

describe("Ingestão PubMed — cliente E-utilities", () => {
  it("pagina o esearch por retstart/retmax e busca resumos em lotes, respeitando ≤3 req/s", async () => {
    const h = harness((url) =>
      url.pathname.endsWith("esearch.fcgi") ? respond(200, esearchBody(POOL, url)) : respond(200, esummaryBody(url)),
    );
    const client = createPubMedClient(h.options);
    const search = await client.search("semaglutide", { maxResults: 5, pageSize: 2 });
    expect(search.pmids).toEqual(POOL.slice(0, 5));
    expect(search.totalCount).toBe(50);
    expect(search.pages).toBe(3);
    const esearch = h.calls.filter((url) => url.pathname.endsWith("esearch.fcgi"));
    expect(esearch.map((url) => [url.searchParams.get("retstart"), url.searchParams.get("retmax")])).toEqual([
      ["0", "2"],
      ["2", "2"],
      ["4", "1"],
    ]);
    for (const url of esearch) {
      expect(url.searchParams.get("tool")).toBe("lupa-saude");
      expect(url.searchParams.get("db")).toBe("pubmed");
      expect(url.searchParams.get("retmode")).toBe("json");
      expect(url.searchParams.has("email")).toBe(false);
      expect(url.searchParams.has("api_key")).toBe(false);
    }

    const summaries = await client.summaries(search.pmids, 2);
    expect(summaries.candidates.map((item) => item.pmid)).toEqual(POOL.slice(0, 5));
    expect(h.calls.filter((url) => url.pathname.endsWith("esummary.fcgi"))).toHaveLength(3);
    expect(client.requestCount()).toBe(6);
    for (let index = 1; index < h.times.length; index += 1) {
      expect(h.times[index]! - h.times[index - 1]!).toBeGreaterThanOrEqual(MIN_INTERVAL_NO_KEY_MS);
    }
  });

  it("para a paginação quando o PubMed tem menos resultados que o máximo", async () => {
    const few = POOL.slice(0, 3);
    const h = harness((url) => respond(200, esearchBody(few, url)));
    const result = await createPubMedClient(h.options).search("x", { maxResults: 20, pageSize: 2 });
    expect(result.pmids).toEqual(few);
    expect(result.pages).toBe(2);
  });

  it("usa e-mail e chave somente quando fornecidos e reduz o intervalo com chave", async () => {
    const h = harness((url) => respond(200, esearchBody(POOL, url)), { email: "pessoa@exemplo.org", apiKey: "abc123def456" });
    const client = createPubMedClient(h.options);
    await client.search("x", { maxResults: 4, pageSize: 2 });
    expect(h.calls[0]!.searchParams.get("email")).toBe("pessoa@exemplo.org");
    expect(h.calls[0]!.searchParams.get("api_key")).toBe("abc123def456");
    expect(h.times[1]! - h.times[0]!).toBeGreaterThanOrEqual(MIN_INTERVAL_WITH_KEY_MS);
    expect(client.hasApiKey).toBe(true);
  });

  it("não inventa e-mail e só aceita chave com formato plausível", () => {
    expect(pubmedConfigFromEnv({})).toEqual({ email: null, apiKey: null });
    expect(pubmedConfigFromEnv({ NCBI_EMAIL: "invalido", NCBI_API_KEY: "x y" })).toEqual({ email: null, apiKey: null });
    expect(pubmedConfigFromEnv({ NCBI_EMAIL: " a@b.org ", NCBI_API_KEY: "abcd1234" })).toEqual({ email: "a@b.org", apiKey: "abcd1234" });
  });

  it("repete após 429 com backoff exponencial + jitter e respeita Retry-After", async () => {
    const h = harness((url, call) => {
      if (call === 1) return respond(429, {});
      if (call === 2) return respond(429, {}, { "retry-after": "2" });
      return respond(200, esearchBody(POOL, url));
    });
    const result = await createPubMedClient(h.options).search("x", { maxResults: 1 });
    expect(result.pmids).toEqual([POOL[0]]);
    expect(h.calls).toHaveLength(3);
    // 1ª espera: 100·2⁰ + floor(0,5·100) = 150 ms; 2ª: max(Retry-After 2000, 100·2¹ + 50) = 2000 ms.
    const backoffs = h.sleeps.filter((ms) => ms === 150 || ms === 2000);
    expect(backoffs).toEqual([150, 2000]);
  });

  it("recupera-se de 500/503 transitórios", async () => {
    const h = harness((url, call) => (call <= 2 ? respond(call === 1 ? 500 : 503, {}) : respond(200, esearchBody(POOL, url))));
    const result = await createPubMedClient(h.options).search("x", { maxResults: 2 });
    expect(result.pmids).toHaveLength(2);
    expect(h.calls).toHaveLength(3);
  });

  it("aborta por timeout (AbortController) e tenta de novo", async () => {
    let call = 0;
    const fetch: FetchLike = (input, init) => {
      call += 1;
      if (call === 1) {
        return new Promise((_, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        });
      }
      return Promise.resolve(respond(200, esearchBody(POOL, new URL(input))));
    };
    const client = createPubMedClient({ fetch, timeoutMs: 5, sleep: async () => undefined, random: () => 0 });
    const result = await client.search("x", { maxResults: 1 });
    expect(result.pmids).toEqual([POOL[0]]);
    expect(call).toBe(2);
  });

  it("esgota no máximo 3 tentativas e lança erro tipado sem stack nem segredos", async () => {
    const h = harness(() => respond(503, {}), { apiKey: "segredo12345", email: "contato@exemplo.org" });
    const client = createPubMedClient({ ...h.options, maxAttempts: 10 });
    const error = await client.search("x").catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(IngestionError);
    const typed = error as IngestionError;
    expect(typed.code).toBe("RETRIES_EXHAUSTED");
    expect(typed.details).toMatchObject({ endpoint: "esearch", attempts: 3, status: 503, lastCode: "SERVER_ERROR" });
    expect(h.calls).toHaveLength(3);
    const serialized = JSON.stringify(typed);
    expect(serialized).not.toContain("stack");
    expect(serialized).not.toContain("segredo12345");
    expect(serialized).not.toContain("contato@exemplo.org");
    expect(Object.keys(typed.toJSON()).sort()).toEqual(["attempts", "code", "endpoint", "lastCode", "message", "status"]);
  });

  it("esgota tentativas também quando todas excedem o tempo limite", async () => {
    const fetch: FetchLike = (_input, init) =>
      new Promise((_, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("abort"))));
    const client = createPubMedClient({ fetch, timeoutMs: 3, sleep: async () => undefined });
    await expect(client.search("x")).rejects.toMatchObject({ code: "RETRIES_EXHAUSTED", details: { lastCode: "TIMEOUT", attempts: 3 } });
  });

  it("não repete erros 4xx não transitórios", async () => {
    const h = harness(() => respond(400, {}));
    await expect(createPubMedClient(h.options).search("x")).rejects.toMatchObject({ code: "HTTP_ERROR", details: { status: 400, attempts: 1 } });
    expect(h.calls).toHaveLength(1);
  });

  it("redige api_key e email de qualquer mensagem", () => {
    expect(redactSecrets("https://x/?api_key=abc&email=a@b.org&tool=lupa")).toBe("https://x/?api_key=[omitido]&email=[omitido]&tool=lupa");
    expect(new IngestionError("NETWORK", "falhou em ?api_key=zzz").message).not.toContain("zzz");
  });
});

describe("Ingestão PubMed — respostas malformadas viram erro tipado", () => {
  it("rejeita envelope esearch inválido, PMID inválido e erro declarado pelo NCBI", () => {
    expect(() => parseEsearchPage({ foo: 1 })).toThrow(IngestionError);
    expect(() => parseEsearchPage(null)).toThrow(/esearch/);
    const bad = { esearchresult: { count: "1", retmax: "1", retstart: "0", idlist: ["abc"] } };
    expect(() => parseEsearchPage(bad)).toThrow(/PMID inválido/);
    const ncbiError = { esearchresult: { count: "0", retmax: "0", retstart: "0", idlist: [], ERROR: "Invalid query" } };
    try {
      parseEsearchPage(ncbiError);
      expect.unreachable();
    } catch (error) {
      expect((error as IngestionError).code).toBe("MALFORMED_RESPONSE");
    }
  });

  it("cliente propaga MALFORMED_RESPONSE para JSON inválido sem repetir", async () => {
    const h = harness(() => ({ ...respond(200, {}), json: async () => { throw new SyntaxError("Unexpected token <"); } }));
    await expect(createPubMedClient(h.options).search("x")).rejects.toMatchObject({ code: "MALFORMED_RESPONSE" });
    expect(h.calls).toHaveLength(1);
  });

  it("esummary: item com erro ou malformado vira itemError; envelope ruim vira batchError", async () => {
    const parsed = parseEsummaryBatch(
      { result: { uids: ["1", "2", "3"], "1": docFor("1"), "2": { uid: "2", error: "cannot get document summary" }, "3": { uid: 3, authors: "x" } } },
      ["1", "2", "3", "4"],
    );
    expect(parsed.candidates.map((item) => item.pmid)).toEqual(["1"]);
    expect(parsed.itemErrors.map((item) => [item.pmid, item.code])).toEqual([
      ["2", "SUMMARY_UNAVAILABLE"],
      ["3", "MALFORMED_ITEM"],
      ["4", "SUMMARY_UNAVAILABLE"],
    ]);
    expect(() => parseEsummaryBatch({ result: "nada" }, ["1"])).toThrow(IngestionError);

    const h = harness((url) => (url.pathname.endsWith("esummary.fcgi") ? respond(200, { oops: true }) : respond(200, esearchBody(POOL, url))));
    const summaries = await createPubMedClient(h.options).summaries(["10", "11"]);
    expect(summaries.candidates).toEqual([]);
    expect(summaries.batchErrors).toHaveLength(1);
    expect(summaries.batchErrors[0]!.error.code).toBe("MALFORMED_RESPONSE");
  });
});

describe("Ingestão PubMed — normalização de metadados", () => {
  it("normaliza PMID, DOI, PMCID, título, ano, periódico e autores", () => {
    expect(normalizePmid(" PMID: 0035658024 ")).toBe("35658024");
    expect(normalizePmid("12a")).toBeNull();
    expect(normalizePmid("0")).toBeNull();
    expect(normalizeDoi("doi: 10.1056/NEJMoa2206038.")).toBe("10.1056/nejmoa2206038");
    expect(normalizeDoi("https://doi.org/10.1000/ABC")).toBe("10.1000/abc");
    expect(normalizeDoi("not-a-doi")).toBeNull();
    expect(normalizePmcid("pmc11965027")).toBe("PMC11965027");
    expect(normalizeTitle("  Efeito&#32;de <i>X</i> &amp;  Y  ")).toBe("Efeito de X & Y");
    expect(normalizeYear(undefined, "2024 Dec", "2025")).toBe(2024);
    expect(normalizeYear("sem data")).toBeNull();
    const doc = normalizeSummaryDoc({ ...docFor("39996356"), articleids: [{ idtype: "pmc", value: "PMC11965027" }], elocationid: "doi: 10.1111/dom.16275" });
    expect(doc).toMatchObject({
      pmid: "39996356",
      doi: "10.1111/dom.16275",
      pmcid: "PMC11965027",
      title: "Título & metadados do PMID 39996356.",
      year: 2025,
      journal: "Journal of Testing",
      authors: ["Silva A", "Souza B"],
      authorCount: 2,
      publicationTypes: ["Journal Article", "Randomized Controlled Trial"],
      pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/39996356/",
    });
    // Nenhum campo de efeito clínico, resumo ou abstract é produzido.
    expect(Object.keys(doc!)).not.toEqual(expect.arrayContaining(["abstract", "summary", "effect", "result"]));
  });
});

function candidate(pmid: string, extra: Partial<NormalizedCandidate> = {}): NormalizedCandidate {
  return {
    pmid,
    doi: null,
    pmcid: null,
    title: `Artigo ${pmid}`,
    year: 2025,
    journal: "J",
    authors: [],
    authorCount: 0,
    publicationTypes: [],
    pubmedUrl: pubmedUrlFor(pmid),
    ...extra,
  };
}

describe("Ingestão PubMed — deduplicação contra o catálogo real", () => {
  const index = buildCatalogIndex(unifiedEvidenceCatalog);

  it("indexa 50 registros canônicos e 55 fontes (incluindo aliases)", () => {
    expect(index.canonicalCount).toBe(50);
    expect(index.sourceCount).toBe(55);
  });

  it("PMID já catalogado → already_cataloged com o ID LUPA canônico", () => {
    const e01 = classifyCandidate(candidate("35658024"), index);
    expect(e01.status).toBe("already_cataloged");
    expect(e01.match).toEqual({ lupaId: "E01", matchedSourceIds: ["E01", "P12"], matchedBy: ["pmid", "pubmed_url"] });
    expect(classifyCandidate(candidate("41537305"), index).match?.lupaId).toBe("E21");
    expect(classifyCandidate(candidate("38078870"), index).match?.lupaId).toBe("E16");
  });

  it("PMID conhecido só por alias → alias_known apontando para o canônico (P20 → E04)", () => {
    const viaAlias = classifyCandidate(candidate("39996356"), index);
    expect(viaAlias.status).toBe("alias_known");
    expect(viaAlias.match).toMatchObject({ lupaId: "E04", matchedSourceIds: ["P20"] });
  });

  it("URL PMC do registro canônico também identifica o item (E04)", () => {
    const viaPmc = classifyCandidate(candidate("39996356", { pmcid: "PMC11965027" }), index);
    expect(viaPmc.status).toBe("already_cataloged");
    expect(viaPmc.match).toMatchObject({ lupaId: "E04", matchedSourceIds: ["E04", "P20"], matchedBy: ["pmc_url", "pmid", "pubmed_url"] });
  });

  it("PMID desconhecido → new_candidate sem ID LUPA", () => {
    const fresh = classifyCandidate(candidate("99999901"), index);
    expect(fresh.status).toBe("new_candidate");
    expect(fresh.match).toBeNull();
  });

  it("remove duplicatas e ordena de forma estável; catálogo sintético com DOI", () => {
    const synthetic: CatalogLike = [
      { id: "E99", pmid: null, url: "https://doi.org/10.1000/abc", references: [{ sourceId: "E99", url: "https://doi.org/10.1000/abc" }] },
    ];
    const out = dedupeCandidates(
      [candidate("200"), candidate("1000", { doi: "10.1000/abc" }), candidate("200"), candidate("30")],
      buildCatalogIndex(synthetic),
    );
    expect(out.map((item) => item.pmid)).toEqual(["30", "200", "1000"]);
    expect(out[2]!.match).toEqual({ lupaId: "E99", matchedSourceIds: ["E99"], matchedBy: ["doi_url"] });
  });
});

function pipelineFetch(order: "asc" | "desc" = "asc") {
  const ids = ["35658024", "39996356", "99999901", "99999902", "99999903"];
  const listed = order === "asc" ? ids : [...ids].reverse();
  return harness((url) => {
    if (url.pathname.endsWith("esearch.fcgi")) return respond(200, esearchBody(listed, url));
    const body = esummaryBody(url, { "99999903": { error: "cannot get document summary" } }) as { result: Record<string, unknown> };
    return respond(200, body);
  });
}

function hashEvidenceJson(): Record<string, string> {
  const dir = path.join(ROOT, "features", "evidence");
  return Object.fromEntries(
    readdirSync(dir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => [name, createHash("sha256").update(readFileSync(path.join(dir, name))).digest("hex")]),
  );
}

describe("Ingestão PubMed — relatório dry-run", () => {
  it("classifica, marca revisão humana e registra erros sem extrair efeitos clínicos", async () => {
    const h = pipelineFetch();
    const report = await runPubMedDryRun({
      client: createPubMedClient(h.options),
      catalog: unifiedEvidenceCatalog,
      maxResults: 20,
      pageSize: 2,
      now: () => new Date("2026-11-08T12:00:00.000Z"),
    });
    expect(report.status).toBe(REVIEW_STATUS);
    expect(report.mode).toBe("dry-run");
    expect(report.writesCatalog).toBe(false);
    expect(report.query.term).toBe(DEFAULT_PUBMED_QUERY);
    expect(report.summary).toEqual({ newCandidates: 2, aliasKnown: 1, alreadyCataloged: 1, errors: 1 });
    expect(report.alreadyCataloged[0]).toMatchObject({ pmid: "35658024", lupaId: "E01" });
    expect(report.aliasKnown[0]).toMatchObject({ pmid: "39996356", lupaId: "E04" });
    expect(report.newCandidates.map((item) => item.pmid)).toEqual(["99999901", "99999902"]);
    expect(report.errors[0]).toMatchObject({ scope: "summary_item", code: "SUMMARY_UNAVAILABLE", pmids: ["99999903"] });
    for (const item of [...report.newCandidates, ...report.aliasKnown, ...report.alreadyCataloged]) {
      expect(item.reviewStatus).toBe("candidate — requer revisão humana");
      expect(item.pubmedUrl).toBe(`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`);
    }
    const markdown = renderMarkdownReport(report);
    expect(markdown).toContain("candidate — requer revisão humana");
    expect(markdown).toContain("[abrir no PubMed](https://pubmed.ncbi.nlm.nih.gov/99999901/)");
    expect(markdown).toContain(DEFAULT_PUBMED_QUERY);
    expect(markdown).toContain("2026-11-08T12:00:00.000Z");
    expect(markdown).toContain("Registro LUPA: **E01**");
    expect(JSON.stringify(report)).not.toMatch(/"(abstract|effectSize|clinicalSummary|resultsSummary)"/);
  });

  it("falha do esearch vira erro no relatório, sem candidatos e sem exceção", async () => {
    const h = harness(() => respond(503, {}));
    const report = await runPubMedDryRun({ client: createPubMedClient(h.options), catalog: unifiedEvidenceCatalog, query: "x" });
    expect(report.summary.errors).toBe(1);
    expect(report.errors[0]).toMatchObject({ scope: "search", code: "RETRIES_EXHAUSTED", attempts: 3, status: 503 });
    expect(report.pubmed.totalCount).toBeNull();
    expect(report.newCandidates).toEqual([]);
  });

  it("é idempotente: mesma entrada (em qualquer ordem) → mesmo relatório, exceto o timestamp", async () => {
    const run = (order: "asc" | "desc", iso: string) =>
      runPubMedDryRun({
        client: createPubMedClient(pipelineFetch(order).options),
        catalog: unifiedEvidenceCatalog,
        pageSize: 2,
        now: () => new Date(iso),
      });
    const first = await run("asc", "2026-11-08T10:00:00.000Z");
    const second = await run("asc", "2026-11-09T23:59:59.000Z");
    const shuffled = await run("desc", "2026-11-10T08:00:00.000Z");
    expect(first.generatedAt).not.toBe(second.generatedAt);
    expect(stripVolatile(second)).toEqual(stripVolatile(first));
    expect(second.contentHash).toBe(first.contentHash);
    expect(shuffled.contentHash).toBe(first.contentHash);
    const withoutDate = (text: string) => text.replace(/^- Gerado em: .*$/m, "");
    expect(withoutDate(renderMarkdownReport(second))).toBe(withoutDate(renderMarkdownReport(first)));
  });
});

describe("Ingestão PubMed — nunca escreve no catálogo de produção", () => {
  it("pipeline completo não altera features/evidence/*.json", async () => {
    const before = hashEvidenceJson();
    expect(Object.keys(before)).toEqual(expect.arrayContaining(["catalog.seed.json", "supplemental.seed.json"]));
    const h = pipelineFetch();
    const report = await runPubMedDryRun({ client: createPubMedClient(h.options), catalog: unifiedEvidenceCatalog });
    renderMarkdownReport(report);
    resolveReportPaths(ROOT, report.generatedAt);
    expect(hashEvidenceJson()).toEqual(before);
    expect(unifiedEvidenceCatalog).toHaveLength(50);
  });

  it("módulos de features/ingestion não importam fs nem gravam arquivos", () => {
    const dir = path.join(ROOT, "features", "ingestion");
    const files = readdirSync(dir).filter((name) => name.endsWith(".ts"));
    expect(files).toEqual(expect.arrayContaining(["pubmed-client.ts", "normalize.ts", "dedupe.ts", "report.ts", "run.ts"]));
    for (const name of files) {
      const source = readFileSync(path.join(dir, name), "utf8");
      expect(source, name).not.toMatch(/from\s+["'](node:)?fs(\/promises)?["']/);
      expect(source, name).not.toMatch(/\b(writeFile|appendFile|createWriteStream|rename|unlink|rmSync|mkdir)\w*\s*\(/);
    }
  });

  it("o script só grava nos caminhos de relatório validados e não tem modo de escrita no catálogo", () => {
    const script = readFileSync(path.join(ROOT, "scripts", "sync-pubmed.mjs"), "utf8");
    const writes = [...script.matchAll(/writeFileSync\(([^,]+),/g)].map((match) => match[1]!.trim());
    expect(writes).toEqual(["paths.json", "paths.markdown"]);
    // Nenhuma string literal do script aponta para arquivos JSON do catálogo.
    expect(script).not.toMatch(/["'`][^"'`\n]*features[\\/]+evidence[^"'`\n]*\.json/);
    expect(script).not.toMatch(/case\s+"--(write|apply|publish|commit)"/);
  });

  it("caminhos de saída ficam em reports/pubmed-dry-run e destinos perigosos são recusados", () => {
    const paths = resolveReportPaths(ROOT, "2026-11-08T12:00:00.000Z");
    expect(paths.json).toBe(path.join(ROOT, "reports", "pubmed-dry-run", "2026-11-08.json"));
    expect(paths.markdown).toBe(path.join(ROOT, "reports", "pubmed-dry-run", "2026-11-08.md"));
    for (const target of [
      "features/evidence/catalog.seed.json",
      "features/evidence/supplemental.seed.json",
      "reports/pubmed-dry-run/../../features/evidence/catalog.seed.json",
      "reports/other.json",
      "reports/pubmed-dry-run/x.ts",
      path.join(ROOT, "..", "fora.json"),
    ]) {
      expect(() => assertSafeReportPath(ROOT, target), target).toThrow(expect.objectContaining({ code: "UNSAFE_OUTPUT_PATH" }));
    }
    expect(() => resolveReportPaths(ROOT, "ontem")).toThrow(IngestionError);
  });
});

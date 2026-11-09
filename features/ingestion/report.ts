import { createHash } from "node:crypto";
import path from "node:path";
import { IngestionError, type SerializedIngestionError } from "./errors";
import type { DedupedCandidate, DedupeStatus, MatchKind } from "./dedupe";

// Relatório do dry-run: lista de METADADOS candidatos à revisão humana.
// Sem extração de efeitos clínicos, sem resumos interpretativos, sem escrita no catálogo.

export const REVIEW_STATUS = "candidate — requer revisão humana" as const;
export const REPORT_SCHEMA_VERSION = 1 as const;
export const REPORT_DIR_SEGMENTS = ["reports", "pubmed-dry-run"] as const;

export interface ReportCandidate {
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
  dedupeStatus: DedupeStatus;
  lupaId: string | null;
  matchedSourceIds: string[];
  matchedBy: MatchKind[];
  reviewStatus: typeof REVIEW_STATUS;
}

export interface ReportError {
  scope: "search" | "summary_batch" | "summary_item";
  code: string;
  message: string;
  pmids: string[];
  endpoint: string | null;
  status: number | null;
  attempts: number | null;
}

export interface DryRunReportInput {
  generatedAt: string;
  query: { term: string; sort: string; maxResults: number; pageSize: number; queryTranslation: string | null };
  source: { apiKeyUsed: boolean; emailProvided: boolean };
  pubmed: { totalCount: number | null; retrieved: number; pages: number; duplicatesInResponse: number };
  catalog: { canonicalRecords: number; indexedSources: number };
  candidates: readonly DedupedCandidate[];
  errors: readonly ReportError[];
}

export interface DryRunReport {
  schemaVersion: typeof REPORT_SCHEMA_VERSION;
  mode: "dry-run";
  status: typeof REVIEW_STATUS;
  writesCatalog: false;
  disclaimer: string;
  generatedAt: string;
  query: DryRunReportInput["query"];
  source: {
    service: "NCBI E-utilities (PubMed)";
    tool: "lupa-saude";
    apiKeyUsed: boolean;
    emailProvided: boolean;
  };
  pubmed: DryRunReportInput["pubmed"];
  catalog: DryRunReportInput["catalog"];
  summary: { newCandidates: number; aliasKnown: number; alreadyCataloged: number; errors: number };
  newCandidates: ReportCandidate[];
  aliasKnown: ReportCandidate[];
  alreadyCataloged: ReportCandidate[];
  errors: ReportError[];
  /** sha256 do conteúdo sem `generatedAt`: igual entre execuções com a mesma entrada. */
  contentHash: string;
}

export const REPORT_DISCLAIMER =
  "Metadados bibliográficos obtidos do PubMed para triagem. Nenhum item foi incorporado ao catálogo, " +
  "revisado clinicamente ou liberado para projeção. Não há extração de efeitos nem resumo interpretativo.";

export function searchErrorToReport(error: SerializedIngestionError, scope: ReportError["scope"], pmids: string[] = []): ReportError {
  return {
    scope,
    code: error.code,
    message: error.message,
    pmids: [...pmids].sort(),
    endpoint: error.endpoint ?? null,
    status: error.status ?? null,
    attempts: error.attempts ?? null,
  };
}

function toReportCandidate(candidate: DedupedCandidate): ReportCandidate {
  return {
    pmid: candidate.pmid,
    doi: candidate.doi,
    pmcid: candidate.pmcid,
    title: candidate.title,
    year: candidate.year,
    journal: candidate.journal,
    authors: [...candidate.authors],
    authorCount: candidate.authorCount,
    publicationTypes: [...candidate.publicationTypes],
    pubmedUrl: candidate.pubmedUrl,
    dedupeStatus: candidate.status,
    lupaId: candidate.match?.lupaId ?? null,
    matchedSourceIds: candidate.match ? [...candidate.match.matchedSourceIds] : [],
    matchedBy: candidate.match ? [...candidate.match.matchedBy] : [],
    reviewStatus: REVIEW_STATUS,
  };
}

function byPmid(a: { pmid: string }, b: { pmid: string }): number {
  return a.pmid.length - b.pmid.length || (a.pmid < b.pmid ? -1 : a.pmid > b.pmid ? 1 : 0);
}

function compareErrors(a: ReportError, b: ReportError): number {
  const left = `${a.scope}|${a.code}|${a.pmids.join(",")}|${a.message}`;
  const right = `${b.scope}|${b.code}|${b.pmids.join(",")}|${b.message}`;
  return left < right ? -1 : left > right ? 1 : 0;
}

/** JSON com chaves ordenadas: base estável para o hash de idempotência. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** Remove campos voláteis (data de geração e hash) para comparar execuções. */
export function stripVolatile(report: DryRunReport): Omit<DryRunReport, "generatedAt" | "contentHash"> {
  const { generatedAt: _generatedAt, contentHash: _contentHash, ...rest } = report;
  void _generatedAt;
  void _contentHash;
  return rest;
}

export function buildDryRunReport(input: DryRunReportInput): DryRunReport {
  const candidates = [...input.candidates].map(toReportCandidate).sort(byPmid);
  const pick = (status: DedupeStatus) => candidates.filter((item) => item.dedupeStatus === status);
  const errors = [...input.errors].map((error) => ({ ...error, pmids: [...error.pmids].sort() })).sort(compareErrors);
  const draft: Omit<DryRunReport, "contentHash"> = {
    schemaVersion: REPORT_SCHEMA_VERSION,
    mode: "dry-run",
    status: REVIEW_STATUS,
    writesCatalog: false,
    disclaimer: REPORT_DISCLAIMER,
    generatedAt: input.generatedAt,
    query: { ...input.query },
    source: {
      service: "NCBI E-utilities (PubMed)",
      tool: "lupa-saude",
      apiKeyUsed: input.source.apiKeyUsed,
      emailProvided: input.source.emailProvided,
    },
    pubmed: { ...input.pubmed },
    catalog: { ...input.catalog },
    summary: {
      newCandidates: pick("new_candidate").length,
      aliasKnown: pick("alias_known").length,
      alreadyCataloged: pick("already_cataloged").length,
      errors: errors.length,
    },
    newCandidates: pick("new_candidate"),
    aliasKnown: pick("alias_known"),
    alreadyCataloged: pick("already_cataloged"),
    errors,
  };
  const { generatedAt: _ignored, ...hashable } = draft;
  void _ignored;
  const contentHash = createHash("sha256").update(stableStringify(hashable)).digest("hex");
  return { ...draft, contentHash };
}

// ---------- Markdown ----------

function md(text: string): string {
  return text.replace(/([\\`*_[\]<>|#])/g, "\\$1").replace(/\s+/g, " ").trim();
}

function authorsLine(item: ReportCandidate): string {
  if (item.authors.length === 0) return "autores não informados";
  const extra = item.authorCount > item.authors.length ? ` et al. (${item.authorCount} autores)` : "";
  return md(item.authors.slice(0, 3).join(", ")) + (item.authorCount > 3 && !extra ? " et al." : "") + extra;
}

function candidateBlock(item: ReportCandidate): string {
  const ids = [`PMID ${item.pmid}`, item.doi ? `DOI ${md(item.doi)}` : null, item.pmcid ? item.pmcid : null]
    .filter(Boolean)
    .join(" · ");
  const lines = [
    `- **${md(item.title)}**`,
    `  - ${ids} — [abrir no PubMed](${item.pubmedUrl})`,
    `  - ${item.journal ? md(item.journal) : "periódico não informado"}, ${item.year ?? "ano não informado"} — ${authorsLine(item)}`,
  ];
  if (item.publicationTypes.length) lines.push(`  - Tipo declarado no PubMed: ${md(item.publicationTypes.join(", "))}`);
  if (item.lupaId) {
    lines.push(`  - Registro LUPA: **${item.lupaId}** (fontes: ${item.matchedSourceIds.join(", ")}; por ${item.matchedBy.join(", ")})`);
  }
  lines.push(`  - Situação: ${REVIEW_STATUS}`);
  return lines.join("\n");
}

export function renderMarkdownReport(report: DryRunReport): string {
  const section = (title: string, items: ReportCandidate[], empty: string) =>
    [`## ${title} (${items.length})`, "", items.length ? items.map(candidateBlock).join("\n") : `_${empty}_`, ""].join("\n");
  const errors = report.errors.length
    ? report.errors
        .map((error) => {
          const meta = [error.endpoint, error.status ? `HTTP ${error.status}` : null, error.attempts ? `${error.attempts} tentativa(s)` : null]
            .filter(Boolean)
            .join(", ");
          const pmids = error.pmids.length ? ` — PMIDs: ${error.pmids.join(", ")}` : "";
          return `- \`${error.code}\` (${error.scope}${meta ? `; ${meta}` : ""}): ${md(error.message)}${pmids}`;
        })
        .join("\n")
    : "_Nenhum erro registrado._";
  return [
    "# Dry-run PubMed — candidatos para revisão humana",
    "",
    `> **Status: ${REVIEW_STATUS}.** ${REPORT_DISCLAIMER}`,
    "",
    `- Gerado em: ${report.generatedAt}`,
    `- Consulta: \`${report.query.term.replace(/`/g, "'")}\``,
    report.query.queryTranslation ? `- Tradução do PubMed: \`${report.query.queryTranslation.replace(/`/g, "'")}\`` : null,
    `- Ordenação: ${report.query.sort} · máximo: ${report.query.maxResults} · lote: ${report.query.pageSize}`,
    `- Total no PubMed para a consulta: ${report.pubmed.totalCount ?? "desconhecido"} · obtidos: ${report.pubmed.retrieved} · páginas: ${report.pubmed.pages}`,
    `- Catálogo comparado: ${report.catalog.canonicalRecords} registros canônicos, ${report.catalog.indexedSources} fontes indexadas (incl. aliases)`,
    `- Modo: dry-run · escreve no catálogo: não · hash do conteúdo: \`${report.contentHash.slice(0, 16)}\``,
    "",
    "| Novos candidatos | Alias conhecido | Já catalogado | Erros |",
    "|---:|---:|---:|---:|",
    `| ${report.summary.newCandidates} | ${report.summary.aliasKnown} | ${report.summary.alreadyCataloged} | ${report.summary.errors} |`,
    "",
    section("Novos candidatos", report.newCandidates, "Nenhum candidato novo."),
    section("Alias conhecido (fonte já mapeada a um registro LUPA)", report.aliasKnown, "Nenhum alias encontrado."),
    section("Já catalogados", report.alreadyCataloged, "Nenhum item já catalogado."),
    `## Erros (${report.errors.length})`,
    "",
    errors,
    "",
    "## Próximos passos (humanos)",
    "",
    "1. Conferir cada candidato novo no PubMed e no texto original.",
    "2. Revisão bibliográfica e metodológica por pessoa responsável.",
    "3. Só então atualizar `features/evidence/*.seed.json` em PR próprio, com teste de regressão.",
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

// ---------- Caminhos de saída (nunca dentro do catálogo) ----------

export interface ReportPaths {
  dir: string;
  json: string;
  markdown: string;
}

export function reportDateStamp(generatedAt: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})T/.exec(generatedAt);
  if (!match) throw new IngestionError("INVALID_INPUT", "generatedAt precisa ser uma data ISO");
  return match[1] as string;
}

/** Garante que o destino está em `<raiz>/reports/pubmed-dry-run/` e fora de `features/`. */
export function assertSafeReportPath(rootDir: string, target: string): string {
  const root = path.resolve(rootDir);
  const allowed = path.resolve(root, ...REPORT_DIR_SEGMENTS);
  const resolved = path.resolve(root, target);
  const relative = path.relative(allowed, resolved);
  const inside = relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
  const touchesFeatures = !path.relative(path.resolve(root, "features"), resolved).startsWith("..");
  if (!inside || touchesFeatures || !/\.(json|md)$/.test(resolved)) {
    throw new IngestionError("UNSAFE_OUTPUT_PATH", "Destino fora de reports/pubmed-dry-run recusado");
  }
  return resolved;
}

export function resolveReportPaths(rootDir: string, generatedAt: string): ReportPaths {
  const stamp = reportDateStamp(generatedAt);
  const dir = path.resolve(rootDir, ...REPORT_DIR_SEGMENTS);
  return {
    dir,
    json: assertSafeReportPath(rootDir, path.join(dir, `${stamp}.json`)),
    markdown: assertSafeReportPath(rootDir, path.join(dir, `${stamp}.md`)),
  };
}

#!/usr/bin/env node
// Dry-run da ingestão PubMed (NCBI E-utilities) do LUPA Saúde.
//
// Único modo: --dry-run. Gera candidatos para REVISÃO HUMANA em reports/pubmed-dry-run/<data>.{json,md}.
// Não existe opção que escreva em features/evidence/*.json ou em qualquer outro arquivo do catálogo.
//
// Uso:  npm run ingest:pubmed:dry-run [-- --query "<termos>" --max 20 --sort relevance|pub_date]
// Requer Node 22.15+ (type stripping + module.registerHooks), sem dependências novas.
// Variáveis opcionais: NCBI_EMAIL (contato informado ao NCBI), NCBI_API_KEY (nunca impressa).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT_URL = pathToFileURL(ROOT + path.sep).href;
const MAX_ALLOWED = 100;

const HELP = `Dry-run PubMed do LUPA (somente candidatos; nunca altera o catálogo).

Opções:
  --dry-run            modo único (padrão)
  --query "<termos>"   consulta PubMed (padrão: semaglutide/tirzepatide + obesity/body composition/mental health)
  --max <n>            máximo de resultados, 1–${MAX_ALLOWED} (padrão 20)
  --sort <ordem>       relevance (padrão) ou pub_date
  --help               mostra esta ajuda`;

function fail(message, code = 1) {
  console.error(`[pubmed-dry-run] ${message}`);
  process.exit(code);
}

function parseArgs(argv) {
  const options = { query: undefined, max: 20, sort: "relevance", help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (raw === "--") continue;
    const [flag, inline] = raw.startsWith("--") && raw.includes("=") ? [raw.slice(0, raw.indexOf("=")), raw.slice(raw.indexOf("=") + 1)] : [raw, undefined];
    const value = () => {
      const next = inline ?? argv[++index];
      if (next === undefined || (inline === undefined && next.startsWith("--"))) fail(`${flag} exige um valor`);
      return next;
    };
    switch (flag) {
      case "--dry-run":
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--query":
        options.query = value();
        break;
      case "--max": {
        const parsed = Number(value());
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_ALLOWED) fail(`--max deve ser inteiro entre 1 e ${MAX_ALLOWED}`);
        options.max = parsed;
        break;
      }
      case "--sort": {
        const sort = value();
        if (sort !== "relevance" && sort !== "pub_date") fail("--sort aceita relevance ou pub_date");
        options.sort = sort;
        break;
      }
      default:
        fail(`opção desconhecida: ${flag}. Este script só funciona em dry-run e não grava no catálogo.\n\n${HELP}`);
    }
  }
  return options;
}

function installTypeScriptHooks() {
  if (typeof registerHooks !== "function") fail("Node 22.15+ é necessário (module.registerHooks indisponível).");
  if (!process.features?.typescript) fail("Execute com `node --experimental-strip-types` (Node 22.6+).");
  const isProjectFile = (url) => url.startsWith(ROOT_URL) && !url.includes("/node_modules/");
  registerHooks({
    resolve(specifier, context, nextResolve) {
      // Imports sem extensão e alias "@/" (convenção do bundler/tsconfig) → arquivo .ts do projeto.
      // Formato explícito "module-typescript": o package.json não declara "type".
      const asTypeScript = (url) => ({ url, format: "module-typescript", shortCircuit: true });
      const parent = context.parentURL ?? "";
      let candidate = null;
      if (specifier.startsWith("@/")) candidate = new URL(specifier.slice(2), ROOT_URL);
      else if ((specifier.startsWith("./") || specifier.startsWith("../")) && isProjectFile(parent)) candidate = new URL(specifier, parent);
      if (candidate && !path.extname(candidate.pathname)) {
        for (const suffix of [".ts", "/index.ts"]) {
          const url = new URL(candidate.href + suffix);
          if (existsSync(fileURLToPath(url))) return asTypeScript(url.href);
        }
      }
      const resolved = nextResolve(candidate ? candidate.href : specifier, context);
      return resolved.url.endsWith(".ts") && isProjectFile(resolved.url) ? asTypeScript(resolved.url) : resolved;
    },
    load(url, context, nextLoad) {
      // Os seeds do catálogo são importados sem atributo `type: "json"` (convenção do bundler).
      // Aqui são SOMENTE LIDOS e expostos como módulo; nada é gravado.
      if (url.endsWith(".json") && isProjectFile(url)) {
        const text = readFileSync(fileURLToPath(url), "utf8");
        JSON.parse(text);
        return { format: "module", source: `export default ${text};`, shortCircuit: true };
      }
      return nextLoad(url, context);
    },
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(HELP);
    return;
  }
  installTypeScriptHooks();
  const fromRoot = (relative) => pathToFileURL(path.join(ROOT, relative)).href;
  const { createPubMedClient, pubmedConfigFromEnv } = await import(fromRoot("features/ingestion/pubmed-client.ts"));
  const { runPubMedDryRun } = await import(fromRoot("features/ingestion/run.ts"));
  const { renderMarkdownReport, resolveReportPaths } = await import(fromRoot("features/ingestion/report.ts"));
  const { unifiedEvidenceCatalog } = await import(fromRoot("features/evidence/unified-catalog.ts"));

  const config = pubmedConfigFromEnv(process.env);
  const client = createPubMedClient(config);
  const started = Date.now();
  const report = await runPubMedDryRun({
    client,
    catalog: unifiedEvidenceCatalog,
    query: options.query,
    maxResults: options.max,
    sort: options.sort,
  });
  const paths = resolveReportPaths(ROOT, report.generatedAt);
  mkdirSync(paths.dir, { recursive: true });
  writeFileSync(paths.json, JSON.stringify(report, null, 2) + "\n", "utf8");
  writeFileSync(paths.markdown, renderMarkdownReport(report), "utf8");

  const rel = (file) => path.relative(ROOT, file).split(path.sep).join("/");
  console.log("[pubmed-dry-run] modo: dry-run (catálogo NÃO alterado)");
  console.log(`[pubmed-dry-run] consulta: ${report.query.term}`);
  console.log(`[pubmed-dry-run] chave de API: ${client.hasApiKey ? "presente" : "ausente"} · e-mail: ${client.hasEmail ? "informado" : "não informado"}`);
  console.log(`[pubmed-dry-run] total no PubMed: ${report.pubmed.totalCount ?? "?"} · obtidos: ${report.pubmed.retrieved} · requisições: ${client.requestCount()} · ${Date.now() - started} ms`);
  console.log(`[pubmed-dry-run] novos candidatos: ${report.summary.newCandidates} · alias conhecido: ${report.summary.aliasKnown} · já catalogados: ${report.summary.alreadyCataloged} · erros: ${report.summary.errors}`);
  for (const item of [...report.alreadyCataloged, ...report.aliasKnown]) {
    console.log(`  - PMID ${item.pmid} → ${item.lupaId} (${item.dedupeStatus}; fontes ${item.matchedSourceIds.join(", ")})`);
  }
  for (const error of report.errors) console.log(`  ! ${error.code} (${error.scope}): ${error.message}`);
  console.log(`[pubmed-dry-run] relatório: ${rel(paths.json)} e ${rel(paths.markdown)}`);
  console.log(`[pubmed-dry-run] status: ${report.status}`);
  if (report.errors.some((error) => error.scope === "search")) process.exitCode = 1;
}

main().catch((error) => {
  const code = error && typeof error === "object" && "code" in error ? error.code : "UNEXPECTED";
  const message = error instanceof Error ? error.message.replace(/(api_key|email)=[^&\s]*/gi, "$1=[omitido]") : "falha desconhecida";
  fail(`${code}: ${message}`);
});

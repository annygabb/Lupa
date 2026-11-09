import { extractPubmedId, normalizeEvidenceUrl } from "../evidence/normalization";
import type { UnifiedEvidenceRecord } from "../evidence/unified-catalog";
import type { NormalizedCandidate } from "./normalize";

// Deduplicação SOMENTE LEITURA contra o catálogo unificado (registros canônicos + aliases).
// Classifica cada candidato do PubMed em:
//   - already_cataloged: PMID/URL corresponde à fonte canônica de um registro LUPA;
//   - alias_known: corresponde apenas a uma fonte-alias (ex.: P20 → E04);
//   - new_candidate: não encontrado — entra na fila de revisão humana, nunca no catálogo.
// Determinística e idempotente: mesma entrada → mesma saída, ordenada por PMID.

export type DedupeStatus = "already_cataloged" | "alias_known" | "new_candidate";
export type MatchKind = "pmid" | "pubmed_url" | "pmc_url" | "doi_url";

/** Forma mínima do catálogo necessária para comparar (o catálogo real satisfaz esta interface). */
export type CatalogLike = ReadonlyArray<Pick<UnifiedEvidenceRecord, "id" | "pmid" | "url" | "references">>;

interface IndexEntry {
  canonicalId: string;
  sourceId: string;
}

export interface CatalogIndex {
  byPmid: ReadonlyMap<string, readonly IndexEntry[]>;
  byUrl: ReadonlyMap<string, readonly IndexEntry[]>;
  canonicalCount: number;
  sourceCount: number;
}

export interface CatalogMatch {
  lupaId: string;
  matchedSourceIds: string[];
  matchedBy: MatchKind[];
}

export interface DedupedCandidate extends NormalizedCandidate {
  status: DedupeStatus;
  match: CatalogMatch | null;
}

function safeNormalizeUrl(url: string): string | null {
  try {
    return normalizeEvidenceUrl(url);
  } catch {
    return null;
  }
}

function safePubmedId(url: string): string | null {
  try {
    return extractPubmedId(url);
  } catch {
    return null;
  }
}

function push(map: Map<string, IndexEntry[]>, key: string, entry: IndexEntry): void {
  const list = map.get(key) ?? [];
  if (!list.some((item) => item.canonicalId === entry.canonicalId && item.sourceId === entry.sourceId)) list.push(entry);
  map.set(key, list);
}

export function buildCatalogIndex(catalog: CatalogLike): CatalogIndex {
  const byPmid = new Map<string, IndexEntry[]>();
  const byUrl = new Map<string, IndexEntry[]>();
  let sourceCount = 0;
  for (const record of catalog) {
    const references = record.references.length ? record.references : [{ sourceId: record.id, url: record.url }];
    const coveredPmids = new Set<string>();
    for (const reference of references) {
      sourceCount += 1;
      const entry = { canonicalId: record.id, sourceId: reference.sourceId };
      const normalized = safeNormalizeUrl(reference.url);
      if (normalized) push(byUrl, normalized, entry);
      const pmid = safePubmedId(reference.url);
      if (pmid) {
        push(byPmid, pmid, entry);
        coveredPmids.add(pmid);
      }
    }
    // PMID registrado no campo `pmid` sem URL PubMed correspondente: atribuído ao canônico.
    if (record.pmid && !coveredPmids.has(record.pmid)) {
      push(byPmid, record.pmid, { canonicalId: record.id, sourceId: record.id });
    }
  }
  return { byPmid, byUrl, canonicalCount: catalog.length, sourceCount };
}

function candidateUrls(candidate: NormalizedCandidate): Array<{ kind: MatchKind; key: string }> {
  const urls: Array<{ kind: MatchKind; url: string }> = [
    { kind: "pubmed_url", url: candidate.pubmedUrl },
  ];
  if (candidate.pmcid) urls.push({ kind: "pmc_url", url: `https://pmc.ncbi.nlm.nih.gov/articles/${candidate.pmcid}/` });
  if (candidate.doi) urls.push({ kind: "doi_url", url: `https://doi.org/${candidate.doi}` });
  return urls.flatMap(({ kind, url }) => {
    const key = safeNormalizeUrl(url);
    return key ? [{ kind, key }] : [];
  });
}

export function classifyCandidate(candidate: NormalizedCandidate, index: CatalogIndex): DedupedCandidate {
  const hits: Array<IndexEntry & { kind: MatchKind }> = [];
  for (const entry of index.byPmid.get(candidate.pmid) ?? []) hits.push({ ...entry, kind: "pmid" });
  for (const { kind, key } of candidateUrls(candidate)) {
    for (const entry of index.byUrl.get(key) ?? []) hits.push({ ...entry, kind });
  }
  if (hits.length === 0) return { ...candidate, status: "new_candidate", match: null };

  // Um candidato só deve apontar para um registro canônico; se houver mais de um, o menor ID
  // vence de forma determinística e os demais IDs aparecem em matchedSourceIds para revisão.
  const canonicalIds = [...new Set(hits.map((hit) => hit.canonicalId))].sort();
  const lupaId = canonicalIds[0] as string;
  const own = hits.filter((hit) => hit.canonicalId === lupaId);
  const status: DedupeStatus = own.some((hit) => hit.sourceId === hit.canonicalId) ? "already_cataloged" : "alias_known";
  return {
    ...candidate,
    status,
    match: {
      lupaId,
      matchedSourceIds: [...new Set(hits.map((hit) => hit.sourceId))].sort(),
      matchedBy: [...new Set(hits.map((hit) => hit.kind))].sort(),
    },
  };
}

function comparePmid(a: { pmid: string }, b: { pmid: string }): number {
  return a.pmid.length - b.pmid.length || (a.pmid < b.pmid ? -1 : a.pmid > b.pmid ? 1 : 0);
}

/** Classifica todos os candidatos, remove PMIDs repetidos e ordena por PMID (saída estável). */
export function dedupeCandidates(candidates: readonly NormalizedCandidate[], index: CatalogIndex): DedupedCandidate[] {
  const unique = new Map<string, NormalizedCandidate>();
  for (const candidate of candidates) if (!unique.has(candidate.pmid)) unique.set(candidate.pmid, candidate);
  return [...unique.values()].map((candidate) => classifyCandidate(candidate, index)).sort(comparePmid);
}

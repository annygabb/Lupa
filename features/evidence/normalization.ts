// Pesquisa lexical local: não altera fontes originais nem infere diagnóstico.
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeEvidenceUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Fonte HTTPS obrigatória");
  const hostname = url.hostname.toLocaleLowerCase("en-US");
  const normalizedPath = url.pathname.replace(/\/+$/, "") || "/";
  // Não remove query strings de fontes oficiais, pois podem conter identificadores.
  return hostname + normalizedPath + url.search;
}

export function extractPubmedId(value: string): string | null {
  const url = new URL(value);
  if (url.hostname !== "pubmed.ncbi.nlm.nih.gov") return null;
  const match = /^\/(\d{6,9})\/?$/.exec(url.pathname);
  return match?.[1] ?? null;
}

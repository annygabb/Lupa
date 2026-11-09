/**
 * Pré-seleção do Comparador pela URL (/comparar?a=<id>&b=<id>).
 * IDs canônicos ou aliases viram o ID canônico; valores inválidos são ignorados
 * e caem no par padrão E04/E12. O mesmo estudo explícito em A e B é preservado,
 * para que o Comparador mostre o estado "Selecione dois estudos diferentes".
 * Links públicos só carregam identificadores de estudos, nunca dados individuais.
 */
import { getUnifiedEvidence } from "@/features/evidence/unified-catalog";

export const DEFAULT_COMPARE_PAIR = Object.freeze({ a: "E04", b: "E12" });

type ParamValue = string | readonly string[] | null | undefined;
type ParamSource =
  | URLSearchParams
  | { get(name: string): string | null }
  | Readonly<Record<string, ParamValue>>
  | null
  | undefined;

export interface CompareParams {
  a: string;
  b: string;
  /** Valor recebido que foi resolvido (já em maiúsculas), ou null se ausente/ignorado. */
  requested: { a: string | null; b: string | null };
  /** Parâmetros presentes mas ignorados por não corresponderem a uma referência do catálogo. */
  ignored: Array<"a" | "b">;
}

function read(source: ParamSource, key: "a" | "b"): string | null {
  if (!source) return null;
  let value: ParamValue;
  if (typeof (source as { get?: unknown }).get === "function") {
    value = (source as { get(name: string): string | null }).get(key);
  } else {
    value = (source as Readonly<Record<string, ParamValue>>)[key];
  }
  if (Array.isArray(value)) value = value[0];
  return typeof value === "string" ? value : null;
}

/** ID canônico para um identificador vindo de fora (URL), ou null se inválido. */
export function resolveCompareId(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim().toUpperCase();
  if (!/^[EPR]\d{2}$/.test(id)) return null;
  return getUnifiedEvidence(id)?.id ?? null;
}

export function parseCompareParams(source: ParamSource): CompareParams {
  const rawA = read(source, "a");
  const rawB = read(source, "b");
  const a = resolveCompareId(rawA);
  const b = resolveCompareId(rawB);
  const ignored: Array<"a" | "b"> = [];
  if (rawA !== null && rawA.trim() !== "" && a === null) ignored.push("a");
  if (rawB !== null && rawB.trim() !== "" && b === null) ignored.push("b");

  // Só o lado informado é respeitado; o lado ausente usa o padrão, sem colidir com o escolhido.
  const left = a ?? (b === DEFAULT_COMPARE_PAIR.a ? DEFAULT_COMPARE_PAIR.b : DEFAULT_COMPARE_PAIR.a);
  const right = b ?? (left === DEFAULT_COMPARE_PAIR.b ? DEFAULT_COMPARE_PAIR.a : DEFAULT_COMPARE_PAIR.b);
  return {
    a: left,
    b: right,
    requested: { a: a === null ? null : rawA!.trim().toUpperCase(), b: b === null ? null : rawB!.trim().toUpperCase() },
    ignored,
  };
}

/** Query string canônica do par (sem "?"). Lança erro para IDs fora do catálogo. */
export function buildCompareQuery(a: string, b?: string): string {
  const left = resolveCompareId(a);
  if (!left) throw new Error("Referência A inválida");
  const params = new URLSearchParams({ a: left });
  if (b !== undefined) {
    const right = resolveCompareId(b);
    if (!right) throw new Error("Referência B inválida");
    params.set("b", right);
  }
  return params.toString();
}

export function buildCompareHref(a: string, b?: string): string {
  return "/comparar?" + buildCompareQuery(a, b);
}

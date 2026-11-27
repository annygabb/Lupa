"use client";

/**
 * Bancada ligada à URL: lê ?a=&b= (IDs canônicos ou aliases) uma vez na montagem e, a cada
 * seleção ou inversão, reescreve a URL com history.replaceState — sem recarregar e sem rolar.
 * Parâmetros inválidos são ignorados (par padrão E04/E12); a lógica está em features/comparison/params.
 */
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { buildCompareQuery, parseCompareParams } from "@/features/comparison/params";
import { CompareBench } from "./compare-bench";

export function CompareBenchFromUrl() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [initial] = useState(() => {
    const parsed = parseCompareParams(searchParams);
    return { a: parsed.a, b: parsed.b };
  });

  const syncUrl = ({ a, b }: { a: string; b: string }) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of new URLSearchParams(buildCompareQuery(a, b))) next.set(key, value);
    // API de histórico nativa: o Next sincroniza a URL sem navegação nem remontagem.
    window.history.replaceState(null, "", pathname + "?" + next.toString() + window.location.hash);
  };

  return <CompareBench initial={initial} onPairChange={syncUrl}/>;
}

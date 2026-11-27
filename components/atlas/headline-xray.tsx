"use client";

import { useState } from "react";
import Link from "next/link";
import { matchHeadlineToClaim, type HeadlineMatchResult } from "@/features/interpretation/headline-matcher";

const SAMPLE_HEADLINES = [
  "Mounjaro derrete 25% dos músculos do corpo?",
  "Caneta emagrecedora causa risco de morte na UTI?",
  "Se parar o tratamento o peso volta?",
  "23,8% dos brasileiros usam sem receita?",
] as const;

export function HeadlineXray() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<HeadlineMatchResult | null>(null);

  const analyze = (textToCheck: string) => {
    const trimmed = textToCheck.trim();
    if (trimmed.length < 4) return;
    setQuery(textToCheck);
    setResult(matchHeadlineToClaim(trimmed));
  };

  return (
    <div className="mt-10 rounded-2xl border border-[#cad9e8] bg-white/90 p-6 shadow-sm text-[#071a33]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <p className="at-kicker mb-1">Raio-X de Manchetes · Motor Determinístico (Sem IA)</p>
          <h3 className="text-xl font-bold text-[#071a33]">
            Viu uma frase nas redes ou no WhatsApp? Passe no Raio-X.
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#eef4fa] text-[#153a63] border border-[#d5e4f1] self-start">
          Zero alucinação · 100% rastreável
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          analyze(query);
        }}
        className="flex flex-col sm:flex-row gap-2.5"
      >
        <label htmlFor="xray-input" className="sr-only">
          Cole uma manchete ou dúvida sobre semaglutida ou tirzepatida
        </label>
        <input
          id="xray-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: Mounjaro derrete 25% dos músculos e leva pra UTI?"
          maxLength={240}
          className="flex-1 rounded-xl border border-[#b4cae0] bg-[#f8fbff] px-4 py-3 text-sm text-[#071a33] placeholder:text-slate-500 focus:border-[#1e5486] focus:outline-none"
        />
        <button
          type="submit"
          disabled={query.trim().length < 4}
          className="rounded-xl bg-[#0e2a4a] px-5 py-3 text-sm font-bold text-white hover:bg-[#1e5486] disabled:opacity-50 transition shrink-0"
        >
          Analisar frase →
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-3" aria-label="Exemplos de manchetes para testar">
        {SAMPLE_HEADLINES.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => analyze(sample)}
            className="text-xs px-3 py-1.5 rounded-full border border-[#d5e4f1] bg-[#f4f8fc] text-[#153a63] hover:bg-[#e3eef8] transition"
          >
            {sample}
          </button>
        ))}
      </div>

      {result && (
        <div
          role="region"
          aria-live="polite"
          className="mt-5 rounded-xl border border-[#b4cae0] bg-[#f8fbff] p-5 space-y-3"
        >
          {result.sensationalSignals.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-950">
              <strong className="font-mono uppercase text-[11px] block mb-1">
                Sinais de alarme linguístico detectados:
              </strong>
              <span>{result.sensationalSignals.join(" · ")}</span>
            </div>
          )}

          {result.matched && result.interpretation ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-[#0e2a4a] text-white font-bold">
                  {result.interpretation.classificationLabel}
                </span>
                <span className="text-[11px] font-mono text-[#153a63]">
                  {result.interpretation.reviewStatusLabel}
                </span>
              </div>

              <p className="text-base font-bold text-[#071a33]">{result.interpretation.summary}</p>
              <p className="text-sm text-[#153a63] leading-relaxed">{result.interpretation.explanation}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg bg-white border border-[#d5e4f1] p-3.5 text-xs">
                  <strong className="block text-[#0e2a4a] mb-1">O que pode ser dito com base no estudo:</strong>
                  <p className="text-slate-700">{result.interpretation.allowedConclusion}</p>
                </div>
                <div className="rounded-lg bg-rose-50/70 border border-rose-200 p-3.5 text-xs">
                  <strong className="block text-rose-900 mb-1">Bloqueios (o que NÃO concluir):</strong>
                  <ul className="list-disc pl-4 space-y-0.5 text-rose-950">
                    {result.interpretation.prohibitedExtrapolations.slice(0, 2).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
                {result.interpretation.evidence.map((ev) => (
                  <Link
                    key={ev.id}
                    href={ev.passportHref}
                    className="text-[#1e5486] font-bold underline hover:text-[#071a33]"
                  >
                    Ver ficha {ev.id} →
                  </Link>
                ))}
                {result.interpretation.comparison && (
                  <Link
                    href={result.interpretation.comparison.compareHref}
                    className="text-[#1e5486] font-bold underline hover:text-[#071a33]"
                  >
                    Abrir comparador responsável →
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-[#0e2a4a]">
              <p className="font-bold">Fora do acervo curado atual</p>
              <p className="text-xs text-slate-700">{result.outOfScopeReason}</p>
              <Link href="/evidencias" className="inline-block text-xs font-mono font-bold text-[#1e5486] underline">
                Explorar todas as fichas do acervo →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

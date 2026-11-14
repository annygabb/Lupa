"use client";

import { useEffect, useState, useTransition } from "react";
import { subscribeLiveInvalidations } from "@/lib/live/realtime-client";
import Link from "next/link";
import type { LiveSnapshot } from "@/lib/live/db";

const PHASE_LABELS: Record<string, { title: string; subtitle: string }> = {
  pre: {
    title: "1ª Rodada: Percepção Inicial",
    subtitle: "Selecione a alternativa que melhor reflete sua compreensão do estudo.",
  },
  reveal: {
    title: "Evidência em Discussão",
    subtitle: "O facilitador está apresentando a evidência no telão. Aguarde a 2ª rodada.",
  },
  post: {
    title: "2ª Rodada: Compreensão Equivalente",
    subtitle: "Nova questão equivalente formulada para avaliar fixação do conceito.",
  },
  closed: {
    title: "Sessão Concluída",
    subtitle: "Agradecemos sua participação coletiva na construção da evidência.",
  },
};

export function LiveParticipant({ code }: { code: string }) {
  const [data, setData] = useState<LiveSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState<"pre" | "post" | null>(null);
  const [chosen, setChosen] = useState<{ phase: "pre" | "post"; option: number } | null>(null);
  const [feedbackClarity, setFeedbackClarity] = useState<number>(5);
  const [feedbackUseful, setFeedbackUseful] = useState<number>(5);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [, startTransition] = useTransition();

  const normCode = code.toUpperCase();

  useEffect(() => {
    let active = true;

    const loadSnapshot = async () => {
      try {
        const response = await fetch(`/api/live/${normCode}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Sessão não encontrada ou temporariamente indisponível.");
        }
        const value = (await response.json()) as LiveSnapshot;
        if (active) {
          startTransition(() => {
            setData(value);
            setError("");
          });
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Falha ao carregar sessão.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadSnapshot();
    const timer = setInterval(() => void loadSnapshot(), 15000);
    const realtime = subscribeLiveInvalidations(normCode, () => void loadSnapshot());
    return () => {
      active = false;
      clearInterval(timer);
      realtime.disconnect();
    };
  }, [normCode]);

  const vote = async () => {
    if (!data || chosen === null || chosen.phase !== data.phase || !["pre", "post"].includes(data.phase) || busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/live/${normCode}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: data.phase, optionIndex: chosen.option }),
      });

      const result = (await response.json()) as { accepted?: boolean; reason?: string; error?: string };

      if (!response.ok) {
        if (result.reason === "ALREADY_VOTED") {
          throw new Error("Esta sessão já registrou seu voto nesta rodada.");
        }
        if (response.status === 409) {
          throw new Error("A rodada terminou ou o voto já foi computado.");
        }
        throw new Error(
          response.status === 429
            ? "Muitas tentativas. Aguarde alguns instantes."
            : "Não foi possível registrar a resposta."
        );
      }

      if (result.accepted) {
        setSubmitted(data.phase as "pre" | "post");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado ao registrar voto.");
    } finally {
      setBusy(false);
    }
  };

  const phase = data?.phase ?? "pre";
  const votedInThisPhase = phase === submitted;
  const phaseInfo = PHASE_LABELS[phase] || PHASE_LABELS.pre;

  // No pós-teste, se houver pergunta equivalente curada, exibe ela
  const questionText =
    phase === "post" && data?.postQuestion ? data.postQuestion.question : data?.question;
  const choicesList =
    phase === "post" && data?.postQuestion ? data.postQuestion.choices : data?.choices || [];

  return (
    <div className="lx">
      <div className="lx-main max-w-xl mx-auto">
        {/* Cabeçalho Mobile */}
        <header className="lx-head">
          <div className="flex items-center justify-between mb-2">
            <span className="lx-kicker m-0">LUPA Live · Sala {normCode}</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#153a63] text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ao Vivo
            </span>
          </div>
          <h1>{data?.title ?? "Investigação Coletiva"}</h1>
          <p className="lx-lead">{loading ? "Conectando à sessão…" : phaseInfo.subtitle}</p>
        </header>

        <div className="lx-cols" style={{ gridTemplateColumns: "1fr" }}>
          <section className="lx-panel">
            {error && (
              <div role="alert" className="lx-warning mb-4">
                {error}
              </div>
            )}

            {!data ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#0e2a4a] mb-4">
                  {loading ? "Localizando a sessão do evento..." : "Não encontramos uma sessão com este código."}
                </p>
                <Link href="/live" className="lx-button inline-block text-xs">
                  Digitar outro código
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-[#1e5486] font-bold">
                    {phaseInfo.title}
                  </span>
                  {votedInThisPhase && (
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      ✓ Voto Computado
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-[#071a33] mb-6 leading-relaxed">
                  {questionText}
                </h2>

                {/* Alternativas de Votação (Rodada Pré ou Pós) */}
                {(phase === "pre" || phase === "post") && (
                  <>
                    <div className="lx-list space-y-3" role="group" aria-label="Alternativas da questão">
                      {choicesList.map((choice, i) => {
                        const isSelected = chosen?.phase === phase && chosen.option === i;
                        return (
                          <button
                            key={i}
                            type="button"
                            className={`lx-choice w-full text-left p-4 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-[#153a63] text-white border-[#071a33] shadow-md ring-2 ring-[#3d78b0]"
                                : "bg-white text-[#0e2a4a] border-[#d5e4f1] hover:border-[#3d78b0]"
                            }`}
                            aria-pressed={isSelected}
                            disabled={votedInThisPhase || busy}
                            onClick={() => setChosen({ phase: data.phase as "pre" | "post", option: i })}
                          >
                            <span className="font-bold mr-2 text-sm">{String.fromCharCode(65 + i)}.</span>
                            <span className="text-sm leading-relaxed">{choice}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6">
                      <button
                        className="lx-button w-full py-3.5 text-base font-bold shadow-md"
                        type="button"
                        onClick={vote}
                        disabled={votedInThisPhase || busy || chosen === null || chosen.phase !== phase}
                      >
                        {busy
                          ? "Gravando anonimamente…"
                          : votedInThisPhase
                          ? "✓ Resposta Registrada nesta Rodada"
                          : "Confirmar e Enviar Resposta →"}
                      </button>
                    </div>

                    {votedInThisPhase && (
                      <div role="status" className="lx-science mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs">
                        <strong>Resposta confirmada.</strong> Seu voto foi registrado de forma atômica e pseudônima. Acompanhe a projeção dos totais agregados no telão da sala.
                      </div>
                    )}
                  </>
                )}

                {/* Fase de Revelação da Evidência */}
                {phase === "reveal" && (
                  <div className="lx-science p-5 rounded-2xl bg-[#eef4fa] border-2 border-[#3d78b0] text-[#0e2a4a]">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1e5486] font-bold mb-2">
                      <span>●</span> Revelação da Evidência Científica
                    </div>
                    <p className="text-sm leading-relaxed font-medium mb-3">
                      O apresentador está discutindo os dados no telão principal.
                    </p>
                    <p className="text-xs text-[#153a63] leading-relaxed">
                      Em breve será aberta uma segunda rodada com questão equivalente para consolidar o entendimento.
                    </p>
                  </div>
                )}

                {/* Fase de Encerramento & Feedback Opcional */}
                {phase === "closed" && (
                  <div className="space-y-4">
                    <div className="lx-science p-5 rounded-xl bg-[#eef4fa] border border-[#d5e4f1]">
                      <h3 className="font-bold text-[#071a33] text-base mb-1">Sessão Finalizada</h3>
                      <p className="text-xs text-[#0e2a4a] leading-relaxed">
                        Obrigada por participar! A ciência ganha rigor quando confrontamos manchetes com as fontes originais.
                      </p>
                      <Link href="/relatos" className="lx-button lx-button--line mt-3 text-xs">
                        Reflexão voluntária sobre o uso e possíveis sintomas (somente local)
                      </Link>
                    </div>

                    {/* Formulário de Feedback Opcional */}
                    {!feedbackSent ? (
                      <div className="p-4 rounded-xl border border-[#d5e4f1] bg-white space-y-4">
                        <p className="text-xs font-bold text-[#071a33] uppercase font-mono">
                          Feedback Rápido da Experiência (Opcional)
                        </p>

                        <div>
                          <label className="text-xs text-[#0e2a4a] block mb-1">
                            Clareza da explicação (1 a 5 estrelas):
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFeedbackClarity(star)}
                                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold ${
                                  feedbackClarity >= star
                                    ? "bg-[#1e5486] text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {star}★
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-[#0e2a4a] block mb-1">
                            Utilidade do aprendizado (1 a 5 estrelas):
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFeedbackUseful(star)}
                                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold ${
                                  feedbackUseful >= star
                                    ? "bg-[#1e5486] text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {star}★
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="lx-button text-xs py-2 w-full"
                          onClick={() => setFeedbackSent(true)}
                        >
                          Pré-visualizar avaliação
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-300">
                        Prévia local: esta avaliação não foi enviada nem salva. A coleta persistente requer consentimento e proteção de dados.
                      </div>
                    )}
                  </div>
                )}

                {/* Nota de Privacidade & LGPD */}
                <div className="mt-8 pt-4 border-t border-[#d5e4f1] text-[11px] text-[#9dbedc] space-y-1">
                  <p className="font-semibold text-[#071a33]">Privacidade garantida por design:</p>
                  <p className="text-gray-500 leading-relaxed">
                    Não coletamos nome, e-mail, telefone, CPF nem dados clínicos. Um token temporário pseudônimo impede votos duplicados na mesma rodada.
                  </p>
                </div>

                <div className="mt-4 pt-2 flex justify-between items-center text-xs">
                  <Link href="/evidencias" className="text-[#1e5486] hover:underline font-medium">
                    Explorar os 50 Estudos Canônicos →
                  </Link>
                  <Link href="/" className="text-gray-500 hover:underline">
                    Início
                  </Link>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

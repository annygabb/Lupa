"use client";

import { useEffect, useState, useTransition } from "react";
import { subscribeLiveInvalidations } from "@/lib/live/realtime-client";
import Link from "next/link";
import { getCanonicalLiveUrl } from "@/lib/live/qr";
import type { LiveSnapshot } from "@/lib/live/db";
import { SCIENTIFIC_OBJECTIVES } from "@/lib/live/content";
import { liveErrorMessage, type LiveFailureKind } from "@/lib/live/public-snapshot";

const PHASE_LABELS: Record<string, { title: string; subtitle: string; badge: string }> = {
  pre: {
    title: "1ª Rodada: Percepção Inicial",
    subtitle: "Aponte a câmera do celular para votar. Sem cadastro ou dados pessoais.",
    badge: "Votação Aberta",
  },
  reveal: {
    title: "Revelação & Evidência Científica",
    subtitle: "Confrontando a percepção da plateia com a evidência em curadoria, sem revisão clínica independente.",
    badge: "Discussão Científica",
  },
  post: {
    title: "2ª Rodada: Teste de Compreensão Equivalente",
    subtitle: "Nova questão equivalente para avaliar compreensão conceitual real.",
    badge: "2ª Votação Aberta",
  },
  closed: {
    title: "Sessão Concluída",
    subtitle: "Obrigada pela participação coletiva na construção do conhecimento aberto.",
    badge: "Finalizado",
  },
};

export function LivePresentation({ code }: { code: string }) {
  const [data, setData] = useState<LiveSnapshot | null>(null);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [failure, setFailure] = useState<LiveFailureKind | null>(null);
  const [qrState, setQrState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, startTransition] = useTransition();

  const canonicalUrl = typeof window !== "undefined"
    ? getCanonicalLiveUrl(code, window.location.origin)
    : `https://lupaa.vercel.app/live/${code}`;

  const qrPhase = data?.phase;
  const qrExpiresAt = data?.expiresAt;
  // Obtém o QR pela API, que valida se o evento existe e continua ativo.
  useEffect(() => {
    if (!qrPhase || qrPhase === "closed" || !qrExpiresAt || Date.parse(qrExpiresAt) <= Date.now()) return;
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) setQrState("loading"); });
    fetch("/api/live/" + code + "/qr", { cache: "no-store", signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("QR indisponível para esta sessão.");
        return response.text();
      })
      .then(svg => { if (!controller.signal.aborted) { setQrSvg(svg); setQrState("ready"); } })
      .catch(() => { if (!controller.signal.aborted) { setQrSvg(""); setQrState("error"); } });
    return () => controller.abort();
  }, [code, qrPhase, qrExpiresAt]);

  // Atualização em tempo real (polling curto com cabeçalho de apresentação)
  useEffect(() => {
    let active = true;

    const loadSnapshot = async () => {
      try {
        const res = await fetch(`/api/live/${code}`, {
          cache: "no-store",
          
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          const info = liveErrorMessage(res.status, body.error);
          if (active) {
            setFailure(info.kind);
            setError(info.message);
            if (info.kind === "not-found" || info.kind === "invalid" || info.kind === "unconfigured") {
              setData(null);
              setQrSvg("");
            }
          }
          return;
        }

        const snapshot = (await res.json()) as LiveSnapshot;
        if (active) {
          startTransition(() => {
            setData(snapshot);
            setError("");
            setFailure(null);
            setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
          });
        }
      } catch (err) {
        if (active) {
          setFailure("offline");
          setError(err instanceof Error && err.name !== "TypeError" ? err.message : "Sem conexão com o servidor. Tentando novamente…");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadSnapshot();
    const interval = setInterval(() => void loadSnapshot(), 15000);
    const realtime = subscribeLiveInvalidations(code, () => void loadSnapshot());

    return () => {
      active = false;
      clearInterval(interval);
      realtime.disconnect();
    };
  }, [code]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const phase = data?.phase ?? "pre";
  const qrActive = Boolean(data && data.phase !== "closed");
  const phaseInfo = PHASE_LABELS[phase] || PHASE_LABELS.pre;

  // Totais agregados
  const preCounts = Array.from({ length: 3 }, (_, i) =>
    data?.counts.filter((c) => c.phase === "pre" && c.optionIndex === i).reduce((sum, c) => sum + c.count, 0) ?? 0
  );
  const postCounts = Array.from({ length: 3 }, (_, i) =>
    data?.counts.filter((c) => c.phase === "post" && c.optionIndex === i).reduce((sum, c) => sum + c.count, 0) ?? 0
  );

  const totalPreVotes = preCounts.reduce((a, b) => a + b, 0);
  const totalPostVotes = postCounts.reduce((a, b) => a + b, 0);

  const showsPostQuestion = (phase === "post" || phase === "closed") && Boolean(data?.postQuestion);
  const currentQuestionText =
    showsPostQuestion ? data?.postQuestion?.question : data?.question;
  const currentChoices =
    showsPostQuestion ? data?.postQuestion?.choices ?? [] : data?.choices ?? [];
  const resultsReleased = phase === "reveal" || phase === "closed";
  const currentCorrectIndex =
    phase === "closed" && data?.postQuestion
      ? data.postQuestion.correctIndex
      : phase === "reveal" ? data?.correctIndex : undefined;
  const currentTotal = phase === "closed" ? totalPostVotes : totalPreVotes;
  const study = SCIENTIFIC_OBJECTIVES[data?.claimId ?? ""];

  return (
    <div className="min-h-screen bg-[#071a33] text-[#f6f8fa] flex flex-col font-sans select-none">
      {/* Barra de Topo do Telão */}
      <header className="px-8 py-5 border-b border-[#153a63] flex items-center justify-between bg-[#0e2a4a]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#3d78b0] flex items-center justify-center font-bold text-white tracking-widest text-sm bg-[#153a63]">
            LP
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest font-mono text-[#9dbedc]">
                MODO PROJEÇÃO / TELÃO
              </span>
              {data ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1e5486] text-[#eef4fa] border border-[#3d78b0]/60" data-testid="live-badge">
                  <span className={`w-2 h-2 rounded-full ${phase === "closed" ? "bg-gray-300" : "bg-emerald-400 animate-pulse"}`} aria-hidden="true" />
                  {phaseInfo.badge}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3b2a0e] text-amber-100 border border-amber-600/60" data-testid="live-badge">
                  <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
                  {loading ? "Conectando…" : failure === "unconfigured" ? "Live não configurado" : "Sem sessão ativa"}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {data?.title ?? "LUPA Live — Investigação Coletiva"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs text-[#9dbedc]">
          {lastUpdate && (
            <span className="hidden sm:inline">
              Atualizado: <span className="text-white">{lastUpdate}</span>
            </span>
          )}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded border border-[#3d78b0] hover:bg-[#1e5486] text-white transition text-xs font-sans"
          >
            {isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia (F11)"}
          </button>
          <Link
            href="/live/organizador"
            className="px-3 py-1.5 rounded bg-[#1e5486] hover:bg-[#3d78b0] text-white transition text-xs font-sans font-medium"
          >
            Painel do Organizador
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal do Telão */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-[1920px] mx-auto w-full">
        {/* Coluna da Esquerda: QR Code Gigante & Acesso */}
        <div className="lg:col-span-4 bg-[#0e2a4a]/60 rounded-3xl p-8 border border-[#1e5486]/60 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-sm">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-medium text-[#9dbedc] bg-[#153a63] border border-[#3d78b0]/40 mb-4">
            ACESSO IMEDIATO PELO CELULAR
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-5 rounded-2xl shadow-2xl w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center overflow-hidden border-4 border-[#3d78b0]">
            {qrActive && qrSvg ? (
              <div
                className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="text-[#071a33] font-mono text-sm text-center px-2" role="status">
                {!data
                  ? (loading ? "Conectando à sessão…" : "QR indisponível: não há sessão ativa com este código.")
                  : data.phase === "closed" ? "Sessão encerrada — QR desativado."
                  : qrState === "error" ? "Não foi possível gerar o QR. Use o endereço abaixo."
                  : <span className="animate-pulse">Gerando QR Code…</span>}
              </div>
            )}
          </div>

          <div className="mt-6 w-full">
            <p className="text-sm text-[#9dbedc] mb-1">Ou acesse no navegador:</p>
            <p className="font-mono text-lg font-bold text-white bg-[#071a33] py-2 px-4 rounded-xl border border-[#1e5486] select-all break-all">
              {qrActive ? canonicalUrl : data ? "Sessão encerrada" : "Sem sessão ativa"}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-[#9dbedc] uppercase tracking-wider font-mono">
              Código da Sessão:
            </span>
            <span className="font-mono text-xl font-extrabold text-[#d5e4f1] tracking-widest bg-[#153a63] px-3 py-1 rounded-lg border border-[#3d78b0]/60">
              {code}
            </span>
          </div>

          <div className="mt-6 text-xs text-[#9dbedc]/80 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Sessão pseudonimizada · Voto único por sessão · Sem dados clínicos
          </div>
        </div>

        {/* Coluna da Direita: Pergunta em Destaque & Gráficos ao Vivo */}
        <div className="lg:col-span-8 flex flex-col justify-center gap-6">
          {error && (
            <div role="alert" className="p-4 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-200 text-sm">
              {error}
              {failure === "unconfigured" && (
                <> {" "}<Link href="/live/demo" className="underline text-white">Abrir a demonstração simulada</Link>.</>
              )}
            </div>
          )}

          {/* Card da Pergunta e Fase — só existe com um snapshot válido do servidor */}
          {!data ? (
            <div className="bg-[#0e2a4a]/70 rounded-3xl p-8 border border-[#1e5486] shadow-xl text-[#d5e4f1]">
              <p className="text-lg font-semibold text-white mb-2">
                {loading ? "Carregando a sessão…" : "Nenhuma votação em andamento."}
              </p>
              {!loading && (
                <p className="text-sm">
                  O telão só exibe pergunta, fase e resultados depois que o servidor confirma uma sessão ativa.
                </p>
              )}
            </div>
          ) : (
          <div className="bg-[#0e2a4a]/70 rounded-3xl p-8 border border-[#1e5486] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-semibold tracking-wider text-[#3d78b0] uppercase">
                {phaseInfo.title}
              </span>
              <span className="text-xs font-mono text-[#9dbedc]">
                Participações:{" "}
                <strong className="text-white text-base">
                  {resultsReleased ? currentTotal : "Ocultas durante a votação"}
                </strong>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-6">
              {loading ? "Carregando pergunta da sessão..." : currentQuestionText}
            </h2>

            {/* Alternativas e Barras de Votação */}
            <div className="space-y-4">
              {currentChoices.map((choice, i) => {
                const preVote = preCounts[i] || 0;
                const postVote = postCounts[i] || 0;
                const prePct = totalPreVotes > 0 ? Math.round((preVote / totalPreVotes) * 100) : 0;
                const postPct = totalPostVotes > 0 ? Math.round((postVote / totalPostVotes) * 100) : 0;

                const isCorrect = resultsReleased && currentCorrectIndex === i;

                return (
                  <div
                    key={i}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCorrect
                        ? "bg-[#153a63]/90 border-emerald-400 ring-2 ring-emerald-500/40"
                        : "bg-[#071a33]/80 border-[#1e5486]/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#1e5486] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-base sm:text-lg font-medium text-[#eef4fa] leading-relaxed">
                          {choice}
                        </span>
                      </div>

                      {/* Exibição de Percentuais (Ocultos no pré para não enviesar) */}
                      {resultsReleased && (
                        <div className="text-right shrink-0">
                          <span className="text-xl font-extrabold text-white font-mono">
                            {phase === "closed" ? `${postPct}%` : `${prePct}%`}
                          </span>
                          <span className="block text-xs text-[#9dbedc] font-mono">
                            {(() => { const n = phase === "closed" ? postVote : preVote; return `${n} ${n === 1 ? "voto" : "votos"}`; })()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Barra de Progresso Visual */}
                    {phase !== "pre" && (
                      <div className="w-full bg-[#0e2a4a] h-3 rounded-full overflow-hidden mt-3 p-0.5 border border-[#1e5486]">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isCorrect ? "bg-emerald-400" : "bg-[#3d78b0]"
                          }`}
                          style={{
                            width: `${phase === "closed" ? postPct : prePct}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Aviso Durante Votação Pré */}
            {(phase === "pre" || phase === "post") && (
              <div className="mt-6 p-4 rounded-xl bg-[#071a33]/90 border border-[#3d78b0]/40 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-[#d5e4f1]">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <span>
                    Os votos são computados por sessão. A distribuição será revelada após a etapa.
                  </span>
                </div>
                <div className="text-xs font-mono text-[#9dbedc]">
                  Aguardando liberação dos resultados
                </div>
              </div>
            )}

            {/* Card de Revelação Científica */}
            {resultsReleased && (
              <div className="mt-6 p-6 rounded-2xl bg-[#153a63]/80 border-2 border-[#3d78b0] text-[#eef4fa]">
                <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Evidência científica em curadoria
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-[#f6f8fa] mb-3">
                  <strong>Interpretação correta: </strong>
                  {currentCorrectIndex !== undefined ? currentChoices[currentCorrectIndex] : "Consulte a fonte e os limites."}
                </p>
                <div className="text-xs text-[#9dbedc] flex flex-wrap gap-4 pt-3 border-t border-[#1e5486]">
                  {study ? (
                    <>
                      <span>Referência: <strong>{study.evidenceId ?? "Registro em curadoria"}</strong></span>
                      {study.evidenceUrl && (
                        <a href={study.evidenceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                          Consultar fonte
                        </a>
                      )}
                      <span>Limitação: <strong>{study.limitation ?? "A análise não equivale à validação clínica independente."}</strong></span>
                    </>
                  ) : (
                    <span>Sem fonte confirmada nesta sessão; consulte o acervo.</span>
                  )}
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </main>
    </div>
  );
}

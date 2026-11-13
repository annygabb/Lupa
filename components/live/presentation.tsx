"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { generateQrSvg, getCanonicalLiveUrl } from "@/lib/live/qr";
import type { LiveSnapshot } from "@/lib/live/db";

const PHASE_LABELS: Record<string, { title: string; subtitle: string; badge: string }> = {
  pre: {
    title: "1ª Rodada: Percepção Inicial",
    subtitle: "Aponte a câmera do celular para votar. Sem cadastro ou dados pessoais.",
    badge: "Votação Aberta",
  },
  reveal: {
    title: "Revelação & Evidência Científica",
    subtitle: "Confrontando a percepção da plateia com a evidência canônica revisada.",
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
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, startTransition] = useTransition();

  const canonicalUrl = typeof window !== "undefined"
    ? getCanonicalLiveUrl(code, window.location.origin)
    : `https://lupaa.vercel.app/live/${code}`;

  // Gera o QR Code SVG na montagem do componente
  useEffect(() => {
    generateQrSvg(canonicalUrl, {
      margin: 2,
      darkColor: "#071a33",
      lightColor: "#ffffff",
    })
      .then(setQrSvg)
      .catch(() => {});
  }, [canonicalUrl]);

  // Atualização em tempo real (polling curto com cabeçalho de apresentação)
  useEffect(() => {
    let active = true;

    const loadSnapshot = async () => {
      try {
        const res = await fetch(`/api/live/${code}`, {
          cache: "no-store",
          headers: { "x-lupa-view": "presentation" },
        });

        if (!res.ok) {
          throw new Error("Sessão não encontrada ou indisponível.");
        }

        const snapshot = (await res.json()) as LiveSnapshot;
        if (active) {
          startTransition(() => {
            setData(snapshot);
            setError("");
            setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
          });
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Erro de conexão.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadSnapshot();
    const interval = setInterval(() => void loadSnapshot(), 2500);

    return () => {
      active = false;
      clearInterval(interval);
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
  const maxPre = Math.max(1, ...preCounts);
  const maxPost = Math.max(1, ...postCounts);

  const currentQuestionText =
    phase === "post" && data?.postQuestion ? data.postQuestion.question : data?.question;
  const currentChoices =
    phase === "post" && data?.postQuestion ? data.postQuestion.choices : data?.choices || [];

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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1e5486] text-[#eef4fa] border border-[#3d78b0]/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {phaseInfo.badge}
              </span>
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
            {qrSvg ? (
              <div
                className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="text-[#071a33] font-mono text-sm animate-pulse">
                Gerando QR Code...
              </div>
            )}
          </div>

          <div className="mt-6 w-full">
            <p className="text-sm text-[#9dbedc] mb-1">Ou acesse no navegador:</p>
            <p className="font-mono text-lg font-bold text-white bg-[#071a33] py-2 px-4 rounded-xl border border-[#1e5486] select-all break-all">
              {canonicalUrl}
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
            100% anônimo · Voto atômico · Sem coleta de dados pessoais
          </div>
        </div>

        {/* Coluna da Direita: Pergunta em Destaque & Gráficos ao Vivo */}
        <div className="lg:col-span-8 flex flex-col justify-center gap-6">
          {error && (
            <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-200 text-sm">
              {error}
            </div>
          )}

          {/* Card da Pergunta e Fase */}
          <div className="bg-[#0e2a4a]/70 rounded-3xl p-8 border border-[#1e5486] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-semibold tracking-wider text-[#3d78b0] uppercase">
                {phaseInfo.title}
              </span>
              <span className="text-xs font-mono text-[#9dbedc]">
                Participações:{" "}
                <strong className="text-white text-base">
                  {phase === "post" ? totalPostVotes : totalPreVotes}
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

                const isCorrect = data?.correctIndex === i && phase !== "pre";

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
                      {phase !== "pre" && (
                        <div className="text-right shrink-0">
                          <span className="text-xl font-extrabold text-white font-mono">
                            {phase === "post" ? `${postPct}%` : `${prePct}%`}
                          </span>
                          <span className="block text-xs text-[#9dbedc] font-mono">
                            {phase === "post" ? `${postVote} votos` : `${preVote} votos`}
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
                            width: `${phase === "post" ? postPct : prePct}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Aviso Durante Votação Pré */}
            {phase === "pre" && (
              <div className="mt-6 p-4 rounded-xl bg-[#071a33]/90 border border-[#3d78b0]/40 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-[#d5e4f1]">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <span>
                    Votos estão sendo computados anonimamente. Os resultados serão revelados pelo facilitador.
                  </span>
                </div>
                <div className="text-xs font-mono text-[#9dbedc]">
                  Total recebido: <strong className="text-white text-sm">{totalPreVotes}</strong>
                </div>
              </div>
            )}

            {/* Card de Revelação Científica */}
            {phase !== "pre" && (
              <div className="mt-6 p-6 rounded-2xl bg-[#153a63]/80 border-2 border-[#3d78b0] text-[#eef4fa]">
                <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Evidência Canônica Validada
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-[#f6f8fa] mb-3">
                  <strong>Interpretação correta: </strong>
                  {data?.choices[data.correctIndex ?? 1]}
                </p>
                <div className="text-xs text-[#9dbedc] flex flex-wrap gap-4 pt-3 border-t border-[#1e5486]">
                  <span>Estudo de Referência: <strong>SURMOUNT-1 (DXA Substudy)</strong></span>
                  <span>PMID: <strong>39996356</strong></span>
                  <span>Limitação: <strong>DXA não mede força nem prediz sarcopenia clínica.</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

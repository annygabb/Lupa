"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { liveOptions, liveQuestion } from "@/lib/live/content";

type SandboxPhase = "pre" | "reveal" | "post" | "closed";

const PHASE_LABEL: Record<SandboxPhase, string> = {
  pre: "1 · Pré-teste aberto",
  reveal: "2 · Revelação da evidência",
  post: "3 · Pós-teste equivalente",
  closed: "4 · Comparativo Pré × Pós",
};

const NEXT_PHASE: Record<SandboxPhase, { next: SandboxPhase; label: string } | null> = {
  pre: { next: "reveal", label: "Encerrar Pré e Revelar Evidência →" },
  reveal: { next: "post", label: "Abrir 2ª Rodada (Pós-teste) →" },
  post: { next: "closed", label: "Encerrar simulação e comparar rodadas →" },
  closed: null,
};

/**
 * A demonstração começa SEM votos. Votos de "plateia" só aparecem quando o apresentador
 * clica em "+5 votos fictícios", e são distribuídos da MESMA forma no pré e no pós-teste:
 * a sandbox não embute nenhum ganho de aprendizagem. Qualquer diferença entre rodadas
 * vem dos cliques de quem está testando, não de um resultado medido.
 */
function initialAudienceVotes(): [number, number, number] {
  return [0, 0, 0];
}

const FICTITIOUS_PATTERNS: Array<[number, number, number]> = [[2, 2, 1], [1, 2, 2], [2, 1, 2]];

export function LiveDemoSandbox() {
  const options = liveOptions;
  const [claimId, setClaimId] = useState<string>(options[0]?.id ?? "massa-magra-nao-equivale-a-musculos");
  const detail = useMemo(() => liveQuestion(claimId) ?? liveQuestion(options[0].id)!, [claimId, options]);

  const [phase, setPhase] = useState<SandboxPhase>("pre");
  const [preCounts, setPreCounts] = useState<[number, number, number]>(() =>
    initialAudienceVotes()
  );
  const [postCounts, setPostCounts] = useState<[number, number, number]>([0, 0, 0]);
  const [myPreVote, setMyPreVote] = useState<number | null>(null);
  const [myPostVote, setMyPostVote] = useState<number | null>(null);
  const [clarity, setClarity] = useState<number | null>(null);
  const [qrSvg, setQrSvg] = useState<string>("");

  useEffect(() => {
    const target = typeof window !== "undefined" ? `${window.location.origin}/live/demo` : "https://lupaa.vercel.app/live/demo";
    QRCode.toString(target, { type: "svg", margin: 1, width: 160, color: { dark: "#071a33", light: "#ffffff" } })
      .then(setQrSvg)
      .catch(() => setQrSvg(""));
  }, []);

  const resetSandbox = (nextClaimId = claimId) => {
    const q = liveQuestion(nextClaimId) ?? detail;
    setClaimId(q.claimId);
    setPhase("pre");
    setPreCounts(initialAudienceVotes());
    setPostCounts([0, 0, 0]);
    setMyPreVote(null);
    setMyPostVote(null);
    setClarity(null);
  };

  const handleMobileVote = (idx: number) => {
    if (phase === "pre" && myPreVote === null) {
      setMyPreVote(idx);
      setPreCounts((prev) => {
        const next: [number, number, number] = [...prev];
        next[idx] += 1;
        return next;
      });
    } else if (phase === "post" && myPostVote === null) {
      setMyPostVote(idx);
      setPostCounts((prev) => {
        const next: [number, number, number] = [...prev];
        next[idx] += 1;
        return next;
      });
    }
  };

  const [burstIndex, setBurstIndex] = useState(0);
  const simulateAudienceBurst = () => {
    const pattern = FICTITIOUS_PATTERNS[burstIndex % FICTITIOUS_PATTERNS.length];
    setBurstIndex(i => i + 1);
    const add = (prev: [number, number, number]): [number, number, number] =>
      [prev[0] + pattern[0], prev[1] + pattern[1], prev[2] + pattern[2]];
    if (phase === "pre") setPreCounts(add);
    else if (phase === "post") setPostCounts(add);
  };

  const advancePhase = () => {
    const transition = NEXT_PHASE[phase];
    if (!transition) return;
    setPhase(transition.next);
  };

  const totalPre = preCounts.reduce((a, b) => a + b, 0);
  const totalPost = postCounts.reduce((a, b) => a + b, 0);
  const preAcc = totalPre > 0 ? Math.round((preCounts[detail.correctIndex] / totalPre) * 100) : 0;
  const postCorrectIdx = detail.postQuestion?.correctIndex ?? detail.correctIndex;
  const postAcc = totalPost > 0 ? Math.round((postCounts[postCorrectIdx] / totalPost) * 100) : 0;
  const delta = postAcc - preAcc;

  const activeChoices = phase === "post" && detail.postQuestion ? detail.postQuestion.choices : detail.choices;
  const activeQuestion = phase === "post" && detail.postQuestion ? detail.postQuestion.question : detail.question;

  return (
    <div className="lx">
      <div className="lx-main space-y-6">
        <header className="lx-head">
          <p className="lx-kicker">Sandbox Interativo · Sem Login · Sem Dependência Externa</p>
          <h1>LUPA Live: Palco e Celular lado a lado.</h1>
          <p className="lx-lead">
            Veja como funciona uma sessão: vote no celular simulado à direita, avance as fases como apresentador e
            observe o telão. Tudo acontece só no seu navegador.
          </p>
        </header>

        <div className="lx-warning" role="note" data-testid="sandbox-disclaimer">
          <strong>Simulação com dados fictícios.</strong> Nenhum voto desta página vem de pessoas reais nem é salvo.
          Os botões “+5 votos fictícios” distribuem votos igualmente entre as alternativas no pré e no pós-teste;
          a comparação final é ilustrativa e <strong>não é um resultado de aprendizagem medido</strong>.
        </div>

        {/* Barra de controle do Apresentador */}
        <section className="lx-panel" aria-label="Controles do apresentador">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <label className="lx-field flex-1 mb-0">
              Objetivo científico da sessão
              <select value={claimId} onChange={(e) => resetSandbox(e.target.value)}>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              {NEXT_PHASE[phase] && (
                <button type="button" className="lx-button" onClick={advancePhase}>
                  {NEXT_PHASE[phase]!.label}
                </button>
              )}
              {(phase === "pre" || phase === "post") && (
                <button type="button" className="lx-button lx-button--line" onClick={simulateAudienceBurst}>
                  +5 votos fictícios
                </button>
              )}
              <button type="button" className="lx-button lx-button--line" onClick={() => resetSandbox(claimId)}>
                Reiniciar demo
              </button>
            </div>
          </div>
        </section>

        {/* Grid Tela Dividida: Telão (Esquerda) + Celular Simulado (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ESQUERDA: MODO TELÃO */}
          <section
            className="lg:col-span-7 rounded-2xl bg-[#071a33] text-white p-6 sm:p-8 shadow-xl border border-[#1e5486]"
            aria-label="Telão de auditório simulado"
          >
            <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/15">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-sky-300">
                  {PHASE_LABEL[phase]}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">{detail.title}</h2>
              </div>
              {qrSvg && (
                <div
                  className="w-20 h-20 bg-white p-1.5 rounded-lg shrink-0 [&>svg]:w-full [&>svg]:h-full"
                  aria-label="QR Code ilustrativo da sessão"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              )}
            </div>

            <p className="text-base sm:text-lg font-medium text-sky-50 mb-6 leading-snug">{activeQuestion}</p>

            {/* Placar do Telão respeitando privacidade por fase */}
            {phase === "pre" && (
              <div className="rounded-xl bg-white/5 border border-white/15 p-5 text-center space-y-2">
                <p className="text-2xl font-mono font-bold text-sky-300">{totalPre} votos recebidos</p>
                <p className="text-xs text-sky-100/80">
                  O placar permanece oculto durante a votação aberta para evitar viés de conformidade na plateia.
                </p>
              </div>
            )}

            {phase === "reveal" && (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  {detail.choices.map((c, i) => {
                    const count = preCounts[i];
                    const pct = totalPre > 0 ? Math.round((count / totalPre) * 100) : 0;
                    const isRight = i === detail.correctIndex;
                    return (
                      <div key={c} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={isRight ? "font-bold text-emerald-300" : "text-sky-100"}>
                            {String.fromCharCode(65 + i)}. {c} {isRight ? "✓" : ""}
                          </span>
                          <span className="font-mono font-bold">{pct}% ({count})</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${isRight ? "bg-emerald-400" : "bg-sky-400/70"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-xl bg-sky-950/70 border border-sky-400/30 p-4 text-xs text-sky-100 space-y-1">
                  <strong className="text-sky-300 uppercase font-mono">O que o estudo realmente mostrou:</strong>
                  <p>{detail.explanation}</p>
                  {detail.limitation && <p className="text-sky-200/80 pt-1">Limite: {detail.limitation}</p>}
                </div>
              </div>
            )}

            {phase === "post" && (
              <div className="rounded-xl bg-white/5 border border-white/15 p-5 text-center space-y-2">
                <p className="text-2xl font-mono font-bold text-emerald-300">{totalPost} votos no pós-teste</p>
                <p className="text-xs text-sky-100/80">
                  Alternativas do pós-teste abertas nos celulares. Encerre a rodada para revelar o comparativo Pré × Pós.
                </p>
              </div>
            )}

            {phase === "closed" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                    <span className="block text-[11px] font-mono text-sky-200">Acerto pré (fictício)</span>
                    <strong className="text-2xl font-mono text-white">{preAcc}%</strong>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                    <span className="block text-[11px] font-mono text-sky-200">Acerto pós (fictício)</span>
                    <strong className="text-2xl font-mono text-emerald-300">{postAcc}%</strong>
                  </div>
                  <div className="rounded-xl bg-emerald-500/20 p-3 border border-emerald-400/40">
                    <span className="block text-[11px] font-mono text-emerald-200">Diferença ilustrativa</span>
                    <strong className="text-2xl font-mono text-emerald-300">
                      {delta >= 0 ? `+${delta}` : delta} p.p.
                    </strong>
                  </div>
                </div>
                <p className="text-xs text-amber-200" data-testid="sandbox-result-disclaimer">
                  Exemplo ilustrativo com votos fictícios desta simulação ({totalPre} no pré, {totalPost} no pós).
                  Não indica eficácia educacional. Resultados reais exigem uma sessão com participantes e o protocolo de validação.
                </p>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-xs text-sky-100 space-y-1">
                  <strong className="text-emerald-300 uppercase font-mono">Síntese da rodada:</strong>
                  <p>{detail.postQuestion?.explanation ?? detail.explanation}</p>
                </div>
              </div>
            )}
          </section>

          {/* DIREITA: SMARTPHONE SIMULADO DO PARTICIPANTE */}
          <section
            className="lg:col-span-5 mx-auto w-full max-w-sm rounded-[2rem] border-4 border-[#0e2a4a] bg-[#f8fbff] p-5 shadow-xl"
            aria-label="Celular simulado do participante"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-[#153a63] pb-3 mb-4 border-b border-[#d5e4f1]">
              <span>Celular do Participante</span>
              <span className="px-2 py-0.5 rounded bg-[#e3eef8] font-bold">SANDBOX</span>
            </div>

            {(phase === "pre" || phase === "post") && (
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase text-[#1e5486]">
                  {phase === "pre" ? "Rodada 1 · Seu palpite inicial" : "Rodada 2 · Após ver a evidência"}
                </p>
                <p className="text-sm font-bold text-[#071a33] leading-snug">{activeQuestion}</p>
                <div className="space-y-2 pt-1">
                  {activeChoices.map((choice, idx) => {
                    const votedIdx = phase === "pre" ? myPreVote : myPostVote;
                    const isMine = votedIdx === idx;
                    return (
                      <button
                        key={choice}
                        type="button"
                        disabled={votedIdx !== null}
                        onClick={() => handleMobileVote(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                          isMine
                            ? "bg-[#153a63] text-white border-[#071a33] font-bold"
                            : votedIdx !== null
                              ? "bg-white/60 text-slate-500 border-slate-200 cursor-not-allowed"
                              : "bg-white text-[#071a33] border-[#cad9e8] hover:border-[#1e5486] hover:bg-[#eef4fa]"
                        }`}
                      >
                        <span className="font-mono font-bold mr-1.5">{String.fromCharCode(65 + idx)}.</span>
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {(phase === "pre" ? myPreVote : myPostVote) !== null && (
                  <p role="status" className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                    Voto registrado anonimamente nesta rodada! Avance a fase no painel acima para continuar.
                  </p>
                )}
              </div>
            )}

            {phase === "reveal" && (
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase text-[#1e5486]">Evidência revelada no telão</p>
                <div className="p-3.5 rounded-xl bg-white border border-[#cad9e8] text-xs text-[#0e2a4a] space-y-2">
                  <p className="font-bold">Gabarito: alternativa {String.fromCharCode(65 + detail.correctIndex)}</p>
                  <p>{detail.explanation}</p>
                </div>
                <p className="text-xs text-slate-600">
                  Aguarde o apresentador abrir o Pós-teste para medir o quanto a leitura mudou a compreensão.
                </p>
              </div>
            )}

            {phase === "closed" && (
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase text-[#1e5486]">Sessão encerrada · Avaliação opcional</p>
                <p className="text-xs text-[#0e2a4a]">
                  O quanto esta demonstração ajudou a esclarecer os limites científicos?
                </p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setClarity(n)}
                      className={`flex-1 py-2 rounded-lg border font-mono text-xs font-bold ${
                        clarity === n
                          ? "bg-[#153a63] text-white border-[#071a33]"
                          : "bg-white text-[#153a63] border-[#cad9e8]"
                      }`}
                    >
                      {n}★
                    </button>
                  ))}
                </div>
                {clarity !== null && (
                  <p role="status" className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                    Avaliação ({clarity}/5) registrada localmente no sandbox.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/live" className="lx-button lx-button--line">
            ← Voltar ao LUPA Live
          </Link>
          <Link href="/live/organizador" className="lx-button lx-button--line">
            Painel Institucional (com Login)
          </Link>
        </div>
      </div>
    </div>
  );
}

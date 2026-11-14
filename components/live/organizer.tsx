"use client";

import { useEffect, useState, useTransition } from "react";
import { subscribeLiveInvalidations } from "@/lib/live/realtime-client";
import Link from "next/link";
import { liveOptions, SCIENTIFIC_OBJECTIVES } from "@/lib/live/content";
import { generateQrSvg, getCanonicalLiveUrl } from "@/lib/live/qr";
import type { LiveSnapshot } from "@/lib/live/db";


const PHASE_LABELS: Record<string, string> = {
  pre: "1ª Rodada (Pré-Teste)",
  reveal: "Revelação Científica",
  post: "2ª Rodada (Pós-Teste Equivalente)",
  closed: "Sessão Encerrada",
};

const NEXT_PHASE: Record<string, "reveal" | "post" | "closed"> = {
  pre: "reveal",
  reveal: "post",
  post: "closed",
};

const NEXT_PHASE_ACTION: Record<string, string> = {
  pre: "Revelar Evidência & Gabarito",
  reveal: "Abrir 2ª Rodada (Pós-Teste)",
  post: "Encerrar Sessão",
};

export function LiveOrganizer() {
  const [organizations, setOrganizations] = useState<Array<{ id:string; name:string; role:string }>>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [claimId, setClaimId] = useState(liveOptions[0]?.id ?? "massa-magra-nao-equivale-a-musculos");
  const [code, setCode] = useState("");
  const [data, setData] = useState<LiveSnapshot | null>(null);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [feedbackSummary,setFeedbackSummary]=useState<{
    total:number; suppressed:boolean; averageClarity:number|null; averageUsefulness:number|null
  }|null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const canonicalUrl = typeof window !== "undefined"
    ? getCanonicalLiveUrl(code, window.location.origin)
    : `https://lupaa.vercel.app/live/${code}`;

  // Membership is fetched from the server; organization never grants itself a role.
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/me", {cache:"no-store"});
        if (!res.ok) { if(active)setAuthenticated(false); return; }
        const data = await res.json() as {organizations?:Array<{id:string;name:string;role:string}>};
        const allowed=(data.organizations||[]).filter(o=>["owner","admin","organizer"].includes(o.role));
        if(active){
          setOrganizations(allowed);
          setOrganizationId(allowed[0]?.id||"");
          setAuthenticated(true);
        }
        const e=await fetch("/api/live",{cache:"no-store"});
        if(e.ok){const events=(await e.json()) as {events?:Array<{code:string}>};
          if(active&&events.events?.[0]?.code)setCode(events.events[0].code);
        }
      } catch { if(active)setError("Não foi possível verificar a conta institucional."); }
      finally {if(active)setAuthLoading(false);}
    })();
    return ()=>{active=false;};
  }, []);

  // Atualização do QR Code quando o código mudar
  useEffect(() => {
    if (!code) return;
    generateQrSvg(canonicalUrl, {
      margin: 2,
      darkColor: "#071a33",
      lightColor: "#ffffff",
    })
      .then(setQrSvg)
      .catch(() => {});
  }, [code, canonicalUrl]);

  // Atualização em tempo real do snapshot da sessão
  useEffect(() => {
    if (!code) return;
    let active = true;

    const loadSnapshot = async () => {
      try {
        const res = await fetch(`/api/live/${code}/admin`, {
          cache: "no-store",
          credentials:"same-origin",
        });
        if (!res.ok) throw new Error("Falha ao atualizar painel.");
        const d = (await res.json()) as LiveSnapshot;
        if (active) {
          startTransition(() => {
            setData(d);
          });
          if(d.phase==="closed"){
            const feedback=await fetch(`/api/live/${code}/feedback-summary`,{cache:"no-store"});
            if(feedback.ok && active)
              setFeedbackSummary(await feedback.json() as typeof feedbackSummary);
          }else if(active)setFeedbackSummary(null);
        }
      } catch {
        if (active) setNote("Atualização em espera (verifique conexão).");
      }
    };

    void loadSnapshot();
    const timer = setInterval(() => void loadSnapshot(), 15000);
    const realtime = subscribeLiveInvalidations(code, () => void loadSnapshot());
    return () => {
      active = false;
      clearInterval(timer);
      realtime.disconnect();
    };
  }, [code]);

  const createSession = async () => {
    setBusy(true);
    setError("");
    setNote("");
    try {
      const res = await fetch("/api/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimId, organizationId }),
      });

      const resData = (await res.json()) as { code?: string; error?: string; message?: string };
      if (!res.ok) {
        throw new Error(resData.message || "Falha ao criar sessão. Verifique seu login e a organização selecionada.");
      }

      if (resData.code) {
        setCode(resData.code);
        setNote("Sessão criada com sucesso! Abra o Modo Telão ou projete o QR Code para a plateia.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao criar evento.");
    } finally {
      setBusy(false);
    }
  };

  const advancePhase = async () => {
    if (!data || busy || !NEXT_PHASE[data.phase]) return;
    setBusy(true);
    setError("");
    try {
      const next = NEXT_PHASE[data.phase];
      const res = await fetch(`/api/live/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: next }),
      });

      if (!res.ok) throw new Error("Não foi possível avançar para a próxima fase.");
      const updated = await fetch(`/api/live/${code}/admin`, {
        cache: "no-store",
        credentials:"same-origin",
      });
      if (updated.ok) setData((await updated.json()) as LiveSnapshot);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao mudar de fase.");
    } finally {
      setBusy(false);
    }
  };

  const removeSession = async () => {
    if (!code || busy || !window.confirm("Excluir permanentemente esta sessão e todos os votos coletados?")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/live/${code}`, {
        method: "DELETE",
        credentials:"same-origin",
      });
      if (!res.ok) throw new Error("Não foi possível excluir a sessão.");
      setCode("");
      setData(null);
      setNote("Sessão e votos excluídos com sucesso.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro na exclusão.");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(canonicalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadQrSvg = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml;charset=utf-8" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `lupa-qr-${code}.svg`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const exportReport = () => {
    if (!data) return;
    const preV = [0, 1, 2].map((i) =>
      data.counts.filter((c) => c.phase === "pre" && c.optionIndex === i).reduce((a, b) => a + b.count, 0)
    );
    const postV = [0, 1, 2].map((i) =>
      data.counts.filter((c) => c.phase === "post" && c.optionIndex === i).reduce((a, b) => a + b.count, 0)
    );

    const md = `# Relatório de Sessão LUPA Live
- **Código:** ${data.code}
- **Título:** ${data.title}
- **Fase Final:** ${data.phase}
- **Data:** ${new Date().toLocaleString("pt-BR")}

## Questão Aplicada
${data.question}

### Alternativas & Resultados
${data.choices
  .map(
    (c, i) =>
      `- [${String.fromCharCode(65 + i)}] ${c}\n  - 1ª Rodada (Pré): ${preV[i]} votos\n  - 2ª Rodada (Pós): ${postV[i]} votos`
  )
  .join("\n")}

## Metodologia & Cautelas Estatísticas
- Votos coletados anonimamente por identificador efêmero pseudônimo.
- Não representa amostra populacional universal.
- Os resultados refletem a percepção pontual da audiência presente.
`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `relatorio-lupa-live-${data.code}.md`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const phase = data?.phase ?? "pre";
  const preTotals = [0, 1, 2].map(
    (i) => data?.counts.filter((c) => c.phase === "pre" && c.optionIndex === i).reduce((s, c) => s + c.count, 0) ?? 0
  );
  const postTotals = [0, 1, 2].map(
    (i) => data?.counts.filter((c) => c.phase === "post" && c.optionIndex === i).reduce((s, c) => s + c.count, 0) ?? 0
  );
  const maxV = Math.max(1, ...preTotals, ...postTotals);

  return (
    <div className="lx">
      <div className="lx-main">
        <header className="lx-head">
          <p className="lx-kicker">Cockpit do Organizador · PC Primeiro</p>
          <h1>Sua plateia participa. A ciência permanece verificável.</h1>
          <p className="lx-lead">
            Controle fases, projete o QR Code no telão e acompanhe dados agregados em tempo real sem expor respostas
            individuais.
          </p>
        </header>

        <div className="lx-cols">
          {/* Painel de Controle e Configuração */}
          <section className="lx-panel">
            <h2>Configuração do Evento</h2>

            {authLoading ? <p className="lx-muted">Verificando sua conta institucional…</p> :
              !authenticated ? <div className="lx-warning" role="alert">
                Acesso institucional necessário. <Link href="/login" className="underline">Entrar com minha conta</Link>
              </div> : (
                <div className="lx-inline mb-4">
                  <p className="lx-muted">Conectado ao painel autorizado.</p>
                  <button type="button" className="lx-button lx-button--line"
                    onClick={async()=>{
                      await fetch("/api/auth/session",{method:"DELETE"});
                      window.location.assign("/login");
                    }}>Sair</button>
                </div>
              )}
            {authenticated && organizations.length===0 && <p role="alert" className="lx-warning">Conta sem função de organizador. Solicite acesso institucional.</p>}
            <label className="lx-field">Organização autorizada
              <select value={organizationId} onChange={e=>setOrganizationId(e.target.value)} disabled={!authenticated}>
                <option value="">Selecione uma organização</option>
                {organizations.map(o=><option key={o.id} value={o.id}>{o.name} ({o.role})</option>)}
              </select>
            </label>

            <label className="lx-field">
              Objetivo Científico / Questão
              <select value={claimId} onChange={(e) => setClaimId(e.target.value)}>
                {liveOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </label>

            {/* Informações do Estudo Selecionado */}
            {SCIENTIFIC_OBJECTIVES[claimId] && (
              <div className="p-3 bg-[#eef4fa] rounded-lg text-xs text-[#0e2a4a] mb-4 border border-[#d5e4f1]">
                <strong>Evidência canônica: </strong>
                {SCIENTIFIC_OBJECTIVES[claimId].evidenceId} · {SCIENTIFIC_OBJECTIVES[claimId].limitation}
              </div>
            )}

            <button
              className="lx-button"
              type="button"
              disabled={busy || !authenticated || !organizationId}
              onClick={createSession}
            >
              {busy ? "Criando sessão…" : "Criar Nova Sessão Live"}
            </button>

            {error && (
              <p role="alert" className="lx-warning mt-3">
                {error}
              </p>
            )}
            {note && (
              <p role="status" className="lx-science mt-3">
                {note}
              </p>
            )}

            {/* Informações da Sessão Ativa & QR Code */}
            {code && (
              <div className="lx-science mt-5 p-4 rounded-xl border border-[#3d78b0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-mono text-[#153a63]">Sessão Ativa:</span>
                  <span className="font-mono font-bold text-lg text-[#071a33]">{code}</span>
                </div>

                {/* QR Code Preview */}
                <div className="my-3 flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border">
                  {qrSvg && (
                    <div
                      className="w-24 h-24 shrink-0 [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  )}
                  <div className="flex-1 text-xs space-y-2">
                    <p className="font-medium text-[#071a33]">QR Code pronto para a plateia.</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={copyLink}
                        className="px-2.5 py-1 bg-[#1e5486] text-white rounded font-mono text-[11px] hover:bg-[#153a63]"
                      >
                        {copied ? "✓ Copiado!" : "Copiar Link"}
                      </button>
                      <button
                        type="button"
                        onClick={downloadQrSvg}
                        className="px-2.5 py-1 border border-[#1e5486] text-[#1e5486] rounded font-mono text-[11px] hover:bg-[#eef4fa]"
                      >
                        Baixar SVG
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#d5e4f1] flex flex-col gap-2">
                  <Link
                    href={`/live/apresentacao/${code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lx-button text-center font-bold tracking-wide"
                    style={{ background: "#0e2a4a", color: "#ffffff" }}
                  >
                    Abrir Modo Telão (Projeção) ↗
                  </Link>

                  <Link
                    href={`/live/${code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-center text-[#1e5486] hover:underline"
                  >
                    Testar como participante no celular ↗
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Painel de Resultados Agregados & Avanço de Fase */}
          <section className="lx-panel">
            <h2>Cockpit da Sessão Ao Vivo</h2>

            {!data ? (
              <p>Crie uma sessão para acompanhar os votos. Não são exibidas estatísticas artificiais.</p>
            ) : (
              <>
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <p className="lx-kicker m-0">Fase Atual: {PHASE_LABELS[phase] || phase}</p>
                  <span className="text-xs font-mono text-[#153a63]">
                    1ª Rodada: <strong>{preTotals.reduce((a, b) => a + b, 0)}</strong> · 2ª Rodada:{" "}
                    <strong>{postTotals.reduce((a, b) => a + b, 0)}</strong>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#071a33] mb-4">
                  {phase === "post" && data.postQuestion ? data.postQuestion.question : data.question}
                </h3>

                {/* Tabela de Votos Comparativa */}
                <div className="lx-table-wrap mb-4">
                  <table className="lx-table">
                    <caption>Votação agregada sem identificadores pessoais</caption>
                    <thead>
                      <tr>
                        <th>Alternativa</th>
                        <th className="text-center">Antes (Pré)</th>
                        <th className="text-center">Depois (Pós)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.choices.map((choice, i) => (
                        <tr key={choice}>
                          <th>
                            {String.fromCharCode(65 + i)}. {choice}
                          </th>
                          <td className="text-center font-mono font-bold">{preTotals[i]}</td>
                          <td className="text-center font-mono font-bold text-[#1e5486]">{postTotals[i]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Gráficos de Barra Visual */}
                <div className="space-y-3 mb-6">
                  {data.choices.map((choice, i) => {
                    const pv = preTotals[i];
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs text-[#0e2a4a] mb-1">
                          <span>
                            {String.fromCharCode(65 + i)}: {choice.slice(0, 45)}...
                          </span>
                          <span className="font-mono">{pv} votos</span>
                        </div>
                        <div className="lx-bar">
                          <span style={{ width: `${(pv / maxV) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Controles de Avanço de Fase */}
                {NEXT_PHASE[phase] && (
                  <div className="p-4 bg-[#eef4fa] rounded-xl border border-[#d5e4f1] mb-4">
                    <p className="text-xs text-[#0e2a4a] font-medium mb-2">Próxima Etapa da Apresentação:</p>
                    <button
                      className="lx-button w-full"
                      type="button"
                      disabled={busy}
                      onClick={advancePhase}
                    >
                      {busy ? "Processando…" : `Avançar: ${NEXT_PHASE_ACTION[phase]}`}
                    </button>
                  </div>
                )}

                {/* Session feedback is optional. Small groups are suppressed. */}
                {phase==="closed" && <div className="lx-science mb-4">
                  <h3 className="font-bold mb-2">Avaliação educacional</h3>
                  {!feedbackSummary ? <p className="lx-muted">Dados da avaliação ainda indisponíveis.</p> :
                    <p>
                      {feedbackSummary.total} avaliação(ões).{" "}
                      {feedbackSummary.suppressed ? "Médias ocultadas para grupos com menos de cinco respostas." :
                      `Clareza: ${feedbackSummary.averageClarity}/5 · Utilidade: ${feedbackSummary.averageUsefulness}/5.`}
                    </p>}
                </div>}

                {/* Exportar e Excluir */}
                <div className="flex flex-wrap gap-3 pt-3 border-t">
                  <button
                    type="button"
                    className="lx-button lx-button--line text-xs"
                    onClick={exportReport}
                  >
                    Baixar Relatório (.md)
                  </button>
                  <button
                    type="button"
                    className="lx-button lx-button--line text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
                    disabled={busy}
                    onClick={removeSession}
                  >
                    Excluir Sessão & Votos
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

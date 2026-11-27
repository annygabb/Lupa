"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type LiveServiceStatus = "checking" | "ready" | "local-demo" | "unconfigured" | "unavailable" | "offline";

/** Consulta a prontidão REAL do LUPA Live (banco + Auth) em /api/live/health. */
export function useLiveServiceStatus(): LiveServiceStatus {
  const [status, setStatus] = useState<LiveServiceStatus>("checking");
  useEffect(() => {
    let active = true;
    fetch("/api/live/health", { cache: "no-store" })
      .then(async response => {
        const data = await response.json().catch(() => ({})) as { status?: string };
        if (!active) return;
        if (data.status === "ready") setStatus("ready");
        else if (data.status === "local-demo") setStatus("local-demo");
        else if (data.status === "unconfigured") setStatus("unconfigured");
        else setStatus("unavailable");
      })
      .catch(() => { if (active) setStatus("offline"); });
    return () => { active = false; };
  }, []);
  return status;
}

/** Aviso honesto sobre a disponibilidade do Live neste ambiente (nada é escondido). */
export function LiveServiceNotice({ status, context }: { status: LiveServiceStatus; context: "join" | "organizer" | "login" }) {
  if (status === "checking" || status === "ready") return null;
  if (status === "local-demo") {
    return (
      <div className="lx-science mb-4" role="status" data-testid="live-service-notice">
        <strong>Modo de demonstração local.</strong> As sessões ficam só na memória deste servidor de
        desenvolvimento e são apagadas ao reiniciá-lo. Não use para eventos reais.
      </div>
    );
  }
  const reason = status === "unconfigured"
    ? "O banco de dados e a autenticação do LUPA Live ainda não foram configurados neste ambiente."
    : status === "offline"
      ? "Não foi possível falar com o servidor. Verifique sua conexão."
      : "O serviço do LUPA Live está temporariamente indisponível.";
  const action = context === "join"
    ? "Sessões reais não podem ser abertas agora."
    : context === "organizer"
      ? "Não é possível criar sessões nem entrar no painel até a configuração ser concluída."
      : "O login institucional não funciona até a configuração ser concluída.";
  return (
    <div className="lx-warning mb-4" role="alert" data-testid="live-service-notice">
      <strong>LUPA Live indisponível neste ambiente.</strong> {reason} {action}{" "}
      Para conhecer o fluxo, use a <Link href="/live/demo" className="underline">demonstração simulada</Link>{" "}
      (dados fictícios, sem banco).
    </div>
  );
}

import type { LiveSnapshot } from "@/lib/live/db";

/**
 * Resposta pública (participante/telão): não revela a distribuição de uma rodada
 * enquanto ela está aberta. Pré → nenhuma contagem; revelação/pós → só a rodada pré;
 * encerrada → todas. O gabarito já vem omitido do banco até a revelação.
 */
export function toPublicSnapshot(snapshot: LiveSnapshot): LiveSnapshot {
  const counts =
    snapshot.phase === "pre" ? [] :
    snapshot.phase === "reveal" || snapshot.phase === "post"
      ? snapshot.counts.filter(c => c.phase === "pre")
      : snapshot.counts;
  const result: LiveSnapshot = { ...snapshot, counts };
  // A RPC do banco devolve null para campos ainda ocultos; a API pública os omite.
  if (result.correctIndex === null || result.correctIndex === undefined) delete result.correctIndex;
  if (result.postQuestion === null || result.postQuestion === undefined) delete result.postQuestion;
  return result;
}

/** Mensagens de erro da API do Live, compartilhadas pelas telas. */
export function liveErrorMessage(status: number, code?: string): { kind: LiveFailureKind; message: string } {
  if (code === "LIVE_UNCONFIGURED") return {
    kind: "unconfigured",
    message: "O LUPA Live não está configurado neste ambiente: o banco de dados das sessões ao vivo ainda não foi provisionado. Use a demonstração simulada em /live/demo.",
  };
  if (status === 404) return { kind: "not-found", message: "Não encontramos uma sessão com este código." };
  if (status === 400) return { kind: "invalid", message: "Código de sessão inválido. Confira os 12 caracteres informados pelo organizador." };
  if (status === 410) return { kind: "closed", message: "Esta sessão já foi encerrada." };
  if (status === 429) return { kind: "rate-limited", message: "Muitas tentativas a partir desta rede. Aguarde um minuto e tente novamente." };
  if (status === 401) return { kind: "unauthenticated", message: "Faça login com sua conta institucional." };
  if (status === 403) return { kind: "forbidden", message: "Sua conta não tem permissão para esta sessão." };
  return { kind: "unavailable", message: "O serviço do LUPA Live está temporariamente indisponível. Tentaremos novamente em instantes." };
}

export type LiveFailureKind =
  | "unconfigured" | "not-found" | "invalid" | "closed" | "rate-limited"
  | "unauthenticated" | "forbidden" | "unavailable" | "offline";

/**
 * Registro estruturado do servidor (uma linha JSON por evento), legível nos logs da Vercel.
 *
 * Regras de privacidade: NUNCA registrar e-mail, senha, token, cookie, IP em claro,
 * corpo de requisição ou dados de saúde. Registre só rota, código do erro, status,
 * código do evento Live (público) e o nome/mensagem técnica do erro.
 */
type Level = "info" | "warn" | "error";
type Fields = Record<string, string | number | boolean | null | undefined>;

const SENSITIVE = /(e-?mail|password|senha|token|cookie|authorization|secret|apikey|ip)$/i;

function emit(level: Level, event: string, fields: Fields) {
  if (process.env.LUPA_LOG_SILENT === "1") return;
  const safe: Fields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    safe[key] = SENSITIVE.test(key) ? "[omitido]" : value;
  }
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...safe });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

function errorSummary(error: unknown) {
  if (error instanceof Error) {
    // A mensagem dos nossos erros é técnica (ex.: "HTTP 503"); limitar o tamanho.
    return { errorName: error.name, errorMessage: error.message.slice(0, 200) };
  }
  return { errorName: typeof error, errorMessage: undefined };
}

export const log = {
  info: (event: string, fields: Fields = {}) => emit("info", event, fields),
  /** Eventos de segurança: origem inválida, limite excedido, acesso negado. */
  security: (event: string, fields: Fields = {}) => emit("warn", "security." + event, fields),
  /** Falhas inesperadas em rotas (antes ficavam em `catch` silenciosos). */
  error: (route: string, code: string, error: unknown, fields: Fields = {}) =>
    emit("error", "route.error", { route, code, ...errorSummary(error), ...fields }),
};

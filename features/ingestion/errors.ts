// Erros tipados da ingestão PubMed. Nunca carregam stack, URL com chave ou corpo bruto
// para fora do processo: `toJSON()` expõe apenas código, mensagem curta e contexto seguro.

export const ingestionErrorCodes = [
  "INVALID_INPUT",
  "HTTP_ERROR",
  "RATE_LIMITED",
  "SERVER_ERROR",
  "TIMEOUT",
  "NETWORK",
  "MALFORMED_RESPONSE",
  "RETRIES_EXHAUSTED",
  "UNSAFE_OUTPUT_PATH",
] as const;
export type IngestionErrorCode = (typeof ingestionErrorCodes)[number];

export type PubMedEndpoint = "esearch" | "esummary";

export interface IngestionErrorDetails {
  endpoint?: PubMedEndpoint;
  status?: number;
  attempts?: number;
  lastCode?: IngestionErrorCode;
}

export interface SerializedIngestionError extends IngestionErrorDetails {
  code: IngestionErrorCode;
  message: string;
}

const SECRET_PATTERN = /(api_key|email)=[^&\s]*/gi;

/** Remove parâmetros sensíveis (chave de API e e-mail) de qualquer texto antes de exibir. */
export function redactSecrets(text: string): string {
  return text.replace(SECRET_PATTERN, "$1=[omitido]");
}

export class IngestionError extends Error {
  readonly code: IngestionErrorCode;
  readonly details: IngestionErrorDetails;

  constructor(code: IngestionErrorCode, message: string, details: IngestionErrorDetails = {}) {
    super(redactSecrets(message));
    this.name = "IngestionError";
    this.code = code;
    this.details = { ...details };
  }

  /** Forma segura para relatório e log: sem stack, sem causa bruta. */
  toJSON(): SerializedIngestionError {
    return { code: this.code, message: this.message, ...this.details };
  }
}

export function isIngestionError(value: unknown): value is IngestionError {
  return value instanceof IngestionError;
}

/** Converte qualquer falha desconhecida em erro tipado sem expor a stack original. */
export function toIngestionError(value: unknown, fallback: IngestionErrorCode = "NETWORK"): IngestionError {
  if (value instanceof IngestionError) return value;
  const message = value instanceof Error ? value.message : "Falha desconhecida";
  return new IngestionError(fallback, message);
}

import { z } from "zod";
import { claimIds } from "@/features/interpretation/claims";
import { interpretClaim, listClaims } from "@/features/interpretation/interpret-claim";

/**
 * POST /api/interpretar — interpretação determinística de uma afirmação curada.
 * Sem IA, sem dados pessoais, sem segredos. Entrada: { "claimId": "<id da lista>" }.
 * GET devolve a lista fechada de afirmações disponíveis.
 */

const MAX_BODY_BYTES = 1024;
const requestSchema = z.strictObject({ claimId: z.string().min(3).max(80) });

const baseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...baseHeaders, ...extra } });
}

function error(status: number, code: string, message: string, extra: Record<string, string> = {}) {
  return json({ error: { code, message } }, status, extra);
}

export function GET() {
  return json({ claims: listClaims(), method: "deterministic-curated" }, 200, { "Cache-Control": "public, max-age=300" });
}

export async function POST(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) {
    return error(415, "UNSUPPORTED_MEDIA_TYPE", "Envie o corpo como application/json.");
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return error(413, "PAYLOAD_TOO_LARGE", "Corpo da requisição maior que o permitido.");

  let text: string;
  try {
    text = await request.text();
  } catch {
    return error(400, "UNREADABLE_BODY", "Não foi possível ler o corpo da requisição.");
  }
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return error(413, "PAYLOAD_TOO_LARGE", "Corpo da requisição maior que o permitido.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return error(400, "INVALID_JSON", "O corpo não é um JSON válido.");
  }
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) return error(400, "INVALID_REQUEST", "Informe apenas { \"claimId\": \"<id>\" }.");

  const { claimId } = parsed.data;
  if (!claimIds.includes(claimId)) {
    return error(404, "UNKNOWN_CLAIM", "Afirmação não encontrada. Consulte GET /api/interpretar para a lista disponível.");
  }
  try {
    const result = interpretClaim(claimId);
    if (!result) return error(404, "UNKNOWN_CLAIM", "Afirmação não encontrada.");
    return json(result);
  } catch {
    // Nunca expor stack trace ou detalhes internos.
    return error(500, "INTERPRETATION_FAILED", "Não foi possível interpretar a afirmação agora.");
  }
}

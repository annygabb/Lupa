import type { NextRequest } from "next/server";
import { consumeRateLimit, LiveDatabaseUnavailable } from "@/lib/live/db";
import { clientHash, keyHash, liveLimits, signingSecretConfigured } from "@/lib/live/security";
import { log } from "@/lib/log";

export type AuthLimitResult = { ok: true } | { ok: false; status: 429 | 503; retryAfter?: number };

/**
 * Limita tentativas de autenticação por identificador (e-mail pseudonimizado) e por rede,
 * com armazenamento persistente no banco (funciona entre instâncias serverless).
 * Falha FECHADA: sem limitador disponível, a operação não é tentada.
 */
export async function checkAuthLimits(
  request: NextRequest,
  checks: Array<{ scope: string; identity?: string; windowSeconds: number; max: number }>,
  route: string,
): Promise<AuthLimitResult> {
  if (!signingSecretConfigured()) return { ok: false, status: 503 };
  try {
    for (const check of checks) {
      const key = check.identity === undefined ? clientHash(request) : keyHash(check.scope, check.identity);
      const result = await consumeRateLimit(check.scope, key, check.windowSeconds, check.max);
      if (!result.allowed) {
        log.security("auth_rate_limited", { route, scope: check.scope });
        return { ok: false, status: 429, retryAfter: result.retryAfter };
      }
    }
    return { ok: true };
  } catch (error) {
    if (!(error instanceof LiveDatabaseUnavailable)) log.error(route, "AUTH_LIMITER_FAILED", error);
    return { ok: false, status: 503 };
  }
}

export { liveLimits };

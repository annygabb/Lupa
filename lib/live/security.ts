import { createHmac, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";

export const SID_COOKIE = "lupa_live_sid";

export function newSessionId() {
  return randomBytes(24).toString("hex");
}

function secret() {
  const value = process.env.LUPA_LIVE_SIGNING_SECRET;
  if (!value || value.length < 32) throw new Error("LUPA_LIVE_SIGNING_SECRET não configurado");
  return value;
}

export function sessionHash(sessionId: string) {
  return createHmac("sha256", secret()).update(sessionId).digest("hex");
}

export function validSessionId(input: string | undefined): input is string {
  return Boolean(input && /^[a-f0-9]{48}$/.test(input));
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  // A URL do NextRequest é a origem canônica, não aceitar origem arbitrária de terceiros.
  return origin === request.nextUrl.origin;
}

export function validCode(code: string) {
  return /^[A-F0-9]{12}$/.test(code.toUpperCase());
}

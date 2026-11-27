import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança.
 *
 * A CSP agora é APLICADA (antes era só Report-Only e sem endpoint, ou seja, sem efeito).
 * Limitação conhecida: 'unsafe-inline' em script-src continua necessário porque o App Router
 * injeta scripts inline de hidratação e o site é estático (nonce exigiria renderização
 * dinâmica de todas as páginas). Mesmo assim, a política bloqueia scripts de outras origens,
 * plugins (object-src), <base> injetado, envio de formulários para fora e enquadramento.
 * Violações são enviadas para /api/csp-report e aparecem nos logs.
 */
const isDev = process.env.NODE_ENV !== "production";

function supabaseOrigins(): string[] {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.LUPA_SUPABASE_URL;
  const list = ["https://*.supabase.co", "wss://*.supabase.co"];
  if (!raw) return list;
  try {
    const url = new URL(raw);
    if (!url.hostname.endsWith(".supabase.co")) list.push(url.origin, url.origin.replace(/^http/, "ws"));
  } catch { /* URL inválida: o servidor recusa a configuração em tempo de execução */ }
  return list;
}

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (isDev ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' " + supabaseOrigins().join(" "),
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "report-uri /api/csp-report",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    cpus: 1,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
export default nextConfig;

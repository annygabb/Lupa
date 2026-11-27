# Arquitetura — LUPA Saúde

> Atualizado em 26/11/2026 (remediação da auditoria). Decisões em `docs/adr/` (0001 atlas sem banco,
> 0002 interpretação determinística, 0003 LUPA Live com Supabase).

## Visão geral

Monólito modular em **Next.js 16 App Router** (React 19, TypeScript, Zod 4). Duas partes com dependências diferentes:

| Parte | Banco | Onde |
|---|---|---|
| Atlas de evidências | nenhum (catálogo versionado) | `app/*`, `components/routes/*`, `components/atlas/*`, `features/*` |
| LUPA Live | Supabase exclusivo (Postgres + Auth) | `app/live/*`, `app/api/live/*`, `app/api/auth/*`, `components/live/*`, `lib/live/*`, `supabase/migrations/*` |

```text
app/                       páginas e rotas de API (fronteiras finas)
components/routes/<rota>/  telas do atlas (as únicas usadas; a UI legada foi removida em 26/11)
components/live/           participante, telão, organizador, login, demonstração, aviso de disponibilidade
features/                  domínio puro e testado (evidências, comparação, interpretação, cenários, ingestão)
lib/live/                  db (Supabase ou memória em dev), security (sessão assinada, origem, HMAC), auth, QR
lib/log.ts                 log estruturado sem dados pessoais
lib/zod.ts                 Zod com JIT desligado (compatível com a CSP)
supabase/migrations/       6 migrações em ordem; supabase/rollback/ com reversão da última
tests/unit · tests/integration · tests/e2e · tests/e2e-live · tests/support (simulador e stubs de teste)
```

## Fluxo do LUPA Live

```text
Celular → GET /api/live/[code] ── emite cookie lupa_live_sid (HMAC, 4 h, path do evento; limite por rede)
       → POST /api/live/[code]/vote ── Origin confiável + sessão assinada + limite por rede
            → RPC lupa_cast_vote (fase aberta, 1 voto por sessão e rodada, 8/min por sessão)
Telão  → GET /api/live/[code] (público: contagens ocultas na rodada aberta; gabarito só após a revelação)
         + GET /api/live/[code]/qr (só para evento ativo)
Organizador → /api/auth/session (Supabase Auth; cookies HttpOnly; limite por e-mail e por rede)
            → /api/live (cria só em organização onde é owner/admin/organizer)
            → /api/live/[code]/admin · PATCH fase (compare-and-set) · DELETE (cascata) · feedback-summary (suprime < 5)
Realtime → aviso público {code, kind}; os dados sempre vêm da API (com polling de 15 s como alternativa)
```

## Segurança

- Cabeçalhos: CSP **aplicada** (com `report-uri /api/csp-report`), `X-Frame-Options: DENY`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`; HSTS pela Vercel.
  Limitação: `script-src 'unsafe-inline'` (necessário ao App Router estático).
- Escritas exigem `Origin` presente e confiável (`lib/live/security.ts`); sem Origin = 403.
- Erros de servidor e eventos de segurança vão para `lib/log.ts` (JSON por linha, sem e-mail, IP, token ou corpo).
- `/api/interpretar`: só JSON, ≤ 1 KB, esquema estrito, allowlist de IDs.
- Nenhuma chave privada no cliente. `/relatos` nunca envia dados.

## Reprodutibilidade

`pnpm-lock.yaml`, `packageManager: pnpm@10.18.0`, `.nvmrc` = 22, CI com `--frozen-lockfile`;
`pnpm.overrides` corrige `minimatch` vulnerável no ferramental de lint.

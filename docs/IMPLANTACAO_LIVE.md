# Implantação do LUPA Live (Supabase + Vercel)

> Situação em 26/11/2026: **não implantado**. Em `https://lupaa.vercel.app`, `GET /api/live/health`
> responde `503 {"status":"unconfigured"}`. O atlas público funciona sem nenhuma destas etapas.
> Este roteiro substitui os documentos de 13/11 (agora em `docs/historico/`).

## 0. O que já foi validado fora do Supabase real

Em Postgres 16 descartável, com *stubs* mínimos do Supabase (`tests/support/supabase-stubs.sql`) e um
**simulador** de PostgREST/GoTrue (`tests/support/fake-supabase.mjs`):

- as 6 migrações aplicam em ordem e podem ser reaplicadas;
- `anon` e `authenticated` não acessam tabelas nem RPCs;
- o fluxo completo funciona no navegador (login → criar → telão/QR → votos → fases → feedback → exportar → excluir),
  com isolamento entre organizações (`tests/e2e-live/live-flow.spec.ts`).

**Ainda não validado:** Supabase Auth real (e-mail de recuperação, políticas de senha, MFA), Realtime real,
variáveis na Vercel, carga e dispositivos físicos.

## 1. Banco (STAGING primeiro, depois PRODUÇÃO)

1. Criar projeto Supabase **exclusivo** do LUPA (região, custo e responsáveis aprovados). Ativar backup.
2. Aplicar **na ordem**, conferindo cada uma:
   1. `20261111162000_lupa_live.sql`
   2. `20261113215500_lupa_institutions_feedback_broadcast.sql`
   3. `20261120180000_lupa_retention_and_audit.sql`
   4. `20261123150000_lupa_retention_guard.sql`
   5. `20261123153000_lupa_phase_broadcast.sql`
   6. `20261126120000_lupa_audit_remediation.sql` ← **nova**: limitador de taxa (`lupa_rate_limits`,
      `lupa_consume_limit`), estado da sessão (`lupa_session_state`), índices e retenção dos contadores.
3. A migração 6 **não altera nem apaga dados existentes**; só cria objetos e substitui a função de retenção
   mantendo a assinatura. Reversão: `supabase/rollback/20261126120000_lupa_audit_remediation_down.sql`
   (exige voltar antes a versão anterior da aplicação, que não chama as funções novas).
4. Bootstrap institucional manual: criar o usuário no Supabase Auth e, com o UUID verificado:
   ```sql
   insert into public.lupa_organizations(name, slug) values ('Nome da instituição', 'slug-da-instituicao');
   insert into public.lupa_organization_members(organization_id, user_id, role)
   values ('<uuid-da-organizacao>', '<uuid-do-usuario>', 'owner');
   ```

## 2. Vercel (variáveis — ver `.env.example`)

| Variável | Onde | Observação |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | público | URL HTTPS do projeto |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | público | `sb_publishable_…` |
| `SUPABASE_SECRET_KEY` | **somente servidor** | `sb_secret_…` |
| `LUPA_LIVE_SIGNING_SECRET` | **somente servidor** | 32+ caracteres aleatórios por ambiente |
| `LUPA_APP_BASE_URL` | servidor | endereço HTTPS canônico |
| `LUPA_ALLOWED_ORIGINS` | servidor, opcional | domínios alternativos do mesmo app |

Após configurar, **refazer o deploy** (as variáveis `NEXT_PUBLIC_*` entram no bundle do navegador no build;
sem isso o Realtime fica desligado e o telão atualiza por *polling* de 15 s).

No Supabase Auth: URL do site e redirecionamento para `/recuperar-acesso`.

## 3. Verificação obrigatória antes de demonstrar

1. `GET /api/live/health` → `200 {"status":"ready","database":"connected"}`.
2. `SMOKE_REQUIRE_LIVE=1 node scripts/smoke.mjs https://<ambiente>` → todas as linhas `PASS`.
3. Roteiro manual (gravar a tela): login → criar sessão → abrir telão → ler o QR com **iPhone e Android** →
   votar → avançar fases → feedback → exportar CSV → excluir.
4. Com duas organizações de teste, confirmar 403 ao administrar evento de outra organização.
5. Rodar a retenção em modo de conferência: workflow *LUPA Live – expurgo de retenção* com `dry_run=true`.

## 4. Riscos residuais conhecidos

- **Votação por script com muitas redes/IPs:** o servidor exige sessão assinada, Origin confiável e limita
  sessões e votos por rede, mas não há CAPTCHA nem WAF. Para eventos grandes, ativar proteção de borda (Vercel WAF).
- **Redes compartilhadas (escola, NAT):** muitos participantes atrás do mesmo IP podem atingir o limite
  de 40 sessões/minuto. Ajuste `LUPA_LIVE_MAX_SESSIONS_PER_CLIENT_MINUTE` para o tamanho do evento.
- **CSP com `'unsafe-inline'` em scripts:** necessário para o site estático do App Router; ver `next.config.ts`.
- **Canal Realtime público:** transmite apenas `{code, kind}`; quem souber o código vê o aviso de atualização, não os dados.

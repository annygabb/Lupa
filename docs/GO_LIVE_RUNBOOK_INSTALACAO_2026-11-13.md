# LUPA Saúde — Runbook de implantação real

**Base auditada:** PR #8, https://github.com/annygabb/Lupa/pull/8. **Status:** implantação no Supabase ainda não comprovada; migrações apenas versionadas no GitHub.

## 1. Provisionar antes de publicar

1. Criar um projeto Supabase **EXCLUSIVO do LUPA** e separar staging de produção. Não usar os outros projetos da conta.
2. Habilitar Auth por e-mail/senha, Realtime Broadcast, política de senhas e backups. Confirmar plano/custos antes de provisionar.
3. Em staging, aplicar **na ordem** as migrações: `supabase/migrations/20261111162000_lupa_live.sql`, depois `supabase/migrations/20261113215500_lupa_institutions_feedback_broadcast.sql`.
4. Revisar constraints, RLS, permissões `service_role`, funções e triggers; executar somente contra o projeto LUPA.
5. Conferir CLI atual antes de comandos remotos: Supabase CLI v3 prefere alvo local por padrão. Usar `supabase --help`, `supabase migration --help` e seleção explícita do alvo.

## 2. Bootstrap institucional

1. Criar via Supabase Auth um usuário real da instituição, verificar e-mail e consultar seu UUID no Dashboard.
2. Inserir instituição na tabela `lupa_organizations` e copiar ID real retornado.
3. Vincular usuário à organização na tabela `lupa_organization_members` com `role='owner'`. Nunca inventar UUID nem gravar senha no SQL.
4. Repetir com uma segunda instituição e usuário para ensaio de isolamento organizacional.

```sql
insert into public.lupa_organizations(name,slug)
values ('Instituição LUPA teste','instituicao-lupa-teste')
returning id, slug;

-- Substituir UUIDs exclusivamente por IDs conferidos no projeto LUPA:
insert into public.lupa_organization_members(organization_id,user_id,role)
values ('<UUID_DA_ORGANIZACAO>','<UUID_DO_USUARIO_AUTH>','owner');
```

## 3. Configurar Vercel

Adicionar em Vercel Project → Settings → Environment Variables, nos ambientes corretos:

| Nome | Escopo | Finalidade |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | público | URL HTTPS do Supabase LUPA |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | público | Chave sb_publishable_… |
| `SUPABASE_SECRET_KEY` | somente servidor | Chave sb_secret_… |
| `LUPA_LIVE_SIGNING_SECRET` | somente servidor | Segredo aleatório com 32+ caracteres |
| `LUPA_APP_BASE_URL` | servidor | Endereço HTTPS canônico dos QR Codes |

Configurar em Supabase Auth URLs permitidas para login, callbacks e `/recuperar-acesso`. Nunca inserir secrets em GitHub, chat, screenshots, logs ou código. Não utilizar `LUPA_LIVE_ADMIN_TOKEN` nem habilitar fallback local em produção.

## 4. Conferências funcionais indispensáveis

| Verificação | Aprovação exigida |
|---|---|
| `GET /api/live/health` | 200 só com Auth e tabelas reais; 503 sem banco |
| Login/logout | cookie HttpOnly, identidade validada em Supabase Auth, revogação testada |
| Organização A vs B | POST/PATCH/DELETE/GET-admin de evento alheio retorna 403 |
| QR + voto | evento real, 201 na primeira tentativa e 409 na duplicação |
| Fases | pré → revelação → pós → encerramento, gabarito oculto no pré |
| Broadcast | celular vota e telão atualiza; reconexão e fallback funcionam |
| Feedback | depois da fase encerrada: 201 só após INSERT real; duplicidade 409 |
| Feedback pequeno grupo | 1–4 notas não revelam médias; 5+ mostram agregado |
| Relatos de sintomas | permanecem no navegador, sem envio a API/analytics |
| Disponibilidade | perda de banco retorna erro; não cria votos falsos em memória |
| Segurança | rate limit, CSRF/Origin, RLS, MFA, sesssão, logs e auditoria revisados |
| Operação | backups/restauração, monitoramento/alertas, rollback e teste de carga realizados |

## 5. Qualidade e release

```powershell
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
pnpm run test:e2e
```

Esses comandos só verificam código e navegador, não demonstram que migrações Supabase foram executadas. Testar duas organizações em staging e dispositivos reais iOS/Android. Conferir SHA do GitHub e deployment READY na Vercel antes de promover para produção.

## 6. Pendências declaradas — fora do go-live automático

- Sem acesso a um Supabase identificado como LUPA, não aplicar migração remotamente.
- Multiquestões por evento ainda não implementadas: há uma questão pré/pós por evento.
- Relatos sensíveis seguem locais até parecer jurídico/ético/LGPD, finalidade e retenção explícitas.
- A camada Realtime usa aviso público e sanitizado; não transmite votos ou dados pessoais. Revisar escalabilidade/abuso e, se necessário, migrar para autorização privada de canais.
- MFA obrigatório, política de retenção, job de limpeza, antipadrões de sessão, testes de 100–500 usuários, backup/restore e revisão clínica independente ainda precisam de comprovação.

## 7. Fonte de verdade

Documento completo: [ARQUITETURA_AS_BUILT_INTEGRAL_2026-11-13.md](./ARQUITETURA_AS_BUILT_INTEGRAL_2026-11-13.md).

Referências: https://supabase.com/docs/guides/getting-started/api-keys · https://supabase.com/docs/guides/realtime/broadcast · https://supabase.com/docs/guides/auth · https://vercel.com/docs/deployments

**Nenhuma funcionalidade dependente de banco deve ser declarada 100% operacional até aplicação e verificação real de todos os testes de aceite.**

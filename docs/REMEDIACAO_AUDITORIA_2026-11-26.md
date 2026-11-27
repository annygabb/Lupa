# Remediação da auditoria técnica — LUPA Saúde (26/11/2026)

**Base:** `Lupa-main.zip` (auditoria de 26/11/2026). **Resultado:** código corrigido nesta pasta.
**Nada foi publicado:** nenhum deploy na Vercel, nenhum push ao GitHub e nenhuma migração aplicada em banco remoto.

**Ambiente de verificação:** contêiner Linux; Node 22.23; pnpm 10.18.0; Chromium 1243; Postgres 16 local e descartável.
O "Supabase" dos testes é um **simulador** (`tests/support/fake-supabase.mjs`, PostgREST + GoTrue) sobre Postgres real com
as migrações do repositório e *stubs* mínimos (`auth.users`, `auth.uid()`, `realtime.send`, papéis `anon`/`authenticated`/`service_role`).

## 1. Relação das correções com a auditoria

| Item da auditoria | Camada | O que foi feito | Arquivos ou estruturas | Validação | Status |
|---|---|---|---|---|---|
| **P1** Live não funciona em produção | Infra / backend | Código e banco prontos e testados de ponta a ponta; runbook atualizado. O provisionamento exige credenciais e aprovação de custo | `docs/IMPLANTACAO_LIVE.md`, `.env.example`, migração 6 | E2E `tests/e2e-live/live-flow.spec.ts` 4/4 com Supabase **simulado** | **Parcialmente corrigido**: falta provisionar o Supabase real e configurar a Vercel |
| **P2** Telão com "Votação Aberta" e QR eterno | Frontend | Selo, QR e cartão da pergunta só aparecem com snapshot válido; estados distintos para não configurado, inexistente, encerrado e sem conexão | `components/live/presentation.tsx`, `lib/live/public-snapshot.ts` | E2E `live-unconfigured.spec.ts` (sem banco) e `live-flow.spec.ts` (com banco) | **Corrigido e testado** (local; publicar) |
| **P3** Celular "Ao Vivo" + "não encontrada" no 503 | Frontend | Mensagem pelo código de erro (503 LIVE_UNCONFIGURED, 404, 429, offline); selo derivado da fase; botões "Ver demonstração" e "Tentar novamente" | `components/live/participant.tsx` | E2E sem banco, desktop e celular | **Corrigido e testado** |
| **P4 / S1** Votação ilimitada sem cookie | Backend / banco / segurança | Sessão de participante **assinada** (HMAC, vinculada ao evento, 4 h) emitida no GET; voto e feedback exigem a sessão e Origin; limite persistente por rede (HMAC do IP) para sessões e votos | `lib/live/security.ts`, `app/api/live/[code]/route.ts`, `.../vote/route.ts`, `.../feedback/route.ts`, migração 6 (`lupa_rate_limits`, `lupa_consume_limit`) | 30 POSTs sem sessão → 30×403 (antes 30×201); limite por rede 201,201,201,429,429; Postgres: contadores só com HMAC | **Corrigido e testado**. Risco residual: atacante com muitos IPs (sem WAF/CAPTCHA) |
| **P5** *Sandbox* fabrica "Delta de Aprendizado" | Frontend / apresentação | Começa sem votos; "+5 votos fictícios" iguais no pré e no pós; aviso fixo de dados fictícios; resultado rotulado como ilustrativo | `components/live/demo-sandbox.tsx`, `app/live/demo/page.tsx` | E2E: sem cliques → "(0 no pré, 0 no pós)"; ausência de "Delta de Aprendizado" | **Corrigido e testado** |
| **P6** Testes sobre código morto | Testes / frontend | Removidos ~2.500 linhas de componentes sem rota e os casos que só os renderizavam; novo teste das **páginas reais** | `tests/unit/route-pages.test.ts`; 23 arquivos removidos em `components/*` | Cobertura das telas reais 7,0% → 56,4% | **Corrigido e testado** |
| **P7** Sem teste do fluxo Live | Testes | E2E com navegador: login, criação, telão/QR, 2 participantes, fases, feedback, CSV, exclusão; isolamento entre organizações, papel viewer, sem login, script sem sessão, logout | `tests/e2e-live/`, `playwright.live.config.ts`, `scripts/test-live-stack.mjs`, `tests/support/*` | 4/4 | **Corrigido e testado** (Supabase simulado) |
| **P8 / S3** Zero logs | Backend / segurança | Log JSON por linha sem dados pessoais; erros e eventos de segurança (origem inválida, limites, acesso negado, falha de login, CSP) | `lib/log.ts` e todas as rotas de API | Logs observados no E2E (ex.: `security.login_failed`) | **Corrigido e testado** |
| **P9** Documentação contraditória | Documentação | README e STATUS reescritos com números verificados; AGENTS.md alinhado; ADR 0003; referência inexistente removida | `README.md`, `docs/STATUS.md`, `AGENTS.md`, `docs/adr/0003-*` | Revisão manual | **Corrigido** |
| **P10** Volume de documentação, arquivo "100%" | Documentação | 23 documentos movidos para `docs/historico/` (com índice); arquivo "100%" renomeado para `ESPECIFICACAO_EXECUTAVEL_HISTORICA_2026-11-11.md`; novo índice `LEIA_PRIMEIRO.md` | `docs/` | — | **Corrigido** |
| **S2** Login sem limite | Backend / banco / segurança | Limite por e-mail (8/15 min) e por rede (30/15 min) antes de consultar o provedor; recuperação limitada sem revelar existência do e-mail; troca de senha limitada | `lib/live/auth-limits.ts`, `app/api/auth/*` | `auth-rate-limit.test.ts`: 401,401,401,429,429 e provedor chamado só 3× | **Corrigido e testado** (limites do Supabase Auth real não verificados) |
| **S4** CSP sem efeito | Segurança | CSP **aplicada** com `object-src 'none'` e `report-uri /api/csp-report`; Zod sem JIT para não exigir `eval` | `next.config.ts`, `app/api/csp-report/route.ts`, `lib/zod.ts` | E2E `csp.spec.ts` (evento `securitypolicyviolation`) em 21 rotas: 0 violações; relatórios no log do E2E completo: 0 | **Corrigido e testado**. Limitação: `script-src 'unsafe-inline'` |
| **S5** Origem frágil em proxy/alias | Backend / segurança | Origens confiáveis = origem da requisição, Host, `LUPA_APP_BASE_URL` e `LUPA_ALLOWED_ORIGINS`; Origin ausente = 403 | `lib/live/security.ts` | `live-security.test.ts` (127.0.0.1 em dev, alias declarado, terceiro recusado) | **Corrigido e testado** |
| **S6** Código do evento em minúsculas | Backend | `normalizeCode()` em todas as rotas e na autorização | `lib/live/security.ts`, rotas `[code]`, `institutional-auth.ts` | Unitário + E2E (participante entra por URL em minúsculas) | **Corrigido e testado** |
| **S7** Cadeia de suprimentos no CI | Infra | Workflow de *design skills* só manual, versões fixadas (`@playwright/mcp@0.0.86`, `agent-browser@0.45.0`, `skills@1.9.0`, `graphifyy==0.9.120`) | `.github/workflows/design-skills-graph.yml`, `.vscode/mcp.json`, `scripts/probe-playwright-mcp.mjs` | Leitura (não executado no GitHub) | **Corrigido, mas pendente de teste** (o `skills add` ainda baixa o repositório de terceiros na versão atual) |
| **S8** `minimatch` vulnerável (dev) | Dependências | `pnpm.overrides` para `minimatch` ≥ 11.0.1; CI audita todas as dependências em nível moderado | `package.json`, `pnpm-lock.yaml`, `ci.yml` | `pnpm audit`: nenhuma vulnerabilidade; lint funcionando | **Corrigido e testado** |
| **S9** `dangerouslySetInnerHTML` no QR | Segurança | Mantido: o SVG vem da lib `qrcode` com código validado; agora também sob CSP aplicada | — | — | **Não aplicável** (sem risco explorável identificado) |
| **S10** Health com dado fixo | Backend | `/api/health` informa a configuração real; `/api/live/health` diferencia `ready`, `local-demo` e `unconfigured` e checa a tabela nova | `lib/health.ts`, `app/api/live/health/route.ts` | Unitários + E2E (503 sem banco; `ready` com banco) | **Corrigido e testado** |
| Estado "voto computado" perdido ao recarregar | Frontend / backend / banco | GET devolve `viewer` (votou pré/pós, enviou avaliação) via RPC `lupa_session_state`, sem revelar a alternativa | migração 6, `participant.tsx` | E2E: após recarregar, botão "Resposta Registrada" desabilitado e avaliação mantida | **Corrigido e testado** |
| Feedback sem modo local / admin só Supabase | Backend | Motor local com as mesmas regras: feedback após encerrar, 1 por sessão, supressão abaixo de 5, transição compare-and-set, expiração | `lib/live/db.ts` | `live-api-flow.test.ts` (12 casos) | **Corrigido e testado** |
| `/api/me` lia todas as organizações | Backend / banco | Consulta só os IDs do usuário | `app/api/me/route.ts` | E2E: organizador B vê só "Instituição B" | **Corrigido e testado** |
| Smoke "passa" com o Live quebrado | Testes | Aviso explícito quando o Live não está pronto; `SMOKE_REQUIRE_LIVE=1` faz falhar | `scripts/smoke.mjs` | Smoke local: aviso exibido | **Corrigido e testado** |
| Dependências sem uso | Dependências | Removidas `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge` e `components.json` | `package.json` | Build e testes verdes | **Corrigido e testado** |
| Binários win32 em devDependencies | Dependências | Mantidos: podem ser necessários ao desenvolvimento no Windows; a remoção não foi verificável em Linux | — | — | **Não corrigido** (decisão da equipe) |
| Imagens públicas sem uso | Frontend | 4 referências duplicadas removidas de `public/`; 2 imagens sem cópia movidas para `docs/assets-referencia/` | `public/` (11 MB → 4,9 MB) | Build e E2E verdes | **Corrigido e testado** |
| Resposta da Lens abaixo da dobra | UX | Não alterado (design aprovado); o roteiro do pitch instrui a rolar | `docs/pitch/ROTEIRO_3_MIN.md` | — | **Não corrigido** (por escolha) |
| `/desafio`, `/impacto`, `/dossie` só renderização | Testes | Renderização verificada (E2E/axe); interações não ampliadas | — | — | **Não corrigido** (baixa prioridade) |
| Teste com usuários (A3) | Impacto | Ferramenta pronta: modelo CSV + `scripts/pilot-report.mjs` (recusa dados vazios e e-mails) | `docs/validation/`, `scripts/pilot-report.mjs` | Teste com dados **fictícios** de fixture | **Não corrigido**: exige participantes reais |
| Revisão clínica (M4) | Ciência | — | — | — | **Não corrigido**: exige especialista |
| Vídeo de contingência (A5) | Apresentação | Roteiro e checklist atualizados | `docs/pitch/`, `docs/DEMONSTRACAO.md` | — | **Não corrigido**: exige gravação pela equipe |
| Lighthouse / aparelhos físicos (M5) | Testes | — | — | — | **Não corrigido**: sem aparelhos |

## 2. Banco de dados

**Migração nova:** `supabase/migrations/20261126120000_lupa_audit_remediation.sql`

- Tabela `lupa_rate_limits(scope, key_hash, window_start, hits)`, com PK composta, `CHECK`s de formato, RLS habilitado,
  `REVOKE` para `anon`/`authenticated` e acesso só por `service_role`.
- Função `lupa_consume_limit(scope, key_hash, window_seconds, max)`: `SECURITY DEFINER` com `search_path=''` e validação de
  entrada (lança `LUPA_LIMIT_INVALID_INPUT`).
- Função `lupa_session_state(code, session_hash)`: `SECURITY DEFINER` e somente leitura.
- Índices `lupa_live_votes(event_id, session_hash)`, `lupa_live_rate_limits(minute_bucket)` e
  `lupa_live_audit(organization_id, created_at desc)`.
- `lupa_cleanup_expired_records` substituída (mesma assinatura e mesma proteção 1..365), passando a limpar também
  `lupa_rate_limits` com mais de 2 dias.

**Como foi testada (Postgres 16 descartável):**
- aplicação das 6 migrações em ordem e reaplicação idempotente;
- permissões negadas a `anon`/`authenticated` (inclusive para as funções novas);
- RPCs, limites, retenção, cascata sem órfãos e transição de fase atômica sob concorrência.

O teste encontrou e corrigiu um bug na própria migração nova: o regex de `scope` não aceitava o código do evento em maiúsculas.

**Ainda precisa ser aplicada** no Supabase de STAGING e depois no de PRODUÇÃO (nenhum projeto existe hoje).

**Preservação de dados:**
- a migração só cria objetos e substitui uma função, sem `DROP`, `DELETE` ou `ALTER` de dados existentes;
- fazer backup antes;
- a reversão está em `supabase/rollback/20261126120000_lupa_audit_remediation_down.sql` e exige implantar antes a versão anterior da aplicação.

## 3. Testes

### Passaram (26/11/2026, código final)

| Verificação | Resultado |
|---|---|
| Lint / tipos / build | 0 erros, 0 avisos / 0 erros / OK |
| Vitest | 253/253 com Postgres (245 + 8 pulados sem `LUPA_PG_TEST_URL`) |
| Playwright + axe (5 larguras) | 350/350 |
| E2E do Live com banco | 4/4 |
| Smoke | 23 PASS + aviso de Live não configurado |
| `pnpm audit` (todas as dependências) | 0 vulnerabilidades |
| Cobertura de linhas (Vitest) | 51,0% (antes 36,6%) |

Testes novos:
- `live-security.test.ts`, `live-api-flow.test.ts`, `auth-rate-limit.test.ts`;
- `live-supabase-stack.test.ts` (Postgres), `route-pages.test.ts`, `pilot-report.test.ts`;
- E2E `live-unconfigured.spec.ts`, `csp.spec.ts` e `tests/e2e-live/live-flow.spec.ts`.

### Falharam durante o trabalho e foram corrigidos

- Regex do limitador na migração nova (descoberto pelo teste com Postgres).
- `correctIndex: null` vindo do banco real (a API pública agora omite o campo).
- Violação de CSP por `eval` do Zod em todas as páginas. Foi descoberta pelo endpoint de relatório, e a primeira versão do
  `csp.spec.ts` **não** a detectava, por isso o teste foi reescrito. Na checagem de sanidade (Zod com JIT religado), os
  relatórios de violação voltaram a aparecer; o resultado final do teste nessa execução de sanidade não foi registrado.
- Seletores dos próprios testes novos (ambíguos).

### Não executados

- Supabase real (Auth, e-mail, Realtime, MFA): não existe projeto e não houve credenciais.
- CI no GitHub: não posso enviar código ao repositório.
- iPhone/Android, VoiceOver/TalkBack, Firefox/WebKit e Lighthouse: sem aparelhos nem configuração.
- Carga: sem ambiente autorizado.
- Site publicado após as correções: esta versão não foi publicada.

### Segurança

| Situação | Itens |
|---|---|
| Corrigidos e verificados | S1, S2 (lado da aplicação), S3, S4, S5, S6, S8, S10 |
| Corrigidos sem validação completa | S7 (workflow não executado) |
| Pendentes / riscos residuais | Votos com muitos IPs (WAF/CAPTCHA); `'unsafe-inline'` em scripts; limites e MFA do Supabase Auth real; canal Realtime público (só `{code, kind}`); penteste no ambiente real |

**Não há afirmação de que o sistema está seguro.** As partes Supabase/Vercel reais não foram testadas.

### Integrações que dependem de configuração externa

Supabase (URL, chaves publicável e de serviço), `LUPA_LIVE_SIGNING_SECRET`, `LUPA_APP_BASE_URL`, URLs de redirecionamento
no Supabase Auth e *secrets* do workflow de retenção.

### Como executar e validar

Ver `README.md` (seção Verificações) e `docs/IMPLANTACAO_LIVE.md` (seção 3).

## 4. Reavaliação dos critérios

| Critério | Nota anterior | Nota após as correções | Justificativa |
|---|---:|---:|---|
| Execução técnica | 7,0 | **7,5** | Telas do Live honestas sob falha; fluxo Live completo funcionando de ponta a ponta em teste com banco real; CSP aplicada sem quebrar nenhuma tela. Não sobe mais porque **nada foi publicado**, o Live segue fora do ar em produção e não houve aparelhos físicos nem Lighthouse |
| Implementação técnica | 6,5 | **8,0** | Código morto removido; testes passam a cobrir as telas reais; votação protegida no servidor; limites persistentes; logs; migração testada com reversão; CI com Postgres; documentação coerente. Restam UI do Live sem teste unitário (coberta por E2E), `'unsafe-inline'` e validação só com Supabase simulado |
| Impacto | 5,0 | **5,0** | Inalterado de propósito: continua sem usuários, sem métricas e sem revisão clínica. Só a ferramenta de medição ficou pronta, e a demonstração deixou de sugerir um resultado falso |
| Apresentação | Não avaliado | **Não avaliado** | Continua sem slides, vídeo ou apresentação ao vivo. O roteiro e as respostas foram atualizados e alinhados ao produto real |

**Nota final: não calculada** (o critério 4 não pode ser avaliado). Com os três critérios avaliados, a faixa possível
vai de 5,1 (apresentação 0) a 7,6 (apresentação 10).

## 5. Pronto para demonstração?

**Sim, para o atlas e para a simulação `/live/demo`, depois de publicar esta versão.** Até o deploy, o site
publicado ainda mostra o telão enganoso e o "Delta de Aprendizado" fabricado.

**O LUPA Live real só deve ser demonstrado** se o Supabase for provisionado e `/api/live/health` responder `ready`
na véspera.

Pendências que ainda podem afetar a banca:
1. Publicar a versão corrigida.
2. Ausência de dados de usuários (o critério de impacto).
3. Ausência de revisão clínica.
4. Vídeo de contingência não gravado.

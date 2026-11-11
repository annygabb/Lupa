# LUPA Saúde — matriz de execução multiambiente (11/11/2026)

> Status: implementação em PR de rascunho. Nenhum deploy de produção ou banco exclusivo foi configurado nesta etapa. NÃO afirmar 100% funcional sem evidência.

## Baseline e escopo

- Fonte GitHub: ann ygabb/Lupa (remover espaço) em branch de feature; produção permanece na main.
- Funcionalidades sem banco: Corpo & Evidência, Desafio, Impacto A/B, Dossiê, Explorar. Todas educativas, sem cálculos de risco clínico.
- Funcionalidade com banco: LUPA Live (organizador desktop, participante mobile, APIs server-side, migração SQL).
- Data source de evidências: catálogo canônico local existente; nada altera status de revisão médica.
- O código público antigo não dependia de banco. A nova integração é opcional e falha de forma explícita quando não configurada.

## Ambientes

| Ambiente | Banco | Segredos | Testes | Estado |
|---|---|---|---|---|
| Desenvolvimento local | Supabase LOCAL ou DEV isolado | .env.local não versionado | lint, typecheck, Vitest, build, E2E e banco | pendente ambiente |
| CI | nenhuma chave de produção | mínimo, mocks isolados | lint, tipos, testes, build, smoke, axe/Playwright | em execução no PR |
| Preview Vercel | Supabase STAGING exclusivo | variáveis Preview | smoke real /api/live/health e votação | Vercel não acessível pela conexão atual |
| Produção Vercel | Supabase PROD exclusivo | variáveis Production | smoke, backup, carga, UX e security sign-off | NÃO alterada |

A conexão Vercel do assistente retornou 403 ao listar deployments; não usar isso como evidência de deploy concluído. Não reutilizar banco de Borali, Help ou qualquer projeto existente.

## Segredos — todos APENAS no servidor

- LUPA_SUPABASE_URL: URL do projeto Supabase exclusivo
- LUPA_SUPABASE_SERVICE_ROLE_KEY: chave privilegiada; jamais usar no browser, NEXT_PUBLIC ou Git
- LUPA_LIVE_SIGNING_SECRET: segredo HMAC com pelo menos 32 caracteres, único por ambiente
- LUPA_LIVE_ADMIN_TOKEN: chave de organizador temporária com pelo menos 32 caracteres, única por ambiente

Gerar cada segredo usando Node crypto randomBytes(32).toString("hex"), guardar em um gerenciador seguro e configurar manualmente na Vercel.

## Banco — aplicar após aprovação da organização, região e custo

1. Selecionar uma organização proprietária e criar projetos LUPA DEV e LUPA PROD isolados.
2. Confirmar preços e custos de armazenamento, egress, Realtime e chamadas em cenário de 1.000 participantes.
3. Aplicar primeiro a migração SQL em DEV: supabase/migrations/20261111162000_lupa_live.sql.
4. Inspecionar grants, RLS e RPCs; verificar acesso negado para anon/authenticated, autorizado para service_role.
5. Configurar variáveis DEV e testar /api/live/health. Resposta 200 significa que a RPC existe e DB está acessível; 503 sinaliza indisponibilidade.
6. No PC, criar sessão com token de organizador, acessar código no celular, votar uma vez, verificar 409 no duplicado, revelar, votar pós e encerrar.
7. Executar testes multi-dispositivo e de concorrência em banco de testes.
8. Habilitar retenção programada: excluir eventos e votos expirados e registros de rate-limit antigos; atualmente o SQL contém diretrizes mas o job está PENDENTE.
9. Após aceite científico, visual, financeiro e de segurança, migrar PROD e fazer deploy correspondente ao commit aprovado.

**Supabase CLI v3 é local por padrão** e solicita confirmação para mudar banco hospedado. Conferir a versão e explicitar alvo remoto antes de migrar.

## Contratos ativos na branch

- GET /api/health: saúde do core sem banco.
- GET /api/interpretar: allowlist de afirmações científicas.
- POST /api/interpretar: classificação determinística e limites.
- GET /api/live/health: teste de disponibilidade de DB e configuração de segredos.
- POST /api/live: criar sessão; token de organizador e origem permitida.
- GET /api/live/:code: pergunta, estado e votos exclusivamente agregados.
- PATCH /api/live/:code: avançar fase; token e transições controladas.
- POST /api/live/:code/vote: voto por sessão HttpOnly, inserção atômica, oito tentativas/minuto/sessão e bloqueio de duplicidade.

## Dicionário de dados já versionado

- lupa_live_events: UUID, código hexadecimal de 12 caracteres, claim_id, pergunta, três respostas, fase, datas de criação/expiração.
- lupa_live_votes: ID, evento, fase pre/post, alternativa 0..2, hash HMAC pseudônimo, criação; chave única evento+fase+sessão.
- lupa_live_rate_limits: evento, hash HMAC, minuto, número de tentativas.
- RPC lupa_event_snapshot: contagem agregada sem transferir votos individuais ao frontend.
- RPC lupa_cast_vote: fase validada, contador de tentativas, inserção idempotente sob concorrência.

RLS habilitada nas três tabelas, sem políticas anon/authenticated e com revogação explícita de acesso; RPCs são exclusivamente server-to-server.

## Ameaças e limites ainda pendentes

- O token global de organizador é uma solução provisória para evento único; comercialização multi-tenant exige Supabase Auth, sessão segura por usuário, RLS por organization_id, políticas RBAC e auditoria.
- Contra bots que criam sessões ilimitadas, adicionar WAF/rate-limit distribuído e desafio antifraude proporcional; a chave única só impede duplicidade por cookie, não por pessoa.
- Testar CORS/CSRF, XSS, SQLi, enumeração de códigos, acesso cruzado, alterações de fase concorrentes, logs sem segredos, rollback e quotas.
- Testar 1.000 participantes usando rede compartilhada e verificar latência p95, taxa de falhas, custo, disponibilidade, conexão de banco e modelo de cache.
- Não armazenar dados individuais de saúde, peso, nome, e-mail ou IP bruto no Live.
- Validar retenção e documentação LGPD. Não publicar resultados do piloto como causalidade de aprendizado.
- Testar Safari real, Android real, Edge/Chrome/Firefox em Windows, axe/WCAG e acessibilidade manual.
- CSP atual do site é Report-Only; promover após relatório e auditoria, nunca sem testar.
- Referências visuais de cianotipia estão no pacote de documentação entregue anteriormente; a branch usa imagens originais já existentes no projeto.
- O usuário precisa aprovar visual desktop/mobile e a migração por ambiente antes de promover à main.

## Critério formal de pronto

Uma etapa só está concluída quando: código e testes verdes + revisão por dispositivo + evidência de segurança + deploy real com SHA conferido + aprovação do usuário. Caso contrário, rotular como PARCIAL ou PENDENTE; não utilizar a expressão “100% funcional”.

## Links de verificação

- https://github.com/annygabb/Lupa/pull/6
- https://github.com/annygabb/Lupa/actions
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/api/securing-your-api
- https://supabase.com/changelog/supabase-cli-v3

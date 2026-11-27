# LUPA — Remediação da auditoria de 23/11/2026

**Escopo:** Correções pontuais do PR #10 sobre o commit `6569514`. Documento de acompanhamento; não é atestado de go-live.

## Corrigido ou incluído no código do PR #10

| Auditoria | Mudança | Onde | Como verificar |
| --- | --- | --- | --- |
| SEC-02 | Público não recebe votos da segunda rodada enquanto aberta; só organizador autenticado vê os agregados completos | `app/api/live/[code]/route.ts`; telão | `tests/unit/live-public-snapshot.test.ts` e Playwright |
| SEC-03 | QR exige evento existente, não expirado e aberto; sem cache, resposta 404/410/503 conforme situação; telão busca QR validado pela API | `app/api/live/[code]/qr/route.ts`; `components/live/presentation.tsx` | `tests/unit/live-qr-route.test.ts` |
| SEC-04 | Seis objetivos publicados, 12 respostas correctas divididas entre A/B/C; remover afirmação incorreta de nove objetivos no comentário | `lib/live/content.ts` | `tests/unit/live-content.test.ts` |
| SEC-06 | Sinais Broadcast repetidos são coalescidos no cliente, com o polling de 15 s preservado | `lib/live/realtime-client.ts` | CI; ainda exige teste Realtime real |
| SEC-08 | Retenção passa a falhar sem DB; dry-run explícito; limites 1..365 no script e nova migration no banco; workflow de agendamento versionado | `scripts/retention-cleanup.mjs`, `supabase/migrations/20261123150000_lupa_retention_guard.sql`, workflow | `tests/unit/retention-script.test.ts`; agendamento real depende de secrets |
| Correção adicional | Telão usa texto e gabarito corretos do pré/revelação/pós/fechamento; não destaca gabarito durante voto | `components/live/presentation.tsx` | Playwright, inspeção visual e mobile |
| Correção adicional | Painel e exports Markdown/CSV usam alternativas realmente exibidas em cada fase; CSV tem escaping e proteção contra fórmulas | `components/live/organizer.tsx` | Teste de relatório pós com pergunta diferente, revisão manual |
| Higiene | Lint, documentação histórica, login do organizador, limpeza de comentários | `components/live`, `lib/live/db.ts`, README | CI |

## Dependências externas que NÃO podem ser marcadas como concluídas sem evidência

1. **Banco real:** criar DEV/STAGING + PROD exclusivamente para LUPA; não reutilizar banco Help. Aprovar organização, região, custo, plano de backup e responsáveis; migrations 1→2→3→4, testadas primeiro em STAGING.
2. **Auth/RLS:** criar duas organizações e identidades reais em Auth; papel owner/organizer/viewer; provar 403 em operações cross-tenant e chaves server-only.
3. **Live real:** criação de evento → QR câmera iOS/Android → votos 201 e 409 → Realtime via Broadcast → telão/organizador → pós → feedback → exportação → expurgo. Salvar evidence logs/traces com valores anonimizados.
4. **Carga e antispam:** realizar carga não destrutiva progressiva em STAGING autorizado, aferir p95, falhas, duplicidade, custos, comportamento offline e bursts de Broadcast. Limite por cookie não impede uma pessoa criar várias sessões; precisa proteção WAF/distribuída.
5. **Segurança:** CSP está Report-Only; só aplicar enforcement depois de revisar CSP compatível com Next. Verificar MFA real, controle de acesso, logs, backup/restore e penteste OWASP em STAGING.
6. **Produto/ciência:** revisão independente E04/E10/E12/E16/E21; piloto de compreensão 12–20 usuários com n real; não apresentar observações como efeito clínico ou causal.
7. **Operação:** Vercel produção/Preview não acessível à conexão consultada; conferir projeto, environment variables e SHA implantado. Merge automático **não** deve ser assumido como deploy validado.
8. **UX/UI:** validar física e manualmente 1440/1280/768/390/360, iPhone Safari, Android Chrome, VoiceOver, TalkBack, QR do telão à distância, rede compartilhada, zoom e desconexão.
9. **Produto futuro:** múltiplas perguntas no mesmo evento ainda não existem; há 6 objetivos com uma pergunta pré e outra pós por sessão. LUPA Academy e plataforma comercial multi-tenant completa são roadmap, não entregas atuais.

## Agendamento de retenção — passos necessários

- Aprovar se a retenção de 30 dias atende à política de privacidade aprovada e a qual banco se aplica.
- Configurar **GitHub Actions secrets** `LUPA_RETENTION_SUPABASE_URL` e `LUPA_RETENTION_SUPABASE_SECRET_KEY` exclusivos do projeto LUPA PROD, jamais em arquivos públicos.
- Aplicar migrations e testar `lupa_cleanup_expired_records(30)` em STAGING com backup e contagens antes/depois. Garantir que nenhum registro ativo seja removido.
- Fazer workflow_dispatch com dry_run=true; validar logs de "nenhuma operação destrutiva".
- Fazer execução de teste com dados expirados artificiais em STAGING; conferir cascades para votos/feedback e limite anterior 24h.
- Após revisão/merge, verificar primeira execução `schedule` e alertas. Ausência de credenciais deve produzir falha explícita, não "0 removidos".
- O workflow só agenda o job na main após merge. **Nenhuma migração, remoção ou job remoto foi executado nesta correção de código.**

## Critério de merge

Somente após CI de head completamente verde, revisão visual/funcional do novo telão e exportações e checagem de que não há breaking changes no site público. Integração com DB e credenciais reais é etapa posterior com aceite de infraestrutura.

### Adendo Realtime — prevenção de avalanche em plateias grandes

- Organizador/telão: seguem canal público `live:<code>` para invalidações de votos e fase.
- Participantes móveis: passam a assinar apenas `live-phase:<code>`, que recebe **somente mudanças de fase**, sem um evento por voto.
- Polling de 15 s permanece como fallback; não há promessa de latência fixa sem medição de STAGING.
- A migração `20261123153000_lupa_phase_broadcast.sql` adiciona o aviso de fase; aplicá-la antes de testar novos clientes. Se faltar, os participantes avançam por fallback, com possível atraso.
- A fase ainda usa GET com snapshot autorizado; nenhum voto, hash ou gabarito secreto segue no Broadcast.

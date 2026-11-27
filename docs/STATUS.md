# Estado do LUPA Saúde — 26/11/2026

> Fonte de verdade atual. Tudo marcado como **verificado** tem comando e resultado registrados. Itens **pendentes**
> não foram executados. Histórico anterior em `docs/historico/STATUS_2026-11-08.md`.

## Resumo

| Parte | Código | Testes | Produção (`lupaa.vercel.app`) |
|---|---|---|---|
| Atlas de evidências | Completo | Verificado (unitários, páginas reais, E2E, axe) | Funcionando (versão anterior; esta versão **ainda não publicada**) |
| LUPA Live | Completo | Verificado com Postgres real + **Supabase simulado** | **Não implantado** (banco não provisionado) |
| `/live/demo` | Completo, votos fictícios rotulados | Verificado (E2E) | Funcionando (versão anterior ainda exibe o "Delta de Aprendizado" fabricado até o deploy) |

## Verificação executada em 26/11/2026 (contêiner Linux, Node 22.23, pnpm 10.18.0)

| Verificação | Comando | Resultado |
|---|---|---|
| Instalação | `pnpm install --frozen-lockfile` | OK |
| Lint | `pnpm run lint` | 0 erros, 0 avisos |
| Tipos | `pnpm run typecheck` | 0 erros |
| Vitest (com Postgres) | `LUPA_PG_TEST_URL=… pnpm test` | **253/253** em 36 arquivos (sem a variável: 245 + 8 pulados) |
| Build | `pnpm run build` | OK |
| Smoke HTTP | `node scripts/smoke.mjs http://127.0.0.1:3010` | 23 PASS + aviso "Live não está pronto" (esperado sem banco) |
| Playwright + axe | `pnpm run test:e2e` (5 larguras, Chromium) | **350/350**, zero violações de CSP |
| E2E do Live com banco | `node scripts/test-live-stack.mjs` | **4/4** (health, senha errada, fluxo completo, isolamento) |
| Dependências | `pnpm audit` (produção **e** desenvolvimento) | Nenhuma vulnerabilidade conhecida |
| Cobertura (Vitest, v8) | medida com plugin temporário | 51,0% das linhas (antes 36,6%); telas reais `components/routes` 56,4% (antes 7,0%) |

Observação: o Chromium usado foi o 1243 pré-instalado no contêiner; o projeto fixa 1248 (`@playwright/test` 1.64.1).
A CI (`.github/workflows/ci.yml`) foi atualizada com um job de Postgres, mas **não foi executada no GitHub** nesta remediação.

## Pendente (não executado)

- **Publicar esta versão** na Vercel e repetir o smoke em produção.
- **Provisionar o Supabase do Live** (`docs/IMPLANTACAO_LIVE.md`) e validar com Auth, e-mail e Realtime **reais**.
- **Revisão clínica independente**: nenhuma. Os 50 registros seguem `candidate`.
- **Teste com usuários**: não executado. Ferramenta pronta: `docs/validation/modelo-respostas-piloto.csv` + `scripts/pilot-report.mjs`.
- **Aparelhos físicos** (iPhone Safari, Android Chrome), VoiceOver/TalkBack, Lighthouse, Firefox/WebKit.
- **Carga** e proteção de borda (WAF/CAPTCHA) para eventos grandes.
- **Vídeo de contingência** e ensaio cronometrado do pitch.

## Cautelas que não podem ser removidas

- 50 registros são candidatos; 55 IDs incluem aliases.
- DXA mede massa magra, não força nem sarcopenia; OR não é risco absoluto.
- Nenhuma ligação causal medicamento → UTI; cenários 2031/2036/2041 são hipotéticos.
- Pedido de avaliação à Conitec não é incorporação ao SUS.
- A demonstração do Live usa votos fictícios e não mede aprendizagem.

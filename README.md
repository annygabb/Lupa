# LUPA Saúde — MVP científico (Hack Brasil 2026)

Plataforma educacional sobre medicamentos para emagrecimento (tirzepatida, semaglutida e similares), composição
corporal, saúde mental e cuidados críticos. O LUPA separa **dado observado, associação e cenário hipotético** e
**recusa conclusões que os estudos não sustentam** (ex.: "25% do peso perdido foi massa magra" ≠ "perdeu 25% dos músculos").

**Público:** estudantes e profissionais em formação em saúde. **Não** é ferramenta de diagnóstico ou prescrição.

Estado atual, verificado e com pendências: **[docs/STATUS.md](docs/STATUS.md)**.

## O que funciona hoje

| Parte | Situação |
|---|---|
| **Atlas de evidências** (rotas abaixo, sem banco) | Funcionando no site publicado `https://lupaa.vercel.app` |
| **LUPA Live** (login institucional, organizador, QR, votação, telão, feedback) | Funcionando **em ambiente de teste** (Postgres real + Supabase simulado). **Não implantado** em produção: lá as telas informam "LUPA Live indisponível neste ambiente". Ver [docs/IMPLANTACAO_LIVE.md](docs/IMPLANTACAO_LIVE.md). |
| **Demonstração do Live** (`/live/demo`) | Simulação no navegador com **votos fictícios**, sem banco |

### Rotas

| Rota | O que faz |
|---|---|
| `/` | Evidence Lens: 6 afirmações curadas com fonte, limites e bloqueios (`?afirmacao=<id>`) |
| `/evidencias`, `/evidencias/[id]` | 50 registros canônicos (55 IDs de origem), busca, filtros e Passaporte com exportação JSON/Markdown |
| `/comparar` | Comparador explicável (`?a=&b=`) que bloqueia somar resultados de estudos diferentes |
| `/musculos-uti`, `/saude-mental` | Investigações guiadas com a lacuna causal explícita |
| `/projecoes` | Cenários **hipotéticos** editáveis (`lupa-flow-v2`), sensibilidade e exportação CSV/JSON |
| `/metodologia` | Protocolo, níveis de evidência e os 17 bloqueios de projeção |
| `/experiencias`, `/corpo-evidencia`, `/relatos`, `/desafio`, `/impacto`, `/dossie` | Experiências educativas; `/relatos` **nunca** envia dados ao servidor |
| `/live`, `/live/[code]`, `/live/apresentacao/[code]`, `/live/organizador`, `/login`, `/recuperar-acesso` | LUPA Live (precisa de Supabase) |
| `GET/POST /api/interpretar` | Interpretação determinística (sem IA) |
| `/api/health`, `/api/live/health` | Estado do serviço e prontidão real do Live |

## Executar localmente

Pré-requisitos: Node.js 22 (`.nvmrc`) e pnpm 10.18 (`packageManager`).

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Abrir `http://localhost:3000`. O atlas funciona sem configuração. Para experimentar o Live **sem banco**, em memória
(apaga ao reiniciar, nunca em produção):

```bash
LUPA_LIVE_ALLOW_LOCAL_DEMO=true LUPA_LIVE_SIGNING_SECRET=$(openssl rand -hex 32) pnpm dev
```

e abrir `/live/CAFE2026BEEF` (sessão de demonstração local). Login e organizador exigem Supabase.

## Verificações

```bash
pnpm run lint
pnpm run typecheck
pnpm test                    # Vitest (os testes com Postgres são pulados sem LUPA_PG_TEST_URL)
pnpm run build
pnpm run test:e2e            # Playwright + axe em 5 larguras; requer build e `pnpm exec playwright install chromium`
```

Testes do Live **com banco** (Postgres descartável; o nome do banco precisa conter `test` ou `e2e`, pois ele é apagado):

```bash
LUPA_PG_TEST_URL=postgres://usuario@127.0.0.1:5432/lupa_e2e node tests/support/prepare-db.mjs
LUPA_PG_TEST_URL=postgres://usuario@127.0.0.1:5432/lupa_e2e pnpm exec vitest run tests/integration/live-supabase-stack.test.ts
LUPA_PG_TEST_URL=postgres://usuario@127.0.0.1:5432/lupa_e2e node scripts/test-live-stack.mjs   # E2E no navegador
```

Esses testes usam um **simulador** de PostgREST/GoTrue (`tests/support/fake-supabase.mjs`) sobre Postgres real com as
migrações do repositório. Eles não substituem a validação no Supabase real.

Smoke HTTP (21 rotas + health). Avisa quando o Live não está pronto; com `SMOKE_REQUIRE_LIVE=1`, falha:

```bash
node scripts/smoke.mjs https://lupaa.vercel.app
```

A CI (`.github/workflows/ci.yml`) roda lint, tipos, Vitest, build, smoke, Playwright + axe, auditoria de dependências
e um job com Postgres para o Live.

## Arquitetura

Monólito modular em Next.js 16 (App Router), React 19, TypeScript e Zod. Domínio puro em `features/`, telas em
`components/routes/`, Live em `components/live/` + `lib/live/` + `supabase/migrations/`. Detalhes em
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) e ADRs em `docs/adr/`.

## Limites científicos indispensáveis

- **50 referências não são 50 revisões clínicas aprovadas.** Todos os registros estão como `candidate`; nenhum foi revisado
  por especialista independente.
- Os indicadores M01–M05 foram conferidos no artigo original, sem revisão clínica independente; nenhum está liberado para projeção.
- **Massa magra por DXA não é força nem diagnóstico de sarcopenia.** Os estudos de UTI não mostram efeito do medicamento sobre UTI.
- `/projecoes` mostra **cenários hipotéticos**, não previsões para o Brasil nem cobertura do SUS.
- Pedido de avaliação à Conitec não é incorporação ao SUS.
- **Nenhum teste com usuários foi feito ainda.** O protocolo está em `docs/validation/`, e `scripts/pilot-report.mjs`
  gera o relatório a partir de respostas reais.

## Documentação

- [Estado atual](docs/STATUS.md) · [Remediação da auditoria](docs/REMEDIACAO_AUDITORIA_2026-11-26.md) · [Índice](docs/LEIA_PRIMEIRO.md) · [Roteiro de demonstração](docs/DEMONSTRACAO.md)
- [Implantação do Live](docs/IMPLANTACAO_LIVE.md) · [Arquitetura](docs/ARCHITECTURE.md) · [Metodologia](docs/METHODOLOGY.md)
- [Pitch de 3 minutos](docs/pitch/ROTEIRO_3_MIN.md) · [Perguntas difíceis](docs/pitch/PERGUNTAS_DIFICEIS.md)
- [Changelog](docs/release/CHANGELOG.md) · Histórico das etapas: `docs/historico/`

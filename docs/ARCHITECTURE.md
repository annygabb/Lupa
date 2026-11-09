# Arquitetura — LUPA Saúde 2.0

> Atualizado em 08/11/2026 (branch `redesign/site-novo`). Decisões registradas em `docs/adr/`.

## Visão geral

Monólito modular em **Next.js 16 App Router** (React 19.3, TypeScript, Zod 4), sem banco, sem autenticação e sem dados pessoais (ADR 0001). Domínio puro e testado em `features/`; interface e API consomem as mesmas funções.

```text
app/
  page.tsx                    Home + Evidence Lens
  evidencias/ [id]/           Explorador (herbário) e Passaporte da Evidência
  comparar/                   Comparador explicável (?a=&b=)
  musculos-uti/ saude-mental/ Módulos temáticos
  projecoes/                  Brasil × EUA + laboratório de cenários e sensibilidade
  metodologia/                Protocolo, níveis de evidência e bloqueios explicados
  api/health/                 Estado mínimo do serviço
  api/interpretar/            Evidence Engine (POST, Zod, allowlist)
components/
  atlas/                      Sistema de design e primitivas de movimento (ver README)
  routes/<rota>/              Componentes de cada rota
features/
  evidence/                   Catálogo unificado, aliases, busca, contratos, projection-guard, passport
  comparison/                 assessStudyComparison, indicadores M01–M05, parâmetros A/B
  interpretation/             Afirmações curadas, interpretClaim, cópia dos bloqueios
  scenarios/                  Motor lupa-flow-v2 e análise de sensibilidade
  ingestion/                  Pipeline PubMed (dry-run, candidatos)
scripts/sync-pubmed.mjs       CLI do dry-run (nunca escreve no catálogo)
tests/unit · tests/integration · tests/e2e
```

## Fluxo de dados

1. **Catálogo** (`features/evidence/*.seed.json`) → `unified-catalog.ts` colapsa aliases (55 IDs de origem → 50 registros canônicos).
2. **Regras**: `assessStudyComparison()` (compatibilidade, nunca agrega números entre estudos) e `assessProjectionEligibility()` (17 códigos de bloqueio).
3. **Interpretação** (`interpretClaim`): afirmação curada + regras → classificação mais rigorosa, fontes, limites, bloqueios e status de revisão. Roda no navegador (Lens) e na API.
4. **Cenários**: `runScenario()` puro e determinístico; `runSensitivity()` varia uma premissa por vez reutilizando o mesmo motor.
5. **Exportações**: Passaporte (JSON/Markdown, `passport-v1`) e cenários (CSV/JSON com `modelVersion`, `kind: hypothetical_illustration`, `exportedAt`).

## Segurança

- Cabeçalhos: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` e CSP em **Report-Only** (`next.config.ts`).
- `/api/interpretar`: só `application/json`, corpo ≤ 1 KB, esquema estrito, IDs em allowlist, erros sem detalhes internos.
- Nenhuma chave no cliente; ingestão PubMed só por workflow manual, sem escrita no catálogo.

## Reprodutibilidade

`pnpm-lock.yaml` versionado, `packageManager: pnpm@10.18.0`, `.nvmrc` = 22, CI com `pnpm install --frozen-lockfile`.

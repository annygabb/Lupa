# ADR 0001 — Monólito modular em Next.js, sem banco nem serviços externos

- **Status:** aceita
- **Data:** 08/11/2026
- **Contexto da decisão:** LUPA Saúde 2.0, entrega do Hack Brasil em 30/11/2026

## Contexto

O LUPA serve dados científicos públicos e versionados (catálogo de 50 registros canônicos / 55 IDs de origem), regras determinísticas (compatibilidade, elegibilidade de projeção, interpretação de afirmações) e um motor de cenários puro (`lupa-flow-v2`). Não há contas, dados pessoais, escrita concorrente nem integrações que exijam estado no servidor.

## Decisão

Manter um **monólito modular** no Next.js App Router:

| Camada | Pasta | Responsabilidade |
|---|---|---|
| Domínio | `features/evidence`, `features/comparison`, `features/interpretation`, `features/scenarios`, `features/ingestion` | Regras puras, contratos Zod, testes unitários |
| API | `app/api/health`, `app/api/interpretar` | Fronteiras HTTP finas, validação de entrada, erros sem stack trace |
| Interface | `app/*`, `components/atlas`, `components/routes/*` | Apresentação; consome o mesmo domínio (sem regra duplicada) |
| Ingestão | `scripts/` + workflow manual | Pipeline PubMed somente em dry-run, gera candidatos para revisão humana |

Não adicionar banco SQL, Supabase, autenticação, filas, Redis ou microsserviços sem necessidade comprovada **e** autorização explícita.

## Consequências

- Deploy simples e barato (estático + funções leves), testes rápidos e reprodutíveis.
- A mesma função de domínio roda no navegador (Evidence Lens) e na API (`/api/interpretar`), evitando divergência.
- Se surgir necessidade real (ex.: curadoria colaborativa com autenticação), registrar nova ADR antes de introduzir infraestrutura.

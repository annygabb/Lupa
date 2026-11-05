# LUPA Saúde

MVP do **Hack Brasil 2026**, na trilha Saúde & bem-estar. O produto organizará evidências científicas sobre medicamentos para emagrecimento, composição muscular e estudos de UTI, além de explorar cenários populacionais transparentes.

> **Etapas 1, 2, 3A e interface do Explorador Científico concluídas em código.** A página `/evidencias`, a busca/filtros interativos e as fichas `/evidencias/[id]` foram implementadas com catálogo local. O **motor de projeções** e a revisão científica integral **ainda não estão prontos**.

## Executar localmente

Pré-requisitos: Node.js 22 e pnpm 10 (veja [pnpm](https://pnpm.io/installation)).

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

O `GET /api/health` informa `status: ok`, `stage: foundation` e `database: not-configured`. Esse status não indica que os módulos científicos estejam prontos.

## Stack e organização

- **Next.js App Router + TypeScript**, React e Tailwind CSS v4.
- Componentes de base no padrão shadcn/ui, configurados por `components.json`; Radix e Lucide.
- Vitest para testes; GitHub Actions para lint, tipagem, testes e build.
- `app/`: navegação, Explorador `/evidencias`, fichas estáticas `/evidencias/[id]` e Route Handlers.
- `components/`: UI e páginas-base.
- `lib/`: funções e contratos independentes.
- `features/evidence/`: contratos de dados, catálogo inicial de 14 referências, 41 fontes complementares, 50 registros canônicos, filtros locais e Evidence Guard (sem projeções executadas).
- `tests/`: testes automatizados.
- `docs/`: arquitetura, metodologia e acompanhamento.

Supabase e Vercel fazem parte da arquitetura aprovada, **mas não foram configurados** e não existe deploy nesta etapa.

## Integridade

Sem dados reais de pacientes, sem prescrições ou diagnósticos automáticos. A relação entre perda de massa magra e prognóstico na UTI não é considerada causal por este projeto. Estudos e taxas deverão passar por revisão antes de alimentar cálculos.

O repositório foi criado após 04/11/2026 às 21h (Brasília), no período permitido pelo hackathon.

## Situação técnica

A execução de qualidade do GitHub Actions passou em todas as etapas em 05/11/2026: [ver execução](https://github.com/annygabb/Lupa/actions/runs/42055453543). Como não há lockfile no primeiro scaffold, a instalação da CI usa `pnpm install --no-frozen-lockfile`; gerar e versionar o lockfile será uma melhoria da próxima revisão.

Veja também [ETAPA 3B — interface](docs/ETAPA3B_INTERFACE.md), [STATUS](docs/STATUS.md), [ARQUITETURA](docs/ARCHITECTURE.md), [METODOLOGIA](docs/METHODOLOGY.md) [ETAPA 2 — contratos](docs/ETAPA2_CONTRATOS.md) e [ETAPA 3A — curadoria](docs/ETAPA3A_CURADORIA.md).

Todas as 50 referências consolidadas estão como candidatas e nenhuma pode alimentar projeções clínicas sem revisão humana por desfecho. CI da Etapa 3A: https://github.com/annygabb/Lupa/actions/runs/42071805210.

## Verificação da interface (05/11/2026)

A CI executou instalação, lint, TypeScript, **39 testes automatizados em cinco suítes** e build Next.js, com 55 rotas estáticas de fichas geradas (50 canônicas + cinco aliases).
[Ver execução aprovada](https://github.com/annygabb/Lupa/actions/runs/42074249386).

A execução automática não substitui teste visual em navegador e mobile; o projeto **não foi publicado**.

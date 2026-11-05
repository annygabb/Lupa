# LUPA Saúde

MVP do **Hack Brasil 2026**, na trilha Saúde & bem-estar. O produto organizará evidências científicas sobre medicamentos para emagrecimento, composição muscular e estudos de UTI, além de explorar cenários populacionais transparentes.

> **Etapas 1–4B (Explorador, Comparador e refinamento visual) concluídas em código.** A página `/evidencias`, a busca/filtros interativos e as fichas `/evidencias/[id]` foram implementadas com catálogo local. O **motor de projeções** e a revisão científica integral **ainda não estão prontos**. Na Etapa 4, cinco indicadores de três publicações foram confrontados com as fontes primárias e disponibilizados apenas para comparação descritiva.

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
- `features/evidence/`: contratos, 50 registros científicos, filtros e Evidence Guard.
- `features/comparison/`: indicadores conferidos nas fontes, avaliação de compatibilidade e bloqueio de combinação numérica entre estudos.
- `tests/`: testes automatizados.
- `docs/`: arquitetura, metodologia e acompanhamento.

Supabase e Vercel fazem parte da arquitetura aprovada, **mas não foram configurados** e não existe deploy nesta etapa.

## Integridade

Sem dados reais de pacientes, sem prescrições ou diagnósticos automáticos. A relação entre perda de massa magra e prognóstico na UTI não é considerada causal por este projeto. Estudos e taxas deverão passar por revisão antes de alimentar cálculos.

O repositório foi criado após 04/11/2026 às 21h (Brasília), no período permitido pelo hackathon.

## Situação técnica

A execução de qualidade do GitHub Actions passou em todas as etapas em 05/11/2026: [ver execução](https://github.com/annygabb/Lupa/actions/runs/42055453543). Como não há lockfile no primeiro scaffold, a instalação da CI usa `pnpm install --no-frozen-lockfile`; gerar e versionar o lockfile será uma melhoria da próxima revisão.

Veja também [ETAPA 4 — comparador](docs/ETAPA4_COMPARADOR.md), [ETAPA 3B — interface](docs/ETAPA3B_INTERFACE.md), [STATUS](docs/STATUS.md), [ARQUITETURA](docs/ARCHITECTURE.md), [METODOLOGIA](docs/METHODOLOGY.md) [ETAPA 2 — contratos](docs/ETAPA2_CONTRATOS.md) e [ETAPA 3A — curadoria](docs/ETAPA3A_CURADORIA.md).

Todas as 50 referências consolidadas estão como candidatas e nenhuma pode alimentar projeções clínicas sem revisão humana por desfecho. CI da Etapa 3A: https://github.com/annygabb/Lupa/actions/runs/42071805210.

## Verificação da interface (05/11/2026)

A CI executou instalação, lint, TypeScript, **39 testes automatizados em cinco suítes** e build Next.js, com 55 rotas estáticas de fichas geradas (50 canônicas + cinco aliases).
[Ver execução aprovada](https://github.com/annygabb/Lupa/actions/runs/42074249386).

A execução automática não substitui teste visual em navegador e mobile; o projeto **não foi publicado**.

## Comparador Científico — Etapa 4

A rota `/comparar` oferece seleção entre estudos, contexto dos métodos, avisos de incompatibilidade, cinco gráficos internos às publicações e tabelas acessíveis. Estudos diferentes **não são somados**. O subestudo de massa magra não permite inferir resultado causal de UTI. Os cinco indicadores continuam bloqueados para projeções de saúde pública.

[CI da Etapa 4: 54 testes em seis suítes, lint, tipagem e build aprovados](https://github.com/annygabb/Lupa/actions/runs/42079968363). A revisão de navegação em dispositivos móveis e os testes E2E ainda são pendentes; não há deploy.

## Etapa 4B — identidade visual e UX/UI

Redesign inspirado nas três referências de dashboards de saúde enviadas pela equipe, sem copiar layouts ou imagens:
- Design system compartilhado (fundo claro, branco, azul de suporte, verde-petróleo, tipografia e estados acessíveis).
- Página inicial com status real dos módulos, cabeçalho com navegação ativa e rodapé padronizado.
- `/comparar`: cards A/B com hierarquia simplificada, resumos mais diretos e detalhamento expansível.
- Bloco de compatibilidade com veredito principal, três permissões e alertas científicos priorizados; explicações originais preservadas.
- Indicadores agrupados no desktop e `select` por categoria no mobile; gráfico com números destacados, barras e tabela equivalente.
- Dados, projeções e `assessStudyComparison` da Etapa 4 preservados; **nenhum efeito combinado entre artigos**.

Documentação completa com textos UX, tokens, responsive e checklist: [Etapa 4B — Design System UX/UI](docs/ETAPA4B_DESIGN_SYSTEM_UX_UI.md).

Os controles e o build são verificados pelo GitHub Actions; inspeção E2E em dispositivos continua pendente de validação local. **Nenhum deploy realizado.**

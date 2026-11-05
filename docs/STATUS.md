# Estado do LUPA Saúde — Interface do Explorador (05/11/2026)

| Entrega | Estado verificado |
|---|---|
| Fundação Next.js / TS / Tailwind | Concluída |
| Contratos Zod — 20 entidades / 181 campos | Código preparado, nenhuma tabela criada |
| Catálogo local E/P/R | 55 referências de origem e 50 registros canônicos |
| Identificação de cinco aliases | Testada |
| Filtros textuais e por tema, medicamento e desenho | Implementados e testados |
| Filtros de origem, ano e prioridade editorial | Implementados |
| Cards responsivos e navegação /evidencias | Implementados; build aprovado |
| Fichas /evidencias/[id] | 55 caminhos estáticos gerados, incluindo aliases |
| Links externos dos artigos | URLs originais ligadas às fichas; não foi testada resposta HTTP de cada destino |
| Alertas de curadoria e limitações | Exibidos em cards e fichas |
| Testes automatizados | **39 testes aprovados** (cinco suítes) |
| CI de lint, TypeScript e build | **Aprovada** |
| Teste E2E com browser real | Pendente |
| Supabase | **NÃO configurado** |
| SQL e migrações | **NÃO executados** |
| Vercel / deploy | **NÃO realizado** |
| Projeções epidemiológicas | **NÃO implementadas** |
| Revisão clínica fonte por fonte | **Pendente** |

Execução aprovada: https://github.com/annygabb/Lupa/actions/runs/42074249386

## Evidências e limitações

- Todos os 50 registros seguem como `candidate` e com `projectionApproved=false`.
- Os resumos foram extraídos dos documentos da equipe e não constituem validação clínica por si só.
- Prioridade P0/P1/P2 indica fila editorial; não qualidade científica.
- Não são calculadas taxas de incidência a partir de relatos espontâneos.
- Não é inferida relação causal entre tirzepatida, alteração muscular e desfechos em UTI.
- Ainda faltam conferência integral dos artigos, denominadores, braços e intervalos antes de gráficos clínicos e projeções.

## Testes e qualidade

A primeira execução de interface falhou porque o Vitest não reconhecia o alias de módulo `@/`.
O `vitest.config.ts` foi corrigido para usar o mesmo alias do projeto, e a execução subsequente passou.
A CI incluiu renderização server-side básica dos componentes e geração das rotas, mas **não** realizou teste visual ou E2E em Chrome/Safari.

Ainda é pendente gerar e versionar o `pnpm-lock.yaml` para reproduzibilidade do pipeline.

## Próximo gate

Apresentar resultados da interface à equipe e recolher feedback. **Nenhum deploy, integração Supabase, SQL ou migração** será realizado sem aprovação separada.
Documentação: [Etapa 3B — interface](ETAPA3B_INTERFACE.md), [Etapa 3A — curadoria](ETAPA3A_CURADORIA.md).

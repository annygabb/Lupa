# Estado do LUPA Saúde — Comparador Científico (05/11/2026)

| Recurso | Estado verificado |
|---|---|
| Fundação Next.js/TypeScript/Tailwind | Implementada |
| Explorador Científico | Busca, filtros e 50 registros canônicos |
| Fichas individuais | 55 rotas estáticas, com aliases |
| Comparador Científico /comparar | Implementado com dois seletores, avisos e contexto |
| Gráficos do comparador | Cinco indicadores dentro de três publicações originais |
| Tabelas acessíveis dos indicadores | Implementadas |
| Proteção contra agregação entre estudos | Implementada e coberta por testes |
| Registros aptos a projeção populacional | **Zero** |
| Revisão científica independente | **Ainda não realizada** |
| Testes de código | 54/54 aprovados em seis suítes |
| Lint, tipagem e build | Aprovados na CI de implementação |
| Testes E2E em Chrome/Safari e acessibilidade prática | Pendentes |
| Supabase | **NÃO configurado** |
| SQL e migrações | **NÃO executados** |
| Vercel | **Nenhum deploy realizado** |
| Motor de projeções populacionais | **Não implementado** |

**Evidência de CI da implementação:** https://github.com/annygabb/Lupa/actions/runs/42079968363

## Bases científicas verificadas para EXIBIÇÃO DESCRITIVA
- E04 / SURMOUNT-1 DXA (n=160; 124 tirzepatida, 36 placebo): peso, massa gorda e massa magra em 72 semanas. Fonte https://pmc.ncbi.nlm.nih.gov/articles/PMC11965027/
- E16 / SURMOUNT-4 (670 randomizados; 335 por braço): peso de semana 36 a 88, com limites de confiança. Fonte https://jamanetwork.com/journals/jama/fullarticle/2812936
- E21 / SURMOUNT 1/2/3 pós-hoc (N total=4.056): categoria PHQ-9 em grupos tirzepatida versus placebo; N por braço **não conferido** no resumo. Fonte https://pubmed.ncbi.nlm.nih.gov/41537305/
- E12 / UTI e E10 / sarcopenia foram revisados para contexto e limites de inferência, não incluídos em gráficos causais. Fontes: https://pubmed.ncbi.nlm.nih.gov/40462133/ e https://pubmed.ncbi.nlm.nih.gov/30312372/

Todos os 50 registros gerais continuam como `candidate`. Os cinco indicadores individuais têm `displayStatus="primary_source_checked"` e `approvedForPopulationProjection=false`. Isso não é revisão clínica independente.

## Tratamento das limitações
- Não somar SURMOUNT-1 e subestudos como amostras independentes.
- Massa magra por DXA não equivale a força ou sarcopenia clínica.
- OR de pacientes com baixa musculatura na UTI não equivale a risco atribuível à tirzepatida.
- Denominadores e ICs não encontrados não foram inventados.
- Gráficos mostrados somente dentro da mesma publicação; comparação de dois artigos é descritiva.
- Sem dados pessoais de pacientes.

## Qualidade
- A CI da implementação passou em 54 testes, lint, TypeScript e build.
- Foram observados dois avisos de ESLint anteriores (import não usado e export de postcss); corrigidos nesta revisão de manutenção. Conferir a CI correspondente ao commit final.
- O lockfile de pnpm ainda não foi versionado. Instalação da CI não está imutável; corrigir antes da submissão.
- Nenhum deploy ou browser E2E ocorreu nesta etapa.

## Próximos gates
Conferência visual em PowerShell / mobile da página `/comparar`; revisão metodológica humana dos indicadores antes de qualquer nova liberação; autorização separada para módulo de músculos/UTI, motor de projeções, banco ou deploy.

Documentação detalhada: [Etapa 4](ETAPA4_COMPARADOR.md), [Etapa 3A](ETAPA3A_CURADORIA.md), [Etapa 3B](ETAPA3B_INTERFACE.md).

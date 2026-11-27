# LUPA Saúde — Etapa 3A: relatório de curadoria e busca local

**05/11/2026 · Sem interface visual, banco de dados ou deploy**

## Materiais conferidos

- Repositório annygabb/Lupa: estado inicial commit f23e827.
- Catálogo local existente: 14 referências E.
- Novo documento de 15 páginas sobre PubMed, saúde mental, segurança e Brasil.
- CSV aprovado da Etapa 3: 30 referências P e 11 fontes oficiais R.
- Documento do planejamento da Etapa 3 e regras da Etapa 2.

## Consolidação realizada

| Indicador | Total |
|---|---:|
| Registros locais anteriores E | 14 |
| Referências P adicionadas para curadoria | 30 |
| Fontes oficiais R adicionadas para curadoria | 11 |
| Aliases exatos (mesma referência) | 5 |
| Referências canônicas resultantes | **50** |
| Prontas para projeção | **0** |

Aliases exatos: P12→E01; P20→E04; P22→E16; P03→E21; R01→E25.

**50 referências distintas não são 50 estudos independentes**. SURMOUNT-1 (E01/E04/P04), SURMOUNT-4 (E16/P23) e P25/P26 pertencem a famílias com amostras relacionadas. P01 é metanálise de ECRs que podem já estar representados por ensaios catalogados. O sistema não calcula N agregado.

## Verificação externa pontual (metadados e resumos)

- P01 — PMID 40366681: https://pubmed.ncbi.nlm.nih.gov/40366681/ (80 ECRs; 107.860 participantes, qualidade de vida mental com efeito pequeno).
- P03/E21 — PMID 41537305: https://pubmed.ncbi.nlm.nih.gov/41537305/ (pós-hoc SURMOUNT; 4.056 participantes, exclusões psiquiátricas relevantes).
- P24 — PMID 41796096: https://pubmed.ncbi.nlm.nih.gov/41796096/ (estudo de vigilância brasileira; dados de consumo e notificações não são incidência clínica).

A conferência de indexação desses três não valida todos os seus resultados. **As outras 38 referências complementares ainda precisam de conferência individual nos originais e análise de vigência dos atos oficiais.** Todas as 50 permanecem candidatas, sem aprovação para projeção.

## Arquivos implementados

- features/evidence/supplemental.seed.json — 41 registros documentais, com origem e status bloqueado.
- features/evidence/supplemental.ts — schema Zod e validação do lote.
- features/evidence/normalization.ts — normalização textual e de links.
- features/evidence/unified-catalog.ts — consolidação, aliases e famílias.
- features/evidence/search.ts — busca sem acento, filtros combinados e paginação.
- features/evidence/priorities.ts — fila de curadoria de 15 referências.
- tests/unit/evidence-stage3a.test.ts e tests/unit/evidence-priorities.test.ts — testes automáticos.

Nenhum arquivo da interface foi editado. Nenhum banco ou deploy foi configurado.

## Fila sugerida: 15 referências a revisar

| ID | Prioridade de conferência |
|---|---|
| E01 / P12 | Ensaio SURMOUNT-1: amostras, braços, efeitos |
| E04 / P20 | DXA: proporção massa gorda/magra, não porcentagem de músculo |
| E10 | Critérios de sarcopenia, força, quantidade e função |
| E11 | Sarcopenia e representatividade no Brasil |
| E12 | Baixa massa muscular e desfechos em UTI; associação |
| E16 / P22 | Retirada e continuidade da tirzepatida |
| E21 / P03 | PHQ-9, C-SSRS, N e exclusões |
| P01 | Metanálise de saúde mental e subgrupos |
| P02 | Saúde mental na semaglutida |
| P04 | Qualidade de vida, família SURMOUNT-1 |
| P06 | Apetite e comportamento alimentar |
| P15 | Vesícula e risco relativo/absoluto |
| P16 | Pâncreas e eventos raros |
| P24 | Brasil: acesso, consumo e segurança |
| P25 | Estigma e alimentação emocional no Brasil |

## Gate de validação antes da interface

1. Confirmar título, DOI/PMID, população, delineamento, patrocínio e ano no artigo original; para órgãos oficiais, data e vigência.
2. Revisar N randomizado/analisado, braços, período, estimador, IC e página/tabela, quando houver dado quantitativo.
3. Detectar subamostras sobrepostas; não somar metanálises, ensaios e subestudos.
4. Registrar revisão humana por desfecho; publicar números somente depois de aprovação específica.
5. Não calcular incidência a partir de notificação; não transformar RR/OR/HR em percentual simples.
6. Não atribuir efeitos na UTI à tirzepatida com base apenas em pesquisas independentes.
7. Não tratar solicitação à Conitec como incorporação aprovada ao SUS.

## Próximas etapas NÃO autorizadas

- Criar ou substituir a interface /evidencias.
- Importar essas fontes para Supabase, criar SQL ou aplicar migrações.
- Criar gráficos a partir de resumos ainda não revisados.
- Efetuar deploy em Vercel ou publicar dados de pacientes.

Próxima decisão do usuário: conferir este relatório e autorizar explicitamente a próxima etapa de UX/UI, se estiver de acordo.

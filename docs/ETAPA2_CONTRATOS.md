# Etapa 2 — Contratos TypeScript e catálogo científico local

**Estado:** proposta implementada sem banco de dados, migração ou deploy.

## Escopo implementado
- `features/evidence/contracts.ts`: 20 contratos Zod estritos derivados das 181 definições de campo do dicionário aprovado. Os nomes seguem as tabelas documentadas; são contratos de aplicação, não comandos SQL.
- `features/evidence/catalog.seed.json`: 14 registros prioritários originais do CSV da Etapa 2, preservando título, ano, URL, descrição amostral, resultados resumidos, limites, família e nota de conferência.
- `features/evidence/catalog.ts`: leitura tipada, busca local e detecção de famílias possivelmente sobrepostas.
- `features/evidence/projection-guard.ts`: decisão determinística e explicável de bloqueio de projeções inadequadas, validada por testes.
- `tests/unit/evidence.test.ts`: verificações de integridade, fontes, aprovação, denominadores, duplas contagens e relação entre medicamento e UTI.

## O que estes arquivos NÃO fazem
- Não criam tabelas nem se conectam ao Supabase.
- Não chamam APIs externas nem executam LLM.
- Não processam dados de pacientes.
- Não fazem projeções, diagnósticos ou prescrições.
- Não declaram 14 referências clinicamente aptas: **todas começam como candidatas, com `projectionApproved=false`**.

## Regras de curadoria
1. Texto resumido do dossiê não substitui conferência do artigo completo.
2. `sourceVerificationNote` preserva o status do CSV; mesmo "artigo/resumo original conferido" não é revisão de todos os números e populações.
3. E01 e E04 pertencem à família SURMOUNT-1; não somar como estudos independentes.
4. E23 (FAERS) não fornece incidência por população exposta; E25/E26 são documentos regulatórios.
5. Metanálises de UTI não demonstram causalidade da tirzepatida sobre prognóstico hospitalar.
6. `Evidence Guard` exige revisão para projeção, rastreabilidade, amostra/denominador conforme o indicador, unidade, horizonte e compatibilidade populacional.
7. Um OR não pode ser tratado como risco absoluto sem base comparável; nenhuma porcentagem de massa magra é multiplicada por risco de mortalidade em UTI.

## Próximos passos pendentes de aprovação
- Validação científica integral de cada extração (numeradores, denominadores, braços, duração, tabelas/figuras, intervalos).
- Preparação de observações estruturadas aptas para gráficos, incluindo aprovação humana por desfecho.
- Deliberação sobre migration SQL, Supabase, CI com lockfile e deploy.

**Referências:** `01_Etapa2_Modelagem_Completa.pdf`, `03_estudos_iniciais_14.csv`, `04_dicionario_dados_completo.csv` (arquivos de planejamento aprovados).

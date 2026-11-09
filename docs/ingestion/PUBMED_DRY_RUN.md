# Pipeline PubMed em dry-run (P1 · BE-02 + BE-03)

O dry-run consulta o PubMed (NCBI E-utilities), normaliza **metadados bibliográficos**, compara com o
catálogo do LUPA e grava um relatório de **candidatos para revisão humana**. Ele **nunca** altera o
catálogo de produção (`features/evidence/*.seed.json`) e não tem modo que o faça.

> Status de todo item do relatório: **`candidate — requer revisão humana`**.
> Metadado ingerido automaticamente continua candidato até revisão (prompt mestre, seção 8.3).

## Como rodar

```bash
npm run ingest:pubmed:dry-run                      # consulta padrão, até 20 resultados
npm run ingest:pubmed:dry-run -- --max 10 --sort pub_date
npm run ingest:pubmed:dry-run -- --query '"tirzepatide"[tiab] AND sarcopenia[tiab]'
```

- Requer Node 22.15+ (usa `--experimental-strip-types` e `module.registerHooks`; sem dependência nova).
- Saída: `reports/pubmed-dry-run/<AAAA-MM-DD>.json` e `.md` (data em UTC; pasta ignorada pelo git). Duas execuções
  no mesmo dia substituem o relatório do dia — o conteúdo é o mesmo se a resposta do PubMed for a mesma.
- Variáveis **opcionais**: `NCBI_EMAIL` (contato informado ao NCBI; nenhum e-mail é inventado) e
  `NCBI_API_KEY` (usada só se existir no ambiente; nunca impressa nem gravada no relatório — o
  relatório registra apenas `apiKeyUsed: true/false`).
- Opções aceitas: `--dry-run`, `--query`, `--max` (1–100), `--sort` (`relevance` | `pub_date`), `--help`.
  Qualquer outra opção (por exemplo `--write`) encerra com erro.

Consulta padrão:

```text
(semaglutide[tiab] OR tirzepatide[tiab]) AND (obesity[tiab] OR "body composition"[tiab] OR "mental health"[tiab])
```

### GitHub Actions

`.github/workflows/pubmed-dry-run.yml` roda **apenas por `workflow_dispatch`** (manual), com
`permissions: contents: read`, `persist-credentials: false`, sem push, sem PR e sem secrets obrigatórios.
Ao final confere `git diff --exit-code -- features/evidence` e publica `reports/pubmed-dry-run/` como
artifact `pubmed-dry-run-report` (14 dias). As entradas do formulário chegam ao script por variáveis de
ambiente (sem interpolação no shell). `vars.NCBI_EMAIL` e `secrets.NCBI_API_KEY` são opcionais.

## Como funciona

| Módulo | Papel |
|---|---|
| `features/ingestion/pubmed-client.ts` | `esearch` + `esummary` (JSON), `tool=lupa-saude`, fila serial com intervalo mínimo, lotes, timeout, retry |
| `features/ingestion/normalize.ts` | Zod nas respostas; normaliza PMID, DOI, PMCID, título, ano, periódico, autores, tipos de publicação |
| `features/ingestion/dedupe.ts` | Compara com o catálogo unificado (50 canônicos / 55 fontes) por PMID e URL normalizada |
| `features/ingestion/report.ts` | Relatório JSON + Markdown, hash de conteúdo, caminhos de saída validados |
| `features/ingestion/run.ts` | Orquestra consulta → normalização → dedupe → relatório (sem tocar em disco) |
| `scripts/sync-pubmed.mjs` | CLI: carrega o TS via type stripping, grava só em `reports/pubmed-dry-run/` |

### Limite de taxa e resiliência

- **Sem chave:** no máximo 3 requisições/s (intervalo mínimo de 334 ms entre envios).
  **Com chave:** até 10/s (100 ms). O intervalo pode ser aumentado, nunca reduzido abaixo disso.
- Fila **serial**: nenhuma requisição concorrente ao NCBI.
- Paginação do `esearch` por `retstart`/`retmax`; `esummary` em lotes (padrão 20 IDs).
  Teto rígido de 200 resultados no código e 100 na CLI; padrão 20.
- Timeout por requisição (15 s, `AbortController`).
- Retry com **backoff exponencial + jitter** (`500 ms · 2^(n−1) + aleatório`) para 429, 5xx, timeout e
  falha de rede; respeita `Retry-After`; **máximo 3 tentativas**. 4xx não transitórios não são repetidos.
- Erros tipados (`IngestionError`: `RATE_LIMITED`, `SERVER_ERROR`, `TIMEOUT`, `NETWORK`,
  `MALFORMED_RESPONSE`, `RETRIES_EXHAUSTED`, `HTTP_ERROR`…). Serializam só código, mensagem e contexto
  (endpoint, status, tentativas) — sem stack, sem URL com `api_key`/`email`.
- Resposta malformada: envelope inválido vira `MALFORMED_RESPONSE`; um documento ruim no `esummary`
  vira erro do item e o lote continua; um lote com falha não derruba os demais. Tudo vai para a seção
  **Erros** do relatório.

### Deduplicação

Cada candidato é comparado com `unifiedEvidenceCatalog` por:

1. PMID (do campo `pmid` e das URLs PubMed de cada fonte, via `extractPubmedId`);
2. URL normalizada (`normalizeEvidenceUrl`) do PubMed, do PMC (`pmc.ncbi.nlm.nih.gov/articles/PMCxxxx/`)
   e do DOI (`doi.org/...`).

| Classificação | Quando | Exemplo real do catálogo |
|---|---|---|
| `already_cataloged` | Coincide com a fonte canônica do registro | PMID 35658024 → **E01** |
| `alias_known` | Coincide só com uma fonte-alias | PMID 39996356 → **E04** via **P20** (E04 aponta para o PMC) |
| `new_candidate` | Não encontrado | entra na fila de revisão; nunca no catálogo |

Se o `esummary` trouxer o PMCID do artigo, a URL PMC de E04 também casa e o item passa a
`already_cataloged` (fontes E04 e P20). O relatório mostra sempre `lupaId`, `matchedSourceIds` e `matchedBy`.

### Idempotência

- Candidatos deduplicados por PMID e ordenados por PMID; erros ordenados; chaves do JSON estáveis.
- `contentHash` = sha256 do relatório **sem** `generatedAt`. Mesma resposta do PubMed (em qualquer
  ordem) → mesmo hash e mesmo conteúdo; só a data muda. Coberto por teste.
- A resposta do PubMed pode mudar com o tempo (novos artigos, reindexação); nesse caso o hash muda —
  isso é o diff a revisar, não um erro.

## O que o relatório contém (e o que não contém)

Contém: consulta usada e tradução do PubMed, data, total de resultados, PMID, DOI, PMCID, título,
ano, periódico, autores (até 10 + contagem), tipos de publicação declarados pelo PubMed, link PubMed,
classificação de deduplicação, ID LUPA quando houver, erros.

**Não contém:** abstract, efeitos clínicos, tamanhos de efeito, desfechos, resumos interpretativos,
classificação de qualidade, GRADE ou qualquer "aprovação". Tipos de publicação são o rótulo do PubMed,
não uma avaliação de desenho feita pelo LUPA.

## Por que não publica nada sozinho

- Regras 1–3, 17 e 22 do prompt mestre: não inventar, não promover `candidate` a `reviewed`, IA/automação
  não revisa clinicamente.
- Metadado bibliográfico não diz se o estudo serve ao produto, se há sobreposição de coorte
  (ex.: subestudos SURMOUNT-1), se a população é comparável ou se houve retratação.
- Por isso não existe flag de escrita, os módulos de `features/ingestion` não importam `fs`, o script só
  grava em caminhos validados por `assertSafeReportPath` (recusa `features/`, `..` e extensões fora de
  `.json`/`.md`), e o workflow verifica que `features/evidence` não mudou. Testes garantem os três pontos.

## Fluxo de revisão humana

1. **Candidato** — relatório do dry-run (local ou artifact do Actions).
2. **Conferência** — abrir o PubMed e o texto original; confirmar PMID/DOI, população, desenho, data,
   status (errata/retratação) e possível família de estudo já presente no catálogo.
3. **Revisão** — revisão bibliográfica e metodológica por pessoa responsável, registrada (quem, quando, o quê).
   Revisão clínica independente é etapa separada e não é presumida.
4. **Atualização do catálogo com teste** — PR próprio editando `features/evidence/*.seed.json`
   (`curationStatus: "candidate"`, `projectionApproved: false`), ajustando os mapas de tópicos/fármaco em
   `unified-catalog.ts` e as contagens esperadas nos testes, com teste de regressão científico.
   Nunca a partir de cópia automática do relatório.

## Riscos e limites

- **Limite do NCBI:** uso abusivo pode bloquear o IP. Mitigado por fila serial, intervalo mínimo,
  backoff e execução manual. Não rodar em loop nem agendar sem decisão explícita.
- **Relevância muda:** a ordem "Best Match" do PubMed evolui; resultados diferentes entre dias são esperados.
- **Cobertura da deduplicação:** registros do catálogo que apontam só para PMC/DOI sem PMID correspondente
  podem não casar se o `esummary` não trouxer o PMCID/DOI; o revisor deve checar manualmente.
- **Fontes regulatórias** (FDA, Anvisa, DailyMed) não estão no PubMed e nunca aparecem aqui.
- **Metadados com erro na origem** (título, ano) são reproduzidos como vieram; a conferência é humana.
- **Chave de API:** só se autorizada; nunca commitar. O plano público do NCBI não tem custo; nada pago
  é ativado por este pipeline.
- **Node:** depende de type stripping (Node 22.15+); em versões antigas o script encerra com mensagem clara.
- O dry-run não substitui revisão clínica, não mede impacto e não valida o catálogo existente.

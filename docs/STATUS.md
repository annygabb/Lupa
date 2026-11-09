# Estado do LUPA Saúde — 08/11/2026 (branch `redesign/site-novo`)

> Estado verificado nesta data. Itens marcados como pendentes **não** foram executados.

## Implementado e testado

| Área | Situação |
|---|---|
| Site novo (atlas em cianotipia) | 7 rotas + 50 fichas, desktop e mobile |
| Evidence Lens (home) | 6 afirmações curadas; link compartilhável `?afirmacao=`; leva ao Passaporte, ao comparador e à fonte |
| Evidence Engine | `interpretClaim` determinístico; classificação mais rigorosa entre curadoria e regras |
| API `POST /api/interpretar` | Zod, allowlist, limite de 1 KB, 415/413/400/404 sem stack trace |
| Passaporte da Evidência | Status em 3 níveis; campos ausentes marcados; exportação JSON/Markdown (`passport-v1`) |
| Comparador explicável | Pré-seleção `?a=&b=` (aliases resolvidos); "Por que não somar estes dois resultados?" |
| Laboratório de cenários | `lupa-flow-v2` + análise de sensibilidade (uma premissa por vez); exportação com `modelVersion`, `kind`, `exportedAt` |
| Metodologia | Observação · associação · hipótese · previsão validada; 17 bloqueios explicados com exemplo E12 |
| Pipeline PubMed | Dry-run manual; candidatos para revisão humana; nunca escreve no catálogo |
| Engenharia | `pnpm-lock.yaml`, `packageManager`, `.nvmrc`, CI `--frozen-lockfile`, cabeçalhos de segurança, ADRs |

## Verificação executada (08/11/2026, local)

- `eslint .`: 0 erros · `tsc --noEmit`: 0 erros
- Vitest: **186/186** (20 arquivos, inclui integração da API)
- `next build`: 66 páginas estáticas + `/api/interpretar` e `/api/health`
- Playwright no build de produção: **260/260** em 360, 390, 768, 1280 e 1440 px, com axe WCAG A/AA
- A CI do GitHub precisa ser conferida no commit publicado.

## Pendente (não executado)

- **Revisão clínica independente**: nenhuma. Todos os 50 registros seguem `candidate`; M01–M05 apenas conferidos no artigo. Plano em `docs/evidence-review/`.
- **Teste piloto com usuários**: protocolo pronto em `docs/validation/`, não executado.
- **Aparelhos físicos** (iPhone Safari, Android Chrome), VoiceOver/TalkBack e medição Lighthouse/Web Vitals.
- **Vídeo de contingência e ensaio cronometrado do pitch** (`docs/pitch/`).
- **Workflow PubMed no GitHub**: criado, ainda não executado lá.
- Deploy no projeto `lupaa` depende do merge do PR na `main`.

## Cautelas que não podem ser removidas

- 50 registros são candidatos; 55 IDs incluem aliases.
- DXA mede massa magra, não força nem sarcopenia; OR não é risco absoluto.
- Nenhuma ligação causal medicamento → UTI; cenários 2031/2036/2041 são hipotéticos.
- Pedido de avaliação à Conitec (24/09/2026) não é incorporação ao SUS.

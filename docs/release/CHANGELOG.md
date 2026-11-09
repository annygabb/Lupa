# Changelog

## 2026-11-08 — LUPA Saúde 2.0 (branch `redesign/site-novo`)

### Produto
- Evidence Lens na home com 6 afirmações curadas e link compartilhável.
- Passaporte da Evidência nas fichas, com exportação JSON/Markdown.
- Comparador com pré-seleção por URL e explicação "por que não somar".
- Análise de sensibilidade no laboratório de cenários; exportações com versão do modelo.
- Metodologia: níveis de evidência e bloqueios de projeção explicados.

### Backend e dados
- `features/interpretation` (Evidence Engine determinístico) e `POST /api/interpretar`.
- `features/ingestion` + `scripts/sync-pubmed.mjs` (dry-run) + workflow manual.

### Engenharia
- `pnpm-lock.yaml`, `packageManager`, `.nvmrc`, CI com `--frozen-lockfile`.
- Cabeçalhos de segurança e CSP Report-Only.
- ADRs 0001 e 0002; testes de integração em `tests/integration/`.

### Documentação
- Protocolo de teste piloto (não executado), plano de revisão científica, roteiro de pitch e perguntas difíceis.

### Site
- Novo sistema visual "atlas em cianotipia" em todas as rotas (commits anteriores desta branch).

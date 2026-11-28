# Changelog

## 2026-11-28 — Revisão de código

### Interface e conteúdo
- Busca do acervo: "tirzepatida", "semaglutida" e "liraglutida" encontram os mesmos registros que o nome em inglês
  e o comercial (antes cada grafia perdia registros); plurais simples ("músculos", "UTIs", "renais") deixam de zerar
  a busca. O texto pesquisável de cada registro é calculado uma vez.
- Raio-X de manchetes: termos casam no início da palavra e termos curtos só como palavra inteira. "Ozempic é útil?"
  e "utilizar Mounjaro" não são mais classificados como manchete sobre UTI; "Anvisa aprova" não é mais marcado como
  afirmação absoluta; "comprova" passa a ser sinalizado.
- `/live/demo`: "+6 votos fictícios" (2 por alternativa). O padrão anterior de 5 votos mudava a cada clique e, como o
  gabarito muda de posição entre pré e pós, exibia diferenças de até ±20 p.p. sem nenhum voto real.
- Laboratório de cenários: apagar um campo numérico mostra o erro de validação em vez de recalcular com 0.
- Participante do Live: as notas de clareza e utilidade começam sem seleção (antes 5/5 pré-marcado).
- Movimento reduzido: animações infinitas param de piscar (`animation-iteration-count: 1`).
- Textos: telão não chama a evidência de "revisada"; participante fala em "50 referências do acervo".

## 2026-11-26 — Remediação da auditoria técnica

### LUPA Live (segurança e backend)
- Votos e feedback exigem **sessão de participante assinada** (HMAC, vinculada ao evento) e `Origin` confiável:
  scripts sem sessão recebem 403 (antes 30/30 votos por script eram aceitos).
- Limites de taxa persistentes por rede (IP pseudonimizado) para emissão de sessões e votos, e por e-mail/rede no
  login e na recuperação de acesso (nova migração `20261126120000_lupa_audit_remediation.sql`, com reversão).
- Código do evento normalizado (minúsculas aceitas) em todas as rotas; `/api/me` consulta só as organizações do usuário.
- Logs estruturados sem dados pessoais em todas as rotas (antes 18 `catch` silenciosos).
- `/api/health` reflete a configuração real; `/api/live/health` diferencia `ready`, `local-demo` e `unconfigured`.
- Motor local de desenvolvimento com as mesmas regras do banco (expiração, transição de fase, feedback, limites).

### Interface
- Telão e celular não exibem mais "Votação Aberta"/"Ao Vivo" sem sessão válida; erros distinguem serviço não
  configurado (503), sessão inexistente (404), encerrada e falta de conexão; QR mostra o motivo quando indisponível.
- Participante: estado "voto registrado"/"avaliação enviada" restaurado pelo servidor após recarregar; notas 1–5
  acessíveis (radiogroup, alvos ≥ 44 px).
- Organizador, login e entrada por código avisam quando o Live não está configurado e mostram mensagens de erro específicas.
- `/live/demo`: começa sem votos, "+5 votos fictícios" distribui igualmente no pré e no pós e o resultado é rotulado
  como ilustrativo (removido o "Delta de Aprendizado" fabricado).

### Qualidade
- Removidas ~2.500 linhas de componentes sem rota e os testes que só os renderizavam; novos testes sobre as páginas reais.
- Novos testes: segurança da sessão/origem, fluxo de API do Live, limite de login, Postgres real (migrações, RPCs, RLS)
  e E2E do Live completo no navegador com Supabase simulado; E2E do cenário sem banco e da CSP.
- CSP aplicada com endpoint de relatório; Zod sem JIT para não violar a CSP.
- Dependências sem uso removidas; `minimatch` vulnerável corrigido via override; workflow de *design skills* só manual e com versões fixadas.
- Documentação reorganizada (histórico em `docs/historico/`), README/STATUS atualizados, ADR 0003, runbook do Live,
  ferramenta de relatório do piloto (`scripts/pilot-report.mjs`).

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

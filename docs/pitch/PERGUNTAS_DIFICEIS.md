# Perguntas difíceis da banca — respostas com evidência

> Atualizado em 26/11/2026. Responder só com o que está no repositório e no site publicado.

**Por que não usar o PubMed direto?**
O PubMed localiza artigos. O LUPA organiza por pergunta, mostra população, desfecho e limites, detecta incompatibilidades
(`assessStudyComparison`) e bloqueia extrapolações (`assessProjectionEligibility`, 17 motivos). Demonstrar com E04 × E12.

**Quem revisou clinicamente?**
Ninguém ainda. Os 50 registros estão como candidatos; M01–M05 tiveram os números conferidos no artigo original.
O sistema não aceita "revisado" sem registro nominal do revisor. Plano em `docs/evidence-review/`.

**Qual impacto foi comprovado?**
Nenhum medido ainda. Há protocolo (`docs/validation/protocolo-teste-compreensao.md`), modelo de planilha e um gerador
de relatório (`scripts/pilot-report.mjs`) que só funciona com respostas reais. Só citar números se o piloto acontecer, com n e limitações.

**O LUPA Live funciona?**
Em ambiente de teste, sim: o fluxo completo (login → sessão → QR → votos → fases → feedback → exportação → exclusão) e o
isolamento entre organizações passam em testes automatizados com Postgres real e Supabase simulado. Em produção, **não está
implantado**: o banco não foi provisionado, e as telas dizem isso claramente. O `/live/demo` usa votos fictícios.

**Alguém pode fraudar a votação?**
Foi o principal achado da auditoria. Hoje o servidor exige sessão assinada emitida pelo próprio LUPA, Origin confiável e
limita sessões e votos por rede, com contadores no banco. Um atacante com muitos IPs ainda consegue votar várias vezes: sem
CAPTCHA/WAF, isso é risco residual documentado. Os votos medem a compreensão da sala, não decidem nada clínico.

**E a privacidade?**
Participantes não criam conta. Votos usam pseudônimo de sessão (HMAC); IP e e-mail nunca são gravados em claro (só HMAC nos
limites de taxa). `/relatos` não envia nada ao servidor. Feedback é só 1–5, e o organizador vê médias apenas com 5 ou mais respostas.

**O sistema prevê o Brasil em dez anos?**
Não. `lupa-flow-v2` é um modelo hipotético com premissas editáveis e grupo fictício, sem calibração nacional.

**Onde está a inteligência sem IA generativa?**
No motor determinístico (`features/interpretation`), nas regras de compatibilidade e elegibilidade, na deduplicação de
aliases e no cálculo de cenários, tudo coberto por testes de domínio (91–100% das linhas).

**Como garantem a qualidade?**
Lint, tipos, testes unitários e de integração, build, smoke HTTP, Playwright com axe em 5 larguras, auditoria de dependências
e um job de CI com Postgres para o Live. Os números atualizados estão em `docs/STATUS.md`. Não houve teste em iPhone/Android físicos nem Lighthouse.

**É seguro?**
Corrigimos os achados confirmados da auditoria (votação por script, origem, limites de login, logs, CSP aplicada). Não
afirmamos que é "seguro": não houve penteste no Supabase real, nem teste de carga ou de MFA.

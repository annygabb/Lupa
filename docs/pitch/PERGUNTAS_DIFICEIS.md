# Perguntas difíceis da banca — respostas com evidência

> Respostas baseadas no que está implementado no commit da entrega. Atualizar se algo mudar.

**Por que não usar o PubMed direto?**
O PubMed localiza artigos. O LUPA organiza por pergunta, mostra população, desfecho e limites, detecta incompatibilidades entre estudos (`assessStudyComparison`) e bloqueia extrapolações (`assessProjectionEligibility`). Demonstrar com o Evidence Lens UTI → comparador.

**Quem revisou clinicamente?**
Ninguém ainda. Os 50 registros são candidatos em curadoria; M01–M05 tiveram os números conferidos no artigo original. O esquema do Lens não aceita "revisado" sem registro nominal do revisor. Plano em `docs/evidence-review/`.

**O sistema prevê o Brasil em dez anos?**
Não. `lupa-flow-v2` é um modelo hipotético de fluxos com premissas editáveis e grupo fictício; não há calibração nacional. A Metodologia explica cada motivo de bloqueio.

**Onde está a inteligência sem IA generativa?**
No motor de interpretação determinístico (`features/interpretation`), nas regras de compatibilidade e elegibilidade, na deduplicação de aliases e no cálculo de cenários — tudo testado. A classificação final é sempre a mais rigorosa entre a curadoria e as regras.

**Qual impacto foi comprovado?**
Nenhum, ainda. O protocolo do teste de compreensão está em `docs/validation/protocolo-teste-compreensao.md` e não foi executado até 08/11/2026. Só citar números se o teste acontecer, com n e limitações.

**Como evitam decisão médica individual?**
Finalidade educacional explícita, ausência de diagnóstico/prescrição, avisos contextuais, bloqueios de inferência e fontes abertas em um clique.

**Por que não há banco, fila ou microsserviços?**
Dados públicos versionados e cálculos determinísticos não precisam disso (ADR 0001). Menos infraestrutura = menos risco e custo.

**Por que o modelo não calcula mortalidade/UTI?**
Porque nenhum estudo do acervo liga o medicamento ao desfecho em UTI, e OR sem risco basal não vira risco absoluto. A recusa é uma característica de qualidade.

**Como garantem a qualidade?**
Lockfile congelado, CI com lint, tipos, testes unitários e de integração, build, smoke HTTP, Playwright em 5 larguras com axe. Mostrar a execução da CI do commit final.

# LUPA: propósito, evidência e futuros possíveis

## Objetivo e direção
Software científico educacional para profissionais de saúde, estudantes e pessoas interessadas em medicamentos para emagrecimento. A abertura explica por que existe: traduzir benefícios, cuidados e lacunas em perguntas que podem ser verificadas. Identidade: editorial clínica, verde profundo na navegação, papel claro e gráficos sem ornamentos. Assinatura: cada conclusão acompanhada do que foi medido e do que permanece aberto.

## Escopo autorizado
Manter Next/React e os módulos existentes. Menu lateral no desktop conforme referência; navegação compacta no celular. Home com propósito/público/dor e demonstração real. Painel de gráficos fixos sobre benefícios, composição, saúde mental e interrupção. Brasil × EUA com horizontes 2026/2031/2036/2041 e ausência explícita de bases comparáveis; não transformar dispensações em pessoas. Expandir cenário ilustrativo até 2041 sem calibrá-lo como país. UTI com gráficos de estudos separados, nunca fórmula que associe fármaco à mortalidade. Somente PubMed para pesquisa adicional, sem Google Acadêmico. Revisão Unslop ao final e publicação no projeto Vercel lupaa já existente.

## Alternativas e decisões
1. Catálogo como abertura: mantém o problema de compreensão relatado; descartado.
2. Narrativa com demonstração científica real: escolhida para cumprir o pedido, preservando acervo e ferramentas.
3. Forecast nacional completo: condicionado a dados comparáveis e validação; não inventar coeficientes para preencher lacunas.

## Tarefas
- [ ] Shell: navegação lateral desktop e menu mobile; preservar rotas e foco.
- [ ] Conteúdo: dados fixos com N, unidade, período, PMID e limites; home e página saúde mental.
- [ ] Países: painel com proveniência e lacunas; gráficos internacionais identificados; cenário ilustrativo até 2041.
- [ ] UTI: diagrama de inferência e visualização de associações, sem efeito conjunto.
- [ ] Verificação: testes de guardrails e cenários, typecheck/lint/build/e2e, QA navegador, revisão Unslop e deploy com SHA.

## Falhas que a revisão deve buscar
Dados ausentes nunca viram zero. Uso passado não vira uso ativo. Ensaios internacionais não viram taxas Brasil/EUA. Escalas e denominadores distintos não são unidos. Nenhum horizonte estende efeito clínico de 72 semanas. Mobile não pode herdar espaço da sidebar desktop.

## Limites de ferramentas
Playwright MCP e agent-browser não estão conectados nesta sessão; usar a ferramenta de navegador disponível para QA e registrar honestamente a cobertura. Referências antigas de dashboards citadas no AGENTS não estão nos anexos; usar o app atual e a imagem lateral realmente fornecida.

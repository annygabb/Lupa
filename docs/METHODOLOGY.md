# Metodologia científica e matemática — LUPA Saúde

O LUPA é uma ferramenta de **pesquisa e demonstração**, não de diagnóstico, prescrição, decisão clínica individual ou orientação de acesso ao SUS.

## Estados da informação

- **Observado em uma fonte:** desfecho, amostra e população reportados por estudo; não generalizar automaticamente.
- **Associação:** resultado estatístico que não prova causalidade sem desenho e validação adequados.
- **Consenso:** definições clínicas e critérios que não são ensaios terapêuticos.
- **Regulatório:** decisão, consulta pública ou pedido de avaliação; não são desfechos de ensaio.
- **Simulado:** resultado de parâmetros ilustrativos escolhidos pelo usuário, não previsão oficial.

## Curadoria

O catálogo reúne 55 fontes de origem e 50 registros após cinco aliases. A separação de famílias evita somar indevidamente SURMOUNT e subestudos relacionados. Nenhum registro foi aprovado para projeção clínica.

O Comparador apresenta cinco indicadores conferidos em três fontes primárias (E04, E16, E21), preservando braços, N quando disponível, desfechos, período e estimadores. Todos seguem sem revisão clínica independente.

## Músculos e UTI

O subestudo de composição corporal por DXA mede mudança percentual de massa gorda e massa magra. A sarcopenia requer critérios relacionados à força e outros indicadores, de acordo com EWGSOP2. A metanálise de UTI examina associação entre massa muscular avaliada por TC e prognóstico crítico, em populações diferentes. **Esses artigos não fornecem um efeito causal de tirzepatida sobre risco ou mortalidade em UTI.**

## Simulação determinística

A rota `/projecoes` calcula fluxos de ativos por ano de 2026 a 2036, com variáveis editáveis para grupo de referência, entradas, continuidade, variação anual e custo hipotético. Os presets são exemplos e não vêm do IBGE, Vigitel, ensaios ou SUS.

- `C(t) = min(N(t), round(A(t−1) × retenção))`
- `I(t) = round((N(t) − C(t)) × taxaInício(t))`
- `A(t) = C(t) + I(t)`
- `S(t) = A(t−1) − C(t)`

A primeira linha de 2026 corresponde à quantidade inicial hipotética. Entradas acumuladas não são pessoas únicas. Custos só são calculados com valor anual explicitamente informado, sem assumir preços ou abrangência do SUS.

As fórmulas integrais, limites de entrada e fontes estão em [ETAPA5_6_7_MVP_FUNCIONAL.md](ETAPA5_6_7_MVP_FUNCIONAL.md).

## Contexto brasileiro

- [IBGE — projeções populacionais](https://www.ibge.gov.br/estatisticas/sociais/populacao/9109-proje%C3%A7%C3%A3o-da-populacao.html): contexto demográfico, não base de elegibilidade clínica.
- [Vigitel](https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/vigitel/): fatores de risco nas capitais e DF, não denominador nacional direto para tratamento.
- [Portaria SECTICS/MS nº 65/2025](https://bvsms.saude.gov.br/bvs/saudelegis/sctie/2025/prt0065_16_09_2025.html): não incorporação em indicação específica.
- [Pedido do Ministério à Conitec (24/09/2026)](https://www.gov.br/saude/pt-br/assuntos/noticias/2026/setembro/ministerio-da-saude-protocola-na-conitec-pedido-de-analise-para-incorporacao-de-canetas-emagrecedoras-no-sus): pedido de avaliação não equivale a incorporação.

## Segurança

Nenhum prontuário, conta, banco, API paga, SQL ou migração. Resultados são locais e não são enviados a servidores, exceto as requisições normais para carregar a aplicação. Dados de exportação são gerados no navegador.

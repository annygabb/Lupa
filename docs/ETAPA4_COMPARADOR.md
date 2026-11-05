# LUPA Saúde — Etapa 4: Comparador Científico

**Versão:** 05/11/2026 · **Escopo:** somente catálogo local, interface, revisão documental e testes.
**Não executado:** Supabase, SQL, migrações, autenticação, deploy ou processamento de dados reais de pacientes.

## 1. Alterações planejadas e verificadas

- \`/comparar\` deixa de ser a tela-placeholder e permite selecionar duas referências do catálogo de 50 registros canônicos.
- Comparador mostra população, desenho, resultados e limitações lado a lado, com ligação à ficha e à fonte original.
- \`assessStudyComparison\` detecta mesma publicação (inclusive alias), amostras sobrepostas, diferenças de desenho, fontes oficiais, domínios, fármacos e a lacuna sobre massa muscular e recuperação em UTI.
- A **combinação numérica entre publicações diferentes é sempre bloqueada**; a ferramenta é de leitura crítica, não metanálise.
- Um módulo independente contém cinco indicadores obtidos de três publicações originais; cada gráfico compara somente grupos internos do mesmo estudo, com unidade, estimador, amostra e horizonte temporal.
- Não há novos pacotes, APIs, tokens ou fontes sintéticas apresentadas como dados clínicos.

## 2. Originais revisados — recorte para o MVP

### E04 / P20 — composição corporal no SURMOUNT-1

**Publicação:** Look et al., *Body composition changes during weight reduction with tirzepatide in the SURMOUNT-1 study of adults with obesity or overweight*, 2025.
- PMID: [39996356](https://pubmed.ncbi.nlm.nih.gov/39996356/)
- Texto integral: https://pmc.ncbi.nlm.nih.gov/articles/PMC11965027/
- Fonte dos dados: Abstract / Results. Subestudo DXA, 160 participantes com medidas no início e na semana 72; tirzepatida agrupada **n=124**, placebo **n=36**.
- Variação de peso corporal: **−21,3%** versus **−5,3%**.
- Variação de massa gorda: **−33,9%** versus **−8,2%**.
- Variação de massa magra: **−10,9%** versus **−2,6%**.
- Aproximadamente 75% do peso total perdido foi massa gorda e 25% massa magra **em ambos os grupos**. Isso não significa perda de 25% dos músculos.
- Os três gráficos são de **variação relativa de cada medida desde seu próprio basal**, não gráficos de composição percentual da perda total.
- ICs por grupo **não foram extraídos do resumo consultado**; nenhum foi inventado.
- A estimativa é descritiva no grupo analisado, não efeito atribuível a pessoas brasileiras e não define sarcopenia, força ou resultados de UTI.

### E16 / P22 — SURMOUNT-4, continuidade versus retirada

**Publicação:** Aronne et al., *Continued Treatment With Tirzepatide for Maintenance of Weight Reduction in Adults With Obesity: The SURMOUNT-4 Randomized Clinical Trial*, JAMA, 2024.
- PMID: [38078870](https://pubmed.ncbi.nlm.nih.gov/38078870/)
- Original e Tabela 2: https://jamanetwork.com/journals/jama/fullarticle/2812936
- Desenho: 783 receberam tirzepatida na fase aberta de 36 semanas; **670 randomizados** para continuar (n=335) ou trocar para placebo (n=335) durante **52 semanas**, da semana 36 à semana 88.
- Desfecho primário, *treatment-regimen estimand* (LS mean): **−5,5%**, IC 95% **−6,8 a −4,2**, com continuidade; **+14,0%**, IC 95% **+12,8 a +15,2**, após troca para placebo.
- Diferença ajustada reportada **−19,4 pontos percentuais** (IC 95% −21,2 a −17,7). Não recalcular a diferença subtraindo valores arredondados.
- **Atenção:** o grupo placebo recebeu tirzepatida na fase aberta. Ele não é grupo nunca tratado. Resultados limitados a quem chegou à randomização.

### E21 / P03 — segurança psiquiátrica da tirzepatida

**Publicação:** Wadden et al., *Psychiatric Safety of Tirzepatide in People With Obesity and No Known Major Psychopathology: A Post Hoc Analysis of SURMOUNT*, 2026.
- PMID: [41537305](https://pubmed.ncbi.nlm.nih.gov/41537305/)
- Desenho: pós-hoc de SURMOUNT-1/2/3; **N total 4.056**; participantes sem psicopatologia importante conhecida.
- Percentual com passagem para categoria mais grave do PHQ-9: **18,2%** tirzepatida vs **24,3%** placebo (p<0,001).
- O N total foi conferido no resumo, mas **o N por braço não está extraído**. O gráfico e a tabela informam esse limite, sem inventar denominadores.
- Não é prova de aumento de depressão, de efeitos de pressão estética na população geral ou de causalidade individual.

## 3. Conexão músculo–UTI: hipótese, não inferência de risco

A revisão de 35 estudos com 9.366 pacientes críticos ([PMID 40462133](https://pubmed.ncbi.nlm.nih.gov/40462133/)) associa baixa massa muscular na entrada em UTI a mortalidade de curto (OR 2,33; IC 1,90–2,87) e longo prazo (OR 2,67; IC 1,45–4,92). A coorte de UTI não testa uso prévio de tirzepatida. Por isso, **esses ORs não são multiplicados pela perda de massa magra do SURMOUNT-1**.

O consenso EWGSOP2 ([PMID 30312372](https://pubmed.ncbi.nlm.nih.gov/30312372/)) define baixa força como indicador principal de sarcopenia provável e demanda medidas adicionais de quantidade/qualidade e desempenho. DXA de massa magra isoladamente não permite diagnosticar sarcopenia.

O comparador permite confrontar E04 e E12 na apresentação **somente de forma descritiva** e emite alerta explícito de ligação causal não demonstrada. Não há gráfico somando efeitos dos dois artigos.

## 4. Segurança e rastreabilidade técnica

- \`features/comparison/reviewed-metrics.ts\`: Zod valida duas séries por métrica, N por braço quando informado, unidade, intervalos e proíbe aprovação populacional.
- \`features/comparison/compatibility.ts\`: decisões determinísticas de incompatibilidade; nenhuma combinação numérica cruzando artigos.
- \`components/comparison/study-comparator.tsx\`: seletores A/B, contexto, alertas, seção de gráficos internos revisados e limites.
- \`components/comparison/metric-chart.tsx\`: barras acessíveis e tabela numérica equivalente; referências clicáveis.
- \`app/comparar/page.tsx\`: renderiza o comparador funcional.
- \`tests/unit/comparison.test.ts\`: valida dados, erros e renderização.

**Distinções de estado:** \`displayStatus="primary_source_checked"\` só significa que valores específicos foram conferidos na fonte original. As 50 fichas originais seguem \`curationStatus="candidate"\`, \`projectionApproved=false\`; os cinco indicadores têm \`independentClinicalReview=false\` e \`approvedForPopulationProjection=false\`.

## 5. O que ainda falta

- Revisão clínica/metodológica independente dos indicadores antes de classificá-los como aptos a inferência populacional.
- Conferência integral das publicações restantes e respectivos suplementos/denominadores.
- Testes E2E e acessibilidade em navegador real. A CI faz testes de unidade, tipagem e build, não atesta UX por si só.
- Planejamento, modelagem e calibração do motor de projeções — somente depois de nova autorização.
- Banco, migrações e deploy exigem autorização específica.

> **Nota de integridade:** resultados de estudos aqui exibidos são descrições de amostras concretas, não recomendações terapêuticas nem previsões de efeitos futuros em pacientes brasileiros.

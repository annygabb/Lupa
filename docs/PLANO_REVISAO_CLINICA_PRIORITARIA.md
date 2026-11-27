# LUPA Saúde — roteiro de revisão científica prioritária (Etapa 8)
**Criado em:** 06/11/2026  
**Status:** **PLANO / A EXECUTAR**, não uma revisão clínica efetuada.  
**Objetivo:** converter um conjunto de referências catalogadas em fichas criticamente conferidas **por profissionais qualificados**, sem inventar dados ou afirmar aprovação automática.

## 1. Duas dimensões independentes

1. **Conferência técnica da fonte:** link e PMID resolvem corretamente; números e limites transcritos fielmente; código e testes automatizados verificam integridade estrutural.
2. **Validação clínica e metodológica:** especialista analisa população, viés, medidas, inferências e relevância do estudo; não é substituída por testes unitários, comparador, PubMed ou IA.

Atualmente: **50 registros canônicos em estado \`candidate\`**, cinco medidas documentais \`primary_source_checked\` nas fontes E04/E16/E21, e **zero** indicadores com \`independentClinicalReview=true\` ou \`approvedForPopulationProjection=true\`.

A próxima fase **não deve** promover \`candidate\` nem alterar os bloqueios científicos antes de revisão e registro da evidência. Uma fonte local com PMID ou DOI não comprova que a conclusão agregada é válida.

## 2. Ordem de análise

| Prioridade | Fontes | Pergunta científica | Por que é crítica |
|---|---|---|---|
| **P0** | E04 / M01–M03 | O que a DXA mostrou sobre peso, massa gorda e massa magra em 72 semanas? | Base dos gráficos e hipótese músculo/UTI; a amostra é um subestudo, não toda população dos SURMOUNT |
| **P0** | E10 | Como a sarcopenia é definida e confirmada? | Evita tratar massa magra como força ou diagnóstico |
| **P0** | E12 | Qual a relação observacional entre massa muscular por TC e desfechos em UTI? | Evita usar OR como risco absoluto ou efeito da tirzepatida |
| **P0** | E16 / M04 | O que é observado ao continuar versus interromper tirzepatida? | Fase aberta antes da randomização e seleção de participantes |
| **P0** | E21 / M05 | O que foi reportado sobre mudança de categoria PHQ-9? | Análise pós-hoc; denominadores individuais dos braços não foram extraídos no catálogo |
| **P1** | P01, P02, P07–P11 | Saúde mental, qualidade de vida e heterogeneidade | Sobreposição entre metanálise, ensaios e observacionais; evitar somar populações |
| **P1** | P15, P16, P17–P19 | Vias biliares, pâncreas, rim e fígado | Desfechos e desenhos muito diferentes; classificar o que foi medido |
| **P1** | P24–P28, R08, R10 | Brasil: estigma, acesso, inquéritos, desigualdade | Brasil requer população-base, amostra e período compatíveis |
| **P1** | R01–R07, R09, R11 | Regulação, alertas, uso inadequado e SUS | Estado regulatório é dinâmico e NÃO representa incidência |
| **P2** | Demais fontes | Completar metadados, famílias e limitações | Manter como candidatas até conferência |

O catálogo contém aliases, incluindo P20→E04, P22→E16, P03→E21, P12→E01, e R01→E25; duplicações **não** são estudos independentes. Os subestudos da mesma família também podem compartilhar participantes: isso exige mapeamento explícito antes de qualquer síntese quantitativa.

## 3. Formulário obrigatório por fonte

| Campo para preencher | Condição exigida |
|---|---|
| Identificação | ID LUPA, título original, PMID e/ou DOI, URL primária e data de acesso |
| Tipo de estudo | Ensaio, pós-hoc, metanálise, coorte, consenso, farmacovigilância, norma etc. |
| População | Local, faixa etária, critérios de inclusão/exclusão, contexto, N analisado e N por braço quando existente |
| Exposição e comparador | Fármaco, dose, duração, placebo, outro fármaco, retirada ou sem intervenção |
| Desfecho e instrumento | Nome exato, definição, unidade, escala, janela temporal, método de medição |
| Valor e precisão | Numerador/denominador, valor absoluto/relativo, IC, estimador, falta de informação |
| Sobreposição | Nome da família de estudo, grupos que podem estar repetidos, análise derivada |
| Interpretação | O que é observado, o que é associação, o que é hipótese e o que é impossível concluir |
| Qualidade e viés | Randomização, perdas, confusão residual, seleção, poder estatístico, multiplicidade |
| Aplicabilidade ao Brasil | Fonte nacional que permita comparação, limitações da extrapolação |
| Conferência | Revisor, formação/afiliação quando aplicável, data, localizador na fonte (tabela/figura) |
| Decisão | Mantém \`candidate\`, requer correção, rejeita, ou encaminha a revisão clínica adicional |

**Não inferir denominadores quando o artigo não apresenta os dados.** Em M05, por exemplo, há \`N=4056\` agregado; o total **não** autoriza dividir proporcionalmente entre tirzepatida e placebo sem fonte. Em M01–M03, DXA n=124 e n=36. Em M04, 335 participantes por braço após fase inicial aberta.

## 4. Fichas numéricas a confirmar independentemente

Os valores abaixo já estão no código como **descrição de fonte primária**, não como fatos clinicamente aprovados.

| Indicador | Fonte | Estimativa registrada | A revisar no original |
|---|---|---|---|
| M01 peso | E04 [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11965027/) | Tirzepatida −21,3% / placebo −5,3% | Baseline e unidades de cada grupo; método; N 124/36; semana 72 |
| M02 massa gorda | E04 | −33,9% / −8,2% | Fração de massa gorda inicial, não fração da perda total |
| M03 massa magra | E04 | −10,9% / −2,6% | DXA; não equivale a músculo funcional nem sarcopenia |
| M04 retirada | E16 [JAMA](https://jamanetwork.com/journals/jama/fullarticle/2812936) | Continuou −5,5% / placebo após retirada +14,0% | Tratamento-regimen estimand, IC reportados, semana 36–88, n=335/335 |
| M05 PHQ-9 | E21 [PubMed](https://pubmed.ncbi.nlm.nih.gov/41537305/) | Tirzepatida 18,2% / placebo 24,3% | Mudança de categoria, limitações de seleção, N por braço não identificado |

**Critérios de bloqueio:** nunca multiplicar "25% da perda de peso como massa livre de gordura" por OR em UTI; nunca somar participantes duplicados; nunca utilizar relatos espontâneos da Anvisa como incidência, nem confundir efeitos psiquiátricos observados com causalidade individual.

## 5. Revisão do contexto regulatório e socioeconômico (06/11/2026)

- [Portaria SECTICS/MS 65/2025](https://bvsms.saude.gov.br/bvs/saudelegis/sctie/2025/prt0065_16_09_2025.html): ato público de **não incorporação da semaglutida em população especificamente definida**, não proibição geral da classe.
- [Notícia do Ministério da Saúde de 24/09/2026](https://www.gov.br/saude/pt-br/assuntos/noticias/2026/setembro/ministerio-da-saude-protocola-na-conitec-pedido-de-analise-para-incorporacao-de-canetas-emagrecedoras-no-sus): descreve **pedido de análise**, não incorporação nem direito ao fornecimento.
- Conferir novas portarias e decisões **na data de entrega**; nenhum cenário "expansão hipotética" se converte automaticamente em acesso gratuito no SUS.
- IBGE mede população, Vigitel refere-se a capitais/DF; prevalência de obesidade não equivale ao total elegível e aderente a determinada medicação.

Os dois primeiros links oficiais foram localizados em seus órgãos de origem em 06/11/2026. **As publicações clínicas acima não foram submetidas a nova revisão independente nesta etapa.**

## 6. Critério de saída da Etapa 8

Para considerar a revisão prioritária concluída:
- Todas as cinco medidas M01–M05 têm ficha preenchida e localizador no original.
- Evidências E10/E12 foram revisadas quanto à possibilidade de comparar **populações e desfechos**, sem extrapolar risco absoluto.
- Revisor independente identificado, assinatura/aceite e data para as evidências clínicas relevantes.
- Duplicatas/aliases e famílias de participantes foram documentados.
- Fontes regulatórias brasileiras têm data e situação atual registradas.
- O código continua sem permitir inferência causal ou projeção clínica até haver justificativa de método e base adequadas.
- Uma falha de fonte promove **pendência de curadoria**, não substituição por valor estimado.

## 7. Como trabalhar sem banco

As fichas podem ser registradas em arquivos versionados \`docs/evidence-review/\` e validadas por pull request. Não é necessária integração Supabase nem SQL. Eventual aprovação da equipe científica pode atualizar campos de revisão **somente com evidência documentada e novos testes**. Para criar modelos clínicos reais sobre a população brasileira, será necessário um plano metodológico separado, base observada validada e avaliação de especialistas.

**Status no fim desta etapa de documentação:** projeto tecnicamente testado; revisão científica **não concluída**.

# LUPA: compreensão, impacto e limites científicos

## O problema que a interface resolve
O feedback dizia que o site era atraente, mas não explicava sobre o que eram os registros, por que existia ou quem ajudava. A nova abertura nomeia canetas para emagrecer, semaglutida e tirzepatida e descreve o objetivo: traduzir benefícios, riscos e lacunas para profissionais de saúde, estudantes e pessoas interessadas no tratamento. As entradas são perguntas e problemas de interpretação, com acesso às ferramentas existentes.

## Materiais incorporados
- Documento de estratégia/benchmark: problema de agregador de artigos, público prioritário, interpretação verificável e recusa de inferências sem base. Exemplos de vencedores são orientação interna; não foram copiados nem apresentados como validação do LUPA.
- Documento internacional: composição corporal, interrupção, benefícios cardiovasculares, Brasil/EUA e cenários condicionais de acesso.
- Documento de saúde mental: PHQ-9, exclusões psiquiátricas, estigma, contexto brasileiro e distinção entre associação, sinal e efeito.
- Referência visual: rail verde profundo à esquerda no desktop; cabeçalho compacto com menu no celular.

## Pesquisa adicional
Por escolha expressa da usuária, somente PubMed. Sem Google Acadêmico, sem coleta nas contas pessoais e sem pesquisa adicional em IBGE, CDC ou outras fontes institucionais. A leitura dos anexos não converte suas 30 fontes candidatas em métricas aprovadas.

Consultas: GLP-1 Brazil United States prevalence; psychiatric safety semaglutide STEP; psychiatric safety tirzepatide SURMOUNT; body composition SURMOUNT-1; acute skeletal muscle wasting critical illness; low muscle mass critically ill meta-analysis. Busca dirigida, não revisão sistemática exaustiva. As limitações abaixo descrevem o conjunto recuperado, não prova universal de inexistência de estudos.

| PMID | Resultado utilizado | População/tempo | Limite |
|---|---|---|---|
| 39996356 | Gordura −33,9%/−8,2%; massa magra −10,9%/−2,6%; partição aproximada 75/25 do peso perdido | Subestudo DXA; 160; 72 semanas | Não mede força, sarcopenia nem UTI; ensaio financiado pela Eli Lilly |
| 37952131 | Eventos compostos 6,5%/8,0%; HR 0,80 (0,72–0,90) | SELECT; 17.604; seguimento médio 39,8 meses | Alto risco cardiovascular, sem diabetes; financiamento Novo Nordisk |
| 41537305 | Piora de categoria PHQ-9 18,2%/24,3% | Pós-hoc SURMOUNT; total 4.056; até 72 semanas | Não é incidência de depressão causada; sem N por braço no resumo; exclui psicopatologia importante; Eli Lilly |
| 39226070 | Sem aumento identificado de sintomas depressivos na população selecionada | Pós-hoc STEP | Não assegura efeito em pessoas excluídas; sem extrapolação nacional |
| 38078870 | −5,5% continuando/+14,0% após troca por placebo | SURMOUNT-4; 670; 52 semanas após fase inicial | Retirada após tratamento prévio, não placebo de pessoas nunca tratadas; Eli Lilly |
| 35344001 | RR biliar 1,37 (1,23–1,52) | Síntese de 76 ECRs; 103.371 | Não é risco absoluto nem específico de toda caneta |
| 24108501 | Área do reto femoral −3,0%/−15,7% conforme falência de um/múltiplos órgãos | Coorte de 63 pacientes críticos, Inglaterra; dia 1–7 | Ultrassom; nenhum efeito de GLP-1 estudado; grupos não são “UTI leve/grave” validados |
| 40462133 | Associação de baixa massa por TC com mortalidade; preservada no módulo existente | 35 estudos; 9.366 pacientes | Não demonstra mortalidade causada pelo medicamento |
| 42922826 | 8,2% em mar/2024 e 12,0% em out/2025 de uso atual OU passado | EUA; painel adulto; n 9.150 em ≥1 onda | Preprint sem revisão por pares; qualquer indicação, não somente uso ativo para emagrecer |
| 41796096 | Contexto brasileiro de consumo e vigilância | Dados administrativos e notificações | Dispensações não equivalem a usuários únicos ou prevalência |
| 42618598 | 23,8% (21,1–26,8) de automedicação | Questionário online com 860 usuários atuais/passados; Brasil | Amostra não representa prevalência de uso na população brasileira |
| 40197266 | Contexto de percepções de obesidade e alimentação emocional | Levantamento brasileiro | Não é estudo de efeito farmacológico |

Links originais: https://pubmed.ncbi.nlm.nih.gov/ seguido do PMID. Extrações curtas e descritivas; não implicam revisão clínica independente.

## Brasil × EUA: o que foi entregue e o que falta
O painel tem temas fixos e horizontes 2026, 2031, 2036, 2041. Todos os valores nacionais sem sustentação permanecem nulos e aparecem como lacunas, jamais zero. O dado americano observado de 2025 é apresentado no ano correto e com a definição de uso atual ou passado. O painel brasileiro explica o denominador administrativo e apresenta o levantamento de automedicação com seu N.

Não há, neste conjunto recuperado, modelo nacional calibrado para uso, depressão/ansiedade, perda muscular ou recuperação em UTI nos quatro horizontes. Para preenchê-lo são necessários usuários únicos comparáveis por indicação/idade/ano, persistência e interrupção locais, riscos basais por país, seguimento e validação externa com incerteza. A simulação de fluxo existente foi estendida até 2041 e versionada como lupa-flow-v2. Seus parâmetros continuam hipóteses editáveis de grupo fictício; nenhuma taxa foi derivada de prevalência, PHQ-9 ou OR.

## Revisão final de interface — Unslop
Aplicada ao conjunto novo (home, navegação, gráficos, saúde mental e painel de países), preservando as funções dos módulos anteriores. Fonte: [unslop, Damir Sokolovsky](https://github.com/heydamir/unslop), CC BY 4.0. É um roteiro de revisão, não um executável que produz uma certificação.

Produto: explicar evidência de medicamentos para emagrecimento para quem cuida e quem quer entender.
Caráter: clínico, legível, ponderado.
Mundo: leitura de publicação e instrumentos de observação.
Momentos: composição 75/25 e gráficos com denominadores explícitos.
Assinatura: “o que mostra” ao lado de “onde a conclusão para”.

| Passagem | Antes | Depois | Por quê |
|---|---|---|---|
| Espaçamento | Cards iguais com muitas camadas | Ritmo de 4px, seções editoriais e linhas | Agrupar significado |
| Cor | Gradientes azuis/violetas e sombras coloridas | Papel claro, rail verde profundo, gráficos contidos | O dado recebe atenção |
| Ícones | Tiles decorativos em cada bloco | Ícones de navegação, ações discretas | Indicar função |
| Texto | “Registros”, “Research Studio”, propósito indireto | Tema, público, dor e ação explícitos | Compreensão no primeiro contato |
| Tipografia | Peso 800 recorrente | Serifada editorial só em títulos, corpo legível | Separar narrativa e operação |
| Layout | Barra horizontal no desktop | Rail esquerdo e menu mobile | Atender referência fornecida |
| Detalhes | Números sem leitura progressiva suficiente | Unidade, N quando disponível, janela, fonte e tabela | Rastreabilidade |
| Visual | Módulos em cards como narrativa principal | Produto demonstrado com resultados reais | Mostrar valor em uso |
| Movimento | Órbitas decorativas | Feedback curto; sem loops nos novos módulos | Evitar distração e custo |

## Verificação e limitações desta sessão
- Unitários: 99/99 passaram após a extensão do motor e atualização das expectativas deliberadamente alteradas.
- Tipagem, lint e build executados; resultados finais devem acompanhar o commit de entrega.
- QA visual: home desktop e home em iframe de largura 390px, sem overflow nesse quadro; abertura e rail conferidos visualmente.
- Suíte e2e local: bloqueada por Chromium ausente; tentativa oficial de download falhou com arquivo vazio/truncado. Não declarar que os testes de navegador passaram.
- Interações na prévia local ainda não reagiram pelo navegador disponível, mesmo após recarga e reinício. Exige conferir deploy e CI antes de declarar controles funcionais.
- Playwright MCP, agent-browser e Graphify não foram conectados/executados nesta sessão. Não atribuir a eles os testes realizados. O projeto mantém a configuração existente dessas ferramentas.
- Sem Supabase, SQL, dados pessoais, serviços pagos ou novas APIs.

## Revisão independente e primeira execução de CI
Revisão independente não encontrou defeito científico crítico. Corrigidos: locator de navegação que ficava oculto no mobile e foco de teclado na tabela Brasil/EUA. A primeira CI passou lint, tipagem, 99 unitários, build, smoke HTTP e auditoria de dependências. No navegador, 140 testes passaram; 15 falharam apenas por contraste em Comparador, Músculos/UTI e Metodologia (três rotas × cinco larguras). A mudança do fundo reduziu o contraste de cinzas anteriores. Correção dirigida: usar o papel secundário #53645b e escurecer o aviso marrom para #785024; sem remover regras axe. Interações de gráficos, cenários e navegação funcionaram na CI, limitando a falha anterior de interação à prévia local. A execução após a correção deve ser conferida antes do release.

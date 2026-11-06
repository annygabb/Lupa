# LUPA Saúde — Design/Taste Direction · 06/11/2026

**Estado:** direção visual aprovada por referências já enviadas; primeira melhoria implementada na homepage. Revisão de todas as rotas ainda em execução. Não é laudo de usabilidade em dispositivos físicos.

## 1. Visão do produto
O LUPA não é CRM médico, aplicativo de consultas, prontuário nem medidor de saúde pessoal. É **um workspace de pesquisa científica de acesso público** que permite localizar evidências, comparar metodologias e entender limites de hipóteses sobre medicamentos para emagrecimento e seus contextos musculares, emocionais e sociais, com recorte brasileiro.

### Audiências
Estudantes e pesquisadores; profissionais de saúde interessados em literatura; banca do Hack Brasil 2026; público leigo que precisa de explicações simples e responsáveis. Não pressupor que usuário sabe o que são DXA, PHQ-9, OR ou randomização.

### Compromissos que não podem ser alterados
- 50 registros canônicos em curadoria; 55 IDs de origem incluem aliases, não são 55 estudos independentes.
- 5 indicadores conferidos documentalmente em publicações primárias, ainda sem revisão clínica independente.
- Projeções 2031/2036 são hipotéticas: **fluxos simulados**, sem eficácia ou cobertura populacional real.
- Massa magra ≠ força/sarcopenia; UTI e tratamento não possuem ponte causal demonstrada.
- Sem autenticação, pacientes fictícios, dados pessoais, diagnóstico, APIs pagas, SQL ou Supabase.

## 2. Taste: identidade editorial científica, não dashboard genérico
**Nome da direção:** Evidence Desk / Laboratório de evidências. Intenção: transmitir a tranquilidade de um produto de pesquisa confiável, com informação protagonista e composição editorial memorável.

**Referências fornecidas pela equipe:**
1. Medicom, dashboard "Patient Care Journey": peso visual em um único elemento de destaque e cards funcionais compactos;
2. Youcare, health analytics claro: hierarquia e escaneabilidade de KPIs + painéis de dados em branco e azul;
3. Medix, dashboard com navegação escura: assimetria, foco em tarefa e contraste entre superfícies;
A referência é de **princípios**, não para copiar imagens, marcas, dashboards de prontuário ou dados de pacientes.

**Referência de mercado adicional:** [Health Analytics Dashboard UI Light Mode, Behance](https://www.behance.net/gallery/242733639/Health-Analytics-Dashboard-UI-Light-Mode-SaaS) — agrupamento claro de informação, não copiar assets.

### Parâmetros do Taste para o LUPA
- VARIANCE: 6/10 (assimetria planejada, sem comprometer leitura).
- MOTION: 2/10 (produto científico: movimento serve resposta e orientação).
- DENSITY: 5/10 (densidade de pesquisa com filtros e metodologia sob demanda).

## 3. Tokens e componentes
- Fundo \`#F4F7FB\`; superfície \`#FFFFFF\`; texto principal \`#14233D\`;
- Azul de ação \`#315FF4\`; azul-marinho \`#152B51\` para uma única área de foco;
- Teal secundário \`#0C948B\` e \`#67DFCE\`; dourado/âmbar limitado a advertências;
- Cor nunca é o único meio de distinção: nome e status sempre legíveis.
- Corpo: preferencialmente 15–16 px; textos densos 13–14 px, não 11 px como texto explicativo principal.
- Indicadores numéricos: dígitos tabulares; preservar sinal, unidade, janela, N e fonte.
- Layout desktop com assimetria e um painel de destaque; mobile em coluna, sem horizontal scroll da página, tabelas localmente roláveis.
- Cards apenas quando marcarem agrupamentos semânticos; proibir "card dentro de card" decorativo.
- Estado \`:active\` com \`scale(.98)\` em ações; foco visível, hover apenas em dispositivo com ponteiro; \`prefers-reduced-motion\`.
- Nenhum looping automático que não comunique estado, especialmente órbitas ininterruptas.

## 4. Auditoria inicial de design com Emil Kowalski + Impeccable

| Before | After | Why |
|---|---|---|
| Hero inicial reutilizava a órbita genérica de A/B, sem dado científico | Painel em destaque mostra M03 dentro do E04, com valores −10,9% e −2,6%, N 124/36 e limitação DXA | Informação útil de imediato; foco de pesquisa, sem inventar gráfico |
| "Ciência em saúde. Sem perder o contexto." | "Evidência antes da conclusão. Veja o que os estudos realmente mediram." | Menos frase de marketing genérica, maior clareza sobre o valor do produto |
| "55 Fontes de origem" podia ser lido como 55 estudos diferentes | "55 IDs de origem, incluindo aliases" | Explicita a deduplicação e evita inflação da base |
| "Ciência com contexto" no topo | "Fontes em curadoria" | Status científico concreto e legível |
| Hover em card simulava interação mesmo no touch | Hover sem deslocamento em dispositivos sem hover | Evita comportamento artificial no celular |
| Botão sem feedback ao toque | Estado \`:active\` e \`:focus-visible\` explícitos | Feedback instantâneo, navegação por teclado e acessibilidade |
| Animação contínua de órbita sem relação com ciência | Manter órbita apenas como visual conceitual no Comparador; avaliar remoção/redução após teste com usuários | Motion deve servir orientação, não dispersão |
| Muitas superfícies com gradiente e repetição de iconografia | Uma área de contraste principal e painéis de informação com dados de verdade | Reduz genericidade mantendo memorabilidade |

**Limites da primeira mudança:** a homepage foi implementada; os demais módulos continuam com seus componentes existentes até nova aprovação visual e regressão por rota. Sem afirmar redesign completo.

## 5. Mapa de mudanças previstas por rota

### Homepage
Hero editorial único, evidência real M03 com fonte, CTA principal "Explorar evidências", CTA secundário "Comparar estudos"; KPIs explícitos sobre estado de curadoria e aliases; cards por função sem repetição visual do hero.

### Explorador
Busca em primeiro plano, filtros agrupados, chips de contexto, estado zero útil e reset; paginação perceptível; card com título legível, desenho, amostra, resumo, limite, fonte e data; não alegar aprovação.

### Comparador
Separar seleção A/B, veredito de compatibilidade e os indicadores de artigos independentes. Exibir claramente que **seleção A/B não controla o indicador M01–M05**; evitar falsa associação. Resumos concisos + detalhes progressivos; sinais de incompatibilidade sem alarmismo; gráfico com eixos, unidade, n e fonte.

### Músculos e UTI
Sequência explícita: tratamento → DXA → função muscular → UTI; conexões não validadas interrompidas visualmente. Questões interativas e cards de evidência, sem extrapolação causal.

### Projeções
Design de laboratório de hipóteses, não painel governamental ou cálculo de mortalidade: entradas editáveis separadas do resultado; gráfico e tabela com legenda "Simulação"; exportação versionada; avisos próximos aos valores.

### Metodologia
Índice curto, "Como ler" e fonte rastreável; fórmulas com explicação; glossário; referências originais com datas e escopo; menos sobrecarga de texto repetido em uma tela só.

## 6. Grilling: árvore de decisões
Os fatos já decididos por referências e histórico do projeto:
- Identidade: health-tech clean e premium, mas de pesquisa, sem virar prontuário;
- Prioridade: acessibilidade e clareza, depois motion;
- Público: português brasileiro; pesquisadores e público interessado;
- Sem elementos genéricos nem dados clínicos inventados.

**Questões em aberto (não simular aprovação):**
- A navegação mobile deve ser abas horizontais ou bottom bar? Recomenda-se tabs horizontais inicialmente para não alterar a arquitetura, validar no iPhone real;
- Manter ou retirar a órbita do Comparador? Recomenda-se reduzir o movimento e substituí-la por diagrama de fonte se a leitura prejudicar;
- Quais termos precisam de glossário inline? Recomenda-se explicar DXA, PHQ-9, OR e estudo pós-hoc no primeiro encontro;
- Qual a prioridade do público leigo frente à banca? Recomenda-se clareza leiga sem perder metodologia.

**Validação visual pendente:** capturas reais das páginas em 360/390/768/1280/1440, comparação ao conjunto de referências, testes em Safari físico, aceitação final pela equipe.

## 7. Testes não negociáveis
- \`pnpm run lint\`, \`pnpm run typecheck\`, \`pnpm run test\`, \`pnpm run build\`, \`pnpm run test:e2e\`;
- Playwright com screenshots, acessibilidade, console, warnings e contraste AA;
- agent-browser em ambiente de navegador para snapshots e teste de interação;
- Gráfico com 0 real e legenda de amostra; não inventar linhas de tendência;
- Impacto de alterações no Graphify; arquivos centrais \`features/evidence\`, \`features/comparison\`, \`features/scenarios\` e \`features/muscle\` devem permanecer isolados de decisões cosméticas.
- Não declarar \`READY\` sem consultar o deployment da Vercel para o SHA atual.

## 8. Critério de entrega
O visual fica aprovado somente com antes/depois e teste funcional por rota. Ciência candidata continua candidata. Nenhum dado novo sem revisão documental. O mapa de conhecimento resultante deve separar arestas AST **EXTRACTED**, interpretações **INFERRED** e ambiguidades **AMBIGUOUS** do Graphify, sem transformar proximidade entre arquivos em relação causal científica.

# LUPA Saúde — Etapa 4B: sistema visual e polimento UX/UI

**Data:** 05/11/2026  
**Escopo executado:** sistema visual compartilhado, página inicial, navegação, tela \`/comparar\`, cards dos estudos, avisos de compatibilidade, escolha dos indicadores, gráficos, tabelas, testes e documentação.  
**Fora do escopo:** Supabase, SQL, migrações, Vercel, deploy, autenticação, inferência causal ou liberação de projeções.

## 1. Referências visuais e intenção

Inspirado nas três imagens de dashboard de saúde enviadas na conversa: painéis brancos, superfícies cinza muito claras, grades organizadas, bastante espaço entre elementos, tipografia direta, indicadores de destaque e acentos azuis. **Não foi reproduzida nenhuma interface exata, fotografia ou ativo de terceiros.**

**Personalidade visual:** científico, humano, clean, premium, funcional e legível. O usuário deve conseguir responder em segundos:

1. Quais referências estou comparando?
2. Posso analisá-las lado a lado?
3. É permitido somar os números? (Não)
4. Por quê?
5. Onde encontro o resultado original e suas limitações?

## 2. Design tokens

| Papel | Valor | Uso |
|---|---|---|
| Plano de fundo | \`#F6F8FB\` | Página, sem excesso de blocos cinza |
| Superfícies | \`#FFFFFF\` | Cards e áreas de conteúdo |
| Títulos | \`#17283D\` | Legibilidade e contraste |
| Texto secundário | \`#526575\` | Metadados e explicações |
| Principal, verde-petróleo | \`#0F766E\` | Ações primárias, seleção, links |
| Azul de suporte | \`#2563EB\` | Foco, marcadores de referência e informações |
| Verde-suave | \`#EAF5F3\` | Destaques e opções ativas |
| Azul-suave | \`#EEF3FF\` | Referência A, gráficos e informações |
| Bordas | \`#E2E8F0\` | Separação com baixo ruído |
| Aviso, texto | \`#8A5A15\` | Restrições, sem alarmismo |
| Aviso, superfície | \`#FFF8EC\` | Riscos metodológicos |
| Erro, texto | \`#A33D3D\` | Apenas problemas reais |
| Foco | \`#2563EB\` | Anel visível de 3 px |

**Tipografia:** Inter / Segoe UI / sistema local, sem download de fontes. Títulos principais 36–60 px responsivos, títulos de seção 24–30 px, subtítulos 16–20 px, textos de corpo 14–16 px, notas 12–13 px. Pesos 600–800, altura de linha 1.5–1.75 no conteúdo.

**Geometria:** cards principais com borda leve, raio 24 px e sombra curta; elementos internos 12–16 px; espaçamento de 12/16/20/24/32 px. Botões e seletores tocáveis de pelo menos 44–48 px. Não usar ícones como único identificador do estado.

## 3. Mapa da interface do Comparador

**Hero** — título conciso, explicação do propósito e pequeno painel com 50 referências, cinco indicadores conferidos e zero liberados para projeção.

**Etapa 01 — Contexto**:
- Card A em azul; Card B em verde. Campos de seleção e fontes originais preservados.
- ID, tipo e população em regiões compactas.
- Resumo documental e principal limitação no primeiro nível.
- Detalhamento completo em \`<details>\`; nenhum trecho científico é descartado.
- \`Inverter estudos\` preserva a operação interativa.

**Análise de compatibilidade**:
- Veredito principal primeiro, em alto contraste.
- Três estados sempre visíveis: **Lado a lado / Disponível ou Indisponível**, **Cálculo combinado / Bloqueado**, **Projeções / Indisponíveis**.
- Até quatro motivos concisos, ordenados pela relevância; ligação causal não demonstrada aparece primeiro.
- Todas as justificativas originais preservadas em \`<details>\`.
- Recomendação final orienta o uso correto sem sugerir diagnóstico.

**Etapa 02 — Resultados observados**:
- Navegação desktop por três categorias: **Composição corporal**, **Continuidade**, **Saúde mental**.
- Chips dos indicadores da categoria; no mobile, \`<select>\` com \`<optgroup>\`.
- Aviso explicita que gráfico escolhido **independe dos dois artigos selecionados**.
- Gráfico interno a uma publicação, valores grandes por grupo, barras com eixo zero para mudanças negativas/positivas e barras de 0–100 para proporções.
- Tabela de dados com N/IC; rolagem horizontal **apenas da tabela** no mobile.
- Fonte original, estimador, amostra, período e limitações mantidos visíveis.

**Etapa 03 — Leitura responsável** — três cards objetivos com o que não se pode concluir e CTA para a biblioteca.

## 4. Textos finais de microcopy

| Elemento | Texto implementado |
|---|---|
| Nome do bloco | **Análise de compatibilidade** |
| Veredito para artigos diferentes | **Comparação descritiva disponível** |
| Veredito para mesma referência / alias | **Selecione dois estudos diferentes** |
| Status | **Comparação contextual** |
| Permissão 1 | **Lado a lado: Disponível** |
| Permissão 2 | **Cálculo combinado: Bloqueado** |
| Permissão 3 | **Projeções: Indisponíveis** |
| Motivos | **Pontos de atenção** |
| Causalidade | **Ligação causal não demonstrada** |
| Desfechos | **Desfechos diferentes** |
| Métodos | **Métodos diferentes** |
| Contexto | **Contextos clínicos distintos** |
| Família de estudo | **Amostras possivelmente sobrepostas** |
| Explicação longa | **Ver justificativas científicas completas** |
| CTA de ciência | **Como usar esta análise** |
| Limitação de resultado | **Limites da interpretação** |
| Fonte | **Abrir fonte original** |

### Dois exemplos de comportamento

**Selecionar E04 (composição DXA) + E12 (UTI):**
- Permite análise descritiva.
- Bloqueia qualquer cálculo combinado.
- Coloca em destaque **Ligação causal não demonstrada**: não há evidência direta de que a mudança de massa magra por tirzepatida explique desfechos em UTI.
- Outras observações em métodos, desfechos e contextos.
- Detalhamento técnico fica acessível sob demanda.

**Selecionar o mesmo artigo nas duas colunas:**
- Veredito muda para **Selecione dois estudos diferentes**.
- Estado "Lado a lado" torna-se indisponível.
- Não sugere que duas versões/aliases do mesmo PMID sejam pesquisas independentes.

## 5. Acessibilidade e responsividade

- Desktop \`>=1024 px\`: estudos em duas colunas; motivo resumido em grade; categorias em botões.
- Tablet \`768–1023 px\`: cards de referência empilhados; categorias e indicadores em botões onde cabem.
- Celular \`360/390 px\`: leitura vertical; cartões compactos; justificativas longas recolhidas; select nativo agrupado para gráficos; ações de 44–48 px; tabela com rolagem própria.
- Navegação possui \`aria-current="page"\` na rota ativa. Há link para saltar ao conteúdo.
- Estados possuem texto, não somente cor. \`<details>\` nativo permite uso por teclado e leitor de tela.
- Preferência por movimento reduzido respeitada. Legendas, tabela e origem mantidas nos gráficos.
- Nenhuma imagem decorativa pesada; interface não depende de dados fictícios nem de fontes pagas.

## 6. O que foi preservado

- As 50 referências candidatas e as 55 URLs de origem continuam no catálogo anterior.
- Os cinco indicadores de fonte primária mantêm valores, N/limites e períodos originais.
- \`approvedForPopulationProjection=false\` e \`independentClinicalReview=false\` permanecem intactos.
- Motor determinístico de compatibilidade \`assessStudyComparison\` **não foi reescrito**; a camada de apresentação apenas transforma rótulos e hierarquia.
- Os três estados de risco continuam bloqueando inferências impróprias.
- Nenhum dado pessoal, prescrição, prognóstico individual ou endpoint externo foi criado.

## 7. Verificações

- Os testes existentes são mantidos e os testes de UI foram ampliados.
- Novos testes cobrem vereditos, prioridade da ligação causal, aliases, três estados, justificativas, dados numéricos preservados e renderização da UI.
- A CI do GitHub deve executar lint, TypeScript, Vitest e build. Relatar resultado somente após execução.
- **Limite real:** não foi possível fazer E2E visual em dispositivo/Chrome/Safari por este fluxo. O usuário deve verificar as larguras 360, 390, 768 e 1280 px no DevTools antes de qualquer deploy.

## 8. Checklist local — PowerShell

\`\`\`powershell
cd $HOME\Lupa
git status --short
git pull origin main
pnpm install
pnpm dev
\`\`\`

Abra \`http://localhost:3000/comparar\` e teste:
1. E04 × E12: aviso de ligação causal e cálculo bloqueado.
2. E01 × E04: aviso de amostra sobreposta.
3. E04 × E04: seleção duplicada.
4. Inverter estudos.
5. Cinco métricas e duas barras em cada gráfico; M05 sem N por braço.
6. Link original e fonte em outra aba.
7. Mobile 360 e 390 px; tablet 768 px; desktop 1280 px.
8. Teclado: Tab e Enter em ações e \`<details>\`; seletor nativo.

**Não fazer deploy** até confirmação visual e autorização explícita.

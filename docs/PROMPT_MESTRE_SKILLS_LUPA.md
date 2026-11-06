# PROMPT MESTRE — LUPA SAÚDE | REDESIGN + QUALIDADE + MAPA DE CONHECIMENTO
## Orquestração por Taste → Emil + Impeccable → Playwright MCP + design-taste-frontend + Grilling → agent-browser → copywriting + humanizar → Graphify-Labs

**Produto:** LUPA Saúde — MVP científico Hack Brasil 2026  
**GitHub:** https://github.com/annygabb/Lupa  
**Produção:** https://lupaa.vercel.app  
**Idioma:** português brasileiro, com nomes originais das referências e siglas científicas quando necessário.  
**Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Zod, Vitest, Playwright, axe-core, GitHub Actions e Vercel.

### PAPEL
Atue como uma equipe integrada formada por diretor de produto, design lead de health-tech, design engineer sênior, especialista em acessibilidade, engenheiro frontend Next/React, QA/E2E, pesquisador científico, revisor editorial PT-BR e arquiteto de conhecimento. Sua missão é transformar o LUPA em um **workspace de pesquisa médica premium, original, fácil de usar e cientificamente responsável**, tomando como referência o material visual enviado pela equipe (Medicom, Youcare e Medix), sem copiar marcas/assets/dados nem inventar evidência.

Não entregue somente um diagnóstico ou mockup: quando tiver acesso de escrita ao repositório, implemente os ajustes em código, teste, faça commits rastreáveis, documente o que mudou e verifique a implantação. Não prometa execução futura. Se não tiver acesso a alguma ferramenta, declare o impedimento, entregue o máximo possível e não simule resultados.

### LIMITES ABSOLUTOS DO SISTEMA
- Preservar 50 registros científicos canônicos; 55 identificadores de origem incluem aliases e **não equivalem a 55 estudos independentes**.
- Cinco indicadores documentais M01–M05 seguem sem revisão clínica independente e **não** estão aprovados para projeções clínicas ou populacionais.
- **DXA/massa magra não é força muscular nem sarcopenia.** Não inferir que tirzepatida causa internação, mortalidade ou recuperação em UTI.
- Não multiplicar razão de chances (OR) por mudança de massa corporal, nem transformar OR em risco absoluto sem probabilidade basal válida; não somar coortes sobrepostas ou relatos de farmacovigilância para criar incidência.
- Brasil/SUS: pedido à Conitec não equivale a incorporação, aprovação de cobertura ou distribuição gratuita.
- A rota /projecoes produz **cenários hipotéticos 2026–2036**, com parâmetros editáveis; não é predição epidemiológica ou clínica brasileira.
- Proibido inventar métricas, estudos, pessoas, médicos, pacientes, gráficos, avaliações, depoimentos ou fotos clínicas; qualquer elemento visual científico exige fonte e legenda.
- **Não** configurar Supabase, executar SQL/migrações, adicionar armazenamento de dados pessoais, contratar API ou mudar infraestrutura sem autorização específica.
- Preservar URLs públicas, componentes funcionais e regressões testadas. Usar apenas estudos reais do catálogo local.

## ETAPA 0 — PREPARAR E VERIFICAR O AMBIENTE
1. Abrir o repositório, confirmar a branch/commit, ler AGENTS.md, README, docs/STATUS.md, docs/DESIGN_LUPA_2026.md, docs/COPY_LUPA_HUMANIZADO.md, docs/QA_TESTES_BROWSER_ACESSIBILIDADE.md, docs/PLANO_REVISAO_CLINICA_PRIORITARIA.md.
2. Conferir Node 22+, pnpm 10, estrutura do Next.js e Git remoto; registrar SHA antes de editar.
3. Executar \`scripts/setup-design-stack.ps1 -Agent codex\` no Windows PowerShell (ou adaptar os mesmos comandos a Cursor/Claude Code). Este script instala **skills no agente local**, não nesta conversa do ChatGPT. Abrir cada SKILL.md e verificar a origem; não usar clones homônimos.
4. Origens verificadas: \`Leonxlnx/taste-skill\` / \`design-taste-frontend\`; \`emilkowalski/skills\` / \`emil-design-eng\`; \`pbakaus/impeccable\` / \`impeccable\`; \`mattpocock/skills\` / \`grilling\`; \`vercel-labs/agent-browser\`; \`coreyhaines31/marketingskills\` / \`copywriting\`; \`fabricioctelles/skills\` / \`humanizar\`; \`Graphify-Labs/graphify\` / \`graphifyy\`.
5. Configuração VS Code: \`.vscode/mcp.json\` declara Playwright MCP oficial \`@playwright/mcp@latest\` e o servidor MCP opcional \`agent-browser mcp\`. Reiniciar o agente e iniciar/autorizar o servidor. **Só considerar conectado quando as ferramentas de navegação aparecerem e a primeira sessão funcionar.**
6. Registrar se houve instalação bem-sucedida, se ocorreu falha de permissão/conexão e quais versões realmente foram lidas.
7. Manter alterações do projeto isoladas em branch/worktree quando necessário; jamais descartar edições existentes.

## ETAPA 1 — TASTE PRIMEIRO: REFERÊNCIAS, DIREÇÃO E EXPERIÊNCIA
Usar a skill **design-taste-frontend / Taste** ANTES de redesenhar:
- Inspecionar a implementação atual e as três imagens fornecidas: Medicom (hero + destaque visual e equilíbrio), Youcare (dashboard limpo, KPIs reais e gráficos), Medix (navegação escura, ritmo editorial e contraste).
- Procurar outras boas referências em dashboards de pesquisa/health-tech apenas como estudo de composição, nunca para copiar.
- Descrever por que o LUPA parece genérico hoje: excesso de cards similares, gradientes repetitivos, imagens decorativas abstratas, iconografia de quadradinhos, cópia pouco específica, pouca hierarquia entre evidência e hipótese, textos pequenos e dashboards que poderiam pertencer a qualquer produto.
- Definir direção "Evidence Desk / Laboratório de evidências": nav discreta, base clara, um destaque escuro por página, hierarquia editorial assimétrica, dados científicos como protagonistas, gráficos com amostras e períodos, labels precisos.
- Parâmetros sugeridos: VARIANCE 6/10, MOTION 2/10, DENSITY 5/10; não adotar as intensidades padrão do Taste se prejudicarem a leitura médica.
- Tokens de partida: fundo #F4F7FB, superfície #FFFFFF, tinta #14233D, azul de ação #315FF4, navy #152B51, teal #0C948B, teal claro #67DFCE e âmbar somente para cautela. Ajustar apenas após conferir contraste e o design atual.
- Gerar um design brief com grid e breakpoints, tipografia por função, espaçamento, estados de botão, apresentação dos gráficos e exclusões. Não redesenhar as funções de forma que se perca informação.
- Aprovação visual orientada por screenshots: **primeiro mostrar a direção e as prioridades, depois implementar.** Decisões já fixadas pelas referências do usuário não precisam ser perguntadas novamente.

## ETAPA 2 — EMIL KOWALSKI + IMPECCABLE EM CONJUNTO
Invocar \`emil-design-eng\` e \`impeccable\` na MESMA rodada de análise para decisões complementares:
- Emil: remover animações sem propósito (por exemplo, órbita girando constantemente), escolher easing, distância e duração por intenção; adicionar feedback de botão \`:active\` (~0.98), \`:focus-visible\`, estados de loading e interrupção; não usar transition:all; em touch, não depender de hover. Respeitar \`prefers-reduced-motion\`.
- Impeccable: rodar \`critique\`, \`audit\`, \`distill\`, \`typeset\`, \`layout\`, \`clarify\`, \`adapt\` e \`harden\`, depois \`polish\` em passes limitados e documentados.
- Proibir card dentro de card apenas por decoração, múltiplos gradientes sem significado, ícones redundantes, mini textos ilegíveis, sombras profundas uniformes, navegação disfarçada de botão que não faz nada, falsa precisão visual.
- Exigir estados hover/focus/pressed/disabled, toque com alvo >=44px, semântica HTML, contraste AA, navegação teclado e hierarquia clara.
- Entregar tabela obrigatória **Before | After | Why** para cada intervenção e capturas antes/depois no desktop e mobile.
- Conservar gráficos e valores que não foram cientificamente revalidados; sempre mostrar o sinal, a unidade, a janela temporal, fonte, N e limitações.

## ETAPA 3 — PLAYWRIGHT MCP + DESIGN-TASTE-FRONTEND + GRILLING
Conectar o MCP **Microsoft Playwright**. Se o servidor não estiver conectado, NÃO dizer que foi usado; usar a suíte Playwright do projeto como alternativa verificável.
- Abrir as rotas reais \`/\`, \`/evidencias\`, \`/evidencias/E04\`, \`/comparar\`, \`/musculos-uti\`, \`/projecoes\`, \`/metodologia\`.
- Registrar screenshots e árvore de acessibilidade em **360, 390, 768, 1280 e 1440 px**, primeira dobra e áreas interativas, incluindo casos de texto longo, zero resultado, entrada inválida, seleção duplicada e tabelas horizontais.
- Usar design-taste-frontend para revisar cada screenshot: focal point, contraste de escala, leitura em 5 segundos, ritmo, densidade, hierarquia e composição sem templates repetidos.
- Usar \`grilling\` para desafiar escolhas de produto e design: o visitante compreende imediatamente a diferença entre catálogo, indicador conferido e projeção hipotética? O comparador deixa claro que os gráficos M01–M05 NÃO mudam com A/B? O usuário consegue localizar a fonte e entender seus limites? O fluxo funciona sem scroll horizontal da página? Quem precisa ler detalhes clínicos, onde os encontra?
- Em Grilling, responder as perguntas factuais pelo código/documentação, sem pedir ao usuário o que já foi respondido. Não simular aprovação de decisões que ainda não foram confirmadas.
- Conservar um registro de decisões e recomendações não aprovadas; mudanças que possam afetar cientificamente o significado exigem revisão antes de implementação.

## ETAPA 4 — REDESIGN ESPECÍFICO POR MÓDULO
**Homepage:** trocar heróis de ilustração decorativa por informação útil. Exibir 50 registros em curadoria, cinco indicadores conferidos documentalmente e um único resultado real de E04/M03 (tirzepatida -10,9% vs placebo -2,6% de massa magra DXA, com n=124/n=36, 72 semanas, ambos em seus próprios basais); não sugerir diferença causal sobre UTI. CTA primário "Explorar evidências" e secundário "Comparar estudos". Identificar aliases corretamente (55 IDs de origem, não 55 estudos distintos).

**Explorador:** trazer busca e filtros para a tarefa principal; filtros legíveis no celular, chips com contagem, estados vazios claros, botões para limpar, paginação compreensível. Cada resultado precisa de desenho, população/amostra, síntese documental, limitação, fonte real e status "em curadoria". Não criar novas fontes sem pesquisa e conferência.

**Comparador:** a faixa A/B deve ter inversão com estado visível e bloqueio de aliases/mesmas referências. Painel de compatibilidade deve apresentar primeiro o que pode ser feito e depois os motivos científicos. Destacar que os cinco gráficos são internos às suas próprias publicações e **independentes da seleção A/B**. Não agrupar efeitos nem usar visualização de falsa causalidade.

**Resultados/Gráficos:** clareza de direção, zero, unidade, escala, cor + texto, legenda, amostra/denominador, janela, IC se reportado, tabela acessível equivalente; diferenciar proporção de mudança relativa ao basal. Nada de linha ornamental, gráfico fictício ou valor absoluto deduzido.

**Músculos/UTI:** narrativa em camadas separadas de exposição, DXA, função muscular, sarcopenia e prognóstico de UTI; usar interrupção visual para relação causal não provada. E04, E10 e E12 rastreáveis. OR 2,33/2,67 não é percentual absoluto.

**Projeções:** simulação didática com presets assumidos, campos editáveis e resultados 2031/2036. O usuário deve entender que "1 milhão de pessoas" é grupo hipotético e os custos são parâmetros fornecidos, não estimativa real do SUS. Exportações CSV/JSON com input, versão e avisos. Erros específicos e reset fácil.

**Metodologia:** índice navegável, fórmulas completas, glossário de DXA/PHQ-9/OR, explicação de prioridades P0-P2, fontes oficiais e situação temporal das decisões Conitec. Retirar repetições sem enfraquecer ressalvas.

**Navegação global:** homepage, Evidências, Comparar, Projeções, Músculos/UTI, Metodologia. No celular, evitar navbar ilegível, cortes e menus falsamente interativos. Manter a identidade entre as páginas sem repetir o mesmo layout em todas.

## ETAPA 5 — FINALIZAR TESTES COM AGENT-BROWSER
Depois de implementar e corrigir com Playwright:
- Usar a CLI oficial \`vercel-labs/agent-browser\`; começar por \`agent-browser skills get core\` e seguir as instruções da versão instalada.
- Abrir o app e navegar com \`open\`, \`snapshot\`, \`click\`, \`get\` e \`screenshot\` por elementos reais, sem usar coordenadas frágeis.
- Conferir console errors, links originais e interação das páginas. Salvar provas na pasta/artifact de QA. Não declarar "sem erros" se apenas abriu a home.
- Executar \`pnpm run lint\`, \`pnpm run typecheck\`, \`pnpm run test\`, \`pnpm run build\`, \`pnpm run test:e2e\`, auditoria axe-core e dependências.
- Critérios: zero erros funcionais inesperados, zero overflow horizontal global em 360/390/768/1280/1440, acessibilidade automatizada sem violação detectada na matriz testada, links válidos, downloads funcionando, foco de teclado, prefers-reduced-motion e valores preservados.
- Teste manual iPhone Safari e Android Chrome **não pode** ser substituído por emulação Chromium.

## ETAPA 6 — COPYWRITING + HUMANIZAR
Executar \`copywriting\` para a proposta de valor e microcopy e depois \`humanizar\` para tornar o português natural, objetivo e confiável.
- Texto é educativo, não marketing de tratamento; proibir gatilhos alarmistas, promessas de cura, "risco calculado", "resultado garantido", depoimentos ou dados inventados.
- Voz: clara, humana, precisa, pouco burocrática, frases curtas, orientar ação.
- Revisar H1/H2, descrições, CTAs, filtros, labels, tooltips, vazio/erro/loading, compatibilidade, valores e rodapé em todas as rotas.
- Mudanças devem preservar nomes, números, tempo, população, design, incerteza, causalidade e fonte.
- Exemplos preferidos: "Evidência antes da conclusão"; "Veja o que os estudos realmente mediram"; "Leitura lado a lado disponível. Cálculo combinado bloqueado"; "Você está explorando hipóteses, não uma previsão sobre o Brasil"; "Nenhuma referência corresponde aos filtros".
- Para cada texto revisado, apresentar **original → novo → motivo**; guardar em docs/COPY_LUPA_HUMANIZADO.md.
- Revisar títulos SEO e descriptions com exatidão, sem chamar conteúdo candidato de validação científica.

## ETAPA 7 — GRAPHIFY-LABS POR ÚLTIMO
Depois de concluídos os testes e a revisão editorial, utilizar o **Graphify oficial** (repositório Graphify-Labs/graphify, pacote PyPI correto \`graphifyy\`, com dois y).
- Instalação: \`uv tool install "graphifyy[mcp]"\` ou \`pipx install "graphifyy[mcp]"\` em ambiente Python 3.10+; \`graphify install --project --platform codex\`; \`graphify .\`.
- Gerar artefatos reais: \`graphify-out/graph.json\`, \`GRAPH_REPORT.md\` e HTML interativo quando suportado. Se a versão gerar em paths diferentes, registrar o caminho real. Nunca criar um mapa fictício e chamá-lo de Graphify.
- Cobrir fonte TS/TSX, componentes, dados locais, documentação, testes, configs, rotas e regras científicas; explicitar como UI chama catálogos/guarda-inferências/motor de cenários.
- Consultar dependências e impacto de alteração (p.ex. \`StudyComparator\` → \`assessStudyComparison\` e \`ScenarioDashboard\` → \`runScenario\`), sempre com proveniência de aresta e confiança; não confundir proximidade no grafo de arquivos com relação causal entre estudos.
- Construir uma visão de módulos com (1) importação/uso de código, (2) fluxo da evidência e (3) governança/documentação. Registrar hotspots e duplicações, priorizar correções reais.
- Disponibilizar HTML, JSON e relatório para download ou via artefato GitHub Actions, e um resumo de dez relações mais importantes.
- O Graphify não substitui documentação clínica nem verificação humana.

## ETAPA 8 — GATES DE QUALIDADE, GITHUB E VERCEL
- Mudanças em commits pequenos e auditáveis; registrar arquivos, comportamento antes/depois, testes e riscos por etapa.
- Não mudar valores científicos E04/E10/E12/E16/E21 sem revisão documental.
- GitHub Actions precisa concluir com **success**. Registrar número real de testes e link da execução, sem copiar de corrida anterior.
- Consultar Vercel **projeto lupaa**: deployment atual \`READY\`, SHA igual ao GitHub, alias \`https://lupaa.vercel.app\`. Não assumir que o segundo projeto \`lupa\` é o domínio correto.
- Se falhar deploy ou ferramenta, corrigir causa-raiz ou registrar bloqueio; não inventar aprovação.
- Não deletar arquivos não relacionados, não introduzir backend sem permissão, não commitar credenciais.
- Salvar o relatório de design e screenshots comparativos, README/STATUS, relatório de copy, auditoria de QA e mapa Graphify.

## RESULTADO ESPERADO
A entrega deve conter:
1. Resumo do que foi efetivamente executado, com distinção entre skills lidas/instaladas, MCP conectado e ferramentas executadas;
2. Tabela **Antes | Depois | Motivo** com cada mudança de UX/UI;
3. Arquivos e commits, links de pull requests quando houver;
4. Capturas comparativas desktop e mobile verificáveis;
5. Relatório por rota (Home, Evidências, Comparador, Músculos/UTI, Projeções, Metodologia);
6. Revisão de copy/humanização com texto original, texto final e restrições preservadas;
7. E2E Playwright/agent-browser, axe, unit, build, audit: números e links reais;
8. Status do deploy no lupaa.vercel.app com SHA;
9. Graphify: knowledge graph HTML/JSON/GRAPH_REPORT e relações principais;
10. Limites residuais, testes em dispositivos físicos e revisão científica externa pendentes, sem dizer "100% aprovado" se não forem concluídos.

## CRITÉRIO DE SUCESSO
Uma pessoa entende o que é LUPA e encontra uma fonte em poucos segundos; consegue comparar dois estudos sem confundir desfechos; lê gráficos com N, escala, período e limite; sabe que os cenários 2031/2036 são hipóteses; navega no celular sem cortes; percebe uma identidade visual própria e sóbria, com movimento discreto e propósito. O resultado não parece um template genérico de dashboard de IA — e nenhuma decisão estética modifica o significado científico.

**COMECE AGORA pela etapa Taste, verifique o ambiente, siga a sequência exigida, implemente com testes e entregue evidências concretas.**

# LUPA Saúde — DOCUMENTAÇÃO MESTRA UNIFICADA
> **Fonte única de leitura e execução** · Hack Brasil 2026 · Versão consolidada em 06/11/2026  
> **Repositório:** https://github.com/annygabb/Lupa · **Aplicação:** https://lupaa.vercel.app  
> **Natureza:** especificação e plano de trabalho. **Não é comprovação de que todas as tarefas foram executadas.**

## Como usar este documento
Este arquivo reúne a direção de produto, o prompt de execução, as decisões visuais, o texto humanizado e o mapa científico/técnico. Comece pelas seções **1–12**, que estabelecem a ordem operacional e os critérios de aceite. As seções **A–D** reproduzem integralmente as quatro fontes GitHub consultadas em 06/11/2026, permitindo auditoria do conteúdo original sem sair deste arquivo. O texto adicional fornecido na conversa foi incorporado às regras consolidadas; termos semelhantes foram agrupados para evitar instruções contraditórias. Em caso de divergência de status, deve prevalecer a **verificação do código, testes e deploy atuais**, nunca uma promessa textual anterior.

### Índice
1. [Propósito e público](#1-propósito-e-público)
2. [Estado conhecido e lacunas](#2-estado-conhecido-e-lacunas)
3. [Regras científicas e de segurança](#3-regras-científicas-e-de-segurança)
4. [Arquitetura e módulos](#4-arquitetura-e-módulos)
5. [Design system e identidade](#5-design-system-e-identidade)
6. [Requisitos funcionais por rota](#6-requisitos-funcionais-por-rota)
7. [UX writing e humanização](#7-ux-writing-e-humanização)
8. [Sequência de skills e ferramentas](#8-sequência-de-skills-e-ferramentas)
9. [Testes, evidências e acessibilidade](#9-testes-evidências-e-acessibilidade)
10. [Mapa de conhecimento e rastreabilidade](#10-mapa-de-conhecimento-e-rastreabilidade)
11. [Plano de execução e aceite](#11-plano-de-execução-e-aceite)
12. [Prompt único executável](#12-prompt-único-executável)
13. [Apêndices originais A–D](#apêndices-originais-a-d)

---

## 1. Propósito e público
O **LUPA Saúde** é um *workspace público de pesquisa científica*, não um prontuário, ferramenta diagnóstica, CRM médico, aplicativo de consultas, mecanismo de prescrição ou plataforma para vender medicamentos. Seu eixo é a literatura sobre medicamentos para emagrecimento, com conexões **cuidadosamente delimitadas** a composição corporal, saúde emocional/psicológica, função muscular, condições críticas/UTI e contexto brasileiro, com comparações internacionais apenas onde os dados as sustentarem.

Públicos: banca do Hack Brasil 2026, estudantes, pesquisadores, profissionais de saúde e público não especialista. A experiência deve tornar compreensíveis as diferenças entre **evidência observada, associação, limitações metodológicas e hipótese**.

**Proposta central:** “Evidência antes da conclusão. Veja o que os estudos realmente mediram.”

## 2. Estado conhecido e lacunas
| Tema | Base documental em 06/11/2026 | Não presumir |
|---|---|---|
| Catálogo | 50 referências canônicas em curadoria; 55 IDs de origem incluindo aliases | 55 estudos independentes ou revisão clínica concluída |
| Indicadores | M01–M05 conferidos documentalmente | Revisão clínica independente, aptidão para projeções clínicas |
| Homepage | Uma primeira melhoria foi implementada com destaque E04/M03 e copy nova | Redesign de todas as rotas |
| Outras páginas | Melhorias e auditoria previstas | Aprovação visual concluída |
| Browser e QA | Documentos relatam testes Chromium anteriores; comandos e plano existentes | Aprovação atual do HEAD, teste físico iOS/Android ou ausência geral de bugs |
| Graphify | Há um mapa documental manual e referência a pipeline estrutural | Mapa documental semântico gerado automaticamente |
| Infraestrutura | Next.js 16, React 19, TypeScript, Tailwind 4, Zod, Vitest, Playwright, axe-core, GitHub Actions, Vercel | Supabase, SQL, APIs pagas ou serviços extras autorizados |

**Regra de status:** antes de agir, conferir main/HEAD, arquivos, branches, CI e implantação **lupaa**. Toda alegação de “concluído” deve ter evidência datada e vinculada ao commit.

## 3. Regras científicas e de segurança
1. Não inventar resultados, estudos, gráficos, fontes, estatísticas, casos, pacientes, depoimentos ou indicadores.
2. Os **50 registros** são candidatos/em curadoria; os **55 identificadores** incluem aliases. Impedir duplicação de evidência e contagem inflada.
3. **M01–M05** são indicadores conferidos documentalmente, mas sem validação clínica independente; não usar como estimadores clínicos ou populacionais.
4. Em E04/M03, a medida é **mudança relativa de massa magra por DXA**, não força, função ou diagnóstico de sarcopenia. Dados documentados: **tirzepatida −10,9%, placebo −2,6%, 72 semanas, n=124 e n=36**; explicitar os basais próprios dos grupos e a amostra contextual do subestudo (n=160).
5. Não inferir que medicamentos para emagrecimento causam internação, mortalidade ou tempo de recuperação em UTI. E04 (DXA), E10 (critérios/conceitos musculares), E12 (associação TC-prognóstico em UTI), E16 (continuação/retirada) e E21 (PHQ-9 pós-hoc) respondem a perguntas diferentes.
6. OR **2,33 ou 2,67** não significa mortalidade absoluta de 233%/267%, nem permite calcular risco absoluto sem risco basal e desenho aplicável. Não misturar OR com variação de massa corporal.
7. Não somar populações/coortes potencialmente sobrepostas ou relatos espontâneos de farmacovigilância para produzir incidência.
8. Não converter diferenças associativas em relações causais; marcar relações não demonstradas como **limites**, nunca como linhas de causalidade.
9. Não confundir encaminhamento/pedido à **Conitec** com incorporação ou disponibilização gratuita pelo **SUS**. Verificar situação e data antes de publicar afirmações novas.
10. Cenários de **2031/2036** são hipóteses didáticas para 2026–2036, não previsões oficiais ou epidemiológicas. O grupo de **1 milhão** é fictício e não representa a população elegível do Brasil; custos são premissas editáveis.
11. Não efetuar diagnósticos ou aconselhamento terapêutico individual; explicar incertezas e referenciar fontes primárias.
12. Sem autorização específica: não configurar **Supabase**, executar **SQL/migrações**, coletar dados pessoais, ativar backend novo, contratar APIs ou modificar serviços pagos.
13. Não excluir funcionalidades ou alterar resultados científicos sem conferência documental e revisão apropriada. Não registrar testes como aprovados sem execução.

## 4. Arquitetura e módulos
**Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Zod, Vitest, Playwright, axe-core, GitHub Actions e Vercel.

**Relações de implementação mapeadas documentalmente:**
- `app/page.tsx` → `SourceSpotlight` → `features/comparison/reviewed-metrics.ts` → M03/E04.
- `/evidencias` → `features/evidence/search.ts` → `features/evidence/unified-catalog.ts`.
- `/evidencias/[id]` → catálogo unificado.
- `/comparar` → `features/comparison/compatibility.ts` e `reviewed-metrics.ts` → catálogo.
- `/musculos-uti` → `features/muscle/evidence-map.ts` e indicadores.
- `/projecoes` → `features/scenarios/engine.ts`: **motor hipotético separado dos efeitos clínicos**.
- `/metodologia` → documentação de fontes, fórmulas e limites.

Verificar estes caminhos no HEAD antes de refatorar. As relações acima são de **uso de código**, não afirmações científicas de causalidade.

## 5. Design system e identidade
**Conceito aprovado por referências:** *Evidence Desk — Laboratório de Evidências*. Deve parecer ferramenta científica autoral, sofisticada e confiável, não dashboard SaaS genérico, prontuário nem landing page de marketing.

**Referências de composição, sem cópia:** Medicom (foco visual prioritário), Youcare (KPIs legíveis), Medix (contraste/editorial) e a referência adicional de Behance citada no apêndice B.

| Token | Valor de partida | Uso |
|---|---|---|
| Fundo | `#F4F7FB` | Base clara |
| Superfícies | `#FFFFFF` | Conteúdo |
| Texto | `#14233D` | Legibilidade |
| Azul de ação | `#315FF4` | CTA primário |
| Navy | `#152B51` | Uma área de destaque |
| Teal | `#0C948B` | Distinção secundária |
| Teal claro | `#67DFCE` | Acentos controlados |
| Âmbar | Verificar contraste | Advertências |

**Taste:** variação **6/10**, movimento **2/10**, densidade **5/10**. Tipografia corpo ~15–16px, textos densos 13–14px quando legíveis, números tabulares. Grid editorial assimétrico no desktop; mobile em coluna, sem overflow de página, tabelas com scroll local; alvos de toque ≥44px quando aplicável. Contraste WCAG AA, foco visível, sem dependência de hover no touch, suporte a `prefers-reduced-motion`, transições curtas e funcionais.

**Eliminar:** cards redundantes/cards dentro de cards decorativos, ícones em quadrados repetidos, gradientes sem sentido, órbitas incessantes, gráficos fictícios, microtextos ilegíveis, botões inertes, seções visualmente iguais e `transition: all`.

## 6. Requisitos funcionais por rota
| Rota | Trabalho requerido | Cuidados |
|---|---|---|
| `/` Home | Hero editorial, evidência E04/M03 com fonte, status de curadoria, CTA “Explorar evidências” e “Comparar estudos” | Não chamar 55 IDs de 55 estudos |
| `/evidencias` | Busca destacada, filtros, contagens, chips, ordenação, paginação, limpeza, estado vazio, fonte | Descrever desenho, população, período e limitações |
| `/evidencias/E04` e demais detalhes | Ficha rastreável, original, status, método, resultados e restrições | Não confundir indicador conferido com estudo aprovado |
| `/comparar` | Seleção A/B, inversão, compatibilidade, dados, limitações, fonte, bloqueio de mesma referência/alias | M01–M05 pertencem a publicações próprias e não mudam com A/B; distinguir leitura lado a lado, cálculo combinado e projeção |
| `/musculos-uti` | Exposição → DXA → força/função → pacientes críticos, com lacunas causais visualmente interrompidas | Não deduzir mortalidade/diagnóstico |
| `/projecoes` | Premissas, presets, validação Zod, resultados anuais 2031/2036, gráfico, tabela, avisos, reset, CSV/JSON versionados | Cenário simulado, não política pública/risco clínico |
| `/metodologia` | Índice, seleção/extração das fontes, tipos, comparabilidade, fórmulas, glossário DXA/PHQ-9/OR, SUS/Conitec, links primários | Ressalvas acessíveis e atualizadas |

**Gráficos:** exibir sinal, unidade, eixos/escala, zero quando pertinente, período, população, denominador, n, IC quando publicado, legenda, tabela alternativa e fonte; não criar precisão visual que a publicação não sustenta.

## 7. UX writing e humanização
**Voz:** português brasileiro natural, preciso, amigável sem ser infantil, sem sensacionalismo, FOMO ou venda de terapia. Aplicar `copywriting` e depois `humanizar`; registrar **original → novo → motivo**, sem mudar fatos.

| Local | Copy de referência |
|---|---|
| Home | **Evidência antes da conclusão. Veja o que os estudos realmente mediram.** |
| Home resumo | Consulte 50 registros científicos em curadoria, compare métodos e examine cinco indicadores conferidos nas publicações. |
| CTAs | **Explorar evidências** · **Comparar estudos** |
| Destaque DXA | **Quanto variou a massa magra?** |
| Catálogo | **50 registros em curadoria** · **55 IDs de origem, incluindo aliases** |
| Comparador | **Dois estudos, perguntas diferentes. Veja o que pode ser comparado.** |
| Bloqueio | **Leitura lado a lado disponível. Cálculo combinado bloqueado.** |
| Indicador | **Este gráfico usa apenas os grupos desta publicação.** |
| Limite DXA | **Massa magra medida por DXA não é sinônimo de força muscular.** |
| Limite PHQ-9 | **Os percentuais descrevem mudança de categoria de sintomas na amostra estudada. Não indicam risco individual.** |
| UTI | **Os estudos tratam de populações e desfechos diferentes. Não é possível concluir que a medicação altera a evolução na UTI.** |
| Projeções | **Você está explorando hipóteses, não uma previsão sobre o Brasil.** |
| Erro simulação | **Revise as taxas. A continuidade anual precisa ficar entre 0% e 100%.** |
| Exportação | **Baixar cenário e premissas (CSV/JSON)** |
| Sem dados | **Nenhuma referência corresponde aos filtros. Limpe um filtro ou tente outro termo.** |
| Metodologia | **De onde vêm os números e o que eles permitem concluir** |
| Rodapé | **Ferramenta de pesquisa. Não oferece diagnóstico nem estimativa de risco individual.** |

**Situação:** textos propostos não são automaticamente textos implementados. O apêndice C registra o que já foi aplicado na homepage e o que segue como proposta.

## 8. Sequência de skills e ferramentas
**Ordem obrigatória (não reordenar para fins de execução):**

| Fase | Ferramenta e origem | Papel | Condição de verificação |
|---|---|---|---|
| 0 | Inspeção GitHub/ambiente | Inventário, SHA, scripts, docs | Log, versões e HEAD |
| 1 | `design-taste-frontend` — `Leonxlnx/taste-skill` | Pesquisa visual, direção e design brief | Critique por página |
| 2 | `emil-design-eng` — `emilkowalski/skills` + `impeccable` — `pbakaus/impeccable` | Microinterações + audit/critique/distill/typeset/layout/clarify/adapt/harden/polish | Antes/depois |
| 3 | Microsoft `@playwright/mcp` + Taste + `grilling` — `mattpocock/skills` | Auditoria visual, navegação e questionamento de decisões | Sessão MCP real, screenshots |
| 4 | Implementação de todas as rotas | Refatorar sem regredir, checar ciência | Commits/PRs rastreáveis |
| 5 | `agent-browser` — `vercel-labs/agent-browser` | Navegação final e fluxo acessível | Snapshots e logs |
| 6 | `copywriting` — `coreyhaines31/marketingskills` + `humanizar` — `fabricioctelles/skills` | Revisão completa do conteúdo em PT-BR | Registro texto antes/depois |
| 7 | `graphify` — `Graphify-Labs/graphify` / pacote `graphifyy` | Mapa automático código e, se autorizado, semântica documental | Arquivos reais + relatório |
| 8 | Gates finais / CI / Vercel | Validar HEAD publicado | Checks, SHA, URL |

**Comandos previstos, sujeitos à verificação das versões instaladas:**
```powershell
# Windows, raiz do projeto: inspecionar o script antes de executar
Get-Content scripts/setup-design-stack.ps1
# Conferir instruções do agente utilizado antes de aplicar:
npx skills add Leonxlnx/taste-skill --skill design-taste-frontend
npx skills add emilkowalski/skills --skill emil-design-eng
npx skills add pbakaus/impeccable --skill impeccable
npx skills add mattpocock/skills --skill grilling
npx skills add vercel-labs/agent-browser
npx skills add coreyhaines31/marketingskills --skill copywriting
npx skills add fabricioctelles/skills --skill humanizar
# MCP oficial: configurar .vscode/mcp.json e confirmar sessão em navegador
npx @playwright/mcp@latest
npm install -g agent-browser
agent-browser install
agent-browser skills get core
# Graphify: pacote com dois "y"; usar ambiente isolado
uv tool install "graphifyy[mcp]"
graphify install --project --platform codex
# Modo somente código quando não existir backend semântico autorizado:
$env:GRAPHIFY_BACKEND="none"
graphify . --code-only
```
A sintaxe Graphify e suas operações de cluster/relatório devem ser **confirmadas na versão instalada**; os documentos de origem mencionam `graphify cluster-only .` como possibilidade. **Não** chamar install de uso, nem confundir `@playwright/mcp` com `@playwright/test`.

**Grilling — perguntas obrigatórias:** o visitante entende curadoria vs validação? Sabe que seleção A/B não controla M01–M05? Consegue chegar à fonte? Distingue hipótese de previsão? Usa todo o produto no celular? Os termos DXA, OR e PHQ-9 são explicados? Existe CTA falso? O visual é específico do LUPA? Há decisões pendentes sem aprovação?

## 9. Testes, evidências e acessibilidade
**Matriz de larguras:** 360, 390, 768, 1280 e 1440 px; screenshots em todas as rotas, inclusive estados de erro, vazio, seleção duplicada, entradas inválidas, foco e tabelas.

**Execução mínima:**
```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run test:e2e
```
Somar auditorias `axe-core`, dependências, logs de console, verificação de links externos/CSV/JSON, teclado, contraste AA, `prefers-reduced-motion` e verificações de regressão científica. Documentos mencionam **100 testes Chromium aprovados anteriormente**; isso não prova a suíte no HEAD atual. Teste em **Safari no iPhone real** e **Chrome em Android real** é pendência separada da emulação.

**Registro mínimo por teste:** data/hora, SHA, ambiente, comando, resultado (pass/fail/blocked), número real de testes, artefato/log/screenshot e responsável ou ferramenta. Falha esperada de validação/segurança ≠ erro funcional de implementação.

## 10. Mapa de conhecimento e rastreabilidade
Criar **três visões**: (1) arquitetura: página → componente → função → catálogo/motor; (2) ciência: fonte → publicação → indicador → interpretação → limitação; (3) governança: fonte → regra → teste → documento.

Distinguir rigorosamente:
- **EXTRACTED:** importações, funções e usos efetivamente extraídos do código;
- **INFERRED:** hipóteses/relações derivadas pelo analista, sujeitas a verificação;
- **AMBIGUOUS:** relações sem resolução confiável;
- **LIMITAÇÃO CIENTÍFICA:** setas pontilhadas/não causais, nunca evidência de efeito.

Com backend não autorizado/ausente, `GRAPHIFY_BACKEND=none` gera apenas mapa estrutural de código AST; **documentos Markdown/PDF não são interpretados semanticamente** por esse caminho. Manter separadamente o mapa documental curado manualmente. Artefatos esperados *quando realmente gerados*: `graphify-out/graph.json`, `GRAPH_REPORT.md`, visualização HTML, clusters, hotspots de acoplamento e relações com proveniência.

## 11. Plano de execução e aceite
| Prioridade | Pacote | Entrega mensurável | Gate |
|---|---|---|---|
| P0 | Inventário e ciência | HEAD, catálogo, aliases, revisão dos indicadores e limites; cópia de segurança lógica | Sem valores ou fontes inventados |
| P0 | Auditoria inicial | Screenshots, console, árvore a11y por rota/largura, lista de defeitos | Evidências salvas |
| P1 | Identidade visual | Tokens, layout, motion, estados, mobile | Antes/depois por rota |
| P1 | Fluxos científicos | Explorar, comparar, visualizar, projetar, exportar e consultar fonte | Testes funcionais + limites |
| P1 | Linguagem | Copy PT-BR e microcopy com versionamento | Fatos e incertezas intactos |
| P1 | Qualidade | Lint, typecheck, unit, E2E, axe, build, dependências | Logs atuais |
| P2 | Graphify | Mapa código, manual científico e ligação de regras/testes | Artefatos e origem das arestas |
| P2 | Entrega | GitHub commits/PR, CI success e deploy `lupaa` READY no mesmo SHA | Verificável no link público |
| Pendente de validação externa | Revisão clínica independente e testes físicos | Assinatura/evidência independente | Não declarar conclusão sem isso |

**Decisões abertas documentadas:** navegação mobile com abas horizontais vs bottom bar; manter/reduzir/remover órbita conceitual no Comparador; quantidade de glossário inline; grau de simplificação para público leigo e banca. Não criar aprovação fictícia. Sempre verificar a situação atual do produto antes de executar a lista.

**Relatório de entrega esperado:** inventário de skills e versões, MCP conectado ou não, antes/depois/motivo, capturas, alterações e SHA, testes e logs, revisão editorial, artefatos Graphify, estado da Vercel e pendências. Não usar “100% validado” se houver revisão clínica, requisitos do hackathon ou dispositivos físicos não verificados.

## 12. Prompt único executável
> **Atue como equipe sênior de produto, design health-tech, desenvolvimento Next.js/React/TypeScript, acessibilidade, QA, pesquisa científica, UX writing e engenharia de conhecimento. Trabalhe exclusivamente no repositório `annygabb/Lupa` e implantação `lupaa.vercel.app`. Leia esta documentação mestra e os arquivos relevantes do HEAD, preserve 50 registros canônicos e 55 IDs com aliases, M01–M05 documentais ainda sem revisão clínica independente, e todas as restrições científicas, de privacidade e de infraestrutura.**
>
> **Execute na ordem:** (0) auditoria do ambiente e SHA; (1) Taste para investigação e design brief Evidence Desk; (2) Emil + Impeccable para microinterações, tipografia, layout e acabamento; (3) Playwright MCP + Taste + Grilling para inspecionar screenshots e desafiar decisões; (4) implementar correções em todas as rotas, com commits pequenos; (5) validar com agent-browser e a suíte automatizada; (6) revisar todo o PT-BR com copywriting e humanizar sem mudar fatos; (7) executar Graphify por último, separando código extraído de documentação manual e inferências; (8) rodar gates finais e verificar CI e SHA da implantação Vercel.**
>
> **Não configurar Supabase, executar SQL, usar APIs pagas, coletar dados pessoais, gerar evidência falsa ou extrapolar efeitos clínicos sem autorização. Não confundir DXA com força/sarcopenia, OR com risco absoluto, proposta Conitec com cobertura SUS, nem cenários 2031/2036 com previsões oficiais.**
>
> **Para cada página**, entregar mudanças implementadas, Before/After/Why, capturas desktop/mobile em 360/390/768/1280/1440, testes, fontes e limitações; não afirmar ferramenta usada sem prova. Finalize com links dos commits, execução GitHub Actions, URL/SHA do deploy, relatório editorial, Graphify e lista explícita de pendências. Se faltar acesso a alguma ferramenta, documente a limitação, não simule aprovação e conclua apenas o trabalho verificável.

---

# Apêndices originais A–D
Os quatro documentos abaixo são preservados **integralmente** para conferência de detalhes, exemplos, diagramas Mermaid, terminologia e estado registrado. O quinto link da solicitação era uma repetição do primeiro. O arquivo texto adicional da conversa contém uma versão expandida do mesmo plano e foi incorporado às seções 1–12, não sendo tratado como status novo de execução.

## Apêndice A — Prompt mestre original
Fonte: https://github.com/annygabb/Lupa/blob/main/docs/PROMPT_MESTRE_SKILLS_LUPA.md

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
- Instalação: \`uv tool install "graphifyy[mcp]"\` ou \`pipx install "graphifyy[mcp]"\` em ambiente Python 3.10+; \`graphify install --project --platform codex\`; \`graphify .\` com backend semântico autorizado; se não houver chave ou backend local, usar \`GRAPHIFY_BACKEND=none graphify . --code-only\` (mapa AST de código somente, **documentos ficam pendentes**). Executar ainda \`graphify cluster-only .\` para gerar relatório, rótulos e visualização do mapa estrutural.
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


---

## Apêndice B — Design e auditoria originais
Fonte: https://github.com/annygabb/Lupa/blob/main/docs/DESIGN_LUPA_2026.md

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


---

## Apêndice C — Copywriting e humanização originais
Fonte: https://github.com/annygabb/Lupa/blob/main/docs/COPY_LUPA_HUMANIZADO.md

# LUPA — UX Writing PT-BR (copywriting + humanizar)

**Regras:** preservação factual total; evitar promessas clínicas, FOMO, termos como "cura", "comprovado que o medicamento causou", "resultado para todos", "risco previsto", "SUS já oferece" e diagnósticos. A copy do LUPA tem função educativa, não vender terapia.

| Superfície | Texto sugerido | Função |
|---|---|---|
| Home H1 | **Evidência antes da conclusão. Veja o que os estudos realmente mediram.** | Promessa verificável e específica |
| Home resumo | Consulte 50 registros científicos em curadoria, compare métodos e examine cinco indicadores conferidos nas publicações. O LUPA separa resultados observados de hipóteses sobre o futuro. | Não confundir quantidade catalogada com aprovação |
| Home CTA principal | **Explorar evidências** | Ação direta |
| Home CTA secundário | **Comparar estudos** | Ação direta |
| Home estudo em foco | **Quanto variou a massa magra?** | Pergunta concreta; explicar DXA |
| Status do catálogo | **50 registros em curadoria** | Não inflar estudos revisados |
| Identificadores | **55 IDs de origem, incluindo aliases** | Evitar afirmar 55 estudos distintos |
| Comparador introdução | **Dois estudos, perguntas diferentes. Veja o que pode ser comparado.** | Frase sem prometer metanálise |
| Comparador bloqueio | **Leitura lado a lado disponível. Cálculo combinado bloqueado.** | Estado + razão |
| Indicador | **Este gráfico usa apenas os grupos desta publicação.** | Corrigir inferência de A/B |
| DXA | **Massa magra medida por DXA não é sinônimo de força muscular.** | Limitação central |
| PHQ-9 | **Os percentuais descrevem mudança de categoria de sintomas na amostra estudada. Não indicam risco individual.** | Denominador/causalidade |
| Músculos/UTI | **Os estudos tratam de populações e desfechos diferentes. Não é possível concluir que a medicação altera a evolução na UTI.** | Sem ponte causal |
| Projeções | **Você está explorando hipóteses, não uma previsão sobre o Brasil.** | Escopo do cenário |
| Projeções em valores inválidos | **Revise as taxas. A continuidade anual precisa ficar entre 0% e 100%.** | Erro específico, ação direta |
| Simulador exportação | **Baixar cenário e premissas (CSV/JSON)** | Rastreabilidade |
| Fonte pendente | **Dados ainda em curadoria. Consulte o estudo original.** | Transparência |
| Pesquisa sem resultados | **Nenhuma referência corresponde aos filtros. Limpe um filtro ou tente outro termo.** | Recuperação clara |
| Metodologia | **De onde vêm os números e o que eles permitem concluir** | Orientação |
| Footer disclaimer | **Ferramenta de pesquisa. Não oferece diagnóstico nem estimativa de risco individual.** | Responsabilidade |

### Humanização
- Frases curtas, sem slogan inflado, metáfora de "revolução" ou apelo sensacionalista.
- Manter tom acolhedor mas preciso, voz de equipe científica e de tecnologia.
- Evitar repetir a mesma advertência completa em todos os cartões: usar um resumo contextual e um link "Entenda os limites".
- Explicar siglas na primeira ocorrência, sem eliminar referências originais.
- A legenda de resultado tem que preservar sinal, unidade, N, população, período e ressalvas.
- Não adicionar depoimentos, estatísticas, recomendações de uso ou consentimento que não existam.

**Status real:** texto da homepage aplicado em código nesta etapa. As demais linhas são propostas editoriais e exigem revisão por rota antes de implementação.


---

## Apêndice D — Mapa de conhecimento original
Fonte: https://github.com/annygabb/Lupa/blob/main/docs/MAPA_CONHECIMENTO_LUPA.md

# LUPA Saúde — Mapa de conhecimento científico e arquitetura

**Data:** 06/11/2026  
**Tipo:** mapa curado manualmente a partir dos arquivos do projeto; **não** é o grafo gerado pelo Graphify.  
**Grafo automático:** produzidos separadamente pelo pipeline \`Graphify-Labs\` em \`graphify-out/\` a partir do AST do código, sem API de IA.

## 1. Mapa de dependências: interface → lógica → evidências

\`\`\`mermaid
flowchart LR
  H["app/page.tsx<br/>Home"] --> HS["SourceSpotlight"]
  HS --> RM["features/comparison/reviewed-metrics.ts<br/>M03, E04"]

  EXP["/evidencias<br/>Explorador"] --> SEARCH["features/evidence/search.ts"]
  SEARCH --> UC["unified-catalog.ts<br/>50 referências"]
  DET["/evidencias/[id]<br/>Ficha"] --> UC

  COMP["/comparar<br/>Comparador"] --> CP["features/comparison/compatibility.ts"]
  COMP --> RM
  CP --> UC
  RM --> UC

  MUS["/musculos-uti<br/>Músculos e UTI"] --> MC["features/muscle/evidence-map.ts"]
  MUS --> RM
  MC --> UC

  PROJ["/projecoes<br/>Cenários"] --> ENG["features/scenarios/engine.ts<br/>Modelo hipotético"]
  METH["/metodologia<br/>Metodologia"] --> ENG
  METH --> UC

  style UC fill:#eef3ff,stroke:#416dfb,color:#192b45
  style ENG fill:#e8f7f2,stroke:#0b897c,color:#173d38
\`\`\`

**Interpretação:** essas arestas significam **uso/importação documentado no repositório**, jamais causalidade clínica. Todos os registros do catálogo são \`candidate\`. O simulador usa **premissas hipotéticas editáveis**, não porcentagens extraídas de ensaios.

## 2. Mapa de relações entre publicações e conceitos

\`\`\`mermaid
flowchart TB
  DXA["E04 / M01–M03<br/>SURMOUNT-1 DXA<br/>n=160, 72 semanas"]
  MASS["Massa magra<br/>DXA"]
  FORCE["Força e função muscular<br/>EWGSOP2 E10"]
  UTI["E12 UTI<br/>Associação TC–prognóstico"]
  CAUSAL["Causalidade farmacológica<br/>sobre UTI: NÃO demonstrada"]
  RET["E16 / M04<br/>SURMOUNT-4<br/>Continuidade/retirada"]
  MENT["E21 / M05<br/>PHQ-9 pós-hoc"]
  SIM["Simulação 2031/2036<br/>Hipóteses de fluxo"]

  DXA -->|"mede"| MASS
  MASS -.->|"não mede diretamente"| FORCE
  FORCE -.->|"conceitos relacionados;<br/>não mesma população"| UTI
  DXA -.->|"não permite estimar"| CAUSAL
  UTI -.->|"OR não é risco absoluto"| CAUSAL
  RET -->|"outra pergunta clínica"| DXA
  MENT -->|"outra pergunta clínica"| DXA
  SIM -.->|"NÃO utiliza efeitos<br/>desses estudos"| DXA
\`\`\`

As ligações pontilhadas representam **limite ou hipótese não estabelecida**, não evidência de associação nem inferência causal. Os desfechos têm estimandos, populações e janelas distintas.

## 3. Fontes de documentação e decisões

| Arquivo | Relação documental principal | Limite |
|---|---|---|
| \`docs/ETAPA4_COMPARADOR.md\` | M01–M05 e regras de comparação | Conferência documental; sem revisão clínica independente |
| \`docs/ETAPA5_6_7_MVP_FUNCIONAL.md\` | Músculos/UTI, cenários, metodologia | Simulações hipotéticas |
| \`docs/PLANO_REVISAO_CLINICA_PRIORITARIA.md\` | Checklists E04, E10, E12, E16 e E21 | Plano de revisão, não aprovação |
| \`docs/DESIGN_LUPA_2026.md\` | Decisões Taste, Emil e Impeccable | Documento de design editorial |
| \`docs/COPY_LUPA_HUMANIZADO.md\` | Copy PT-BR e revisão factual | Propostas não implementadas integralmente |
| \`docs/QA_TESTES_BROWSER_ACESSIBILIDADE.md\` | Vitest, Playwright, axe, CI/Vercel | Não comprova Safari/iPhone físico |
| \`docs/PROMPT_MESTRE_SKILLS_LUPA.md\` | Processo de instalação, auditoria e entregáveis | Instruções de execução, não prova de execução |

## 4. Perguntas para investigar no Graphify

Após gerar \`graphify-out/graph.json\`, consultar:

- \`graphify query "Where is getUnifiedEvidence used?"\`
- \`graphify path "StudyComparator" "assessStudyComparison"\`
- \`graphify explain "runScenario"\`
- \`graphify query "What UI components depend on reviewedMetrics?"\`
- \`graphify query "What would break if features/evidence/unified-catalog.ts changes?"\`

Os nomes de nó reais devem ser consultados no grafo antes de executar \`graphify path\`: **não inventar caminhos**. Se houver múltiplos nós com o mesmo nome, escolher pelo caminho/arquivo.

## 5. Limite da geração automática atual

No pipeline sem chaves (\`GRAPHIFY_BACKEND=none\`), Graphify usa AST de arquivos de código, sem extração semântica de Markdown, PDFs e imagens. Para mapear automaticamente o conteúdo de \`docs/\` com Graphify, será necessário um backend de linguagem **autorizado e configurado** (ou versão/skill com capacidade local equivalente). Nenhuma chave, API paga ou serviço externo foi configurado.

Este mapa humano de documentação complementa o grafo automático, sem fingir que o Graphify leu documentos que ele pulou.


---


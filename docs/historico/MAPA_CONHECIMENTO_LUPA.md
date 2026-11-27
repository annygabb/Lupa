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

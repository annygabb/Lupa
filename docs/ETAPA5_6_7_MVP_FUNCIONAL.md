# LUPA Saúde — Etapas 5, 6 e 7: núcleo funcional do MVP

**Data-base do código:** 05/11/2026 · **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zod e Vitest.
**Objetivo:** completar a funcionalidade das cinco rotas principais antes de polimento visual adicional, sem exigir Supabase, SQL, migrações ou dados pessoais.

## Módulos entregues

| Rota | Função |
|---|---|
| / | Painel principal com links reais para os quatro módulos de pesquisa/funcionalidade e a metodologia |
| /evidencias | 50 registros canônicos, 55 referências de origem, filtros, busca e fichas locais |
| /comparar | Dois estudos lado a lado, avisos de incompatibilidade, cinco indicadores científicos conferidos e tabelas |
| /musculos-uti | Perguntas interativas, quatro afirmações classificadas, estrutura de evidências, gráfico DXA e lacuna causal |
| /projecoes | Motor determinístico de fluxos 2026–2036, presets e parâmetros editáveis, gráficos, tabela e exportação CSV/JSON |
| /metodologia | Protocolo de curadoria, regras científicas, fórmulas, contexto brasileiro, fontes e glossário |

## 1. Músculos e UTI — relação sem causalidade inventada

As quatro afirmações do módulo têm fonte e tipo:
- C01: E04 (SURMOUNT-1 DXA; n=160), resultado de composição corporal. Massa magra DXA **não é** medida direta de força, sarcopenia nem UTI. [PubMed PMID 39996356](https://pubmed.ncbi.nlm.nih.gov/39996356/).
- C02: E10 (EWGSOP2, PMID 30312372), consenso de diagnóstico e avaliação; força é elemento-chave. [PubMed](https://pubmed.ncbi.nlm.nih.gov/30312372/).
- C03: E12 (metanálise CT/UTI, PMID 40462133), 35 estudos, 9.366 pacientes; associações OR 2,33 curto prazo e OR 2,67 longo prazo. OR **não equivale** a risco absoluto. [PubMed](https://pubmed.ncbi.nlm.nih.gov/40462133/).
- C04: comparação documental E04+E12 **não é prova** de que tirzepatida altere desfechos críticos; são populações diferentes. Não multiplicar 25% de massa magra no emagrecimento pelo OR de UTI.

O componente de investigação guiada é \`components/muscle/muscle-research.tsx\`. A interpretação validada de forma determinística fica em \`features/muscle/evidence-map.ts\`.

## 2. Projeções: simulação de fluxo, NÃO previsões clínicas

### Propósito limitado e explícito
O usuário define **um grupo de referência**, taxa anual de entrada, continuidade, variação anual do grupo e crescimento da taxa de entrada. Esses parâmetros **não foram inferidos de ensaios clínicos nem de números brasileiros**. Os presets são ilustrativos e nunca denominados "previsões".

Modelo: \`lupa-flow-v1\`, \`kind = hypothetical_illustration\`, \`referenceYear=2026\`. Horizonte anual 2026–2036; recortes 2031 e 2036.

### Fórmulas

- \`N(t) = round(Nbase × (1 + crescimento/100)^(t−2026))\`
- \`taxaInício(t) = min(100, taxaInicial + incrementoPp × (t−2026))\`
- \`continuidade(t) = min(N(t), round(ativos(t−1) × retenção/100))\`
- \`saídas(t) = max(0, ativos(t−1) − continuidade(t))\`
- \`inícios(t) = round((N(t) − continuidade(t)) × taxaInício(t)/100)\`
- \`ativos(t) = continuidade(t) + inícios(t)\`
- \`proporção(t) = ativos(t)/N(t) × 100\`
- \`custo(t) = ativos(t) × custoAnualHipotéticoInformado\`, somente se custo > 0; não se presume preço oficial.

No ano de 2026, \`ativos(2026) = round(Nbase × ativosIniciais/100)\`, sem contabilizar novos inícios no período-base.

### Presets

| Cenário | Início anual | Retenção anual | Aumento da entrada |
|---|---:|---:|---:|
| Acesso restrito | 0,7% | 55% | 0 p.p./ano |
| Acesso gradual | 2,5% | 70% | 0,3 p.p./ano |
| Expansão hipotética | 5% | 80% | 1 p.p./ano |

Os três exemplos usam **um milhão de pessoas como grupo fictício de referência**, sem alegar que seja o número de brasileiros clinicamente elegíveis. Todos os valores são editáveis.

### Validação

A entrada é validada por Zod. O modelo impede:
- População fora de 1.000–100.000.000;
- Crescimento fora de −5 a +5%/ano;
- Retenção fora de 0–100%;
- Início fora de 0–30%;
- Incremento fora de 0–5 pontos percentuais por ano;
- Custo hipotético negativo ou acima de R$ 150 mil por pessoa/ano;
- Contagem de ativos maior que a população do ano, saídas negativas e números não finitos.

Exports são gerados no próprio navegador em CSV com separador \`; \` e BOM UTF-8, e JSON versionado, sem coleta de dados no servidor. Entradas acumuladas podem contar reinícios: **não são pessoas únicas**.

O modelo não estima perda de peso, massa muscular, mortalidade, internação, farmacovigilância, custo-efetividade ou adoção nacional real.

### Por que IBGE e Vigitel não foram convertidos em elegibilidade

O IBGE fornece estatísticas/projeções demográficas, enquanto Vigitel 2006–2024 investiga fatores de risco nas **capitais e DF**; nenhum é por si um denominador nacional de pacientes elegíveis a medicamentos específicos. Portanto são fornecidos como links de contexto, sem número embutido no motor.
- [IBGE — Projeções da população, revisão 2024](https://www.ibge.gov.br/estatisticas/sociais/populacao/9109-proje%C3%A7%C3%A3o-da-populacao.html)
- [Vigitel, Ministério da Saúde](https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/vigitel/)

### SUS e Conitec

- Portaria SECTICS/MS nº 65/2025: **não incorporação** de semaglutida em uma indicação específica à época; não é regra sobre toda a classe ou todos os grupos. [Ato normativo](https://bvsms.saude.gov.br/bvs/saudelegis/sctie/2025/prt0065_16_09_2025.html).
- Pedido em 24/09/2026: análise de possível incorporação de semaglutida ou liraglutida; pedido **não é** incorporação, financiamento nem distribuição universal. [Ministério da Saúde](https://www.gov.br/saude/pt-br/assuntos/noticias/2026/setembro/ministerio-da-saude-protocola-na-conitec-pedido-de-analise-para-incorporacao-de-canetas-emagrecedoras-no-sus).

O preset "Expansão hipotética" **não** representa decisão, calendário ou financiamento pelo SUS.

## 3. Metodologia e rastreabilidade

A rota \`/metodologia\` documenta:
1. Identificação da fonte;
2. Classificação do desenho e natureza da evidência;
3. Extração documental;
4. Compatibilidade;
5. Restrição explícita às inferências;
6. Fórmulas do simulador;
7. Contexto regulatório brasileiro;
8. Glossário e links primários.

**Estado científico do catálogo:** todos os 50 registros permanecem \`candidate\` e \`projectionApproved=false\`. Cinco indicadores extraídos têm \`displayStatus=primary_source_checked\` mas \`independentClinicalReview=false\`. Nenhuma revisão clínica independente integral foi declarada.

## 4. Testes e qualidade

Os novos testes executam invariantes de fluxo, períodos, limites de entrada, inícios, saídas, continuidade, custos, dados inválidos, exportação CSV, SSR inicial, classificação de claims e rastreabilidade. Os testes anteriores do Explorador e Comparador são preservados.

**Limite:** testes de componente renderizado no servidor e build não equivalem a testes E2E em navegador real, análise de acessibilidade auditada ou validação clínica.

### Conferência manual antes do acabamento visual

- Abrir \`/musculos-uti\` e selecionar as quatro perguntas: os avisos precisam mudar sem permitir inferência causal.
- Abrir \`/projecoes\`, alternar presets e verificar 2031/2036; editar N e taxa de continuidade; os números precisam atualizar sem recarregar.
- Testar valores inválidos (e.g. retenção 120): o modelo deve bloquear o resultado.
- Exportar CSV e JSON e conferir cabeçalhos, dados e avisos.
- Desabilitar custo (0) e conferir que nenhum custo monetário aparece.
- Abrir \`/metodologia\` e fontes; verificar conteúdo regulatório e fórmulas.
- No celular: 360, 390, 768 px; nenhum scroll horizontal de página, somente em tabelas extensas.
- Repetir \`/evidencias\` e \`/comparar\`: regressão visual/funcional.
- Conferir domínio publicado e estado **READY** do novo commit. Se ligação Git/Vercel falhar, não alegar deploy concluído.

## 5. Pendências para uma entrega cientificamente mais robusta

- Conferir e curar individualmente as fontes restantes, incluindo suplementos, denominadores, amostras, período, desfechos, RCT versus observacional e vieses.
- Revisão científica independente dos cinco indicadores exibidos antes de qualquer afirmação populacional clínica.
- Incluir uma população brasileira elegível **somente** após fonte/corte clínico validados, sem usar prevalência isolada como denominador.
- Desenvolver um módulo de impacto econômico real apenas com preços, custos, probabilidades e margens de incerteza documentados.
- Realizar testes E2E, auditoria de acessibilidade e performance em navegador/dispositivos.
- Versionar lockfile de dependências; revisão de CI/CD e segurança.
- Produzir vídeo de demonstração, pitch e materiais de submissão do hackathon.
- Supabase não é pré-requisito para este MVP de pesquisa pública. Qualquer banco, autenticação ou dados pessoais exigirão projeto e autorização próprios.

**Nenhuma tabela foi criada, nenhum SQL executado e nenhuma integração Supabase configurada.**

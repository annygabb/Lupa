# LUPA Saúde — Etapa 3B/3C: interface local do Explorador Científico

**Escopo autorizado:** criar interface `/evidencias` e fichas locais, sem banco nem deploy.
**Estado clínico:** catálogo com 50 registros e 55 referências originais; nenhum habilitado para projeção.

## Páginas e experiência

- `/evidencias`: interface responsiva com busca por palavras e PMID, atalhos por tema,
  filtros de tema/fármaco/desenho, filtros adicionais de prioridade/ano/natureza da fonte,
  ordenação, paginação de nove cards, resultado vazio e botão para limpar filtros.
- `/evidencias/[id]`: ficha para cada ID canônico ou alias, contendo descrição da amostra,
  resumo documental, limitações, identidade, links originais, versões complementares,
  documentos relacionados e alertas de curadoria.
- O componente usa `searchUnifiedEvidence()` da Etapa 3A; não há busca falsa, API, ou
  lógica duplicada com os validadores anteriores.
- Cards e links externos têm destino real; páginas internas resolvem referências por
  `getUnifiedEvidence()`. Os links externos são abertos com `noopener noreferrer`.
- Layout com cores, fonte de sistema, foco visível, componentes sem dependência nova e
  legibilidade mobile-first; sem gráficos clínicos de números não validados.

## Proteções científicas e de conteúdo

- Todos os cards e fichas exibem **Em curadoria**.
- Os dados numéricos são resumos provenientes do material enviado; **não representam
  validação clínica por parte do produto**.
- Uma prioridade P0 é ordem editorial, não evidência clínica de qualidade maior.
- Família SURMOUNT e outros conjuntos relacionados são identificados sem somar amostras.
- Documentos regulatórios continuam classificados separadamente de estudos.
- Não há cálculo de incidência, risco individual, efeito causal de tirzepatida sobre UTI
  ou projeções populacionais nesta etapa.

## Verificações automatizadas

Os testes devem verificar, além da CI anterior, rotas e identificadores, rótulos científicos,
renderização server-side de cards e controles, referências HTTPS e estado de curadoria.
Não foi feito E2E em navegador real; sem deploy ainda não há validação de experiência pública.

## Fora do escopo e próximos gates

Não foram criados Supabase, SQL, migrações, autenticação, novas APIs, importação
de dados de pacientes ou deploy na Vercel.
Um próximo gate, com aprovação do usuário, poderá tratar auditoria
científica número a número e o desenvolvimento do simulador de cenários.

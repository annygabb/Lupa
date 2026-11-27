# LUPA Saúde — Etapa 4C: Dashboard Premium de Pesquisa

**Data:** 05/11/2026  
**Motivação:** as capturas da etapa 4B demonstraram que a página estava funcional, mas visualmente genérica: cards empilhados, pouca escala tipográfica, gráficos discretos, ausência de visualização de destaque e excesso de leitura linear.

## Objetivo de UX

Migrar de "página de documentação com cards" para **workspace de pesquisa clínica moderno**. A referência são as três imagens enviadas (Medicom, Youcare e Medix): composição de dashboard, painéis bento, navegação refinada, contraste de escala, sombras delicadas, um foco visual de alta qualidade e gráficos com maior presença. O novo layout é original e não utiliza imagens, marcas ou pacientes de terceiros.

### Prioridades executadas
1. **Hero editorial com visualização original:** uma órbita abstrata relaciona as referências A e B e muda com a seleção. É uma composição conceitual com a frase "Conexões não são causalidade" — não representa valores clínicos, risco nem correlação quantificada.
2. **Painel bento:** 50 referências canônicas, cinco indicadores de fonte conferida e zero projeções aprovadas, com status explícitos.
3. **Ações de estudo separadas dos resultados:** seletores A/B em toolbar única, troca de posição e dois cards científicos com ênfase em título, método, população, resumo e limite. Dados completos permanecem acessíveis em `details`.
4. **Compatibilidade como decisão principal:** cabeçalho em azul-marinho, veredito contextual, três estados visíveis, motivo prioritário em destaque, avisos secundários e explicações originais preservadas.
5. **Gráfico real com escala vertical:** plot SVG de duas séries **do mesmo estudo**, barras proporcionais aos números extraídos; para variações percentuais, eixo zero e direção de aumento/redução, para proporções, 0–100%. Valores numéricos destacados em cards de duas cores, seguidos da tabela completa e dos intervalos relatados. Não há linha de tendência fictícia.
6. **Navegação de workspace:** índice lateral compacto para desktop e âncoras com links no mobile. Foco de teclado e movimento reduzido respeitados.
7. **Identidade compartilhada:** cabeçalho em cápsulas, navegação ativa e página inicial no mesmo visual, inclusive com indicação de módulos ainda não implementados.
8. **Explorador científico:** hero editorial com tipografia mais expressiva, cards de referência com nova hierarquia, estados de curadoria visíveis e filtros existentes preservados. Todas as referências continuam em modo local.

## Paleta e tipografia

- Fundo: `#F4F7FB`; superfícies brancas.
- Azul de interação `#315FF4`; azul-marinho de contraste `#162647`.
- Verde-teal secundário `#0FAE9E` para o segundo estudo e uma das séries gráficas.
- Texto escuro `#17283D`; textos secundários `#526575`.
- Fonte de sistema sem dependência de recurso externo. Títulos 27–68 px conforme contexto e viewport, corpo 13–16 px.
- Superfícies raio 20–26 px, sombra baixa de duas camadas, respiro interno 20–32 px.

## Conteúdo científico e proteção de inferências

- Nenhum número, efeito, denominador, publicação ou citação do catálogo foi alterado.
- `assessment.canPoolNumericalEstimates` continua sempre `false`.
- A visualização de órbitas e os marcadores bento são decorativos/conceituais, não resultados científicos.
- Cinco gráficos são internos às três fontes previamente conferidas (E04, E16, E21), sem revisão clínica independente.
- Associação muscular/UTI não prova relação causal da tirzepatida.
- Nenhum estudo possui aprovação para o motor de projeções.

## Qualidade e estados de validação

- Testes de UI e verificação de escalas de gráfico garantem presença das duas séries e ausência de valores inventados.
- CI GitHub: ESLint, TypeScript, Vitest e build. Os resultados devem ser registrados após execução.
- **Ainda não foram feitos testes E2E em Chrome/Safari, capturas próprias de mobile, inspeção manual WCAG ou deploy.**
- Próximo teste local: largura 360/390/768/1280, seleção E04/E12, troca A/B, E04/E04, os cinco indicadores, links e leitura com teclado.

## Arquivos principais

- `app/lupa-premium.css`: efeitos, superfícies, hero, botões, rail, animações reduzidas.
- `components/comparison/evidence-orbit.tsx`: visualização conceitual original.
- `components/comparison/studio-study-card.tsx`: cards científicos A/B.
- `components/comparison/compatibility-panel.tsx`: veredito e justificativas.
- `components/comparison/comparison-bar-plot.tsx`: gráfico fiel aos valores.
- `components/comparison/metric-chart.tsx`: dados, tabela, estimador e links.
- `components/comparison/study-comparator.tsx`: layout do workspace.
- `components/site-header.tsx` e `app/page.tsx`: identidade compartilhada.
- `components/evidence/evidence-explorer.tsx` e `components/evidence/evidence-card.tsx`: harmonização visual sem alterar a pesquisa científica.

**Limites de autorização preservados:** nenhum Supabase, SQL, migrações, deploy, interação com dados de pacientes ou publicação externa.

# Polimento azul e branco e leitura progressiva

Solicitação: unificar a identidade em azul/branco, reduzir densidade da apresentação, priorizar PC e manter celular/tablet; contagem progressiva e entrada/saída conforme rolagem.

Direção: azul clínico #2558c8, branco #ffffff, fundo #f7f9fd, tinta #172b4d e texto secundário #52637a. Preservar a composição e a tipografia já reconhecidas. Ajustar escala do hero, reduzir redundâncias e reservar explicações longas para detalhes. Um render das canetas e os gráficos permanecem como elementos de destaque. Navegação superior permanece.

Movimento: IntersectionObserver, sem listener contínuo de scroll. Grupos de apresentação entram/saem em 360ms, até 16px e atraso limitado a 60ms. Navegação e gráficos científicos não desaparecem. Contadores de 900ms tocam uma vez por número/valor; o valor científico final continua disponível a leitores de tela. Sem JavaScript tudo é legível. prefers-reduced-motion mantém conteúdo visível e valores finais, sem animação. Foco por teclado revela o grupo.

| Antes | Depois | Motivo |
|---|---|---|
| Verde/sálvia misturado com módulos azuis | Azul/branco com rampas compartilhadas | Identidade solicitada |
| Parágrafos repetem objetivo e títulos | Apresentação mais curta, contexto adicional recolhido | Menos carga de leitura |
| Números surgem estáticos | Contagem ao entrar no campo de visão | Destacar composição e leitura do indicador |
| Seções sempre visíveis de forma uniforme | Entrada/saída discreta dos grupos de explicação | Guiar a atenção sem esconder controles |

Verificar: valores finais preservados, contadores sem anúncio repetido, preferência de movimento reduzido, teclado, links, troca de rotas, rolagem de ida e volta, 360/390/768/1280/1440px, axe em estado estável. Dados, fontes, cálculos e limites científicos não mudam.

Implementação: contadores usam texto visual separado do valor acessível e reservam largura para reduzir deslocamento. Mudança de valor cancela o quadro anterior; observadores e eventos são limpos ao trocar de rota. A preferência de movimento é observada em tempo real. A imagem das canetas foi editada em azul/branco e otimizada para WebP (~15KB).

Auditorias axe e capturas usam explicitamente movimento reduzido para inspecionar contraste estável. Testes próprios verificam entrada/saída, ida e volta na rolagem, valores finais dos contadores e a preferência sem movimento. Isso não comprova leitor de tela ou aparelho físico.

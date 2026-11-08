# LUPA — evidência, hipótese e simulação

Aprovado pela usuária em 08/11/2026: navegação superior, identidade existente, interface limpa, detalhes progressivos, gráficos clicáveis, FAQ explicativo e canetas injetoras em 3D.

## Direção
Preservar papel #f7f8f5, tinta #213b2e, verde #24664d, sálvia e tipografia editorial Georgia + Segoe UI. Cabeçalho horizontal compacto. Espaçamento de 8px; bordas discretas, raio 12px; movimento apenas de estado e respeito a reduced motion. Uma imagem 3D concentra a expressão visual; gráficos comunicam dados reais, sem decoração estatística.

## Implementação
1. Adaptar site-header e editorial.css para barra superior responsiva; retirar margem lateral.
2. Adicionar imagem 3D otimizada na abertura e mover composição corporal para um infográfico próprio.
3. CountryOutlook: observações Brasil/EUA em painéis com denominadores distintos; gráfico de linha temporal apenas onde há observações temporais. Seleção por clique/teclado e resumo KPI com fonte, população, período e limites.
4. Cenários: usar motor de fluxos existente, mesma coorte fictícia de 1.000 pessoas para dois cenários. Premissas editáveis, curvas tracejadas 2026/2031/2036/2041; nenhuma previsão clínica ou nacional.
5. Adicionar estudo de exposição prévia a GLP-1 e mortalidade hospitalar em pacientes de UTI: 5,1 vs 4,9%, OR 1,05 [0,58–1,91], p=0,88. Pergunta causal de massa magra permanece não demonstrada.
6. FAQ com resposta curta, motivo, conclusão permitida e fonte, revelados ao abrir. Hipóteses de benefício, ausência de efeito e prejuízo em diagrama qualitativo; sem inventar efeitos.
7. Validar lint, tipos, testes, build, navegador, contraste e CI/deploy.

## Antes / depois / motivo
| Antes | Depois | Motivo |
|---|---|---|
| Barra lateral 128px | Barra superior | Pedido explícito; mais espaço para leitura |
| Muitas explicações simultâneas | Síntese e detalhes ao clicar/abrir | Menos densidade sem perder método |
| UTI apenas sem exposição medicamentosa | Estudo GLP-1 + contexto muscular separado | Responder diretamente à questão do medicamento |
| Ausência de projeção domina a abertura | Dados observados primeiro; cenários em visualização própria | Mostrar utilidade e deixar premissas compreensíveis |

## Referências
PubMed 42618598, 41165452, 42922826 (preprint), 41286572, 39996356. Números não são coeficientes de previsão. KPI Tile de 21st usado como referência de interação: implementação própria sem copiar fonte indisponível. Imagem gerada para o projeto: duas canetas genéricas, branco/sálvia, render 3D sem marcas; ilustração, sem informação clínica.

## Revisão final de acabamento
Direção: plataforma que explica pesquisas sobre canetas emagrecedoras para profissionais de saúde e público geral; caráter calmo, exato e acolhedor; universo de consultório, instrumentos e composição corporal. Momentos: canetas 3D e curva de acompanhamento. Assinatura: cada número leva à população e ao limite da leitura.

Auditoria: barra lateral removida conforme pedido; cabeçalho quieto, sem sombra; uma imagem concentra a expressão visual; legenda e painel explicam números. Sem crescimento decorativo, curvas suavizadas ou animação contínua. Tipografia pequena dos eixos substituída por legendas HTML no celular. Fontes e limitações progressivas. Crédito de acabamento: Unslop, Damir Sokolovsky, CC BY 4.0, https://github.com/heydamir/unslop.

Limitações do ambiente: prévia gerenciada retornou conexão recusada; servidor local de E2E retornou uv_interface_addresses. Usar a CI existente para navegador e axe. Playwright MCP/agent-browser não estão conectados nesta sessão; não alegar uso. A revisão de código e a suíte não substituem revisão clínica independente.

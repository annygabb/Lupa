# Princípios permanentes de UX do LUPA

Referência: dez imagens fornecidas pela usuária em 08/11/2026 (Lab Learning / Carolina Bessa). Diretriz aplicável a toda alteração, inclusive conteúdo, dados, funcionalidades, correções e infraestrutura que afete a experiência. Preservar azul/branco, prioridade PC, adaptação a outros dispositivos e exatidão científica.

São princípios de decisão e avaliação, não limites numéricos universais ou garantia automática de usabilidade. Miller não impõe sete opções por tela. Doherty orienta feedback rápido; não autoriza inventar uma espera, progresso ou alegar um tempo não medido. A relevância e a evidência científica prevalecem sobre chamar atenção.

| Princípio | Critério no LUPA | Evidência de revisão |
|---|---|---|
| Hick | Priorizar ações da tarefa; agrupar escolhas secundárias sem esconder destinos importantes. Não reduzir opções apenas por contagem. | Navegação e filtros; tarefas principais identificáveis. |
| Fitts | Alvos confortáveis (padrão do projeto: 44px), espaçamento e ação perto de seu contexto; alternativa ampla aos pontos dos gráficos. | Medidas em desktop/mobile e teclado. |
| Jakob | Padrões conhecidos de navegação, busca, filtros, acordeões, voltar e fechamento de menus. | Rota ativa, semântica nativa, Esc, foco e rótulos consistentes. |
| Miller | Agrupar informações relacionadas, formatar números em pt-BR e evitar que a pessoa memorize dados entre telas. | Grupos, unidades, período e comparação visíveis. |
| Von Restorff | Um destaque principal por contexto; seleção e importância com texto/forma, além de cor. | CTA principal, ponto selecionado e ausência de competição visual. |
| Proximidade | Manter dado, legenda, unidade, fonte e ação associados; espaço maior entre grupos. | Inspeção dos agrupamentos e leitura responsiva. |
| Tesler | Sistema cuida de cálculo, validação e formatação; usuário decide premissas compreensíveis. | Erros em linguagem humana, campos associados e cálculos reproduzíveis. |
| Zeigarnik | Quando existir tarefa com etapas, mostrar progresso real e pendência útil. Em navegação livre, registrar não aplicável. | Sem onboarding obrigatório, progresso inventado ou pressão por conclusão. |
| Doherty | Feedback imediato das ações, estado correto de carregamento/erro/vazio/sucesso quando aplicável; não atrasar interação para animação. | Filtros atualizam resultados; exportação confirma preparação; contagem não muda o dado acessível. |
| Posição serial | Colocar início e ação principal em posição previsível; fechar a leitura com próximo passo e fonte. | Ordem do menu, resumo inicial e conclusão útil. |

## Procedimento obrigatório por alteração

1. Ler esta matriz e AGENTS.md antes de decidir a implementação.
2. Rever a jornada afetada e as sete rotas principais: início, evidências, comparador, músculos/UTI, saúde mental, Brasil/EUA e metodologia. Fichas de evidência também entram na revisão do fluxo de busca → ficha → fonte.
3. Para cada princípio, registrar: atendido, problema corrigido, pendente ou não aplicável, com motivo. Não declarar conformidade integral só porque testes passaram.
4. Corrigir falhas relacionadas ao escopo; preservar valores, fontes, população, incerteza e distinção entre observação e hipótese.
5. Verificar desktop e dispositivos menores, teclado, foco, contraste, estados vazios/erro e preferência por movimento reduzido. Animação não pode esconder controles ou atrasar uma tarefa.
6. Executar verificações apropriadas e a sequência exigida por AGENTS.md. Registrar achados, correções, limitações e evidências no relatório da alteração.

## Revisão de 08/11/2026

Inspeção do código das rotas e fluxos existentes; suíte de navegador cobre todas as páginas principais, busca, ficha/fonte, comparações, cenários e metodologia. As capturas são evidência visual; os testes automatizados não substituem testes com usuários ou aparelhos físicos.

| Área | Avaliação e decisão |
|---|---|
| Início | Uma ação principal, objetivo e público explícitos; detalhes maiores progressivos; contadores com valor final acessível e movimento reduzido. Preservar. |
| Navegação global | Sete destinos úteis com rota ativa e menu mobile; não agrupar apenas por serem sete. Corrigir Esc e retorno do foco ao botão. |
| Evidências e fichas | Busca, filtros essenciais e filtros avançados recolhidos; resultados/vazio e reset claros; ficha e fonte distintas. Ampliar alvos de temas/ordenação para 44px. |
| Comparador | Dois estudos próximos, troca de lados, validação de duplicidade, unidades e bloqueio causal; manter padrões. |
| Músculos/UTI | Perguntas selecionáveis, estudo do medicamento separado do contexto muscular e fonte ao lado da conclusão; manter. |
| Saúde mental | População e escala distintas de diagnóstico e taxas nacionais; blocos associados e fonte acessível; manter. |
| Brasil/EUA | Observações e simulações separadas; seleção de ponto com resumo e alternativa em botão; premissas identificadas. Preservar. |
| Laboratório | Corrigir campos sem grupos, erro técnico e falta de feedback de exportação. Grupo/fluxos/custo em fieldsets; instrução junto ao campo e mensagem de preparação. |
| Metodologia | Etapas, critérios, fontes e limites organizados; manter disponível como destino estável e no rodapé. |
| Zeigarnik | Não há tarefa obrigatória de cadastro ou submissão. Não adicionar barra de conclusão à leitura científica. |

Limitações: revisão clínica independente, usuários reais, leitor de tela e aparelhos físicos continuam fora da comprovação automática.

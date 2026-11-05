# LUPA Saúde — Estado após Etapa 4C (05/11/2026)

| Recurso | Situação no código |
|---|---|
| Fundação Next.js/React/TypeScript/Tailwind | Implementada |
| Sistema visual compartilhado | Research Studio com hero visual, bento, rail desktop, menu ativo e homepage redesenhada |
| Explorador Científico | 50 referências, filtros preservados, cards e hero harmonizados ao visual premium |
| Comparador Científico | Seleção A/B, inversão, fichas, fontes originais |
| Bloco de compatibilidade | Veredito principal + três estados + 4 avisos resumidos e justificativas completas |
| Estado quando dois campos indicam mesma publicação | Bloqueio de lado a lado |
| Indicadores | Cinco indicadores de três publicações, sem alterações numéricas |
| Desktop | Categorias por botões e indicadores em chips |
| Mobile | Select agrupado, cards verticais e tabela com rolagem local |
| Fonte/intervalo/amostra/limitações | Preservados em gráfico e tabela |
| Revisão clínica independente | **NÃO concluída** |
| Indicadores aprovados para projeções | **0** |
| Teste em navegador real / iPhone / Android | **Pendente** |
| Banco Supabase | **NÃO configurado** |
| SQL e migrações | **NÃO executados** |
| Deploy Vercel | **NÃO realizado** |
| Motor de projeções | **NÃO implementado** |

## Evidências científicas e segurança

A Etapa 4B **não mudou** os indicadores, denominadores, valores, intervalos, estudos ou bloqueios de inferência da Etapa 4.
- DXA de massa magra não equivale a sarcopenia ou força muscular.
- Artigos sobre músculo e UTI não estabelecem efeito causal da tirzepatida na recuperação crítica.
- O módulo não agrega estimativas entre estudos independentes.
- Dados de PHQ-9 permanecem sem N individual dos braços quando não conferido.
- Todos os 50 registros gerais continuam em curadoria e nenhum está aprovado para projeções.

## Qualidade e limites de validação

Foram adicionados testes de apresentação do veredito, status, priorização de avisos, aliases, dados preservados, seleção de indicadores e renderização de gráficos.
A CI do GitHub executará ESLint, TypeScript, Vitest e build após o commit. **O resultado deve ser consultado no Actions; testes com navegador e screenshots reais não foram executados neste fluxo.**

## Entregáveis documentais

- [Etapa 4B — especificação visual, microcopy e checklist](ETAPA4B_DESIGN_SYSTEM_UX_UI.md)
- [Etapa 4 — fontes e indicadores conferidos](ETAPA4_COMPARADOR.md)
- [Etapa 3A — curadoria](ETAPA3A_CURADORIA.md)
- [Etapa 3B — interface](ETAPA3B_INTERFACE.md)

## Gate de implantação

A equipe deve conferir visualmente `/comparar` em 360, 390, 768 e 1280 px; verificar legibilidade, avisos, indicadores e links. **Supabase, SQL, migrações e deploy continuam dependentes de autorização expressa.**

## Correção da avaliação visual da Etapa 4B

A equipe apontou que a versão anterior ainda se parecia com documentação em cards, apesar de técnica e funcionalmente correta. A Etapa 4C não é somente troca de cor: redesenhou o layout, acrescentou uma visualização conceitual, aumentou o protagonismo dos resultados gráficos e revisou navegação, cards e hero. Os resultados científicos continuam em curadoria. Testes manuais de UI em browser real ainda pendentes.

Detalhes: [Etapa 4C — Dashboard premium](ETAPA4C_DASHBOARD_PREMIUM.md).

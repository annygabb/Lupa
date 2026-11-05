# Estado do LUPA Saúde — núcleo funcional do MVP (05/11/2026)

## Implementação

| Área | Status |
|---|---|
| Fundação React/Next/TypeScript/Tailwind | Implementada |
| Navegação e dashboard premium | Implementados |
| Explorador | 50 registros canônicos, 55 referências, busca, filtros e fichas |
| Comparador | Seleção A/B, alertas, cinco indicadores de fontes conferidas |
| Músculos e UTI | Investigação guiada, fontes, DXA e lacuna causal |
| Simulador | Modelo hipotético 2026–2036, presets, campos, gráfico e tabela |
| Exportação | CSV/JSON local dos cenários |
| Metodologia | Pipeline, fórmulas, evidências e contexto brasileiro |
| API /health | Estado do serviço; sem banco nem API externa |
| Testes automatizados | Novos testes adicionados; verificar execução atual da CI |
| Smoke HTTP | Acrescentado ao pipeline da CI; verificar execução |
| Revisão clínica independente | PENDENTE |
| Projeções clínicas aptas/validadas | NENHUMA |
| Testes E2E reais em Chrome/Safari e WCAG | PENDENTES |
| Supabase, SQL e migrações | NÃO UTILIZADOS |
| Deploy do commit atual | Depende da sincronização Git/Vercel; confirmar READY |

## Cautelas que não podem ser removidas

- 50 registros são candidatos; cinco medidas de artigos originais foram conferidas, mas não passaram por revisão clínica independente.
- O cenário de fluxo populacional não prediz prevalência, incidência, mortalidade, internação em UTI ou acesso pelo SUS.
- Presets do simulador são fictícios; grupo inicial de 1.000.000 não representa elegibilidade nacional.
- OR de metanálise UTI não vira probabilidade absoluta; massa magra DXA não é força muscular.
- Decisão de não incorporação de 2025 e pedido de análise de 2026 à Conitec são fatos regulatórios distintos.

## Próximas ações de qualidade antes de polimento visual

1. Verificar CI e build do novo commit.
2. Verificar deploy Git/Vercel e páginas públicas, sem presumir atualização apenas pelo push.
3. Validar 360/390/768/1280px, seleção de perguntas, simulações, exports, links, navegação por teclado.
4. Revisar indicadores e fontes por humano qualificado para qualquer aplicação populacional clínica.
5. Versionar lockfile e auditar dependências/segurança, executar browser E2E e acessibilidade.
6. Gravar demo, roteiro de até três minutos e preparar submissão.

[Etapas 5–7: documentação](ETAPA5_6_7_MVP_FUNCIONAL.md) | [Etapa 4C: design](ETAPA4C_DASHBOARD_PREMIUM.md)

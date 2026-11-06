# Estado do LUPA Saúde — núcleo funcional e QA automatizado (06/11/2026)

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
| Testes unitários | **93 aprovados** no commit `11c7ca8` |
| Smoke HTTP | **8 rotas verificadas** no build de produção |
| Revisão clínica independente | PENDENTE |
| Projeções clínicas aptas/validadas | NENHUMA |
| Testes Playwright Chromium | **100 aprovados** em 360, 390, 768 e 1280 px |
| Acessibilidade automatizada | **Sem violações detectadas** pelas regras axe WCAG 2 A/AA e WCAG 2.1 A/AA testadas nos seis caminhos principais, em quatro larguras |
| Safari/iOS/Android físico e leitores de tela | PENDENTES |
| Supabase, SQL e migrações | NÃO UTILIZADOS |
| Deploy do MVP | Commit **`11c7ca8` READY** no projeto **`lupaa`**, domínio **https://lupaa.vercel.app** |

## Cautelas que não podem ser removidas

- 50 registros são candidatos; cinco medidas de artigos originais foram conferidas, mas não passaram por revisão clínica independente.
- O cenário de fluxo populacional não prediz prevalência, incidência, mortalidade, internação em UTI ou acesso pelo SUS.
- Presets do simulador são fictícios; grupo inicial de 1.000.000 não representa elegibilidade nacional.
- OR de metanálise UTI não vira probabilidade absoluta; massa magra DXA não é força muscular.
- Decisão de não incorporação de 2025 e pedido de análise de 2026 à Conitec são fatos regulatórios distintos.

## Próximas ações antes do polimento visual e da submissão

1. **Revisão científica independente** das fontes que alimentam indicadores, comparações e afirmações sobre UTI, com checklist e registro de responsável: [Plano de curadoria](PLANO_REVISAO_CLINICA_PRIORITARIA.md).
2. Testar em dispositivos físicos (Safari no iPhone, Chrome no Android), teclado, VoiceOver/TalkBack, zoom e interação em rede móvel.
3. Auditoria de performance Lighthouse / Web Vitals em mobile real e redução de bundles se necessário.
4. **Versionar `pnpm-lock.yaml`** com pnpm 10.18.0 e mudar CI/Vercel para instalação reproduzível; pendente por falta do lockfile atual (não inventar versões resolvidas).
5. Revisar links externos, fontes oficiais e datas regulatórias; não presumir incorporação SUS.
6. Preparar demo e vídeo de até três minutos, apresentação, critérios de submissão e plano de contingência.

**Não é necessário Supabase para a funcionalidade pública atual.** Sem SQL, migrações ou dados pessoais.

[Etapas 5–7: documentação](ETAPA5_6_7_MVP_FUNCIONAL.md) | [Etapa 4C: design](ETAPA4C_DASHBOARD_PREMIUM.md)

## QA automatizado de 06/11/2026

[Relatório técnico, comandos PowerShell e limites](QA_TESTES_BROWSER_ACESSIBILIDADE.md). GitHub Actions da rodada aprovada: https://github.com/annygabb/Lupa/actions/runs/42212759698.

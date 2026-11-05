# LUPA Saúde — MVP científico Hack Brasil 2026

Plataforma de pesquisa sobre medicamentos para emagrecimento, composição corporal, saúde mental, sarcopenia e cuidados críticos. O sistema separa **dado observado, associação e cenário hipotético**, preservando as fontes e os limites científicos.

> **Estado em 05/11/2026:** os cinco módulos principais estão implementados em código e aguardam os testes finais/validação no navegador. O simulador é matemático e hipotético; não prevê efeitos clínicos. Revisão clínica independente do catálogo **ainda está pendente**.

## Onde acessar

O projeto está hospedado na Vercel pela equipe em **https://lupaa.vercel.app**. O endereço foi fornecido pelo usuário. A atualização da implantação para cada novo commit depende da integração Git/Vercel e deve ser verificada pelo status do deploy. A aplicação também pode rodar localmente.

## Funcionalidades

| Rota | O que faz |
|---|---|
| `/` | Apresenta os módulos com navegação direta |
| `/evidencias` | Pesquisa, filtros, 50 registros científicos canônicos e 55 referências de origem |
| `/evidencias/[id]` | Fichas científicas, limitações, aliases e links originais |
| `/comparar` | Duas publicações em paralelo, avisos de incompatibilidade, cinco indicadores comparados dentro de cada estudo |
| `/musculos-uti` | Quatro perguntas interativas, medidas musculares, estudos de UTI e lacuna causal |
| `/projecoes` | Simulação hipotética 2026–2036, 2031/2036, presets, taxas editáveis, gráficos, tabela, CSV e JSON |
| `/metodologia` | Curadoria, conceitos, fórmulas, contexto SUS, fontes oficiais e glossário |
| `/api/health` | Estado público do serviço sem segredos |

## Executar localmente

Pré-requisitos: Node.js 22 e pnpm 10.

```powershell
git clone https://github.com/annygabb/Lupa.git
cd Lupa
pnpm install
pnpm dev
```

Abrir `http://localhost:3000`. Para verificar a qualidade:

```powershell
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
```

A CI executa essas quatro verificações e um **smoke HTTP** das rotas compiladas.

## Arquitetura

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Zod, Vitest, Lucide.
- Catálogo e algoritmos versionados localmente; nenhuma API paga é necessária ao MVP.
- `features/evidence`: fontes, deduplicação, busca e regras de curadoria.
- `features/comparison`: compatibilidade metodológica, indicadores conferidos e bloqueios.
- `features/muscle`: afirmações científicas e classificação não causal.
- `features/scenarios`: motor matemático determinístico e exportação tabular.
- `components`: páginas interativas com identidade visual da equipe.
- `docs`: protocolo e rastreabilidade por etapa.

## Limites científicos indispensáveis

- **50 referências não significam 50 revisões clínicas aprovadas.** Todos os registros ainda são `candidate`.
- Os cinco indicadores do Comparador foram confrontados com as fontes originais, mas não tiveram revisão clínica independente. Nenhum está aprovado para projeção populacional.
- **Massa magra por DXA não é sinônimo de força ou diagnóstico de sarcopenia.** Artigos de composição corporal e UTI não demonstram efeito causal do medicamento sobre UTI.
- Os resultados da rota `/projecoes` são **cenários editáveis de fluxo**, não projeções epidemiológicas brasileiras, eficácia terapêutica, estimativas de mortalidade ou cobertura oficial do SUS.
- A avaliação de possível incorporação de medicamentos pela Conitec não significa liberação automática para toda a população.
- Nenhum paciente real, prontuário, autenticação de usuário, banco, SQL ou migração está implementado. O MVP público de pesquisa funciona sem Supabase.

## Documentação

- [Etapas 5–7: núcleo funcional, fórmulas, fontes e validação](docs/ETAPA5_6_7_MVP_FUNCIONAL.md)
- [Estado real e pendências](docs/STATUS.md)
- [Metodologia científica](docs/METHODOLOGY.md)
- [Etapa 4: dados para comparação](docs/ETAPA4_COMPARADOR.md)
- [Etapa 4C: dashboard premium](docs/ETAPA4C_DASHBOARD_PREMIUM.md)
- [Etapa 3A: curadoria](docs/ETAPA3A_CURADORIA.md)
- [Etapa 2: contratos científicos](docs/ETAPA2_CONTRATOS.md)

## Antes da entrega do hackathon

Verificar GitHub Actions e deploy do commit atual, executar testes no navegador e mobile, auditar acessibilidade/performance, conferir links científicos, fechar pendências de curadoria e gravar vídeo/pitch. A versão funcional do MVP **não deve ser confundida com validação científica total nem com aprovação clínica**.

# LUPA Saúde — MVP científico Hack Brasil 2026

Plataforma de pesquisa sobre medicamentos para emagrecimento, composição corporal, saúde mental, sarcopenia e cuidados críticos. O sistema separa **dado observado, associação e cenário hipotético**, preservando as fontes e os limites científicos.

> **Estado em 08/11/2026 (branch `redesign/site-novo`):** Evidence Lens, Evidence Engine (`POST /api/interpretar`), Passaporte da Evidência, comparador explicável, análise de sensibilidade e pipeline PubMed em dry-run. **186 testes Vitest + 260 execuções Playwright** aprovados localmente no build de produção. Revisão clínica independente **pendente**; teste com usuários **não executado**. Detalhes em [docs/STATUS.md](docs/STATUS.md).

## Onde acessar

O projeto está hospedado na Vercel pela equipe em **https://lupaa.vercel.app**. O endereço foi fornecido pelo usuário. A atualização da implantação para cada novo commit depende da integração Git/Vercel e deve ser verificada pelo status do deploy. A aplicação também pode rodar localmente.

## Funcionalidades

| Rota | O que faz |
|---|---|
| `/` | Hero e **Evidence Lens**: afirmações curadas interpretadas com fonte, limites e bloqueios (`?afirmacao=<id>`) |
| `/evidencias` | Herbário de evidências: busca, filtros, grade/lista, 50 registros canônicos e 55 IDs de origem |
| `/evidencias/[id]` | **Passaporte da Evidência**: status de revisão, limites, aliases e exportação JSON/Markdown |
| `/comparar` | Comparador explicável (`?a=&b=`), avisos de incompatibilidade e indicadores M01–M05 |
| `/musculos-uti` | Investigação guiada sobre composição corporal, força e UTI, com a lacuna causal explícita |
| `/saude-mental` | PHQ-9, exclusões e limites de interpretação |
| `/projecoes` | Brasil × EUA (lacunas explícitas) e laboratório `lupa-flow-v2` com sensibilidade e exportação |
| `/metodologia` | Protocolo, níveis de evidência, 17 bloqueios de projeção explicados, glossário e fontes |
| `GET/POST /api/interpretar` | Lista e interpreta afirmações (determinístico, sem IA) |
| `/api/health` | Estado público do serviço sem segredos |

## Executar localmente

Pré-requisitos: Node.js 22 (`.nvmrc`) e pnpm 10.18 (`packageManager`). A instalação é reproduzível com `pnpm install --frozen-lockfile`.

```powershell
git clone https://github.com/annygabb/Lupa.git
cd Lupa
pnpm install --frozen-lockfile
pnpm dev
```

Abrir `http://localhost:3000`. Para verificar a qualidade:

```powershell
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
```

A CI executa essas quatro verificações, **smoke HTTP das oito rotas**, auditoria de dependências e **Playwright E2E com axe-core**, em 360/390/768/1280 px. Relatórios, screenshots e traces são anexados ao workflow. Para executar localmente: `pnpm exec playwright install chromium` e `pnpm run test:e2e` **após** `pnpm run build`.

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

- [Estado real e pendências](docs/STATUS.md) · [Arquitetura](docs/ARCHITECTURE.md) · [Changelog](docs/release/CHANGELOG.md)
- ADRs: [0001 monólito modular](docs/adr/0001-monolito-modular.md) · [0002 interpretação determinística](docs/adr/0002-interpretacao-deterministica.md)
- [Pipeline PubMed em dry-run](docs/ingestion/PUBMED_DRY_RUN.md) · [Revisão científica independente](docs/evidence-review/README.md)
- [Protocolo do teste de compreensão](docs/validation/protocolo-teste-compreensao.md) (não executado)
- [Roteiro de pitch](docs/pitch/ROTEIRO_3_MIN.md) · [Perguntas difíceis](docs/pitch/PERGUNTAS_DIFICEIS.md)
- [Sistema de design do atlas](components/atlas/README.md) · [Metodologia científica](docs/METHODOLOGY.md)
- Histórico: etapas 2–7, QA de navegador, curadoria e plano de revisão clínica em `docs/`.

## Antes da entrega do hackathon

CI, Chromium E2E e deploy `lupaa` foram conferidos em 06/11/2026. Restam testes em aparelhos reais (iOS/Android), auditoria de performance Lighthouse, lockfile de dependências, curadoria clínica independente, conferência dos links científicos e vídeo/pitch. A versão funcional do MVP **não deve ser confundida com validação científica total nem com aprovação clínica**.

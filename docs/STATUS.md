# Estado do LUPA Saúde — Etapa 2 (05/11/2026)

| Entrega | Estado verificado |
|---|---|
| Repositório público criado durante o período elegível | Confirmado |
| Next.js + TypeScript + Tailwind | Fundação implementada |
| Páginas e navegação responsiva | Páginas-base; sem gráficos de pesquisa implementados |
| GET /api/health | API de fundação implementada |
| 20 contratos de entidades (181 campos) | Implementados em Zod/TypeScript; não representam tabelas criadas |
| Catálogo inicial de 14 referências | Seed local validado; todas candidatas a revisão |
| Busca no catálogo e sobreposição por famílias | Funções locais testadas; ainda sem UI pública |
| Evidence Guard | Regras de bloqueio implementadas, testadas com dados sintéticos |
| Lint / TypeScript / Vitest / Build | GitHub Actions aprovado |
| Configuração Supabase | **Não realizada** |
| Migrações ou SQL | **Não executados** |
| Deploy Vercel | **Não realizado** |
| Projeções epidemiológicas | **Não implementadas** |
| Revisão clínica para projeção | **Pendente** |

CI confirmada: https://github.com/annygabb/Lupa/actions/runs/42062501251

## Limites científicos
- Os resumos do CSV de 14 registros foram preservados; os registros continuam `candidate` e `projectionApproved=false`.
- Mesmo a indicação "artigo/resumo original conferido" **não comprova** revisão detalhada de todos os números ou aptidão para projetar.
- E01 e E04 pertencem à família SURMOUNT-1; não contabilizar amostras como independentes.
- FAERS e documentos regulatórios não permitem inferir incidência.
- A relação entre tirzepatida e desfechos futuros em UTI segue como hipótese não validada.
- Os testes do Evidence Guard foram feitos com valores sintéticos; não validam estatisticamente projeções de saúde.

## Qualidade e segurança
- CI aprovou instalação, lint, tipagem, testes e build após o commit de implementação.
- O projeto ainda não possui lockfile versionado. A CI usa instalação `pnpm install --no-frozen-lockfile`; pendência de reprodutibilidade a corrigir antes da submissão.
- Não houve teste E2E ou teste de interface publicada; não existe URL de deploy.
- Nenhum dado de paciente, credencial de Supabase, secret ou chave privada foi incluído.

## Próximo gate de aprovação
Revisar e autorizar separadamente qualquer integração do catálogo às telas públicas, criação de observações clínicas estruturadas, banco de dados, migrações ou deploy. Nenhuma dessas ações está incluída nesta etapa.

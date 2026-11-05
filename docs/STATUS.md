# Estado do LUPA Saúde — Etapa 1 (05/11/2026)

| Entrega | Estado verificado |
|---|---|
| Repositório público elegível pela data de criação | Confirmado |
| Next.js, TypeScript e Tailwind v4 | Arquivos implementados; build no CI aprovado |
| Componentes de base shadcn/ui | Código implementado; CLI oficial não executada |
| Navegação responsiva e rotas de apresentação | Criadas; ainda sem dados científicos |
| GET /api/health | Rota implementada, contrato unitário aprovado |
| ESLint | GitHub Actions aprovado |
| TypeScript | GitHub Actions aprovado |
| Testes Vitest | GitHub Actions aprovado |
| Build Next.js | GitHub Actions aprovado |
| Supabase / banco de dados | **Não configurado** |
| Vercel / deploy | **Não configurado** |
| Evidências e projeções científicas | **Não implementadas** |

Execução confirmada: https://github.com/annygabb/Lupa/actions/runs/42055453543

## Observações
O npm local não conseguiu acessar o registry. Uma primeira execução remota falhou no npm durante a instalação; a CI foi corrigida para usar pnpm e então **lint, tipagem, testes e build passaram**. Não houve execução E2E, nem teste de site publicado.

O repositório ainda não possui lockfile de dependências. O pipeline usa `pnpm install --no-frozen-lockfile` na fundação; a próxima iteração técnica deverá versionar `pnpm-lock.yaml` e usar instalação imutável.

## Próximo gate de aprovação
Revisar schema de artigos e versão de referências para o explorador, sem migrar banco nem fazer deploy antes da autorização específica.

# Estado da implementação — Etapa 1

| Entrega | Status |
|---|---|
| Next.js / TypeScript | Código inicial |
| Tailwind / identidade visual | Tokens e estilos preparados |
| Componentes shadcn/ui | Componentes de base e components.json |
| Navegação e rotas | Páginas de escopo, sem lógica científica |
| GET /api/health | Endpoint público preparado |
| Vitest + CI | Testes escritos; verificar resultado do GitHub Actions |
| Supabase | Não configurado |
| Vercel | Não configurado |
| Dados e projeções clínicas | Não implementados |

## Qualidade
O ambiente de autoria não acessou registry.npmjs.org. Dependências e build não foram validados localmente; a CI do GitHub deve executar npm install, lint, typecheck, testes e build antes de declarar aprovação técnica. O lockfile será gerado numa etapa de ambiente com rede disponível.

**Próximo ponto de aprovação:** modelos de dados e estudos iniciais antes de integrar banco.

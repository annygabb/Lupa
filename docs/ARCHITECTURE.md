# Arquitetura — Etapa 1

## Objetivo
Inicializar um monólito modular **Next.js App Router** com UI mobile-first, componentes reutilizáveis, testes e uma API pública simples. Não configurar banco, autenticação, rotas clínicas nem deploy.

## Fronteiras
- app/: páginas e Route Handler.
- components/ui/: UI no padrão shadcn/ui.
- lib/health.ts: payload puro, independente para testes.
- tests/unit/: validação de contrato sem conectar a banco.

## Futuro (não implementado)
- features/evidence/: estudos revisados e proveniência.
- features/projections/: motor determinístico e Evidence Guard.
- features/muscle-icu/: estudos de músculo e UTI.
- lib/db/: PostgreSQL/Supabase apenas após aprovação.

Nada neste estágio importa código privado anterior ao hackathon, gera percentuais por IA ou publica dados pessoais de saúde.

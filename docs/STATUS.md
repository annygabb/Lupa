# Estado do LUPA Saúde — Etapa 3A (05/11/2026)

| Entrega | Estado verificado |
|---|---|
| Fundação Next.js, TypeScript e Tailwind | Implementada |
| 20 contratos Zod, 181 campos da Etapa 2 | Preservados, sem tabelas físicas |
| Fontes locais E / P / R | 14 + 30 + 11 = 55 referências |
| Consolidação de registros | 50 canônicos, cinco aliases exatos |
| Famílias de estudos compartilhados | Mapeadas, sem agregação indevida de participantes |
| Catálogo de referências para curadoria | 50 candidatas, nenhuma aprovada para projeção |
| Seleção editorial | 15 fichas prioritárias aguardando revisão detalhada |
| Busca e filtros locais | Implementados e testados, sem interface visual |
| Evidence Guard | Preservado; não gera projeções |
| ESLint / TypeScript / Vitest / build | Aprovados na CI da Etapa 3A |
| Página /evidencias com cards e filtros | NÃO iniciada nesta etapa |
| Supabase | NÃO configurado |
| SQL ou migrações | NÃO executados |
| Vercel | NENHUM deploy |
| Dados de pacientes | Não utilizados |
| Modelos clínicos e projeções | Não implementados |

CI de implementação: https://github.com/annygabb/Lupa/actions/runs/42071805210

## Fontes e auditoria
- A ampliação veio do DOCX da equipe e do CSV de planejamento aprovado.
- P01 (PMID 40366681), P03 (PMID 41537305) e P24 (PMID 41796096) tiveram indexação e resumos confrontados com PubMed nesta etapa.
- Não houve revisão integral dos 41 documentos adicionais; os demais e detalhes quantitativos ainda exigem conferência.
- O seed mantém o texto do material enviado, status candidate e projectionApproved=false.
- A relação GLP-1 → massa magra → recuperação em UTI não foi estabelecida como causal.
- Documentos regulatórios não são ensaios; notificações espontâneas não fornecem incidência.

Veja: [relatório de curadoria](ETAPA3A_CURADORIA.md) e [contratos anteriores](ETAPA2_CONTRATOS.md).

## Pendências técnicas
- Gerar lockfile imutável de dependências para CI reprodutível antes da submissão.
- Validar números por publicação/desfecho, incluindo denominadores, braços, IC e período.
- Executar revisão visual e funcional somente após aprovação de interface (próxima etapa).
- Não houve testes E2E de UI e não há URL pública de demonstração.

## Gate de aprovação
Nenhuma interface /evidencias, API nova, integração Supabase, SQL, migração ou deploy está autorizada por esta Etapa 3A. Apresentar resultados e solicitar a decisão do usuário antes de iniciar a próxima fase.

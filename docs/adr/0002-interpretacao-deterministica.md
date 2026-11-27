# ADR 0002 — Evidence Engine determinístico antes de qualquer IA

- **Status:** aceita
- **Data:** 08/11/2026

## Contexto

O diferencial do LUPA é mostrar **o que os dados não permitem concluir**. Uma camada de IA generativa poderia produzir textos fluentes, mas também inventar números, citações ou ligações causais — exatamente o que o produto existe para impedir.

## Decisão

1. As afirmações do **Evidence Lens** são curadas editorialmente (`features/interpretation/claims.ts`) com contrato Zod: pergunta, resposta curta, explicação, conclusão permitida, extrapolações proibidas, IDs de evidência, status de revisão.
2. O motor `interpretClaim()` (`features/interpretation/interpret-claim.ts`):
   - resolve aliases para o registro canônico (sem contar duas vezes);
   - reutiliza `assessStudyComparison()` e `assessProjectionEligibility()` — nenhuma regra nova paralela;
   - devolve a classificação **mais rigorosa** entre a curadoria e as regras (`supported_in_context` < `partially_supported` < `insufficient_evidence` < `not_comparable`);
   - abstém-se (`insufficient_evidence`) quando uma fonte citada não existe no catálogo.
3. O status `independently_reviewed` só é aceito pelo esquema com `reviewRecord` documentado (revisor, data, escopo). Hoje nenhum existe.
4. `POST /api/interpretar` expõe o mesmo motor com allowlist de IDs, limite de 1 KB, validação Zod e erros sem detalhes internos.
5. IA generativa fica condicionada a: motor determinístico concluído, autorização de provedor/custo, citações validadas contra o catálogo, abstenção e fallback sem LLM (ver prompt mestre §7.4).

## Consequências

- Respostas estáveis e testáveis (`tests/unit/interpretation.test.ts`, `tests/integration/interpretar-api.test.ts`).
- Classificações descrevem o suporte **de uma afirmação no contexto dos estudos**, não eficácia ou segurança clínica.
- Ampliar o Lens exige curadoria humana de novas afirmações — custo deliberado em troca de confiabilidade.

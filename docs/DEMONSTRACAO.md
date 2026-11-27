# Roteiro de demonstração (fluxos verificados)

> Atualizado em 26/11/2026. Cada passo indica **onde** foi verificado. "Publicado" = `https://lupaa.vercel.app`;
> "local corrigido" = esta versão do código. **A versão corrigida ainda não foi publicada**: até o deploy, o site
> publicado continua com a versão anterior (incluindo o telão que exibe "Votação Aberta" sem banco).

## Antes da banca (checklist)

1. Publicar esta versão e conferir: `node scripts/smoke.mjs https://lupaa.vercel.app` → todas as linhas `PASS`.
   A linha `AVISO LUPA Live NÃO está pronto` é esperada enquanto não houver Supabase.
2. Abrir as URLs do roteiro em abas, com zoom em 100% e notificações desligadas.
3. Ter o vídeo de contingência (ainda não gravado) e capturas das telas.

## Parte 1 — Atlas (funciona sem banco)

| Passo | URL | O que mostrar | Verificado |
|---|---|---|---|
| 1 | `/` | Seção "Passe a lupa na manchete", frase 01 | Publicado (auditoria) e local corrigido (E2E) |
| 2 | `/?afirmacao=massa-magra-nao-equivale-a-musculos#lupa` | Rolar até "O que dá para concluir"; abrir Passaporte E04 | Publicado e local |
| 3 | `/evidencias/E04` | Status "Em curadoria", limites, exportar JSON | Local (E2E `passport.spec`) |
| 4 | `/comparar?a=E04&b=E12` | "Cálculo combinado" bloqueado e "Ligação causal não demonstrada" | Publicado e local |
| 5 | `/projecoes` | Mover um controle, abrir sensibilidade, exportar CSV | Local (E2E `sensitivity.spec`, `mvp.spec`) |
| 6 | `/metodologia` | Seção de bloqueios com o exemplo E12 | Local (E2E) |

## Parte 2 — LUPA Live

### Opção A (sempre disponível): simulação `/live/demo`
Dizer: "Esta é uma simulação no navegador com **votos fictícios**." Votar no celular simulado, avançar as fases e
mostrar o telão. A comparação final é rotulada como **ilustrativa**, não é resultado de aprendizagem.

### Opção B (somente com Supabase provisionado e verificado na véspera)
Seguir `docs/IMPLANTACAO_LIVE.md`, seção 3. Sem `/api/live/health = ready`, **não** demonstrar o Live real.

### Opção C (para banca técnica): evidência de teste
Mostrar a execução de `node scripts/test-live-stack.mjs` (4 testes: health, senha errada, fluxo completo, isolamento) e
explicar que usa Postgres real com as migrações e um **simulador** do Supabase.

## Limitações a declarar

- Revisão clínica independente: não realizada.
- Teste com usuários: não realizado (ou informar o n real, se o piloto acontecer).
- LUPA Live: não implantado em produção.
- Sem testes em iPhone/Android físicos, leitores de tela reais ou Lighthouse.

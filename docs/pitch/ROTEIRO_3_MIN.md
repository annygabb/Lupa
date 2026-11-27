# Roteiro de pitch — 3 minutos

> Atualizado em 26/11/2026 após a auditoria. Use só telas reais. **Antes do dia:** publicar a versão corrigida,
> cronometrar dois ensaios e gravar o vídeo de contingência (ainda **não gravado**). Ver `docs/DEMONSTRACAO.md`.

**Frase central:** "O LUPA não apenas mostra o que os estudos dizem. Ele mostra o que os dados **não** permitem concluir."

| Tempo | Tela | Ação | Mensagem |
|---|---|---|---|
| 00:00–00:20 | Home, seção "Passe a lupa na manchete" | Ler em voz alta a frase 01: "Se 25% do peso perdido era massa magra, a pessoa perdeu 25% dos músculos?" | Frases assim circulam sem o contexto do estudo. Para quem estuda saúde, o erro de leitura vira erro de orientação. |
| 00:20–01:00 | `/?afirmacao=massa-magra-nao-equivale-a-musculos#lupa` (**rolar até a resposta**, que fica abaixo da dobra em 1280×800) | Mostrar "Parcialmente sustentada" e "o que dá para concluir"; abrir o Passaporte E04 | No SURMOUNT-1 (DXA, 160 avaliados), ~25% do peso **perdido** foi massa magra — não 25% dos músculos. Massa magra inclui água e órgãos. |
| 01:00–01:40 | `/comparar?a=E04&b=E12` | Mostrar "Leitura lado a lado disponível, cálculo combinado bloqueado" e "Ligação causal não demonstrada" | O motor recusa somar estudos com populações e desfechos diferentes. Nenhum estudo do acervo liga o remédio à UTI. |
| 01:40–02:10 | `/projecoes`, laboratório | Mover a continuidade anual e mostrar a sensibilidade | Tudo é **hipótese** num grupo fictício. O LUPA se recusa a prever o SUS. |
| 02:10–02:40 | `/metodologia`, seção de bloqueios (ou `/live/demo`, se houver tempo) | Mostrar 2 dos 17 bloqueios (ex.: OR sem risco basal; Conitec ≠ SUS) | A inteligência são regras explícitas e testadas, não IA inventando. Se mostrar o `/live/demo`: "votos **fictícios**; o Live real está pronto em teste e aguarda o banco". |
| 02:40–03:00 | Slide "Limites e próximos passos" | Ler os 3 itens | 1) Revisão clínica independente: pendente. 2) Teste com usuários: [resultado real com n] **ou** "data marcada: __/__". 3) LUPA Live: validado em ambiente de teste, implantação depende do Supabase. |

## Slide "Limites e próximos passos" (texto sugerido)

- 50 referências **em curadoria** — nenhuma revisada por especialista independente ainda.
- Compreensão do público: protocolo pronto; [n participantes, resultado] **ou** "piloto agendado".
- LUPA Live: fluxo completo testado com banco de teste; produção aguarda provisionamento.

## Não dizer no palco

"Prevemos mortalidade", "o remédio causa problemas de UTI", "o SUS já distribui", "50 estudos aprovados",
"melhora de X% no aprendizado" (a demonstração usa votos fictícios), "economizamos X%" sem medida, "IA clínica validada",
"o sistema é 100% seguro".

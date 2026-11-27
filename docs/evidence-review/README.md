# Revisão científica independente

> **Situação em 08/11/2026:** nenhuma revisão clínica independente foi realizada. Todos os 50 registros canônicos estão em curadoria (`candidate`); M01–M05 foram **conferidos documentalmente** no artigo original, o que **não** equivale a revisão clínica.

Revisão clínica/metodológica independente **não** pode ser feita por desenvolvedor, CI, algoritmo ou IA. Exige profissional qualificado, registro nominal e escopo.

## Prioridade

| Pri. | Registros | Foco |
|---|---|---|
| P0 | E04, M01–M03 | DXA: peso, massa gorda e magra; amostra (124/36), unidade, limite da interpretação |
| P0 | E10 | Critérios de sarcopenia (força/função) |
| P0 | E12 | Massa muscular e prognóstico de UTI; medidas associativas (OR) |
| P0 | E16, M04 | SURMOUNT-4: continuidade/retirada e desenho |
| P0 | E21, M05 | PHQ-9 pós-hoc; exclusões e N por braço ausente |
| P1 | Saúde mental adicional | Heterogeneidade, exclusões |
| P1 | Eventos adversos (biliar, pâncreas, renal, fígado) | Definições e desenhos distintos |
| P1 | Fontes brasileiras e atos regulatórios | Denominadores; Conitec/SUS com data |
| P2 | Restante do catálogo | Revisão progressiva |

## Modelo de ficha (`docs/evidence-review/<ID>.md`)

```markdown
# Revisão — <ID LUPA>
- Fonte original (PMID/DOI/URL):
- Coorte / família e possível sobreposição:
- População e critérios:
- N total e por braço (como publicado):
- Desfecho, instrumento, unidade, estimador e IC (como publicado):
- Localizador (tabela/figura/trecho):
- Limitações principais:
- Interpretação permitida:
- Extrapolações proibidas:
- Revisor (nome, qualificação):
- Data da revisão:
- Decisão e escopo do uso aprovado (exibição ≠ projeção):
```

Só depois de uma ficha assinada um registro pode mudar de status — e a aprovação para **exibir** nunca implica aprovação para **projetar** (o `projection-guard.ts` continua bloqueando).

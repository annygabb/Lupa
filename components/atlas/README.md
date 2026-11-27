# Atlas LUPA — sistema de design

Direção: **atlas de evidências em cianotipia**. Azul-da-prússia sobre papel, títulos pesados
(Bricolage Grotesque via `var(--font-display)`), corpo Inter (`var(--font-body)`), metadados em
JetBrains Mono (`var(--font-mono)`, classe `.at-mono`). Nada de Georgia/serifa fina.
Cada rota é uma **prancha** numerada (ver `plates.ts`).

## Tokens (app/atlas.css)
`--at-prussia-950 #071a33` · `900 #0e2a4a` · `800 #153a63` · `700 #1e5486` · `500 #3d78b0` · `300 #9dbedc` ·
`150 #d5e4f1` · `50 #eef4fa` · `--at-paper #f6f8fa` · `--at-paper-warm` · `--at-ink #0b1f3a` ·
`--at-line` / `--at-line-strong` · `--at-amber #8a5a15` (só para limites/avisos) · `--at-pad` · `--at-max 1440px` · `--at-ease`.
Contraste AA obrigatório: texto pequeno sobre azul escuro use `--at-prussia-150/300` ou branco; nunca `--at-prussia-500/700` em texto pequeno sobre `#071a33`.

## Primitivas (importar de `@/components/atlas/ui` e `@/components/atlas/motion`)
- `ChapterHero` — capa da rota com **o único h1** (prop `title` = array de linhas; última linha fica azul), `kicker`, `lead`, `image`, `alt`, `children` (ações), `cutouts`.
- `Section` — bloco com `kicker`, `title` (linhas → h2 com revelação), `intro`, `tone="paper"|"white"|"ink"`, `chapter`.
- `Specimen` — etiqueta de herbário para um dado com origem (`id`, `label`, `value`, `note`, `href`).
- `LimitNote` — "Onde a conclusão para": o limite de interpretação. Use em todo resultado.
- `Figure`, `StatRow` (números com contagem acessível), `Reveal` (entrada em lote), `SplitTitle`, `Parallax`, `Cutout` (recortes botânicos), `Magnetic`, `DrawPath`, `CountUp`.
- Classes: `.at-btn .at-btn--solid|--line|--light|--ghost`, `.at-chip` (use `aria-pressed`), `.at-tabs`, `.at-field`, `.at-input`, `.at-select`, `.at-card`, `.at-table`, `.at-grid-2`, `.at-grid-3`, `.at-prose`, `.at-kicker`, `.at-link`.

## Ilustrações
- Pranchas: `/assets/images/cianotipia/*.webp` (lupa-caneta-2, corpo-composicao, musculo, coracao, cerebro, uti, balanca-1, estudos-1, orgaos-1, globo, laboratorio-2, comparar, canetas-1, sementes).
- Recortes transparentes para camadas: `/assets/images/recortes/<nome>.webp` (azul) e `<nome>-branco.webp` (para fundo escuro):
  samambaia-alta, samambaia-curta, ginkgo, eucalipto, folhas-soltas, comprimidos, caneta, lupa, dente-de-leao, semente-alada.

## Regras de movimento
Toda animação passa por `motionAllowed()` (prefers-reduced-motion e `html[data-motion=off]`). Sem JS, tudo visível.
GSAP + ScrollTrigger já registrados; **um único Lenis** global (`window.__lupaLenis`) — não crie outro.
Movimento serve à leitura: revelar, comparar, alternar. Nada de loop decorativo infinito.

## Regras científicas (não negociáveis)
Não inventar números, N, IC ou estudos. Não sugerir causalidade (medicamento → UTI/mortalidade). DXA ≠ força/sarcopenia.
OR ≠ risco absoluto. Pedido à Conitec ≠ incorporação no SUS. Cenários 2031/2036/2041 são hipotéticos. Todos os 50 registros estão em curadoria, sem revisão clínica independente.

## Armadilhas conhecidas
- `Reveal` desliga a `transition` CSS dos filhos durante a entrada e limpa `transform/translate/rotate/scale` no fim; ainda assim, prefira não animar com GSAP elementos cujo `rotate` venha do CSS (use uma variável CSS para a inclinação).
- O header tem altura fixa: não mude a altura de elementos sticky ao rolar (desloca o conteúdo e engole cliques).
- A figura do `ChapterHero` é WebGL (`CyanotypePlate`): começa como papel sensibilizado e revela a imagem; sem WebGL, com movimento reduzido ou em aba oculta, fica a imagem estática.

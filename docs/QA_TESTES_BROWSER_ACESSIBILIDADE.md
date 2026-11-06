# LUPA Saúde — garantia de qualidade e acessibilidade do MVP
**Referência:** 06/11/2026 · **Escopo:** frontend e catálogo local. Sem Supabase, migrações, SQL ou dados pessoais.

## 1. O que já foi verificado de forma executável

- ESLint e TypeScript \`--noEmit\` em GitHub Actions.
- 93 testes unitários, incluindo integridade do catálogo, compatibilidade, limitações de inferência e cálculo determinístico 2026–2036.
- Build de produção Next.js, com páginas geradas estaticamente.
- Smoke HTTP da aplicação compilada: \`/\`, \`/evidencias\`, \`/evidencias/E04\`, \`/comparar\`, \`/musculos-uti\`, \`/projecoes\`, \`/metodologia\`, \`/api/health\`.
- Auditoria de dependências de **produção** \`pnpm audit --prod --audit-level high\`; isso não cobre toda a cadeia de suprimentos nem garante ausência de vulnerabilidades futuras.
- Testes E2E com navegador real **Chromium**, incluindo emulação móvel. Testam interações e rolagem horizontal da página.
- Auditoria automática axe-core nas seis páginas principais, usando regras marcadas \`wcag2a\`, \`wcag2aa\`, \`wcag21a\` e \`wcag21aa\`.

A execução de 06/11/2026 até o commit \`179f9d8\` passou: **93 testes unitários e 36 testes em Chromium** (desktop 1280 px e móvel 390 px), sem violações críticas/graves no conjunto de regras automatizadas e com a auditoria high+ de dependências aprovada. [GitHub Actions](https://github.com/annygabb/Lupa/actions/runs/42212073637).

A etapa adicional amplia para **360, 390, 768 e 1280 px** e verifica todas as violações apontadas pelo conjunto de regras A/AA. O estado final dessa ampliação deve ser confirmado na CI do novo commit; não considerar aprovado antes disso.

## 2. Matriz de navegação e ações automatizadas

| Área | Checagem |
|---|---|
| Menu | Todas as rotas principais, título, navegação e \`aria-current\` |
| Responsivo | Ausência de transbordamento horizontal da página nos viewports configurados |
| Explorador | Busca com zero resultados, reset, tema e paginação |
| Comparador | Inversão A/B, bloqueio de referência duplicada, troca de indicador, fonte original em outra aba |
| Músculos/UTI | Alternância de quatro perguntas e manutenção do bloqueio causal |
| Cenários | Troca de preset, edição de N, erro com retenção acima de 100%, reset |
| Exportação | Download real de CSV e JSON com nomes esperados |
| Acessibilidade | Navegação por texto, semântica básica, contraste e tabelas roláveis com acesso por teclado |
| Capturas | Viewport de seis rotas e seção gráfica do Comparador para revisão visual posterior |

Arquivos: \`tests/e2e/mvp.spec.ts\`, \`tests/e2e/accessibility.spec.ts\`, \`tests/e2e/visual.spec.ts\`, \`playwright.config.ts\`.

## 3. Correções motivadas pelos testes

1. Cores de legendas, estados, metadados e textos pequenos foram escurecidas após relatório de contraste insuficiente; foi mantida a hierarquia visual premium.
2. O link visível "Fonte original" passou a integrar seu nome acessível, com identificação do registro.
3. Contêineres de tabela com rolagem horizontal passaram a ter \`tabIndex=0\`, \`role=region\` e nome acessível, permitindo rolagem com teclado.
4. O GitHub passou a executar um conjunto independente de browser tests em Chromium além dos testes unitários.
5. O GitHub Actions passou a preservar relatório HTML, capturas e traces em artefato temporário (retenção de sete dias).
6. O projeto Vercel **lupaa** foi ajustado para **Node.js 22.x** e \`npx pnpm@10.18.0 install --no-frozen-lockfile\`, alinhando a compilação publicada à CI. O deployment de \`179f9d8\` foi confirmado como \`READY\` e associado à URL \`https://lupaa.vercel.app\`.

## 4. Como repetir no Windows PowerShell

\`\`\`powershell
cd $HOME\Lupa
git pull origin main
pnpm install
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
pnpm exec playwright install chromium
pnpm run test:e2e
\`\`\`

O Playwright sobe a aplicação compilada na porta \`3101\`. Para abrir o relatório HTML após os testes, execute:

\`\`\`powershell
pnpm exec playwright show-report
\`\`\`

No GitHub, acesse **Actions → Qualidade do LUPA Saúde → Navegador real e acessibilidade → Artifacts → playwright-report**. As screenshots anexadas ao relatório são uma referência para a etapa posterior de polimento de UX/UI, não comprovação automática de qualidade estética.

## 5. O que a automação NÃO comprova

- Safari real, iOS, Android físico, leitor de telas VoiceOver/TalkBack, gestos, zoom 200–400%, nem contraste sob diferentes condições de iluminação.
- Auditoria completa WCAG 2.2, aprovação legal de acessibilidade, usabilidade com participantes reais.
- Fontes científicas revisadas clinicamente de ponta a ponta: 50 referências permanecem em curadoria; cinco indicadores tiveram conferência documental e continuam sem revisão clínica independente.
- Cenários são resultados de fórmulas e hipóteses editáveis, **não** modelos validados de acesso brasileiro, mortalidade, internação ou eficácia.
- Performance em conexões móveis 3G/4G reais, Lighthouse/PageSpeed ou estresse de produção.
- Ausência absoluta de vulnerabilidades; a auditoria de dependências utiliza os dados públicos disponíveis na execução.
- Garantia de publicação em toda plataforma: cada novo commit requer status \`READY\` da Vercel.

## 6. Pendências antes de uma entrega final cientificamente segura

1. Revisão independente das publicações e desfechos prioritários, com critérios de elegibilidade explícitos.
2. Conferência documental de IBGE/Vigitel, fontes regulatórias, datas e decisões Conitec atualizadas.
3. Testes manuais em iPhone Safari, Android Chrome e acessibilidade por teclado/leitor de tela.
4. Auditoria de desempenho mobile, tamanho de bundles, URLs externos e estabilidade.
5. Lockfile de dependências versionado (ainda não existe). Revisar CI e GitHub Actions.
6. Material de apresentação do Hack Brasil 2026: demo, vídeo de até três minutos, pitch, repositório público e checklist de submissão.

**A funcionalidade MVP não deve ser confundida com aprovação clínica ou projeção epidemiológica para o Brasil.**

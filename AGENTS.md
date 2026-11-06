# AGENTS.md — LUPA Saúde

## Product and boundaries
Public research MVP (Next.js 16, React 19, TypeScript, Tailwind 4) at https://lupaa.vercel.app. 50 canonical candidate records, five source-checked metrics M01–M05, and hypothetical flow scenarios 2026–2036. **Never** present candidate studies as independently approved. Do not combine effect sizes across studies, invent N/CI/risk denominators, imply tirzepatide causes ICU outcomes, or treat a Conitec evaluation request as SUS incorporation.

No Supabase, SQL, migrations or new paid infrastructure without explicit authorization.

## Exact quality sequence for frontend changes
1. **Taste** (installed as \`design-taste-frontend\` from Leonxlnx/taste-skill): inspect three supplied Medical SaaS dashboard references, current app and actual content. Create a deliberate brief and visual direction before touching TSX. Favor research-grade clarity, asymmetric bento composition, data-driven visual hierarchy and credible provenance.
2. **Emil Kowalski** (\`emil-design-eng\`) **plus Impeccable** (\`impeccable\`): motion must serve feedback or state changes; remove gratuitous looping effects. Audit contrast, typography, spacing, responsive, states, edge cases. Document a before/after/why table.
3. **Playwright MCP + design-taste-frontend + grilling:** browser inspect and capture home, evidence, comparison, muscle/ICU, scenarios, methodology. Use grilling for unresolved user decisions only: answer factual questions from repo. Review 360,390,768,1280,1440 px and empty/error states. MCP must be truly connected before claiming it was used.
4. **agent-browser** after functional tests: \`agent-browser skills get core\`, open actual page, snapshot, clicks, screenshots, logs and accessibility checks. Avoid capturing PII; no forms that perform irreversible actions.
5. **copywriting + humanizar**: rewrite headers, subheads, CTAs, warnings, empty and error states in Brazilian Portuguese, preserving exact scientific and regulatory nuance. Do not fabricate social proof, testimonials or medical outcomes.
6. **Graphify-Labs / graphifyy**: scan TS/TSX, configs and docs, generate \`graphify-out/graph.json\`, HTML and GRAPH_REPORT.md; query dependencies and validate that changes did not bypass scientific guardrails.

## Anti-generic constraints
- Avoid the same card grid, icon-in-square, bright gradient and generic hero repeated on every route.
- Data visuals must use recorded values and always include cohort/period/source/limitations.
- No arbitrary auto-playing animation, fake trend, KPI or chart.
- Avoid tiny body copy on mobile and default centered page layout repeated everywhere.
- One primary action per section; reveal secondary methodological detail progressively.
- Touch targets >= 44 px, contrast >= WCAG AA where applicable, visible keyboard focus, reduced motion and data tables accessible via keyboard.

## After every change
Run: \`pnpm run lint\`, \`pnpm run typecheck\`, \`pnpm run test\`, \`pnpm run build\`, \`pnpm run test:e2e\`.
Check the **Vercel lupaa deployment** for current commit (READY, SHA, alias). Never claim browser testing or deployment based only on compilation.
Record a screenshot pair for desktop/mobile and a regression table with observed defects.
Use \`scripts/setup-design-stack.ps1\` to install project skills in VS Code; skills installed on a CI runner or in another agent do NOT automatically connect to this ChatGPT session.

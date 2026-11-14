# LUPA SAÚDE — ARQUITETURA REAL, INVENTÁRIO E MATRIZ DE CONEXÕES

> **Documento as-built auditável**, baseado na árvore de arquivos e em módulos concretos do GitHub.  
> **Branch:** `feat/lupa-live-auth-realtime-go-live-20261113` · **Snapshot de código:** `daf525abe3dfb0c2cc78353bde08262102b892e2` · **PR:** https://github.com/annygabb/Lupa/pull/8  
> **Código atual em produção:** NÃO CONFIRMADO para esta branch. **Banco Supabase dedicado:** NÃO LOCALIZADO nas conexões atuais.  
> **Inventário:** 322 arquivos rastreados, com classificação e links exatos abaixo.  
> **Critério:** diferença entre *implementado em código*, *validado em testes* e *comprovado em infraestrutura*.

## 1. Estado do projeto — não confundir plano com entrega

| Subsistema | Ligação e implementação observada | Estado responsável |
|---|---|---|
| Atlas, evidências, comparação, metodologia, cenários | `app/`, `components/`, `features/`; lógica local e catálogo científico | Em código anterior à branch; depende de revisão científica |
| Simulador corpo | `/corpo-evidencia` → `components/experience/body-evidence.tsx` → `features/experience/dynamic-scenario.ts` | Em código; resultados são cenários, não risco clínico |
| Relatos de medicação/sintomas | `/relatos` → `medicine-reflection.tsx` | SOMENTE local; não salva em servidor |
| Login institucional | `/login` → `/api/auth/session` → Supabase Auth + membership → cookies HttpOnly | Implementado em código NOVO; sem verificação com usuários reais |
| Recuperação de senha | `/recuperar-acesso` → `/api/auth/recover` e `/api/auth/password` | Em código; requer redirect de Auth e validação remota |
| RBAC por organização | `lupa_organization_members` + `lib/live/institutional-auth.ts` + APIs autorizadas | Em código e SQL; isolamento real NÃO TESTADO em DB |
| Eventos | `/api/live` cria/lista; `/api/live/:code` faz GET público/PATCH/DELETE autorizados | Código implementado; Supabase dedicado ausente |
| Votos | `/api/live/:code/vote` → HMAC cookie → RPC `lupa_cast_vote` | Código e migration existente; teste real não confirmado |
| QR/telão | `lib/live/qr.ts`, `components/live/presentation.tsx` | Em código; scanner físico não testado |
| Broadcast | `lib/live/realtime-client.ts` + triggers SQL `realtime.send` | Implementado como canal público **sem dados sensíveis** e sinal `invalidate`; entrega remota não comprovada |
| Feedback da experiência | `POST /api/live/:code/feedback` → `lupa_event_feedback` → endpoint de resumo → organizador | API, frontend, migration em código; sem migração aplicada |
| Multiquestões por evento | Estado Live `pre → reveal → post → closed`, UMA questão por evento | NÃO IMPLEMENTADO em formato de várias questões |
| Monitoramento/backup/MFA obrigatório | Health checa schema; outros mecanismos têm plano | PARCIAL / NÃO COMPROVADO |

**Não existe afirmação válida de “100% funcional em produção” sem executar migrations num Supabase exclusivo, conectar Auth/Realtime, verificar cookies, disparar votos/feedbacks reais e aprovar testes de segurança com duas organizações.**

## 2. Diagrama de arquitetura C4 — contexto

```mermaid
flowchart TB
  V[Visitante, estudioso] --> FE[Next.js LUPA na Vercel]
  P[Participante por QR] --> FE
  O[Organizador institucional] --> FE
  FE --> X[Evidence Engine e Atlas em código]
  FE --> API[Next.js Route Handlers]
  API --> AUTH[Supabase Auth]
  API --> DB[(Supabase PostgreSQL)]
  DB --> R[Supabase Broadcast: apenas invalidação]
  R --> P
  R --> T[Telão e cockpit]
  FE --> T
  V --> SIM[Simulação local de corpo e cenários]
  V --> RPT[Relatos locais sem envio]
  PUB[PubMed / ingestão dry-run] -. revisão humana .-> X
```

## 3. Diagrama de contêineres e fronteiras de dados

```mermaid
flowchart LR
  subgraph Browser["Browser PC/mobile"]
    ATL[Atlas/Comparação]
    ORG[Organizador]
    LIVE[Participante/Telão]
    REP[Relatos locais]
  end
  subgraph Next["Vercel / Next.js"]
    AC[API Auth + cookies]
    RBAC[Autorização por organização]
    SNAP[API Snapshots]
    WRITE[API Votos/Feedback]
  end
  subgraph Supabase["Supabase LUPA (ainda não provisionado/verificado)"]
    AUTH[auth.users]
    MEMBERS[lupa_organizations / lupa_organization_members]
    EVENTS[lupa_live_events / lupa_live_votes]
    FEEDBACK[lupa_event_feedback / lupa_live_audit]
    RT[realtime.messages Broadcast]
  end
  ORG --> AC --> AUTH
  ORG --> RBAC --> MEMBERS
  LIVE --> SNAP --> EVENTS
  LIVE --> WRITE --> EVENTS
  LIVE --> WRITE --> FEEDBACK
  EVENTS --> RT --> LIVE
  RT --> ORG
  ATL --> SNAP
  REP -. NÃO envia .-> FEEDBACK
```

## 4. Sequência de autenticação, administração e votação

```mermaid
sequenceDiagram
  participant U as Organizador
  participant N as Next API
  participant A as Supabase Auth
  participant M as Membership RLS
  participant P as Postgres
  participant W as Realtime
  participant V as Visitante
  U->>N: POST /api/auth/session email/senha
  N->>A: token grant=password e /auth/v1/user
  N->>M: membership e papel do user_id
  N-->>U: cookies HttpOnly e organizações autorizadas
  U->>N: POST /api/live org+claim
  N->>M: role owner/admin/organizer?
  N->>P: INSERT event vinculado a org
  N-->>U: código e QR /live/:code
  V->>N: GET snapshot público
  N->>P: RPC lupa_event_snapshot sem gabarito prematuro
  V->>N: POST voto com cookie HMAC
  N->>P: RPC lupa_cast_vote (único por fase/sessão)
  P->>W: realtime.send sem PII (invalidate)
  W-->>U: refresh do snapshot administrativo
  W-->>V: refresh do snapshot público
  U->>N: PATCH fase com cookie + RBAC
  N->>P: UPDATE com transição esperada
```

**Isolamento:** o backend verifica `auth/v1/user`, consulta a tabela protegida de membros e valida o papel associado à organização antes de mutações. A chave de serviço apenas no servidor pode contornar RLS; as verificações de tenant são, portanto, uma fronteira crítica a testar com contas reais.

## 5. Fluxo de feedback e dados sensíveis

```mermaid
flowchart LR
  A[Live encerrado] --> B[Consentimento/finalidade e duas notas 1 a 5]
  B --> C[POST /api/live/:code/feedback]
  C --> D[Verifica fase e cookie pseudônimo]
  D --> E[(lupa_event_feedback)]
  E --> F[GET feedback-summary para organizador]
  F --> G[Médias somente com >=5 respostas]
  H[Relatos de sintomas em /relatos] --> I[useState local]
  I -. NÃO entra em API, DB ou Broadcast .-> X[Governança médica e LGPD pendentes]
```

## 6. Modelo de dados — DDL existente, ainda não aplicado no projeto LUPA

- **`lupa_live_events`** — declarada no SQL versionado; não há prova de criação remota.
- **`lupa_live_votes`** — declarada no SQL versionado; não há prova de criação remota.
- **`lupa_live_rate_limits`** — declarada no SQL versionado; não há prova de criação remota.
- **`lupa_organizations`** — declarada no SQL versionado; não há prova de criação remota.
- **`lupa_organization_members`** — declarada no SQL versionado; não há prova de criação remota.
- **`lupa_event_feedback`** — declarada no SQL versionado; não há prova de criação remota.
- **`lupa_live_audit`** — declarada no SQL versionado; não há prova de criação remota.

Funções/RPC encontradas em duas migrações: `lupa_event_snapshot`, `lupa_cast_vote`, `lupa_feedback_summary`, `lupa_notify_event_change`, `lupa_notify_vote_change`.

**Migrações:** [supabase/migrations/20261111162000_lupa_live.sql](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/supabase/migrations/20261111162000_lupa_live.sql); [supabase/migrations/20261113215500_lupa_institutions_feedback_broadcast.sql](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/supabase/migrations/20261113215500_lupa_institutions_feedback_broadcast.sql).

O banco persiste votos e feedbacks apenas depois de configurar as credenciais e aplicar as migrações no projeto dedicado. O SQL do Live inicia com eventos/contagens/limites e foi estendido com organizações, membros, feedback e auditoria. Os triggers enviam somente `{code,kind:'snapshot_updated'}` para `live:<code>`, com correspondência ao WebSocket do browser.

## 7. Rotas e telas reais — 34 entradas

| Tipo | URL / endpoint | Métodos (quando API) | Arquivo e origem |
|---|---|---|---|
| API | `/api/auth/password` | POST | [app/api/auth/password/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/auth/password/route.ts) |
| API | `/api/auth/recover` | POST | [app/api/auth/recover/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/auth/recover/route.ts) |
| API | `/api/auth/session` | GET / POST / DELETE | [app/api/auth/session/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/auth/session/route.ts) |
| API | `/api/health` | GET | [app/api/health/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/health/route.ts) |
| API | `/api/interpretar` | POST | [app/api/interpretar/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/interpretar/route.ts) |
| API | `/api/live/:code/admin` | GET | [app/api/live/[code]/admin/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/admin/route.ts) |
| API | `/api/live/:code/feedback-summary` | GET | [app/api/live/[code]/feedback-summary/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/feedback-summary/route.ts) |
| API | `/api/live/:code/feedback` | POST | [app/api/live/[code]/feedback/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/feedback/route.ts) |
| API | `/api/live/:code/qr` | GET | [app/api/live/[code]/qr/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/qr/route.ts) |
| API | `/api/live/:code` | GET / PATCH / DELETE | [app/api/live/[code]/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/route.ts) |
| API | `/api/live/:code/vote` | POST | [app/api/live/[code]/vote/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/vote/route.ts) |
| API | `/api/live/health` | GET | [app/api/live/health/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/health/route.ts) |
| API | `/api/live` | GET / POST | [app/api/live/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/route.ts) |
| API | `/api/me` | GET | [app/api/me/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/me/route.ts) |
| Página | `/comparar` | — | [app/comparar/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/comparar/page.tsx) |
| Página | `/corpo-evidencia` | — | [app/corpo-evidencia/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/corpo-evidencia/page.tsx) |
| Página | `/desafio` | — | [app/desafio/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/desafio/page.tsx) |
| Página | `/dossie` | — | [app/dossie/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/dossie/page.tsx) |
| Página | `/evidencias/:id` | — | [app/evidencias/[id]/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/evidencias/[id]/page.tsx) |
| Página | `/evidencias` | — | [app/evidencias/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/evidencias/page.tsx) |
| Página | `/experiencias` | — | [app/experiencias/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/experiencias/page.tsx) |
| Página | `/impacto` | — | [app/impacto/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/impacto/page.tsx) |
| Página | `/live/:code` | — | [app/live/[code]/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/[code]/page.tsx) |
| Página | `/live/apresentacao/:code` | — | [app/live/apresentacao/[code]/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/apresentacao/[code]/page.tsx) |
| Página | `/live/organizador` | — | [app/live/organizador/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/organizador/page.tsx) |
| Página | `/live` | — | [app/live/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/page.tsx) |
| Página | `/login` | — | [app/login/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/login/page.tsx) |
| Página | `/metodologia` | — | [app/metodologia/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/metodologia/page.tsx) |
| Página | `/musculos-uti` | — | [app/musculos-uti/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/musculos-uti/page.tsx) |
| Página | `/page.tsx` | — | [app/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/page.tsx) |
| Página | `/projecoes` | — | [app/projecoes/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/projecoes/page.tsx) |
| Página | `/recuperar-acesso` | — | [app/recuperar-acesso/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/recuperar-acesso/page.tsx) |
| Página | `/relatos` | — | [app/relatos/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/relatos/page.tsx) |
| Página | `/saude-mental` | — | [app/saude-mental/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/saude-mental/page.tsx) |

## 8. Ligações por implementação (origens/destinos)

| Funcionalidade | Arquivo onde começa | Para onde liga | Como foi construída |
|---|---|---|---|
| Homepage | [app/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/page.tsx) | `components/atlas`, `components/home`, `features/evidence` | composição React/Next e assets cianotipia |
| Evidências | [app/evidencias/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/evidencias/page.tsx) | `components/routes/evidencias`, `features/evidence` | catálogo curado, fichas, pesquisa |
| Comparador | [app/comparar/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/comparar/page.tsx) | `features/comparison`, `components/comparison` | verificação de compatibilidade sem pooling indevido |
| Músculo / UTI | [app/musculos-uti/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/musculos-uti/page.tsx) | `components/muscle`, `features/muscle` | evidências/causalidade, sem risco pessoal |
| Projeções | [app/projecoes/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/projecoes/page.tsx) | `features/scenarios`, gráficos, sensibilidade | hipóteses matemáticas e exportações |
| Corpo | [app/corpo-evidencia/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/corpo-evidencia/page.tsx) | `body-evidence.tsx` → `dynamic-scenario.ts` | estado editável + SVG + função pura |
| Relatos | [app/relatos/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/relatos/page.tsx) | `medicine-reflection.tsx` | perguntas condicionais em memória do browser |
| Live | [app/live/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/page.tsx) | `components/live/join.tsx` | entrada por código/QR |
| Organizador | [app/live/organizador/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/organizador/page.tsx) | `components/live/organizer.tsx` → `/api/me`, `/api/live`, `/api/live/:code/admin` | painel conectado à Auth institucional |
| Votação | [app/live/[code]/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/[code]/page.tsx) | `components/live/participant.tsx` → `/api/live/:code/vote` | cookie pseudônimo + RPC transacional |
| Telão | [app/live/apresentacao/[code]/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/apresentacao/[code]/page.tsx) | `components/live/presentation.tsx`, QR e snapshot | projeção e Broadcast de invalidação |
| Autenticação | [app/login/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/login/page.tsx) | `institutional-login.tsx` → `/api/auth/session` → `/auth/v1/user` | cookies HttpOnly + verificação remota |
| Senha | [app/recuperar-acesso/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/recuperar-acesso/page.tsx) | `institutional-recovery.tsx`, `/api/auth/recover`, `/api/auth/password` | link Supabase Auth, alteração verificada por token |
| Feedback | [app/api/live/[code]/feedback/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/feedback/route.ts) | `lupa_event_feedback` → `feedback-summary` | insert + unique + confirmação HTTP |
| Broadcast | [lib/live/realtime-client.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/realtime-client.ts) | Supabase WebSocket `realtime:live:<code>` | Phoenix v1, invalidação, reconexão e fallback |
| PubMed | [scripts/sync-pubmed.mjs](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/scripts/sync-pubmed.mjs) | `features/ingestion` | dry-run + revisão, sem promover candidatos automaticamente |

### Imports locais lidos diretamente no snapshot (amostra verificável)

- **[app/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/page.tsx):** `@/components/atlas/hero`, `@/components/atlas/headline-marquee`, `@/components/atlas/lens-headlines`, `@/components/atlas/composition-scrolly`, `@/components/atlas/conclusion-chain`, `@/components/atlas/archive-field`, `@/components/atlas/plates-index`, `@/components/atlas/chapter-bar`, `@/components/insights/clinical-chart`, `@/components/atlas/motion`
- **[app/experiencias/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/experiencias/page.tsx):** `../experiencias.css`
- **[app/relatos/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/relatos/page.tsx):** `@/components/experience/medicine-reflection`, `../experiencias.css`
- **[app/corpo-evidencia/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/corpo-evidencia/page.tsx):** `@/components/experience/body-evidence`, `../experiencias.css`
- **[app/live/organizador/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/organizador/page.tsx):** `@/components/live/organizer`, `../../experiencias.css`
- **[app/login/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/login/page.tsx):** `@/components/live/institutional-login`, `../experiencias.css`
- **[app/api/live/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/route.ts):** `@/lib/live/db`, `@/lib/live/content`, `@/lib/live/institutional-auth`
- **[lib/live/institutional-auth.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/institutional-auth.ts):** `@/lib/live/db`

**Limite de auditoria:** a tabela acima é uma amostra de imports lidos, não afirma ter varrido todos os 203 arquivos TS/JS. O **inventário de arquivos abaixo é completo** para o snapshot Git; os fluxos entre módulos baseiam-se nas rotas e nos arquivos inspecionados. Dependências dinâmicas, CSS e imports transitivos podem existir além desta seleção.

## 9. Modificações desta implementação — PR #8

| Status no GitHub | Arquivo | Linhas acrescidas / removidas |
|---|---|---|
| modified | [.env.example](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/.env.example) | +20 / -12 |
| added | [app/api/auth/password/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/auth/password/route.ts) | +31 / -0 |
| added | [app/api/auth/recover/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/auth/recover/route.ts) | +29 / -0 |
| added | [app/api/auth/session/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/auth/session/route.ts) | +43 / -0 |
| added | [app/api/live/[code]/admin/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/admin/route.ts) | +27 / -0 |
| added | [app/api/live/[code]/feedback-summary/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/feedback-summary/route.ts) | +21 / -0 |
| added | [app/api/live/[code]/feedback/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/feedback/route.ts) | +54 / -0 |
| modified | [app/api/live/[code]/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/route.ts) | +49 / -90 |
| modified | [app/api/live/[code]/vote/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/vote/route.ts) | +3 / -3 |
| modified | [app/api/live/health/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/health/route.ts) | +16 / -7 |
| modified | [app/api/live/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/route.ts) | +58 / -62 |
| added | [app/api/me/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/me/route.ts) | +24 / -0 |
| added | [app/login/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/login/page.tsx) | +6 / -0 |
| added | [app/recuperar-acesso/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/recuperar-acesso/page.tsx) | +5 / -0 |
| added | [components/live/institutional-login.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/institutional-login.tsx) | +59 / -0 |
| added | [components/live/institutional-recovery.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/institutional-recovery.tsx) | +51 / -0 |
| modified | [components/live/join.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/join.tsx) | +3 / -3 |
| modified | [components/live/organizer.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/organizer.tsx) | +81 / -28 |
| modified | [components/live/participant.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/participant.tsx) | +35 / -5 |
| modified | [components/live/presentation.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/presentation.tsx) | +4 / -1 |
| modified | [lib/live/db.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/db.ts) | +9 / -4 |
| added | [lib/live/institutional-auth.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/institutional-auth.ts) | +173 / -0 |
| added | [lib/live/realtime-client.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/realtime-client.ts) | +90 / -0 |
| modified | [lib/live/security.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/security.ts) | +1 / -11 |
| modified | [next.config.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/next.config.ts) | +1 / -1 |
| added | [supabase/migrations/20261113215500_lupa_institutions_feedback_broadcast.sql](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/supabase/migrations/20261113215500_lupa_institutions_feedback_broadcast.sql) | +159 / -0 |
| added | [tests/unit/live-realtime.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/live-realtime.test.ts) | +21 / -0 |

**"Como foi criado" neste PR:** novos módulos são arquivos TypeScript/TSX do Next.js com rotas App Router, componentes React, queries PostgREST server-only, SQL de migração e testes; arquivos existentes foram modificados, preservando o restante do atlas. A tabela acima registra adição vs modificação real — não reivindica a autoria histórica do projeto todo.

## 10. Inventário COMPLETO de todos os arquivos rastreados no snapshot (322)

| Nº | Categoria | Arquivo versionado |
|---:|---|---|
| 1 | Configuração | [.env.example](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/.env.example) |
| 2 | GitHub Actions | [.github/workflows/ci.yml](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/.github/workflows/ci.yml) |
| 3 | GitHub Actions | [.github/workflows/design-skills-graph.yml](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/.github/workflows/design-skills-graph.yml) |
| 4 | GitHub Actions | [.github/workflows/pubmed-dry-run.yml](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/.github/workflows/pubmed-dry-run.yml) |
| 5 | Configuração | [.gitignore](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/.gitignore) |
| 6 | Configuração | [.nvmrc](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/.nvmrc) |
| 7 | Configuração | [.vscode/mcp.json](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/.vscode/mcp.json) |
| 8 | Configuração | [AGENTS.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/AGENTS.md) |
| 9 | API | [app/api/auth/password/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/auth/password/route.ts) |
| 10 | API | [app/api/auth/recover/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/auth/recover/route.ts) |
| 11 | API | [app/api/auth/session/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/auth/session/route.ts) |
| 12 | API | [app/api/health/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/health/route.ts) |
| 13 | API | [app/api/interpretar/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/interpretar/route.ts) |
| 14 | API | [app/api/live/[code]/admin/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/admin/route.ts) |
| 15 | API | [app/api/live/[code]/feedback-summary/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/feedback-summary/route.ts) |
| 16 | API | [app/api/live/[code]/feedback/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/feedback/route.ts) |
| 17 | API | [app/api/live/[code]/qr/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/qr/route.ts) |
| 18 | API | [app/api/live/[code]/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/route.ts) |
| 19 | API | [app/api/live/[code]/vote/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/[code]/vote/route.ts) |
| 20 | API | [app/api/live/health/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/health/route.ts) |
| 21 | API | [app/api/live/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/live/route.ts) |
| 22 | API | [app/api/me/route.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/api/me/route.ts) |
| 23 | CSS | [app/atlas-system.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/atlas-system.css) |
| 24 | CSS | [app/atlas.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/atlas.css) |
| 25 | CSS | [app/clinical-chart.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/clinical-chart.css) |
| 26 | CSS | [app/comparar/comparar.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/comparar/comparar.css) |
| 27 | Página | [app/comparar/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/comparar/page.tsx) |
| 28 | Página | [app/corpo-evidencia/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/corpo-evidencia/page.tsx) |
| 29 | Página | [app/desafio/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/desafio/page.tsx) |
| 30 | Página | [app/dossie/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/dossie/page.tsx) |
| 31 | CSS | [app/editorial.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/editorial.css) |
| 32 | Página | [app/evidencias/[id]/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/evidencias/[id]/page.tsx) |
| 33 | CSS | [app/evidencias/evidencias.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/evidencias/evidencias.css) |
| 34 | Página | [app/evidencias/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/evidencias/page.tsx) |
| 35 | CSS | [app/experiencias.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/experiencias.css) |
| 36 | Página | [app/experiencias/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/experiencias/page.tsx) |
| 37 | App/layout | [app/fonts.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/fonts.ts) |
| 38 | CSS | [app/globals.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/globals.css) |
| 39 | App/layout | [app/icon.svg](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/icon.svg) |
| 40 | Página | [app/impacto/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/impacto/page.tsx) |
| 41 | App/layout | [app/layout.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/layout.tsx) |
| 42 | Página | [app/live/[code]/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/[code]/page.tsx) |
| 43 | Página | [app/live/apresentacao/[code]/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/apresentacao/[code]/page.tsx) |
| 44 | Página | [app/live/organizador/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/organizador/page.tsx) |
| 45 | Página | [app/live/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/live/page.tsx) |
| 46 | Página | [app/login/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/login/page.tsx) |
| 47 | CSS | [app/lupa-premium.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/lupa-premium.css) |
| 48 | CSS | [app/metodologia/metodologia.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/metodologia/metodologia.css) |
| 49 | Página | [app/metodologia/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/metodologia/page.tsx) |
| 50 | CSS | [app/musculos-uti/musculos.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/musculos-uti/musculos.css) |
| 51 | Página | [app/musculos-uti/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/musculos-uti/page.tsx) |
| 52 | Página | [app/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/page.tsx) |
| 53 | Página | [app/projecoes/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/projecoes/page.tsx) |
| 54 | CSS | [app/projecoes/projecoes.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/projecoes/projecoes.css) |
| 55 | Página | [app/recuperar-acesso/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/recuperar-acesso/page.tsx) |
| 56 | Página | [app/relatos/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/relatos/page.tsx) |
| 57 | CSS | [app/saude-mental/mental.css](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/saude-mental/mental.css) |
| 58 | Página | [app/saude-mental/page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/saude-mental/page.tsx) |
| 59 | App/layout | [app/template.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/app/template.tsx) |
| 60 | Configuração | [components.json](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components.json) |
| 61 | Componente React | [components/atlas/archive-field.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/archive-field.tsx) |
| 62 | Componente React | [components/atlas/chapter-bar.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/chapter-bar.tsx) |
| 63 | Componente React | [components/atlas/composition-scrolly.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/composition-scrolly.tsx) |
| 64 | Componente React | [components/atlas/conclusion-chain.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/conclusion-chain.tsx) |
| 65 | Componente React | [components/atlas/cyanotype-plate.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/cyanotype-plate.tsx) |
| 66 | Componente React | [components/atlas/headline-marquee.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/headline-marquee.tsx) |
| 67 | Componente React | [components/atlas/hero.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/hero.tsx) |
| 68 | Componente React | [components/atlas/lens-headlines.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/lens-headlines.tsx) |
| 69 | Componente React | [components/atlas/motion.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/motion.tsx) |
| 70 | Componente React | [components/atlas/page-plate.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/page-plate.tsx) |
| 71 | Componente React | [components/atlas/plates-index.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/plates-index.tsx) |
| 72 | Componente React | [components/atlas/plates.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/plates.ts) |
| 73 | Componente React | [components/atlas/README.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/README.md) |
| 74 | Componente React | [components/atlas/smooth-scroll.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/smooth-scroll.tsx) |
| 75 | Componente React | [components/atlas/ui.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/atlas/ui.tsx) |
| 76 | Componente React | [components/comparison/comparison-bar-plot.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/comparison/comparison-bar-plot.tsx) |
| 77 | Componente React | [components/comparison/compatibility-panel.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/comparison/compatibility-panel.tsx) |
| 78 | Componente React | [components/comparison/evidence-orbit.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/comparison/evidence-orbit.tsx) |
| 79 | Componente React | [components/comparison/metric-chart.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/comparison/metric-chart.tsx) |
| 80 | Componente React | [components/comparison/studio-study-card.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/comparison/studio-study-card.tsx) |
| 81 | Componente React | [components/comparison/study-comparator.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/comparison/study-comparator.tsx) |
| 82 | Componente React | [components/evidence/evidence-card.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/evidence/evidence-card.tsx) |
| 83 | Componente React | [components/evidence/evidence-explorer.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/evidence/evidence-explorer.tsx) |
| 84 | Componente React | [components/experience/body-evidence.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/experience/body-evidence.tsx) |
| 85 | Componente React | [components/experience/challenge.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/experience/challenge.tsx) |
| 86 | Componente React | [components/experience/dossier.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/experience/dossier.tsx) |
| 87 | Componente React | [components/experience/impact.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/experience/impact.tsx) |
| 88 | Componente React | [components/experience/medicine-reflection.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/experience/medicine-reflection.tsx) |
| 89 | Componente React | [components/home/source-spotlight.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/home/source-spotlight.tsx) |
| 90 | Componente React | [components/home/weight-composition.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/home/weight-composition.tsx) |
| 91 | Componente React | [components/insights/clinical-chart.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/insights/clinical-chart.tsx) |
| 92 | Componente React | [components/insights/country-outlook.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/insights/country-outlook.tsx) |
| 93 | Componente React | [components/insights/evidence-faq.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/insights/evidence-faq.tsx) |
| 94 | Componente React | [components/insights/metric-detail.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/insights/metric-detail.tsx) |
| 95 | Componente React | [components/live/institutional-login.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/institutional-login.tsx) |
| 96 | Componente React | [components/live/institutional-recovery.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/institutional-recovery.tsx) |
| 97 | Componente React | [components/live/join.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/join.tsx) |
| 98 | Componente React | [components/live/organizer.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/organizer.tsx) |
| 99 | Componente React | [components/live/participant.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/participant.tsx) |
| 100 | Componente React | [components/live/presentation.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/live/presentation.tsx) |
| 101 | Componente React | [components/methodology/methodology-page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/methodology/methodology-page.tsx) |
| 102 | Componente React | [components/module-preview.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/module-preview.tsx) |
| 103 | Componente React | [components/motion/animated-number.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/motion/animated-number.tsx) |
| 104 | Componente React | [components/motion/scroll-reveals.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/motion/scroll-reveals.tsx) |
| 105 | Componente React | [components/muscle/muscle-research.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/muscle/muscle-research.tsx) |
| 106 | Componente React | [components/routes/comparar/balance-beam.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/comparar/balance-beam.tsx) |
| 107 | Componente React | [components/routes/comparar/compare-bench-url.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/comparar/compare-bench-url.tsx) |
| 108 | Componente React | [components/routes/comparar/compare-bench.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/comparar/compare-bench.tsx) |
| 109 | Componente React | [components/routes/comparar/data.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/comparar/data.ts) |
| 110 | Componente React | [components/routes/comparar/herbarium-sheet.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/comparar/herbarium-sheet.tsx) |
| 111 | Componente React | [components/routes/comparar/limits-plates.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/comparar/limits-plates.tsx) |
| 112 | Componente React | [components/routes/comparar/metric-explorer.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/comparar/metric-explorer.tsx) |
| 113 | Componente React | [components/routes/comparar/metric-ruler.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/comparar/metric-ruler.tsx) |
| 114 | Componente React | [components/routes/comparar/verdict-panel.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/comparar/verdict-panel.tsx) |
| 115 | Componente React | [components/routes/evidencias/data.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/evidencias/data.ts) |
| 116 | Componente React | [components/routes/evidencias/herbarium-explorer.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/evidencias/herbarium-explorer.tsx) |
| 117 | Componente React | [components/routes/evidencias/passport-actions.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/evidencias/passport-actions.tsx) |
| 118 | Componente React | [components/routes/evidencias/sheet.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/evidencias/sheet.tsx) |
| 119 | Componente React | [components/routes/evidencias/specimen-card.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/evidencias/specimen-card.tsx) |
| 120 | Componente React | [components/routes/metodologia/blocker-example.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/metodologia/blocker-example.ts) |
| 121 | Componente React | [components/routes/metodologia/data.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/metodologia/data.ts) |
| 122 | Componente React | [components/routes/metodologia/metodologia-page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/metodologia/metodologia-page.tsx) |
| 123 | Componente React | [components/routes/metodologia/protocol-timeline.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/metodologia/protocol-timeline.tsx) |
| 124 | Componente React | [components/routes/musculos-uti/causal-chain.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/musculos-uti/causal-chain.tsx) |
| 125 | Componente React | [components/routes/musculos-uti/data.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/musculos-uti/data.ts) |
| 126 | Componente React | [components/routes/musculos-uti/evidence-bars.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/musculos-uti/evidence-bars.tsx) |
| 127 | Componente React | [components/routes/musculos-uti/guided-inquiry.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/musculos-uti/guided-inquiry.tsx) |
| 128 | Componente React | [components/routes/projecoes/data.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/data.ts) |
| 129 | Componente React | [components/routes/projecoes/evidence-plate.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/evidence-plate.tsx) |
| 130 | Componente React | [components/routes/projecoes/evidence-questions.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/evidence-questions.tsx) |
| 131 | Componente React | [components/routes/projecoes/gap-ledger.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/gap-ledger.tsx) |
| 132 | Componente React | [components/routes/projecoes/gap-observatory.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/gap-observatory.tsx) |
| 133 | Componente React | [components/routes/projecoes/hypothesis-chain.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/hypothesis-chain.tsx) |
| 134 | Componente React | [components/routes/projecoes/point-panel.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/point-panel.tsx) |
| 135 | Componente React | [components/routes/projecoes/projecoes-page.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/projecoes-page.tsx) |
| 136 | Componente React | [components/routes/projecoes/scenario-export.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/scenario-export.ts) |
| 137 | Componente React | [components/routes/projecoes/scenario-lab.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/scenario-lab.tsx) |
| 138 | Componente React | [components/routes/projecoes/sensitivity-panel.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/sensitivity-panel.tsx) |
| 139 | Componente React | [components/routes/projecoes/trace-chart.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/trace-chart.tsx) |
| 140 | Componente React | [components/routes/projecoes/tween-number.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/projecoes/tween-number.tsx) |
| 141 | Componente React | [components/routes/saude-mental/phq-chart.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/saude-mental/phq-chart.tsx) |
| 142 | Componente React | [components/routes/saude-mental/scale-lens.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/routes/saude-mental/scale-lens.tsx) |
| 143 | Componente React | [components/scenarios/scenario-dashboard.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/scenarios/scenario-dashboard.tsx) |
| 144 | Componente React | [components/site-footer.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/site-footer.tsx) |
| 145 | Componente React | [components/site-header.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/site-header.tsx) |
| 146 | Componente React | [components/ui/button.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/ui/button.tsx) |
| 147 | Componente React | [components/ui/card.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/ui/card.tsx) |
| 148 | Componente React | [components/ui/line-chart.tsx](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/components/ui/line-chart.tsx) |
| 149 | Documentação | [docs/adr/0001-monolito-modular.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/adr/0001-monolito-modular.md) |
| 150 | Documentação | [docs/adr/0002-interpretacao-deterministica.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/adr/0002-interpretacao-deterministica.md) |
| 151 | Documentação | [docs/ARCHITECTURE.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/ARCHITECTURE.md) |
| 152 | Documentação | [docs/assets-referencia/diagrama_limites_uti.svg](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/assets-referencia/diagrama_limites_uti.svg) |
| 153 | Documentação | [docs/assets-referencia/grafico_exemplo_75_25.png](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/assets-referencia/grafico_exemplo_75_25.png) |
| 154 | Documentação | [docs/assets-referencia/referencia_atlas_interativo.png](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/assets-referencia/referencia_atlas_interativo.png) |
| 155 | Documentação | [docs/assets-referencia/referencia_corpo_uti_modulos.png](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/assets-referencia/referencia_corpo_uti_modulos.png) |
| 156 | Documentação | [docs/COPY_LUPA_HUMANIZADO.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/COPY_LUPA_HUMANIZADO.md) |
| 157 | Documentação | [docs/DEPLOY_AMBIENTES_LUPA_LIVE.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/DEPLOY_AMBIENTES_LUPA_LIVE.md) |
| 158 | Documentação | [docs/DESIGN_LUPA_2026.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/DESIGN_LUPA_2026.md) |
| 159 | Documentação | [docs/DOCUMENTACAO_MESTRA_LUPA.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/DOCUMENTACAO_MESTRA_LUPA.md) |
| 160 | Documentação | [docs/ETAPA2_CONTRATOS.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/ETAPA2_CONTRATOS.md) |
| 161 | Documentação | [docs/ETAPA3A_CURADORIA.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/ETAPA3A_CURADORIA.md) |
| 162 | Documentação | [docs/ETAPA3B_INTERFACE.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/ETAPA3B_INTERFACE.md) |
| 163 | Documentação | [docs/ETAPA4_COMPARADOR.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/ETAPA4_COMPARADOR.md) |
| 164 | Documentação | [docs/ETAPA4B_DESIGN_SYSTEM_UX_UI.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/ETAPA4B_DESIGN_SYSTEM_UX_UI.md) |
| 165 | Documentação | [docs/ETAPA4C_DASHBOARD_PREMIUM.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/ETAPA4C_DASHBOARD_PREMIUM.md) |
| 166 | Documentação | [docs/ETAPA5_6_7_MVP_FUNCIONAL.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/ETAPA5_6_7_MVP_FUNCIONAL.md) |
| 167 | Documentação | [docs/evidence-review/README.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/evidence-review/README.md) |
| 168 | Documentação | [docs/HACKATHON_NARRATIVA_EVIDENCIAS_2026-11-07.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/HACKATHON_NARRATIVA_EVIDENCIAS_2026-11-07.md) |
| 169 | Documentação | [docs/ingestion/PUBMED_DRY_RUN.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/ingestion/PUBMED_DRY_RUN.md) |
| 170 | Documentação | [docs/LEIA_PRIMEIRO.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/LEIA_PRIMEIRO.md) |
| 171 | Documentação | [docs/LUPA_BACKLOG_SEGURANCA_RELATOS_CORPO_PUBMED_2026-11-13.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/LUPA_BACKLOG_SEGURANCA_RELATOS_CORPO_PUBMED_2026-11-13.md) |
| 172 | Documentação | [docs/LUPA_SAUDE_DOCUMENTACAO_COMPLETA_IMPLEMENTACAO_100_POR_CENTO_2026.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/LUPA_SAUDE_DOCUMENTACAO_COMPLETA_IMPLEMENTACAO_100_POR_CENTO_2026.md) |
| 173 | Documentação | [docs/MAPA_CONHECIMENTO_LUPA.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/MAPA_CONHECIMENTO_LUPA.md) |
| 174 | Documentação | [docs/METHODOLOGY.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/METHODOLOGY.md) |
| 175 | Documentação | [docs/pitch/PERGUNTAS_DIFICEIS.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/pitch/PERGUNTAS_DIFICEIS.md) |
| 176 | Documentação | [docs/pitch/ROTEIRO_3_MIN.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/pitch/ROTEIRO_3_MIN.md) |
| 177 | Documentação | [docs/PLANO_REVISAO_CLINICA_PRIORITARIA.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/PLANO_REVISAO_CLINICA_PRIORITARIA.md) |
| 178 | Documentação | [docs/PROMPT_MESTRE_SKILLS_LUPA.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/PROMPT_MESTRE_SKILLS_LUPA.md) |
| 179 | Documentação | [docs/QA_TESTES_BROWSER_ACESSIBILIDADE.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/QA_TESTES_BROWSER_ACESSIBILIDADE.md) |
| 180 | Documentação | [docs/release/CHANGELOG.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/release/CHANGELOG.md) |
| 181 | Documentação | [docs/STATUS.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/STATUS.md) |
| 182 | Documentação | [docs/superpowers/plans/2026-11-07-lupa-impact.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/superpowers/plans/2026-11-07-lupa-impact.md) |
| 183 | Documentação | [docs/updates/2026-11-08-blue-motion-polish.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/updates/2026-11-08-blue-motion-polish.md) |
| 184 | Documentação | [docs/updates/2026-11-08-clean-evidence-design.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/updates/2026-11-08-clean-evidence-design.md) |
| 185 | Documentação | [docs/UX_PRINCIPLES.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/UX_PRINCIPLES.md) |
| 186 | Documentação | [docs/validation/protocolo-teste-compreensao.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/docs/validation/protocolo-teste-compreensao.md) |
| 187 | Configuração | [eslint.config.mjs](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/eslint.config.mjs) |
| 188 | Regra/domínio | [features/comparison/compatibility-copy.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/comparison/compatibility-copy.ts) |
| 189 | Regra/domínio | [features/comparison/compatibility.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/comparison/compatibility.ts) |
| 190 | Regra/domínio | [features/comparison/params.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/comparison/params.ts) |
| 191 | Regra/domínio | [features/comparison/reviewed-metrics.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/comparison/reviewed-metrics.ts) |
| 192 | Regra/domínio | [features/evidence/catalog.seed.json](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/catalog.seed.json) |
| 193 | Regra/domínio | [features/evidence/catalog.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/catalog.ts) |
| 194 | Regra/domínio | [features/evidence/contracts.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/contracts.ts) |
| 195 | Regra/domínio | [features/evidence/normalization.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/normalization.ts) |
| 196 | Regra/domínio | [features/evidence/passport.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/passport.ts) |
| 197 | Regra/domínio | [features/evidence/priorities.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/priorities.ts) |
| 198 | Regra/domínio | [features/evidence/projection-guard.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/projection-guard.ts) |
| 199 | Regra/domínio | [features/evidence/search.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/search.ts) |
| 200 | Regra/domínio | [features/evidence/supplemental.seed.json](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/supplemental.seed.json) |
| 201 | Regra/domínio | [features/evidence/supplemental.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/supplemental.ts) |
| 202 | Regra/domínio | [features/evidence/unified-catalog.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/evidence/unified-catalog.ts) |
| 203 | Regra/domínio | [features/experience/composition.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/experience/composition.ts) |
| 204 | Regra/domínio | [features/experience/dynamic-scenario.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/experience/dynamic-scenario.ts) |
| 205 | Regra/domínio | [features/ingestion/dedupe.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/ingestion/dedupe.ts) |
| 206 | Regra/domínio | [features/ingestion/errors.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/ingestion/errors.ts) |
| 207 | Regra/domínio | [features/ingestion/normalize.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/ingestion/normalize.ts) |
| 208 | Regra/domínio | [features/ingestion/pubmed-client.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/ingestion/pubmed-client.ts) |
| 209 | Regra/domínio | [features/ingestion/report.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/ingestion/report.ts) |
| 210 | Regra/domínio | [features/ingestion/run.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/ingestion/run.ts) |
| 211 | Regra/domínio | [features/insights/evidence.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/insights/evidence.ts) |
| 212 | Regra/domínio | [features/insights/questions.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/insights/questions.ts) |
| 213 | Regra/domínio | [features/interpretation/blocker-copy.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/interpretation/blocker-copy.ts) |
| 214 | Regra/domínio | [features/interpretation/claims.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/interpretation/claims.ts) |
| 215 | Regra/domínio | [features/interpretation/interpret-claim.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/interpretation/interpret-claim.ts) |
| 216 | Regra/domínio | [features/muscle/evidence-map.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/muscle/evidence-map.ts) |
| 217 | Regra/domínio | [features/scenarios/engine.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/scenarios/engine.ts) |
| 218 | Regra/domínio | [features/scenarios/sensitivity.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/features/scenarios/sensitivity.ts) |
| 219 | Utilitário/backend | [lib/evidence-presentation.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/evidence-presentation.ts) |
| 220 | Utilitário/backend | [lib/health.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/health.ts) |
| 221 | Utilitário/backend | [lib/live/content.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/content.ts) |
| 222 | Utilitário/backend | [lib/live/db.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/db.ts) |
| 223 | Utilitário/backend | [lib/live/institutional-auth.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/institutional-auth.ts) |
| 224 | Utilitário/backend | [lib/live/qr.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/qr.ts) |
| 225 | Utilitário/backend | [lib/live/realtime-client.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/realtime-client.ts) |
| 226 | Utilitário/backend | [lib/live/security.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/live/security.ts) |
| 227 | Utilitário/backend | [lib/utils.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/lib/utils.ts) |
| 228 | Configuração | [next-env.d.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/next-env.d.ts) |
| 229 | Configuração | [next.config.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/next.config.ts) |
| 230 | Configuração | [package.json](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/package.json) |
| 231 | Configuração | [playwright.config.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/playwright.config.ts) |
| 232 | Configuração | [pnpm-lock.yaml](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/pnpm-lock.yaml) |
| 233 | Configuração | [postcss.config.mjs](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/postcss.config.mjs) |
| 234 | Asset | [public/assets/images/cianotipia/balanca-1.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/balanca-1.webp) |
| 235 | Asset | [public/assets/images/cianotipia/canetas-1.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/canetas-1.webp) |
| 236 | Asset | [public/assets/images/cianotipia/cerebro.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/cerebro.webp) |
| 237 | Asset | [public/assets/images/cianotipia/comparar.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/comparar.webp) |
| 238 | Asset | [public/assets/images/cianotipia/coracao.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/coracao.webp) |
| 239 | Asset | [public/assets/images/cianotipia/corpo-composicao.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/corpo-composicao.webp) |
| 240 | Asset | [public/assets/images/cianotipia/estudos-1.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/estudos-1.webp) |
| 241 | Asset | [public/assets/images/cianotipia/globo.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/globo.webp) |
| 242 | Asset | [public/assets/images/cianotipia/laboratorio-2.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/laboratorio-2.webp) |
| 243 | Asset | [public/assets/images/cianotipia/lupa-caneta-2.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/lupa-caneta-2.webp) |
| 244 | Asset | [public/assets/images/cianotipia/musculo.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/musculo.webp) |
| 245 | Asset | [public/assets/images/cianotipia/orgaos-1.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/orgaos-1.webp) |
| 246 | Asset | [public/assets/images/cianotipia/sementes.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/sementes.webp) |
| 247 | Asset | [public/assets/images/cianotipia/uti.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/cianotipia/uti.webp) |
| 248 | Asset | [public/assets/images/diagrama_limites_uti.svg](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/diagrama_limites_uti.svg) |
| 249 | Asset | [public/assets/images/grafico_exemplo_75_25.png](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/grafico_exemplo_75_25.png) |
| 250 | Asset | [public/assets/images/recortes/caneta-branco.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/caneta-branco.webp) |
| 251 | Asset | [public/assets/images/recortes/caneta.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/caneta.webp) |
| 252 | Asset | [public/assets/images/recortes/comprimidos-branco.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/comprimidos-branco.webp) |
| 253 | Asset | [public/assets/images/recortes/comprimidos.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/comprimidos.webp) |
| 254 | Asset | [public/assets/images/recortes/dente-de-leao-branco.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/dente-de-leao-branco.webp) |
| 255 | Asset | [public/assets/images/recortes/dente-de-leao.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/dente-de-leao.webp) |
| 256 | Asset | [public/assets/images/recortes/eucalipto-branco.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/eucalipto-branco.webp) |
| 257 | Asset | [public/assets/images/recortes/eucalipto.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/eucalipto.webp) |
| 258 | Asset | [public/assets/images/recortes/folhas-soltas-branco.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/folhas-soltas-branco.webp) |
| 259 | Asset | [public/assets/images/recortes/folhas-soltas.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/folhas-soltas.webp) |
| 260 | Asset | [public/assets/images/recortes/ginkgo-branco.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/ginkgo-branco.webp) |
| 261 | Asset | [public/assets/images/recortes/ginkgo.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/ginkgo.webp) |
| 262 | Asset | [public/assets/images/recortes/lupa-branco.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/lupa-branco.webp) |
| 263 | Asset | [public/assets/images/recortes/lupa.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/lupa.webp) |
| 264 | Asset | [public/assets/images/recortes/samambaia-alta-branco.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/samambaia-alta-branco.webp) |
| 265 | Asset | [public/assets/images/recortes/samambaia-alta.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/samambaia-alta.webp) |
| 266 | Asset | [public/assets/images/recortes/samambaia-curta-branco.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/samambaia-curta-branco.webp) |
| 267 | Asset | [public/assets/images/recortes/samambaia-curta.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/samambaia-curta.webp) |
| 268 | Asset | [public/assets/images/recortes/semente-alada-branco.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/semente-alada-branco.webp) |
| 269 | Asset | [public/assets/images/recortes/semente-alada.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/recortes/semente-alada.webp) |
| 270 | Asset | [public/assets/images/referencia_atlas_interativo.png](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/referencia_atlas_interativo.png) |
| 271 | Asset | [public/assets/images/referencia_corpo_uti_modulos.png](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/images/referencia_corpo_uti_modulos.png) |
| 272 | Asset | [public/assets/textures/papel-cianotipia_albedo.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/assets/textures/papel-cianotipia_albedo.webp) |
| 273 | Asset | [public/images/canetas-3d-azul.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/images/canetas-3d-azul.webp) |
| 274 | Asset | [public/images/canetas-3d.webp](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/images/canetas-3d.webp) |
| 275 | Asset | [public/og-image.png](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/public/og-image.png) |
| 276 | Configuração | [README.md](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/README.md) |
| 277 | Script | [scripts/dev.mjs](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/scripts/dev.mjs) |
| 278 | Script | [scripts/probe-playwright-mcp.mjs](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/scripts/probe-playwright-mcp.mjs) |
| 279 | Script | [scripts/setup-design-stack.ps1](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/scripts/setup-design-stack.ps1) |
| 280 | Script | [scripts/smoke.mjs](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/scripts/smoke.mjs) |
| 281 | Script | [scripts/sync-pubmed.mjs](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/scripts/sync-pubmed.mjs) |
| 282 | SQL/migração | [supabase/migrations/20261111162000_lupa_live.sql](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/supabase/migrations/20261111162000_lupa_live.sql) |
| 283 | SQL/migração | [supabase/migrations/20261113215500_lupa_institutions_feedback_broadcast.sql](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/supabase/migrations/20261113215500_lupa_institutions_feedback_broadcast.sql) |
| 284 | Testes | [tests/e2e/accessibility.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/accessibility.spec.ts) |
| 285 | Testes | [tests/e2e/dynamic-body-and-reflection.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/dynamic-body-and-reflection.spec.ts) |
| 286 | Testes | [tests/e2e/evidence-lens.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/evidence-lens.spec.ts) |
| 287 | Testes | [tests/e2e/experiences.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/experiences.spec.ts) |
| 288 | Testes | [tests/e2e/hackathon.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/hackathon.spec.ts) |
| 289 | Testes | [tests/e2e/motion.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/motion.spec.ts) |
| 290 | Testes | [tests/e2e/mvp.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/mvp.spec.ts) |
| 291 | Testes | [tests/e2e/passport.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/passport.spec.ts) |
| 292 | Testes | [tests/e2e/sensitivity.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/sensitivity.spec.ts) |
| 293 | Testes | [tests/e2e/ux-principles.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/ux-principles.spec.ts) |
| 294 | Testes | [tests/e2e/visual.spec.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/e2e/visual.spec.ts) |
| 295 | Testes | [tests/integration/interpretar-api.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/integration/interpretar-api.test.ts) |
| 296 | Testes | [tests/unit/blocker-copy.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/blocker-copy.test.ts) |
| 297 | Testes | [tests/unit/compare-params.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/compare-params.test.ts) |
| 298 | Testes | [tests/unit/comparison-premium.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/comparison-premium.test.ts) |
| 299 | Testes | [tests/unit/comparison-ui-4b.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/comparison-ui-4b.test.ts) |
| 300 | Testes | [tests/unit/comparison.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/comparison.test.ts) |
| 301 | Testes | [tests/unit/dynamic-scenario.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/dynamic-scenario.test.ts) |
| 302 | Testes | [tests/unit/evidence-premium.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/evidence-premium.test.ts) |
| 303 | Testes | [tests/unit/evidence-priorities.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/evidence-priorities.test.ts) |
| 304 | Testes | [tests/unit/evidence-stage3a.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/evidence-stage3a.test.ts) |
| 305 | Testes | [tests/unit/evidence-ui.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/evidence-ui.test.ts) |
| 306 | Testes | [tests/unit/evidence.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/evidence.test.ts) |
| 307 | Testes | [tests/unit/experience-composition.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/experience-composition.test.ts) |
| 308 | Testes | [tests/unit/hackathon-evidence.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/hackathon-evidence.test.ts) |
| 309 | Testes | [tests/unit/health.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/health.test.ts) |
| 310 | Testes | [tests/unit/home-spotlight.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/home-spotlight.test.ts) |
| 311 | Testes | [tests/unit/ingestion.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/ingestion.test.ts) |
| 312 | Testes | [tests/unit/interpretation.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/interpretation.test.ts) |
| 313 | Testes | [tests/unit/live-content.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/live-content.test.ts) |
| 314 | Testes | [tests/unit/live-db.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/live-db.test.ts) |
| 315 | Testes | [tests/unit/live-qr.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/live-qr.test.ts) |
| 316 | Testes | [tests/unit/live-realtime.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/live-realtime.test.ts) |
| 317 | Testes | [tests/unit/muscle-methodology.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/muscle-methodology.test.ts) |
| 318 | Testes | [tests/unit/passport.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/passport.test.ts) |
| 319 | Testes | [tests/unit/scenarios.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/scenarios.test.ts) |
| 320 | Testes | [tests/unit/sensitivity.test.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tests/unit/sensitivity.test.ts) |
| 321 | Configuração | [tsconfig.json](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/tsconfig.json) |
| 322 | Configuração | [vitest.config.ts](https://github.com/annygabb/Lupa/blob/daf525abe3dfb0c2cc78353bde08262102b892e2/vitest.config.ts) |

## 11. Segurança, qualidade, aceitação e pendências REAIS

- **Variáveis para configurar:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `LUPA_LIVE_SIGNING_SECRET`, `LUPA_APP_BASE_URL`. Nenhuma credencial é parte do inventário.
- **RLS:** ligado para tabelas novas; membros têm leitura limitada ao próprio `auth.uid()`; somente API server-side usa elevated key e deve validar instituição/papel.
- **Sessões:** Auth remoto de usuário antes de operação privilegiada; JWT/refresh nos cookies HttpOnly, SameSite=Lax, Secure em produção. MFA ainda precisa configuração e teste real.
- **Votação:** limite transacional em SQL com UNIQUE por evento/fase/session_hash; **não impede o mesmo indivíduo de usar dois navegadores**. Multiquestão por sessão requer outro modelo de dados e não está pronta.
- **Broadcast:** notificação sanitizada pública `invalidate`; não há difusão de linhas do banco. Verificar na prática subscrição e rollback após desconexão. Dados médicos nunca são enviados em Broadcast.
- **Feedback:** notas somente com concordância explícita sobre finalidade educativa; tentativas repetidas bloqueadas por sessão, resultado agregado oculto abaixo de cinco. Falta gestão completa de retenção/erasure e proteção antifraude multi-dispositivo.
- **Relatos clínicos:** permanecem em memória local, sem coleta de saúde; requer base legal específica, aviso, prazo de retenção, projeto ético e revisão LGPD para eventual futuro.
- **CI:** `.github/workflows/ci.yml` cobre lint, TypeScript, Vitest, Next build, smoke, Playwright+axe e auditoria de dependências; passar em CI não comprova serviço externo.
- **P0 pendentes:** Supabase dedicado e migrações *aplicadas*, first institutional owner provisionado, env Vercel por ambiente, teste BOLA org A↔B, WebSocket e voto real em dispositivos físicos, cookies/Auth recovery, e back-up/restore.
- **P1 pendentes:** multiquestões, feedback audit/retention automatizados, monitoramento/alerta, carga 100-500 participantes, políticas MFA, RLS e função SQL no banco real, curadoria médica independente.
- **Deploy:** não realizar merge de branch sem CI verde e sem testar DB staging; não confundir deploy Vercel anterior da `main` com implantação desta branch.

## 12. Roteiro de aceite de go-live

1. Confirmar conta Vercel/equipe e projeto Supabase **do próprio LUPA** (não reutilizar Borali, UaiConta etc.).
2. Provisionar staging e produção, backups e ambiente seguro de variáveis.
3. Rodar SQL em staging e inspecionar DDL, grants, RLS, trigger `realtime.send`, `/api/live/health`.
4. Criar usuários em Supabase Auth, vincular `organization_members` por UUIDs reais, testar 2 instituições.
5. Abrir `/login`, entrar, criar evento, fechar/abrir rodadas, votar, atualizar telão, recarregar e reconectar.
6. Encerrar, consentir avaliação, validar persistência e agregado; verificar que `/relatos` NÃO envia sintomas.
7. Testar duplicidade e abuso (cookies diferentes, concurrent votes, invalid phase), refresh JWT, reset senha, erro de DB, CSP, QR iOS/Android.
8. Verificar execução completa CI e revisão clínica/LGPD; migrar produção após aprovação, verificar deploy SHA, logs, restore e rollback.

**Critério de conclusão:** somente declarar **"100% funcional dentro do escopo aprovado"** se houver evidências de execução destas etapas no ambiente de produção, e se as lacunas excluídas estiverem explicitamente documentadas.

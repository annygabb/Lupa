# ADR 0003 — LUPA Live usa Supabase (Postgres + Auth) isolado do atlas

- **Status:** aceita (registrada retroativamente na remediação de 26/11/2026)
- **Substitui parcialmente:** ADR 0001, apenas para o LUPA Live

## Contexto

O LUPA Live (votação em sala com organizador institucional) precisa de estado compartilhado entre aparelhos:
eventos, votos, fases, feedback e permissões por organização. Isso não cabe no catálogo estático da ADR 0001.
O código foi adicionado sem ADR; a auditoria de 26/11 apontou a contradição.

## Decisão

1. O **atlas público continua sem banco** (ADR 0001). Nenhuma rota do atlas depende do Live.
2. O Live usa um projeto **Supabase exclusivo**: Postgres com RLS, `REVOKE` para `anon`/`authenticated` e acesso
   **somente pelo servidor** com chave de serviço; Supabase Auth para organizadores.
3. A autorização vem da tabela `lupa_organization_members` (nunca de `user_metadata`); toda rota administrativa
   verifica o papel do usuário na organização do evento.
4. Participantes não têm conta. Cada um recebe uma **sessão assinada** (HMAC, vinculada ao evento, 4 h) no primeiro
   GET; votos e feedback exigem essa sessão e Origin confiável.
5. Limites de taxa persistentes (`lupa_rate_limits`, janela fixa) por rede pseudonimizada (HMAC do IP), por e-mail
   no login e por sessão no voto. Nenhum IP ou e-mail é gravado em claro.
6. Sem banco configurado em produção, a API responde `503 LIVE_UNCONFIGURED` e as telas dizem isso. O motor em memória
   existe **apenas** em desenvolvimento e testes.

## Consequências

- O Live só funciona após provisionamento (ver `docs/IMPLANTACAO_LIVE.md`); o atlas segue com deploy estático.
- Os testes de banco usam Postgres real com *stubs* do Supabase e um simulador de PostgREST/GoTrue. Validar no
  Supabase real continua obrigatório antes de uso em evento.
- Risco residual: sem CAPTCHA/WAF, um atacante com muitos IPs ainda consegue enviar votos; documentado no runbook.

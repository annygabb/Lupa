-- LUPA Live — remediação da auditoria de 26/11/2026.
-- Requer as migrações anteriores (20261111162000 → 20261123153000) já aplicadas.
-- Aplicar PRIMEIRO em STAGING exclusivo do LUPA, com backup. Não apaga nem altera dados existentes:
-- só cria uma tabela nova, funções novas, índices e substitui a função de retenção (com a mesma assinatura).
-- Reversão: supabase/rollback/20261126120000_lupa_audit_remediation_down.sql
-- Testada em Postgres 16 isolado com stubs do Supabase (ver tests/integration/live-supabase-stack.test.ts).

-- 1) Limitador de taxa persistente e genérico (votos por rede, emissão de sessões, login, recuperação).
--    Guarda apenas HMAC do identificador (IP ou e-mail), nunca o valor em claro.
create table if not exists public.lupa_rate_limits (
 scope text not null check (scope ~ '^[A-Za-z0-9:_-]{3,80}$'),
 key_hash text not null check (key_hash ~ '^[a-f0-9]{64}$'),
 window_start timestamptz not null,
 hits integer not null default 0 check (hits >= 0),
 primary key (scope, key_hash, window_start)
);
create index if not exists lupa_rate_limits_window on public.lupa_rate_limits(window_start);
alter table public.lupa_rate_limits enable row level security;
revoke all on public.lupa_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.lupa_rate_limits to service_role;

create or replace function public.lupa_consume_limit(
 p_scope text, p_key_hash text, p_window_seconds integer, p_max integer
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_window timestamptz;
 v_hits integer;
begin
 if p_scope is null or p_scope !~ '^[A-Za-z0-9:_-]{3,80}$'
   or p_key_hash is null or p_key_hash !~ '^[a-f0-9]{64}$'
   or p_window_seconds is null or p_window_seconds not between 1 and 86400
   or p_max is null or p_max not between 1 and 100000 then
  raise exception 'LUPA_LIMIT_INVALID_INPUT' using errcode = '22023';
 end if;
 v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
 insert into public.lupa_rate_limits(scope, key_hash, window_start, hits)
 values (p_scope, p_key_hash, v_window, 1)
 on conflict (scope, key_hash, window_start)
 do update set hits = public.lupa_rate_limits.hits + 1
 returning hits into v_hits;
 return jsonb_build_object(
  'allowed', v_hits <= p_max,
  'hits', v_hits,
  'retryAfter', greatest(0, ceil(extract(epoch from (v_window + make_interval(secs => p_window_seconds) - now()))))::integer
 );
end $$;
revoke all on function public.lupa_consume_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.lupa_consume_limit(text, text, integer, integer) to service_role;

-- 2) Estado da própria sessão do participante (restaura a interface após recarregar).
--    Não revela QUAL alternativa foi escolhida.
create or replace function public.lupa_session_state(p_code text, p_session_hash text)
returns jsonb language sql stable security definer set search_path = '' as $$
 select jsonb_build_object(
  'votedPre', exists(select 1 from public.lupa_live_votes v where v.event_id = e.id and v.phase = 'pre' and v.session_hash = p_session_hash),
  'votedPost', exists(select 1 from public.lupa_live_votes v where v.event_id = e.id and v.phase = 'post' and v.session_hash = p_session_hash),
  'feedbackSent', exists(select 1 from public.lupa_event_feedback f where f.event_id = e.id and f.session_hash = p_session_hash)
 )
 from public.lupa_live_events e
 where e.code = p_code and p_session_hash ~ '^[a-f0-9]{64}$';
$$;
revoke all on function public.lupa_session_state(text, text) from public, anon, authenticated;
grant execute on function public.lupa_session_state(text, text) to service_role;

-- Índice para a consulta acima (o unique existente começa por event_id, phase).
create index if not exists lupa_live_votes_by_session on public.lupa_live_votes(event_id, session_hash);
-- Índice para a limpeza de limites antigos de voto.
create index if not exists lupa_live_rate_limits_bucket on public.lupa_live_rate_limits(minute_bucket);
-- Índice para auditoria por organização (consultas de governança).
create index if not exists lupa_live_audit_by_org on public.lupa_live_audit(organization_id, created_at desc);

-- 3) Retenção: mantém a proteção de intervalo (1..365) e passa a limpar também lupa_rate_limits.
create or replace function public.lupa_cleanup_expired_records(retention_days integer default 30)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_events_deleted integer := 0;
 v_limits_deleted integer := 0;
 v_generic_deleted integer := 0;
begin
 if retention_days is null or retention_days < 1 or retention_days > 365 then
   raise exception 'RETENTION_DAYS_OUT_OF_RANGE' using errcode='22023';
 end if;

 delete from public.lupa_live_events
  where expires_at < (now() - make_interval(days => retention_days));
 get diagnostics v_events_deleted = row_count;
 delete from public.lupa_live_rate_limits
  where minute_bucket < (now() - interval '1 day');
 get diagnostics v_limits_deleted = row_count;
 delete from public.lupa_rate_limits
  where window_start < (now() - interval '2 days');
 get diagnostics v_generic_deleted = row_count;

 return jsonb_build_object(
  'events_deleted', v_events_deleted,
  'rate_limits_deleted', v_limits_deleted + v_generic_deleted,
  'executed_at', now()
 );
end;
$$;
revoke all on function public.lupa_cleanup_expired_records(integer) from public, anon, authenticated;
grant execute on function public.lupa_cleanup_expired_records(integer) to service_role;

comment on table public.lupa_rate_limits is 'Contadores de janela fixa com identificadores pseudonimizados (HMAC). Expurgo em 2 dias.';

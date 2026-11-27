-- LUPA 2026: Procedure para retenção automática e expurgo de dados efêmeros.
-- Atende aos requisitos de privacidade e ciclo de vida de sessões da auditoria Hack Brasil.

create or replace function public.lupa_cleanup_expired_records(retention_days integer default 30)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_events_deleted integer := 0;
  v_limits_deleted integer := 0;
begin
  -- Exclui sessões expiradas há mais do que retention_days (cascade limpa votos e feedback)
  delete from public.lupa_live_events
  where expires_at < (now() - (retention_days || ' days')::interval);
  get diagnostics v_events_deleted = row_count;

  -- Exclui registros de rate limit com mais de 24 horas
  delete from public.lupa_live_rate_limits
  where minute_bucket < (now() - interval '1 day');
  get diagnostics v_limits_deleted = row_count;

  return jsonb_build_object(
    'events_deleted', v_events_deleted,
    'rate_limits_deleted', v_limits_deleted,
    'executed_at', now()
  );
end;
$$;

revoke all on function public.lupa_cleanup_expired_records(integer) from public, anon, authenticated;
grant execute on function public.lupa_cleanup_expired_records(integer) to service_role;
comment on function public.lupa_cleanup_expired_records is 'Job de expurgo e retenção de sessões antigas e rate limits.';

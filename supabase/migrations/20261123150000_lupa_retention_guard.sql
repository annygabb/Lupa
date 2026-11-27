-- LUPA: reforço do contrato de expurgo. Aplicar SOMENTE em DB STAGING/PROD exclusivo,
-- após validar o status de migrações e o plano de backup/restore.
create or replace function public.lupa_cleanup_expired_records(retention_days integer default 30)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_events_deleted integer := 0;
 v_limits_deleted integer := 0;
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

 return jsonb_build_object(
  'events_deleted', v_events_deleted,
  'rate_limits_deleted', v_limits_deleted,
  'executed_at', now()
 );
end;
$$;
revoke all on function public.lupa_cleanup_expired_records(integer) from public, anon, authenticated;
grant execute on function public.lupa_cleanup_expired_records(integer) to service_role;

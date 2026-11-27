-- LUPA Live: canal de mudança de fase separado dos votos.
-- Reduz a avalanche de sinais de votação enviados a todos os participantes móveis.
-- Necessita a migration institucional de 13/11 e autorização do DB STAGING exclusivo.
create or replace function public.lupa_notify_event_change()
returns trigger language plpgsql security definer set search_path='' as $$
declare
  message jsonb;
begin
  message := jsonb_build_object('code',new.code,'kind','snapshot_updated');
  -- O telão e o gestor recebem o aviso para atualizar a distribuição agregada.
  begin
    perform realtime.send(message,'invalidate','live:'||new.code,false);
  exception when others then
    null;
  end;
  -- Os participantes recebem apenas mudanças de fase. Não recebem cada voto.
  begin
    perform realtime.send(message,'invalidate','live-phase:'||new.code,false);
  exception when others then
    null;
  end;
  return new;
end $$;
revoke all on function public.lupa_notify_event_change() from public,anon,authenticated;

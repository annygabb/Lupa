-- LUPA Live: esquema inicial isolado para PostgreSQL/Supabase.
-- Atenção: revisar e aplicar primeiro em staging EXCLUSIVO do LUPA.
-- Nenhuma execução desta migração foi efetuada nesta alteração de código.
create extension if not exists pgcrypto;

create table if not exists public.lupa_live_events (
 id uuid primary key default gen_random_uuid(),
 code text not null unique check (code ~ '^[A-F0-9]{12}$'),
 claim_id text not null check (claim_id ~ '^[a-z0-9-]{3,80}$'),
 title text not null check (char_length(title) between 8 and 140),
 question text not null check (char_length(question) between 10 and 500),
 choices jsonb not null check (jsonb_typeof(choices)='array' and jsonb_array_length(choices)=3),
 correct_index smallint not null default 1 check (correct_index between 0 and 2),
 post_question jsonb,
 phase text not null default 'pre' check (phase in ('pre','reveal','post','closed')),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now() + interval '2 hours'),
 constraint event_expiry_valid check (expires_at > created_at),
 constraint post_question_is_object check (post_question is null or jsonb_typeof(post_question) = 'object')
);

-- A migração deve tolerar base DEV/STAGING criada com a versão anterior.
alter table public.lupa_live_events add column if not exists post_question jsonb;
create index if not exists lupa_live_events_expires_at on public.lupa_live_events(expires_at);

create table if not exists public.lupa_live_votes (
 id bigint generated always as identity primary key,
 event_id uuid not null references public.lupa_live_events(id) on delete cascade,
 phase text not null check (phase in ('pre','post')),
 option_index smallint not null check (option_index between 0 and 2),
 session_hash text not null check (session_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(),
 unique(event_id,phase,session_hash)
);
create index if not exists lupa_live_votes_tally on public.lupa_live_votes(event_id,phase,option_index);

create table if not exists public.lupa_live_rate_limits (
 event_id uuid not null references public.lupa_live_events(id) on delete cascade,
 session_hash text not null check (session_hash ~ '^[a-f0-9]{64}$'),
 minute_bucket timestamptz not null,
 attempts integer not null default 0 check (attempts >= 0),
 primary key(event_id,session_hash,minute_bucket)
);
alter table public.lupa_live_events enable row level security;
alter table public.lupa_live_votes enable row level security;
alter table public.lupa_live_rate_limits enable row level security;
revoke all on public.lupa_live_events from public, anon, authenticated;
revoke all on public.lupa_live_votes from public, anon, authenticated;
revoke all on public.lupa_live_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.lupa_live_events to service_role;
grant select, insert, update, delete on public.lupa_live_votes to service_role;
grant select, insert, update, delete on public.lupa_live_rate_limits to service_role;
grant usage, select on sequence public.lupa_live_votes_id_seq to service_role;

-- Somente servidor privilegiado pode executar RPCs. Sem gabarito de pós até encerrar.
create or replace function public.lupa_event_snapshot(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
 select jsonb_build_object(
  'code',e.code, 'claimId',e.claim_id, 'title',e.title,
  'question',e.question, 'choices',e.choices,
  'phase',case when e.expires_at <= now() then 'closed' else e.phase end,
  'expiresAt',e.expires_at,
  'correctIndex',case when e.phase in ('reveal','post','closed') then e.correct_index else null end,
  'postQuestion',case
    when e.phase='closed' or e.expires_at <= now() then e.post_question
    when e.phase='post' then e.post_question - 'correctIndex' - 'explanation'
    else null end,
  'counts',coalesce((
    select jsonb_agg(jsonb_build_object('phase',v.phase,'optionIndex',v.option_index,'count',v.c))
    from (select phase, option_index, count(*)::integer as c
      from public.lupa_live_votes
      where event_id=e.id
      group by phase,option_index) v
   ),'[]'::jsonb)
 ) into result from public.lupa_live_events e where e.code=p_code;
 return result;
end $$;

create or replace function public.lupa_cast_vote(
 p_code text, p_phase text, p_option integer, p_session_hash text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_event public.lupa_live_events%rowtype;
 v_attempts integer;
 v_added integer;
begin
 if p_code is null or p_code !~ '^[A-F0-9]{12}$'
   or p_phase is null or p_phase not in ('pre','post')
   or p_option is null or p_option not between 0 and 2
   or p_session_hash is null or p_session_hash !~ '^[a-f0-9]{64}$' then
  return jsonb_build_object('accepted',false,'reason','INVALID_INPUT');
 end if;

 select * into v_event from public.lupa_live_events where code=p_code for share;
 if not found then
  return jsonb_build_object('accepted',false,'reason','NOT_FOUND');
 end if;
 if v_event.expires_at <= now() or v_event.phase <> p_phase then
  return jsonb_build_object('accepted',false,'reason','PHASE_UNAVAILABLE');
 end if;

 insert into public.lupa_live_rate_limits(event_id,session_hash,minute_bucket,attempts)
 values(v_event.id,p_session_hash,date_trunc('minute',now()),1)
 on conflict(event_id,session_hash,minute_bucket)
 do update set attempts=public.lupa_live_rate_limits.attempts+1
 returning attempts into v_attempts;
 if v_attempts > 8 then
  return jsonb_build_object('accepted',false,'reason','RATE_LIMIT');
 end if;

 insert into public.lupa_live_votes(event_id,phase,option_index,session_hash)
 values(v_event.id,p_phase,p_option,p_session_hash)
 on conflict(event_id,phase,session_hash) do nothing;
 get diagnostics v_added = row_count;
 return jsonb_build_object('accepted',v_added=1,'reason',
  case when v_added=1 then 'ACCEPTED' else 'ALREADY_VOTED' end);
end $$;

revoke all on function public.lupa_event_snapshot(text) from public, anon, authenticated;
revoke all on function public.lupa_cast_vote(text,text,integer,text) from public, anon, authenticated;
grant execute on function public.lupa_event_snapshot(text) to service_role;
grant execute on function public.lupa_cast_vote(text,text,integer,text) to service_role;

comment on table public.lupa_live_events is 'Sessões educacionais, não prontuários.';
comment on table public.lupa_live_votes is 'Votos pseudônimos, sem idade, peso ou sintomas.';
comment on table public.lupa_live_rate_limits is 'Limite efêmero, limpar por tarefa agendada.';

-- Política de retenção ainda depende de job aprovado:
-- delete from public.lupa_live_events where expires_at < now() - interval '30 days';
-- delete from public.lupa_live_rate_limits where minute_bucket < now() - interval '1 day';

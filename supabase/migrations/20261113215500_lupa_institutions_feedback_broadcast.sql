-- LUPA 2026: institutional tenancy, low-risk session feedback and sanitized Broadcast.
-- Requires: 20261111162000_lupa_live.sql, dedicated LUPA Supabase project.
-- DO NOT apply to another product's database; stage and verify before production.
-- This migration has NOT been executed against a remote project by this PR.

create table if not exists public.lupa_organizations (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 2 and 120),
 slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,60}$'),
 created_at timestamptz not null default now()
);

create table if not exists public.lupa_organization_members (
 organization_id uuid not null references public.lupa_organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('owner','admin','organizer','viewer','curator')),
 created_at timestamptz not null default now(),
 primary key(organization_id,user_id)
);
create index if not exists lupa_members_by_user on public.lupa_organization_members(user_id);

alter table public.lupa_live_events
 add column if not exists organization_id uuid references public.lupa_organizations(id),
 add column if not exists created_by uuid references auth.users(id),
 add column if not exists version bigint not null default 1;
create index if not exists lupa_live_events_by_org on public.lupa_live_events(organization_id,created_at desc);

-- An old unassigned event remains inaccessible to institutional management.
-- Assign it deliberately via a reviewed backfill; never guess ownership.
create table if not exists public.lupa_event_feedback (
 id bigint generated always as identity primary key,
 event_id uuid not null references public.lupa_live_events(id) on delete cascade,
 session_hash text not null check (session_hash ~ '^[a-f0-9]{64}$'),
 clarity smallint not null check (clarity between 1 and 5),
 usefulness smallint not null check (usefulness between 1 and 5),
 purpose_version text not null default 'experience-feedback-v1',
 created_at timestamptz not null default now(),
 unique(event_id,session_hash)
);
create index if not exists lupa_feedback_by_event on public.lupa_event_feedback(event_id);

create table if not exists public.lupa_live_audit (
 id bigint generated always as identity primary key,
 organization_id uuid not null references public.lupa_organizations(id),
 event_code text not null,
 actor_id uuid not null references auth.users(id),
 action text not null check (action in ('event_created','phase_advanced','event_deleted')),
 created_at timestamptz not null default now()
);

alter table public.lupa_organizations enable row level security;
alter table public.lupa_organization_members enable row level security;
alter table public.lupa_live_events enable row level security;
alter table public.lupa_live_votes enable row level security;
alter table public.lupa_event_feedback enable row level security;
alter table public.lupa_live_audit enable row level security;
alter table public.lupa_live_rate_limits enable row level security;

-- Privileged server key performs tenant RBAC checks in Next.js before every query.
-- Only the user's own membership can be read directly using an Auth JWT.
revoke all on public.lupa_organizations from public,anon,authenticated;
revoke all on public.lupa_organization_members from public,anon,authenticated;
revoke all on public.lupa_event_feedback from public,anon,authenticated;
revoke all on public.lupa_live_audit from public,anon,authenticated;

grant select on public.lupa_organization_members to authenticated;
drop policy if exists lupa_member_read_self on public.lupa_organization_members;
create policy lupa_member_read_self on public.lupa_organization_members
 for select to authenticated using ((select auth.uid()) = user_id);

grant select,insert,update,delete on public.lupa_organizations to service_role;
grant select,insert,update,delete on public.lupa_organization_members to service_role;
grant select,insert,update,delete on public.lupa_live_events to service_role;
grant select,insert,update,delete on public.lupa_live_votes to service_role;
grant select,insert,update,delete on public.lupa_event_feedback to service_role;
grant select,insert,update,delete on public.lupa_live_audit to service_role;
grant select,insert,update,delete on public.lupa_live_rate_limits to service_role;
grant usage,select on sequence public.lupa_event_feedback_id_seq to service_role;
grant usage,select on sequence public.lupa_live_audit_id_seq to service_role;

-- Snapshots of feedback have no participant IDs. Suppress small groups (<5).
create or replace function public.lupa_feedback_summary(p_code text)
returns jsonb language sql stable security invoker set search_path='' as $$
 select case when count(f.id) < 5
  then jsonb_build_object('total',count(f.id)::integer,'suppressed',true,
    'averageClarity',null,'averageUsefulness',null)
  else jsonb_build_object('total',count(f.id)::integer,'suppressed',false,
    'averageClarity',round(avg(f.clarity)::numeric,2),
    'averageUsefulness',round(avg(f.usefulness)::numeric,2))
 end
 from public.lupa_live_events e
 left join public.lupa_event_feedback f on f.event_id=e.id
 where e.code=p_code;
$$;
revoke all on function public.lupa_feedback_summary(text) from public,anon,authenticated;
grant execute on function public.lupa_feedback_summary(text) to service_role;

-- Broadcast only a generic invalidation signal. No votes, identifiers,
-- gabaritos, comments, health data or protected rows are broadcast.
-- Public subscription is acceptable ONLY because the payload is empty of
-- sensitive fields; clients still GET their own role-filtered snapshot.
create or replace function public.lupa_notify_event_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 begin
  perform realtime.send(
   jsonb_build_object('code',new.code,'kind','snapshot_updated'),
   'invalidate','live:'||new.code,false
  );
 exception when others then
  -- A Realtime outage must never roll back a durable DB change.
  null;
 end;
 return new;
end $$;
revoke all on function public.lupa_notify_event_change() from public,anon,authenticated;
drop trigger if exists lupa_notify_event_after_change on public.lupa_live_events;
create trigger lupa_notify_event_after_change
 after insert or update of phase on public.lupa_live_events
 for each row execute function public.lupa_notify_event_change();

create or replace function public.lupa_notify_vote_change()
returns trigger language plpgsql security definer set search_path='' as $$
declare event_code text;
begin
 select code into event_code from public.lupa_live_events where id=new.event_id;
 if event_code is null then return new; end if;
 begin
  perform realtime.send(
   jsonb_build_object('code',event_code,'kind','snapshot_updated'),
   'invalidate','live:'||event_code,false
  );
 exception when others then
  null;
 end;
 return new;
end $$;
revoke all on function public.lupa_notify_vote_change() from public,anon,authenticated;
drop trigger if exists lupa_notify_vote_after_insert on public.lupa_live_votes;
create trigger lupa_notify_vote_after_insert
 after insert on public.lupa_live_votes
 for each row execute function public.lupa_notify_vote_change();

-- Feedback only broadcasts a generic refresh event, never the submitted notes.
drop trigger if exists lupa_notify_feedback_after_insert on public.lupa_event_feedback;
create trigger lupa_notify_feedback_after_insert
 after insert on public.lupa_event_feedback
 for each row execute function public.lupa_notify_vote_change();

-- No persistent symptoms/medication data table: /relatos remains client-local
-- pending governance, specific legal basis and independent clinical/privacy review.
comment on table public.lupa_event_feedback is 'Optional feedback about educational experience only (1-5). No health/symptom reports.';
comment on table public.lupa_live_audit is 'Administrative actions without raw voter or health information.';

-- Example bootstrap: run manually only with verified Auth UUID and owner-approved
-- institution, in a dedicated LUPA project. Do not invent identifiers.
-- insert into public.lupa_organizations(name,slug) values ('Instituição','instituicao');
-- insert into public.lupa_organization_members(organization_id,user_id,role)
-- values ('<verified-org-uuid>','<verified-auth-user-uuid>','owner');

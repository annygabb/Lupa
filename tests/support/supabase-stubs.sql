-- STUBS MÍNIMOS dos objetos do Supabase usados pelas migrações (somente banco de TESTE).
-- Não são o Supabase real: auth.users só tem id; realtime.send grava em uma tabela.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users(id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to authenticated;
create schema if not exists realtime;
create table if not exists realtime.sent(id serial, payload jsonb, event text, topic text, private boolean, at timestamptz default now());
create or replace function realtime.send(payload jsonb, event text, topic text, private boolean) returns void
  language sql as $$ insert into realtime.sent(payload, event, topic, private) values ($1, $2, $3, $4) $$;
grant usage on schema realtime to service_role;
grant insert on realtime.sent to service_role;
grant usage, select on sequence realtime.sent_id_seq to service_role;
grant usage on schema public to anon, authenticated, service_role;

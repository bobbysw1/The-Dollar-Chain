-- The Dollar Chain — database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It creates the single table the app uses to store everything.

create table if not exists kv (
  key   text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- keep updated_at fresh on every write
create or replace function kv_touch() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists kv_touch_trigger on kv;
create trigger kv_touch_trigger before update on kv
  for each row execute function kv_touch();

-- The app connects with the service key (server-side only), so we lock the
-- table down: no public access. Nothing in the browser can read or write it.
alter table kv enable row level security;
-- (No policies = no access for anon/public keys. The service key bypasses RLS.)

-- Who changed what in the admin. Written and read only with the service-role key.
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  actor_id    text,
  actor_email text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  summary     text not null
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log (entity, created_at desc);

alter table public.audit_log enable row level security;

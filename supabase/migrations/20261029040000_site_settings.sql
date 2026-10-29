-- Editable store settings (key/value). Contains nothing secret: the storefront reads it
-- with the public key; only the service-role key (admin) can change it.
create table if not exists public.site_settings (
  key        text primary key check (key ~ '^[a-z0-9_]{1,60}$'),
  value      text not null check (char_length(value) <= 500),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings"
  on public.site_settings for select
  using (true);

-- Products catalogue. Writes go through the service-role key (bypasses RLS);
-- the public storefront may only read published rows.
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            text not null,
  price           numeric not null check (price >= 0),
  material        text not null,
  description     text,
  tag             text not null unique,
  category        text not null,
  status          text not null default 'Published' check (status in ('Published', 'Draft')),
  image_url       text not null,
  zoom_image_url  text not null default '',
  pillow_image_url text not null default '',
  created_at      timestamptz not null default now()
);

create index if not exists products_status_category_idx on public.products (status, category);
create index if not exists products_created_at_idx on public.products (created_at);

alter table public.products enable row level security;

create policy "Public can view published products"
  on public.products for select
  using (status = 'Published');

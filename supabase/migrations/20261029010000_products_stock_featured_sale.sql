-- Stock flag, homepage featuring/ordering and an optional sale price.
-- Every column has a default, so existing rows and running code keep working.
alter table public.products
  add column if not exists in_stock   boolean not null default true,
  add column if not exists featured   boolean not null default false,
  add column if not exists sort_order integer not null default 0,
  add column if not exists sale_price numeric;

alter table public.products
  drop constraint if exists products_sale_price_check;
alter table public.products
  add constraint products_sale_price_check
  check (sale_price is null or (sale_price >= 0 and sale_price < price));

create index if not exists products_featured_sort_idx
  on public.products (featured desc, sort_order, created_at);

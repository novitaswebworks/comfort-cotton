-- Orders placed through the WhatsApp checkout. Written and read only with the
-- service-role key (RLS is on with no policies, so the public API sees nothing).
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   bigint generated always as identity,
  status         text not null default 'New'
                 check (status in ('New', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
  customer_name  text,
  customer_phone text,
  items          jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  subtotal       numeric not null check (subtotal >= 0),
  admin_note     text,
  created_at     timestamptz not null default now()
);

create unique index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_phone_idx on public.orders (customer_phone) where customer_phone is not null;

alter table public.orders enable row level security;

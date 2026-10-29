-- Delivery address and payment tracking for orders. All columns are nullable or defaulted,
-- so existing orders and the running code keep working.
alter table public.orders
  add column if not exists customer_address text,
  add column if not exists customer_city    text,
  add column if not exists customer_pincode text,
  add column if not exists order_note       text,
  add column if not exists payment_method   text not null default 'UPI',
  add column if not exists payment_status   text not null default 'Unpaid',
  add column if not exists amount_due_now   numeric not null default 0,
  add column if not exists paid_at          timestamptz;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('UPI', 'COD'));

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('Unpaid', 'Advance paid', 'Paid', 'Refunded'));

alter table public.orders drop constraint if exists orders_pincode_check;
alter table public.orders add constraint orders_pincode_check
  check (customer_pincode is null or customer_pincode ~ '^[1-9][0-9]{5}$');

alter table public.orders drop constraint if exists orders_amount_due_now_check;
alter table public.orders add constraint orders_amount_due_now_check
  check (amount_due_now >= 0);

create index if not exists orders_payment_status_idx on public.orders (payment_status, created_at desc);

-- QA Studio AI PRO: tables are server-only; public API does not read financial rows.
create table if not exists public.qa_purchases(
  stripe_session_id text primary key,
  user_id uuid not null,
  plan text not null check(plan='christmas'),
  stripe_customer_id text,
  amount_czk integer not null check(amount_czk>=0),
  refunded boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.qa_subscriptions(
  stripe_subscription_id text primary key,
  user_id uuid not null,
  plan text not null check(plan in ('plus_month','plus_year')),
  stripe_customer_id text,
  status text not null,
  period_end timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists qa_subscriptions_user on public.qa_subscriptions(user_id);
create index if not exists qa_purchases_user on public.qa_purchases(user_id);
create table if not exists public.qa_transactions(
  stripe_event_source text primary key,
  user_id uuid not null,
  plan text not null,
  amount_czk integer not null,
  created_at timestamptz not null default now()
);
create table if not exists public.qa_webhook_events(
  event_id text primary key,
  processed_at timestamptz not null default now()
);
alter table public.qa_purchases enable row level security;
alter table public.qa_subscriptions enable row level security;
alter table public.qa_transactions enable row level security;
alter table public.qa_webhook_events enable row level security;
revoke all on public.qa_purchases from anon,authenticated;
revoke all on public.qa_subscriptions from anon,authenticated;
revoke all on public.qa_transactions from anon,authenticated;
revoke all on public.qa_webhook_events from anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit)
  values('qa-premium','qa-premium',false,52428800)
  on conflict(id) do update set public=false;
-- Do not define storage SELECT/INSERT policies for anon/authenticated.
-- The Edge Functions' service-role client may create short-lived signed URLs only after license checks.

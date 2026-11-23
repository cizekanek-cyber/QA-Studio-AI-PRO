alter table public.qa_purchases add column if not exists payment_intent_id text;
create index if not exists qa_purchases_pi on public.qa_purchases(payment_intent_id);

create table if not exists public.account_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  age_confirmed boolean not null check (age_confirmed),
  accepted_at timestamptz not null default now(),
  provider text not null
);

alter table public.account_consents enable row level security;
revoke all on table public.account_consents from anon;
grant select, insert on table public.account_consents to authenticated;

create policy "account_consents_select_own" on public.account_consents
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "account_consents_insert_own" on public.account_consents
  for insert to authenticated
  with check (user_id = (select auth.uid()));

notify pgrst, 'reload schema';

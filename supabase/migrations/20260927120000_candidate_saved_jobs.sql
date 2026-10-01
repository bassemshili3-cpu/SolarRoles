-- Saved job IDs refer to jobs in the separate SolarRoles application database.
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id text not null,
  created_at timestamptz not null default now(),
  constraint saved_jobs_user_job_unique unique (user_id, job_id)
);

create index if not exists saved_jobs_user_created_idx
  on public.saved_jobs (user_id, created_at desc);

alter table public.saved_jobs enable row level security;

revoke all on table public.saved_jobs from anon;
grant select, insert, delete on table public.saved_jobs to authenticated;

drop policy if exists "saved_jobs_select_own" on public.saved_jobs;
create policy "saved_jobs_select_own" on public.saved_jobs
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "saved_jobs_insert_own" on public.saved_jobs;
create policy "saved_jobs_insert_own" on public.saved_jobs
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "saved_jobs_delete_own" on public.saved_jobs;
create policy "saved_jobs_delete_own" on public.saved_jobs
  for delete to authenticated
  using (user_id = (select auth.uid()));

notify pgrst, 'reload schema';

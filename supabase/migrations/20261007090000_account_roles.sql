-- Preserve explicit historical roles; review ambiguous users before deployment.
create table public.account_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('candidate','employer')),
 created_at timestamptz not null default now()
);
alter table public.account_roles enable row level security;
revoke all on public.account_roles from anon, authenticated;
grant select on public.account_roles to authenticated;
create policy account_roles_read_own on public.account_roles for select to authenticated using (user_id = (select auth.uid()));
insert into public.account_roles(user_id,role)
 select id, raw_user_meta_data->>'accountType' from auth.users where raw_user_meta_data->>'accountType' in ('candidate','employer');
create function public.has_account_role(required_role text) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.account_roles r join public.account_consents c on c.user_id=r.user_id where r.user_id = auth.uid() and r.role = required_role)
$$;
revoke all on function public.has_account_role(text) from public;
grant execute on function public.has_account_role(text) to authenticated;
create function public.initialize_solarroles_account() returns trigger
language plpgsql security definer set search_path = '' as $$
declare c jsonb := new.raw_user_meta_data->'consent'; r text := new.raw_user_meta_data->>'accountType';
begin
 if new.raw_app_meta_data->>'provider' = 'email' then
  -- Keep the current production signup working during deployment.
  -- Its identity receives no candidate/employer permissions until consent exists.
  if c is null then
   if r in ('candidate','employer') then
    insert into public.account_roles(user_id,role) values(new.id,r);
   end if;
   return new;
  end if;
  if r not in ('candidate','employer') or r is null or c is null or
    c->'ageConfirmed' is distinct from 'true'::jsonb or c->'termsAccepted' is distinct from 'true'::jsonb or c->'privacyAcknowledged' is distinct from 'true'::jsonb or
    c->>'termsVersion' is distinct from '2026-05-18' or c->>'privacyVersion' is distinct from '2026-03-03' then
   raise exception 'Account requirements must be accepted before signup';
  end if;
  insert into public.account_roles(user_id,role) values(new.id,r);
  insert into public.account_consents(user_id,terms_version,privacy_version,age_confirmed,provider)
   values(new.id,'2026-05-18','2026-03-03',true,'email');
 end if;
 return new;
end $$;
create trigger solarroles_account_created after insert on auth.users for each row execute function public.initialize_solarroles_account();
-- OAuth creates the identity first. This atomic setup cannot change a role.
create function public.complete_account_setup(chosen_role text, age_confirmed boolean, terms_accepted boolean, privacy_acknowledged boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null or chosen_role not in ('candidate','employer') or chosen_role is null or age_confirmed is distinct from true or terms_accepted is distinct from true or privacy_acknowledged is distinct from true then
  raise exception 'Invalid account requirements';
 end if;
 insert into public.account_roles(user_id,role) values(auth.uid(),chosen_role) on conflict (user_id) do nothing;
 insert into public.account_consents(user_id,terms_version,privacy_version,age_confirmed,provider)
  select auth.uid(),'2026-05-18','2026-03-03',true,coalesce(raw_app_meta_data->>'provider','email') from auth.users where id=auth.uid()
  on conflict (user_id) do nothing;
end $$;
revoke all on function public.complete_account_setup(text,boolean,boolean,boolean) from public;
grant execute on function public.complete_account_setup(text,boolean,boolean,boolean) to authenticated;
drop policy if exists saved_jobs_select_own on public.saved_jobs;
create policy saved_jobs_select_own on public.saved_jobs for select to authenticated using (user_id=auth.uid() and public.has_account_role('candidate'));
drop policy if exists saved_jobs_insert_own on public.saved_jobs;
create policy saved_jobs_insert_own on public.saved_jobs for insert to authenticated with check (user_id=auth.uid() and public.has_account_role('candidate'));
-- Historical saved jobs remain deletable by their owner.
drop policy if exists candidate_resumes_insert on storage.objects;
create policy candidate_resumes_insert on storage.objects for insert to authenticated with check (bucket_id='resumes' and (storage.foldername(name))[1]=auth.uid()::text and public.has_account_role('candidate'));
notify pgrst, 'reload schema';

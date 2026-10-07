-- Apply after deploying the consent-aware signup API.
create or replace function public.initialize_solarroles_account() returns trigger
language plpgsql security definer set search_path = '' as $$
declare c jsonb := new.raw_user_meta_data->'consent'; r text := new.raw_user_meta_data->>'accountType';
begin
 if new.raw_app_meta_data->>'provider' = 'email' then
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

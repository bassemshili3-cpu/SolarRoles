-- Candidate resume storage for the project used by NEXT_PUBLIC_SUPABASE_URL.
-- Resumes are private; each signed-in user may access only their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "candidate_resumes_select" on storage.objects;
create policy "candidate_resumes_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Previous dashboard uploads were stored under public/<user id>-... .
drop policy if exists "candidate_resumes_legacy_select" on storage.objects;
create policy "candidate_resumes_legacy_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = 'public'
    and storage.filename(name) like ((select auth.uid())::text || '-%')
  );

drop policy if exists "candidate_resumes_insert" on storage.objects;
create policy "candidate_resumes_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

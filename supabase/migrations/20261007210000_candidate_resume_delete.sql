-- Users may remove only their own current and legacy resume uploads.
drop policy if exists "candidate_resumes_delete" on storage.objects;
create policy "candidate_resumes_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'resumes'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (
        (storage.foldername(name))[1] = 'public'
        and storage.filename(name) like ((select auth.uid())::text || '-%')
      )
    )
  );

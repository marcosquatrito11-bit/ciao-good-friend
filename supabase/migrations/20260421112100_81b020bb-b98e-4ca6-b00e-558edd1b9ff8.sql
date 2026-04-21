
-- 1) search_path su funzioni
create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- 2) Restringe il listing dei bucket pubblici
-- Sostituisci le SELECT policy "tutti possono SELECT" con: solo proprietario può listare;
-- l'accesso pubblico in lettura ai file resta tramite URL pubblico /object/public/...
drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "exp_imgs_public_read" on storage.objects;

create policy "avatars_owner_list" on storage.objects for select using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "exp_imgs_owner_list" on storage.objects for select using (
  bucket_id = 'experiences' and auth.uid()::text = (storage.foldername(name))[1]
);

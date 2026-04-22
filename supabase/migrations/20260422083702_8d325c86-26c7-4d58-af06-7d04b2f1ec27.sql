
-- Storage policies for "experiences" bucket (public read, guide write in own folder)
CREATE POLICY "experiences_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'experiences');

CREATE POLICY "experiences_guide_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'experiences'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "experiences_guide_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'experiences'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "experiences_guide_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'experiences'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experiences_status ON public.experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON public.experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_guide ON public.experiences(guide_id);
CREATE INDEX IF NOT EXISTS idx_experience_dates_exp ON public.experience_dates(experience_id, starts_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_experiences_slug ON public.experiences(slug) WHERE slug IS NOT NULL;

-- Trigger updated_at on experiences
DROP TRIGGER IF EXISTS trg_experiences_updated_at ON public.experiences;
CREATE TRIGGER trg_experiences_updated_at
BEFORE UPDATE ON public.experiences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Applied remotely via Supabase MCP (SelectCars).
-- Documents: storage buckets and object policies.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('vehicle-images', 'vehicle-images', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('vehicle-documents', 'vehicle-documents', false, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY vehicle_images_public_read ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'vehicle-images');

CREATE POLICY vehicle_images_staff_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-images' AND public.is_staff());

CREATE POLICY vehicle_images_staff_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'vehicle-images' AND public.is_staff())
  WITH CHECK (bucket_id = 'vehicle-images' AND public.is_staff());

CREATE POLICY vehicle_images_staff_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-images' AND public.is_staff());

CREATE POLICY vehicle_documents_staff_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vehicle-documents' AND public.is_staff());

CREATE POLICY vehicle_documents_staff_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-documents' AND public.is_staff());

CREATE POLICY vehicle_documents_staff_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'vehicle-documents' AND public.is_staff())
  WITH CHECK (bucket_id = 'vehicle-documents' AND public.is_staff());

CREATE POLICY vehicle_documents_staff_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-documents' AND public.is_staff());

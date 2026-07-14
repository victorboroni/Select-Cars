-- SELECTCARS — Storage buckets + policies (alinhado à produção)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'vehicle-images',
    'vehicle-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']::text[]
  ),
  (
    'vehicle-documents',
    'vehicle-documents',
    false,
    20971520,
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[]
  )
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "vehicle_images_staff_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vehicle-images' AND public.is_staff());

CREATE POLICY "vehicle_images_staff_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-images' AND public.is_staff());

CREATE POLICY "vehicle_images_staff_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'vehicle-images' AND public.is_staff())
  WITH CHECK (bucket_id = 'vehicle-images' AND public.is_staff());

CREATE POLICY "vehicle_images_staff_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-images' AND public.is_staff());

CREATE POLICY "vehicle_documents_staff_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vehicle-documents' AND public.is_staff());

CREATE POLICY "vehicle_documents_staff_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-documents' AND public.is_staff());

CREATE POLICY "vehicle_documents_staff_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'vehicle-documents' AND public.is_staff())
  WITH CHECK (bucket_id = 'vehicle-documents' AND public.is_staff());

CREATE POLICY "vehicle_documents_staff_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-documents' AND public.is_staff());

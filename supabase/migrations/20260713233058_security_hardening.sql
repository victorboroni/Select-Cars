-- Documents remote hardening applied as 20260713233058_security_hardening.
-- contact_events public INSERT was later removed by
-- 20260714010000_fix_privilege_escalation_grants_contact.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_vehicle_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'Publicado' THEN
      NEW.published_at = COALESCE(NEW.published_at, now());
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status = 'Publicado' AND OLD.status IS DISTINCT FROM 'Publicado' THEN
    NEW.published_at = COALESCE(NEW.published_at, now());
  END IF;
  IF NEW.status <> 'Publicado' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon;

-- Public object URLs remain available via bucket public=true;
-- listing via storage.objects requires staff.
DROP POLICY IF EXISTS "vehicle_images_public_read" ON storage.objects;

DROP POLICY IF EXISTS "vehicle_images_staff_read" ON storage.objects;
CREATE POLICY "vehicle_images_staff_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vehicle-images' AND public.is_staff());

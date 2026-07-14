-- SELECTCARS — RLS + helpers de autorização (baseline alinhado à produção)

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('ADMIN', 'LOJISTA')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
  );
$$;

REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.protect_users_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'users.id cannot be changed';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'users.role can only be changed by an admin';
  END IF;

  IF NEW.email IS DISTINCT FROM OLD.email AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'users.email can only be changed by an admin';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_protect_immutable_fields ON public.users;
CREATE TRIGGER users_protect_immutable_fields
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_users_immutable_fields();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_or_staff"
  ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff());

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      id = auth.uid()
      AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
      AND email = (SELECT u.email FROM public.users u WHERE u.id = auth.uid())
    )
  );

CREATE POLICY "vehicles_public_read_published"
  ON public.vehicles FOR SELECT TO anon, authenticated
  USING (status = 'Publicado' OR public.is_staff());

CREATE POLICY "vehicles_staff_insert"
  ON public.vehicles FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "vehicles_staff_update"
  ON public.vehicles FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "vehicles_staff_delete"
  ON public.vehicles FOR DELETE TO authenticated
  USING (public.is_staff());

CREATE POLICY "vehicle_specs_public_read"
  ON public.vehicle_specs FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles v
      WHERE v.id = vehicle_id
        AND (v.status = 'Publicado' OR public.is_staff())
    )
  );

CREATE POLICY "vehicle_specs_staff_insert"
  ON public.vehicle_specs FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "vehicle_specs_staff_update"
  ON public.vehicle_specs FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "vehicle_specs_staff_delete"
  ON public.vehicle_specs FOR DELETE TO authenticated
  USING (public.is_staff());

CREATE POLICY "vehicle_highlights_public_read"
  ON public.vehicle_highlights FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles v
      WHERE v.id = vehicle_id
        AND (v.status = 'Publicado' OR public.is_staff())
    )
  );

CREATE POLICY "vehicle_highlights_staff_insert"
  ON public.vehicle_highlights FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "vehicle_highlights_staff_update"
  ON public.vehicle_highlights FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "vehicle_highlights_staff_delete"
  ON public.vehicle_highlights FOR DELETE TO authenticated
  USING (public.is_staff());

CREATE POLICY "vehicle_media_public_read"
  ON public.vehicle_media FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles v
      WHERE v.id = vehicle_id
        AND (v.status = 'Publicado' OR public.is_staff())
    )
  );

CREATE POLICY "vehicle_media_staff_insert"
  ON public.vehicle_media FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "vehicle_media_staff_update"
  ON public.vehicle_media FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "vehicle_media_staff_delete"
  ON public.vehicle_media FOR DELETE TO authenticated
  USING (public.is_staff());

CREATE POLICY "vehicle_documents_public_read"
  ON public.vehicle_documents FOR SELECT TO anon, authenticated
  USING (
    (
      is_public = true
      AND EXISTS (
        SELECT 1 FROM public.vehicles v
        WHERE v.id = vehicle_id AND v.status = 'Publicado'
      )
    )
    OR public.is_staff()
  );

CREATE POLICY "vehicle_documents_staff_insert"
  ON public.vehicle_documents FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "vehicle_documents_staff_update"
  ON public.vehicle_documents FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "vehicle_documents_staff_delete"
  ON public.vehicle_documents FOR DELETE TO authenticated
  USING (public.is_staff());

CREATE POLICY "contact_events_staff_select"
  ON public.contact_events FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "contact_events_staff_delete"
  ON public.contact_events FOR DELETE TO authenticated
  USING (public.is_staff());

GRANT SELECT ON TABLE public.vehicles TO anon, authenticated;
GRANT SELECT ON TABLE public.vehicle_specs TO anon, authenticated;
GRANT SELECT ON TABLE public.vehicle_highlights TO anon, authenticated;
GRANT SELECT ON TABLE public.vehicle_media TO anon, authenticated;
GRANT SELECT ON TABLE public.vehicle_documents TO anon, authenticated;

GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vehicle_specs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vehicle_highlights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vehicle_media TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vehicle_documents TO authenticated;
GRANT SELECT, DELETE ON TABLE public.contact_events TO authenticated;

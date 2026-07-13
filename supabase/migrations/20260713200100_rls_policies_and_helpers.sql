-- Applied remotely via Supabase MCP (SelectCars).
-- Documents: helper functions, auth trigger, RLS policies.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'LOJISTA')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_vehicle_published_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'Publicado' AND (OLD.status IS DISTINCT FROM 'Publicado' OR NEW.published_at IS NULL) THEN
    NEW.published_at = COALESCE(NEW.published_at, now());
  ELSIF NEW.status <> 'Publicado' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER vehicles_set_published_at
  BEFORE INSERT OR UPDATE OF status, published_at ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_vehicle_published_at();

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'LOJISTA')
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
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'ADMIN'
  );
$$;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.contact_events TO anon, authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff());
CREATE POLICY users_update_own ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY vehicles_public_read ON public.vehicles FOR SELECT TO anon, authenticated
  USING (status = 'Publicado');
CREATE POLICY vehicles_staff_all ON public.vehicles FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY vehicle_specs_public_read ON public.vehicle_specs FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.status = 'Publicado'));
CREATE POLICY vehicle_specs_staff_all ON public.vehicle_specs FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY vehicle_highlights_public_read ON public.vehicle_highlights FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.status = 'Publicado'));
CREATE POLICY vehicle_highlights_staff_all ON public.vehicle_highlights FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY vehicle_media_public_read ON public.vehicle_media FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.status = 'Publicado'));
CREATE POLICY vehicle_media_staff_all ON public.vehicle_media FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY vehicle_documents_public_read ON public.vehicle_documents FOR SELECT TO anon, authenticated
  USING (is_public AND EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.status = 'Publicado'));
CREATE POLICY vehicle_documents_staff_all ON public.vehicle_documents FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY contact_events_insert ON public.contact_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY contact_events_staff_read ON public.contact_events FOR SELECT TO authenticated
  USING (public.is_staff());

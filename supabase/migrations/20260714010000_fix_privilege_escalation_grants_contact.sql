-- C-02 / C-03 / M-01 / M-06 — privilege escalation, contact_events, least privilege
-- Requires prior migration: 20260714005000_add_user_role_sem_acesso

ALTER TABLE public.users
  ALTER COLUMN role SET DEFAULT 'SEM_ACESSO'::public.user_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
  -- Never trust client-controlled metadata for authorization.
  -- First ADMIN bootstrap is refined in 20260714020000_first_user_becomes_admin.
  IF NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.role = 'ADMIN'
  ) THEN
    assigned_role := 'ADMIN';
  ELSE
    assigned_role := 'SEM_ACESSO';
  END IF;

  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    assigned_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

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

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      id = auth.uid()
      AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
      AND email = (SELECT u.email FROM public.users u WHERE u.id = auth.uid())
    )
  );

DROP POLICY IF EXISTS contact_events_anyone_insert ON public.contact_events;
DROP POLICY IF EXISTS contact_events_insert ON public.contact_events;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

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

REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_vehicle_published_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.protect_users_immutable_fields() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.protect_users_immutable_fields() FROM anon, authenticated;

-- First registered Auth user becomes ADMIN; later users get SEM_ACESSO.
-- Role is never taken from client metadata.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.role = 'ADMIN'
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

-- Public bootstrap hint for the /admin signup UI (does not expose PII).
CREATE OR REPLACE FUNCTION public.needs_admin_bootstrap()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.role = 'ADMIN'
  );
$$;

REVOKE ALL ON FUNCTION public.needs_admin_bootstrap() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.needs_admin_bootstrap() TO anon, authenticated;

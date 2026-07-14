-- SELECTCARS — schema inicial (enums, tables, indexes, triggers)
-- Alinhado ao estado remoto + correções de segurança posteriores.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.vehicle_status AS ENUM ('Publicado', 'Pausado', 'Rascunho');
CREATE TYPE public.badge AS ENUM ('RARO', 'ULTIMA_UNIDADE', 'NOVO', 'RESERVADO', 'EDICAO_LIMITADA');
CREATE TYPE public.category AS ENUM ('Esportivos', 'Classicos', 'SUV_Premium', 'Edicoes_Limitadas', 'Recem_Chegados');
CREATE TYPE public.body AS ENUM ('Coupe', 'Sedan', 'GT', 'Conversivel', 'SUV');
CREATE TYPE public.gearbox AS ENUM ('PDK', 'DCT', 'Automatico');
CREATE TYPE public.fuel AS ENUM ('Gasolina', 'Hibrido');
CREATE TYPE public.media_type AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'LOJISTA', 'SEM_ACESSO');

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

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text,
  role public.user_role NOT NULL DEFAULT 'SEM_ACESSO',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  brand text NOT NULL,
  model text NOT NULL,
  version text,
  year integer NOT NULL,
  km integer NOT NULL,
  owners integer NOT NULL DEFAULT 1,
  provenance text,
  color text NOT NULL,
  category public.category NOT NULL,
  body public.body NOT NULL,
  gearbox public.gearbox NOT NULL,
  fuel public.fuel NOT NULL,
  price numeric(14, 2),
  price_on_request boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  badge public.badge,
  description text NOT NULL,
  status public.vehicle_status NOT NULL DEFAULT 'Rascunho',
  published_at timestamptz,
  created_by_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicles_price_or_request_chk CHECK (
    (price IS NULL AND price_on_request = true)
    OR (price IS NOT NULL AND price_on_request = false)
    OR (price IS NULL AND price_on_request = false)
  )
);

CREATE INDEX vehicles_status_idx ON public.vehicles (status);
CREATE INDEX vehicles_category_idx ON public.vehicles (category);
CREATE INDEX vehicles_brand_idx ON public.vehicles (brand);
CREATE INDEX vehicles_price_idx ON public.vehicles (price);
CREATE INDEX vehicles_km_idx ON public.vehicles (km);
CREATE INDEX vehicles_created_at_idx ON public.vehicles (created_at);

CREATE TRIGGER vehicles_set_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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

CREATE TRIGGER vehicles_set_published_at
  BEFORE INSERT OR UPDATE OF status ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_vehicle_published_at();

CREATE TABLE public.vehicle_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine text NOT NULL,
  top_speed text NOT NULL,
  transmission text NOT NULL,
  fuel_detail text NOT NULL,
  horsepower integer,
  acceleration text,
  torque text,
  drivetrain text,
  seats integer,
  doors integer,
  weight_kg integer,
  length_mm integer,
  width_mm integer,
  height_mm integer,
  vehicle_id uuid NOT NULL UNIQUE REFERENCES public.vehicles (id) ON DELETE CASCADE
);

CREATE TABLE public.vehicle_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles (id) ON DELETE CASCADE
);

CREATE INDEX vehicle_highlights_vehicle_order_idx
  ON public.vehicle_highlights (vehicle_id, "order");

CREATE TABLE public.vehicle_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.media_type NOT NULL DEFAULT 'IMAGE',
  url text NOT NULL,
  alt_text text,
  is_cover boolean NOT NULL DEFAULT false,
  is_hero boolean NOT NULL DEFAULT false,
  "order" integer NOT NULL DEFAULT 0,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX vehicle_media_vehicle_order_idx
  ON public.vehicle_media (vehicle_id, "order");

CREATE TABLE public.vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles (id) ON DELETE CASCADE
);

CREATE TABLE public.contact_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  source text,
  user_agent text,
  ip text,
  vehicle_id uuid REFERENCES public.vehicles (id) ON DELETE SET NULL,
  registered_by_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_events_vehicle_id_idx ON public.contact_events (vehicle_id);
CREATE INDEX contact_events_created_at_idx ON public.contact_events (created_at);

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

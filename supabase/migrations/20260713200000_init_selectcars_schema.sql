-- Applied remotely via Supabase MCP (SelectCars).
-- Documents: init schema (enums, tables, indexes, updated_at triggers).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.vehicle_status AS ENUM ('Publicado', 'Pausado', 'Rascunho');
CREATE TYPE public.badge AS ENUM ('RARO', 'ULTIMA_UNIDADE', 'NOVO', 'RESERVADO', 'EDICAO_LIMITADA');
CREATE TYPE public.category AS ENUM ('Esportivos', 'Classicos', 'SUV_Premium', 'Edicoes_Limitadas', 'Recem_Chegados');
CREATE TYPE public.body AS ENUM ('Coupe', 'Sedan', 'GT', 'Conversivel', 'SUV');
CREATE TYPE public.gearbox AS ENUM ('PDK', 'DCT', 'Automatico');
CREATE TYPE public.fuel AS ENUM ('Gasolina', 'Hibrido');
CREATE TYPE public.media_type AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'LOJISTA');

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text,
  role public.user_role NOT NULL DEFAULT 'LOJISTA',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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
  price numeric,
  price_on_request boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  badge public.badge,
  description text NOT NULL,
  status public.vehicle_status NOT NULL DEFAULT 'Rascunho',
  published_at timestamptz,
  created_by_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX vehicles_status_idx ON public.vehicles (status);
CREATE INDEX vehicles_category_idx ON public.vehicles (category);
CREATE INDEX vehicles_brand_idx ON public.vehicles (brand);
CREATE INDEX vehicles_price_idx ON public.vehicles (price);
CREATE INDEX vehicles_km_idx ON public.vehicles (km);
CREATE INDEX vehicles_created_at_idx ON public.vehicles (created_at);

CREATE TABLE public.vehicle_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL UNIQUE REFERENCES public.vehicles (id) ON DELETE CASCADE,
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
  height_mm integer
);

CREATE TABLE public.vehicle_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles (id) ON DELETE CASCADE,
  text text NOT NULL,
  "order" integer NOT NULL DEFAULT 0
);

CREATE INDEX vehicle_highlights_vehicle_order_idx ON public.vehicle_highlights (vehicle_id, "order");

CREATE TABLE public.vehicle_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles (id) ON DELETE CASCADE,
  type public.media_type NOT NULL DEFAULT 'IMAGE',
  url text NOT NULL,
  alt_text text,
  is_cover boolean NOT NULL DEFAULT false,
  is_hero boolean NOT NULL DEFAULT false,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX vehicle_media_vehicle_order_idx ON public.vehicle_media (vehicle_id, "order");

CREATE TABLE public.vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles (id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  uploaded_at timestamptz NOT NULL DEFAULT now()
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

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER vehicles_set_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

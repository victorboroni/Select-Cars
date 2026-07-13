import type {
  Badge,
  Body,
  Category,
  Fuel,
  Gearbox,
  Vehicle,
  VehicleStatus,
} from "../data/vehicles";

export type DbBadge =
  | "RARO"
  | "ULTIMA_UNIDADE"
  | "NOVO"
  | "RESERVADO"
  | "EDICAO_LIMITADA";

export type DbCategory =
  | "Esportivos"
  | "Classicos"
  | "SUV_Premium"
  | "Edicoes_Limitadas"
  | "Recem_Chegados";

export type DbBody = "Coupe" | "Sedan" | "GT" | "Conversivel" | "SUV";
export type DbGearbox = "PDK" | "DCT" | "Automatico";
export type DbFuel = "Gasolina" | "Hibrido";

const badgeToUi: Record<DbBadge, Badge> = {
  RARO: "RARO",
  ULTIMA_UNIDADE: "ÚLTIMA UNIDADE",
  NOVO: "NOVO",
  RESERVADO: "RESERVADO",
  EDICAO_LIMITADA: "EDIÇÃO LIMITADA",
};

const badgeToDb: Record<Badge, DbBadge> = {
  RARO: "RARO",
  "ÚLTIMA UNIDADE": "ULTIMA_UNIDADE",
  NOVO: "NOVO",
  RESERVADO: "RESERVADO",
  "EDIÇÃO LIMITADA": "EDICAO_LIMITADA",
};

const categoryToUi: Record<DbCategory, Category> = {
  Esportivos: "Esportivos",
  Classicos: "Clássicos",
  SUV_Premium: "SUV Premium",
  Edicoes_Limitadas: "Edições limitadas",
  Recem_Chegados: "Recém-chegados",
};

const categoryToDb: Record<Category, DbCategory> = {
  Esportivos: "Esportivos",
  Clássicos: "Classicos",
  "SUV Premium": "SUV_Premium",
  "Edições limitadas": "Edicoes_Limitadas",
  "Recém-chegados": "Recem_Chegados",
};

const bodyToUi: Record<DbBody, Body> = {
  Coupe: "Coupé",
  Sedan: "Sedan",
  GT: "GT",
  Conversivel: "Conversível",
  SUV: "SUV",
};

const bodyToDb: Record<Body, DbBody> = {
  Coupé: "Coupe",
  Sedan: "Sedan",
  GT: "GT",
  Conversível: "Conversivel",
  SUV: "SUV",
};

const gearboxToUi: Record<DbGearbox, Gearbox> = {
  PDK: "PDK",
  DCT: "DCT",
  Automatico: "Automático",
};

const gearboxToDb: Record<Gearbox, DbGearbox> = {
  PDK: "PDK",
  DCT: "DCT",
  Automático: "Automatico",
};

const fuelToUi: Record<DbFuel, Fuel> = {
  Gasolina: "Gasolina",
  Hibrido: "Híbrido",
};

const fuelToDb: Record<Fuel, DbFuel> = {
  Gasolina: "Gasolina",
  Híbrido: "Hibrido",
};

export interface DbVehicleRow {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  km: number;
  owners: number;
  provenance: string | null;
  color: string;
  category: DbCategory;
  body: DbBody;
  gearbox: DbGearbox;
  fuel: DbFuel;
  price: number | string | null;
  price_on_request: boolean;
  available: boolean;
  badge: DbBadge | null;
  description: string;
  status: VehicleStatus;
  published_at: string | null;
  created_at: string;
  vehicle_specs: Array<{
    engine: string;
    top_speed: string;
    transmission: string;
    fuel_detail: string;
  }> | null;
  vehicle_highlights: Array<{ text: string; order: number }> | null;
  vehicle_media: Array<{
    url: string;
    alt_text: string | null;
    is_cover: boolean;
    is_hero: boolean;
    order: number;
  }> | null;
}

export function mapDbVehicleToUi(row: DbVehicleRow): Vehicle {
  const media = [...(row.vehicle_media ?? [])].sort((a, b) => a.order - b.order);
  const cover = media.find((m) => m.is_cover) ?? media[0];
  const hero = media.find((m) => m.is_hero);
  const spec = row.vehicle_specs?.[0];
  const highlights = [...(row.vehicle_highlights ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((h) => h.text);

  const price =
    row.price_on_request || row.price === null || row.price === undefined
      ? null
      : Number(row.price);

  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    km: row.km,
    color: row.color,
    category: categoryToUi[row.category],
    body: bodyToUi[row.body],
    gearbox: gearboxToUi[row.gearbox],
    fuel: fuelToUi[row.fuel],
    badge: row.badge ? badgeToUi[row.badge] : undefined,
    price,
    available: row.available,
    description: row.description,
    image: cover?.url ?? "",
    heroImage: hero?.url,
    status: row.status,
    createdAt: row.created_at,
    version: row.version ?? undefined,
    owners: row.owners,
    provenance: row.provenance ?? undefined,
    specs: {
      engine: spec?.engine ?? "",
      topSpeed: spec?.top_speed ?? "",
      transmission: spec?.transmission ?? "",
      fuel: spec?.fuel_detail ?? "",
    },
    highlights,
  };
}

export function toDbEnums(vehicle: Vehicle) {
  return {
    category: categoryToDb[vehicle.category],
    body: bodyToDb[vehicle.body],
    gearbox: gearboxToDb[vehicle.gearbox],
    fuel: fuelToDb[vehicle.fuel],
    badge: vehicle.badge ? badgeToDb[vehicle.badge] : null,
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

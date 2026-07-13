import type { Vehicle, VehicleStatus } from "../data/vehicles";
import { supabase } from "../lib/supabase";
import {
  DbVehicleRow,
  mapDbVehicleToUi,
  slugify,
  toDbEnums,
} from "../lib/vehicle-mappers";

const VEHICLE_SELECT = `
  id,
  slug,
  brand,
  model,
  version,
  year,
  km,
  owners,
  provenance,
  color,
  category,
  body,
  gearbox,
  fuel,
  price,
  price_on_request,
  available,
  badge,
  description,
  status,
  published_at,
  created_at,
  vehicle_specs ( engine, top_speed, transmission, fuel_detail ),
  vehicle_highlights ( text, order ),
  vehicle_media ( url, alt_text, is_cover, is_hero, order )
`;

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as DbVehicleRow[]).map(mapDbVehicleToUi);
}

async function replaceChildren(vehicleId: string, vehicle: Vehicle) {
  const [{ error: specDeleteError }, { error: highlightDeleteError }, { error: mediaDeleteError }] =
    await Promise.all([
      supabase.from("vehicle_specs").delete().eq("vehicle_id", vehicleId),
      supabase.from("vehicle_highlights").delete().eq("vehicle_id", vehicleId),
      supabase.from("vehicle_media").delete().eq("vehicle_id", vehicleId),
    ]);

  if (specDeleteError) throw specDeleteError;
  if (highlightDeleteError) throw highlightDeleteError;
  if (mediaDeleteError) throw mediaDeleteError;

  const { error: specError } = await supabase.from("vehicle_specs").insert({
    vehicle_id: vehicleId,
    engine: vehicle.specs.engine,
    top_speed: vehicle.specs.topSpeed,
    transmission: vehicle.specs.transmission,
    fuel_detail: vehicle.specs.fuel,
  });
  if (specError) throw specError;

  if (vehicle.highlights.length) {
    const { error: highlightError } = await supabase
      .from("vehicle_highlights")
      .insert(
        vehicle.highlights.map((text, order) => ({
          vehicle_id: vehicleId,
          text,
          order,
        }))
      );
    if (highlightError) throw highlightError;
  }

  const mediaRows = [];
  if (vehicle.image) {
    mediaRows.push({
      vehicle_id: vehicleId,
      type: "IMAGE" as const,
      url: vehicle.image,
      alt_text: `${vehicle.brand} ${vehicle.model}`,
      is_cover: true,
      is_hero: !vehicle.heroImage,
      order: 0,
    });
  }
  if (vehicle.heroImage && vehicle.heroImage !== vehicle.image) {
    mediaRows.push({
      vehicle_id: vehicleId,
      type: "IMAGE" as const,
      url: vehicle.heroImage,
      alt_text: `${vehicle.brand} ${vehicle.model} em destaque`,
      is_cover: false,
      is_hero: true,
      order: 1,
    });
  }

  if (mediaRows.length) {
    const { error: mediaError } = await supabase
      .from("vehicle_media")
      .insert(mediaRows);
    if (mediaError) throw mediaError;
  }
}

export async function upsertVehicle(vehicle: Vehicle): Promise<Vehicle> {
  const enums = toDbEnums(vehicle);
  const priceOnRequest = vehicle.price === null;
  const baseSlug =
    slugify(`${vehicle.brand}-${vehicle.model}`) || `veiculo-${Date.now()}`;
  const existingId = isUuid(vehicle.id) ? vehicle.id : null;

  const payload = {
    brand: vehicle.brand.trim(),
    model: vehicle.model.trim(),
    version: vehicle.version?.trim() || null,
    year: vehicle.year,
    km: vehicle.km,
    owners: vehicle.owners ?? 1,
    provenance: vehicle.provenance?.trim() || null,
    color: vehicle.color.trim(),
    category: enums.category,
    body: enums.body,
    gearbox: enums.gearbox,
    fuel: enums.fuel,
    price: priceOnRequest ? null : vehicle.price,
    price_on_request: priceOnRequest,
    available: vehicle.available,
    badge: enums.badge,
    description: vehicle.description,
    status: (vehicle.status ?? "Rascunho") as VehicleStatus,
  };

  let vehicleId = existingId;

  if (existingId) {
    const { error } = await supabase
      .from("vehicles")
      .update(payload)
      .eq("id", existingId);
    if (error) throw error;
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        ...payload,
        slug: `${baseSlug}-${Date.now().toString(36)}`,
        created_by_id: user?.id ?? null,
      })
      .select("id")
      .single();

    if (error) throw error;
    vehicleId = data.id as string;
  }

  if (!vehicleId) throw new Error("Falha ao salvar veículo");

  await replaceChildren(vehicleId, vehicle);

  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .eq("id", vehicleId)
    .single();

  if (error) throw error;
  return mapDbVehicleToUi(data as DbVehicleRow);
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
}

export async function updateVehicleStatus(id: string, status: VehicleStatus) {
  const { error } = await supabase
    .from("vehicles")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

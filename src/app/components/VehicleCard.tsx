import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Vehicle, formatBRL, formatKm } from "../data/vehicles";

interface VehicleCardProps {
  vehicle: Vehicle;
  onOpen: (v: Vehicle) => void;
}

const badgeStyles: Record<string, string> = {
  RARO: "bg-neutral-0 text-neutral-900 border-neutral-0",
  "ÚLTIMA UNIDADE": "bg-brand-blue-500 text-neutral-0 border-brand-blue-500",
  NOVO: "bg-success text-neutral-0 border-success",
  RESERVADO: "bg-neutral-600 text-neutral-0 border-neutral-600",
  "EDIÇÃO LIMITADA": "bg-warning text-neutral-900 border-warning",
};

export function VehicleCard({ vehicle, onOpen }: VehicleCardProps) {
  return (
    <button
      onClick={() => onOpen(vehicle)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-0 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(14,15,16,0.08)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-50">
        <span
          className="pointer-events-none absolute inset-x-0 bottom-2 select-none text-center font-display uppercase tracking-[0.12em] text-neutral-100"
          style={{ fontSize: "clamp(28px, 6vw, 56px)", fontWeight: 600, lineHeight: 1 }}
          aria-hidden
        >
          {vehicle.brand}
        </span>
        <ImageWithFallback
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="relative h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {vehicle.badge && (
          <span
            className={`absolute left-4 top-4 rounded-full border px-3 py-1 uppercase tracking-[0.08em] ${badgeStyles[vehicle.badge]}`}
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            {vehicle.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className="uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "11px" }}>
            {vehicle.category}
          </p>
          <h3 className="mt-1 text-neutral-900" style={{ fontSize: "20px", fontWeight: 600 }}>
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="mt-1 text-neutral-600" style={{ fontSize: "13px" }}>
            {vehicle.year} · {formatKm(vehicle.km)} · {vehicle.color}
          </p>
        </div>

        <p className="text-neutral-600" style={{ fontSize: "14px" }}>
          {vehicle.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="text-neutral-900" style={{ fontSize: "18px", fontWeight: 600 }}>
            {formatBRL(vehicle.price)}
          </span>
          <span className="flex items-center gap-2 text-neutral-900 transition-colors group-hover:text-brand-blue-500" style={{ fontSize: "13px" }}>
            Ver detalhes <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </button>
  );
}

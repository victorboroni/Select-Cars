import { useEffect } from "react";
import { Check, MessageCircle, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Vehicle, formatBRL, formatKm } from "../data/vehicles";
import { whatsappLink, vehicleMessage } from "../lib/whatsapp";

interface VehicleDrawerProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const badgeStyles: Record<string, string> = {
  RARO: "bg-neutral-900 text-neutral-0",
  "ÚLTIMA UNIDADE": "bg-brand-blue-500 text-neutral-0",
  NOVO: "bg-success text-neutral-0",
  RESERVADO: "bg-neutral-600 text-neutral-0",
  "EDIÇÃO LIMITADA": "bg-warning text-neutral-900",
};

export function VehicleDrawer({ vehicle, onClose }: VehicleDrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (vehicle) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [vehicle, onClose]);

  if (!vehicle) return null;

  const specRows = [
    { label: "Motor / Potência", value: vehicle.specs.engine },
    { label: "Velocidade máxima", value: vehicle.specs.topSpeed },
    { label: "Câmbio", value: vehicle.specs.transmission },
    { label: "Combustível", value: vehicle.specs.fuel },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-neutral-0 shadow-[0_8px_24px_rgba(14,15,16,0.08)]">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-0 text-neutral-900 hover:border-neutral-900"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="relative aspect-[16/10] w-full bg-neutral-50">
          <span
            className="pointer-events-none absolute inset-x-0 bottom-3 select-none text-center font-display uppercase tracking-[0.12em] text-neutral-100"
            style={{ fontSize: "clamp(40px, 12vw, 88px)", fontWeight: 600, lineHeight: 1 }}
            aria-hidden
          >
            {vehicle.brand}
          </span>
          <ImageWithFallback
            src={vehicle.heroImage ?? vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="relative h-full w-full object-contain p-6"
          />
          {vehicle.badge && (
            <span
              className={`absolute left-5 top-5 rounded-full px-3 py-1 uppercase tracking-[0.08em] ${badgeStyles[vehicle.badge]}`}
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              {vehicle.badge}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div>
            <p className="uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "11px" }}>
              {vehicle.category}
            </p>
            <h2 className="mt-1 text-neutral-900" style={{ fontSize: "26px", fontWeight: 600 }}>
              {vehicle.brand} {vehicle.model}
            </h2>
            <p className="mt-1 text-neutral-600" style={{ fontSize: "14px" }}>
              {vehicle.year} · {formatKm(vehicle.km)} · {vehicle.color}
            </p>
          </div>

          <p className="text-neutral-600" style={{ fontSize: "15px" }}>
            {vehicle.description}
          </p>

          <div>
            <p className="uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "11px" }}>
              Especificações rápidas
            </p>
            <dl className="mt-3 divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
              {specRows.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-6 px-4 py-3">
                  <dt className="text-neutral-400" style={{ fontSize: "13px" }}>{r.label}</dt>
                  <dd className="text-right text-neutral-900" style={{ fontSize: "13px", fontWeight: 500 }}>
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "11px" }}>
              Destaques do veículo
            </p>
            <ul className="mt-3 grid gap-2">
              {vehicle.highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-neutral-800" style={{ fontSize: "14px" }}>
                  <Check size={16} className="shrink-0 text-brand-blue-500" />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-neutral-900" style={{ fontSize: "26px", fontWeight: 600 }}>
                  {formatBRL(vehicle.price)}
                </p>
                <p className="mt-1 flex items-center gap-2 text-neutral-600" style={{ fontSize: "13px" }}>
                  <span className={`h-2 w-2 rounded-full ${vehicle.available ? "bg-success" : "bg-neutral-400"}`} />
                  {vehicle.available ? "Disponível para visita" : "Reservado"}
                </p>
              </div>
            </div>
            <a
              href={whatsappLink(vehicleMessage(vehicle.brand, vehicle.model))}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-neutral-0 transition-colors hover:bg-neutral-800"
            >
              <MessageCircle size={18} /> Falar sobre este veículo no WhatsApp
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

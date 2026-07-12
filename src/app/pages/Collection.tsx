import { useMemo, useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { VehicleCard } from "../components/VehicleCard";
import { VehicleDrawer } from "../components/VehicleDrawer";
import { SectionHeading } from "../components/ui-primitives/SectionHeading";
import { categories, Vehicle } from "../data/vehicles";
import { useVehicles } from "../store/VehiclesContext";
import { whatsappLink, GENERIC_MESSAGE } from "../lib/whatsapp";

type Sort = "novidades" | "menor-preco" | "maior-preco" | "menor-km";

const filters = ["Todos", ...categories] as const;
const sortOptions: { id: Sort; label: string }[] = [
  { id: "novidades", label: "Recém-chegados" },
  { id: "menor-preco", label: "Menor preço" },
  { id: "maior-preco", label: "Maior preço" },
  { id: "menor-km", label: "Menor km" },
];

export function Collection() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todos");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("novidades");
  const [active, setActive] = useState<Vehicle | null>(null);
  const { published } = useVehicles();

  const result = useMemo(() => {
    let list = published.filter((v) => {
      const matchesFilter = filter === "Todos" || v.category === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        `${v.brand} ${v.model} ${v.color}`.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });

    const priceOf = (v: Vehicle) => v.price ?? Number.MAX_SAFE_INTEGER;
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "menor-preco":
          return priceOf(a) - priceOf(b);
        case "maior-preco":
          return priceOf(b) - priceOf(a);
        case "menor-km":
          return a.km - b.km;
        default:
          return 0;
      }
    });
    return list;
  }, [filter, query, sort, published]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-12">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <span className="uppercase tracking-[0.18em] text-neutral-400" style={{ fontSize: "12px" }}>
          03 / Coleção · Showroom São Paulo
        </span>
        <SectionHeading
          title={`${published.length} veículos no acervo`}
          display
        />
        <p className="max-w-2xl text-neutral-600" style={{ fontSize: "16px" }}>
          Uma seleção atualizada semanalmente. Para a coleção completa, agende uma
          visita privada.
        </p>
      </div>

      {/* Controls */}
      <div className="mt-10 flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 uppercase tracking-[0.08em] transition-colors ${
                filter === f
                  ? "border-neutral-900 bg-neutral-900 text-neutral-0"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-900"
              }`}
              style={{ fontSize: "12px" }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 rounded-full border border-neutral-200 px-4 py-2.5 sm:w-80">
            <Search size={16} className="text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar marca, modelo ou cor"
              className="w-full bg-transparent text-neutral-900 outline-none placeholder:text-neutral-400"
              style={{ fontSize: "14px" }}
            />
          </div>
          <label className="flex items-center gap-3 text-neutral-600" style={{ fontSize: "13px" }}>
            <span className="uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "11px" }}>
              Ordenar
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-neutral-200 bg-neutral-0 px-4 py-2 text-neutral-900 outline-none"
              style={{ fontSize: "13px" }}
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Grid or empty state */}
      {result.length > 0 ? (
        <>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onOpen={setActive} />
            ))}
          </div>
          <p className="mt-10 text-neutral-400" style={{ fontSize: "13px" }}>
            Exibindo 1–{result.length} de {result.length} · 01 / 01
          </p>
        </>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-20 text-center">
          <h3 className="text-neutral-900" style={{ fontSize: "22px", fontWeight: 600 }}>
            Nenhum veículo encontrado com esses filtros.
          </h3>
          <p className="max-w-md text-neutral-600" style={{ fontSize: "15px" }}>
            Fale diretamente com a loja — talvez tenhamos algo em processo de
            chegada ou possamos buscar no mercado por você.
          </p>
          <a
            href={whatsappLink(GENERIC_MESSAGE)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-neutral-0 transition-colors hover:bg-neutral-800"
          >
            <MessageCircle size={18} /> Falar no WhatsApp
          </a>
        </div>
      )}

      {/* Não encontrou */}
      <div className="mt-24 flex flex-col items-start justify-between gap-6 rounded-2xl border border-neutral-200 bg-neutral-900 px-8 py-10 text-neutral-0 md:flex-row md:items-center">
        <div>
          <h3 style={{ fontSize: "24px", fontWeight: 600 }}>Não encontrou o que procura?</h3>
          <p className="mt-2 max-w-xl text-neutral-400" style={{ fontSize: "15px" }}>
            Para modelos específicos, edições limitadas ou unidades em outros
            estados, compartilhe o que você procura. Buscamos no mercado interno e
            internacional.
          </p>
        </div>
        <a
          href={whatsappLink(GENERIC_MESSAGE)}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-2 rounded-full border border-neutral-0 px-6 py-3 text-neutral-0 transition-colors hover:bg-neutral-0 hover:text-neutral-900"
        >
          <MessageCircle size={18} /> Falar com um curador
        </a>
      </div>

      <VehicleDrawer vehicle={active} onClose={() => setActive(null)} />
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { Pause, Pencil, Play, Plus, Search, Trash2 } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useVehicles } from "../../store/VehiclesContext";
import { formatBRL, VehicleStatus } from "../../data/vehicles";

const statusStyles: Record<VehicleStatus, string> = {
  Publicado: "bg-success/10 text-success border-success/30",
  Pausado: "bg-warning/10 text-warning border-warning/30",
  Rascunho: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export function AdminDashboard() {
  const { vehicles, removeVehicle, toggleStatus } = useVehicles();
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const rows = vehicles.filter((v) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      `${v.brand} ${v.model} ${v.status ?? ""}`.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-8">
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-lg border border-neutral-200 bg-neutral-900 px-4 py-3 text-neutral-0 shadow-[0_8px_24px_rgba(14,15,16,0.16)]" style={{ fontSize: "14px" }}>
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-neutral-900" style={{ fontSize: "28px", fontWeight: 600 }}>
            Veículos cadastrados
          </h1>
          <p className="mt-1 text-neutral-600" style={{ fontSize: "14px" }}>
            {vehicles.length} veículos · {vehicles.filter((v) => (v.status ?? "Publicado") === "Publicado").length} publicados
          </p>
        </div>
        <Link
          to="/admin/painel/novo"
          className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-neutral-0 transition-colors hover:bg-neutral-800"
          style={{ fontSize: "14px" }}
        >
          <Plus size={16} /> Novo veículo
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-neutral-0 px-4 py-2.5 sm:w-96">
        <Search size={16} className="text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por marca, modelo ou status"
          className="w-full bg-transparent text-neutral-900 outline-none placeholder:text-neutral-400"
          style={{ fontSize: "14px" }}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-0">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-400" style={{ fontSize: "11px" }}>
              <th className="px-5 py-4 uppercase tracking-[0.08em]" style={{ fontWeight: 500 }}>Foto</th>
              <th className="px-5 py-4 uppercase tracking-[0.08em]" style={{ fontWeight: 500 }}>Marca / Modelo</th>
              <th className="px-5 py-4 uppercase tracking-[0.08em]" style={{ fontWeight: 500 }}>Cadastro</th>
              <th className="px-5 py-4 uppercase tracking-[0.08em]" style={{ fontWeight: 500 }}>Preço</th>
              <th className="px-5 py-4 uppercase tracking-[0.08em]" style={{ fontWeight: 500 }}>Status</th>
              <th className="px-5 py-4 uppercase tracking-[0.08em]" style={{ fontWeight: 500 }}>Selo</th>
              <th className="px-5 py-4 text-right uppercase tracking-[0.08em]" style={{ fontWeight: 500 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const status = (v.status ?? "Publicado") as VehicleStatus;
              return (
                <tr key={v.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-4">
                    <div className="h-12 w-20 overflow-hidden rounded-lg bg-neutral-50">
                      <ImageWithFallback src={v.image} alt={v.model} className="h-full w-full object-contain" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-neutral-900" style={{ fontSize: "14px", fontWeight: 500 }}>{v.brand} {v.model}</p>
                    <p className="text-neutral-400" style={{ fontSize: "12px" }}>{v.year} · {v.color}</p>
                  </td>
                  <td className="px-5 py-4 text-neutral-600" style={{ fontSize: "13px" }}>
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="px-5 py-4 text-neutral-900" style={{ fontSize: "13px" }}>{formatBRL(v.price)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full border px-3 py-1 uppercase tracking-[0.06em] ${statusStyles[status]}`} style={{ fontSize: "10px", fontWeight: 500 }}>
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-neutral-600" style={{ fontSize: "12px" }}>{v.badge ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/painel/${v.id}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={async () => {
                          await toggleStatus(v.id);
                          flash(
                            status === "Pausado"
                              ? "Veículo reativado."
                              : "Veículo pausado. Ele não aparece mais no site público."
                          );
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                        title={status === "Pausado" ? "Reativar" : "Pausar"}
                      >
                        {status === "Pausado" ? <Play size={16} /> : <Pause size={16} />}
                      </button>
                      <button
                        onClick={() => setConfirmId(v.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-error hover:bg-error/10"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="px-6 py-16 text-center text-neutral-500" style={{ fontSize: "14px" }}>
            Nenhum veículo encontrado.
          </div>
        )}
      </div>

      {/* Confirmação de exclusão */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 px-6">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-neutral-0 p-6">
            <h3 className="text-neutral-900" style={{ fontSize: "18px", fontWeight: 600 }}>Excluir veículo?</h3>
            <p className="mt-2 text-neutral-600" style={{ fontSize: "14px" }}>
              Esta ação remove o veículo definitivamente e não pode ser desfeita.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="rounded-full border border-neutral-200 px-5 py-2.5 text-neutral-900 hover:border-neutral-900"
                style={{ fontSize: "14px" }}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await removeVehicle(confirmId);
                  setConfirmId(null);
                  flash("Veículo removido definitivamente.");
                }}
                className="rounded-full bg-error px-5 py-2.5 text-neutral-0 hover:opacity-90"
                style={{ fontSize: "14px" }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

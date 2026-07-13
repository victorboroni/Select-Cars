import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, X } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useVehicles } from "../../store/VehiclesContext";
import {
  Vehicle,
  categories,
  bodies,
  gearboxes,
  fuels,
  badgeOptions,
  statusOptions,
  Category,
  Body,
  Gearbox,
  Fuel,
  Badge,
  VehicleStatus,
} from "../../data/vehicles";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function emptyVehicle(): Vehicle {
  return {
    id: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    km: 0,
    color: "",
    category: "Esportivos",
    body: "Coupé",
    gearbox: "Automático",
    fuel: "Gasolina",
    price: 0,
    available: true,
    description: "",
    image: "",
    status: "Publicado",
    highlights: [],
    specs: { engine: "", topSpeed: "", transmission: "", fuel: "" },
    version: "",
    owners: 1,
    provenance: "",
  };
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-2">
    <span className="text-neutral-600" style={{ fontSize: "13px" }}>{label}</span>
    {children}
  </label>
);

const inputCls =
  "rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-neutral-900 outline-none focus:border-neutral-900";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6">
    <h2 className="text-neutral-900" style={{ fontSize: "16px", fontWeight: 600 }}>{title}</h2>
    <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
  </section>
);

export function AdminVehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, saveVehicle } = useVehicles();

  const editing = useMemo(() => (id ? getById(id) : undefined), [id, getById]);
  const [form, setForm] = useState<Vehicle>(editing ? { ...editing } : emptyVehicle());
  const [priceOnRequest, setPriceOnRequest] = useState(editing?.price === null);
  const [newHighlight, setNewHighlight] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const set = <K extends keyof Vehicle>(key: K, value: Vehicle[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setSpec = (key: keyof Vehicle["specs"], value: string) =>
    setForm((f) => ({ ...f, specs: { ...f.specs, [key]: value } }));

  const addHighlight = () => {
    const v = newHighlight.trim();
    if (!v) return;
    set("highlights", [...form.highlights, v]);
    setNewHighlight("");
  };

  const save = async (status: VehicleStatus) => {
    const missing: string[] = [];
    if (!form.brand.trim()) missing.push("brand");
    if (!form.model.trim()) missing.push("model");
    if (missing.length) {
      setErrors(missing);
      return;
    }
    const finalId =
      form.id ||
      `${slugify(`${form.brand}-${form.model}`)}-${Date.now().toString(36)}`;
    const payload: Vehicle = {
      ...form,
      id: finalId,
      status,
      price: priceOnRequest ? null : Number(form.price) || 0,
      image: form.image || "",
    };
    try {
      await saveVehicle(payload);
      navigate("/admin/painel");
    } catch {
      setErrors(["save"]);
    }
  };

  const invalid = (name: string) => errors.includes(name);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/admin/painel" className="flex w-fit items-center gap-2 text-neutral-600 hover:text-neutral-900" style={{ fontSize: "13px" }}>
          <ArrowLeft size={15} /> Voltar
        </Link>
        <h1 className="mt-3 text-neutral-900" style={{ fontSize: "28px", fontWeight: 600 }}>
          {editing ? "Editar veículo" : "Novo veículo"}
        </h1>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-error" style={{ fontSize: "14px" }}>
          {errors.includes("save")
            ? "Não foi possível salvar no banco. Tente novamente."
            : "Verifique os campos obrigatórios destacados."}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Section title="Identificação">
            <Field label="Marca *">
              <input className={`${inputCls} ${invalid("brand") ? "!border-error" : ""}`} value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field label="Modelo *">
              <input className={`${inputCls} ${invalid("model") ? "!border-error" : ""}`} value={form.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
            <Field label="Versão / Trim">
              <input className={inputCls} value={form.version ?? ""} onChange={(e) => set("version", e.target.value)} />
            </Field>
            <Field label="Ano de fabricação/modelo">
              <input type="number" className={inputCls} value={form.year} onChange={(e) => set("year", Number(e.target.value))} />
            </Field>
            <Field label="Cor (nome comercial)">
              <input className={inputCls} value={form.color} onChange={(e) => set("color", e.target.value)} />
            </Field>
          </Section>

          <Section title="Dados de uso">
            <Field label="Quilometragem">
              <input type="number" className={inputCls} value={form.km} onChange={(e) => set("km", Number(e.target.value))} />
            </Field>
            <Field label="Número de donos">
              <input type="number" className={inputCls} value={form.owners ?? 1} onChange={(e) => set("owners", Number(e.target.value))} />
            </Field>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-neutral-600" style={{ fontSize: "13px" }}>Procedência (histórico resumido)</span>
              <textarea rows={2} className={inputCls} value={form.provenance ?? ""} onChange={(e) => set("provenance", e.target.value)} />
            </label>
          </Section>

          <Section title="Classificação">
            <Field label="Categoria">
              <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value as Category)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Carroceria">
              <select className={inputCls} value={form.body} onChange={(e) => set("body", e.target.value as Body)}>
                {bodies.map((b) => <option key={b}>{b}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="Ficha técnica">
            <Field label="Motor / Potência">
              <input className={inputCls} value={form.specs.engine} onChange={(e) => setSpec("engine", e.target.value)} />
            </Field>
            <Field label="Velocidade máxima">
              <input className={inputCls} value={form.specs.topSpeed} onChange={(e) => setSpec("topSpeed", e.target.value)} />
            </Field>
            <Field label="Câmbio">
              <select className={inputCls} value={form.gearbox} onChange={(e) => { set("gearbox", e.target.value as Gearbox); setSpec("transmission", e.target.value); }}>
                {gearboxes.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Combustível">
              <select className={inputCls} value={form.fuel} onChange={(e) => { set("fuel", e.target.value as Fuel); setSpec("fuel", e.target.value); }}>
                {fuels.map((f) => <option key={f}>{f}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="Destaques do veículo">
            <div className="sm:col-span-2">
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                  placeholder='Ex.: "Bancos em fibra de carbono"'
                />
                <button onClick={addHighlight} type="button" className="flex items-center gap-1 rounded-lg bg-neutral-900 px-4 text-neutral-0" style={{ fontSize: "14px" }}>
                  <Plus size={16} /> Adicionar
                </button>
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {form.highlights.map((h, i) => (
                  <li key={`${h}-${i}`} className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 py-1 pl-3 pr-2 text-neutral-800" style={{ fontSize: "13px" }}>
                    {h}
                    <button type="button" onClick={() => set("highlights", form.highlights.filter((_, idx) => idx !== i))} className="text-neutral-400 hover:text-error">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section title="Descrição & Mídia">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-neutral-600" style={{ fontSize: "13px" }}>Descrição curta</span>
              <textarea rows={3} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-neutral-600" style={{ fontSize: "13px" }}>URL da foto (capa)</span>
              <input className={inputCls} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." />
            </label>
          </Section>
        </div>

        {/* Painel lateral: comercial, selo, status, preview */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6">
            <h2 className="text-neutral-900" style={{ fontSize: "16px", fontWeight: 600 }}>Comercial</h2>
            <div className="mt-5 flex flex-col gap-4">
              <label className="flex items-center gap-3 text-neutral-800" style={{ fontSize: "14px" }}>
                <input type="checkbox" checked={priceOnRequest} onChange={(e) => setPriceOnRequest(e.target.checked)} />
                Sob consulta
              </label>
              {!priceOnRequest && (
                <Field label="Preço (R$)">
                  <input type="number" className={inputCls} value={form.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
                </Field>
              )}
              <label className="flex items-center gap-3 text-neutral-800" style={{ fontSize: "14px" }}>
                <input type="checkbox" checked={form.available} onChange={(e) => set("available", e.target.checked)} />
                Disponível para visita
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6">
            <h2 className="text-neutral-900" style={{ fontSize: "16px", fontWeight: 600 }}>Selo & Status</h2>
            <div className="mt-5 flex flex-col gap-4">
              <Field label="Selo/tag">
                <select className={inputCls} value={form.badge ?? ""} onChange={(e) => set("badge", (e.target.value || undefined) as Badge | undefined)}>
                  <option value="">Nenhum</option>
                  {badgeOptions.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status ?? "Publicado"} onChange={(e) => set("status", e.target.value as VehicleStatus)}>
                  {statusOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6">
            <h2 className="text-neutral-900" style={{ fontSize: "16px", fontWeight: 600 }}>Prévia da capa</h2>
            <div className="mt-4 aspect-[16/10] overflow-hidden rounded-lg bg-neutral-50">
              {form.image ? (
                <ImageWithFallback src={form.image} alt="Prévia" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-400" style={{ fontSize: "13px" }}>
                  Sem imagem
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* Ações */}
      <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-neutral-200 bg-neutral-50 py-4">
        <Link to="/admin/painel" className="rounded-full border border-neutral-200 bg-neutral-0 px-6 py-3 text-neutral-900 hover:border-neutral-900" style={{ fontSize: "14px" }}>
          Cancelar
        </Link>
        <button onClick={() => save("Rascunho")} className="rounded-full border border-neutral-200 bg-neutral-0 px-6 py-3 text-neutral-900 hover:border-neutral-900" style={{ fontSize: "14px" }}>
          Salvar como rascunho
        </button>
        <button onClick={() => save(form.status ?? "Publicado")} className="rounded-full bg-neutral-900 px-6 py-3 text-neutral-0 hover:bg-neutral-800" style={{ fontSize: "14px" }}>
          Salvar
        </button>
      </div>
    </div>
  );
}

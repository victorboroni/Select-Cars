import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowRight, Lock } from "lucide-react";
import { useVehicles } from "../../store/VehiclesContext";

// Cadastro/login livre (mock): qualquer clique em "Entrar" abre o painel.
export function AdminLogin() {
  const { login } = useVehicles();
  const navigate = useNavigate();
  const [email, setEmail] = useState("lojista@selectcars.com.br");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate("/admin/painel");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 flex justify-center font-display uppercase tracking-[0.34em] text-neutral-900"
          style={{ fontSize: "22px", fontWeight: 600 }}
        >
          SELECTCARS
        </Link>

        <form
          onSubmit={submit}
          className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-neutral-0 p-8"
        >
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "11px" }}>
              <Lock size={13} /> Painel do lojista
            </span>
            <h1 className="text-neutral-900" style={{ fontSize: "24px", fontWeight: 600 }}>
              Entrar na área administrativa
            </h1>
            <p className="text-neutral-600" style={{ fontSize: "13px" }}>
              Acesso demonstrativo — clique em entrar para abrir o painel.
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-neutral-600" style={{ fontSize: "13px" }}>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-900"
              style={{ fontSize: "14px" }}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-neutral-600" style={{ fontSize: "13px" }}>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-900"
              style={{ fontSize: "14px" }}
            />
          </label>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-neutral-0 transition-colors hover:bg-neutral-800"
          >
            Entrar <ArrowRight size={16} />
          </button>

          <Link to="/" className="text-center text-neutral-400 hover:text-neutral-900" style={{ fontSize: "13px" }}>
            Voltar ao site
          </Link>
        </form>
      </div>
    </div>
  );
}

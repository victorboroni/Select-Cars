import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowRight, Lock, UserPlus } from "lucide-react";
import { useVehicles } from "../../store/VehiclesContext";

type AuthMode = "login" | "register";

export function AdminLogin() {
  const {
    login,
    register,
    needsAdminBootstrap,
    refreshBootstrapState,
    isAuthed,
    isAuthReady,
  } = useVehicles();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void refreshBootstrapState();
  }, [refreshBootstrapState]);

  useEffect(() => {
    if (needsAdminBootstrap) setMode("register");
  }, [needsAdminBootstrap]);

  useEffect(() => {
    if (isAuthReady && isAuthed) {
      navigate("/admin/painel", { replace: true });
    }
  }, [isAuthReady, isAuthed, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "register") {
      if (password.length < 8) {
        setError("A senha deve ter pelo menos 8 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const result = await login(email, password);
        if (result.error) {
          setError(
            result.notStaff
              ? result.error
              : "E-mail ou senha inválidos. Tente novamente."
          );
          return;
        }
        navigate("/admin/painel");
        return;
      }

      const result = await register(email, password, name);
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        setInfo(
          needsAdminBootstrap
            ? "Conta criada. Confirme o e-mail enviado para ativar o primeiro administrador e depois entre."
            : "Conta criada. Confirme o e-mail enviado e depois faça login."
        );
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      navigate("/admin/painel");
    } catch {
      setError(
        mode === "login"
          ? "Não foi possível entrar. Verifique a conexão e tente de novo."
          : "Não foi possível criar a conta. Verifique a conexão e tente de novo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBootstrap = needsAdminBootstrap === true;

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
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-neutral-0 p-8"
        >
          <div className="flex flex-col gap-1">
            <span
              className="flex items-center gap-2 uppercase tracking-[0.08em] text-neutral-400"
              style={{ fontSize: "11px" }}
            >
              {mode === "login" ? <Lock size={13} /> : <UserPlus size={13} />}
              Painel do lojista
            </span>
            <h1
              className="text-neutral-900"
              style={{ fontSize: "24px", fontWeight: 600 }}
            >
              {mode === "login"
                ? "Entrar na área administrativa"
                : isBootstrap
                  ? "Criar o primeiro administrador"
                  : "Criar conta"}
            </h1>
            <p className="text-neutral-600" style={{ fontSize: "13px" }}>
              {mode === "login"
                ? "Use e-mail e senha para acessar o painel."
                : isBootstrap
                  ? "Ainda não há administrador. O primeiro cadastro recebe o papel ADMIN no banco."
                  : "Novas contas nascem sem acesso ao painel até um administrador liberar o perfil."}
            </p>
          </div>

          {!isBootstrap && (
            <div
              className="grid grid-cols-2 gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1"
              role="tablist"
              aria-label="Modo de autenticação"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setInfo(null);
                }}
                className={`rounded-full px-4 py-2 transition-colors ${
                  mode === "login"
                    ? "bg-neutral-900 text-neutral-0"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                style={{ fontSize: "13px" }}
              >
                Entrar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                onClick={() => {
                  setMode("register");
                  setError(null);
                  setInfo(null);
                }}
                className={`rounded-full px-4 py-2 transition-colors ${
                  mode === "register"
                    ? "bg-neutral-900 text-neutral-0"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                style={{ fontSize: "13px" }}
              >
                Cadastrar
              </button>
            </div>
          )}

          {error && (
            <div
              className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-error"
              style={{ fontSize: "13px" }}
              role="alert"
            >
              {error}
            </div>
          )}

          {info && (
            <div
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-700"
              style={{ fontSize: "13px" }}
              role="status"
            >
              {info}
            </div>
          )}

          {mode === "register" && (
            <label className="flex flex-col gap-2">
              <span className="text-neutral-600" style={{ fontSize: "13px" }}>
                Nome
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-900"
                style={{ fontSize: "14px" }}
              />
            </label>
          )}

          <label className="flex flex-col gap-2">
            <span className="text-neutral-600" style={{ fontSize: "13px" }}>
              E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-900"
              style={{ fontSize: "14px" }}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-neutral-600" style={{ fontSize: "13px" }}>
              Senha
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={mode === "register" ? 8 : undefined}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-900"
              style={{ fontSize: "14px" }}
            />
          </label>

          {mode === "register" && (
            <label className="flex flex-col gap-2">
              <span className="text-neutral-600" style={{ fontSize: "13px" }}>
                Confirmar senha
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={8}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-900"
                style={{ fontSize: "14px" }}
              />
            </label>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-neutral-0 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? mode === "login"
                ? "Entrando..."
                : "Criando conta..."
              : mode === "login"
                ? "Entrar"
                : isBootstrap
                  ? "Criar administrador"
                  : "Cadastrar"}{" "}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>

          <Link
            to="/"
            className="text-center text-neutral-400 hover:text-neutral-900"
            style={{ fontSize: "13px" }}
          >
            Voltar ao site
          </Link>
        </form>
      </div>
    </div>
  );
}

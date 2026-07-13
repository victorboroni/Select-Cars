import { Link, Navigate, Outlet, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { useVehicles } from "../../store/VehiclesContext";

export function AdminLayout() {
  const { isAuthed, isAuthReady, logout } = useVehicles();
  const navigate = useNavigate();

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-600" style={{ fontSize: "14px" }}>
        Carregando sessão...
      </div>
    );
  }

  if (!isAuthed) return <Navigate to="/admin" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-0">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/painel"
              className="font-display uppercase tracking-[0.3em] text-neutral-900"
              style={{ fontSize: "18px", fontWeight: 600 }}
            >
              SELECTCARS
            </Link>
            <span className="rounded-full border border-neutral-200 px-3 py-1 uppercase tracking-[0.08em] text-neutral-400" style={{ fontSize: "10px" }}>
              Painel do lojista
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-neutral-600 hover:text-neutral-900" style={{ fontSize: "13px" }}>
              Ver site
            </Link>
            <button
              onClick={async () => {
                await logout();
                navigate("/admin");
              }}
              className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-neutral-900 transition-colors hover:border-neutral-900"
              style={{ fontSize: "13px" }}
            >
              <LogOut size={15} /> Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

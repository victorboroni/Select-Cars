import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { vehicles as seed, Vehicle, VehicleStatus } from "../data/vehicles";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  deleteVehicle as deleteVehicleApi,
  fetchVehicles,
  updateVehicleStatus,
  upsertVehicle,
} from "../services/vehicles-api";

const AUTH_KEY = "selectcars.auth.v1";

type UserRole = "ADMIN" | "LOJISTA" | "SEM_ACESSO";

function seeded(): Vehicle[] {
  return seed.map((v, i) => ({
    ...v,
    status: v.status ?? "Publicado",
    createdAt:
      v.createdAt ??
      new Date(Date.now() - (seed.length - i) * 86400000 * 3).toISOString(),
  }));
}

function isStaffRole(role: string | null | undefined) {
  return role === "ADMIN" || role === "LOJISTA";
}

interface AuthResult {
  error?: string;
  needsEmailConfirmation?: boolean;
  notStaff?: boolean;
}

interface VehiclesContextValue {
  vehicles: Vehicle[];
  published: Vehicle[];
  isLoading: boolean;
  isAuthReady: boolean;
  getById: (id: string) => Vehicle | undefined;
  saveVehicle: (v: Vehicle) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
  isAuthed: boolean;
  isStaff: boolean;
  userRole: UserRole | null;
  needsAdminBootstrap: boolean | null;
  refreshBootstrapState: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshVehicles: () => Promise<void>;
}

const VehiclesContext = createContext<VehiclesContextValue | null>(null);

async function fetchCurrentUserRole(): Promise<UserRole | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data?.role) return null;
  return data.role as UserRole;
}

export function VehiclesProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [needsAdminBootstrap, setNeedsAdminBootstrap] = useState<boolean | null>(
    null
  );

  const refreshBootstrapState = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setNeedsAdminBootstrap(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("needs_admin_bootstrap");
      if (error) {
        setNeedsAdminBootstrap(null);
        return;
      }
      setNeedsAdminBootstrap(Boolean(data));
    } catch {
      setNeedsAdminBootstrap(null);
    }
  }, []);

  const syncAuthState = useCallback(async (hasSession: boolean) => {
    if (!hasSession) {
      setIsAuthed(false);
      setIsStaff(false);
      setUserRole(null);
      sessionStorage.removeItem(AUTH_KEY);
      return;
    }

    const role = await fetchCurrentUserRole();
    const staff = isStaffRole(role);
    setUserRole(role);
    setIsStaff(staff);
    setIsAuthed(staff);

    if (staff) sessionStorage.setItem(AUTH_KEY, "1");
    else sessionStorage.removeItem(AUTH_KEY);
  }, []);

  const refreshVehicles = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setVehicles(seeded());
      return;
    }

    try {
      const rows = await fetchVehicles();
      setVehicles(rows.length ? rows : seeded());
    } catch (error) {
      console.error("[SelectCars] Falha ao carregar veículos:", error);
      setVehicles((prev) => (prev.length ? prev : seeded()));
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (!active) return;
          await syncAuthState(Boolean(data.session));
          await refreshBootstrapState();
        } else {
          setIsAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
          setIsStaff(sessionStorage.getItem(AUTH_KEY) === "1");
          setNeedsAdminBootstrap(false);
        }
        await refreshVehicles();
      } finally {
        if (active) {
          setIsLoading(false);
          setIsAuthReady(true);
        }
      }
    }

    bootstrap();

    if (!isSupabaseConfigured) {
      return () => {
        active = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAuthState(Boolean(session));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshBootstrapState, refreshVehicles, syncAuthState]);

  const saveVehicle = useCallback(
    async (v: Vehicle) => {
      if (!isSupabaseConfigured || !isAuthed) {
        setVehicles((prev) => {
          const exists = prev.some((x) => x.id === v.id);
          return exists
            ? prev.map((x) => (x.id === v.id ? v : x))
            : [
                {
                  ...v,
                  createdAt: v.createdAt ?? new Date().toISOString(),
                },
                ...prev,
              ];
        });
        return;
      }

      const saved = await upsertVehicle(v);
      setVehicles((prev) => {
        const exists = prev.some((x) => x.id === saved.id);
        return exists
          ? prev.map((x) => (x.id === saved.id ? saved : x))
          : [saved, ...prev];
      });
    },
    [isAuthed]
  );

  const removeVehicle = useCallback(
    async (id: string) => {
      if (isSupabaseConfigured && isAuthed) {
        await deleteVehicleApi(id);
      }
      setVehicles((prev) => prev.filter((x) => x.id !== id));
    },
    [isAuthed]
  );

  const toggleStatus = useCallback(
    async (id: string) => {
      const current = vehicles.find((x) => x.id === id);
      if (!current) return;

      const next: VehicleStatus =
        current.status === "Pausado" ? "Publicado" : "Pausado";

      setVehicles((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: next } : x))
      );

      if (isSupabaseConfigured && isAuthed) {
        try {
          await updateVehicleStatus(id, next);
        } catch (error) {
          console.error("[SelectCars] Falha ao atualizar status:", error);
          setVehicles((prev) =>
            prev.map((x) =>
              x.id === id ? { ...x, status: current.status } : x
            )
          );
        }
      }
    },
    [isAuthed, vehicles]
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!isSupabaseConfigured) {
        sessionStorage.setItem(AUTH_KEY, "1");
        setIsAuthed(true);
        setIsStaff(true);
        return {};
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return { error: error.message };

      const role = await fetchCurrentUserRole();
      if (!isStaffRole(role)) {
        await supabase.auth.signOut();
        await syncAuthState(false);
        return {
          notStaff: true,
          error: "Conta sem permissão para o painel administrativo.",
        };
      }

      await syncAuthState(true);
      await refreshVehicles();
      await refreshBootstrapState();
      return {};
    },
    [refreshBootstrapState, refreshVehicles, syncAuthState]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name?: string
    ): Promise<AuthResult> => {
      if (!isSupabaseConfigured) {
        return { error: "Supabase não configurado neste ambiente." };
      }

      const trimmedEmail = email.trim();
      const trimmedName = name?.trim();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: trimmedName ? { name: trimmedName } : undefined,
        },
      });

      if (error) return { error: error.message };

      if (!data.session) {
        await refreshBootstrapState();
        return {
          needsEmailConfirmation: true,
        };
      }

      const role = await fetchCurrentUserRole();
      if (!isStaffRole(role)) {
        await supabase.auth.signOut();
        await syncAuthState(false);
        await refreshBootstrapState();
        return {
          notStaff: true,
          error:
            "Conta criada, mas sem acesso ao painel. Peça a um administrador para liberar o perfil.",
        };
      }

      await syncAuthState(true);
      await refreshVehicles();
      await refreshBootstrapState();
      return {};
    },
    [refreshBootstrapState, refreshVehicles, syncAuthState]
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthed(false);
    setIsStaff(false);
    setUserRole(null);
  }, []);

  const value = useMemo<VehiclesContextValue>(
    () => ({
      vehicles,
      published: vehicles.filter(
        (v) => (v.status ?? "Publicado") === "Publicado"
      ),
      isLoading,
      isAuthReady,
      getById: (id) => vehicles.find((v) => v.id === id),
      saveVehicle,
      removeVehicle,
      toggleStatus,
      isAuthed,
      isStaff,
      userRole,
      needsAdminBootstrap,
      refreshBootstrapState,
      login,
      register,
      logout,
      refreshVehicles,
    }),
    [
      vehicles,
      isLoading,
      isAuthReady,
      saveVehicle,
      removeVehicle,
      toggleStatus,
      isAuthed,
      isStaff,
      userRole,
      needsAdminBootstrap,
      refreshBootstrapState,
      login,
      register,
      logout,
      refreshVehicles,
    ]
  );

  return (
    <VehiclesContext.Provider value={value}>{children}</VehiclesContext.Provider>
  );
}

export function useVehicles() {
  const ctx = useContext(VehiclesContext);
  if (!ctx) throw new Error("useVehicles must be used within VehiclesProvider");
  return ctx;
}

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

function seeded(): Vehicle[] {
  return seed.map((v, i) => ({
    ...v,
    status: v.status ?? "Publicado",
    createdAt:
      v.createdAt ??
      new Date(Date.now() - (seed.length - i) * 86400000 * 3).toISOString(),
  }));
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
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshVehicles: () => Promise<void>;
}

const VehiclesContext = createContext<VehiclesContextValue | null>(null);

export function VehiclesProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

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
          setIsAuthed(Boolean(data.session));
          if (data.session) sessionStorage.setItem(AUTH_KEY, "1");
        } else {
          setIsAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
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

    if (!isSupabaseConfigured) return () => {
      active = false;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session));
      if (session) sessionStorage.setItem(AUTH_KEY, "1");
      else sessionStorage.removeItem(AUTH_KEY);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshVehicles]);

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

  const login = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setIsAuthed(true);
      return {};
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) return { error: error.message };

    sessionStorage.setItem(AUTH_KEY, "1");
    setIsAuthed(true);
    await refreshVehicles();
    return {};
  }, [refreshVehicles]);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthed(false);
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
      login,
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
      login,
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

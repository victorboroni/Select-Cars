import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { vehicles as seed, Vehicle, VehicleStatus } from "../data/vehicles";

const STORAGE_KEY = "selectcars.vehicles.v1";
const AUTH_KEY = "selectcars.auth.v1";

// Semente inicial com status/data garantidos.
function seeded(): Vehicle[] {
  return seed.map((v, i) => ({
    ...v,
    status: v.status ?? "Publicado",
    createdAt:
      v.createdAt ??
      new Date(Date.now() - (seed.length - i) * 86400000 * 3).toISOString(),
  }));
}

function load(): Vehicle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Vehicle[];
  } catch {
    /* ignore */
  }
  return seeded();
}

interface VehiclesContextValue {
  vehicles: Vehicle[];
  published: Vehicle[];
  getById: (id: string) => Vehicle | undefined;
  saveVehicle: (v: Vehicle) => void;
  removeVehicle: (id: string) => void;
  toggleStatus: (id: string) => void;
  isAuthed: boolean;
  login: () => void;
  logout: () => void;
}

const VehiclesContext = createContext<VehiclesContextValue | null>(null);

export function VehiclesProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(load);
  const [isAuthed, setIsAuthed] = useState<boolean>(
    () => sessionStorage.getItem(AUTH_KEY) === "1"
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  const saveVehicle = useCallback((v: Vehicle) => {
    setVehicles((prev) => {
      const exists = prev.some((x) => x.id === v.id);
      return exists
        ? prev.map((x) => (x.id === v.id ? v : x))
        : [{ ...v, createdAt: v.createdAt ?? new Date().toISOString() }, ...prev];
    });
  }, []);

  const removeVehicle = useCallback((id: string) => {
    setVehicles((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const toggleStatus = useCallback((id: string) => {
    setVehicles((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        const next: VehicleStatus =
          x.status === "Pausado" ? "Publicado" : "Pausado";
        return { ...x, status: next };
      })
    );
  }, []);

  const login = useCallback(() => {
    sessionStorage.setItem(AUTH_KEY, "1");
    setIsAuthed(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthed(false);
  }, []);

  const value = useMemo<VehiclesContextValue>(
    () => ({
      vehicles,
      published: vehicles.filter((v) => (v.status ?? "Publicado") === "Publicado"),
      getById: (id) => vehicles.find((v) => v.id === id),
      saveVehicle,
      removeVehicle,
      toggleStatus,
      isAuthed,
      login,
      logout,
    }),
    [vehicles, isAuthed, saveVehicle, removeVehicle, toggleStatus, login, logout]
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

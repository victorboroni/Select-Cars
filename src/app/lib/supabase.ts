import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[SelectCars] Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env"
  );
}

export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

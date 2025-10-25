import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.");
  // Fallback or throw an error if environment variables are not set
  // For development, we might proceed with a dummy client or a warning.
  // For production, this should ideally prevent the app from starting.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
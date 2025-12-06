import { createClient as createClientSupabase } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClientSupabase(
  supabaseUrl,
  supabaseAnonKey
);

// ✅ EXPORT QUE O BUILD ESPERA
export function createClient() {
  return createClientSupabase(supabaseUrl, supabaseAnonKey);
}

import { createClient } from "@supabase/supabase-js";

// Серверный клиент с service_role ключом.
// Используется ТОЛЬКО на сервере (route handlers) — ключ секретный.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Не заданы SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY в переменных окружения."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

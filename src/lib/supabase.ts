import { createClient } from "@supabase/supabase-js";

// Серверный клиент с service_role ключом.
// Используется ТОЛЬКО на сервере (route handlers) — ключ секретный.
export function supabaseAdmin() {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) {
    throw new Error(
      "Не заданы SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY в переменных окружения."
    );
  }
  // Нормализуем URL: убираем пробелы, лишние слэши и случайный суффикс /rest/v1.
  const url = rawUrl
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");

  return createClient(url, key.trim(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

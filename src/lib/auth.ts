import { cookies } from "next/headers";

export const ADMIN_COOKIE = "dala_admin";

// Значение cookie, которое считается валидной сессией.
// Секрет задаётся в env; если не задан — берём хеш пароля как запасной вариант.
export function adminSessionValue(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "dev-admin-secret"
  );
}

// Проверка пароля при входе.
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "admin";
  return input === expected;
}

// Проверка сессии в серверном компоненте.
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === adminSessionValue();
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Ошибка входа");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-brand">
      <div className="flex-1 flex items-center justify-center px-5">
        <form
          onSubmit={submit}
          className="w-full max-w-sm rounded-2xl bg-surface p-7 shadow-lg"
        >
          <div className="flex justify-center">
            <Logo variant="dark" />
          </div>
          <h1 className="mt-6 text-center text-lg font-bold text-brand">
            Вход в панель администратора
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoFocus
            className="mt-5 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand"
          />
          {error && (
            <div className="mt-3 rounded-xl bg-danger/10 border border-danger/30 px-4 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "Входим…" : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

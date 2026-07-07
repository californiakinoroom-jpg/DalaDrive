"use client";

import { useState } from "react";

export function CancelButton({ token, canCancel }: { token: string; canCancel: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось отменить");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl bg-brand/5 border border-brand/20 px-4 py-3 text-center text-brand font-medium">
        Запись отменена. Спасибо, что предупредили!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      <button
        onClick={cancel}
        disabled={!canCancel || state === "loading"}
        className="w-full rounded-xl bg-danger px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "Отменяем…" : "Отменить запись"}
      </button>
    </div>
  );
}

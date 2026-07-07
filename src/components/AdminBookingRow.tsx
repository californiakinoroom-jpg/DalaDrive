"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUS_LABEL: Record<BookingStatus, string> = {
  active: "Активна",
  cancelled: "Отменена",
  attended: "Пришёл",
  no_show: "Не пришёл",
};

const STATUS_STYLE: Record<BookingStatus, string> = {
  active: "bg-brand/10 text-brand",
  cancelled: "bg-danger/10 text-danger",
  attended: "bg-emerald-100 text-emerald-700",
  no_show: "bg-amber-100 text-amber-700",
};

export function AdminBookingRow({ b }: { b: Booking }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: BookingStatus) {
    setBusy(true);
    try {
      await fetch("/api/admin/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, status }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-surface px-4 py-3">
      <div className="w-20 font-bold text-brand tabular-nums">
        {b.start_time}
        <div className="text-xs font-normal text-foreground/40">{b.end_time}</div>
      </div>

      <div className="min-w-[140px] flex-1">
        <div className="font-semibold">{b.student_name}</div>
        <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="text-sm text-foreground/60 hover:text-brand">
          {b.phone}
        </a>
        {b.comment && (
          <div className="text-xs text-foreground/50 mt-0.5">💬 {b.comment}</div>
        )}
      </div>

      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[b.status]}`}>
        {STATUS_LABEL[b.status]}
      </span>

      <div className="flex gap-1.5">
        {b.status === "active" && (
          <>
            <button
              onClick={() => setStatus("attended")}
              disabled={busy}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Пришёл
            </button>
            <button
              onClick={() => setStatus("no_show")}
              disabled={busy}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Не пришёл
            </button>
            <button
              onClick={() => setStatus("cancelled")}
              disabled={busy}
              className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Отменить
            </button>
          </>
        )}
        {b.status !== "active" && (
          <button
            onClick={() => setStatus("active")}
            disabled={busy}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-brand disabled:opacity-50"
          >
            Вернуть
          </button>
        )}
      </div>
    </div>
  );
}

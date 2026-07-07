"use client";

import { useEffect, useState } from "react";
import type { SlotView } from "@/lib/types";

type DateCard = { date: string; day: number; weekday: string; month: string; isWorkday: boolean };

type Props = {
  dates: DateCard[];
  phone: string;
};

type Confirmation = {
  date: string;
  start: string;
  end: string;
  name: string;
  cancel_token: string;
};

const WEEKEND = new Set(["Сб", "Вс"]);

export function BookingWidget({ dates, phone }: Props) {
  const firstWork = dates.find((d) => d.isWorkday) ?? dates[0];
  const [selectedDate, setSelectedDate] = useState<string>(firstWork.date);
  const [slots, setSlots] = useState<SlotView[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotView | null>(null);

  const [name, setName] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Confirmation | null>(null);

  async function loadSlots(date: string) {
    setLoadingSlots(true);
    setSlots(null);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/slots?date=${date}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    loadSlots(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  async function submit() {
    if (!selectedSlot) return;
    setError(null);
    if (name.trim().length < 2) return setError("Укажите имя");
    if (phoneInput.replace(/\D/g, "").length < 10)
      return setError("Укажите корректный телефон");

    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          start: selectedSlot.start,
          name: name.trim(),
          phone: phoneInput.trim(),
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось записаться");
        // Слот мог освободиться/занялся — обновим сетку.
        if (res.status === 409) loadSlots(selectedDate);
        return;
      }
      setDone({
        date: data.date,
        start: data.start,
        end: data.end,
        name: name.trim(),
        cancel_token: data.cancel_token,
      });
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setDone(null);
    setSelectedSlot(null);
    setName("");
    setPhoneInput("");
    setComment("");
    setError(null);
    loadSlots(selectedDate);
  }

  // --- Экран подтверждения ---
  if (done) {
    const d = dates.find((x) => x.date === done.date);
    return (
      <div className="rounded-2xl bg-surface border border-border p-6 sm:p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#0e4d3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-brand">Вы записаны!</h2>
        <p className="mt-2 text-foreground/70">
          {done.name}, ваше практическое занятие подтверждено.
        </p>
        <div className="mt-5 rounded-xl bg-muted/60 p-4 text-left">
          <Row label="Дата">
            {d ? `${d.day} ${d.month}, ${d.weekday}` : done.date}
          </Row>
          <Row label="Время">
            {done.start} — {done.end}
          </Row>
        </div>
        <p className="mt-4 text-sm text-foreground/60">
          Подтверждение отправлено в WhatsApp. Отменить запись можно не позднее
          чем за сутки по ссылке из сообщения.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
        >
          Записать ещё
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
      {/* Шаг 1: выбор дня */}
      <div className="p-5 sm:p-6 border-b border-border">
        <StepLabel n={1} text="Выберите день" />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {dates.map((d) => {
            const active = d.date === selectedDate;
            const weekend = WEEKEND.has(d.weekday);
            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={[
                  "snap-start shrink-0 w-16 rounded-xl border py-2 text-center transition",
                  active
                    ? "bg-brand border-brand text-white"
                    : "bg-surface border-border hover:border-brand/50",
                ].join(" ")}
              >
                <div
                  className={[
                    "text-[11px] font-medium",
                    active ? "text-white/80" : weekend ? "text-danger/70" : "text-foreground/50",
                  ].join(" ")}
                >
                  {d.weekday}
                </div>
                <div className="text-lg font-bold leading-tight">{d.day}</div>
                <div className={["text-[10px]", active ? "text-white/70" : "text-foreground/40"].join(" ")}>
                  {d.month.slice(0, 3)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Шаг 2: выбор времени */}
      <div className="p-5 sm:p-6 border-b border-border">
        <StepLabel n={2} text="Выберите время" />
        <div className="mt-4">
          {loadingSlots ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : slots && slots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.map((s) => {
                const disabled = s.taken || s.past || s.blocked;
                const active = selectedSlot?.start === s.start;
                const label = s.blocked
                  ? s.blockedReason ?? "Недоступно"
                  : s.taken
                  ? "Занято"
                  : s.past
                  ? "Недоступно"
                  : "Свободно";
                return (
                  <button
                    key={s.start}
                    disabled={disabled}
                    onClick={() => setSelectedSlot(s)}
                    className={[
                      "rounded-xl border py-2.5 px-2 text-center transition",
                      disabled
                        ? "bg-muted border-border text-foreground/35 cursor-not-allowed"
                        : active
                        ? "bg-brand border-brand text-white"
                        : "bg-surface border-border hover:border-brand text-foreground",
                    ].join(" ")}
                  >
                    <div className="text-base font-semibold">
                      {s.start}–{s.end}
                    </div>
                    <div className="text-[11px]">{label}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-foreground/50 py-6 text-center">
              В этот день запись недоступна. Выберите другой день.
            </p>
          )}
        </div>
      </div>

      {/* Шаг 3: данные курсанта */}
      <div className="p-5 sm:p-6">
        <StepLabel n={3} text="Ваши данные" />
        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя и фамилия"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand"
          />
          <input
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Телефон / WhatsApp (напр. 8 777 000 00 00)"
            inputMode="tel"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand"
          />
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий (необязательно)"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand"
          />

          {selectedSlot && (
            <div className="rounded-xl bg-brand/5 border border-brand/20 px-4 py-3 text-sm text-brand">
              Выбрано: <b>{selectedSlot.start}–{selectedSlot.end}</b>
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={!selectedSlot || submitting}
            className="w-full rounded-xl bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Записываем…"
              : selectedSlot
              ? "Записаться на занятие"
              : "Сначала выберите время"}
          </button>
          <p className="text-center text-xs text-foreground/45">
            Нажимая кнопку, вы соглашаетесь на обработку контактных данных для
            записи. Вопросы: {phone}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepLabel({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
        {n}
      </span>
      <span className="font-semibold text-foreground">{text}</span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/60 last:border-0">
      <span className="text-foreground/55">{label}</span>
      <span className="font-semibold">{children}</span>
    </div>
  );
}

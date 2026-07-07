import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateDaySlots, SCHEDULE } from "@/lib/config";
import {
  todayLocal,
  nowMinutesLocal,
  upcomingDates,
  weekdayOf,
} from "@/lib/dates";
import { notifyStudentBooked, notifyAdminBooked } from "@/lib/whatsapp";

// POST /api/book { date, start, name, phone, comment? }
export async function POST(req: NextRequest) {
  let body: {
    date?: string;
    start?: string;
    name?: string;
    phone?: string;
    comment?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const date = (body.date ?? "").trim();
  const start = (body.start ?? "").trim();
  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const comment = (body.comment ?? "").trim() || null;

  // --- Валидация ---
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Некорректная дата" }, { status: 400 });
  }
  if (!name || name.length < 2) {
    return Response.json({ error: "Укажите имя" }, { status: 400 });
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    return Response.json({ error: "Укажите корректный телефон" }, { status: 400 });
  }
  if (!upcomingDates(SCHEDULE.daysAhead).includes(date)) {
    return Response.json({ error: "Запись на эту дату недоступна" }, { status: 400 });
  }
  if (!SCHEDULE.workDays.includes(weekdayOf(date))) {
    return Response.json({ error: "В этот день записи нет" }, { status: 400 });
  }

  const slot = generateDaySlots().find((s) => s.start === start);
  if (!slot) {
    return Response.json({ error: "Некорректное время" }, { status: 400 });
  }

  // Нельзя записаться в уже прошедшее время (сегодня).
  if (date === todayLocal() && slot.startMinutes - 30 <= nowMinutesLocal()) {
    return Response.json({ error: "Это время уже недоступно" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      date,
      start_time: slot.start,
      end_time: slot.end,
      student_name: name,
      phone,
      comment,
      status: "active",
    })
    .select("id, cancel_token")
    .single();

  if (error) {
    // 23505 = unique_violation -> слот заняли между показом и отправкой.
    if ((error as { code?: string }).code === "23505") {
      return Response.json(
        { error: "Это время только что заняли. Выберите другое." },
        { status: 409 }
      );
    }
    return Response.json({ error: "Не удалось сохранить запись" }, { status: 500 });
  }

  // Уведомления (не блокируют ответ пользователю при сбое).
  const payload = {
    student_name: name,
    phone,
    date,
    start_time: slot.start,
    end_time: slot.end,
  };
  try {
    await Promise.allSettled([
      notifyStudentBooked({ ...payload, cancel_token: data.cancel_token }),
      notifyAdminBooked(payload),
    ]);
  } catch {
    // игнорируем сбои уведомлений
  }

  return Response.json({
    ok: true,
    id: data.id,
    cancel_token: data.cancel_token,
    date,
    start: slot.start,
    end: slot.end,
  });
}

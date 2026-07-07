import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateDaySlots, SCHEDULE } from "@/lib/config";
import { todayLocal, nowMinutesLocal, upcomingDates, weekdayOf } from "@/lib/dates";
import type { SlotView } from "@/lib/types";

// GET /api/slots?date=YYYY-MM-DD
// Возвращает слоты дня с пометкой taken (занято) и past (время прошло).
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Некорректная дата" }, { status: 400 });
  }

  // Проверка, что дата в допустимом окне записи.
  const allowed = upcomingDates(SCHEDULE.daysAhead);
  if (!allowed.includes(date)) {
    return Response.json({ slots: [], closed: true });
  }
  if (!SCHEDULE.workDays.includes(weekdayOf(date))) {
    return Response.json({ slots: [], closed: true });
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("start_time")
    .eq("date", date)
    .eq("status", "active");

  if (error) {
    return Response.json({ error: "Ошибка базы данных" }, { status: 500 });
  }

  const takenSet = new Set((data ?? []).map((b) => b.start_time as string));
  const isToday = date === todayLocal();
  const nowMin = nowMinutesLocal();

  const slots: SlotView[] = generateDaySlots().map((s) => ({
    start: s.start,
    end: s.end,
    taken: takenSet.has(s.start),
    // За 30 минут до начала запись закрываем.
    past: isToday && s.startMinutes - 30 <= nowMin,
  }));

  return Response.json({ slots });
}

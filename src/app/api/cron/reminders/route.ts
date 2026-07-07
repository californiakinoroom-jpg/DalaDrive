import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { notifyStudentReminder } from "@/lib/whatsapp";
import { todayLocal } from "@/lib/dates";
import type { Booking } from "@/lib/types";

// GET /api/cron/reminders
// Отправляет напоминания курсантам, у кого занятие ЗАВТРА.
// Защищено секретом: заголовок Authorization: Bearer <CRON_SECRET>
// или ?key=<CRON_SECRET>. Запускается Vercel Cron раз в сутки.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const key = req.nextUrl.searchParams.get("key");
  if (secret && auth !== `Bearer ${secret}` && key !== secret) {
    return Response.json({ error: "Нет доступа" }, { status: 401 });
  }

  // Завтрашняя дата по времени Шымкента.
  const tomorrow = new Date(todayLocal() + "T00:00:00Z");
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("date", tomorrowStr)
    .eq("status", "active");

  const bookings = (data ?? []) as Booking[];
  const results = await Promise.allSettled(
    bookings.map((b) =>
      notifyStudentReminder({
        student_name: b.student_name,
        phone: b.phone,
        date: b.date,
        start_time: b.start_time,
        end_time: b.end_time,
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return Response.json({ ok: true, date: tomorrowStr, total: bookings.length, sent });
}

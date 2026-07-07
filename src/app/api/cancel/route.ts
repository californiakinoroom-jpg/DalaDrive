import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SCHEDULE } from "@/lib/config";
import { slotDateTimeUTC } from "@/lib/dates";
import { notifyAdminCancelled } from "@/lib/whatsapp";

// POST /api/cancel { token }
// Отмена курсантом по ссылке. Разрешена не позднее чем за cancelMinHours до занятия.
export async function POST(req: NextRequest) {
  let token = "";
  try {
    token = ((await req.json()).token ?? "").trim();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (!token) {
    return Response.json({ error: "Нет кода отмены" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("cancel_token", token)
    .single();

  if (error || !booking) {
    return Response.json({ error: "Запись не найдена" }, { status: 404 });
  }
  if (booking.status === "cancelled") {
    return Response.json({ ok: true, alreadyCancelled: true });
  }
  if (booking.status !== "active") {
    return Response.json({ error: "Запись нельзя отменить" }, { status: 400 });
  }

  // Проверка окна отмены (>= 24 часа).
  const startsAt = slotDateTimeUTC(booking.date, booking.start_time);
  const hoursLeft = (startsAt.getTime() - Date.now()) / 3600000;
  if (hoursLeft < SCHEDULE.cancelMinHours) {
    return Response.json(
      {
        error: `Отменить можно не позднее чем за ${SCHEDULE.cancelMinHours} ч. Позвоните в автошколу.`,
      },
      { status: 400 }
    );
  }

  const { error: upErr } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", booking.id);

  if (upErr) {
    return Response.json({ error: "Не удалось отменить" }, { status: 500 });
  }

  try {
    await notifyAdminCancelled({
      student_name: booking.student_name,
      phone: booking.phone,
      date: booking.date,
      start_time: booking.start_time,
      end_time: booking.end_time,
    });
  } catch {
    // игнорируем
  }

  return Response.json({ ok: true });
}

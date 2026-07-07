import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { notifyAdminCancelled } from "@/lib/whatsapp";
import type { BookingStatus } from "@/lib/types";

const ALLOWED: BookingStatus[] = ["active", "cancelled", "attended", "no_show"];

// PATCH /api/admin/booking { id, status }
// Изменение статуса записи администратором.
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Нет доступа" }, { status: 401 });
  }

  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const id = (body.id ?? "").trim();
  const status = (body.status ?? "").trim() as BookingStatus;
  if (!id || !ALLOWED.includes(status)) {
    return Response.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
  if (!booking) {
    return Response.json({ error: "Запись не найдена" }, { status: 404 });
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);
  if (error) {
    return Response.json({ error: "Не удалось обновить" }, { status: 500 });
  }

  // Уведомление админу об отмене (для истории/другого сотрудника).
  if (status === "cancelled" && booking.status === "active") {
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
  }

  return Response.json({ ok: true });
}

// DELETE /api/admin/booking { id }
// Полное удаление записи администратором.
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Нет доступа" }, { status: 401 });
  }

  let id = "";
  try {
    id = ((await req.json()).id ?? "").trim();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (!id) {
    return Response.json({ error: "Не указан id" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) {
    return Response.json({ error: "Не удалось удалить" }, { status: 500 });
  }
  return Response.json({ ok: true });
}

// Отправка WhatsApp-сообщений через Green API (https://green-api.com).
// Работает с обычным номером автошколы.
// Если переменные окружения не заданы — просто логируем (не падаем).

import { SCHOOL } from "./config";
import { formatDateLong } from "./dates";

type SendResult = { ok: boolean; skipped?: boolean; error?: string };

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

// Приводит казахстанский номер к международному формату для WhatsApp.
// 8XXXXXXXXXX -> 7XXXXXXXXXX ; +7... -> 7... ; 77.. остаётся.
export function normalizePhone(phone: string): string {
  let d = digitsOnly(phone);
  if (d.length === 11 && d.startsWith("8")) d = "7" + d.slice(1);
  if (d.length === 10) d = "7" + d;
  return d;
}

async function sendMessage(phone: string, text: string): Promise<SendResult> {
  const id = process.env.GREEN_API_ID;
  const token = process.env.GREEN_API_TOKEN;
  if (!id || !token) {
    console.log(`[whatsapp:skipped] -> ${phone}: ${text}`);
    return { ok: false, skipped: true };
  }
  const chatId = `${normalizePhone(phone)}@c.us`;
  const url = `https://api.green-api.com/waInstance${id}/sendMessage/${token}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message: text }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[whatsapp:error] ${res.status} ${body}`);
      return { ok: false, error: `${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[whatsapp:error]", e);
    return { ok: false, error: String(e) };
  }
}

// --- Шаблоны сообщений ---

export async function notifyStudentBooked(b: {
  student_name: string;
  phone: string;
  date: string;
  start_time: string;
  end_time: string;
  cancel_token: string;
}) {
  const link = cancelLink(b.cancel_token);
  const text =
    `Здравствуйте, ${b.student_name}!\n\n` +
    `Вы записаны на практическое занятие в автошколе ${SCHOOL.name}.\n\n` +
    `📅 Дата: ${formatDateLong(b.date)}\n` +
    `🕐 Время: ${b.start_time} - ${b.end_time}\n` +
    `📍 Место: ${SCHOOL.address}\n` +
    `🚗 Авто: ${SCHOOL.car}\n` +
    `💳 Предоплата: ${SCHOOL.prepayment.toLocaleString("ru-RU")} тг (при неявке не возвращается)\n\n` +
    `Если не сможете прийти — отмените не позднее чем за 4 часа:\n${link}\n\n` +
    `Телефон автошколы: ${SCHOOL.phone}`;
  return sendMessage(b.phone, text);
}

export async function notifyAdminBooked(b: {
  student_name: string;
  phone: string;
  date: string;
  start_time: string;
  end_time: string;
}) {
  const admin = process.env.ADMIN_WHATSAPP;
  if (!admin) return { ok: false, skipped: true };
  const text =
    `🆕 Новая запись (${SCHOOL.name})\n\n` +
    `👤 ${b.student_name}\n📞 ${b.phone}\n` +
    `📅 ${formatDateLong(b.date)}\n🕐 ${b.start_time} - ${b.end_time}`;
  return sendMessage(admin, text);
}

export async function notifyAdminCancelled(b: {
  student_name: string;
  phone: string;
  date: string;
  start_time: string;
  end_time: string;
}) {
  const admin = process.env.ADMIN_WHATSAPP;
  if (!admin) return { ok: false, skipped: true };
  const text =
    `❌ Отмена записи (${SCHOOL.name})\n\n` +
    `👤 ${b.student_name}\n📞 ${b.phone}\n` +
    `📅 ${formatDateLong(b.date)}\n🕐 ${b.start_time} - ${b.end_time}`;
  return sendMessage(admin, text);
}

export async function notifyStudentReminder(b: {
  student_name: string;
  phone: string;
  date: string;
  start_time: string;
  end_time: string;
}) {
  const text =
    `⏰ Напоминание, ${b.student_name}!\n\n` +
    `Завтра у вас практическое занятие в ${SCHOOL.name}.\n` +
    `📅 ${formatDateLong(b.date)}\n🕐 ${b.start_time} - ${b.end_time}\n` +
    `📍 ${SCHOOL.address}\n\n` +
    `Телефон: ${SCHOOL.phone}`;
  return sendMessage(b.phone, text);
}

function cancelLink(token: string): string {
  const base = process.env.PUBLIC_BASE_URL || "";
  return `${base}/cancel/${token}`;
}

// Утилиты работы с датами. Используем часовой пояс Шымкента (UTC+5).

export const TZ_OFFSET_HOURS = 5; // Asia/Almaty / Шымкент

// Возвращает "сегодня" по времени Шымкента как YYYY-MM-DD.
export function todayLocal(): string {
  const now = new Date();
  const shifted = new Date(now.getTime() + TZ_OFFSET_HOURS * 3600 * 1000);
  return shifted.toISOString().slice(0, 10);
}

// Текущее время (минуты от начала суток) по Шымкенту.
export function nowMinutesLocal(): number {
  const now = new Date();
  const shifted = new Date(now.getTime() + TZ_OFFSET_HOURS * 3600 * 1000);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

// Список дат на N дней вперёд, начиная с сегодня. Формат YYYY-MM-DD.
export function upcomingDates(days: number): string[] {
  const result: string[] = [];
  const base = new Date(todayLocal() + "T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(base.getTime() + i * 86400000);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

const WEEKDAYS_RU = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

// День недели (0=Вс..6=Сб) для YYYY-MM-DD.
export function weekdayOf(dateStr: string): number {
  return new Date(dateStr + "T00:00:00Z").getUTCDay();
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return `${d.getUTCDate()} ${MONTHS_RU[d.getUTCMonth()]}, ${WEEKDAYS_RU[d.getUTCDay()]}`;
}

export function formatDateShort(dateStr: string): { day: number; weekday: string; month: string } {
  const d = new Date(dateStr + "T00:00:00Z");
  return {
    day: d.getUTCDate(),
    weekday: WEEKDAYS_RU[d.getUTCDay()],
    month: MONTHS_RU[d.getUTCMonth()],
  };
}

// Полночь занятия в UTC (для расчёта разницы < 24ч при отмене).
export function slotDateTimeUTC(dateStr: string, startHHMM: string): Date {
  const [h, m] = startHHMM.split(":").map(Number);
  // Локальное время Шымкента -> UTC = local - offset
  const localMs = new Date(dateStr + "T00:00:00Z").getTime() + (h * 60 + m) * 60000;
  return new Date(localMs - TZ_OFFSET_HOURS * 3600 * 1000);
}

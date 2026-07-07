// Настройки автошколы и расписания.
// Значения по умолчанию; в будущем часть можно вынести в таблицу settings (админка).

export const SCHOOL = {
  name: "DALA DRIVE",
  city: "Шымкент",
  phone: "8-777-325-10-45",
  phoneIntl: "77773251045", // формат для WhatsApp (без +)
  instagram: "avtoshkola_shymkent17",
  slogan: "Жолда сенім - қауіпсіз болашақ!",
} as const;

export const SCHEDULE = {
  // Часы работы
  openHour: 7, // 07:00
  closeHour: 20, // 20:00 - занятие не должно заканчиваться позже
  lessonMinutes: 110, // 1 час 50 минут
  breakMinutes: 10, // перерыв между занятиями
  daysAhead: 30, // запись на месяц вперёд
  workDays: [0, 1, 2, 3, 4, 5, 6] as number[], // 0=Вс ... 6=Сб (7 дней в неделю)
  cancelMinHours: 24, // отмена не позднее чем за сутки
};

export type Slot = {
  start: string; // "07:00"
  end: string; // "08:50"
  startMinutes: number; // минуты от начала суток
};

// Генерирует все слоты рабочего дня по расписанию.
export function generateDaySlots(): Slot[] {
  const slots: Slot[] = [];
  const cycle = SCHEDULE.lessonMinutes + SCHEDULE.breakMinutes;
  const open = SCHEDULE.openHour * 60;
  const close = SCHEDULE.closeHour * 60;

  for (let start = open; start + SCHEDULE.lessonMinutes <= close; start += cycle) {
    const end = start + SCHEDULE.lessonMinutes;
    slots.push({
      start: minutesToHHMM(start),
      end: minutesToHHMM(end),
      startMinutes: start,
    });
  }
  return slots;
}

function minutesToHHMM(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

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

  // Индивидуальные времена начала слотов по дням недели (0=Вс ... 6=Сб).
  // Если день не указан — используется обычная сетка от openHour.
  // Пятница (5): перерыв на джума-намаз 12:50–14:00, дневные занятия с 14:00.
  customStartsByWeekday: {
    5: ["07:00", "09:00", "11:00", "14:00", "16:00", "18:00"],
  } as Record<number, string[] | undefined>,

  // Информационные заметки по дням недели (показываются в интерфейсе).
  noteByWeekday: {
    5: "Пятница: перерыв на джума-намаз 12:50–14:00",
  } as Record<number, string | undefined>,
};

export type Slot = {
  start: string; // "07:00"
  end: string; // "08:50"
  startMinutes: number; // минуты от начала суток
};

// Генерирует слоты для конкретного дня недели.
// Для дней с индивидуальным расписанием берёт заданные времена начала,
// иначе строит обычную сетку от openHour до closeHour.
export function generateDaySlots(weekday?: number): Slot[] {
  const custom =
    weekday != null ? SCHEDULE.customStartsByWeekday[weekday] : undefined;

  if (custom) {
    return custom
      .map((hhmm) => slotFromStart(hhmmToMinutes(hhmm)))
      .filter((s) => s.startMinutes + SCHEDULE.lessonMinutes <= SCHEDULE.closeHour * 60);
  }

  const slots: Slot[] = [];
  const cycle = SCHEDULE.lessonMinutes + SCHEDULE.breakMinutes;
  const open = SCHEDULE.openHour * 60;
  const close = SCHEDULE.closeHour * 60;

  for (let start = open; start + SCHEDULE.lessonMinutes <= close; start += cycle) {
    slots.push(slotFromStart(start));
  }
  return slots;
}

// Заметка для дня недели (или undefined).
export function noteForWeekday(weekday: number): string | undefined {
  return SCHEDULE.noteByWeekday[weekday];
}

function slotFromStart(startMinutes: number): Slot {
  return {
    start: minutesToHHMM(startMinutes),
    end: minutesToHHMM(startMinutes + SCHEDULE.lessonMinutes),
    startMinutes,
  };
}

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHHMM(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

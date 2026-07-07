// Настройки автошколы и расписания.
// Значения по умолчанию; в будущем часть можно вынести в таблицу settings (админка).

export const SCHOOL = {
  name: "DALA DRIVE",
  city: "Шымкент",
  phone: "8-777-325-10-45",
  phoneIntl: "77773251045", // формат для WhatsApp (без +)
  instagram: "avtoshkola_shymkent17",
  slogan: "Жолда сенім - қауіпсіз болашақ!",
  address: "мкр. Нурсат, ТРЦ Метро",
  car: "Hyundai Elantra, АКПП (автомат), гос. номер 808WYM17",
  prepayment: 8000, // тг за урок
} as const;

// Важные условия — показываются на сайте и в подтверждении.
export const RULES: string[] = [
  "Предоплата 8000 тг за урок. При неявке предоплата не возвращается.",
  "Если не сможете прийти — предупредите минимум за 4 часа до занятия.",
  "Место встречи: мкр. Нурсат, ТРЦ Метро.",
  "Учебный автомобиль: Hyundai Elantra, АКПП (автомат), 808WYM17.",
  "Третий человек в учебной езде запрещён.",
  "Вождение в городе — с 18 лет. До 18 лет занятия проводятся только в автодроме.",
];

export const SCHEDULE = {
  // Часы работы
  openHour: 7, // 07:00
  closeHour: 20, // 20:00 - занятие не должно заканчиваться позже
  lessonMinutes: 105, // 1 час 45 минут
  startStepMinutes: 120, // занятия начинаются каждые 2 часа (07:00, 09:00, ...)
  daysAhead: 30, // запись на месяц вперёд
  workDays: [0, 1, 2, 3, 4, 5, 6] as number[], // 0=Вс ... 6=Сб (7 дней в неделю)
  cancelMinHours: 4, // отмена не позднее чем за 4 часа до занятия

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
  const step = SCHEDULE.startStepMinutes;
  const open = SCHEDULE.openHour * 60;
  const close = SCHEDULE.closeHour * 60;

  for (let start = open; start + SCHEDULE.lessonMinutes <= close; start += step) {
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

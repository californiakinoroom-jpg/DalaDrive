import { Logo } from "@/components/Logo";
import { BookingWidget } from "@/components/BookingWidget";
import { SCHOOL, SCHEDULE } from "@/lib/config";
import { upcomingDates, formatDateShort, weekdayOf } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default function Home() {
  const dates = upcomingDates(SCHEDULE.daysAhead).map((date) => {
    const s = formatDateShort(date);
    return {
      date,
      day: s.day,
      weekday: s.weekday,
      month: s.month,
      isWorkday: SCHEDULE.workDays.includes(weekdayOf(date)),
    };
  });

  return (
    <>
      {/* Шапка */}
      <header className="bg-brand">
        <div className="mx-auto max-w-3xl px-5 py-4 flex items-center justify-between">
          <Logo variant="light" />
          <a
            href={`tel:${SCHOOL.phone.replace(/[^\d+]/g, "")}`}
            className="hidden sm:block text-sm font-medium text-accent hover:text-white transition"
          >
            {SCHOOL.phone}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-3xl px-5 pb-10 pt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            Запись на практическое занятие
          </h1>
          <p className="mt-2 text-white/75 max-w-xl">
            Автошкола {SCHOOL.name}, {SCHOOL.city}. Выберите удобный день и время —
            запись занимает меньше минуты.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Badge>7 дней в неделю</Badge>
            <Badge>07:00–20:00</Badge>
            <Badge>Занятие 1 ч 50 мин</Badge>
          </div>
        </div>
      </section>

      {/* Виджет записи */}
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-5 -mt-6 pb-12">
          <BookingWidget dates={dates} phone={SCHOOL.phone} />
        </div>
      </main>

      {/* Подвал */}
      <footer className="bg-brand-dark text-white/80">
        <div className="mx-auto max-w-3xl px-5 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Logo variant="light" />
            <p className="mt-3 text-sm text-accent">{SCHOOL.slogan}</p>
          </div>
          <div className="text-sm space-y-1">
            <a
              href={`tel:${SCHOOL.phone.replace(/[^\d+]/g, "")}`}
              className="block hover:text-white transition"
            >
              📞 {SCHOOL.phone}
            </a>
            <a
              href={`https://instagram.com/${SCHOOL.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-white transition"
            >
              📷 @{SCHOOL.instagram}
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 text-white/90">
      {children}
    </span>
  );
}

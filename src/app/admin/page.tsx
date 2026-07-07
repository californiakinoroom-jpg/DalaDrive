import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { AdminBookingRow } from "@/components/AdminBookingRow";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { todayLocal, formatDateLong } from "@/lib/dates";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const today = todayLocal();
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  const bookings = (data ?? []) as Booking[];

  // Группировка по дате.
  const byDate = new Map<string, Booking[]>();
  for (const b of bookings) {
    if (!byDate.has(b.date)) byDate.set(b.date, []);
    byDate.get(b.date)!.push(b);
  }

  const activeToday = bookings.filter(
    (b) => b.date === today && b.status === "active"
  ).length;
  const activeTotal = bookings.filter((b) => b.status === "active").length;

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-brand">
        <div className="mx-auto max-w-3xl px-5 py-4 flex items-center justify-between">
          <Logo variant="light" />
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-accent hover:text-white transition">
              Сайт записи
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h1 className="text-2xl font-bold text-brand">Записи</h1>
          <div className="mt-3 flex gap-3">
            <Stat label="Активных сегодня" value={activeToday} />
            <Stat label="Активных всего" value={activeTotal} />
          </div>

          {byDate.size === 0 ? (
            <p className="mt-8 text-foreground/50">Пока нет предстоящих записей.</p>
          ) : (
            <div className="mt-6 space-y-7">
              {[...byDate.entries()].map(([date, items]) => (
                <section key={date}>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
                    {formatDateLong(date)}
                    {date === today && (
                      <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">
                        сегодня
                      </span>
                    )}
                  </h2>
                  <div className="space-y-2">
                    {items.map((b) => (
                      <AdminBookingRow key={b.id} b={b} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="text-2xl font-bold text-brand">{value}</div>
      <div className="text-xs text-foreground/55">{label}</div>
    </div>
  );
}

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CancelButton } from "@/components/CancelButton";
import { supabaseAdmin } from "@/lib/supabase";
import { SCHEDULE, SCHOOL } from "@/lib/config";
import { formatDateLong, slotDateTimeUTC } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function CancelPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = supabaseAdmin();
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("cancel_token", token)
    .single();

  const hoursLeft = booking
    ? (slotDateTimeUTC(booking.date, booking.start_time).getTime() - Date.now()) / 3600000
    : 0;
  const canCancel =
    !!booking && booking.status === "active" && hoursLeft >= SCHEDULE.cancelMinHours;

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-brand">
        <div className="mx-auto max-w-lg px-5 py-4">
          <Link href="/">
            <Logo variant="light" />
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-lg px-5 py-10">
          <div className="rounded-2xl bg-surface border border-border p-6 shadow-sm">
            <h1 className="text-xl font-bold text-brand">Отмена записи</h1>

            {!booking ? (
              <p className="mt-4 text-foreground/70">
                Запись не найдена. Возможно, ссылка устарела.
              </p>
            ) : booking.status === "cancelled" ? (
              <p className="mt-4 text-foreground/70">
                Эта запись уже отменена.
              </p>
            ) : (
              <>
                <div className="mt-4 rounded-xl bg-muted/60 p-4 space-y-1.5">
                  <Row label="Курсант">{booking.student_name}</Row>
                  <Row label="Дата">{formatDateLong(booking.date)}</Row>
                  <Row label="Время">
                    {booking.start_time} — {booking.end_time}
                  </Row>
                </div>

                {canCancel ? (
                  <p className="mt-4 text-sm text-foreground/60">
                    Вы можете отменить эту запись. Слот сразу освободится для
                    других курсантов.
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-danger">
                    Отменить можно не позднее чем за {SCHEDULE.cancelMinHours} ч до
                    занятия. Пожалуйста, позвоните в автошколу: {SCHOOL.phone}.
                  </p>
                )}

                <div className="mt-5">
                  <CancelButton token={token} canCancel={canCancel} />
                </div>
              </>
            )}

            <Link
              href="/"
              className="mt-6 block text-center text-sm text-brand hover:underline"
            >
              ← Вернуться к записи
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-foreground/55">{label}</span>
      <span className="font-semibold">{children}</span>
    </div>
  );
}

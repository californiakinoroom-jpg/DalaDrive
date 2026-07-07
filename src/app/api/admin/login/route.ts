import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminSessionValue, checkPassword } from "@/lib/auth";

// POST /api/admin/login { password }
export async function POST(req: NextRequest) {
  let password = "";
  try {
    password = ((await req.json()).password ?? "").toString();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return Response.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  });
  return res;
}

// POST-выход можно сделать здесь же через DELETE.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

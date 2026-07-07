"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="text-sm text-white/70 hover:text-white transition"
    >
      Выйти
    </button>
  );
}

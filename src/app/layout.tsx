import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { SCHOOL } from "@/lib/config";

const rubik = Rubik({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `Онлайн-запись — Автошкола ${SCHOOL.name}`,
  description: `Запись на практическое занятие по вождению в автошколе ${SCHOOL.name}, ${SCHOOL.city}. Выберите удобный день и время.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${rubik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

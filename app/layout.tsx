import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Гід туриста — Етап 1",
  description:
    "Клікабельний прототип Telegram Mini App, партнерського кабінету й адмінсистеми.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}

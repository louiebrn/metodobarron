import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Área de membros · Método Barron",
    template: "%s · Método Barron",
  },
  description: "Área de membros do Método Barron. Módulos, prática e ranking mensal.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

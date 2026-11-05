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
      <body>
        <div className="aurora" aria-hidden="true">
          <span className="b b1" />
          <span className="b b2" />
          <span className="b b3" />
        </div>
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

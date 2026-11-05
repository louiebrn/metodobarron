import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://metodobarron.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Método Barron | Day trade nos futuros NQ e ES com método, do simulador ao plano de 30 dias",
    template: "%s · Método Barron",
  },
  description:
    "Método Barron: day trade nos futuros NQ e ES com método, do simulador ao plano de 30 dias. Conteúdo educacional, sem promessas milagrosas.",
  applicationName: "Método Barron",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Método Barron",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Método Barron — prática, risco e disciplina.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

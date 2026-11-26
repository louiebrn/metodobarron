import type { Metadata } from "next";
import { Funnel } from "@/components/marketing/funnel";

const description =
  "Diagnóstico grátis de 60 segundos da tropa do Barron (TikTok 50k+, Instagram 30k+) para futuros NQ e ES. Conteúdo educacional, sem promessa de lucro.";

export const metadata: Metadata = {
  title: {
    absolute: "Método Barron | Day trade com método, não no escuro",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Método Barron: day trade com método",
    description,
    url: "/",
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
    title: "Método Barron: day trade com método",
    description,
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return <Funnel />;
}

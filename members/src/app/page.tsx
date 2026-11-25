import type { Metadata } from "next";
import { Funnel } from "@/components/marketing/funnel";
import { formatFollowers, followerTotal } from "@/lib/follower-format";
import { readFollowerFile } from "@/lib/followers";

const counts = readFollowerFile();
const totalLabel = formatFollowers(followerTotal(counts));

const description = `Diagnóstico grátis de 60 segundos da tropa do Barron (+${totalLabel} no Instagram e TikTok) para futuros NQ e ES. Conteúdo educacional, sem promessa de lucro.`;

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
  return <Funnel instagram={counts.instagram} tiktok={counts.tiktok} />;
}

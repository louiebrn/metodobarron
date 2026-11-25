import type { Metadata } from "next";
import { Funnel } from "@/components/marketing/funnel";
import { formatFollowers, followerTotal } from "@/lib/follower-format";
import { readFollowerFile } from "@/lib/followers";

const counts = readFollowerFile();
const totalLabel = formatFollowers(followerTotal(counts));

const description = `Quiz de 1 minuto da tropa do Barron (+${totalLabel} no Instagram e TikTok) para o próximo passo no day trade dos futuros NQ e ES. Conteúdo educacional, sem promessa de lucro.`;

export const metadata: Metadata = {
  title: {
    absolute: "Método Barron | Descubra o seu próximo passo no day trade",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Método Barron: o seu próximo passo no day trade",
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
    title: "Método Barron: o seu próximo passo no day trade",
    description,
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return <Funnel instagram={counts.instagram} tiktok={counts.tiktok} />;
}

import type { Metadata } from "next";
import { MarketingBoot } from "@/components/marketing/home-client";
import { homeBodyHtml } from "@/components/marketing/home-body";
import { config } from "@/lib/config";
import "@/components/marketing/home.css";

const description =
  "Método Barron, curso para iniciantes por Barron (+78 mil seguidores no Instagram e TikTok): aprenda a operar os futuros americanos NQ (Nasdaq-100) e ES (S&P 500) do jeito certo, do Brasil para o mercado americano, começando no simulador, com gestão de risco e sem promessas milagrosas. De R$197 por R$97 no lançamento.";

const socialDescription =
  "Aprenda a operar os futuros NQ e ES do jeito certo com Barron (+78 mil seguidores no Instagram e TikTok): no simulador, com gestão de risco e sem promessas milagrosas. Preço de lançamento: R$97.";

export const metadata: Metadata = {
  title: {
    absolute:
      "Método Barron | Day trade nos futuros NQ e ES com método, do simulador ao plano de 30 dias",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Método Barron: day trade com método de verdade",
    description: socialDescription,
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
    title: "Método Barron: day trade com método de verdade",
    description:
      "Curso educacional de day trade nos futuros NQ e ES por Barron (+78 mil seguidores no Instagram e TikTok): simulador, gestão de risco e um plano de 30 dias.",
    images: ["/og-image.png"],
  },
};

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export default function HomePage() {
  const checkout = escapeAttr(config.paymentLinkUrl);
  const html = homeBodyHtml.replaceAll('href="#checkout"', `href="${checkout}"`);
  return (
    <>
      <div className="mkt js" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
      <MarketingBoot checkoutUrl={config.paymentLinkUrl} />
    </>
  );
}

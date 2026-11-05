import type { Metadata } from "next";
import { Backdrop } from "@/components/backdrop";

export const metadata: Metadata = {
  title: {
    default: "Área de membros",
    template: "%s · Método Barron",
  },
  description: "Área de membros do Método Barron. Módulos, prática e ranking mensal.",
  robots: { index: false, follow: false },
};

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Backdrop />
      {children}
    </>
  );
}

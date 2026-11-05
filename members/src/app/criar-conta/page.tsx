import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth-forms";
import { Logo } from "@/components/logo";
import { config } from "@/lib/config";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Criar conta" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/painel");
  return (
    <div className="auth">
      <div className="auth-card">
        <Logo href={config.marketingUrl} />
        <p className="kicker">
          <span className="dot" /> Criar conta
        </p>
        <h1>Escolha seu nome no ranking.</h1>
        <p className="lede">
          Use o mesmo e-mail da assinatura na Stripe. A senha fica só com você — a gente não envia senha por e-mail.
        </p>
        <SignupForm />
        <p className="switch">
          <span>Já tem conta?</span>
          <a href="/entrar">Entrar</a>
        </p>
        <p className="fine">Conteúdo educacional. Não é recomendação de investimento.</p>
      </div>
    </div>
  );
}

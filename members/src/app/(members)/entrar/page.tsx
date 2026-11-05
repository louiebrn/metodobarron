import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/painel");
  return (
    <div className="auth">
      <div className="auth-card">
        <Logo href="/" />
        <p className="kicker">
          <span className="dot" /> Entrar
        </p>
        <h1>Bem-vindo de volta.</h1>
        <p className="lede">Use o e-mail e a senha da sua conta de membro.</p>
        <LoginForm />
        <p className="switch">
          <span>Ainda não tem conta?</span>
          <a href="/criar-conta">Criar conta</a>
        </p>
      </div>
    </div>
  );
}

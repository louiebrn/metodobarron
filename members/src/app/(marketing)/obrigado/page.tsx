import type { Metadata } from "next";
import { DocPage } from "@/components/marketing/doc-page";

export const metadata: Metadata = {
  title: { absolute: "Compra Confirmada — Método Barron" },
  description: "Sua assinatura do Método Barron foi confirmada. Crie a conta de membro com o mesmo e-mail da compra.",
  robots: { index: false, follow: false },
};

export default function ObrigadoPage() {
  return (
    <DocPage
      variant="svg"
      thanks
      footer={
        <>
          {" "}
          · <a href="/termos">Termos de Uso</a> · <a href="/privacidade">Política de Privacidade</a>
        </>
      }
    >
      <div className="check">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12l5 5L20 6" />
        </svg>
      </div>
      <h1>Compra confirmada!</h1>
      <p className="lead">
        Seja bem-vindo(a) ao Método Barron. Sua assinatura foi ativada com sucesso — falta pouco para você começar.
      </p>

      <div className="steps">
        <div className="step">
          <span className="step-num">01</span>
          <p>
            <strong>Crie sua conta de membro</strong>
            Use o mesmo e-mail da compra na Stripe. Escolha uma senha e um nome de usuário para o ranking. A senha não é
            enviada por e-mail.
          </p>
        </div>
        <div className="step">
          <span className="step-num">02</span>
          <p>
            <strong>Acesse os módulos</strong>
            Com a assinatura ativa, os 8 módulos liberam. Quizzes e práticas somam pontos no ranking do mês.
          </p>
        </div>
        <div className="step">
          <span className="step-num">03</span>
          <p>
            <strong>Entre no Telegram</strong>
            Tire dúvidas no grupo enquanto pratica no simulador.
          </p>
        </div>
      </div>

      <a href="/criar-conta?pago=1" className="btn">
        Criar minha conta
      </a>
      <p style={{ marginTop: 20 }}>
        <a href="https://t.me/+Mj-tOeCA_whhYmU0" target="_blank" rel="noopener" style={{ fontSize: 14 }}>
          Entrar no grupo do Telegram →
        </a>
      </p>
      <p className="support">
        Alguma dúvida? Fale com a gente pelo{" "}
        <a href="https://wa.me/5511910868069" target="_blank" rel="noopener">
          WhatsApp
        </a>
        .
      </p>
    </DocPage>
  );
}

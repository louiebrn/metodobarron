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
            <strong>Confira o e-mail da compra</strong>
            A Stripe envia o recibo para o e-mail usado no pagamento. A senha da área de membros não vai nesse e-mail.
          </p>
        </div>
        <div className="step">
          <span className="step-num">02</span>
          <p>
            <strong>Entre na área de membros</strong>
            Crie a conta com o mesmo e-mail da Stripe, ou entre se ela já existir. Com a assinatura ativa, os 8 módulos
            liberam.
          </p>
        </div>
        <div className="step">
          <span className="step-num">03</span>
          <p>
            <strong>Entre na Tropa do Barron</strong>
            O grupo no Telegram é o lugar para acompanhar a tropa enquanto você pratica no simulador.
          </p>
        </div>
      </div>

      <a href="/criar-conta?pago=1" className="btn">
        Acessar a área de membros
      </a>
      <p style={{ marginTop: 20 }}>
        <a href="https://t.me/+Mj-tOeCA_whhYmU0" target="_blank" rel="noopener" style={{ fontSize: 14 }}>
          Entre na Tropa do Barron →
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

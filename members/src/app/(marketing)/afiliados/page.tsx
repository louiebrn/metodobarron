import type { Metadata } from "next";
import { DocPage } from "@/components/marketing/doc-page";

export const metadata: Metadata = {
  title: { absolute: "Programa de Afiliados — Método Barron" },
  description:
    "Torne-se um afiliado do Método Barron e ganhe 10% de comissão em cada venda, nos planos mensal e anual.",
  alternates: { canonical: "/afiliados" },
};

export default function AfiliadosPage() {
  return (
    <DocPage
      variant="svg"
      footer={
        <>
          {" "}
          · <a href="/termos">Termos de Uso</a> · <a href="/privacidade">Política de Privacidade</a>
        </>
      }
    >
      <span className="eyebrow">Programa de Afiliados</span>
      <h1>Ganhe promovendo o Método Barron.</h1>
      <p className="lead">
        Buscamos afiliados que queiram promover uma plataforma de educação e mentoria voltada a quem quer aprender
        habilidades práticas de geração de renda — e-commerce, marketing digital, trading, criptomoedas, inteligência
        artificial e copywriting.
      </p>

      <h2>Comissão</h2>
      <div className="commission-card">
        <div className="commission-item">
          <strong>10%</strong>
          <span>Por venda no plano Mensal (R$97)</span>
        </div>
        <div className="commission-item">
          <strong>10%</strong>
          <span>Por venda no plano Anual (R$697)</span>
        </div>
      </div>
      <p>Comissão paga automaticamente pela Hotmart a cada venda aprovada através do seu link de afiliado.</p>

      <h2>Por Que Promover o Método Barron</h2>
      <ul>
        <li>Nicho de alta demanda no Brasil: educação financeira e empreendedorismo digital.</li>
        <li>Ticket de entrada acessível, o que ajuda na conversão.</li>
        <li>Produto com posicionamento claro e página de vendas já otimizada.</li>
      </ul>

      <h2>Regras Para Afiliados</h2>
      <ul>
        <li>
          Não são permitidas promessas de resultado financeiro garantido nas suas divulgações. Resultados variam de
          pessoa para pessoa.
        </li>
        <li>Proibido spam, mensagens não solicitadas ou práticas enganosas.</li>
        <li>Divulgação usando &quot;Método Barron&quot; como palavra-chave em anúncios pagos requer autorização prévia.</li>
      </ul>

      <div className="cta-block">
        <p>Pronto para começar? Solicite sua afiliação pela Hotmart e comece a divulgar assim que for aprovado.</p>
        <a href="COLE-AQUI-SEU-LINK-DE-AFILIACAO-HOTMART" className="btn">
          Quero Ser Afiliado
        </a>
      </div>
      <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-dim)" }}>
        Dúvidas? Fale com a gente pelo <span className="placeholder">[e-mail ou WhatsApp de contato para afiliados]</span>.
      </p>
    </DocPage>
  );
}

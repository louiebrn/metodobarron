import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { config } from "@/lib/config";
import { getCurrentUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/painel");

  return (
    <div className="auth">
      <div className="auth-card">
        <Logo href={config.marketingUrl} />
        <p className="kicker">
          <span className="dot" /> Área de membros
        </p>
        <h1>
          Seu plano, <span className="grad">no seu ritmo.</span>
        </h1>
        <p className="lede">
          Depois da assinatura de R$97 por mês, crie sua conta com o mesmo e-mail da compra. Os 8 módulos ficam
          liberados enquanto a assinatura estiver ativa.
        </p>
        <div className="row-actions" style={{ marginTop: 22 }}>
          <a className="btn btn-primary" href="/criar-conta">
            Criar conta
          </a>
          <a className="btn btn-ghost" href="/entrar">
            Entrar
          </a>
        </div>
        <p className="fine">
          Conteúdo educacional. Não é recomendação de investimento.{" "}
          <a href={config.marketingUrl}>Voltar ao site</a>
        </p>
      </div>
    </div>
  );
}

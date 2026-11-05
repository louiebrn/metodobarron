import { Logo } from "@/components/logo";
import { config } from "@/lib/config";

export default function NotFound() {
  return (
    <div className="auth">
      <div className="auth-card">
        <Logo href={config.marketingUrl} />
        <h1 style={{ marginTop: 18 }}>Página não encontrada.</h1>
        <p className="lede">Esse endereço não existe na área de membros.</p>
        <div className="row-actions" style={{ marginTop: 18 }}>
          <a className="btn btn-primary" href="/painel">
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

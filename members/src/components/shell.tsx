import { logout } from "@/actions/auth";
import { formatPoints } from "@/lib/time";
import { Logo } from "./logo";
import { Nav } from "./nav";

export function Shell({
  username,
  points,
  children,
}: {
  username: string;
  points: number;
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <header className="topbar">
        <Logo href="/painel" />
        <Nav variant="desktop" />
        <div className="top-actions">
          <span className="points-chip" title={`Pontos de @${username} neste mês`}>
            <b className="mono">{formatPoints(points)}</b> pts
          </span>
          <form action={logout} className="logout-desktop">
            <button className="btn btn-ghost" type="submit">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="main">
        {children}
        <p className="footer-note">
          Conteúdo educacional. Não é recomendação de investimento.{" "}
          <a href="/">Voltar ao site</a>
        </p>
      </main>
      <Nav variant="tab" />
    </div>
  );
}

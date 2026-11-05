import type { Metadata } from "next";
import { logout } from "@/actions/auth";
import { toggleDemoAccess } from "@/actions/account";
import { PortalButton, UsernameForm } from "@/components/account-forms";
import { statusLabel } from "@/lib/access";
import { checkoutUrl, isDemoMode } from "@/lib/config";
import { flashMessage } from "@/lib/notices";
import { requireUser } from "@/lib/session";
import { formatDateTime } from "@/lib/time";

export const metadata: Metadata = { title: "Conta" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const flash = flashMessage(query.aviso);
  const sub = user.subscription;
  const demo = isDemoMode();

  return (
    <>
      <header className="page-head">
        <p className="kicker">
          <span className="dot" /> Conta
        </p>
        <h1>@{user.username}</h1>
        <p>{user.email}</p>
      </header>

      {flash ? <p className={flash.tone === "ok" ? "alert alert-ok" : "alert alert-warn"}>{flash.text}</p> : null}

      <div className="stack">
        <section className="card">
          <h2>Nome no ranking</h2>
          <UsernameForm username={user.username} />
        </section>

        <section className="card">
          <h2>Assinatura</h2>
          <p>
            Status: <span className={user.access ? "pill pill-ok" : "pill pill-bad"}>{statusLabel(sub?.status)}</span>
          </p>
          <p className="muted">
            {user.access
              ? "Módulos liberados."
              : "Módulos bloqueados. A mensalidade precisa estar ativa (ou em teste) para abrir as aulas."}
          </p>
          {sub?.currentPeriodEnd ? (
            <p className="dim">Período atual até {formatDateTime(sub.currentPeriodEnd)} (horário de Brasília).</p>
          ) : null}
          {sub?.source === "demo" ? <p className="dim">Origem: demonstração local, não é uma cobrança Stripe.</p> : null}
          {sub?.stripeCustomerId ? <p className="dim mono">Cliente {sub.stripeCustomerId}</p> : null}
          <div className="row-actions">
            {!user.access ? (
              <a className="btn btn-primary" href={checkoutUrl(user)}>
                Assinar por R$97/mês
              </a>
            ) : null}
            <PortalButton />
          </div>
        </section>

        {demo ? (
          <section className="card">
            <h2>Modo demonstração</h2>
            <p className="muted">
              Sem chaves da Stripe, você pode ligar ou desligar o acesso para ver os módulos bloqueados e liberados.
              Isto não cria uma cobrança.
            </p>
            <form action={toggleDemoAccess}>
              <input type="hidden" name="active" value={user.access ? "0" : "1"} />
              <button className="btn btn-ghost" type="submit">
                {user.access ? "Desligar acesso de demonstração" : "Ligar acesso de demonstração"}
              </button>
            </form>
          </section>
        ) : null}

        <form action={logout}>
          <button className="btn btn-ghost" type="submit">
            Sair da conta
          </button>
        </form>
      </div>
    </>
  );
}

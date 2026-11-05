import type { Metadata } from "next";
import Link from "next/link";
import { checkoutUrl, isDemoMode } from "@/lib/config";
import { getDb } from "@/lib/db";
import { MODULES } from "@/lib/modules";
import { leaderboard, listProgress, monthlyScore } from "@/lib/points";
import { requireUser } from "@/lib/session";
import { statusLabel } from "@/lib/access";
import { formatMonth, formatPoints, monthKey } from "@/lib/time";

export const metadata: Metadata = { title: "Início" };

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();
  const month = monthKey();
  const score = monthlyScore(db, user.id, month);
  const board = leaderboard(db, month);
  const place = board.find((row) => row.userId === user.id);
  const progress = listProgress(db, user.id);
  const done = new Set(progress.filter((row) => row.quiz_completed_at).map((row) => row.module_slug));
  const next = MODULES.find((module) => !done.has(module.slug)) ?? MODULES[0];

  return (
    <>
      <header className="page-head">
        <p className="kicker">
          <span className="dot" /> {formatMonth(month)}
        </p>
        <h1>Olá, @{user.username}.</h1>
        <p>Quizzes e práticas deste mês somam pontos. O ranking zera no dia 1º.</p>
      </header>

      {!user.access ? (
        <section className="banner">
          <div>
            <strong>Assinatura inativa</strong>
            <p>
              Os módulos ficam bloqueados até a mensalidade de R$97 estar ativa
              {user.subscription ? ` (status: ${statusLabel(user.subscription.status).toLowerCase()})` : ""}. Use o
              mesmo e-mail desta conta no checkout.
            </p>
          </div>
          <div className="row-actions">
            <a className="btn btn-primary" href={checkoutUrl(user)}>
              Assinar por R$97/mês
            </a>
            {isDemoMode() ? (
              <a className="btn btn-ghost" href="/conta">
                Simular acesso
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="grid stats">
        <article className="card stat">
          <span>Pontos no mês</span>
          <b className="mono">{formatPoints(score?.points ?? 0)}</b>
        </article>
        <article className="card stat">
          <span>Posição</span>
          <b className="mono">{place ? `${place.rank}º` : "—"}</b>
        </article>
        <article className="card stat">
          <span>Quizzes feitos</span>
          <b className="mono">
            {done.size}
            <span style={{ fontSize: "1rem", color: "var(--muted)" }}> / {MODULES.length}</span>
          </b>
        </article>
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <h2>{user.access ? "Continuar" : "Próximo módulo"}</h2>
        <p className="muted">
          Módulo {next.number} · {next.title}
        </p>
        <p className="dim">{next.summary}</p>
        <div className="row-actions" style={{ marginTop: 12 }}>
          <Link className="btn btn-primary" href={`/modulos/${next.slug}`}>
            {user.access ? "Abrir módulo" : "Ver módulo"}
          </Link>
          <Link className="btn btn-ghost" href="/modulos">
            Ver os 8 módulos
          </Link>
        </div>
      </section>
    </>
  );
}

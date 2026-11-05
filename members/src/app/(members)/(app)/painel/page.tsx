import type { Metadata } from "next";
import Link from "next/link";
import { checkoutUrl, isDemoMode } from "@/lib/config";
import { getDb } from "@/lib/db";
import { getModule, MODULES } from "@/lib/modules";
import { courseProgress, listCompletedLessons, moduleProgress, nextLesson } from "@/lib/lessons";
import { leaderboard, monthlyScore } from "@/lib/points";
import { requireUser } from "@/lib/session";
import { statusLabel } from "@/lib/access";
import { formatMonth, formatPoints, monthKey } from "@/lib/time";

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export const metadata: Metadata = { title: "Início" };

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();
  const month = monthKey();
  const score = monthlyScore(db, user.id, month);
  const board = leaderboard(db, month);
  const place = board.find((row) => row.userId === user.id);
  const completed = listCompletedLessons(db, user.id);
  const course = courseProgress(completed);
  const upcoming = nextLesson(completed);
  const nextModule = getModule(upcoming?.moduleSlug ?? MODULES[0].slug) ?? MODULES[0];

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
        <section className="gate">
          <div className="lock-seal" aria-hidden="true">
            <LockIcon />
          </div>
          <div>
            <h2>Assinatura inativa</h2>
            <p>
              Os módulos ficam trancados até a mensalidade de R$97 estar ativa
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
        <article className="card stat stat-points">
          <span>Pontos no mês</span>
          <b className="mono">{formatPoints(score?.points ?? 0)}</b>
        </article>
        <article className="card stat">
          <span>Posição</span>
          <b className="mono">{place ? `${place.rank}º` : "—"}</b>
        </article>
        <article className="card stat">
          <span>Aulas feitas</span>
          <b className="mono">
            {course.percent}
            <span style={{ fontSize: "1rem", color: "var(--muted)", fontWeight: 600 }}>%</span>
          </b>
        </article>
      </section>

      <section className="feature">
        <p className="kicker">
          <span className="dot" /> {user.access ? "Continuar" : "Próximo módulo"}
        </p>
        <h2>
          {upcoming ? upcoming.lesson.title : "Trilha concluída"}
        </h2>
        <p>
          Módulo {nextModule.number} · {nextModule.summary}
        </p>
        <div className="bar" aria-hidden="true">
          <i style={{ width: `${course.percent}%` }} />
        </div>
        <div className="meta">
          <span>
            {course.completed} de {course.total} aulas · {course.percent}%
          </span>
          <span>{moduleProgress(completed, nextModule.slug).percent}% deste módulo</span>
        </div>
        <div className="row-actions" style={{ marginTop: 16 }}>
          <Link
            className="btn btn-primary"
            href={upcoming ? `/modulos/${upcoming.moduleSlug}?aula=${upcoming.lesson.slug}` : `/modulos/${nextModule.slug}`}
          >
            {user.access ? "Abrir aula" : "Ver módulo"}
          </Link>
          <Link className="btn btn-ghost" href="/modulos">
            Ver os 8 módulos
          </Link>
        </div>
      </section>
    </>
  );
}

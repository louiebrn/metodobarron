import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { MODULES } from "@/lib/modules";
import { earnedThisMonth, listProgress } from "@/lib/points";
import { requireUser } from "@/lib/session";
import { monthKey } from "@/lib/time";

export const metadata: Metadata = { title: "Módulos" };

export default async function ModulesPage() {
  const user = await requireUser();
  const db = getDb();
  const month = monthKey();
  const progress = new Map(listProgress(db, user.id).map((row) => [row.module_slug, row]));

  return (
    <>
      <header className="page-head">
        <p className="kicker">
          <span className="dot" /> Currículo
        </p>
        <h1>
          8 módulos, <span className="grad">do zero ao plano.</span>
        </h1>
        <p>A mesma trilha do site. Com a assinatura ativa, todos ficam liberados — sem pular a ordem na hora de estudar.</p>
      </header>
      <div className="module-list">
        {MODULES.map((module) => {
          const row = progress.get(module.slug);
          const earned = user.access ? earnedThisMonth(db, user.id, module.slug, month) : null;
          const quizDone = Boolean(row?.quiz_completed_at);
          return (
            <Link key={module.slug} className="module-link" href={`/modulos/${module.slug}`}>
              <span className="num mono">{String(module.number).padStart(2, "0")}</span>
              <span>
                <strong>
                  {module.title} {module.central ? <span className="core">★</span> : null}
                </strong>
                <small>{module.summary}</small>
              </span>
              {!user.access ? (
                <span className="lock-tag">Bloqueado</span>
              ) : (
                <span className={quizDone ? "pill pill-ok" : "pill"}>{earned?.quiz ? "Quiz do mês" : quizDone ? "Rever" : "Abrir"}</span>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}

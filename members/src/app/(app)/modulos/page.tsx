import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { MODULES } from "@/lib/modules";
import { listCompletedLessons, moduleProgress } from "@/lib/lessons";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Módulos" };

export default async function ModulesPage() {
  const user = await requireUser();
  const completed = listCompletedLessons(getDb(), user.id);

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
          const progress = moduleProgress(completed, module.slug);
          return (
            <Link
              key={module.slug}
              className={`module-link${module.central ? " is-central" : ""}${user.access ? "" : " is-locked"}`}
              href={`/modulos/${module.slug}`}
            >
              <span className="num mono">{String(module.number).padStart(2, "0")}</span>
              <span>
                <strong>
                  {module.title}
                  {module.central ? <span className="core-tag">Central</span> : null}
                </strong>
                <small>{module.summary}</small>
              </span>
              {!user.access ? (
                <span className="lock-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                  Trancado
                </span>
              ) : (
                <span className={progress.percent === 100 ? "pill pill-ok" : "pill"}>
                  {progress.percent === 100 ? "100%" : progress.percent > 0 ? `${progress.percent}%` : "Abrir"}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}

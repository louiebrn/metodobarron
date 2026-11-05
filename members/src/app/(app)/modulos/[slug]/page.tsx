import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { submitPractice, submitQuiz } from "@/actions/learn";
import { checkoutUrl } from "@/lib/config";
import { getDb } from "@/lib/db";
import { getModule, MODULES } from "@/lib/modules";
import { flashMessage } from "@/lib/notices";
import { earnedThisMonth } from "@/lib/points";
import { QUIZ_POINTS, PRACTICE_POINTS } from "@/lib/scoring";
import { requireUser } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const module = getModule(slug);
  return { title: module ? `Módulo ${module.number}` : "Módulo" };
}

export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ aviso?: string; pts?: string }>;
}) {
  const { slug } = await params;
  const module = getModule(slug);
  if (!module) notFound();
  const query = await searchParams;
  const flash = flashMessage(query.aviso, query.pts);
  const user = await requireUser();
  const earned = earnedThisMonth(getDb(), user.id, module.slug);
  const index = MODULES.findIndex((item) => item.slug === module.slug);
  const previous = index > 0 ? MODULES[index - 1] : null;
  const next = index < MODULES.length - 1 ? MODULES[index + 1] : null;

  return (
    <>
      <header className="page-head">
        <p className="kicker">
          <span className="dot" /> Módulo {module.number} de 8
          {module.central ? <span className="core"> · módulo central</span> : null}
        </p>
        <h1>{module.title}</h1>
        <p>{module.summary}</p>
      </header>

      {flash ? (
        <p className={flash.tone === "ok" ? "alert alert-ok" : "alert alert-warn"} role="status">
          {flash.text}
        </p>
      ) : null}

      {!user.access ? (
        <section className="banner">
          <div>
            <strong>Módulo bloqueado</strong>
            <p>
              A aula, o quiz e a prática abrem enquanto a assinatura mensal estiver ativa. O checkout usa o e-mail
              desta conta para liberar o acesso.
            </p>
          </div>
          <a className="btn btn-primary" href={checkoutUrl(user)}>
            Assinar por R$97/mês
          </a>
        </section>
      ) : (
        <div className="stack">
          <section className="card">
            <h2>Aulas</h2>
            <p className="lesson-note">Os vídeos entram aqui. Por enquanto, o roteiro de cada aula:</p>
            <ol className="lessons">
              {module.lessons.map((lesson) => (
                <li key={lesson}>
                  {lesson}
                  <div className="dim">Vídeo em breve</div>
                </li>
              ))}
            </ol>
          </section>

          <section className="card">
            <h2>Quiz · {QUIZ_POINTS} pontos</h2>
            <p className="muted">Uma vez por módulo em cada mês. Errar não tira ponto.</p>
            {earned.quiz ? (
              <p className="alert alert-ok">Quiz deste mês já pontuado. {module.quiz.explanation}</p>
            ) : (
              <form action={submitQuiz}>
                <input type="hidden" name="slug" value={module.slug} />
                <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend>{module.quiz.question}</legend>
                  <div className="options">
                    {module.quiz.options.map((option, optionIndex) => (
                      <label className="option" key={option}>
                        <input type="radio" name="answer" value={optionIndex} required />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button className="btn btn-primary" type="submit">
                  Enviar resposta
                </button>
              </form>
            )}
          </section>

          <section className="card">
            <h2>Prática · {PRACTICE_POINTS} pontos</h2>
            <p className="muted">Registre a prática no simulador. Também vale uma vez por mês.</p>
            {earned.practice ? (
              <p className="alert alert-ok">Prática deste mês já registrada.</p>
            ) : (
              <form action={submitPractice}>
                <input type="hidden" name="slug" value={module.slug} />
                {module.practice.map((item) => (
                  <label className="check" key={item.id}>
                    <input type="checkbox" name={item.id} />
                    <span>{item.label}</span>
                  </label>
                ))}
                <button className="btn btn-primary" type="submit">
                  Registrar prática
                </button>
              </form>
            )}
          </section>
        </div>
      )}

      <div className="row-actions" style={{ marginTop: 16 }}>
        {previous ? (
          <Link className="btn btn-ghost" href={`/modulos/${previous.slug}`}>
            Módulo {previous.number}
          </Link>
        ) : null}
        <Link className="btn btn-ghost" href="/modulos">
          Todos os módulos
        </Link>
        {next ? (
          <Link className="btn btn-ghost" href={`/modulos/${next.slug}`}>
            Módulo {next.number}
          </Link>
        ) : null}
      </div>
    </>
  );
}

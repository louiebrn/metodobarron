import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { completeLesson, submitPractice, submitQuiz } from "@/actions/learn";
import { checkoutUrl } from "@/lib/config";
import { getDb, many, one } from "@/lib/db";
import { lessonKey, listCompletedLessons, moduleProgress } from "@/lib/lessons";
import { getModule, MODULES, type Lesson } from "@/lib/modules";
import { flashMessage } from "@/lib/notices";
import { earnedThisMonth } from "@/lib/points";
import { PRACTICE_POINTS, QUIZ_POINTS } from "@/lib/scoring";
import { requireUser } from "@/lib/session";
import { monthKey } from "@/lib/time";
import { videoEmbed } from "@/lib/video";

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
  searchParams: Promise<{ aviso?: string; pts?: string; acertos?: string; total?: string; aula?: string }>;
}) {
  const { slug } = await params;
  const module = getModule(slug);
  if (!module) notFound();
  const query = await searchParams;
  const flash = flashMessage(query);
  const user = await requireUser();
  const db = getDb();
  const month = monthKey();
  const earned = earnedThisMonth(db, user.id, module.slug, month);
  const completed = listCompletedLessons(db, user.id);
  const progress = moduleProgress(completed, module.slug);
  const selected = module.lessons.find((lesson) => lesson.slug === query.aula) ?? module.lessons[0];
  const index = MODULES.findIndex((item) => item.slug === module.slug);
  const previous = index > 0 ? MODULES[index - 1] : null;
  const next = index < MODULES.length - 1 ? MODULES[index + 1] : null;
  const attempt = one<{ answers: string }>(
    db,
    "SELECT answers FROM quiz_attempts WHERE user_id = ? AND module_slug = ? AND month_key = ?",
    user.id,
    module.slug,
    month,
  );
  const answers = attempt ? (JSON.parse(attempt.answers) as number[]) : null;
  const marked = new Set(
    many<{ item_id: string }>(
      db,
      "SELECT item_id FROM practice_marks WHERE user_id = ? AND module_slug = ? AND month_key = ?",
      user.id,
      module.slug,
      month,
    ).map((row) => row.item_id),
  );

  return (
    <>
      <header className="page-head">
        <p className="kicker">
          <span className="dot" /> Módulo {module.number} de 8
          {module.central ? " · central" : ""}
        </p>
        <h1>{module.title}</h1>
        <p>{module.summary}</p>
        <div className="bar" aria-hidden="true">
          <i style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="meta">
          <span>
            {progress.completed} de {progress.total} aulas · {progress.percent}%
          </span>
          <span>{user.access ? "Liberado" : "Trancado"}</span>
        </div>
      </header>

      {flash ? (
        <p className={flash.tone === "ok" ? "alert alert-ok" : "alert alert-warn"} role="status">
          {flash.text}
        </p>
      ) : null}

      {!user.access ? (
        <div className="stack">
          <section className="gate">
            <div className="lock-seal" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
            <div>
              <h2>Este módulo abre com a assinatura.</h2>
              <p>
                As aulas, o quiz e a prática ficam disponíveis enquanto a mensalidade estiver ativa. Crie a conta com o
                mesmo e-mail da Stripe.
              </p>
            </div>
            <a className="btn btn-primary" href={checkoutUrl(user)}>
              Assinar por R$97/mês
            </a>
          </section>
          <section className="card">
            <h2>O que tem aqui</h2>
            <ul className="lesson-nav">
              {module.lessons.map((lesson) => (
                <li key={lesson.slug}>
                  <span>{lesson.title}</span>
                  <span className="mono dim">{lesson.minutes} min</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <div className="stack">
          {selected ? <LessonPlayer moduleSlug={module.slug} lesson={selected} done={completed.has(lessonKey(module.slug, selected.slug))} /> : null}

          <section className="card">
            <h2>Aulas</h2>
            <ul className="lesson-nav">
              {module.lessons.map((lesson, lessonIndex) => {
                const done = completed.has(lessonKey(module.slug, lesson.slug));
                const current = lesson.slug === selected?.slug;
                return (
                  <li key={lesson.slug}>
                    <Link href={`/modulos/${module.slug}?aula=${lesson.slug}`} className={current ? "on" : undefined}>
                      <span className="mono dim">{String(lessonIndex + 1).padStart(2, "0")}</span>
                      <span>
                        {lesson.title}
                        <small className="dim"> {lesson.minutes} min{lesson.videoUrl ? "" : " · vídeo em breve"}</small>
                      </span>
                      <span className={done ? "pill pill-ok" : "pill"}>{done ? "Feita" : "Abrir"}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card" id="quiz">
            <h2>Quiz · até {QUIZ_POINTS} pontos</h2>
            <p className="muted">Cinco perguntas, 2 pontos cada. Uma tentativa por mês. Errar não tira ponto que você já tinha de outra atividade.</p>
            {answers ? (
              <ol className="quiz-review">
                {module.quiz.map((question, questionIndex) => {
                  const picked = answers[questionIndex];
                  const right = picked === question.correctIndex;
                  return (
                    <li key={question.question}>
                      <p>{question.question}</p>
                      <p className={right ? "alert alert-ok" : "alert alert-warn"}>
                        {right ? "Certa." : `A resposta marcada foi «${question.options[picked] ?? "—"}».`} {question.explanation}
                      </p>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <form action={submitQuiz}>
                <input type="hidden" name="slug" value={module.slug} />
                {module.quiz.map((question, questionIndex) => (
                  <fieldset key={question.question}>
                    <legend>
                      {questionIndex + 1}. {question.question}
                    </legend>
                    <div className="options">
                      {question.options.map((option, optionIndex) => (
                        <label className="option" key={option}>
                          <input type="radio" name={`q${questionIndex}`} value={optionIndex} required />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <button className="btn btn-primary" type="submit">
                  Enviar quiz
                </button>
              </form>
            )}
          </section>

          <section className="card" id="pratica">
            <h2>Prática · até {PRACTICE_POINTS} pontos</h2>
            <p className="muted">Cada item vale os pontos ao lado. Você pode completar o checklist ao longo do mês; a nota só sobe.</p>
            <form action={submitPractice}>
              <input type="hidden" name="slug" value={module.slug} />
              {module.practice.map((task) => (
                <label className="check" key={task.id}>
                  <input type="checkbox" name={task.id} defaultChecked={marked.has(task.id)} />
                  <span>
                    {task.label} <b className="mono">+{task.points}</b>
                  </span>
                </label>
              ))}
              <button className="btn btn-primary" type="submit">
                Salvar checklist
              </button>
            </form>
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

function LessonPlayer({ moduleSlug, lesson, done }: { moduleSlug: string; lesson: Lesson; done: boolean }) {
  const embed = videoEmbed(lesson.videoUrl);
  return (
    <section className="card">
      <p className="kicker">
        <span className="dot" /> Aula · {lesson.minutes} min
      </p>
      <h2>{lesson.title}</h2>
      <div className="player">
        {embed?.kind === "youtube" ? (
          <iframe src={embed.src} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : embed?.kind === "file" ? (
          <video controls playsInline preload="metadata" src={embed.src} />
        ) : (
          <div>
            <strong>Player</strong>
            <p className="muted">O vídeo desta aula ainda não foi publicado. A duração prevista é {lesson.minutes} min.</p>
          </div>
        )}
      </div>
      {done ? (
        <p className="alert alert-ok">Aula concluída. O progresso desta conta ficou salvo.</p>
      ) : (
        <form action={completeLesson}>
          <input type="hidden" name="slug" value={moduleSlug} />
          <input type="hidden" name="lesson" value={lesson.slug} />
          <button className="btn btn-primary" type="submit">
            Marcar aula como concluída
          </button>
        </form>
      )}
    </section>
  );
}

"use server";

import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/config";
import { getDb, many, one } from "@/lib/db";
import { markLessonComplete } from "@/lib/lessons";
import { getModule, gradePractice, gradeQuiz } from "@/lib/modules";
import { awardPoints, earnedThisMonth, seedDemoRivals } from "@/lib/points";
import { requireUser } from "@/lib/session";
import { monthKey } from "@/lib/time";

function modulePath(slug: string, aviso: string, extra?: Record<string, string | number | undefined>, lesson?: string): string {
  const params = new URLSearchParams({ aviso });
  if (lesson) params.set("aula", lesson);
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return `/modulos/${slug}?${params.toString()}`;
}

export async function completeLesson(formData: FormData): Promise<void> {
  const user = await requireUser();
  const slug = String(formData.get("slug") ?? "");
  const lesson = String(formData.get("lesson") ?? "");
  const module = getModule(slug);
  if (!module) redirect("/modulos");
  if (!user.access) redirect(modulePath(slug, "sem-acesso", undefined, lesson));
  const result = markLessonComplete(getDb(), { userId: user.id, moduleSlug: slug, lessonSlug: lesson });
  if (!result.ok) redirect(modulePath(slug, "aula-invalida", undefined, lesson));
  redirect(modulePath(slug, result.already ? "aula-ja" : "aula-ok", undefined, lesson));
}

export async function submitQuiz(formData: FormData): Promise<void> {
  const user = await requireUser();
  const slug = String(formData.get("slug") ?? "");
  const module = getModule(slug);
  if (!module) redirect("/modulos");
  if (!user.access) redirect(modulePath(slug, "sem-acesso"));
  const db = getDb();
  const month = monthKey();
  const attempt = one(
    db,
    "SELECT user_id FROM quiz_attempts WHERE user_id = ? AND module_slug = ? AND month_key = ?",
    user.id,
    slug,
    month,
  );
  if (attempt || earnedThisMonth(db, user.id, slug, month).quiz) redirect(modulePath(slug, "quiz-ja"));

  const answers = module.quiz.map((_, index) => Number(formData.get(`q${index}`)));
  const invalid = answers.some((answer, index) => {
    const question = module.quiz[index];
    return !question || !Number.isInteger(answer) || answer < 0 || answer >= question.options.length;
  });
  if (invalid) redirect(modulePath(slug, "quiz-invalido"));

  const graded = gradeQuiz(module, answers);
  db.prepare(
    `INSERT INTO quiz_attempts (user_id, module_slug, month_key, answers, correct_count, points, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(user.id, slug, month, JSON.stringify(answers), graded.correct, graded.points, Date.now());
  const result = awardPoints(db, { userId: user.id, moduleSlug: slug, kind: "quiz", points: graded.points });
  if (!result.ok) redirect(modulePath(slug, "quiz-invalido"));
  redirect(
    modulePath(slug, "quiz-ok", {
      pts: result.points,
      acertos: graded.correct,
      total: graded.total,
    }),
  );
}

export async function submitPractice(formData: FormData): Promise<void> {
  const user = await requireUser();
  const slug = String(formData.get("slug") ?? "");
  const module = getModule(slug);
  if (!module) redirect("/modulos");
  if (!user.access) redirect(modulePath(slug, "sem-acesso"));

  const db = getDb();
  const month = monthKey();
  const checked = module.practice.filter((task) => formData.get(task.id) === "on").map((task) => task.id);
  const prior = many<{ item_id: string }>(
    db,
    "SELECT item_id FROM practice_marks WHERE user_id = ? AND module_slug = ? AND month_key = ?",
    user.id,
    slug,
    month,
  ).map((row) => row.item_id);
  if (checked.length === 0 && prior.length === 0) redirect(modulePath(slug, "pratica-incompleta"));

  const now = Date.now();
  for (const itemId of checked) {
    db.prepare(
      `INSERT INTO practice_marks (user_id, module_slug, month_key, item_id, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (user_id, module_slug, month_key, item_id) DO NOTHING`,
    ).run(user.id, slug, month, itemId, now);
  }
  const all = new Set([...prior, ...checked]);
  const points = gradePractice(module, all);
  const result = awardPoints(db, { userId: user.id, moduleSlug: slug, kind: "practice", points });
  if (!result.ok) redirect(modulePath(slug, "pratica-incompleta"));
  redirect(modulePath(slug, result.awarded ? "pratica-ok" : "pratica-ja", { pts: result.awarded ? result.points : points }));
}

export async function seedRivals(): Promise<void> {
  if (!isDemoMode()) redirect("/ranking");
  await requireUser();
  seedDemoRivals(getDb());
  redirect("/ranking?aviso=exemplos");
}

import type { DatabaseSync } from "node:sqlite";
import { many, one } from "./db";
import { allLessons, getModule, MODULES, type Lesson } from "./modules";

export type LessonProgress = {
  completed: number;
  total: number;
  percent: number;
};

export function progressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export function listCompletedLessons(db: DatabaseSync, userId: string): Set<string> {
  const rows = many<{ module_slug: string; lesson_slug: string }>(
    db,
    "SELECT module_slug, lesson_slug FROM lesson_progress WHERE user_id = ?",
    userId,
  );
  return new Set(rows.map((row) => `${row.module_slug}:${row.lesson_slug}`));
}

export function lessonKey(moduleSlug: string, lessonSlug: string): string {
  return `${moduleSlug}:${lessonSlug}`;
}

export function moduleProgress(completed: Set<string>, moduleSlug: string): LessonProgress {
  const module = getModule(moduleSlug);
  const total = module?.lessons.length ?? 0;
  const done = module?.lessons.filter((lesson) => completed.has(lessonKey(moduleSlug, lesson.slug))).length ?? 0;
  return { completed: done, total, percent: progressPercent(done, total) };
}

export function courseProgress(completed: Set<string>): LessonProgress {
  const total = allLessons().length;
  const done = allLessons().filter(({ moduleSlug, lesson }) => completed.has(lessonKey(moduleSlug, lesson.slug))).length;
  return { completed: done, total, percent: progressPercent(done, total) };
}

export function nextLesson(completed: Set<string>): { moduleSlug: string; lesson: Lesson } | null {
  for (const module of MODULES) {
    for (const lesson of module.lessons) {
      if (!completed.has(lessonKey(module.slug, lesson.slug))) {
        return { moduleSlug: module.slug, lesson };
      }
    }
  }
  return null;
}

export function markLessonComplete(
  db: DatabaseSync,
  input: { userId: string; moduleSlug: string; lessonSlug: string; now?: number },
): { ok: true; already: boolean } | { ok: false; error: string } {
  const module = getModule(input.moduleSlug);
  const lesson = module?.lessons.find((item) => item.slug === input.lessonSlug);
  if (!module || !lesson) return { ok: false, error: "Aula desconhecida." };
  const now = input.now ?? Date.now();
  const existing = one(
    db,
    "SELECT lesson_slug FROM lesson_progress WHERE user_id = ? AND module_slug = ? AND lesson_slug = ?",
    input.userId,
    input.moduleSlug,
    input.lessonSlug,
  );
  if (existing) return { ok: true, already: true };
  db.prepare(
    `INSERT INTO lesson_progress (user_id, module_slug, lesson_slug, completed_at)
     VALUES (?, ?, ?, ?)`,
  ).run(input.userId, input.moduleSlug, input.lessonSlug, now);
  return { ok: true, already: false };
}

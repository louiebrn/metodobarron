"use server";

import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/config";
import { getDb } from "@/lib/db";
import { getModule } from "@/lib/modules";
import { awardPoints, earnedThisMonth, seedDemoRivals } from "@/lib/points";
import { requireUser } from "@/lib/session";

function modulePath(slug: string, aviso: string, pts?: number): string {
  const params = new URLSearchParams({ aviso });
  if (pts) params.set("pts", String(pts));
  return `/modulos/${slug}?${params.toString()}`;
}

export async function submitQuiz(formData: FormData): Promise<void> {
  const user = await requireUser();
  const slug = String(formData.get("slug") ?? "");
  const module = getModule(slug);
  if (!module) redirect("/modulos");
  if (!user.access) redirect(modulePath(slug, "sem-acesso"));
  if (earnedThisMonth(getDb(), user.id, slug).quiz) redirect(modulePath(slug, "quiz-ja"));

  const selected = Number(formData.get("answer"));
  if (!Number.isInteger(selected) || selected < 0 || selected >= module.quiz.options.length) {
    redirect(modulePath(slug, "quiz-invalido"));
  }
  if (selected !== module.quiz.correctIndex) redirect(modulePath(slug, "quiz-errado"));

  const result = awardPoints(getDb(), { userId: user.id, moduleSlug: slug, kind: "quiz" });
  if (!result.ok) redirect(modulePath(slug, "quiz-invalido"));
  redirect(modulePath(slug, result.awarded ? "quiz-ok" : "quiz-ja", result.points));
}

export async function submitPractice(formData: FormData): Promise<void> {
  const user = await requireUser();
  const slug = String(formData.get("slug") ?? "");
  const module = getModule(slug);
  if (!module) redirect("/modulos");
  if (!user.access) redirect(modulePath(slug, "sem-acesso"));
  if (earnedThisMonth(getDb(), user.id, slug).practice) redirect(modulePath(slug, "pratica-ja"));

  const complete = module.practice.every((item) => formData.get(item.id) === "on");
  if (!complete) redirect(modulePath(slug, "pratica-incompleta"));

  const result = awardPoints(getDb(), { userId: user.id, moduleSlug: slug, kind: "practice" });
  if (!result.ok) redirect(modulePath(slug, "pratica-incompleta"));
  redirect(modulePath(slug, result.awarded ? "pratica-ok" : "pratica-ja", result.points));
}

export async function seedRivals(): Promise<void> {
  if (!isDemoMode()) redirect("/ranking");
  await requireUser();
  seedDemoRivals(getDb());
  redirect("/ranking?aviso=exemplos");
}

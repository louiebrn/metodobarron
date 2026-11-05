import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { many, one, withTx } from "./db";
import { rankScores, type RankedScore } from "./leaderboard";
import { getModule } from "./modules";
import { monthKey } from "./time";
import { PRACTICE_POINTS, QUIZ_POINTS } from "./scoring";

export type PointKind = "quiz" | "practice";

export type ProgressRow = {
  user_id: string;
  module_slug: string;
  quiz_completed_at: number | null;
  practice_completed_at: number | null;
  updated_at: number;
};

type ScoreDb = {
  user_id: string;
  month_key: string;
  points: number;
  quiz_points: number;
  practice_points: number;
  score_reached_at: number;
  updated_at: number;
};

export function pointsFor(kind: PointKind): number {
  return kind === "quiz" ? QUIZ_POINTS : PRACTICE_POINTS;
}

export function earnedThisMonth(
  db: DatabaseSync,
  userId: string,
  moduleSlug: string,
  month = monthKey(),
): { quiz: boolean; practice: boolean } {
  const rows = many<{ kind: PointKind }>(
    db,
    "SELECT kind FROM point_events WHERE user_id = ? AND module_slug = ? AND month_key = ?",
    userId,
    moduleSlug,
    month,
  );
  return {
    quiz: rows.some((row) => row.kind === "quiz"),
    practice: rows.some((row) => row.kind === "practice"),
  };
}

export function listProgress(db: DatabaseSync, userId: string): ProgressRow[] {
  return many<ProgressRow>(db, "SELECT * FROM progress WHERE user_id = ?", userId);
}

export type AwardResult =
  | { ok: true; awarded: boolean; points: number; total: number; month: string }
  | { ok: false; error: string };

/**
 * Record a quiz or practice score for this month.
 * A later call only adds the difference when the new score is higher, so retries cannot farm points.
 * A zero quiz score still counts as the month's attempt.
 */
export function awardPoints(
  db: DatabaseSync,
  input: { userId: string; moduleSlug: string; kind: PointKind; points?: number; now?: number },
): AwardResult {
  const module = getModule(input.moduleSlug);
  if (!module) return { ok: false, error: "Módulo desconhecido." };
  const now = input.now ?? Date.now();
  const month = monthKey(new Date(now));
  const cap = pointsFor(input.kind);
  const requested = input.points ?? cap;
  if (!Number.isInteger(requested) || requested < 0 || requested > cap) {
    return { ok: false, error: "Pontuação inválida." };
  }

  return withTx(db, () => {
    const existing = one<{ points: number }>(
      db,
      `SELECT points FROM point_events WHERE user_id = ? AND kind = ? AND module_slug = ? AND month_key = ?`,
      input.userId,
      input.kind,
      input.moduleSlug,
      month,
    );
    const previous = existing?.points ?? 0;
    const next = Math.max(previous, requested);
    const delta = existing ? next - previous : next;

    if (existing && delta === 0) {
      const total = one<{ points: number }>(
        db,
        "SELECT points FROM monthly_scores WHERE user_id = ? AND month_key = ?",
        input.userId,
        month,
      );
      return { ok: true as const, awarded: false, points: 0, total: total?.points ?? 0, month };
    }

    if (!existing) {
      db.prepare(
        `INSERT INTO point_events (id, user_id, kind, module_slug, points, month_key, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).run(randomUUID(), input.userId, input.kind, input.moduleSlug, next, month, now);
    } else {
      db.prepare(
        `UPDATE point_events SET points = ? WHERE user_id = ? AND kind = ? AND module_slug = ? AND month_key = ?`,
      ).run(next, input.userId, input.kind, input.moduleSlug, month);
    }

    if (delta > 0) {
      const quizPoints = input.kind === "quiz" ? delta : 0;
      const practicePoints = input.kind === "practice" ? delta : 0;
      db.prepare(
        `INSERT INTO monthly_scores (
           user_id, month_key, points, quiz_points, practice_points, score_reached_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (user_id, month_key) DO UPDATE SET
           points = points + excluded.points,
           quiz_points = quiz_points + excluded.quiz_points,
           practice_points = practice_points + excluded.practice_points,
           score_reached_at = excluded.score_reached_at,
           updated_at = excluded.updated_at`,
      ).run(input.userId, month, delta, quizPoints, practicePoints, now, now);
    }

    const quizAt = input.kind === "quiz" ? now : null;
    const practiceAt = input.kind === "practice" ? now : null;
    db.prepare(
      `INSERT INTO progress (user_id, module_slug, quiz_completed_at, practice_completed_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (user_id, module_slug) DO UPDATE SET
         quiz_completed_at = COALESCE(progress.quiz_completed_at, excluded.quiz_completed_at),
         practice_completed_at = COALESCE(progress.practice_completed_at, excluded.practice_completed_at),
         updated_at = excluded.updated_at`,
    ).run(input.userId, input.moduleSlug, quizAt, practiceAt, now);

    const total = one<{ points: number }>(
      db,
      "SELECT points FROM monthly_scores WHERE user_id = ? AND month_key = ?",
      input.userId,
      month,
    );
    return { ok: true as const, awarded: delta > 0, points: delta, total: total?.points ?? 0, month };
  });
}

export function monthlyScore(db: DatabaseSync, userId: string, month = monthKey()): ScoreDb | undefined {
  return one<ScoreDb>(
    db,
    "SELECT * FROM monthly_scores WHERE user_id = ? AND month_key = ?",
    userId,
    month,
  );
}

export function leaderboard(db: DatabaseSync, month = monthKey()): RankedScore[] {
  const rows = many<{ user_id: string; username: string; points: number; score_reached_at: number }>(
    db,
    `SELECT s.user_id, u.username, s.points, s.score_reached_at
     FROM monthly_scores s
     JOIN users u ON u.id = s.user_id
     WHERE s.month_key = ?`,
    month,
  );
  return rankScores(
    rows.map((row) => ({
      userId: row.user_id,
      username: row.username,
      points: row.points,
      scoreReachedAt: row.score_reached_at,
    })),
  );
}

const DEMO_DOMAIN = "@demo.metodobarron.invalid";

const RIVALS: { username: string; points: number; offsetSec: number }[] = [
  { username: "ana_trades", points: 80, offsetSec: 1 },
  { username: "leo_simulador", points: 65, offsetSec: 2 },
  { username: "bia_risco", points: 65, offsetSec: 3 },
  { username: "marina_plano", points: 40, offsetSec: 4 },
];

/** Insert fictional rivals for the current month. Demo mode only. Re-running resets their scores. */
export function seedDemoRivals(db: DatabaseSync, now = Date.now()): void {
  const month = monthKey(new Date(now));
  const base = now - 86_400_000;
  withTx(db, () => {
    for (const rival of RIVALS) {
      const email = `${rival.username}${DEMO_DOMAIN}`;
      const taken = one<{ id: string; email: string }>(db, "SELECT id, email FROM users WHERE username = ?", rival.username);
      if (taken && taken.email !== email) continue;
      let user = one<{ id: string }>(db, "SELECT id FROM users WHERE email = ?", email);
      if (!user) {
        const id = randomUUID();
        db.prepare(
          `INSERT INTO users (id, email, username, password_hash, created_at, updated_at)
           VALUES (?, ?, ?, 'scrypt$disabled$00', ?, ?)`,
        ).run(id, email, rival.username, now, now);
        user = { id };
      }
      const reached = base + rival.offsetSec * 1000;
      db.prepare(
        `INSERT INTO monthly_scores (
           user_id, month_key, points, quiz_points, practice_points, score_reached_at, updated_at
         ) VALUES (?, ?, ?, ?, 0, ?, ?)
         ON CONFLICT (user_id, month_key) DO UPDATE SET
           points = excluded.points,
           quiz_points = excluded.quiz_points,
           practice_points = 0,
           score_reached_at = excluded.score_reached_at,
           updated_at = excluded.updated_at`,
      ).run(user.id, month, rival.points, rival.points, reached, reached);
    }
  });
}

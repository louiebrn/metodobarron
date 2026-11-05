import assert from "node:assert/strict";
import test from "node:test";
import { openDatabase } from "../src/lib/db";
import { courseProgress, listCompletedLessons, markLessonComplete } from "../src/lib/lessons";
import { leaderboard, awardPoints, seedDemoRivals } from "../src/lib/points";
import { createUser } from "../src/lib/users";

const november = Date.parse("2026-11-15T15:00:00.000Z");
const december = Date.parse("2026-12-15T15:00:00.000Z");

test("quiz and practice points are once per module per month", async () => {
  const db = openDatabase(":memory:");
  const created = await createUser(db, { email: "ana@email.com", username: "ana_trades", password: "senha-forte" });
  assert.equal(created.ok, true);
  if (!created.ok) return;

  const quiz = awardPoints(db, { userId: created.userId, moduleSlug: "risco", kind: "quiz", now: november });
  assert.equal(quiz.ok && quiz.awarded && quiz.points, 10);

  const repeat = awardPoints(db, { userId: created.userId, moduleSlug: "risco", kind: "quiz", now: november + 1000 });
  assert.equal(repeat.ok && repeat.awarded, false);
  assert.equal(repeat.ok && repeat.total, 10);

  const practice = awardPoints(db, { userId: created.userId, moduleSlug: "risco", kind: "practice", now: november + 2000 });
  assert.equal(practice.ok && practice.points, 5);
  assert.equal(practice.ok && practice.total, 15);

  const partial = awardPoints(db, { userId: created.userId, moduleSlug: "mercado", kind: "practice", points: 2, now: november });
  assert.equal(partial.ok && partial.points, 2);
  const raised = awardPoints(db, { userId: created.userId, moduleSlug: "mercado", kind: "practice", points: 5, now: november + 3000 });
  assert.equal(raised.ok && raised.points, 3);
  const notLower = awardPoints(db, { userId: created.userId, moduleSlug: "mercado", kind: "practice", points: 2, now: november + 4000 });
  assert.equal(notLower.ok && notLower.awarded, false);

  const nextMonth = awardPoints(db, { userId: created.userId, moduleSlug: "risco", kind: "quiz", now: december });
  assert.equal(nextMonth.ok && nextMonth.awarded, true);
  assert.equal(nextMonth.ok && nextMonth.month, "2026-12");
  assert.equal(nextMonth.ok && nextMonth.total, 10);

  assert.equal(awardPoints(db, { userId: created.userId, moduleSlug: "nao-existe", kind: "quiz" }).ok, false);
});

test("demo rivals put three names on the podium and leave the fourth out", async () => {
  const db = openDatabase(":memory:");
  const created = await createUser(db, { email: "voce@email.com", username: "voce_real", password: "senha-forte" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  awardPoints(db, { userId: created.userId, moduleSlug: "boas-vindas", kind: "quiz", now: november });
  seedDemoRivals(db, november);

  const board = leaderboard(db, "2026-11");
  assert.deepEqual(
    board.slice(0, 4).map((row) => [row.username, row.winner]),
    [
      ["ana_trades", true],
      ["leo_simulador", true],
      ["bia_risco", true],
      ["marina_plano", false],
    ],
  );
  const me = board.find((row) => row.userId === created.userId);
  assert.equal(me?.points, 10);
  assert.equal(me?.winner, false);

  seedDemoRivals(db, november);
  const again = leaderboard(db, "2026-11").find((row) => row.username === "ana_trades");
  assert.equal(again?.points, 80);
});

test("lesson completion is stored once and moves the course percent", async () => {
  const db = openDatabase(":memory:");
  const created = await createUser(db, { email: "aula@email.com", username: "aula_user", password: "senha-forte" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const first = markLessonComplete(db, { userId: created.userId, moduleSlug: "boas-vindas", lessonSlug: "boas-vindas-1" });
  const again = markLessonComplete(db, { userId: created.userId, moduleSlug: "boas-vindas", lessonSlug: "boas-vindas-1" });
  assert.equal(first.ok && first.already, false);
  assert.equal(again.ok && again.already, true);
  const progress = courseProgress(listCompletedLessons(db, created.userId));
  assert.equal(progress.completed, 1);
  assert.ok(progress.total > 20);
  assert.equal(markLessonComplete(db, { userId: created.userId, moduleSlug: "boas-vindas", lessonSlug: "nao" }).ok, false);
});

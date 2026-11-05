import assert from "node:assert/strict";
import test from "node:test";
import { openDatabase } from "../src/lib/db";
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

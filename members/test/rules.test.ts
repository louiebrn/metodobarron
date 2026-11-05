import assert from "node:assert/strict";
import test from "node:test";
import { hasAccess } from "../src/lib/access";
import { rankScores } from "../src/lib/leaderboard";
import { MODULES, practiceIsValid, quizIsValid } from "../src/lib/modules";
import { formatMonth, monthKey } from "../src/lib/time";
import { validateEmail, validatePassword, validateUsername } from "../src/lib/validate";

test("month key follows America/Sao_Paulo, not UTC", () => {
  assert.equal(monthKey(new Date("2026-11-01T02:30:00.000Z")), "2026-10");
  assert.equal(monthKey(new Date("2026-11-01T03:00:00.000Z")), "2026-11");
  assert.equal(formatMonth("2026-11"), "novembro de 2026");
});

test("giveaway rank: points, then earlier score, then username", () => {
  const ranked = rankScores([
    { userId: "b", username: "bia_risco", points: 65, scoreReachedAt: 300 },
    { userId: "z", username: "zero", points: 0, scoreReachedAt: 1 },
    { userId: "a", username: "ana_trades", points: 80, scoreReachedAt: 100 },
    { userId: "l", username: "leo_simulador", points: 65, scoreReachedAt: 200 },
    { userId: "m", username: "marina_plano", points: 40, scoreReachedAt: 400 },
    { userId: "c", username: "carla", points: 40, scoreReachedAt: 400 },
  ]);
  assert.deepEqual(
    ranked.map((row) => [row.username, row.rank, row.winner]),
    [
      ["ana_trades", 1, true],
      ["leo_simulador", 2, true],
      ["bia_risco", 3, true],
      ["carla", 4, false],
      ["marina_plano", 5, false],
    ],
  );
});

test("access is only active or trialing, and not past the period end", () => {
  const now = Date.parse("2026-11-05T12:00:00.000Z");
  assert.equal(hasAccess(null, now), false);
  assert.equal(hasAccess({ status: "active", currentPeriodEnd: null }, now), true);
  assert.equal(hasAccess({ status: "trialing", currentPeriodEnd: null }, now), true);
  assert.equal(hasAccess({ status: "past_due", currentPeriodEnd: null }, now), false);
  assert.equal(hasAccess({ status: "canceled", currentPeriodEnd: null }, now), false);
  assert.equal(hasAccess({ status: "active", currentPeriodEnd: Math.floor(now / 1000) - 1 }, now), false);
  assert.equal(hasAccess({ status: "active", currentPeriodEnd: Math.floor(now / 1000) + 60 }, now), true);
});

test("username, email and password rules", () => {
  assert.equal(validateUsername("Ana_Trades").ok && validateUsername("Ana_Trades").ok && (validateUsername("Ana_Trades") as { username: string }).username, "ana_trades");
  assert.equal(validateUsername("ab").ok, false);
  assert.equal(validateUsername("barron").ok, false);
  assert.equal(validateUsername("nome com espaço").ok, false);
  assert.equal(validateEmail("  Ana@Email.com ").ok && (validateEmail("  Ana@Email.com ") as { email: string }).email, "ana@email.com");
  assert.equal(validateEmail("ana").ok, false);
  assert.equal(validatePassword("1234567").ok, false);
  assert.equal(validatePassword("12345678").ok, true);
});

test("curriculum matches the eight marketing modules", () => {
  assert.equal(MODULES.length, 8);
  assert.deepEqual(
    MODULES.map((module) => module.title),
    [
      "Boas-vindas e choque de realidade",
      "Como o mercado funciona",
      "Configurando tudo",
      "Lendo gráficos",
      "Setups básicos (no simulador)",
      "Gestão de risco",
      "Psicologia",
      "Seu plano de 30 dias",
    ],
  );
  assert.equal(MODULES[5]?.central, true);
  for (const module of MODULES) {
    assert.equal(quizIsValid(module), true, module.slug);
    assert.equal(practiceIsValid(module), true, module.slug);
    assert.ok(module.lessons.length >= 3);
    assert.ok(module.lessons.every((lesson) => lesson.minutes > 0 && lesson.slug.startsWith(module.slug)));
  }
});

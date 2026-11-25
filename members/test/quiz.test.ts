import assert from "node:assert/strict";
import test from "node:test";
import { openDatabase } from "../src/lib/db";
import { captureQuiz } from "../src/lib/quiz-capture";
import { AGE_MINOR_ID, QUIZ_QUESTIONS, normalizeTelegram, parseQuizLead, resultCopy } from "../src/lib/quiz";

const answers = {
  age: "25-34",
  capital: "500-2k",
  experience: "never",
  goal: "learn",
  dailyTime: "about-1h",
  broker: "no",
};

const contact = {
  name: "Ana Souza",
  email: "Ana@Email.com",
  contactType: "whatsapp" as const,
  contact: "(11) 91234-5678",
  consent: true,
  utm_source: "tiktok",
  utm_medium: "paid",
  utm_campaign: "quiz",
  utm_content: "",
  utm_term: "",
  source: "https://www.tiktok.com/",
  page: "/?utm_source=tiktok",
};

test("telegram handle and minor age stay out of storage", () => {
  assert.equal(normalizeTelegram("https://t.me/Barron_Tropa"), "@Barron_Tropa");
  assert.equal(normalizeTelegram("ab"), null);
  const minor = parseQuizLead({
    answers: { ...answers, age: AGE_MINOR_ID },
    ...contact,
  });
  assert.equal("minor" in minor && minor.minor, true);
});

test("quiz webhook receives every answer and skips honeypot and minors", async () => {
  const db = openDatabase(":memory:");
  const bodies: unknown[] = [];
  const saved = await captureQuiz(
    db,
    { answers, ...contact },
    {
      webhookUrl: "https://example.test/quiz",
      now: new Date("2026-11-25T15:00:00.000Z"),
      fetchImpl: async (_url, init) => {
        bodies.push(JSON.parse(String(init?.body)));
        return new Response("ok", { status: 200 });
      },
    },
  );
  assert.equal(saved.ok, true);
  const payload = bodies[0] as Record<string, string>;
  assert.equal(payload.kind, "quiz");
  assert.equal(payload.createdAt, "2026-11-25T15:00:00.000Z");
  assert.equal(payload.email, "ana@email.com");
  assert.equal(payload.contact, "+5511912345678");
  assert.equal(payload.age, "25–34");
  assert.equal(payload.capital, "R$500–2 mil");
  assert.equal(payload.experience, "Nunca operei");
  assert.equal(payload.goal, "Aprender a operar");
  assert.equal(payload.dailyTime, "Cerca de 1 hora");
  assert.equal(payload.broker, "Não");
  assert.equal(payload.utm_source, "tiktok");
  assert.equal(payload.source, "https://www.tiktok.com/");
  assert.equal(payload.consent, true);
  assert.equal("answers" in payload, false);

  const hidden = await captureQuiz(
    db,
    { answers, ...contact, honeypot: "spam" },
    {
      webhookUrl: "https://example.test/quiz",
      fetchImpl: async () => {
        throw new Error("honeypot must not call the webhook");
      },
    },
  );
  assert.equal(hidden.ok && "honeypot" in hidden && hidden.honeypot, true);

  let called = false;
  const blocked = await captureQuiz(
    db,
    { answers: { ...answers, age: AGE_MINOR_ID }, ...contact },
    {
      webhookUrl: "https://example.test/quiz",
      fetchImpl: async () => {
        called = true;
        return new Response("no", { status: 500 });
      },
    },
  );
  assert.equal(blocked.ok && "minor" in blocked && blocked.minor, true);
  assert.equal(called, false);
  const rows = db.prepare("SELECT email FROM quiz_leads").all() as { email: string }[];
  assert.deepEqual(rows.map((row) => row.email), ["ana@email.com"]);
  assert.equal(QUIZ_QUESTIONS.length, 6);
});

test("failed webhook is not reported as saved", async () => {
  const missed = await captureQuiz(null, { answers, ...contact }, {
    webhookUrl: "https://example.test/quiz",
    fetchImpl: async () => new Response("no", { status: 500 }),
  });
  assert.equal(missed.ok, false);
  if (!missed.ok) assert.equal(missed.status, 503);
});

test("result copy stays educational", () => {
  const copy = resultCopy({ ...answers, goal: "copy" });
  assert.match(copy.text, /tropa/);
  assert.doesNotMatch(`${copy.title} ${copy.text}`, /galera|garantimos lucro|R\$97/i);
});

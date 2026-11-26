import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { parseQuizLead, type QuizAnswers, type QuizLeadInput, type QuizLeadPayload } from "./quiz";

export type QuizCaptureResult =
  | { ok: true; stored: boolean; honeypot?: boolean; minor?: boolean }
  | { ok: false; error: string; status: number };

function payloadForSheet(lead: QuizLeadPayload & { answers: QuizAnswers }): QuizLeadPayload {
  const { answers: _answers, ...rest } = lead;
  return rest;
}

export function insertQuizLead(db: DatabaseSync, lead: QuizLeadPayload): void {
  db.prepare(`INSERT INTO quiz_leads (id, email, payload, created_at) VALUES (?, ?, ?, ?)`).run(
    randomUUID(),
    lead.email,
    JSON.stringify(lead),
    Date.parse(lead.createdAt),
  );
}

export async function captureQuiz(
  db: DatabaseSync | null,
  input: QuizLeadInput,
  options: { webhookUrl?: string; fetchImpl?: typeof fetch; now?: Date } = {},
): Promise<QuizCaptureResult> {
  const parsed = parseQuizLead(input, options.now);
  if (!parsed.ok) return { ok: false, error: parsed.error, status: 400 };
  if ("honeypot" in parsed) return { ok: true, stored: false, honeypot: true };
  if ("minor" in parsed) return { ok: true, stored: false, minor: true };

  const lead = payloadForSheet(parsed.lead);
  let stored = false;
  if (db) {
    try {
      insertQuizLead(db, lead);
      stored = true;
    } catch (error) {
      console.error("[quiz] sqlite", error instanceof Error ? error.message : "erro");
    }
  }

  const webhookUrl = options.webhookUrl?.trim() ?? "";
  if (webhookUrl) {
    try {
      const response = await (options.fetchImpl ?? fetch)(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        console.error("[quiz] webhook", response.status);
        return {
          ok: false,
          status: 503,
          error: "Não foi possível guardar suas respostas agora. Tente de novo em instantes.",
        };
      }
      stored = true;
    } catch (error) {
      console.error("[quiz] webhook", error instanceof Error ? error.message : "erro");
      return {
        ok: false,
        status: 503,
        error: "Não foi possível guardar suas respostas agora. Tente de novo em instantes.",
      };
    }
  }

  if (!stored) {
    return {
      ok: false,
      status: 503,
      error: "Não foi possível guardar suas respostas agora. Tente de novo em instantes.",
    };
  }
  return { ok: true, stored: true };
}

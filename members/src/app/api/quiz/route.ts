import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { captureQuiz } from "@/lib/quiz-capture";
import { allow } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

export async function POST(request: Request) {
  if (!allow(`quiz:${clientIp(request)}`, 8, 60 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Tente de novo mais tarde." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Não entendi o envio. Tente de novo." }, { status: 400 });
  }

  let db = null;
  try {
    db = getDb();
  } catch (error) {
    console.error("[quiz] banco indisponível", error instanceof Error ? error.message : "erro");
  }

  const answers = body.answers && typeof body.answers === "object" ? (body.answers as Record<string, unknown>) : {};
  const headerSource = request.headers.get("referer") || "";
  const result = await captureQuiz(
    db,
    {
      answers,
      name: body.name,
      email: body.email,
      contactType: body.contactType,
      contact: body.contact,
      consent: body.consent,
      honeypot: body.company || body.honeypot,
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      utm_campaign: body.utm_campaign,
      utm_content: body.utm_content,
      utm_term: body.utm_term,
      source: body.source || headerSource,
      page: body.page,
    },
    { webhookUrl: process.env.LEADS_WEBHOOK_URL },
  );

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  if (result.minor) {
    return NextResponse.json(
      { ok: false, error: "Este caminho é só para maiores de 18. Nada foi salvo." },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}

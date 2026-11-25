import { NextResponse } from "next/server";
import { allow } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { LEAD_DOWNLOADS, captureLead } from "@/lib/leads";

export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

async function readBody(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(json).map(([key, value]) => [key, String(value ?? "")]));
  }
  const form = await request.formData();
  return Object.fromEntries([...form.entries()].map(([key, value]) => [key, String(value)]));
}

export async function POST(request: Request) {
  if (!allow(`lead:${clientIp(request)}`, 8, 60 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Tente de novo mais tarde." },
      { status: 429 },
    );
  }

  let body: Record<string, string>;
  try {
    body = await readBody(request);
  } catch {
    return NextResponse.json({ ok: false, error: "Não entendi o envio. Tente de novo." }, { status: 400 });
  }

  let db = null;
  try {
    db = getDb();
  } catch (error) {
    console.error("[leads] banco indisponível", error instanceof Error ? error.message : "erro");
  }

  const contactType = body.contact_type || body.contactType;
  const contact = body.contact || (contactType === "whatsapp" ? body.whatsapp : body.email) || "";
  const result = await captureLead(
    db,
    {
      name: body.name,
      contactType,
      contact,
      honeypot: body._gotcha || body.honeypot,
      page: body.page,
    },
    { webhookUrl: process.env.LEADS_WEBHOOK_URL },
  );

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, downloads: LEAD_DOWNLOADS });
}

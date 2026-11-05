import { NextResponse } from "next/server";
import Stripe from "stripe";
import { applyStripeEvent, type StripeEventInput } from "@/lib/billing";
import { config, demoWebhookToken, isDemoMode } from "@/lib/config";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class WebhookError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function POST(request: Request) {
  const raw = await request.text();
  let event: StripeEventInput;
  try {
    event = await readEvent(request, raw);
  } catch (error) {
    if (error instanceof WebhookError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
  }

  try {
    const result = applyStripeEvent(getDb(), event);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    console.error("[stripe] webhook failed", event.type, error instanceof Error ? error.message : "error");
    return NextResponse.json({ error: "Falha ao processar o evento" }, { status: 500 });
  }
}

async function readEvent(request: Request, raw: string): Promise<StripeEventInput> {
  if (config.stripeWebhookSecret) {
    const signature = request.headers.get("stripe-signature");
    if (!signature) throw new WebhookError("Assinatura ausente", 400);
    const stripe = new Stripe(config.stripeSecretKey || "sk_test_placeholder");
    try {
      const verified = stripe.webhooks.constructEvent(raw, signature, config.stripeWebhookSecret);
      return verified as unknown as StripeEventInput;
    } catch {
      throw new WebhookError("Assinatura inválida", 400);
    }
  }

  if (!isDemoMode()) {
    throw new WebhookError("Webhook não configurado. Defina STRIPE_WEBHOOK_SECRET.", 503);
  }

  const header = request.headers.get("authorization") ?? "";
  if (header !== `Bearer ${demoWebhookToken()}`) {
    throw new WebhookError("Token de demonstração inválido", 401);
  }

  let parsed: StripeEventInput;
  try {
    parsed = JSON.parse(raw) as StripeEventInput;
  } catch {
    throw new WebhookError("JSON inválido", 400);
  }
  if (!parsed || typeof parsed.id !== "string" || typeof parsed.type !== "string" || !parsed.data?.object) {
    throw new WebhookError("Evento incompleto", 400);
  }
  return parsed;
}

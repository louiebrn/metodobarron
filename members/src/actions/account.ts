"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { setDemoAccess } from "@/lib/billing";
import { config, isDemoMode } from "@/lib/config";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { changeUsername } from "@/lib/users";

export type UsernameState = { error: string; ok: boolean; username: string };

export async function updateUsername(_prev: UsernameState, formData: FormData): Promise<UsernameState> {
  const user = await requireUser();
  const result = changeUsername(getDb(), user.id, formData.get("username"));
  if (!result.ok) return { error: result.error, ok: false, username: "" };
  revalidatePath("/conta");
  revalidatePath("/painel");
  revalidatePath("/ranking");
  return { error: "", ok: true, username: result.username };
}

export async function toggleDemoAccess(formData: FormData): Promise<void> {
  if (!isDemoMode()) redirect("/conta?aviso=demo-off");
  const user = await requireUser();
  setDemoAccess(getDb(), user, formData.get("active") === "1");
  revalidatePath("/", "layout");
  redirect("/conta?aviso=demo");
}

export async function openPortal(_prev: { error: string }, _formData: FormData): Promise<{ error: string }> {
  const user = await requireUser();
  if (!user.subscription?.stripeCustomerId && config.portalLoginUrl) {
    redirect(config.portalLoginUrl);
  }
  if (!config.stripeSecretKey) {
    if (config.portalLoginUrl) redirect(config.portalLoginUrl);
    return {
      error:
        "O portal da Stripe ainda não está ligado. Defina STRIPE_SECRET_KEY ou STRIPE_CUSTOMER_PORTAL_LOGIN_URL.",
    };
  }
  if (!user.subscription?.stripeCustomerId) {
    return { error: "Nenhuma assinatura Stripe está ligada a esta conta ainda." };
  }
  const stripe = new Stripe(config.stripeSecretKey);
  const session = await stripe.billingPortal.sessions.create({
    customer: user.subscription.stripeCustomerId,
    return_url: `${config.appUrl}/conta`,
  });
  if (!session.url) return { error: "A Stripe não devolveu o link do portal." };
  redirect(session.url);
}

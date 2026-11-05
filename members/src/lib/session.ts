import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { accessFor, getSubscription, type SubscriptionRow } from "./billing";
import { getDb } from "./db";
import { closeSession, openSession, userFromToken, type UserRow } from "./users";

export const SESSION_COOKIE = "mb_session";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  access: boolean;
  subscription: {
    status: string;
    currentPeriodEnd: number | null;
    source: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  } | null;
};

function present(row: UserRow, sub: SubscriptionRow | undefined): SessionUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    access: accessFor(sub),
    subscription: sub
      ? {
          status: sub.status,
          currentPeriodEnd: sub.current_period_end,
          source: sub.source,
          stripeCustomerId: sub.stripe_customer_id,
          stripeSubscriptionId: sub.stripe_subscription_id,
        }
      : null,
  };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? "";
  if (!token) return null;
  const row = userFromToken(getDb(), token);
  if (!row) return null;
  return present(row, getSubscription(getDb(), row));
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function startSession(userId: string): Promise<void> {
  const token = openSession(getDb(), userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? "";
  if (token) closeSession(getDb(), token);
  jar.delete(SESSION_COOKIE);
}

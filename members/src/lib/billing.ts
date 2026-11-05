import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { hasAccess, type AccessSnapshot } from "./access";
import { isUniqueError, one, withTx } from "./db";

export type SubscriptionRow = {
  id: string;
  email: string | null;
  user_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: number | null;
  source: string;
  last_event_created: number | null;
  updated_at: number;
};

export type StripeEventInput = {
  id: string;
  type: string;
  created?: number;
  data: { object: Record<string, unknown> };
};

export type ApplyResult = {
  duplicate?: boolean;
  ignored?: boolean;
  status?: string;
  email?: string | null;
};

const OPEN = new Set(["active", "trialing"]);

export function getSubscription(db: DatabaseSync, user: { id: string; email: string }): SubscriptionRow | undefined {
  return one<SubscriptionRow>(
    db,
    `SELECT * FROM subscriptions
     WHERE user_id = ? OR email = ?
     ORDER BY updated_at DESC
     LIMIT 1`,
    user.id,
    user.email,
  );
}

export function accessFor(row: SubscriptionRow | undefined, nowMs = Date.now()): boolean {
  if (!row) return false;
  const snap: AccessSnapshot = { status: row.status, currentPeriodEnd: row.current_period_end };
  return hasAccess(snap, nowMs);
}

type Patch = {
  email: string | null;
  userId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  status: string;
  periodEnd: number | null;
  source: "stripe" | "demo";
  eventCreated: number | null;
  /** When false, an existing active/trialing status is kept (unpaid checkout must not clobber a paid sub). */
  allowDowngrade: boolean;
};

function resolveUser(db: DatabaseSync, patch: Patch): { userId: string | null; email: string | null } {
  let email = patch.email;
  let userId: string | null = null;
  if (email) {
    const byEmail = one<{ id: string }>(db, "SELECT id FROM users WHERE email = ?", email);
    if (byEmail) userId = byEmail.id;
  }
  if (!userId && patch.userId) {
    const byId = one<{ id: string; email: string }>(db, "SELECT id, email FROM users WHERE id = ?", patch.userId);
    if (byId) {
      userId = byId.id;
      email = email ?? byId.email;
    }
  }
  return { userId, email };
}

function saveSubscription(db: DatabaseSync, patch: Patch): SubscriptionRow {
  return withTx(db, () => {
    const found = new Map<string, SubscriptionRow>();
    const add = (row: SubscriptionRow | undefined) => {
      if (row) found.set(row.id, row);
    };
    if (patch.subscriptionId) {
      add(one(db, "SELECT * FROM subscriptions WHERE stripe_subscription_id = ?", patch.subscriptionId));
    }
    if (patch.customerId) {
      add(one(db, "SELECT * FROM subscriptions WHERE stripe_customer_id = ?", patch.customerId));
    }
    if (patch.email) add(one(db, "SELECT * FROM subscriptions WHERE email = ?", patch.email));
    if (patch.userId) add(one(db, "SELECT * FROM subscriptions WHERE user_id = ?", patch.userId));

    const candidates = [...found.values()];
    const { userId, email } = resolveUser(db, { ...patch, email: patch.email });
    const now = Date.now();

    const keeper =
      candidates.find((row) => patch.subscriptionId && row.stripe_subscription_id === patch.subscriptionId) ??
      candidates.find((row) => email && row.email === email) ??
      candidates.find((row) => patch.customerId && row.stripe_customer_id === patch.customerId) ??
      candidates[0];

    for (const row of candidates) {
      if (keeper && row.id !== keeper.id) {
        db.prepare("DELETE FROM subscriptions WHERE id = ?").run(row.id);
      }
    }

    const stale =
      patch.source === "stripe" &&
      keeper?.source === "stripe" &&
      patch.eventCreated != null &&
      keeper.last_event_created != null &&
      patch.eventCreated < keeper.last_event_created;

    const keepStatus =
      stale ||
      (!patch.allowDowngrade && keeper != null && OPEN.has(keeper.status) && !OPEN.has(patch.status));

    let periodEnd: number | null;
    if (patch.source === "demo") {
      periodEnd = null;
    } else if (keepStatus && keeper) {
      periodEnd = keeper.current_period_end;
    } else if (patch.periodEnd != null) {
      periodEnd = patch.periodEnd;
    } else {
      periodEnd = keeper?.current_period_end ?? null;
    }

    const fill = <T>(incoming: T | null, existing: T | null): T | null => (stale ? (existing ?? incoming) : (incoming ?? existing));

    const next: SubscriptionRow = {
      id: keeper?.id ?? randomUUID(),
      email: fill(email, keeper?.email ?? null),
      user_id: fill(userId, keeper?.user_id ?? null),
      stripe_customer_id: fill(patch.customerId, keeper?.stripe_customer_id ?? null),
      stripe_subscription_id: fill(patch.subscriptionId, keeper?.stripe_subscription_id ?? null),
      status: keepStatus && keeper ? keeper.status : patch.status,
      current_period_end: periodEnd,
      source: patch.source === "stripe" ? "stripe" : keeper?.source === "stripe" ? "stripe" : "demo",
      last_event_created:
        patch.source === "stripe"
          ? Math.max(patch.eventCreated ?? 0, keeper?.last_event_created ?? 0)
          : (keeper?.last_event_created ?? null),
      updated_at: now,
    };

    if (!keeper) {
      db.prepare(
        `INSERT INTO subscriptions (
           id, email, user_id, stripe_customer_id, stripe_subscription_id,
           status, current_period_end, source, last_event_created, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        next.id,
        next.email,
        next.user_id,
        next.stripe_customer_id,
        next.stripe_subscription_id,
        next.status,
        next.current_period_end,
        next.source,
        next.last_event_created,
        next.updated_at,
      );
    } else {
      db.prepare(
        `UPDATE subscriptions SET
           email = ?, user_id = ?, stripe_customer_id = ?, stripe_subscription_id = ?,
           status = ?, current_period_end = ?, source = ?, last_event_created = ?, updated_at = ?
         WHERE id = ?`,
      ).run(
        next.email,
        next.user_id,
        next.stripe_customer_id,
        next.stripe_subscription_id,
        next.status,
        next.current_period_end,
        next.source,
        next.last_event_created,
        next.updated_at,
        next.id,
      );
    }

    return next;
  });
}

function asId(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && "id" in value && typeof (value as { id: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return null;
}

function emailOf(object: Record<string, unknown>): string | null {
  const details = object.customer_details as { email?: unknown } | null | undefined;
  const raw = (typeof details?.email === "string" && details.email) || (typeof object.customer_email === "string" && object.customer_email) || "";
  const email = raw.trim().toLowerCase();
  return email || null;
}

function periodEndOf(object: Record<string, unknown>): number | null {
  if (typeof object.current_period_end === "number") return object.current_period_end;
  const items = object.items as { data?: Array<{ current_period_end?: number }> } | undefined;
  const fromItem = items?.data?.[0]?.current_period_end;
  return typeof fromItem === "number" ? fromItem : null;
}

function userIdOf(object: Record<string, unknown>): string | null {
  if (typeof object.client_reference_id === "string" && object.client_reference_id) {
    return object.client_reference_id;
  }
  const metadata = object.metadata as { user_id?: unknown } | undefined;
  return typeof metadata?.user_id === "string" && metadata.user_id ? metadata.user_id : null;
}

export function setDemoAccess(db: DatabaseSync, user: { id: string; email: string }, active: boolean): void {
  saveSubscription(db, {
    email: user.email,
    userId: user.id,
    customerId: null,
    subscriptionId: null,
    status: active ? "active" : "inactive",
    periodEnd: null,
    source: "demo",
    eventCreated: null,
    allowDowngrade: true,
  });
}

/**
 * Apply one Stripe event. Idempotent on `event.id`.
 * Unknown event types are ignored with a 200-equivalent `{ ignored: true }`.
 */
export function applyStripeEvent(db: DatabaseSync, event: StripeEventInput): ApplyResult {
  if (!event.id || !event.type) {
    throw new Error("Evento Stripe sem id ou type");
  }

  const seen = one<{ id: string }>(db, "SELECT id FROM stripe_events WHERE id = ?", event.id);
  if (seen) return { duplicate: true };

  const object = event.data?.object ?? {};
  const created = typeof event.created === "number" ? event.created : null;
  let applied: SubscriptionRow | null = null;
  let ignored = false;

  if (event.type === "checkout.session.completed") {
    if (object.mode !== "subscription") {
      ignored = true;
    } else {
      const paid = object.payment_status === "paid" || object.payment_status === "no_payment_required";
      applied = saveSubscription(db, {
        email: emailOf(object),
        userId: userIdOf(object),
        customerId: asId(object.customer),
        subscriptionId: asId(object.subscription),
        status: paid ? "active" : "incomplete",
        periodEnd: periodEndOf(object),
        source: "stripe",
        eventCreated: created,
        allowDowngrade: paid,
      });
    }
  } else if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.paused" ||
    event.type === "customer.subscription.resumed"
  ) {
    const deleted = event.type === "customer.subscription.deleted";
    const status = deleted ? "canceled" : String(object.status ?? "incomplete");
    applied = saveSubscription(db, {
      email: emailOf(object),
      userId: userIdOf(object),
      customerId: asId(object.customer),
      subscriptionId: asId(object.id) ?? asId(object.subscription),
      status,
      periodEnd: periodEndOf(object),
      source: "stripe",
      eventCreated: created,
      allowDowngrade: true,
    });
  } else {
    ignored = true;
  }

  try {
    db.prepare("INSERT INTO stripe_events (id, type, received_at) VALUES (?, ?, ?)").run(
      event.id,
      event.type,
      Date.now(),
    );
  } catch (error) {
    if (isUniqueError(error, "stripe_events.id")) {
      return { duplicate: true, ignored, status: applied?.status, email: applied?.email ?? null };
    }
    throw error;
  }

  return {
    ignored,
    status: applied?.status,
    email: applied?.email ?? null,
  };
}

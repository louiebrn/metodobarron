import assert from "node:assert/strict";
import test from "node:test";
import { accessFor, applyStripeEvent, getSubscription, setDemoAccess, type StripeEventInput } from "../src/lib/billing";
import { openDatabase } from "../src/lib/db";
import { createUser } from "../src/lib/users";

function event(partial: Partial<StripeEventInput> & Pick<StripeEventInput, "id" | "type">): StripeEventInput {
  return {
    created: 1_700_000_000,
    data: { object: {} },
    ...partial,
  };
}

test("checkout by email unlocks the account created afterwards", async () => {
  const db = openDatabase(":memory:");
  const applied = applyStripeEvent(
    db,
    event({
      id: "evt_checkout_1",
      type: "checkout.session.completed",
      created: 100,
      data: {
        object: {
          mode: "subscription",
          payment_status: "paid",
          customer: "cus_1",
          subscription: "sub_1",
          customer_details: { email: "Ana@Email.com" },
        },
      },
    }),
  );
  assert.equal(applied.status, "active");
  assert.equal(applied.email, "ana@email.com");

  const created = await createUser(db, { email: "ana@email.com", username: "ana_trades", password: "senha-forte" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const sub = getSubscription(db, { id: created.userId, email: "ana@email.com" });
  assert.equal(sub?.user_id, created.userId);
  assert.equal(accessFor(sub), true);

  const again = applyStripeEvent(
    db,
    event({
      id: "evt_checkout_1",
      type: "checkout.session.completed",
      data: { object: { mode: "subscription" } },
    }),
  );
  assert.equal(again.duplicate, true);
});

test("signup first, then checkout and a later cancellation", async () => {
  const db = openDatabase(":memory:");
  const created = await createUser(db, { email: "leo@email.com", username: "leo_sim", password: "senha-forte" });
  assert.equal(created.ok, true);
  if (!created.ok) return;

  applyStripeEvent(
    db,
    event({
      id: "evt_sub_created",
      type: "customer.subscription.created",
      created: 50,
      data: {
        object: {
          id: "sub_leo",
          object: "subscription",
          status: "incomplete",
          customer: "cus_leo",
          customer_details: { email: "leo@email.com" },
        },
      },
    }),
  );
  assert.equal(accessFor(getSubscription(db, { id: created.userId, email: "leo@email.com" })), false);

  applyStripeEvent(
    db,
    event({
      id: "evt_checkout_leo",
      type: "checkout.session.completed",
      created: 60,
      data: {
        object: {
          mode: "subscription",
          payment_status: "paid",
          client_reference_id: created.userId,
          customer: "cus_leo",
          subscription: "sub_leo",
          customer_details: { email: "leo@email.com" },
          current_period_end: 1_800_000_000,
        },
      },
    }),
  );
  assert.equal(accessFor(getSubscription(db, { id: created.userId, email: "leo@email.com" })), true);

  applyStripeEvent(
    db,
    event({
      id: "evt_unpaid_late",
      type: "checkout.session.completed",
      created: 70,
      data: {
        object: {
          mode: "subscription",
          payment_status: "unpaid",
          customer: "cus_leo",
          subscription: "sub_leo",
          customer_details: { email: "leo@email.com" },
        },
      },
    }),
  );
  assert.equal(getSubscription(db, { id: created.userId, email: "leo@email.com" })?.status, "active");

  applyStripeEvent(
    db,
    event({
      id: "evt_cancel",
      type: "customer.subscription.deleted",
      created: 80,
      data: { object: { id: "sub_leo", status: "canceled", customer: "cus_leo" } },
    }),
  );
  assert.equal(accessFor(getSubscription(db, { id: created.userId, email: "leo@email.com" })), false);

  applyStripeEvent(
    db,
    event({
      id: "evt_old_active",
      type: "customer.subscription.updated",
      created: 40,
      data: { object: { id: "sub_leo", status: "active", customer: "cus_leo", current_period_end: 1_800_000_000 } },
    }),
  );
  assert.equal(getSubscription(db, { id: created.userId, email: "leo@email.com" })?.status, "canceled");
});

test("same email unlocks after checkout, and subscription.deleted removes it", async () => {
  const db = openDatabase(":memory:");
  applyStripeEvent(
    db,
    event({
      id: "evt_email_field",
      type: "checkout.session.completed",
      created: 10,
      data: {
        object: {
          mode: "subscription",
          payment_status: "paid",
          customer: "cus_mail",
          subscription: "sub_mail",
          customer_email: "  Comprador@Email.com ",
        },
      },
    }),
  );
  const created = await createUser(db, { email: "comprador@email.com", username: "comprador", password: "senha-forte" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const user = { id: created.userId, email: "comprador@email.com" };
  assert.equal(accessFor(getSubscription(db, user)), true);

  applyStripeEvent(
    db,
    event({
      id: "evt_sub_active",
      type: "customer.subscription.updated",
      created: 20,
      data: {
        object: {
          id: "sub_mail",
          status: "active",
          customer: "cus_mail",
          metadata: { email: "comprador@email.com" },
          current_period_end: 1_900_000_000,
        },
      },
    }),
  );
  assert.equal(getSubscription(db, user)?.status, "active");

  applyStripeEvent(
    db,
    event({
      id: "evt_sub_deleted",
      type: "customer.subscription.deleted",
      created: 30,
      data: { object: { id: "sub_mail", status: "canceled", customer: "cus_mail" } },
    }),
  );
  assert.equal(accessFor(getSubscription(db, user)), false);
});

test("past_due locks modules and non-subscription checkouts are ignored", () => {
  const db = openDatabase(":memory:");
  const ignored = applyStripeEvent(
    db,
    event({
      id: "evt_payment",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1" } },
    }),
  );
  assert.equal(ignored.ignored, true);

  applyStripeEvent(
    db,
    event({
      id: "evt_past_due",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_due",
          status: "past_due",
          customer: "cus_due",
          customer_details: { email: "bia@email.com" },
        },
      },
    }),
  );
  const row = getSubscription(db, { id: "missing", email: "bia@email.com" });
  assert.equal(row?.status, "past_due");
  assert.equal(accessFor(row), false);
});

test("demo access does not require Stripe ids and can be turned off", async () => {
  const db = openDatabase(":memory:");
  const created = await createUser(db, { email: "bia@email.com", username: "bia_risco", password: "senha-forte" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const user = { id: created.userId, email: "bia@email.com" };
  assert.equal(accessFor(getSubscription(db, user)), false);
  setDemoAccess(db, user, true);
  assert.equal(accessFor(getSubscription(db, user)), true);
  setDemoAccess(db, user, false);
  assert.equal(accessFor(getSubscription(db, user)), false);
});

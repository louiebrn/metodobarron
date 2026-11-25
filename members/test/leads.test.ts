import assert from "node:assert/strict";
import test from "node:test";
import { openDatabase } from "../src/lib/db";
import { LEAD_DOWNLOADS, captureLead, normalizeWhatsApp, parseLead } from "../src/lib/leads";

test("whatsapp accepts DDD plus mobile and rejects junk", () => {
  assert.equal(normalizeWhatsApp("(11) 91234-5678"), "+5511912345678");
  assert.equal(normalizeWhatsApp("+55 11 91234-5678"), "+5511912345678");
  assert.equal(normalizeWhatsApp("11912345678"), "+5511912345678");
  assert.equal(normalizeWhatsApp("123"), null);
  assert.equal(normalizeWhatsApp("(01) 91234-5678"), null);
});

test("lead requires a real email or whatsapp and ignores the honeypot", async () => {
  assert.equal(parseLead({ contactType: "email", contact: "nao-e-email" }).ok, false);
  assert.equal(parseLead({ contactType: "whatsapp", contact: "" }).ok, false);
  const hidden = parseLead({ contactType: "email", contact: "ana@email.com", honeypot: "http://spam" });
  assert.equal("honeypot" in hidden && hidden.honeypot, true);

  const db = openDatabase(":memory:");
  const calls: string[] = [];
  const saved = await captureLead(
    db,
    { name: "Ana", contactType: "email", contact: "Ana@Email.com", page: "https://metodobarron.com/" },
    {
      webhookUrl: "https://example.test/leads",
      fetchImpl: async (url) => {
        calls.push(String(url));
        return new Response("ok", { status: 200 });
      },
    },
  );
  assert.equal(saved.ok, true);
  assert.deepEqual(calls, ["https://example.test/leads"]);
  const row = db.prepare("SELECT contact, contact_type, name FROM leads").get() as {
    contact: string;
    contact_type: string;
    name: string;
  };
  assert.equal(row.contact, "ana@email.com");
  assert.equal(row.contact_type, "email");
  assert.equal(row.name, "Ana");
  assert.equal(LEAD_DOWNLOADS.length, 2);
});

test("without a database or webhook the lead is not pretended to be saved", async () => {
  const missed = await captureLead(null, { contactType: "whatsapp", contact: "11987654321" });
  assert.equal(missed.ok, false);
  if (!missed.ok) assert.equal(missed.status, 503);
});

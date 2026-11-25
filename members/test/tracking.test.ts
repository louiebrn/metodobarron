import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { hasMarketingPixels, pixelConfig, readStoredConsent, tiktokEventName } from "../src/lib/tracking";

test("pixels stay off until the public ids are set", () => {
  assert.deepEqual(pixelConfig({}), { meta: "", tiktok: "" });
  assert.equal(hasMarketingPixels({}), false);
  assert.equal(hasMarketingPixels({ NEXT_PUBLIC_META_PIXEL_ID: " 123 ", NEXT_PUBLIC_TIKTOK_PIXEL_ID: "" }), true);
});

test("tiktok purchase and lead use the platform event names", () => {
  assert.equal(tiktokEventName("PageView"), "page");
  assert.equal(tiktokEventName("Lead"), "SubmitForm");
  assert.equal(tiktokEventName("InitiateCheckout"), "InitiateCheckout");
  assert.equal(tiktokEventName("Purchase"), "CompletePayment");
});

test("consent storage only accepts the two choices", () => {
  const storage = { getItem: (key: string) => (key === "mb-lgpd" ? "accepted" : null) };
  assert.equal(readStoredConsent(storage), "accepted");
  assert.equal(readStoredConsent({ getItem: () => "talvez" }), null);
  assert.equal(readStoredConsent(null), null);
});

test("legal pages name the controller and the 7-day guarantee", () => {
  const privacy = readFileSync(new URL("../src/app/(marketing)/privacidade/page.tsx", import.meta.url), "utf8");
  const terms = readFileSync(new URL("../src/app/(marketing)/termos/page.tsx", import.meta.url), "utf8");
  assert.match(privacy, /mtdbarron@proton\.me/);
  assert.match(privacy, /Método Barron/);
  assert.match(privacy, /advogado/);
  assert.match(terms, /7 dias/);
  assert.match(terms, /Não é recomendação de investimento/);
  assert.match(terms, /advogado/);
});

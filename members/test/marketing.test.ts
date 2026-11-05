import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { homeBodyHtml } from "../src/components/marketing/home-body";
import { config } from "../src/lib/config";

test("marketing homepage keeps the sales copy and same-origin links", () => {
  assert.match(homeBodyHtml, /prática, risco e/);
  assert.match(homeBodyHtml, /Quero começar agora/);
  assert.equal((homeBodyHtml.match(/data-checkout/g) ?? []).length, 5);
  assert.match(homeBodyHtml, /href="\/entrar"/);
  assert.match(homeBodyHtml, /href="\/termos"/);
  assert.match(homeBodyHtml, /href="\/privacidade"/);
  assert.doesNotMatch(homeBodyHtml, /membros\.metodobarron\.com/);
});

test("payment link falls back to the live Stripe link without a secret", () => {
  if (process.env.STRIPE_PAYMENT_LINK_URL) return;
  assert.equal(config.paymentLinkUrl, "https://buy.stripe.com/cNi6oG8sBewcaWk7tldfG01");
});

test("marketing css is scoped under .mkt", () => {
  const css = readFileSync(new URL("../src/components/marketing/home.css", import.meta.url), "utf8");
  assert.match(css, /\.mkt \.btn\{/);
  assert.match(css, /\.mkt:not\(\.mode-waitlist\)/);
  assert.match(css, /\.mkt\.js \.rv\{/);
  assert.doesNotMatch(css, /(^|\n):root\{/);
  assert.doesNotMatch(css, /(^|\n)html\{/);
  assert.doesNotMatch(css, /(^|\n)body\{/);
});

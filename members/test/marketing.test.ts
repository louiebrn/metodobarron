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
  assert.doesNotMatch(homeBodyHtml, /class="tkc"|data-tk-id|sinais prontos/);
  assert.equal((homeBodyHtml.match(/class="tag mono">/g) ?? []).length, 8);
  assert.doesNotMatch(homeBodyHtml, /class="tag mono">09</);
  assert.match(homeBodyHtml, /Quem quer só copiar entradas sem entender o porquê/);
  assert.equal((homeBodyHtml.match(/Entre na Tropa do Barron/g) ?? []).length, 4);
  assert.match(homeBodyHtml, /Exemplo da área de membros/);
  assert.match(homeBodyHtml, /data-results="off"/);
  assert.match(homeBodyHtml, /data-launch-at="2026-11-30T12:00:00-03:00"/);
  assert.match(homeBodyHtml, /Quero o material grátis/);
  assert.match(homeBodyHtml, /href="\/termos"/);
  assert.match(homeBodyHtml, /href="\/privacidade"/);
  assert.match(homeBodyHtml, /Ao enviar, você concorda/);
  const homeJs = readFileSync(new URL("../public/marketing/home.js", import.meta.url), "utf8");
  assert.match(homeJs, /\/api\/leads/);
  assert.doesNotMatch(homeJs, /WAITLIST-SETUP/);
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

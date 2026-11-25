import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { config } from "../src/lib/config";

test("home is a short quiz funnel without the old sales page", () => {
  const page = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const funnel = readFileSync(new URL("../src/components/marketing/funnel.tsx", import.meta.url), "utf8");
  const quiz = readFileSync(new URL("../src/lib/quiz.ts", import.meta.url), "utf8");
  const source = page + funnel + quiz;
  assert.match(funnel, /Começar/);
  assert.match(funnel, /50k\+/);
  assert.match(funnel, /30k\+/);
  assert.match(funnel, /1k\+/);
  assert.match(funnel, /O estilo de vida da tropa/);
  assert.doesNotMatch(funnel, /CountUp|cerca de|soma/);
  assert.match(funnel, /Entrar na Tropa do Barron/);
  assert.match(funnel, /Não é recomendação de investimento/);
  assert.match(funnel, /Trading envolve risco/);
  assert.match(quiz, /Menos de 18/);
  assert.match(quiz, /records\.axiaffiliates\.com\/visit\/\?bta=45006&brand=axitrader/);
  assert.match(quiz, /t\.me\/\+Mj-tOeCA_whhYmU0/);
  assert.match(funnel, /\/api\/quiz/);
  assert.match(funnel, /trackIfConsented\("Lead"\)/);
  assert.match(funnel, /trackIfConsented\("CompleteRegistration"\)/);
  assert.doesNotMatch(source, /data-checkout|Quero o material|Exemplo da área|R\$97|galera|sinais prontos/);
  assert.doesNotMatch(page, /home-body|home\.js/);
});

test("payment link falls back to the live Stripe link without a secret", () => {
  if (process.env.STRIPE_PAYMENT_LINK_URL) return;
  assert.equal(config.paymentLinkUrl, "https://buy.stripe.com/cNi6oG8sBewcaWk7tldfG01");
});

test("marketing css is scoped under .mkt and the funnel does not restyle the document", () => {
  const css = readFileSync(new URL("../src/components/marketing/home.css", import.meta.url), "utf8");
  const funnelCss = readFileSync(new URL("../src/components/marketing/funnel.css", import.meta.url), "utf8");
  assert.match(css, /\.mkt \.btn\{/);
  assert.match(css, /\.mkt:not\(\.mode-waitlist\)/);
  assert.match(css, /\.mkt\.js \.rv\{/);
  assert.match(funnelCss, /#0b0c0f/);
  assert.match(funnelCss, /#2ee6c8/);
  assert.match(funnelCss, /Plus Jakarta Sans/);
  for (const file of [css, funnelCss]) {
    assert.doesNotMatch(file, /(^|\n):root\{/);
    assert.doesNotMatch(file, /(^|\n)html\{/);
    assert.doesNotMatch(file, /(^|\n)body\{/);
  }
});

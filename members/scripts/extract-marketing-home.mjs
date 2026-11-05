/**
 * Rebuild the marketing homepage assets from the repo-root index.html.
 * Run from anywhere: node members/scripts/extract-marketing-home.mjs
 *
 * The Next app is the source of truth after extraction. index.html stays
 * in the repo as the reference the page was ported from.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const html = readFileSync(join(root, "index.html"), "utf8");

const styleMatch = html.match(/<style>\s*:root\{--bg:#0b0c0f[\s\S]*?<\/style>/);
if (!styleMatch) throw new Error("marketing <style> block not found");
let css = styleMatch[0].replace(/^<style>/, "").replace(/<\/style>$/, "");

css += `
.nav-login{font-size:14px;font-weight:600;color:var(--muted);padding:8px 6px;white-space:nowrap}
.nav-login:hover{color:var(--text)}
.copy a{color:var(--dim);text-decoration:underline;text-underline-offset:3px}
.copy a:hover{color:var(--text)}
@media (max-width:820px){.nav-login{display:none}}
`;

const bodyMatch = html.match(/<body>([\s\S]*)<script>/);
if (!bodyMatch) throw new Error("marketing <body> not found");
let body = bodyMatch[1];
if (body.includes("<script")) throw new Error("unexpected script inside body markup");

body = body.replace(
  `<div class="nav-r">\n<!-- TODO: replace #checkout with the Kiwify/Hotmart checkout link -->\n<a class="nbtn" href="#checkout" data-checkout>Quero começar</a>`,
  `<div class="nav-r">\n<a class="nav-login" href="/entrar">Entrar</a>\n<a class="nbtn" href="#checkout" data-checkout>Quero começar</a>`,
);

const menuFaq = `<a href="#faq"><span>FAQ</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>\n</div>\n</header>`;
const menuFaqNext = `<a href="#faq"><span>FAQ</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>\n<a href="/entrar"><span>Entrar</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>\n</div>\n</header>`;
if (!body.includes(menuFaq)) throw new Error("mobile menu markup not found");
body = body.replace(menuFaq, menuFaqNext);

const copyLine = `<div class="copy"><span>© <span id="yr">2026</span> Método Barron. <span>Todos os direitos reservados.</span></span><span>Feito com método, não com promessa.</span></div>`;
const copyNext = `<div class="copy"><span>© <span id="yr">2026</span> Método Barron. <span>Todos os direitos reservados.</span> · <a href="/termos">Termos</a> · <a href="/privacidade">Privacidade</a> · <a href="/afiliados">Afiliados</a></span><span>Feito com método, não com promessa.</span></div>`;
if (!body.includes(copyLine)) throw new Error("footer copy markup not found");
body = body.replace(copyLine, copyNext);

const scriptMatch = html.match(/<script>\s*\{const e=document\.querySelector\('img\[data-f="avatar"\]'\)[\s\S]*?<\/script>\s*<\/body>/);
if (!scriptMatch) throw new Error("marketing behaviour script not found");
let script = scriptMatch[0].replace(/^<script>/, "").replace(/<\/script>\s*<\/body>$/, "");
const barOn = 'document.body.classList.toggle("bar-on",t)';
if (!script.includes(barOn)) throw new Error("bar-on toggle not found");
script = script.replace(barOn, '(document.querySelector(".mkt")||document.body).classList.toggle("bar-on",t)');
if (/\bdocument\.documentElement\b/.test(script)) {
  throw new Error("behaviour script still touches documentElement; scope it to .mkt");
}

const scoped = prefixCss(css);
assertScoped(scoped);

const outDir = join(root, "members/src/components/marketing");
const publicDir = join(root, "members/public/marketing");
mkdirSync(outDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

const prelude = `/* Marketing homepage styles, scoped under .mkt so the members UI is unchanged. */
.mkt{min-height:100vh}
.mkt form{display:block}
.mkt .btn{justify-content:flex-start;min-height:0}
`;

const suffix = `
/* Fixed nav, chat and mobile bar stay on the viewport. Body already clips horizontal overflow. */
.mkt{overflow-x:visible}
`;
writeFileSync(join(outDir, "home.css"), prelude + scoped + suffix);
writeFileSync(
  join(outDir, "home-body.ts"),
  `/** Markup ported from the static marketing homepage. Checkout hrefs are filled in at render. */\nexport const homeBodyHtml: string = ${JSON.stringify(body)};\n`,
);

const boot = `/* Marketing homepage behaviour. Loaded by the homepage client boot. */
window.__mbBootHome = function (opts) {
  var CHECKOUT_URL = String((opts && opts.checkoutUrl) || "");
  var CHAT_URL = String((opts && opts.chatUrl) || "");
  var LAUNCH_MODE = String((opts && opts.launchMode) || "open");
  var WAITLIST_ENDPOINT = String((opts && opts.waitlistEndpoint) || "");
  var INTRO_VIDEO_URL = String((opts && opts.introVideoUrl) || "");
  var root = document.querySelector(".mkt");
  if (!root) return function () {};

  var intervals = [];
  var observers = [];
  var added = [];
  var origSetInterval = window.setInterval;
  var origAdd = EventTarget.prototype.addEventListener;
  var origRemove = EventTarget.prototype.removeEventListener;
  var OrigIO = window.IntersectionObserver;

  window.setInterval = function (fn, ms) {
    var id = origSetInterval.apply(window, arguments);
    intervals.push(id);
    return id;
  };
  EventTarget.prototype.addEventListener = function (type, fn, options) {
    added.push([this, type, fn, options]);
    return origAdd.call(this, type, fn, options);
  };
  function WrappedIO(cb, options) {
    var obs = new OrigIO(cb, options);
    observers.push(obs);
    return obs;
  }
  WrappedIO.prototype = OrigIO.prototype;
  window.IntersectionObserver = WrappedIO;

  try {
${script}
  } catch (err) {
    console.error("[marketing] home script failed", err);
  } finally {
    window.setInterval = origSetInterval;
    EventTarget.prototype.addEventListener = origAdd;
    window.IntersectionObserver = OrigIO;
  }

  return function cleanup() {
    intervals.forEach(function (id) { origSetInterval === window.setInterval ? clearInterval(id) : clearInterval(id); });
    intervals.forEach(function (id) { clearInterval(id); });
    added.forEach(function (entry) { origRemove.call(entry[0], entry[1], entry[2], entry[3]); });
    observers.forEach(function (obs) { obs.disconnect(); });
  };
};
`;

// The cleanup above double-clears intervals. Keep a single clear.
const bootClean = boot.replace(
  `  return function cleanup() {
    intervals.forEach(function (id) { origSetInterval === window.setInterval ? clearInterval(id) : clearInterval(id); });
    intervals.forEach(function (id) { clearInterval(id); });
    added.forEach(function (entry) { origRemove.call(entry[0], entry[1], entry[2], entry[3]); });
    observers.forEach(function (obs) { obs.disconnect(); });
  };`,
  `  return function cleanup() {
    intervals.forEach(function (id) { clearInterval(id); });
    added.forEach(function (entry) { origRemove.call(entry[0], entry[1], entry[2], entry[3]); });
    observers.forEach(function (obs) { obs.disconnect(); });
  };`,
);

writeFileSync(join(publicDir, "home.js"), bootClean);
console.log("wrote home.css, home-body.ts, public/marketing/home.js");
console.log("checkout links", (body.match(/data-checkout/g) || []).length);
console.log("entrar links", (body.match(/href="\/entrar"/g) || []).length);

function prefixCss(source) {
  return transformBlock(source);
}

function transformBlock(css) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const start = i;
    while (i < css.length) {
      if (css.startsWith("/*", i)) {
        const end = css.indexOf("*/", i + 2);
        i = end === -1 ? css.length : end + 2;
        continue;
      }
      if (/\s/.test(css[i])) {
        i += 1;
        continue;
      }
      break;
    }
    out += css.slice(start, i);
    if (i >= css.length) break;

    if (css[i] === "@") {
      const headerEnd = scanAtHeaderEnd(css, i);
      const header = css.slice(i, headerEnd).trim();
      if (css[headerEnd] === ";") {
        out += css.slice(i, headerEnd + 1);
        i = headerEnd + 1;
        continue;
      }
      const bodyStart = headerEnd + 1;
      const bodyEnd = findMatchingBrace(css, headerEnd);
      const body = css.slice(bodyStart, bodyEnd);
      const name = header.split(/[\s({]/)[0].toLowerCase();
      if (name === "@media" || name === "@supports" || name === "@layer" || name === "@container") {
        out += `${header}{${transformBlock(body)}}`;
      } else {
        out += `${header}{${body}}`;
      }
      i = bodyEnd + 1;
      continue;
    }

    const brace = scanUntil(css, i, "{");
    const selectors = css.slice(i, brace);
    const bodyEnd = findMatchingBrace(css, brace);
    const body = css.slice(brace + 1, bodyEnd);
    out += `${prefixSelectorList(selectors)}{${body}}`;
    i = bodyEnd + 1;
  }
  return out;
}

function scanAtHeaderEnd(css, i) {
  let quote = "";
  let depth = 0;
  for (let p = i; p < css.length; p += 1) {
    const c = css[p];
    if (quote) {
      if (c === "\\") {
        p += 1;
        continue;
      }
      if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === "(") depth += 1;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0 && (c === "{" || c === ";")) return p;
  }
  throw new Error("unterminated at-rule");
}

function scanUntil(css, i, token) {
  let quote = "";
  for (let p = i; p < css.length; p += 1) {
    const c = css[p];
    if (quote) {
      if (c === "\\") {
        p += 1;
        continue;
      }
      if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (css.startsWith("/*", p)) {
      const end = css.indexOf("*/", p + 2);
      p = end === -1 ? css.length - 1 : end + 1;
      continue;
    }
    if (c === token) return p;
  }
  throw new Error(`missing ${token}`);
}

function findMatchingBrace(css, openIndex) {
  if (css[openIndex] !== "{") throw new Error("expected {");
  let depth = 0;
  let quote = "";
  for (let p = openIndex; p < css.length; p += 1) {
    const c = css[p];
    if (quote) {
      if (c === "\\") {
        p += 1;
        continue;
      }
      if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (css.startsWith("/*", p)) {
      const end = css.indexOf("*/", p + 2);
      p = end === -1 ? css.length - 1 : end + 1;
      continue;
    }
    if (c === "{") depth += 1;
    else if (c === "}") {
      depth -= 1;
      if (depth === 0) return p;
    }
  }
  throw new Error("unbalanced braces");
}

function prefixSelectorList(list) {
  return splitSelectors(list).map(prefixOne).join(",");
}

function splitSelectors(input) {
  const parts = [];
  let current = "";
  let depth = 0;
  let quote = "";
  for (let i = 0; i < input.length; i += 1) {
    const c = input[i];
    if (quote) {
      current += c;
      if (c === "\\") {
        current += input[i + 1] || "";
        i += 1;
        continue;
      }
      if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      current += c;
      continue;
    }
    if (c === "(") {
      depth += 1;
      current += c;
      continue;
    }
    if (c === ")") {
      depth = Math.max(0, depth - 1);
      current += c;
      continue;
    }
    if (c === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += c;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function prefixOne(raw) {
  let sel = raw.trim();
  if (!sel) return sel;
  sel = sel.replace(/:root\b/g, ".mkt");
  sel = sel.replace(/\bhtml\b/g, ".mkt");
  sel = sel.replace(/\bbody\b/g, ".mkt");
  sel = sel.replace(/(^|\s)\.js(?=\s|:|,|$)/g, "$1.mkt.js");
  if (!sel.includes(".mkt")) sel = `.mkt ${sel}`;
  return sel;
}

function assertScoped(cssText) {
  const withoutAt = cssText.replace(/@(?:keyframes|property|font-face)[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "");
  const selectors = [];
  const re = /([^{}]+)\{/g;
  let match;
  while ((match = re.exec(withoutAt))) {
    const header = match[1].trim();
    if (!header || header.startsWith("@")) continue;
    for (const part of splitSelectors(header)) {
      const sel = part.trim();
      if (!sel) continue;
      selectors.push(sel);
      if (!sel.includes(".mkt")) throw new Error(`unscoped selector: ${sel}`);
    }
  }
  if (!selectors.some((sel) => sel === ".mkt .btn" || sel.startsWith(".mkt .btn"))) {
    throw new Error("expected .mkt .btn");
  }
  if (!selectors.some((sel) => sel.includes(".mkt.js"))) throw new Error("expected .mkt.js reveal selectors");
  if (!selectors.some((sel) => sel.includes(".mkt:not(.mode-waitlist)"))) {
    throw new Error("expected launch-mode selector on .mkt");
  }
}

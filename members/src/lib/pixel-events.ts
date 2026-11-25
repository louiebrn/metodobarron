"use client";

import {
  LAUNCH_PRICE_BRL,
  type MarketingEvent,
  pixelConfig,
  readStoredConsent,
  tiktokEventName,
} from "@/lib/tracking";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded?: boolean;
  version?: string;
  push: Fbq;
};

type Ttq = {
  page: () => void;
  track: (event: string, props?: Record<string, unknown>) => void;
  load: (id: string, options?: Record<string, unknown>) => void;
  _i?: Record<string, unknown>;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    ttq?: Ttq;
    TiktokAnalyticsObject?: string;
  }
}

const MONEY = { value: LAUNCH_PRICE_BRL, currency: "BRL" };

function installMeta(id: string) {
  if (window.fbq) {
    window.fbq("init", id);
    return;
  }
  const fbq = function (this: Fbq, ...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  window.fbq("init", id);
}

function installTikTok(id: string) {
  if (window.ttq?._i?.[id]) return;
  const w = window as Window & { TiktokAnalyticsObject?: string; ttq?: Ttq & object[] };
  w.TiktokAnalyticsObject = "ttq";
  const ttq = (w.ttq = w.ttq || ([] as unknown as Ttq & object[]));
  const methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"] as const;
  const queue = ttq as unknown as { push: (args: unknown[]) => void; setAndDefer?: (target: object, method: string) => void; methods?: readonly string[] };
  queue.methods = methods;
  queue.setAndDefer = (target, method) => {
    (target as Record<string, unknown>)[method] = (...args: unknown[]) => {
      queue.push([method, ...args]);
    };
  };
  for (const method of methods) queue.setAndDefer(ttq, method);
  ttq.load = (pixelId: string) => {
    const src = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[pixelId] = [];
    const script = document.createElement("script");
    script.async = true;
    script.src = `${src}?sdkid=${encodeURIComponent(pixelId)}&lib=ttq`;
    document.head.appendChild(script);
  };
  ttq.load(id);
}

function send(event: MarketingEvent) {
  const { meta, tiktok } = pixelConfig();
  if (meta && window.fbq) {
    if (event === "Purchase" || event === "InitiateCheckout") window.fbq("track", event, MONEY);
    else window.fbq("track", event);
  }
  if (tiktok && window.ttq) {
    const name = tiktokEventName(event);
    if (name === "page") window.ttq.page();
    else if (name === "SubmitForm" || name === "CompleteRegistration") window.ttq.track(name);
    else window.ttq.track(name, MONEY);
  }
}

export function armPixels() {
  const { meta, tiktok } = pixelConfig();
  if (meta) installMeta(meta);
  if (tiktok) installTikTok(tiktok);
}

/** Pixels só disparam com Aceitar no banner. Recusar não carrega script nem evento. */
export function trackIfConsented(event: MarketingEvent) {
  if (readStoredConsent(window.localStorage) !== "accepted") return;
  armPixels();
  send(event);
}

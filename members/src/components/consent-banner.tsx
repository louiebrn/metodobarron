"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CONSENT_STORAGE_KEY,
  LAUNCH_PRICE_BRL,
  type ConsentChoice,
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
    else if (name === "SubmitForm") window.ttq.track(name);
    else window.ttq.track(name, MONEY);
  }
}

function armPixels() {
  const { meta, tiktok } = pixelConfig();
  if (meta) installMeta(meta);
  if (tiktok) installTikTok(tiktok);
}

export function ConsentBanner() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChoice(readStoredConsent(window.localStorage));
    setReady(true);
  }, []);

  useEffect(() => {
    if (choice !== "accepted") return;
    armPixels();
    send("PageView");
    if (pathname === "/obrigado" && !sessionStorage.getItem("mb-purchase-sent")) {
      sessionStorage.setItem("mb-purchase-sent", "1");
      send("Purchase");
    }
  }, [choice, pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (readStoredConsent(window.localStorage) !== "accepted") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-checkout]")) send("InitiateCheckout");
    };
    document.addEventListener("click", onClick, true);

    const success = document.getElementById("wlok");
    let sentLead = false;
    const observer = new MutationObserver(() => {
      if (!success || success.hasAttribute("hidden")) {
        sentLead = false;
        return;
      }
      if (sentLead || readStoredConsent(window.localStorage) !== "accepted") return;
      sentLead = true;
      send("Lead");
    });
    if (success) observer.observe(success, { attributes: true, attributeFilter: ["hidden"] });

    return () => {
      document.removeEventListener("click", onClick, true);
      observer.disconnect();
    };
  }, []);

  function choose(next: ConsentChoice) {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, next);
    setChoice(next);
  }

  if (!ready || choice) return null;

  return (
    <div className="lgpd" role="dialog" aria-labelledby="lgpd-title" aria-live="polite">
      <p id="lgpd-title">
        Cookies de sessão entram para a conta funcionar. Medição de anúncios da Meta e do TikTok só roda se você
        aceitar. <a href="/privacidade">Política de Privacidade</a>
      </p>
      <div className="lgpd-actions">
        <button type="button" className="lgpd-no" onClick={() => choose("rejected")}>
          Recusar
        </button>
        <button type="button" className="lgpd-yes" onClick={() => choose("accepted")}>
          Aceitar
        </button>
      </div>
    </div>
  );
}

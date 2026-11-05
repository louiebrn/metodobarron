"use client";

import { useEffect } from "react";

const CHAT_URL = "https://t.me/+Mj-tOeCA_whhYmU0";

type MarketingBootOptions = {
  checkoutUrl: string;
  chatUrl: string;
  launchMode: string;
  waitlistEndpoint: string;
  introVideoUrl: string;
};

declare global {
  interface Window {
    __mbBootHome?: (opts: MarketingBootOptions) => (() => void) | void;
  }
}

export function MarketingBoot({ checkoutUrl }: { checkoutUrl: string }) {
  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    const run = () => {
      if (cancelled || typeof window.__mbBootHome !== "function") return;
      const done = window.__mbBootHome({
        checkoutUrl,
        chatUrl: CHAT_URL,
        launchMode: "open",
        waitlistEndpoint: "",
        introVideoUrl: "",
      });
      if (typeof done === "function") cleanup = done;
    };

    if (typeof window.__mbBootHome === "function") {
      run();
      return () => {
        cancelled = true;
        cleanup();
      };
    }

    const script = document.createElement("script");
    script.src = "/marketing/home.js";
    script.async = true;
    script.onload = () => run();
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      cleanup();
      script.onload = null;
    };
  }, [checkoutUrl]);

  return null;
}

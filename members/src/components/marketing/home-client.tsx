"use client";

import { useEffect } from "react";
import { applyFollowerDom, type FollowerCounts } from "@/lib/follower-format";

const CHAT_URL = "https://t.me/+Mj-tOeCA_whhYmU0";
const LEADS_ENDPOINT = "/api/leads";

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
        waitlistEndpoint: LEADS_ENDPOINT,
        introVideoUrl: "",
      });
      if (typeof done === "function") cleanup = done;
    };

    let repaint = 0;

    const refreshCounts = () => {
      fetch("/api/followers", { headers: { accept: "application/json" } })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: (FollowerCounts & { instagram?: number; tiktok?: number }) | null) => {
          if (cancelled || !data) return;
          const instagram = Number(data.instagram);
          const tiktok = Number(data.tiktok);
          if (!Number.isFinite(instagram) || !Number.isFinite(tiktok)) return;
          const root = document.querySelector(".mkt");
          if (!root) return;
          const apply = () => {
            if (!cancelled) applyFollowerDom(root, { instagram, tiktok });
          };
          apply();
          repaint = window.setTimeout(apply, 1200);
        })
        .catch(() => {
          /* Keep the last counts rendered with the page. */
        });
    };

    if (typeof window.__mbBootHome === "function") {
      run();
      refreshCounts();
      return () => {
        cancelled = true;
        cleanup();
        window.clearTimeout(repaint);
      };
    }

    const script = document.createElement("script");
    script.src = "/marketing/home.js";
    script.async = true;
    script.onload = () => {
      run();
      refreshCounts();
    };
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      cleanup();
      script.onload = null;
      window.clearTimeout(repaint);
    };
  }, [checkoutUrl]);

  return null;
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { armPixels, trackIfConsented } from "@/lib/pixel-events";
import { CONSENT_STORAGE_KEY, type ConsentChoice, readStoredConsent } from "@/lib/tracking";

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
    trackIfConsented("PageView");
    if (pathname === "/obrigado" && !sessionStorage.getItem("mb-purchase-sent")) {
      sessionStorage.setItem("mb-purchase-sent", "1");
      trackIfConsented("Purchase");
    }
  }, [choice, pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-checkout]")) trackIfConsented("InitiateCheckout");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
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

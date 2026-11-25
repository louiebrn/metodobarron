export const CONSENT_STORAGE_KEY = "mb-lgpd";

export type ConsentChoice = "accepted" | "rejected";

export type MarketingEvent = "PageView" | "Lead" | "CompleteRegistration" | "InitiateCheckout" | "Purchase";

/** Public launch price. Pixels send it with checkout and purchase. */
export const LAUNCH_PRICE_BRL = 97;

type PixelEnv = {
  NEXT_PUBLIC_META_PIXEL_ID?: string;
  NEXT_PUBLIC_TIKTOK_PIXEL_ID?: string;
};

function envOrProcess(env?: PixelEnv): PixelEnv {
  return (
    env ?? {
      NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
      NEXT_PUBLIC_TIKTOK_PIXEL_ID: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
    }
  );
}

export function pixelConfig(env?: PixelEnv): { meta: string; tiktok: string } {
  const source = envOrProcess(env);
  return {
    meta: source.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "",
    tiktok: source.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() ?? "",
  };
}

export function hasMarketingPixels(env?: PixelEnv): boolean {
  const { meta, tiktok } = pixelConfig(env);
  return Boolean(meta || tiktok);
}

/**
 * TikTok has no event named Purchase or Lead.
 * Lead → SubmitForm. Purchase → CompletePayment. InitiateCheckout keeps the same name.
 */
export function tiktokEventName(
  event: MarketingEvent,
): "page" | "SubmitForm" | "CompleteRegistration" | "InitiateCheckout" | "CompletePayment" {
  if (event === "PageView") return "page";
  if (event === "Lead") return "SubmitForm";
  if (event === "CompleteRegistration") return "CompleteRegistration";
  if (event === "InitiateCheckout") return "InitiateCheckout";
  return "CompletePayment";
}

export function readStoredConsent(storage: Pick<Storage, "getItem"> | null): ConsentChoice | null {
  if (!storage) return null;
  const value = storage.getItem(CONSENT_STORAGE_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
}

const PAYMENT_LINK_FALLBACK = "https://buy.stripe.com/cNi6oG8sBewcaWk7tldfG01";

function trimmed(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function httpUrl(value: string, fallback: string): string {
  const candidate = value || fallback;
  try {
    const url = new URL(candidate);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    /* use fallback */
  }
  return fallback.replace(/\/$/, "");
}

/** Demo UI + bearer webhook. Explicit DEMO_MODE wins. Otherwise on only for local dev without a webhook secret. */
export function isDemoMode(): boolean {
  const flag = trimmed("DEMO_MODE").toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes") return true;
  if (flag === "0" || flag === "false" || flag === "no") return false;
  return process.env.NODE_ENV !== "production" && !trimmed("STRIPE_WEBHOOK_SECRET");
}

export function demoWebhookToken(): string {
  return trimmed("DEMO_WEBHOOK_TOKEN") || "demo-local";
}

export const config = {
  get appUrl() {
    return httpUrl(trimmed("APP_URL"), "http://localhost:3000");
  },
  get marketingUrl() {
    return httpUrl(trimmed("MARKETING_URL"), "https://metodobarron.com");
  },
  get paymentLinkUrl() {
    return httpUrl(trimmed("STRIPE_PAYMENT_LINK_URL"), PAYMENT_LINK_FALLBACK);
  },
  get paymentLinkId() {
    return trimmed("STRIPE_PAYMENT_LINK_ID") || "plink_1UYTL9COW8xQ7IOjQ0gliHvp";
  },
  get stripeSecretKey() {
    return trimmed("STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret() {
    return trimmed("STRIPE_WEBHOOK_SECRET");
  },
  get portalLoginUrl() {
    const value = trimmed("STRIPE_CUSTOMER_PORTAL_LOGIN_URL");
    if (!value) return "";
    try {
      const url = new URL(value);
      if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
    } catch {
      return "";
    }
    return "";
  },
};

export function checkoutUrl(user: { id: string; email: string }): string {
  const url = new URL(config.paymentLinkUrl);
  url.searchParams.set("client_reference_id", user.id);
  url.searchParams.set("prefilled_email", user.email);
  return url.toString();
}

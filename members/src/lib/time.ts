import { TIME_ZONE } from "./scoring";

/** Calendar month key `YYYY-MM` in America/Sao_Paulo. */
export function monthKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month) {
    throw new Error("Could not format month key");
  }
  return `${year}-${month}`;
}

/** "novembro de 2026" for a `YYYY-MM` key. Interpreted in UTC so the label cannot shift months. */
export function formatMonth(key: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(key);
  if (!match) return key;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatPoints(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/** Unix seconds, for Stripe period ends. */
export function formatDateTime(unixSeconds: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).format(new Date(unixSeconds * 1000));
}

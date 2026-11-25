import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export const LEAD_DOWNLOADS = [
  { href: "/materiais/diario-de-trades.csv", label: "Planilha de diário de trades" },
  { href: "/materiais/checklist-pre-mercado.html", label: "Checklist pré-mercado" },
] as const;

export type LeadInput = {
  name?: unknown;
  contactType?: unknown;
  contact?: unknown;
  honeypot?: unknown;
  page?: unknown;
};

export type StoredLead = {
  id: string;
  name: string;
  contactType: "email" | "whatsapp";
  contact: string;
  page: string;
  createdAt: string;
};

export type CaptureResult =
  | { ok: true; stored: boolean; honeypot?: boolean }
  | { ok: false; error: string; status: number };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeWhatsApp(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (!/^[1-9][1-9]/.test(digits)) return null;
  const valid = digits.length === 11 ? digits[2] === "9" : digits.length === 10;
  return valid ? `+55${digits}` : null;
}

export function parseLead(input: LeadInput): { ok: true; lead: StoredLead } | { ok: true; honeypot: true } | { ok: false; error: string } {
  if (String(input.honeypot ?? "").trim()) return { ok: true, honeypot: true };
  const contactType = input.contactType === "whatsapp" ? "whatsapp" : input.contactType === "email" ? "email" : "";
  if (!contactType) return { ok: false, error: "Escolha e-mail ou WhatsApp." };
  const raw = String(input.contact ?? "").trim();
  const contact = contactType === "email" ? raw.toLowerCase() : normalizeWhatsApp(raw);
  if (contactType === "email" && (!contact || contact.length > 120 || !EMAIL.test(contact))) {
    return { ok: false, error: raw ? "Esse e-mail não parece válido." : "Digite seu e-mail." };
  }
  if (contactType === "whatsapp" && !contact) {
    return { ok: false, error: raw ? "Esse número não parece válido. Use DDD + número." : "Digite seu WhatsApp com DDD." };
  }
  const name = String(input.name ?? "").trim().slice(0, 80);
  const page = String(input.page ?? "").trim().slice(0, 300);
  return {
    ok: true,
    lead: {
      id: randomUUID(),
      name,
      contactType,
      contact: contact!,
      page,
      createdAt: new Date().toISOString(),
    },
  };
}

export function insertLead(db: DatabaseSync, lead: StoredLead): void {
  db.prepare(
    `INSERT INTO leads (id, name, contact_type, contact, page, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(lead.id, lead.name, lead.contactType, lead.contact, lead.page, Date.parse(lead.createdAt));
}

export async function captureLead(
  db: DatabaseSync | null,
  input: LeadInput,
  options: { webhookUrl?: string; fetchImpl?: typeof fetch } = {},
): Promise<CaptureResult> {
  const parsed = parseLead(input);
  if (!parsed.ok) return { ok: false, error: parsed.error, status: 400 };
  if ("honeypot" in parsed) return { ok: true, stored: false, honeypot: true };

  let stored = false;
  if (db) {
    try {
      insertLead(db, parsed.lead);
      stored = true;
    } catch (error) {
      console.error("[leads] sqlite", error instanceof Error ? error.message : "erro");
    }
  }

  const webhookUrl = options.webhookUrl?.trim() ?? "";
  if (webhookUrl) {
    try {
      const response = await (options.fetchImpl ?? fetch)(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          name: parsed.lead.name,
          contactType: parsed.lead.contactType,
          contact: parsed.lead.contact,
          page: parsed.lead.page,
          createdAt: parsed.lead.createdAt,
          source: "Método Barron",
          offer: "diario-de-trades+checklist-pre-mercado",
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) stored = true;
      else console.error("[leads] webhook", response.status);
    } catch (error) {
      console.error("[leads] webhook", error instanceof Error ? error.message : "erro");
    }
  }

  if (!stored) {
    return {
      ok: false,
      status: 503,
      error: "Não foi possível guardar o contato agora. Tente de novo em instantes.",
    };
  }
  return { ok: true, stored: true };
}

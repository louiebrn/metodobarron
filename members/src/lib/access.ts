const OPEN = new Set(["active", "trialing"]);

export type AccessSnapshot = {
  status: string;
  currentPeriodEnd: number | null;
};

/** Course access while Stripe (or demo) status is active or trialing, and the period has not ended. */
export function hasAccess(sub: AccessSnapshot | null, nowMs: number = Date.now()): boolean {
  if (!sub || !OPEN.has(sub.status)) return false;
  if (sub.currentPeriodEnd != null && sub.currentPeriodEnd <= Math.floor(nowMs / 1000)) {
    return false;
  }
  return true;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  trialing: "Em período de teste",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  unpaid: "Em atraso",
  incomplete: "Aguardando pagamento",
  incomplete_expired: "Expirada",
  paused: "Pausada",
  inactive: "Inativa",
};

export function statusLabel(status: string | null | undefined): string {
  if (!status) return "Sem assinatura";
  return STATUS_LABEL[status] ?? "Sem assinatura";
}

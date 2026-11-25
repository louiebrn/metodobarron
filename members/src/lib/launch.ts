/** Launch moment: Monday 30 November 2026, 12:00 in America/Sao_Paulo (UTC−3, no DST). */
export const LAUNCH_AT = "2026-11-30T12:00:00-03:00";

export function launchInstant(): number {
  return Date.parse(LAUNCH_AT);
}

export function launchState(now = Date.now()): { open: boolean; remain: string } {
  const left = launchInstant() - now;
  if (left <= 0) return { open: true, remain: "" };
  const seconds = Math.floor(left / 1000);
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  const clock = days > 0
    ? `${days}d ${pad(hours)}h ${pad(minutes)}min ${pad(secs)}s`
    : `${pad(hours)}h ${pad(minutes)}min ${pad(secs)}s`;
  return { open: false, remain: `Faltam ${clock}` };
}

/** First-paint copy for every countdown on the marketing page. The client clock takes over. */
export function applyLaunchMarkup(html: string, now = Date.now()): string {
  const state = launchState(now);
  if (!state.open) return html.replaceAll("Faltam —", state.remain);
  return html
    .replaceAll('data-lcd-remain">Faltam —</b>', 'data-lcd-remain" hidden>Faltam —</b>')
    .replaceAll('data-lcd-open" hidden>Vagas abertas</b>', 'data-lcd-open">Vagas abertas</b>');
}

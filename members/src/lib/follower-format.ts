/** pt-BR follower labels shared by the page, the count-up and the milestone. */

export type FollowerCounts = {
  instagram: number;
  tiktok: number;
};

export const TIKTOK_GOALS = [50_000, 75_000, 100_000, 150_000, 200_000, 250_000, 500_000, 1_000_000];

function roundHalfEven(value: number): number {
  const lower = Math.floor(value);
  const upper = Math.ceil(value);
  if (value - lower !== 0.5) return Math.round(value);
  return lower % 2 === 0 ? lower : upper;
}

/** 53600 → "54 mil", 30000 → "30 mil", 1000000 → "1 mi". */
export function formatFollowers(value: number): string {
  const count = +value || 0;
  if (count < 1000) return String(Math.round(count));
  if (count < 999_500) {
    const thousands = count / 1000;
    if (thousands < 10 && roundHalfEven(thousands * 10) / 10 !== roundHalfEven(thousands)) {
      return `${(roundHalfEven(thousands * 10) / 10).toFixed(1).replace(".", ",")} mil`;
    }
    return `${roundHalfEven(thousands)} mil`;
  }
  const millions = roundHalfEven(count / 100_000) / 10;
  const text = String(millions).replace(".", ",");
  return `${text.endsWith(",0") ? text.slice(0, -2) : text} mi`;
}

export function followerTotal(counts: FollowerCounts): number {
  return counts.instagram + counts.tiktok;
}

/** Next TikTok goal and progress from the previous goal, matching the page bar. */
export function tiktokMilestone(count: number): { goal: number; previous: number; pct: number } {
  const goal = TIKTOK_GOALS.find((step) => count < step) ?? TIKTOK_GOALS[TIKTOK_GOALS.length - 1];
  const previous = [...TIKTOK_GOALS].filter((step) => step < goal).pop() ?? 0;
  const span = goal - previous || 1;
  const pct = Math.max(0, Math.min(100, Math.round(((count - previous) / span) * 100)));
  return { goal, previous, pct };
}

export function applyFollowerMarkup(html: string, counts: FollowerCounts): string {
  const ig = formatFollowers(counts.instagram);
  const tt = formatFollowers(counts.tiktok);
  const total = formatFollowers(followerTotal(counts));
  const { goal } = tiktokMilestone(counts.tiktok);
  return html
    .replace(
      /data-f="ig" data-n="\d+" data-countup>[^<]*/g,
      `data-f="ig" data-n="${counts.instagram}" data-countup>${ig}`,
    )
    .replace(
      /data-f="tt" data-n="\d+" data-countup>[^<]*/g,
      `data-f="tt" data-n="${counts.tiktok}" data-countup>${tt}`,
    )
    .replace(
      /data-f="total" data-n="\d+" data-countup>[^<]*/g,
      `data-f="total" data-n="${followerTotal(counts)}" data-countup>+${total}`,
    )
    .replace(
      /data-f="total-plain" data-n="\d+">[^<]*/g,
      `data-f="total-plain" data-n="${followerTotal(counts)}">${total}`,
    )
    .replace(/data-ms-cur>[^<]*/g, `data-ms-cur>${tt}`)
    .replace(/data-ms-goal>[^<]*/g, `data-ms-goal>${formatFollowers(goal)}`);
}

export function applyFollowerDom(root: ParentNode, counts: FollowerCounts): void {
  const ig = formatFollowers(counts.instagram);
  const tt = formatFollowers(counts.tiktok);
  const total = formatFollowers(followerTotal(counts));
  const write = (selector: string, value: number, text: string) => {
    const el = root.querySelector(selector);
    if (!el) return;
    el.setAttribute("data-n", String(value));
    const prefix = el.getAttribute("data-f") === "total" ? "+" : "";
    el.textContent = prefix + text;
  };
  write('[data-f="ig"]', counts.instagram, ig);
  write('[data-f="tt"]', counts.tiktok, tt);
  write('[data-f="total"]', followerTotal(counts), total);
  write('[data-f="total-plain"]', followerTotal(counts), total);

  const milestone = tiktokMilestone(counts.tiktok);
  const goalLabel = formatFollowers(milestone.goal);
  const current = root.querySelector("[data-ms-cur]");
  if (current) current.textContent = tt;
  const goal = root.querySelector("[data-ms-goal]");
  if (goal) goal.textContent = goalLabel;
  const pct = root.querySelector("[data-ms-pct]");
  if (pct) pct.textContent = `${milestone.pct}%`;
  const fill = root.querySelector("[data-ms-fill]");
  if (fill instanceof HTMLElement) fill.style.width = `${milestone.pct}%`;
  const track = root.querySelector("[data-ms-track]");
  if (track) {
    track.setAttribute("aria-valuenow", String(milestone.pct));
    track.setAttribute("aria-valuetext", `${tt} de ${goalLabel} (${milestone.pct}%)`);
  }
}

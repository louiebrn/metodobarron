import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import fallbackJson from "./followers.json";
import { type FollowerCounts } from "./follower-format";

export function followersPath(): string {
  return path.join(process.cwd(), "src/lib/followers.json");
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export type FollowerSource = "fallback" | "tiktok-profile" | "instagram-html" | "instagram-session" | "instagram-graph";

export type FollowerFile = FollowerCounts & {
  instagramUpdatedAt: string | null;
  tiktokUpdatedAt: string | null;
  instagramSource: FollowerSource | string;
  tiktokSource: FollowerSource | string;
  handles: { instagram: string; tiktok: string };
};

export type FollowerRefresh = {
  counts: FollowerFile;
  changed: boolean;
  notes: string[];
};

const HARD_MIN = 1_000;
const HARD_MAX = 50_000_000;

function asCount(value: unknown): number | null {
  const count = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(count) || count < HARD_MIN || count > HARD_MAX) return null;
  return count;
}

export function saneFollowerCount(next: number, previous: number | null): boolean {
  if (!Number.isInteger(next) || next < HARD_MIN || next > HARD_MAX) return false;
  if (previous == null || previous <= 0) return true;
  return next >= previous * 0.5 && next <= previous * 3;
}

export function readFollowerFile(): FollowerFile {
  try {
    const parsed = JSON.parse(readFileSync(followersPath(), "utf8")) as Partial<FollowerFile>;
    const instagram = asCount(parsed.instagram) ?? fallbackJson.instagram;
    const tiktok = asCount(parsed.tiktok) ?? fallbackJson.tiktok;
    return {
      instagram,
      tiktok,
      instagramUpdatedAt: parsed.instagramUpdatedAt ?? null,
      tiktokUpdatedAt: parsed.tiktokUpdatedAt ?? null,
      instagramSource: parsed.instagramSource || "fallback",
      tiktokSource: parsed.tiktokSource || "fallback",
      handles: {
        instagram: parsed.handles?.instagram || fallbackJson.handles.instagram,
        tiktok: parsed.handles?.tiktok || fallbackJson.handles.tiktok,
      },
    };
  } catch {
    return {
      instagram: fallbackJson.instagram,
      tiktok: fallbackJson.tiktok,
      instagramUpdatedAt: fallbackJson.instagramUpdatedAt,
      tiktokUpdatedAt: fallbackJson.tiktokUpdatedAt,
      instagramSource: fallbackJson.instagramSource,
      tiktokSource: fallbackJson.tiktokSource,
      handles: fallbackJson.handles,
    };
  }
}

export function writeFollowerFile(file: FollowerFile): void {
  writeFileSync(followersPath(), `${JSON.stringify(file, null, 2)}\n`);
}

export function parseTikTokFollowers(html: string, handle: string): number | null {
  const marker = `"uniqueId":"${handle}"`;
  const at = html.indexOf(marker);
  const slice = at >= 0 ? html.slice(at, at + 12_000) : html;
  const precise = slice.match(/"statsV2":\{"followerCount":"(\d+)"/);
  const rounded = slice.match(/"stats":\{"followerCount":(\d+)/);
  return asCount(precise?.[1] ?? rounded?.[1]);
}

export function parseInstagramHtml(html: string): number | null {
  const jsonCount = html.match(/"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)/);
  if (jsonCount) return asCount(jsonCount[1]);
  const words = html.match(/([\d][\d.,]*)\s*(k|m|mil|mi)?\s*(followers|seguidores)/i);
  if (!words) return null;
  return parseLooseCount(`${words[1]}${words[2] ?? ""}`);
}

export function parseInstagramProfileJson(payload: unknown): number | null {
  const user = (payload as { data?: { user?: { edge_followed_by?: { count?: unknown } } } })?.data?.user;
  return asCount(user?.edge_followed_by?.count);
}

function parseLooseCount(raw: string): number | null {
  const text = raw.trim().toLowerCase().replace(/\s/g, "");
  const match = text.match(/^(\d+(?:[.,]\d+)?)(k|m|mil|mi)?$/);
  if (!match) {
    const digits = text.replace(/\D/g, "");
    return asCount(digits);
  }
  const base = Number(match[1].replace(",", "."));
  if (!Number.isFinite(base)) return null;
  const unit = match[2];
  const value = unit === "k" || unit === "mil" ? base * 1000 : unit === "m" || unit === "mi" ? base * 1_000_000 : base;
  return asCount(Math.round(value));
}

async function fetchText(url: string, headers: Record<string, string>, timeoutMs = 8000): Promise<string> {
  const response = await fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

export async function fetchTikTokCount(handle: string): Promise<number> {
  const html = await fetchText(`https://www.tiktok.com/@${encodeURIComponent(handle)}`, {
    "user-agent": UA,
    "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
    accept: "text/html",
  });
  const count = parseTikTokFollowers(html, handle);
  if (count == null) throw new Error("tiktok: followerCount ausente");
  return count;
}

export async function fetchInstagramCount(handle: string, env: NodeJS.ProcessEnv = process.env): Promise<{ count: number; source: FollowerSource }> {
  const version = (env.INSTAGRAM_GRAPH_VERSION || "v21.0").replace(/[^\w.]/g, "") || "v21.0";
  const token = env.INSTAGRAM_GRAPH_TOKEN?.trim();
  const userId = env.INSTAGRAM_USER_ID?.trim();
  if (token && userId) {
    const url = new URL(`https://graph.facebook.com/${version}/${encodeURIComponent(userId)}`);
    url.searchParams.set("fields", "followers_count");
    url.searchParams.set("access_token", token);
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`instagram graph ${response.status}`);
    const payload = (await response.json()) as { followers_count?: unknown };
    const count = asCount(payload.followers_count);
    if (count == null) throw new Error("instagram graph: followers_count ausente");
    return { count, source: "instagram-graph" };
  }

  const session = env.INSTAGRAM_SESSIONID?.trim();
  if (session) {
    const response = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`,
      {
        headers: {
          "user-agent": UA,
          accept: "application/json",
          "x-ig-app-id": "936619743392459",
          referer: `https://www.instagram.com/${handle}/`,
          cookie: `sessionid=${session}`,
        },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) throw new Error(`instagram session ${response.status}`);
    const count = parseInstagramProfileJson(await response.json());
    if (count == null) throw new Error("instagram session: contagem ausente");
    return { count, source: "instagram-session" };
  }

  const html = await fetchText(`https://www.instagram.com/${encodeURIComponent(handle)}/`, {
    "user-agent": UA,
    "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
    accept: "text/html",
  });
  const count = parseInstagramHtml(html);
  if (count == null) throw new Error("instagram html: contagem ausente");
  return { count, source: "instagram-html" };
}

export async function probeFollowers(env: NodeJS.ProcessEnv = process.env): Promise<FollowerRefresh> {
  const current = readFollowerFile();
  const notes: string[] = [];
  const next: FollowerFile = { ...current, handles: { ...current.handles } };
  let changed = false;
  const stamp = new Date().toISOString();

  try {
    const tiktok = await fetchTikTokCount(current.handles.tiktok);
    if (!saneFollowerCount(tiktok, current.tiktok)) {
      notes.push(`tiktok rejeitado (${tiktok}); mantendo ${current.tiktok}`);
    } else if (tiktok !== current.tiktok) {
      next.tiktok = tiktok;
      next.tiktokSource = "tiktok-profile";
      next.tiktokUpdatedAt = stamp;
      changed = true;
      notes.push(`tiktok ${current.tiktok} → ${tiktok}`);
    } else {
      notes.push(`tiktok sem mudança (${tiktok})`);
    }
  } catch (error) {
    notes.push(`tiktok falhou (${error instanceof Error ? error.message : "erro"}); mantendo ${current.tiktok}`);
  }

  try {
    const instagram = await fetchInstagramCount(current.handles.instagram, env);
    if (!saneFollowerCount(instagram.count, current.instagram)) {
      notes.push(`instagram rejeitado (${instagram.count}); mantendo ${current.instagram}`);
    } else if (instagram.count !== current.instagram || current.instagramSource === "fallback") {
      next.instagram = instagram.count;
      next.instagramSource = instagram.source;
      next.instagramUpdatedAt = stamp;
      changed = true;
      notes.push(`instagram ${current.instagram} → ${instagram.count} (${instagram.source})`);
    } else {
      notes.push(`instagram sem mudança (${instagram.count})`);
    }
  } catch (error) {
    notes.push(`instagram falhou (${error instanceof Error ? error.message : "erro"}); mantendo ${current.instagram}`);
  }

  return { counts: changed ? next : current, changed, notes };
}

export async function refreshFollowerFile(env: NodeJS.ProcessEnv = process.env): Promise<FollowerRefresh> {
  const probed = await probeFollowers(env);
  if (probed.changed) writeFollowerFile(probed.counts);
  return probed;
}

type LiveCache = { at: number; body: FollowerFile; ttl: number };
let liveCache: LiveCache | null = null;

/** Live counts when the network answers, otherwise the last JSON saved in the repo. */
export async function loadFollowerCounts(): Promise<FollowerFile> {
  const now = Date.now();
  if (liveCache && now - liveCache.at < liveCache.ttl) return liveCache.body;
  const saved = readFollowerFile();
  try {
    const probed = await probeFollowers();
    const failedBoth = probed.notes.filter((note) => note.includes("falhou")).length === 2;
    liveCache = {
      at: now,
      body: probed.counts,
      ttl: failedBoth ? 15 * 60 * 1000 : 6 * 60 * 60 * 1000,
    };
    return probed.counts;
  } catch {
    liveCache = { at: now, body: saved, ttl: 15 * 60 * 1000 };
    return saved;
  }
}

export function resetFollowerCache(): void {
  liveCache = null;
}

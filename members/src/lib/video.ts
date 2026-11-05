export type VideoEmbed = { kind: "youtube"; src: string } | { kind: "file"; src: string };

/** Accepts a YouTube watch/share/embed URL or a direct mp4/webm. Empty string is the placeholder. */
export function videoEmbed(raw: string): VideoEmbed | null {
  const url = raw.trim();
  if (!url) return null;
  const youtube = youtubeId(url);
  if (youtube) {
    return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtube)}?rel=0&modestbranding=1` };
  }
  if (/^https:\/\/.+\.(mp4|webm)(\?|$)/i.test(url)) return { kind: "file", src: url };
  return null;
}

function youtubeId(value: string): string {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] ?? "";
    if (/(^|\.)youtube\.com$/i.test(url.hostname) || /(^|\.)youtube-nocookie\.com$/i.test(url.hostname)) {
      return url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/)?.[1] || "";
    }
  } catch {
    return "";
  }
  return "";
}

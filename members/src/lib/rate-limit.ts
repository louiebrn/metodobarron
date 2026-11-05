const buckets = new Map<string, { count: number; reset: number }>();

/** In-memory limiter. Good enough for the local scaffold; use a shared store before a multi-instance deploy. */
export function allow(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const hit = buckets.get(key);
  if (!hit || hit.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  hit.count += 1;
  return hit.count <= limit;
}

/**
 * Minimal fixed-window limiter. State is per server instance, so on serverless hosts it is a speed bump
 * rather than a hard guarantee; put Netlify/Cloudflare rate-limit rules or Upstash in front for production.
 */
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): { ok: boolean; retryAfterSec: number } {
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  h.count += 1;
  return h.count <= limit ? { ok: true, retryAfterSec: 0 } : { ok: false, retryAfterSec: Math.ceil((h.reset - now) / 1000) };
}

export function _resetRateLimits() { hits.clear(); }

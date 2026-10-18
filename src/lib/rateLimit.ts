// Lightweight in-memory rate limiter for the public auth actions (login,
// register, forgot-password, reset-password). Good for a single instance;
// swap for a shared store (Redis/Upstash) if the site runs on many instances.
const buckets = new Map<string, { count: number; resetAt: number }>()

const MAX_BUCKETS = 10_000

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now()

  // Opportunistic cleanup
  const bucket = buckets.get(key)
  if (bucket && bucket.resetAt <= now) {
    buckets.delete(key)
  }

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k)
    }
  }

  const current = buckets.get(key)
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0 }
  }

  current.count += 1
  if (current.count > limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfterSeconds: 0 }
}

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const UPSTASH_CONFIGURED =
  process.env.UPSTASH_REDIS_REST_URL &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('localhost') &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_TOKEN !== 'mock_upstash_token';

// ─── Fallback no-op rate limiter for local/mock environments ─────────────────
const noOpRatelimit = {
  limit: async (_identifier: string) => ({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000,
    pending: Promise.resolve(),
    reason: 'RATE_LIMIT',
    status: 'SUCCESS' as const,
    headers: {},
    modeRatelimit: undefined,
  }),
};

function makeRatelimit(config: {
  limiter: ReturnType<typeof Ratelimit.slidingWindow>;
  prefix: string;
}) {
  if (!UPSTASH_CONFIGURED) return noOpRatelimit;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return new Ratelimit({
    redis,
    limiter: config.limiter,
    prefix: config.prefix,
    analytics: false,
  });
}

// ─── Rate limiters ────────────────────────────────────────────────────────────

// Auth routes: 5 requests per 15 minutes (per IP)
export const authRateLimit = makeRatelimit({
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix: 'rl:auth',
});

// General API: 100 requests per minute (per userId)
export const apiRateLimit = makeRatelimit({
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'rl:api',
});

// Manual check: 1 per URL per 10 minutes (per urlId)
export const manualCheckRateLimit = makeRatelimit({
  limiter: Ratelimit.slidingWindow(1, '10 m'),
  prefix: 'rl:manual-check',
});

// ─── Response helper ──────────────────────────────────────────────────────────

export function rateLimitResponse(reset: number) {
  const retryAfterSecs = Math.ceil((reset - Date.now()) / 1000);
  return Response.json(
    { error: 'Rate limit exceeded. Please wait before retrying.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSecs),
        'X-RateLimit-Reset': String(reset),
      },
    },
  );
}

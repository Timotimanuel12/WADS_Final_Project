type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type RateLimitBucket = {
  timestamps: number[];
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function enforceRateLimit(request: Request, scope: string, options: RateLimitOptions, subjectId?: string) {
  const key = buildRateLimitKey(request, scope, subjectId);
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const bucket = rateLimitBuckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => timestamp >= windowStart);

  if (bucket.timestamps.length >= options.max) {
    rateLimitBuckets.set(key, bucket);
    const retryAfterMs = Math.max(1_000, bucket.timestamps[0] + options.windowMs - now);
    return { limited: true, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  bucket.timestamps.push(now);
  rateLimitBuckets.set(key, bucket);
  return { limited: false as const, retryAfterSeconds: 0 };
}

function buildRateLimitKey(request: Request, scope: string, subjectId?: string) {
  const identity = subjectId || getClientIp(request);
  return `${scope}:${identity}`;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const connectingIp = request.headers.get("cf-connecting-ip")?.trim();
  return forwardedFor || realIp || connectingIp || "unknown";
}
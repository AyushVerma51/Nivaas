import type { RequestHandler } from "express";
import { AppError } from "../lib/errors";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * In-memory per-IP sliding-window-ish limiter. No dependencies, good for a
 * single instance. For multi-instance deployments swap the Map for Redis
 * (see DEPLOYMENT.md) — the interface stays the same.
 */
export function rateLimit(opts: { max: number; windowMs: number }): RequestHandler {
  const buckets = new Map<string, Bucket>();

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, opts.windowMs);
  timer.unref();

  return (req, _res, next) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const bucket = buckets.get(ip);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(ip, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > opts.max) {
      return next(
        new AppError(429, "RATE_LIMITED", "Too many requests — please slow down"),
      );
    }
    next();
  };
}

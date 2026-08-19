/**
 * Structured logger for the Atlas API — JSON lines, no secrets.
 * Swap the sink for Sentry/pino later without changing call sites.
 */

type Level = "info" | "warn" | "error";

function emit(level: Level, message: string, fields?: Record<string, unknown>) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: "atlas-api",
    message,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, fields?: Record<string, unknown>) => emit("info", message, fields),
  warn: (message: string, fields?: Record<string, unknown>) => emit("warn", message, fields),
  error: (message: string, fields?: Record<string, unknown>) => emit("error", message, fields),
};

/** Express request logger middleware. */
export function requestLogger(req: unknown, res: unknown, next: () => void) {
  const start = Date.now();
  const r = req as { method?: string; url?: string; ip?: string };
  const s = res as { on?: (e: string, cb: () => void) => void; statusCode?: number };
  s.on?.("finish", () => {
    logger.info("request", {
      method: r.method,
      url: r.url,
      status: s.statusCode,
      ms: Date.now() - start,
      ip: r.ip,
    });
  });
  next();
}

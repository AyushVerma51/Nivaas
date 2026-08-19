import type { RequestHandler } from "express";
import type { z } from "zod";
import { AppError } from "./errors";

/**
 * Validates `req.body` / `req.query` / `req.params` against a zod schema and
 * replaces the parsed value with the (coerced, defaulted) result.
 */
export function validate(
  schema: z.ZodTypeAny,
  source: "body" | "query" | "params" = "body",
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new AppError(400, "VALIDATION_ERROR", "Invalid request", result.error.flatten()),
      );
    }
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
}

import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";

/**
 * Atlas API error contract:
 *   { "success": false, "error": { "code": "…", "message": "…" } }
 *
 * Mounted inside the /api/v1 chain so Atlas responses never leak the
 * platform's flat error shape or raw database errors.
 */
export function atlasErrorHandler(): ErrorRequestHandler {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.status).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      });
      return;
    }
    console.error("Unhandled atlas error:", err);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
    });
  };
}

/** 404 for unknown /api/v1 routes, in the Atlas error shape. */
export function atlasNotFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "NOT_FOUND", "Route not found"));
}

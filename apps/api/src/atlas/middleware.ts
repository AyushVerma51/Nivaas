import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import type { ZodSchema } from "zod";
import { AppError } from "../lib/errors";
import { config } from "../config";
import { prisma } from "./lib/prisma";

export interface AuthUser {
  id: string;
  role: "USER" | "EDITOR" | "ADMIN";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

export const ACCESS_COOKIE = "atlas_access";
export const REFRESH_COOKIE = "atlas_refresh";

export function signAccessToken(user: { id: string; role: string }): string {
  return jwt.sign({ sub: user.id, role: user.role }, config.ATLAS_JWT_SECRET, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.ATLAS_REFRESH_SECRET, {
    expiresIn: "30d",
  });
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  // Manual cookie parse — keeps the Atlas module dependency-free.
  const cookieHeader = req.headers.cookie ?? "";
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === ACCESS_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Require a valid access token (Bearer header or httpOnly cookie). */
export function requireAuth(): RequestHandler {
  return async (req, _res, next) => {
    try {
      const token = readToken(req);
      if (!token) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
      const payload = jwt.verify(token, config.ATLAS_JWT_SECRET) as { sub: string; role: string };
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new AppError(401, "UNAUTHORIZED", "Account no longer exists");
      req.auth = { id: user.id, role: user.role };
      next();
    } catch (e) {
      if (e instanceof AppError) return next(e);
      next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
    }
  };
}

/** Optional auth — sets req.auth when a valid token is present, never errors. */
export function optionalAuth(): RequestHandler {
  return async (req, _res, next) => {
    try {
      const token = readToken(req);
      if (token) {
        const payload = jwt.verify(token, config.ATLAS_JWT_SECRET) as { sub: string };
        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (user) req.auth = { id: user.id, role: user.role };
      }
      next();
    } catch {
      next();
    }
  };
}

/** Role gate — must be used after requireAuth(). */
export function requireRole(...roles: AuthUser["role"][]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    if (!roles.includes(req.auth.role)) {
      return next(new AppError(403, "FORBIDDEN", "You do not have permission to do this"));
    }
    next();
  };
}

/** Validate req.body (or params/query) against a zod schema. */
export function validate(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body",
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new AppError(422, "VALIDATION_ERROR", "Invalid request data", result.error.flatten()),
      );
    }
    req[source] = result.data as never;
    next();
  };
}

/** Not-found guard used by detail routes. */
export function notFound(code: string, message: string): AppError {
  return new AppError(404, code, message);
}

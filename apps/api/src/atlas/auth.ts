import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError, asyncHandler } from "../lib/errors";
import { config } from "../config";
import { prisma } from "./lib/prisma";
import { ok } from "./lib/response";
import { registerSchema, loginSchema } from "./schemas";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  requireAuth,
  signAccessToken,
  signRefreshToken,
  validate,
} from "./middleware";
import type { UserDTO } from "./dto";

function toUserDTO(u: {
  id: string;
  name: string;
  email: string;
  role: "USER" | "EDITOR" | "ADMIN";
  avatar: string | null;
  createdAt: Date;
}): UserDTO {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    createdAt: u.createdAt.toISOString(),
  };
}

function setAuthCookies(res: import("express").Response, access: string, refresh: string) {
  const secure = config.NODE_ENV === "production";
  res.cookie(ACCESS_COOKIE, access, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function authRouter(): Router {
  const router = Router();

  router.post(
    "/register",
    validate(registerSchema),
    asyncHandler(async (req, res) => {
      const { name, email, password } = req.body as {
        name: string;
        email: string;
        password: string;
      };
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists");
      }
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
      });
      const access = signAccessToken(user);
      const refresh = signRefreshToken(user.id);
      setAuthCookies(res, access, refresh);
      res.status(201).json(ok({ user: toUserDTO(user), accessToken: access, refreshToken: refresh }));
    }),
  );

  router.post(
    "/login",
    validate(loginSchema),
    asyncHandler(async (req, res) => {
      const { email, password } = req.body as { email: string; password: string };
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
      }
      const access = signAccessToken(user);
      const refresh = signRefreshToken(user.id);
      setAuthCookies(res, access, refresh);
      res.json(ok({ user: toUserDTO(user), accessToken: access, refreshToken: refresh }));
    }),
  );

  router.post(
    "/logout",
    asyncHandler(async (_req, res) => {
      res.clearCookie(ACCESS_COOKIE);
      res.clearCookie(REFRESH_COOKIE);
      res.json(ok({ loggedOut: true }));
    }),
  );

  router.get(
    "/me",
    requireAuth(),
    asyncHandler(async (req, res) => {
      const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.id } });
      res.json(ok({ user: toUserDTO(user) }));
    }),
  );

  router.post(
    "/refresh",
    asyncHandler(async (req, res) => {
      const body = (req.body ?? {}) as { refreshToken?: string };
      const cookieHeader = req.headers.cookie ?? "";
      let token = body.refreshToken;
      if (!token) {
        for (const part of cookieHeader.split(";")) {
          const [name, ...rest] = part.trim().split("=");
          if (name === REFRESH_COOKIE) token = decodeURIComponent(rest.join("="));
        }
      }
      if (!token) throw new AppError(401, "UNAUTHORIZED", "Refresh token required");
      let payload: { sub: string };
      try {
        payload = jwt.verify(token, config.ATLAS_REFRESH_SECRET) as { sub: string };
      } catch {
        throw new AppError(401, "UNAUTHORIZED", "Invalid or expired refresh token");
      }
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new AppError(401, "UNAUTHORIZED", "Account no longer exists");
      const access = signAccessToken(user);
      const refresh = signRefreshToken(user.id);
      setAuthCookies(res, access, refresh);
      res.json(ok({ accessToken: access, refreshToken: refresh }));
    }),
  );

  return router;
}

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // Treat empty/"0" PORT as unset: some sandbox harnesses export PORT=0 to
  // discourage fixed ports, which would otherwise make Express bind a random
  // port instead of the documented 4000.
  PORT: z.preprocess(
    (v) => (v === undefined || v === null || v === "" || v === "0" || v === 0 ? undefined : v),
    z.coerce.number().default(4000),
  ),
  DATABASE_URL: z
    .string()
    .default("postgres://postgres:postgres@localhost:5432/real_estate"),
  // Atlas India backend (Prisma) — its own database, separate from the platform DB.
  ATLAS_DATABASE_URL: z
    .string()
    .default("postgres://postgres:postgres@localhost:5433/atlas"),
  // JWT for the Atlas API (defaults keep local dev working without env setup).
  ATLAS_JWT_SECRET: z.string().min(16).default("atlas-dev-jwt-secret-change-me-1234"),
  ATLAS_REFRESH_SECRET: z.string().min(16).default("atlas-dev-refresh-secret-change-me-5678"),
  JWT_ACCESS_SECRET: z.string().min(16).default("dev-access-secret-change-me-1234"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev-refresh-secret-change-me-1234"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  ML_SERVICE_URL: z.string().default("http://localhost:8000"),
});

export const config = envSchema.parse(process.env);

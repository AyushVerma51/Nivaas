import { PrismaClient } from "@prisma/client";
import { config } from "../../config";

/**
 * Atlas India Prisma client. Uses its own database (ATLAS_DATABASE_URL) so the
 * tourism tables never touch the real-estate platform schema.
 */
export const prisma = new PrismaClient({
  datasourceUrl: config.ATLAS_DATABASE_URL,
  log: config.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

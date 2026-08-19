import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config";
import { notFoundHandler } from "./lib/errors";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimit } from "./middleware/rateLimit";
import amenitiesRoutes from "./modules/amenities/routes";
import cityGuideRoutes from "./modules/city-guide/routes";
import healthRoutes from "./modules/health/routes";
import imagesRoutes from "./modules/images/routes";

import pricePredictionRoutes from "./modules/price-prediction/routes";
import { atlasRouter } from "./atlas";
import { atlasErrorHandler, atlasNotFound } from "./atlas/lib/errorHandler";
import { docsRouter } from "./atlas/openapi";

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  // Rate limiting (Phase 7). Broad limit; auth endpoints were archived with
  // the login feature (see archive/auth-and-posting). In-memory per process.
  app.use("/api", rateLimit({ max: 600, windowMs: 60_000 }));

  app.get("/", (_req, res) => {
    res.json({
      name: "Real Estate Platform API",
      version: "0.1.0",
      endpoints: [
        "GET  /api/health",
        "POST /api/price-prediction/estimate",

        "GET  /api/amenities?city=&locality=&category=",
        "GET  /api/amenities/neighborhoods/:city/:locality",
        "GET  /api/cities",
        "GET  /api/city-guide/:city",
      ],
    });
  });

  app.use("/api/health", healthRoutes);
  app.use("/api/price-prediction", pricePredictionRoutes);
  app.use("/api/amenities", amenitiesRoutes);
  app.use("/api", cityGuideRoutes);
  app.use("/api", imagesRoutes);

  // ATLAS INDIA — tourism backend (states, destinations, experiences, map,
  // search, journey, reviews, itineraries, trip planner, admin).
  app.use("/api/v1", atlasRouter(), atlasNotFound, atlasErrorHandler());
  app.use(docsRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

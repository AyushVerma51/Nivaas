import { Router } from "express";
import { asyncHandler } from "../../lib/errors";
import { checkDb, pool } from "../../db/pool";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const dbUp = await checkDb();
    let postgis = false;
    if (dbUp) {
      try {
        const { rows } = await pool.query(
          "SELECT PostGIS_Version() AS version",
        );
        postgis = rows.length > 0;
      } catch {
        postgis = false;
      }
    }
    res.status(dbUp ? 200 : 503).json({
      status: dbUp ? "ok" : "degraded",
      db: dbUp,
      postgis,
      uptime_seconds: Math.round(process.uptime()),
    });
  }),
);

export default router;

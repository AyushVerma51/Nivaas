import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/errors";
import { validate } from "../../lib/validate";
import * as service from "./service";

const router = Router();

const listQuerySchema = z.object({
  city: z.string().max(100).optional(),
  locality: z.string().max(100).optional(),
  category: z
    .enum(["school", "college", "hospital", "mall", "park", "metro", "railway"])
    .optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius_km: z.coerce.number().positive().max(50).optional(),
});

router.get(
  "/",
  validate(listQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    // Query params were replaced with the zod-parsed values.
    res.json(await service.findAmenities(req.query as unknown as service.AmenitiesQuery));
  }),
);

/** Neighborhood intelligence summary for /explore/[city]/[locality] (spec 5.3). */
router.get(
  "/neighborhoods/:city/:locality",
  asyncHandler(async (req, res) => {
    res.json(
      await service.neighborhoodSummary(
        req.params.city as string,
        req.params.locality as string,
      ),
    );
  }),
);

export default router;

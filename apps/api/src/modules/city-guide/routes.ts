import { Router } from "express";
import { asyncHandler } from "../../lib/errors";
import * as service from "./service";

const router = Router();

/** City list for the /city-guide index page. */
router.get(
  "/cities",
  asyncHandler(async (_req, res) => {
    res.json(await service.listCities());
  }),
);

/** Full guide: tourist spots + local dishes + nearby cities within ~150 km. */
router.get(
  "/city-guide/:city",
  asyncHandler(async (req, res) => {
    res.json(await service.getCityGuide(req.params.city as string));
  }),
);

export default router;

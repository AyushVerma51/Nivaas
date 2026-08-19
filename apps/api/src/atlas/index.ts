import { Router } from "express";
import { authRouter } from "./auth";
import { contentRouter } from "./content";
import { userRouter } from "./user";
import { reviewsRouter } from "./reviews";
import { tripPlannerRouter } from "./trip-planner";
import { adminRouter } from "./admin";

/** ATLAS INDIA API — mounted under /api/v1. */
export function atlasRouter(): Router {
  const router = Router();

  router.use("/auth", authRouter());
  router.use(contentRouter());
  // User-scoped routers are mounted under /me so their blanket requireAuth()
  // only guards these paths — public routes mounted after stay open.
  router.use("/me", userRouter());
  router.use("/me", reviewsRouter());
  router.use(tripPlannerRouter());
  router.use("/admin", adminRouter());

  return router;
}

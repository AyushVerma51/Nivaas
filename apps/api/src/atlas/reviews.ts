import { Router } from "express";
import { AppError, asyncHandler } from "../lib/errors";
import { prisma } from "./lib/prisma";
import { ok } from "./lib/response";
import { reviewUpdateSchema } from "./schemas";
import { requireAuth, validate } from "./middleware";

/** User's own reviews: list, update, delete. Public reads live in content.ts. */
export function reviewsRouter(): Router {
  const router = Router();
  router.use(requireAuth());

  router.get(
    "/reviews",
    asyncHandler(async (req, res) => {
      const rows = await prisma.review.findMany({
        where: { userId: req.auth!.id },
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          destination: { select: { slug: true, name: true, heroImage: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(
        ok(
          rows.map((r) => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            content: r.content,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
            destination: r.destination,
          })),
        ),
      );
    }),
  );

  router.patch(
    "/reviews/:id",
    validate(reviewUpdateSchema),
    asyncHandler(async (req, res) => {
      const existing = await prisma.review.findFirst({
        where: { id: req.params.id, userId: req.auth!.id },
        select: { id: true },
      });
      if (!existing) throw new AppError(404, "REVIEW_NOT_FOUND", "Review not found");
      const body = req.body as Record<string, unknown>;
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: {
          ...(body.rating !== undefined ? { rating: body.rating as number } : {}),
          ...(body.title !== undefined ? { title: body.title as string } : {}),
          ...(body.content !== undefined ? { content: body.content as string } : {}),
        },
      });
      res.json(ok({ id: updated.id, status: updated.status }));
    }),
  );

  router.delete(
    "/reviews/:id",
    asyncHandler(async (req, res) => {
      const deleted = await prisma.review.deleteMany({
        where: { id: req.params.id, userId: req.auth!.id },
      });
      if (deleted.count === 0) throw new AppError(404, "REVIEW_NOT_FOUND", "Review not found");
      res.json(ok({ deleted: true }));
    }),
  );

  return router;
}

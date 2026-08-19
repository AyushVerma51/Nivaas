import { Router } from "express";
import { AppError, asyncHandler } from "../lib/errors";
import { prisma } from "./lib/prisma";
import { ok } from "./lib/response";
import { resolveDestinationId } from "./lib/resolve";
import {
  wishlistCreateSchema,
  wishlistToggleSchema,
  visitedCreateSchema,
  itineraryCreateSchema,
  itineraryUpdateSchema,
  itineraryDayCreateSchema,
  itineraryDayUpdateSchema,
} from "./schemas";
import { requireAuth, validate } from "./middleware";

const destBrief = {
  id: true,
  slug: true,
  name: true,
  category: true,
  shortDescription: true,
  heroImage: true,
  state: { select: { slug: true, name: true } },
} as const;

export function userRouter(): Router {
  const router = Router();
  router.use(requireAuth());

  const userId = (req: { auth?: { id: string } }) => req.auth!.id;

  // ---- Wishlist ----------------------------------------------------------

  router.get(
    "/wishlist",
    asyncHandler(async (req, res) => {
      const rows = await prisma.wishlist.findMany({
        where: { userId: userId(req) },
        select: { id: true, createdAt: true, destination: { select: destBrief } },
        orderBy: { createdAt: "desc" },
      });
      res.json(
        ok(rows.map((r) => ({ id: r.id, savedAt: r.createdAt.toISOString(), destination: r.destination }))),
      );
    }),
  );

  router.post(
    "/wishlist",
    validate(wishlistCreateSchema),
    asyncHandler(async (req, res) => {
      const destinationId = await resolveDestinationId((req.body as { destinationId: string }).destinationId);
      const existing = await prisma.wishlist.findUnique({
        where: { userId_destinationId: { userId: userId(req), destinationId } },
      });
      if (existing) throw new AppError(409, "ALREADY_SAVED", "Destination is already in your wishlist");
      const saved = await prisma.wishlist.create({
        data: { userId: userId(req), destinationId },
        select: { id: true, createdAt: true, destination: { select: destBrief } },
      });
      track(req, "destination_saved", destinationId);
      res.status(201).json(ok({ id: saved.id, savedAt: saved.createdAt.toISOString(), destination: saved.destination }));
    }),
  );

  router.delete(
    "/wishlist/:destinationId",
    asyncHandler(async (req, res) => {
      const destinationId = await resolveDestinationId(req.params.destinationId as string);
      const deleted = await prisma.wishlist.deleteMany({
        where: { userId: userId(req), destinationId },
      });
      if (deleted.count === 0) throw new AppError(404, "NOT_SAVED", "Destination is not in your wishlist");
      res.json(ok({ removed: true }));
    }),
  );

  router.post(
    "/wishlist/toggle",
    validate(wishlistToggleSchema),
    asyncHandler(async (req, res) => {
      const destinationId = await resolveDestinationId((req.body as { destinationId: string }).destinationId);
      const existing = await prisma.wishlist.findUnique({
        where: { userId_destinationId: { userId: userId(req), destinationId } },
      });
      if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });
        res.json(ok({ saved: false }));
      } else {
        await prisma.wishlist.create({ data: { userId: userId(req), destinationId } });
        track(req, "destination_saved", destinationId);
        res.json(ok({ saved: true }));
      }
    }),
  );

  // ---- Visited -----------------------------------------------------------

  router.get(
    "/visited",
    asyncHandler(async (req, res) => {
      const rows = await prisma.visitedDestination.findMany({
        where: { userId: userId(req) },
        select: { id: true, visitedAt: true, notes: true, destination: { select: destBrief } },
        orderBy: { createdAt: "desc" },
      });
      res.json(
        ok(rows.map((r) => ({
          id: r.id,
          visitedAt: r.visitedAt?.toISOString() ?? null,
          notes: r.notes,
          destination: r.destination,
        }))),
      );
    }),
  );

  router.post(
    "/visited",
    validate(visitedCreateSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as { destinationId: string; visitedAt?: string; notes?: string };
      const destinationId = await resolveDestinationId(body.destinationId);
      const existing = await prisma.visitedDestination.findUnique({
        where: { userId_destinationId: { userId: userId(req), destinationId } },
      });
      if (existing) throw new AppError(409, "ALREADY_VISITED", "Destination is already marked as visited");
      const created = await prisma.visitedDestination.create({
        data: {
          userId: userId(req),
          destinationId,
          visitedAt: body.visitedAt ? new Date(body.visitedAt) : null,
          notes: body.notes,
        },
        select: { id: true, visitedAt: true, notes: true, destination: { select: destBrief } },
      });
      track(req, "destination_visited", destinationId);
      res.status(201).json(ok({ id: created.id, visitedAt: created.visitedAt?.toISOString() ?? null, notes: created.notes, destination: created.destination }));
    }),
  );

  router.delete(
    "/visited/:destinationId",
    asyncHandler(async (req, res) => {
      const destinationId = await resolveDestinationId(req.params.destinationId as string);
      const deleted = await prisma.visitedDestination.deleteMany({
        where: { userId: userId(req), destinationId },
      });
      if (deleted.count === 0) throw new AppError(404, "NOT_VISITED", "Destination is not marked as visited");
      res.json(ok({ removed: true }));
    }),
  );

  router.post(
    "/visited/toggle",
    validate(visitedCreateSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as { destinationId: string; notes?: string };
      const destinationId = await resolveDestinationId(body.destinationId);
      const existing = await prisma.visitedDestination.findUnique({
        where: { userId_destinationId: { userId: userId(req), destinationId } },
      });
      if (existing) {
        await prisma.visitedDestination.delete({ where: { id: existing.id } });
        res.json(ok({ visited: false }));
      } else {
        await prisma.visitedDestination.create({
          data: { userId: userId(req), destinationId, notes: body.notes },
        });
        track(req, "destination_visited", destinationId);
        res.json(ok({ visited: true }));
      }
    }),
  );

  // ---- Journey -----------------------------------------------------------

  router.get(
    "/journey",
    asyncHandler(async (req, res) => {
      const uid = userId(req);
      const [wishlist, visited, itineraries] = await Promise.all([
        prisma.wishlist.findMany({ where: { userId: uid }, select: { destination: { select: destBrief } } }),
        prisma.visitedDestination.findMany({
          where: { userId: uid },
          select: { destination: { select: destBrief } },
        }),
        prisma.itinerary.count({ where: { userId: uid } }),
      ]);

      // State coverage from visited destinations
      const stateSlugs = [...new Set(visited.map((v) => v.destination.state.slug))];
      const totalStates = await prisma.state.count();

      res.json(
        ok({
          visitedCount: visited.length,
          wishlistCount: wishlist.length,
          plannedCount: itineraries,
          totalDestinations: await prisma.destination.count(),
          totalStates,
          stateCoverage: { visited: stateSlugs.length, total: totalStates },
          wishlist: wishlist.map((w) => w.destination),
          visited: visited.map((v) => v.destination),
        }),
      );
    }),
  );

  // ---- Itineraries -------------------------------------------------------

  router.get(
    "/itineraries",
    asyncHandler(async (req, res) => {
      const rows = await prisma.itinerary.findMany({
        where: { userId: userId(req) },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          budget: true,
          travelStyle: true,
          createdAt: true,
          days: {
            select: { id: true, dayNumber: true, title: true, _count: { select: { destinations: true } } },
            orderBy: { dayNumber: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(
        ok(rows.map((it) => ({ ...it, startDate: it.startDate?.toISOString() ?? null, endDate: it.endDate?.toISOString() ?? null }))),
      );
    }),
  );

  router.post(
    "/itineraries",
    validate(itineraryCreateSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as {
        title: string;
        description?: string;
        startDate?: string;
        endDate?: string;
        budget?: number;
        travelStyle?: string;
      };
      const created = await prisma.itinerary.create({
        data: {
          userId: userId(req),
          title: body.title,
          description: body.description,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          budget: body.budget,
          travelStyle: body.travelStyle,
        },
      });
      track(req, "itinerary_created", created.id);
      res.status(201).json(ok(created));
    }),
  );

  router.get(
    "/itineraries/:id",
    asyncHandler(async (req, res) => {
      const it = await prisma.itinerary.findFirst({
        where: { id: req.params.id, userId: userId(req) },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          budget: true,
          travelStyle: true,
          createdAt: true,
          updatedAt: true,
          days: {
            select: {
              id: true,
              dayNumber: true,
              date: true,
              title: true,
              description: true,
              destinations: {
                select: { order: true, note: true, destination: { select: destBrief } },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { dayNumber: "asc" },
          },
        },
      });
      if (!it) throw new AppError(404, "ITINERARY_NOT_FOUND", "Itinerary not found");
      res.json(ok(it));
    }),
  );

  router.patch(
    "/itineraries/:id",
    validate(itineraryUpdateSchema),
    asyncHandler(async (req, res) => {
      const it = await ownedItinerary(req.params.id as string, userId(req));
      const body = req.body as Record<string, unknown>;
      const updated = await prisma.itinerary.update({
        where: { id: it.id },
        data: {
          ...(body.title !== undefined ? { title: body.title as string } : {}),
          ...(body.description !== undefined ? { description: body.description as string } : {}),
          ...(body.startDate !== undefined ? { startDate: new Date(body.startDate as string) } : {}),
          ...(body.endDate !== undefined ? { endDate: new Date(body.endDate as string) } : {}),
          ...(body.budget !== undefined ? { budget: body.budget as number } : {}),
          ...(body.travelStyle !== undefined ? { travelStyle: body.travelStyle as string } : {}),
        },
      });
      res.json(ok(updated));
    }),
  );

  router.delete(
    "/itineraries/:id",
    asyncHandler(async (req, res) => {
      const it = await ownedItinerary(req.params.id as string, userId(req));
      await prisma.itinerary.delete({ where: { id: it.id } });
      res.json(ok({ deleted: true }));
    }),
  );

  // ---- Itinerary days ----------------------------------------------------

  router.post(
    "/itineraries/:id/days",
    validate(itineraryDayCreateSchema),
    asyncHandler(async (req, res) => {
      const it = await ownedItinerary(req.params.id as string, userId(req));
      const body = req.body as {
        dayNumber: number;
        date?: string;
        title?: string;
        description?: string;
        destinationIds?: string[];
      };
      const destinationIds = body.destinationIds?.length
        ? await Promise.all(body.destinationIds.map((ref) => resolveDestinationId(ref)))
        : [];
      const day = await prisma.itineraryDay.create({
        data: {
          itineraryId: it.id,
          dayNumber: body.dayNumber,
          date: body.date ? new Date(body.date) : null,
          title: body.title,
          description: body.description,
          ...(destinationIds.length
            ? {
                destinations: {
                  create: destinationIds.map((destinationId, i) => ({ destinationId, order: i })),
                },
              }
            : {}),
        },
      });
      res.status(201).json(ok(day));
    }),
  );

  router.patch(
    "/itineraries/:id/days/:dayId",
    validate(itineraryDayUpdateSchema),
    asyncHandler(async (req, res) => {
      await ownedItinerary(req.params.id as string, userId(req));
      const day = await prisma.itineraryDay.findFirst({
        where: { id: req.params.dayId, itineraryId: req.params.id },
      });
      if (!day) throw new AppError(404, "DAY_NOT_FOUND", "Itinerary day not found");
      const body = req.body as Record<string, unknown>;
      const updated = await prisma.itineraryDay.update({
        where: { id: day.id },
        data: {
          ...(body.dayNumber !== undefined ? { dayNumber: body.dayNumber as number } : {}),
          ...(body.date !== undefined ? { date: new Date(body.date as string) } : {}),
          ...(body.title !== undefined ? { title: body.title as string } : {}),
          ...(body.description !== undefined ? { description: body.description as string } : {}),
        },
      });
      res.json(ok(updated));
    }),
  );

  router.delete(
    "/itineraries/:id/days/:dayId",
    asyncHandler(async (req, res) => {
      await ownedItinerary(req.params.id as string, userId(req));
      const deleted = await prisma.itineraryDay.deleteMany({
        where: { id: req.params.dayId, itineraryId: req.params.id },
      });
      if (deleted.count === 0) throw new AppError(404, "DAY_NOT_FOUND", "Itinerary day not found");
      res.json(ok({ deleted: true }));
    }),
  );

  return router;
}

async function ownedItinerary(id: string, uid: string) {
  const it = await prisma.itinerary.findFirst({ where: { id, userId: uid }, select: { id: true } });
  if (!it) throw new AppError(404, "ITINERARY_NOT_FOUND", "Itinerary not found");
  return it;
}

function track(req: { auth?: { id: string } }, event: string, entityId: string) {
  prisma.analyticsEvent
    .create({ data: { event, entityId, entityType: "destination" } })
    .catch(() => undefined);
}

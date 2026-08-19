import { Router } from "express";
import { AppError, asyncHandler } from "../lib/errors";
import { prisma } from "./lib/prisma";
import { ok } from "./lib/response";
import { contentCache } from "./lib/cache";
import {
  adminStateSchema,
  adminDestinationSchema,
  adminExperienceSchema,
  adminCitySchema,
  adminAttractionSchema,
  reviewModerationSchema,
} from "./schemas";
import { requireAuth, requireRole, validate } from "./middleware";

/**
 * Admin/editor API — behaves like a lightweight headless CMS.
 * EDITOR: manage tourism content (states, destinations, experiences…).
 * ADMIN: everything + users + review moderation.
 */

function editorRouter(): Router {
  const router = Router();
  router.use(requireRole("EDITOR", "ADMIN"));

  const invalidate = (...keys: string[]) => keys.forEach((k) => contentCache.del(k));
  const invalidateContent = () => invalidate("home", "map:states", "experiences:all", "journeys:all");

  // ---- States ------------------------------------------------------------

  router.get(
    "/states",
    asyncHandler(async (_req, res) => {
      const rows = await prisma.state.findMany({
        include: { region: true, _count: { select: { destinations: true, cities: true } } },
        orderBy: { name: "asc" },
      });
      res.json(ok(rows));
    }),
  );

  router.post(
    "/states",
    validate(adminStateSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as Record<string, unknown>;
      const existing = await prisma.state.findUnique({ where: { slug: body.slug as string } });
      if (existing) throw new AppError(409, "SLUG_TAKEN", "A state with this slug already exists");
      const created = await prisma.state.create({
        data: {
          name: body.name as string,
          slug: body.slug as string,
          type: body.type as "STATE" | "UNION_TERRITORY",
          regionId: body.regionId as number,
          capital: (body.capital as string) ?? null,
          description: body.description as string,
          shortDescription: body.shortDescription as string,
          heroImage: (body.heroImage as string) ?? null,
          latitude: (body.latitude as number) ?? null,
          longitude: (body.longitude as number) ?? null,
          bestTimeToVisit: (body.bestTimeToVisit as string) ?? null,
          featured: (body.featured as boolean) ?? false,
          seoTitle: (body.seoTitle as string) ?? null,
          seoDescription: (body.seoDescription as string) ?? null,
          seoKeywords: (body.seoKeywords as string) ?? null,
        },
      });
      invalidateContent();
      res.status(201).json(ok(created));
    }),
  );

  router.patch(
    "/states/:id",
    validate(adminStateSchema.partial()),
    asyncHandler(async (req, res) => {
      const existing = await prisma.state.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new AppError(404, "STATE_NOT_FOUND", "State not found");
      const body = req.body as Record<string, unknown>;
      const updated = await prisma.state.update({
        where: { id: existing.id },
        data: {
          ...(body.name !== undefined ? { name: body.name as string } : {}),
          ...(body.slug !== undefined ? { slug: body.slug as string } : {}),
          ...(body.type !== undefined ? { type: body.type as "STATE" | "UNION_TERRITORY" } : {}),
          ...(body.regionId !== undefined ? { regionId: body.regionId as number } : {}),
          ...(body.capital !== undefined ? { capital: (body.capital as string) ?? null } : {}),
          ...(body.description !== undefined ? { description: body.description as string } : {}),
          ...(body.shortDescription !== undefined ? { shortDescription: body.shortDescription as string } : {}),
          ...(body.heroImage !== undefined ? { heroImage: (body.heroImage as string) ?? null } : {}),
          ...(body.latitude !== undefined ? { latitude: (body.latitude as number) ?? null } : {}),
          ...(body.longitude !== undefined ? { longitude: (body.longitude as number) ?? null } : {}),
          ...(body.bestTimeToVisit !== undefined ? { bestTimeToVisit: (body.bestTimeToVisit as string) ?? null } : {}),
          ...(body.featured !== undefined ? { featured: body.featured as boolean } : {}),
          ...(body.seoTitle !== undefined ? { seoTitle: (body.seoTitle as string) ?? null } : {}),
          ...(body.seoDescription !== undefined ? { seoDescription: (body.seoDescription as string) ?? null } : {}),
          ...(body.seoKeywords !== undefined ? { seoKeywords: (body.seoKeywords as string) ?? null } : {}),
        },
      });
      invalidateContent();
      res.json(ok(updated));
    }),
  );

  router.delete(
    "/states/:id",
    asyncHandler(async (req, res) => {
      const deleted = await prisma.state.deleteMany({ where: { id: req.params.id } });
      if (deleted.count === 0) throw new AppError(404, "STATE_NOT_FOUND", "State not found");
      invalidateContent();
      res.json(ok({ deleted: true }));
    }),
  );

  // ---- Destinations ------------------------------------------------------

  router.get(
    "/destinations",
    asyncHandler(async (_req, res) => {
      const rows = await prisma.destination.findMany({
        include: {
          state: { select: { name: true, slug: true } },
          city: { select: { name: true, slug: true } },
          _count: { select: { attractions: true, reviews: true } },
        },
        orderBy: { popularityScore: "desc" },
        take: 200,
      });
      res.json(ok(rows));
    }),
  );

  router.post(
    "/destinations",
    validate(adminDestinationSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as Record<string, unknown>;
      const existing = await prisma.destination.findUnique({ where: { slug: body.slug as string } });
      if (existing) throw new AppError(409, "SLUG_TAKEN", "A destination with this slug already exists");
      const created = await prisma.destination.create({
        data: {
          name: body.name as string,
          slug: body.slug as string,
          cityId: (body.cityId as string) ?? null,
          stateId: body.stateId as string,
          category: (body.category as string) ?? "Heritage",
          description: body.description as string,
          shortDescription: body.shortDescription as string,
          heroImage: (body.heroImage as string) ?? null,
          latitude: (body.latitude as number) ?? null,
          longitude: (body.longitude as number) ?? null,
          bestTimeToVisit: (body.bestTimeToVisit as string) ?? null,
          popularityScore: (body.popularityScore as number) ?? 50,
          featured: (body.featured as boolean) ?? false,
          ...(Array.isArray(body.experienceSlugs) && (body.experienceSlugs as string[]).length
            ? {
                experiences: {
                  create: (body.experienceSlugs as string[]).map((slug) => ({ experienceId: slug })),
                },
              }
            : {}),
        },
      });
      invalidateContent();
      res.status(201).json(ok(created));
    }),
  );

  router.patch(
    "/destinations/:id",
    validate(adminDestinationSchema.partial()),
    asyncHandler(async (req, res) => {
      const existing = await prisma.destination.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new AppError(404, "DESTINATION_NOT_FOUND", "Destination not found");
      const body = req.body as Record<string, unknown>;
      const updated = await prisma.destination.update({
        where: { id: existing.id },
        data: {
          ...(body.name !== undefined ? { name: body.name as string } : {}),
          ...(body.slug !== undefined ? { slug: body.slug as string } : {}),
          ...(body.cityId !== undefined ? { cityId: (body.cityId as string) ?? null } : {}),
          ...(body.stateId !== undefined ? { stateId: body.stateId as string } : {}),
          ...(body.category !== undefined ? { category: body.category as string } : {}),
          ...(body.description !== undefined ? { description: body.description as string } : {}),
          ...(body.shortDescription !== undefined ? { shortDescription: body.shortDescription as string } : {}),
          ...(body.heroImage !== undefined ? { heroImage: (body.heroImage as string) ?? null } : {}),
          ...(body.latitude !== undefined ? { latitude: (body.latitude as number) ?? null } : {}),
          ...(body.longitude !== undefined ? { longitude: (body.longitude as number) ?? null } : {}),
          ...(body.bestTimeToVisit !== undefined ? { bestTimeToVisit: (body.bestTimeToVisit as string) ?? null } : {}),
          ...(body.popularityScore !== undefined ? { popularityScore: body.popularityScore as number } : {}),
          ...(body.featured !== undefined ? { featured: body.featured as boolean } : {}),
        },
      });
      invalidateContent();
      res.json(ok(updated));
    }),
  );

  router.delete(
    "/destinations/:id",
    asyncHandler(async (req, res) => {
      const deleted = await prisma.destination.deleteMany({ where: { id: req.params.id } });
      if (deleted.count === 0) throw new AppError(404, "DESTINATION_NOT_FOUND", "Destination not found");
      invalidateContent();
      res.json(ok({ deleted: true }));
    }),
  );

  // ---- Cities / Experiences / Attractions --------------------------------

  router.post(
    "/cities",
    validate(adminCitySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as Record<string, unknown>;
      const created = await prisma.city.create({
        data: {
          name: body.name as string,
          slug: body.slug as string,
          stateId: body.stateId as string,
          description: (body.description as string) ?? "",
          shortDescription: (body.shortDescription as string) ?? "",
          latitude: (body.latitude as number) ?? null,
          longitude: (body.longitude as number) ?? null,
          heroImage: (body.heroImage as string) ?? null,
        },
      });
      invalidateContent();
      res.status(201).json(ok(created));
    }),
  );

  router.patch(
    "/cities/:id",
    validate(adminCitySchema.partial()),
    asyncHandler(async (req, res) => {
      const existing = await prisma.city.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new AppError(404, "CITY_NOT_FOUND", "City not found");
      const body = req.body as Record<string, unknown>;
      const updated = await prisma.city.update({
        where: { id: existing.id },
        data: {
          ...(body.name !== undefined ? { name: body.name as string } : {}),
          ...(body.slug !== undefined ? { slug: body.slug as string } : {}),
          ...(body.stateId !== undefined ? { stateId: body.stateId as string } : {}),
          ...(body.description !== undefined ? { description: body.description as string } : {}),
          ...(body.shortDescription !== undefined ? { shortDescription: body.shortDescription as string } : {}),
          ...(body.latitude !== undefined ? { latitude: (body.latitude as number) ?? null } : {}),
          ...(body.longitude !== undefined ? { longitude: (body.longitude as number) ?? null } : {}),
          ...(body.heroImage !== undefined ? { heroImage: (body.heroImage as string) ?? null } : {}),
        },
      });
      invalidateContent();
      res.json(ok(updated));
    }),
  );

  router.delete(
    "/cities/:id",
    asyncHandler(async (req, res) => {
      const deleted = await prisma.city.deleteMany({ where: { id: req.params.id } });
      if (deleted.count === 0) throw new AppError(404, "CITY_NOT_FOUND", "City not found");
      invalidateContent();
      res.json(ok({ deleted: true }));
    }),
  );

  router.post(
    "/experiences",
    validate(adminExperienceSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as Record<string, unknown>;
      const created = await prisma.experience.create({
        data: {
          name: body.name as string,
          slug: body.slug as string,
          description: body.description as string,
          icon: (body.icon as string) ?? null,
          image: (body.image as string) ?? null,
        },
      });
      invalidateContent();
      res.status(201).json(ok(created));
    }),
  );

  router.patch(
    "/experiences/:id",
    validate(adminExperienceSchema.partial()),
    asyncHandler(async (req, res) => {
      const existing = await prisma.experience.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new AppError(404, "EXPERIENCE_NOT_FOUND", "Experience not found");
      const body = req.body as Record<string, unknown>;
      const updated = await prisma.experience.update({
        where: { id: existing.id },
        data: {
          ...(body.name !== undefined ? { name: body.name as string } : {}),
          ...(body.slug !== undefined ? { slug: body.slug as string } : {}),
          ...(body.description !== undefined ? { description: body.description as string } : {}),
          ...(body.icon !== undefined ? { icon: (body.icon as string) ?? null } : {}),
          ...(body.image !== undefined ? { image: (body.image as string) ?? null } : {}),
        },
      });
      invalidateContent();
      res.json(ok(updated));
    }),
  );

  router.delete(
    "/experiences/:id",
    asyncHandler(async (req, res) => {
      const deleted = await prisma.experience.deleteMany({ where: { id: req.params.id } });
      if (deleted.count === 0) throw new AppError(404, "EXPERIENCE_NOT_FOUND", "Experience not found");
      invalidateContent();
      res.json(ok({ deleted: true }));
    }),
  );

  router.post(
    "/attractions",
    validate(adminAttractionSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as Record<string, unknown>;
      const created = await prisma.attraction.create({
        data: {
          destinationId: body.destinationId as string,
          name: body.name as string,
          description: (body.description as string) ?? "",
          image: (body.image as string) ?? null,
          estimatedDuration: (body.estimatedDuration as string) ?? null,
          ticketRequired: (body.ticketRequired as boolean) ?? false,
        },
      });
      res.status(201).json(ok(created));
    }),
  );

  router.delete(
    "/attractions/:id",
    asyncHandler(async (req, res) => {
      const deleted = await prisma.attraction.deleteMany({ where: { id: req.params.id } });
      if (deleted.count === 0) throw new AppError(404, "ATTRACTION_NOT_FOUND", "Attraction not found");
      res.json(ok({ deleted: true }));
    }),
  );

  // ---- Review moderation (EDITOR can approve/reject) ---------------------

  router.get(
    "/reviews",
    asyncHandler(async (req, res) => {
      const status = (req.query.status as string | undefined)?.toUpperCase();
      const rows = await prisma.review.findMany({
        where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {},
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          destination: { select: { slug: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      res.json(ok(rows));
    }),
  );

  router.patch(
    "/reviews/:id/status",
    validate(reviewModerationSchema),
    asyncHandler(async (req, res) => {
      const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new AppError(404, "REVIEW_NOT_FOUND", "Review not found");
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { status: (req.body as { status: "APPROVED" | "REJECTED" }).status },
      });
      invalidateContent();
      res.json(ok({ id: updated.id, status: updated.status }));
    }),
  );

  return router;
}

/** Admin-only: users + system. */
function adminOnlyRouter(): Router {
  const router = Router();
  router.use(requireRole("ADMIN"));

  router.get(
    "/users",
    asyncHandler(async (req, res) => {
      const page = Math.max(1, Number(req.query.page ?? 1));
      const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
      const [total, rows] = await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            createdAt: true,
            _count: { select: { wishlist: true, visited: true, itineraries: true, reviews: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);
      res.json(ok(rows, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }),
  );

  router.patch(
    "/users/:id",
    asyncHandler(async (req, res) => {
      const role = (req.body as { role?: string }).role;
      if (!role || !["USER", "EDITOR", "ADMIN"].includes(role)) {
        throw new AppError(422, "VALIDATION_ERROR", "role must be USER, EDITOR or ADMIN");
      }
      const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new AppError(404, "USER_NOT_FOUND", "User not found");
      if (req.params.id === req.auth!.id && role !== "ADMIN") {
        throw new AppError(422, "INVALID_ROLE_CHANGE", "Admins cannot demote themselves");
      }
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: { role: role as "USER" | "EDITOR" | "ADMIN" },
        select: { id: true, name: true, email: true, role: true },
      });
      res.json(ok(updated));
    }),
  );

  router.get(
    "/stats",
    asyncHandler(async (_req, res) => {
      const [states, cities, destinations, experiences, attractions, users, reviews, events] =
        await Promise.all([
          prisma.state.count(),
          prisma.city.count(),
          prisma.destination.count(),
          prisma.experience.count(),
          prisma.attraction.count(),
          prisma.user.count(),
          prisma.review.count(),
          prisma.analyticsEvent.count(),
        ]);
      res.json(ok({ states, cities, destinations, experiences, attractions, users, reviews, events }));
    }),
  );

  return router;
}

export function adminRouter(): Router {
  const router = Router();
  // Mounted under /admin in the parent — this guard only sees /admin/* paths.
  router.use(requireAuth());
  router.use(editorRouter());
  router.use(adminOnlyRouter());
  return router;
}

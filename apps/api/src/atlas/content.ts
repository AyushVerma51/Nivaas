import { Router } from "express";
import { AppError, asyncHandler } from "../lib/errors";
import { prisma } from "./lib/prisma";
import { ok, pagination } from "./lib/response";
import { contentCache } from "./lib/cache";
import { haversineKm } from "./lib/geo";
import { resolveDestinationId } from "./lib/resolve";
import {
  statesQuerySchema,
  destinationsQuerySchema,
  nearbyQuerySchema,
  searchQuerySchema,
  reviewCreateSchema,
  analyticsEventSchema,
} from "./schemas";
import { validate, optionalAuth, requireAuth } from "./middleware";
import type {
  StateListDTO,
  StateDetailDTO,
  CityDTO,
  DestinationListDTO,
  DestinationDetailDTO,
  ExperienceDTO,
  JourneyDTO,
  MapStateDTO,
  ReviewDTO,
} from "./dto";

const CACHE_SKIP = process.env.NODE_ENV === "test";

const REGION_NAMES = [
  "NORTH",
  "SOUTH",
  "EAST",
  "WEST",
  "CENTRAL",
  "NORTHEAST",
  "HIMALAYAN",
  "ISLANDS",
] as const;

// ---------------------------------------------------------------------------
// DTO builders
// ---------------------------------------------------------------------------

type StateRow = {
  id: string;
  name: string;
  slug: string;
  type: "STATE" | "UNION_TERRITORY";
  region: { name: string };
  shortDescription: string;
  heroImage: string | null;
  _count?: { destinations: number; cities?: number; reviews?: number };
  capital?: string | null;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
  bestTimeToVisit?: string | null;
  featured?: boolean;
};

function toStateList(s: StateRow): StateListDTO {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    type: s.type,
    region: s.region.name,
    shortDescription: s.shortDescription,
    heroImage: s.heroImage,
    destinationCount: s._count?.destinations ?? 0,
  };
}

function toStateDetail(s: StateRow, experienceCount: number): StateDetailDTO {
  return {
    ...toStateList(s),
    capital: s.capital ?? null,
    description: s.description ?? "",
    latitude: s.latitude ?? null,
    longitude: s.longitude ?? null,
    bestTimeToVisit: s.bestTimeToVisit ?? null,
    featured: s.featured ?? false,
    cityCount: s._count?.cities ?? 0,
    destinationCount: s._count?.destinations ?? 0,
    experienceCount,
  };
}

type CityRow = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  latitude: number | null;
  longitude: number | null;
  state: { slug: string; name: string };
  _count?: { destinations: number };
};

function toCity(c: CityRow): CityDTO {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    stateSlug: c.state.slug,
    stateName: c.state.name,
    shortDescription: c.shortDescription,
    latitude: c.latitude,
    longitude: c.longitude,
    destinationCount: c._count?.destinations ?? 0,
  };
}

type DestRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  heroImage: string | null;
  latitude: number | null;
  longitude: number | null;
  popularityScore: number;
  featured: boolean;
  bestTimeToVisit: string | null;
  city: { name: string; slug: string } | null;
  state: { slug: string; name: string };
  experiences: { experience: { slug: string; name: string } }[];
  attractions: { id: string; name: string; description: string; image: string | null }[];
  reviews: { rating: number; status: string }[];
};

function toDestList(d: DestRow): DestinationListDTO {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    category: d.category,
    stateSlug: d.state.slug,
    stateName: d.state.name,
    shortDescription: d.shortDescription,
    heroImage: d.heroImage,
    latitude: d.latitude,
    longitude: d.longitude,
    popularityScore: d.popularityScore,
    featured: d.featured,
    experienceSlugs: d.experiences.map((e) => e.experience.slug),
  };
}

function toDestDetail(d: DestRow, nearby: DestinationDetailDTO["nearby"]): DestinationDetailDTO {
  const approved = d.reviews.filter((r) => r.status === "APPROVED");
  const average = approved.length
    ? Math.round((approved.reduce((a, r) => a + r.rating, 0) / approved.length) * 10) / 10
    : 0;
  return {
    ...toDestList(d),
    description: d.description,
    city: d.city,
    bestTimeToVisit: d.bestTimeToVisit,
    attractions: d.attractions,
    experiences: d.experiences.map((e) => e.experience),
    nearby,
    reviewStats: { count: approved.length, average },
  };
}

type ExpRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  image: string | null;
  destinations: { destinationId: string }[];
};

function toExperience(e: ExpRow): ExperienceDTO {
  return {
    id: e.id,
    name: e.name,
    slug: e.slug,
    description: e.description,
    icon: e.icon,
    image: e.image,
    destinationCount: e.destinations.length,
  };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export function contentRouter(): Router {
  const router = Router();

  // ---- States ------------------------------------------------------------

  router.get(
    "/states",
    validate(statesQuerySchema, "query"),
    asyncHandler(async (req, res) => {
      const q = req.query as {
        region?: string;
        type?: string;
        featured?: boolean;
        page?: number;
        limit?: number;
      };
      const { page, limit } = pagination({ page: String(q.page ?? 1), limit: String(q.limit ?? 24) });
      const where = {
        ...(q.region ? { region: { name: q.region.toUpperCase() as never } } : {}),
        ...(q.type
          ? { type: (q.type.toUpperCase() === "UNION_TERRITORY" ? "UNION_TERRITORY" : "STATE") as never }
          : {}),
        ...(q.featured !== undefined ? { featured: q.featured } : {}),
      };
      const cacheKey = `states:${JSON.stringify(where)}:${page}:${limit}`;
      const load = async () => {
        const [total, rows] = await Promise.all([
          prisma.state.count({ where }),
          prisma.state.findMany({
            where,
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              shortDescription: true,
              heroImage: true,
              capital: true,
              description: true,
              latitude: true,
              longitude: true,
              bestTimeToVisit: true,
              featured: true,
              region: { select: { name: true } },
              _count: { select: { destinations: true, cities: true } },
            },
            orderBy: { name: "asc" },
            skip: (page - 1) * limit,
            take: limit,
          }),
        ]);
        return { total, rows };
      };
      const { total, rows } = CACHE_SKIP ? await load() : await contentCache.memo(cacheKey, load);
      res.json(
        ok(rows.map(toStateList), { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }),
      );
    }),
  );

  router.get(
    "/states/:slug",
    asyncHandler(async (req, res) => {
      const state = await prisma.state.findUnique({
        where: { slug: req.params.slug },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          shortDescription: true,
          heroImage: true,
          capital: true,
          description: true,
          latitude: true,
          longitude: true,
          bestTimeToVisit: true,
          featured: true,
          region: { select: { name: true } },
          _count: { select: { destinations: true, cities: true } },
        },
      });
      if (!state) throw new AppError(404, "STATE_NOT_FOUND", "The requested state could not be found");
      const experienceCount = await prisma.destinationExperience.count({
        where: { destination: { stateId: state.id } },
      });
      res.json(ok(toStateDetail(state, experienceCount)));
    }),
  );

  router.get(
    "/states/:slug/cities",
    asyncHandler(async (req, res) => {
      const state = await prisma.state.findUnique({
        where: { slug: req.params.slug },
        select: { id: true },
      });
      if (!state) throw new AppError(404, "STATE_NOT_FOUND", "The requested state could not be found");
      const cities = await prisma.city.findMany({
        where: { stateId: state.id },
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          latitude: true,
          longitude: true,
          state: { select: { slug: true, name: true } },
          _count: { select: { destinations: true } },
        },
        orderBy: { name: "asc" },
      });
      res.json(ok(cities.map(toCity)));
    }),
  );

  router.get(
    "/states/:slug/destinations",
    asyncHandler(async (req, res) => {
      const state = await prisma.state.findUnique({
        where: { slug: req.params.slug },
        select: { id: true },
      });
      if (!state) throw new AppError(404, "STATE_NOT_FOUND", "The requested state could not be found");
      const dests = await prisma.destination.findMany({
        where: { stateId: state.id },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          shortDescription: true,
          heroImage: true,
          latitude: true,
          longitude: true,
          popularityScore: true,
          featured: true,
          description: true,
          bestTimeToVisit: true,
          city: { select: { name: true, slug: true } },
          state: { select: { slug: true, name: true } },
          experiences: { select: { experience: { select: { slug: true, name: true } } } },
          attractions: { select: { id: true, name: true, description: true, image: true } },
          reviews: { select: { rating: true, status: true } },
        },
        orderBy: { popularityScore: "desc" },
      });
      res.json(ok(dests.map((d) => toDestDetail(d, []))));
    }),
  );

  router.get(
    "/states/:slug/experiences",
    asyncHandler(async (req, res) => {
      const state = await prisma.state.findUnique({
        where: { slug: req.params.slug },
        select: { id: true },
      });
      if (!state) throw new AppError(404, "STATE_NOT_FOUND", "The requested state could not be found");
      const dests = await prisma.destination.findMany({
        where: { stateId: state.id },
        select: { experiences: { select: { experienceId: true } } },
      });
      const expIds = [...new Set(dests.flatMap((d) => d.experiences.map((e) => e.experienceId)))];
      const exps = await prisma.experience.findMany({
        where: { id: { in: expIds } },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          icon: true,
          image: true,
          destinations: { select: { destinationId: true } },
        },
        orderBy: { name: "asc" },
      });
      res.json(ok(exps.map(toExperience)));
    }),
  );

  // ---- Cities ------------------------------------------------------------

  router.get(
    "/cities",
    asyncHandler(async (req, res) => {
      const { page, limit } = pagination({ page: req.query.page as string, limit: req.query.limit as string });
      const cacheKey = `cities:${page}:${limit}`;
      const load = async () => {
        const [total, rows] = await Promise.all([
          prisma.city.count(),
          prisma.city.findMany({
            select: {
              id: true,
              name: true,
              slug: true,
              shortDescription: true,
              latitude: true,
              longitude: true,
              state: { select: { slug: true, name: true } },
              _count: { select: { destinations: true } },
            },
            orderBy: { name: "asc" },
            skip: (page - 1) * limit,
            take: limit,
          }),
        ]);
        return { total, rows };
      };
      const { total, rows } = CACHE_SKIP ? await load() : await contentCache.memo(cacheKey, load);
      res.json(ok(rows.map(toCity), { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }));
    }),
  );

  router.get(
    "/cities/:slug",
    asyncHandler(async (req, res) => {
      const city = await prisma.city.findUnique({
        where: { slug: req.params.slug },
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          description: true,
          latitude: true,
          longitude: true,
          state: { select: { slug: true, name: true } },
          _count: { select: { destinations: true } },
        },
      });
      if (!city) throw new AppError(404, "CITY_NOT_FOUND", "The requested city could not be found");
      res.json(ok(city));
    }),
  );

  router.get(
    "/cities/:slug/destinations",
    asyncHandler(async (req, res) => {
      const city = await prisma.city.findUnique({
        where: { slug: req.params.slug },
        select: { id: true },
      });
      if (!city) throw new AppError(404, "CITY_NOT_FOUND", "The requested city could not be found");
      const dests = await prisma.destination.findMany({
        where: { cityId: city.id },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          shortDescription: true,
          heroImage: true,
          latitude: true,
          longitude: true,
          popularityScore: true,
          featured: true,
          description: true,
          bestTimeToVisit: true,
          city: { select: { name: true, slug: true } },
          state: { select: { slug: true, name: true } },
          experiences: { select: { experience: { select: { slug: true, name: true } } } },
          attractions: { select: { id: true, name: true, description: true, image: true } },
          reviews: { select: { rating: true, status: true } },
        },
        orderBy: { popularityScore: "desc" },
      });
      res.json(ok(dests.map((d) => toDestDetail(d, []))));
    }),
  );

  // ---- Destinations ------------------------------------------------------

  router.get(
    "/destinations/featured",
    asyncHandler(async (_req, res) => {
      const cacheKey = "destinations:featured";
      const load = async () =>
        prisma.destination.findMany({
          where: { featured: true },
          select: destSelect,
          orderBy: { popularityScore: "desc" },
          take: 12,
        });
      const rows = CACHE_SKIP ? await load() : await contentCache.memo(cacheKey, load);
      res.json(ok(rows.map(toDestList)));
    }),
  );

  router.get(
    "/destinations/popular",
    asyncHandler(async (_req, res) => {
      const cacheKey = "destinations:popular";
      const load = async () =>
        prisma.destination.findMany({
          select: destSelect,
          orderBy: { popularityScore: "desc" },
          take: 20,
        });
      const rows = CACHE_SKIP ? await load() : await contentCache.memo(cacheKey, load);
      res.json(ok(rows.map(toDestList)));
    }),
  );

  router.get(
    "/destinations",
    validate(destinationsQuerySchema, "query"),
    asyncHandler(async (req, res) => {
      const q = req.query as {
        state?: string;
        city?: string;
        experience?: string;
        category?: string;
        featured?: boolean;
        sort?: string;
        page?: number;
        limit?: number;
      };
      const { page, limit } = pagination({ page: String(q.page ?? 1), limit: String(q.limit ?? 24) });
      const where: Record<string, unknown> = {
        ...(q.state ? { state: { slug: q.state } } : {}),
        ...(q.city ? { city: { slug: q.city } } : {}),
        ...(q.category ? { category: q.category } : {}),
        ...(q.featured !== undefined ? { featured: q.featured } : {}),
        ...(q.experience
          ? { experiences: { some: { experience: { slug: q.experience } } } }
          : {}),
      };
      const orderBy =
        q.sort === "name"
          ? { name: "asc" as const }
          : q.sort === "newest"
            ? { createdAt: "desc" as const }
            : { popularityScore: "desc" as const };
      const cacheKey = `destinations:${JSON.stringify(where)}:${JSON.stringify(orderBy)}:${page}:${limit}`;
      const load = async () => {
        const [total, rows] = await Promise.all([
          prisma.destination.count({ where }),
          prisma.destination.findMany({
            where,
            select: destSelect,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
          }),
        ]);
        return { total, rows };
      };
      const { total, rows } = CACHE_SKIP ? await load() : await contentCache.memo(cacheKey, load);
      res.json(ok(rows.map(toDestList), { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }));
    }),
  );

  router.get(
    "/destinations/:slug",
    optionalAuth(),
    asyncHandler(async (req, res) => {
      const dest = await prisma.destination.findUnique({
        where: { slug: req.params.slug },
        select: destSelect,
      });
      if (!dest) throw new AppError(404, "DESTINATION_NOT_FOUND", "The requested destination could not be found");

      // Nearby (haversine over destinations with coordinates)
      let nearby: DestinationDetailDTO["nearby"] = [];
      if (dest.latitude && dest.longitude) {
        const all = await prisma.destination.findMany({
          where: { NOT: { id: dest.id }, latitude: { not: null } },
          select: { id: true, slug: true, name: true, latitude: true, longitude: true, stateId: true },
        });
        nearby = all
          .map((d) => ({
            slug: d.slug,
            name: d.name,
            distanceKm: haversineKm(dest.latitude!, dest.longitude!, d.latitude!, d.longitude!),
          }))
          .filter((d) => d.distanceKm <= 150)
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 8);
      }

      // Log an analytics view (best-effort, never blocks the response)
      if (req.auth) {
        prisma.analyticsEvent
          .create({ data: { event: "destination_viewed", entityId: dest.slug, entityType: "destination" } })
          .catch(() => undefined);
      }
      res.json(ok(toDestDetail(dest, nearby)));
    }),
  );

  router.get(
    "/destinations/:slug/attractions",
    asyncHandler(async (req, res) => {
      const dest = await prisma.destination.findUnique({
        where: { slug: req.params.slug },
        select: { id: true },
      });
      if (!dest) throw new AppError(404, "DESTINATION_NOT_FOUND", "The requested destination could not be found");
      const attractions = await prisma.attraction.findMany({
        where: { destinationId: dest.id },
        orderBy: { createdAt: "asc" },
      });
      res.json(ok(attractions));
    }),
  );

  router.get(
    "/destinations/:slug/experiences",
    asyncHandler(async (req, res) => {
      const dest = await prisma.destination.findUnique({
        where: { slug: req.params.slug },
        select: { experiences: { select: { experience: true } } },
      });
      if (!dest) throw new AppError(404, "DESTINATION_NOT_FOUND", "The requested destination could not be found");
      res.json(ok(dest.experiences.map((e) => e.experience)));
    }),
  );

  router.get(
    "/destinations/:slug/nearby",
    validate(nearbyQuerySchema, "query"),
    asyncHandler(async (req, res) => {
      const dest = await prisma.destination.findUnique({
        where: { slug: req.params.slug },
        select: { id: true, latitude: true, longitude: true },
      });
      if (!dest) throw new AppError(404, "DESTINATION_NOT_FOUND", "The requested destination could not be found");
      if (!dest.latitude || !dest.longitude) {
        res.json(ok([]));
        return;
      }
      const radius = (req.query.radius as unknown as number) ?? 50;
      const all = await prisma.destination.findMany({
        where: { NOT: { id: dest.id }, latitude: { not: null } },
        select: { id: true, slug: true, name: true, latitude: true, longitude: true, heroImage: true, shortDescription: true },
      });
      const nearby = all
        .map((d) => ({
          ...d,
          distanceKm: haversineKm(dest.latitude!, dest.longitude!, d.latitude!, d.longitude!),
        }))
        .filter((d) => d.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 12);
      res.json(ok(nearby));
    }),
  );

  router.get(
    "/destinations/:slug/reviews",
    asyncHandler(async (req, res) => {
      const dest = await prisma.destination.findUnique({
        where: { slug: req.params.slug },
        select: { id: true },
      });
      if (!dest) throw new AppError(404, "DESTINATION_NOT_FOUND", "The requested destination could not be found");
      const reviews = await prisma.review.findMany({
        where: { destinationId: dest.id, status: "APPROVED" },
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          createdAt: true,
          user: { select: { name: true } },
          destination: { select: { slug: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      const dto: ReviewDTO[] = reviews.map((r) => ({
        id: r.id,
        destinationSlug: r.destination.slug,
        destinationName: r.destination.name,
        authorName: r.user.name,
        rating: r.rating,
        title: r.title,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
      }));
      res.json(ok(dto));
    }),
  );

  // ---- Experiences -------------------------------------------------------

  router.get(
    "/experiences",
    asyncHandler(async (_req, res) => {
      const cacheKey = "experiences:all";
      const load = async () =>
        prisma.experience.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            icon: true,
            image: true,
            destinations: { select: { destinationId: true } },
          },
          orderBy: { name: "asc" },
        });
      const rows = CACHE_SKIP ? await load() : await contentCache.memo(cacheKey, load);
      res.json(ok(rows.map(toExperience)));
    }),
  );

  router.get(
    "/experiences/:slug",
    asyncHandler(async (req, res) => {
      const exp = await prisma.experience.findUnique({
        where: { slug: req.params.slug },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          icon: true,
          image: true,
          destinations: { select: { destinationId: true } },
        },
      });
      if (!exp) throw new AppError(404, "EXPERIENCE_NOT_FOUND", "The requested experience could not be found");
      res.json(ok(toExperience(exp)));
    }),
  );

  router.get(
    "/experiences/:slug/destinations",
    asyncHandler(async (req, res) => {
      const exp = await prisma.experience.findUnique({
        where: { slug: req.params.slug },
        select: { id: true },
      });
      if (!exp) throw new AppError(404, "EXPERIENCE_NOT_FOUND", "The requested experience could not be found");
      const dests = await prisma.destination.findMany({
        where: { experiences: { some: { experienceId: exp.id } } },
        select: destSelect,
        orderBy: { popularityScore: "desc" },
      });
      res.json(ok(dests.map(toDestList)));
    }),
  );

  // ---- Journeys ----------------------------------------------------------

  router.get(
    "/journeys",
    asyncHandler(async (_req, res) => {
      const cacheKey = "journeys:all";
      const load = async () =>
        prisma.featuredJourney.findMany({
          orderBy: { createdAt: "asc" },
        });
      const rows = CACHE_SKIP ? await load() : await contentCache.memo(cacheKey, load);
      const dto: JourneyDTO[] = rows.map((j) => ({
        id: j.id,
        slug: j.slug,
        title: j.title,
        days: j.days,
        theme: j.theme,
        tagline: j.tagline,
        description: j.description,
        heroImage: j.heroImage,
        stops: j.stops,
      }));
      res.json(ok(dto));
    }),
  );

  // ---- Map ---------------------------------------------------------------

  router.get(
    "/map/states",
    asyncHandler(async (_req, res) => {
      const cacheKey = "map:states";
      const load = async () =>
        prisma.state.findMany({
          select: {
            slug: true,
            name: true,
            latitude: true,
            longitude: true,
            heroImage: true,
            region: { select: { name: true } },
            _count: { select: { destinations: true } },
          },
          orderBy: { name: "asc" },
        });
      const rows = CACHE_SKIP ? await load() : await contentCache.memo(cacheKey, load);
      const dto: MapStateDTO[] = rows.map((s) => ({
        slug: s.slug,
        name: s.name,
        region: s.region.name,
        latitude: s.latitude,
        longitude: s.longitude,
        destinationCount: s._count.destinations,
        heroImage: s.heroImage,
      }));
      res.json(ok(dto));
    }),
  );

  // ---- Search ------------------------------------------------------------

  router.get(
    "/search",
    validate(searchQuerySchema, "query"),
    asyncHandler(async (req, res) => {
      const q = req.query.q as string;
      const limit = Math.min(Number(req.query.limit ?? 8), 50);
      const like = { contains: q, mode: "insensitive" as const };
      // region.name is a Postgres enum — match it by comparing against the known values.
      const regionMatch = REGION_NAMES.filter((r) => r.toLowerCase().includes(q.toLowerCase()));

      const [states, cities, dests, exps] = await Promise.all([
        prisma.state.findMany({
          where: {
            OR: [
              { name: like },
              { slug: like },
              ...(regionMatch.length ? [{ region: { name: { in: regionMatch } } }] : []),
            ],
          },
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            shortDescription: true,
            heroImage: true,
            region: { select: { name: true } },
            _count: { select: { destinations: true } },
          },
          take: limit,
        }),
        prisma.city.findMany({
          where: { OR: [{ name: like }, { slug: like }, { state: { name: like } }] },
          select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            latitude: true,
            longitude: true,
            state: { select: { slug: true, name: true } },
            _count: { select: { destinations: true } },
          },
          take: limit,
        }),
        prisma.destination.findMany({
          where: {
            OR: [
              { name: like },
              { slug: like },
              { category: like },
              { shortDescription: like },
              { state: { name: like } },
            ],
          },
          select: destSelect,
          orderBy: { popularityScore: "desc" },
          take: limit,
        }),
        prisma.experience.findMany({
          where: { OR: [{ name: like }, { slug: like }, { description: like }] },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            icon: true,
            image: true,
            destinations: { select: { destinationId: true } },
          },
          take: limit,
        }),
      ]);

      // Simple relevance ranking: exact slug → starts-with → contains.
      const rank = (slug: string, name: string) =>
        slug === q.toLowerCase() ? 0 : name.toLowerCase().startsWith(q.toLowerCase()) ? 1 : 2;
      const sortFn = <T extends { slug: string; name: string }>(arr: T[]) =>
        [...arr].sort((a, b) => rank(a.slug, a.name) - rank(b.slug, b.name));

      prisma.analyticsEvent
        .create({ data: { event: "search_performed", meta: { query: q } } })
        .catch(() => undefined);

      res.json(
        ok({
          states: sortFn(states).map(toStateList),
          cities: sortFn(cities).map(toCity),
          destinations: sortFn(dests).map(toDestList),
          experiences: sortFn(exps).map(toExperience),
          query: q,
        }),
      );
    }),
  );

  // ---- Home --------------------------------------------------------------

  router.get(
    "/home",
    asyncHandler(async (_req, res) => {
      const cacheKey = "home";
      const load = async () => {
        const [featuredDestinations, experiences, featuredStates, journeys, mapStats] =
          await Promise.all([
            prisma.destination.findMany({
              where: { featured: true },
              select: destSelect,
              orderBy: { popularityScore: "desc" },
              take: 8,
            }),
            prisma.experience.findMany({
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                icon: true,
                image: true,
                destinations: { select: { destinationId: true } },
              },
              orderBy: { name: "asc" },
            }),
            prisma.state.findMany({
              where: { featured: true },
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                shortDescription: true,
                heroImage: true,
                region: { select: { name: true } },
                _count: { select: { destinations: true } },
              },
              orderBy: { name: "asc" },
            }),
            prisma.featuredJourney.findMany({ orderBy: { createdAt: "asc" } }),
            Promise.all([
              prisma.state.count(),
              prisma.destination.count(),
              prisma.city.count(),
              prisma.experience.count(),
            ]),
          ]);
        return {
          hero: {
            title: "Explore India, one journey at a time.",
            subtitle:
              "28 states, 8 union territories, a thousand landscapes — an atlas of India's mountains, coasts, temples and trails.",
            image: featuredDestinations[0]?.heroImage ?? null,
          },
          featuredDestinations: featuredDestinations.map(toDestList),
          experiences: experiences.map(toExperience),
          featuredStates: featuredStates.map(toStateList),
          popularJourneys: journeys.map((j) => ({
            id: j.id,
            slug: j.slug,
            title: j.title,
            days: j.days,
            theme: j.theme,
            tagline: j.tagline,
            description: j.description,
            heroImage: j.heroImage,
            stops: j.stops,
          })),
          mapStats: {
            states: mapStats[0],
            destinations: mapStats[1],
            cities: mapStats[2],
            experiences: mapStats[3],
          },
        };
      };
      const data = CACHE_SKIP ? await load() : await contentCache.memo(cacheKey, load);
      res.json(ok(data));
    }),
  );

  // ---- Reviews (public write) --------------------------------------------

  router.post(
    "/destinations/:slug/reviews",
    requireAuth(),
    validate(reviewCreateSchema),
    asyncHandler(async (req, res) => {
      const dest = await prisma.destination.findUnique({
        where: { slug: req.params.slug },
        select: { id: true },
      });
      if (!dest) throw new AppError(404, "DESTINATION_NOT_FOUND", "The requested destination could not be found");
      const body = req.body as { destinationId?: string; rating: number; title?: string; content: string };
      if (body.destinationId) {
        const resolved = await resolveDestinationId(body.destinationId);
        if (resolved !== dest.id) {
          throw new AppError(422, "VALIDATION_ERROR", "destinationId does not match the URL");
        }
      }
      const review = await prisma.review.create({
        data: {
          userId: req.auth!.id,
          destinationId: dest.id,
          rating: body.rating,
          title: body.title,
          content: body.content,
          status: "PENDING",
        },
        select: { id: true, rating: true, title: true, content: true, status: true, createdAt: true },
      });
      res.status(201).json(ok({ ...review, pendingModeration: true }));
    }),
  );

  // ---- Analytics ---------------------------------------------------------

  router.post(
    "/analytics/events",
    validate(analyticsEventSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as { event: string; entityId?: string; entityType?: string; meta?: Record<string, unknown> };
      await prisma.analyticsEvent.create({
        data: { event: body.event, entityId: body.entityId, entityType: body.entityType, meta: body.meta as never },
      });
      res.status(201).json(ok({ received: true }));
    }),
  );

  return router;
}

const destSelect = {
  id: true,
  name: true,
  slug: true,
  category: true,
  shortDescription: true,
  description: true,
  heroImage: true,
  latitude: true,
  longitude: true,
  popularityScore: true,
  featured: true,
  bestTimeToVisit: true,
  city: { select: { name: true, slug: true } },
  state: { select: { slug: true, name: true } },
  experiences: { select: { experience: { select: { slug: true, name: true } } } },
  attractions: { select: { id: true, name: true, description: true, image: true } },
  reviews: { select: { rating: true, status: true } },
} as const;

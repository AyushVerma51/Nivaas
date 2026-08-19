import { z } from "zod";

// --- Auth ----------------------------------------------------------------

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

// --- Public query params -------------------------------------------------

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const statesQuerySchema = listQuerySchema.extend({
  region: z.string().optional(),
  type: z.enum(["state", "union_territory", "STATE", "UNION_TERRITORY"]).optional(),
  featured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const destinationsQuerySchema = listQuerySchema.extend({
  state: z.string().optional(),
  city: z.string().optional(),
  experience: z.string().optional(),
  category: z.string().optional(),
  featured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sort: z.enum(["popular", "name", "newest"]).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required").max(80),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const nearbyQuerySchema = z.object({
  radius: z.coerce.number().positive().max(500).default(50),
});

// --- User features -------------------------------------------------------

export const wishlistCreateSchema = z.object({
  destinationId: z.string().min(1),
});

export const wishlistToggleSchema = z.object({
  destinationId: z.string().min(1),
});

export const visitedCreateSchema = z.object({
  destinationId: z.string().min(1),
  visitedAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

export const itineraryCreateSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.coerce.number().int().positive().optional(),
  travelStyle: z.string().max(60).optional(),
});

export const itineraryUpdateSchema = itineraryCreateSchema.partial();

export const itineraryDayCreateSchema = z.object({
  dayNumber: z.coerce.number().int().positive(),
  date: z.string().datetime().optional(),
  title: z.string().max(160).optional(),
  description: z.string().max(2000).optional(),
  destinationIds: z.array(z.string()).max(20).optional(),
});

export const itineraryDayUpdateSchema = itineraryDayCreateSchema.partial();

// --- Reviews -------------------------------------------------------------

export const reviewCreateSchema = z.object({
  destinationId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(140).optional(),
  content: z.string().trim().min(10).max(3000),
});

export const reviewUpdateSchema = reviewCreateSchema.partial();

export const reviewModerationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

// --- Trip planner --------------------------------------------------------

export const tripPlannerSchema = z.object({
  startLocation: z.string().trim().min(2).max(80),
  duration: z.coerce.number().int().min(1).max(30),
  budget: z.coerce.number().int().positive().optional(),
  interests: z.array(z.string().max(40)).max(10).default([]),
  travelStyle: z
    .enum(["relaxed", "balanced", "adventurous"])
    .default("balanced"),
});

// --- Analytics -----------------------------------------------------------

export const analyticsEventSchema = z.object({
  event: z.string().min(1).max(80),
  entityId: z.string().optional(),
  entityType: z.string().max(40).optional(),
  meta: z.record(z.unknown()).optional(),
});

// --- Admin content -------------------------------------------------------

export const adminStateSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  type: z.enum(["STATE", "UNION_TERRITORY"]),
  regionId: z.coerce.number().int().positive(),
  capital: z.string().optional().nullable(),
  description: z.string().min(10),
  shortDescription: z.string().min(2),
  heroImage: z.string().url().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  bestTimeToVisit: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
});

export const adminDestinationSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  cityId: z.string().optional().nullable(),
  stateId: z.string().min(1),
  category: z.string().default("Heritage"),
  description: z.string().min(10),
  shortDescription: z.string().min(2),
  heroImage: z.string().url().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  bestTimeToVisit: z.string().optional().nullable(),
  popularityScore: z.coerce.number().int().min(0).max(100).optional(),
  featured: z.boolean().optional(),
  experienceSlugs: z.array(z.string()).optional(),
});

export const adminExperienceSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z.string().min(10),
  icon: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export const adminCitySchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  stateId: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  heroImage: z.string().url().optional().nullable(),
});

export const adminAttractionSchema = z.object({
  destinationId: z.string().min(1),
  name: z.string().trim().min(2),
  description: z.string().optional(),
  image: z.string().url().optional().nullable(),
  estimatedDuration: z.string().optional().nullable(),
  ticketRequired: z.boolean().optional(),
});

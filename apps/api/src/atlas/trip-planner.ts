import { Router } from "express";
import { asyncHandler } from "../lib/errors";
import { prisma } from "./lib/prisma";
import { ok } from "./lib/response";
import { tripPlannerSchema } from "./schemas";
import { validate } from "./middleware";

// ---------------------------------------------------------------------------
// TripPlannerService — abstraction over the eventual LLM integration.
//
// The public contract (inputs → structured itinerary) is stable. Swap the mock
// implementation for a real provider (OpenAI/Anthropic) without touching the
// route handler or the frontend API contract.
// ---------------------------------------------------------------------------

export interface TripPlannerInput {
  startLocation: string;
  duration: number;
  budget?: number;
  interests: string[];
  travelStyle: "relaxed" | "balanced" | "adventurous";
}

export interface TripPlannerDay {
  day: number;
  location: string;
  activities: string[];
}

export interface TripPlannerOutput {
  title: string;
  summary: string;
  estimatedBudget: number | null;
  days: TripPlannerDay[];
}

export interface TripPlannerService {
  generateItinerary(input: TripPlannerInput): Promise<TripPlannerOutput>;
}

/** Deterministic mock that builds itineraries from the seeded destination DB. */
export class MockTripPlannerService implements TripPlannerService {
  async generateItinerary(input: TripPlannerInput): Promise<TripPlannerOutput> {
    const interests = input.interests.length ? input.interests : ["heritage", "culture"];
    const style = input.travelStyle;

    // Pull real destinations matching the requested interests (experience slug
    // or category), so the mock is grounded in actual content.
    const candidates = await prisma.destination.findMany({
      where: {
        OR: interests.map((interest) => ({
          OR: [
            { category: { contains: interest, mode: "insensitive" } },
            { experiences: { some: { experience: { slug: { contains: interest, mode: "insensitive" } } } } },
          ],
        })),
      },
      select: { name: true, city: { select: { name: true } }, state: { select: { name: true } } },
      orderBy: { popularityScore: "desc" },
      take: 12,
    });

    const fallback = await prisma.destination.findMany({
      select: { name: true, city: { select: { name: true } }, state: { select: { name: true } } },
      orderBy: { popularityScore: "desc" },
      take: 12,
    });

    const pool = candidates.length >= Math.min(3, input.duration) ? candidates : fallback;
    const picks = pool.slice(0, input.duration);

    const budgetPerDay = input.budget ? Math.round(input.budget / input.duration) : null;
    const days: TripPlannerDay[] = picks.map((d, i) => {
      const pace =
        style === "relaxed" ? 2 : style === "adventurous" ? 4 : 3;
      const location = d.city?.name ?? d.state.name;
      const activities = [
        `Explore ${d.name}`,
        style === "relaxed"
          ? `Leisurely walk and local food tasting in ${location}`
          : style === "adventurous"
            ? `Guided excursion and outdoor activity around ${location}`
            : `Sightseeing circuit covering the highlights of ${location}`,
        `Evening market or cultural evening in ${location}`,
      ];
      if (i % 2 === 1) activities.push(`Day trip into the ${d.state.name} countryside`);
      return { day: i + 1, location, activities: activities.slice(0, pace) };
    });

    const start = input.startLocation;
    const title = `${start} to ${picks[picks.length - 1]?.city?.name ?? "India"} in ${input.duration} days`;
    const summary = `A ${input.travelStyle} ${input.duration}-day journey from ${start}, shaped around ${interests.join(" & ")} — ${days
      .map((d) => d.location)
      .filter((l, i, arr) => arr.indexOf(l) === i)
      .slice(0, 4)
      .join(" → ")}.`;

    return {
      title,
      summary,
      estimatedBudget: budgetPerDay ? budgetPerDay * input.duration : null,
      days,
    };
  }
}

export const tripPlanner: TripPlannerService = new MockTripPlannerService();

export function tripPlannerRouter(): Router {
  const router = Router();

  router.post(
    "/trip-planner",
    validate(tripPlannerSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as TripPlannerInput;
      const output = await tripPlanner.generateItinerary(body);
      prisma.analyticsEvent
        .create({ data: { event: "trip_planner_used", meta: { duration: body.duration, interests: body.interests } } })
        .catch(() => undefined);
      res.json(ok(output));
    }),
  );

  return router;
}

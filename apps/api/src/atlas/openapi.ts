import { Router } from "express";
import swaggerUi from "swagger-ui-express";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Atlas India API",
    version: "1.0.0",
    description:
      "REST API for the Atlas India tourism platform — states, destinations, experiences, maps, search, user journeys, reviews, itineraries and AI trip planning. All content is database-driven.",
  },
  servers: [{ url: "/api/v1", description: "Local" }],
  tags: [
    { name: "Auth", description: "Register, login, refresh, me" },
    { name: "Content", description: "States, cities, destinations, experiences, journeys" },
    { name: "Map & Search" },
    { name: "Journey", description: "Wishlist, visited, itineraries (authenticated)" },
    { name: "Reviews" },
    { name: "Trip Planner" },
    { name: "Admin", description: "RBAC-protected content management" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "DESTINATION_NOT_FOUND" },
              message: { type: "string" },
            },
          },
        },
      },
      State: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          type: { type: "string", enum: ["STATE", "UNION_TERRITORY"] },
          region: { type: "string" },
          shortDescription: { type: "string" },
          heroImage: { type: "string", nullable: true },
          destinationCount: { type: "integer" },
        },
      },
      Destination: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          category: { type: "string" },
          stateSlug: { type: "string" },
          stateName: { type: "string" },
          shortDescription: { type: "string" },
          heroImage: { type: "string", nullable: true },
          popularityScore: { type: "number" },
          featured: { type: "boolean" },
          experienceSlugs: { type: "array", items: { type: "string" } },
        },
      },
      Experience: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          icon: { type: "string", nullable: true },
          image: { type: "string", nullable: true },
          destinationCount: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Create an account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password", minLength: 8 },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Created" }, 409: { description: "Email taken" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "OK" }, 401: { description: "Invalid credentials" } },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
      },
    },
    "/states": {
      get: {
        tags: ["Content"],
        summary: "List states & union territories",
        parameters: [
          { name: "region", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string", enum: ["state", "union_territory"] } },
          { name: "featured", in: "query", schema: { type: "boolean" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer", maximum: 100 } },
        ],
        responses: { 200: { description: "Paginated list of states" } },
      },
    },
    "/states/{slug}": {
      get: {
        tags: ["Content"],
        summary: "State detail",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "State detail" }, 404: { description: "Not found" } },
      },
    },
    "/states/{slug}/cities": {
      get: {
        tags: ["Content"],
        summary: "Cities in a state",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Cities" } },
      },
    },
    "/states/{slug}/destinations": {
      get: {
        tags: ["Content"],
        summary: "Destinations in a state",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Destinations" } },
      },
    },
    "/states/{slug}/experiences": {
      get: {
        tags: ["Content"],
        summary: "Experiences available in a state",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Experiences" } },
      },
    },
    "/cities": {
      get: {
        tags: ["Content"],
        summary: "List cities",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer", maximum: 100 } },
        ],
        responses: { 200: { description: "Paginated cities" } },
      },
    },
    "/cities/{slug}": {
      get: {
        tags: ["Content"],
        summary: "City detail",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "City" }, 404: { description: "Not found" } },
      },
    },
    "/cities/{slug}/destinations": {
      get: {
        tags: ["Content"],
        summary: "Destinations in a city",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Destinations" } },
      },
    },
    "/destinations": {
      get: {
        tags: ["Content"],
        summary: "List destinations",
        parameters: [
          { name: "state", in: "query", schema: { type: "string" } },
          { name: "city", in: "query", schema: { type: "string" } },
          { name: "experience", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "featured", in: "query", schema: { type: "boolean" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["popular", "name", "newest"] } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer", maximum: 100 } },
        ],
        responses: { 200: { description: "Paginated destinations" } },
      },
    },
    "/destinations/featured": {
      get: {
        tags: ["Content"],
        summary: "Featured destinations",
        responses: { 200: { description: "Featured destinations" } },
      },
    },
    "/destinations/popular": {
      get: {
        tags: ["Content"],
        summary: "Popular destinations",
        responses: { 200: { description: "Popular destinations" } },
      },
    },
    "/destinations/{slug}": {
      get: {
        tags: ["Content"],
        summary: "Destination detail (with nearby places and review stats)",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Destination detail" }, 404: { description: "Not found" } },
      },
    },
    "/destinations/{slug}/attractions": {
      get: {
        tags: ["Content"],
        summary: "Attractions within a destination",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Attractions" } },
      },
    },
    "/destinations/{slug}/nearby": {
      get: {
        tags: ["Content"],
        summary: "Nearby destinations by haversine distance",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
          { name: "radius", in: "query", schema: { type: "number", maximum: 500, default: 50 } },
        ],
        responses: { 200: { description: "Nearby destinations" } },
      },
    },
    "/destinations/{slug}/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "Approved reviews for a destination",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Reviews" } },
      },
      post: {
        tags: ["Reviews"],
        summary: "Write a review (goes to moderation)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["destinationId", "rating", "content"],
                properties: {
                  destinationId: { type: "string" },
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  title: { type: "string" },
                  content: { type: "string", minLength: 10 },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Created (pending moderation)" }, 401: { description: "Unauthorized" } },
      },
    },
    "/experiences": {
      get: {
        tags: ["Content"],
        summary: "List experiences (Mountains, Beaches, Heritage, …)",
        responses: { 200: { description: "Experiences" } },
      },
    },
    "/experiences/{slug}": {
      get: {
        tags: ["Content"],
        summary: "Experience detail",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Experience" }, 404: { description: "Not found" } },
      },
    },
    "/experiences/{slug}/destinations": {
      get: {
        tags: ["Content"],
        summary: "Destinations matching an experience",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Destinations" } },
      },
    },
    "/journeys": {
      get: {
        tags: ["Content"],
        summary: "Featured journeys",
        responses: { 200: { description: "Journeys" } },
      },
    },
    "/map/states": {
      get: {
        tags: ["Map & Search"],
        summary: "Lightweight state data for the interactive India map",
        responses: { 200: { description: "Map states" } },
      },
    },
    "/search": {
      get: {
        tags: ["Map & Search"],
        summary: "Categorized search across states, cities, destinations and experiences",
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string", minLength: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", maximum: 50 } },
        ],
        responses: { 200: { description: "Categorized results" } },
      },
    },
    "/home": {
      get: {
        tags: ["Content"],
        summary: "Curated homepage payload (hero, featured, experiences, journeys, map stats)",
        responses: { 200: { description: "Homepage content" } },
      },
    },
    "/me/wishlist": {
      get: {
        tags: ["Journey"],
        summary: "My wishlist",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Wishlist" }, 401: { description: "Unauthorized" } },
      },
      post: {
        tags: ["Journey"],
        summary: "Save a destination",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["destinationId"],
                properties: { destinationId: { type: "string" } },
              },
            },
          },
        },
        responses: { 201: { description: "Saved" }, 409: { description: "Already saved" } },
      },
    },
    "/me/wishlist/toggle": {
      post: {
        tags: ["Journey"],
        summary: "Toggle a destination in the wishlist",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["destinationId"],
                properties: { destinationId: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "New state { saved: boolean }" } },
      },
    },
    "/me/wishlist/{destinationId}": {
      delete: {
        tags: ["Journey"],
        summary: "Remove from wishlist",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "destinationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Removed" }, 404: { description: "Not saved" } },
      },
    },
    "/me/visited": {
      get: {
        tags: ["Journey"],
        summary: "My visited destinations",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Visited" } },
      },
      post: {
        tags: ["Journey"],
        summary: "Mark a destination as visited",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["destinationId"],
                properties: {
                  destinationId: { type: "string" },
                  visitedAt: { type: "string", format: "date-time" },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Marked" }, 409: { description: "Already visited" } },
      },
    },
    "/me/visited/toggle": {
      post: {
        tags: ["Journey"],
        summary: "Toggle visited state",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["destinationId"],
                properties: { destinationId: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "New state { visited: boolean }" } },
      },
    },
    "/me/visited/{destinationId}": {
      delete: {
        tags: ["Journey"],
        summary: "Unmark visited",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "destinationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Removed" }, 404: { description: "Not visited" } },
      },
    },
    "/me/journey": {
      get: {
        tags: ["Journey"],
        summary: "Full journey summary (visited, wishlist, planned, state coverage)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Journey summary" } },
      },
    },
    "/me/itineraries": {
      get: {
        tags: ["Journey"],
        summary: "My itineraries",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Itineraries" } },
      },
      post: {
        tags: ["Journey"],
        summary: "Create an itinerary",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", minLength: 2 },
                  description: { type: "string" },
                  startDate: { type: "string", format: "date-time" },
                  endDate: { type: "string", format: "date-time" },
                  budget: { type: "number" },
                  travelStyle: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/me/itineraries/{id}": {
      get: {
        tags: ["Journey"],
        summary: "Itinerary detail with days and destinations",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Itinerary" }, 404: { description: "Not found" } },
      },
      patch: {
        tags: ["Journey"],
        summary: "Update an itinerary",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Journey"],
        summary: "Delete an itinerary",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/me/itineraries/{id}/days": {
      post: {
        tags: ["Journey"],
        summary: "Add a day to an itinerary",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["dayNumber"],
                properties: {
                  dayNumber: { type: "integer", minimum: 1 },
                  date: { type: "string", format: "date-time" },
                  title: { type: "string" },
                  description: { type: "string" },
                  destinationIds: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/me/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "My reviews",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "My reviews" } },
      },
    },
    "/me/reviews/{id}": {
      patch: {
        tags: ["Reviews"],
        summary: "Update my review",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete my review",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/trip-planner": {
      post: {
        tags: ["Trip Planner"],
        summary: "Generate a structured itinerary (mock AI service, LLM-ready)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["startLocation", "duration"],
                properties: {
                  startLocation: { type: "string" },
                  duration: { type: "integer", minimum: 1, maximum: 30 },
                  budget: { type: "number" },
                  interests: { type: "array", items: { type: "string" } },
                  travelStyle: { type: "string", enum: ["relaxed", "balanced", "adventurous"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Structured itinerary" } },
      },
    },
    "/admin/states": {
      get: {
        tags: ["Admin"],
        summary: "List all states (editor+)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "States" }, 403: { description: "Forbidden" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Create a state (editor+)",
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Created" } },
      },
    },
    "/admin/reviews": {
      get: {
        tags: ["Admin"],
        summary: "List reviews for moderation (editor+)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Reviews" } },
      },
    },
    "/admin/reviews/{id}/status": {
      patch: {
        tags: ["Admin"],
        summary: "Approve or reject a review",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: { status: { type: "string", enum: ["APPROVED", "REJECTED"] } },
              },
            },
          },
        },
        responses: { 200: { description: "Updated" } },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List users (admin only)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Users" }, 403: { description: "Forbidden" } },
      },
    },
    "/admin/users/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Change a user's role (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Updated" } },
      },
    },
    "/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "System counts (admin only)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Stats" } },
      },
    },
    "/analytics/events": {
      post: {
        tags: ["Trip Planner"],
        summary: "Record an analytics event",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["event"],
                properties: {
                  event: { type: "string" },
                  entityId: { type: "string" },
                  entityType: { type: "string" },
                  meta: { type: "object" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Recorded" } },
      },
    },
  },
};

export function docsRouter(): Router {
  const router = Router();
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(spec as never));
  router.get("/docs.json", (_req, res) => res.json(spec));
  return router;
}

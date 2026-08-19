/**
 * Atlas India API client.
 *
 * The Atlas frontend is intentionally data-driven: components consume typed
 * shapes (State / Destination / Experience / Journey). This module bridges the
 * mock data layer to the real backend at /api/v1, mapping API DTOs into those
 * same shapes. Every call falls back to the local mock data when the API is
 * unreachable, so the UI keeps working in dev/demo mode.
 */
import { HERO_FALLBACK } from "./images";
import { states as mockStates } from "./states";
import { destinations as mockDestinations } from "./destinations";
import { experiences as mockExperiences } from "./experiences";
import type { Destination, Experience, Journey, State } from "./types";

export const ATLAS_API =
  process.env.NEXT_PUBLIC_ATLAS_API ?? "http://localhost:4000/api/v1";

interface ApiErrorShape {
  success?: boolean;
  error?: { code?: string; message?: string };
}

async function getAtlas<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${ATLAS_API}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data: T } | ApiErrorShape;
    if (!json || json.success === false || !("data" in json)) return null;
    return json.data;
  } catch {
    return null;
  }
}

const titleCase = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// ---- DTO → frontend shape mappers ---------------------------------------

interface StateDTO {
  id: string;
  name: string;
  slug: string;
  type: "STATE" | "UNION_TERRITORY";
  region: string;
  shortDescription: string;
  heroImage: string | null;
  destinationCount: number;
}

interface DestinationDTO {
  id: string;
  name: string;
  slug: string;
  category: string;
  stateSlug: string;
  stateName: string;
  shortDescription: string;
  heroImage: string | null;
  popularityScore: number;
  featured: boolean;
  experienceSlugs: string[];
}

interface ExperienceDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  image: string | null;
  destinationCount: number;
}

export interface SearchResults {
  states: StateDTO[];
  destinations: DestinationDTO[];
  experiences: ExperienceDTO[];
  query: string;
}

function mapState(d: StateDTO): State {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    kind: d.type === "UNION_TERRITORY" ? "Union Territory" : "State",
    region: titleCase(d.region) as State["region"],
    tagline: d.shortDescription,
    description: d.shortDescription,
    heroImage: d.heroImage ?? HERO_FALLBACK,
    destinations: [],
    experiences: [],
    bestTime: "",
  };
}

function mapDestination(d: DestinationDTO): Destination {
  return {
    slug: d.slug,
    name: d.name,
    state: d.stateName,
    stateSlug: d.stateSlug,
    category: d.category,
    tagline: d.shortDescription,
    description: d.shortDescription,
    heroImage: d.heroImage ?? HERO_FALLBACK,
    bestTime: "",
    highlights: [],
    nearby: [],
  };
}

function mapExperience(e: ExperienceDTO): Experience {
  return {
    slug: e.slug,
    name: e.name,
    tagline: e.description,
    description: e.description,
    heroImage: e.image ?? HERO_FALLBACK,
    destinations: [],
  };
}

// ---- Local fallbacks (mirror of the old mock-only behavior) --------------

export type LocalSearchResult =
  | { kind: "destination"; data: Destination }
  | { kind: "state"; data: State }
  | { kind: "experience"; data: Experience };

export function searchLocal(q: string): LocalSearchResult[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const results: LocalSearchResult[] = [];
  for (const s of mockStates) {
    if (
      s.name.toLowerCase().includes(query) ||
      s.region.toLowerCase().includes(query) ||
      s.kind.toLowerCase().includes(query)
    ) {
      results.push({ kind: "state", data: s });
    }
  }
  for (const d of mockDestinations) {
    if (
      d.name.toLowerCase().includes(query) ||
      d.state.toLowerCase().includes(query) ||
      d.category.toLowerCase().includes(query) ||
      d.tagline.toLowerCase().includes(query)
    ) {
      results.push({ kind: "destination", data: d });
    }
  }
  for (const e of mockExperiences) {
    if (e.name.toLowerCase().includes(query) || e.tagline.toLowerCase().includes(query)) {
      results.push({ kind: "experience", data: e });
    }
  }
  return results.slice(0, 24);
}

// ---- Public API ----------------------------------------------------------

/** Live categorized search — falls back to mock data when the API is down. */
export async function searchAtlas(q: string): Promise<LocalSearchResult[]> {
  const query = q.trim();
  if (!query) return [];
  const data = await getAtlas<SearchResults>(`/search?q=${encodeURIComponent(query)}&limit=10`);
  if (!data) return searchLocal(query);
  const results: LocalSearchResult[] = [
    ...data.states.map((s) => ({ kind: "state" as const, data: mapState(s) })),
    ...data.destinations.map((d) => ({ kind: "destination" as const, data: mapDestination(d) })),
    ...data.experiences.map((e) => ({ kind: "experience" as const, data: mapExperience(e) })),
  ];
  return results.slice(0, 24);
}

/** Curated homepage payload — falls back to local data. */
export async function atlasHome() {
  const data = await getAtlas<{
    hero: { title: string; subtitle: string; image: string | null };
    featuredDestinations: DestinationDTO[];
    experiences: ExperienceDTO[];
    featuredStates: StateDTO[];
    popularJourneys: Array<{
      id: string;
      slug: string;
      title: string;
      days: number;
      theme: string[];
      tagline: string;
      description: string;
      heroImage: string | null;
      stops: string[];
    }>;
    mapStats: { states: number; destinations: number; cities: number; experiences: number };
  }>("/home");
  if (!data) return null;
  return {
    hero: data.hero,
    featuredDestinations: data.featuredDestinations.map(mapDestination),
    experiences: data.experiences.map(mapExperience),
    featuredStates: data.featuredStates.map(mapState),
    popularJourneys: data.popularJourneys.map(
      (j): Journey => ({
        slug: j.slug,
        name: j.title,
        days: j.days,
        theme: j.theme,
        tagline: j.tagline,
        description: j.description,
        heroImage: j.heroImage ?? HERO_FALLBACK,
        stops: j.stops,
      }),
    ),
    mapStats: data.mapStats,
  };
}

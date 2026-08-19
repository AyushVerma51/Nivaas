/**
 * Free OSM Overpass client (spec 5.3) — no API key, no cost.
 * Queries schools/colleges/hospitals/malls/parks/metro/railway in a bbox,
 * parses the response, and maps each element to an `amenities` row shape.
 */

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export type AmenityCategory =
  | "school"
  | "college"
  | "hospital"
  | "mall"
  | "park"
  | "metro"
  | "railway";

export interface FetchedAmenity {
  category: AmenityCategory;
  name: string | null;
  lat: number;
  lng: number;
}

/** OSM tag filter per platform category. */
const CATEGORY_FILTERS: Record<AmenityCategory, string[]> = {
  school: ['["amenity"="school"]'],
  college: ['["amenity"="college"]', '["amenity"="university"]'],
  hospital: ['["amenity"="hospital"]'],
  mall: ['["shop"="mall"]'],
  park: ['["leisure"="park"]', '["leisure"="garden"]'],
  metro: ['["railway"="station"]["station"="subway"]', '["amenity"="metro_station"]'],
  railway: ['["railway"="station"]'],
};

/** Map an element's tags back to a platform category (first match wins). */
function categoryForTags(tags: Record<string, string> | undefined): AmenityCategory | null {
  if (!tags) return null;
  for (const [category, filters] of Object.entries(CATEGORY_FILTERS)) {
    for (const filter of filters) {
      // e.g. ["amenity"="school"]  →  tags.amenity === "school"
      const m = /\["([^"]+)"="([^"]+)"\]/.exec(filter);
      if (m && m[1] && m[2] && tags[m[1]] === m[2]) return category as AmenityCategory;
    }
  }
  return null;
}

/** Nodes and ways only — relations (multipolygons) are rare for these POIs and
 * make the query slow enough for Overpass to 504. Capped result set. */
const ELEMENT_TYPES = ["node", "way"] as const;
const RESULT_CAP = 400;

/** Public Overpass mirrors, tried in order — instances throttle when busy,
 * so the client fails over to the next one (each locality is cached anyway,
 * so a locality triggers at most one query per 15 min). */
const ENDPOINTS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
] as const;

const TIMEOUT_MS = 25_000;

export function buildQuery(bbox: [number, number, number, number]): string {
  const [minLat, minLng, maxLat, maxLng] = bbox;
  const area = `(${minLat},${minLng},${maxLat},${maxLng})`;
  const clauses: string[] = [];
  for (const filters of Object.values(CATEGORY_FILTERS)) {
    for (const filter of filters) {
      for (const type of ELEMENT_TYPES) {
        clauses.push(`${type}${filter}${area};`);
      }
    }
  }
  return `[out:json][timeout:20];(${clauses.join("")});out center tags ${RESULT_CAP};`;
}

async function fetchFrom(endpoint: string, query: string): Promise<OverpassResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: query }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${endpoint} responded ${res.status}`);
    return (await res.json()) as OverpassResponse;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchOverpass(bbox: [number, number, number, number]): Promise<FetchedAmenity[]> {
  const query = buildQuery(bbox);
  let data: OverpassResponse | null = null;
  let lastError: unknown = null;
  for (const endpoint of ENDPOINTS) {
    try {
      data = await fetchFrom(endpoint, query);
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (!data) throw lastError instanceof Error ? lastError : new Error("Overpass unreachable");

  const out: FetchedAmenity[] = [];
  for (const el of data.elements ?? []) {
    const category = categoryForTags(el.tags);
    if (!category) continue;
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat === undefined || lng === undefined) continue;
    out.push({
      category,
      name: el.tags?.name?.trim() || null,
      lat,
      lng,
    });
  }
  return out;
}

/** Rough bbox for a locality: center ± halfExtent degrees (~4.4 km at 0.04°). */
export function bboxAround(lat: number, lng: number, halfExtent = 0.04): [number, number, number, number] {
  return [lat - halfExtent, lng - halfExtent, lat + halfExtent, lng + halfExtent];
}

import type { Amenity, AmenityCategory } from "@rep/types";
import { pool } from "../../db/pool";
import { AppError } from "../../lib/errors";
import { bboxAround, fetchOverpass, type FetchedAmenity } from "./overpass";

interface AmenityRow {
  id: string;
  category: AmenityCategory;
  name: string;
  geojson: string | null;
  rating: string | null;
  source: "osm" | "google" | "manual";
  distance_km: string | null;
}

function toAmenity(row: AmenityRow): Amenity {
  const location = row.geojson
    ? (() => {
        try {
          const g = JSON.parse(row.geojson) as { coordinates: [number, number] };
          return { lng: g.coordinates[0]!, lat: g.coordinates[1]! };
        } catch {
          return { lng: 0, lat: 0 };
        }
      })()
    : { lng: 0, lat: 0 };
  return {
    id: row.id,
    city: "",
    locality: "",
    category: row.category,
    name: row.name,
    location,
    rating: row.rating !== null ? Number(row.rating) : null,
    source: row.source,
    ...(row.distance_km !== null ? { distance_km: Number(row.distance_km) } : {}),
  };
}

/** In-memory cooldown so we don't hammer Overpass per request (Redis is the
 * production-grade cache; this is the Phase-3-level guard). */
const lastFetch = new Map<string, number>();
const COOLDOWN_MS = 15 * 60 * 1000;

async function fetchAndStore(city: string, locality: string): Promise<number> {
  const key = `${city}|${locality}`;
  const now = Date.now();
  if (now - (lastFetch.get(key) ?? 0) < COOLDOWN_MS) return 0;

  // Anchor point: centroid of active properties in the locality; fall back to city center.
  const anchor = await pool.query<{ lat: number | null; lng: number | null }>(
    `SELECT ST_Y(ST_Centroid(ST_Collect(location::geometry))) AS lat,
            ST_X(ST_Centroid(ST_Collect(location::geometry))) AS lng
     FROM properties WHERE city ILIKE $1 AND locality ILIKE $2 AND status = 'active'`,
    [city, locality],
  );
  const point = anchor.rows[0];
  if (!point || point.lat === null || point.lng === null) return 0;

  lastFetch.set(key, now);
  const items = await fetchOverpass(bboxAround(point.lat, point.lng));
  if (items.length === 0) return 0;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of items) {
      await client.query(
        `INSERT INTO amenities (city, locality, category, name, location, source)
         VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($6, $5), 4326)::geography, 'osm')
         ON CONFLICT (city, locality, category, name, ST_AsEWKB(location)) DO NOTHING`,
        [city, locality, item.category, item.name ?? `Unnamed ${item.category}`, item.lat, item.lng],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  return items.length;
}

export interface AmenitiesQuery {
  city?: string;
  locality?: string;
  category?: AmenityCategory;
  lat?: number;
  lng?: number;
  radius_km?: number;
}

export async function findAmenities(query: AmenitiesQuery): Promise<Amenity[]> {
  // Cache-on-read: if nothing is cached for this locality yet, fetch from
  // Overpass first (spec 5.3: cache per locality, they don't change often).
  if (query.city && query.locality) {
    const cached = await pool.query("SELECT 1 FROM amenities WHERE city ILIKE $1 AND locality ILIKE $2 LIMIT 1", [
      query.city,
      query.locality,
    ]);
    if (cached.rowCount === 0) {
      await fetchAndStore(query.city, query.locality);
    }
  }

  const params: unknown[] = [];
  const conditions: string[] = [];

  if (query.city) {
    params.push(`%${query.city}%`);
    conditions.push(`city ILIKE $${params.length}`);
  }
  if (query.locality) {
    params.push(`%${query.locality}%`);
    conditions.push(`locality ILIKE $${params.length}`);
  }
  if (query.category) {
    params.push(query.category);
    conditions.push(`category = $${params.length}`);
  }

  let pointSelect = "";
  let orderBy = "ORDER BY name";
  if (query.lat !== undefined && query.lng !== undefined && query.radius_km !== undefined) {
    const iLng = params.length + 1;
    const iLat = params.length + 2;
    const iR = params.length + 3;
    params.push(query.lng, query.lat, query.radius_km * 1000);
    conditions.push(
      `ST_DWithin(location, ST_SetSRID(ST_MakePoint($${iLng}, $${iLat}), 4326)::geography, $${iR})`,
    );
    pointSelect = `, ST_Distance(location, ST_SetSRID(ST_MakePoint($${iLng}, $${iLat}), 4326)::geography) / 1000 AS distance_km`;
    orderBy = `ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint($${iLng}, $${iLat}), 4326)::geography)`;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query<AmenityRow>(
    `SELECT id, category, name, ST_AsGeoJSON(location) AS geojson, rating, source
     ${pointSelect}
     FROM amenities ${where} ${orderBy} LIMIT 150`,
    params,
  );
  return rows.map(toAmenity);
}

export interface NeighborhoodSummary {
  city: string;
  locality: string;
  property_count: number;
  avg_price_per_sqft: number;
  amenities: {
    category: AmenityCategory;
    count: number;
    nearest_km: number | null;
    names: string[];
  }[];
}

export async function neighborhoodSummary(city: string, locality: string): Promise<NeighborhoodSummary> {
  // Ensure cached amenities exist before summarizing.
  const cached = await pool.query("SELECT 1 FROM amenities WHERE city ILIKE $1 AND locality ILIKE $2 LIMIT 1", [
    city,
    locality,
  ]);
  if (cached.rowCount === 0) await fetchAndStore(city, locality);

  const { rows } = await pool.query<{
    property_count: string;
    avg_price_per_sqft: string;
  }>(
    `SELECT COUNT(*)::int AS property_count,
            COALESCE(AVG(price / NULLIF(area_sqft, 0)), 0) AS avg_price_per_sqft
     FROM properties WHERE city ILIKE $1 AND locality ILIKE $2 AND status = 'active'`,
    [city, locality],
  );

  const { rows: groups } = await pool.query<{
    category: AmenityCategory;
    count: string;
    nearest_km: string | null;
    names: string[];
  }>(
    `SELECT a.category,
            COUNT(*)::int AS count,
            MIN(CASE WHEN c.pt IS NOT NULL THEN ST_Distance(a.location, ST_SetSRID(c.pt, 4326)::geography) / 1000 END) AS nearest_km,
            (array_agg(a.name ORDER BY
               CASE WHEN c.pt IS NOT NULL
                    THEN ST_Distance(a.location, ST_SetSRID(c.pt, 4326)::geography)
               END))[1:5] AS names
     FROM amenities a
     LEFT JOIN (
       SELECT ST_Centroid(ST_Collect(location::geometry)) AS pt
       FROM properties WHERE city ILIKE $1 AND locality ILIKE $2 AND status = 'active'
     ) c ON true
     WHERE a.city ILIKE $1 AND a.locality ILIKE $2
     GROUP BY a.category ORDER BY a.category`,
    [city, locality],
  );

  return {
    city,
    locality,
    property_count: Number(rows[0]?.property_count ?? 0),
    avg_price_per_sqft: Number(rows[0]?.avg_price_per_sqft ?? 0),
    amenities: groups.map((g) => ({
      category: g.category,
      count: Number(g.count),
      nearest_km: g.nearest_km !== null ? Number(g.nearest_km) : null,
      names: g.names ?? [],
    })),
  };
}

export async function refreshLocality(city: string, locality: string): Promise<number> {
  lastFetch.delete(`${city}|${locality}`);
  const count = await fetchAndStore(city, locality);
  if (count === 0) {
    throw new AppError(
      404,
      "NO_AMENITIES_FOUND",
      "No amenities found for this locality (no properties anchor it, or Overpass returned nothing)",
    );
  }
  return count;
}

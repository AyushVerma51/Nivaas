import type { City, CityGuide, LocalDish, TouristSpot } from "@rep/types";
import { pool } from "../../db/pool";
import { AppError } from "../../lib/errors";

interface CityRow {
  id: string;
  name: string;
  state: string;
  description: string | null;
  cover_image_url: string | null;
}

interface SpotRow {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: TouristSpot["category"];
}

interface DishRow {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  where_to_try: string | null;
}

function toCity(row: CityRow): City {
  return {
    id: row.id,
    name: row.name,
    state: row.state,
    description: row.description,
    cover_image_url: row.cover_image_url,
  };
}

export async function listCities(): Promise<City[]> {
  const { rows } = await pool.query<CityRow>(
    "SELECT id, name, state, description, cover_image_url FROM cities ORDER BY name",
  );
  return rows.map(toCity);
}

const NEARBY_KM = 150;

export async function getCityGuide(cityName: string): Promise<CityGuide> {
  const cityResult = await pool.query<CityRow>(
    `SELECT id, name, state, description, cover_image_url
     FROM cities WHERE name ILIKE $1`,
    [cityName],
  );
  const city = cityResult.rows[0];
  if (!city) {
    throw new AppError(404, "CITY_NOT_FOUND", `No city guide found for "${cityName}"`);
  }

  const [spots, dishes] = await Promise.all([
    pool.query<SpotRow>(
      "SELECT id, city_id, name, description, image_url, category FROM tourist_spots WHERE city_id = $1 ORDER BY name",
      [city.id],
    ),
    pool.query<DishRow>(
      "SELECT id, city_id, name, description, image_url, where_to_try FROM local_dishes WHERE city_id = $1 ORDER BY name",
      [city.id],
    ),
  ]);

  // Nearby cities within ~150 km using PostGIS ST_DWithin on the city center.
  const nearby = await pool.query<CityRow & { distance_km: string }>(
    `SELECT c.id, c.name, c.state, c.description, c.cover_image_url,
            ST_Distance(c.center, (SELECT center FROM cities WHERE id = $1)) / 1000 AS distance_km
     FROM cities c
     WHERE c.id <> $1
       AND ST_DWithin(c.center, (SELECT center FROM cities WHERE id = $1), ${NEARBY_KM * 1000})
     ORDER BY distance_km
     LIMIT 5`,
    [city.id],
  );

  const nearbyCities = await Promise.all(
    nearby.rows.map(async (row) => {
      const spotsResult = await pool.query<SpotRow>(
        `SELECT id, city_id, name, description, image_url, category
         FROM tourist_spots WHERE city_id = $1 ORDER BY name LIMIT 3`,
        [row.id],
      );
      return {
        city: toCity(row),
        distance_km: Number(row.distance_km),
        tourist_spots: spotsResult.rows,
      };
    }),
  );

  return {
    city: toCity(city),
    tourist_spots: spots.rows,
    local_dishes: dishes.rows,
    nearby_cities: nearbyCities,
  };
}

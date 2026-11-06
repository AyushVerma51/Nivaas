import type { City, CityGuide } from "@rep/types";
import { seedCities } from "@rep/types";

const cityId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function toCity(seed: (typeof seedCities)[number]): City {
  return {
    id: cityId(seed.name),
    name: seed.name,
    state: seed.state,
    description: seed.description,
    cover_image_url: seed.cover_image_url,
  };
}

function distanceKm(a: [number, number], b: [number, number]): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const [lonA, latA] = a;
  const [lonB, latB] = b;
  const dLat = radians(latB - latA);
  const dLon = radians(lonB - lonA);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(latA)) * Math.cos(radians(latB)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function getFallbackCities(): City[] {
  return seedCities.map(toCity).sort((a, b) => a.name.localeCompare(b.name));
}

export function getFallbackCityGuide(name: string): CityGuide | null {
  const seed = seedCities.find((city) => city.name.toLowerCase() === name.trim().toLowerCase());
  if (!seed) return null;

  const city = toCity(seed);
  const tourist_spots = seed.touristSpots.map((spot, index) => ({
    id: `${city.id}-spot-${index}`,
    city_id: city.id,
    name: spot.name,
    description: spot.description,
    image_url: spot.image_url,
    category: spot.category,
  }));
  const local_dishes = seed.dishes.map((dish, index) => ({
    id: `${city.id}-dish-${index}`,
    city_id: city.id,
    name: dish.name,
    description: dish.description,
    image_url: dish.image_url,
    where_to_try: dish.where_to_try,
  }));
  const nearby_cities = seedCities
    .filter((other) => other.name !== seed.name)
    .map((other) => ({ city: toCity(other), distance_km: distanceKm(seed.center, other.center) }))
    .filter(({ distance_km }) => distance_km <= 150)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 5)
    .map(({ city: nearby, distance_km }) => ({
      city: nearby,
      distance_km,
      tourist_spots: seedCities
        .find((other) => cityId(other.name) === nearby.id)!
        .touristSpots.slice(0, 3)
        .map((spot, index) => ({
          id: `${nearby.id}-spot-${index}`,
          city_id: nearby.id,
          name: spot.name,
          description: spot.description,
          image_url: spot.image_url,
          category: spot.category,
        })),
    }));

  return { city, tourist_spots, local_dishes, nearby_cities };
}

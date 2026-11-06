import type { Metadata } from "next";
import type { City } from "@rep/types";
import CitySearch from "@/components/city-guide/CitySearch";
import { API_URL } from "@/lib/api-client";
import { getFallbackCities } from "@/lib/city-guide-data";

export const metadata: Metadata = { title: "City Guides" };

async function fetchCities(): Promise<City[]> {
  try {
    const res = await fetch(`${API_URL}/cities`, { cache: "no-store" });
    if (res.ok) return res.json();
  } catch {
    // Use the bundled guide data when the optional API is unavailable.
  }
  return getFallbackCities();
}

export default async function CityGuideIndex() {
  const cities: City[] = await fetchCities();

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:px-12">
      <p className="eyebrow">Destinations</p>
      <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[1.02]">
        City Guides
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/65">
        Tourist attractions, nearby cities, and must-try local food — across
        India, state by state.
      </p>

      <CitySearch cities={cities} />
    </div>
  );
}

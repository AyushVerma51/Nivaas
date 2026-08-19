import type { Metadata } from "next";
import type { City } from "@rep/types";
import CitySearch from "@/components/city-guide/CitySearch";
import { API_URL } from "@/lib/api-client";

export const metadata: Metadata = { title: "City Guides" };

async function fetchCities(): Promise<City[]> {
  const res = await fetch(`${API_URL}/cities`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load cities (${res.status})`);
  return res.json();
}

export default async function CityGuideIndex() {
  let cities: City[];
  try {
    cities = await fetchCities();
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">City Guides</h1>
        <p className="mt-2 text-slate-600">
          The API isn&apos;t reachable right now. Start it with{" "}
          <code className="rounded bg-slate-100 px-1">npm run dev:api</code> to browse guides.
        </p>
      </div>
    );
  }

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

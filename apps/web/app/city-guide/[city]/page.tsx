import type { Metadata } from "next";
import type { CityGuide, TouristSpot } from "@rep/types";
import { API_URL } from "@/lib/api-client";
import { fetchImagesForCards, type ImageResult } from "@/lib/fetch-images";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  try {
    const guide = await fetchGuide(city);
    return {
      title: `${guide.city.name} — City Guide`,
      description: `Tourist spots, nearby cities, and must-try local food in ${guide.city.name}, ${guide.city.state}.`,
      openGraph: {
        title: `${guide.city.name} — City Guide`,
        description: `Tourist spots, nearby cities, and must-try local food in ${guide.city.name}.`,
        type: "website",
      },
      alternates: { canonical: `/city-guide/${encodeURIComponent(guide.city.name)}` },
    };
  } catch {
    return { title: "City guide" };
  }
}

const SPOT_EMOJI: Record<TouristSpot["category"], string> = {
  historical: "🏛️",
  nature: "🌳",
  religious: "🛕",
  adventure: "🥾",
};

async function fetchGuide(city: string): Promise<CityGuide> {
  const res = await fetch(`${API_URL}/city-guide/${encodeURIComponent(city)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return Promise.reject(new Error("not-found"));
  if (!res.ok) throw new Error(`Failed to load guide (${res.status})`);
  return res.json();
}

export default async function CityGuidePage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;

  let guide: CityGuide;
  try {
    guide = await fetchGuide(city);
  } catch (e) {
    if (e instanceof Error && e.message === "not-found") {
      return (
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">No guide for this city yet</h1>
          <p className="mt-2 text-slate-600">
            Guides are available for 200+ Indian cities — search the index to find yours.
          </p>
          <a
            href="/city-guide"
            className="mt-6 inline-block rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white hover:bg-teal-600"
          >
            ← Browse all city guides
          </a>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Couldn&apos;t load this guide</h1>
        <p className="mt-2 text-slate-600">
          The API isn&apos;t reachable right now. Start it with{" "}
          <code className="rounded bg-slate-100 px-1">npm run dev:api</code> and try again.
        </p>
      </div>
    );
  }

  const { city: c, tourist_spots, local_dishes, nearby_cities } = guide;

  // Fetch dynamic images for spots and dishes that are missing images
  const spotsNeedingImages = tourist_spots
    .filter((s) => !s.image_url)
    .map((s) => ({
      title: s.name,
      category: "spot",
      city: c.name,
      state: c.state,
    }));
  const dishesNeedingImages = local_dishes
    .filter((d) => !d.image_url)
    .map((d) => ({
      title: d.name,
      category: "food",
      city: c.name,
      state: c.state,
    }));

  const dynamicImages = await fetchImagesForCards([...spotsNeedingImages, ...dishesNeedingImages]);

  /** Resolve image: DB → dynamic API → null (fallback emoji). */
  function spotImage(spot: { name: string; image_url: string | null }): string | null {
    if (spot.image_url) return spot.image_url;
    return dynamicImages.get(spot.name)?.url ?? null;
  }
  function dishImage(dish: { name: string; image_url: string | null }): string | null {
    if (dish.image_url) return dish.image_url;
    return dynamicImages.get(dish.name)?.url ?? null;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:px-12">
      <p className="text-sm text-ink/50">
        <a href="/city-guide" className="hover:text-clay">
          City Guides
        </a>{" "}
        / {c.name}
      </p>

      {c.cover_image_url ? (
        <div className="relative mt-4 h-[52vh] min-h-72 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.cover_image_url}
            alt={`${c.name} cityscape`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
            <p className="eyebrow !text-sand/80">{c.state}</p>
            <h1 className="mt-2 font-display text-[clamp(3rem,7vw,6rem)] leading-[0.98] text-cream">
              {c.name}
            </h1>
          </div>
        </div>
      ) : (
        <div className="mt-2 max-w-2xl">
          <p className="eyebrow">{c.state}</p>
          <h1 className="mt-2 font-display text-[clamp(3rem,7vw,6rem)] leading-[0.98] text-ink">
            {c.name}
          </h1>
        </div>
      )}
      {c.description && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70">{c.description}</p>
      )}

      {/* Tourist spots */}
      <p className="eyebrow mt-16">Places to visit</p>
      <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05]">
        Top tourist spots
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tourist_spots.map((spot) => (
          <div key={spot.id} className="group overflow-hidden rounded-md border border-ink/10 bg-paper transition hover:border-ink/25">
            {(() => { const img = spotImage(spot); return img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={`${spot.name} — ${c.name}, ${c.state}`}
                className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-44 items-center justify-center bg-gradient-to-br from-canvas-2 to-sand text-4xl">
                {SPOT_EMOJI[spot.category] ?? "📍"}
              </div>
            ); })()}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-ink">{spot.name}</h3>
                <span className="rounded-sm bg-canvas-2 px-2.5 py-1 text-xs font-semibold capitalize text-ink/60">
                  {spot.category}
                </span>
              </div>
              {spot.description && (
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{spot.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nearby cities */}
      {nearby_cities.length > 0 && (
        <>
          <p className="eyebrow mt-16">Detours</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05]">
            Nearby cities
          </h2>
          <p className="mt-2 text-sm text-ink/50">Within ~150 km of {c.name}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {nearby_cities.map((n) => (
              <div key={n.city.id} className="group overflow-hidden rounded-md border border-ink/10 bg-paper transition hover:border-ink/25">
                {n.city.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.city.cover_image_url}
                    alt={`${n.city.name} cityscape`}
                    className="h-28 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-moss to-olive text-2xl">
                    🏙️
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-ink">{n.city.name}</h3>
                    <span className="rounded-sm bg-canvas-2 px-2.5 py-1 text-xs font-semibold text-ink/60">
                      {Math.round(n.distance_km)} km
                    </span>
                  </div>
                  {n.city.description && (
                    <p className="mt-2 text-sm text-ink/60">{n.city.description}</p>
                  )}
                  {n.tourist_spots.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-ink/10 pt-3">
                      {n.tourist_spots.map((spot) => (
                        <li key={spot.id} className="text-sm text-ink/55">
                          {SPOT_EMOJI[spot.category] ?? "📍"} {spot.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <a
                    href={`/city-guide/${encodeURIComponent(n.city.name)}`}
                    className="link-arrow mt-4"
                  >
                    View {n.city.name} guide
                    <span className="link-arrow-icon">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Local dishes */}
      <p className="eyebrow mt-16">Food</p>
      <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05]">
        Must-try local food
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {local_dishes.map((dish) => (
          <div key={dish.id} className="group overflow-hidden rounded-md border border-ink/10 bg-paper transition hover:border-ink/25">
            {(() => { const img = dishImage(dish); return img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={`${dish.name} — local food in ${c.name}`}
                className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-sand to-canvas-2 text-4xl">
                🍽️
              </div>
            ); })()}
            <div className="p-6">
              <h3 className="font-display text-lg text-ink">{dish.name}</h3>
              {dish.description && (
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{dish.description}</p>
              )}
              {dish.where_to_try && (
                <p className="mt-3 text-sm text-ink/55">
                  <span className="font-semibold text-ink">Where:</span> {dish.where_to_try}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

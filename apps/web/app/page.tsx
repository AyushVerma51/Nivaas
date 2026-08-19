import Link from "next/link";
import type { City } from "@rep/types";
import { API_URL } from "@/lib/api-client";
import { FALLBACK_IMAGES } from "@/lib/sourceSplashFallbacks";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

async function fetchCities(): Promise<City[]> {
  const res = await fetch(`${API_URL}/cities`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load cities (${res.status})`);
  return res.json();
}

/** Curated selection of well-known destinations across India.
 * Each entry links to a real city guide (the platform's guide unit is a city,
 * not a state), so `city` names a representative city with a cover photo. */
const HERO_CITY = "Jaipur";

/* FALLBACK_IMAGES is imported from @/lib/sourceSplashFallbacks */

const FEATURED_DESTINATIONS: { region: string; city: string; note: string; span?: string }[] = [
  { region: "Rajasthan", city: "Jaipur", note: "Forts, desert, and colour.", span: "lg:col-span-2 lg:row-span-2" },
  { region: "Kerala", city: "Kochi", note: "Backwaters and monsoon calm." },
  { region: "Himachal Pradesh", city: "Shimla", note: "Alpine valleys and old towns." },
  { region: "Goa", city: "Panaji", note: "Coast, quiet beaches, old churches." },
  { region: "Tamil Nadu", city: "Madurai", note: "Temple cities of the south." },
  { region: "Kashmir", city: "Srinagar", note: "Lakes beneath the Himalayas." },
  { region: "Madhya Pradesh", city: "Bhopal", note: "Forests, forts, and temples." },
  { region: "Uttarakhand", city: "Dehradun", note: "The mountains begin here." },
];

/** Journey itineraries — curated multi-city arcs through the guides. */
const JOURNEYS = [
  {
    cities: ["Delhi", "Agra", "Jaipur"],
    title: "The Golden Triangle",
    meta: "7 days · Heritage / Food / Architecture",
    blurb: "Three cities, one line of history — from the capital's bazaars to the Taj and the pink city.",
  },
  {
    cities: ["Bengaluru", "Mysuru", "Kochi"],
    title: "The Southern Trail",
    meta: "10 days · Nature / Food / Wellness",
    blurb: "Palace city mornings, spice-country afternoons, and Kerala backwaters at dusk.",
  },
  {
    cities: ["Delhi", "Rishikesh", "Srinagar"],
    title: "The Himalayan Escape",
    meta: "9 days · Mountains / Adventure / Culture",
    blurb: "From the ghats of the Ganges to houseboats on Dal Lake, climbing all the way.",
  },
];

const SEASONS = [
  {
    name: "Winter",
    months: "Oct – Feb",
    regions: "Rajasthan, Kerala, Goa, Himachal",
    note: "Clear skies, crisp air — the classic travel season across most of India.",
  },
  {
    name: "Summer",
    months: "Mar – Jun",
    regions: "Kashmir, Ladakh, hill stations",
    note: "The mountains open up; the plains soften into early mornings and long evenings.",
  },
  {
    name: "Monsoon",
    months: "Jun – Sep",
    regions: "Kerala, Western Ghats, Northeast",
    note: "Green everything. Waterfalls, rain-washed roads, and quiet coastlines.",
  },
];

const EXPERIENCES = [
  {
    title: "Atlas India",
    desc: "A premium digital atlas — 36 states, 76 destinations, curated experiences and journeys across India.",
    href: "/atlas",
    cta: "Explore the atlas",
  },
  {
    title: "City Guides",
    desc: "Deep guides for 200+ Indian cities — landmarks, food, culture, and the places worth a detour nearby.",
    href: "/city-guide",
    cta: "Read the guides",
  },
  {
    title: "AI Price Prediction",
    desc: "Our ML model analyzes 10 property features — location, BHK, area, RERA status — to give you an accurate price estimate.",
    href: "/predict",
    cta: "Predict a price",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function cityByName(cities: City[], name: string): City | null {
  const c = cities.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return c ?? null;
}

function coverFor(cities: City[], name: string): string | null {
  return (
    cityByName(cities, name)?.cover_image_url ??
    FALLBACK_IMAGES[name] ??
    null
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function HomePage() {
  let cities: City[] = [];
  try {
    cities = await fetchCities();
  } catch {
    // API down — the layout still renders with emoji tiles.
  }

  const heroCover = coverFor(cities, HERO_CITY);
  const featured = FEATURED_DESTINATIONS.map((d) => ({
    ...d,
    cover: coverFor(cities, d.city),
  }));

  return (
    <div className="bg-canvas">
      {/* 1 — Cinematic hero */}
      <section className="relative flex min-h-[90vh] items-end overflow-hidden">
        {heroCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroCover}
            alt={`${HERO_CITY}, India`}
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 to-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
        <div className="relative mx-auto w-full max-w-[1600px] px-6 pb-16 pt-40 sm:px-8 lg:px-12">
          <p className="eyebrow !text-sand/90">Explore India</p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.98] text-cream">
            India, in all its extraordinary detail.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
            From Himalayan silence to tropical coastlines, discover a country
            shaped by thousands of landscapes, cultures, flavors, and stories —
            and find the place that feels like yours.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/city-guide" className="btn-primary !bg-cream !text-ink hover:!bg-cream/90">
              Explore city guides
            </Link>
            <Link href="/predict" className="btn-secondary !border-cream/60 !text-cream hover:!bg-cream hover:!text-ink">
              Predict a price
            </Link>
          </div>
        </div>
      </section>

      {/* 2 — Editorial statement */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-8">
        <p className="eyebrow">The idea</p>
        <p className="mt-6 font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1.15] text-ink">
          A real estate platform that reads like a travel journal — because
          choosing where to live and choosing where to go are the same act of
          imagination.
        </p>
      </section>

      {/* 3 — Destination discovery */}
      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Destinations</p>
            <h2 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02]">
              Where will India take you?
            </h2>
          </div>
          <Link href="/city-guide" className="link-arrow">
            All city guides
            <span className="link-arrow-icon">→</span>
          </Link>
        </div>

        <div className="mt-12 grid auto-rows-[240px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((d) => (
            <Link
              key={d.city}
              href={`/city-guide/${encodeURIComponent(d.city)}`}
              className={`group relative overflow-hidden rounded-md ${d.span ?? ""}`}
            >
              {d.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.cover}
                  alt={`${d.city}, ${d.region}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-moss to-olive" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="eyebrow !text-sand/80">{d.region}</p>
                <h3 className="mt-1 font-display text-2xl text-cream">{d.city}</h3>
                <p className="mt-1 text-sm text-cream/75">{d.note}</p>
                <p className="mt-2 text-sm font-semibold text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Explore →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4 — Price Prediction */}
      <section className="border-y border-ink/10 bg-cream">
        <div className="mx-auto grid max-w-[1600px] items-center gap-12 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div>
            <p className="eyebrow">Price Prediction</p>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.05]">
              Know the true value.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink/70">
              Our ML model analyzes 10 property features — location, BHK,
              area, construction status, and more — to give you an accurate
              price estimate with nearby amenities.
            </p>
            <Link href="/predict" className="btn-primary mt-8">
              Predict a price
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["Mumbai", "Delhi", "Bengaluru", "Kochi"].map((c) => {
              const cover = coverFor(cities, c);
              return (
                <div key={c} className="group relative aspect-[4/3] overflow-hidden rounded-md">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={c}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-sand" />
                  )}
                  <span className="absolute bottom-3 left-3 font-display text-lg text-cream drop-shadow">
                    {c}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 — Experiences */}
      <section className="mx-auto max-w-[1600px] px-6 py-24 sm:px-8 lg:px-12">
        <p className="eyebrow">Experiences</p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.05]">
          More than a listing.
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {EXPERIENCES.map((e, i) => (
            <Link
              key={e.title}
              href={e.href}
              className="card group flex flex-col justify-between p-8 hover:bg-canvas-2"
            >
              <div>
                <p className="font-display text-3xl text-stone">0{i + 1}</p>
                <h3 className="mt-4 font-display text-2xl text-ink">{e.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{e.desc}</p>
              </div>
              <span className="link-arrow mt-8">
                {e.cta}
                <span className="link-arrow-icon">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 6 — Featured journeys */}
      <section className="border-y border-ink/10 bg-cream">
        <div className="mx-auto max-w-[1600px] px-6 py-24 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Featured journeys</p>
              <h2 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02]">
                Three ways across India.
              </h2>
            </div>
            <Link href="/city-guide" className="link-arrow">
              Plan your journey
              <span className="link-arrow-icon">→</span>
            </Link>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {JOURNEYS.map((j) => {
              const leadCity = j.cities[0] ?? j.title;
              const lead = coverFor(cities, leadCity);
              return (
                <Link
                  key={j.title}
                  href={`/city-guide/${encodeURIComponent(leadCity)}`}
                  className="group overflow-hidden rounded-md border border-ink/10 bg-paper transition hover:border-ink/25"
                >
                  <div className="relative aspect-[3/2] overflow-hidden">
                    {lead ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={lead}
                        alt={leadCity}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-sand" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-3 left-4 text-sm font-semibold tracking-wide text-cream">
                      {j.cities.join(" → ")}
                    </p>
                  </div>
                  <div className="p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                      {j.meta}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-ink">{j.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">{j.blurb}</p>
                    <span className="link-arrow mt-5">
                      Start here
                      <span className="link-arrow-icon">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7 — Seasonal */}
      <section className="mx-auto max-w-[1600px] px-6 py-24 sm:px-8 lg:px-12">
        <p className="eyebrow">When to go</p>
        <h2 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.05]">
          India keeps four seasons, four moods.
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SEASONS.map((s) => (
            <div key={s.name} className="card p-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-3xl text-ink">{s.name}</h3>
                <p className="text-sm font-semibold tracking-wide text-clay">{s.months}</p>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                {s.regions}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8 — Journal / editorial statement */}
      <section className="border-t border-ink/10 bg-ink text-cream">
        <div className="mx-auto max-w-[1600px] px-6 py-24 sm:px-8 lg:px-12">
          <p className="eyebrow !text-sand">Journal</p>
          <h2 className="mt-3 max-w-3xl font-display text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.05]">
            Every city, told properly.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/70">
            {cities.length > 0
              ? `${cities.length} Indian cities — their landmarks, their food, and the places worth a detour nearby.`
              : "Two hundred-plus Indian cities — their landmarks, their food, and the places worth a detour nearby."}
          </p>
          <Link
            href="/city-guide"
            className="btn-primary mt-8 !bg-clay hover:!bg-cream hover:!text-ink"
          >
            Read the guides
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

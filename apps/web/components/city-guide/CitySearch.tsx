"use client";

import { useMemo, useState } from "react";
import type { City } from "@rep/types";

interface Props {
  cities: City[];
}

export default function CitySearch({ cities }: Props) {
  const [query, setQuery] = useState("");
  const [activeState, setActiveState] = useState<string | null>(null);

  /** Cities matching the search + state filter, in a stable order. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cities
      .filter((c) => {
        if (activeState && c.state !== activeState) return false;
        if (!q) return true;
        return [c.name, c.state, c.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) =>
        a.state === b.state
          ? a.name.localeCompare(b.name)
          : a.state.localeCompare(b.state),
      );
  }, [cities, query, activeState]);

  /** State → cities, preserving filtered order, skipping empty states. */
  const byState = useMemo(() => {
    const map = new Map<string, City[]>();
    for (const c of filtered) {
      const list = map.get(c.state) ?? [];
      list.push(c);
      map.set(c.state, list);
    }
    return [...map.entries()];
  }, [filtered]);

  /** All states present in the data, for the quick-nav chips. */
  const allStates = useMemo(
    () => [...new Set(cities.map((c) => c.state))].sort(),
    [cities],
  );

  return (
    <div>
      <div className="relative mt-10">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Where do you want to go?"
          aria-label="Search city guides"
          className="w-full border-b border-ink/20 bg-transparent py-3 pl-11 pr-4 text-lg text-ink placeholder:text-ink/40 focus:border-clay focus:outline-none"
        />
      </div>

      {query.trim() && (
        <p className="mt-3 text-sm text-ink/55">
          {filtered.length === 0
            ? "No guides match that search."
            : `${filtered.length} of ${cities.length} city guide${cities.length === 1 ? "" : "s"}`}
        </p>
      )}

      {/* State quick-nav */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveState(null)}
          className={`rounded-sm px-3.5 py-1.5 text-sm font-medium transition-colors ${
            activeState === null
              ? "bg-ink text-cream"
              : "border border-ink/20 bg-transparent text-ink/70 hover:border-ink hover:text-ink"
          }`}
        >
          All states · {cities.length}
        </button>
        {allStates.map((state) => {
          const count = cities.filter((c) => c.state === state).length;
          const active = activeState === state;
          return (
            <button
              key={state}
              type="button"
              onClick={() => setActiveState(active ? null : state)}
              className={`rounded-sm px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-ink text-cream"
                  : "border border-ink/20 bg-transparent text-ink/70 hover:border-ink hover:text-ink"
              }`}
            >
              {state} · {count}
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-12 space-y-14">
          {byState.map(([state, stateCities]) => (
            <section key={state} aria-labelledby={`state-${state.replace(/\s+/g, "-")}`}>
              <div className="flex items-baseline gap-4 border-b border-ink/15 pb-3">
                <h2
                  id={`state-${state.replace(/\s+/g, "-")}`}
                  className="font-display text-3xl text-ink"
                >
                  {state}
                </h2>
                <span className="text-sm text-ink/50">
                  {stateCities.length} guide{stateCities.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {stateCities.map((city) => (
                  <a
                    key={city.id}
                    href={`/city-guide/${encodeURIComponent(city.name)}`}
                    className="group overflow-hidden rounded-md border border-ink/10 bg-paper transition hover:border-ink/25"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-sand">
                      {city.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={city.cover_image_url}
                          alt={`${city.name} cityscape`}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-moss to-olive text-3xl">
                          🏙️
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                        {city.state}
                      </p>
                      <h3 className="mt-1.5 font-display text-xl text-ink group-hover:text-clay">
                        {city.name}
                      </h3>
                      {city.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">
                          {city.description}
                        </p>
                      )}
                      <span className="link-arrow mt-3">
                        Explore
                        <span className="link-arrow-icon">→</span>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-12 border border-ink/10 bg-paper p-12 text-center">
          <p className="font-display text-2xl text-ink">
            No city guide matches <span className="text-clay">“{query.trim()}”</span>
            {activeState ? ` in ${activeState}` : ""} yet.
          </p>
          <p className="mt-2 text-sm text-ink/55">
            Guides are available for {cities.length} Indian cities across{" "}
            {allStates.length} states — try a city name or state.
          </p>
        </div>
      )}
    </div>
  );
}

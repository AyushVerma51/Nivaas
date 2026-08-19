"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, MapPin, Loader2 } from "lucide-react";
import {
  searchAtlas,
  type LocalSearchResult as Result,
} from "@/lib/atlas/api";
import type { Destination, Experience, State } from "@/lib/atlas";

const suggestions = [
  "Rajasthan",
  "Kerala",
  "Goa",
  "Kashmir",
  "Ladakh",
  "Meghalaya",
  "Varanasi",
  "Taj Mahal",
  "beaches",
  "wildlife",
];

export default function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);

  // Live API search (debounced) with graceful mock fallback.
  useEffect(() => {
    const query = q.trim();
    const run = seq.current + 1;
    seq.current = run;
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const found = await searchAtlas(query);
      if (seq.current === run) {
        setResults(found);
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="w-full">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40"
        />
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search India..."
          aria-label="Search destinations, states and experiences"
          className="w-full rounded-md border border-ink/15 bg-paper py-4 pl-12 pr-4 text-lg text-ink placeholder:text-ink/35 focus:border-clay focus:outline-none"
        />
      </div>

      {!q ? (
        <div className="mt-6">
          <p className="eyebrow">Try</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQ(s)}
                className="rounded-full border border-ink/15 bg-paper px-4 py-1.5 text-sm text-ink/70 transition-colors hover:border-clay hover:text-clay"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <p className="mt-8 flex items-center justify-center gap-2 text-ink-muted">
          <Loader2 size={16} className="animate-spin" />
          Searching the atlas…
        </p>
      ) : results.length === 0 ? (
        <p className="mt-8 text-center text-ink-muted">
          Nothing found for “{q}”. Try a state, city or experience.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 rounded-md border border-ink/10 bg-paper">
          {results.map((r) => {
            const href =
              r.kind === "destination"
                ? `/atlas/destinations/${r.data.slug}`
                : r.kind === "state"
                  ? `/atlas/states/${r.data.slug}`
                  : `/atlas/experiences/${r.data.slug}`;
            const meta =
              r.kind === "destination"
                ? `${r.data.state} · ${r.data.category}`
                : r.kind === "state"
                  ? `${r.data.region}`
                  : "Experience";
            return (
              <li key={`${r.kind}-${r.data.slug}`}>
                <Link
                  href={href}
                  className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-canvas"
                >
                  <span className="flex items-center gap-3">
                    <MapPin size={16} className="shrink-0 text-clay" />
                    <span>
                      <span className="block font-display text-lg text-ink">
                        {r.data.name}
                      </span>
                      <span className="block text-xs uppercase tracking-wider text-ink-muted">
                        {meta}
                      </span>
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-ink/30 transition-transform group-hover:translate-x-1 group-hover:text-clay"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

    </div>
  );
}

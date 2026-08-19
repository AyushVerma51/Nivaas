"use client";

import { useState } from "react";
import { regions } from "@/lib/atlas";

export default function RegionFilter() {
  const [selected, setSelected] = useState<string | null>(null);

  function scrollTo(region: string) {
    setSelected(region);
    document
      .getElementById(`region-${region.toLowerCase()}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mt-8">
      <p className="eyebrow">Filter by region</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            selected === null
              ? "bg-ink text-cream"
              : "border border-ink/15 text-ink/70 hover:border-ink hover:text-ink"
          }`}
        >
          All regions
        </button>
        {regions.map((r) => (
          <button
            key={r.name}
            type="button"
            onClick={() => scrollTo(r.name)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              selected === r.name
                ? "bg-ink text-cream"
                : "border border-ink/15 text-ink/70 hover:border-ink hover:text-ink"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>
    </div>
  );
}

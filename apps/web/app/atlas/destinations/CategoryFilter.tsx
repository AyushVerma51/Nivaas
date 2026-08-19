"use client";

import { useRouter } from "next/navigation";
import { categories } from "@/lib/atlas";

export default function CategoryFilter({ active }: { active: string | null }) {
  const router = useRouter();

  function pick(cat: string | null) {
    router.push(
      cat
        ? `/atlas/destinations?category=${cat.toLowerCase()}`
        : "/atlas/destinations",
    );
  }

  return (
    <div className="mt-8">
      <p className="eyebrow">Filter by category</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => pick(null)}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            active === null
              ? "bg-ink text-cream"
              : "border border-ink/15 text-ink/70 hover:border-ink hover:text-ink"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => pick(c)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active === c
                ? "bg-ink text-cream"
                : "border border-ink/15 text-ink/70 hover:border-ink hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

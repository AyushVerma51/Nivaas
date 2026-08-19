"use client";

import { MapPinCheck } from "lucide-react";
import { useJourney } from "@/lib/atlas/useJourney";

export default function VisitedButton({ slug }: { slug: string }) {
  const { visited, toggleVisited } = useJourney();
  const done = visited.includes(slug);

  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={done ? `Mark ${slug} as not visited` : `Mark ${slug} as visited`}
      onClick={() => toggleVisited(slug)}
      className={`inline-flex items-center gap-2 rounded-sm border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
        done
          ? "border-moss bg-moss text-cream"
          : "border-ink/30 bg-transparent text-ink hover:border-moss hover:text-moss"
      }`}
    >
      <MapPinCheck size={15} />
      {done ? "Visited" : "Been here"}
    </button>
  );
}

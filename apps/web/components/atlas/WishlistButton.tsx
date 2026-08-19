"use client";

import { Heart } from "lucide-react";
import { useJourney } from "@/lib/atlas/useJourney";

export default function WishlistButton({
  slug,
  label = "Save",
  className = "",
}: {
  slug: string;
  label?: string;
  className?: string;
}) {
  const { wishlist, toggleWishlist } = useJourney();
  const saved = wishlist.includes(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${slug} from journey` : `Add ${slug} to journey`}
      onClick={() => toggleWishlist(slug)}
      className={`inline-flex items-center gap-2 rounded-sm border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
        saved
          ? "border-clay bg-clay text-cream"
          : "border-ink/30 bg-transparent text-ink hover:border-clay hover:text-clay"
      } ${className}`}
    >
      <Heart size={15} fill={saved ? "currentColor" : "none"} />
      {saved ? "Saved" : label}
    </button>
  );
}

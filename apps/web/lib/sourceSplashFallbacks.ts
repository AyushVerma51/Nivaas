import { getImageFallback } from "@/lib/image-fallbacks";

/** Stable image fallbacks for the homepage when the API or database is offline. */
export const FALLBACK_IMAGES: Record<string, string> = Object.fromEntries(
  [
    "Jaipur", "Kochi", "Shimla", "Panaji", "Madurai", "Srinagar",
    "Bhopal", "Dehradun", "Mumbai", "Delhi", "Bengaluru", "Agra",
    "Rishikesh", "Mysuru",
  ].map((city) => [city, getImageFallback(city, 1600)]),
);

/**
 * Centralized image configuration for Atlas India.
 *
 * Uses locally bundled photos for Atlas cards and hero art.
 */
import { getImageFallback } from "@/lib/image-fallbacks";

/** Stable destination or category image. */
export function ss(query: string, w = 1600): string {
  return getImageFallback(query, w);
}

/** Local photo helper for curated Atlas journey images. */
export function img(id: string, _w = 1600): string {
  const filename = id.startsWith("photo-") ? id : `photo-${id}`;
  return `/images/places/${filename}.jpg`;
}

/** Hero fallback — Indian palace architecture. */
export const HERO_FALLBACK = ss("India landscape mountains");

/**
 * Centralized image configuration for Atlas India.
 *
 * Uses SourceSplash for dynamic, no-API-key images.
 * SourceSplash: https://www.sourcesplash.com/i/random?q=QUERY&w=WIDTH
 */
const SS_BASE = "https://www.sourcesplash.com/i/random";

/** SourceSplash image — no API key needed, hotlink-ready. */
export function ss(query: string, w = 1600): string {
  return `${SS_BASE}?q=${encodeURIComponent(query)}&w=${w}`;
}

/** Legacy Unsplash helper — kept for backward compatibility. */
export function img(id: string, w = 1600): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

/** Hero fallback — SourceSplash India landscape */
export const HERO_FALLBACK = ss("India landscape mountains");

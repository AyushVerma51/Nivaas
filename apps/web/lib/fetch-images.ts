import { API_URL } from "./api-client";

export interface ImageResult {
  url: string;
  photographer: string | null;
  photographer_url: string | null;
  pexels_url: string | null;
  source: "pexels" | "fallback" | "cache";
}

export interface ImageQuery {
  title: string;
  category?: string;
  city?: string;
  state?: string;
  region?: string;
}

/**
 * Batch-fetch images from the Express API.
 * Used in server components to pre-load images for all cards on a page.
 */
export async function fetchImagesForCards(
  queries: ImageQuery[],
): Promise<Map<string, ImageResult>> {
  const results = new Map<string, ImageResult>();

  // Deduplicate
  const unique = queries.filter(
    (q, i, arr) => arr.findIndex((x) => x.title === q.title) === i,
  );

  if (unique.length === 0) return results;

  try {
    const res = await fetch(`${API_URL}/images/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cards: unique }),
      cache: "no-store",
    });

    if (!res.ok) return results;

    const data = await res.json();
    if (data.images) {
      for (const [title, result] of Object.entries(data.images)) {
        results.set(title, result as ImageResult);
      }
    }
  } catch {
    // API unavailable — components will use their own fallbacks
  }

  return results;
}

/**
 * Get a single image. Used when you need just one.
 */
export async function fetchImage(query: ImageQuery): Promise<ImageResult | null> {
  try {
    const params = new URLSearchParams({ title: query.title });
    if (query.category) params.set("category", query.category);
    if (query.city) params.set("city", query.city);
    if (query.state) params.set("state", query.state);
    if (query.region) params.set("region", query.region);

    const res = await fetch(`${API_URL}/images/search?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

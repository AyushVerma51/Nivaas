import { pool } from "../../db/pool";

/* ------------------------------------------------------------------ */
/*  Query builder — generates smart search strings per category        */
/* ------------------------------------------------------------------ */

interface ImageQueryOptions {
  title: string;
  category?: "destination" | "city" | "food" | "landmark" | "temple" | "beach" | "spot" | "dish";
  city?: string;
  state?: string;
  region?: string;
}

/** Normalize a query string for consistent caching. */
function normalizeQuery(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

/** Build a smart SourceSplash search query from card metadata. */
export function buildImageQuery(opts: ImageQueryOptions): string {
  const { title, category, city, state, region } = opts;

  // Food queries
  if (category === "food" || category === "dish") {
    const regionPart = city || region || state || "";
    if (regionPart) return normalizeQuery(`${title} ${regionPart} Indian food`);
    return normalizeQuery(`${title} Indian food`);
  }

  // Landmark / temple / beach — add visual keywords
  if (category === "landmark") {
    const location = [city, state, "India"].filter(Boolean).join(" ");
    return normalizeQuery(`${title} ${location} historical palace temple`);
  }
  if (category === "temple") {
    const location = [city, state, "India"].filter(Boolean).join(" ");
    return normalizeQuery(`${title} ${location} temple architecture`);
  }
  if (category === "beach") {
    const location = [city, state, "India"].filter(Boolean).join(" ");
    return normalizeQuery(`${title} ${location} beach coastline`);
  }

  // Destination / city — add context keywords
  if (category === "destination" || category === "city") {
    const location = [state || city, "India"].filter(Boolean).join(" ");
    // Add category-specific keywords if available
    const categoryKeywords: Record<string, string> = {
      heritage: "historical palace",
      mountains: "mountains hills",
      adventure: "adventure mountains",
      spiritual: "temple spiritual",
      culture: "city culture",
      nature: "nature forest",
      wildlife: "wildlife national park",
      desert: "desert dunes",
    };
    const keyword = category ? categoryKeywords[category.toLowerCase()] : undefined;
    if (keyword) return normalizeQuery(`${title} ${location} ${keyword}`);
    return normalizeQuery(`${title} ${location}`);
  }

  // Tourist spot — append category hint
  if (category === "spot") {
    const location = [city, state, "India"].filter(Boolean).join(" ");
    return normalizeQuery(`${title} ${location}`);
  }

  // Generic fallback
  const location = [city, state, region, "India"].filter(Boolean).join(" ");
  return normalizeQuery(`${title} ${location}`);
}

/* ------------------------------------------------------------------ */
/*  Cache layer — PostgreSQL image_cache table                         */
/* ------------------------------------------------------------------ */

interface CachedImage {
  image_url: string;
  photographer: string | null;
  photographer_url: string | null;
  pexels_url: string | null;
}

async function getCached(normalizedQuery: string): Promise<CachedImage | null> {
  try {
    const { rows } = await pool.query<CachedImage>(
      "SELECT image_url, photographer, photographer_url, pexels_url FROM image_cache WHERE query = $1",
      [normalizedQuery],
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

async function setCached(
  normalizedQuery: string,
  image: CachedImage,
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO image_cache (query, image_url, photographer, photographer_url, pexels_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (query) DO UPDATE SET
         image_url = EXCLUDED.image_url,
         photographer = EXCLUDED.photographer,
         photographer_url = EXCLUDED.photographer_url,
         pexels_url = EXCLUDED.pexels_url,
         created_at = NOW()`,
      [normalizedQuery, image.image_url, image.photographer, image.photographer_url, image.pexels_url],
    );
  } catch {
    // Silently fail — cache is best-effort
  }
}

/* ------------------------------------------------------------------ */
/*  SourceSplash — no API key, anonymous hotlinks                      */
/* ------------------------------------------------------------------ */

const SOURCE_SPLASH_BASE = "https://www.sourcesplash.com/i/random";

function buildSourceSplashUrl(query: string, width = 800): string {
  return `${SOURCE_SPLASH_BASE}?q=${encodeURIComponent(query)}&w=${width}`;
}

/* ------------------------------------------------------------------ */
/*  Fallback images — verified Unsplash for common Indian locations     */
/* ------------------------------------------------------------------ */

const FALLBACK_IMAGES: Record<string, string> = {
  "jaipur": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
  "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
  "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
  "bengaluru": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
  "kochi": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
  "varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  "goa": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
  "rajasthan": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
  "agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  "srinagar": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80",
  "rishikesh": "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=800&q=80",
  "madurai": "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80",
  "shimla": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80",
  "mysuru": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
  "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  "dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
  "samosa": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  "tandoori": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
  "chai": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=800&q=80",
  "temple": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80",
  "beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "mountain": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
  "fort": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
  "palace": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
  "lake": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80",
  "waterfall": "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=800&q=80",
  "fallback": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
};

function getFallback(title: string): string {
  const lower = title.toLowerCase();
  if (FALLBACK_IMAGES[lower]) return FALLBACK_IMAGES[lower];
  for (const [key, url] of Object.entries(FALLBACK_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return FALLBACK_IMAGES["fallback"];
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export interface ImageResult {
  url: string;
  photographer: string | null;
  photographer_url: string | null;
  pexels_url: string | null;
  source: "sourcesplash" | "fallback" | "cache";
}

/**
 * Get an image for a card. Tries: cache → SourceSplash → fallback.
 * SourceSplash requires no API key — anonymous hotlinks are free.
 */
export async function getImageForCard(opts: ImageQueryOptions): Promise<ImageResult> {
  const query = buildImageQuery(opts);

  // 1. Check cache
  const cached = await getCached(query);
  if (cached) {
    return {
      url: cached.image_url,
      photographer: cached.photographer,
      photographer_url: cached.photographer_url,
      pexels_url: cached.pexels_url,
      source: "cache",
    };
  }

  // 2. Try SourceSplash (no API key needed)
  const sourceSplashUrl = buildSourceSplashUrl(query);

  // Verify SourceSplash returns a valid image
  try {
    const res = await fetch(sourceSplashUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok && res.headers.get("content-type")?.startsWith("image/")) {
      const result: ImageResult = {
        url: sourceSplashUrl,
        photographer: null,
        photographer_url: null,
        pexels_url: null,
        source: "sourcesplash",
      };
      // Cache it
      await setCached(query, {
        image_url: result.url,
        photographer: null,
        photographer_url: null,
        pexels_url: null,
      });
      return result;
    }
  } catch {
    // SourceSplash unavailable — fall through to fallback
  }

  // 3. Fallback
  return {
    url: getFallback(opts.title),
    photographer: null,
    photographer_url: null,
    pexels_url: null,
    source: "fallback",
  };
}

/**
 * Bulk-fetch images for multiple cards. Returns a map of title → ImageResult.
 * Deduplicates queries and caches results.
 */
export async function getImagesForCards(
  cards: ImageQueryOptions[],
): Promise<Map<string, ImageResult>> {
  const results = new Map<string, ImageResult>();

  // Deduplicate by normalized query
  const uniqueQueries = new Map<string, ImageQueryOptions>();
  for (const card of cards) {
    const query = buildImageQuery(card);
    if (!uniqueQueries.has(query)) {
      uniqueQueries.set(query, card);
    }
  }

  // Fetch in parallel (batches of 5)
  const entries = [...uniqueQueries.entries()];
  for (let i = 0; i < entries.length; i += 5) {
    const batch = entries.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(async ([query, card]) => {
        const result = await getImageForCard(card);
        return { query, card, result };
      }),
    );
    for (const { card, result } of batchResults) {
      results.set(card.title, result);
    }
  }

  return results;
}

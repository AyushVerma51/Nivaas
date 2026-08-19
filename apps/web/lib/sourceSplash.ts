/**
 * SourceSplash Image URL Utility
 *
 * Generates dynamic image URLs from SourceSplash based on card content.
 * No API key required — anonymous hotlinks are free forever.
 *
 * API: https://www.sourcesplash.com/i/random?q=QUERY&w=WIDTH
 */

const BASE_URL = "https://www.sourcesplash.com/i/random";

/** Sanitize a query string for URL encoding. */
function sanitize(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .replace(/[^a-zA-Z0-9\s,.-]/g, "") // remove special chars
    .replace(/\s+/g, " ") // normalize spaces
    .trim();
}

/** Category-specific visual keywords for better image results. */
const CATEGORY_KEYWORDS: Record<string, string> = {
  beach: "beach coastline",
  beaches: "beach coastline ocean",
  mountain: "mountains hills",
  mountains: "mountains hills snow",
  heritage: "historical palace temple",
  spiritual: "temple spiritual prayer",
  culture: "culture city street",
  food: "food cuisine",
  wildlife: "wildlife national park animals",
  adventure: "adventure mountains river",
  nature: "nature forest green",
  desert: "desert dunes sand",
  temple: "temple architecture",
  lake: "lake water scenic",
};

interface ImageOptions {
  title: string;
  state?: string;
  category?: string;
  region?: string;
  width?: number;
}

/**
 * Generate a SourceSplash image URL for a destination/feature card.
 *
 * Examples:
 *   getSourceSplashImage({ title: "Goa", category: "Beaches" })
 *   → "https://www.sourcesplash.com/i/random?q=Goa%20India%20beach%20coastline&w=800"
 *
 *   getSourceSplashImage({ title: "Jaipur", state: "Rajasthan", category: "Heritage" })
 *   → "https://www.sourcesplash.com/i/random?q=Jaipur%20Rajasthan%20India%20historical%20palace%20temple&w=800"
 */
export function getSourceSplashImage(options: ImageOptions): string {
  const { title, state, category, region, width = 800 } = options;

  const parts: string[] = [];

  // 1. Specific destination/title
  const cleanTitle = sanitize(title);
  if (cleanTitle) parts.push(cleanTitle);

  // 2. State/region for context
  const cleanState = sanitize(state || region);
  if (cleanState && cleanState.toLowerCase() !== cleanTitle.toLowerCase()) {
    parts.push(cleanState);
  }

  // 3. Always add India for relevance
  if (!parts.some((p) => p.toLowerCase() === "india")) {
    parts.push("India");
  }

  // 4. Category-specific visual keyword
  const cleanCategory = sanitize(category);
  if (cleanCategory) {
    const lower = cleanCategory.toLowerCase();
    const keyword = CATEGORY_KEYWORDS[lower];
    if (keyword) {
      parts.push(keyword);
    } else {
      parts.push(lower);
    }
  }

  const query = parts.join(" ");
  const encoded = encodeURIComponent(query);

  return `${BASE_URL}?q=${encoded}&w=${width}`;
}

/**
 * Generate a SourceSplash URL for a food item.
 *
 * Examples:
 *   getSourceSplashFoodImage({ title: "Biryani", city: "Hyderabad" })
 *   → "https://www.sourcesplash.com/i/random?q=Biryani%20Hyderabad%20Indian%20food&w=800"
 */
export function getSourceSplashFoodImage(options: {
  title: string;
  city?: string;
  state?: string;
  width?: number;
}): string {
  const { title, city, state, width = 800 } = options;

  const parts: string[] = [];

  const cleanTitle = sanitize(title);
  if (cleanTitle) parts.push(cleanTitle);

  const cleanCity = sanitize(city);
  if (cleanCity) parts.push(cleanCity);

  const cleanState = sanitize(state);
  if (cleanState && cleanState.toLowerCase() !== cleanCity?.toLowerCase()) {
    parts.push(cleanState);
  }

  // Always add "Indian food" for food queries
  parts.push("Indian food");

  const query = parts.join(" ");
  const encoded = encodeURIComponent(query);

  return `${BASE_URL}?q=${encoded}&w=${width}`;
}

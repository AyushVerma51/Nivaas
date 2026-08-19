"use client";

import { useState, useEffect } from "react";
import { API_URL } from "./api-client";

export interface DynamicImageResult {
  url: string;
  photographer: string | null;
  photographer_url: string | null;
  pexels_url: string | null;
  source: "pexels" | "fallback" | "cache";
}

interface UseDynamicImageOptions {
  title: string;
  category?: string;
  city?: string;
  state?: string;
  region?: string;
  /** If true, skip the API call (e.g., when image_url already exists). */
  enabled?: boolean;
}

/** Cache in memory to avoid duplicate fetches within the same page. */
const imageCache = new Map<string, DynamicImageResult>();

export function useDynamicImage(options: UseDynamicImageOptions) {
  const { title, category, city, state, region, enabled = true } = options;
  const [image, setImage] = useState<DynamicImageResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !title) return;

    // Check in-memory cache first
    const cacheKey = `${title}|${category || ""}|${city || ""}|${state || ""}|${region || ""}`;
    if (imageCache.has(cacheKey)) {
      setImage(imageCache.get(cacheKey)!);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({ title });
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (state) params.set("state", state);
    if (region) params.set("region", region);

    fetch(`${API_URL}/images/search?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Image search failed");
        return res.json();
      })
      .then((data: DynamicImageResult) => {
        if (cancelled) return;
        imageCache.set(cacheKey, data);
        setImage(data);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [title, category, city, state, region, enabled]);

  return { image, loading };
}

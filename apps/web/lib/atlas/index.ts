export * from "./types";
export * from "./images";
export * from "./states";
export * from "./destinations";
export * from "./experiences";
export * from "./journeys";

import { destinations } from "./destinations";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Resolve the destination slug a search query maps to (or null). */
export function findDestination(query: string) {
  const q = slugify(query);
  return (
    destinations.find((d) => d.slug === q || d.name.toLowerCase().includes(q)) ??
    null
  );
}

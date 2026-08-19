export type Region =
  | "North"
  | "South"
  | "East"
  | "West"
  | "Central"
  | "Northeast"
  | "Himalayan"
  | "Islands";

export interface State {
  id: string; // ISO-3166-2 code, matches the SVG map path ids (e.g. "INRJ")
  name: string;
  slug: string;
  kind: "State" | "Union Territory";
  region: Region;
  tagline: string;
  description: string;
  heroImage: string;
  destinations: string[]; // destination slugs
  experiences: string[]; // experience slugs
  bestTime: string;
}

export interface Destination {
  slug: string;
  name: string;
  state: string; // state name
  stateSlug: string;
  category: string;
  tagline: string;
  description: string;
  heroImage: string;
  bestTime: string;
  highlights: string[];
  nearby: string[]; // destination slugs
}

export interface Experience {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  destinations: string[]; // destination slugs
}

export interface Journey {
  slug: string;
  name: string;
  days: number;
  theme: string[];
  tagline: string;
  description: string;
  heroImage: string;
  stops: string[]; // destination slugs
}

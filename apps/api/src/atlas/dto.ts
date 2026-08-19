/**
 * DTOs — the public shape of API responses. Keeps DB models out of the wire
 * format and lets list endpoints stay slim while details go deep.
 */

export interface StateListDTO {
  id: string;
  name: string;
  slug: string;
  type: "STATE" | "UNION_TERRITORY";
  region: string;
  shortDescription: string;
  heroImage: string | null;
  destinationCount: number;
}

export interface StateDetailDTO extends Omit<StateListDTO, "destinationCount"> {
  capital: string | null;
  description: string;
  latitude: number | null;
  longitude: number | null;
  bestTimeToVisit: string | null;
  featured: boolean;
  cityCount: number;
  destinationCount: number;
  experienceCount: number;
}

export interface CityDTO {
  id: string;
  name: string;
  slug: string;
  stateSlug: string;
  stateName: string;
  shortDescription: string;
  latitude: number | null;
  longitude: number | null;
  destinationCount: number;
}

export interface DestinationListDTO {
  id: string;
  name: string;
  slug: string;
  category: string;
  stateSlug: string;
  stateName: string;
  shortDescription: string;
  heroImage: string | null;
  latitude: number | null;
  longitude: number | null;
  popularityScore: number;
  featured: boolean;
  experienceSlugs: string[];
}

export interface DestinationDetailDTO extends DestinationListDTO {
  description: string;
  city: { name: string; slug: string } | null;
  bestTimeToVisit: string | null;
  attractions: { id: string; name: string; description: string; image: string | null }[];
  experiences: { name: string; slug: string }[];
  nearby: { slug: string; name: string; distanceKm: number }[];
  reviewStats: { count: number; average: number };
}

export interface ExperienceDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  image: string | null;
  destinationCount: number;
}

export interface JourneyDTO {
  id: string;
  slug: string;
  title: string;
  days: number;
  theme: string[];
  tagline: string;
  description: string;
  heroImage: string | null;
  stops: string[];
}

export interface MapStateDTO {
  slug: string;
  name: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  destinationCount: number;
  heroImage: string | null;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: "USER" | "EDITOR" | "ADMIN";
  avatar: string | null;
  createdAt: string;
}

export interface ReviewDTO {
  id: string;
  destinationSlug: string;
  destinationName: string;
  authorName: string;
  rating: number;
  title: string | null;
  content: string;
  createdAt: string;
}

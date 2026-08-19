/**
 * Shared TypeScript types for the Real Estate Platform.
 * Consumed by both apps/web and apps/api. This is the single source of
 * truth for entity shapes; the SQL schema in apps/api/src/db/migrations
 * mirrors these (plus PostGIS/geometry columns).
 */

export type UserRole = "buyer" | "owner" | "agent" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

/** Shape returned by the API; never includes the password hash. */
export interface PublicUser extends User {}

export type ListingType = "sale" | "rent";
export type PropertyType = "apartment" | "house" | "plot" | "villa" | "commercial";
export type PropertyStatus = "active" | "sold" | "rented" | "inactive";
/** Mirrors the price-prediction model's POSTED_BY feature (owner/dealer/builder). */
export type PostedBy = "owner" | "dealer" | "builder";
export type Furnishing = "unfurnished" | "semi-furnished" | "furnished";

export interface GeoPoint {
  /** WGS84 longitude */
  lng: number;
  /** WGS84 latitude */
  lat: number;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_cover: boolean;
  sort_order: number;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  listing_type: ListingType;
  property_type: PropertyType;
  price: number;
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  floor: number | null;
  furnishing: Furnishing | null;
  address: string | null;
  city: string;
  locality: string;
  pincode: string | null;
  location: GeoPoint;
  status: PropertyStatus;
  posted_by: PostedBy;
  under_construction: boolean;
  rera_approved: boolean;
  ready_to_move: boolean;
  is_resale: boolean;
  /** Predicted fair price in INR Lacs (archived — was from the ML service). */
  predicted_price_lacs: number | null;
  predicted_price_confidence: number | null;
  created_at: string;
  updated_at: string;
  /** Joined in list/detail responses when requested. */
  images?: PropertyImage[];
  /** Joined in detail responses. */
  owner?: PublicUser;
}

export interface PropertyFilters {
  city?: string;
  locality?: string;
  listing_type?: ListingType;
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
  min_area_sqft?: number;
  max_area_sqft?: number;
  bedrooms?: number;
  page?: number;
  page_size?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export type AmenityCategory =
  | "school"
  | "college"
  | "hospital"
  | "mall"
  | "park"
  | "metro"
  | "railway"
  | "airport";

/** Per-category aggregation for the neighborhood intelligence page (spec 5.3). */
export interface AmenityGroup {
  category: AmenityCategory;
  count: number;
  nearest_km: number | null;
  /** Up to 5 names, nearest first. */
  names: string[];
}

export interface NeighborhoodSummary {
  city: string;
  locality: string;
  property_count: number;
  /** ₹ per sq.ft, averaged over active listings in the locality. */
  avg_price_per_sqft: number;
  amenities: AmenityGroup[];
}

export interface Amenity {
  id: string;
  city: string;
  locality: string;
  category: AmenityCategory;
  name: string;
  location: GeoPoint;
  rating: number | null;
  /** Distance in km from the query point (present on /amenities responses). */
  distance_km?: number;
  source: "osm" | "google" | "manual";
}

export interface City {
  id: string;
  name: string;
  state: string;
  description: string | null;
  cover_image_url: string | null;
}

export interface TouristSpot {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: "historical" | "nature" | "religious" | "adventure";
}

export interface LocalDish {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  where_to_try: string | null;
}

/** A city within ~150 km, with a preview of its tourist spots (spec 5.4). */
export interface NearbyCity {
  city: City;
  distance_km: number;
  tourist_spots: TouristSpot[];
}

/** Full payload for /city-guide/:city — spots, dishes, and nearby cities. */
export interface CityGuide {
  city: City;
  tourist_spots: TouristSpot[];
  local_dishes: LocalDish[];
  nearby_cities: NearbyCity[];
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export type InquiryStatus = "new" | "contacted" | "closed";

export interface Inquiry {
  id: string;
  property_id: string;
  buyer_id: string;
  message: string | null;
  contact_phone: string | null;
  status: InquiryStatus;
  created_at: string;
}

/**
 * Price-prediction types — ARCHIVED with the ML service.
 * Kept for backward compatibility; the service is now in archive/ml-service/.
 */
export interface PricePredictionRequest {
  posted_by: PostedBy;
  under_construction: boolean;
  rera_approved: boolean;
  bhk_no: number;
  unit_type: "bhk" | "rk";
  square_ft: number;
  ready_to_move: boolean;
  is_resale: boolean;
  latitude: number;
  longitude: number;
}

export interface PricePrediction {
  predicted_price_lacs: number;
  confidence_range: { low_lacs: number; high_lacs: number } | null;
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: PublicUser;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

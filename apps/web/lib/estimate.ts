import type { GeoPoint, PostedBy } from "@rep/types";
import { api } from "@/lib/api-client";

export interface EstimateInput {
  posted_by: PostedBy;
  under_construction: boolean;
  rera_approved: boolean;
  bedrooms: number;
  unit_type: "bhk" | "rk";
  area_sqft: number;
  ready_to_move: boolean;
  is_resale: boolean;
  location: GeoPoint;
  asking_price?: number;
}

export interface EstimateResult {
  predicted_price_lacs: number;
  predicted_price_inr: number;
  confidence_range: { low_lacs: number; high_lacs: number } | null;
  deal_verdict?: "great_deal" | "fair" | "overpriced";
}

export async function fetchEstimate(input: EstimateInput): Promise<EstimateResult> {
  return api.post<EstimateResult>(
    "/price-prediction/estimate",
    {
      posted_by: input.posted_by,
      under_construction: input.under_construction,
      rera_approved: input.rera_approved,
      bhk_no: input.bedrooms,
      unit_type: input.unit_type,
      square_ft: input.area_sqft,
      ready_to_move: input.ready_to_move,
      is_resale: input.is_resale,
      latitude: input.location.lat,
      longitude: input.location.lng,
      ...(input.asking_price !== undefined ? { asking_price: input.asking_price } : {}),
    },
  );
}

export function formatInr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function lacsToInr(lacs: number): number {
  return lacs * 100_000;
}

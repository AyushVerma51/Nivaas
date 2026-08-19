import { Router } from "express";
import { z } from "zod";
import { config } from "../../config";
import { AppError, asyncHandler } from "../../lib/errors";
import { validate } from "../../lib/validate";

const router = Router();

/**
 * Clean request contract for the ML service.
 * POSTED_BY values are platform strings (owner/dealer/builder);
 * the ml-service encodes them with {Owner: 1, Dealer: 2, Builder: 3}.
 */
const estimateSchema = z.object({
  posted_by: z.enum(["owner", "dealer", "builder"]),
  under_construction: z.boolean(),
  rera_approved: z.boolean(),
  bhk_no: z.number().int().min(0).max(20),
  unit_type: z.enum(["bhk", "rk"]),
  square_ft: z.number().positive(),
  ready_to_move: z.boolean(),
  is_resale: z.boolean(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  /** Optional asking price in INR — used to compute a deal verdict. */
  asking_price: z.number().nonnegative().optional(),
});

interface PredictResponse {
  predicted_price_lacs: number;
  confidence_range: { low_lacs: number; high_lacs: number } | null;
}

async function callMlService(body: unknown): Promise<PredictResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    const res = await fetch(`${config.ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new AppError(
        502,
        "ML_SERVICE_ERROR",
        `ML service returned ${res.status}`,
      );
    }
    return (await res.json()) as PredictResponse;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      503,
      "ML_SERVICE_UNAVAILABLE",
      "Price prediction is temporarily unavailable",
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Compares asking price (INR) with the model's estimate (Lacs). */
function dealVerdict(askingPriceInr: number, predictedLacs: number) {
  const askingLacs = askingPriceInr / 100_000;
  const diff = (askingLacs - predictedLacs) / predictedLacs;
  if (diff <= -0.1) return "great_deal";
  if (diff >= 0.1) return "overpriced";
  return "fair";
}

router.post(
  "/estimate",
  validate(estimateSchema),
  asyncHandler(async (req, res) => {
    const prediction = await callMlService(req.body);
    res.json({
      ...prediction,
      predicted_price_inr: prediction.predicted_price_lacs * 100_000,
      ...(req.body.asking_price !== undefined
        ? { deal_verdict: dealVerdict(req.body.asking_price, prediction.predicted_price_lacs) }
        : {}),
    });
  }),
);

export default router;

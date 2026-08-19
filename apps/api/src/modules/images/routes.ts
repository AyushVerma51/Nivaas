import { Router } from "express";
import { asyncHandler } from "../../lib/errors";
import { getImageForCard, getImagesForCards } from "./service";
import type { ImageResult } from "./service";

const router = Router();

/**
 * GET /api/images/search?title=...&category=...&city=...&state=...
 *
 * Returns a single image for a card. The Pexels API key stays server-side.
 */
router.get(
  "/images/search",
  asyncHandler(async (req, res) => {
    const title = (req.query.title as string) || "";
    if (!title.trim()) {
      res.status(400).json({ error: "title query parameter is required" });
      return;
    }

    const result = await getImageForCard({
      title: title.trim(),
      category: (req.query.category as string) as any,
      city: req.query.city as string,
      state: req.query.state as string,
      region: req.query.region as string,
    });

    res.json(result);
  }),
);

/**
 * POST /api/images/batch
 *
 * Body: { cards: Array<{ title, category?, city?, state?, region? }> }
 * Returns: { images: Record<string, ImageResult> }
 */
router.post(
  "/images/batch",
  asyncHandler(async (req, res) => {
    const cards = req.body?.cards;
    if (!Array.isArray(cards) || cards.length === 0) {
      res.status(400).json({ error: "cards array is required" });
      return;
    }

    // Limit batch size
    const limited = cards.slice(0, 50);

    const results = await getImagesForCards(limited);

    // Convert Map to plain object for JSON
    const images: Record<string, ImageResult> = {};
    for (const [title, result] of results) {
      images[title] = result;
    }

    res.json({ images });
  }),
);

export default router;

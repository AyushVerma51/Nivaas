-- 0003_city_guide_image_seed.sql
-- The seeder now upserts city-guide content (ON CONFLICT (city_id, name) DO
-- UPDATE) so re-running `db:seed` can backfill/refresh image URLs without
-- duplicating rows. Requires a unique constraint on the natural key.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tourist_spots_city_name
    ON tourist_spots (city_id, name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_local_dishes_city_name
    ON local_dishes (city_id, name);

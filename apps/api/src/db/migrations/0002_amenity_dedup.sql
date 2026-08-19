-- 0002_amenity_dedup.sql
-- Overpass can return the same POI as both a node and a way (same name, same
-- center). Back the cache-on-read upsert with a unique index so re-fetches
-- don't accumulate duplicates.
-- PostGIS 3.x dropped the ST_AsEWKB(geography) overload; cast to geometry.
CREATE UNIQUE INDEX IF NOT EXISTS idx_amenities_dedup
    ON amenities (city, locality, category, name, ST_AsEWKB(location::geometry));

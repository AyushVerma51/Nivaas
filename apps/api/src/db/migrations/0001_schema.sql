-- 0001_schema.sql — Real Estate Platform core schema
-- Requires PostGIS (postgis/postgis docker image or `CREATE EXTENSION`).

CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    phone         TEXT,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'buyer'
                  CHECK (role IN ('buyer', 'owner', 'agent', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- refresh_tokens — opaque tokens hashed at rest (sha256), rotated on use
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS properties (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title                     TEXT NOT NULL,
    description               TEXT,
    listing_type              TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent')),
    property_type             TEXT NOT NULL
                              CHECK (property_type IN ('apartment', 'house', 'plot', 'villa', 'commercial')),
    price                     NUMERIC(14, 2) NOT NULL CHECK (price >= 0),
    area_sqft                 NUMERIC(10, 2) NOT NULL CHECK (area_sqft > 0),
    bedrooms                  INT NOT NULL DEFAULT 1 CHECK (bedrooms >= 0),
    bathrooms                 INT NOT NULL DEFAULT 1 CHECK (bathrooms >= 0),
    floor                     INT,
    furnishing                TEXT CHECK (furnishing IN ('unfurnished', 'semi-furnished', 'furnished')),
    address                   TEXT,
    city                      TEXT NOT NULL,
    locality                  TEXT NOT NULL,
    pincode                   TEXT,
    location                  GEOGRAPHY(Point, 4326) NOT NULL,
    status                    TEXT NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'sold', 'rented', 'inactive')),
    -- The four fields below map 1:1 to the price-prediction model features
    -- (POSTED_BY, UNDER_CONSTRUCTION, RERA, READY_TO_MOVE, RESALE) — see spec 5.5.
    posted_by                 TEXT NOT NULL DEFAULT 'owner'
                              CHECK (posted_by IN ('owner', 'dealer', 'builder')),
    under_construction        BOOLEAN NOT NULL DEFAULT FALSE,
    rera_approved             BOOLEAN NOT NULL DEFAULT FALSE,
    ready_to_move             BOOLEAN NOT NULL DEFAULT TRUE,
    is_resale                 BOOLEAN NOT NULL DEFAULT FALSE,
    -- ML output: price in INR Lacs (the model's TARGET unit — do not compare
    -- directly with `price`, which is in rupees).
    predicted_price_lacs      NUMERIC(12, 2),
    predicted_price_confidence NUMERIC(4, 3),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_properties_city      ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_locality  ON properties(locality);
CREATE INDEX IF NOT EXISTS idx_properties_status    ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_listing   ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_price     ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_owner     ON properties(owner_id);
-- GiST index backing ST_DWithin / radius searches on the geography column.
CREATE INDEX IF NOT EXISTS idx_properties_location  ON properties USING GIST (location);

-- ---------------------------------------------------------------------------
-- property_images
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS property_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    is_cover    BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_property_images_property ON property_images(property_id);

-- ---------------------------------------------------------------------------
-- amenities — cached per locality from OSM Overpass / Google Places
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS amenities (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city     TEXT NOT NULL,
    locality TEXT NOT NULL,
    category TEXT NOT NULL
             CHECK (category IN ('school', 'college', 'hospital', 'mall', 'park',
                                 'metro', 'railway', 'airport')),
    name     TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    rating   NUMERIC(3, 1),
    source   TEXT NOT NULL DEFAULT 'osm' CHECK (source IN ('osm', 'google', 'manual'))
);

CREATE INDEX IF NOT EXISTS idx_amenities_locality ON amenities(city, locality);
CREATE INDEX IF NOT EXISTS idx_amenities_category ON amenities(category);
CREATE INDEX IF NOT EXISTS idx_amenities_location ON amenities USING GIST (location);

-- ---------------------------------------------------------------------------
-- cities + city guide content
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL UNIQUE,
    state           TEXT NOT NULL,
    description     TEXT,
    cover_image_url TEXT,
    -- Approximate city center, used for "nearby cities" (within ~150 km) logic.
    center          GEOGRAPHY(Point, 4326)
);

CREATE TABLE IF NOT EXISTS tourist_spots (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id     UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    image_url   TEXT,
    category    TEXT NOT NULL DEFAULT 'historical'
                CHECK (category IN ('historical', 'nature', 'religious', 'adventure'))
);

CREATE TABLE IF NOT EXISTS local_dishes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id      UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    description  TEXT,
    image_url    TEXT,
    where_to_try TEXT
);

-- ---------------------------------------------------------------------------
-- favorites & inquiries
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, property_id)
);

CREATE TABLE IF NOT EXISTS inquiries (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message       TEXT,
    contact_phone TEXT,
    status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer    ON inquiries(buyer_id);

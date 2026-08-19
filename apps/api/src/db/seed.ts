/**
 * Idempotent seeder — safe to run repeatedly.
 * Seeds: 3 cities + city-guide content, demo users (admin/owner/buyer),
 * and a handful of demo properties with real PostGIS coordinates.
 *
 * Usage: npm run db:seed  (run db:migrate first)
 */
import bcrypt from "bcryptjs";
import { pool } from "./pool";
import { seedCities, seedUsers } from "./seed-data";

interface DemoProperty {
  title: string;
  description: string;
  listing_type: "sale" | "rent";
  property_type: "apartment" | "house" | "plot" | "villa" | "commercial";
  price: number; // INR
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  furnishing: "unfurnished" | "semi-furnished" | "furnished";
  city: string;
  locality: string;
  pincode: string;
  lng: number;
  lat: number;
  posted_by: "owner" | "dealer" | "builder";
  under_construction: boolean;
  rera_approved: boolean;
  ready_to_move: boolean;
  is_resale: boolean;
}

const demoProperties: DemoProperty[] = [
  {
    title: "2 BHK premium apartment in Indiranagar",
    description: "South-facing 2 BHK with clubhouse access, 5 min from 100 Feet Road metro.",
    listing_type: "sale",
    property_type: "apartment",
    price: 1_85_00_000,
    area_sqft: 1240,
    bedrooms: 2,
    bathrooms: 2,
    furnishing: "semi-furnished",
    city: "Bengaluru",
    locality: "Indiranagar",
    pincode: "560038",
    lng: 77.6407,
    lat: 12.9719,
    posted_by: "owner",
    under_construction: false,
    rera_approved: true,
    ready_to_move: true,
    is_resale: true,
  },
  {
    title: "3 BHK villa in Whitefield",
    description: "Gated-community villa with private garden, near ITPL and tech parks.",
    listing_type: "sale",
    property_type: "villa",
    price: 3_40_00_000,
    area_sqft: 2350,
    bedrooms: 3,
    bathrooms: 3,
    furnishing: "unfurnished",
    city: "Bengaluru",
    locality: "Whitefield",
    pincode: "560066",
    lng: 77.7505,
    lat: 12.9698,
    posted_by: "builder",
    under_construction: true,
    rera_approved: true,
    ready_to_move: false,
    is_resale: false,
  },
  {
    title: "Compact 1 RK studio near HSR Layout",
    description: "Fully furnished studio ideal for working professionals, walking distance to Forum mall.",
    listing_type: "rent",
    property_type: "apartment",
    price: 22_000,
    area_sqft: 480,
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "furnished",
    city: "Bengaluru",
    locality: "HSR Layout",
    pincode: "560102",
    lng: 77.6415,
    lat: 12.9118,
    posted_by: "dealer",
    under_construction: false,
    rera_approved: false,
    ready_to_move: true,
    is_resale: true,
  },
  {
    title: "Sea-facing 2 BHK in Bandra West",
    description: "Rare 2 BHK overlooking the Arabian Sea, renovated interiors, near Bandstand.",
    listing_type: "sale",
    property_type: "apartment",
    price: 4_95_00_000,
    area_sqft: 1180,
    bedrooms: 2,
    bathrooms: 2,
    furnishing: "furnished",
    city: "Mumbai",
    locality: "Bandra West",
    pincode: "400050",
    lng: 72.8239,
    lat: 19.0557,
    posted_by: "owner",
    under_construction: false,
    rera_approved: true,
    ready_to_move: true,
    is_resale: true,
  },
  {
    title: "1 BHK flat near Andheri station",
    description: "Budget-friendly 1 BHK, 10 min walk to Andheri West railway station and metro.",
    listing_type: "rent",
    property_type: "apartment",
    price: 38_000,
    area_sqft: 620,
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "unfurnished",
    city: "Mumbai",
    locality: "Andheri West",
    pincode: "400058",
    lng: 72.8372,
    lat: 19.1197,
    posted_by: "dealer",
    under_construction: false,
    rera_approved: false,
    ready_to_move: true,
    is_resale: true,
  },
  {
    title: "Row house in DLF Phase 1, Gurgaon",
    description: "Sunlit 3 BHK row house with a small lawn, in a secure DLF community.",
    listing_type: "sale",
    property_type: "house",
    price: 2_65_00_000,
    area_sqft: 1800,
    bedrooms: 3,
    bathrooms: 2,
    furnishing: "semi-furnished",
    city: "Gurugram",
    locality: "DLF Phase 1",
    pincode: "122002",
    lng: 77.0991,
    lat: 28.4759,
    posted_by: "builder",
    under_construction: false,
    rera_approved: true,
    ready_to_move: true,
    is_resale: true,
  },
  {
    title: "2 BHK in Dwarka Sector 12",
    description: "Metro-connected 2 BHK in a green residential pocket of West Delhi.",
    listing_type: "sale",
    property_type: "apartment",
    price: 1_20_00_000,
    area_sqft: 1050,
    bedrooms: 2,
    bathrooms: 2,
    furnishing: "unfurnished",
    city: "Delhi",
    locality: "Dwarka",
    pincode: "110078",
    lng: 77.0237,
    lat: 28.5931,
    posted_by: "owner",
    under_construction: false,
    rera_approved: true,
    ready_to_move: true,
    is_resale: false,
  },
];

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // --- Users ---
    for (const u of seedUsers) {
      await client.query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, NULL, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [u.name, u.email, bcrypt.hashSync(u.password, 10), u.role],
      );
    }
    console.log("  ✓ users");

    // --- Cities + city guide content ---
    for (const city of seedCities) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO cities (name, state, description, cover_image_url, center)
         VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography)
         ON CONFLICT (name) DO UPDATE SET
           state = EXCLUDED.state, description = EXCLUDED.description,
           cover_image_url = EXCLUDED.cover_image_url, center = EXCLUDED.center
         RETURNING id`,
        [city.name, city.state, city.description, city.cover_image_url, city.center[0], city.center[1]],
      );
      const cityId = rows[0]!.id;

      for (const spot of city.touristSpots) {
        await client.query(
          `INSERT INTO tourist_spots (city_id, name, description, category, image_url)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (city_id, name) DO UPDATE SET
             description = EXCLUDED.description, category = EXCLUDED.category,
             image_url = EXCLUDED.image_url`,
          [cityId, spot.name, spot.description, spot.category, spot.image_url],
        );
      }
      for (const dish of city.dishes) {
        await client.query(
          `INSERT INTO local_dishes (city_id, name, description, where_to_try, image_url)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (city_id, name) DO UPDATE SET
             description = EXCLUDED.description, where_to_try = EXCLUDED.where_to_try,
             image_url = EXCLUDED.image_url`,
          [cityId, dish.name, dish.description, dish.where_to_try, dish.image_url],
        );
      }
      console.log(`  ✓ city: ${city.name}`);
    }

    // --- Demo properties (owned by the demo owner) ---
    const owner = await client.query<{ id: string }>(
      "SELECT id FROM users WHERE email = 'owner@example.com'",
    );
    if (owner.rows[0]) {
      // properties has no unique constraint, so a plain INSERT would duplicate
      // on re-seed — remove the demo-owned rows first, then re-insert.
      await client.query(
        "DELETE FROM properties WHERE owner_id = $1 AND title = ANY($2::text[])",
        [owner.rows[0].id, demoProperties.map((p) => p.title)],
      );
      let n = 0;
      for (const p of demoProperties) {
        await client.query(
          `INSERT INTO properties
             (owner_id, title, description, listing_type, property_type, price, area_sqft,
              bedrooms, bathrooms, furnishing, city, locality, pincode, location,
              posted_by, under_construction, rera_approved, ready_to_move, is_resale)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                   ST_SetSRID(ST_MakePoint($14, $15), 4326)::geography,
                   $16, $17, $18, $19, $20)`,
          [
            owner.rows[0].id,
            p.title,
            p.description,
            p.listing_type,
            p.property_type,
            p.price,
            p.area_sqft,
            p.bedrooms,
            p.bathrooms,
            p.furnishing,
            p.city,
            p.locality,
            p.pincode,
            p.lng,
            p.lat,
            p.posted_by,
            p.under_construction,
            p.rera_approved,
            p.ready_to_move,
            p.is_resale,
          ],
        );
        n += 1;
      }
      console.log(`  ✓ ${n} demo properties`);
    }

    await client.query("COMMIT");
    console.log("Seed complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exitCode = 1;
});

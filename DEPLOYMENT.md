# Deployment

## Option A — single host with Docker Compose

`docker-compose.yml` runs the whole stack (db, redis, ml-service, api, web) with
healthchecks on every service. `docker compose up -d --build` then:

- web → http://localhost:3000
- api → http://localhost:4000/api (health: `/api/health`)
- ml-service → http://localhost:8000 (`/health` reports `feature_names_in_`)

Before building, place the model artifact (see README → "Price-prediction model").

**Production caveats on this stack:**
- The API's **rate limiter is in-memory** (per process). In a multi-instance
  deployment, replace `apps/api/src/middleware/rateLimit.ts`'s Map with Redis
  (the `redis` service is already in the compose file for that).
- The **amenities Overpass cooldown** is also in-memory — move to Redis for
  multi-instance (Phase-3 hardening item).

## Option B — managed services (scale-out)

| App | Host | Notes |
|---|---|---|
| web (Next.js) | Vercel | Set `NEXT_PUBLIC_API_URL` to the API's public URL. Server-rendered pages give the SEO benefit from the spec. |
| api (Express) | Render / Railway | `npm run start` (tsx). Needs the env vars below. |
| ml-service (FastAPI) | Render / Railway | Build from `apps/ml-service` (`uvicorn main:app`). Python 3.11 + `scikit-learn==1.6.1` pinned in `requirements.txt` — do not upgrade. Mount/model the `house_price_model.pkl` artifact (it's gitignored, so copy it in CI or use an artifact store). |
| db (Postgres+PostGIS) | Supabase (PostGIS included) / AWS RDS + PostGIS | Run migrations (`npm run db:migrate`) and seeds (`npm run db:seed`) against it once. |
| redis | Upstash / Railway Redis | Used once the rate limiter / amenity cooldown move off in-memory. |

## Environment variables

See `.env.example`. Required per app:

- **api**: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ML_SERVICE_URL`, `CORS_ORIGIN`
- **web**: `NEXT_PUBLIC_API_URL` (baked at build time)
- **ml-service**: `MODEL_PATH` (default `model/house_price_model.pkl`)

Generate secrets with `openssl rand -hex 32` and never commit them.

## Known limits to watch

- Public Overpass mirrors throttle heavy queries; the client fails over across
  three mirrors and caches per locality (15-min cooldown). For heavy traffic,
  self-host Overpass or use a Places API.
- The price model's estimates are not market-calibrated (spec §10 retrain is
  the planned fix); the UI labels them as AI estimates.

# Nivaas — Real Estate & Neighborhood Intelligence Platform

A full-stack real estate web platform for India with AI price prediction, map exploration, neighborhood intelligence, city guides, and Atlas India tourism.

## Architecture

```
┌──────────────────┐
│   Next.js Web     │  localhost:3000
│   (React 19 +     │
│    Tailwind v4)   │
└────────┬─────────┘
         │
┌────────┴─────────┐
│   Express API     │  localhost:4000
│   (TypeScript +    │
│    Prisma + Zod)  │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
┌───┴───┐ ┌──┴──────┐
│PostGIS│ │ FastAPI  │  localhost:8000
│ :5433 │ │ ML Svc   │
└───────┘ └─────────┘
              │
         ┌────┴────┐
         │  .pkl   │
         │  Model  │
         └─────────┘
```

## Project Structure

```
├── apps/
│   ├── web/                  Next.js 15 + React 19 + Tailwind v4
│   │   ├── app/
│   │   │   ├── page.tsx              Homepage (editorial design)
│   │   │   ├── predict/page.tsx      Price prediction (10 features)
│   │   │   ├── explore/              Map explorer (Leaflet + OSM)
│   │   │   ├── city-guide/           City guides (state-grouped)
│   │   │   └── atlas/                Atlas India (tourism)
│   │   ├── components/
│   │   │   ├── Navbar.tsx            Dark nav (Atlas, City Guides, Price Prediction, Map Explorer)
│   │   │   ├── Footer.tsx            Editorial footer
│   │   │   ├── atlas/                Atlas components (map, cards, search)
│   │   │   ├── city-guide/           City search
│   │   │   └── map/                  Map explorer components
│   │   ├── lib/
│   │   │   ├── api-client.ts         API client with fallback
│   │   │   ├── estimate.ts           Price estimation helper
│   │   │   └── atlas/                Atlas data (states, destinations, etc.)
│   │   └── public/
│   │       └── addresses.json        13,323 addresses from training CSVs
│   │
│   ├── api/                  Express + TypeScript
│   │   ├── src/
│   │   │   ├── app.ts               Route mounting
│   │   │   ├── config.ts             Environment config
│   │   │   ├── atlas/                Atlas India backend (Prisma + PostgreSQL)
│   │   │   ├── modules/
│   │   │   │   ├── amenities/        OSM Overpass amenity data
│   │   │   │   ├── city-guide/       City guide content
│   │   │   │   ├── health/           Health check
│   │   │   │   └── price-prediction/ ML proxy to FastAPI
│   │   │   └── middleware/           Error handler, rate limiter
│   │   └── prisma/                   Atlas schema + migrations
│   │
│   └── ml-service/           FastAPI + Python
│       ├── main.py            FastAPI app (health + predict)
│       ├── predictor.py       Model loading + inference
│       ├── schemas.py         Pydantic request/response
│       ├── model/
│       │   └── house_price_model.pkl  GBR-2000 (10 features)
│       └── train/.data/       Training CSVs
│           ├── train.csv
│           ├── test.csv
│           └── prediction.csv
│
├── packages/
│   └── types/                Shared TypeScript types
│
├── archive/                  Archived features
│   ├── auth-and-posting/     Login + post-property
│   ├── ml-service/           Previous ML service
│   ├── properties-api/       Property CRUD API
│   └── properties-web/       Property browsing UI
│
├── docker-compose.yml
├── package.json              npm workspaces
└── .env.example
```

## Features

### Price Prediction (`/predict`)
- **10 model features**: Posted By, BHK, Property Type, Area, Under Construction, RERA, Ready to Move, Resale, Location
- **13,323 addresses** from training data with typeable autocomplete
- Real prediction from `house_price_model.pkl` (GradientBoostingRegressor)
- Confidence range + deal verdict

### Atlas India (`/atlas`)
- Interactive India SVG map (36 states/UTs)
- 70+ destinations with editorial detail pages
- 10 experiences, 6 featured journeys
- Wishlist + visited tracking (localStorage)
- Live search with API backend

### Map Explorer (`/explore`)
- Leaflet + OpenStreetMap (free, no API keys)
- Clustered property pins
- Draw-radius PostGIS search
- Amenity layers (schools, hospitals, malls)

### City Guides (`/city-guide`)
- State-grouped city index
- Tourist spots + local dishes
- Nearby cities within ~150km

## Quickstart

```bash
# Install dependencies
npm install

# Start services
npm run dev:ml     # FastAPI on :8000
npm run dev:api    # Express on :4000
npm run dev        # Next.js on :3000
```

Or with Docker:
```bash
docker compose up -d --build
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | DB + PostGIS status |
| `POST /api/price-prediction/estimate` | ML prediction + deal verdict |
| `GET /api/amenities` | OSM amenity data |
| `GET /api/cities` | City list |
| `GET /api/city-guide/:city` | Full guide |
| `GET /api/v1/states` | Atlas states |
| `GET /api/v1/destinations` | Atlas destinations |
| `GET /api/v1/search?q=` | Atlas search |
| `GET /docs` | Swagger UI |

## ML Model

- **File**: `apps/ml-service/model/house_price_model.pkl`
- **Type**: GradientBoostingRegressor (2000 trees, depth 5, lr 0.1)
- **Features**: 10 (POSTED_BY, UNDER_CONSTRUCTION, RERA, BHK_NO., BHK_OR_RK, SQUARE_FT, READY_TO_MOVE, RESALE, LONGITUDE, LATITUDE)
- **Target**: TARGET(PRICE_IN_LACS) — output in INR Lacs
- **Encoding**: POSTED_BY {Owner→1, Dealer→2, Builder→3}, BHK_OR_RK {BHK→1, RK→0}

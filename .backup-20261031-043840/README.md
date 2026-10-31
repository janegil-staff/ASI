# ASI API

REST API about Artificial Superintelligence (ASI): key concepts, organizations, a historical timeline and sourced forecasts of when AGI/ASI might arrive.
Node.js + Express + Mongoose, plain JavaScript.

## Run locally

```bash
cp .env.example .env      # set MONGODB_URI and ADMIN_API_KEY
npm install
npm run seed              # fill the database with starter data
npm run dev               # http://localhost:4000/api
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api` | API info |
| GET | `/api/health` | Health + DB status |
| GET | `/api/concepts` | List concepts (`?q=`, `?tag=`, `?category=`, `?page=`, `?limit=`, `?sort=`) |
| GET | `/api/concepts/:slug` | One concept, e.g. `orthogonality-thesis` |
| GET | `/api/organizations` | List organizations (`?type=lab`, `?country=UK`) |
| GET | `/api/organizations/:slug` | One organization |
| GET | `/api/milestones` | List milestones (`?kind=`, `?year=`) |
| GET | `/api/milestones/:slug` | One milestone, e.g. `2014-superintelligence-paths-dangers-strategies` |
| GET | `/api/forecasts` | List forecasts (`?target=asi`, `?forecasterType=survey`, `?madeYear=2023`) |
| GET | `/api/forecasts/:slug` | One forecast, e.g. `ai-impacts-survey-espai-2023-hlmi-2023` |
| GET | `/api/forecasts/targets` | What each target means (agi, hlmi, tai, asi, singularity, faol) |
| GET | `/api/forecasts/summary` | Per target: count, median of median years, earliest, latest (current forecasts only) |
| GET | `/api/forecasts/trend?target=hlmi` | How forecasts for one target moved over time, with years ahead |
| GET | `/api/timeline?from=1950&to=2000` | Chronological timeline |
| GET | `/api/search?q=alignment` | Search across all collections |
| POST / PUT / DELETE | `/api/{concepts,organizations,milestones,forecasts}[/:slug]` | Write, requires `x-api-key` header |

Example:

```bash
curl -X POST http://localhost:4000/api/concepts \
  -H "Content-Type: application/json" -H "x-api-key: change-me" \
  -d '{"name":"Mesa-optimization","category":"safety","summary":"When a trained model is itself an optimizer with its own objective.","year":2019}'
```

## Forecast data

Each forecast has a `target` (definitions differ between sources, so they are not mixed), `madeYear`, an optional `medianYear`,
optional cumulative `probabilities` (`[{ year, p }]`), a source, and `supersededBy` when the same forecaster later updated.
`/summary` ignores superseded forecasts; `/trend` includes them so you can see the shift. Metaculus is a live question,
so its value is a snapshot from early 2026.

## Deploy (DigitalOcean App Platform)

- Run command: `npm start`
- Env vars: `MONGODB_URI`, `ADMIN_API_KEY`, `CORS_ORIGIN`, `NODE_ENV=production`
- Run `npm run seed` once from the console (it wipes and refills the collections).

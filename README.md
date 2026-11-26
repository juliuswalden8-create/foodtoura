# FoodToura

Intelligent restaurant discovery for travelers.  
**Your taste. Your journey.**

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Client-side discovery wizard with sessionStorage
- Mock restaurant inventory for Barcelona & Lisbon
- AI-ready preference parser (`src/lib/preference-parser.ts` + `/api/parse-preferences`)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage + location search |
| `/discover` | 4-step discovery wizard |
| `/discover/results` | Ranked matches |
| `/restaurant/[id]` | Detail + allergen safety labels |
| `/api/parse-preferences` | Structured preference parsing |
| `/api/discover` | Ranking API (mock data) |

## Data

All restaurant and allergen data is **sample/mock** for demo. See `src/lib/mock-restaurants.ts`.

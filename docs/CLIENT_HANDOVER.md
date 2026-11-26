# FoodToura — client handover

Product for an external client. Brand promise: *Good food makes anywhere feel like home.*

## Live product

- Production: https://foodtoura.vercel.app
- GitHub: https://github.com/juliuswalden8-create/foodtoura
- Framework: Next.js App Router, React 19, Tailwind

## Local development

```bash
npm install
cp .env.example .env.local   # add keys locally — never commit
npm run dev                  # http://127.0.0.1:3000
npm test
npm run build
```

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GOOGLE_PLACES_API_KEY` | For live restaurants | Places Text Search (New) + Place Details + Photo Media |
| `PLACES_API_KEY` / `RESTAURANT_API_KEY` | Aliases | Accepted by provider abstraction |

Without a Places key the app runs **labeled preview/demo** inventory. It never silently mixes fictional venues into live results.

Optional future: vision model key for Menu Scanner photo OCR; LLM key for richer Guide parsing (heuristic parser works today).

### Google Places setup

1. Enable Places API (New) on a Google Cloud project with billing.
2. Restrict the key to server IP / Vercel deployment when possible.
3. Add the key in Vercel → Project → Settings → Environment Variables (Production + Preview).
4. Redeploy. Confirm homepage Demo banner switches to live attribution after a search.

See also `docs/PLACES_SETUP.md`.

## Architecture (short)

- UI: `src/app/*`, `src/components/*`
- Discovery state: `sessionStorage` / `localStorage` via `src/lib/discovery-store.ts`
- Ranking: deterministic `src/lib/ranking.ts` (allergies fail-closed)
- NL parse: `src/lib/preference-parser.ts` (+ Guide chat)
- Data: `src/lib/provider.ts` — demo vs live; photo proxy `/api/places/photo`
- Server APIs: `/api/discover`, `/api/restaurants/[id]`, `/api/places/photo`

## Brand system

- Cream `#FAF7F0`, card `#FFFDF9`, sand `#F1ECE3`
- Olive `#344E41`, sage `#A7B69A`, terracotta `#C9856B`
- Text `#303A32` / `#62675E`, border `#E8DFD0`
- Fonts: Fraunces (display), DM Sans (UI)
- Assets: `/public/favicon.svg`, `/public/icon.svg`, `/public/og.svg`
- Light theme only (dark mode intentionally disabled)

## Domain & ownership transfer

1. Transfer GitHub repo to the client org (or add client as owner).
2. Transfer Vercel project to the client team; reconnect Git.
3. Move Google Cloud billing and API keys to a client-owned project.
4. Point custom domain in Vercel → Domains.
5. Replace contact/legal placeholders (`/contact`, `/privacy`, `/terms`) with verified company details after counsel approval.

## Expected third-party costs

- Vercel hosting (plan dependent)
- Google Maps Platform Places usage (query + photo volume)
- Future: vision OCR, LLM concierge, Mapbox/Google Maps JS, auth/DB

## Known limitations (honest)

- Group Match multi-device sync needs a database (device-local today)
- Menu Scanner photo vision blocked without vision credentials
- Map view is a labeled pin board until Mapbox/Google Maps JS
- No native booking partner — external site/phone only
- Legal pages are drafts pending client approval
- Guest data is browser-local; no account delete API yet

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Demo banner always on | `GOOGLE_PLACES_API_KEY` on Vercel + redeploy |
| Photos fail | Photo proxy logs; key permissions for Place Photos |
| 429 from APIs | Rate limits in `src/lib/rate-limit.ts` / Google quotas |
| Wrong city distances | Set GPS or known city; unknown cities no longer fake Barcelona |

## Backup & recovery

- Source of truth: GitHub `main`
- Guest shortlists: user devices (export via Saved / share trip links)
- Redeploy any green `main` commit from Vercel Deployments

## Content updates

- Homepage sections: `src/app/page.tsx`
- Editorial dishes: `src/lib/local-dishes.ts`
- Demo inventory: `src/lib/mock-restaurants.ts` (preview only)
- Feature honesty table: `FEATURE_STATUS.md`

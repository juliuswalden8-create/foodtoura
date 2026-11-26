# FoodToura — FEATURE_STATUS

Statuses: **Fully working and verified** · **Working with limitations** · **Demo only** · **Blocked by external dependency** · **Not implemented**

Last updated: 2026-11-26

| Feature | Status | Notes | Credentials |
|---------|--------|-------|-------------|
| Homepage discovery search | Working with limitations | Hero + NL → Guide; tools secondary | — |
| Guided wizard | Working with limitations | 4 steps; demo cities strongest | — |
| AI Guide (NL → chips) | Working with limitations | Heuristic parser (LLM-ready interface) | Optional LLM later |
| Explainable ranking | Working with limitations | Deterministic; allergies fail-closed | — |
| Results List / Map / Swipe | Working with limitations | Map is coordinate plot, not Mapbox | Mapbox optional |
| Results sort + editable chips | Working with limitations | Client re-rank; no Places re-query on chip | — |
| Google Places live search | Blocked by external dependency | UI uses `POST /api/discover` (server-side key); needs billing key | `GOOGLE_PLACES_API_KEY` |
| Places photos (no key leak) | Working with limitations | Proxied via `/api/places/photo` | Same key |
| Restaurant detail (live IDs) | Working with limitations | `GET /api/restaurants/[id]` + saved snapshots | Same key |
| Restaurant detail | Working with limitations | Demo rich; live sparse + unavailable allergens | — |
| Save restaurants | Working with limitations | localStorage guest; no account sync | Auth/DB later |
| Group Match merge | Demo only | Single-device merge → search | DB for multi-user |
| Group vote | Demo only | Device-local votes | DB + sessions |
| Allergy Passport | Working with limitations | ES/EN/PT/FR reviewed strings | — |
| Phrase book | Working with limitations | Offline phrases | — |
| Menu Scanner (text) | Working with limitations | Keyword NLP; fail-closed on allergens | — |
| Menu Scanner (vision) | Blocked by external dependency | Upload UI honest failure without vision | Vision API key |
| AI recommendations | Working with limitations | Same ranking engine + prompt | — |
| Share trip links | Working with limitations | URL token; no server | — |
| Tonight plan | Demo only | localStorage itinerary | — |
| Authenticity / trap risk | Demo only | Labeled heuristic — not verified journalism | Partner feed |
| Food Tinder | Working with limitations | Taste profile feeds soft ranking | — |
| Mood Match / Surprise Me | Working with limitations | Maps mood → search params | — |
| Eat Like a Local | Working with limitations | Editorial demo dishes → search | — |
| Food Journey (multi-day) | Not implemented | Single-night plan exists | — |
| Food Passport journal | Working with limitations | Visit log local | — |
| AI Waiter | Working with limitations | Phrase + translation card | TTS optional |
| Budget / bill split | Working with limitations | Calculator local; no FX API | FX provider optional |
| Booking | Working with limitations | External website/phone only — no fake confirms | Partner API |
| Auth / account delete | Not implemented | Guest storage only | Auth provider |
| Automated E2E | Working with limitations | Unit tests for parser/ranking/share | Playwright later |
| Offline personal content | Demo only | localStorage | — |

## Live integration smoke

| Check | Result |
|-------|--------|
| `npm run build` | Pass (verify each ship) |
| Places Text Search | Not run — key missing |
| Vision menu OCR | Not run — key missing |

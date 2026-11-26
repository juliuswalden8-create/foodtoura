# FoodToura — FEATURE_STATUS

Statuses: **Fully working and verified** · **Working with limitations** · **Demo only** · **Blocked by external dependency** · **Not implemented**

Last updated: 2026-11-26 (Europe/Madrid) — post overhaul P1 foundation pass

| Feature | Status | Notes | Credentials |
|---------|--------|-------|-------------|
| Homepage discovery search | Working with limitations | Hero + NL → Guide; sample venues labeled demo | — |
| Guided wizard | Working with limitations | NL now merges distance, atmosphere, kids, accessibility | — |
| AI Guide (conversational) | Working with limitations | Heuristic NL + discover API; LLM-ready | Optional LLM; Places for live |
| Explainable ranking | Working with limitations | Deterministic; no invented distance when city unknown; allergy collapse for Places | — |
| Results List / Map / Swipe | Working with limitations | Map labeled demo pin board; swipe saves snapshots | Mapbox optional |
| Results sort + editable chips | Working with limitations | Soft filters re-rank; cuisine/place debounced re-query | — |
| Google Places live search | Blocked by external dependency | Server `/api/discover`; composite getById | `GOOGLE_PLACES_API_KEY` |
| Places photos (no key leak) | Working with limitations | Proxy uses `skipHttpRedirect=true` | Same key |
| Restaurant detail (live + demo IDs) | Working with limitations | Demo IDs resolve even when live key present | Same key |
| Save restaurants | Working with limitations | localStorage + snapshots (list + swipe) | Auth/DB later |
| Group Match merge | Demo only | Single-device; honest multi-user limit | DB for multi-user |
| Group vote | Working with limitations | Uses current discover deck; device-local tallies | DB + sessions |
| Allergy Passport | Working with limitations | ES/EN/PT/FR reviewed strings | — |
| Phrase book | Working with limitations | Offline phrases | — |
| Menu Scanner (text) | Working with limitations | Keyword NLP; fail-closed on allergens | — |
| Menu Scanner (vision) | Blocked by external dependency | Honest failure without vision | Vision API key |
| AI recommendations | Working with limitations | Same ranking engine + prompt | — |
| Share trip links | Working with limitations | URL token; no server | — |
| Tonight plan | Working with limitations | Saved Places snapshots addable | — |
| Authenticity / trap risk | Demo only | Labeled heuristic | Partner feed |
| Food Tinder | Working with limitations | Taste profile feeds soft ranking | — |
| Mood Match / Surprise Me | Working with limitations | Surprise uses discover deck | — |
| Eat Like a Local | Working with limitations | Editorial demo dishes → search | — |
| Food Journey (multi-day) | Not implemented | Single-night plan exists | — |
| Food Passport journal | Working with limitations | Visit log local | — |
| AI Waiter | Working with limitations | Phrase + translation card | TTS optional |
| Budget / bill split | Working with limitations | Calculator local; no FX API | FX optional |
| Booking | Working with limitations | External website/phone only | Partner API |
| Auth / account delete | Not implemented | Guest storage only | Auth provider |
| Automated E2E | Working with limitations | Unit tests for parser/ranking/share | Playwright later |
| Offline personal content | Demo only | localStorage | — |
| Production deploy | Fully working and verified | https://foodtoura.vercel.app | Places key for live |

## Live integration smoke

| Check | Result |
|-------|--------|
| `npm test` | Pass (6) |
| `npm run build` | Verify each ship |
| Places Text Search | Not run — key missing on this VM |
| Vision menu OCR | Not run — key missing |
| Vercel production | Live — set `GOOGLE_PLACES_API_KEY` in project env for worldwide data |

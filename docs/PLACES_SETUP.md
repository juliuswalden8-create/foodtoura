# Google Places setup (live restaurants)

FoodToura reads **only** server-side env:

```bash
GOOGLE_PLACES_API_KEY=your_key_here
```

Aliases also accepted: `PLACES_API_KEY`, `RESTAURANT_API_KEY`.

## Checklist when live data does not appear

1. Key is set in the **server** environment (`.env.local` or host secrets) — never `NEXT_PUBLIC_`.
2. Places API (New) is enabled in Google Cloud.
3. Billing is active on the project.
4. Key restrictions allow this server / IP / referrer.
5. Restart `npm run dev` after adding the key.
6. Confirm `GET /api/discover` returns `"dataMode":"live"`.

Without a key, FoodToura shows **labeled preview restaurants** (Barcelona & Lisbon). It will **not** invent live venues or silently mix demo with Places.

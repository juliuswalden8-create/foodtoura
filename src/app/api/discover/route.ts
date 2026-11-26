import { NextResponse } from "next/server";
import { defaultDiscoveryState } from "@/lib/discovery-store";
import { getDataMode, searchRestaurantsForState } from "@/lib/provider";
import { describeNoFullMatch, rankRestaurants } from "@/lib/ranking";
import type { DiscoveryState } from "@/lib/types";

/**
 * Server-side discover — Google Places key never leaves the server.
 * Returns raw `restaurants` for client re-ranking + ranked `results`.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DiscoveryState>;
    const base = defaultDiscoveryState();
    const state: DiscoveryState = {
      ...base,
      ...body,
      location: { ...base.location, ...body.location },
      guests: { ...base.guests, ...body.guests },
      food: { ...base.food, ...body.food },
      allergens: body.allergens ?? base.allergens,
      dietary: body.dietary ?? base.dietary,
      mandatory: { ...base.mandatory, ...body.mandatory },
    };

    if (
      typeof state.location.city === "string" &&
      state.location.city.length > 120
    ) {
      return NextResponse.json({ error: "City too long." }, { status: 400 });
    }

    const providerResult = await searchRestaurantsForState(state);
    const results = rankRestaurants(providerResult.restaurants, state);

    return NextResponse.json({
      mode: providerResult.mode,
      attribution: providerResult.attribution,
      restaurants: providerResult.restaurants,
      results,
      noFullMatchHint: describeNoFullMatch(results),
      meta: {
        dataMode: getDataMode(),
        count: results.length,
        cachedAt: providerResult.cachedAt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request.";
    const status = /Places error 429/.test(message)
      ? 429
      : /Places error 403|API_KEY|missing/i.test(message)
        ? 503
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  return NextResponse.json({
    dataMode: getDataMode(),
    liveConfigured: getDataMode() === "live",
  });
}

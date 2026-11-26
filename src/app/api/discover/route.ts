import { NextResponse } from "next/server";
import { defaultDiscoveryState } from "@/lib/discovery-store";
import { getDataMode, searchRestaurantsForState } from "@/lib/provider";
import { describeNoFullMatch, rankRestaurants } from "@/lib/ranking";
import type { DiscoveryState } from "@/lib/types";

/**
 * Ranking endpoint.
 * Demo vs live is decided by provider — never mixed in one payload.
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
      mandatory: { ...base.mandatory, ...body.mandatory },
    };

    const providerResult = await searchRestaurantsForState(state);
    const results = rankRestaurants(providerResult.restaurants, state);

    return NextResponse.json({
      mode: providerResult.mode,
      attribution: providerResult.attribution,
      results,
      noFullMatchHint: describeNoFullMatch(results),
      meta: {
        dataMode: getDataMode(),
        cities: ["Barcelona", "Lisbon"],
        count: results.length,
        cachedAt: providerResult.cachedAt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

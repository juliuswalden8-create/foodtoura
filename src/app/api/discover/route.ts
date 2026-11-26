import { NextResponse } from "next/server";
import { RESTAURANTS } from "@/lib/mock-restaurants";
import { rankRestaurants } from "@/lib/ranking";
import type { DiscoveryState } from "@/lib/types";
import { defaultDiscoveryState } from "@/lib/discovery-store";

/**
 * Ranking endpoint — mock restaurants today.
 * Extension: replace RESTAURANTS with Google Places / partner inventory.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DiscoveryState>;
    const state: DiscoveryState = {
      ...defaultDiscoveryState(),
      ...body,
      location: { ...defaultDiscoveryState().location, ...body.location },
      guests: { ...defaultDiscoveryState().guests, ...body.guests },
      food: { ...defaultDiscoveryState().food, ...body.food },
    };
    const results = rankRestaurants(RESTAURANTS, state);
    return NextResponse.json({
      results,
      meta: {
        source: "mock",
        cities: ["Barcelona", "Lisbon"],
        count: results.length,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

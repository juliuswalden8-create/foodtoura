import type { DiscoveryState, ProviderResult, Restaurant } from "./types";
import { RESTAURANTS } from "./mock-restaurants";

/**
 * Restaurant data provider abstraction.
 *
 * - Demo mode (default): fictional sample inventory. Always labeled as demo.
 * - Live mode: when GOOGLE_PLACES_API_KEY (or similar) is set, fetch Places.
 *
 * Never mix demo + live results in one response.
 * Never fabricate live-looking data when the key is missing.
 */
export interface RestaurantProvider {
  mode: "demo" | "live";
  search(query: {
    city?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }): Promise<ProviderResult>;
  getById(id: string): Promise<Restaurant | null>;
}

function hasLiveKey(): boolean {
  return Boolean(
    process.env.GOOGLE_PLACES_API_KEY ||
      process.env.PLACES_API_KEY ||
      process.env.RESTAURANT_API_KEY,
  );
}

export const DEMO_ATTRIBUTION =
  "Fictional demo restaurants for FoodToura product preview. Not real venue listings. Not affiliated with named establishments.";

export const LIVE_ATTRIBUTION =
  "Venue data © Google Places (or configured provider). Subject to provider terms.";

class DemoRestaurantProvider implements RestaurantProvider {
  mode = "demo" as const;

  async search(query: {
    city?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }): Promise<ProviderResult> {
    let list = RESTAURANTS;
    if (query.city) {
      list = list.filter(
        (r) => r.city.toLowerCase() === query.city!.toLowerCase(),
      );
    }
    return {
      mode: "demo",
      restaurants: list,
      attribution: DEMO_ATTRIBUTION,
      cachedAt: new Date().toISOString(),
    };
  }

  async getById(id: string): Promise<Restaurant | null> {
    return RESTAURANTS.find((r) => r.id === id) ?? null;
  }
}

/**
 * Live Places stub — activates only when an API key env var is present.
 * Implementation intentionally incomplete until a key + ToS path is configured.
 */
class GooglePlacesProvider implements RestaurantProvider {
  mode = "live" as const;

  async search(): Promise<ProviderResult> {
    // Extension point: call Places Nearby/Text Search, map to Restaurant[],
    // cache with TTL, attach provider attribution. Do not fall back to demo
    // data in the same response.
    throw new Error(
      "Live Places provider is configured but not yet implemented. Unset the API key to use labeled demo mode.",
    );
  }

  async getById(): Promise<Restaurant | null> {
    throw new Error("Live Places getById not yet implemented.");
  }
}

export function getRestaurantProvider(): RestaurantProvider {
  if (hasLiveKey()) return new GooglePlacesProvider();
  return new DemoRestaurantProvider();
}

export function getDataMode(): "demo" | "live" {
  return hasLiveKey() ? "live" : "demo";
}

export async function searchRestaurantsForState(
  state: DiscoveryState,
): Promise<ProviderResult> {
  const provider = getRestaurantProvider();
  return provider.search({
    city: state.location.city,
    lat: state.location.lat,
    lng: state.location.lng,
    radiusKm: state.location.maxDistanceKm,
  });
}

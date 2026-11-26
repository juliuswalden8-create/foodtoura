import type {
  CuisineTag,
  DiscoveryState,
  ProviderResult,
  Restaurant,
  RestaurantAllergenStatus,
} from "./types";
import { RESTAURANTS } from "./mock-restaurants";
import { enrichAuthenticity } from "./authenticity";

/**
 * Restaurant data provider abstraction.
 *
 * - Demo mode (default): fictional sample inventory. Always labeled as demo.
 * - Live mode: when GOOGLE_PLACES_API_KEY is set, fetch Places Text Search (New).
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
    textQuery?: string;
  }): Promise<ProviderResult>;
  getById(id: string): Promise<Restaurant | null>;
}

function liveKey(): string | undefined {
  return (
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.PLACES_API_KEY ||
    process.env.RESTAURANT_API_KEY ||
    undefined
  );
}

export function hasLiveKey(): boolean {
  return Boolean(liveKey());
}

export const DEMO_ATTRIBUTION =
  "Fictional demo restaurants for FoodToura product preview. Not real venue listings. Not affiliated with named establishments.";

export const LIVE_ATTRIBUTION =
  "Venue data from Google Places API. © Google — follow Google Maps Platform terms & attribution requirements.";

const emptyAllergens = (): RestaurantAllergenStatus[] =>
  (
    [
      "celery",
      "cereals_gluten",
      "crustaceans",
      "eggs",
      "fish",
      "lupin",
      "milk",
      "molluscs",
      "mustard",
      "nuts",
      "peanuts",
      "sesame",
      "soybeans",
      "sulphites",
    ] as const
  ).map((allergen) => ({
    allergen,
    present: null,
    source: "unavailable" as const,
    notes: "Live Places does not provide EU allergen matrices — verify with the restaurant.",
  }));

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

type PlacesNewResult = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
    types?: string[];
    photos?: Array<{ name?: string }>;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    currentOpeningHours?: { openNow?: boolean };
    editorialSummary?: { text?: string };
  }>;
};

function mapPriceLevel(level?: string): 1 | 2 | 3 | 4 {
  switch (level) {
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    default:
      return 2;
  }
}

function mapCuisines(types: string[] = []): CuisineTag[] {
  const out: CuisineTag[] = [];
  const join = types.join(" ").toLowerCase();
  const rules: [RegExp, CuisineTag][] = [
    [/italian|pizza/, "Italian"],
    [/spanish|tapas/, "Spanish"],
    [/french/, "French"],
    [/japanese|sushi|ramen/, "Japanese"],
    [/mexican|taco/, "Mexican"],
    [/indian/, "Indian"],
    [/seafood/, "Seafood"],
    [/steak/, "Steakhouse"],
    [/burger/, "Burgers"],
    [/mediterranean/, "Mediterranean"],
    [/chinese|thai|korean|vietnamese|asian/, "Asian"],
  ];
  for (const [re, tag] of rules) {
    if (re.test(join)) out.push(tag);
  }
  if (out.length === 0) out.push("Traditional local food");
  return out;
}

function placeToRestaurant(
  p: NonNullable<PlacesNewResult["places"]>[number],
  cityHint: string,
): Restaurant | null {
  if (!p.id || !p.displayName?.text) return null;
  const lat = p.location?.latitude ?? 0;
  const lng = p.location?.longitude ?? 0;
  const priceLevel = mapPriceLevel(p.priceLevel);
  const photoRef = p.photos?.[0]?.name;
  // Never put API keys in client-visible URLs — proxy through our API.
  const imageUrl = photoRef
    ? `/api/places/photo?name=${encodeURIComponent(photoRef)}&h=800`
    : "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80";

  return {
    id: `places-${p.id}`,
    name: p.displayName.text,
    city: cityHint || "Unknown",
    country: "",
    neighborhood: p.formattedAddress?.split(",")[0] || "",
    cuisine: mapCuisines(p.types),
    description:
      p.editorialSummary?.text ||
      `Live Places listing near ${cityHint || "your destination"}. Allergen data unavailable from Places — verify directly.`,
    imageUrl,
    gallery: [imageUrl],
    rating: p.rating ?? 0,
    reviewCount: p.userRatingCount ?? 0,
    reviewReliability:
      (p.userRatingCount ?? 0) > 200
        ? "high"
        : (p.userRatingCount ?? 0) > 40
          ? "medium"
          : "low",
    priceLevel,
    avgPricePerPerson: priceLevel * 18,
    currency: "EUR",
    lat,
    lng,
    outdoorSeating: false,
    livelyAtmosphere: false,
    quietAtmosphere: false,
    acceptsLargeGroups: false,
    childFriendly: false,
    wheelchairAccessible: false,
    openNow: p.currentOpeningHours?.openNow,
    hours: "See Google listing",
    dietarySupported: [],
    allergens: emptyAllergens(),
    safetyDisclaimer:
      "Google Places does not supply EU allergen matrices. Treat all allergen fields as unavailable and verify with the restaurant.",
    address: p.formattedAddress || "",
    phone: p.nationalPhoneNumber || "",
    website: p.websiteUri,
    highlights: (p.types || []).slice(0, 3),
    dataCompleteness: 0.4,
    attribution: LIVE_ATTRIBUTION,
    providerId: p.id,
  };
}

/** In-memory TTL cache — never mixes demo IDs into live responses */
const liveCache = new Map<string, { at: number; result: ProviderResult }>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 64;

function setLiveCache(key: string, result: ProviderResult) {
  if (liveCache.size >= CACHE_MAX_ENTRIES) {
    const first = liveCache.keys().next().value;
    if (first !== undefined) liveCache.delete(first);
  }
  liveCache.set(key, { at: Date.now(), result });
}

class GooglePlacesProvider implements RestaurantProvider {
  mode = "live" as const;

  async search(query: {
    city?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    textQuery?: string;
  }): Promise<ProviderResult> {
    const key = liveKey();
    if (!key) {
      throw new Error("GOOGLE_PLACES_API_KEY missing");
    }

    const textQuery =
      query.textQuery ||
      `restaurants in ${query.city || "nearby"}`;
    const cacheKey = JSON.stringify({
      textQuery,
      lat: query.lat,
      lng: query.lng,
      r: query.radiusKm,
    });
    const hit = liveCache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.result;

    const body: Record<string, unknown> = {
      textQuery,
      languageCode: "en",
      maxResultCount: 20,
    };
    if (query.lat != null && query.lng != null) {
      body.locationBias = {
        circle: {
          center: { latitude: query.lat, longitude: query.lng },
          radius: (query.radiusKm ?? 5) * 1000,
        },
      };
    }

    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.photos,places.nationalPhoneNumber,places.websiteUri,places.currentOpeningHours,places.editorialSummary",
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const hint =
        res.status === 403
          ? " Check billing, API enablement, and key restrictions."
          : res.status === 429
            ? " Rate limited — retry shortly."
            : "";
      throw new Error(
        `Google Places error ${res.status}: ${detail.slice(0, 200) || res.statusText}.${hint}`,
      );
    }

    const data = (await res.json()) as PlacesNewResult;
    const restaurants = (data.places || [])
      .map((p) => placeToRestaurant(p, query.city || ""))
      .filter((r): r is Restaurant => Boolean(r))
      .map(enrichAuthenticity);

    if (restaurants.length === 0) {
      return {
        mode: "live",
        restaurants: [],
        attribution: LIVE_ATTRIBUTION,
        cachedAt: new Date().toISOString(),
      };
    }

    const result: ProviderResult = {
      mode: "live",
      restaurants,
      attribution: LIVE_ATTRIBUTION,
      cachedAt: new Date().toISOString(),
    };
    setLiveCache(cacheKey, result);
    return result;
  }

  async getById(id: string): Promise<Restaurant | null> {
    const placeId = id.replace(/^places-/, "");
    const key = liveKey();
    if (!key) return null;
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "id,displayName,formattedAddress,location,rating,userRatingCount,priceLevel,types,photos,nationalPhoneNumber,websiteUri,currentOpeningHours,editorialSummary",
        },
      },
    );
    if (!res.ok) return null;
    const p = (await res.json()) as NonNullable<PlacesNewResult["places"]>[number];
    return placeToRestaurant(p, "");
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
  const cuisineBit = state.food.cuisines.filter((c) => c !== "Surprise me")[0];
  const textQuery = [
    cuisineBit,
    "restaurants",
    state.location.neighborhood,
    state.location.city,
    state.location.country,
  ]
    .filter(Boolean)
    .join(" ");

  return provider.search({
    city: state.location.city,
    lat: state.location.lat,
    lng: state.location.lng,
    radiusKm: state.location.maxDistanceKm,
    textQuery: textQuery || undefined,
  });
}

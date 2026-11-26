import type { DiscoveryState, Restaurant } from "./types";

export const DISCOVERY_STORAGE_KEY = "foodtoura.discovery.v2";
export const SAVED_STORAGE_KEY = "foodtoura.saved.v1";
export const SAVED_SNAPSHOTS_KEY = "foodtoura.saved.snapshots.v1";
export const DESTINATION_KEY = "foodtoura.destination.v1";

export type SavedSnapshot = Pick<
  Restaurant,
  | "id"
  | "name"
  | "city"
  | "country"
  | "cuisine"
  | "imageUrl"
  | "rating"
  | "priceLevel"
  | "neighborhood"
  | "lat"
  | "lng"
  | "phone"
  | "website"
  | "address"
>;

export const defaultDiscoveryState = (): DiscoveryState => ({
  location: {
    country: "",
    city: "",
    neighborhood: "",
    maxDistanceKm: 5,
    travelMode: "walking",
    useCurrentLocation: false,
  },
  guests: {
    adults: 2,
    children: 0,
    infants: 0,
    date: new Date().toISOString().slice(0, 10),
    preferredTime: "20:00",
    largeGroupsOk: true,
  },
  food: {
    cuisines: [],
    freeText: "",
  },
  allergens: [],
  dietary: [],
  customDietary: "",
  mandatory: {
    city: true,
    allergens: true, // medical allergies always hard-filter conflicts
    dietary: false,
    budget: false,
    cuisine: false,
  },
});

export function loadDiscoveryState(): DiscoveryState {
  if (typeof window === "undefined") return defaultDiscoveryState();
  try {
    const raw = sessionStorage.getItem(DISCOVERY_STORAGE_KEY);
    if (!raw) return defaultDiscoveryState();
    const parsed = JSON.parse(raw);
    const base = defaultDiscoveryState();
    return {
      ...base,
      ...parsed,
      location: { ...base.location, ...parsed.location },
      guests: { ...base.guests, ...parsed.guests },
      food: { ...base.food, ...parsed.food },
      mandatory: { ...base.mandatory, ...parsed.mandatory },
    };
  } catch {
    return defaultDiscoveryState();
  }
}

export function saveDiscoveryState(state: DiscoveryState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(state));
  if (state.location.city) {
    localStorage.setItem(
      DESTINATION_KEY,
      JSON.stringify({
        city: state.location.city,
        country: state.location.country,
      }),
    );
  }
}

export function loadDestination(): { city: string; country: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DESTINATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadSavedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function loadSavedSnapshots(): SavedSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_SNAPSHOTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSnapshots(list: SavedSnapshot[]) {
  localStorage.setItem(SAVED_SNAPSHOTS_KEY, JSON.stringify(list));
}

export function toggleSaved(
  id: string,
  snapshot?: Partial<Restaurant> | null,
): string[] {
  const ids = loadSavedIds();
  const removing = ids.includes(id);
  const next = removing ? ids.filter((x) => x !== id) : [...ids, id];
  localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next));

  const snaps = loadSavedSnapshots().filter((s) => s.id !== id);
  if (!removing && snapshot) {
    snaps.unshift({
      id,
      name: snapshot.name || id,
      city: snapshot.city || "",
      country: snapshot.country || "",
      cuisine: snapshot.cuisine || [],
      imageUrl:
        snapshot.imageUrl ||
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      rating: snapshot.rating ?? 0,
      priceLevel: snapshot.priceLevel ?? 2,
      neighborhood: snapshot.neighborhood || "",
      lat: snapshot.lat ?? 0,
      lng: snapshot.lng ?? 0,
      phone: snapshot.phone || "",
      website: snapshot.website,
      address: snapshot.address || "",
    });
  }
  saveSnapshots(snaps.slice(0, 80));
  return next;
}

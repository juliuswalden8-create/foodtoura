import type { DiscoveryState } from "./types";

export const DISCOVERY_STORAGE_KEY = "foodtoura.discovery.v2";
export const SAVED_STORAGE_KEY = "foodtoura.saved.v1";
export const DESTINATION_KEY = "foodtoura.destination.v1";

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

export function toggleSaved(id: string): string[] {
  const ids = loadSavedIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next));
  return next;
}

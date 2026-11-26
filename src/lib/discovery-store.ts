import type { DiscoveryState } from "./types";

export const DISCOVERY_STORAGE_KEY = "foodtoura.discovery.v1";

export const defaultDiscoveryState = (): DiscoveryState => ({
  location: {
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
});

export function loadDiscoveryState(): DiscoveryState {
  if (typeof window === "undefined") return defaultDiscoveryState();
  try {
    const raw = sessionStorage.getItem(DISCOVERY_STORAGE_KEY);
    if (!raw) return defaultDiscoveryState();
    return { ...defaultDiscoveryState(), ...JSON.parse(raw) };
  } catch {
    return defaultDiscoveryState();
  }
}

export function saveDiscoveryState(state: DiscoveryState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(state));
}

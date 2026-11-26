import type { DiscoveryState, ProviderResult, Restaurant } from "./types";

export interface DiscoverResponse {
  mode: "demo" | "live";
  attribution: string;
  restaurants: Restaurant[];
  cachedAt?: string;
  error?: string;
}

/** Always call Places / demo inventory via the server — never from the browser. */
export async function fetchDiscover(
  state: DiscoveryState,
  signal?: AbortSignal,
): Promise<DiscoverResponse> {
  const res = await fetch("/api/discover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : `Discover failed (${res.status})`,
    );
  }
  return {
    mode: data.mode === "live" ? "live" : "demo",
    attribution: data.attribution || "",
    restaurants: (data.restaurants || data.results || []) as Restaurant[],
    cachedAt: data.meta?.cachedAt,
  };
}

export async function fetchRestaurantById(
  id: string,
  signal?: AbortSignal,
): Promise<Restaurant | null> {
  const res = await fetch(`/api/restaurants/${encodeURIComponent(id)}`, {
    signal,
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      typeof data.error === "string" ? data.error : `Lookup failed (${res.status})`,
    );
  }
  const data = await res.json();
  return (data.restaurant as Restaurant) || null;
}

export type { ProviderResult };

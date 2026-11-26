import type { DiscoveryState } from "./types";
import { defaultDiscoveryState } from "./discovery-store";

/** Compact shareable trip payload (URL hash / query). */
export function encodeTrip(state: DiscoveryState): string {
  const compact = {
    c: state.location.city,
    co: state.location.country,
    n: state.location.neighborhood,
    d: state.location.maxDistanceKm,
    t: state.location.travelMode,
    a: state.guests.adults,
    ch: state.guests.children,
    i: state.guests.infants,
    date: state.guests.date,
    time: state.guests.preferredTime,
    cu: state.food.cuisines,
    b: state.food.maxBudgetPerPerson,
    o: state.food.outdoorSeating,
    l: state.food.livelyAtmosphere,
    al: state.allergens,
    di: state.dietary,
    ft: state.food.freeText?.slice(0, 280),
  };
  const json = JSON.stringify(compact);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeTrip(token: string): DiscoveryState | null {
  try {
    let json: string;
    if (typeof Buffer !== "undefined") {
      json = Buffer.from(token, "base64url").toString("utf8");
    } else {
      const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
      json = decodeURIComponent(escape(atob(b64)));
    }
    const c = JSON.parse(json);
    const state = defaultDiscoveryState();
    state.location.city = c.c || "";
    state.location.country = c.co || "";
    state.location.neighborhood = c.n || "";
    if (c.d) state.location.maxDistanceKm = c.d;
    if (c.t) state.location.travelMode = c.t;
    if (c.a) state.guests.adults = c.a;
    if (c.ch != null) state.guests.children = c.ch;
    if (c.i != null) state.guests.infants = c.i;
    if (c.date) state.guests.date = c.date;
    if (c.time) state.guests.preferredTime = c.time;
    if (Array.isArray(c.cu)) state.food.cuisines = c.cu;
    if (c.b != null) state.food.maxBudgetPerPerson = c.b;
    if (c.o != null) state.food.outdoorSeating = c.o;
    if (c.l != null) state.food.livelyAtmosphere = c.l;
    if (Array.isArray(c.al)) state.allergens = c.al;
    if (Array.isArray(c.di)) state.dietary = c.di;
    if (c.ft) state.food.freeText = c.ft;
    return state;
  } catch {
    return null;
  }
}

export function tripShareUrl(state: DiscoveryState, origin?: string): string {
  const token = encodeTrip(state);
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:3000");
  return `${base}/trip?t=${token}`;
}

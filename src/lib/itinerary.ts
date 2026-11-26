export const ITINERARY_KEY = "foodtoura.itinerary.v1";

export interface ItineraryStop {
  restaurantId: string;
  name: string;
  city: string;
  time: string;
  note: string;
}

export interface NightItinerary {
  title: string;
  date: string;
  city: string;
  stops: ItineraryStop[];
}

export function loadItinerary(): NightItinerary {
  if (typeof window === "undefined") {
    return emptyItinerary();
  }
  try {
    const raw = localStorage.getItem(ITINERARY_KEY);
    if (!raw) return emptyItinerary();
    return { ...emptyItinerary(), ...JSON.parse(raw) };
  } catch {
    return emptyItinerary();
  }
}

export function emptyItinerary(): NightItinerary {
  return {
    title: "Tonight's food plan",
    date: new Date().toISOString().slice(0, 10),
    city: "",
    stops: [],
  };
}

export function saveItinerary(plan: NightItinerary) {
  localStorage.setItem(ITINERARY_KEY, JSON.stringify(plan));
}

export function addStop(
  plan: NightItinerary,
  stop: ItineraryStop,
): NightItinerary {
  if (plan.stops.some((s) => s.restaurantId === stop.restaurantId)) return plan;
  const next = { ...plan, stops: [...plan.stops, stop].slice(0, 6) };
  saveItinerary(next);
  return next;
}

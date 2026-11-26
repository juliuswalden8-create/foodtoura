import type { AtmosphereTag, DiscoveryState } from "./types";
import { defaultDiscoveryState } from "./discovery-store";

export type MoodId =
  | "romantic"
  | "cozy"
  | "adventurous"
  | "family"
  | "celebratory"
  | "relaxed"
  | "luxury"
  | "local"
  | "outdoor"
  | "view";

export const MOODS: {
  id: MoodId;
  label: string;
  blurb: string;
  atmosphere: AtmosphereTag[];
  outdoor?: boolean;
  cuisineHints?: string[];
  note: string;
}[] = [
  {
    id: "romantic",
    label: "Romantic",
    blurb: "Intimate, quieter tables",
    atmosphere: ["romantic", "quiet"],
    note: "Prefer quiet / intimate venues when listed",
  },
  {
    id: "cozy",
    label: "Cozy",
    blurb: "Warm and unhurried",
    atmosphere: ["quiet", "casual"],
    note: "Cozy / casual mood",
  },
  {
    id: "adventurous",
    label: "Adventurous",
    blurb: "Surprise-friendly picks",
    atmosphere: ["casual"],
    cuisineHints: ["Surprise me"],
    note: "Open to less obvious picks",
  },
  {
    id: "family",
    label: "Family-friendly",
    blurb: "Kids welcome",
    atmosphere: ["family", "casual"],
    note: "Family suitability preferred",
  },
  {
    id: "celebratory",
    label: "Celebratory",
    blurb: "Special occasion energy",
    atmosphere: ["formal"],
    cuisineHints: ["Fine dining"],
    note: "Celebratory / finer dining",
  },
  {
    id: "relaxed",
    label: "Relaxed",
    blurb: "Easy pace",
    atmosphere: ["casual", "quiet"],
    note: "Relaxed atmosphere",
  },
  {
    id: "luxury",
    label: "Luxury",
    blurb: "Elevated dining",
    atmosphere: ["formal"],
    cuisineHints: ["Fine dining"],
    note: "Luxury / fine dining preference",
  },
  {
    id: "local",
    label: "Local & authentic",
    blurb: "Neighborhood classics",
    atmosphere: ["casual"],
    cuisineHints: ["Traditional local food"],
    note: "Local / authentic preference",
  },
  {
    id: "outdoor",
    label: "Outdoor dining",
    blurb: "Terrace when available",
    atmosphere: ["casual"],
    outdoor: true,
    note: "Outdoor seating preferred",
  },
  {
    id: "view",
    label: "Dinner with a view",
    blurb: "Scenic when data supports it",
    atmosphere: ["romantic"],
    outdoor: true,
    cuisineHints: ["Seafood"],
    note: "View / waterfront — confirm on site; not all listings declare views",
  },
];

export function applyMood(
  moodId: MoodId,
  base?: DiscoveryState,
): DiscoveryState {
  const mood = MOODS.find((m) => m.id === moodId)!;
  const state = base ? structuredClone(base) : defaultDiscoveryState();
  state.food.atmosphere = Array.from(
    new Set([...(state.food.atmosphere || []), ...mood.atmosphere]),
  );
  if (mood.outdoor) state.food.outdoorSeating = true;
  if (mood.cuisineHints) {
    state.food.cuisines = Array.from(
      new Set([
        ...state.food.cuisines,
        ...(mood.cuisineHints as DiscoveryState["food"]["cuisines"]),
      ]),
    );
  }
  state.food.parsedNotes = [
    ...(state.food.parsedNotes || []),
    mood.note,
  ];
  state.food.freeText = state.food.freeText
    ? `${state.food.freeText} · mood:${mood.label}`
    : `mood:${mood.label}`;
  return state;
}

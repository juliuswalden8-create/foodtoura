import type {
  CuisineTag,
  DiscoveryState,
  EuAllergen,
  SelectedAllergen,
} from "./types";
import { defaultDiscoveryState } from "./discovery-store";

export interface GroupMember {
  id: string;
  name: string;
  cuisines: CuisineTag[];
  allergens: SelectedAllergen[];
  dietary: DiscoveryState["dietary"];
  maxBudgetPerPerson?: number;
  outdoorSeating?: boolean;
  livelyAtmosphere?: boolean;
}

export function createMember(name: string): GroupMember {
  return {
    id: `m-${Math.random().toString(36).slice(2, 9)}`,
    name,
    cuisines: [],
    allergens: [],
    dietary: [],
  };
}

/**
 * Merge group prefs into one DiscoveryState.
 * - Allergen unions always mandatory (medical safety)
 * - Cuisine = intersection if non-empty, else union
 * - Budget = min of members who set one
 * - Atmosphere = AND of requested flags
 */
export function mergeGroupToDiscovery(
  members: GroupMember[],
  baseCity: string,
  baseCountry = "",
): DiscoveryState {
  const state = defaultDiscoveryState();
  state.location.city = baseCity;
  state.location.country = baseCountry;
  state.guests.adults = Math.max(2, members.length);
  state.mandatory.allergens = true;
  state.mandatory.city = true;

  const allergenMap = new Map<EuAllergen, SelectedAllergen>();
  for (const m of members) {
    for (const a of m.allergens) {
      const prev = allergenMap.get(a.allergen);
      const severityRank = { preference: 0, intolerance: 1, allergy: 2 };
      if (
        !prev ||
        severityRank[a.severity] > severityRank[prev.severity]
      ) {
        allergenMap.set(a.allergen, a);
      }
    }
  }
  state.allergens = Array.from(allergenMap.values());

  const diet = new Set<DiscoveryState["dietary"][number]>();
  members.forEach((m) => m.dietary.forEach((d) => diet.add(d)));
  state.dietary = Array.from(diet);

  const cuisineSets = members
    .map((m) => new Set(m.cuisines))
    .filter((s) => s.size > 0);
  if (cuisineSets.length > 0) {
    let inter = cuisineSets[0];
    for (const s of cuisineSets.slice(1)) {
      inter = new Set([...inter].filter((c) => s.has(c)));
    }
    if (inter.size > 0) {
      state.food.cuisines = Array.from(inter);
    } else {
      const union = new Set<CuisineTag>();
      cuisineSets.forEach((s) => s.forEach((c) => union.add(c)));
      state.food.cuisines = Array.from(union);
    }
  }

  const budgets = members
    .map((m) => m.maxBudgetPerPerson)
    .filter((n): n is number => n != null);
  if (budgets.length) {
    state.food.maxBudgetPerPerson = Math.min(...budgets);
  }

  state.food.outdoorSeating = members.some((m) => m.outdoorSeating);
  state.food.livelyAtmosphere = members.every(
    (m) => m.livelyAtmosphere !== false,
  )
    ? members.some((m) => m.livelyAtmosphere)
    : false;

  state.food.freeText = `Group of ${members.length}: ${members.map((m) => m.name).join(", ")}`;
  state.food.parsedNotes = [
    `Merged ${members.length} traveler profiles`,
    state.allergens.length
      ? `Union allergens: ${state.allergens.map((a) => a.allergen).join(", ")}`
      : "No allergens flagged",
    state.food.cuisines.length
      ? `Cuisines: ${state.food.cuisines.join(", ")}`
      : "Open cuisine",
  ];

  return state;
}

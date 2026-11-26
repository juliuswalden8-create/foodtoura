import type {
  DiscoveryState,
  RankedRestaurant,
  Restaurant,
  SelectedAllergen,
} from "./types";
import { ALLERGEN_SHORT } from "./allergens";

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function cityCenter(city: string): { lat: number; lng: number } {
  const centers: Record<string, { lat: number; lng: number }> = {
    Barcelona: { lat: 41.3874, lng: 2.1686 },
    Lisbon: { lat: 38.7223, lng: -9.1393 },
  };
  return centers[city] ?? centers.Barcelona;
}

function evaluateAllergy(
  restaurant: Restaurant,
  selected: SelectedAllergen[],
): {
  safetyLevel: RankedRestaurant["safetyLevel"];
  warnings: string[];
  penalty: number;
} {
  const warnings: string[] = [];
  let penalty = 0;
  let hasConflict = false;
  let hasUnknown = false;
  let hasCaution = false;

  for (const sel of selected) {
    if (sel.severity === "preference") continue;
    const status = restaurant.allergens.find((a) => a.allergen === sel.allergen);
    const label = ALLERGEN_SHORT[sel.allergen];
    const isMedical = sel.severity === "allergy";

    if (!status || status.source === "unavailable" || status.present === null) {
      hasUnknown = true;
      warnings.push(
        `${label}: information unavailable — verify directly with the restaurant.`,
      );
      penalty += isMedical ? 35 : 18;
      continue;
    }

    if (status.present === true) {
      if (isMedical) {
        hasConflict = true;
        warnings.push(
          `${label}: restaurant reports this allergen as present. Not recommended for a medical allergy.`,
        );
        penalty += 100;
      } else {
        hasCaution = true;
        warnings.push(
          `${label}: present according to restaurant data — may not suit your intolerance.`,
        );
        penalty += 40;
      }
      continue;
    }

    if (status.source === "unverified") {
      hasCaution = true;
      warnings.push(
        `${label}: marked absent but unverified — confirm with the restaurant.`,
      );
      penalty += isMedical ? 25 : 10;
    }
  }

  let safetyLevel: RankedRestaurant["safetyLevel"] = "compatible";
  if (hasConflict) safetyLevel = "conflict";
  else if (hasUnknown) safetyLevel = "unknown";
  else if (hasCaution) safetyLevel = "caution";

  return { safetyLevel, warnings, penalty };
}

export function rankRestaurants(
  restaurants: Restaurant[],
  state: DiscoveryState,
): RankedRestaurant[] {
  const center =
    state.location.lat != null && state.location.lng != null
      ? { lat: state.location.lat, lng: state.location.lng }
      : cityCenter(state.location.city || "Barcelona");

  const partySize =
    state.guests.adults + state.guests.children + state.guests.infants;
  const wantsSurprise = state.food.cuisines.includes("Surprise me");
  const preferredCuisines = state.food.cuisines.filter(
    (c) => c !== "Surprise me",
  );
  const cuisineSet = new Set<string>(preferredCuisines);

  const ranked: RankedRestaurant[] = restaurants
    .filter((r) => {
      if (!state.location.city) return true;
      return r.city.toLowerCase() === state.location.city.toLowerCase();
    })
    .map((r) => {
      let score = 55;
      const reasons: string[] = [];
      const distanceKm = haversineKm(center.lat, center.lng, r.lat, r.lng);

      if (state.location.neighborhood) {
        if (
          r.neighborhood
            .toLowerCase()
            .includes(state.location.neighborhood.toLowerCase())
        ) {
          score += 12;
          reasons.push(`In ${r.neighborhood}`);
        }
      }

      if (distanceKm <= state.location.maxDistanceKm) {
        score += Math.max(0, 15 - distanceKm * 1.5);
        reasons.push(`${distanceKm.toFixed(1)} km away`);
      } else {
        score -= 20;
      }

      if (cuisineSet.size > 0) {
        const overlap = r.cuisine.filter((c) => cuisineSet.has(c));
        if (overlap.length) {
          score += overlap.length * 10;
          reasons.push(`Matches ${overlap.join(", ")}`);
        } else if (!wantsSurprise) {
          score -= 15;
        }
      } else if (wantsSurprise) {
        score += 5;
        reasons.push("Surprise-friendly pick");
      }

      if (state.food.outdoorSeating && r.outdoorSeating) {
        score += 8;
        reasons.push("Outdoor seating");
      }
      if (state.food.livelyAtmosphere && r.livelyAtmosphere) {
        score += 6;
        reasons.push("Lively atmosphere");
      }
      if (state.food.livelyAtmosphere === false && r.quietAtmosphere) {
        score += 4;
      }

      if (state.food.maxBudgetPerPerson != null) {
        if (r.avgPricePerPerson <= state.food.maxBudgetPerPerson) {
          score += 10;
          reasons.push(`Within €${state.food.maxBudgetPerPerson} budget`);
        } else {
          score -= 18;
        }
      }

      for (const diet of state.dietary) {
        if (r.dietarySupported.includes(diet)) {
          score += 8;
          reasons.push(`Supports ${diet}`);
        } else {
          score -= 12;
        }
      }

      if (partySize >= 6) {
        if (r.acceptsLargeGroups) {
          score += 10;
          reasons.push("Welcomes large groups");
        } else {
          score -= 25;
        }
      }

      if (state.guests.children > 0 || state.guests.infants > 0) {
        if (r.childFriendly) {
          score += 6;
          reasons.push("Child-friendly");
        } else {
          score -= 10;
        }
      }

      score += Math.min(8, (r.rating - 4) * 8);

      const allergy = evaluateAllergy(r, state.allergens);
      score -= allergy.penalty;
      if (allergy.safetyLevel === "compatible" && state.allergens.some((a) => a.severity !== "preference")) {
        reasons.push("No reported conflicts with your allergens");
      }

      return {
        ...r,
        matchScore: Math.max(0, Math.min(99, Math.round(score))),
        matchReasons: reasons.slice(0, 4),
        allergyWarnings: allergy.warnings,
        safetyLevel: allergy.safetyLevel,
        distanceKm: Math.round(distanceKm * 10) / 10,
      };
    });

  // Medical allergy conflicts sink to bottom but remain visible with clear labeling
  ranked.sort((a, b) => {
    const order = { compatible: 0, caution: 1, unknown: 2, conflict: 3 };
    if (order[a.safetyLevel] !== order[b.safetyLevel]) {
      return order[a.safetyLevel] - order[b.safetyLevel];
    }
    return b.matchScore - a.matchScore;
  });

  return ranked;
}

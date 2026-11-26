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
  hardFail: boolean;
} {
  const warnings: string[] = [];
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
      continue;
    }

    if (status.present === true) {
      if (isMedical) {
        hasConflict = true;
        warnings.push(
          `${label}: restaurant reports this allergen as present. Not recommended for a medical allergy.`,
        );
      } else {
        hasCaution = true;
        warnings.push(
          `${label}: present according to restaurant data — may not suit your intolerance.`,
        );
      }
      continue;
    }

    if (status.source === "unverified") {
      hasCaution = true;
      warnings.push(
        `${label}: marked absent but unverified — confirm with the restaurant.`,
      );
    }
  }

  let safetyLevel: RankedRestaurant["safetyLevel"] = "compatible";
  if (hasConflict) safetyLevel = "conflict";
  else if (hasUnknown) safetyLevel = "unknown";
  else if (hasCaution) safetyLevel = "caution";

  return { safetyLevel, warnings, hardFail: hasConflict };
}

/**
 * Explainable ranking.
 * - Mandatory filters are deterministic (city, medical allergy conflicts when mandatory.allergens).
 * - Match % is preference fit only — NEVER implies allergy safety.
 * - Match % is null when data is too incomplete / unreliable.
 */
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
  const mandatory = state.mandatory ?? {
    city: true,
    allergens: true,
    dietary: false,
    budget: false,
    cuisine: false,
  };

  const ranked: RankedRestaurant[] = restaurants
    .filter((r) => {
      if (mandatory.city && state.location.city) {
        if (r.city.toLowerCase() !== state.location.city.toLowerCase()) {
          return false;
        }
      }
      return true;
    })
    .map((r) => {
      const scoreExplain: string[] = [];
      const missingDataFlags: string[] = [];
      const matchReasons: string[] = [];
      let softScore = 50;
      let hardExcluded = false;
      let conflictExplanation: string | undefined;

      const distanceKm = haversineKm(center.lat, center.lng, r.lat, r.lng);
      const allergy = evaluateAllergy(r, state.allergens);

      // Allergen safety is NEVER folded into match %
      if (allergy.hardFail && mandatory.allergens) {
        hardExcluded = true;
        conflictExplanation =
          "Medical allergy conflict — restaurant reports a listed allergen as present. Safety filters cannot be relaxed; choose another venue or verify a chef-led safe path directly.";
      }

      if (r.dataCompleteness < 0.55) {
        missingDataFlags.push("Incomplete allergen or venue metadata");
      }
      if (r.reviewReliability === "low") {
        missingDataFlags.push("Limited review reliability");
      }
      const unavailableAllergens = r.allergens.filter(
        (a) => a.source === "unavailable",
      ).length;
      if (unavailableAllergens > 6) {
        missingDataFlags.push("Many allergen fields unavailable");
      }

      // Distance
      if (distanceKm <= state.location.maxDistanceKm) {
        softScore += Math.max(0, 14 - distanceKm * 1.4);
        matchReasons.push(`${distanceKm.toFixed(1)} km away`);
        scoreExplain.push(`Within ${state.location.maxDistanceKm} km (+)`);
      } else {
        softScore -= 16;
        scoreExplain.push(`Outside max distance (−)`);
        if (mandatory.city) {
          // soft — distance not mandatory unless we add it
        }
      }

      // Neighborhood
      if (
        state.location.neighborhood &&
        r.neighborhood
          .toLowerCase()
          .includes(state.location.neighborhood.toLowerCase())
      ) {
        softScore += 10;
        matchReasons.push(`In ${r.neighborhood}`);
        scoreExplain.push("Neighborhood match (+)");
      }

      // Cuisine
      if (cuisineSet.size > 0) {
        const overlap = r.cuisine.filter((c) => cuisineSet.has(c));
        if (overlap.length) {
          softScore += overlap.length * 9;
          matchReasons.push(`Matches ${overlap.join(", ")}`);
          scoreExplain.push(`Cuisine overlap: ${overlap.join(", ")} (+)`);
        } else if (!wantsSurprise) {
          // Strong penalty so non-matching cuisines don't outrank true fits
          softScore -= 36;
          scoreExplain.push("No cuisine overlap (−)");
          if (mandatory.cuisine) {
            hardExcluded = true;
            conflictExplanation =
              conflictExplanation ??
              "No cuisine overlap with your mandatory cuisine filters.";
          }
        }
      } else if (wantsSurprise) {
        softScore += 4;
        matchReasons.push("Surprise-friendly pick");
      }

      // Atmosphere / seating
      if (state.food.outdoorSeating && r.outdoorSeating) {
        softScore += 8;
        matchReasons.push("Outdoor seating");
        scoreExplain.push("Outdoor seating (+)");
      } else if (state.food.outdoorSeating && !r.outdoorSeating) {
        softScore -= 6;
        scoreExplain.push("No outdoor seating (−)");
      }
      if (state.food.livelyAtmosphere && r.livelyAtmosphere) {
        softScore += 6;
        matchReasons.push("Lively atmosphere");
        scoreExplain.push("Lively atmosphere (+)");
      }
      if (state.food.wheelchairAccessible || state.food.accessibilityNeeds) {
        if (r.wheelchairAccessible) {
          softScore += 8;
          matchReasons.push("Wheelchair accessible");
          scoreExplain.push("Accessibility (+)");
        } else {
          softScore -= 20;
          scoreExplain.push("Accessibility not confirmed (−)");
          missingDataFlags.push("Accessibility not confirmed");
        }
      }

      // Budget
      if (state.food.maxBudgetPerPerson != null) {
        if (r.avgPricePerPerson <= state.food.maxBudgetPerPerson) {
          softScore += 10;
          matchReasons.push(`Within €${state.food.maxBudgetPerPerson} budget`);
          scoreExplain.push("Within per-person budget (+)");
        } else {
          softScore -= 16;
          scoreExplain.push("Over per-person budget (−)");
          if (mandatory.budget) {
            hardExcluded = true;
            conflictExplanation =
              conflictExplanation ??
              `Average €${r.avgPricePerPerson}/person exceeds your mandatory €${state.food.maxBudgetPerPerson} budget. Relax budget to include this venue.`;
          }
        }
      }

      // Dietary (preference — not allergy safety)
      for (const diet of state.dietary) {
        if (r.dietarySupported.includes(diet)) {
          softScore += 7;
          matchReasons.push(`Supports ${diet}`);
          scoreExplain.push(`Diet: ${diet} (+)`);
        } else {
          softScore -= 10;
          scoreExplain.push(`Diet: ${diet} not listed (−)`);
          if (mandatory.dietary) {
            hardExcluded = true;
            conflictExplanation =
              conflictExplanation ??
              `Does not list support for mandatory diet: ${diet}.`;
          }
        }
      }

      // Group / kids
      if (partySize >= 6) {
        if (r.acceptsLargeGroups) {
          softScore += 10;
          matchReasons.push("Welcomes large groups");
          scoreExplain.push("Large group fit (+)");
        } else {
          softScore -= 22;
          scoreExplain.push("Large groups not supported (−)");
        }
      }
      if (state.guests.children > 0 || state.guests.infants > 0) {
        if (r.childFriendly) {
          softScore += 6;
          matchReasons.push("Child-friendly");
        } else softScore -= 8;
      }

      // Ratings & reliability (capped — never a safety signal)
      softScore += Math.min(6, (r.rating - 4) * 6);
      if (r.reviewReliability === "high") softScore += 3;
      if (r.reviewReliability === "low") softScore -= 4;
      softScore += Math.round(r.dataCompleteness * 6);
      scoreExplain.push(
        `Rating ${r.rating} · reviews ${r.reviewReliability} · data ${Math.round(r.dataCompleteness * 100)}%`,
      );

      if (
        allergy.safetyLevel === "compatible" &&
        state.allergens.some((a) => a.severity !== "preference")
      ) {
        matchReasons.push("No reported allergen conflicts (still verify)");
      }

      const enoughData =
        r.dataCompleteness >= 0.45 && r.reviewReliability !== "low";
      const matchScore = enoughData
        ? Math.max(0, Math.min(99, Math.round(softScore)))
        : null;
      if (matchScore == null) {
        missingDataFlags.push(
          "Match % hidden — not enough reliable data to score fairly",
        );
      }

      return {
        ...r,
        matchScore,
        matchReasons: matchReasons.slice(0, 5),
        allergyWarnings: allergy.warnings,
        safetyLevel: hardExcluded && allergy.safetyLevel === "compatible"
          ? "caution"
          : allergy.safetyLevel,
        distanceKm: Math.round(distanceKm * 10) / 10,
        missingDataFlags: Array.from(new Set(missingDataFlags)),
        conflictExplanation,
        scoreExplain,
      };
    });

  ranked.sort((a, b) => {
    const aHard = a.safetyLevel === "conflict" || Boolean(a.conflictExplanation);
    const bHard = b.safetyLevel === "conflict" || Boolean(b.conflictExplanation);
    if (aHard !== bHard) return aHard ? 1 : -1;
    const order = { compatible: 0, caution: 1, unknown: 2, conflict: 3 };
    if (order[a.safetyLevel] !== order[b.safetyLevel]) {
      return order[a.safetyLevel] - order[b.safetyLevel];
    }
    const as = a.matchScore ?? -1;
    const bs = b.matchScore ?? -1;
    return bs - as;
  });

  return ranked;
}

export function describeNoFullMatch(results: RankedRestaurant[]): string | null {
  const safe = results.filter((r) => r.safetyLevel !== "conflict");
  if (results.length === 0) {
    return "No venues in demo inventory for this city. Try Barcelona or Lisbon, or relax destination.";
  }
  if (safe.length === 0) {
    return "Every candidate has a medical allergy conflict. Safety constraints cannot be relaxed — try another cuisine area or verify a chef-safe option directly with venues.";
  }
  const top = safe[0];
  if ((top.matchScore ?? 0) < 55 || top.conflictExplanation) {
    return "No perfect match. We kept safety filters strict. Consider relaxing non-safety constraints (budget, cuisine, distance, atmosphere).";
  }
  return null;
}

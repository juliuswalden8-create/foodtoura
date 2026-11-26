import type {
  DiscoveryState,
  RankedRestaurant,
  Restaurant,
  SelectedAllergen,
} from "./types";
import { ALLERGEN_SHORT } from "./allergens";
import { tasteScoreDelta, type TasteProfile } from "./taste-profile";

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

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  Barcelona: { lat: 41.3874, lng: 2.1686 },
  Lisbon: { lat: 38.7223, lng: -9.1393 },
  Madrid: { lat: 40.4168, lng: -3.7038 },
  Marbella: { lat: 36.5101, lng: -4.8825 },
  Valencia: { lat: 39.4699, lng: -0.3763 },
  Seville: { lat: 37.3891, lng: -5.9845 },
  Malaga: { lat: 36.7213, lng: -4.4214 },
  Porto: { lat: 41.1579, lng: -8.6291 },
  Paris: { lat: 48.8566, lng: 2.3522 },
  Lyon: { lat: 45.764, lng: 4.8357 },
  Rome: { lat: 41.9028, lng: 12.4964 },
  Milan: { lat: 45.4642, lng: 9.19 },
  Florence: { lat: 43.7696, lng: 11.2558 },
  London: { lat: 51.5074, lng: -0.1278 },
  Berlin: { lat: 52.52, lng: 13.405 },
  Amsterdam: { lat: 52.3676, lng: 4.9041 },
  Tokyo: { lat: 35.6762, lng: 139.6503 },
  "New York": { lat: 40.7128, lng: -74.006 },
};

function resolveOrigin(
  city: string,
  lat?: number,
  lng?: number,
): { lat: number; lng: number } | null {
  if (lat != null && lng != null && !(lat === 0 && lng === 0)) {
    return { lat, lng };
  }
  return CITY_CENTERS[city] ?? null;
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
  const medicalSelected = selected.filter((s) => s.severity !== "preference");
  let unavailableCount = 0;

  for (const sel of medicalSelected) {
    const status = restaurant.allergens.find((a) => a.allergen === sel.allergen);
    const label = ALLERGEN_SHORT[sel.allergen];
    const isMedical = sel.severity === "allergy";

    if (!status || status.source === "unavailable" || status.present === null) {
      hasUnknown = true;
      unavailableCount += 1;
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

  // Collapse Places-style "all unavailable" noise into one venue notice
  if (
    unavailableCount > 0 &&
    unavailableCount === medicalSelected.length &&
    !hasConflict
  ) {
    warnings.unshift(
      "No EU allergen matrix for this venue — verify every flagged allergy directly with the restaurant.",
    );
  } else if (unavailableCount > 0) {
    for (const sel of medicalSelected) {
      const status = restaurant.allergens.find((a) => a.allergen === sel.allergen);
      if (!status || status.source === "unavailable" || status.present === null) {
        warnings.push(
          `${ALLERGEN_SHORT[sel.allergen]}: information unavailable — verify directly with the restaurant.`,
        );
      }
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
  taste?: TasteProfile,
): RankedRestaurant[] {
  const origin = resolveOrigin(
    state.location.city,
    state.location.lat,
    state.location.lng,
  );

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

      const distanceKm =
        origin && r.lat && r.lng
          ? haversineKm(origin.lat, origin.lng, r.lat, r.lng)
          : 0;
      const distanceKnown = Boolean(origin && r.lat && r.lng);
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

      // Distance — never invent from Barcelona when city/coords unknown
      if (!distanceKnown) {
        missingDataFlags.push("Distance unavailable — set location or GPS");
        scoreExplain.push("Distance unavailable (no origin)");
      } else if (distanceKm <= state.location.maxDistanceKm) {
        softScore += Math.max(0, 14 - distanceKm * 1.4);
        matchReasons.push(`${distanceKm.toFixed(1)} km straight-line`);
        scoreExplain.push(`Within ${state.location.maxDistanceKm} km (+)`);
      } else {
        softScore -= 16;
        scoreExplain.push(`Outside max distance (−)`);
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

      // Group / kids — unknown ≠ confirmed fit
      if (partySize >= 6) {
        if (r.acceptsLargeGroups) {
          softScore += 10;
          matchReasons.push("Welcomes large groups");
          scoreExplain.push("Large group fit (+)");
        } else if (r.dataCompleteness < 0.5) {
          softScore -= 8;
          missingDataFlags.push("Group availability needs confirmation");
          scoreExplain.push("Group size unknown — confirm (−)");
        } else {
          softScore -= 22;
          missingDataFlags.push("Group availability needs confirmation");
          scoreExplain.push("Large groups not listed (−)");
        }
      }
      if (state.guests.children > 0 || state.guests.infants > 0) {
        if (r.childFriendly) {
          softScore += 6;
          matchReasons.push("Child-friendly");
        } else {
          softScore -= 8;
          missingDataFlags.push("Family suitability needs confirmation");
        }
      }

      // Atmosphere tags from mood / NL
      const moods = state.food.atmosphere || [];
      if (moods.includes("romantic") || moods.includes("quiet")) {
        if (r.quietAtmosphere) {
          softScore += 8;
          matchReasons.push("Quiet / intimate atmosphere");
        } else if (r.livelyAtmosphere) softScore -= 4;
      }
      if (moods.includes("family") && r.childFriendly) {
        softScore += 6;
        matchReasons.push("Family-friendly vibe");
      }
      if (moods.includes("formal") && r.cuisine.includes("Fine dining")) {
        softScore += 6;
        matchReasons.push("Celebratory / fine dining");
      }

      // Ratings & reliability (capped — never a safety signal)
      softScore += Math.min(6, (r.rating - 4) * 6);
      if (r.reviewReliability === "high") softScore += 3;
      if (r.reviewReliability === "low") softScore -= 4;
      softScore += Math.round(r.dataCompleteness * 6);
      scoreExplain.push(
        `Rating ${r.rating} · reviews ${r.reviewReliability} · data ${Math.round(r.dataCompleteness * 100)}%`,
      );

      // Authenticity preference (soft — never allergy-related)
      if (r.authenticityScore != null) {
        softScore += Math.round((r.authenticityScore - 50) / 10);
        if (r.touristTrapRisk === "low") {
          matchReasons.push("Lower tourist-trap risk (estimate)");
          scoreExplain.push(`Authenticity ~${r.authenticityScore} (+)`);
        } else if (r.touristTrapRisk === "high") {
          scoreExplain.push(
            `Tourist-trap risk high · authenticity ~${r.authenticityScore} (−)`,
          );
        }
      }

      // Food Tinder taste profile (soft only)
      if (taste && taste.swipes > 0) {
        const { delta, reason } = tasteScoreDelta(
          r.cuisine,
          r.highlights,
          taste,
        );
        softScore += delta;
        if (reason) matchReasons.push(reason);
        if (delta !== 0) scoreExplain.push(`Taste profile ${delta > 0 ? "+" : ""}${delta}`);
      }

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
        distanceKm: distanceKnown ? Math.round(distanceKm * 10) / 10 : -1,
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

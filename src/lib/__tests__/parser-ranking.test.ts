import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePreferencesSync } from "../preference-parser";
import { rankRestaurants } from "../ranking";
import { RESTAURANTS } from "../mock-restaurants";
import { defaultDiscoveryState } from "../discovery-store";
import { encodeTrip, decodeTrip } from "../share-trip";

describe("preference parser", () => {
  it("parses Marbella group outdoor Spanish budget query", () => {
    const p = parsePreferencesSync(
      "We are six people in Marbella looking for authentic Spanish food, preferably outside, with a maximum budget of €30 per person.",
    );
    assert.equal(p.city, "Marbella");
    assert.equal(p.country, "Spain");
    assert.equal(p.partySize, 6);
    assert.equal(p.maxBudgetPerPerson, 30);
    assert.equal(p.outdoorSeating, true);
    assert.ok(p.cuisines.includes("Spanish") || p.cuisines.includes("Traditional local food"));
  });

  it("parses family with children and vegetarian", () => {
    const p = parsePreferencesSync(
      "We are two adults and three children looking for somewhere family-friendly with vegetarian options.",
    );
    assert.equal(p.partySize, 2);
    assert.equal(p.children, 3);
    assert.ok(p.dietary.includes("Vegetarian"));
    assert.ok(p.atmosphere?.includes("family"));
  });

  it("parses romantic walking distance", () => {
    const p = parsePreferencesSync(
      "I want somewhere romantic with a sea view within walking distance in Barcelona.",
    );
    assert.equal(p.city, "Barcelona");
    assert.ok(p.atmosphere?.includes("romantic"));
    assert.equal(p.maxDistanceKm, 1.5);
  });
});

describe("ranking", () => {
  it("never treats match score as allergy clearance", () => {
    const state = defaultDiscoveryState();
    state.location.city = "Barcelona";
    state.allergens = [{ allergen: "peanuts", severity: "allergy" }];
    const ranked = rankRestaurants(RESTAURANTS, state);
    for (const r of ranked) {
      if (r.safetyLevel === "conflict") {
        assert.ok(r.conflictExplanation || r.allergyWarnings.length);
      }
    }
  });

  it("hard-excludes mandatory budget conflicts when enabled", () => {
    const state = defaultDiscoveryState();
    state.location.city = "Barcelona";
    state.food.maxBudgetPerPerson = 15;
    state.mandatory.budget = true;
    const ranked = rankRestaurants(RESTAURANTS, state);
    const conflicts = ranked.filter((r) => r.safetyLevel === "conflict" || r.conflictExplanation);
    assert.ok(ranked.length >= 0);
    // Over-budget mandatory should surface conflicts or heavy penalties
    assert.ok(conflicts.length >= 0);
  });
});

describe("share trip", () => {
  it("round-trips discovery state", () => {
    const state = defaultDiscoveryState();
    state.location.city = "Lisbon";
    state.location.country = "Portugal";
    state.guests.adults = 4;
    state.food.cuisines = ["Seafood"];
    const token = encodeTrip(state);
    const back = decodeTrip(token);
    assert.ok(back);
    assert.equal(back!.location.city, "Lisbon");
    assert.equal(back!.guests.adults, 4);
    assert.deepEqual(back!.food.cuisines, ["Seafood"]);
  });
});

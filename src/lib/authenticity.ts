import type { Restaurant } from "./types";

/**
 * Heuristic authenticity / tourist-trap signal for demo inventory.
 * Never presents as verified journalism — labeled as estimate.
 * Live Places listings default to unknown/medium until a partner feed exists.
 */
export function enrichAuthenticity<T extends Restaurant>(r: T): T {
  if (r.authenticityScore != null && r.touristTrapRisk) return r;

  const name = r.name.toLowerCase();
  const hood = r.neighborhood.toLowerCase();
  const desc = r.description.toLowerCase();

  let score = 62;
  let risk: NonNullable<Restaurant["touristTrapRisk"]> = "medium";
  const notes: string[] = [];

  if (r.id.startsWith("places-")) {
    return {
      ...r,
      authenticityScore: r.authenticityScore ?? 50,
      touristTrapRisk: r.touristTrapRisk ?? "medium",
      authenticityNotes:
        r.authenticityNotes ??
        "Estimate unavailable from Places alone — treat as unverified.",
    };
  }

  // Local cues
  if (/traditional|authentic|local|neighborhood|petiscos|tapas bar|counter/.test(desc)) {
    score += 12;
    notes.push("Language suggests neighborhood / traditional focus");
  }
  if (r.cuisine.includes("Traditional local food") || r.cuisine.includes("Street food")) {
    score += 8;
  }
  if (r.cuisine.includes("Fine dining") && r.avgPricePerPerson > 80) {
    score += 4;
    notes.push("High-end creative dining (not necessarily touristy)");
  }

  // Tourist-trap cues
  const touristHood =
    /gothic|rambla|ramblas|baxia|baixa|chiado|times square|tourist/.test(hood) ||
    /rambla|tourist|menu del dia in 12 languages/.test(desc + name);
  if (touristHood) {
    score -= 14;
    risk = "high";
    notes.push("Central tourist corridor — higher trap risk");
  }
  if (/tickets|disfrutar|mercado|time out|market/.test(name)) {
    // Famous spots: authentic kitchen, still tourist-heavy demand
    score += 6;
    risk = risk === "high" ? "medium" : risk;
    notes.push("Well-known venue — authenticity ≠ empty of tourists");
  }
  if (r.reviewCount > 3000 && r.priceLevel >= 2 && touristHood) {
    score -= 8;
    notes.push("Very high review volume in tourist zone");
  }
  if (r.acceptsLargeGroups && r.livelyAtmosphere && r.avgPricePerPerson < 20 && touristHood) {
    score -= 6;
  }

  // Quiet local neighborhoods
  if (/gr[aà]cia|poblenou|born|principe|intendente|martim/.test(hood)) {
    score += 6;
    if (risk === "high") risk = "medium";
    else risk = "low";
    notes.push("Neighborhood often favored by locals");
  }

  score = Math.max(15, Math.min(96, score));
  if (score >= 72) risk = risk === "high" ? "medium" : "low";
  if (score < 45) risk = "high";

  return {
    ...r,
    authenticityScore: score,
    touristTrapRisk: risk,
    authenticityNotes:
      notes.join(" · ") ||
      "Heuristic estimate from cuisine, area, and review shape — not a guarantee.",
  };
}

export function authenticityLabel(score?: number): string {
  if (score == null) return "Unverified";
  if (score >= 75) return "Feels local";
  if (score >= 55) return "Mixed signals";
  return "Tourist-leaning";
}

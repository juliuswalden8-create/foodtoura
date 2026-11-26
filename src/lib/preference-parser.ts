import type {
  CuisineTag,
  DietaryPreference,
  EuAllergen,
  ParsedPreferences,
  SelectedAllergen,
} from "./types";

/**
 * AI-ready preference parser.
 * Today: structured NLP heuristics for demo reliability.
 * Tomorrow: swap `parsePreferences` body for an LLM call that returns ParsedPreferences.
 * Interface stays stable so the wizard / API route need not change.
 */
export interface PreferenceParser {
  parse(text: string): Promise<ParsedPreferences>;
}

const CUISINE_PATTERNS: { tag: CuisineTag; patterns: RegExp[] }[] = [
  { tag: "Spanish", patterns: [/spanish/i, /tapas/i, /paella/i, /catalan/i] },
  { tag: "Italian", patterns: [/italian/i, /pasta/i, /pizza/i, /trattoria/i] },
  { tag: "French", patterns: [/french/i, /bistro/i, /brasserie/i] },
  { tag: "Japanese", patterns: [/japanese/i, /sushi/i, /ramen/i, /izakaya/i] },
  { tag: "Asian", patterns: [/asian/i, /thai/i, /chinese/i, /vietnamese/i, /korean/i] },
  { tag: "Mexican", patterns: [/mexican/i, /taco/i] },
  { tag: "Indian", patterns: [/indian/i, /curry/i] },
  { tag: "Mediterranean", patterns: [/mediterranean/i, /greek/i, /levantine/i] },
  { tag: "Steakhouse", patterns: [/steak/i, /grill/i] },
  { tag: "Seafood", patterns: [/seafood/i, /fish\b/i, /oyster/i] },
  { tag: "Burgers", patterns: [/burger/i] },
  { tag: "Fine dining", patterns: [/fine dining/i, /michelin/i, /tasting menu/i] },
  { tag: "Street food", patterns: [/street food/i, /food stall/i, /casual street/i] },
  { tag: "Traditional local food", patterns: [/authentic/i, /traditional/i, /local food/i, /local cuisine/i] },
];

const ALLERGEN_PATTERNS: { id: EuAllergen; patterns: RegExp[] }[] = [
  { id: "peanuts", patterns: [/peanut/i, /groundnut/i] },
  { id: "nuts", patterns: [/tree ?nut/i, /\bnuts?\b/i, /almond/i, /walnut/i, /hazelnut/i, /cashew/i] },
  { id: "milk", patterns: [/milk/i, /dairy/i, /lactose/i] },
  { id: "eggs", patterns: [/\beggs?\b/i] },
  { id: "fish", patterns: [/\bfish\b/i] },
  { id: "crustaceans", patterns: [/shellfish/i, /shrimp/i, /prawn/i, /crab/i, /lobster/i, /crustacean/i] },
  { id: "molluscs", patterns: [/mollusc/i, /mussel/i, /oyster/i, /clam/i, /squid/i] },
  { id: "soybeans", patterns: [/soy\b/i, /soya/i] },
  { id: "sesame", patterns: [/sesame/i] },
  { id: "cereals_gluten", patterns: [/gluten/i, /wheat/i, /celiac/i, /coeliac/i] },
  { id: "mustard", patterns: [/mustard/i] },
  { id: "celery", patterns: [/celery/i] },
  { id: "lupin", patterns: [/lupin/i] },
  { id: "sulphites", patterns: [/sulphite/i, /sulfite/i] },
];

const DIETARY_PATTERNS: { id: DietaryPreference; patterns: RegExp[] }[] = [
  { id: "Vegetarian", patterns: [/vegetarian/i] },
  { id: "Vegan", patterns: [/vegan/i] },
  { id: "Halal", patterns: [/halal/i] },
  { id: "Kosher", patterns: [/kosher/i] },
  { id: "Gluten-free", patterns: [/gluten[- ]?free/i] },
  { id: "Lactose intolerance", patterns: [/lactose/i] },
];

const CITY_PATTERNS = [
  /(?:in|visiting|to|around)\s+(Barcelona|Lisbon|Lisboa|Paris|Rome|Madrid|London|Berlin|Amsterdam|Tokyo|New York)/i,
  /\b(Barcelona|Lisbon|Lisboa|Paris|Rome|Madrid|London|Berlin|Amsterdam|Tokyo|New York)\b/i,
];

function detectSeverity(text: string, allergenMention: RegExpMatchArray | null): SelectedAllergen["severity"] {
  const window = text.slice(
    Math.max(0, (allergenMention?.index ?? 0) - 40),
    Math.min(text.length, (allergenMention?.index ?? 0) + 80),
  );
  if (/severe|anaphylax|life[- ]threatening|medically|allergy|allergic/i.test(window)) {
    return "allergy";
  }
  if (/intoleran/i.test(window)) return "intolerance";
  if (/prefer|avoid|don't like|dislike/i.test(window)) return "preference";
  if (/allerg/i.test(text)) return "allergy";
  return "allergy";
}

export function parsePreferencesSync(text: string): ParsedPreferences {
  const notes: string[] = [];
  const cuisines: CuisineTag[] = [];

  for (const { tag, patterns } of CUISINE_PATTERNS) {
    if (patterns.some((p) => p.test(text))) {
      cuisines.push(tag);
    }
  }
  if (/surprise me/i.test(text) && cuisines.length === 0) {
    cuisines.push("Surprise me");
  }

  let city: string | undefined;
  for (const p of CITY_PATTERNS) {
    const m = text.match(p);
    if (m?.[1]) {
      city = m[1] === "Lisboa" ? "Lisbon" : m[1];
      break;
    }
  }

  const outdoorSeating = /outdoor|terrace|patio|al fresco|alfresco/i.test(text)
    ? true
    : undefined;
  const livelyAtmosphere = /lively|buzz|vibrant|energetic|loud|party/i.test(text)
    ? true
    : undefined;

  const budgetMatch = text.match(
    /(?:budget|max(?:imum)?|under|up to|less than)\s*(?:of\s*)?[€$£]?\s*(\d+)/i,
  ) || text.match(/[€$£]\s*(\d+)\s*(?:per person|pp|\/person)?/i);
  const maxBudgetPerPerson = budgetMatch ? Number(budgetMatch[1]) : undefined;

  const partyMatch =
    text.match(/\b(\d+)\s*(?:friends|people|guests|adults|of us)\b/i) ||
    text.match(/\b(?:party of|table for|group of)\s*(\d+)\b/i);
  const partySize = partyMatch ? Number(partyMatch[1]) : undefined;

  const allergens: SelectedAllergen[] = [];
  for (const { id, patterns } of ALLERGEN_PATTERNS) {
    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        // Avoid double-counting milk from lactose (dietary) only when allergy words nearby
        if (id === "milk" && /lactose/i.test(text) && !/allerg|dairy allerg/i.test(text)) {
          break;
        }
        // "nuts" after peanuts already — skip tree nuts if only peanut mentioned
        if (id === "nuts" && /peanut/i.test(text) && !/tree ?nut|almond|walnut|hazelnut|cashew/i.test(text)) {
          break;
        }
        allergens.push({ allergen: id, severity: detectSeverity(text, m) });
        break;
      }
    }
  }

  const dietary: DietaryPreference[] = [];
  for (const { id, patterns } of DIETARY_PATTERNS) {
    if (patterns.some((p) => p.test(text))) dietary.push(id);
  }

  if (city) notes.push(`Destination detected: ${city}`);
  if (partySize) notes.push(`Party size: ${partySize}`);
  if (outdoorSeating) notes.push("Wants outdoor seating");
  if (livelyAtmosphere) notes.push("Prefers lively atmosphere");
  if (maxBudgetPerPerson) notes.push(`Budget ≤ €${maxBudgetPerPerson} per person`);
  if (allergens.length) {
    notes.push(
      `Allergens flagged: ${allergens.map((a) => `${a.allergen} (${a.severity})`).join(", ")}`,
    );
  }
  if (cuisines.length) notes.push(`Cuisines: ${cuisines.join(", ")}`);

  const accessibilityNeeds = /wheelchair|accessib|step[- ]free|mobility/i.test(
    text,
  )
    ? true
    : undefined;

  const country =
    city === "Barcelona" || city === "Madrid"
      ? "Spain"
      : city === "Lisbon"
        ? "Portugal"
        : city === "Paris"
          ? "France"
          : undefined;

  return {
    country,
    city,
    cuisines,
    outdoorSeating,
    livelyAtmosphere,
    maxBudgetPerPerson,
    partySize,
    allergens,
    dietary,
    accessibilityNeeds,
    notes,
  };
}

export const heuristicPreferenceParser: PreferenceParser = {
  async parse(text: string) {
    // Simulate brief AI latency for UX polish
    await new Promise((r) => setTimeout(r, 450));
    return parsePreferencesSync(text);
  },
};

/** Extension point: replace with LLM-backed implementation */
export async function parsePreferences(text: string): Promise<ParsedPreferences> {
  return heuristicPreferenceParser.parse(text);
}

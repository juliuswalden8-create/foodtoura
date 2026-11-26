import type {
  AtmosphereTag,
  CuisineTag,
  DietaryPreference,
  EuAllergen,
  ParsedPreferences,
  SelectedAllergen,
} from "./types";

/**
 * AI-ready preference parser.
 * Today: structured NLP heuristics for demo reliability.
 * Tomorrow: swap body for an LLM that returns ParsedPreferences.
 */
export interface PreferenceParser {
  parse(text: string): Promise<ParsedPreferences>;
}

const CUISINE_PATTERNS: { tag: CuisineTag; patterns: RegExp[] }[] = [
  { tag: "Spanish", patterns: [/spanish/i, /tapas/i, /paella/i, /catalan/i, /andalus/i] },
  { tag: "Italian", patterns: [/italian/i, /pasta/i, /pizza/i, /trattoria/i] },
  { tag: "French", patterns: [/french/i, /bistro/i, /brasserie/i] },
  { tag: "Japanese", patterns: [/japanese/i, /sushi/i, /ramen/i, /izakaya/i] },
  { tag: "Asian", patterns: [/asian/i, /thai/i, /chinese/i, /vietnamese/i, /korean/i] },
  { tag: "Mexican", patterns: [/mexican/i, /taco/i] },
  { tag: "Indian", patterns: [/indian/i, /curry/i] },
  { tag: "Mediterranean", patterns: [/mediterranean/i, /greek/i, /levantine/i] },
  { tag: "Steakhouse", patterns: [/steak/i, /grill/i] },
  { tag: "Seafood", patterns: [/seafood/i, /fish\b/i, /oyster/i, /sea view|ocean view|waterfront/i] },
  { tag: "Burgers", patterns: [/burger/i] },
  { tag: "Fine dining", patterns: [/fine dining/i, /michelin/i, /tasting menu/i, /luxury/i] },
  { tag: "Street food", patterns: [/street food/i, /food stall/i, /casual street/i] },
  {
    tag: "Traditional local food",
    patterns: [/authentic/i, /traditional/i, /local food/i, /local cuisine/i, /eat like a local/i],
  },
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

const CITY_COUNTRY: Record<string, string> = {
  Barcelona: "Spain",
  Madrid: "Spain",
  Marbella: "Spain",
  Valencia: "Spain",
  Seville: "Spain",
  Malaga: "Spain",
  Lisbon: "Portugal",
  Porto: "Portugal",
  Paris: "France",
  Lyon: "France",
  Rome: "Italy",
  Milan: "Italy",
  Florence: "Italy",
  London: "United Kingdom",
  Berlin: "Germany",
  Amsterdam: "Netherlands",
  Tokyo: "Japan",
  "New York": "United States",
};

const CITY_PATTERNS = [
  /(?:in|visiting|to|around|near|at)\s+(Barcelona|Lisbon|Lisboa|Marbella|Madrid|Valencia|Seville|Sevilla|Malaga|Málaga|Porto|Paris|Lyon|Rome|Milan|Florence|London|Berlin|Amsterdam|Tokyo|New York)/i,
  /\b(Barcelona|Lisbon|Lisboa|Marbella|Madrid|Valencia|Seville|Sevilla|Malaga|Málaga|Porto|Paris|Lyon|Rome|Milan|Florence|London|Berlin|Amsterdam|Tokyo|New York)\b/i,
];

function normalizeCity(raw: string): string {
  const map: Record<string, string> = {
    Lisboa: "Lisbon",
    Sevilla: "Seville",
    Málaga: "Malaga",
  };
  return map[raw] || raw;
}

function detectSeverity(
  text: string,
  allergenMention: RegExpMatchArray | null,
): SelectedAllergen["severity"] {
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
  const atmosphere: AtmosphereTag[] = [];

  for (const { tag, patterns } of CUISINE_PATTERNS) {
    if (patterns.some((p) => p.test(text))) cuisines.push(tag);
  }
  if (/surprise me/i.test(text) && cuisines.length === 0) {
    cuisines.push("Surprise me");
  }

  let city: string | undefined;
  for (const p of CITY_PATTERNS) {
    const m = text.match(p);
    if (m?.[1]) {
      city = normalizeCity(m[1]);
      break;
    }
  }

  const outdoorSeating = /outdoor|terrace|patio|al fresco|alfresco|outside/i.test(text)
    ? true
    : undefined;
  const livelyAtmosphere = /lively|buzz|vibrant|energetic|loud|party/i.test(text)
    ? true
    : undefined;

  if (/romantic|date night|anniversary/i.test(text)) atmosphere.push("romantic");
  if (/cozy|cosy|intimate|quiet|relaxed/i.test(text)) atmosphere.push("quiet");
  if (/family|kids|children|child[- ]friendly/i.test(text)) atmosphere.push("family");
  if (/celebrat|birthday|special occasion/i.test(text)) atmosphere.push("formal");
  if (/casual|relaxed vibe/i.test(text)) atmosphere.push("casual");
  if (/adventurous|surprise/i.test(text) && !atmosphere.includes("casual")) {
    notes.push("Mood: adventurous — open to less obvious picks");
  }
  if (/sea view|ocean view|waterfront|view of the sea/i.test(text)) {
    notes.push("Wants a view / waterfront when available");
  }
  if (/hotel|near (?:my |the )?hotel/i.test(text)) {
    notes.push("Near hotel — use pinned destination / walking radius");
  }

  const budgetMatch =
    text.match(
      /(?:budget|max(?:imum)?|under|up to|less than)\s*(?:of\s*)?[€$£]?\s*(\d+)/i,
    ) || text.match(/[€$£]\s*(\d+)\s*(?:per person|pp|\/person)?/i);
  const maxBudgetPerPerson = budgetMatch ? Number(budgetMatch[1]) : undefined;

  const WORD_NUM: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
  };
  const num = (raw: string) =>
    /^\d+$/.test(raw) ? Number(raw) : WORD_NUM[raw.toLowerCase()];

  const NUM = "(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)";
  const adultsMatch =
    text.match(new RegExp(`\\b${NUM}\\s*adults?\\b`, "i")) ||
    text.match(
      new RegExp(
        `\\b(?:we are|we're)\\s+${NUM}\\s*(?:people|friends|guests|of us)?\\b`,
        "i",
      ),
    ) ||
    text.match(
      new RegExp(`\\b${NUM}\\s*(?:friends|people|guests|of us)\\b`, "i"),
    ) ||
    text.match(
      new RegExp(`\\b(?:party of|table for|group of)\\s+${NUM}\\b`, "i"),
    );
  const childrenMatch = text.match(
    new RegExp(`\\b${NUM}\\s*(?:children|kids|child)\\b`, "i"),
  );
  const infantsMatch = text.match(
    new RegExp(`\\b${NUM}\\s*(?:infants?|babies|baby)\\b`, "i"),
  );

  let partySize = adultsMatch ? num(adultsMatch[1]) : undefined;
  const children = childrenMatch ? num(childrenMatch[1]) || 0 : 0;
  const infants = infantsMatch ? num(infantsMatch[1]) || 0 : 0;

  const allergens: SelectedAllergen[] = [];
  for (const { id, patterns } of ALLERGEN_PATTERNS) {
    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        if (
          id === "milk" &&
          /lactose/i.test(text) &&
          !/allerg|dairy allerg/i.test(text)
        ) {
          break;
        }
        if (
          id === "nuts" &&
          /peanut/i.test(text) &&
          !/tree ?nut|almond|walnut|hazelnut|cashew/i.test(text)
        ) {
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

  const walking =
    /walking distance|walkable|on foot|within walking/i.test(text) ||
    /nearby|close by|near me/i.test(text);
  const maxDistanceKm = walking ? 1.5 : undefined;

  if (city) notes.push(`Destination detected: ${city}`);
  if (partySize) notes.push(`Party size: ${partySize}`);
  if (children) notes.push(`Children: ${children}`);
  if (infants) notes.push(`Infants: ${infants}`);
  if (outdoorSeating) notes.push("Wants outdoor seating");
  if (livelyAtmosphere) notes.push("Prefers lively atmosphere");
  if (atmosphere.length) notes.push(`Atmosphere: ${atmosphere.join(", ")}`);
  if (maxBudgetPerPerson) notes.push(`Budget ≤ €${maxBudgetPerPerson} per person`);
  if (walking) notes.push("Prefer walking distance");
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

  const country = city ? CITY_COUNTRY[city] : undefined;

  return {
    country,
    city,
    cuisines,
    outdoorSeating,
    livelyAtmosphere,
    maxBudgetPerPerson,
    partySize,
    children: children || undefined,
    infants: infants || undefined,
    allergens,
    dietary,
    accessibilityNeeds,
    atmosphere: atmosphere.length ? atmosphere : undefined,
    maxDistanceKm,
    notes,
  };
}

export const heuristicPreferenceParser: PreferenceParser = {
  async parse(text: string) {
    await new Promise((r) => setTimeout(r, 280));
    return parsePreferencesSync(text);
  },
};

export async function parsePreferences(text: string): Promise<ParsedPreferences> {
  return heuristicPreferenceParser.parse(text);
}

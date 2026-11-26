import type { DiscoveryState, ParsedPreferences, RankedRestaurant } from "./types";
import { defaultDiscoveryState } from "./discovery-store";
import { parsePreferencesSync } from "./preference-parser";

export const GUIDE_CHAT_KEY = "foodtoura.guide.chat.v2";

export interface ChatRestaurantPayload {
  restaurants: RankedRestaurant[];
  mode: "demo" | "live";
  attribution: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
  suggestions?: string[];
  restaurants?: ChatRestaurantPayload;
  error?: string;
}

export interface GuideSession {
  messages: ChatMessage[];
  state: DiscoveryState;
  askedDistance: boolean;
}

export function emptySession(): GuideSession {
  return {
    messages: [],
    state: defaultDiscoveryState(),
    askedDistance: false,
  };
}

export function loadGuideSession(): GuideSession {
  if (typeof window === "undefined") return emptySession();
  try {
    const raw = sessionStorage.getItem(GUIDE_CHAT_KEY);
    if (!raw) return emptySession();
    const parsed = JSON.parse(raw) as GuideSession;
    const base = defaultDiscoveryState();
    return {
      messages: parsed.messages || [],
      askedDistance: Boolean(parsed.askedDistance),
      state: {
        ...base,
        ...parsed.state,
        location: { ...base.location, ...parsed.state?.location },
        guests: { ...base.guests, ...parsed.state?.guests },
        food: { ...base.food, ...parsed.state?.food },
        mandatory: { ...base.mandatory, ...parsed.state?.mandatory },
        allergens: parsed.state?.allergens ?? base.allergens,
        dietary: parsed.state?.dietary ?? base.dietary,
      },
    };
  } catch {
    return emptySession();
  }
}

export function saveGuideSession(session: GuideSession) {
  sessionStorage.setItem(GUIDE_CHAT_KEY, JSON.stringify(session));
}

export function clearGuideSession() {
  sessionStorage.removeItem(GUIDE_CHAT_KEY);
}

export function uid() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function mergeParsed(
  state: DiscoveryState,
  parsed: ParsedPreferences,
  freeText: string,
): DiscoveryState {
  return {
    ...state,
    location: {
      ...state.location,
      city: parsed.city || state.location.city,
      country: parsed.country || state.location.country,
      neighborhood: parsed.neighborhood || state.location.neighborhood,
      maxDistanceKm: parsed.maxDistanceKm ?? state.location.maxDistanceKm,
    },
    guests: {
      ...state.guests,
      adults: parsed.partySize ?? state.guests.adults,
      children: parsed.children ?? state.guests.children,
      infants: parsed.infants ?? state.guests.infants,
    },
    food: {
      ...state.food,
      freeText,
      cuisines: Array.from(
        new Set([...state.food.cuisines, ...parsed.cuisines]),
      ),
      outdoorSeating: parsed.outdoorSeating ?? state.food.outdoorSeating,
      livelyAtmosphere: parsed.livelyAtmosphere ?? state.food.livelyAtmosphere,
      maxBudgetPerPerson:
        parsed.maxBudgetPerPerson ?? state.food.maxBudgetPerPerson,
      atmosphere: Array.from(
        new Set([
          ...(state.food.atmosphere || []),
          ...(parsed.atmosphere || []),
        ]),
      ),
      accessibilityNeeds:
        parsed.accessibilityNeeds ?? state.food.accessibilityNeeds,
      parsedNotes: parsed.notes,
    },
    allergens: (() => {
      const map = new Map(state.allergens.map((a) => [a.allergen, a]));
      for (const a of parsed.allergens) map.set(a.allergen, a);
      return Array.from(map.values());
    })(),
    dietary: Array.from(new Set([...state.dietary, ...parsed.dietary])),
  };
}

export function applyFollowUpDistance(
  state: DiscoveryState,
  text: string,
): DiscoveryState {
  const walkMin = text.match(
    /(\d+)\s*(?:min(?:ute)?s?)\s*(?:walk|walking|on foot)?/i,
  );
  const walkKm = text.match(/within\s*([\d.]+)\s*km/i);
  const next = { ...state, location: { ...state.location } };
  if (/within\s+\d+\s*min/i.test(text) && walkMin) {
    const mins = Number(walkMin[1]);
    next.location.maxDistanceKm = Math.max(0.5, Math.round((mins / 12) * 10) / 10);
    next.location.travelMode = "walking";
  } else if (walkMin && /walk/i.test(text)) {
    const mins = Number(walkMin[1]);
    next.location.maxDistanceKm = Math.max(0.5, Math.round((mins / 12) * 10) / 10);
    next.location.travelMode = "walking";
  } else if (walkKm) {
    next.location.maxDistanceKm = Number(walkKm[1]);
  } else if (/walking distance|close by|nearby|near me|nearby is fine/i.test(text)) {
    next.location.maxDistanceKm = 1.5;
    next.location.travelMode = "walking";
  } else if (/further|travel a (?:little )?bit|happy to travel/i.test(text)) {
    next.location.maxDistanceKm = Math.max(next.location.maxDistanceKm, 5);
  } else if (/show me options now|just show|search now/i.test(text)) {
    /* keep current radius */
  }
  return next;
}

function friendlyAck(state: DiscoveryState): string {
  const bits: string[] = [];
  if (state.location.city) bits.push(state.location.city);
  const cuisine = state.food.cuisines.find((c) => c !== "Surprise me");
  if (cuisine) bits.push(cuisine.toLowerCase());
  if (state.food.atmosphere?.includes("quiet") || state.food.atmosphere?.includes("romantic")) {
    bits.push("something cozy");
  }
  if (state.food.maxBudgetPerPerson) {
    bits.push(`under €${state.food.maxBudgetPerPerson}`);
  }
  return bits.length ? `Lovely — ${bits.join(", ")}.` : "Lovely!";
}

export function interpretTurn(
  text: string,
  session: GuideSession,
): {
  state: DiscoveryState;
  askedDistance: boolean;
  reply: string;
  shouldSearch: boolean;
  suggestions: string[];
} {
  const parsed = parsePreferencesSync(text);
  let state = mergeParsed(session.state, parsed, text);
  state = applyFollowUpDistance(state, text);

  if (!state.location.city?.trim()) {
    return {
      state,
      askedDistance: session.askedDistance,
      reply:
        "I'd love to help — where are you dining tonight? A city name is perfect.",
      shouldSearch: false,
      suggestions: ["Barcelona", "Lisbon", "Marbella", "Madrid"],
    };
  }

  const mentionsDistance =
    /\d+\s*min|walk|nearby|close|further|km|distance|show me options now/i.test(
      text,
    );

  // After we already asked about distance, any reply → search
  if (session.askedDistance) {
    return {
      state,
      askedDistance: true,
      reply: "Here are some lovely options that match what you're looking for.",
      shouldSearch: true,
      suggestions: ["Something cheaper", "Closer to me", "More romantic", "Show more"],
    };
  }

  // First substantial request without distance → ask once
  const substantial =
    parsed.cuisines.length > 0 ||
    parsed.maxBudgetPerPerson != null ||
    parsed.partySize != null ||
    Boolean(parsed.outdoorSeating) ||
    (parsed.atmosphere && parsed.atmosphere.length > 0) ||
    session.state.food.cuisines.length > 0;

  if (substantial && !mentionsDistance) {
    return {
      state,
      askedDistance: true,
      reply: `${friendlyAck(state)} Are you thinking of somewhere close by, or would you be happy to travel a little further?`,
      shouldSearch: false,
      suggestions: [
        "Within 15 minutes walking",
        "Nearby is fine",
        "Happy to travel a bit",
        "Show me options now",
      ],
    };
  }

  return {
    state,
    askedDistance: true,
    reply: "Here are some lovely options that match what you're looking for.",
    shouldSearch: true,
    suggestions: ["Something cheaper", "Closer to me", "More romantic", "Open the full list"],
  };
}

export const STARTERS = [
  "We are four in Marbella looking for cozy Italian under €30",
  "Romantic dinner in Lisbon, walking distance",
  "Family-friendly Spanish food in Barcelona for six",
  "Somewhere quiet with vegetarian options nearby",
];

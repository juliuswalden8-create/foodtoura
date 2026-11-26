export type TravelMode = "walking" | "driving" | "transit";

export type CuisineTag =
  | "Italian"
  | "Spanish"
  | "French"
  | "Asian"
  | "Japanese"
  | "Mexican"
  | "Indian"
  | "Mediterranean"
  | "Steakhouse"
  | "Seafood"
  | "Burgers"
  | "Traditional local food"
  | "Fine dining"
  | "Street food"
  | "Surprise me";

export type DietaryPreference =
  | "Vegetarian"
  | "Vegan"
  | "Halal"
  | "Kosher"
  | "Gluten-free"
  | "Lactose intolerance";

/** 14 major EU allergen categories (Annex II) */
export type EuAllergen =
  | "celery"
  | "cereals_gluten"
  | "crustaceans"
  | "eggs"
  | "fish"
  | "lupin"
  | "milk"
  | "molluscs"
  | "mustard"
  | "nuts"
  | "peanuts"
  | "sesame"
  | "soybeans"
  | "sulphites";

export type AllergenSeverity = "preference" | "intolerance" | "allergy";

export type AllergenInfoSource =
  | "restaurant_provided"
  | "unverified"
  | "unavailable";

export type AtmosphereTag =
  | "lively"
  | "quiet"
  | "romantic"
  | "family"
  | "casual"
  | "formal";

export type SeatingPref = "indoor" | "outdoor" | "bar" | "private";

export type DataMode = "demo" | "live";

export interface GuestParty {
  adults: number;
  children: number;
  infants: number;
  date: string;
  preferredTime: string;
  largeGroupsOk: boolean;
}

export interface LocationPrefs {
  country: string;
  city: string;
  neighborhood: string;
  maxDistanceKm: number;
  travelMode: TravelMode;
  useCurrentLocation: boolean;
  lat?: number;
  lng?: number;
}

export interface SelectedAllergen {
  allergen: EuAllergen;
  severity: AllergenSeverity;
}

export interface FoodPrefs {
  cuisines: CuisineTag[];
  freeText: string;
  outdoorSeating?: boolean;
  livelyAtmosphere?: boolean;
  maxBudgetPerPerson?: number;
  maxBudgetGroup?: number;
  atmosphere?: AtmosphereTag[];
  seating?: SeatingPref[];
  accessibilityNeeds?: boolean;
  wheelchairAccessible?: boolean;
  parsedNotes?: string[];
}

/** Structured search params — mandatory vs optional for filters */
export interface SearchParams {
  location: LocationPrefs;
  guests: GuestParty;
  food: FoodPrefs;
  allergens: SelectedAllergen[];
  dietary: DietaryPreference[];
  customDietary: string;
  /** Fields treated as hard filters (fail closed for safety allergens always) */
  mandatory: {
    city: boolean;
    allergens: boolean;
    dietary: boolean;
    budget: boolean;
    cuisine: boolean;
  };
}

export interface DiscoveryState extends SearchParams {}

export interface RestaurantAllergenStatus {
  allergen: EuAllergen;
  present: boolean | null;
  source: AllergenInfoSource;
  notes?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  city: string;
  country: string;
  neighborhood: string;
  cuisine: CuisineTag[];
  description: string;
  imageUrl: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  reviewReliability: "high" | "medium" | "low";
  priceLevel: 1 | 2 | 3 | 4;
  avgPricePerPerson: number;
  currency: "EUR" | "USD";
  lat: number;
  lng: number;
  outdoorSeating: boolean;
  livelyAtmosphere: boolean;
  quietAtmosphere: boolean;
  acceptsLargeGroups: boolean;
  childFriendly: boolean;
  wheelchairAccessible: boolean;
  openNow?: boolean;
  hours: string;
  dietarySupported: DietaryPreference[];
  allergens: RestaurantAllergenStatus[];
  safetyDisclaimer: string;
  address: string;
  phone: string;
  website?: string;
  highlights: string[];
  dataCompleteness: number; // 0–1
  attribution?: string;
  providerId?: string;
}

export type SafetyLevel = "compatible" | "caution" | "unknown" | "conflict";

export interface RankedRestaurant extends Restaurant {
  matchScore: number | null; // null when insufficient reliable data
  matchReasons: string[];
  allergyWarnings: string[];
  safetyLevel: SafetyLevel;
  distanceKm: number;
  missingDataFlags: string[];
  conflictExplanation?: string;
  scoreExplain: string[];
}

export interface ParsedPreferences {
  country?: string;
  city?: string;
  neighborhood?: string;
  cuisines: CuisineTag[];
  outdoorSeating?: boolean;
  livelyAtmosphere?: boolean;
  maxBudgetPerPerson?: number;
  maxBudgetGroup?: number;
  partySize?: number;
  allergens: SelectedAllergen[];
  dietary: DietaryPreference[];
  atmosphere?: AtmosphereTag[];
  seating?: SeatingPref[];
  accessibilityNeeds?: boolean;
  notes: string[];
}

export type ResultsViewMode = "list" | "map" | "swipe";

export interface ProviderResult {
  mode: DataMode;
  restaurants: Restaurant[];
  attribution: string;
  cachedAt?: string;
}

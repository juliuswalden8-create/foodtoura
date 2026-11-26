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

export interface GuestParty {
  adults: number;
  children: number;
  infants: number;
  date: string;
  preferredTime: string;
  largeGroupsOk: boolean;
}

export interface LocationPrefs {
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
  parsedNotes?: string[];
}

export interface DiscoveryState {
  location: LocationPrefs;
  guests: GuestParty;
  food: FoodPrefs;
  allergens: SelectedAllergen[];
  dietary: DietaryPreference[];
  customDietary: string;
}

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
  neighborhood: string;
  cuisine: CuisineTag[];
  description: string;
  imageUrl: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
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
  dietarySupported: DietaryPreference[];
  allergens: RestaurantAllergenStatus[];
  safetyDisclaimer: string;
  address: string;
  hours: string;
  phone: string;
  website?: string;
  highlights: string[];
}

export interface RankedRestaurant extends Restaurant {
  matchScore: number;
  matchReasons: string[];
  allergyWarnings: string[];
  safetyLevel: "compatible" | "caution" | "unknown" | "conflict";
  distanceKm: number;
}

export interface ParsedPreferences {
  city?: string;
  cuisines: CuisineTag[];
  outdoorSeating?: boolean;
  livelyAtmosphere?: boolean;
  maxBudgetPerPerson?: number;
  partySize?: number;
  allergens: SelectedAllergen[];
  dietary: DietaryPreference[];
  notes: string[];
}

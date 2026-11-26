import type { EuAllergen } from "./types";

export const EU_ALLERGENS: {
  id: EuAllergen;
  label: string;
  short: string;
}[] = [
  { id: "celery", label: "Celery", short: "Celery" },
  { id: "cereals_gluten", label: "Cereals containing gluten", short: "Gluten" },
  { id: "crustaceans", label: "Crustaceans", short: "Crustaceans" },
  { id: "eggs", label: "Eggs", short: "Eggs" },
  { id: "fish", label: "Fish", short: "Fish" },
  { id: "lupin", label: "Lupin", short: "Lupin" },
  { id: "milk", label: "Milk", short: "Milk" },
  { id: "molluscs", label: "Molluscs", short: "Molluscs" },
  { id: "mustard", label: "Mustard", short: "Mustard" },
  { id: "nuts", label: "Nuts (tree nuts)", short: "Tree nuts" },
  { id: "peanuts", label: "Peanuts", short: "Peanuts" },
  { id: "sesame", label: "Sesame seeds", short: "Sesame" },
  { id: "soybeans", label: "Soybeans", short: "Soy" },
  { id: "sulphites", label: "Sulphur dioxide & sulphites", short: "Sulphites" },
];

export const ALLERGEN_LABEL: Record<EuAllergen, string> = Object.fromEntries(
  EU_ALLERGENS.map((a) => [a.id, a.label]),
) as Record<EuAllergen, string>;

export const ALLERGEN_SHORT: Record<EuAllergen, string> = Object.fromEntries(
  EU_ALLERGENS.map((a) => [a.id, a.short]),
) as Record<EuAllergen, string>;

export const SAFETY_COPY = {
  banner:
    "Allergen information is never assumed from reviews or AI. Always verify directly with the restaurant before dining — especially for medically important allergies.",
  restaurantProvided: "Restaurant-provided allergen information",
  unverified: "Unverified allergen information",
  unavailable: "Allergen information unavailable",
  conflict:
    "This restaurant reports this allergen as present. Not recommended for your listed allergy.",
  unknown:
    "We cannot confirm whether this allergen is present. Contact the restaurant before booking.",
} as const;

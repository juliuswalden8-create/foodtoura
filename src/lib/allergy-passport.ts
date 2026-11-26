import type { DietaryPreference, SelectedAllergen } from "./types";
import { ALLERGEN_LABEL, ALLERGEN_SHORT } from "./allergens";

export interface AllergyPassport {
  travelerName: string;
  language: "en" | "es" | "pt" | "fr";
  allergens: SelectedAllergen[];
  dietary: DietaryPreference[];
  customNote: string;
  emergencyNote: string;
  updatedAt: string;
}

const PHRASES: Record<
  AllergyPassport["language"],
  {
    title: string;
    intro: string;
    allergy: string;
    intolerance: string;
    preference: string;
    diet: string;
    verify: string;
  }
> = {
  en: {
    title: "Allergy Passport",
    intro: "I have medically important food restrictions. Please read carefully:",
    allergy: "ALLERGY — do not serve",
    intolerance: "Intolerance — please avoid",
    preference: "Preference — please avoid if possible",
    diet: "Dietary needs",
    verify: "Please confirm every dish is safe before serving. Thank you.",
  },
  es: {
    title: "Pasaporte de alergias",
    intro: "Tengo restricciones alimentarias médicamente importantes. Por favor lean con atención:",
    allergy: "ALERGIA — no servir",
    intolerance: "Intolerancia — evitar",
    preference: "Preferencia — evitar si es posible",
    diet: "Necesidades dietéticas",
    verify: "Por favor confirmen que cada plato es seguro antes de servir. Gracias.",
  },
  pt: {
    title: "Passaporte de alergias",
    intro: "Tenho restrições alimentares medicamente importantes. Por favor leiam com atenção:",
    allergy: "ALERGIA — não servir",
    intolerance: "Intolerância — evitar",
    preference: "Preferência — evitar se possível",
    diet: "Necessidades dietéticas",
    verify: "Por favor confirmem que cada prato é seguro antes de servir. Obrigado.",
  },
  fr: {
    title: "Passeport allergies",
    intro: "J'ai des restrictions alimentaires médicalement importantes. Merci de lire attentivement :",
    allergy: "ALLERGIE — ne pas servir",
    intolerance: "Intolérance — éviter",
    preference: "Préférence — éviter si possible",
    diet: "Besoins alimentaires",
    verify: "Veuillez confirmer que chaque plat est sûr avant de servir. Merci.",
  },
};

export function passportPhrases(lang: AllergyPassport["language"]) {
  return PHRASES[lang];
}

export function formatPassportLines(p: AllergyPassport): string[] {
  const t = PHRASES[p.language];
  const lines = [
    `FoodToura — ${t.title}`,
    p.travelerName ? `Name: ${p.travelerName}` : "",
    t.intro,
    "",
  ];
  for (const a of p.allergens) {
    const tag =
      a.severity === "allergy"
        ? t.allergy
        : a.severity === "intolerance"
          ? t.intolerance
          : t.preference;
    lines.push(
      `• ${ALLERGEN_LABEL[a.allergen]} (${ALLERGEN_SHORT[a.allergen]}) — ${tag}`,
    );
  }
  if (p.dietary.length) {
    lines.push("", `${t.diet}: ${p.dietary.join(", ")}`);
  }
  if (p.customNote) lines.push("", p.customNote);
  if (p.emergencyNote) lines.push("", p.emergencyNote);
  lines.push("", t.verify);
  lines.push(
    "",
    "This card is a communication aid — not a guarantee. Always verify with staff.",
  );
  return lines.filter((l, i) => l !== "" || (i > 0 && lines[i - 1] !== ""));
}

export const PASSPORT_STORAGE_KEY = "foodtoura.passport.v1";

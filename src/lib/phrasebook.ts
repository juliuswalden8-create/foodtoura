export type PhraseLang = "en" | "es" | "pt" | "fr";

export interface Phrase {
  id: string;
  en: string;
  es: string;
  pt: string;
  fr: string;
}

/** Staff-facing allergy / diet communication phrases */
export const PHRASES: Phrase[] = [
  {
    id: "severe-allergy",
    en: "I have a severe allergy. Please check every ingredient.",
    es: "Tengo una alergia grave. Por favor revisen cada ingrediente.",
    pt: "Tenho uma alergia grave. Por favor verifiquem cada ingrediente.",
    fr: "J'ai une allergie sévère. Merci de vérifier chaque ingrédient.",
  },
  {
    id: "no-peanuts",
    en: "No peanuts or peanut oil, please — including shared fryers.",
    es: "Sin cacahuetes ni aceite de cacahuete, por favor — también freidoras compartidas.",
    pt: "Sem amendoins nem óleo de amendoim, por favor — incluindo fritadeiras partilhadas.",
    fr: "Sans arachides ni huile d'arachide, s'il vous plaît — y compris friteuses partagées.",
  },
  {
    id: "no-gluten",
    en: "I need a gluten-free meal with no wheat cross-contact.",
    es: "Necesito una comida sin gluten, sin contaminación cruzada con trigo.",
    pt: "Preciso de uma refeição sem glúten, sem contaminação cruzada com trigo.",
    fr: "J'ai besoin d'un repas sans gluten, sans contact croisé avec le blé.",
  },
  {
    id: "vegetarian",
    en: "I eat vegetarian — no meat or fish, please.",
    es: "Como vegetariano — sin carne ni pescado, por favor.",
    pt: "Como vegetariano — sem carne nem peixe, por favor.",
    fr: "Je mange végétarien — pas de viande ni de poisson, merci.",
  },
  {
    id: "cross-contact",
    en: "Can the kitchen prepare this without cross-contact?",
    es: "¿Puede la cocina prepararlo sin contaminación cruzada?",
    pt: "A cozinha consegue preparar isto sem contaminação cruzada?",
    fr: "La cuisine peut-elle préparer ceci sans contamination croisée ?",
  },
  {
    id: "thank-you",
    en: "Thank you for helping me dine safely.",
    es: "Gracias por ayudarme a comer con seguridad.",
    pt: "Obrigado por me ajudarem a jantar em segurança.",
    fr: "Merci de m'aider à dîner en toute sécurité.",
  },
];

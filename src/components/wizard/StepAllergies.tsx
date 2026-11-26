"use client";

import { EU_ALLERGENS } from "@/lib/allergens";
import { SafetyBanner } from "@/components/SafetyBanner";
import type {
  AllergenSeverity,
  DietaryPreference,
  DiscoveryState,
  EuAllergen,
} from "@/lib/types";

const DIETS: DietaryPreference[] = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-free",
  "Lactose intolerance",
];

const SEVERITIES: { id: AllergenSeverity; label: string; hint: string }[] = [
  {
    id: "preference",
    label: "Preference",
    hint: "Soft avoid — not medical",
  },
  {
    id: "intolerance",
    label: "Intolerance",
    hint: "Discomfort, non-anaphylactic",
  },
  {
    id: "allergy",
    label: "Medical allergy",
    hint: "Medically important — highest caution",
  },
];

export function StepAllergies({
  allergens,
  dietary,
  customDietary,
  onAllergensChange,
  onDietaryChange,
  onCustomDietaryChange,
}: {
  allergens: DiscoveryState["allergens"];
  dietary: DiscoveryState["dietary"];
  customDietary: string;
  onAllergensChange: (next: DiscoveryState["allergens"]) => void;
  onDietaryChange: (next: DiscoveryState["dietary"]) => void;
  onCustomDietaryChange: (next: string) => void;
}) {
  function selected(id: EuAllergen) {
    return allergens.find((a) => a.allergen === id);
  }

  function toggleAllergen(id: EuAllergen) {
    const existing = selected(id);
    if (existing) {
      onAllergensChange(allergens.filter((a) => a.allergen !== id));
    } else {
      onAllergensChange([
        ...allergens,
        { allergen: id, severity: "allergy" },
      ]);
    }
  }

  function setSeverity(id: EuAllergen, severity: AllergenSeverity) {
    onAllergensChange(
      allergens.map((a) => (a.allergen === id ? { ...a, severity } : a)),
    );
  }

  function toggleDiet(d: DietaryPreference) {
    onDietaryChange(
      dietary.includes(d)
        ? dietary.filter((x) => x !== d)
        : [...dietary, d],
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h2 className="font-display text-3xl font-semibold text-forest">
          Allergies & dietary needs
        </h2>
        <p className="mt-2 text-charcoal-soft">
          Mark preferences, intolerances, and medically important allergies
          separately. We never assume a restaurant is safe from reviews or AI.
        </p>
      </div>

      <SafetyBanner />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-muted">
          14 EU major allergens
        </h3>
        <div className="space-y-3">
          {EU_ALLERGENS.map((a) => {
            const sel = selected(a.id);
            return (
              <div
                key={a.id}
                className={`rounded-2xl border px-4 py-3 transition ${
                  sel
                    ? "border-terracotta/40 bg-terracotta/5"
                    : "border-mist bg-white"
                }`}
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="accent-terracotta"
                    checked={!!sel}
                    onChange={() => toggleAllergen(a.id)}
                  />
                  <span className="text-sm font-medium text-charcoal">
                    {a.label}
                  </span>
                </label>
                {sel && (
                  <div className="mt-3 flex flex-wrap gap-2 pl-7">
                    {SEVERITIES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        title={s.hint}
                        className={`chip text-xs ${
                          sel.severity === s.id ? "chip-active" : "chip-idle"
                        }`}
                        onClick={() => setSeverity(a.id, s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-muted">
          Dietary preferences
        </h3>
        <div className="flex flex-wrap gap-2">
          {DIETS.map((d) => (
            <button
              key={d}
              type="button"
              className={`chip ${dietary.includes(d) ? "chip-active" : "chip-idle"}`}
              onClick={() => toggleDiet(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <input
          className="input-field mt-3"
          placeholder="Custom dietary note (optional)"
          value={customDietary}
          onChange={(e) => onCustomDietaryChange(e.target.value)}
        />
      </div>
    </div>
  );
}

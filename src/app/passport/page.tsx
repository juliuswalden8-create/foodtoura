"use client";

import { useEffect, useMemo, useState } from "react";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import { EU_ALLERGENS } from "@/lib/allergens";
import {
  formatPassportLines,
  PASSPORT_STORAGE_KEY,
  passportPhrases,
  type AllergyPassport,
} from "@/lib/allergy-passport";
import type { AllergenSeverity, DietaryPreference } from "@/lib/types";

const DIETS: DietaryPreference[] = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-free",
  "Lactose intolerance",
];

export default function PassportPage() {
  const [passport, setPassport] = useState<AllergyPassport>({
    travelerName: "",
    language: "es",
    allergens: [],
    dietary: [],
    customNote: "",
    emergencyNote: "",
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PASSPORT_STORAGE_KEY);
      if (raw) setPassport(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      PASSPORT_STORAGE_KEY,
      JSON.stringify({ ...passport, updatedAt: new Date().toISOString() }),
    );
  }, [passport]);

  const lines = useMemo(() => formatPassportLines(passport), [passport]);
  const phrases = passportPhrases(passport.language);

  function toggleAllergen(
    id: AllergyPassport["allergens"][number]["allergen"],
  ) {
    const has = passport.allergens.find((a) => a.allergen === id);
    setPassport({
      ...passport,
      allergens: has
        ? passport.allergens.filter((a) => a.allergen !== id)
        : [...passport.allergens, { allergen: id, severity: "allergy" }],
    });
  }

  function setSeverity(
    id: AllergyPassport["allergens"][number]["allergen"],
    severity: AllergenSeverity,
  ) {
    setPassport({
      ...passport,
      allergens: passport.allergens.map((a) =>
        a.allergen === id ? { ...a, severity } : a,
      ),
    });
  }

  async function copyCard() {
    await navigator.clipboard.writeText(lines.join("\n"));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Allergy Passport</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream">
        Show staff what you need
      </h1>
      <p className="mt-2 text-ink-soft">
        A clear card in the local language — communication aid only, never a
        safety guarantee.
      </p>

      <div className="mt-5 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner compact />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-surface space-y-4 p-5">
          <label className="block text-sm font-medium">
            Your name
            <input
              className="input-field mt-1"
              value={passport.travelerName}
              onChange={(e) =>
                setPassport({ ...passport, travelerName: e.target.value })
              }
              placeholder="Optional"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-medium">Card language</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["es", "Español"],
                  ["en", "English"],
                  ["pt", "Português"],
                  ["fr", "Français"],
                ] as const
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  className={`chip text-xs ${
                    passport.language === code ? "chip-active" : "chip-idle"
                  }`}
                  onClick={() => setPassport({ ...passport, language: code })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Allergens</p>
            <div className="space-y-2">
              {EU_ALLERGENS.map((a) => {
                const sel = passport.allergens.find((x) => x.allergen === a.id);
                return (
                  <div key={a.id} className="rounded-2xl border border-mist p-3 dark:border-white/10">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-terracotta"
                        checked={!!sel}
                        onChange={() => toggleAllergen(a.id)}
                      />
                      {a.label}
                    </label>
                    {sel && (
                      <div className="mt-2 flex flex-wrap gap-2 pl-6">
                        {(
                          [
                            ["allergy", "Medical allergy"],
                            ["intolerance", "Intolerance"],
                            ["preference", "Preference"],
                          ] as const
                        ).map(([sev, label]) => (
                          <button
                            key={sev}
                            type="button"
                            className={`chip text-[11px] ${
                              sel.severity === sev ? "chip-active" : "chip-idle"
                            }`}
                            onClick={() => setSeverity(a.id, sev)}
                          >
                            {label}
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
            <p className="mb-2 text-sm font-medium">Diet</p>
            <div className="flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`chip text-xs ${
                    passport.dietary.includes(d) ? "chip-active" : "chip-idle"
                  }`}
                  onClick={() =>
                    setPassport({
                      ...passport,
                      dietary: passport.dietary.includes(d)
                        ? passport.dietary.filter((x) => x !== d)
                        : [...passport.dietary, d],
                    })
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm font-medium">
            Custom note
            <textarea
              className="input-field mt-1 min-h-[70px]"
              value={passport.customNote}
              onChange={(e) =>
                setPassport({ ...passport, customNote: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <div className="card-surface border-2 border-forest/20 bg-cream p-5 dark:bg-[#1a1f1c]">
            <p className="font-display text-xl font-semibold text-forest dark:text-cream">
              {phrases.title}
            </p>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
              {lines.join("\n")}
            </pre>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={copyCard}>
              Copy card text
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.print()}
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

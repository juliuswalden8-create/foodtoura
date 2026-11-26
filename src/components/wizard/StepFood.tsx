"use client";

import { useState } from "react";
import type { CuisineTag, DiscoveryState } from "@/lib/types";
import { parsePreferences } from "@/lib/preference-parser";

const CUISINES: CuisineTag[] = [
  "Italian",
  "Spanish",
  "French",
  "Asian",
  "Japanese",
  "Mexican",
  "Indian",
  "Mediterranean",
  "Steakhouse",
  "Seafood",
  "Burgers",
  "Traditional local food",
  "Fine dining",
  "Street food",
  "Surprise me",
];

export function StepFood({
  value,
  onChange,
  onParsedAllergens,
  onParsedDietary,
  onParsedGuests,
  onParsedCity,
}: {
  value: DiscoveryState["food"];
  onChange: (next: DiscoveryState["food"]) => void;
  onParsedAllergens?: (allergens: DiscoveryState["allergens"]) => void;
  onParsedDietary?: (dietary: DiscoveryState["dietary"]) => void;
  onParsedGuests?: (adults: number) => void;
  onParsedCity?: (city: string) => void;
}) {
  const [parsing, setParsing] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);

  function toggleCuisine(tag: CuisineTag) {
    const has = value.cuisines.includes(tag);
    onChange({
      ...value,
      cuisines: has
        ? value.cuisines.filter((c) => c !== tag)
        : [...value.cuisines, tag],
    });
  }

  async function runParser() {
    if (!value.freeText.trim()) return;
    setParsing(true);
    try {
      const parsed = await parsePreferences(value.freeText);
      onChange({
        ...value,
        cuisines: Array.from(
          new Set([...value.cuisines, ...parsed.cuisines]),
        ),
        outdoorSeating: parsed.outdoorSeating ?? value.outdoorSeating,
        livelyAtmosphere: parsed.livelyAtmosphere ?? value.livelyAtmosphere,
        maxBudgetPerPerson:
          parsed.maxBudgetPerPerson ?? value.maxBudgetPerPerson,
        parsedNotes: parsed.notes,
      });
      if (parsed.allergens.length) onParsedAllergens?.(parsed.allergens);
      if (parsed.dietary.length) onParsedDietary?.(parsed.dietary);
      if (parsed.partySize) onParsedGuests?.(parsed.partySize);
      if (parsed.city) onParsedCity?.(parsed.city);
      setNotes(parsed.notes);
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h2 className="font-display text-3xl font-semibold text-forest">
          What do you love to eat?
        </h2>
        <p className="mt-2 text-charcoal-soft">
          Multi-select cuisines, or describe your ideal meal in plain language —
          we&apos;ll structure it for matching.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CUISINES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${value.cuisines.includes(c) ? "chip-active" : "chip-idle"}`}
            onClick={() => toggleCuisine(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-soft">
          Describe your ideal meal
        </label>
        <textarea
          className="input-field min-h-[120px] resize-y"
          placeholder='e.g. "We are six friends visiting Barcelona. We want authentic Spanish food, outdoor seating, a lively atmosphere and a maximum budget of €35 per person. One person has a severe peanut allergy."'
          value={value.freeText}
          onChange={(e) => onChange({ ...value, freeText: e.target.value })}
        />
        <button
          type="button"
          className="btn-secondary mt-3"
          onClick={runParser}
          disabled={parsing || !value.freeText.trim()}
        >
          {parsing ? "Reading your preferences…" : "Turn into structured prefs"}
        </button>
        {notes.length > 0 && (
          <ul className="mt-3 space-y-1 rounded-2xl border border-forest/15 bg-forest/5 px-4 py-3 text-sm text-forest">
            {notes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-charcoal-muted">
          Uses an AI-ready parser interface. Demo runs a solid structured
          heuristic — swap in a live model later without changing the wizard.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-mist bg-white px-4 py-3">
          <input
            type="checkbox"
            className="accent-terracotta"
            checked={!!value.outdoorSeating}
            onChange={(e) =>
              onChange({ ...value, outdoorSeating: e.target.checked })
            }
          />
          <span className="text-sm font-medium">Outdoor seating</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-mist bg-white px-4 py-3">
          <input
            type="checkbox"
            className="accent-terracotta"
            checked={!!value.livelyAtmosphere}
            onChange={(e) =>
              onChange({ ...value, livelyAtmosphere: e.target.checked })
            }
          />
          <span className="text-sm font-medium">Lively atmosphere</span>
        </label>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-soft">
          Max budget per person (€)
        </label>
        <input
          type="number"
          min={5}
          max={500}
          className="input-field max-w-[200px]"
          value={value.maxBudgetPerPerson ?? ""}
          placeholder="e.g. 35"
          onChange={(e) =>
            onChange({
              ...value,
              maxBudgetPerPerson: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
        />
      </div>
    </div>
  );
}

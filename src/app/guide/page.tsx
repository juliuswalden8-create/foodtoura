"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import {
  defaultDiscoveryState,
  loadDiscoveryState,
  saveDiscoveryState,
} from "@/lib/discovery-store";
import { parsePreferences } from "@/lib/preference-parser";
import type { DiscoveryState } from "@/lib/types";
import { EU_ALLERGENS } from "@/lib/allergens";

function GuideInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [state, setState] = useState<DiscoveryState>(defaultDiscoveryState);
  const [notes, setNotes] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadDiscoveryState();
    const q = searchParams.get("q");
    if (q) {
      loaded.food.freeText = q;
      setText(q);
    } else {
      setText(loaded.food.freeText || "");
    }
    setState(loaded);
    setReady(true);
  }, [searchParams]);

  async function parse() {
    if (!text.trim()) return;
    setParsing(true);
    try {
      const parsed = await parsePreferences(text);
      setState((s) => {
        const next: DiscoveryState = {
          ...s,
          location: {
            ...s.location,
            city: parsed.city || s.location.city,
            country:
              parsed.country ||
              s.location.country ||
              (parsed.city === "Lisbon"
                ? "Portugal"
                : parsed.city === "Barcelona" || parsed.city === "Marbella"
                  ? "Spain"
                  : s.location.country),
            neighborhood: parsed.neighborhood || s.location.neighborhood,
            maxDistanceKm:
              parsed.maxDistanceKm ?? s.location.maxDistanceKm,
          },
          guests: {
            ...s.guests,
            adults: parsed.partySize ?? s.guests.adults,
            children: parsed.children ?? s.guests.children,
            infants: parsed.infants ?? s.guests.infants,
          },
          food: {
            ...s.food,
            freeText: text,
            cuisines: Array.from(
              new Set([...s.food.cuisines, ...parsed.cuisines]),
            ),
            outdoorSeating: parsed.outdoorSeating ?? s.food.outdoorSeating,
            livelyAtmosphere:
              parsed.livelyAtmosphere ?? s.food.livelyAtmosphere,
            maxBudgetPerPerson:
              parsed.maxBudgetPerPerson ?? s.food.maxBudgetPerPerson,
            maxBudgetGroup: parsed.maxBudgetGroup ?? s.food.maxBudgetGroup,
            accessibilityNeeds:
              parsed.accessibilityNeeds ?? s.food.accessibilityNeeds,
            atmosphere: Array.from(
              new Set([
                ...(s.food.atmosphere || []),
                ...(parsed.atmosphere || []),
              ]),
            ),
            parsedNotes: parsed.notes,
          },
          allergens: (() => {
            const map = new Map(s.allergens.map((a) => [a.allergen, a]));
            for (const a of parsed.allergens) map.set(a.allergen, a);
            return Array.from(map.values());
          })(),
          dietary: Array.from(new Set([...s.dietary, ...parsed.dietary])),
        };
        return next;
      });
      setNotes(parsed.notes);
    } finally {
      setParsing(false);
    }
  }

  function search() {
    const next = { ...state, food: { ...state.food, freeText: text } };
    saveDiscoveryState(next);
    router.push("/discover/results");
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">AI Guide</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream">
        Tell us what you need
      </h1>
      <p className="mt-2 text-ink-soft">
        Natural language becomes structured search params you can edit before
        running. Allergy safety stays a hard filter — never buried in match %.
      </p>

      <div className="mt-5 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner compact />
      </div>

      <div className="card-surface mt-6 space-y-4 p-5">
        <textarea
          className="input-field min-h-[140px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='We are six friends visiting Barcelona. We want authentic Spanish food, outdoor seating, a lively atmosphere and a maximum budget of €35 per person. One person has a severe peanut allergy.'
        />
        <button
          type="button"
          className="btn-secondary"
          disabled={parsing || !text.trim()}
          onClick={parse}
        >
          {parsing ? "Interpreting…" : "Parse into structured params"}
        </button>
        {notes.length > 0 && (
          <ul className="rounded-2xl bg-forest/5 px-4 py-3 text-sm text-forest dark:bg-forest-mid/20 dark:text-cream">
            {notes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="card-surface mt-6 space-y-4 p-5">
        <h2 className="font-display text-xl font-semibold text-forest dark:text-cream">
          Edit before search
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Country (optional)">
            <input
              className="input-field"
              value={state.location.country}
              onChange={(e) =>
                setState({
                  ...state,
                  location: { ...state.location, country: e.target.value },
                })
              }
            />
          </Field>
          <Field label="City (mandatory)">
            <input
              className="input-field"
              value={state.location.city}
              onChange={(e) =>
                setState({
                  ...state,
                  location: { ...state.location, city: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Neighborhood">
            <input
              className="input-field"
              value={state.location.neighborhood}
              onChange={(e) =>
                setState({
                  ...state,
                  location: {
                    ...state.location,
                    neighborhood: e.target.value,
                  },
                })
              }
            />
          </Field>
          <Field label="Max distance (km)">
            <input
              type="number"
              className="input-field"
              value={state.location.maxDistanceKm}
              onChange={(e) =>
                setState({
                  ...state,
                  location: {
                    ...state.location,
                    maxDistanceKm: Number(e.target.value),
                  },
                })
              }
            />
          </Field>
          <Field label="Adults">
            <input
              type="number"
              min={1}
              className="input-field"
              value={state.guests.adults}
              onChange={(e) =>
                setState({
                  ...state,
                  guests: { ...state.guests, adults: Number(e.target.value) },
                })
              }
            />
          </Field>
          <Field label="Children">
            <input
              type="number"
              min={0}
              className="input-field"
              value={state.guests.children}
              onChange={(e) =>
                setState({
                  ...state,
                  guests: {
                    ...state.guests,
                    children: Number(e.target.value),
                  },
                })
              }
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              className="input-field"
              value={state.guests.date}
              onChange={(e) =>
                setState({
                  ...state,
                  guests: { ...state.guests, date: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Time">
            <input
              type="time"
              className="input-field"
              value={state.guests.preferredTime}
              onChange={(e) =>
                setState({
                  ...state,
                  guests: { ...state.guests, preferredTime: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Budget / person (€)">
            <input
              type="number"
              className="input-field"
              value={state.food.maxBudgetPerPerson ?? ""}
              onChange={(e) =>
                setState({
                  ...state,
                  food: {
                    ...state.food,
                    maxBudgetPerPerson: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  },
                })
              }
            />
          </Field>
          <Field label="Transport">
            <select
              className="input-field"
              value={state.location.travelMode}
              onChange={(e) =>
                setState({
                  ...state,
                  location: {
                    ...state.location,
                    travelMode: e.target.value as never,
                  },
                })
              }
            >
              <option value="walking">Walking</option>
              <option value="transit">Transit</option>
              <option value="driving">Driving</option>
            </select>
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Cuisines</p>
          <p className="text-sm text-ink-soft">
            {state.food.cuisines.length
              ? state.food.cuisines.join(", ")
              : "None yet — parse text or use the wizard"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Allergens (mandatory safety)</p>
          <div className="flex flex-wrap gap-2">
            {state.allergens.map((a) => (
              <span key={a.allergen} className="chip chip-active text-xs">
                {EU_ALLERGENS.find((x) => x.id === a.allergen)?.short} ·{" "}
                {a.severity}
              </span>
            ))}
            {state.allergens.length === 0 && (
              <span className="text-sm text-ink-muted">None flagged</span>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Mandatory filters</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["city", "City"],
                ["allergens", "Allergies (safety)"],
                ["dietary", "Diet"],
                ["budget", "Budget"],
                ["cuisine", "Cuisine"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`chip text-xs ${state.mandatory[key] ? "chip-active" : "chip-idle"}`}
                onClick={() =>
                  setState({
                    ...state,
                    mandatory: {
                      ...state.mandatory,
                      [key]: !state.mandatory[key],
                    },
                  })
                }
                disabled={key === "allergens"}
                title={
                  key === "allergens"
                    ? "Medical allergy conflicts stay mandatory"
                    : undefined
                }
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Allergen safety conflicts cannot be relaxed. Other mandatory flags
            hard-filter; the rest influence ranking and explanations.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="accent-terracotta"
            checked={!!state.food.outdoorSeating}
            onChange={(e) =>
              setState({
                ...state,
                food: { ...state.food, outdoorSeating: e.target.checked },
              })
            }
          />
          Outdoor seating
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="accent-terracotta"
            checked={!!state.food.livelyAtmosphere}
            onChange={(e) =>
              setState({
                ...state,
                food: { ...state.food, livelyAtmosphere: e.target.checked },
              })
            }
          />
          Lively atmosphere
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="accent-terracotta"
            checked={!!state.food.accessibilityNeeds}
            onChange={(e) =>
              setState({
                ...state,
                food: {
                  ...state.food,
                  accessibilityNeeds: e.target.checked,
                  wheelchairAccessible: e.target.checked,
                },
              })
            }
          />
          Accessibility needs
        </label>

        <button
          type="button"
          className="btn-primary w-full"
          disabled={!state.location.city}
          onClick={search}
        >
          Find restaurants
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

export default function GuidePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="skeleton h-40 w-full" />
        </div>
      }
    >
      <GuideInner />
    </Suspense>
  );
}

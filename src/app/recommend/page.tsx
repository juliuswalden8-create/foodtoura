"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import { RestaurantCard } from "@/components/RestaurantCard";
import { RestaurantCardSkeleton } from "@/components/Skeleton";
import {
  defaultDiscoveryState,
  loadDiscoveryState,
  saveDiscoveryState,
} from "@/lib/discovery-store";
import { fetchDiscover } from "@/lib/discover-client";
import { parsePreferences } from "@/lib/preference-parser";
import { describeNoFullMatch, rankRestaurants } from "@/lib/ranking";
import { loadTaste } from "@/lib/taste-profile";
import type { RankedRestaurant } from "@/lib/types";

export default function RecommendPage() {
  const [prompt, setPrompt] = useState(
    "Romantic dinner in Lisbon under €40, quiet if possible, no shellfish allergy but avoid crustaceans preference",
  );
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [results, setResults] = useState<RankedRestaurant[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [attribution, setAttribution] = useState("");
  const [dataMode, setDataMode] = useState<"demo" | "live">("demo");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadDiscoveryState();
    if (s.food.freeText) setPrompt(s.food.freeText);
  }, []);

  async function generate() {
    setLoading(true);
    setHint(null);
    setError(null);
    try {
      const parsed = await parsePreferences(prompt);
      const state = defaultDiscoveryState();
      const existing = loadDiscoveryState();
      state.location = {
        ...state.location,
        city: parsed.city || existing.location.city || "Barcelona",
        country:
          parsed.country ||
          existing.location.country ||
          (parsed.city === "Lisbon" ? "Portugal" : "Spain"),
        maxDistanceKm: parsed.maxDistanceKm ?? existing.location.maxDistanceKm,
      };
      state.food = {
        ...state.food,
        freeText: prompt,
        cuisines: parsed.cuisines,
        outdoorSeating: parsed.outdoorSeating,
        livelyAtmosphere: parsed.livelyAtmosphere === true ? true : false,
        maxBudgetPerPerson: parsed.maxBudgetPerPerson,
        atmosphere: parsed.atmosphere,
        parsedNotes: parsed.notes,
      };
      state.allergens = parsed.allergens;
      state.dietary = parsed.dietary;
      if (parsed.partySize) state.guests.adults = parsed.partySize;
      if (parsed.children != null) state.guests.children = parsed.children;
      saveDiscoveryState(state);
      setNotes(parsed.notes);

      const provider = await fetchDiscover(state);
      setAttribution(provider.attribution);
      setDataMode(provider.mode);
      const ranked = rankRestaurants(provider.restaurants, state, loadTaste());
      setResults(ranked.slice(0, 6));
      setHint(describeNoFullMatch(ranked));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recommendation failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">AI recommendations</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream sm:text-4xl">
        Explainable picks for your night
      </h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Natural language → structured prefs → ranked venues with reasons.
        Match % never implies allergy safety.
      </p>

      <div className="mt-5 max-w-2xl space-y-3">
        <DemoModeBanner compact mode={dataMode} />
        <SafetyBanner compact />
        {error && (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-100">
            {error}
          </p>
        )}
      </div>

      <div className="card-surface mt-6 max-w-2xl space-y-3 p-5">
        <textarea
          className="input-field min-h-[110px]"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="button"
          className="btn-primary"
          disabled={loading || !prompt.trim()}
          onClick={() => void generate()}
        >
          {loading ? "Thinking…" : "Get recommendations"}
        </button>
        {notes.length > 0 && (
          <ul className="rounded-2xl bg-forest/5 px-4 py-3 text-sm text-forest dark:bg-forest-mid/20 dark:text-cream">
            {notes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        )}
      </div>

      {hint && (
        <p className="mt-4 max-w-2xl rounded-2xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
          {hint}
        </p>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-ink-muted">{attribution}</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((r, i) => (
                <RestaurantCard key={r.id} restaurant={r} index={i} />
              ))}
            </div>
            <Link
              href="/discover/results"
              className="mt-6 inline-flex text-sm font-semibold text-terracotta"
            >
              See full ranked list →
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}

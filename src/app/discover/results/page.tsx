"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RestaurantCardSkeleton } from "@/components/Skeleton";
import { SafetyBanner } from "@/components/SafetyBanner";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import {
  ListResults,
  MapResults,
  SwipeResults,
  ViewModeToggle,
} from "@/components/results/ResultsViews";
import { loadDiscoveryState } from "@/lib/discovery-store";
import { searchRestaurantsForState } from "@/lib/provider";
import { describeNoFullMatch, rankRestaurants } from "@/lib/ranking";
import type { RankedRestaurant, ResultsViewMode } from "@/lib/types";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<RankedRestaurant[]>([]);
  const [city, setCity] = useState("");
  const [summary, setSummary] = useState("");
  const [mode, setMode] = useState<ResultsViewMode>("list");
  const [attribution, setAttribution] = useState("");
  const [noFullMatch, setNoFullMatch] = useState<string | null>(null);

  useEffect(() => {
    const state = loadDiscoveryState();
    setCity(state.location.city || "your destination");
    const party =
      state.guests.adults + state.guests.children + state.guests.infants;
    const cuisineBit =
      state.food.cuisines.length > 0
        ? state.food.cuisines.slice(0, 3).join(", ")
        : "open to anything";
    setSummary(
      `Party of ${party} · ${cuisineBit}` +
        (state.food.maxBudgetPerPerson
          ? ` · ≤ €${state.food.maxBudgetPerPerson}/person`
          : "") +
        (state.allergens.length
          ? ` · ${state.allergens.length} allergen flag${state.allergens.length > 1 ? "s" : ""}`
          : ""),
    );

    let cancelled = false;
    (async () => {
      const providerResult = await searchRestaurantsForState(state);
      if (cancelled) return;
      setAttribution(providerResult.attribution);
      // Artificial polish delay for skeletons
      await new Promise((r) => setTimeout(r, 550));
      if (cancelled) return;
      const ranked = rankRestaurants(providerResult.restaurants, state);
      setResults(ranked);
      setNoFullMatch(describeNoFullMatch(ranked));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 max-w-2xl animate-fade-up">
        <p className="text-sm font-medium text-terracotta">Your matches</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream sm:text-4xl">
          Restaurants for {city}
        </h1>
        <p className="mt-2 text-ink-soft">{summary}</p>
        <p className="mt-1 text-xs text-ink-muted">
          Match % reflects preference fit only — never allergy safety.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/guide" className="btn-secondary !py-2.5 text-xs">
            Edit AI params
          </Link>
          <Link href="/discover" className="btn-secondary !py-2.5 text-xs">
            Wizard
          </Link>
          <ViewModeToggle mode={mode} onChange={setMode} />
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner />
        {noFullMatch && !loading && (
          <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-semibold">No perfect match</p>
            <p className="mt-1">{noFullMatch}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="card-surface p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-forest dark:text-cream">
            No sample venues for this city yet
          </h2>
          <p className="mt-2 text-ink-soft">
            Demo data covers Barcelona and Lisbon. Try one of those cities.
          </p>
          <Link href="/guide" className="btn-primary mt-6 inline-flex">
            Change search
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-muted">
            {results.length} venues · {attribution}
          </p>
          {mode === "list" && <ListResults results={results} />}
          {mode === "map" && <MapResults results={results} />}
          {mode === "swipe" && <SwipeResults results={results} />}
        </>
      )}
    </div>
  );
}

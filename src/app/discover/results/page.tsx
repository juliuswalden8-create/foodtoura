"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RestaurantCard } from "@/components/RestaurantCard";
import { RestaurantCardSkeleton } from "@/components/Skeleton";
import { SafetyBanner } from "@/components/SafetyBanner";
import { loadDiscoveryState } from "@/lib/discovery-store";
import { RESTAURANTS } from "@/lib/mock-restaurants";
import { rankRestaurants } from "@/lib/ranking";
import type { RankedRestaurant } from "@/lib/types";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<RankedRestaurant[]>([]);
  const [city, setCity] = useState("");
  const [summary, setSummary] = useState("");

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

    const t = setTimeout(() => {
      setResults(rankRestaurants(RESTAURANTS, state));
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 max-w-2xl animate-fade-up">
        <p className="text-sm font-medium text-terracotta">Your matches</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest sm:text-4xl">
          Restaurants for {city}
        </h1>
        <p className="mt-2 text-charcoal-soft">{summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/discover" className="btn-secondary !py-2.5 text-xs">
            Edit preferences
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <SafetyBanner />
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="card-surface p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-forest">
            No sample venues for this city yet
          </h2>
          <p className="mt-2 text-charcoal-soft">
            Demo data covers Barcelona and Lisbon. Try one of those cities, or
            keep your prefs and switch destination.
          </p>
          <Link href="/discover" className="btn-primary mt-6 inline-flex">
            Change city
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-charcoal-muted">
            {results.length} venues ranked · sample data · maps/APIs ready to
            plug in later
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

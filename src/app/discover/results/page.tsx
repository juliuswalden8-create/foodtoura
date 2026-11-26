"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { RestaurantCardSkeleton } from "@/components/Skeleton";
import { SafetyBanner } from "@/components/SafetyBanner";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { PreferenceChips } from "@/components/results/PreferenceChips";
import {
  ListResults,
  MapResults,
  SwipeResults,
  ViewModeToggle,
} from "@/components/results/ResultsViews";
import { fetchDiscover } from "@/lib/discover-client";
import {
  loadDiscoveryState,
  saveDiscoveryState,
} from "@/lib/discovery-store";
import { describeNoFullMatch, rankRestaurants } from "@/lib/ranking";
import { tripShareUrl } from "@/lib/share-trip";
import { loadTaste } from "@/lib/taste-profile";
import type {
  DiscoveryState,
  RankedRestaurant,
  ResultsSort,
  ResultsViewMode,
  Restaurant,
} from "@/lib/types";

const SCROLL_KEY = "foodtoura.results.scroll.v1";

function sortResults(
  list: RankedRestaurant[],
  sort: ResultsSort,
): RankedRestaurant[] {
  const copy = [...list];
  switch (sort) {
    case "distance":
      return copy.sort((a, b) => {
        const ad = a.distanceKm < 0 ? Number.POSITIVE_INFINITY : a.distanceKm;
        const bd = b.distanceKm < 0 ? Number.POSITIVE_INFINITY : b.distanceKm;
        return ad - bd;
      });
    case "price":
      return copy.sort((a, b) => a.avgPricePerPerson - b.avgPricePerPerson);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "open":
      return copy.sort((a, b) => {
        const ao = a.openNow === true ? 0 : a.openNow === false ? 2 : 1;
        const bo = b.openNow === true ? 0 : b.openNow === false ? 2 : 1;
        if (ao !== bo) return ao - bo;
        return (b.matchScore ?? -1) - (a.matchScore ?? -1);
      });
    default:
      return copy;
  }
}

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<Restaurant[]>([]);
  const [state, setState] = useState<DiscoveryState | null>(null);
  const [mode, setMode] = useState<ResultsViewMode>("list");
  const [sort, setSort] = useState<ResultsSort>("best");
  const [attribution, setAttribution] = useState("");
  const [dataMode, setDataMode] = useState<"demo" | "live">("demo");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const restoredScroll = useRef(false);

  const refetchKeyRef = useRef("");

  function materialQueryKey(s: DiscoveryState) {
    return JSON.stringify({
      city: s.location.city,
      country: s.location.country,
      neighborhood: s.location.neighborhood,
      lat: s.location.lat,
      lng: s.location.lng,
      maxDistanceKm: s.location.maxDistanceKm,
      cuisines: [...s.food.cuisines].sort(),
    });
  }

  async function runDiscover(
    loaded: DiscoveryState,
    signal?: AbortSignal,
  ) {
    try {
      setLoading(true);
      setError(null);
      const providerResult = await fetchDiscover(loaded, signal);
      if (signal?.aborted) return;
      setAttribution(providerResult.attribution);
      setDataMode(providerResult.mode);
      setRaw(providerResult.restaurants);
      refetchKeyRef.current = materialQueryKey(loaded);
      if (providerResult.restaurants.length === 0) {
        setError(
          providerResult.mode === "live"
            ? "No live restaurants returned for this query. Try a broader city or cuisine."
            : "No demo restaurants for this city. Try Barcelona or Lisbon, or set GOOGLE_PLACES_API_KEY for live data.",
        );
      }
    } catch (e) {
      if (signal?.aborted) return;
      setError(
        e instanceof Error
          ? e.message
          : "Search failed. Check your connection and try again.",
      );
      setRaw([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const loaded = loadDiscoveryState();
    setState(loaded);
    setShareUrl(tripShareUrl(loaded));

    const ac = new AbortController();
    void runDiscover(loaded, ac.signal);
    return () => ac.abort();
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced Places re-query when cuisine / location material fields change
  useEffect(() => {
    if (!state) return;
    const key = materialQueryKey(state);
    if (!refetchKeyRef.current || key === refetchKeyRef.current) return;
    const ac = new AbortController();
    const t = window.setTimeout(() => {
      void runDiscover(state, ac.signal);
    }, 400);
    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state?.location.city,
    state?.location.country,
    state?.location.neighborhood,
    state?.location.lat,
    state?.location.lng,
    state?.location.maxDistanceKm,
    state?.food.cuisines?.join("|"),
  ]);

  const results = useMemo(() => {
    if (!state) return [];
    const ranked = rankRestaurants(raw, state, loadTaste());
    return sortResults(ranked, sort);
  }, [raw, state, sort]);

  const noFullMatch = useMemo(
    () => (results.length ? describeNoFullMatch(results) : null),
    [results],
  );

  useEffect(() => {
    if (loading || restoredScroll.current) return;
    const y = Number(sessionStorage.getItem(SCROLL_KEY) || 0);
    if (y > 0) window.scrollTo(0, y);
    restoredScroll.current = true;
  }, [loading, results]);

  useEffect(() => {
    const onScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function updateState(next: DiscoveryState) {
    setState(next);
    saveDiscoveryState(next);
    setShareUrl(tripShareUrl(next));
  }

  if (!state) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const party =
    state.guests.adults + state.guests.children + state.guests.infants;
  const cuisineBit =
    state.food.cuisines.length > 0
      ? state.food.cuisines.slice(0, 3).join(", ")
      : "open to anything";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 max-w-2xl animate-fade-up">
        <p className="text-sm font-medium text-terracotta">For you tonight</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest sm:text-4xl">
          Restaurants for {state.location.city || "your destination"}
        </h1>
        <p className="mt-2 text-ink-soft">
          Party of {party} · {cuisineBit}
          {state.food.maxBudgetPerPerson
            ? ` · ≤ €${state.food.maxBudgetPerPerson}/person`
            : ""}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          How well a place fits your taste is separate from allergy safety —
          always double-check with the restaurant. Distances are approximate.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/guide" className="btn-secondary !py-2.5 text-xs">
            Ask your guide
          </Link>
          <Link href="/discover" className="btn-secondary !py-2.5 text-xs">
            Wizard
          </Link>
          <Link href="/vote" className="btn-secondary !py-2.5 text-xs">
            Group vote
          </Link>
          <Link href="/surprise" className="btn-secondary !py-2.5 text-xs">
            Surprise me
          </Link>
          <button
            type="button"
            className="btn-secondary !py-2.5 text-xs"
            onClick={async () => {
              if (!shareUrl) return;
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
            }}
          >
            {copied ? "Link copied" : "Share trip"}
          </button>
          <ViewModeToggle mode={mode} onChange={setMode} />
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <DemoModeBanner compact mode={dataMode} />
        <SafetyBanner />
        <PreferenceChips state={state} onChange={updateState} />
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["best", "Best match"],
              ["distance", "Distance"],
              ["price", "Price"],
              ["rating", "Rating"],
              ["open", "Open now"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`chip text-xs ${sort === id ? "chip-active" : "chip-idle"}`}
              onClick={() => setSort(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {noFullMatch && !loading && (
          <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">No perfect match</p>
            <p className="mt-1">{noFullMatch}</p>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-900">
            <p className="font-semibold">Search issue</p>
            <p className="mt-1">{error}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary !py-2 text-xs"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
              <Link href="/guide" className="btn-secondary !py-2 text-xs">
                Adjust search
              </Link>
            </div>
          </div>
        )}
        {attribution && (
          <p className="text-[11px] text-ink-muted">{attribution}</p>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 && !error ? (
        <div className="card-surface p-8 text-center">
          <p className="font-display text-xl text-forest">
            No restaurants to show
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Relax optional filters, pick Barcelona or Lisbon in demo mode, or
            connect Google Places for worldwide live data.
          </p>
          <Link href="/guide" className="btn-primary mt-6 inline-flex">
            Refine search
          </Link>
        </div>
      ) : mode === "list" ? (
        <ListResults results={results} />
      ) : mode === "map" ? (
        <MapResults results={results} />
      ) : (
        <SwipeResults results={results} />
      )}
    </div>
  );
}

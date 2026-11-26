"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RestaurantCard } from "@/components/RestaurantCard";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import { fetchDiscover } from "@/lib/discover-client";
import { loadDiscoveryState, saveDiscoveryState } from "@/lib/discovery-store";
import { rankRestaurants } from "@/lib/ranking";
import { loadTaste } from "@/lib/taste-profile";
import type { RankedRestaurant } from "@/lib/types";

const SEEN_KEY = "foodtoura.surprise.seen.v1";

export default function SurprisePage() {
  const [pick, setPick] = useState<RankedRestaurant | null>(null);
  const [reason, setReason] = useState("");
  const [dataMode, setDataMode] = useState<"demo" | "live">("demo");
  const [loading, setLoading] = useState(true);

  const draw = useCallback(async () => {
    const state = loadDiscoveryState();
    if (!state.location.city) {
      state.location.city = "Barcelona";
      state.location.country = "Spain";
      saveDiscoveryState(state);
    }
    if (!state.food.cuisines.includes("Surprise me")) {
      state.food.cuisines = [...state.food.cuisines, "Surprise me"];
      saveDiscoveryState(state);
    }

    setLoading(true);
    try {
      const provider = await fetchDiscover(state);
      setDataMode(provider.mode);
      const ranked = rankRestaurants(
        provider.restaurants,
        state,
        loadTaste(),
      ).filter((r) => r.safetyLevel !== "conflict");

      let seen: string[] = [];
      try {
        seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
      } catch {
        seen = [];
      }
      const fresh = ranked.filter((r) => !seen.includes(r.id));
      const pool = fresh.length ? fresh : ranked;
      const choice = pool[Math.floor(Math.random() * Math.min(5, pool.length))];
      if (!choice) {
        setPick(null);
        setReason(
          provider.mode === "live"
            ? "No eligible live restaurants under your mandatory constraints."
            : "No eligible restaurants under your mandatory constraints.",
        );
        return;
      }
      const nextSeen = [...seen.filter((id) => id !== choice.id), choice.id].slice(
        -12,
      );
      localStorage.setItem(SEEN_KEY, JSON.stringify(nextSeen));
      setPick(choice);
      setReason(
        choice.matchReasons[0] ||
          "Eligible under your mandatory filters — randomized among top matches.",
      );
    } catch (e) {
      setPick(null);
      setReason(
        e instanceof Error
          ? e.message
          : "Could not load restaurants for a surprise pick.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void draw();
  }, [draw]);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <p className="text-sm font-medium text-terracotta">Surprise Me</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest">
        One eligible pick
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Drawn from restaurants that pass your mandatory filters — never allergy
        compromises. Avoids recent repeats.
      </p>
      <div className="mt-4 space-y-3">
        <DemoModeBanner compact mode={dataMode} />
        <SafetyBanner compact />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink-muted">Drawing…</p>
      ) : pick ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-forest">Why: {reason}</p>
          <RestaurantCard restaurant={pick} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-muted">{reason || "No pick available."}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={() => void draw()}
          disabled={loading}
        >
          Another suggestion
        </button>
        <Link href="/discover/results" className="btn-secondary">
          Full results
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RestaurantCard } from "@/components/RestaurantCard";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import { loadDiscoveryState, saveDiscoveryState } from "@/lib/discovery-store";
import { RESTAURANTS } from "@/lib/mock-restaurants";
import { rankRestaurants } from "@/lib/ranking";
import { loadTaste } from "@/lib/taste-profile";
import type { RankedRestaurant } from "@/lib/types";

const SEEN_KEY = "foodtoura.surprise.seen.v1";

export default function SurprisePage() {
  const [pick, setPick] = useState<RankedRestaurant | null>(null);
  const [reason, setReason] = useState("");

  function draw() {
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
    const ranked = rankRestaurants(RESTAURANTS, state, loadTaste()).filter(
      (r) => r.safetyLevel !== "conflict",
    );
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
      setReason("No eligible restaurants under your mandatory constraints.");
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
  }

  useEffect(() => {
    draw();
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <p className="text-sm font-medium text-terracotta">Surprise Me</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream">
        One eligible pick
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Drawn from restaurants that pass your mandatory filters — never allergy
        compromises. Avoids recent repeats.
      </p>
      <div className="mt-4 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner compact />
      </div>

      {pick ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-forest dark:text-cream">
            Why: {reason}
          </p>
          <RestaurantCard restaurant={pick} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-muted">{reason || "Drawing…"}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={draw}>
          Another suggestion
        </button>
        <Link href="/discover/results" className="btn-secondary">
          Full results
        </Link>
      </div>
    </div>
  );
}

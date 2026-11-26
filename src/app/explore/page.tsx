"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { DEMO_CITIES, RESTAURANTS } from "@/lib/mock-restaurants";
import {
  defaultDiscoveryState,
  saveDiscoveryState,
} from "@/lib/discovery-store";

export default function ExplorePage() {
  const [city, setCity] = useState<string>("Barcelona");
  const [cuisine, setCuisine] = useState<string>("All");

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    RESTAURANTS.forEach((r) => r.cuisine.forEach((c) => set.add(c)));
    return ["All", ...Array.from(set).sort()];
  }, []);

  const list = RESTAURANTS.filter((r) => {
    if (r.city !== city) return false;
    if (cuisine !== "All" && !r.cuisine.includes(cuisine as never)) return false;
    return true;
  });

  function startDiscover() {
    const state = defaultDiscoveryState();
    state.location.city = city;
    state.location.country = city === "Lisbon" ? "Portugal" : "Spain";
    if (cuisine !== "All") state.food.cuisines = [cuisine as never];
    saveDiscoveryState(state);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-terracotta">Explore</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest sm:text-4xl">
          Browse like a local
        </h1>
        <p className="mt-2 text-ink-soft">
          Sample inventory by city and cuisine. Start a personalized match when
          you&apos;re ready.
        </p>
      </div>

      <div className="mt-6">
        <DemoModeBanner compact />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {DEMO_CITIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${city === c ? "chip-active" : "chip-idle"}`}
            onClick={() => setCity(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {cuisines.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip shrink-0 text-xs ${cuisine === c ? "chip-active" : "chip-idle"}`}
            onClick={() => setCuisine(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href="/discover"
          onClick={startDiscover}
          className="btn-primary !py-2.5 text-xs"
        >
          Personalize for {city}
        </Link>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <Link
            key={r.id}
            href={`/restaurant/${r.id}`}
            className="card-surface group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={r.imageUrl}
                alt={r.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            </div>
            <div className="space-y-1 p-4">
              <h2 className="font-display text-xl font-semibold text-forest">
                {r.name}
              </h2>
              <p className="text-sm text-ink-muted">
                {r.cuisine.slice(0, 2).join(" · ")} · ★ {r.rating.toFixed(1)} ·{" "}
                {"€".repeat(r.priceLevel)}
              </p>
              <p className="text-xs text-ink-muted">
                {r.neighborhood} · {r.city}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

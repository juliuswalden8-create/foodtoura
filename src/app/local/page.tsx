"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import {
  defaultDiscoveryState,
  loadDiscoveryState,
  saveDiscoveryState,
} from "@/lib/discovery-store";
import { LOCAL_DISHES } from "@/lib/local-dishes";
import type { CuisineTag } from "@/lib/types";

export default function LocalPage() {
  const router = useRouter();

  function searchDish(dish: (typeof LOCAL_DISHES)[0]) {
    const base = loadDiscoveryState().location.city
      ? loadDiscoveryState()
      : defaultDiscoveryState();
    base.location.city = dish.city;
    base.location.country = dish.country;
    base.food.cuisines = Array.from(
      new Set([
        ...base.food.cuisines,
        dish.cuisineSearch as CuisineTag,
      ]),
    );
    base.food.freeText = `Looking for places that might serve ${dish.name}`;
    base.food.parsedNotes = [
      ...(base.food.parsedNotes || []),
      `Eat Like a Local: ${dish.name} — we do not claim a specific venue serves this without menu evidence.`,
    ];
    saveDiscoveryState(base);
    router.push("/discover/results");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Eat Like a Local</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream">
        Dishes worth knowing
      </h1>
      <p className="mt-2 text-ink-soft">
        Editorial snapshots of regional food culture. Searching launches a
        cuisine-based restaurant hunt — not a guarantee that a venue serves the
        dish.
      </p>
      <div className="mt-4 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner compact />
      </div>
      <ul className="mt-6 space-y-4">
        {LOCAL_DISHES.map((d) => (
          <li key={d.id} className="card-surface overflow-hidden">
            <div className="relative aspect-[16/9]">
              <Image src={d.image} alt={d.name} fill className="object-cover" sizes="640px" />
            </div>
            <div className="p-5">
              <p className="text-xs font-medium text-terracotta">
                {d.city} · {d.category}
              </p>
              <h2 className="font-display text-2xl font-semibold text-forest dark:text-cream">
                {d.name}
              </h2>
              <p className="mt-2 text-sm text-ink-soft">{d.taste}</p>
              <p className="mt-2 text-xs text-ink-muted">
                Often includes: {d.commonIngredients.join(", ")}
              </p>
              <p className="mt-1 text-xs text-terracotta-deep">
                {d.allergenHints.join(" · ")}
              </p>
              <button
                type="button"
                className="btn-primary mt-4"
                onClick={() => searchDish(d)}
              >
                Search related restaurants
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

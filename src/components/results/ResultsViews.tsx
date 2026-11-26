"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { RankedRestaurant, ResultsViewMode } from "@/lib/types";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SafetyLevelPill } from "@/components/SafetyBanner";

export function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ResultsViewMode;
  onChange: (m: ResultsViewMode) => void;
}) {
  const items: ResultsViewMode[] = ["list", "map", "swipe"];
  return (
    <div className="inline-flex rounded-full border border-mist bg-white/80 p-1">
      {items.map((m) => (
        <button
          key={m}
          type="button"
          className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
            mode === m
              ? "bg-forest text-white"
              : "text-ink-muted hover:text-forest"
          }`}
          onClick={() => onChange(m)}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

export function ListResults({ results }: { results: RankedRestaurant[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((r, i) => (
        <RestaurantCard key={r.id} restaurant={r} index={i} />
      ))}
    </div>
  );
}

/** Lightweight map placeholder — pins by relative lat/lng in city bounds. Ready for Mapbox/Google later. */
export function MapResults({ results }: { results: RankedRestaurant[] }) {
  if (results.length === 0) return null;
  const lats = results.map((r) => r.lat);
  const lngs = results.map((r) => r.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pad = 0.01;

  function pos(r: RankedRestaurant) {
    const x =
      ((r.lng - (minLng - pad)) / (maxLng - minLng + pad * 2)) * 100;
    const y =
      (1 - (r.lat - (minLat - pad)) / (maxLat - minLat + pad * 2)) * 100;
    return { left: `${x}%`, top: `${y}%` };
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-mist bg-[linear-gradient(135deg,#dfe8e2,#f3efe6)] sm:aspect-[16/9]">
        <p className="absolute left-3 top-3 z-10 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-semibold text-forest">
          Demo map · plug in Mapbox/Google later
        </p>
        {results.map((r) => (
          <Link
            key={r.id}
            href={`/restaurant/${r.id}`}
            className="absolute z-[1] -translate-x-1/2 -translate-y-full"
            style={pos(r)}
            title={r.name}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white shadow-soft ring-2 ring-white">
              {r.matchScore ?? "·"}
            </span>
          </Link>
        ))}
      </div>
      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.id}>
            <Link
              href={`/restaurant/${r.id}`}
              className="card-surface flex items-center gap-3 p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                <Image src={r.imageUrl} alt="" fill className="object-cover" sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-forest">
                  {r.name}
                </p>
                <p className="text-xs text-ink-muted">
                  {r.cuisine[0]} · ★ {r.rating} · {"€".repeat(r.priceLevel)} ·{" "}
                  {r.distanceKm} km
                </p>
              </div>
              <SafetyLevelPill level={r.safetyLevel} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SwipeResults({ results }: { results: RankedRestaurant[] }) {
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const current = results[index];

  if (!current) {
    return (
      <p className="text-center text-ink-muted">No more cards in this deck.</p>
    );
  }

  function next() {
    setIndex((i) => Math.min(results.length, i + 1));
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-3 text-center text-xs text-ink-muted animate-swipe-hint">
        Swipe decisions · {index + 1} / {results.length}
      </p>
      <RestaurantCard restaurant={current} compact />
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-mist bg-white text-lg font-semibold text-ink-muted shadow-card"
          onClick={next}
          aria-label="Skip"
        >
          ✕
        </button>
        <Link
          href={`/restaurant/${current.id}`}
          className="btn-secondary !px-4"
        >
          Details
        </Link>
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-lg text-white shadow-soft"
          onClick={() => {
            setSaved((s) =>
              s.includes(current.id) ? s : [...s, current.id],
            );
            try {
              const raw = localStorage.getItem("foodtoura.saved.v1");
              const ids: string[] = raw ? JSON.parse(raw) : [];
              if (!ids.includes(current.id)) {
                localStorage.setItem(
                  "foodtoura.saved.v1",
                  JSON.stringify([...ids, current.id]),
                );
              }
            } catch {
              /* ignore */
            }
            next();
          }}
          aria-label="Save"
        >
          ♥
        </button>
      </div>
      {saved.length > 0 && (
        <p className="mt-3 text-center text-xs text-forest-mid">
          Saved {saved.length} from this deck ·{" "}
          <Link href="/saved" className="underline">
            view
          </Link>
        </p>
      )}
    </div>
  );
}

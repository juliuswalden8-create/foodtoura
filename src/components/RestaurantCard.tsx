"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { RankedRestaurant } from "@/lib/types";
import { authenticityLabel } from "@/lib/authenticity";
import { loadSavedIds, toggleSaved } from "@/lib/discovery-store";
import { SafetyLevelPill } from "./SafetyBanner";

export function RestaurantCard({
  restaurant,
  index = 0,
  compact = false,
}: {
  restaurant: RankedRestaurant;
  index?: number;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(() =>
    typeof window !== "undefined"
      ? loadSavedIds().includes(restaurant.id)
      : false,
  );

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${restaurant.lat},${restaurant.lng}`,
  )}`;
  const shareText = `${restaurant.name} — FoodToura`;

  return (
    <article
      className="card-surface group animate-fade-up overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <Link href={`/restaurant/${restaurant.id}`} className="block">
        <div
          className={`relative overflow-hidden ${compact ? "aspect-[16/10]" : "aspect-[4/3]"}`}
        >
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {restaurant.matchScore != null ? (
              <span className="rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold text-forest shadow-sm dark:bg-ink/90 dark:text-cream">
                {restaurant.matchScore}% match
              </span>
            ) : (
              <span className="rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold text-ink-muted shadow-sm">
                Match % unavailable
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/restaurant/${restaurant.id}`}>
              <h3 className="font-display text-xl font-semibold text-forest dark:text-cream">
                {restaurant.name}
              </h3>
            </Link>
            <p className="mt-0.5 text-sm text-ink-muted">
              {restaurant.cuisine.slice(0, 2).join(" · ")}
            </p>
          </div>
          <div className="shrink-0 text-right text-sm font-medium text-ink-soft">
            <p>★ {restaurant.rating.toFixed(1)}</p>
            <p className="text-xs text-ink-muted">
              {"€".repeat(restaurant.priceLevel)}
            </p>
          </div>
        </div>

        <p className="text-xs text-ink-muted">
          {restaurant.neighborhood} · ~{restaurant.distanceKm} km straight-line
          · avg €{restaurant.avgPricePerPerson}
        </p>

        {!compact && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {restaurant.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <SafetyLevelPill level={restaurant.safetyLevel} />
          {restaurant.authenticityScore != null && (
            <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-medium text-charcoal-soft dark:bg-white/10 dark:text-cream">
              {authenticityLabel(restaurant.authenticityScore)}
              {restaurant.touristTrapRisk === "high" ? " · trap risk*" : ""}
            </span>
          )}
          {restaurant.openNow === false && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-900">
              May be closed now
            </span>
          )}
        </div>

        {restaurant.matchReasons[0] && (
          <p className="text-xs text-forest-muted dark:text-forest-mid">
            · {restaurant.matchReasons[0]}
          </p>
        )}
        {restaurant.missingDataFlags[0] && (
          <p className="text-xs text-amber-800 dark:text-amber-200">
            · {restaurant.missingDataFlags[0]}
          </p>
        )}

        {restaurant.allergyWarnings[0] && (
          <p className="rounded-xl bg-terracotta/10 px-3 py-2 text-xs leading-relaxed text-terracotta-deep">
            {restaurant.allergyWarnings[0]}
          </p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-mist/80 pt-3 dark:border-white/10">
          <Link
            href={`/restaurant/${restaurant.id}`}
            className="chip chip-idle text-xs"
          >
            Details
          </Link>
          <button
            type="button"
            className={`chip text-xs ${saved ? "chip-active" : "chip-idle"}`}
            onClick={() => setSaved(toggleSaved(restaurant.id).includes(restaurant.id))}
          >
            {saved ? "Saved" : "Save"}
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="chip chip-idle text-xs"
          >
            Directions
          </a>
          {restaurant.phone ? (
            <a href={`tel:${restaurant.phone}`} className="chip chip-idle text-xs">
              Call
            </a>
          ) : (
            <span
              className="chip chip-idle cursor-not-allowed text-xs opacity-60"
              title="Phone not listed"
            >
              Call unavailable
            </span>
          )}
          {restaurant.website ? (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="chip chip-idle text-xs"
            >
              Website
            </a>
          ) : (
            <span
              className="chip chip-idle cursor-not-allowed text-xs opacity-60"
              title="No booking partner connected — contact the restaurant directly"
            >
              Book via venue
            </span>
          )}
          <button
            type="button"
            className="chip chip-idle text-xs"
            onClick={async () => {
              const url =
                typeof window !== "undefined"
                  ? `${window.location.origin}/restaurant/${restaurant.id}`
                  : "";
              if (navigator.share) {
                await navigator.share({ title: restaurant.name, text: shareText, url });
              } else {
                await navigator.clipboard.writeText(url);
              }
            }}
          >
            Share
          </button>
        </div>
      </div>
    </article>
  );
}

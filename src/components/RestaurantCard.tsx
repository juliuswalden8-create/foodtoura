"use client";

import Image from "next/image";
import Link from "next/link";
import type { RankedRestaurant } from "@/lib/types";
import { authenticityLabel } from "@/lib/authenticity";
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
  return (
    <Link
      href={`/restaurant/${restaurant.id}`}
      className="card-surface group animate-fade-up block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <div className={`relative overflow-hidden ${compact ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
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
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-forest dark:text-cream">
              {restaurant.name}
            </h3>
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
          {restaurant.neighborhood} · {restaurant.distanceKm} km · avg €
          {restaurant.avgPricePerPerson}
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
              {restaurant.touristTrapRisk === "high" ? " · trap risk" : ""}
            </span>
          )}
        </div>

        {restaurant.matchReasons[0] && (
          <p className="text-xs text-forest-muted dark:text-forest-mid">
            · {restaurant.matchReasons[0]}
          </p>
        )}

        {restaurant.allergyWarnings[0] && (
          <p className="rounded-xl bg-terracotta/10 px-3 py-2 text-xs leading-relaxed text-terracotta-deep">
            {restaurant.allergyWarnings[0]}
          </p>
        )}

        {restaurant.conflictExplanation && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200">
            {restaurant.conflictExplanation}
          </p>
        )}
      </div>
    </Link>
  );
}

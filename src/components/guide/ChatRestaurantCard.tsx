"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { RankedRestaurant } from "@/lib/types";
import { loadSavedIds, toggleSaved } from "@/lib/discovery-store";

export function ChatRestaurantCard({
  restaurant,
}: {
  restaurant: RankedRestaurant;
}) {
  const [saved, setSaved] = useState(() =>
    typeof window !== "undefined"
      ? loadSavedIds().includes(restaurant.id)
      : false,
  );

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${restaurant.lat},${restaurant.lng}`,
  )}`;

  const why =
    restaurant.matchReasons[0] ||
    restaurant.scoreExplain[0] ||
    "A warm fit for what you described.";

  return (
    <article className="overflow-hidden rounded-3xl border border-mist bg-card shadow-card">
      <div className="relative aspect-[16/10]">
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 90vw, 420px"
        />
      </div>
      <div className="space-y-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-forest">
              {restaurant.name}
            </h3>
            <p className="text-xs text-ink-muted">
              {restaurant.cuisine.slice(0, 2).join(" · ")}
              {restaurant.rating
                ? ` · ★ ${restaurant.rating.toFixed(1)}`
                : ""}
              {restaurant.reviewCount
                ? ` (${restaurant.reviewCount.toLocaleString()} reviews)`
                : ""}
              {` · ${"€".repeat(restaurant.priceLevel)}`}
            </p>
          </div>
        </div>
        <p className="text-xs text-ink-soft">
          ~{restaurant.distanceKm} km away
          {restaurant.openNow === true
            ? " · Open now"
            : restaurant.openNow === false
              ? " · May be closed now"
              : ""}
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">
          <span className="font-medium text-forest">Why: </span>
          {why}
        </p>
        {restaurant.allergyWarnings[0] && (
          <p className="rounded-xl bg-terracotta/10 px-3 py-2 text-xs text-terracotta-deep">
            {restaurant.allergyWarnings[0]}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href={`/restaurant/${restaurant.id}`}
            className="chip chip-active text-xs"
          >
            View
          </Link>
          <button
            type="button"
            className={`chip text-xs ${saved ? "chip-active" : "chip-idle"}`}
            onClick={() =>
              setSaved(toggleSaved(restaurant.id, restaurant).includes(restaurant.id))
            }
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
          {restaurant.website ? (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="chip chip-idle text-xs"
            >
              Contact / book
            </a>
          ) : restaurant.phone ? (
            <a href={`tel:${restaurant.phone}`} className="chip chip-idle text-xs">
              Call
            </a>
          ) : (
            <span className="chip chip-idle text-xs opacity-60">
              Book via venue
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

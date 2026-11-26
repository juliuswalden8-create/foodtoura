import Image from "next/image";
import Link from "next/link";
import type { RankedRestaurant } from "@/lib/types";
import { SafetyLevelPill } from "./SafetyBanner";

export function RestaurantCard({
  restaurant,
  index = 0,
}: {
  restaurant: RankedRestaurant;
  index?: number;
}) {
  return (
    <Link
      href={`/restaurant/${restaurant.id}`}
      className="card-surface group animate-fade-up block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold text-forest shadow-sm">
            {restaurant.matchScore}% match
          </span>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-forest">
              {restaurant.name}
            </h3>
            <p className="mt-0.5 text-sm text-charcoal-muted">
              {restaurant.neighborhood} · {restaurant.city} ·{" "}
              {restaurant.distanceKm} km
            </p>
          </div>
          <p className="shrink-0 text-sm font-medium text-charcoal-soft">
            ★ {restaurant.rating.toFixed(1)}
          </p>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-charcoal-soft">
          {restaurant.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <SafetyLevelPill level={restaurant.safetyLevel} />
          {restaurant.cuisine.slice(0, 2).map((c) => (
            <span
              key={c}
              className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-medium text-charcoal-soft"
            >
              {c}
            </span>
          ))}
          <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-medium text-charcoal-soft">
            {"€".repeat(restaurant.priceLevel)} · avg €
            {restaurant.avgPricePerPerson}
          </span>
        </div>

        {restaurant.matchReasons.length > 0 && (
          <ul className="space-y-1 border-t border-mist pt-3">
            {restaurant.matchReasons.slice(0, 2).map((r) => (
              <li key={r} className="text-xs text-forest-muted">
                · {r}
              </li>
            ))}
          </ul>
        )}

        {restaurant.allergyWarnings.length > 0 && (
          <p className="rounded-xl bg-terracotta/10 px-3 py-2 text-xs leading-relaxed text-terracotta-deep">
            {restaurant.allergyWarnings[0]}
          </p>
        )}
      </div>
    </Link>
  );
}

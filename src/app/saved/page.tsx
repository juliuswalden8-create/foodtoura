"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { loadSavedIds, toggleSaved } from "@/lib/discovery-store";
import { getRestaurantById } from "@/lib/mock-restaurants";

export default function SavedPage() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(loadSavedIds());
  }, []);

  const items = ids
    .map((id) => getRestaurantById(id))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-semibold text-forest dark:text-cream">
        Saved
      </h1>
      <p className="mt-2 text-ink-soft">
        Shortlist on this device — no account required for the demo.
      </p>
      <div className="mt-4">
        <DemoModeBanner compact />
      </div>

      {items.length === 0 ? (
        <div className="card-surface mt-8 p-8 text-center">
          <p className="text-ink-soft">
            Nothing saved yet. Heart a restaurant from results or detail pages.
          </p>
          <Link href="/explore" className="btn-primary mt-5 inline-flex">
            Explore
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((r) =>
            r ? (
              <li key={r.id} className="card-surface flex gap-4 overflow-hidden p-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={r.imageUrl}
                    alt={r.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <Link
                    href={`/restaurant/${r.id}`}
                    className="font-display text-lg font-semibold text-forest dark:text-cream"
                  >
                    {r.name}
                  </Link>
                  <p className="text-sm text-ink-muted">
                    {r.cuisine[0]} · ★ {r.rating} · {"€".repeat(r.priceLevel)}
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-terracotta"
                    onClick={() => setIds(toggleSaved(r.id))}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  );
}

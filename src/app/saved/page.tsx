"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import {
  loadSavedIds,
  loadSavedSnapshots,
  toggleSaved,
  type SavedSnapshot,
} from "@/lib/discovery-store";
import { getRestaurantById } from "@/lib/mock-restaurants";

export default function SavedPage() {
  const [items, setItems] = useState<SavedSnapshot[]>([]);

  useEffect(() => {
    const ids = loadSavedIds();
    const snaps = loadSavedSnapshots();
    const byId = new Map(snaps.map((s) => [s.id, s]));
    const merged: SavedSnapshot[] = ids.map((id) => {
      const snap = byId.get(id);
      if (snap) return snap;
      const demo = getRestaurantById(id);
      if (demo) {
        return {
          id: demo.id,
          name: demo.name,
          city: demo.city,
          country: demo.country,
          cuisine: demo.cuisine,
          imageUrl: demo.imageUrl,
          rating: demo.rating,
          priceLevel: demo.priceLevel,
          neighborhood: demo.neighborhood,
          lat: demo.lat,
          lng: demo.lng,
          phone: demo.phone,
          website: demo.website,
          address: demo.address,
        };
      }
      return {
        id,
        name: id.startsWith("places-") ? "Saved Places venue" : id,
        city: "",
        country: "",
        cuisine: [],
        imageUrl:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
        rating: 0,
        priceLevel: 2 as const,
        neighborhood: "",
        lat: 0,
        lng: 0,
        phone: "",
        address: "",
      };
    });
    setItems(merged);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-semibold text-forest">
        Saved
      </h1>
      <p className="mt-2 text-ink-soft">
        Shortlist on this device — snapshots keep Places IDs usable offline.
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
          {items.map((r) => (
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
                  className="font-display text-lg font-semibold text-forest"
                >
                  {r.name}
                </Link>
                <p className="text-sm text-ink-muted">
                  {[r.city, r.cuisine[0]].filter(Boolean).join(" · ")}
                  {r.rating ? ` · ★ ${r.rating}` : ""}
                  {r.priceLevel ? ` · ${"€".repeat(r.priceLevel)}` : ""}
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-terracotta"
                  onClick={() => {
                    toggleSaved(r.id);
                    setItems((prev) => prev.filter((x) => x.id !== r.id));
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

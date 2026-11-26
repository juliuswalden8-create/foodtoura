"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ALLERGEN_LABEL, SAFETY_COPY } from "@/lib/allergens";
import {
  loadDiscoveryState,
  loadSavedIds,
  loadSavedSnapshots,
  toggleSaved,
} from "@/lib/discovery-store";
import { authenticityLabel } from "@/lib/authenticity";
import { fetchRestaurantById } from "@/lib/discover-client";
import { addStop, loadItinerary } from "@/lib/itinerary";
import { rankRestaurants } from "@/lib/ranking";
import { DetailSkeleton } from "@/components/Skeleton";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import {
  SafetyBanner,
  SafetyLevelPill,
  SourceBadge,
} from "@/components/SafetyBanner";
import type { RankedRestaurant, Restaurant } from "@/lib/types";

export default function RestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ranked, setRanked] = useState<RankedRestaurant | null>(null);
  const [saved, setSaved] = useState(false);
  const [planToast, setPlanToast] = useState(false);
  const [dataMode, setDataMode] = useState<"demo" | "live">("demo");

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        let restaurant: Restaurant | null = await fetchRestaurantById(
          params.id,
          ac.signal,
        );
        if (!restaurant) {
          const snap = loadSavedSnapshots().find((s) => s.id === params.id);
          if (snap) {
            restaurant = {
              ...snap,
              description: "Saved snapshot — live details unavailable offline.",
              gallery: [snap.imageUrl],
              reviewCount: 0,
              reviewReliability: "low",
              avgPricePerPerson: snap.priceLevel * 18,
              currency: "EUR",
              outdoorSeating: false,
              livelyAtmosphere: false,
              quietAtmosphere: false,
              acceptsLargeGroups: false,
              childFriendly: false,
              wheelchairAccessible: false,
              hours: "Unknown",
              dietarySupported: [],
              allergens: [],
              safetyDisclaimer:
                "Saved offline snapshot. Verify allergen and hours with the venue.",
              highlights: [],
              dataCompleteness: 0.3,
              country: snap.country || "",
            };
          }
        }
        if (!restaurant) {
          setRanked(null);
          setError("Restaurant not found");
          return;
        }
        setDataMode(restaurant.id.startsWith("places-") ? "live" : "demo");
        const state = loadDiscoveryState();
        const list = rankRestaurants([restaurant], state);
        setRanked(list[0] ?? null);
        setSaved(loadSavedIds().includes(restaurant.id));
      } catch (e) {
        if (ac.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Failed to load restaurant");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [params.id]);

  if (loading) return <DetailSkeleton />;

  if (!ranked) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-forest dark:text-cream">
          Restaurant not found
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{error}</p>
        <Link href="/discover/results" className="btn-primary mt-6 inline-flex">
          Back to results
        </Link>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${ranked.lat},${ranked.lng}`,
  )}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem]">
        <Image
          src={ranked.imageUrl}
          alt={ranked.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-terracotta">
            {ranked.city}
            {ranked.neighborhood ? ` · ${ranked.neighborhood}` : ""}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream sm:text-4xl">
            {ranked.name}
          </h1>
          <p className="mt-2 text-ink-soft">
            {ranked.cuisine.join(" · ")} · ★ {ranked.rating.toFixed(1)} ·{" "}
            {"€".repeat(ranked.priceLevel)} · ~{ranked.distanceKm} km
            straight-line
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SafetyLevelPill level={ranked.safetyLevel} />
          <button
            type="button"
            className="btn-secondary !py-2 text-xs"
            onClick={() =>
              setSaved(toggleSaved(ranked.id, ranked).includes(ranked.id))
            }
          >
            {saved ? "Saved ♥" : "Save"}
          </button>
          <button
            type="button"
            className="btn-secondary !py-2 text-xs"
            onClick={() => {
              addStop(loadItinerary(), {
                restaurantId: ranked.id,
                name: ranked.name,
                city: ranked.city,
                time: "20:00",
                note: "",
              });
              setPlanToast(true);
            }}
          >
            Add to tonight
          </button>
          <Link href="/passport" className="btn-secondary !py-2 text-xs">
            Allergy Passport
          </Link>
          <Link href="/waiter" className="btn-secondary !py-2 text-xs">
            AI Waiter
          </Link>
          <Link href="/journal" className="btn-secondary !py-2 text-xs">
            Log visit
          </Link>
        </div>
      </div>

      {planToast && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-forest-mid/30 bg-forest-mid/10 px-4 py-3 text-sm">
          <span>Added to tonight&apos;s plan.</span>
          <button
            type="button"
            className="font-semibold text-terracotta"
            onClick={() => router.push("/plan")}
          >
            Open plan →
          </button>
        </div>
      )}

      <div className="mt-5 space-y-3">
        <DemoModeBanner compact mode={dataMode} />
        <SafetyBanner />
      </div>

      <p className="mt-6 text-ink-soft leading-relaxed">{ranked.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="chip chip-idle text-xs"
        >
          Directions
        </a>
        {ranked.phone ? (
          <a href={`tel:${ranked.phone}`} className="chip chip-idle text-xs">
            Call
          </a>
        ) : (
          <span className="chip chip-idle text-xs opacity-60">
            Call unavailable
          </span>
        )}
        {ranked.website ? (
          <a
            href={ranked.website}
            target="_blank"
            rel="noopener noreferrer"
            className="chip chip-idle text-xs"
          >
            Website / book via venue
          </a>
        ) : (
          <span className="chip chip-idle text-xs opacity-60">
            No booking partner — contact venue
          </span>
        )}
        <button
          type="button"
          className="chip chip-idle text-xs"
          onClick={async () => {
            const url = window.location.href;
            if (navigator.share) {
              await navigator.share({ title: ranked.name, url });
            } else {
              await navigator.clipboard.writeText(url);
            }
          }}
        >
          Share
        </button>
      </div>

      {ranked.authenticityScore != null && (
        <section className="mt-6 card-surface p-5">
          <h2 className="font-display text-lg font-semibold text-forest dark:text-cream">
            Authenticity estimate
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {authenticityLabel(ranked.authenticityScore)} · score{" "}
            {ranked.authenticityScore}
            {ranked.touristTrapRisk
              ? ` · tourist-trap risk: ${ranked.touristTrapRisk}`
              : ""}
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            {ranked.authenticityNotes ||
              "Heuristic only — not a verified local guide rating."}
          </p>
        </section>
      )}

      {ranked.scoreExplain.length > 0 && (
        <section className="mt-6 card-surface p-5">
          <h2 className="font-display text-lg font-semibold text-forest dark:text-cream">
            Why this score
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Match % is preference fit only — never allergy safety. {SAFETY_COPY.banner}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
            {ranked.scoreExplain.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          {ranked.matchScore != null && (
            <p className="mt-3 text-sm font-semibold text-forest dark:text-cream">
              Match {ranked.matchScore}%
            </p>
          )}
        </section>
      )}

      {ranked.allergyWarnings.length > 0 && (
        <section className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/10 p-5">
          <h2 className="font-semibold text-terracotta-deep">Allergy notes</h2>
          <ul className="mt-2 space-y-1 text-sm text-terracotta-deep">
            {ranked.allergyWarnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      {ranked.allergens.length > 0 && (
        <section className="mt-6 card-surface p-5">
          <h2 className="font-display text-lg font-semibold text-forest dark:text-cream">
            Allergen matrix
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {ranked.allergens.map((a) => (
              <li
                key={a.allergen}
                className="flex items-center justify-between gap-2 rounded-xl bg-sand/50 px-3 py-2 text-sm dark:bg-white/5"
              >
                <span>{ALLERGEN_LABEL[a.allergen]}</span>
                <span className="flex items-center gap-2 text-xs">
                  {a.present === true
                    ? "Present"
                    : a.present === false
                      ? "Not listed"
                      : "Unknown"}
                  <SourceBadge source={a.source} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-xs text-ink-muted">{ranked.safetyDisclaimer}</p>
      {ranked.address && (
        <p className="mt-2 text-sm text-ink-soft">{ranked.address}</p>
      )}
    </div>
  );
}

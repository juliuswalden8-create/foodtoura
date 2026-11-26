"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ALLERGEN_LABEL, SAFETY_COPY } from "@/lib/allergens";
import {
  loadDiscoveryState,
  loadSavedIds,
  toggleSaved,
} from "@/lib/discovery-store";
import { authenticityLabel } from "@/lib/authenticity";
import { addStop, loadItinerary } from "@/lib/itinerary";
import { getRestaurantById, RESTAURANTS } from "@/lib/mock-restaurants";
import { rankRestaurants } from "@/lib/ranking";
import { DetailSkeleton } from "@/components/Skeleton";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import {
  SafetyBanner,
  SafetyLevelPill,
  SourceBadge,
} from "@/components/SafetyBanner";
import type { RankedRestaurant } from "@/lib/types";

export default function RestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [ranked, setRanked] = useState<RankedRestaurant | null>(null);
  const [saved, setSaved] = useState(false);

  const base = useMemo(
    () => getRestaurantById(params.id),
    [params.id],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (!base) {
        setLoading(false);
        return;
      }
      const state = loadDiscoveryState();
      const list = rankRestaurants(
        RESTAURANTS.filter((r) => r.city === base.city),
        state,
      );
      setRanked(
        list.find((r) => r.id === base.id) ?? {
          ...base,
          matchScore: null,
          matchReasons: [],
          allergyWarnings: [],
          safetyLevel: "unknown" as const,
          distanceKm: 0,
          missingDataFlags: [],
          scoreExplain: [],
        },
      );
      setSaved(loadSavedIds().includes(base.id));
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [base]);

  if (loading) return <DetailSkeleton />;

  if (!base || !ranked) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-forest">
          Restaurant not found
        </h1>
        <Link href="/discover/results" className="btn-primary mt-6 inline-flex">
          Back to results
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/discover/results"
        className="text-sm font-medium text-forest hover:text-forest-soft"
      >
        ← Back to matches
      </Link>

      <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-3xl">
        <Image
          src={ranked.imageUrl}
          alt={ranked.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 896px) 100vw, 896px"
        />
      </div>

      <div className="mt-6 animate-fade-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">
              {ranked.name}
            </h1>
            <p className="mt-1 text-charcoal-muted">
              {ranked.neighborhood} · {ranked.city} · {ranked.distanceKm} km · ★{" "}
              {ranked.rating.toFixed(1)} ({ranked.reviewCount})
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-forest px-3 py-1 text-sm font-semibold text-cream dark:bg-forest-mid">
              {ranked.matchScore != null
                ? `${ranked.matchScore}% match`
                : "Match % unavailable"}
            </span>
            <SafetyLevelPill level={ranked.safetyLevel} />
            <button
              type="button"
              className="btn-secondary !py-2 text-xs"
              onClick={() => setSaved(toggleSaved(ranked.id).includes(ranked.id))}
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

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-charcoal-soft">
          {ranked.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {ranked.cuisine.map((c) => (
            <span
              key={c}
              className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-charcoal-soft"
            >
              {c}
            </span>
          ))}
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-charcoal-soft">
            {"€".repeat(ranked.priceLevel)} · avg €{ranked.avgPricePerPerson}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner />
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
            Preference fit only — allergen safety is labeled separately and never
            implied by match %.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-ink-soft">
            {ranked.scoreExplain.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
          {ranked.missingDataFlags.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-amber-800 dark:text-amber-200">
              {ranked.missingDataFlags.map((f) => (
                <li key={f}>⚠ {f}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {ranked.allergyWarnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-800">
            Safety notes for your profile
          </p>
          <ul className="mt-2 space-y-1.5">
            {ranked.allergyWarnings.map((w) => (
              <li key={w} className="text-sm text-red-900">
                · {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-forest">
          Allergen information
        </h2>
        <p className="mt-1 text-sm text-charcoal-muted">
          Each status shows whether info is restaurant-provided, unverified, or
          unavailable. {SAFETY_COPY.banner}
        </p>
        <div className="mt-4 overflow-hidden rounded-3xl border border-mist bg-white">
          <ul className="divide-y divide-mist">
            {ranked.allergens.map((a) => (
              <li
                key={a.allergen}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-charcoal">
                    {ALLERGEN_LABEL[a.allergen]}
                  </p>
                  {a.notes && (
                    <p className="mt-0.5 text-xs text-charcoal-muted">
                      {a.notes}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      a.present === true
                        ? "bg-red-100 text-red-800"
                        : a.present === false
                          ? "bg-forest/10 text-forest"
                          : "bg-charcoal/5 text-charcoal-muted"
                    }`}
                  >
                    {a.present === true
                      ? "Present"
                      : a.present === false
                        ? "Not reported present"
                        : "Unknown"}
                  </span>
                  <SourceBadge source={a.source} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-xs italic text-charcoal-muted">
          {ranked.safetyDisclaimer}
        </p>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="font-display text-lg font-semibold text-forest">
            Visit
          </h3>
          <dl className="mt-3 space-y-2 text-sm text-charcoal-soft">
            <div>
              <dt className="text-xs uppercase tracking-wide text-charcoal-muted">
                Address
              </dt>
              <dd>{ranked.address}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-charcoal-muted">
                Hours
              </dt>
              <dd>{ranked.hours}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-charcoal-muted">
                Phone
              </dt>
              <dd>
                <a className="text-forest underline" href={`tel:${ranked.phone}`}>
                  {ranked.phone}
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <div className="card-surface p-5">
          <h3 className="font-display text-lg font-semibold text-forest">
            Why it matched
          </h3>
          {ranked.matchReasons.length ? (
            <ul className="mt-3 space-y-1.5 text-sm text-charcoal-soft">
              {ranked.matchReasons.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-charcoal-muted">
              Complete discovery to see personalized match reasons.
            </p>
          )}
          <ul className="mt-4 flex flex-wrap gap-2">
            {ranked.highlights.map((h) => (
              <li
                key={h}
                className="rounded-full bg-sand px-3 py-1 text-xs text-charcoal-soft"
              >
                {h}
              </li>
            ))}
          </ul>
          {ranked.dietarySupported.length > 0 && (
            <p className="mt-4 text-xs text-charcoal-muted">
              Dietary support claimed: {ranked.dietarySupported.join(", ")}
            </p>
          )}
        </div>
      </section>

      <div className="mt-10 rounded-2xl border border-forest/15 bg-forest/5 px-4 py-4 text-sm text-forest">
        Sample restaurant data for demo. Live maps, booking, and venue allergen
        APIs can plug into this page later.
      </div>
    </div>
  );
}

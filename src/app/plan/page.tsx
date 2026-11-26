"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import {
  loadSavedIds,
  loadSavedSnapshots,
  type SavedSnapshot,
} from "@/lib/discovery-store";
import {
  addStop,
  loadItinerary,
  saveItinerary,
  type NightItinerary,
} from "@/lib/itinerary";
import { getRestaurantById } from "@/lib/mock-restaurants";

export default function PlanPage() {
  const [plan, setPlan] = useState<NightItinerary | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<
    Array<{ id: string; name: string; city: string }>
  >([]);

  useEffect(() => {
    setPlan(loadItinerary());
    const ids = loadSavedIds();
    const snaps = loadSavedSnapshots();
    const byId = new Map<string, SavedSnapshot>(snaps.map((s) => [s.id, s]));
    setSavedPlaces(
      ids.map((id) => {
        const snap = byId.get(id);
        if (snap) {
          return { id: snap.id, name: snap.name, city: snap.city };
        }
        const demo = getRestaurantById(id);
        return {
          id,
          name: demo?.name || id,
          city: demo?.city || "",
        };
      }),
    );
  }, []);

  if (!plan) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Tonight&apos;s plan</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest">
        Build your evening
      </h1>
      <p className="mt-2 text-ink-soft">
        Stack up to six stops from saved places — drinks, dinner, dessert.
      </p>
      <div className="mt-4">
        <DemoModeBanner compact />
      </div>

      <div className="card-surface mt-6 space-y-3 p-5">
        <input
          className="input-field"
          value={plan.title}
          onChange={(e) => {
            const next = { ...plan, title: e.target.value };
            setPlan(next);
            saveItinerary(next);
          }}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            className="input-field"
            value={plan.date}
            onChange={(e) => {
              const next = { ...plan, date: e.target.value };
              setPlan(next);
              saveItinerary(next);
            }}
          />
          <input
            className="input-field"
            placeholder="City"
            value={plan.city}
            onChange={(e) => {
              const next = { ...plan, city: e.target.value };
              setPlan(next);
              saveItinerary(next);
            }}
          />
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {plan.stops.length === 0 && (
          <li className="card-surface p-5 text-sm text-ink-muted">
            No stops yet — add from your saved list below.
          </li>
        )}
        {plan.stops.map((s, idx) => (
          <li key={s.restaurantId} className="card-surface flex gap-3 p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white">
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={`/restaurant/${s.restaurantId}`}
                className="font-semibold text-forest"
              >
                {s.name}
              </Link>
              <input
                type="time"
                className="input-field mt-2 !py-2"
                value={s.time}
                onChange={(e) => {
                  const stops = plan.stops.map((x) =>
                    x.restaurantId === s.restaurantId
                      ? { ...x, time: e.target.value }
                      : x,
                  );
                  const next = { ...plan, stops };
                  setPlan(next);
                  saveItinerary(next);
                }}
              />
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-terracotta"
                onClick={() => {
                  const next = {
                    ...plan,
                    stops: plan.stops.filter(
                      (x) => x.restaurantId !== s.restaurantId,
                    ),
                  };
                  setPlan(next);
                  saveItinerary(next);
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-8 font-display text-xl font-semibold text-forest">
        Add from saved
      </h2>
      <ul className="mt-3 space-y-2">
        {savedPlaces.length === 0 && (
          <li className="text-sm text-ink-muted">
            Nothing saved yet.{" "}
            <Link href="/explore" className="text-terracotta underline">
              Explore
            </Link>
          </li>
        )}
        {savedPlaces.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-mist px-4 py-3"
          >
            <span className="text-sm font-medium">
              {r.name}
              {r.city ? (
                <span className="ml-2 text-xs font-normal text-ink-muted">
                  {r.city}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              className="btn-secondary !py-2 text-xs"
              onClick={() =>
                setPlan(
                  addStop(plan, {
                    restaurantId: r.id,
                    name: r.name,
                    city: r.city,
                    time: "20:00",
                    note: "",
                  }),
                )
              }
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

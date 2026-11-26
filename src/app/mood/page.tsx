"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { loadDiscoveryState, saveDiscoveryState } from "@/lib/discovery-store";
import { applyMood, MOODS, type MoodId } from "@/lib/mood";

function MoodInner() {
  const router = useRouter();
  const params = useSearchParams();

  function pick(id: MoodId) {
    const next = applyMood(id, loadDiscoveryState());
    if (!next.location.city) {
      next.location.city = "Barcelona";
      next.location.country = "Spain";
    }
    saveDiscoveryState(next);
    router.push("/discover/results");
  }

  useEffect(() => {
    const raw = params.get("mood");
    if (!raw) return;
    const alias: Record<string, MoodId> = {
      outdoor: "outdoor",
      romantic: "romantic",
      family: "family",
    };
    const id = alias[raw] || (MOODS.find((m) => m.id === raw)?.id as MoodId | undefined);
    if (id) pick(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Mood Match</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest">
        How should dinner feel?
      </h1>
      <p className="mt-2 text-ink-soft">
        Mood maps to search parameters we can actually filter on. We never invent
        atmosphere attributes Places doesn&apos;t support.
      </p>
      <div className="mt-4">
        <DemoModeBanner compact />
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {MOODS.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => pick(m.id)}
              className="card-surface w-full p-5 text-left transition hover:-translate-y-0.5"
            >
              <p className="font-display text-xl font-semibold text-forest">
                {m.label}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{m.blurb}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MoodPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-16">
          <div className="skeleton h-40 w-full" />
        </div>
      }
    >
      <MoodInner />
    </Suspense>
  );
}

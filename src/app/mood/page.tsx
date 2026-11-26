"use client";

import { useRouter } from "next/navigation";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { loadDiscoveryState, saveDiscoveryState } from "@/lib/discovery-store";
import { applyMood, MOODS, type MoodId } from "@/lib/mood";

export default function MoodPage() {
  const router = useRouter();

  function pick(id: MoodId) {
    const next = applyMood(id, loadDiscoveryState());
    if (!next.location.city) {
      next.location.city = "Barcelona";
      next.location.country = "Spain";
    }
    saveDiscoveryState(next);
    router.push("/discover/results");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Mood Match</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream">
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
              <p className="font-display text-xl font-semibold text-forest dark:text-cream">
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import { EU_ALLERGENS } from "@/lib/allergens";
import { saveDiscoveryState } from "@/lib/discovery-store";
import {
  createMember,
  mergeGroupToDiscovery,
  type GroupMember,
} from "@/lib/group-match";
import type { AllergenSeverity, CuisineTag } from "@/lib/types";

const CUISINES: CuisineTag[] = [
  "Spanish",
  "Italian",
  "Seafood",
  "Mediterranean",
  "Asian",
  "Japanese",
  "Traditional local food",
  "Street food",
  "Fine dining",
  "Burgers",
];

export default function GroupMatchPage() {
  const router = useRouter();
  const [city, setCity] = useState("Barcelona");
  const [members, setMembers] = useState<GroupMember[]>([
    { ...createMember("Alex"), cuisines: ["Spanish"] },
    { ...createMember("Sam"), cuisines: ["Spanish", "Mediterranean"] },
  ]);

  function update(id: string, patch: Partial<GroupMember>) {
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function toggleCuisine(id: string, c: CuisineTag) {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    const has = m.cuisines.includes(c);
    update(id, {
      cuisines: has ? m.cuisines.filter((x) => x !== c) : [...m.cuisines, c],
    });
  }

  function toggleAllergen(id: string, allergen: GroupMember["allergens"][number]["allergen"]) {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    const has = m.allergens.find((a) => a.allergen === allergen);
    update(id, {
      allergens: has
        ? m.allergens.filter((a) => a.allergen !== allergen)
        : [...m.allergens, { allergen, severity: "allergy" as AllergenSeverity }],
    });
  }

  function runMatch() {
    const merged = mergeGroupToDiscovery(
      members,
      city,
      city === "Lisbon" ? "Portugal" : "Spain",
    );
    saveDiscoveryState(merged);
    router.push("/discover/results");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Group Match</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest">
        Decide together
      </h1>
      <p className="mt-2 text-ink-soft">
        Merge everyone&apos;s tastes and allergies into one safe search.
        Medical allergies always win — we never average them away.
      </p>

      <div className="mt-5 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner compact />
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium">City</label>
        <div className="flex flex-wrap gap-2">
          {["Barcelona", "Lisbon"].map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${city === c ? "chip-active" : "chip-idle"}`}
              onClick={() => setCity(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {members.map((m) => (
          <div key={m.id} className="card-surface space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <input
                className="input-field !py-2 font-semibold"
                value={m.name}
                onChange={(e) => update(m.id, { name: e.target.value })}
              />
              {members.length > 1 && (
                <button
                  type="button"
                  className="text-xs font-semibold text-terracotta"
                  onClick={() =>
                    setMembers((ms) => ms.filter((x) => x.id !== m.id))
                  }
                >
                  Remove
                </button>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Cuisines
              </p>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip text-xs ${m.cuisines.includes(c) ? "chip-active" : "chip-idle"}`}
                    onClick={() => toggleCuisine(m.id, c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Allergens
              </p>
              <div className="flex flex-wrap gap-2">
                {EU_ALLERGENS.slice(0, 8).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`chip text-xs ${
                      m.allergens.some((x) => x.allergen === a.id)
                        ? "chip-active"
                        : "chip-idle"
                    }`}
                    onClick={() => toggleAllergen(m.id, a.id)}
                  >
                    {a.short}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Max € / person
                <input
                  type="number"
                  className="input-field mt-1"
                  value={m.maxBudgetPerPerson ?? ""}
                  onChange={(e) =>
                    update(m.id, {
                      maxBudgetPerPerson: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </label>
              <div className="flex flex-col justify-end gap-2 pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-terracotta"
                    checked={!!m.outdoorSeating}
                    onChange={(e) =>
                      update(m.id, { outdoorSeating: e.target.checked })
                    }
                  />
                  Outdoor seating
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-terracotta"
                    checked={!!m.livelyAtmosphere}
                    onChange={(e) =>
                      update(m.id, { livelyAtmosphere: e.target.checked })
                    }
                  />
                  Lively vibe
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            setMembers((ms) => [...ms, createMember(`Traveler ${ms.length + 1}`)])
          }
        >
          Add traveler
        </button>
        <button type="button" className="btn-primary" onClick={runMatch}>
          Find group matches
        </button>
      </div>
    </div>
  );
}

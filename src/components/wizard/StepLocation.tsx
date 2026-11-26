"use client";

import type { DiscoveryState, TravelMode } from "@/lib/types";
import { DEMO_CITIES } from "@/lib/mock-restaurants";

const MODES: { id: TravelMode; label: string }[] = [
  { id: "walking", label: "Walking" },
  { id: "transit", label: "Transit" },
  { id: "driving", label: "Driving" },
];

export function StepLocation({
  value,
  onChange,
}: {
  value: DiscoveryState["location"];
  onChange: (next: DiscoveryState["location"]) => void;
}) {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h2 className="font-display text-3xl font-semibold text-forest">
          Where are you exploring?
        </h2>
        <p className="mt-2 text-charcoal-soft">
          City, neighborhood, how far you&apos;ll go, and how you&apos;ll get
          there.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-soft">
            City / destination
          </label>
          <input
            className="input-field"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="Barcelona"
            list="wizard-cities"
          />
          <datalist id="wizard-cities">
            {DEMO_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip text-xs ${value.city === c ? "chip-active" : "chip-idle"}`}
                onClick={() => onChange({ ...value, city: c })}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-soft">
            Neighborhood (optional)
          </label>
          <input
            className="input-field"
            value={value.neighborhood}
            onChange={(e) =>
              onChange({ ...value, neighborhood: e.target.value })
            }
            placeholder="e.g. Born, Gràcia, Chiado"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-charcoal-soft">
              Max distance
            </label>
            <span className="text-sm font-semibold text-forest">
              {value.maxDistanceKm} km
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={value.maxDistanceKm}
            onChange={(e) =>
              onChange({ ...value, maxDistanceKm: Number(e.target.value) })
            }
            className="w-full accent-terracotta"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-charcoal-soft">
            Travel preference
          </p>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`chip ${value.travelMode === m.id ? "chip-active" : "chip-idle"}`}
                onClick={() => onChange({ ...value, travelMode: m.id })}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

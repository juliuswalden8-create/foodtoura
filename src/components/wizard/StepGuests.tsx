"use client";

import type { DiscoveryState } from "@/lib/types";

function Counter({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-mist bg-white px-4 py-3">
      <span className="text-sm font-medium text-charcoal-soft">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-mist text-lg text-forest transition hover:border-forest/30"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-6 text-center font-semibold text-forest">{value}</span>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-mist text-lg text-forest transition hover:border-forest/30"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function StepGuests({
  value,
  onChange,
}: {
  value: DiscoveryState["guests"];
  onChange: (next: DiscoveryState["guests"]) => void;
}) {
  const total = value.adults + value.children + value.infants;

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h2 className="font-display text-3xl font-semibold text-forest">
          Who&apos;s at the table?
        </h2>
        <p className="mt-2 text-charcoal-soft">
          Party size, date, and preferred dining time help us filter venues that
          fit.
        </p>
      </div>

      <div className="space-y-3">
        <Counter
          label="Adults"
          value={value.adults}
          min={1}
          onChange={(adults) => onChange({ ...value, adults })}
        />
        <Counter
          label="Children"
          value={value.children}
          onChange={(children) => onChange({ ...value, children })}
        />
        <Counter
          label="Infants"
          value={value.infants}
          onChange={(infants) => onChange({ ...value, infants })}
        />
      </div>

      <p className="text-sm text-charcoal-muted">
        Party of <span className="font-semibold text-forest">{total}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-soft">
            Date
          </label>
          <input
            type="date"
            className="input-field"
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-soft">
            Preferred time
          </label>
          <input
            type="time"
            className="input-field"
            value={value.preferredTime}
            onChange={(e) =>
              onChange({ ...value, preferredTime: e.target.value })
            }
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-mist bg-white px-4 py-3">
        <input
          type="checkbox"
          className="mt-1 accent-terracotta"
          checked={value.largeGroupsOk}
          onChange={(e) =>
            onChange({ ...value, largeGroupsOk: e.target.checked })
          }
        />
        <span>
          <span className="block text-sm font-medium text-charcoal">
            Large groups are OK
          </span>
          <span className="text-xs text-charcoal-muted">
            We&apos;ll prefer restaurants that welcome bigger tables when your
            party is 6+.
          </span>
        </span>
      </label>
    </div>
  );
}

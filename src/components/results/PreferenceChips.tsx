"use client";

import type { CuisineTag, DiscoveryState } from "@/lib/types";

const CUISINES: CuisineTag[] = [
  "Spanish",
  "Italian",
  "Seafood",
  "Traditional local food",
  "Mediterranean",
  "Fine dining",
  "Japanese",
  "Surprise me",
];

export function PreferenceChips({
  state,
  onChange,
}: {
  state: DiscoveryState;
  onChange: (next: DiscoveryState) => void;
}) {
  function patch(partial: Partial<DiscoveryState> | ((s: DiscoveryState) => DiscoveryState)) {
    const next =
      typeof partial === "function" ? partial(state) : { ...state, ...partial };
    onChange(next);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-mist/80 bg-cream/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Edit preferences — results update live
      </p>
      <div className="flex flex-wrap gap-2">
        {state.location.city && (
          <span className="chip chip-active text-xs">{state.location.city}</span>
        )}
        <span className="chip chip-active text-xs">
          {state.guests.adults + state.guests.children + state.guests.infants} guests
        </span>
        {state.food.maxBudgetPerPerson != null && (
          <button
            type="button"
            className="chip chip-active text-xs"
            onClick={() =>
              patch({
                ...state,
                food: { ...state.food, maxBudgetPerPerson: undefined },
              })
            }
            title="Clear budget"
          >
            ≤ €{state.food.maxBudgetPerPerson} ✕
          </button>
        )}
        {state.food.outdoorSeating && (
          <button
            type="button"
            className="chip chip-active text-xs"
            onClick={() =>
              patch({
                ...state,
                food: { ...state.food, outdoorSeating: false },
              })
            }
          >
            Outdoor ✕
          </button>
        )}
        {state.allergens.map((a) => (
          <button
            key={a.allergen}
            type="button"
            className="chip chip-active text-xs !bg-terracotta/20 !text-terracotta-deep"
            onClick={() =>
              patch({
                ...state,
                allergens: state.allergens.filter((x) => x.allergen !== a.allergen),
              })
            }
            title="Remove allergen flag (never auto-relaxed by ranking)"
          >
            {a.allergen.replace("_", " ")} ✕
          </button>
        ))}
        {state.dietary.map((d) => (
          <button
            key={d}
            type="button"
            className="chip chip-active text-xs"
            onClick={() =>
              patch({
                ...state,
                dietary: state.dietary.filter((x) => x !== d),
              })
            }
          >
            {d} ✕
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {CUISINES.map((c) => {
          const on = state.food.cuisines.includes(c);
          return (
            <button
              key={c}
              type="button"
              className={`chip text-xs ${on ? "chip-active" : "chip-idle"}`}
              onClick={() =>
                patch({
                  ...state,
                  food: {
                    ...state.food,
                    cuisines: on
                      ? state.food.cuisines.filter((x) => x !== c)
                      : [...state.food.cuisines, c],
                  },
                })
              }
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <label className="flex items-center gap-1.5">
          Adults
          <input
            type="number"
            min={1}
            max={20}
            className="input-field !w-16 !py-1.5 text-sm"
            value={state.guests.adults}
            onChange={(e) =>
              patch({
                ...state,
                guests: {
                  ...state.guests,
                  adults: Math.max(1, Number(e.target.value) || 1),
                },
              })
            }
          />
        </label>
        <label className="flex items-center gap-1.5">
          Kids
          <input
            type="number"
            min={0}
            max={12}
            className="input-field !w-16 !py-1.5 text-sm"
            value={state.guests.children}
            onChange={(e) =>
              patch({
                ...state,
                guests: {
                  ...state.guests,
                  children: Math.max(0, Number(e.target.value) || 0),
                },
              })
            }
          />
        </label>
        <label className="flex items-center gap-1.5">
          Budget €
          <input
            type="number"
            min={5}
            max={300}
            className="input-field !w-20 !py-1.5 text-sm"
            value={state.food.maxBudgetPerPerson ?? ""}
            placeholder="—"
            onChange={(e) =>
              patch({
                ...state,
                food: {
                  ...state.food,
                  maxBudgetPerPerson: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                },
              })
            }
          />
        </label>
        <button
          type="button"
          className={`chip text-xs ${state.food.outdoorSeating ? "chip-active" : "chip-idle"}`}
          onClick={() =>
            patch({
              ...state,
              food: {
                ...state.food,
                outdoorSeating: !state.food.outdoorSeating,
              },
            })
          }
        >
          Outdoor
        </button>
      </div>
    </div>
  );
}

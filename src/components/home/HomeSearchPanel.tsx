"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  defaultDiscoveryState,
  loadDestination,
  saveDiscoveryState,
} from "@/lib/discovery-store";
import type { CuisineTag, DietaryPreference, EuAllergen } from "@/lib/types";

const CUISINES: CuisineTag[] = [
  "Spanish",
  "Italian",
  "Seafood",
  "Traditional local food",
  "Mediterranean",
  "Japanese",
  "Surprise me",
];

const DIETS: DietaryPreference[] = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Halal",
];

const ALLERGENS: { id: EuAllergen; label: string }[] = [
  { id: "peanuts", label: "Peanuts" },
  { id: "nuts", label: "Tree nuts" },
  { id: "milk", label: "Milk" },
  { id: "eggs", label: "Eggs" },
  { id: "fish", label: "Fish" },
  { id: "crustaceans", label: "Shellfish" },
  { id: "cereals_gluten", label: "Gluten" },
  { id: "sesame", label: "Sesame" },
];

export function HomeSearchPanel() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [freeText, setFreeText] = useState("");
  const [adults, setAdults] = useState(2);
  const [budget, setBudget] = useState<number | "">("");
  const [cuisines, setCuisines] = useState<CuisineTag[]>([]);
  const [dietary, setDietary] = useState<DietaryPreference[]>([]);
  const [allergens, setAllergens] = useState<EuAllergen[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [advanced, setAdvanced] = useState(false);

  useEffect(() => {
    const dest = loadDestination();
    if (dest?.city) setCity(dest.city);
    if (dest?.country) setCountry(dest.country);
  }, []);

  function toggleCuisine(c: CuisineTag) {
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function toggleDiet(d: DietaryPreference) {
    setDietary((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  function toggleAllergen(a: EuAllergen) {
    setAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  }

  function buildState() {
    const state = defaultDiscoveryState();
    state.location.city = city.trim();
    state.location.country = country.trim();
    state.food.freeText = freeText.trim();
    state.food.cuisines = cuisines;
    state.food.maxBudgetPerPerson =
      budget === "" ? undefined : Number(budget);
    state.guests.adults = Math.max(1, adults);
    if (date) state.guests.date = date;
    if (time) state.guests.preferredTime = time;
    state.dietary = dietary;
    state.allergens = allergens.map((allergen) => ({
      allergen,
      severity: "allergy" as const,
    }));
    return state;
  }

  function findTable(e: React.FormEvent) {
    e.preventDefault();
    const state = buildState();
    saveDiscoveryState(state);
    if (freeText.trim().length > 12) {
      router.push(`/guide?q=${encodeURIComponent(freeText.trim())}`);
      return;
    }
    router.push("/discover/results");
  }

  function openGuide() {
    const state = buildState();
    saveDiscoveryState(state);
    router.push(
      freeText.trim()
        ? `/guide?q=${encodeURIComponent(freeText.trim())}`
        : "/guide",
    );
  }

  return (
    <form
      onSubmit={findTable}
      className="rounded-[1.75rem] border border-[#E8DFD0] bg-[#FFFDF9] p-5 shadow-lift sm:p-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#344E41]">
            Find your table
          </h2>
          <p className="mt-1 text-sm text-[#62675E]">
            Destination, craving, people and needs — in one place.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[#62675E]">
          Destination
          <input
            className="input-field mt-1.5"
            placeholder="City — e.g. Marbella"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-[#62675E]">
          Country <span className="font-normal text-[#7A7F76]">(optional)</span>
          <input
            className="input-field mt-1.5"
            placeholder="Spain"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </label>
      </div>

      <label className="mt-3 block text-sm font-medium text-[#62675E]">
        What are you looking for?
        <textarea
          className="input-field mt-1.5 min-h-[96px] resize-y"
          placeholder='e.g. “Six people, authentic Spanish, outdoor, around €30 each, one peanut allergy.”'
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[#62675E]">
          Guests
          <input
            type="number"
            min={1}
            max={20}
            className="input-field !w-20 !py-2"
            value={adults}
            onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[#62675E]">
          Budget €/person
          <input
            type="number"
            min={5}
            max={400}
            className="input-field !w-24 !py-2"
            placeholder="—"
            value={budget}
            onChange={(e) =>
              setBudget(e.target.value ? Number(e.target.value) : "")
            }
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7A7F76]">
          Cuisine
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CUISINES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip text-xs ${cuisines.includes(c) ? "chip-active" : "chip-idle"}`}
              onClick={() => toggleCuisine(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="mt-4 text-sm font-semibold text-[#344E41] underline-offset-2 hover:underline"
        onClick={() => setAdvanced((v) => !v)}
        aria-expanded={advanced}
      >
        {advanced ? "Hide advanced preferences" : "Show advanced preferences"}
      </button>

      {advanced && (
        <div className="mt-4 space-y-4 rounded-2xl border border-[#E8DFD0] bg-[#F1ECE3]/40 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7A7F76]">
              Dietary
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`chip text-xs ${dietary.includes(d) ? "chip-active" : "chip-idle"}`}
                  onClick={() => toggleDiet(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7A7F76]">
              Allergies{" "}
              <span className="font-normal normal-case tracking-normal">
                (we never claim a venue is safe — always verify)
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALLERGENS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`chip text-xs ${
                    allergens.includes(a.id)
                      ? "!border-[#A86B52] !bg-[#C9856B]/20 !text-[#A86B52]"
                      : "chip-idle"
                  }`}
                  onClick={() => toggleAllergen(a.id)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-[#62675E]">
              Date
              <input
                type="date"
                className="input-field mt-1"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="text-sm text-[#62675E]">
              Preferred time
              <input
                type="time"
                className="input-field mt-1"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="btn-primary flex-1">
          Find my table
        </button>
        <button
          type="button"
          className="btn-secondary flex-1"
          onClick={openGuide}
        >
          Ask your local guide
        </button>
      </div>
    </form>
  );
}

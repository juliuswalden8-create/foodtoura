"use client";

import { useMemo, useState } from "react";
import { DemoModeBanner } from "@/components/DemoModeBanner";

export default function BillPage() {
  const [total, setTotal] = useState(86);
  const [people, setPeople] = useState(4);
  const [tipPct, setTipPct] = useState(10);
  const [custom, setCustom] = useState<string>("");

  const tip = useMemo(() => (total * tipPct) / 100, [total, tipPct]);
  const grand = total + tip;
  const equal = people > 0 ? grand / people : 0;

  const customs = custom
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => !Number.isNaN(n) && n >= 0);
  const customSum = customs.reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Bill split</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream">
        Split the check
      </h1>
      <p className="mt-2 text-ink-soft">
        Local calculator — no payments. Tip customs vary by country.
      </p>
      <div className="mt-4">
        <DemoModeBanner compact />
      </div>

      <div className="card-surface mt-6 space-y-4 p-5">
        <label className="block text-sm font-medium">
          Bill total (€)
          <input
            type="number"
            min={0}
            step={0.01}
            className="input-field mt-1"
            value={total}
            onChange={(e) => setTotal(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>
        <label className="block text-sm font-medium">
          People
          <input
            type="number"
            min={1}
            className="input-field mt-1"
            value={people}
            onChange={(e) =>
              setPeople(Math.max(1, Number(e.target.value) || 1))
            }
          />
        </label>
        <label className="block text-sm font-medium">
          Tip {tipPct}%
          <input
            type="range"
            min={0}
            max={25}
            value={tipPct}
            onChange={(e) => setTipPct(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </label>
        <div className="rounded-2xl bg-sand/60 p-4 text-sm dark:bg-white/5">
          <p>Tip: €{tip.toFixed(2)}</p>
          <p className="mt-1 font-semibold">
            Total with tip: €{grand.toFixed(2)}
          </p>
          <p className="mt-2 text-forest dark:text-cream">
            Equal split: €{equal.toFixed(2)} / person
          </p>
        </div>
        <label className="block text-sm font-medium">
          Custom amounts (comma-separated €)
          <input
            className="input-field mt-1"
            placeholder="e.g. 20, 25, 21, 20"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        </label>
        {customs.length > 0 && (
          <p
            className={`text-sm ${Math.abs(customSum - grand) < 0.05 ? "text-forest" : "text-terracotta"}`}
          >
            Custom sum €{customSum.toFixed(2)} vs €{grand.toFixed(2)}
            {Math.abs(customSum - grand) >= 0.05 ? " — does not match" : " ✓"}
          </p>
        )}
        <button
          type="button"
          className="btn-secondary"
          onClick={async () => {
            const text = `FoodToura bill · €${grand.toFixed(2)} total · ${people} people · €${equal.toFixed(2)} each (${tipPct}% tip)`;
            await navigator.clipboard.writeText(text);
          }}
        >
          Copy summary
        </button>
      </div>
    </div>
  );
}

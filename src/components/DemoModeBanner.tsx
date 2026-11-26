"use client";

import { useEffect, useState } from "react";

export function DemoModeBanner({
  compact = false,
  mode,
}: {
  compact?: boolean;
  mode?: "demo" | "live";
}) {
  const [resolved, setResolved] = useState<"demo" | "live" | "unknown">(
    mode ?? "unknown",
  );

  useEffect(() => {
    if (mode) {
      setResolved(mode);
      return;
    }
    let cancelled = false;
    fetch("/api/discover")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setResolved(d.dataMode === "live" ? "live" : "demo");
      })
      .catch(() => {
        if (!cancelled) setResolved("demo");
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const isLive = resolved === "live";

  return (
    <div
      role="status"
      className={`rounded-2xl border ${
        isLive
          ? "border-forest-mid/40 bg-forest-mid/10 text-forest dark:text-cream"
          : "border-mist bg-sand/80 text-ink-soft dark:border-border dark:bg-sand dark:text-cream"
      } ${compact ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-xs sm:text-sm"}`}
    >
      <p className="font-semibold tracking-wide text-forest dark:text-cream">
        {isLive ? "Live restaurant listings" : "Preview restaurants"}
      </p>
      <p className={`mt-0.5 leading-relaxed ${compact ? "text-[11px]" : ""}`}>
        {isLive
          ? "Venue details come from Google Places. Always confirm allergens directly with the restaurant."
          : "You're exploring FoodToura with sample restaurants for Barcelona & Lisbon. Live city-wide search unlocks when a Google Places key is added on the server — never mixed with these previews."}
      </p>
    </div>
  );
}

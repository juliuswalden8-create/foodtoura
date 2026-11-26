"use client";

import { useEffect, useState } from "react";
import { DEMO_ATTRIBUTION, LIVE_ATTRIBUTION } from "@/lib/provider";

export function DemoModeBanner({
  compact = false,
  mode,
}: {
  compact?: boolean;
  /** When known from an API response, prefer this over probing */
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
      className={`rounded-2xl border text-forest dark:text-cream ${
        isLive
          ? "border-forest/40 bg-forest/10 dark:border-forest-mid/50 dark:bg-forest-mid/20"
          : "border-forest-mid/30 bg-forest-mid/10 dark:border-forest-mid/40 dark:bg-forest-mid/20"
      } ${compact ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-xs sm:text-sm"}`}
    >
      <p className="font-semibold tracking-wide">
        {isLive ? "Live Places data" : "Fictional demo mode"}
      </p>
      <p
        className={`mt-0.5 leading-relaxed opacity-90 ${compact ? "text-[11px]" : ""}`}
      >
        {isLive ? LIVE_ATTRIBUTION : DEMO_ATTRIBUTION}
        {!isLive &&
          " Live Google Places appears only when a server API key is configured — never mixed with demo listings."}
      </p>
    </div>
  );
}

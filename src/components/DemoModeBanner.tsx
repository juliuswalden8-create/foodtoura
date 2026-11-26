"use client";

import { DEMO_ATTRIBUTION } from "@/lib/provider";

export function DemoModeBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="status"
      className={`rounded-2xl border border-forest-mid/30 bg-forest-mid/10 text-forest dark:border-forest-mid/40 dark:bg-forest-mid/20 dark:text-cream ${
        compact ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-xs sm:text-sm"
      }`}
    >
      <p className="font-semibold tracking-wide">Fictional demo mode</p>
      <p className={`mt-0.5 leading-relaxed opacity-90 ${compact ? "text-[11px]" : ""}`}>
        {DEMO_ATTRIBUTION} Live Google Places data appears only when an API key
        is configured — never mixed with demo listings.
      </p>
    </div>
  );
}

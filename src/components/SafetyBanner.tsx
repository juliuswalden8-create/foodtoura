import { SAFETY_COPY } from "@/lib/allergens";

export function SafetyBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className={`rounded-2xl border border-terracotta/30 bg-terracotta/10 text-ink ${
        compact ? "px-3.5 py-3 text-xs" : "px-4 py-3.5 text-sm"
      }`}
    >
      <p className="font-semibold text-terracotta-deep">Allergy safety</p>
      <p className={`mt-1 leading-relaxed text-ink-soft ${compact ? "text-xs" : ""}`}>
        {SAFETY_COPY.banner}
      </p>
    </div>
  );
}

export function SourceBadge({
  source,
}: {
  source: "restaurant_provided" | "unverified" | "unavailable";
}) {
  const map = {
    restaurant_provided: {
      label: "Restaurant-provided",
      className: "bg-forest/10 text-forest border-forest/20",
    },
    unverified: {
      label: "Unverified",
      className: "bg-amber-100 text-amber-900 border-amber-200",
    },
    unavailable: {
      label: "Unavailable",
      className: "bg-charcoal/5 text-charcoal-muted border-mist",
    },
  } as const;
  const s = map[source];
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
}

export function SafetyLevelPill({
  level,
}: {
  level: "compatible" | "caution" | "unknown" | "conflict";
}) {
  const map = {
    compatible: {
      label: "No reported conflicts",
      className: "bg-forest text-white",
    },
    caution: {
      label: "Verify before dining",
      className: "bg-amber-500 text-white",
    },
    unknown: {
      label: "Allergen info incomplete",
      className: "bg-charcoal-soft text-white",
    },
    conflict: {
      label: "Allergy conflict",
      className: "bg-red-700 text-white",
    },
  } as const;
  const s = map[level];
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
}

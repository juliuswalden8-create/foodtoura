"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import {
  loadDiscoveryState,
  saveDiscoveryState,
} from "@/lib/discovery-store";
import { decodeTrip, tripShareUrl } from "@/lib/share-trip";
import type { DiscoveryState } from "@/lib/types";

function TripInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<DiscoveryState | null>(null);
  const [share, setShare] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("t");
    if (token) {
      const decoded = decodeTrip(token);
      if (!decoded) {
        setError("This trip link is invalid or corrupted.");
        return;
      }
      saveDiscoveryState(decoded);
      setState(decoded);
      setShare(tripShareUrl(decoded));
      return;
    }
    const current = loadDiscoveryState();
    setState(current);
    setShare(tripShareUrl(current));
  }, [params]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-red-700">{error}</p>
        <Link href="/guide" className="btn-primary mt-6 inline-flex">
          Start a new search
        </Link>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Shared trip</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest">
        {state.location.city || "Your journey"}
      </h1>
      <p className="mt-2 text-ink-soft">
        Party of{" "}
        {state.guests.adults + state.guests.children + state.guests.infants}
        {state.food.cuisines.length
          ? ` · ${state.food.cuisines.slice(0, 3).join(", ")}`
          : ""}
        {state.allergens.length
          ? ` · ${state.allergens.length} allergen flag(s)`
          : ""}
      </p>

      <div className="mt-5">
        <DemoModeBanner compact />
      </div>

      <div className="card-surface mt-6 space-y-3 p-5">
        <p className="text-sm font-medium">Share link</p>
        <input className="input-field text-xs" readOnly value={share} />
        <button
          type="button"
          className="btn-secondary"
          onClick={async () => {
            await navigator.clipboard.writeText(share);
            setCopied(true);
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <p className="text-xs text-ink-muted">
          Prefs travel in the URL — no account required. Allergy flags stay
          visible when recipients open results.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            saveDiscoveryState(state);
            router.push("/discover/results");
          }}
        >
          Open matches
        </button>
        <Link href="/guide" className="btn-secondary">
          Ask your guide
        </Link>
      </div>
    </div>
  );
}

export default function TripPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-16">
          <div className="skeleton h-40 w-full" />
        </div>
      }
    >
      <TripInner />
    </Suspense>
  );
}

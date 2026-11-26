"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CITIES } from "@/lib/mock-restaurants";
import {
  defaultDiscoveryState,
  saveDiscoveryState,
} from "@/lib/discovery-store";

export function LocationSearch() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startWithCity(nextCity: string, coords?: { lat: number; lng: number }) {
    const state = defaultDiscoveryState();
    state.location.city = nextCity;
    state.location.country =
      nextCity === "Lisbon" ? "Portugal" : nextCity === "Barcelona" ? "Spain" : "";
    if (coords) {
      state.location.useCurrentLocation = true;
      state.location.lat = coords.lat;
      state.location.lng = coords.lng;
    }
    saveDiscoveryState(state);
    router.push("/discover");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = city.trim();
    if (!trimmed) {
      setError("Enter a city to begin.");
      return;
    }
    setError(null);
    startWithCity(trimmed);
  }

  function useCurrentLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        // Demo: map unknown GPS to nearest demo city (Barcelona / Lisbon region heuristic)
        const { latitude, longitude } = pos.coords;
        const nearLisbon =
          Math.abs(latitude - 38.72) < 2 && Math.abs(longitude + 9.14) < 2;
        const detected = nearLisbon ? "Lisbon" : "Barcelona";
        setCity(detected);
        startWithCity(detected, { lat: latitude, lng: longitude });
      },
      () => {
        setLocating(false);
        setError("Location permission denied. Try searching for a city instead.");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  return (
    <div className="w-full max-w-xl animate-fade-up" style={{ animationDelay: "120ms" }}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="city-search">
          City or destination
        </label>
        <input
          id="city-search"
          className="input-field flex-1"
          placeholder="Where are you going? e.g. Barcelona"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          list="demo-cities"
          autoComplete="off"
        />
        <datalist id="demo-cities">
          {DEMO_CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button type="submit" className="btn-primary whitespace-nowrap">
          Find my perfect restaurant
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="btn-secondary !py-2.5 text-xs"
        >
          {locating ? "Locating…" : "Use current location"}
        </button>
        <div className="flex flex-wrap gap-2">
          {DEMO_CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => startWithCity(c)}
              className="chip chip-idle text-xs"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-charcoal-muted">
        Guests can start without an account. Demo cities with rich sample data: Barcelona & Lisbon.
      </p>
    </div>
  );
}

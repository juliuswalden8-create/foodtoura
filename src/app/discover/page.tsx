"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { StepLocation } from "@/components/wizard/StepLocation";
import { StepGuests } from "@/components/wizard/StepGuests";
import { StepFood } from "@/components/wizard/StepFood";
import { StepAllergies } from "@/components/wizard/StepAllergies";
import {
  defaultDiscoveryState,
  loadDiscoveryState,
  saveDiscoveryState,
} from "@/lib/discovery-store";
import type { DiscoveryState } from "@/lib/types";

export default function DiscoverPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<DiscoveryState>(defaultDiscoveryState);
  const [ready, setReady] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  useEffect(() => {
    setState(loadDiscoveryState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveDiscoveryState(state);
  }, [state, ready]);

  function go(next: number) {
    setDirection(next > step ? "forward" : "back");
    setStep(next);
  }

  function canContinue() {
    if (step === 1) return state.location.city.trim().length > 0;
    if (step === 2) return state.guests.adults >= 1;
    return true;
  }

  function finish() {
    saveDiscoveryState(state);
    router.push("/discover/results");
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="skeleton mb-6 h-3 w-full" />
        <div className="skeleton mb-4 h-10 w-2/3" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <WizardProgress step={step} />

      <div
        key={`${step}-${direction}`}
        className="card-surface p-5 sm:p-8"
      >
        {step === 1 && (
          <StepLocation
            value={state.location}
            onChange={(location) => setState({ ...state, location })}
          />
        )}
        {step === 2 && (
          <StepGuests
            value={state.guests}
            onChange={(guests) => setState({ ...state, guests })}
          />
        )}
        {step === 3 && (
          <StepFood
            value={state.food}
            onChange={(food) => setState({ ...state, food })}
            onParsedAllergens={(allergens) => {
              const map = new Map(
                state.allergens.map((a) => [a.allergen, a]),
              );
              for (const a of allergens) map.set(a.allergen, a);
              setState((s) => ({ ...s, allergens: Array.from(map.values()) }));
            }}
            onParsedDietary={(dietary) =>
              setState((s) => ({
                ...s,
                dietary: Array.from(new Set([...s.dietary, ...dietary])),
              }))
            }
            onParsedGuests={(adults) =>
              setState((s) => ({
                ...s,
                guests: { ...s.guests, adults: Math.max(s.guests.adults, adults) },
              }))
            }
            onParsedCity={(city) =>
              setState((s) => ({
                ...s,
                location: { ...s.location, city: s.location.city || city },
              }))
            }
            onParsedDistance={(maxDistanceKm) =>
              setState((s) => ({
                ...s,
                location: { ...s.location, maxDistanceKm },
              }))
            }
            onParsedKids={(children, infants) =>
              setState((s) => ({
                ...s,
                guests: {
                  ...s.guests,
                  children: Math.max(s.guests.children, children),
                  infants: Math.max(s.guests.infants, infants),
                },
              }))
            }
          />
        )}
        {step === 4 && (
          <StepAllergies
            allergens={state.allergens}
            dietary={state.dietary}
            customDietary={state.customDietary}
            onAllergensChange={(allergens) => setState({ ...state, allergens })}
            onDietaryChange={(dietary) => setState({ ...state, dietary })}
            onCustomDietaryChange={(customDietary) =>
              setState({ ...state, customDietary })
            }
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => (step === 1 ? router.push("/") : go(step - 1))}
        >
          {step === 1 ? "Home" : "Back"}
        </button>
        {step < 4 ? (
          <button
            type="button"
            className="btn-primary"
            disabled={!canContinue()}
            onClick={() => go(step + 1)}
          >
            Continue
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={finish}>
            See my matches
          </button>
        )}
      </div>
    </div>
  );
}

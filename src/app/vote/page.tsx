"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import { fetchDiscover } from "@/lib/discover-client";
import { loadDiscoveryState } from "@/lib/discovery-store";
import { loadVotes, saveVotes, tally, type VoteBoard } from "@/lib/group-vote";
import { rankRestaurants } from "@/lib/ranking";
import type { Restaurant } from "@/lib/types";

export default function VotePage() {
  const [board, setBoard] = useState<VoteBoard | null>(null);
  const [deck, setDeck] = useState<Restaurant[]>([]);
  const [dataMode, setDataMode] = useState<"demo" | "live">("demo");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const state = loadDiscoveryState();
    const v = loadVotes();
    if (!v.city && state.location.city) v.city = state.location.city;
    setBoard(v);

    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const result = await fetchDiscover(state, ac.signal);
        if (ac.signal.aborted) return;
        setDataMode(result.mode);
        const ranked = rankRestaurants(result.restaurants, state).slice(0, 8);
        setDeck(ranked);
        setError(
          ranked.length === 0
            ? "No restaurants to vote on for this search. Refine discovery first."
            : null,
        );
      } catch (e) {
        if (ac.signal.aborted) return;
        setError(
          e instanceof Error ? e.message : "Could not load restaurants to vote on.",
        );
        setDeck([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const scores = useMemo(
    () => (board ? tally(board.votes) : {}),
    [board],
  );

  const ordered = useMemo(() => {
    return [...deck].sort(
      (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0),
    );
  }, [deck, scores]);

  if (!board || loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  function vote(id: string, value: "yes" | "maybe" | "no") {
    const next = {
      ...board!,
      votes: { ...board!.votes, [id]: value },
    };
    setBoard(next);
    saveVotes(next);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Group vote</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest">
        Pick a winner together
      </h1>
      <p className="mt-2 text-ink-soft">
        Yes / maybe / no on your current matches. Scores stay on this device —
        multi-device sync needs a shared database (not connected yet).
      </p>

      <div className="mt-4 space-y-3">
        <DemoModeBanner compact mode={dataMode} />
        <SafetyBanner compact />
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error}{" "}
          <Link href="/discover/results" className="underline">
            Open results
          </Link>
        </div>
      )}

      <label className="mt-6 block text-sm font-medium">
        Your name
        <input
          className="input-field mt-1"
          value={board.voterName}
          onChange={(e) => {
            const next = { ...board, voterName: e.target.value };
            setBoard(next);
            saveVotes(next);
          }}
        />
      </label>

      <ul className="mt-6 space-y-4">
        {ordered.map((r) => {
          const current = board.votes[r.id];
          return (
            <li key={r.id} className="card-surface overflow-hidden">
              <div className="flex gap-3 p-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={r.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/restaurant/${r.id}`}
                    className="font-display text-lg font-semibold text-forest"
                  >
                    {r.name}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    {r.cuisine[0]} · ★ {r.rating} · score {scores[r.id] || 0}
                    {r.authenticityScore != null
                      ? ` · authenticity ~${r.authenticityScore}`
                      : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(
                      [
                        ["yes", "Yes"],
                        ["maybe", "Maybe"],
                        ["no", "No"],
                      ] as const
                    ).map(([v, label]) => (
                      <button
                        key={v}
                        type="button"
                        className={`chip text-xs ${
                          current === v ? "chip-active" : "chip-idle"
                        }`}
                        onClick={() => vote(r.id, v)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {ordered[0] && (
        <p className="mt-6 text-sm text-forest">
          Current leader: <strong>{ordered[0].name}</strong>
        </p>
      )}
    </div>
  );
}

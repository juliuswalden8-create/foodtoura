"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import { loadDiscoveryState } from "@/lib/discovery-store";
import { loadVotes, saveVotes, tally, type VoteBoard } from "@/lib/group-vote";
import { RESTAURANTS } from "@/lib/mock-restaurants";
import { rankRestaurants } from "@/lib/ranking";

export default function VotePage() {
  const [board, setBoard] = useState<VoteBoard | null>(null);
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const state = loadDiscoveryState();
    const ranked = rankRestaurants(RESTAURANTS, state).slice(0, 8);
    setIds(ranked.map((r) => r.id));
    const v = loadVotes();
    if (!v.city && state.location.city) v.city = state.location.city;
    setBoard(v);
  }, []);

  const scores = useMemo(
    () => (board ? tally(board.votes) : {}),
    [board],
  );

  const ordered = useMemo(() => {
    return [...ids].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  }, [ids, scores]);

  if (!board) {
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
        Yes / maybe / no on your current matches. Scores stay on this device
        for the demo — sync later with accounts.
      </p>

      <div className="mt-4 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner compact />
      </div>

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
        {ordered.map((id) => {
          const r = RESTAURANTS.find((x) => x.id === id);
          if (!r) return null;
          const current = board.votes[id];
          return (
            <li key={id} className="card-surface overflow-hidden">
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
                    {r.cuisine[0]} · ★ {r.rating} · score {scores[id] || 0}
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
                        onClick={() => vote(id, v)}
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
          Current leader:{" "}
          <strong>
            {RESTAURANTS.find((r) => r.id === ordered[0])?.name || "—"}
          </strong>
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import {
  loadTaste,
  resetTaste,
  saveTaste,
  type TasteProfile,
} from "@/lib/taste-profile";

const DECK = [
  {
    id: "tapas",
    title: "Busy tapas counter",
    cuisine: "Spanish",
    tags: ["lively", "sharing"],
    image:
      "https://images.unsplash.com/photo-1515443961218-a595674c5778?w=900&q=80".replace(
        "1515443961218-a595674c5778",
        "1476224203421-9ac39bcb3327",
      ),
  },
  {
    id: "pasta",
    title: "Handmade pasta",
    cuisine: "Italian",
    tags: ["cozy", "classic"],
    image:
      "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=900&q=80",
  },
  {
    id: "sushi",
    title: "Omakase sushi",
    cuisine: "Japanese",
    tags: ["quiet", "luxury"],
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=900&q=80",
  },
  {
    id: "seafood",
    title: "Grilled seafood",
    cuisine: "Seafood",
    tags: ["outdoor", "fresh"],
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80",
  },
  {
    id: "street",
    title: "Street market bites",
    cuisine: "Street food",
    tags: ["casual", "local"],
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80",
  },
  {
    id: "fine",
    title: "Tasting menu night",
    cuisine: "Fine dining",
    tags: ["formal", "celebratory"],
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80",
  },
  {
    id: "local",
    title: "Neighborhood classic",
    cuisine: "Traditional local food",
    tags: ["authentic", "casual"],
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80",
  },
  {
    id: "burger",
    title: "Casual burger night",
    cuisine: "Burgers",
    tags: ["family", "casual"],
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80",
  },
];

export default function TinderPage() {
  const router = useRouter();
  const [taste, setTaste] = useState<TasteProfile | null>(null);
  const [idx, setIdx] = useState(0);
  const [history, setHistory] = useState<TasteProfile[]>([]);

  useEffect(() => {
    setTaste(loadTaste());
  }, []);

  const card = DECK[idx % DECK.length];
  const progress = useMemo(
    () => Math.min(100, ((taste?.swipes || 0) / 8) * 100),
    [taste],
  );

  function apply(liked: boolean) {
    if (!taste) return;
    setHistory((h) => [...h, taste]);
    const next: TasteProfile = {
      ...taste,
      swipes: taste.swipes + 1,
      likedCuisines: liked
        ? Array.from(new Set([...taste.likedCuisines, card.cuisine]))
        : taste.likedCuisines,
      dislikedCuisines: !liked
        ? Array.from(new Set([...taste.dislikedCuisines, card.cuisine]))
        : taste.dislikedCuisines,
      likedTags: liked
        ? Array.from(new Set([...taste.likedTags, ...card.tags]))
        : taste.likedTags,
      dislikedTags: !liked
        ? Array.from(new Set([...taste.dislikedTags, ...card.tags]))
        : taste.dislikedTags,
    };
    setTaste(next);
    saveTaste(next);
    setIdx((i) => i + 1);
  }

  function undo() {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setTaste(prev);
    saveTaste(prev);
    setIdx((i) => Math.max(0, i - 1));
  }

  if (!taste) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="skeleton aspect-[3/4] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <p className="text-sm font-medium text-terracotta">Food Tinder</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream">
        Train your taste
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Likes reshape restaurant ranking (soft preference only — never allergy
        safety).
      </p>
      <div className="mt-4">
        <DemoModeBanner compact />
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist dark:bg-white/10">
        <div
          className="h-full rounded-full bg-terracotta transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-ink-muted">{taste.swipes} swipes saved</p>

      <div className="card-surface relative mt-6 overflow-hidden">
        <div className="relative aspect-[3/4]">
          <Image src={card.image} alt={card.title} fill className="object-cover" sizes="400px" />
        </div>
        <div className="p-4">
          <p className="font-display text-2xl font-semibold text-forest dark:text-cream">
            {card.title}
          </p>
          <p className="text-sm text-ink-muted">
            {card.cuisine} · {card.tags.join(" · ")}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button type="button" className="btn-secondary" onClick={undo} disabled={!history.length}>
          Undo
        </button>
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-lg text-cream"
          onClick={() => apply(false)}
          aria-label="Dislike"
        >
          ✕
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setIdx((i) => i + 1)}
        >
          Skip
        </button>
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-lg text-cream"
          onClick={() => apply(true)}
          aria-label="Like"
        >
          ♥
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={() => router.push("/discover/results")}
        >
          See updated matches
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            resetTaste();
            setTaste(loadTaste());
            setHistory([]);
            setIdx(0);
          }}
        >
          Reset taste
        </button>
        <Link href="/profile" className="btn-secondary">
          Profile
        </Link>
      </div>
    </div>
  );
}

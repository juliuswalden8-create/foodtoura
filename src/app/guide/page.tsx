"use client";

import {
  FormEvent,
  KeyboardEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatRestaurantCard } from "@/components/guide/ChatRestaurantCard";
import { fetchDiscover } from "@/lib/discover-client";
import {
  defaultDiscoveryState,
  saveDiscoveryState,
} from "@/lib/discovery-store";
import {
  clearGuideSession,
  interpretTurn,
  loadGuideSession,
  saveGuideSession,
  STARTERS,
  uid,
  type ChatMessage,
  type GuideSession,
} from "@/lib/guide-chat";
import { rankRestaurants } from "@/lib/ranking";
import { loadTaste } from "@/lib/taste-profile";

function TypingDots() {
  return (
    <div className="msg-assistant flex items-center gap-1.5 py-4">
      <span className="h-2 w-2 animate-pulse-dot rounded-full bg-forest-mid" />
      <span
        className="h-2 w-2 animate-pulse-dot rounded-full bg-forest-mid"
        style={{ animationDelay: "0.15s" }}
      />
      <span
        className="h-2 w-2 animate-pulse-dot rounded-full bg-forest-mid"
        style={{ animationDelay: "0.3s" }}
      />
    </div>
  );
}

function GuideInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<GuideSession | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [liveHint, setLiveHint] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userNearBottom = useRef(true);

  useEffect(() => {
    const loaded = loadGuideSession();
    const q = searchParams.get("q");
    setSession(loaded);
    if (q && loaded.messages.length === 0) {
      setDraft(q);
    }
    fetch("/api/discover")
      .then((r) => r.json())
      .then((d) => {
        if (d.dataMode !== "live") {
          setLiveHint(
            "Preview restaurants are shown until a Google Places key is connected on the server.",
          );
        }
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    if (!session) return;
    saveGuideSession(session);
    saveDiscoveryState(session.state);
  }, [session]);

  useEffect(() => {
    if (!userNearBottom.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [session?.messages, busy]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    userNearBottom.current = dist < 120;
  }

  async function runSearch(
    base: GuideSession,
    introText: string,
    suggestions: string[],
  ) {
    setBusy(true);
    try {
      const provider = await fetchDiscover(base.state);
      const ranked = rankRestaurants(
        provider.restaurants,
        base.state,
        loadTaste(),
      ).filter((r) => r.safetyLevel !== "conflict");
      const top = ranked.slice(0, 4);

      let text = introText;
      if (top.length === 0) {
        text =
          provider.mode === "live"
            ? "I couldn't find a good match with those filters. Want to loosen the budget or walk a little further?"
            : "I don't have preview places for that city yet. Try Barcelona or Lisbon — or connect Google Places for worldwide results.";
      } else if (provider.mode === "demo") {
        text = `${introText}\n\nThese are carefully curated preview restaurants for tasting FoodToura — not a live city inventory.`;
      }

      const assistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        text,
        createdAt: new Date().toISOString(),
        suggestions:
          top.length > 0
            ? suggestions
            : ["Try Barcelona", "Try Lisbon", "Something cheaper", "New search"],
        restaurants:
          top.length > 0
            ? {
                restaurants: top,
                mode: provider.mode,
                attribution: provider.attribution,
              }
            : undefined,
      };

      setSession({
        ...base,
        messages: [...base.messages, assistant],
      });
    } catch (e) {
      const assistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        text: "I hit a snag looking that up. Shall we try again?",
        createdAt: new Date().toISOString(),
        error: e instanceof Error ? e.message : "Search failed",
        suggestions: ["Try again", "Barcelona Italian under €35", "New conversation"],
      };
      setSession({
        ...base,
        messages: [...base.messages, assistant],
      });
    } finally {
      setBusy(false);
    }
  }

  async function send(text: string) {
    if (!session || !text.trim() || busy) return;
    const trimmed = text.trim();

    if (/^new conversation$/i.test(trimmed)) {
      clearGuideSession();
      setSession({
        messages: [],
        state: loadGuideSession().state,
        askedDistance: false,
      });
      setDraft("");
      return;
    }

    if (/^try again$/i.test(trimmed) && session.messages.length) {
      const lastUser = [...session.messages].reverse().find((m) => m.role === "user");
      if (lastUser) {
        await send(lastUser.text);
      }
      return;
    }

    if (/^open the full list$/i.test(trimmed)) {
      saveDiscoveryState(session.state);
      router.push("/discover/results");
      return;
    }

    // Refine follow-ups on existing search
    let working = { ...session };
    if (/something cheaper/i.test(trimmed) && working.state.food.maxBudgetPerPerson) {
      working = {
        ...working,
        state: {
          ...working.state,
          food: {
            ...working.state.food,
            maxBudgetPerPerson: Math.max(
              10,
              working.state.food.maxBudgetPerPerson - 10,
            ),
          },
        },
      };
    }
    if (/closer to me/i.test(trimmed)) {
      working = {
        ...working,
        state: {
          ...working.state,
          location: {
            ...working.state.location,
            maxDistanceKm: Math.max(
              0.8,
              working.state.location.maxDistanceKm * 0.6,
            ),
          },
        },
      };
    }
    if (/more romantic/i.test(trimmed)) {
      working = {
        ...working,
        state: {
          ...working.state,
          food: {
            ...working.state.food,
            atmosphere: Array.from(
              new Set([
                ...(working.state.food.atmosphere || []),
                "romantic",
                "quiet",
              ]),
            ),
          },
        },
      };
    }

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const withUser: GuideSession = {
      ...working,
      messages: [...working.messages, userMsg],
    };
    setSession(withUser);
    setDraft("");
    setBusy(true);

    // Brief pause so typing feels human
    await new Promise((r) => setTimeout(r, 420));

    const turn = interpretTurn(trimmed, withUser);
    const nextSession: GuideSession = {
      ...withUser,
      state: turn.state,
      askedDistance: turn.askedDistance,
    };

    if (!turn.shouldSearch) {
      const assistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        text: turn.reply,
        createdAt: new Date().toISOString(),
        suggestions: turn.suggestions,
      };
      setSession({
        ...nextSession,
        messages: [...nextSession.messages, assistant],
      });
      setBusy(false);
      return;
    }

    // Show interim message then search
    const interim: ChatMessage = {
      id: uid(),
      role: "assistant",
      text: turn.reply.startsWith("Here are")
        ? "Finding places that feel right…"
        : turn.reply,
      createdAt: new Date().toISOString(),
    };
    const searchingSession: GuideSession = {
      ...nextSession,
      messages: [...nextSession.messages, interim],
    };
    setSession(searchingSession);
    await runSearch(
      searchingSession,
      "Here are some lovely options that match what you're looking for.",
      turn.suggestions,
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(draft);
    }
  }

  function newChat() {
    clearGuideSession();
    setSession({
      messages: [],
      state: defaultDiscoveryState(),
      askedDistance: false,
    });
    setDraft("");
    inputRef.current?.focus();
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="skeleton h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const empty = session.messages.length === 0;

  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl flex-col pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-mist/80 bg-cream/90 px-4 py-3 backdrop-blur-md dark:border-border dark:bg-[#1c2420]/90 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-terracotta">
              Your local guide
            </p>
            <h1 className="font-display text-xl font-semibold text-forest dark:text-cream sm:text-2xl">
              Let&apos;s find somewhere lovely.
            </h1>
          </div>
          <button
            type="button"
            onClick={newChat}
            className="btn-secondary !px-3 !py-2 text-xs"
          >
            New chat
          </button>
        </div>
        {liveHint && (
          <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
            {liveHint} Allergy safety is always checked carefully.
          </p>
        )}
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={onScroll}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {empty && (
          <div className="animate-fade-up">
            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[1.75rem]">
              <Image
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80"
                alt="Warm candlelit dinner table"
                fill
                className="object-cover"
                sizes="672px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent dark:from-[#1c2420]" />
            </div>
            <p className="font-display text-2xl font-semibold text-forest dark:text-cream">
              Your personal food guide, wherever you are.
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Write naturally — like messaging a friend who knows the city. I&apos;ll
              ask only what I need, then show places you can save and visit.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip chip-idle max-w-full text-left text-xs"
                  onClick={() => void send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {session.messages.map((m) => (
          <div key={m.id} className="animate-fade-up space-y-3">
            <div className={m.role === "user" ? "msg-user" : "msg-assistant"}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.error && (
                <p className="mt-2 text-xs text-terracotta-deep">{m.error}</p>
              )}
            </div>
            {m.restaurants && (
              <div className="space-y-3">
                {m.restaurants.restaurants.map((r) => (
                  <ChatRestaurantCard key={r.id} restaurant={r} />
                ))}
                <p className="text-[11px] text-ink-muted">
                  {m.restaurants.mode === "live"
                    ? "Live venue data · verify allergens with the restaurant."
                    : "Preview places · verify allergens with the restaurant."}
                </p>
                <Link
                  href="/discover/results"
                  className="text-xs font-semibold text-terracotta"
                >
                  See the full list →
                </Link>
              </div>
            )}
            {m.suggestions && m.suggestions.length > 0 && !busy && (
              <div className="flex flex-wrap gap-2">
                {m.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip chip-idle text-xs"
                    onClick={() => void send(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {busy && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Composer — fixed above bottom nav */}
      <div className="fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-40 border-t border-mist/80 bg-cream/95 px-3 py-3 backdrop-blur-md dark:border-border dark:bg-[#1c2420]/95 sm:px-6">
        <form
          onSubmit={onSubmit}
          className="mx-auto flex max-w-2xl items-end gap-2 rounded-3xl border border-mist bg-card p-2 shadow-soft dark:border-border"
        >
          <label className="sr-only" htmlFor="guide-composer">
            Message your local guide
          </label>
          <textarea
            id="guide-composer"
            ref={inputRef}
            rows={1}
            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted dark:text-cream"
            placeholder="Tell me what you're craving…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
          />
          <button
            type="submit"
            className="btn-primary !rounded-full !px-4 !py-2.5"
            disabled={busy || !draft.trim()}
            aria-label="Send"
          >
            Send
          </button>
        </form>
        <p className="mt-1.5 px-1 text-[10px] text-ink-muted">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-16">
          <div className="skeleton h-64 w-full rounded-3xl" />
        </div>
      }
    >
      <GuideInner />
    </Suspense>
  );
}

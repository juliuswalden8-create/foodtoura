"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { LocationSearch } from "@/components/LocationSearch";
import {
  defaultDiscoveryState,
  loadDestination,
  loadSavedIds,
  saveDiscoveryState,
} from "@/lib/discovery-store";
import { RESTAURANTS, DEMO_CITIES } from "@/lib/mock-restaurants";
import { useRouter } from "next/navigation";

const TRENDING = [
  {
    city: "Barcelona",
    country: "Spain",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=900&q=80",
  },
  {
    city: "Lisbon",
    country: "Portugal",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&q=80",
  },
];

const QUICK = [
  { href: "/guide", title: "AI Guide", body: "Describe dinner in plain language" },
  { href: "/discover", title: "Guided match", body: "Step-by-step discovery wizard" },
  { href: "/explore", title: "Explore map", body: "Browse demo cities & cuisines" },
  { href: "/saved", title: "Saved", body: "Your shortlist for the trip" },
];

export default function HomePage() {
  const router = useRouter();
  const [destination, setDestination] = useState<{
    city: string;
    country: string;
  } | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setDestination(loadDestination());
    setSavedCount(loadSavedIds().length);
  }, []);

  function startCity(city: string, country: string, navigate = false) {
    const state = defaultDiscoveryState();
    state.location.city = city;
    state.location.country = country;
    saveDiscoveryState(state);
    setDestination({ city, country });
    if (navigate) router.push("/discover");
  }

  function runAiSearch(e: React.FormEvent) {
    e.preventDefault();
    const state = defaultDiscoveryState();
    if (destination?.city) {
      state.location.city = destination.city;
      state.location.country = destination.country;
    }
    state.food.freeText = query;
    saveDiscoveryState(state);
    window.location.href = `/guide?q=${encodeURIComponent(query)}`;
  }

  const localPicks = RESTAURANTS.filter(
    (r) => !destination?.city || r.city === destination.city,
  ).slice(0, 4);

  return (
    <div>
      {/* Hero — brand first */}
      <section className="relative min-h-[70dvh] sm:min-h-[75dvh]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800&q=80"
            alt="Candlelit restaurant table with seasonal dishes"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/85 to-cream/35 dark:from-[#121614] dark:via-[#121614]/90 dark:to-[#121614]/40" />
        </div>

        <div className="relative mx-auto flex min-h-[70dvh] max-w-6xl flex-col justify-end px-4 pb-10 pt-20 sm:min-h-[75dvh] sm:justify-center sm:px-6 sm:pb-16">
          <div className="max-w-xl">
            <p className="animate-fade-up font-display text-sm font-medium tracking-[0.08em] text-terracotta">
              FoodToura
            </p>
            <h1
              className="animate-fade-up mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-forest text-balance dark:text-cream sm:text-5xl"
              style={{ animationDelay: "40ms" }}
            >
              A new city. A thousand restaurants. One perfect match.
            </h1>
            <p
              className="animate-fade-up mt-4 max-w-md text-base leading-relaxed text-ink-soft dark:text-ink-muted sm:text-lg"
              style={{ animationDelay: "80ms" }}
            >
              Tell us what you love, what you need and who you&apos;re traveling
              with. We&apos;ll help you discover restaurants that fit your
              journey.
            </p>
            <div className="mt-7">
              <LocationSearch />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        <DemoModeBanner />

        {/* Destination + AI search */}
        <section className="animate-fade-up card-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Current destination
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-forest dark:text-cream">
                {destination?.city
                  ? `${destination.city}${destination.country ? `, ${destination.country}` : ""}`
                  : "Where next?"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DEMO_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip text-xs ${destination?.city === c ? "chip-active" : "chip-idle"}`}
                  onClick={() => {
                    const country = c === "Lisbon" ? "Portugal" : "Spain";
                    startCity(c, country, true);
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={runAiSearch} className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">
              AI search — no account needed
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="input-field flex-1"
                placeholder='Try: "Six friends in Barcelona, authentic Spanish, outdoor, lively, €35pp, severe peanut allergy"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Search with AI Guide
              </button>
            </div>
          </form>

          {destination?.city && (
            <Link
              href="/discover"
              className="mt-4 inline-flex text-sm font-semibold text-terracotta hover:text-terracotta-deep"
              onClick={() =>
                startCity(destination.city, destination.country || "")
              }
            >
              Continue journey → guided wizard
            </Link>
          )}
        </section>

        {/* Quick features */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-forest dark:text-cream">
            Quick features
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="card-surface block p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <p className="font-semibold text-forest dark:text-cream">
                  {q.title}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{q.body}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Personalized / local discoveries */}
        <section>
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-forest dark:text-cream">
              {destination?.city
                ? `Local discoveries in ${destination.city}`
                : "Sample discoveries"}
            </h2>
            <Link
              href="/explore"
              className="text-sm font-semibold text-forest-mid"
            >
              Explore
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {localPicks.map((r) => (
              <Link
                key={r.id}
                href={`/restaurant/${r.id}`}
                className="card-surface group overflow-hidden"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={r.imageUrl}
                    alt={r.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-forest dark:text-cream">
                    {r.name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {r.cuisine[0]} · ★ {r.rating} · {"€".repeat(r.priceLevel)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending destinations */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-forest dark:text-cream">
            Trending destinations
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {TRENDING.map((t) => (
              <button
                key={t.city}
                type="button"
                className="relative aspect-[16/9] overflow-hidden rounded-3xl text-left"
                onClick={() => startCity(t.city, t.country, true)}
              >
                <Image
                  src={t.image}
                  alt={t.city}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-display text-2xl font-semibold">{t.city}</p>
                  <p className="text-sm text-white/80">{t.country}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recently saved teaser */}
        <section className="card-surface flex items-center justify-between gap-4 p-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-forest dark:text-cream">
              Recently saved
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {savedCount > 0
                ? `${savedCount} place${savedCount > 1 ? "s" : ""} on your shortlist`
                : "Save restaurants while you explore — no account required on this device."}
            </p>
          </div>
          <Link href="/saved" className="btn-secondary !py-2.5 text-xs">
            Open saved
          </Link>
        </section>
      </div>
    </div>
  );
}

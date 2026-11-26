"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { HomeSearchPanel } from "@/components/home/HomeSearchPanel";
import {
  defaultDiscoveryState,
  loadDestination,
  loadSavedIds,
  saveDiscoveryState,
} from "@/lib/discovery-store";
import { RESTAURANTS } from "@/lib/mock-restaurants";
import { useRouter } from "next/navigation";

const EXPERIENCES = [
  {
    title: "Sunny terraces",
    body: "Outdoor tables, late light, shared plates.",
    href: "/mood?mood=outdoor",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
  },
  {
    title: "Romantic evenings",
    body: "Quiet rooms, soft lighting, unhurried service.",
    href: "/mood?mood=romantic",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  },
  {
    title: "Family tables",
    body: "Space for little ones and generous portions.",
    href: "/mood?mood=family",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80",
  },
  {
    title: "Local classics",
    body: "Regional dishes that taste like the place.",
    href: "/local",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  },
] as const;

const DESTINATIONS = [
  {
    city: "Barcelona",
    country: "Spain",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80",
  },
  {
    city: "Lisbon",
    country: "Portugal",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80",
  },
  {
    city: "Marbella",
    country: "Spain",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
  },
  {
    city: "Paris",
    country: "France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Tell us who’s at the table",
    body: "Guests, budget, mood and anything that must be respected — including allergies.",
  },
  {
    n: "02",
    title: "We search with care",
    body: "Live Places data when configured, or a clearly labeled preview inventory.",
  },
  {
    n: "03",
    title: "Choose with confidence",
    body: "Match explanations, honest unknowns, directions and contact — never fake bookings.",
  },
] as const;

export default function HomePage() {
  const router = useRouter();
  const [destination, setDestination] = useState<{
    city: string;
    country: string;
  } | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    setDestination(loadDestination());
    setSavedCount(loadSavedIds().length);
  }, []);

  function startCity(city: string, country: string) {
    const state = defaultDiscoveryState();
    state.location.city = city;
    state.location.country = country;
    saveDiscoveryState(state);
    setDestination({ city, country });
    router.push("/discover/results");
  }

  const localPicks = RESTAURANTS.filter(
    (r) => !destination?.city || r.city === destination.city,
  ).slice(0, 4);

  return (
    <div>
      {/* 2. Split editorial hero */}
      <section className="mx-auto grid max-w-6xl items-stretch gap-0 px-0 lg:grid-cols-2 lg:px-6 lg:pt-6">
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:py-20">
          <p className="animate-fade-up font-display text-sm font-medium tracking-[0.12em] text-[#A86B52]">
            FoodToura
          </p>
          <h1
            className="animate-fade-up mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-[#344E41] text-balance sm:text-5xl lg:text-[3.25rem]"
            style={{ animationDelay: "50ms" }}
          >
            A little closer to home, wherever you go.
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-md text-base leading-relaxed text-[#303A32] sm:text-lg"
            style={{ animationDelay: "100ms" }}
          >
            Discover wonderful restaurants that feel right for you, your taste
            and the people you travel with.
          </p>
          <div
            className="animate-fade-up mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "150ms" }}
          >
            <Link href="#search" className="btn-primary">
              Find my table
            </Link>
            <Link href="/guide" className="btn-secondary">
              Meet your local guide
            </Link>
          </div>
          <p
            className="animate-fade-up mt-6 text-xs text-[#7A7F76]"
            style={{ animationDelay: "200ms" }}
          >
            Good food makes anywhere feel like home.
          </p>
        </div>
        <div className="relative min-h-[42vh] overflow-hidden lg:min-h-[560px] lg:rounded-[2rem]">
          <Image
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=80"
            alt="Naturally lit Mediterranean terrace dining with linen and ceramics"
            fill
            priority
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(250,247,240,0.35) 0%, transparent 40%)",
            }}
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-14 sm:px-6 sm:py-20">
        <DemoModeBanner />

        {/* 3. Unified search */}
        <section id="search" className="scroll-mt-24">
          <HomeSearchPanel />
        </section>

        {/* 4. Dining experience categories */}
        <section>
          <h2 className="font-display text-3xl font-semibold text-[#344E41]">
            How do you want to dine?
          </h2>
          <p className="mt-2 max-w-xl text-[#62675E]">
            Photography-led moods that open real preference flows — not
            decoration.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {EXPERIENCES.map((ex) => (
              <Link
                key={ex.title}
                href={ex.href}
                className="group relative aspect-[16/10] overflow-hidden rounded-[1.5rem]"
              >
                <Image
                  src={ex.image}
                  alt={ex.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#303A32]/75 via-[#303A32]/15 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <p className="font-display text-2xl font-semibold">
                    {ex.title}
                  </p>
                  <p className="mt-1 text-sm text-white/85">{ex.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. Recommended for destination */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-semibold text-[#344E41]">
                {destination?.city
                  ? `For ${destination.city}`
                  : "Sample restaurants"}
              </h2>
              <p className="mt-2 text-sm text-[#62675E]">
                {destination?.city
                  ? "Preview venues for your saved destination. Live Places appear when a key is configured."
                  : "Fictional preview venues until you choose a destination or connect Places."}
              </p>
            </div>
            <Link
              href="/explore"
              className="text-sm font-semibold text-[#344E41] underline-offset-2 hover:underline"
            >
              Browse explore
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {localPicks.map((r) => (
              <Link
                key={r.id}
                href={`/restaurant/${r.id}`}
                className="group overflow-hidden rounded-[1.5rem] border border-[#E8DFD0] bg-[#FFFDF9] shadow-lift transition hover:-translate-y-0.5"
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
                <div className="p-4">
                  <p className="font-display text-lg font-semibold text-[#344E41]">
                    {r.name}
                  </p>
                  <p className="mt-1 text-xs text-[#62675E]">
                    {r.cuisine[0]} · ★ {r.rating.toFixed(1)} ·{" "}
                    {"€".repeat(r.priceLevel)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. AI Local Guide */}
        <section className="grid items-center gap-8 overflow-hidden rounded-[2rem] border border-[#E8DFD0] bg-[#FFFDF9] lg:grid-cols-2">
          <div className="p-7 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#A86B52]">
              Your local guide
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#344E41]">
              Talk like you would to a friend who knows the city.
            </h2>
            <p className="mt-3 text-[#62675E]">
              Ask in natural language. Refine with “something cheaper” or “more
              romantic.” We retrieve real search results — we never invent
              restaurants.
            </p>
            <Link href="/guide" className="btn-primary mt-6 inline-flex">
              Open the guide
            </Link>
          </div>
          <div className="relative min-h-[260px]">
            <Image
              src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&q=80"
              alt="Shared meal at a warmly lit restaurant table"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
        </section>

        {/* 7. Group dining */}
        <section className="rounded-[2rem] bg-[#344E41] px-7 py-10 text-[#FFFDF9] sm:px-10">
          <h2 className="font-display text-3xl font-semibold">
            Dining with friends shouldn&apos;t mean endless group chats.
          </h2>
          <p className="mt-3 max-w-2xl text-[#A7B69A]">
            Collect preferences, respect allergies, vote on a shortlist — on
            this device today. Multi-device sync is prepared for when shared
            storage is connected.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/group"
              className="inline-flex rounded-full bg-[#A86B52] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#8F5743]"
            >
              Start group dining
            </Link>
            <Link
              href="/vote"
              className="inline-flex rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open group vote
            </Link>
          </div>
        </section>

        {/* 8. Scanner + Passport */}
        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/scanner"
            className="rounded-[1.5rem] border border-[#E8DFD0] bg-[#FFFDF9] p-7 shadow-lift transition hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7A7F76]">
              Menu Scanner
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-[#344E41]">
              Translate what you can see on the menu
            </h3>
            <p className="mt-2 text-sm text-[#62675E]">
              Paste menu text now. Photo vision activates when a vision key is
              configured — never a fake menu on failure.
            </p>
          </Link>
          <Link
            href="/passport"
            className="rounded-[1.5rem] border border-[#E8DFD0] bg-[#FFFDF9] p-7 shadow-lift transition hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7A7F76]">
              Allergy Passport
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-[#344E41]">
              Show staff a clear allergy card
            </h3>
            <p className="mt-2 text-sm text-[#62675E]">
              Multilingual wording with cross-contamination questions. Optional
              to store — never a safety guarantee.
            </p>
          </Link>
        </section>

        {/* 9. Destination inspiration */}
        <section>
          <h2 className="font-display text-3xl font-semibold text-[#344E41]">
            Where to next?
          </h2>
          <p className="mt-2 text-[#62675E]">
            Set a destination and jump into discovery. Photographs depict the
            labeled cities.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.map((d) => (
              <button
                key={d.city}
                type="button"
                onClick={() => startCity(d.city, d.country)}
                className="group relative aspect-[3/4] overflow-hidden rounded-[1.5rem] text-left"
              >
                <Image
                  src={d.image}
                  alt={`${d.city}, ${d.country}`}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#303A32]/70 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-display text-xl font-semibold">{d.city}</p>
                  <p className="text-sm text-white/80">{d.country}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 10. How it works */}
        <section>
          <h2 className="font-display text-3xl font-semibold text-[#344E41]">
            How FoodToura works
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-[1.5rem] border border-[#E8DFD0] bg-[#FFFDF9] p-6">
                <p className="font-display text-sm text-[#A7B69A]">{s.n}</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-[#344E41]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#62675E]">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Saved teaser */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[#E8DFD0] bg-[#F1ECE3]/50 px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#344E41]">
              Your shortlist
            </h2>
            <p className="mt-1 text-sm text-[#62675E]">
              {savedCount > 0
                ? `${savedCount} saved place${savedCount > 1 ? "s" : ""} on this device`
                : "Save as you explore — no account required for guest shortlists."}
            </p>
          </div>
          <Link href="/saved" className="btn-secondary !py-2.5 text-xs">
            Open saved
          </Link>
        </section>

        {/* 11. Final CTA */}
        <section className="overflow-hidden rounded-[2rem] border border-[#E8DFD0] bg-[#FFFDF9]">
          <div className="relative px-7 py-14 text-center sm:px-12">
            <h2 className="font-display text-3xl font-semibold text-[#344E41] sm:text-4xl">
              Ready when you are.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[#62675E]">
              Open the guide, set a destination, or walk through Perfect Match —
              FoodToura stays calm, warm and honest about what it knows.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="#search" className="btn-primary">
                Find my table
              </Link>
              <Link href="/discover" className="btn-secondary">
                Perfect Match
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

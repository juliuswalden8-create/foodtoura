"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { resetTaste } from "@/lib/taste-profile";

const LINKS = [
  { href: "/guide", label: "Your local guide" },
  { href: "/tinder", label: "Food Tinder / taste" },
  { href: "/mood", label: "Mood Match" },
  { href: "/group", label: "Group Match" },
  { href: "/vote", label: "Group vote" },
  { href: "/passport", label: "Allergy Passport" },
  { href: "/scanner", label: "Menu Scanner" },
  { href: "/local", label: "Eat Like a Local" },
  { href: "/waiter", label: "AI Waiter" },
  { href: "/journal", label: "Food Passport journal" },
  { href: "/plan", label: "Tonight's plan" },
  { href: "/bill", label: "Bill split" },
  { href: "/trip", label: "Share trip" },
  { href: "/saved", label: "Saved" },
];

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-semibold text-forest dark:text-cream">
        Profile
      </h1>
      <p className="mt-2 text-ink-soft">
        Guest mode — prefs and saves stay on this device. Accounts sync later.
      </p>

      <div className="mt-5">
        <DemoModeBanner compact />
      </div>

      <div className="card-surface mt-6 space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-forest dark:text-cream">Appearance</p>
            <p className="text-sm text-ink-muted">Light / dark mode</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="border-t border-mist pt-4 dark:border-white/10">
          <p className="font-semibold text-forest dark:text-cream">Taste profile</p>
          <p className="mt-1 text-sm text-ink-muted">
            Food Tinder likes reshape soft ranking only — never allergy safety.
          </p>
          <button
            type="button"
            className="btn-secondary mt-3 !py-2 text-xs"
            onClick={() => resetTaste()}
          >
            Reset taste profile
          </button>
        </div>
        <div className="border-t border-mist pt-4 dark:border-white/10">
          <p className="font-semibold text-forest dark:text-cream">Privacy</p>
          <p className="mt-1 text-sm text-ink-muted">
            Clear site data in your browser to delete local prefs, saves, journal
            and votes. Account deletion arrives with authenticated profiles.
          </p>
        </div>
        <div className="border-t border-mist pt-4 dark:border-white/10">
          <p className="font-semibold text-forest dark:text-cream">Live data</p>
          <p className="mt-1 text-sm text-ink-muted">
            Set <code className="text-xs">GOOGLE_PLACES_API_KEY</code> server-side
            for real listings. Demo and live never mix.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="btn-secondary">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DemoModeBanner } from "@/components/DemoModeBanner";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-semibold text-forest dark:text-cream">
        Profile
      </h1>
      <p className="mt-2 text-ink-soft">
        Guests can discover without an account. Sign-in lands in a later slice
        for synced trips and group votes.
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
          <p className="font-semibold text-forest dark:text-cream">Guest mode</p>
          <p className="mt-1 text-sm text-ink-muted">
            Preferences and saves stay on this device (session + local storage).
          </p>
        </div>
        <div className="border-t border-mist pt-4 dark:border-white/10">
          <p className="font-semibold text-forest dark:text-cream">Data</p>
          <p className="mt-1 text-sm text-ink-muted">
            Currently running in fictional demo mode. Live Places requires an
            API key and never mixes with demo listings.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/guide" className="btn-primary">
          Open AI Guide
        </Link>
        <Link href="/discover" className="btn-secondary">
          Discovery wizard
        </Link>
      </div>
    </div>
  );
}

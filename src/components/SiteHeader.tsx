"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-mist/70 bg-cream/85 backdrop-blur-md dark:border-white/10 dark:bg-[#121614]/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-forest transition group-hover:text-forest-mid dark:text-cream">
            FoodToura
          </span>
          <span className="hidden text-xs text-ink-muted sm:inline">
            Your taste. Your journey.
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/guide"
            className="btn-primary !hidden !px-4 !py-2.5 text-xs sm:!inline-flex sm:text-sm"
          >
            AI search
          </Link>
        </div>
      </div>
    </header>
  );
}

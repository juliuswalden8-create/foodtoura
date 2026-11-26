"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const onDiscover = pathname.startsWith("/discover");

  return (
    <header className="sticky top-0 z-40 border-b border-mist/70 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-forest transition group-hover:text-forest-soft">
            FoodToura
          </span>
          <span className="hidden text-xs text-charcoal-muted sm:inline">
            Your taste. Your journey.
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {!onDiscover && (
            <Link href="/discover" className="btn-primary !px-4 !py-2.5 text-xs sm:text-sm">
              Find my perfect restaurant
            </Link>
          )}
          {onDiscover && (
            <Link href="/" className="btn-secondary !px-4 !py-2.5 text-xs sm:text-sm">
              Home
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

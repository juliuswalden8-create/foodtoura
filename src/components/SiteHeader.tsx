"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E8DFD0]/80 bg-[#FAF7F0]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-[#344E41] transition group-hover:text-[#879B7C]">
            FoodToura
          </span>
          <span className="hidden text-xs text-[#62675E] sm:inline">
            Your taste. Your journey.
          </span>
        </Link>
        <Link
          href="/guide"
          className="btn-primary !px-4 !py-2.5 text-xs sm:text-sm"
        >
          Find dinner
        </Link>
      </div>
    </header>
  );
}

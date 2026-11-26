"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/BrandMark";
import { loadDestination } from "@/lib/discovery-store";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/guide", label: "Your local guide" },
  { href: "/group", label: "Group dining" },
  { href: "/saved", label: "Saved places" },
  { href: "/discover", label: "Perfect Match" },
  { href: "/profile", label: "Profile" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dest, setDest] = useState<string | null>(null);

  useEffect(() => {
    const d = loadDestination();
    setDest(d?.city || null);
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8DFD0]/90 bg-[#FAF7F0]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <BrandWordmark />

        <nav
          aria-label="Desktop"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[#344E41] text-white"
                    : "text-[#303A32] hover:bg-[#F1ECE3] hover:text-[#344E41]"
                }`}
              >
                {item.label}
                {item.href === "/discover" && dest ? (
                  <span className="ml-1 text-[11px] opacity-80">· {dest}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/guide"
            className="btn-primary !hidden !px-4 !py-2.5 text-xs sm:!inline-flex sm:text-sm"
          >
            Find my table
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E8DFD0] bg-[#FFFDF9] text-[#344E41] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              {open ? (
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-[#E8DFD0] bg-[#FFFDF9] lg:hidden"
        >
          <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[#344E41] hover:bg-[#F1ECE3]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/guide" className="btn-primary mt-2 w-full">
                  Find my table
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

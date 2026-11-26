import Link from "next/link";
import { BrandWordmark } from "@/components/BrandMark";

const COLS = [
  {
    title: "Discover",
    links: [
      { href: "/explore", label: "Explore" },
      { href: "/guide", label: "Your local guide" },
      { href: "/discover", label: "Perfect Match" },
      { href: "/group", label: "Group dining" },
    ],
  },
  {
    title: "Travel tools",
    links: [
      { href: "/passport", label: "Allergy Passport" },
      { href: "/scanner", label: "Menu Scanner" },
      { href: "/saved", label: "Saved places" },
      { href: "/waiter", label: "Table phrases" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[#E8DFD0] bg-[#F1ECE3]/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <BrandWordmark tagline />
            <p className="mt-4 text-sm leading-relaxed text-[#62675E]">
              FoodToura helps travelers find restaurants that fit their taste,
              people and place — without inventing details we cannot verify.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            {COLS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7A7F76]">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm font-medium text-[#303A32] hover:text-[#344E41]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-[#E8DFD0] pt-6 text-xs text-[#7A7F76] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FoodToura. All rights reserved.</p>
          <p>
            Restaurant listings may include Google Places data when configured.
            Always verify allergies with the venue.
          </p>
        </div>
      </div>
    </footer>
  );
}

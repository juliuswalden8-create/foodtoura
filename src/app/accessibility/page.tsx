import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessibility",
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium text-[#C9856B]">Accessibility</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-[#344E41]">
        Designed to be usable
      </h1>
      <div className="mt-6 space-y-4 text-[#303A32] leading-relaxed">
        <p>
          FoodToura aims for readable contrast on a light cream theme, keyboard
          focus styles, skip-to-content, and reduced-motion respect.
        </p>
        <p>
          Venue accessibility (for example wheelchair access) is only shown when
          provider data supports it — we do not invent access claims.
        </p>
        <p>
          If you encounter a barrier, please{" "}
          <Link href="/contact" className="font-semibold text-[#344E41] underline">
            contact us
          </Link>{" "}
          with the page and device details.
        </p>
      </div>
    </div>
  );
}

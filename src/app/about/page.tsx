import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium text-[#C9856B]">About FoodToura</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-[#344E41]">
        Good food makes anywhere feel like home.
      </h1>
      <div className="mt-6 space-y-4 text-[#303A32] leading-relaxed">
        <p>
          FoodToura helps travelers discover restaurants that fit their taste,
          budget, group, dietary needs and mood — especially when they are far
          from familiar streets.
        </p>
        <p>
          We design for warmth and trust: honest about what we know, clear when
          information is missing, and careful never to invent allergy safety,
          table availability or booking confirmations.
        </p>
        <p>
          Restaurant inventory uses Google Places when the client configures a
          billed API key. Without it, FoodToura runs a clearly labeled preview
          mode so demos stay truthful.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/guide" className="btn-primary">
          Meet the local guide
        </Link>
        <Link href="/contact" className="btn-secondary">
          Contact
        </Link>
      </div>
    </div>
  );
}

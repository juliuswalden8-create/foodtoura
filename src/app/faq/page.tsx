import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
};

const FAQS = [
  {
    q: "Does FoodToura book tables for me?",
    a: "Not yet as a native booking partner. We surface verified website and phone contacts when available. We never invent confirmations.",
  },
  {
    q: "Can you guarantee a restaurant is safe for my allergy?",
    a: "No. We surface known information and unknown gaps. Always confirm ingredients and cross-contamination with the restaurant.",
  },
  {
    q: "Why do I see “preview” restaurants?",
    a: "When Google Places is not configured, FoodToura uses a clearly labeled fictional inventory so demos stay honest.",
  },
  {
    q: "Do I need an account?",
    a: "Guest shortlists and preferences work on your device. Account sync is not required for core discovery.",
  },
  {
    q: "Is Group Match multi-device today?",
    a: "Preference merge and voting work on one device. Shared multi-browser sessions need a connected database — flagged honestly in the product.",
  },
] as const;

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium text-[#C9856B]">FAQ</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-[#344E41]">
        Common questions
      </h1>
      <ul className="mt-8 space-y-4">
        {FAQS.map((f) => (
          <li
            key={f.q}
            className="rounded-[1.25rem] border border-[#E8DFD0] bg-[#FFFDF9] p-5"
          >
            <h2 className="font-display text-lg font-semibold text-[#344E41]">
              {f.q}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#62675E]">{f.a}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-[#62675E]">
        Still stuck?{" "}
        <Link href="/contact" className="font-semibold text-[#344E41] underline">
          Contact
        </Link>
      </p>
    </div>
  );
}
